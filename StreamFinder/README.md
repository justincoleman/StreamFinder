# StreamFinder

**StreamFinder** helps users discover the best streaming service or bundle for their selected sports leagues, with a modern, glassmorphic UI and full dark/light theme support.

## Features

- ⚡ **Vue 3 + Vite** for fast, modern development
- 🎨 **Tailwind CSS v4** for utility-first, glassmorphic design
- 🌗 **Auto dark/light theme** (system preference; manual toggle removed for consistency)
- 🏆 **Smart recommendations**: Highlights top bundles/services for your chosen leagues
- 🗂️ **Compare options**: See all possible bundles and services, sortable by price or coverage
- 🧩 **Reusable components**: StreamingServiceCard, BundleCard, LeagueSelector, and more
- 🗃️ **Pinia** for state management
- 🔗 **Vue Router** for navigation
- ♿ **Accessibility improvements**: Semantic HTML, ARIA attributes, keyboard navigation, and visible focus states
- 📱 **Mobile responsive**: Optimized layouts and touch targets for all devices
- 📦 **Ready for Netlify deployment**

## Project Structure

```
src/
  components/         # UI components (StreamingServiceCard, BundleCard, LeagueSelector, etc.)
  composables/        # Custom Vue composables (useTheme.js for theme management)
  data/               # Static data (leagues, streaming services, links)
  router/             # Vue Router setup
  stores/             # Pinia store (streamingStore.js)
  views/              # Main views/pages (LeagueSelectionView, SubscribedServicesView, ResultsView)
  assets/             # Images, icons, etc.
public/
  favicon.ico         # App favicon
  _redirects          # (Optional, for Netlify SPA routing)
```

## Getting Started

### 1. Install dependencies

```sh
npm install
```

### 2. Run the app in development

```sh
npm run dev
```

### 3. Build for production

```sh
npm run build
```

### 4. Preview the production build

```sh
npm run preview
```

### 5. Lint and format

```sh
npm run lint
npm run format
```

## Deployment (Netlify)

1. **Push your code to a GitHub/GitLab/Bitbucket repo.**
2. **Connect your repo to Netlify** and use these settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. _(Optional, for Vue Router history mode)_
   Add a file called `_redirects` to your `public/` folder with this content:
   ```
   /*    /index.html   200
   ```

## Theming

- Theme is managed via `useTheme.js` composable.
- Follows system preference by default. Manual toggle was removed for consistency and to avoid override issues with Tailwind v4 and Vite plugin.
- Applies `dark` or `light` class to `<html>` for Tailwind dark mode.

## Accessibility & Mobile Responsiveness

- All main views and components use semantic HTML elements (e.g., `<section>`, `<article>`, `<button>`, `<nav>`).
- ARIA attributes are used for improved screen reader support (e.g., `aria-label`, `aria-expanded`).
- All interactive elements are keyboard accessible and have visible focus states.
- Color contrast and font sizes are checked for readability.
- Layouts are fully responsive, with touch-friendly targets and spacing for mobile devices.

## Credits

- Built with [Vue 3](https://vuejs.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [Pinia](https://pinia.vuejs.org/), and [Vue Router](https://router.vuejs.org/).
- UI/UX design: glassmorphic, modern, responsive, and accessible.

---

**Enjoy using StreamFinder!**
