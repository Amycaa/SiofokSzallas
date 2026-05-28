import { useEffect } from 'react';
import { getTheme, FONTS, COLORS } from './theme';

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
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && isOpen) { onCancel?.() || onConfirm?.(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const theme = getTheme(isDarkMode);

  const accentMap = {
    success: COLORS.emerald,
    error:   COLORS.coral,
    confirm: COLORS.amber,
  };
  const accent = accentMap[type] || COLORS.lagoon;

  const icons = {
    success: (
      <svg viewBox="0 0 52 52" style={{ width: '64px', height: '64px' }}>
        <circle cx="26" cy="26" r="24" fill="none" stroke={accent} strokeWidth="2"
          style={{ strokeDasharray: 150, strokeDashoffset: 150, animation: 'drawC 0.5s 0.1s ease forwards' }} />
        <path fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          d="M15 27 l8 8 l14 -16"
          style={{ strokeDasharray: 50, strokeDashoffset: 50, animation: 'drawC 0.4s 0.5s ease forwards' }} />
      </svg>
    ),
    error: (
      <svg viewBox="0 0 52 52" style={{ width: '64px', height: '64px' }}>
        <circle cx="26" cy="26" r="24" fill="none" stroke={accent} strokeWidth="2"
          style={{ strokeDasharray: 150, strokeDashoffset: 150, animation: 'drawC 0.5s 0.1s ease forwards' }} />
        <line x1="17" y1="17" x2="35" y2="35" stroke={accent} strokeWidth="3" strokeLinecap="round"
          style={{ strokeDasharray: 30, strokeDashoffset: 30, animation: 'drawC 0.3s 0.5s ease forwards' }} />
        <line x1="35" y1="17" x2="17" y2="35" stroke={accent} strokeWidth="3" strokeLinecap="round"
          style={{ strokeDasharray: 30, strokeDashoffset: 30, animation: 'drawC 0.3s 0.6s ease forwards' }} />
      </svg>
    ),
    confirm: (
      <svg viewBox="0 0 52 52" style={{ width: '64px', height: '64px' }}>
        <circle cx="26" cy="26" r="24" fill="none" stroke={accent} strokeWidth="2"
          style={{ strokeDasharray: 150, strokeDashoffset: 150, animation: 'drawC 0.5s 0.1s ease forwards' }} />
        <text x="26" y="35" textAnchor="middle" fontSize="26" fontWeight="700" fill={accent}
          style={{ opacity: 0, animation: 'fadeIn 0.3s 0.5s ease forwards' }}>?</text>
      </svg>
    ),
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        padding: '20px',
      }}
      onClick={e => { if (e.target === e.currentTarget) { onCancel?.() || onConfirm?.(); } }}
    >
      <style>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.88) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes drawC { to { stroke-dashoffset: 0; } }
        @keyframes fadeIn { to { opacity: 1; } }
      `}</style>

      <div style={{
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        borderRadius: '20px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.30)',
        overflow: 'hidden',
        animation: 'modalPop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      }}>
        {/* Top accent bar */}
        <div style={{
          height: '4px',
          background: `linear-gradient(90deg, ${accent}, ${accent}88)`,
        }} />

        <div style={{
          padding: '32px 28px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
        }}>
          {icons[type]}

          <h3 style={{
            margin: 0,
            fontFamily: FONTS.display,
            fontSize: '20px',
            fontWeight: '700',
            color: theme.textPrimary,
            textAlign: 'center',
          }}>
            {title}
          </h3>

          {message && (
            <p style={{
              margin: '0 0 6px',
              fontSize: '15px',
              color: theme.textSecondary,
              textAlign: 'center',
              lineHeight: '1.6',
              fontFamily: FONTS.body,
            }}>
              {message}
            </p>
          )}

          <div style={{
            display: 'flex',
            gap: '10px',
            width: '100%',
            marginTop: '6px',
            justifyContent: type === 'confirm' ? 'space-between' : 'center',
          }}>
            {type === 'confirm' && (
              <button
                onClick={onCancel}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.border}`,
                  background: theme.btnOutlineBg,
                  color: theme.btnOutlineText,
                  fontFamily: FONTS.body,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={onConfirm}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '10px',
                border: 'none',
                background: accent,
                color: '#fff',
                fontFamily: FONTS.body,
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: `0 4px 16px ${accent}44`,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}