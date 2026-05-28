/**
 * SiófokSzállás – Unified Mediterranean Design System
 * Mediterrán kékes, letisztult, dark/light kompatibilis
 * Javítva: Egységes rendes számmagasságok és teljes HU/DE/EN karaktertámogatás
 */

export const COLORS = {
  // === Elsődleges paletta ===
  oceanDeep:   '#0d2d4a',   // sötét tengerszín – dark bg alap
  oceanMid:    '#1a4a6b',   // fő brand szín (navbar, akcentus)
  oceanLight:  '#2a6496',   // hover, secondary actions
  lagoon:      '#1a8fa0',   // türkiz – call-to-action, badge
  lagoonLight: '#22b5cc',   // hover türkiz
  sand:        '#f5efe6',   // light bg alap (homokszín)
  sandDark:    '#e8ddd0',   // light kártyaszegély, HR
  foam:        '#f9f6f2',   // kártyák light módban
  coral:       '#e05c4b',   // figyelmeztetés, ár, cancel
  coralLight:  '#f07060',
  amber:       '#e8a020',   // confirm/warning
  emerald:     '#27ae7a',   // siker, submit gomb
  emeraldHover:'#1e9467',

  // === Szövegek ===
  textDarkPrimary:   '#f0f4f8',   // dark fő szöveg
  textDarkSecondary: '#8eafc7',   // dark muted
  textLightPrimary:  '#0d2d4a',
  textLightSecondary:'#506b82',

  // === Háttér ===
  bgLight:     '#f5efe6',
  bgDark:      '#0d2d4a',
  cardLight:   '#f9f6f2',
  cardDark:    '#143b5c',
  cardLightHover: '#f3ede4',
  cardDarkHover:  '#1a4a6b',
  inputBgLight:   '#ffffff',
  inputBgDark:    '#1a4a6b',

  // === Szegélyek ===
  borderLight: '#e8ddd0',
  borderDark:  '#1a4a6b',
};

// Új, teljeskörűen nemzetközi betűtípusok egységes számmagassággal
export const FONTS = {
  display: "'Lora', Georgia, serif",             // Címekhez és árakhoz (Lining-numbers: minden szám egyforma magas)
  body:    "'Inter', 'Segoe UI', sans-serif",    // Általános szövegekhez, gombokhoz, űrlapokhoz
};

// Frissített Google Fonts betöltő link a projekthez
export const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap';

export const getTheme = (isDarkMode) => {
  return {
    bg:          isDarkMode ? COLORS.bgDark    : COLORS.bgLight,
    cardBg:      isDarkMode ? COLORS.cardDark    : COLORS.cardLight,
    cardBgHover: isDarkMode ? COLORS.cardDarkHover : COLORS.cardLightHover,
    inputBg:     isDarkMode ? COLORS.inputBgDark : COLORS.inputBgLight,
    summaryBg:   isDarkMode ? 'rgba(26,74,107,0.25)' : 'rgba(26,74,107,0.06)',

    // Szöveg
    textPrimary:   isDarkMode ? COLORS.textDarkPrimary   : COLORS.textLightPrimary,
    textSecondary: isDarkMode ? COLORS.textDarkSecondary : COLORS.textLightSecondary,

    // Szegélyek
    border:        isDarkMode ? COLORS.borderDark  : COLORS.borderLight,
    borderInput:   isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(13,45,74,0.20)',
    hr:            isDarkMode ? 'rgba(255,255,255,0.10)' : 'rgba(13,45,74,0.10)',

    // Akcentusok
    primary:    COLORS.oceanMid,
    primaryHover: COLORS.oceanLight,
    accent:     COLORS.lagoon,
    accentHover:COLORS.lagoonLight,
    danger:     COLORS.coral,
    success:    COLORS.emerald,
    warning:    COLORS.amber,

    // Gombok
    btnOutlineBg:   isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(13,45,74,0.02)',
    btnOutlineText: isDarkMode ? COLORS.textDarkPrimary   : COLORS.textLightPrimary,
  };
};