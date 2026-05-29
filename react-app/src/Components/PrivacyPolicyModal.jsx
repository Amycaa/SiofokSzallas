import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FONTS, COLORS, getTheme } from './theme';

export default function PrivacyPolicyModal({ isOpen, onClose, isDarkMode }) {
  const { i18n } = useTranslation();
  const lang = i18n.language.split('-')[0];
  const theme = getTheme(isDarkMode);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = {
    hu: {
      title: '🔒 Adatkezelési Tájékoztató',
      updated: 'Utolsó frissítés: 2026. május',
      sections: [
        {
          heading: '1. Adatkezelő',
          text: 'Az adatkezelő: SiófokSzállás (a továbbiakban: „mi" vagy „Szolgáltató"). Elérhetőség: info@apartmanom.hu'
        },
        {
          heading: '2. Kezelt személyes adatok',
          text: 'Foglaláskor az alábbi személyes adatokat kezeljük:\n• Teljes név\n• E-mail cím\n• Érkezés és távozás dátuma\n• Vendégek száma (köztük a 18 év alattiak száma)\n\nEzeket az adatokat kizárólag a szálláshelyi foglalás teljesítéséhez és visszaigazolásához, valamint a törvény által előírt nyilvántartáshoz (IFA-kötelezettség) használjuk fel.'
        },
        {
          heading: '3. Az adatkezelés jogalapja',
          text: 'Az adatkezelés jogalapja az Európai Parlament és a Tanács (EU) 2016/679 rendeletének (GDPR) 6. cikk (1) bekezdés b) pontja: az adatkezelés szerződés teljesítéséhez szükséges, amelynek az érintett az egyik fele.\n\nA számlázáshoz és IFA-bevalláshoz kapcsolódó adatkezelés jogalapja a GDPR 6. cikk (1) bekezdés c) pontja (jogi kötelezettség teljesítése).'
        },
        {
          heading: '4. Adattárolás és biztonság',
          text: 'Adatait a Google Firebase Firestore (Google LLC, USA) felhőszolgáltatásban tároljuk, amely megfelel az EU–US Data Privacy Framework előírásainak. Az adatok EU-s szervereken (europe-west régió) kerülnek tárolásra, és az adatátvitel Standard Contractual Clauses (SCC) alapján történik.'
        },
        {
          heading: '5. Adatmegőrzési idő',
          text: 'A foglaláshoz kapcsolódó adatokat a szállást követő 5 évig őrizzük meg a számviteli és adójogi kötelezettségek teljesítése érdekében (2000. évi C. törvény a számvitelről), majd töröljük.'
        },
        {
          heading: '6. Az Ön jogai',
          text: 'A GDPR alapján Önt az alábbi jogok illetik meg:\n• Hozzáférési jog: kérheti az Önről kezelt adatok másolatát\n• Helyesbítési jog: kérheti a pontatlan adatok javítását\n• Törlési jog („elfeledtetéshez való jog"): kérheti adatai törlését, ha az adatkezelés már nem szükséges\n• Adatkezelés korlátozásának joga\n• Adathordozhatóság joga\n• Tiltakozási jog\n\nJogait az info@apartmanom.hu e-mail-címen gyakorolhatja. Kérelmére 30 napon belül válaszolunk.'
        },
        {
          heading: '7. Jogorvoslat',
          text: 'Ha úgy véli, hogy adatkezelésünk sérti a GDPR-t, panaszt tehet a Nemzeti Adatvédelmi és Információszabadság Hatóságnál (NAIH):\n\nWeboldal: naih.hu\nCím: 1055 Budapest, Falk Miksa utca 9-11.\nE-mail: ugyfelszolgalat@naih.hu'
        },
        {
          heading: '8. Adattovábbítás harmadik félnek',
          text: 'Személyes adatait harmadik félnek nem adjuk el, és nem adjuk át, kivéve ha jogszabály erre kötelez (pl. hatósági megkeresés esetén).'
        },
      ]
    },
    en: {
      title: '🔒 Privacy Policy',
      updated: 'Last updated: May 2026',
      sections: [
        {
          heading: '1. Data Controller',
          text: 'Data controller: SiófokSzállás ("we" or "Service Provider"). Contact: info@apartmanom.hu'
        },
        {
          heading: '2. Personal Data Processed',
          text: 'When making a booking, we process the following personal data:\n• Full name\n• Email address\n• Check-in and check-out dates\n• Number of guests (including guests under 18)\n\nThis data is used solely for the purpose of fulfilling and confirming your accommodation booking, and for legally required record-keeping (tourist tax / IFA obligations).'
        },
        {
          heading: '3. Legal Basis for Processing',
          text: 'The legal basis for processing is Article 6(1)(b) of the EU General Data Protection Regulation (GDPR): processing is necessary for the performance of a contract to which you are a party.\n\nFor invoicing and tourist tax reporting purposes, the legal basis is Article 6(1)(c) GDPR (compliance with a legal obligation).'
        },
        {
          heading: '4. Data Storage & Security',
          text: 'Your data is stored in Google Firebase Firestore (Google LLC, USA), which complies with the EU–US Data Privacy Framework. Data is stored on EU servers (europe-west region) and transfers are governed by Standard Contractual Clauses (SCC).'
        },
        {
          heading: '5. Retention Period',
          text: 'Booking-related personal data is retained for 5 years following your stay, in accordance with Hungarian accounting and tax law (Act C of 2000 on Accounting), after which it is deleted.'
        },
        {
          heading: '6. Your Rights',
          text: 'Under the GDPR, you have the following rights:\n• Right of access: request a copy of your personal data\n• Right to rectification: request correction of inaccurate data\n• Right to erasure ("right to be forgotten")\n• Right to restriction of processing\n• Right to data portability\n• Right to object\n\nYou may exercise your rights by contacting us at info@apartmanom.hu. We will respond within 30 days.'
        },
        {
          heading: '7. Right to Lodge a Complaint',
          text: 'If you believe our processing violates the GDPR, you may lodge a complaint with the Hungarian National Authority for Data Protection and Freedom of Information (NAIH):\n\nWebsite: naih.hu\nAddress: Falk Miksa utca 9–11, 1055 Budapest, Hungary\nEmail: ugyfelszolgalat@naih.hu'
        },
        {
          heading: '8. Third-Party Sharing',
          text: 'We do not sell or share your personal data with third parties, except where required by law (e.g. in response to a lawful authority request).'
        },
      ]
    },
    de: {
      title: '🔒 Datenschutzerklärung',
      updated: 'Zuletzt aktualisiert: Mai 2026',
      sections: [
        {
          heading: '1. Verantwortlicher',
          text: 'Verantwortlicher: SiófokSzállás („wir" oder „Anbieter"). Kontakt: info@apartmanom.hu'
        },
        {
          heading: '2. Verarbeitete personenbezogene Daten',
          text: 'Bei der Buchung verarbeiten wir folgende personenbezogene Daten:\n• Vollständiger Name\n• E-Mail-Adresse\n• An- und Abreisedatum\n• Anzahl der Gäste (einschließlich Gäste unter 18 Jahren)\n\nDiese Daten werden ausschließlich zur Durchführung und Bestätigung Ihrer Unterkunftsbuchung sowie zur gesetzlich vorgeschriebenen Aufzeichnung (Kurtaxe / IFA-Pflicht) verwendet.'
        },
        {
          heading: '3. Rechtsgrundlage der Verarbeitung',
          text: 'Die Rechtsgrundlage der Verarbeitung ist Art. 6 Abs. 1 lit. b der EU-Datenschutz-Grundverordnung (DSGVO): Die Verarbeitung ist zur Erfüllung eines Vertrags erforderlich, dessen Vertragspartei Sie sind.\n\nFür Rechnungsstellung und Kurtaxmeldung ist die Rechtsgrundlage Art. 6 Abs. 1 lit. c DSGVO (Erfüllung einer rechtlichen Verpflichtung).'
        },
        {
          heading: '4. Datenspeicherung & Sicherheit',
          text: 'Ihre Daten werden in Google Firebase Firestore (Google LLC, USA) gespeichert, das dem EU–US Data Privacy Framework entspricht. Die Daten werden auf EU-Servern (Region europe-west) gespeichert, und die Übermittlung erfolgt auf Basis von Standardvertragsklauseln (SCC).'
        },
        {
          heading: '5. Speicherdauer',
          text: 'Buchungsbezogene Daten werden 5 Jahre nach Ihrem Aufenthalt aufbewahrt (gemäß ungarischem Buchführungs- und Steuerrecht, Gesetz C von 2000) und anschließend gelöscht.'
        },
        {
          heading: '6. Ihre Rechte',
          text: 'Gemäß DSGVO haben Sie folgende Rechte:\n• Auskunftsrecht\n• Recht auf Berichtigung\n• Recht auf Löschung („Recht auf Vergessenwerden")\n• Recht auf Einschränkung der Verarbeitung\n• Recht auf Datenübertragbarkeit\n• Widerspruchsrecht\n\nSie können Ihre Rechte unter info@apartmanom.hu ausüben. Wir antworten innerhalb von 30 Tagen.'
        },
        {
          heading: '7. Beschwerderecht',
          text: 'Wenn Sie der Ansicht sind, dass unsere Verarbeitung gegen die DSGVO verstößt, können Sie eine Beschwerde bei der ungarischen Datenschutzbehörde (NAIH) einreichen:\n\nWebseite: naih.hu\nAdresse: Falk Miksa utca 9–11, 1055 Budapest, Ungarn\nE-Mail: ugyfelszolgalat@naih.hu'
        },
        {
          heading: '8. Weitergabe an Dritte',
          text: 'Wir verkaufen oder teilen Ihre personenbezogenen Daten nicht mit Dritten, außer wenn dies gesetzlich vorgeschrieben ist (z. B. auf behördliche Anfrage).'
        },
      ]
    },
  };

  const c = content[lang] || content.hu;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.70)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: 'ppFadeIn 0.2s ease',
      }}
    >
      <style>{`
        @keyframes ppFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ppSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .pp-scroll::-webkit-scrollbar { width: 6px; }
        .pp-scroll::-webkit-scrollbar-track { background: transparent; }
        .pp-scroll::-webkit-scrollbar-thumb { background: rgba(26,143,160,0.4); border-radius: 3px; }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '20px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
          animation: 'ppSlideUp 0.25s ease',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px 20px',
          borderBottom: `1px solid ${theme.hr}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontFamily: FONTS.display,
              fontSize: 'clamp(18px, 4vw, 22px)',
              fontWeight: '700',
              color: theme.textPrimary,
            }}>{c.title}</h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: theme.textSecondary }}>{c.updated}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.textSecondary,
              fontSize: '18px',
              cursor: 'pointer',
              width: '36px', height: '36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = COLORS.coral; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = COLORS.coral; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.textSecondary; e.currentTarget.style.borderColor = theme.border; }}
          >✕</button>
        </div>

        {/* Scrollable content */}
        <div
          className="pp-scroll"
          style={{
            padding: '24px 28px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {c.sections.map((s, i) => (
            <div key={i}>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: '700',
                color: COLORS.lagoon,
                letterSpacing: '0.3px',
                fontFamily: FONTS.body,
              }}>{s.heading}</h3>
              <p style={{
                margin: 0,
                fontSize: '13px',
                lineHeight: '1.75',
                color: theme.textSecondary,
                whiteSpace: 'pre-line',
                fontFamily: FONTS.body,
              }}>{s.text}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px',
          borderTop: `1px solid ${theme.hr}`,
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: `linear-gradient(135deg, ${COLORS.emerald}, ${COLORS.lagoon})`,
              color: '#fff',
              fontFamily: FONTS.body,
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(39,174,122,0.30)',
            }}
          >
            {lang === 'de' ? 'Verstanden & schließen' : lang === 'en' ? 'Understood & close' : 'Megértettem & bezárás'}
          </button>
        </div>
      </div>
    </div>
  );
}
