/**
 * SiófokSzállás – Unified Mediterranean Design System
 * Mediterrán kékes, letisztult, dark/light kompatibilis
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
  textLightPrimary:  '#0d2d4a',   // light fő szöveg
  textLightSecondary:'#4a6a80',   // light muted

  // === Kártyák / felületek ===
  cardDark:    'rgba(255,255,255,0.05)',
  cardDarkHover:'rgba(255,255,255,0.09)',
  cardLight:   '#ffffff',
  cardLightHover:'#fafcff',

  // === Szegélyek ===
  borderDark:  'rgba(255,255,255,0.12)',
  borderLight: 'rgba(13,45,74,0.14)',

  // === Inputok ===
  inputBgDark:  '#112840',
  inputBgLight: '#ffffff',
};

export const FONTS = {
  display: "'Playfair Display', Georgia, serif",
  body:    "'Lato', 'Segoe UI', sans-serif",
};

export const SHADOWS = {
  card:    '0 4px 24px rgba(13,45,74,0.10)',
  cardHover: '0 8px 32px rgba(13,45,74,0.18)',
  button:  '0 4px 14px rgba(26,74,107,0.30)',
  modal:   '0 20px 60px rgba(0,0,0,0.35)',
};

export const RADIUS = {
  sm:  '6px',
  md:  '10px',
  lg:  '16px',
  xl:  '24px',
  pill:'999px',
};

export const TRANSITIONS = {
  fast:   'all 0.15s ease',
  normal: 'all 0.25s ease',
  slow:   'all 0.4s ease',
};

/** Hook-like helper: returns theme tokens based on isDarkMode bool */
export function getTheme(isDarkMode) {
  return {
    // Háttér
    pageBg:      isDarkMode ? COLORS.oceanDeep   : COLORS.sand,
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
    btnOutlineBg:   isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(13,45,74,0.06)',
    btnOutlineText: isDarkMode ? COLORS.textDarkPrimary   : COLORS.textLightPrimary,

    // Footer / navbar
    navBg: COLORS.oceanDeep,
  };
}

/** Google Fonts import string — add to index.html or inject via <style> */
export const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lato:wght@300;400;700&display=swap';
