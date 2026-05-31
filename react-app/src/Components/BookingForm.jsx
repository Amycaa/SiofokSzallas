import { useState, useEffect, useRef } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { hu, enUS, de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import { getTheme, FONTS, COLORS } from './theme';

// ── Kliens oldali rate limiter ────────────────────────────────────────────────
// Több kulcsot használ – ha egyet töröl a user, a többi megmarad
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_MS  = 10 * 60 * 1000;
const RATE_KEYS = ['booking_attempts', '_bk_ts', '__persist_bk'];

function isRateLimited() {
  try {
    const now = Date.now();
    const allAttempts = RATE_KEYS.flatMap(key => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
      } catch { return []; }
    });
    const recent = allAttempts.filter(ts => now - ts < RATE_LIMIT_MS);
    return recent.length >= RATE_LIMIT_MAX;
  } catch { return false; }
}

function recordAttempt() {
  try {
    const now = Date.now();
    RATE_KEYS.forEach(key => {
      try {
        const raw = localStorage.getItem(key);
        const attempts = raw ? JSON.parse(raw) : [];
        attempts.push(now);
        localStorage.setItem(key, JSON.stringify(attempts.slice(-10)));
      } catch {}
    });
    try {
      const raw = sessionStorage.getItem('_bk_session');
      const attempts = raw ? JSON.parse(raw) : [];
      attempts.push(now);
      sessionStorage.setItem('_bk_session', JSON.stringify(attempts));
    } catch {}
  } catch {}
}

// ── Input sanitizer ───────────────────────────────────────────────────────────
function sanitize(str, maxLen = 200) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').replace(/[<>"'\`]/g, '').trim().slice(0, maxLen);
}

export default function BookingForm({ apartmentName, pricePerNight, maxGuest, minGuest }) {
  // Honeypot: bot-ok kitöltik, emberek nem látják
  const honeypotRef = useRef(null);
  const formLoadTime = useRef(Date.now());
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [disabledDates, setDisabledDates] = useState([]);
  const [formData, setFormData] = useState({ guestName: '', email: '', phone: '', totalGuests: minGuest || 1, guestsUnder18: 0, hasPet: false, notes: '' });
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [calculation, setCalculation] = useState({ nights: 0, basePrice: 0, ifaPrice: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(false);
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [gdprTouched, setGdprTouched] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setIsDarkMode(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (minGuest) {
      setFormData(prev => ({
        ...prev,
        totalGuests: Math.max(minGuest, prev.totalGuests)
      }));
    }
  }, [minGuest]);

  const theme = getTheme(isDarkMode);
  const IFA_RATE = 750;

  const getLocale = () => {
    if (i18n.language.startsWith('en')) return enUS;
    if (i18n.language.startsWith('de')) return de;
    return hu;
  };

  useEffect(() => {
    if (!apartmentName) return;
    const fetchDisabledDates = async () => {
      try {
        const q = query(collection(db, 'bookings'), where('apartmentName', '==', apartmentName));
        const snap = await getDocs(q);
        const allDates = [];
        snap.docs.forEach(doc => {
          const data = doc.data();
          if (data.checkIn && data.checkOut && data.status !== 'cancelled') {
            const [startYear, startMonth, startDay] = data.checkIn.split('-').map(Number);
            const [endYear, endMonth, endDay] = data.checkOut.split('-').map(Number);
            let current = new Date(startYear, startMonth - 1, startDay);
            const stop = new Date(endYear, endMonth - 1, endDay);
            while (current < stop) {
              allDates.push(new Date(current));
              current.setDate(current.getDate() + 1);
            }
          }
        });
        setDisabledDates(allDates);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDisabledDates();
  }, [apartmentName]);

  useEffect(() => {
    if (checkIn && checkOut) {
      const nights = Math.ceil((checkOut - checkIn) / 86400000);
      if (nights > 0) {
        const base = nights * formData.totalGuests * pricePerNight;
        const ifa = nights * Math.max(0, formData.totalGuests - formData.guestsUnder18) * IFA_RATE;
        setCalculation({ nights, basePrice: base, ifaPrice: ifa, totalPrice: base + ifa });
      } else { setCalculation({ nights: 0, basePrice: 0, ifaPrice: 0, totalPrice: 0 }); }
    } else { setCalculation({ nights: 0, basePrice: 0, ifaPrice: 0, totalPrice: 0 }); }
  }, [checkIn, checkOut, formData.totalGuests, formData.guestsUnder18, pricePerNight]);

  const isValidHungarianPhone = (phone) => {
    if (!phone) return false;
    const cleaned = phone.replace(/[\s\-().]/g, '');
    return /^(\+36|0036|06)\d{9}$/.test(cleaned) || /^[37]\d{8}$/.test(cleaned);
  };

  const handlePhoneChange = (val) => {
    const filtered = val.replace(/[^\d+\-()]/g, '');
    setFormData(f => ({ ...f, phone: filtered }));
  };

  const handlePhoneKeyDown = (e) => {
    if (e.key === ' ') e.preventDefault();
  };

  const getCheckoutMaxDate = () => {
    if (!checkIn || disabledDates.length === 0) return null;
    const checkInMidnight = new Date(checkIn);
    checkInMidnight.setHours(0, 0, 0, 0);
    const nextDisabled = disabledDates
      .map(d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; })
      .filter(d => d.getTime() > checkInMidnight.getTime())
      .sort((a, b) => a - b)[0];
    if (!nextDisabled) return null;
    return nextDisabled;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut || calculation.nights <= 0) return;

    // ── Bot / spam védelem ────────────────────────────────────────────────────
    // 1. Honeypot: ha ki van töltve, bot töltötte ki
    if (honeypotRef.current && honeypotRef.current.value) return;

    // 2. Minimum kitöltési idő: botoknál szempillantás alatt van kész
    if (Date.now() - formLoadTime.current < 800) return;

    // 3. Kliens oldali rate limit
    if (isRateLimited()) {
      setModal({
        isOpen: true, type: 'error',
        title: t('rate_limit_title', 'Túl sok kísérlet'),
        message: t('rate_limit_msg', 'Rövid időn belül túl sok foglalási kísérletet észleltünk. Kérjük próbálja újra 10 perc múlva.'),
        onConfirm: () => setModal(m => ({ ...m, isOpen: false })),
      });
      return;
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Telefonszám validáció
    if (!isValidHungarianPhone(formData.phone)) {
      setModal({ isOpen: true, type: 'error', title: t('phone_error_title'), message: t('phone_error_msg'), onConfirm: () => setModal(m => ({ ...m, isOpen: false })) });
      return;
    }

    // GDPR validáció
    if (!gdprAccepted) {
      setGdprTouched(true);
      return;
    }

    setModal({
      isOpen: true, type: 'confirm', title: t('confirm_booking_title'),
      message: t('confirm_booking_msg', { nights: calculation.nights, total: calculation.totalPrice.toLocaleString() }),
      onCancel: () => setModal(m => ({ ...m, isOpen: false })),
      onConfirm: async () => {
        setModal(m => ({ ...m, isOpen: false }));
        setLoading(true);
        try {
          const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          // Sanitize minden szöveges mezőt mentés előtt
          const sanitizedData = {
            guestName:      sanitize(formData.guestName, 100),
            email:          sanitize(formData.email, 100).toLowerCase(),
            phone:          sanitize(formData.phone, 20),
            notes:          sanitize(formData.notes, 500),
            totalGuests:    Math.max(minGuest || 1, Math.min(maxGuest || 20, Number(formData.totalGuests) || 1)),
            guestsUnder18:  Math.max(0, Math.min(Number(formData.totalGuests), Number(formData.guestsUnder18) || 0)),
            hasPet:         Boolean(formData.hasPet),
          };
          recordAttempt();
          await addDoc(collection(db, 'bookings'), {
            minGuest,
            maxGuest,
            apartmentName, pricePerNight,
            checkIn: fmt(checkIn), checkOut: fmt(checkOut),
            nights: calculation.nights, ...sanitizedData,
            totalAmount: calculation.totalPrice, status: 'confirmed',
            gdprConsent: true,
            gdprConsentAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          });
          setModal({
            isOpen: true, type: 'success', title: t('success', 'Siker'),
            message: t('booking_success_msg', { email: formData.email }),
            onConfirm: () => { setModal(m => ({ ...m, isOpen: false })); navigate('/foglalasaim'); }
          });
        } catch (err) {
          setModal({
            isOpen: true, type: 'error', title: t('error', 'Hiba'),
            message: t('booking_error_msg'), onConfirm: () => setModal(m => ({ ...m, isOpen: false }))
          });
        } finally { setLoading(false); }
      }
    });
  };

  const inputStyle = {
    padding: '12px 14px', borderRadius: '10px', border: `1px solid ${theme.borderInput}`,
    fontSize: '15px', fontFamily: FONTS.body, outline: 'none', width: '100%', boxSizing: 'border-box',
    background: theme.inputBg, color: theme.textPrimary, transition: 'all 0.2s ease',
  };

  const labelStyle = {
    fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase',
    color: theme.textSecondary, marginBottom: '6px', display: 'block',
  };

  // GDPR checkbox szöveg nyelvek szerint
  const lang = i18n.language.split('-')[0];
  const gdprLabel = {
    hu: { pre: 'Elolvastam és elfogadom az ', link: 'Adatkezelési Tájékoztatót', post: ', és hozzájárulok nevem és e-mail-címem foglalási célú kezeléséhez.' },
    en: { pre: 'I have read and accept the ', link: 'Privacy Policy', post: ', and I consent to the processing of my name and email address for booking purposes.' },
    de: { pre: 'Ich habe die ', link: 'Datenschutzerklärung', post: ' gelesen und akzeptiert und stimme der Verarbeitung meines Namens und meiner E-Mail-Adresse zu Buchungszwecken zu.' },
  }[lang] || { pre: 'Elolvastam és elfogadom az ', link: 'Adatkezelési Tájékoztatót', post: '.' };

  const gdprError = {
    hu: 'A foglalás leadásához el kell fogadnod az Adatkezelési Tájékoztatót.',
    en: 'You must accept the Privacy Policy to complete your booking.',
    de: 'Sie müssen die Datenschutzerklärung akzeptieren, um die Buchung abzuschließen.',
  }[lang] || 'El kell fogadnod az Adatkezelési Tájékoztatót.';

  return (
    <div style={{
      background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '20px',
      padding: '32px', boxShadow: '0 10px 30px rgba(13,45,74,0.05)', color: theme.textPrimary,
      fontFamily: FONTS.body, maxWidth: '600px', margin: '0 auto'
    }}>
      <ConfirmModal
        isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message}
        onConfirm={modal.onConfirm} onCancel={modal.onCancel}
        confirmText={modal.type === 'confirm' ? t('yes_confirm') : 'OK'} cancelText={t('cancel')}
        isDarkMode={isDarkMode}
      />

      <PrivacyPolicyModal
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        isDarkMode={isDarkMode}
      />

      <h3 style={{ fontFamily: FONTS.display, fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0' }}>
        {t('booking_title')}
      </h3>
      <p style={{ fontSize: '14px', color: COLORS.coral, fontWeight: '600', margin: '0 0 24px 0' }}>
        {t('booking_limit', { min: minGuest, max: maxGuest })}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={labelStyle}>{t('name')}</label>
          <input type="text" required style={inputStyle} value={formData.guestName} onChange={e => setFormData({ ...formData, guestName: e.target.value })} />
        </div>

        <div>
          <label style={labelStyle}>{t('email')}</label>
          <input type="email" required style={inputStyle} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
        </div>

        <div>
          <label style={labelStyle}>{t('phone', 'Telefonszám')}</label>
          <input
            type="tel"
            required
            style={inputStyle}
            placeholder="+36301234567"
            value={formData.phone}
            onChange={e => handlePhoneChange(e.target.value)}
            onKeyDown={handlePhoneKeyDown}
            maxLength={15}
          />
          <div style={{ fontSize: '11px', color: theme.textSecondary, marginTop: '4px', opacity: 0.65 }}>
            {t('phone_hint')}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div>
            <label style={labelStyle}>{t('arrival')}</label>
            <DatePicker
              selected={checkIn}
              onChange={date => { setCheckIn(date); if (checkOut && date >= checkOut) setCheckOut(null); }}
              minDate={new Date()} locale={getLocale()} dateFormat="yyyy-MM-dd"
              excludeDates={disabledDates}
              customInput={<input style={inputStyle} />}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('departure')}</label>
            <DatePicker
              selected={checkOut}
              onChange={date => setCheckOut(date)}
              minDate={checkIn ? new Date(checkIn.getTime() + 86400000) : new Date()}
              maxDate={getCheckoutMaxDate()}
              excludeDates={disabledDates}
              locale={getLocale()}
              dateFormat="yyyy-MM-dd"
              customInput={<input style={inputStyle} />}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div>
            <label style={labelStyle}>{t('total_guests')}</label>
            <input type="number" min={minGuest || 1} max={maxGuest || 10} style={inputStyle} value={formData.totalGuests}
              onChange={e => {
                const v = Math.max(minGuest || 1, Math.min(maxGuest || 10, parseInt(e.target.value) || 1));
                setFormData({ ...formData, totalGuests: v, guestsUnder18: Math.min(formData.guestsUnder18, v) });
              }}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('under_18')}</label>
            <input type="number" min="0" max={formData.totalGuests} style={inputStyle} value={formData.guestsUnder18}
              onChange={e => setFormData({ ...formData, guestsUnder18: Math.min(formData.totalGuests, parseInt(e.target.value) || 0) })}
            />
          </div>
        </div>

        {calculation.nights > 0 && (
          <div style={{ padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: theme.summaryBg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: `1px solid ${theme.hr}` }}>
              <span style={{ fontSize: '14px', color: theme.textSecondary }}>{t('summary_rent', { nights: calculation.nights, guests: formData.totalGuests, price: pricePerNight.toLocaleString() })}</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{calculation.basePrice.toLocaleString()} {t('currency')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${theme.hr}` }}>
              <span style={{ fontSize: '14px', color: theme.textSecondary }}>{t('summary_ifa')}</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{calculation.ifaPrice.toLocaleString()} {t('currency')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px' }}>
              <span style={{ fontFamily: FONTS.display, fontSize: '16px', fontWeight: '700' }}>{t('summary_total')}</span>
              <span style={{ fontFamily: FONTS.display, fontSize: '20px', fontWeight: '700', color: COLORS.coral }}>{calculation.totalPrice.toLocaleString()} {t('currency')}</span>
            </div>
          </div>
        )}

        {/* ── KISÁLLAT CHECKBOX ── */}
        <div style={{
          padding: '14px 16px',
          borderRadius: '12px',
          border: `1px solid ${formData.hasPet ? COLORS.amber : theme.border}`,
          background: formData.hasPet
            ? (isDarkMode ? 'rgba(232,160,32,0.08)' : 'rgba(232,160,32,0.05)')
            : theme.summaryBg,
          transition: 'all 0.2s ease',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <div
              onClick={() => setFormData(f => ({ ...f, hasPet: !f.hasPet }))}
              style={{
                width: '20px', height: '20px',
                borderRadius: '5px',
                border: `2px solid ${formData.hasPet ? COLORS.amber : theme.borderInput}`,
                background: formData.hasPet ? COLORS.amber : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.18s ease',
                cursor: 'pointer',
              }}
            >
              {formData.hasPet && (
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                  <path d="M1 4L4 7.5L10 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span style={{ textAlign: 'left', fontSize: '13px', lineHeight: '1.6', color: theme.textSecondary, userSelect: 'none' }}>
              🐾 {t('pet_label', 'Kisállatot hozok magammal')}
              {formData.hasPet && (
                <span style={{ display: 'block', fontSize: '12px', color: COLORS.amber, marginTop: '2px', fontWeight: '600' }}>
                  {t('pet_note', 'Kisállat hozataláról kérjük előzetesen egyeztessen velünk!')}
                </span>
              )}
            </span>
          </label>
        </div>

        {/* ── MEGJEGYZÉS ── */}
        <div>
          <label style={labelStyle}>{t('notes_label', 'Megjegyzés')} <span style={{ fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>({t('optional', 'opcionális')})</span></label>
          <textarea
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: '90px',
              lineHeight: '1.6',
              paddingTop: '12px',
            }}
            placeholder={t('notes_placeholder', 'Pl. késői érkezés, különleges kérés, allergia...')}
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            maxLength={500}
          />
          <div style={{ fontSize: '11px', color: theme.textSecondary, textAlign: 'right', marginTop: '4px', opacity: 0.6 }}>
            {formData.notes.length} / 500
          </div>
        </div>

        {/* ── GDPR CHECKBOX ── */}
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          border: `1px solid ${gdprTouched && !gdprAccepted ? COLORS.coral : theme.border}`,
          background: gdprTouched && !gdprAccepted
            ? (isDarkMode ? 'rgba(224,92,75,0.08)' : 'rgba(224,92,75,0.04)')
            : theme.summaryBg,
          transition: 'all 0.2s ease',
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            cursor: 'pointer',
          }}>
            {/* Custom checkbox */}
            <div
              onClick={() => { setGdprAccepted(v => !v); setGdprTouched(true); }}
              style={{
                width: '20px', height: '20px',
                borderRadius: '5px',
                border: `2px solid ${gdprAccepted ? COLORS.emerald : (gdprTouched && !gdprAccepted ? COLORS.coral : theme.borderInput)}`,
                background: gdprAccepted ? COLORS.emerald : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px',
                transition: 'all 0.18s ease',
                cursor: 'pointer',
              }}
            >
              {gdprAccepted && (
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                  <path d="M1 4L4 7.5L10 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span style={{
              fontSize: '13px',
              lineHeight: '1.6',
              color: theme.textSecondary,
              userSelect: 'none',
            }}>
              {gdprLabel.pre}
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setPrivacyOpen(true); }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: COLORS.lagoon,
                  fontFamily: FONTS.body,
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                }}
              >
                {gdprLabel.link}
              </button>
              {gdprLabel.post}
            </span>
          </label>

          {/* Hibaüzenet ha nem fogadta el és megpróbálta beküldeni */}
          {gdprTouched && !gdprAccepted && (
            <p style={{
              margin: '10px 0 0 32px',
              fontSize: '12px',
              color: COLORS.coral,
              fontWeight: '600',
            }}>
              ⚠️ {gdprError}
            </p>
          )}
        </div>

        {/* Honeypot mező – botoknál automatikusan kitöltődik, embereknek láthatatlan */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, pointerEvents: 'none' }}>
          <input
            ref={honeypotRef}
            type="text"
            name="website"
            autoComplete="off"
            tabIndex={-1}
          />
        </div>

        <button
          type="submit" disabled={loading}
          style={{
            padding: '15px', borderRadius: '10px', border: 'none',
            background: loading ? theme.btnOutlineBg : `linear-gradient(135deg, ${COLORS.emerald}, ${COLORS.lagoon})`,
            color: loading ? theme.textSecondary : '#fff', fontFamily: FONTS.body, fontSize: '15px', fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 18px rgba(39,174,122,0.35)',
            transition: 'all 0.2s ease', marginTop: '4px',
          }}
        >
          {loading ? t('booking_btn') + '...' : t('booking_btn')}
        </button>
      </form>
    </div>
  );
}