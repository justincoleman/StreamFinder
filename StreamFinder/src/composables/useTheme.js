import { ref, watch } from 'vue';

const THEME_KEY = 'streamfinder-theme';
const theme = ref('dark'); // default
const isManual = ref(false);

function setHtmlClass(newTheme) {
  const html = document.documentElement;
  html.classList.remove('dark', 'light');
  if (newTheme === 'dark') {
    html.classList.add('dark');
  }
  // For light, do not add any class
}

function detectSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') {
    theme.value = saved;
    isManual.value = true;
  } else {
    theme.value = detectSystemTheme() || 'dark';
    isManual.value = false;
  }
  setHtmlClass(theme.value);
}

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, theme.value);
  isManual.value = true;
  setHtmlClass(theme.value);
}

function resetTheme() {
  localStorage.removeItem(THEME_KEY);
  isManual.value = false;
  theme.value = detectSystemTheme();
  setHtmlClass(theme.value);
}

// Set theme immediately on import
loadTheme();

// Watch for theme changes and update <html> class
watch(theme, (val) => {
  setHtmlClass(val);
});

// Listen for system changes only if NOT manually overridden
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem(THEME_KEY)) {
      theme.value = e.matches ? 'dark' : 'light';
      setHtmlClass(theme.value);
    }
  });
}

export function useTheme() {
  return {
    theme,
    toggleTheme,
    loadTheme,
    resetTheme,
    isManual
  };
}