import { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { hu, enUS, de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import { getTheme, FONTS, COLORS } from './theme';

export default function BookingForm({ apartmentName, pricePerNight, maxGuest, minGuest }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [disabledIntervals, setDisabledIntervals] = useState([]);
  const [formData, setFormData] = useState({ guestName: '', email: '', totalGuests: minGuest || 1, guestsUnder18: 0 });
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [calculation, setCalculation] = useState({ nights: 0, basePrice: 0, ifaPrice: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(false);
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
    if (minGuest) setFormData(prev => ({ ...prev, totalGuests: minGuest }));
  }, [minGuest]);

  const theme = getTheme(isDarkMode);

  const getLocale = () => {
    if (i18n.language.startsWith('en')) return enUS;
    if (i18n.language.startsWith('de')) return de;
    return hu;
  };

  useEffect(() => {
    if (!apartmentName) return;
    const fetch = async () => {
      const q = query(collection(db, 'bookings'), where('apartmentName', '==', apartmentName), where('status', '==', 'confirmed'));
      try {
        const snap = await getDocs(q);
        setDisabledIntervals(snap.docs.map(d => ({ start: new Date(d.data().checkIn), end: new Date(d.data().checkOut) })));
      } catch (e) { console.error(e); }
    };
    fetch();
  }, [apartmentName]);

  useEffect(() => {
    if (checkIn && checkOut) {
      const nights = Math.ceil((checkOut - checkIn) / 86400000);
      if (nights > 0) {
        const adults = Math.max(0, formData.totalGuests - formData.guestsUnder18);
        const basePrice = nights * formData.totalGuests * (pricePerNight || 0);
        const ifaPrice = nights * adults * 750;
        setCalculation({ nights, basePrice, ifaPrice, totalPrice: basePrice + ifaPrice });
      } else setCalculation({ nights: 0, basePrice: 0, ifaPrice: 0, totalPrice: 0 });
    } else setCalculation({ nights: 0, basePrice: 0, ifaPrice: 0, totalPrice: 0 });
  }, [checkIn, checkOut, formData.totalGuests, formData.guestsUnder18, pricePerNight]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (calculation.nights <= 0) return;
    setModal({
      isOpen: true, type: 'confirm',
      title: t('confirm_booking_title', 'Megerősítés'),
      message: t('confirm_booking_msg', { defaultValue: `Biztosan foglalsz ${calculation.nights} éjszakát? Összeg: ${calculation.totalPrice.toLocaleString()} Ft`, nights: calculation.nights, total: calculation.totalPrice.toLocaleString() }),
      onConfirm: () => submitBooking(),
      onCancel: () => setModal(m => ({ ...m, isOpen: false })),
    });
  };

  const submitBooking = async () => {
    setModal(m => ({ ...m, isOpen: false }));
    setLoading(true);
    try {
      const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      await addDoc(collection(db, 'bookings'), {
        ...formData,
        email: formData.email.trim().toLowerCase(),
        apartmentName, pricePerNight, minGuest, maxGuest,
        checkIn: fmt(checkIn), checkOut: fmt(checkOut),
        nights: calculation.nights, totalAmount: calculation.totalPrice,
        createdAt: new Date(), status: 'confirmed',
      });
      // ✅ sessionStorage törlése NEM kell – a Home.jsx-ből eltávolítottuk a redirect logikát
      setModal({
        isOpen: true, type: 'success',
        title: t('booking_success_title', 'Sikeres foglalás!'),
        message: t('booking_success_msg', { defaultValue: `A foglalásod rögzítve! Visszajelzést küldünk a(z) ${formData.email} e-mail-re.`, email: formData.email }),
        onConfirm: () => { setModal(m => ({ ...m, isOpen: false })); navigate('/'); },
        onCancel: null,
      });
      setCheckIn(null); setCheckOut(null);
    } catch (err) {
      console.error(err);
      setModal({
        isOpen: true, type: 'error',
        title: t('booking_error_title', 'Hiba történt'),
        message: t('booking_error_msg', 'A foglalás rögzítése nem sikerült. Kérjük, próbáld újra!'),
        onConfirm: () => setModal(m => ({ ...m, isOpen: false })),
        onCancel: null,
      });
    } finally { setLoading(false); }
  };

  const inputStyle = {
    padding: '11px 14px',
    borderRadius: '9px',
    border: `1px solid ${theme.borderInput}`,
    fontSize: '15px',
    fontFamily: FONTS.body,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    background: theme.inputBg,
    color: theme.textPrimary,
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
    color: theme.textSecondary,
    marginBottom: '5px',
    display: 'block',
  };

  const rowStyle = {
    display: 'grid',
    // Mobilon 1 oszlop, tableten/desktopon 2 oszlop
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
    gap: '14px',
  };

  return (
    <div style={{ color: theme.textPrimary, fontFamily: FONTS.body, padding: '8px 0' }}>
      <ConfirmModal
        isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message}
        onConfirm={modal.onConfirm} onCancel={modal.onCancel}
        confirmText={modal.type === 'confirm' ? t('yes_confirm', 'Igen, foglalom!') : 'OK'}
        cancelText={t('cancel', 'Mégse')}
        isDarkMode={isDarkMode}
      />

      <h2 style={{ fontFamily: FONTS.display, fontSize: '26px', fontWeight: '700', color: theme.textPrimary, margin: '0 0 6px 0' }}>
        {t('booking_title')}
      </h2>
      <p style={{ fontSize: '13px', color: COLORS.amber, fontWeight: '700', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
        ℹ️ {t('booking_limit', { min: minGuest || 1, max: maxGuest || 4 })}
      </p>

      {/* ✅ Egyetlen nagy kártya – minden mező egyben, nincs tagolás */}
      <div style={{
        padding: '24px',
        borderRadius: '16px',
        border: `1px solid ${theme.border}`,
        background: theme.cardBg,
        backdropFilter: 'blur(4px)',
        marginBottom: '16px',
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Név + Email */}
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>{t('name')}</label>
              <input type="text" style={inputStyle}
                onChange={e => setFormData({...formData, guestName: e.target.value})}
                onFocus={e => e.target.style.borderColor = COLORS.lagoon}
                onBlur={e => e.target.style.borderColor = theme.borderInput}
                required />
            </div>
            <div>
              <label style={labelStyle}>{t('email')}</label>
              <input type="email" style={inputStyle}
                onChange={e => setFormData({...formData, email: e.target.value})}
                onFocus={e => e.target.style.borderColor = COLORS.lagoon}
                onBlur={e => e.target.style.borderColor = theme.borderInput}
                required />
            </div>
          </div>

          {/* Elválasztó */}
          <hr style={{ border: 'none', borderTop: `1px solid ${theme.hr}`, margin: '0' }} />

          {/* Dátumok */}
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>{t('arrival')}</label>
              <DatePicker
                selected={checkIn}
                onChange={date => { setCheckIn(date); if (checkOut && date >= checkOut) setCheckOut(null); }}
                selectsStart startDate={checkIn} endDate={checkOut}
                minDate={new Date()} excludeDateIntervals={disabledIntervals}
                locale={getLocale()} dateFormat="yyyy-MM-dd"
                placeholderText={t('date_placeholder')}
                customInput={<input style={inputStyle} />}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>{t('departure')}</label>
              <DatePicker
                selected={checkOut} onChange={date => setCheckOut(date)}
                selectsEnd startDate={checkIn} endDate={checkOut}
                minDate={checkIn || new Date()} excludeDateIntervals={disabledIntervals}
                locale={getLocale()} dateFormat="yyyy-MM-dd"
                placeholderText={t('date_placeholder')}
                customInput={<input style={inputStyle} />}
                required
              />
            </div>
          </div>

          {/* Elválasztó */}
          <hr style={{ border: 'none', borderTop: `1px solid ${theme.hr}`, margin: '0' }} />

          {/* Vendégszám */}
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>{t('total_guests')}</label>
              <input
                type="number" min={minGuest || 1} max={maxGuest || 10}
                style={inputStyle} value={formData.totalGuests}
                onChange={e => {
                  const v = parseInt(e.target.value) || 1;
                  const safe = Math.min(Math.max(v, minGuest || 1), maxGuest || 10);
                  setFormData({ ...formData, totalGuests: safe, guestsUnder18: formData.guestsUnder18 > safe ? safe : formData.guestsUnder18 });
                }}
                onFocus={e => e.target.style.borderColor = COLORS.lagoon}
                onBlur={e => e.target.style.borderColor = theme.borderInput}
              />
            </div>
            <div>
              <label style={labelStyle}>{t('under_18')}</label>
              <input
                type="number" min="0" max={formData.totalGuests}
                style={inputStyle} value={formData.guestsUnder18}
                onChange={e => setFormData({...formData, guestsUnder18: Math.min(parseInt(e.target.value) || 0, formData.totalGuests)})}
                onFocus={e => e.target.style.borderColor = COLORS.lagoon}
                onBlur={e => e.target.style.borderColor = theme.borderInput}
              />
            </div>
          </div>

          {/* Összesítő – csak ha ki vannak töltve a dátumok */}
          {calculation.nights > 0 && (
            <>
              <hr style={{ border: 'none', borderTop: `1px solid ${theme.hr}`, margin: '0' }} />
              <div style={{
                padding: '16px',
                borderRadius: '10px',
                background: theme.summaryBg,
                border: `1px solid ${theme.border}`,
              }}>
                <div style={{ fontFamily: FONTS.display, fontSize: '14px', fontWeight: '700', color: theme.textPrimary, marginBottom: '10px' }}>
                  📋 {t('summary_total') ? 'Összesítő' : 'Summary'}
                </div>
                {[
                  {
                    label: t('summary_rent', { nights: calculation.nights, guests: formData.totalGuests, price: (pricePerNight || 0).toLocaleString() }),
                    value: `${calculation.basePrice.toLocaleString()} ${t('currency')}`,
                  },
                  {
                    label: t('summary_ifa'),
                    value: `${calculation.ifaPrice.toLocaleString()} ${t('currency')}`,
                  },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${theme.hr}` }}>
                    <span style={{ fontSize: '13px', color: theme.textSecondary }}>{row.label}</span>
                    <span style={{ fontSize: '13px', color: theme.textPrimary, fontWeight: '600' }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
                  <span style={{ fontFamily: FONTS.display, fontSize: '15px', fontWeight: '700', color: theme.textPrimary }}>
                    {t('summary_total')}
                  </span>
                  <span style={{ fontFamily: FONTS.display, fontSize: '20px', fontWeight: '700', color: COLORS.coral }}>
                    {calculation.totalPrice.toLocaleString()} {t('currency')}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Submit gomb */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '15px',
              borderRadius: '10px',
              border: 'none',
              background: loading
                ? theme.btnOutlineBg
                : `linear-gradient(135deg, ${COLORS.emerald}, ${COLORS.lagoon})`,
              color: loading ? theme.textSecondary : '#fff',
              fontFamily: FONTS.body,
              fontSize: '15px',
              fontWeight: '700',
              letterSpacing: '0.3px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 18px rgba(39,174,122,0.35)',
              transition: 'all 0.2s ease',
              marginTop: '4px',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.filter = 'brightness(1.08)'; }}
            onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
          >
            {loading ? t('processing') : `🗓 ${t('submit_booking')}`}
          </button>

        </form>
      </div>
    </div>
  );
}