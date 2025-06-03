# Contributing to StreamFinder v3

## 🚀 Quick Start for New Developers

### 1. **Setup**

```bash
# Clone and setup the project
git clone <repository-url>
cd StreamFinder
npm run setup  # Installs dependencies, lints, and formats code
```

### 2. **Development Workflow**

```bash
npm run dev     # Start development server
npm run check   # Lint and build check before committing
npm run clean   # Clean build artifacts if needed
```

## 🏗️ Architecture Overview

### **Single-Screen Application**

StreamFinder v3 is intentionally designed as a single-screen application where all functionality is consolidated into `ResultsView.vue`. This simplifies the user experience and reduces complexity.

### **Key Components**

- **`ResultsView.vue`** - Main application interface (37KB, 995 lines)
- **`BundleCard.vue`** - Bundle display with coverage visualization (22KB, 459 lines)
- **`SkeletonLoader.vue`** - Loading state placeholders (3.4KB, 94 lines)

### **State Management**

- **`streamingStore.js`** - Pinia store managing all application state (30KB, 768 lines)
- **Persistent storage** - User preferences saved to localStorage
- **Reactive updates** - Real-time bundle recalculation

## 📁 File Structure Guide

```
src/
├── components/              # Reusable UI components
│   ├── BundleCard.vue      # 🎯 Bundle recommendation display
│   └── SkeletonLoader.vue  # ⏳ Loading state management
├── data/                   # Static data files (JSON)
│   ├── streamingServicesData.json  # 📊 Service definitions
│   ├── leagues.json               # 🏆 Sports league data
│   ├── affiliateLinks.json        # 💰 Monetization links
│   └── serviceHomepages.json      # 🔗 Fallback service links
├── stores/                 # Pinia state management
│   └── streamingStore.js   # 🧠 Main application logic
├── composables/            # Vue composables
│   └── useTheme.js        # 🌗 Theme management
├── views/                 # Application views
│   └── ResultsView.vue    # 🏠 Primary interface
├── assets/               # Static assets
└── router/              # Vue Router setup
```

## 🎨 Design System

### **Typography**

- **Display Font**: Oswald (headers, buttons, emphasis)
- **Body Font**: Roboto (readable text, UI elements)
- **Monospace**: Roboto Mono (technical data)

### **Animation Philosophy**

- **Staggered Entrance**: 150ms delays between elements
- **Smooth Transitions**: Cubic-bezier easing for professional feel
- **Loading States**: Multi-stage progress (Analyzing → Calculating → Optimizing)
- **Micro-interactions**: Hover effects and button feedback

## 🔧 Common Development Tasks

### **Adding a New League**

1. **Update data**: Add league to `src/data/leagues.json`
2. **Update services**: Add coverage data to `src/data/streamingServicesData.json`
3. **Test**: Verify bundle generation works with new league

```json
// leagues.json
{
  "id": "new_league",
  "name": "New League",
  "icon": "⚽",
  "category": "Soccer"
}

// streamingServicesData.json
{
  "leagues": {
    "new_league": {
      "coveragePercent": 85,
      "coverage": "Description of what's covered",
      "channels": ["Channel 1", "Channel 2"]
    }
  }
}
```

### **Adding a New Streaming Service**

1. **Service definition**: Add to `src/data/streamingServicesData.json`
2. **Coverage mapping**: Include all relevant league coverage
3. **Links**: Add to `serviceHomepages.json` and optionally `affiliateLinks.json`

```json
{
  "id": "new_service",
  "name": "New Streaming Service",
  "price": "$29.99/month",
  "serviceCategory": "Live TV Streaming",
  "leagues": {
    "nfl": {
      "coveragePercent": 75,
      "coverage": "Regular season games",
      "channels": ["FOX", "CBS"]
    }
  }
}
```

### **Modifying Bundle Logic**

- **Core algorithm**: Located in `streamingStore.js` → `buildOptimalBundle()`
- **Budget adjustment**: `adjustBundleForBudget()` function
- **Testing**: Use browser dev tools to inspect `bundleState` in ResultsView

## 🧪 Testing Guidelines

### **Manual Testing Checklist**

- [ ] **League Selection**: Test various combinations
- [ ] **Importance Ranking**: Verify weighted recommendations work
- [ ] **Price Adjustment**: Test budget slider functionality
- [ ] **Loading States**: Verify all three stages display correctly
- [ ] **Mobile Responsive**: Test on different screen sizes
- [ ] **Dark/Light Theme**: Verify theme switching
- [ ] **Accessibility**: Test with keyboard navigation and screen readers

### **Edge Cases to Test**

- [ ] No leagues selected
- [ ] Single league selected
- [ ] All leagues selected
- [ ] Very low budget (under $10)
- [ ] Very high budget (over $200)
- [ ] NFL special coverage limitations

## 💻 Code Style Guidelines

### **Vue.js Best Practices**

- Use composition API with `<script setup>`
- Define props with proper TypeScript-style definitions
- Use descriptive component and variable names
- Keep template logic minimal, move complex logic to computed properties

### **JavaScript Conventions**

- Use JSDoc comments for complex functions
- Prefer `const` over `let` where possible
- Use descriptive variable names (`selectedLeagueIds` not `ids`)
- Break down large functions into smaller, focused functions

### **CSS/Styling**

- Use Tailwind utility classes primarily
- Keep custom styles minimal and scoped
- Use consistent spacing scale (4px, 8px, 12px, 16px, etc.)
- Follow mobile-first responsive design

### **Before Committing**

```bash
npm run check  # Runs linting and build check
npm run format # Formats all code consistently
```

## 🐛 Debugging Tips

### **Common Issues**

1. **Bundle not updating**: Check if `bundleState` is being mutated properly
2. **Loading stuck**: Verify all async operations complete
3. **Price calculation wrong**: Check `parsePrice()` function and service data
4. **Coverage not showing**: Verify league IDs match between data files

### **Development Tools**

- **Vue Devtools**: Install browser extension for component inspection
- **Console Logs**: Bundle generation logs are available in browser console
- **React Dev Tools**: For Pinia store state inspection

### **Performance**

- Use Chrome DevTools Performance tab to identify slow operations
- Bundle generation is cached - clear cache if seeing stale data
- Large league combinations may be slow - this is expected

## 🚀 Deployment

### **Build Process**

```bash
npm run build  # Creates optimized production build in dist/
npm run preview # Preview production build locally
```

### **Environment Variables**

Currently no environment variables are needed. All configuration is in the code.

### **Deployment Platforms**

- **Netlify**: Recommended (automatic deploys from git)
- **Vercel**: Also supported
- **GitHub Pages**: Requires some configuration for SPA routing

## 📚 Key Dependencies

### **Core Framework**

- **Vue 3**: Composition API with `<script setup>`
- **Vite**: Build tool and dev server
- **Pinia**: State management with persistence
- **Vue Router**: Single route for SPA

### **Styling**

- **Tailwind CSS v4**: Utility-first CSS framework
- **Google Fonts**: Oswald + Roboto typography

### **Development**

- **ESLint**: Code linting with Vue plugin
- **Prettier**: Code formatting
- **PostCSS**: CSS processing

## 🤝 Contribution Guidelines

### **Pull Request Process**

1. **Create feature branch**: `git checkout -b feature/description`
2. **Make changes**: Follow coding standards
3. **Test thoroughly**: Run through testing checklist
4. **Run checks**: `npm run check` must pass
5. **Create PR**: With descriptive title and summary

### **Commit Message Format**

```
feat: add new league support for MLS
fix: resolve bundle price calculation issue
docs: update README with new setup instructions
style: format code with prettier
refactor: simplify bundle generation logic
```

### **Review Criteria**

- Code follows established patterns
- No breaking changes to existing functionality
- Mobile responsive design maintained
- Accessibility standards met
- Performance impact considered

---

**Questions?** Check the main README.md or create an issue for discussion.
