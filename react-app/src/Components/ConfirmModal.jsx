import { useEffect } from 'react';


export default function ConfirmModal({
  isOpen,
  type = 'success',
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Mégse',
  isDarkMode = false,
}) {
  // ESC billentyűre zárja a modalt
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel?.() || onConfirm?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Body scroll letiltása nyitott modalnál
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const icons = {
    success: (
      <svg viewBox="0 0 52 52" style={styles.iconSvg}>
        <circle cx="26" cy="26" r="25" fill="none" stroke="#2ecc71" strokeWidth="2" style={styles.iconCircle} />
        <path fill="none" stroke="#2ecc71" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          d="M14 27 l8 8 l16 -16" style={styles.iconCheck} />
      </svg>
    ),
    error: (
      <svg viewBox="0 0 52 52" style={styles.iconSvg}>
        <circle cx="26" cy="26" r="25" fill="none" stroke="#e74c3c" strokeWidth="2" style={styles.iconCircle} />
        <line x1="16" y1="16" x2="36" y2="36" stroke="#e74c3c" strokeWidth="3" strokeLinecap="round" style={styles.iconCheck} />
        <line x1="36" y1="16" x2="16" y2="36" stroke="#e74c3c" strokeWidth="3" strokeLinecap="round" style={styles.iconCheck} />
      </svg>
    ),
    confirm: (
      <svg viewBox="0 0 52 52" style={styles.iconSvg}>
        <circle cx="26" cy="26" r="25" fill="none" stroke="#f39c12" strokeWidth="2" style={styles.iconCircle} />
        <text x="26" y="34" textAnchor="middle" fontSize="26" fontWeight="bold" fill="#f39c12">?</text>
      </svg>
    ),
  };

  const accentColor = { success: '#2ecc71', error: '#e74c3c', confirm: '#f39c12' }[type];

  const theme = {
    overlay: 'rgba(0, 0, 0, 0.6)',
    bg: isDarkMode ? '#1e1e2e' : '#ffffff',
    border: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    titleColor: isDarkMode ? '#f5f6fa' : '#1a1a2e',
    textColor: isDarkMode ? '#a4b0be' : '#636e72',
    cancelBg: isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
    cancelText: isDarkMode ? '#ccc' : '#555',
    cancelBorder: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
  };

  return (
    <div style={{ ...styles.overlay, background: theme.overlay }} onClick={(e) => {
      if (e.target === e.currentTarget) { onCancel?.() || onConfirm?.(); }
    }}>
      <div style={{
        ...styles.modal,
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        animation: 'modalPop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      }}>

        <style>{`
          @keyframes modalPop {
            from { opacity: 0; transform: scale(0.88) translateY(12px); }
            to   { opacity: 1; transform: scale(1)    translateY(0); }
          }
          @keyframes drawCircle {
            from { stroke-dashoffset: 166; }
            to   { stroke-dashoffset: 0; }
          }
          @keyframes drawCheck {
            from { stroke-dashoffset: 60; }
            to   { stroke-dashoffset: 0; }
          }
        `}</style>

        {/* Felső accent sáv */}
        <div style={{ height: '4px', background: accentColor, borderRadius: '12px 12px 0 0', margin: '-1px -1px 0 -1px' }} />

        <div style={styles.content}>
          {/* Ikon */}
          <div style={styles.iconWrapper}>
            {icons[type]}
          </div>

          {/* Szöveg */}
          <h3 style={{ ...styles.title, color: theme.titleColor }}>{title}</h3>
          {message && <p style={{ ...styles.message, color: theme.textColor }}>{message}</p>}

          {/* Gombok */}
          <div style={{ ...styles.btnRow, justifyContent: type === 'confirm' ? 'space-between' : 'center' }}>
            {type === 'confirm' && (
              <button
                onClick={onCancel}
                style={{
                  ...styles.btn,
                  background: theme.cancelBg,
                  color: theme.cancelText,
                  border: `1px solid ${theme.cancelBorder}`,
                }}
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={onConfirm}
              style={{
                ...styles.btn,
                background: accentColor,
                color: '#fff',
                border: 'none',
                boxShadow: `0 4px 15px ${accentColor}44`,
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    padding: '20px',
  },
  modal: {
    borderRadius: '16px',
    width: '100%', maxWidth: '420px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
    overflow: 'hidden',
  },
  content: {
    padding: '36px 32px 28px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
  },
  iconWrapper: {
    width: '72px', height: '72px', marginBottom: '4px',
  },
  iconSvg: {
    width: '100%', height: '100%',
  },
  iconCircle: {
    strokeDasharray: '166',
    strokeDashoffset: '166',
    animation: 'drawCircle 0.5s 0.1s ease forwards',
  },
  iconCheck: {
    strokeDasharray: '60',
    strokeDashoffset: '60',
    animation: 'drawCheck 0.4s 0.5s ease forwards',
  },
  title: {
    margin: 0, fontSize: '20px', fontWeight: '700',
    textAlign: 'center', letterSpacing: '-0.3px',
    fontFamily: '"Segoe UI", Tahoma, sans-serif',
  },
  message: {
    margin: '0 0 8px', fontSize: '15px', textAlign: 'center',
    lineHeight: '1.6', fontFamily: '"Segoe UI", Tahoma, sans-serif',
  },
  btnRow: {
    display: 'flex', gap: '12px', width: '100%', marginTop: '8px',
  },
  btn: {
    flex: 1, padding: '13px 20px', borderRadius: '10px',
    fontSize: '15px', fontWeight: '600', cursor: 'pointer',
    fontFamily: '"Segoe UI", Tahoma, sans-serif',
    transition: 'transform 0.15s, opacity 0.15s',
    letterSpacing: '0.1px',
  },
};