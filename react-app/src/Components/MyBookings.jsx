import { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { hu, enUS, de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { getTheme, FONTS, COLORS } from './theme';
import ConfirmModal from './ConfirmModal';
import Footer from './Footer';

export default function MyBookings() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editingMinGuest, setEditingMinGuest] = useState(1);
  const [editingMaxGuest, setEditingMaxGuest] = useState(10);
  const [editCheckIn, setEditCheckIn] = useState(null);
  const [editCheckOut, setEditCheckOut] = useState(null);
  const [editTotalGuests, setEditTotalGuests] = useState(1);
  const [editGuestsUnder18, setEditGuestsUnder18] = useState(0);
  const [liveNights, setLiveNights] = useState(0);
  const [liveAmount, setLiveAmount] = useState(0);
  const [liveIFA, setLiveIFA] = useState(0);
  const [liveBasePrice, setLiveBasePrice] = useState(0);
  const [pricePerPersonPerNight, setPricePerPersonPerNight] = useState(0);
  const IFA_RATE = 750;

  // ✅ Tömb a konkrét letiltott napoknak
  const [disabledDates, setDisabledDates] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

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
  const getLocale = () => {
    if (i18n.language.startsWith('en')) return enUS;
    if (i18n.language.startsWith('de')) return de;
    return hu;
  };

  const closeModal = () => setModal(m => ({ ...m, isOpen: false }));

  useEffect(() => {
    if (editCheckIn && editCheckOut && pricePerPersonPerNight) {
      const nights = Math.ceil((editCheckOut - editCheckIn) / 86400000);
      if (nights > 0) {
        setLiveNights(nights);
        const base = nights * editTotalGuests * pricePerPersonPerNight;
        setLiveBasePrice(base);
        const ifa = nights * Math.max(0, editTotalGuests - editGuestsUnder18) * IFA_RATE;
        setLiveIFA(ifa);
        setLiveAmount(base + ifa);
      } else { setLiveNights(0); setLiveBasePrice(0); setLiveIFA(0); setLiveAmount(0); }
    } else { setLiveNights(0); setLiveBasePrice(0); setLiveIFA(0); setLiveAmount(0); }
  }, [editCheckIn, editCheckOut, editTotalGuests, editGuestsUnder18, pricePerPersonPerNight]);

  const handleFetch = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'bookings'),
        where('email', '==', email.trim().toLowerCase())
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setBookings(list);
      if (!list.length) {
        setModal({ isOpen: true, type: 'error', title: t('not_found', 'Nincs találat'), message: t('no_bookings_found'), onConfirm: closeModal });
      }
    } catch (e) { 
      // ✅ JAVÍTVA: Általános hiba fordítás
      setModal({ isOpen: true, type: 'error', title: t('error', 'Hiba történt'), message: t('search_error'), onConfirm: closeModal });
    }
    finally { setLoading(false); }
  };

  const handleCancel = (id) => {
    setModal({
      isOpen: true, 
      type: 'confirm',
      title: t('cancel_booking_btn', 'Foglalás lemondása'),
      message: t('cancel_confirm'),
      onCancel: closeModal,
      onConfirm: async () => {
        closeModal();
        try {
          await deleteDoc(doc(db, 'bookings', id));
          setBookings(prev => prev.filter(b => b.id !== id));
          setTimeout(() => {
            // ✅ JAVÍTVA: Általános siker fordítás lemondáskor
            setModal({ isOpen: true, type: 'success', title: t('success', 'Siker'), message: t('cancel_success'), onConfirm: closeModal });
          }, 300);
        } catch (e) { 
          setTimeout(() => {
            // ✅ JAVÍTVA: Általános hiba fordítás lemondási hibánál
            setModal({ isOpen: true, type: 'error', title: t('error', 'Hiba'), message: t('cancel_error'), onConfirm: closeModal });
          }, 300);
        }
      }
    });
  };

  const startEdit = async (b) => {
    setEditingBookingId(b.id);
    
    const [sY, sM, sD] = b.checkIn.split('-').map(Number);
    const [eY, eM, eD] = b.checkOut.split('-').map(Number);
    setEditCheckIn(new Date(sY, sM - 1, sD));
    setEditCheckOut(new Date(eY, eM - 1, eD));
    
    setEditTotalGuests(b.totalGuests || 1);
    setEditGuestsUnder18(b.guestsUnder18 || 0);
    setEditingMinGuest(b.minGuest || 1);
    setEditingMaxGuest(b.maxGuest || 10);
    
    if (b.pricePerNight) {
      setPricePerPersonPerNight(b.pricePerNight);
    } else {
      const nights = b.nights || 1;
      const pure = (b.totalAmount || 0) - (nights * Math.max(0, (b.totalGuests || 1) - (b.guestsUnder18 || 0)) * IFA_RATE);
      setPricePerPersonPerNight(pure / (nights * (b.totalGuests || 1)) || 0);
    }

  // A kód többi része változatlan marad...
    try {
      const q = query(collection(db, 'bookings'), where('apartmentName', '==', b.apartmentName));
      const snap = await getDocs(q);
      const allDates = [];
      
      snap.docs
        .filter(doc => doc.id !== b.id)
        .forEach(doc => {
          const data = doc.data();
          if (data.checkIn && data.checkOut) {
            const [startYear, startMonth, startDay] = data.checkIn.split('-').map(Number);
            const [endYear, endMonth, endDay] = data.checkOut.split('-').map(Number);
            
            let current = new Date(startYear, startMonth - 1, startDay);
            const stop = new Date(endYear, endMonth - 1, endDay);
            
            while (current <= stop) {
              allDates.push(new Date(current));
              current.setDate(current.getDate() + 1);
            }
          }
        });
      setDisabledDates(allDates);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async (b) => {
    if (!editCheckIn || !editCheckOut || liveNights <= 0) { 
      // ✅ JAVÍTVA: Általános hiba fordítás dátumhibánál
      setModal({ isOpen: true, type: 'error', title: t('error', 'Hiba'), message: t('date_error'), onConfirm: closeModal });
      return; 
    }
    try {
      const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      await updateDoc(doc(db, 'bookings', b.id), {
        checkIn: fmt(editCheckIn), checkOut: fmt(editCheckOut),
        nights: liveNights, totalGuests: parseInt(editTotalGuests),
        guestsUnder18: parseInt(editGuestsUnder18), totalAmount: liveAmount,
      });
      setEditingBookingId(null);
      handleFetch();
      // ✅ JAVÍTVA: Általános siker fordítás sikeres módosításkor
      setModal({ isOpen: true, type: 'success', title: t('success', 'Siker'), message: t('update_success'), onConfirm: closeModal });
    } catch (e) { 
      // ✅ JAVÍTVA: Általános hiba fordítás mentési hibánál
      setModal({ isOpen: true, type: 'error', title: t('error', 'Hiba'), message: t('update_error'), onConfirm: closeModal });
    }
  };

  const getNextDisabledDate = (startDate) => {
    if (!startDate || !disabledDates || disabledDates.length === 0) return null;
    
    const startRef = new Date(startDate);
    startRef.setHours(0, 0, 0, 0);

    const futureDisabledTimestamps = disabledDates
      .map(d => new Date(d))
      .filter(d => {
        d.setHours(0, 0, 0, 0);
        return d.getTime() > startRef.getTime();
      })
      .map(d => d.getTime());

    if (futureDisabledTimestamps.length === 0) return null;

    const nextDisabledLong = Math.min(...futureDisabledTimestamps);
    const nextDisabledDate = new Date(nextDisabledLong);
    
    const maxCheckOut = new Date(nextDisabledDate);
    maxCheckOut.setDate(maxCheckOut.getDate() - 1);
    return maxCheckOut;
  };

  const inputStyle = {
    padding: '11px 14px', borderRadius: '9px', border: `1px solid ${theme.borderInput}`,
    fontSize: '15px', fontFamily: FONTS.body, outline: 'none', width: '100%', boxSizing: 'border-box',
    background: theme.inputBg, color: theme.textPrimary, transition: 'border-color 0.2s',
  };

  const labelStyle = {
    fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase',
    color: theme.textSecondary, marginBottom: '5px', display: 'block',
  };

  return (
    <div style={{ fontFamily: FONTS.body, color: theme.textPrimary, padding: '8px 0' }}>
      
      <ConfirmModal
        isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message}
        onConfirm={modal.onConfirm} onCancel={modal.onCancel}
        // ✅ JAVÍTVA: t('yes_confirm') helyett az általános t('yes') kulcs, így nem "Ja, buchen!" lesz lemondáskor
        confirmText={modal.type === 'confirm' ? t('yes', 'Igen') : 'OK'}
        cancelText={t('cancel', 'Mégse')} isDarkMode={isDarkMode}
      />

      <h2 style={{ fontFamily: FONTS.display, fontSize: '28px', fontWeight: '700', margin: '0 0 6px 0' }}>
        {t('manage_title')}
      </h2>
      <p style={{ fontSize: '15px', color: theme.textSecondary, margin: '0 0 28px 0' }}>
        {t('manage_subtitle')}
      </p>

      <form onSubmit={handleFetch} style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <input
          type="email" placeholder={t('email_placeholder')} value={email}
          onChange={e => setEmail(e.target.value)} style={{ ...inputStyle, flex: '1 1 260px' }}
          onFocus={e => e.target.style.borderColor = COLORS.lagoon}
          onBlur={e => e.target.style.borderColor = theme.borderInput} required
        />
        <button
          type="submit" disabled={loading}
          style={{
            padding: '11px 24px', borderRadius: '9px', border: 'none',
            background: `linear-gradient(135deg, ${COLORS.oceanMid}, ${COLORS.lagoon})`,
            color: '#fff', fontFamily: FONTS.body, fontSize: '15px', fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(26,74,107,0.30)', opacity: loading ? 0.7 : 1, transition: 'all 0.2s ease',
          }}
        >
          {loading ? t('searching') : t('get_bookings_btn')}
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {bookings.map(booking => {
          const lang = i18n.language.split('-')[0];
          const aptName = booking[`apartmentName_${lang}`] || booking.apartmentName;
          const isEditing = editingBookingId === booking.id;

          return (
            <div key={booking.id} style={{
              borderRadius: '16px', border: `1px solid ${theme.border}`, background: theme.cardBg,
              overflow: 'hidden', boxShadow: '0 4px 20px rgba(13,45,74,0.07)',
            }}>
              <div style={{
                padding: '18px 24px', background: isDarkMode ? 'rgba(26,74,107,0.25)' : 'rgba(26,74,107,0.06)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px',
                borderBottom: `1px solid ${theme.border}`,
              }}>
                <h4 style={{ margin: 0, fontFamily: FONTS.display, fontSize: '18px', color: theme.textPrimary }}>
                  🏖 {aptName}
                </h4>
                <span style={{
                  background: COLORS.emerald, color: '#fff', padding: '4px 12px', borderRadius: '999px',
                  fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase',
                }}>
                  {t('confirmed')}
                </span>
              </div>

              <div style={{ padding: '20px 24px' }}>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                      <div>
                        <label style={labelStyle}>{t('new_arrival')}</label>
                        <DatePicker
                          selected={editCheckIn}
                          onChange={date => { 
                            setEditCheckIn(date); 
                            const nextMax = getNextDisabledDate(date);
                            if (editCheckOut && (date >= editCheckOut || (nextMax && editCheckOut > nextMax))) {
                              setEditCheckOut(null);
                            } 
                          }}
                          minDate={new Date()} locale={getLocale()} dateFormat="yyyy-MM-dd"
                          customInput={<input style={inputStyle} />}
                          excludeDates={disabledDates}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>{t('new_departure')}</label>
                        <DatePicker
                          selected={editCheckOut} 
                          onChange={date => setEditCheckOut(date)}
                          minDate={editCheckIn || new Date()} 
                          maxDate={getNextDisabledDate(editCheckIn)}
                          locale={getLocale()} 
                          dateFormat="yyyy-MM-dd"
                          customInput={<input style={inputStyle} />}
                          excludeDates={disabledDates}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                      <div>
                        <label style={labelStyle}>{t('guests_limit_label', { min: editingMinGuest, max: editingMaxGuest })}</label>
                        <input
                          type="number" min={editingMinGuest} max={editingMaxGuest} value={editTotalGuests}
                          onChange={e => {
                            const v = Math.max(editingMinGuest, Math.min(editingMaxGuest, parseInt(e.target.value) || editingMinGuest));
                            setEditTotalGuests(v);
                            if (editGuestsUnder18 > v) setEditGuestsUnder18(v);
                          }}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>{t('under_18')}</label>
                        <input
                          type="number" min="0" max={editTotalGuests} value={editGuestsUnder18}
                          onChange={e => setEditGuestsUnder18(Math.min(editTotalGuests, parseInt(e.target.value) || 0))}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    {liveNights > 0 && (
                      <div style={{ padding: '18px 20px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: theme.summaryBg }}>
                        {[
                          { label: t('summary_rent', { nights: liveNights, guests: editTotalGuests, price: pricePerPersonPerNight.toLocaleString() }), value: `${liveBasePrice.toLocaleString()} ${t('currency')}` },
                          { label: t('summary_ifa'), value: `${liveIFA.toLocaleString()} ${t('currency')}` },
                        ].map((row, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${theme.hr}` }}>
                            <span style={{ fontSize: '13px', color: theme.textSecondary }}>{row.label}</span>
                            <span style={{ fontSize: '13px', color: theme.textPrimary, fontWeight: '600' }}>{row.value}</span>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px' }}>
                          <span style={{ fontFamily: FONTS.display, fontSize: '16px', fontWeight: '700', color: theme.textPrimary }}>{t('summary_total')}</span>
                          <span style={{ fontFamily: FONTS.display, fontSize: '18px', fontWeight: '700', color: COLORS.coral }}>{liveAmount.toLocaleString()} {t('currency')}</span>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleUpdate(booking)}
                        style={{
                          flex: 1, minWidth: '120px', padding: '13px 16px', borderRadius: '10px', border: 'none',
                          background: `linear-gradient(135deg, ${COLORS.emerald}, ${COLORS.lagoon})`,
                          color: '#fff', fontFamily: FONTS.body, fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(39,174,122,0.30)',
                        }}
                      >
                        ✓ {t('save_btn')}
                      </button>
                      <button
                        onClick={() => setEditingBookingId(null)}
                        style={{
                          flex: 1, minWidth: '120px', padding: '13px 16px', borderRadius: '10px',
                          border: `1px solid ${theme.border}`, background: theme.btnOutlineBg, color: theme.btnOutlineText,
                          fontFamily: FONTS.body, fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                        }}
                      >
                        {t('cancel_btn')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px 12px', marginBottom: '24px' }}>
                      {[
                        { icon: '📅', label: t('date_label'), value: `${booking.checkIn} – ${booking.checkOut} (${t('nights_count', { count: booking.nights })})` },
                        { icon: '👥', label: t('guests_label'), value: `${t('guest_count', { count: booking.totalGuests })}${booking.guestsUnder18 > 0 ? (' · ' + t('adult_under18', { count: booking.guestsUnder18 })) : ''}` },
                        { icon: '💰', label: t('total_pay_ifa'), value: `${booking.totalAmount?.toLocaleString()} ${t('currency')}`, highlight: true },
                      ].map((row, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: '700' }}>
                            {row.icon} {row.label}
                          </span>
                          <span style={{ fontSize: '15px', color: row.highlight ? COLORS.coral : theme.textPrimary, fontWeight: row.highlight ? '700' : '500', fontFamily: row.highlight ? FONTS.display : FONTS.body }}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'nowrap', marginTop: '12px' }}>
                      <button
                        onClick={() => startEdit(booking)}
                        style={{
                          flex: 1, padding: '11px 8px', borderRadius: '9px', border: 'none',
                          background: COLORS.amber, color: '#fff', fontFamily: FONTS.body, fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                          boxShadow: '0 3px 10px rgba(232,160,32,0.30)',
                        }}
                      >
                        ✏️ {t('edit_date_btn')}
                      </button>
                      <button
                        onClick={() => handleCancel(booking.id)}
                        style={{
                          flex: 1, padding: '11px 8px', borderRadius: '9px', border: 'none',
                          background: COLORS.coral, color: '#fff', fontFamily: FONTS.body, fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                          boxShadow: '0 3px 10px rgba(224,92,75,0.30)',
                        }}
                      >
                        🗑 {t('cancel_booking_btn')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <Footer></Footer>
    </div>
  );
}