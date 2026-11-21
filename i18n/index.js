import { africaMideast } from './africa-mideast.js';
import { arabicVarieties } from './arabic-varieties.js';
import { asia } from './asia.js';
import { europe } from './europe.js';
import { sinitic } from './sinitic.js';
import { southAsia } from './south-asia.js';

const messages = {
  'zh-TW': [
    '純色全螢幕｜黑色畫面、白色畫面、綠色畫面',
    '純色全螢幕',
    '選個顏色，一鍵填滿螢幕。',
    '跳至色彩選擇',
    '深色模式',
    '選擇顏色',
    '黑色畫面',
    '看清螢幕上的灰塵',
    '白色畫面',
    '在暗處臨時照明',
    '綠色畫面',
    '當作拍攝去背背景',
    '按 {1}、{2}、{3} 選色。輕點畫面或按 {Esc} 返回。',
    '離開全螢幕',
    '輕點畫面或按 Esc 返回。',
    '請使用新版瀏覽器開啟純色畫面。',
    '專案連結',
    'MIT 授權',
    '回饋意見',
    '語言',
    '跟隨瀏覽器語言',
  ],
  en: [
    'Solid Color Fullscreen | Black, White and Green Screens',
    'Solid Color Fullscreen',
    'Choose a color to fill your screen.',
    'Skip to color selection',
    'Dark mode',
    'Choose a color',
    'Black screen',
    'Spot dust on your screen',
    'White screen',
    'Light up a dark space',
    'Green screen',
    'Use as a chroma key background',
    'Press {1}, {2}, or {3} to choose a color. Tap the screen or press {Esc} to return.',
    'Exit fullscreen',
    'Tap the screen or press Esc to return.',
    'Use a newer browser to open a solid color screen.',
    'Project links',
    'MIT License',
    'Feedback',
    'Language',
    'Use browser language',
  ],
  yue: [
    '淨色全螢幕｜黑色、白色同綠色畫面',
    '淨色全螢幕',
    '揀隻色，一撳就填滿成個畫面。',
    '跳去揀顏色',
    '深色模式',
    '揀顏色',
    '黑色畫面',
    '睇清楚個芒上面嘅塵',
    '白色畫面',
    '照光暗嘅地方',
    '綠色畫面',
    '做拍片摳像嘅綠幕',
    '撳 {1}、{2} 或 {3} 揀顏色。撳一下畫面或者撳 {Esc} 就可以返去。',
    '退出全螢幕',
    '撳一下畫面或者撳 Esc 就可以返去。',
    '請用新版瀏覽器開啟淨色畫面。',
    '專案連結',
    'MIT 授權',
    '提供意見',
    '語言',
    '跟瀏覽器語言',
  ],
  ...asia,
  ...europe,
  ...southAsia,
  ...africaMideast,
  ...sinitic,
  ...arabicVarieties,
};

// Names are written in their own language so the picker is usable from any locale.
const languageNames = {
  am: 'አማርኛ',
  apc: 'العربية الشامية',
  ar: 'العربية',
  arq: 'الدارجة الجزائرية',
  ary: 'الدارجة المغربية',
  arz: 'العربية المصرية',
  az: 'Azərbaycanca',
  bg: 'Български',
  bho: 'भोजपुरी',
  bn: 'বাংলা',
  ceb: 'Cebuano',
  cs: 'Čeština',
  de: 'Deutsch',
  el: 'Ελληνικά',
  en: 'English',
  es: 'Español',
  fa: 'فارسی',
  fil: 'Filipino',
  fr: 'Français',
  gu: 'ગુજરાતી',
  ha: 'Hausa',
  hak: '客家話',
  he: 'עברית',
  hi: 'हिन्दी',
  hsn: '湘語',
  hu: 'Magyar',
  id: 'Bahasa Indonesia',
  ig: 'Igbo',
  it: 'Italiano',
  ja: '日本語',
  jv: 'Basa Jawa',
  km: 'ខ្មែរ',
  kn: 'ಕನ್ನಡ',
  ko: '한국어',
  lo: 'ລາວ',
  ml: 'മലയാളം',
  mr: 'मराठी',
  ms: 'Bahasa Melayu',
  my: 'မြန်မာ',
  nan: '閩南語',
  ne: 'नेपाली',
  nl: 'Nederlands',
  om: 'Afaan Oromoo',
  or: 'ଓଡ଼ିଆ',
  pa: 'ਪੰਜਾਬੀ',
  'pa-Arab': 'پنجابی',
  pcm: 'Naijá',
  pl: 'Polski',
  ps: 'پښتو',
  pt: 'Português',
  ro: 'Română',
  ru: 'Русский',
  sd: 'سنڌي',
  si: 'සිංහල',
  sr: 'Српски',
  su: 'Basa Sunda',
  sv: 'Svenska',
  sw: 'Kiswahili',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  th: 'ไทย',
  tr: 'Türkçe',
  uk: 'Українська',
  ur: 'اردو',
  uz: 'Oʻzbekcha',
  vi: 'Tiếng Việt',
  wuu: '吳語',
  yo: 'Yorùbá',
  yue: '粵語',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
};

const rtlLanguages = new Set(['apc', 'ar', 'arq', 'ary', 'arz', 'fa', 'he', 'pa-Arab', 'ps', 'sd', 'ur']);
const aliases = new Map([
  ['jp', 'ja'],
  ['iw', 'he'],
  ['in', 'id'],
  ['tl', 'fil'],
  ['pnb', 'pa-Arab'],
  ['lah', 'pa-Arab'],
  ['cmn', 'zh'],
]);
const preferenceKey = 'screen-language';

function matchLanguage(tag) {
  // Compare only the language, script and region. Ignore extensions and private-use subtags.
  const parts = tag.toLowerCase().replace(/_/g, '-').split('-');
  const language = aliases.get(parts[0]) ?? parts[0];
  const script = /^[a-z]{4}$/.test(parts[1]) ? parts[1] : undefined;
  const region = parts[script ? 2 : 1];

  if (language === 'zh') {
    if (script === 'hant') return 'zh-TW';
    if (script === 'hans') return 'zh-CN';
    return ['tw', 'hk', 'mo'].includes(region) ? 'zh-TW' : 'zh-CN';
  }

  if (language === 'pa' && (script === 'arab' || (!script && region === 'pk'))) {
    return 'pa-Arab';
  }

  return Object.prototype.hasOwnProperty.call(messages, language) ? language : undefined;
}

function browserLanguage() {
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of preferred) {
    if (!tag) continue;
    const locale = matchLanguage(tag);
    if (locale) return locale;
  }
  return 'en';
}

// The order here is the order shared by the translation arrays.
const fields = [
  ['title'],
  ['#screen-title'],
  ['.intro-copy p'],
  ['.skip-link'],
  ['#theme', 'aria-label'],
  ['.palette', 'aria-label'],
  ['#black-name'],
  ['#black-use'],
  ['#white-name'],
  ['#white-use'],
  ['#green-name'],
  ['#green-use'],
  ['#instructions'],
  ['#display-color', 'aria-label'],
  ['#exit-hint'],
  ['#instructions'],
  ['.footer-links', 'aria-label'],
  ['.license-link'],
  ['.feedback-link'],
  ['#language', 'aria-label'],
  ['#language option[value=""]'],
];

function renderInstructions(node, template) {
  const pieces = template.split(/\{(1|2|3|Esc)\}/);
  node.replaceChildren(...pieces.map((piece, index) => {
    if (index % 2 === 0) return piece;
    const key = document.createElement('kbd');
    key.dir = 'ltr';
    key.textContent = piece;
    return key;
  }));
}

export function initLanguage(supportsDialog) {
  const picker = document.querySelector('#language');
  const display = document.querySelector('#display');
  const heading = document.querySelector('#screen-title');
  const localeFields = fields.map(([selector, attribute]) => [document.querySelector(selector), attribute]);
  let preference = '';
  try {
    preference = localStorage.getItem(preferenceKey) ?? '';
  } catch {
    // Automatic and manual selection work with storage disabled.
  }

  function applyLanguage() {
    if (!Object.prototype.hasOwnProperty.call(messages, preference)) preference = '';
    const locale = preference || browserLanguage();
    const rtl = rtlLanguages.has(locale);

    document.documentElement.lang = locale;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    picker.value = preference;
    picker.dir = rtlLanguages.has(picker.value || locale) ? 'rtl' : 'ltr';

    messages[locale].forEach((text, index) => {
      const [node, attribute] = localeFields[index];
      if (index === 12) {
        if (supportsDialog) renderInstructions(node, text);
      } else if (index !== 15 || !supportsDialog) {
        if (attribute) node.setAttribute(attribute, text);
        else node.textContent = text;
      }
    });
    const swatchName = document.getElementById(display.dataset.color + '-name');
    display.setAttribute('aria-label', display.open && swatchName ? swatchName.textContent : heading.textContent);
  }

  const collator = new Intl.Collator('en');
  const locales = Object.keys(messages).sort((a, b) => collator.compare(languageNames[a], languageNames[b]));
  for (const locale of locales) {
    const option = new Option(languageNames[locale], locale);
    option.lang = locale;
    option.dir = rtlLanguages.has(locale) ? 'rtl' : 'ltr';
    picker.add(option);
  }

  applyLanguage();
  picker.hidden = false;
  picker.addEventListener('change', () => {
    preference = picker.value;
    applyLanguage();
    try {
      if (preference) localStorage.setItem(preferenceKey, preference);
      else localStorage.removeItem(preferenceKey);
    } catch {
      // The preference still applies when storage is disabled.
    }
  });
  window.addEventListener('languagechange', () => {
    if (!preference) applyLanguage();
  });
  window.addEventListener('storage', (event) => {
    if (event.key !== preferenceKey && event.key !== null) return;
    preference = event.newValue ?? '';
    applyLanguage();
  });
}
