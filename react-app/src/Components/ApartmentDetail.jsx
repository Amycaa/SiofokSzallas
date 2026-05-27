import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import BookingForm from './BookingForm'; 
import ImageSlider from './ImageSlider'; // <-- BEHELYETTESÍTVE: Slider importálása

export default function ApartmentDetail() {
  const { id } = useParams();
  const [apartment, setApartment] = useState(null);
  const [loadingError, setLoadingError] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const getApartment = async () => {
      if (!id) return; // Ha valamiért mégis hiányozna, megállunk

      try {
        const docRef = doc(db, "apartments", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setApartment(docSnap.data());
          setLoadingError(false);
        } else {
          console.log("Nincs ilyen apartman!");
          setLoadingError(true);
        }
      } catch (error) {
        console.error("Hiba az apartman betöltésekor:", error);
        setLoadingError(true);
      }
    };

    getApartment();
  }, [id]);

  if (loadingError) return <p style={{ textAlign: 'center', padding: '20px', color: '#e74c3c' }}>A kiválasztott apartman nem található.</p>;
  if (!apartment) return <p style={{ textAlign: 'center', padding: '20px' }}>Betöltés...</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      {/* ⬅ Vissza gomb, hogy ne ragadjon be a vendég */}
      <button onClick={() => navigate('/')} style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer' }}>⬅ Vissza az apartmanokhoz</button>

      {/* 🔥 BEHELYETTESÍTVE: A régi <img> helyett az automatikus kép-slider fut */}
      <ImageSlider images={apartment.image} />
      
      <h2>{apartment.name}</h2>
      <p style={{ fontSize: '18px', color: '#555', lineHeight: '1.6' }}>
        {apartment.description}
      </p>

      {/* ÁR ÉS APRÓBETŰS RÉSZ SZEKCIÓ */}
      <div style={{ margin: '20px 0', padding: '10px 0' }}>
        <h3 style={{ color: '#e74c3c', margin: '0 0 5px 0' }}>
          Ár: {apartment.price?.toLocaleString()} Ft / éjszaka
        </h3>

        {/* Ha van kitöltve priceDesc a Firebase-ben, csak akkor jelenik meg */}
        {apartment.priceDesc && (
          <p style={{ fontSize: '13px', color: '#7f8c8d', fontStyle: 'italic', margin: '0' }}>
            * {apartment.priceDesc}
          </p>
        )}
      </div>
      
      <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #ccc' }} />
      
      <BookingForm 
        apartmentName={apartment.name} 
        pricePerNight={apartment.price} 
        maxGuest={apartment.maxGuest} 
        minGuest={apartment.minGuest}
      />
    </div>
  );
}