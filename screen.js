const colorScheme = document.querySelector('meta[name="color-scheme"]');
const theme = document.querySelector('#theme');
const themeKey = 'screen-theme';

function applyTheme(value) {
  const scheme = value === 'light' || value === 'dark' ? value : 'light dark';
  colorScheme.content = scheme;
  theme.value = scheme;
}

applyTheme(colorScheme.content);
document.querySelector('#theme-control').hidden = false;

theme.addEventListener('change', () => {
  applyTheme(theme.value);
  try {
    if (theme.value === 'light dark') {
      localStorage.removeItem(themeKey);
    } else {
      localStorage.setItem(themeKey, theme.value);
    }
  } catch {
    // The in-page preference still works when site storage is disabled.
  }
});

window.addEventListener('storage', (event) => {
  if (event.key === themeKey || event.key === null) applyTheme(event.newValue);
});

const palette = document.querySelector('.palette');
const display = document.querySelector('#display');
const surface = document.querySelector('#display-color');
let opener;

async function openScreen(button) {
  opener = button;
  display.dataset.color = button.dataset.color;
  display.setAttribute('aria-label', button.querySelector('.swatch-name').textContent);
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

if (typeof display.showModal === 'function') {
  palette.inert = false;
  for (const button of palette.querySelectorAll('button')) {
    button.addEventListener('click', () => openScreen(button));
  }
} else {
  document.querySelector('#instructions').textContent = '請使用新版瀏覽器開啟純色畫面。';
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
