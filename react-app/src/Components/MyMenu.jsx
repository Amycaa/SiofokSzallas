import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTheme, FONTS, COLORS, TRANSITIONS } from './theme';

export default function MyMenu() {
  const { t, i18n } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setIsDarkMode(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Menü zárása kattintásra
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  const theme = getTheme(isDarkMode);

  // Navbar alap – mindig sötét háttér (oceanDeep), így a fehér szín mindig látható
  const NAV_BG = COLORS.oceanDeep;

  const linkBase = {
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    padding: '8px 14px',
    borderRadius: '6px',
    transition: TRANSITIONS.fast,
    color: 'rgba(255,255,255,0.70)',
    whiteSpace: 'nowrap',
  };

  const activeLinkExtra = {
    color: '#ffffff',
    background: 'rgba(255,255,255,0.12)',
  };

  // Nyelv gomb – navbar mindig sötét, így mindig fehér/világos szín kell
  const langBtnStyle = (active) => ({
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: active ? '700' : '400',
    fontFamily: FONTS.body,
    // ✅ FIX: A navbar mindig sötét, ezért mindig fehér tónusú szín
    color: active ? '#ffffff' : 'rgba(255,255,255,0.50)',
    transition: TRANSITIONS.fast,
    padding: '4px 7px',
    letterSpacing: '0.5px',
  });

  return (
    <>
      <style>{`
        @media (max-width: 520px) {
          .siofok-nav-links { display: none !important; }
          .siofok-nav-links.open { display: flex !important; }
          .siofok-hamburger { display: flex !important; }
          .siofok-nav-lang { gap: 1px !important; }
        }
        @media (min-width: 521px) {
          .siofok-hamburger { display: none !important; }
          .siofok-nav-links { display: flex !important; }
        }
      `}</style>

      <nav style={{
        background: NAV_BG,
        fontFamily: FONTS.body,
        boxShadow: '0 2px 20px rgba(0,0,0,0.30)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Fő sor */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 20px',
          height: '60px',
          gap: '8px',
        }}>
          {/* Logo */}
          <NavLink to="/" style={{
            fontFamily: FONTS.display,
            fontSize: '20px',
            fontWeight: '700',
            color: '#ffffff',
            letterSpacing: '0.3px',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            textDecoration: 'none',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '22px' }}>🌊</span>
            SiófokSzállás
          </NavLink>

          {/* Jobb oldal: nav linkek (desktop) + nyelv + hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

            {/* Nav linkek – desktop */}
            <div className="siofok-nav-links" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <NavLink
                to="/"
                end
                style={({ isActive }) => ({ ...linkBase, ...(isActive ? activeLinkExtra : {}) })}
              >
                {t('menu_apartments')}
              </NavLink>
              <NavLink
                to="/foglalasaim"
                style={({ isActive }) => ({ ...linkBase, ...(isActive ? activeLinkExtra : {}) })}
              >
                {t('menu_bookings')}
              </NavLink>
            </div>

            {/* Elválasztó */}
            <span style={{ color: 'rgba(255,255,255,0.15)', margin: '0 6px', fontSize: '14px' }}>|</span>

            {/* Nyelv gombok */}
            <div className="siofok-nav-lang" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              {['hu', 'en', 'de'].map((lng, i, arr) => (
                <React.Fragment key={lng}>
                  <button
                    onClick={() => i18n.changeLanguage(lng)}
                    style={langBtnStyle(i18n.language.startsWith(lng))}
                  >
                    {lng.toUpperCase()}
                  </button>
                  {i < arr.length - 1 && (
                    <span style={{ color: 'rgba(255,255,255,0.20)', fontSize: '11px' }}>|</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Hamburger gomb – csak mobilon */}
            <button
              className="siofok-hamburger"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
              style={{
                display: 'none', // alapból elrejtve, CSS mutatja mobilon
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.20)',
                borderRadius: '7px',
                padding: '7px 10px',
                cursor: 'pointer',
                flexDirection: 'column',
                gap: '4px',
                marginLeft: '6px',
              }}
              aria-label="Menü"
            >
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display: 'block',
                  width: '20px',
                  height: '2px',
                  background: '#ffffff',
                  borderRadius: '2px',
                  transition: '0.2s',
                }} />
              ))}
            </button>
          </div>
        </div>

        {/* Mobil dropdown menü */}
        {menuOpen && (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(13,45,74,0.97)',
              borderTop: '1px solid rgba(255,255,255,0.10)',
              padding: '12px 20px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <NavLink
              to="/"
              end
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                ...linkBase,
                display: 'block',
                padding: '12px 14px',
                ...(isActive ? activeLinkExtra : {}),
              })}
            >
              {t('menu_apartments')}
            </NavLink>
            <NavLink
              to="/foglalasaim"
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                ...linkBase,
                display: 'block',
                padding: '12px 14px',
                ...(isActive ? activeLinkExtra : {}),
              })}
            >
              {t('menu_bookings')}
            </NavLink>
          </div>
        )}
      </nav>
    </>
  );
}