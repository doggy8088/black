import { initLanguage } from './i18n/index.js';

const colorScheme = document.querySelector('meta[name="color-scheme"]');
const theme = document.querySelector('#theme');
const themeKey = 'screen-theme';

const systemTheme = matchMedia('(prefers-color-scheme: dark)');

function applyTheme(value) {
  const scheme = value === 'light' || value === 'dark' ? value : 'light dark';
  colorScheme.content = scheme;
  const dark = scheme === 'dark' || (scheme === 'light dark' && systemTheme.matches);
  theme.setAttribute('aria-checked', String(dark));
}

applyTheme(colorScheme.content);
theme.hidden = false;
systemTheme.addEventListener('change', () => applyTheme(colorScheme.content));

theme.addEventListener('click', () => {
  const dark = theme.getAttribute('aria-checked') !== 'true';
  const scheme = dark === systemTheme.matches ? 'light dark' : dark ? 'dark' : 'light';
  applyTheme(scheme);
  try {
    if (scheme === 'light dark') localStorage.removeItem(themeKey);
    else localStorage.setItem(themeKey, scheme);
  } catch {
    // The preference still applies when storage is disabled.
  }
});

window.addEventListener('storage', (event) => {
  if (event.key === themeKey || event.key === null) applyTheme(event.newValue);
});

const palette = document.querySelector('.palette');
const display = document.querySelector('#display');
const surface = document.querySelector('#display-color');
const supportsDialog = typeof display.showModal === 'function';
initLanguage(supportsDialog);
let opener;

async function openScreen(button) {
  opener = button;
  display.dataset.color = button.dataset.color;
  display.setAttribute('aria-label', button.querySelector('.swatch-name').textContent);
  if (display.open) return;
  display.showModal();

  if (document.fullscreenEnabled && surface.requestFullscreen) {
    try {
      await surface.requestFullscreen({ navigationUI: 'hide' });
      // The user may have closed the viewport overlay while fullscreen was pending.
      if (!display.open && document.fullscreenElement === surface) {
        await document.exitFullscreen();
      }
    } catch (error) {
      // The modal already fills the viewport on browsers that deny fullscreen.
      console.info('Using viewport display', error.name);
    }
  }
}

if (supportsDialog) {
  palette.inert = false;
  document.addEventListener('keydown', (event) => {
    if (event.repeat || event.isComposing || event.ctrlKey || event.metaKey ||
        event.altKey || event.shiftKey || event.defaultPrevented) return;
    if (event.target instanceof Element &&
        event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (!['1', '2', '3'].includes(event.key)) return;
    const button = palette.querySelector('[aria-keyshortcuts="' + event.key + '"]');
    if (button) {
      event.preventDefault();
      openScreen(button);
    }
  });
  for (const button of palette.querySelectorAll('button')) {
    button.addEventListener('click', () => openScreen(button));
  }
}

surface.addEventListener('click', () => display.close());

display.addEventListener('close', async () => {
  if (document.fullscreenElement === surface) {
    try {
      await document.exitFullscreen();
    } catch (error) {
      console.info('Fullscreen already closing', error.name);
    }
  }
  if (!display.open) opener?.focus({ preventScroll: true });
});

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && display.open) display.close();
});
