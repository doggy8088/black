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
const displayContent = document.querySelector('#display-content');
const surface = document.querySelector('#display-color');
const picker = document.querySelector('#color-picker');
const pickerHex = document.querySelector('#color-picker-hex');
const spectrum = document.querySelector('#color-spectrum');
const saturation = document.querySelector('#color-saturation');
const supportsDialog = typeof display.showModal === 'function';
initLanguage(supportsDialog);

const presetColors = {
  black: '#000000',
  white: '#FFFFFF',
  green: '#00FF00',
};

let opener;
let committedColor = '#000000';
let pickerH = 0;
let pickerS = 1;
let pickerL = 0;
let pickerMode = null;
let ctrlHeld = false;
let ctrlDismissed = false;
let activeDrag = null;
let hasPreviewed = false;
let suppressSurfaceClick = false;
let suppressClickTimer = 0;
let pendingLongPress = null;
let longPressPointerId = null;

const LONG_PRESS_MS = 450;
const LONG_PRESS_SLOP = 12;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function isPointInside(element, event) {
  const rect = element.getBoundingClientRect();
  return event.clientX >= rect.left && event.clientX <= rect.right &&
    event.clientY >= rect.top && event.clientY <= rect.bottom;
}

function armSuppressSurfaceClick() {
  suppressSurfaceClick = true;
  clearTimeout(suppressClickTimer);
  suppressClickTimer = setTimeout(() => {
    suppressSurfaceClick = false;
  }, 80);
}

function cancelPendingLongPress() {
  if (!pendingLongPress) return;
  clearTimeout(pendingLongPress.timer);
  pendingLongPress = null;
}

function capturePointer(element, pointerId) {
  try {
    element.setPointerCapture?.(pointerId);
  } catch {
    // Ignore when pointer capture is unavailable for synthetic or ended pointers.
  }
}

function releasePointer(element, pointerId) {
  try {
    if (element.hasPointerCapture?.(pointerId)) element.releasePointerCapture(pointerId);
  } catch {
    // Ignore if capture was already released.
  }
}

function hslToHex(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (hp < 1) [r1, g1, b1] = [c, x, 0];
  else if (hp < 2) [r1, g1, b1] = [x, c, 0];
  else if (hp < 3) [r1, g1, b1] = [0, c, x];
  else if (hp < 4) [r1, g1, b1] = [0, x, c];
  else if (hp < 5) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  const m = l - c / 2;
  const rgb = [r1, g1, b1].map((v) => Math.round(clamp(v + m, 0, 1) * 255));
  return '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return { h, s, l };
}

function renderPicker(hex) {
  picker.style.setProperty('--picker-h', String(pickerH));
  picker.style.setProperty('--picker-s', `${(pickerS * 100).toFixed(2)}%`);
  picker.style.setProperty('--picker-s-ratio', String(pickerS));
  picker.style.setProperty('--picker-x', String(clamp(pickerH / 360, 0, 1)));
  picker.style.setProperty('--picker-y', String(clamp(1 - pickerL, 0, 1)));
  picker.style.setProperty('--picker-preview', hex);
  pickerHex.textContent = hex;
}

function applyDisplayColor(hex) {
  display.style.setProperty('--swatch', hex);
}

function commitColor(hex) {
  committedColor = hex;
  display.dataset.color = 'custom';
  applyDisplayColor(hex);
  display.setAttribute('aria-label', hex);
}

function openPicker(mode = 'ctrl') {
  if (!display.open || !picker.hidden) return;
  const { h, s, l } = hexToHsl(committedColor);
  pickerH = h;
  // On pure black/white, start with full saturation so the spectrum shows every hue immediately.
  pickerS = s === 0 && (l === 0 || l === 1) ? 1 : s;
  pickerL = l;
  pickerMode = mode;
  hasPreviewed = false;
  activeDrag = null;
  const paletteLabel = palette.getAttribute('aria-label');
  if (paletteLabel) picker.setAttribute('aria-label', paletteLabel);
  renderPicker(committedColor);
  picker.hidden = false;
  display.dataset.pickerOpen = '';
}

function closePicker({ commit = false } = {}) {
  cancelPendingLongPress();
  longPressPointerId = null;
  if (picker.hidden) {
    pickerMode = null;
    return;
  }
  if (commit && hasPreviewed) {
    commitColor(hslToHex(pickerH, pickerS, pickerL));
  } else if (hasPreviewed) {
    // Restore committed color if the user canceled without applying.
    if (display.dataset.color in presetColors) {
      display.style.removeProperty('--swatch');
    } else {
      applyDisplayColor(committedColor);
    }
  }
  activeDrag = null;
  hasPreviewed = false;
  pickerMode = null;
  picker.hidden = true;
  delete display.dataset.pickerOpen;
}

function updateFromSpectrum(event) {
  const rect = spectrum.getBoundingClientRect();
  if (!rect.width || !rect.height) return hslToHex(pickerH, pickerS, pickerL);
  const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
  const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
  pickerH = x * 360;
  pickerL = 1 - y;
  const hex = hslToHex(pickerH, pickerS, pickerL);
  hasPreviewed = true;
  renderPicker(hex);
  applyDisplayColor(hex);
  return hex;
}

function updateFromSaturation(event) {
  const rect = saturation.getBoundingClientRect();
  if (!rect.width) return hslToHex(pickerH, pickerS, pickerL);
  pickerS = clamp((event.clientX - rect.left) / rect.width, 0, 1);
  const hex = hslToHex(pickerH, pickerS, pickerL);
  hasPreviewed = true;
  renderPicker(hex);
  applyDisplayColor(hex);
  return hex;
}

async function openScreen(button) {
  opener = button;
  const colorKey = button.dataset.color;
  display.dataset.color = colorKey;
  display.style.removeProperty('--swatch');
  committedColor = presetColors[colorKey] ?? '#000000';
  closePicker();
  display.setAttribute('aria-label', button.querySelector('.swatch-name').textContent);
  if (display.open) return;
  display.showModal();

  if (document.fullscreenEnabled && displayContent.requestFullscreen) {
    try {
      // A dialog cannot enter fullscreen. Its content keeps the swatch and picker together.
      await displayContent.requestFullscreen({ navigationUI: 'hide' });
      // The user may have closed the viewport overlay while fullscreen was pending.
      if (!display.open && document.fullscreenElement === displayContent) {
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
    if (event.key === 'Control') {
      if (!display.open || event.repeat || event.altKey || event.metaKey) return;
      ctrlHeld = true;
      if (!ctrlDismissed) openPicker('ctrl');
      return;
    }
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

  document.addEventListener('keyup', (event) => {
    if (event.key !== 'Control') return;
    ctrlHeld = false;
    ctrlDismissed = false;
    if (pickerMode === 'ctrl' && !activeDrag) closePicker({ commit: hasPreviewed });
  });

  window.addEventListener('blur', () => {
    ctrlHeld = false;
    ctrlDismissed = false;
    closePicker();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      ctrlHeld = false;
      ctrlDismissed = false;
      closePicker();
    }
  });

  for (const button of palette.querySelectorAll('button')) {
    button.addEventListener('click', () => openScreen(button));
  }
}

// Prevent macOS Ctrl+Click and mobile touch long-press from opening the browser context menu.
display.addEventListener('contextmenu', (event) => {
  if (!picker.hidden || pendingLongPress || longPressPointerId !== null || event.ctrlKey || ctrlHeld) {
    event.preventDefault();
  }
});

surface.addEventListener('pointerdown', (event) => {
  if (!display.open || !picker.hidden) return;
  if (!event.isPrimary || event.button !== 0 || event.ctrlKey) return;
  cancelPendingLongPress();
  const pointerId = event.pointerId;
  pendingLongPress = {
    pointerId,
    x: event.clientX,
    y: event.clientY,
    timer: setTimeout(() => {
      pendingLongPress = null;
      if (!display.open || !picker.hidden) return;
      longPressPointerId = pointerId;
      armSuppressSurfaceClick();
      openPicker('longpress');
    }, LONG_PRESS_MS),
  };
});

window.addEventListener('pointermove', (event) => {
  if (pendingLongPress && event.pointerId === pendingLongPress.pointerId) {
    if (Math.hypot(event.clientX - pendingLongPress.x, event.clientY - pendingLongPress.y) > LONG_PRESS_SLOP) {
      cancelPendingLongPress();
    }
    return;
  }
  if (longPressPointerId !== null && event.pointerId === longPressPointerId && !picker.hidden) {
    event.preventDefault();
    if (activeDrag === 'spectrum' || (!activeDrag && isPointInside(spectrum, event))) {
      activeDrag = 'spectrum';
      updateFromSpectrum(event);
    } else if (activeDrag === 'saturation' || (!activeDrag && isPointInside(saturation, event))) {
      activeDrag = 'saturation';
      updateFromSaturation(event);
    }
  }
});

function handleLongPressEnd(event) {
  if (pendingLongPress && event.pointerId === pendingLongPress.pointerId) {
    cancelPendingLongPress();
    return;
  }
  if (longPressPointerId !== null && event.pointerId === longPressPointerId) {
    longPressPointerId = null;
    armSuppressSurfaceClick();
    if (event.type === 'pointerup' && activeDrag === 'spectrum') {
      const hex = updateFromSpectrum(event);
      commitColor(hex);
      activeDrag = null;
      hasPreviewed = false;
      closePicker();
    } else if (event.type === 'pointerup' && activeDrag === 'saturation') {
      updateFromSaturation(event);
      activeDrag = null;
    } else {
      activeDrag = null;
    }
  }
}

window.addEventListener('pointerup', handleLongPressEnd);
window.addEventListener('pointercancel', handleLongPressEnd);

picker.addEventListener('click', (event) => event.stopPropagation());

spectrum.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  activeDrag = 'spectrum';
  capturePointer(spectrum, event.pointerId);
  updateFromSpectrum(event);
});

spectrum.addEventListener('pointermove', (event) => {
  if (activeDrag !== 'spectrum') return;
  event.preventDefault();
  updateFromSpectrum(event);
});

spectrum.addEventListener('pointerup', (event) => {
  if (activeDrag !== 'spectrum') return;
  event.preventDefault();
  event.stopPropagation();
  releasePointer(spectrum, event.pointerId);
  const hex = updateFromSpectrum(event);
  commitColor(hex);
  activeDrag = null;
  hasPreviewed = false;
  if (ctrlHeld) ctrlDismissed = true;
  armSuppressSurfaceClick();
  closePicker();
});

spectrum.addEventListener('pointercancel', () => {
  if (activeDrag !== 'spectrum') return;
  activeDrag = null;
  if (pickerMode === 'ctrl' && !ctrlHeld) closePicker();
});

saturation.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  activeDrag = 'saturation';
  capturePointer(saturation, event.pointerId);
  updateFromSaturation(event);
});

saturation.addEventListener('pointermove', (event) => {
  if (activeDrag !== 'saturation') return;
  event.preventDefault();
  updateFromSaturation(event);
});

saturation.addEventListener('pointerup', (event) => {
  if (activeDrag !== 'saturation') return;
  event.preventDefault();
  event.stopPropagation();
  releasePointer(saturation, event.pointerId);
  updateFromSaturation(event);
  activeDrag = null;
  armSuppressSurfaceClick();
  if (pickerMode === 'ctrl' && !ctrlHeld) closePicker({ commit: true });
});

saturation.addEventListener('pointercancel', () => {
  if (activeDrag !== 'saturation') return;
  activeDrag = null;
  if (pickerMode === 'ctrl' && !ctrlHeld) closePicker();
});

surface.addEventListener('click', (event) => {
  if (suppressSurfaceClick) {
    suppressSurfaceClick = false;
    clearTimeout(suppressClickTimer);
    return;
  }
  if (!picker.hidden) {
    if (pickerMode === 'longpress') closePicker({ commit: hasPreviewed });
    return;
  }
  if (event.ctrlKey || ctrlHeld) return;
  display.close();
});

display.addEventListener('close', async () => {
  ctrlHeld = false;
  ctrlDismissed = false;
  closePicker();
  if (document.fullscreenElement === displayContent) {
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
