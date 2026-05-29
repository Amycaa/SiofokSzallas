import { useState, useEffect } from 'react';

export default function ImageSlider({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  // Auto-play – megáll ha lightbox nyitva van
  useEffect(() => {
    if (lightboxOpen) return;
    const timer = setInterval(() => setCurrentIndex(i => (i + 1) % images.length), 4000);
    return () => clearInterval(timer);
  }, [currentIndex, images.length, lightboxOpen]);

  // Lightbox billentyűzet-kezelés + scroll lock
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setLightboxIndex(i => (i + 1) % images.length);
      if (e.key === 'ArrowLeft')  setLightboxIndex(i => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, images.length]);

  const goTo = (dir) => setCurrentIndex(i => (i + dir + images.length) % images.length);

  const openLightbox = (e) => {
    e.stopPropagation();
    setLightboxIndex(currentIndex);
    setLightboxOpen(true);
  };

  const lbGo = (dir, e) => {
    e.stopPropagation();
    setLightboxIndex(i => (i + dir + images.length) % images.length);
  };

  return (
    <>
      <style>{`
        @keyframes lbFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes lbImgIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        .img-slider-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(13,45,74,0.55);
          backdrop-filter: blur(4px);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.20);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          font-size: 14px;
          cursor: pointer;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .img-slider-arrow:hover { background: rgba(26,143,160,0.70) !important; }
        @media (max-width: 380px) {
          .img-slider-arrow {
            width: 28px !important;
            height: 28px !important;
            font-size: 11px !important;
          }
          .img-slider-arrow.left { left: 6px !important; }
          .img-slider-arrow.right { right: 6px !important; }
          .img-slider-zoom-hint { display: none !important; }
        }
        .lb-arrow {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.22);
          color: #fff;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          font-size: 18px;
          cursor: pointer;
          z-index: 10001;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .lb-arrow:hover { background: rgba(26,143,160,0.55) !important; }
        @media (max-width: 480px) {
          .lb-arrow {
            width: 36px !important;
            height: 36px !important;
            font-size: 14px !important;
          }
          .lb-arrow.left  { left: 6px !important; }
          .lb-arrow.right { right: 6px !important; }
        }
        @media (max-width: 320px) {
          .lb-arrow { display: none !important; }
        }
      `}</style>

      {/* ── SLIDER ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '220px',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#0d1e2e',
        cursor: 'zoom-in',
      }}>
        <img
          src={images[currentIndex]}
          alt={`Apartman kép ${currentIndex + 1}`}
          onClick={openLightbox}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',         /* kitölti a slidert, nincs kék sáv */
            objectPosition: 'center center',
            transition: 'opacity 0.5s ease',
            display: 'block',
          }}
        />

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '60px',
          background: 'linear-gradient(transparent, rgba(13,45,74,0.5))',
          pointerEvents: 'none',
        }} />

        {/* Zoom hint */}
        <div className="img-slider-zoom-hint" style={{
          position: 'absolute', top: '10px', right: '10px',
          background: 'rgba(13,45,74,0.55)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.20)',
          borderRadius: '6px',
          padding: '4px 7px',
          fontSize: '13px',
          color: '#fff',
          pointerEvents: 'none',
          opacity: 0.8,
        }}>🔍</div>

        {/* Arrows */}
        {[[-1, '❮', 'left'], [1, '❯', 'right']].map(([dir, symbol, side]) => (
          <button
            key={side}
            className={`img-slider-arrow ${side}`}
            onClick={(e) => { e.stopPropagation(); goTo(dir); }}
            style={{ [side]: '12px' }}
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
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
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

      {/* ── LIGHTBOX ── teljes felbontás, contain, reszponzív ── */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.93)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            animation: 'lbFadeIn 0.22s ease',
            padding: '60px 70px 50px',  
            boxSizing: 'border-box',
          }}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            style={{
              position: 'fixed',
              top: '14px', right: '16px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '50%',
              width: '40px', height: '40px',
              color: '#fff', fontSize: '18px',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 10001,
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          >✕</button>

          {/* Számláló */}
          <div style={{
            position: 'fixed',
            top: '20px', left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.65)',
            fontSize: '13px',
            letterSpacing: '1px',
            fontFamily: "'Inter', sans-serif",
            zIndex: 10001,
            whiteSpace: 'nowrap',
          }}>
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Fő kép – teljes felbontás, contain */}
          <img
            key={lightboxIndex}
            src={images[lightboxIndex]}
            alt={`Kép ${lightboxIndex + 1}`}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
              animation: 'lbImgIn 0.25s ease',
              cursor: 'default',
              display: 'block',
            }}
          />

          {/* Lightbox nyilak */}
          {images.length > 1 && [[-1, '❮', 'left'], [1, '❯', 'right']].map(([dir, symbol, side]) => (
            <button
              key={side}
              className={`lb-arrow ${side}`}
              onClick={(e) => lbGo(dir, e)}
              style={{ [side]: '12px' }}
            >
              {symbol}
            </button>
          ))}

          {/* Lightbox dots */}
          {images.length > 1 && (
            <div style={{
              position: 'fixed',
              bottom: '18px', left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex', gap: '8px', zIndex: 10001,
              flexWrap: 'wrap',
              justifyContent: 'center',
              maxWidth: '90vw',
            }}>
              {images.map((_, i) => (
                <div
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  style={{
                    width: i === lightboxIndex ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: i === lightboxIndex ? '#22b5cc' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}