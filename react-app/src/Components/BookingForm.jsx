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
  
  // Tömb a konkrét letiltott napoknak
  const [disabledDates, setDisabledDates] = useState([]);
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

  // ✅ JAVÍTVA: Ha a minGuest prop később töltődik be, frissítjük a form kezdeti értékét is
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

  // ✅ JAVÍTVA: Precíz, hotel-típusú (current < stop) nap-generálás a naptárhoz új foglaláskor
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
            
            // Csak a távozás előtti napig tiltunk le, így a távozás napján már bejelentkezhet más
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

  // Éjszakák és árak kalkulációja élőben
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

  // ✅ JAVÍTVA: Dinamikus maximális távozási dátum meghatározása (hogy ne lehessen átugrani már foglalt időszakot)
  const getCheckoutMaxDate = () => {
    if (!checkIn || disabledDates.length === 0) return null;
    const nextDisabled = disabledDates
      .filter(d => d.getTime() > checkIn.getTime())
      .sort((a, b) => a - b)[0];
    return nextDisabled || null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut || calculation.nights <= 0) return;

    setModal({
      isOpen: true, type: 'confirm', title: t('confirm_booking_title'),
      message: t('confirm_booking_msg', { nights: calculation.nights, total: calculation.totalPrice.toLocaleString() }),
      onCancel: () => setModal(m => ({ ...m, isOpen: false })),
      onConfirm: async () => {
        setModal(m => ({ ...m, isOpen: false }));
        setLoading(true);
        try {
          const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          await addDoc(collection(db, 'bookings'), {
            minGuest, 
            maxGuest, 
            apartmentName, pricePerNight,
            checkIn: fmt(checkIn), checkOut: fmt(checkOut),
            nights: calculation.nights, ...formData,
            totalAmount: calculation.totalPrice, status: 'confirmed',
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