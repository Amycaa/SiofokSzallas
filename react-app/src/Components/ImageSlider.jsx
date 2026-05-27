import { useState, useEffect } from 'react';

export default function ImageSlider({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Biztonsági ellenőrzés: ha nincs kép vagy üres a tömb
  if (!images || !Array.isArray(images) || images.length === 0) {
    return <div style={{ ...styles.slider, background: '#eee' }}>Nincs kép megjelenítve</div>;
  }

  // 1. AUTOMATIKUS PÖRGÉS: 4 másodpercenként vált
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(timer); // Takarítás, ha elnavigál az oldalról
  }, [currentIndex, images.length]);

  // LÉPTETÉS ELŐRE
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // LÉPTETÉS HÁTRA
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div style={styles.slider}>
      {/* Balra nyíl */}
      <button onClick={prevSlide} style={{ ...styles.arrow, left: '15px' }}>❮</button>
      
      {/* Aktuális kép */}
      <img 
        src={images[currentIndex]} 
        alt={`Apartman kép ${currentIndex + 1}`} 
        style={styles.image} 
      />
      
      {/* Jobbra nyíl */}
      <button onClick={nextSlide} style={{ ...styles.arrow, right: '15px' }}>❯</button>

      {/* Kis pöttyök az alján, amik mutatják hol járunk */}
      <div style={styles.dotContainer}>
        {images.map((_, index) => (
          <div 
            key={index} 
            onClick={() => setCurrentIndex(index)}
            style={{
              ...styles.dot,
              background: currentIndex === index ? '#fff' : 'rgba(255,255,255,0.5)'
            }}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  slider: {
    position: 'relative',
    width: '100%',
    height: '400px',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
    backgroundColor: '#000'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'all 0.5s ease-in-out'
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
    border: 'none',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    fontSize: '20px',
    cursor: 'pointer',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  },
  dotContainer: {
    position: 'absolute',
    bottom: '15px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '8px',
    zIndex: 2
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'background 0.3s'
  }
};