import { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export default function BookingForm({ apartmentName, pricePerNight, maxGuest, minGuest }) {
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    checkIn: '',
    checkOut: '',
    totalGuests: minGuest || 1, // Vendégek száma
    guestsUnder18: 0,           // 18 év alattiak
  });
  const [totalAmount, setTotalAmount] = useState(0);

  // Ár és éjszakák számolása
  useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      const start = new Date(formData.checkIn);
      const end = new Date(formData.checkOut);
      const diffTime = Math.abs(end - start);
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (nights > 0) {
        setTotalAmount(nights * pricePerNight);
      }
    }
  }, [formData.checkIn, formData.checkOut, pricePerNight]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "bookings"), {
        ...formData,
        apartmentName,
        totalAmount,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      });
      alert('Sikeres foglalás!');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <input type="text" placeholder="Név" required onChange={(e) => setFormData({...formData, guestName: e.target.value})} />
      <input type="email" placeholder="Email" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
      <input type="date" required onChange={(e) => setFormData({...formData, checkIn: e.target.value})} />
      <input type="date" required onChange={(e) => setFormData({...formData, checkOut: e.target.value})} />
      
      {/* VENDÉGSZÁM MÓDOSÍTÁSA */}
      <label>Összes vendég (max {maxGuest}):</label>
      <input type="number" min={minGuest} max={maxGuest} value={formData.totalGuests} 
             onChange={(e) => setFormData({...formData, totalGuests: parseInt(e.target.value)})} />
      
      <label>Ebből 18 év alatti:</label>
      <input type="number" min="0" value={formData.guestsUnder18} 
             onChange={(e) => setFormData({...formData, guestsUnder18: parseInt(e.target.value)})} />

      <h3>Végösszeg: {totalAmount} Ft</h3>
      <button type="submit">Foglalás véglegesítése</button>
    </form>
  );
}