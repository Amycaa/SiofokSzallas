import { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ImageSlider from './ImageSlider';
import Footer from './Footer';
import { getTheme, FONTS, COLORS } from './theme';

export default function Home() {
  const { t, i18n } = useTranslation();
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setIsDarkMode(e.matches);
    mq.addEventListener('change', handler);

    // ❌ TÖRÖLVE: sessionStorage redirect – ez okozta, hogy mindig visszament az apartment oldalra
    // A sessionStorage-t már nem használjuk navigációra

    const fetchApartments = async () => {
      try {
        const snap = await getDocs(collection(db, 'apartments'));
        setApartments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchApartments();
    return () => mq.removeEventListener('change', handler);
  }, []);

  const theme = getTheme(isDarkMode);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: theme.textSecondary, fontFamily: FONTS.body }}>
      <div style={{ fontSize: '40px', marginBottom: '16px' }}>🌊</div>
      <div style={{ fontSize: '16px' }}>{t('loading')}</div>
    </div>
  );

  return (
    <div style={{ fontFamily: FONTS.body, padding: '40px 24px', background: 'transparent', color: theme.textPrimary, minHeight: '100vh' }}>

      {/* Hero heading */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{
          fontFamily: FONTS.display,
          fontSize: 'clamp(28px, 5vw, 44px)',
          fontWeight: '700',
          color: theme.textPrimary,
          margin: '0 0 12px 0',
          letterSpacing: '-0.5px',
        }}>
          {t('main_title')}
        </h1>
        <div style={{
          width: '60px', height: '3px',
          background: `linear-gradient(90deg, ${COLORS.lagoon}, ${COLORS.oceanLight})`,
          borderRadius: '2px',
          margin: '0 auto',
        }} />
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
        gap: '28px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {apartments.map(apt => {
          const lang = i18n.language.split('-')[0];
          const dbField = lang === 'hu' ? apt.Desc : (apt[`Desc_${lang}`] || apt.Desc);
          const isArr = Array.isArray(dbField);
          const shortDesc = isArr && dbField[2]
            ? dbField[2]
            : (typeof dbField === 'string' ? dbField.substring(0, 120) + '…' : '');
          const aptName = apt[`name_${lang}`] || apt.name;

          return (
            <div
              key={apt.id}
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: `1px solid ${theme.border}`,
                background: theme.cardBg,
                boxShadow: '0 4px 24px rgba(13,45,74,0.08)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                backdropFilter: 'blur(4px)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 36px rgba(13,45,74,0.16)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(13,45,74,0.08)';
              }}
            >
              <div style={{ width: '100%', height: '220px', flexShrink: 0 }}>
                <ImageSlider images={apt.image} />
              </div>

              <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{
                  fontFamily: FONTS.display,
                  margin: '0 0 10px 0',
                  fontSize: '20px',
                  fontWeight: '700',
                  color: theme.textPrimary,
                  lineHeight: 1.3,
                }}>
                  {aptName}
                </h3>

                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.65',
                  color: theme.textSecondary,
                  margin: '0 0 20px 0',
                  flex: 1,
                }}>
                  {shortDesc}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <span style={{
                      fontWeight: '700',
                      color: COLORS.coral,
                      fontSize: '18px',
                      fontFamily: FONTS.display,
                    }}>
                      {apt.price?.toLocaleString()} {t('currency')}
                    </span>
                    <span style={{ fontSize: '12px', color: theme.textSecondary, marginLeft: '4px' }}>
                      {t('per_night_unit')}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/apartment/${apt.id}`)}
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.oceanMid}, ${COLORS.lagoon})`,
                      color: '#fff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontFamily: FONTS.body,
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer',
                      letterSpacing: '0.3px',
                      boxShadow: '0 4px 12px rgba(26,74,107,0.30)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                  >
                    {t('details_btn')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}