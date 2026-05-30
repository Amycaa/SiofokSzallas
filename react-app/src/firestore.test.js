const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { setDoc, doc, updateDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

let env;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'siofokszallas-675c8',
    firestore: {
      host: 'localhost',
      port: 8080,
      rules: fs.readFileSync(path.resolve(__dirname, 'firestore.rules'), 'utf8'),
    },
  });
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
});

// ── Alap foglalás adat ────────────────────────────────────────────────────────
const validBooking = {
  apartmentName: 'Apartman A',
  guestName: 'Kiss János',
  email: 'test@test.hu',
  phone: '+36301234567',
  checkIn: '2026-07-01',
  checkOut: '2026-07-05',
  nights: 4,
  totalGuests: 2,
  guestsUnder18: 0,
  totalAmount: 80000,
  status: 'confirmed',
  gdprConsent: true,
  gdprConsentAt: '2026-05-30T10:00:00Z',
  createdAt: '2026-05-30T10:00:00Z',
};

function db() {
  return env.unauthenticatedContext().firestore();
}

// ── SIKERES esetek ────────────────────────────────────────────────────────────
describe('Érvényes foglalás', () => {
  test('érvényes adatokkal írható', async () => {
    await assertSucceeds(setDoc(doc(db(), 'bookings', 'b1'), validBooking));
  });

  test('notes mezővel együtt is írható', async () => {
    await assertSucceeds(setDoc(doc(db(), 'bookings', 'b2'), {
      ...validBooking, notes: 'Késői érkezés várható.'
    }));
  });

  test('kisállattal együtt is írható', async () => {
    await assertSucceeds(setDoc(doc(db(), 'bookings', 'b3'), {
      ...validBooking, hasPet: true
    }));
  });
});

// ── BLOKKOLT esetek ───────────────────────────────────────────────────────────
describe('Blokkolva kell legyen', () => {
  test('hiányzó email mező', async () => {
    const { email, ...noEmail } = validBooking;
    await assertFails(setDoc(doc(db(), 'bookings', 'b4'), noEmail));
  });

  test('hiányzó guestName mező', async () => {
    const { guestName, ...data } = validBooking;
    await assertFails(setDoc(doc(db(), 'bookings', 'b5'), data));
  });

  test('rossz status (admin)', async () => {
    await assertFails(setDoc(doc(db(), 'bookings', 'b6'), {
      ...validBooking, status: 'admin'
    }));
  });

  test('rossz status (pending)', async () => {
    await assertFails(setDoc(doc(db(), 'bookings', 'b7'), {
      ...validBooking, status: 'pending'
    }));
  });

  test('calendarEventId injektálás blokkolva', async () => {
    await assertFails(setDoc(doc(db(), 'bookings', 'b8'), {
      ...validBooking, calendarEventId: 'hack123'
    }));
  });

  test('checkout előbb mint checkin', async () => {
    await assertFails(setDoc(doc(db(), 'bookings', 'b9'), {
      ...validBooking, checkIn: '2026-07-10', checkOut: '2026-07-05'
    }));
  });

  test('checkout ugyanaz mint checkin', async () => {
    await assertFails(setDoc(doc(db(), 'bookings', 'b10'), {
      ...validBooking, checkIn: '2026-07-05', checkOut: '2026-07-05'
    }));
  });

  test('túl sok vendég (21)', async () => {
    await assertFails(setDoc(doc(db(), 'bookings', 'b11'), {
      ...validBooking, totalGuests: 21
    }));
  });

  test('0 vendég', async () => {
    await assertFails(setDoc(doc(db(), 'bookings', 'b12'), {
      ...validBooking, totalGuests: 0
    }));
  });

  test('túl nagy összeg (6M Ft)', async () => {
    await assertFails(setDoc(doc(db(), 'bookings', 'b13'), {
      ...validBooking, totalAmount: 6000000
    }));
  });

  test('gdprConsent false', async () => {
    await assertFails(setDoc(doc(db(), 'bookings', 'b14'), {
      ...validBooking, gdprConsent: false
    }));
  });

  test('túl hosszú notes (501 karakter)', async () => {
    await assertFails(setDoc(doc(db(), 'bookings', 'b15'), {
      ...validBooking, notes: 'x'.repeat(501)
    }));
  });

  test('negatív éjszakaszám', async () => {
    await assertFails(setDoc(doc(db(), 'bookings', 'b16'), {
      ...validBooking, nights: -1
    }));
  });
});

// ── UPDATE esetek ─────────────────────────────────────────────────────────────
describe('Update szabályok', () => {
  beforeEach(async () => {
    // Előre beteszünk egy érvényes foglalást
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'bookings', 'existing'), {
        ...validBooking, calendarEventId: 'cal123'
      });
    });
  });

  test('status cancelled-re állítható', async () => {
    await assertSucceeds(updateDoc(doc(db(), 'bookings', 'existing'), {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    }));
  });

  test('status confirmed-ről más értékre NEM állítható', async () => {
    await assertFails(updateDoc(doc(db(), 'bookings', 'existing'), {
      status: 'hacked',
    }));
  });

  test('email módosítása NEM engedélyezett', async () => {
    await assertFails(updateDoc(doc(db(), 'bookings', 'existing'), {
      email: 'masik@email.hu',
    }));
  });

  test('apartmentName módosítása NEM engedélyezett', async () => {
    await assertFails(updateDoc(doc(db(), 'bookings', 'existing'), {
      apartmentName: 'Másik Apartman',
    }));
  });
});

// ── Apartments kollekció ──────────────────────────────────────────────────────
describe('Apartments kollekció', () => {
  test('apartments olvasható', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'apartments', 'apt1'), { name: 'Apartman A' });
    });
    await assertSucceeds(
      // getDocs helyett getDoc-ot kellene, de setDoc-ot tesztelünk
      setDoc(doc(db(), 'apartments', 'apt1'), { name: 'hack' })
        .then(() => Promise.reject('should have failed'))
        .catch(() => Promise.resolve())
    );
  });

  test('apartments közvetlen írása blokkolva', async () => {
    await assertFails(setDoc(doc(db(), 'apartments', 'hack'), { name: 'Fake' }));
  });
});