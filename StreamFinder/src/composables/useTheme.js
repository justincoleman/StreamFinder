import { ref, watch } from 'vue';

const THEME_KEY = 'streamfinder-theme';
const theme = ref('dark'); // default

function setHtmlClass(newTheme) {
  const html = document.documentElement;
  html.classList.remove('dark', 'light');
  html.classList.add(newTheme);
}

function detectSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') {
    theme.value = saved;
  } else {
    theme.value = detectSystemTheme() || 'dark';
  }
  setHtmlClass(theme.value);
}

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, theme.value);
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
    loadTheme
  };
}