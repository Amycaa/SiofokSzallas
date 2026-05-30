const { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } = require("firebase-functions/v2/firestore");
const { defineString } = require("firebase-functions/params");
const { google } = require("googleapis");

// ── Környezeti változók (firebase functions:secrets vagy .env.local) ──────────
const CALENDAR_ID  = defineString("GOOGLE_CALENDAR_ID");
const CLIENT_EMAIL = defineString("GOOGLE_CLIENT_EMAIL");
const PRIVATE_KEY  = defineString("GOOGLE_PRIVATE_KEY");

/**
 * Létrehoz egy autentikált Google Calendar API klienst.
 */
function getCalendarClient() {
  const auth = new google.auth.JWT({
    email: CLIENT_EMAIL.value(),
    key:   PRIVATE_KEY.value().replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  return google.calendar({ version: "v3", auth });
}

/**
 * A checkOut dátumhoz hozzáad 1 napot.
 * A Google Calendar end.date mezője EXKLUZÍV: ha checkout "2026-06-10",
 * azt kell megadni hogy "2026-06-11", különben a naptárban csak 2026-06-09-ig látszik.
 */
function addOneDay(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + 1);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

/**
 * Összeállítja a Google Calendar esemény adatstruktúráját egy foglalás alapján.
 */
function buildEventResource(booking) {
  const adultCount = Math.max(0, (booking.totalGuests || 0) - (booking.guestsUnder18 || 0));
  const petNote    = booking.hasPet ? "\n🐾 Kisállatot hoz!" : "";
  const notes      = booking.notes ? `\nMegjegyzés: ${booking.notes}` : "";

  return {
    summary:  `🏠 FOGLALÁS: ${booking.apartmentName}`,
    location: "Siófok",
    description: [
      `👤 Vendég: ${booking.guestName}`,
      `📧 E-mail: ${booking.email}`,
      `📞 Telefon: ${booking.phone || "–"}`,
      `👥 Vendégek: ${booking.totalGuests} fő (ebből 18 év alatti: ${booking.guestsUnder18 || 0})`,
      `🌙 Éjszakák: ${booking.nights}`,
      `💰 Szállás: ${(booking.nights * booking.totalGuests * booking.pricePerNight).toLocaleString("hu-HU")} Ft`,
      `🏛️ IFA (${adultCount} fő): ${(booking.nights * adultCount * 750).toLocaleString("hu-HU")} Ft`,
      `💳 Végösszeg: ${booking.totalAmount?.toLocaleString("hu-HU")} Ft`,
      petNote,
      notes,
    ].filter(Boolean).join("\n"),
    start: { date: booking.checkIn,             timeZone: "Europe/Budapest" },
    end:   { date: addOneDay(booking.checkOut), timeZone: "Europe/Budapest" },
    colorId: "2", // zöld
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ÚJ FOGLALÁS → esemény létrehozása
// ─────────────────────────────────────────────────────────────────────────────
exports.syncBookingToCalendar = onDocumentCreated(
  { document: "bookings/{bookingId}", region: "europe-west1" },
  async (event) => {
    const snapshot = event.data;
    const booking  = snapshot.data();

    if (booking.status !== "confirmed") {
      console.log(`Foglalás ${snapshot.id} nem 'confirmed', kihagyva.`);
      return null;
    }

    try {
      const calendar = getCalendarClient();
      const response = await calendar.events.insert({
        calendarId: CALENDAR_ID.value(),
        resource:   buildEventResource(booking),
      });

      await snapshot.ref.update({ calendarEventId: response.data.id });
      console.log(`✅ Naptár esemény létrehozva: ${response.data.id} (foglalás: ${snapshot.id})`);
    } catch (error) {
      console.error("❌ Hiba a naptár esemény létrehozásakor:", error.message);
    }

    return null;
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. TÖRÖLT FOGLALÁS → esemény törlése a naptárból
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteBookingFromCalendar = onDocumentDeleted(
  { document: "bookings/{bookingId}", region: "europe-west1" },
  async (event) => {
    const booking = event.data.data();
    const calendarEventId = booking?.calendarEventId;

    if (!calendarEventId) {
      console.log(`Törölt foglaláshoz (${event.data.id}) nincs naptár esemény, kihagyva.`);
      return null;
    }

    try {
      const calendar = getCalendarClient();
      await calendar.events.delete({
        calendarId: CALENDAR_ID.value(),
        eventId:    calendarEventId,
      });
      console.log(`🗑️ Naptár esemény törölve (foglalás törölve): ${calendarEventId}`);
    } catch (error) {
      if (error.code === 410 || error.status === 410) {
        console.warn("⚠️ Esemény már nem létezett a naptárban (410), semmi teendő.");
      } else {
        console.error("❌ Hiba a naptár esemény törlésénél:", error.message);
      }
    }

    return null;
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. MÓDOSÍTOTT / LEMONDOTT FOGLALÁS → esemény frissítése vagy törlése
// ─────────────────────────────────────────────────────────────────────────────
exports.updateBookingInCalendar = onDocumentUpdated(
  { document: "bookings/{bookingId}", region: "europe-west1" },
  async (event) => {
    const before = event.data.before.data();
    const after  = event.data.after.data();

    // Ha semmi releváns nem változott – ne csináljunk semmit
    const relevantFields = ["checkIn","checkOut","guestName","email","phone","totalGuests","guestsUnder18","nights","totalAmount","hasPet","notes","status","pricePerNight","apartmentName"];
    const hasChange = relevantFields.some(f => JSON.stringify(before[f]) !== JSON.stringify(after[f]));
    if (!hasChange) return null;

    const calendarEventId = after.calendarEventId;

    // Ha még nincs naptár esemény és 'confirmed' lett → létrehozzuk utólag
    if (!calendarEventId && after.status === "confirmed") {
      try {
        const calendar = getCalendarClient();
        const response = await calendar.events.insert({
          calendarId: CALENDAR_ID.value(),
          resource:   buildEventResource(after),
        });
        await event.data.after.ref.update({ calendarEventId: response.data.id });
        console.log(`✅ Késői naptár esemény létrehozva: ${response.data.id}`);
      } catch (error) {
        console.error("❌ Hiba a késői esemény létrehozásakor:", error.message);
      }
      return null;
    }

    if (!calendarEventId) return null;

    try {
      const calendar = getCalendarClient();

      if (after.status === "cancelled") {
        await calendar.events.delete({
          calendarId: CALENDAR_ID.value(),
          eventId:    calendarEventId,
        });
        console.log(`🗑️ Naptár esemény törölve (foglalás lemondva): ${calendarEventId}`);
      } else {
        await calendar.events.update({
          calendarId: CALENDAR_ID.value(),
          eventId:    calendarEventId,
          resource:   buildEventResource(after),
        });
        console.log(`✏️ Naptár esemény frissítve: ${calendarEventId}`);
      }
    } catch (error) {
      if (error.code === 410 || error.status === 410) {
        await event.data.after.ref.update({ calendarEventId: null });
        console.warn("⚠️ Esemény nem volt a naptárban (410), referencia törölve.");
      } else {
        console.error("❌ Hiba a naptár műveletnél:", error.message);
      }
    }

    return null;
  }
);