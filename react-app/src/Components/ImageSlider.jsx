import { useState, useEffect } from 'react';

export default function ImageSlider({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || !Array.isArray(images) || images.length === 0) {
    return (
      <div style={{
        width: '100%', height: '100%', minHeight: '220px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(26,74,107,0.08)',
        borderRadius: '12px',
        color: 'rgba(26,74,107,0.4)',
        fontSize: '14px',
        fontFamily: "'Lato', sans-serif",
      }}>
        📷 Nincs kép
      </div>
    );
  }

  useEffect(() => {
    const timer = setInterval(() => setCurrentIndex(i => (i + 1) % images.length), 4000);
    return () => clearInterval(timer);
  }, [currentIndex, images.length]);

  const goTo = (dir) => setCurrentIndex(i => (i + dir + images.length) % images.length);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: '220px',
      borderRadius: '12px',
      overflow: 'hidden',
      background: 'rgba(26,74,107,0.10)',
    }}>
      <img
        src={images[currentIndex]}
        alt={`Apartman kép ${currentIndex + 1}`}
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          transition: 'opacity 0.5s ease',
          display: 'block',
        }}
      />

      {/* Gradient overlay bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '60px',
        background: 'linear-gradient(transparent, rgba(13,45,74,0.5))',
        pointerEvents: 'none',
      }} />

      {/* Arrows */}
      {[[-1, '❮', 'left'], [1, '❯', 'right']].map(([dir, symbol, side]) => (
        <button
          key={side}
          onClick={() => goTo(dir)}
          style={{
            position: 'absolute', top: '50%', [side]: '12px',
            transform: 'translateY(-50%)',
            background: 'rgba(13,45,74,0.55)',
            backdropFilter: 'blur(4px)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.20)',
            width: '36px', height: '36px',
            borderRadius: '50%',
            fontSize: '14px',
            cursor: 'pointer',
            zIndex: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,143,160,0.70)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(13,45,74,0.55)'}
        >
          {symbol}
        </button>
      ))}

      {/* Dots */}
      <div style={{
        position: 'absolute', bottom: '12px', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', gap: '6px', zIndex: 2,
      }}>
        {images.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrentIndex(i)}
            style={{
              width: i === currentIndex ? '20px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i === currentIndex ? '#22b5cc' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}