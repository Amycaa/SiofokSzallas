import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import ImageSlider from './ImageSlider';
import Footer from './Footer';
import { getTheme, FONTS, COLORS } from './theme';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

export default function ApartmentDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [apartment, setApartment] = useState(null);
  const [loadingError, setLoadingError] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setIsDarkMode(e.matches);
    mq.addEventListener('change', handler);

    const getApartment = async () => {
      if (!id) return;
      sessionStorage.setItem('lastApartmentId', id);
      try {
        const snap = await getDoc(doc(db, 'apartments', id));
        if (snap.exists()) {
          setApartment(snap.data());
          setLoadingError(false);
        } else { setLoadingError(true); }
      } catch (e) { console.error(e); setLoadingError(true); }
    };
    getApartment();
    return () => mq.removeEventListener('change', handler);
  }, [id]);

  const theme = getTheme(isDarkMode);

  if (loadingError) return (
    <p style={{ textAlign: 'center', padding: '40px', color: COLORS.coral, fontFamily: FONTS.body }}>{t('not_found')}</p>
  );
  if (!apartment) return (
    <p style={{ textAlign: 'center', padding: '40px', color: theme.textSecondary, fontFamily: FONTS.body }}>{t('loading_text')}</p>
  );

  const lang = i18n.language.split('-')[0];
  const dbField = lang === 'hu' ? apartment.Desc : (apartment[`Desc_${lang}`] || apartment.Desc);
  const isArr = Array.isArray(dbField);
  const priceDescription = isArr ? dbField[0] : apartment.priceDesc;
  const detailedDescription = isArr ? dbField[1] : dbField;
  const apartmentName = apartment[`name_${lang}`] || apartment.name;

  const fullAddress = [apartment.postalCode, apartment.city ? `${apartment.city},` : '', apartment.street, apartment.houseNumber]
    .filter(Boolean).join(' ').replace(' ,', ',');

  const mapPosition = (apartment.lat && apartment.long)
    ? [Number(apartment.lat), Number(apartment.long)]
    : [47.4979, 19.0402];

  const handleCopy = () => {
    navigator.clipboard.writeText(fullAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '800px', margin: '0 auto', fontFamily: FONTS.body, color: theme.textPrimary }}>

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        style={{
          marginBottom: '28px',
          padding: '9px 18px',
          cursor: 'pointer',
          background: `linear-gradient(135deg, ${COLORS.emerald}, ${COLORS.lagoon})`,
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          fontFamily: FONTS.body,
          fontSize: '14px',
          fontWeight: '700',
          letterSpacing: '0.3px',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 16px rgba(39,174,122,0.35)',
        }}
        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.08)'}
        onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
      >
        {t('back_btn')}
      </button>

      {/* Image slider */}
      <div style={{ height: '360px', borderRadius: '16px', overflow: 'hidden', marginBottom: '28px', boxShadow: '0 8px 32px rgba(13,45,74,0.15)' }}>
        <ImageSlider images={apartment.image} />
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: FONTS.display,
        fontSize: 'clamp(24px, 4vw, 32px)',
        fontWeight: '700',
        color: theme.textPrimary,
        margin: '0 0 20px 0',
        lineHeight: 1.3,
      }}>
        {apartmentName}
      </h1>

      {/* Description */}
      <style>{`
        .apt-description ul,
        .apt-description ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
          text-align: left;
        }
        .apt-description li {
          margin-bottom: 4px;
          text-align: left;
        }
        .apt-description p {
          text-align: center;
        }
        .apt-description h1,
        .apt-description h2,
        .apt-description h3,
        .apt-description h4 {
          font-weight: 600;
          text-align: center;
        }
      `}</style>
      <div className="apt-description" style={{
        fontSize: '15px',
        color: theme.textSecondary,
        lineHeight: '1.75',
        marginBottom: '28px',
        textAlign: 'left',
      }}>
        <ReactMarkdown>{detailedDescription || ''}</ReactMarkdown>
      </div>

      {/* Price + Booking */}
      <div style={{
        padding: '24px',
        borderRadius: '14px',
        border: `1px solid ${theme.border}`,
        background: isDarkMode ? 'rgba(26,74,107,0.20)' : 'rgba(26,74,107,0.04)',
        marginBottom: '32px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '6px',
          marginBottom: priceDescription ? '8px' : '20px',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontFamily: FONTS.display, fontSize: '22px', fontWeight: '700', color: COLORS.coral }}>
            {apartment.price?.toLocaleString()} {t('currency')}
          </span>
          <span style={{ fontSize: '14px', color: theme.textSecondary }}>
            {t('per_night_unit')}
          </span>
        </div>

        {priceDescription && (
          <p style={{ fontSize: '13px', color: theme.textSecondary, fontStyle: 'italic', margin: '0 0 20px 0' }}>
            * {priceDescription}
          </p>
        )}

        <button
          onClick={() => navigate('/foglalas', {
            state: {
              apartmentName,
              pricePerNight: Number(apartment.price),
              maxGuest: Number(apartment.maxGuest),
              minGuest: Number(apartment.minGuest),
            }
          })}
          style={{
            padding: '14px 28px',
            fontSize: '15px',
            fontWeight: '700',
            fontFamily: FONTS.body,
            letterSpacing: '0.3px',
            color: '#fff',
            background: `linear-gradient(135deg, ${COLORS.emerald}, ${COLORS.lagoon})`,
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(39,174,122,0.35)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.08)'}
          onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
        >
          🗓 {t('booking_btn', 'Foglalás')}
        </button>
      </div>

      <hr style={{ border: 'none', borderTop: `1px solid ${theme.hr}`, margin: '32px 0' }} />

      {/* Location */}
      <div>
        <h3 style={{ fontFamily: FONTS.display, fontSize: '22px', fontWeight: '700', color: theme.textPrimary, marginBottom: '16px' }}>
          📍 {t('location_title', 'Elhelyezkedés')}
        </h3>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          gap: '10px',
          flexWrap: 'wrap',
        }}>
          <p style={{ margin: 0, fontSize: '14px', fontStyle: 'italic', color: theme.textSecondary }}>
            {fullAddress || t('no_address', 'Cím nem érhető el')}
          </p>
          {fullAddress && (
            <button
              onClick={handleCopy}
              style={{
                padding: '7px 16px',
                fontSize: '13px',
                cursor: 'pointer',
                background: copied
                  ? COLORS.emerald
                  : `linear-gradient(135deg, ${COLORS.emerald}, ${COLORS.lagoon})`,
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontFamily: FONTS.body,
                fontWeight: '700',
                letterSpacing: '0.3px',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 16px rgba(39,174,122,0.35)',
              }}
              onMouseEnter={e => { if (!copied) e.currentTarget.style.filter = 'brightness(1.08)'; }}
              onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
            >
              {copied ? '✓ ' + t('copied_text', 'Másolva!') : t('copy_address_btn', 'Cím másolása')}
            </button>
          )}
        </div>

        <div style={{
          height: '320px',
          width: '100%',
          borderRadius: '14px',
          overflow: 'hidden',
          border: `1px solid ${theme.border}`,
          boxShadow: '0 4px 16px rgba(13,45,74,0.10)',
        }}>
          <MapContainer center={mapPosition} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={mapPosition}>
              <Popup><strong>{apartmentName}</strong><br />{fullAddress}</Popup>
            </Marker>
          </MapContainer>
        </div>

        <Footer />
      </div>
    </div>
  );
}