import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { getTheme, FONTS, COLORS } from './theme';

export default function Footer() {
  const { t } = useTranslation();
  const [lastUpdateDate, setLastUpdateDate] = useState('2026. 05. 28.');
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setIsDarkMode(e.matches);
    mq.addEventListener('change', handler);

    const fetchLastUpdate = async () => {
      try {
        const snap = await getDocs(collection(db, 'apartments'));
        let latest = null;
        snap.docs.forEach(doc => {
          const d = doc.data();
          if (d.updatedAt) {
            const dt = d.updatedAt.toDate ? d.updatedAt.toDate() : new Date(d.updatedAt);
            if (!latest || dt > latest) latest = dt;
          }
        });
        if (latest && !isNaN(latest)) {
          setLastUpdateDate(
            `${latest.getFullYear()}. ${String(latest.getMonth() + 1).padStart(2, '0')}. ${String(latest.getDate()).padStart(2, '0')}.`
          );
        }
      } catch (e) { console.error(e); }
    };
    fetchLastUpdate();
    return () => mq.removeEventListener('change', handler);
  }, []);

  const theme = getTheme(isDarkMode);

  return (
    <footer style={{
      marginTop: '60px',
      padding: '24px 32px',
      borderRadius: '16px',
      border: `1px solid ${theme.border}`,
      background: isDarkMode ? 'rgba(26,74,107,0.18)' : 'rgba(26,74,107,0.05)',
      fontFamily: FONTS.body,
      maxWidth: '1200px',
      margin: '60px auto 0 auto',
    }}>
      {/* Divider with wave */}
      <div style={{
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${COLORS.lagoon}, transparent)`,
        marginBottom: '20px',
        borderRadius: '2px',
        opacity: 0.5,
      }} />

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '16px',
      }}>
        {/* Brand */}
        <div>
          <div style={{
            fontFamily: FONTS.display,
            fontSize: '18px',
            fontWeight: '700',
            color: theme.textPrimary,
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            🌊 SiófokSzállás
          </div>
          <div style={{ fontSize: '12px', color: theme.textSecondary, letterSpacing: '0.3px' }}>
            Balatoni apartmanok – Siófok
          </div>
        </div>

        {/* Contact */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: theme.textPrimary, marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {t('footer_contact') || 'Kapcsolat'}
          </div>
          <div style={{ fontSize: '13px', color: theme.textSecondary, display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <a href="mailto:info@apartmanom.hu" style={{ color: COLORS.lagoon, textDecoration: 'none' }}>
              info@apartmanom.hu
            </a>
            <span style={{ color: theme.textSecondary }}>+36 30 123 4567</span>
          </div>
          <div style={{ fontSize: '11px', color: theme.textSecondary, marginTop: '8px', opacity: 0.7 }}>
            {t('footer_last_update') || 'Utolsó frissítés:'} <strong>{lastUpdateDate}</strong>
          </div>
        </div>
      </div>
    </footer>
  );
}