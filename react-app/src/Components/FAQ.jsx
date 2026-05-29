import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTheme, FONTS, COLORS } from './theme';
import Footer from './Footer';

export default function FAQ() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setIsDarkMode(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const theme = getTheme(isDarkMode);
  const lang = i18n.language.split('-')[0];

  const faqs = {
    hu: [
      {
        category: '🗓 Foglalás',
        items: [
          {
            q: 'Hogyan tudok apartmant foglalni?',
            a: 'Válasszon apartmant a főoldalon, kattintson a „Részletek & Foglalás" gombra, majd az apartman oldalán a „Foglalás" gombra. Töltse ki az adatait, fogadja el az adatkezelési tájékoztatót, és véglegesítse a foglalást. E-mailben visszaigazolást küldünk.'
          },
          {
            q: 'Mennyivel előre lehet foglalni?',
            a: 'A mai naptól bármikor lehet foglalni – nincs maximális előfoglalási határ. A már lefoglalt időpontok a naptárban automatikusan letiltásra kerülnek.'
          },
          {
            q: 'Mennyi a minimum tartózkodási idő?',
            a: 'Minimum 1 éjszaka. Egyes apartmanoknál szezonban előfordulhat hosszabb minimum tartózkodás – ezt az apartman oldalán jelezzük.'
          },
          {
            q: 'Tudok módosítani a foglaláson?',
            a: 'Igen! A „Foglalásaim kezelése" menüpont alatt, a foglaláskor megadott e-mail-cím megadásával módosíthatja az érkezési és távozási dátumot.'
          },
          {
            q: 'Hogyan mondhatom le a foglalásomat?',
            a: 'A „Foglalásaim kezelése" oldalon, a foglaláshoz tartozó „Foglalás lemondása" gombra kattintva tudja lemondani. Kérjük, olvassa el a lemondási feltételeket az apartman oldalán.'
          },
        ]
      },
      {
        category: '💰 Árak & Fizetés',
        items: [
          {
            q: 'Mit tartalmaz a megjelenített ár?',
            a: 'Az ár személyenként és éjszakánként értendő. A foglalás összesítőjében látja a szállásdíjat és az IFA-t (idegenforgalmi adó) külön tételként. Az IFA 750 Ft/fő/éj, 18 év alattiak mentesek.'
          },
          {
            q: 'Mi az IFA (idegenforgalmi adó)?',
            a: 'Az IFA (idegenforgalmi adó) egy törvény által előírt helyi adó, amelyet 18 év feletti vendégek fizetnek. Mértéke 750 Ft/fő/éj. A foglaláskor automatikusan kiszámítjuk és feltüntetjük.'
          },
          {
            q: 'Milyen fizetési módokat fogadnak el?',
            a: 'A fizetés helyszínen történik, készpénzben vagy bankkártyával. Online előre fizetésre jelenleg nincs lehetőség.'
          },
          {
            q: 'Kell-e foglaló?',
            a: 'Egyes apartmanoknál kérhetünk előleget. Ennek részleteiről az apartman oldalán, vagy a visszaigazoló e-mailben tájékoztatjuk.'
          },
        ]
      },
      {
        category: '🏠 Az apartmanokról',
        items: [
          {
            q: 'Mikor lehet bejelentkezni és kijelentkezni?',
            a: 'Az érkezés (check-in) időpontja általában 14:00 óra, a távozásé (check-out) 10:00 óra. Ettől eltérő igény esetén kérjük, vegye fel velünk a kapcsolatot előre.'
          },
          {
            q: 'Lehet-e kisállatot hozni?',
            a: 'Ez apartmantól függ. Kérjük, foglalás előtt érdeklődjön e-mailben vagy telefonon.'
          },
          {
            q: 'Van parkolási lehetőség?',
            a: 'Az apartmanok többségénél ingyenes parkoló áll rendelkezésre. A pontos parkolási információt az adott apartman leírásában találja.'
          },
          {
            q: 'Hány főre alkalmasak az apartmanok?',
            a: 'Minden apartmannál fel van tüntetve a minimális és maximális vendégszám. A foglalás során a rendszer automatikusan ellenőrzi, hogy a megadott vendégszám megfelelő-e.'
          },
        ]
      },
      {
        category: '🔒 Adatvédelem',
        items: [
          {
            q: 'Milyen adatokat kezelnek rólam?',
            a: 'Kizárólag a foglaláshoz szükséges adatokat: nevet, e-mail-címet, érkezési/távozási dátumot és vendégszámot. Ezeket harmadik félnek nem adjuk át.'
          },
          {
            q: 'Hogyan törölhetem az adataimat?',
            a: 'Az info@apartmanom.hu e-mail-címre küldött kérelemmel bármikor kérheti adatai törlését. 30 napon belül válaszolunk és elvégezzük a törlést, amennyiben jogszabály nem kötelez a megőrzésre.'
          },
          {
            q: 'Hol tárolják az adataimat?',
            a: 'Adatait a Google Firebase Firestore EU-s szerverein tároljuk, az EU adatvédelmi előírásainak megfelelően (GDPR). Részleteket az Adatkezelési Tájékoztatóban talál.'
          },
        ]
      },
    ],
    en: [
      {
        category: '🗓 Booking',
        items: [
          {
            q: 'How do I book an apartment?',
            a: 'Choose an apartment on the homepage, click "Details & Booking", then click "Book Now" on the apartment page. Fill in your details, accept the privacy policy, and confirm your booking. You will receive a confirmation email.'
          },
          {
            q: 'How far in advance can I book?',
            a: 'You can book from today with no maximum advance booking limit. Already booked dates are automatically blocked in the calendar.'
          },
          {
            q: 'What is the minimum stay?',
            a: 'Minimum 1 night. Some apartments may require a longer minimum stay during peak season – this is indicated on the apartment page.'
          },
          {
            q: 'Can I modify my booking?',
            a: 'Yes! Under "Manage My Bookings", enter the email address used during booking to modify your check-in and check-out dates.'
          },
          {
            q: 'How do I cancel my booking?',
            a: 'On the "Manage My Bookings" page, click "Cancel Booking" next to the relevant booking. Please review the cancellation policy on the apartment page.'
          },
        ]
      },
      {
        category: '💰 Prices & Payment',
        items: [
          {
            q: 'What does the displayed price include?',
            a: 'The price is per person per night. The booking summary shows the accommodation fee and tourist tax (IFA) as separate items. IFA is 750 HUF/person/night; guests under 18 are exempt.'
          },
          {
            q: 'What is the tourist tax (IFA)?',
            a: 'The tourist tax (IFA) is a legally required local tax paid by guests aged 18 and over. It is 750 HUF/person/night and is automatically calculated and displayed during booking.'
          },
          {
            q: 'What payment methods are accepted?',
            a: 'Payment is made on-site in cash or by card. Online advance payment is not currently available.'
          },
          {
            q: 'Is a deposit required?',
            a: 'A deposit may be required for some apartments. Details will be provided on the apartment page or in your confirmation email.'
          },
        ]
      },
      {
        category: '🏠 About the Apartments',
        items: [
          {
            q: 'What are the check-in and check-out times?',
            a: 'Check-in is from 14:00, check-out is by 10:00. For different arrangements, please contact us in advance.'
          },
          {
            q: 'Are pets allowed?',
            a: 'This varies by apartment. Please enquire by email or phone before booking.'
          },
          {
            q: 'Is parking available?',
            a: 'Most apartments offer free parking. Parking details can be found in each apartment\'s description.'
          },
          {
            q: 'How many guests can each apartment accommodate?',
            a: 'Each apartment has a minimum and maximum guest count shown on its page. The system automatically verifies that your guest count is within the allowed range when booking.'
          },
        ]
      },
      {
        category: '🔒 Privacy',
        items: [
          {
            q: 'What personal data do you process?',
            a: 'Only data necessary for your booking: name, email address, check-in/check-out dates, and guest count. This data is never shared with third parties.'
          },
          {
            q: 'How can I request deletion of my data?',
            a: 'Send a request to info@apartmanom.hu at any time. We will respond within 30 days and delete your data, unless we are legally required to retain it.'
          },
          {
            q: 'Where is my data stored?',
            a: 'Your data is stored on Google Firebase Firestore EU servers, in compliance with GDPR. See the Privacy Policy for full details.'
          },
        ]
      },
    ],
    de: [
      {
        category: '🗓 Buchung',
        items: [
          {
            q: 'Wie kann ich ein Apartment buchen?',
            a: 'Wählen Sie auf der Startseite ein Apartment aus, klicken Sie auf „Details & Buchen" und dann auf der Apartment-Seite auf „Jetzt buchen". Füllen Sie Ihre Daten aus, akzeptieren Sie die Datenschutzerklärung und bestätigen Sie die Buchung. Sie erhalten eine Bestätigungs-E-Mail.'
          },
          {
            q: 'Wie weit im Voraus kann ich buchen?',
            a: 'Sie können ab heute buchen, ohne maximale Vorausbuchungsfrist. Bereits gebuchte Termine werden im Kalender automatisch gesperrt.'
          },
          {
            q: 'Was ist der Mindestaufenthalt?',
            a: 'Mindestens 1 Nacht. Bei einigen Apartments kann in der Hochsaison ein längerer Mindestaufenthalt erforderlich sein – dies wird auf der Apartment-Seite angezeigt.'
          },
          {
            q: 'Kann ich meine Buchung ändern?',
            a: 'Ja! Unter „Buchungen verwalten" können Sie mit Ihrer Buchungs-E-Mail-Adresse An- und Abreisedatum ändern.'
          },
          {
            q: 'Wie kann ich meine Buchung stornieren?',
            a: 'Auf der Seite „Buchungen verwalten" klicken Sie auf „Buchung stornieren". Bitte lesen Sie die Stornierungsbedingungen auf der Apartment-Seite.'
          },
        ]
      },
      {
        category: '💰 Preise & Zahlung',
        items: [
          {
            q: 'Was ist im angezeigten Preis enthalten?',
            a: 'Der Preis gilt pro Person und Nacht. Die Buchungsübersicht zeigt Unterkunftsgebühr und Kurtaxe (IFA) als separate Posten. IFA beträgt 750 HUF/Person/Nacht; Gäste unter 18 Jahren sind befreit.'
          },
          {
            q: 'Was ist die Kurtaxe (IFA)?',
            a: 'Die Kurtaxe (IFA) ist eine gesetzlich vorgeschriebene Ortssteuer für Gäste ab 18 Jahren. Sie beträgt 750 HUF/Person/Nacht und wird bei der Buchung automatisch berechnet und angezeigt.'
          },
          {
            q: 'Welche Zahlungsmethoden werden akzeptiert?',
            a: 'Die Zahlung erfolgt vor Ort in bar oder mit Karte. Eine Online-Vorauszahlung ist derzeit nicht möglich.'
          },
          {
            q: 'Ist eine Anzahlung erforderlich?',
            a: 'Bei einigen Apartments kann eine Anzahlung erforderlich sein. Details finden Sie auf der Apartment-Seite oder in der Bestätigungs-E-Mail.'
          },
        ]
      },
      {
        category: '🏠 Über die Apartments',
        items: [
          {
            q: 'Wann ist Check-in und Check-out?',
            a: 'Check-in ab 14:00 Uhr, Check-out bis 10:00 Uhr. Für abweichende Zeiten kontaktieren Sie uns bitte im Voraus.'
          },
          {
            q: 'Sind Haustiere erlaubt?',
            a: 'Dies variiert je nach Apartment. Bitte erkundigen Sie sich vor der Buchung per E-Mail oder Telefon.'
          },
          {
            q: 'Gibt es Parkmöglichkeiten?',
            a: 'Die meisten Apartments bieten kostenlose Parkplätze. Details finden Sie in der jeweiligen Apartment-Beschreibung.'
          },
          {
            q: 'Wie viele Gäste passen in die Apartments?',
            a: 'Jedes Apartment hat eine angezeigte Mindest- und Höchstgästezahl. Das System prüft bei der Buchung automatisch, ob Ihre Gästezahl im erlaubten Bereich liegt.'
          },
        ]
      },
      {
        category: '🔒 Datenschutz',
        items: [
          {
            q: 'Welche personenbezogenen Daten werden verarbeitet?',
            a: 'Nur für die Buchung notwendige Daten: Name, E-Mail-Adresse, An-/Abreisedatum und Gästezahl. Diese Daten werden nicht an Dritte weitergegeben.'
          },
          {
            q: 'Wie kann ich meine Daten löschen lassen?',
            a: 'Senden Sie eine Anfrage an info@apartmanom.hu. Wir antworten innerhalb von 30 Tagen und löschen Ihre Daten, sofern keine gesetzliche Aufbewahrungspflicht besteht.'
          },
          {
            q: 'Wo werden meine Daten gespeichert?',
            a: 'Ihre Daten werden auf EU-Servern von Google Firebase Firestore gespeichert, in Übereinstimmung mit der DSGVO. Vollständige Details finden Sie in der Datenschutzerklärung.'
          },
        ]
      },
    ],
  };

  const data = faqs[lang] || faqs.hu;

  const titles = {
    hu: { page: 'Gyakori kérdések', sub: 'Minden, amit tudni érdemes a foglalásról és tartózkodásról.' },
    en: { page: 'Frequently Asked Questions', sub: 'Everything you need to know about booking and your stay.' },
    de: { page: 'Häufig gestellte Fragen', sub: 'Alles Wissenswerte über Buchung und Aufenthalt.' },
  }[lang] || { page: 'Gyakori kérdések', sub: '' };

  return (
    <div style={{
      fontFamily: FONTS.body,
      padding: '40px 24px',
      color: theme.textPrimary,
      minHeight: '100vh',
    }}>
      {/* Back button */}
      <div style={{ maxWidth: '800px', margin: '0 auto 32px' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '9px 18px',
            cursor: 'pointer',
            background: `linear-gradient(135deg, ${COLORS.emerald}, ${COLORS.lagoon})`,
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontFamily: FONTS.body,
            fontSize: '14px',
            fontWeight: '700',
            boxShadow: '0 4px 16px rgba(39,174,122,0.35)',
            transition: 'filter 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.08)'}
          onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
        >
          {t('back_btn')}
        </button>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{
          fontFamily: FONTS.display,
          fontSize: 'clamp(26px, 5vw, 38px)',
          fontWeight: '700',
          color: theme.textPrimary,
          margin: '0 0 12px',
          letterSpacing: '-0.5px',
        }}>
          ❓ {titles.page}
        </h1>
        <p style={{ fontSize: '15px', color: theme.textSecondary, margin: 0 }}>{titles.sub}</p>
        <div style={{
          width: '60px', height: '3px',
          background: `linear-gradient(90deg, ${COLORS.lagoon}, ${COLORS.oceanLight})`,
          borderRadius: '2px',
          margin: '16px auto 0',
        }} />
      </div>

      {/* FAQ sections */}
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '36px' }}>
        {data.map((section, si) => (
          <div key={si}>
            {/* Category heading */}
            <h2 style={{
              fontFamily: FONTS.display,
              fontSize: '18px',
              fontWeight: '700',
              color: theme.textPrimary,
              margin: '0 0 14px',
              paddingBottom: '10px',
              borderBottom: `2px solid ${COLORS.lagoon}`,
              display: 'inline-block',
            }}>
              {section.category}
            </h2>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {section.items.map((item, ii) => {
                const key = `${si}-${ii}`;
                const isOpen = openIndex === key;
                return (
                  <div
                    key={ii}
                    style={{
                      border: `1px solid ${isOpen ? COLORS.lagoon : theme.border}`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'border-color 0.2s',
                      background: theme.cardBg,
                    }}
                  >
                    {/* Question row */}
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : key)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px 20px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: FONTS.body,
                        fontSize: '15px',
                        fontWeight: '600',
                        color: isOpen ? COLORS.lagoon : theme.textPrimary,
                        textAlign: 'left',
                        transition: 'color 0.2s',
                      }}
                    >
                      <span>{item.q}</span>
                      <span style={{
                        fontSize: '18px',
                        color: COLORS.lagoon,
                        flexShrink: 0,
                        transition: 'transform 0.25s ease',
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                        display: 'inline-block',
                        lineHeight: 1,
                      }}>+</span>
                    </button>

                    {/* Answer */}
                    <div style={{
                      maxHeight: isOpen ? '400px' : '0',
                      overflow: 'hidden',
                      transition: 'max-height 0.3s ease',
                    }}>
                      <p style={{
                        margin: 0,
                        padding: '0 20px 18px',
                        fontSize: '14px',
                        lineHeight: '1.75',
                        color: theme.textSecondary,
                        whiteSpace: 'pre-line',
                      }}>
                        {item.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}
