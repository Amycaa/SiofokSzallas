/**
 * ApartmentTranslationAdmin.jsx
 * 
 * Admin felület az apartman fordítások (name_en, name_de, Desc_en, Desc_de)
 * szerkesztéséhez és Firestore-ba mentéséhez.
 * 
 * HASZNÁLAT: Adj hozzá egy útvonalat az App.jsx-ben, pl.:
 *   <Route path="/admin/forditas" element={<ApartmentTranslationAdmin />} />
 */

import { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getTheme, FONTS, COLORS } from './theme';
import { auth } from './firebaseConfig';
const LANGS = [
  { code: 'en', label: '🇬🇧 Angol (EN)', flag: '🇬🇧' },
  { code: 'de', label: '🇩🇪 Német (DE)', flag: '🇩🇪' },
];

export default function ApartmentTranslationAdmin() {
  // ── Auth state ──
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // ── App state ──
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});
  const [activeLang, setActiveLang] = useState('en');
  const [edits, setEdits] = useState({});
  const [isDarkMode] = useState(
    window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  );
  const theme = getTheme(isDarkMode);

  // ── Auth figyelő ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // ── Apartmanok betöltése (csak bejelentkezés után) ──
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'apartments'));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setApartments(list);

        const initial = {};
        list.forEach(apt => {
          initial[apt.id] = {};
          LANGS.forEach(({ code }) => {
            const existing = apt[`Desc_${code}`];
            const isArr = Array.isArray(existing);
            initial[apt.id][code] = {
              name:      apt[`name_${code}`] || '',
              priceDesc: isArr ? (existing[0] || '') : '',
              desc:      isArr ? (existing[1] || '') : (typeof existing === 'string' ? existing : ''),
              shortDesc: isArr ? (existing[2] || '') : '',
            };
          });
        });
        setEdits(initial);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // ── Bejelentkezés ──
  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (e) {
      setLoginError('Hibás e-mail vagy jelszó.');
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Kijelentkezés ──
  const handleLogout = async () => {
    await signOut(auth);
    setApartments([]);
    setEdits({});
  };

  // ── Szerkesztés ──
  const set = (aptId, lang, field, value) => {
    setEdits(prev => ({
      ...prev,
      [aptId]: {
        ...prev[aptId],
        [lang]: { ...prev[aptId][lang], [field]: value },
      },
    }));
  };

  // ── Mentés ──
  const handleSave = async (apt) => {
    const key = `${apt.id}_${activeLang}`;
    setSaving(s => ({ ...s, [key]: true }));
    try {
      const e = edits[apt.id][activeLang];
      await updateDoc(doc(db, 'apartments', apt.id), {
        [`name_${activeLang}`]: e.name,
        [`Desc_${activeLang}`]: [e.priceDesc, e.desc, e.shortDesc],
      });
      setSaved(s => ({ ...s, [key]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [key]: false })), 2500);
    } catch (err) {
      alert('Hiba mentés közben: ' + err.message);
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  };

  // ── Magyar szöveg másolása ──
  const handleCopyFromHu = (apt) => {
    const huDesc = apt.Desc;
    const isArr = Array.isArray(huDesc);
    setEdits(prev => ({
      ...prev,
      [apt.id]: {
        ...prev[apt.id],
        [activeLang]: {
          name:      apt.name || '',
          priceDesc: isArr ? (huDesc[0] || '') : '',
          desc:      isArr ? (huDesc[1] || '') : (typeof huDesc === 'string' ? huDesc : ''),
          shortDesc: isArr ? (huDesc[2] || '') : '',
        },
      },
    }));
  };

  // ── Stílusok ──
  const inputStyle = {
    width: '100%',
    padding: '10px 13px',
    borderRadius: '9px',
    border: `1px solid ${theme.borderInput}`,
    background: theme.inputBg,
    color: theme.textPrimary,
    fontFamily: FONTS.body,
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const taStyle = {
    ...inputStyle,
    resize: 'vertical',
    minHeight: '100px',
    lineHeight: '1.6',
  };

  const labelStyle = {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
    color: theme.textSecondary,
    marginBottom: '5px',
    display: 'block',
  };

  // ── Auth betöltés ──
  if (authLoading) return (
    <div style={{ padding: '80px', textAlign: 'center', color: theme.textSecondary, fontFamily: FONTS.body }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔐</div>
      <div>Hitelesítés ellenőrzése...</div>
    </div>
  );

  // ── Bejelentkezési képernyő ──
  if (!user) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: FONTS.body,
      background: theme.bg,
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        borderRadius: '20px',
        border: `1px solid ${theme.border}`,
        background: theme.cardBg,
        boxShadow: '0 20px 60px rgba(13,45,74,0.15)',
        overflow: 'hidden',
      }}>
        {/* Fejléc sáv */}
        <div style={{
          height: '4px',
          background: `linear-gradient(90deg, ${COLORS.emerald}, ${COLORS.lagoon})`,
        }} />

        <div style={{ padding: '40px 36px 36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌍</div>
            <h2 style={{
              margin: '0 0 6px',
              fontFamily: FONTS.display,
              fontSize: '22px',
              fontWeight: '700',
              color: theme.textPrimary,
            }}>
              Admin bejelentkezés
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: theme.textSecondary }}>
              SiófokSzállás · Fordítás szerkesztő
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>E-mail cím</label>
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="admin@example.com"
                style={inputStyle}
                onFocus={ev => ev.target.style.borderColor = COLORS.lagoon}
                onBlur={ev => ev.target.style.borderColor = theme.borderInput}
              />
            </div>
            <div>
              <label style={labelStyle}>Jelszó</label>
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={ev => ev.target.style.borderColor = COLORS.lagoon}
                onBlur={ev => ev.target.style.borderColor = theme.borderInput}
              />
            </div>

            {loginError && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(224,92,75,0.10)',
                border: `1px solid ${COLORS.coral}44`,
                color: COLORS.coral,
                fontSize: '13px',
                fontWeight: '600',
              }}>
                ⚠️ {loginError}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loginLoading}
              style={{
                marginTop: '6px',
                padding: '13px',
                borderRadius: '10px',
                border: 'none',
                background: `linear-gradient(135deg, ${COLORS.emerald}, ${COLORS.lagoon})`,
                color: '#fff',
                fontFamily: FONTS.body,
                fontSize: '15px',
                fontWeight: '700',
                cursor: loginLoading ? 'not-allowed' : 'pointer',
                opacity: loginLoading ? 0.7 : 1,
                boxShadow: '0 4px 16px rgba(39,174,122,0.30)',
                transition: 'all 0.2s ease',
              }}
            >
              {loginLoading ? '⏳ Bejelentkezés...' : '🔐 Bejelentkezés'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Betöltés (bejelentkezés után) ──
  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center', color: theme.textSecondary, fontFamily: FONTS.body }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏖</div>
      <div>Apartmanok betöltése...</div>
    </div>
  );

  // ── Fő admin felület ──
  return (
    <div style={{
      fontFamily: FONTS.body,
      color: theme.textPrimary,
      padding: '32px 20px',
      maxWidth: '900px',
      margin: '0 auto',
    }}>
      {/* Fejléc */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <div>
          <h1 style={{ fontFamily: FONTS.display, fontSize: '28px', fontWeight: '700', margin: '0 0 6px 0' }}>
            🌍 Apartman fordítások szerkesztése
          </h1>
          <p style={{ fontSize: '14px', color: theme.textSecondary, margin: 0 }}>
            Az itt mentett adatok közvetlenül a Firestore adatbázisba kerülnek. A magyar (<code>Desc</code>, <code>name</code>) mezőket itt nem szerkeszted – csak EN és DE fordításokat.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <span style={{ fontSize: '13px', color: theme.textSecondary }}>
            👤 {user.email}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              background: theme.btnOutlineBg,
              color: theme.textSecondary,
              fontFamily: FONTS.body,
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.coral; e.currentTarget.style.color = COLORS.coral; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary; }}
          >
            🚪 Kijelentkezés
          </button>
        </div>
      </div>

      {/* Nyelvválasztó tab */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '28px',
        padding: '6px',
        background: isDarkMode ? 'rgba(26,74,107,0.25)' : 'rgba(26,74,107,0.06)',
        borderRadius: '12px',
        width: 'fit-content',
      }}>
        {LANGS.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => setActiveLang(code)}
            style={{
              padding: '9px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: FONTS.body,
              fontSize: '14px',
              fontWeight: '700',
              transition: 'all 0.18s ease',
              background: activeLang === code
                ? `linear-gradient(135deg, ${COLORS.oceanMid}, ${COLORS.lagoon})`
                : 'transparent',
              color: activeLang === code ? '#fff' : theme.textSecondary,
              boxShadow: activeLang === code ? '0 4px 12px rgba(26,74,107,0.30)' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Apartman kártyák */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {apartments.map(apt => {
          const key = `${apt.id}_${activeLang}`;
          const e = edits[apt.id]?.[activeLang] || {};
          const isSaving = saving[key];
          const isSaved = saved[key];

          return (
            <div key={apt.id} style={{
              borderRadius: '16px',
              border: `1px solid ${theme.border}`,
              background: theme.cardBg,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(13,45,74,0.07)',
            }}>
              {/* Kártya fejléc */}
              <div style={{
                padding: '16px 22px',
                background: isDarkMode ? 'rgba(26,74,107,0.25)' : 'rgba(26,74,107,0.06)',
                borderBottom: `1px solid ${theme.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
              }}>
                <div>
                  <span style={{ fontSize: '12px', color: theme.textSecondary, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    🏖 Apartman:
                  </span>
                  <span style={{ fontFamily: FONTS.display, fontSize: '17px', fontWeight: '700', marginLeft: '8px' }}>
                    {apt.name || apt.id}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyFromHu(apt)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '7px',
                    border: `1px solid ${theme.border}`,
                    background: theme.btnOutlineBg,
                    color: theme.textSecondary,
                    fontFamily: FONTS.body,
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={ev => { ev.currentTarget.style.borderColor = COLORS.lagoon; ev.currentTarget.style.color = COLORS.lagoon; }}
                  onMouseLeave={ev => { ev.currentTarget.style.borderColor = theme.border; ev.currentTarget.style.color = theme.textSecondary; }}
                  title="A magyar szöveg átmásolása kiindulópontként"
                >
                  📋 Magyar szöveg másolása kiindulópontnak
                </button>
              </div>

              {/* Magyar referencia (csak olvasható) */}
              <div style={{
                padding: '14px 22px',
                background: isDarkMode ? 'rgba(13,45,74,0.30)' : 'rgba(245,239,230,0.7)',
                borderBottom: `1px solid ${theme.border}`,
              }}>
                <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', color: theme.textSecondary, marginBottom: '8px' }}>
                  🇭🇺 Magyar referencia (csak olvasható)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  {[
                    { label: 'Név', value: apt.name },
                    { label: 'Ár leírás', value: Array.isArray(apt.Desc) ? apt.Desc[0] : '' },
                    { label: 'Rövid leírás (kártya)', value: Array.isArray(apt.Desc) ? apt.Desc[2] : '' },
                  ].map(({ label, value }) => value ? (
                    <div key={label}>
                      <div style={{ fontSize: '10px', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>{label}</div>
                      <div style={{ fontSize: '13px', color: theme.textPrimary, opacity: 0.75, fontStyle: 'italic', lineHeight: '1.5', wordBreak: 'break-word' }}>
                        {value.length > 120 ? value.substring(0, 120) + '…' : value}
                      </div>
                    </div>
                  ) : null)}
                </div>
                {Array.isArray(apt.Desc) && apt.Desc[1] && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ fontSize: '10px', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Részletes leírás</div>
                    <div style={{ fontSize: '13px', color: theme.textPrimary, opacity: 0.75, fontStyle: 'italic', lineHeight: '1.5', maxHeight: '80px', overflow: 'hidden', wordBreak: 'break-word' }}>
                      {apt.Desc[1].substring(0, 300)}{apt.Desc[1].length > 300 ? '…' : ''}
                    </div>
                  </div>
                )}
              </div>

              {/* Fordítás mezők */}
              <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: COLORS.lagoon, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  {LANGS.find(l => l.code === activeLang)?.flag} {activeLang.toUpperCase()} fordítás
                </div>

                <div>
                  <label style={labelStyle}>Apartman neve ({activeLang.toUpperCase()})</label>
                  <input
                    style={inputStyle}
                    value={e.name || ''}
                    onChange={ev => set(apt.id, activeLang, 'name', ev.target.value)}
                    placeholder={`Pl. ${apt.name || 'Apartment name'}`}
                    onFocus={ev => ev.target.style.borderColor = COLORS.lagoon}
                    onBlur={ev => ev.target.style.borderColor = theme.borderInput}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Ár megjegyzés ({activeLang.toUpperCase()})
                    <span style={{ fontWeight: '400', textTransform: 'none', marginLeft: '4px', opacity: 0.7 }}>(opcionális – az ár alatt jelenik meg dőlten)</span>
                  </label>
                  <input
                    style={inputStyle}
                    value={e.priceDesc || ''}
                    onChange={ev => set(apt.id, activeLang, 'priceDesc', ev.target.value)}
                    placeholder="E.g. Price may vary by season..."
                    onFocus={ev => ev.target.style.borderColor = COLORS.lagoon}
                    onBlur={ev => ev.target.style.borderColor = theme.borderInput}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Részletes leírás ({activeLang.toUpperCase()}) — Markdown támogatott</label>
                  <textarea
                    style={taStyle}
                    value={e.desc || ''}
                    onChange={ev => set(apt.id, activeLang, 'desc', ev.target.value)}
                    placeholder="Full apartment description in markdown..."
                    onFocus={ev => ev.target.style.borderColor = COLORS.lagoon}
                    onBlur={ev => ev.target.style.borderColor = theme.borderInput}
                  />
                  <div style={{ fontSize: '11px', color: theme.textSecondary, textAlign: 'right', marginTop: '3px', opacity: 0.6 }}>
                    {(e.desc || '').length} karakter
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>
                    Rövid leírás ({activeLang.toUpperCase()})
                    <span style={{ fontWeight: '400', textTransform: 'none', marginLeft: '4px', opacity: 0.7 }}>(a főoldalon a kártyán jelenik meg, ~120 karakter ajánlott)</span>
                  </label>
                  <textarea
                    style={{ ...taStyle, minHeight: '70px' }}
                    value={e.shortDesc || ''}
                    onChange={ev => set(apt.id, activeLang, 'shortDesc', ev.target.value)}
                    placeholder="Short summary for the apartment card on the home page..."
                    onFocus={ev => ev.target.style.borderColor = COLORS.lagoon}
                    onBlur={ev => ev.target.style.borderColor = theme.borderInput}
                  />
                  <div style={{ fontSize: '11px', color: theme.textSecondary, textAlign: 'right', marginTop: '3px', opacity: 0.6 }}>
                    {(e.shortDesc || '').length} / 120 ajánlott
                  </div>
                </div>

                <button
                  onClick={() => handleSave(apt)}
                  disabled={isSaving}
                  style={{
                    padding: '13px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: isSaved
                      ? COLORS.emerald
                      : `linear-gradient(135deg, ${COLORS.emerald}, ${COLORS.lagoon})`,
                    color: '#fff',
                    fontFamily: FONTS.body,
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.7 : 1,
                    boxShadow: '0 4px 14px rgba(39,174,122,0.30)',
                    transition: 'all 0.2s ease',
                    alignSelf: 'flex-start',
                  }}
                >
                  {isSaving ? '⏳ Mentés...' : isSaved ? '✓ Mentve!' : `💾 ${LANGS.find(l => l.code === activeLang)?.flag} Mentés Firestore-ba`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}