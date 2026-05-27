import { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { hu } from 'date-fns/locale';

export default function MyBookings() {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState(null);

  // Módosításhoz szükséges ideiglenes állapotok
  const [editCheckIn, setEditCheckIn] = useState(null);
  const [editCheckOut, setEditCheckOut] = useState(null);

  // Foglalások lekérése e-mail cím alapján
  const handleFetchBookings = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const q = query(
        collection(db, "bookings"),
        where("email", "==", email.trim().toLowerCase()),
        where("status", "==", "confirmed")
      );
      
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setBookings(fetched);
      if (fetched.length === 0) {
        alert("Nem találtunk aktív foglalást ezzel az e-mail címmel.");
      }
    } catch (err) {
      console.error(err);
      alert("Hiba történt a keresés során.");
    } finally {
      setLoading(false);
    }
  };

  // Foglalás Lemondása (Státusz átírása 'cancelled'-re -> a Cloud Function ebből tudja, hogy törölni kell a naptárból)
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Biztosan le szeretné mondani ezt a foglalást?")) return;

    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, {
        status: "cancelled"
      });
      alert("Foglalás sikeresen lemondva!");
      // Lista frissítése a felületen
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (err) {
      console.error(err);
      alert("Nem sikerült lemondani a foglalást.");
    }
  };

  // Módosítási mód megnyitása
  const startEdit = (booking) => {
    setEditingBookingId(booking.id);
    setEditCheckIn(new Date(booking.checkIn));
    setEditCheckOut(new Date(booking.checkOut));
  };

  // Módosítás Mentése
  const handleUpdateBooking = async (booking) => {
    if (!editCheckIn || !editCheckOut) return;

    const diffTime = editCheckOut - editCheckIn;
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      alert("A távozás napjának későbbinek kell lennie az érkezésnél!");
      return;
    }

    try {
      const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      const bookingRef = doc(db, "bookings", booking.id);

      await updateDoc(bookingRef, {
        checkIn: formatDate(editCheckIn),
        checkOut: formatDate(editCheckOut),
        nights: nights,
        // Itt frissül az adat -> a Cloud Function azonnal észleli és átírja a Google Naptáradat!
      });

      alert("Foglalás sikeresen módosítva!");
      setEditingBookingId(null);
      // Kényszerítsük a listát az újraolvasásra
      handleFetchBookings({ preventDefault: () => {} });
    } catch (err) {
      console.error(err);
      alert("Hiba történt a módosítás mentése során.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🏠 Foglalásaim Kezelése</h2>
      <p style={styles.subtitle}>Adja meg a foglaláskor használt e-mail címét a módosításhoz vagy lemondáshoz.</p>

      {/* E-MAIL KERESŐ FORMA */}
      <form onSubmit={handleFetchBookings} style={styles.searchForm}>
        <input 
          type="email" 
          placeholder="pelda@email.com" 
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Keresés...' : 'Foglalások lekérése'}
        </button>
      </form>

      {/* FOGLALÁSOK LISTÁJA */}
      <div style={styles.listContainer}>
        {bookings.map(booking => (
          <div key={booking.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <h4>{booking.apartmentName}</h4>
              <span style={styles.badge}>Megerősítve</span>
            </div>

            {editingBookingId === booking.id ? (
              /* MODOSÍTÁSI NÉZET */
              <div style={styles.editSection}>
                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Új érkezés:</label>
                    <DatePicker
                      selected={editCheckIn}
                      onChange={date => {
                        setEditCheckIn(date);
                        if (editCheckOut && date >= editCheckOut) setEditCheckOut(null);
                      }}
                      minDate={new Date()}
                      locale={hu}
                      dateFormat="yyyy-MM-dd"
                      customInput={<input style={styles.input} />}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Új távozás:</label>
                    <DatePicker
                      selected={editCheckOut}
                      onChange={date => setEditCheckOut(date)}
                      minDate={editCheckIn || new Date()}
                      locale={hu}
                      dateFormat="yyyy-MM-dd"
                      customInput={<input style={styles.input} />}
                    />
                  </div>
                </div>
                <div style={styles.actionRow}>
                  <button onClick={() => handleUpdateBooking(booking)} style={styles.saveButton}>Mentés</button>
                  <button onClick={() => setEditingBookingId(null)} style={styles.cancelButton}>Mégse</button>
                </div>
              </div>
            ) : (
              /* SIMA KIJELZÉSI NÉZET */
              <div>
                <p><strong>Időpont:</strong> {booking.checkIn} - {booking.checkOut}-ig ({booking.nights} éjszaka)</p>
                <p><strong>Vendégek:</strong> {booking.totalGuests} fő</p>
                <p><strong>Fizetendő összeg:</strong> {booking.totalAmount?.toLocaleString()} Ft</p>
                
                <div style={styles.actionRow}>
                  <button onClick={() => startEdit(booking)} style={styles.editButton}>Időpont módosítása</button>
                  <button onClick={() => handleCancelBooking(booking.id)} style={styles.deleteButton}>Foglalás lemondása</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '600px', margin: '40px auto', padding: '20px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontFamily: '"Segoe UI", sans-serif' },
  title: { color: '#2c3e50', textAlign: 'center', marginBottom: '5px' },
  subtitle: { color: '#7f8c8d', textAlign: 'center', fontSize: '14px', marginBottom: '25px' },
  searchForm: { display: 'flex', gap: '10px', marginBottom: '30px' },
  input: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', outline: 'none' },
  button: { padding: '12px 20px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
  card: { padding: '20px', borderRadius: '10px', border: '1px solid #e1e8ed', background: '#fafbfc' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' },
  badge: { background: '#2ecc71', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  row: { display: 'flex', gap: '10px', marginBottom: '15px' },
  inputGroup: { flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '12px', fontWeight: 'bold', color: '#34495e' },
  actionRow: { display: 'flex', gap: '10px', marginTop: '15px' },
  editButton: { flex: 1, padding: '10px', background: '#f39c12', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  deleteButton: { flex: 1, padding: '10px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  saveButton: { padding: '10px 20px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  cancelButton: { padding: '10px 20px', background: '#95a5a6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};