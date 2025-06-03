# StreamFinder v3

**StreamFinder** is a modern Vue.js application that helps users discover the best streaming service bundles for their favorite sports leagues. Features a single-screen experience with enhanced loading animations, multi-stage progress tracking, and smart bundle recommendations.

## ✨ Features

- ⚡ **Vue 3 + Vite** - Fast, modern development experience
- 🎨 **Tailwind CSS v4** - Modern design with enhanced typography (Oswald + Roboto fonts)
- 🌗 **Auto dark/light theme** - Follows system preferences
- 🏆 **Smart bundle recommendations** - AI-powered suggestions based on league preferences
- 📊 **League importance ranking** - Weighted recommendations based on user priorities
- 🎬 **Enhanced loading states** - Multi-stage progress with skeleton screens
- ✨ **Smooth animations** - Staggered entrance effects and micro-interactions
- 📱 **Social media export** - Generate and share beautiful bundle graphics
- 🗃️ **Pinia state management** - Persistent user preferences
- ♿ **Accessibility focused** - Semantic HTML, ARIA attributes, keyboard navigation
- 📱 **Mobile responsive** - Optimized for all device sizes
- 🚀 **Ready for deployment** - Optimized build for production

## 🏗️ Architecture

### Single-Screen Application

StreamFinder v3 uses a simplified single-screen architecture where all functionality is consolidated into the main `ResultsView` component:

```
StreamFinder/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── BundleCard.vue   # Displays bundle recommendations
│   │   └── SkeletonLoader.vue # Loading state placeholders
│   ├── data/                # Static data files
│   │   ├── streamingServicesData.json # Service definitions
│   │   ├── leagues.json     # Sports league data
│   │   ├── affiliateLinks.json # Monetization links
│   │   └── serviceHomepages.json # Fallback links
│   ├── stores/              # Pinia state management
│   │   └── streamingStore.js # Main application store
│   ├── composables/         # Vue composables
│   │   └── useTheme.js      # Theme management
│   ├── views/               # Main application views
│   │   └── ResultsView.vue  # Primary single-screen interface
│   ├── router/              # Vue Router setup
│   ├── assets/              # Static assets (logos, images)
│   └── main.js              # Application entry point
└── public/                  # Public assets and deployment files
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation & Development

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open http://localhost:5173 in your browser
```

### Build & Deployment

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint and format code
npm run lint
npm run format
```

## 🧩 Key Components

### `ResultsView.vue` (37KB, 995 lines)

The main application interface featuring:

- **League Selection** - Multi-select with importance ranking
- **Enhanced Loading** - 3-stage progress (Analyzing → Calculating → Optimizing)
- **Bundle Display** - Smart recommendations with coverage visualization
- **Price Controls** - Dynamic budget adjustment with real-time updates

### `BundleCard.vue` (22KB, 459 lines)

Sophisticated bundle display component with:

- **Coverage Visualization** - Animated progress circles per league
- **Service Integration** - Affiliate links and service details
- **NFL Coverage Warning** - Special handling for broadcast limitations
- **Social Media Export** - Generate shareable graphics for bundle recommendations
- **Expandable Details** - Service-by-league coverage matrix

### `SocialMediaExport.vue` (8KB, 280 lines)

Social media graphic generation component featuring:

- **Canvas-based rendering** - High-quality image generation
- **Multiple formats** - Instagram (1080x1080) and Twitter/Facebook (1200x630)
- **Brand consistency** - StreamFinder styling with gradient backgrounds
- **Export options** - Download and clipboard copy functionality
- **Real-time preview** - Live preview of generated graphics

### `streamingStore.js` (30KB, 768 lines)

Comprehensive Pinia store managing:

- **Bundle Generation** - Advanced algorithms for optimal combinations
- **Budget Optimization** - Dynamic service removal based on price constraints
- **Preference Management** - Weighted league importance system
- **Data Persistence** - Local storage integration

## 🎨 Design System

### Typography

- **Display Font**: Oswald - Used for headers, buttons, and emphasis
- **Body Font**: Roboto - Used for readable text and UI elements
- **Mono Font**: Roboto Mono - Used for technical data

### Theme System

- **Auto Theme Detection** - Follows system dark/light preference
- **CSS Custom Properties** - Consistent color tokens
- **Tailwind Integration** - Dark mode class toggling

### Animation Philosophy

- **Staggered Entrance** - 150ms delays between elements
- **Smooth Transitions** - Cubic-bezier easing for professional feel
- **Loading States** - Multi-stage progress with realistic timing
- **Micro-interactions** - Hover effects and button feedback

## 📊 Data Structure

### League Configuration

Each league in `leagues.json` includes:

```json
{
  "id": "nfl",
  "name": "NFL",
  "icon": "🏈",
  "category": "American Football"
}
```

### Service Configuration

Each service in `streamingServicesData.json` includes:

```json
{
  "id": "service_id",
  "name": "Service Name",
  "price": 79.99,
  "leagues": {
    "league_id": {
      "coveragePercent": 85,
      "coverage": "Description of coverage"
    }
  }
}
```

## 🔧 Development Tips

### Adding New Leagues

1. Add league definition to `src/data/leagues.json`
2. Update service coverage in `src/data/streamingServicesData.json`
3. Test bundle generation in the store

### Adding New Services

1. Add service to `src/data/streamingServicesData.json`
2. Include league coverage percentages
3. Add links to `serviceHomepages.json` and optionally `affiliateLinks.json`

### Debugging Bundle Logic

- Use browser dev tools to inspect `bundleState` in ResultsView
- Check console for bundle generation logs
- Test edge cases with different league combinations

## 🚀 Deployment

### Netlify (Recommended)

1. **Connect Repository** - Link your GitHub/GitLab repo
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **SPA Routing** - Add `_redirects` file to `public/`:
   ```
   /*    /index.html   200
   ```

### Vercel

1. Import repository
2. Framework preset: Vue.js
3. Build command: `npm run build`
4. Output directory: `dist`

## 🤝 Contributing

### Code Style

- Use Prettier for formatting (`npm run format`)
- Follow Vue.js style guide
- Write descriptive commit messages
- Add comments for complex logic

### Testing Checklist

- [ ] Test all league combinations
- [ ] Verify mobile responsiveness
- [ ] Check dark/light theme switching
- [ ] Test bundle price adjustments
- [ ] Validate accessibility with screen readers

---

**Built with Vue 3, Vite, Tailwind CSS, and Pinia**
