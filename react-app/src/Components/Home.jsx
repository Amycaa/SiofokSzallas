import { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "apartments"));
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setApartments(list);
      } catch (error) {
        console.error("Hiba az apartmanok lekérésekor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApartments();
  }, []);

  if (loading) return <p style={{ textAlign: 'center', padding: '50px' }}>Apartmanok betöltése...</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.mainTitle}>Válassza ki az Önnek megfelelő apartmant!</h2>
      
      <div style={styles.grid}>
        {apartments.map(apt => (
          <div key={apt.id} style={styles.card}>
            
            <img 
              src={apt.image && apt.image.length > 0 ? apt.image[0] : 'https://via.placeholder.com/1200x800?text=Nincs+kep'} 
              alt={apt.name} 
              style={styles.image} 
            />
            
            <div style={styles.cardBody}>
              <h3 style={styles.title}>{apt.name}</h3>
              <p style={styles.description}>
                {apt.description ? apt.description.substring(0, 120) + '...' : ''}
              </p>
              <div style={styles.footerRow}>
                <span style={styles.price}>{apt.price?.toLocaleString()} Ft / éjszaka</span>
                <button 
                  onClick={() => navigate(`/apartment/${apt.id}`)} 
                  style={styles.button}
                >
                  Részletek & Foglalás
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: '"Segoe UI", sans-serif', padding: '20px' },
  mainTitle: { textAlign: 'center', color: '#2c3e50', marginBottom: '40px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' },
  card: { background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' },
  image: { width: '100%', height: '200px', objectFit: 'cover' },
  cardBody: { padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 },
  title: { margin: '0 0 10px 0', color: '#2c3e50', fontSize: '20px' },
  description: { color: '#7f8c8d', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px', flex: 1 },
  footerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  price: { fontWeight: 'bold', color: '#e74c3c', fontSize: '16px' },
  button: { background: '#3498db', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }
};