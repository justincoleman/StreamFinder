<template>
  <div class="min-h-screen bg-white dark:bg-slate-900">
    <div class="container mx-auto p-4 sm:p-6 max-w-full sm:max-w-2xl">
      <header class="mb-8 text-center">
        <h1 class="text-4xl sm:text-7xl font-extrabold font-mono text-black uppercase tracking-widest mb-2 border-b-8 border-primary inline-block pb-2 dark:text-white">STREAMFINDER</h1>
        <p class="text-lg sm:text-xl font-bold font-mono text-black mt-4 leading-relaxed dark:text-white">
          Find the best streaming bundle for your favorite sports leagues—instantly.
        </p>
        <!--
        <div class="flex justify-center gap-4 mt-6">
          <button @click="toggleTheme" class="px-4 py-2 border-4 border-black bg-white text-black font-extrabold font-mono uppercase tracking-widest hover:bg-black hover:text-white dark:bg-black dark:text-white dark:border-primary transition">
            Toggle {{ theme === 'dark' ? 'Light' : 'Dark' }} Mode
          </button>
          <button v-if="isManual" @click="resetTheme" class="px-4 py-2 border-4 border-black bg-white text-black font-extrabold font-mono uppercase tracking-widest hover:bg-black hover:text-white dark:bg-black dark:text-white dark:border-primary transition">
            Reset to System
          </button>
        </div>
        -->
      </header>

      <!-- Expand/collapse toggle -->
      <div v-if="selectionCollapsed" class="flex justify-center mb-4">
        <button @click="selectionCollapsed = false" class="px-6 py-3 bg-primary text-black font-extrabold font-mono uppercase tracking-widest rounded-lg shadow hover:bg-black hover:text-white transition text-xl">
          Expand Selections
        </button>
      </div>

      <!-- Selection Controls -->
      <transition name="fade-slide">
        <section v-show="!selectionCollapsed" ref="selectionRef" class="bg-white border-4 border-black p-4 sm:p-6 mb-8 flex flex-col gap-6 mb-10 dark:bg-[#181824] dark:border-primary rounded-lg">
          <!-- League Selection -->
          <div>
            <h2 class="text-2xl font-bold font-mono text-primary mb-2 uppercase tracking-wider">Select Leagues:</h2>
            <div class="flex flex-wrap gap-2">
              <label v-for="league in store.allLeaguesFlat" :key="league.id"
                class="flex items-center gap-2 px-3 py-2 border-2 border-black bg-white cursor-pointer select-none hover:bg-primary/10 transition dark:bg-[#232336] dark:border-primary dark:hover:bg-primary/20 rounded-lg"
                :class="{
                  'bg-primary text-black dark:bg-primary dark:text-black': store.selectedLeagueIds.includes(league.id),
                  'dark:bg-[#232336] dark:text-white': !store.selectedLeagueIds.includes(league.id)
                }"
              >
                <input type="checkbox" v-model="store.selectedLeagueIds" :value="league.id" class="accent-primary w-5 h-5 border-2 border-black dark:border-primary" />
                <span class="text-lg">{{ league.icon }}</span>
                <span class="text-base font-bold font-mono text-black dark:text-white"
                  :class="store.selectedLeagueIds.includes(league.id) ? 'text-black dark:text-black' : 'dark:text-white'"
                >{{ league.name }}</span>
              </label>
            </div>
          </div>
          <div class="flex justify-center mt-6">
            <button
              @click="handleBuild"
              :disabled="store.selectedLeagueIds.length === 0 || isLoading"
              class="px-8 py-3 border-4 border-black bg-primary text-black font-extrabold font-mono text-xl uppercase tracking-widest transition disabled:opacity-40 disabled:cursor-not-allowed dark:bg-indigo-500 dark:text-white dark:border-primary rounded-lg"
            >
              <span v-if="!isLoading">Build</span>
              <span v-else>Building your bundle...</span>
            </button>
          </div>
        </section>
      </transition>

      <!-- Loading Animation -->
      <transition name="fade-slide">
        <div v-if="isLoading" class="flex flex-col items-center justify-center my-12" key="loading">
          <svg class="animate-spin h-16 w-16 text-primary dark:text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <div class="text-xl font-mono font-extrabold uppercase text-black dark:text-white tracking-widest">Building your bundle...</div>
        </div>
      </transition>

      <!-- Results Area - Always rendered but conditionally visible -->
      <div
        v-show="hasBuilt && !isLoading"
        ref="resultsRef"
        class="results-container"
      >
        <!-- Selected Leagues Summary -->
        <div v-if="bundleState.bundleToShow" class="flex flex-wrap gap-2 justify-center mb-6">
          <span v-for="league in store.selectedLeagues" :key="league.id"
            class="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 border border-slate-300 text-base font-bold font-mono uppercase text-black shadow-sm">
              <span class="text-xl">{{ league.icon }}</span>
              <span>{{ league.name }}</span>
            </span>
        </div>

        <!-- Max Price Slider - Always visible if bundle exists -->
        <div v-if="bundleState.bundleToShow" class="mb-6">
          <label class="block text-base font-bold font-mono text-black mb-1 dark:text-white">
            Max Price: <span class="font-bold text-primary dark:text-accent-yellow">${{ displayPrice }}</span>
          </label>
          <input
            type="range"
            :min="5"
            :max="bundleState.optimalBundle ? Math.ceil(bundleState.optimalBundle.totalPrice) : 100"
            step="1"
            v-model="maxPrice"
            @input="handlePriceInput"
            class="w-full accent-primary border-2 border-black dark:border-primary dark:bg-[#232336] rounded-lg"
          />
        </div>

        <!-- Consolidated Status Message Area -->
        <div v-if="bundleState.bundleToShow && (bundleState.removedServices.length > 0 || bundleState.missingLeaguesBundle.length > 0 || bundleState.scenario === 'C' || bundleState.scenario === 'D')"
             class="max-w-2xl mx-auto p-4 my-4 border-2 rounded-lg"
             :class="{
               'bg-amber-50 border-amber-200 text-amber-800': bundleState.removedServices.length > 0 && !bundleState.missingLeaguesBundle.length,
               'bg-red-50 border-red-300 text-red-700': bundleState.missingLeaguesBundle.length > 0,
               'bg-amber-50 border-amber-200 text-amber-800': !bundleState.removedServices.length && !bundleState.missingLeaguesBundle.length && (bundleState.scenario === 'C' || bundleState.scenario === 'D')
             }">

          <!-- Status header with icon -->
          <div class="flex items-center gap-2 mb-2">
            <span v-if="bundleState.missingLeaguesBundle.length > 0" class="text-red-500 text-xl">⚠️</span>
            <span v-else-if="bundleState.removedServices.length > 0" class="text-amber-500 text-xl">ℹ️</span>
            <span v-else-if="bundleState.scenario === 'C' || bundleState.scenario === 'D'" class="text-amber-500 text-xl">💰</span>

            <h3 class="font-extrabold font-mono text-lg uppercase">
              <span v-if="bundleState.missingLeaguesBundle.length > 0">Missing Coverage</span>
              <span v-else-if="bundleState.removedServices.length > 0">Services Removed</span>
              <span v-else>Budget Alert</span>
            </h3>
          </div>

          <!-- Main message content -->
          <div class="space-y-3">
            <!-- Services removed message -->
            <p v-if="bundleState.removedServices.length > 0" class="font-mono font-bold">
              To fit your budget of ${{ maxPrice }}, we removed: {{ bundleState.removedServices.join(', ') }}.
              <span class="block text-sm mt-1">This affects the coverage of some leagues. See details below.</span>
            </p>

            <!-- Bundle over budget message -->
            <p v-if="bundleState.scenario === 'C' || bundleState.scenario === 'D' && !bundleState.removedServices.length">
              <span class="inline-block bg-accent-yellow text-black px-3 py-1 rounded-md border border-amber-400 font-bold font-mono text-sm mb-2">Bundle Over Budget</span>
              <span class="block">This is the best bundle we could find, but it costs <b>${{ bundleState.bundleToShow.totalNumericPrice.toFixed(2) }}</b> which is over your max price of <b>${{ maxPrice }}</b>. Try adjusting your budget or selections for a better match.</span>
            </p>

            <!-- Missing leagues message -->
            <div v-if="bundleState.missingLeaguesBundle.length > 0">
              <p class="font-mono font-bold mb-2">
                No bundle covers all your selected leagues. The following leagues are <b>not covered</b>:
              </p>
              <ul class="flex flex-wrap gap-2">
                <li v-for="league in bundleState.missingLeaguesBundle" :key="league.id"
                    class="flex items-center gap-1 px-2 py-1 rounded-md bg-white text-red-700 font-bold font-mono text-sm uppercase shadow-sm border border-red-200">
                  <span class="text-lg">{{ league.icon }}</span>
                  <span>{{ league.name }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>



        <!-- No Leagues Selected -->
        <div v-if="store.selectedLeagueIds.length === 0">
          <div class="max-w-2xl mx-auto bg-white border-4 border-black p-6 my-8 flex items-center justify-center dark:bg-[#181824] dark:border-primary rounded-lg">
              <p class="text-xl font-bold font-mono text-black text-center dark:text-white">
                Select one or more leagues and set your max price to see the best streaming bundle for you.
              </p>
            </div>
          </div>

        <!-- Bundle Results -->
        <div v-else-if="bundleState.bundleToShow">
          <!-- Bundle Card -->
          <BundleCard
            :item="bundleState.bundleToShow"
            :selectedLeagues="store.selectedLeagues"
            :maxPrice="maxPrice"
            class="rounded-lg"
          />
          </div>

        <!-- No Bundles Found -->
          <div v-else>
          <div class="max-w-2xl mx-auto bg-white border-4 border-black p-8 my-8 flex items-center justify-center dark:bg-[#181824] dark:border-primary rounded-lg">
                <p class="text-2xl font-extrabold font-mono text-red-700 text-center uppercase dark:text-accent-yellow">
              No bundles found for your selections.<br />
              Try selecting fewer leagues.
            </p>
          </div>
        </div>
      </div>

      <!-- Back to Selection Button -->
      <transition name="fade-slide">
        <button
          v-if="hasBuilt && !isLoading"
          @click="scrollToSelection"
          class="w-full relative px-4 py-4 border-b-4 border-black bg-white text-black font-extrabold font-mono text-lg shadow-none hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 uppercase tracking-widest dark:bg-black dark:text-white dark:border-primary text-center mt-2 mb-4 rounded-lg"
          style="z-index:10;"
        >
          CHANGE SELECTIONS ^
        </button>
      </transition>

      <footer class="text-center mt-12 text-sm text-slate-400">
        <p>&copy; {{ new Date().getFullYear() }} StreamFinder. All rights reserved.</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue';
import BundleCard from '@/components/BundleCard.vue';
import { useStreamingStoreWithPersistence } from '@/stores/streamingStore';

const store = useStreamingStoreWithPersistence();

// UI state
const maxPrice = ref(100); // Start with a high max price
const hasBuilt = ref(false);
const isLoading = ref(false);
const resultsRef = ref(null);
const selectionRef = ref(null);
const selectionCollapsed = ref(false);

// Bundle state - use separate objects for optimal and display bundle
const bundleState = ref({
  optimalBundle: null,
  bundleToShow: null,
  scenario: 'E',
  missingLeaguesBundle: [],
  removedServices: []
});

// Use a simple flag to track if we're in the initial build
const initialBuild = ref(true);

// Add a new reactive property for the displayed price
const displayPrice = ref(maxPrice.value);

// When selections change, reset build state
onMounted(() => {
  console.log('Component mounted');
});

// Reset build state when selections change
function resetBuildState() {
  hasBuilt.value = false;
  isLoading.value = false;
  selectionCollapsed.value = false;
  initialBuild.value = true;

  // Clear bundle state
  bundleState.value = {
    optimalBundle: null,
    bundleToShow: null,
    scenario: 'E',
    missingLeaguesBundle: [],
    removedServices: []
  };
}

// Watch for selection changes and reset build state
store.$subscribe(() => {
  if (hasBuilt.value) {
    resetBuildState();
  }
});

async function handleBuild() {
  if (isLoading.value) return;

  // Set loading state and force update
  isLoading.value = true;
  await nextTick();

  try {
    console.log('Building bundle for leagues:', store.selectedLeagueIds);

    // Short delay for visual feedback
    await new Promise(res => setTimeout(res, 500));

    // Get bundle from store
    const rawBundle = store.buildOptimalBundle(store.selectedLeagueIds);
    console.log('Raw bundle from store:', rawBundle);

    if (!rawBundle || !rawBundle.services) {
      console.error('No valid bundle returned from store');
      // Create placeholder bundle
      bundleState.value = {
        optimalBundle: null,
        bundleToShow: {
          id: 'empty_bundle',
          type: 'bundle',
          servicesInvolved: [],
          displayName: 'No Bundle Available',
          totalNumericPrice: 0,
          selectedLeaguesCoveredDetails: {},
          totalCoveredLeaguesCount: 0,
          totalCoveragePercentByLeague: {},
          overallCoveragePercent: 0,
          isUnderBudget: true,
          coversAll: false
        },
        scenario: 'E',
        missingLeaguesBundle: [],
        removedServices: []
      };
    } else {
      // Format bundle for UI - ensure all selected leagues are included
      const formattedBundle = {
        id: `bundle_${rawBundle.services.map(s => s.id).join('_')}`,
        type: 'bundle',
        servicesInvolved: [...rawBundle.services], // Clone to ensure reactivity
        displayName: rawBundle.services.length === 1 ?
          rawBundle.services[0].name :
          rawBundle.services.map(s => s.name).join(' + '),
        totalNumericPrice: rawBundle.totalPrice,
        selectedLeaguesCoveredDetails: {},
        totalCoveredLeaguesCount: Object.keys(rawBundle.coveredLeagues || {}).length,
        totalCoveragePercentByLeague: {...rawBundle.perLeagueCoverage},
        overallCoveragePercent: rawBundle.totalCoverage / store.selectedLeagueIds.length,
        isUnderBudget: true,
        coversAll: Object.keys(rawBundle.coveredLeagues || {}).length === store.selectedLeagueIds.length
      };

      // Include all selected leagues in the coverage details, even if with 0%
      store.selectedLeagues.forEach(league => {
        if (rawBundle.coveredLeagues && rawBundle.coveredLeagues[league.id]) {
          formattedBundle.selectedLeaguesCoveredDetails[league.id] = {...rawBundle.coveredLeagues[league.id]};
        } else {
          // Add league with 0% coverage
          formattedBundle.selectedLeaguesCoveredDetails[league.id] = {
            name: league.name,
            icon: league.icon,
            channels: [],
            coverage: "Not covered with current budget",
            coveragePercent: 0
          };
        }
      });

      console.log('Formatted bundle:', formattedBundle);

      // Update state - create new object to ensure reactivity
      bundleState.value = {
        optimalBundle: {...rawBundle},
        bundleToShow: formattedBundle,
        scenario: determineScenario(formattedBundle),
        missingLeaguesBundle: getMissingLeagues(formattedBundle),
        removedServices: []
      };

      // Set max price to bundle price only on initial build
      // Otherwise preserve user's existing max price preference
      if (initialBuild.value) {
        maxPrice.value = Math.ceil(rawBundle.totalPrice);
        displayPrice.value = maxPrice.value;
      } else {
        // If user's budget is higher than new bundle price, keep their setting
        // If it's lower, we need to adjust the bundle to fit their budget
        if (maxPrice.value < Math.ceil(rawBundle.totalPrice)) {
          // Try to adjust bundle for user's budget
          updateBundleForPrice(maxPrice.value);
        }
      }
    }
  } catch (error) {
    console.error('Error building bundle:', error);
  } finally {
    // Update UI state
    hasBuilt.value = true;
    isLoading.value = false;
    selectionCollapsed.value = true;
    initialBuild.value = false;

    // Force UI update and scroll
    await nextTick();
    await new Promise(res => setTimeout(res, 50)); // Small delay to ensure DOM update

  if (resultsRef.value) {
    resultsRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
}

function handlePriceInput(event) {
  if (!bundleState.value.optimalBundle || !bundleState.value.bundleToShow) {
    console.warn('Cannot adjust price: no bundle available');
    return;
  }

  // Update the displayed price immediately while dragging
  const newPrice = Number(event.target.value);
  displayPrice.value = newPrice;

  // Don't process bundle changes during the actual drag - just update display price
  // This prevents the flashing effect during dragging

  // For actual price changes, use a debounced function
  clearTimeout(handlePriceInput.debounceTimer);
  handlePriceInput.debounceTimer = setTimeout(() => {
    updateBundleForPrice(newPrice);
  }, 200); // Wait 200ms after sliding stops to update the bundle
}

// Store the timeout ID
handlePriceInput.debounceTimer = null;

function updateBundleForPrice(newPrice) {
  try {
    console.log('Price changed to:', newPrice);
    // Get current services before adjustment
    const currentServices = [...bundleState.value.bundleToShow.servicesInvolved];

    // If price increased to or above optimal, show full bundle
    if (newPrice >= (bundleState.value.optimalBundle?.totalPrice || 0)) {
      console.log('Price increased to optimal level, showing full bundle');

      const optBundle = bundleState.value.optimalBundle;
      const fullBundle = {
        id: `bundle_${optBundle.services.map(s => s.id).join('_')}`,
        type: 'bundle',
        servicesInvolved: [...optBundle.services],
        displayName: optBundle.services.length === 1 ?
          optBundle.services[0].name :
          optBundle.services.map(s => s.name).join(' + '),
        totalNumericPrice: optBundle.totalPrice,
        selectedLeaguesCoveredDetails: {},
        totalCoveragePercentByLeague: {...optBundle.perLeagueCoverage},
        overallCoveragePercent: optBundle.totalCoverage / store.selectedLeagueIds.length,
        isUnderBudget: true,
        coversAll: Object.keys(optBundle.coveredLeagues || {}).length === store.selectedLeagueIds.length
      };

      // Include all selected leagues in the coverage details
      store.selectedLeagues.forEach(league => {
        if (optBundle.coveredLeagues && optBundle.coveredLeagues[league.id]) {
          fullBundle.selectedLeaguesCoveredDetails[league.id] = {...optBundle.coveredLeagues[league.id]};
        } else {
          // Add league with 0% coverage
          fullBundle.selectedLeaguesCoveredDetails[league.id] = {
            name: league.name,
            icon: league.icon,
            channels: [],
            coverage: "Not covered with current budget",
            coveragePercent: 0
          };
        }
      });

      // Update bundle state with a new object to ensure reactivity
      bundleState.value = {
        ...bundleState.value,
        bundleToShow: fullBundle,
        removedServices: [],
        scenario: determineScenario(fullBundle),
        missingLeaguesBundle: getMissingLeagues(fullBundle)
      };

      return;
    }

    // Adjust bundle for new price
    const adjustedBundle = store.adjustBundleForBudget(bundleState.value.optimalBundle, newPrice);
    console.log('Adjusted bundle:', adjustedBundle);

    if (adjustedBundle && adjustedBundle.services && adjustedBundle.services.length > 0) {
      // Format adjusted bundle
      const formattedBundle = {
        id: `bundle_${adjustedBundle.services.map(s => s.id).join('_')}`,
        type: 'bundle',
        servicesInvolved: [...adjustedBundle.services],
        displayName: adjustedBundle.services.length === 1 ?
          adjustedBundle.services[0].name :
          adjustedBundle.services.map(s => s.name).join(' + '),
        totalNumericPrice: adjustedBundle.totalPrice,
        selectedLeaguesCoveredDetails: {},
        totalCoveragePercentByLeague: {...adjustedBundle.perLeagueCoverage},
        overallCoveragePercent: adjustedBundle.totalCoverage / store.selectedLeagueIds.length,
        isUnderBudget: true,
        coversAll: Object.keys(adjustedBundle.coveredLeagues || {}).length === store.selectedLeagueIds.length
      };

      // Include all selected leagues in the coverage details, even if with 0%
      store.selectedLeagues.forEach(league => {
        if (adjustedBundle.coveredLeagues && adjustedBundle.coveredLeagues[league.id]) {
          formattedBundle.selectedLeaguesCoveredDetails[league.id] = {...adjustedBundle.coveredLeagues[league.id]};
        } else {
          // Add league with 0% coverage
          formattedBundle.selectedLeaguesCoveredDetails[league.id] = {
            name: league.name,
            icon: league.icon,
            channels: [],
            coverage: "Not covered with current budget",
            coveragePercent: 0
          };
        }
      });

      // Find removed services
      const newServiceIds = adjustedBundle.services.map(s => s.id);
      const removedServiceNames = currentServices
        .filter(s => !newServiceIds.includes(s.id))
        .map(s => s.name);

      // Update bundle state with new object to ensure reactivity
      bundleState.value = {
        ...bundleState.value,
        bundleToShow: formattedBundle,
        removedServices: removedServiceNames,
        scenario: determineScenario(formattedBundle),
        missingLeaguesBundle: getMissingLeagues(formattedBundle)
      };
    } else {
      console.warn('Could not adjust bundle for price, keeping current bundle visible');

      // Keep current bundle but update removed services
      bundleState.value = {
        ...bundleState.value,
        removedServices: currentServices.map(s => s.name)
      };
    }
  } catch (error) {
    console.error('Error adjusting price:', error);
  }
}

function determineScenario(bundle) {
  if (!bundle) return 'E';

  // Count leagues with greater than 0% coverage
  const leaguesWithCoverage = Object.values(bundle.selectedLeaguesCoveredDetails || {})
    .filter(league => league.coveragePercent > 0)
    .length;

  const hasAllLeaguesCovered = leaguesWithCoverage === store.selectedLeagueIds.length;

  // Check if bundle price is over the user's current max price setting
  const isUnderBudget = bundle.totalNumericPrice <= maxPrice.value;

  // If bundle's price is significantly above the max price (not just rounding difference)
  // mark it as a budget alert case
  if (bundle.totalNumericPrice > maxPrice.value + 0.5) {
    // Budget alert scenarios
    return hasAllLeaguesCovered ? 'C' : 'D';
  }

  // Normal scenarios
  if (hasAllLeaguesCovered && isUnderBudget) return 'A';
  if (!hasAllLeaguesCovered && isUnderBudget) return 'B';
  if (hasAllLeaguesCovered && !isUnderBudget) return 'C';
  if (!hasAllLeaguesCovered && !isUnderBudget) return 'D';

  return 'E';
}

function getMissingLeagues(bundle) {
  if (!bundle || !bundle.selectedLeaguesCoveredDetails) return [];

  // Return leagues with 0% coverage
  return store.selectedLeagues.filter(league =>
    !bundle.selectedLeaguesCoveredDetails[league.id] ||
    bundle.selectedLeaguesCoveredDetails[league.id].coveragePercent === 0
  );
}

function scrollToSelection() {
  selectionCollapsed.value = false;
  if (selectionRef.value) {
    selectionRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
</script>

<style scoped>
.container {
  max-width: 100%;
}
@media (min-width: 640px) {
  .container {
    max-width: 900px;
  }
}
.fade-bounce-enter-active {
  animation: fade-bounce-in 0.7s cubic-bezier(0.4,0,0.2,1);
}
@keyframes fade-bounce-in {
  0% { opacity: 0; transform: scale(0.95) translateY(40px); }
  60% { opacity: 1; transform: scale(1.03) translateY(-8px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
.brutalist-progress {
  border-radius: 0;
}
</style>
