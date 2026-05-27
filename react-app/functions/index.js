const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { google } = require("googleapis");
const path = require("path");

const KEY_PATH = path.join(__dirname, "service-account.json");
const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const CALENDAR_ID = "tarjanyi.levi@gmail.com";

const auth = new google.auth.GoogleAuth({ keyFile: KEY_PATH, scopes: SCOPES });
const calendar = google.calendar({ version: "v3", auth });

const createEventResource = (booking) => ({
  summary: `🏠 FOGLALÁS: ${booking.apartmentName}`,
  location: "Siófok",
  description: `Vendég: ${booking.guestName}\nE-mail: ${booking.email}\nÖsszes vendég: ${booking.totalGuests} fő\nÉjszakák: ${booking.nights}\nVégösszeg: ${booking.totalAmount} Ft`,
  start: { date: booking.checkIn, timeZone: "Europe/Budapest" },
  end: { date: booking.checkOut, timeZone: "Europe/Budapest" },
  colorId: "2",
});

// 1. LÉTREHOZÁS
exports.syncBookingToCalendar = onDocumentCreated({
  document: "bookings/{bookingId}",
  region: "europe-west1",
}, async (event) => {
  const snapshot = event.data;
  const booking = snapshot.data();

  if (booking.status !== "confirmed") return null;

  try {
    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: createEventResource(booking),
    });

    // JAVÍTVA: snapshot.ref.update() a helyes módszer
    await snapshot.ref.update({ calendarEventId: response.data.id });
    console.log(`Esemény létrehozva: ${response.data.id}`);
  } catch (error) {
    console.error("Hiba a létrehozásnál:", error);
  }
});

// 2. MÓDOSÍTÁS VAGY LEMONDÁS
exports.updateBookingInCalendar = onDocumentUpdated({
  document: "bookings/{bookingId}",
  region: "europe-west1",
}, async (event) => {
  const afterData = event.data.after.data();
  const calendarEventId = afterData.calendarEventId;

  if (!calendarEventId) return null;

  try {
    if (afterData.status === "cancelled") {
      await calendar.events.delete({
        calendarId: CALENDAR_ID,
        eventId: calendarEventId,
      });
      console.log("Esemény törölve a naptárból.");
    } else {
      await calendar.events.update({
        calendarId: CALENDAR_ID,
        eventId: calendarEventId,
        resource: createEventResource(afterData),
      });
      console.log(`Esemény frissítve: ${calendarEventId}`);
    }
  } catch (error) {
    console.error("Hiba a naptár műveletnél:", error);
  }
});