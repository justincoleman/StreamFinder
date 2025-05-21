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
        <button @click="selectionCollapsed = false" class="px-4 py-2 border-4 border-black bg-primary text-black font-extrabold font-mono uppercase tracking-widest hover:bg-black hover:text-white dark:bg-indigo-500 dark:text-white dark:border-primary rounded-none">
          Expand Selections
        </button>
      </div>

      <!-- Selection Controls -->
      <transition name="fade-slide">
        <section v-show="!selectionCollapsed" ref="selectionRef" class="bg-white border-4 border-black p-4 sm:p-6 mb-8 flex flex-col gap-6 mb-10 dark:bg-[#181824] dark:border-primary">
          <!-- League Selection -->
          <div>
            <h2 class="text-2xl font-bold font-mono text-primary mb-2 uppercase tracking-wider">Select Leagues:</h2>
            <div class="flex flex-wrap gap-2">
              <label v-for="league in allLeagues" :key="league.id"
                class="flex items-center gap-2 px-3 py-2 border-2 border-black bg-white cursor-pointer select-none hover:bg-primary/10 transition dark:bg-[#232336] dark:border-primary dark:hover:bg-primary/20"
                :class="{
                  'bg-primary text-black dark:bg-primary dark:text-black': selectedLeagueIds.includes(league.id),
                  'dark:bg-[#232336] dark:text-white': !selectedLeagueIds.includes(league.id)
                }"
              >
                <input type="checkbox" v-model="selectedLeagueIds" :value="league.id" class="accent-primary w-5 h-5 border-2 border-black dark:border-primary" />
                <span class="text-lg">{{ league.icon }}</span>
                <span class="text-base font-bold font-mono text-black dark:text-white"
                  :class="selectedLeagueIds.includes(league.id) ? 'text-black dark:text-black' : 'dark:text-white'"
                >{{ league.name }}</span>
              </label>
            </div>
          </div>
          <!-- Price Slider & Hard Cap -->
          <div class="flex flex-col sm:flex-row items-center gap-4">
            <div class="flex-1">
              <label class="block text-base font-bold font-mono text-black mb-1 dark:text-white">Max Price: <span class="font-bold text-primary dark:text-accent-yellow">${{ maxPrice }}</span></label>
              <input type="range" min="5" max="100" step="1" v-model="maxPrice" class="w-full accent-primary border-2 border-black dark:border-primary dark:bg-[#232336]" />
            </div>
            <label class="flex items-center gap-2 text-base font-bold font-mono text-black dark:text-white">
              <input type="checkbox" v-model="hardCap" class="accent-primary w-5 h-5 border-2 border-black dark:border-primary" />
              Hard cap (don't show bundles above max price)
            </label>
          </div>
          <div class="flex justify-center mt-6">
            <button
              @click="handleBuild"
              :disabled="selectedLeagueIds.length === 0 || isLoading"
              class="px-8 py-3 border-4 border-black bg-primary text-black font-extrabold font-mono text-xl uppercase tracking-widest transition disabled:opacity-40 disabled:cursor-not-allowed dark:bg-indigo-500 dark:text-white dark:border-primary"
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

      <!-- Recommendation Area -->
      <transition name="fade-bounce">
        <div v-if="hasBuilt && !isLoading" ref="resultsRef">
          <!-- Selections summary -->
          <div class="flex flex-wrap gap-2 justify-center mb-6">
            <span v-for="league in selectedLeaguesSummary" :key="league.id" class="flex items-center gap-1 px-3 py-2 border-2 border-black bg-white dark:bg-[#232336] dark:border-primary text-lg font-bold font-mono uppercase">
              <span class="text-xl">{{ league.icon }}</span>
              <span>{{ league.name }}</span>
            </span>
          </div>
          <div v-if="selectedLeagueIds.length === 0">
            <div class="max-w-2xl mx-auto bg-white border-4 border-black p-6 my-8 flex items-center justify-center dark:bg-[#181824] dark:border-primary">
              <p class="text-xl font-bold font-mono text-black text-center dark:text-white">
                Select one or more leagues and set your max price to see the best streaming bundle for you.
              </p>
            </div>
          </div>
          <div v-else-if="bestBundle">
            <BundleCard :item="bestBundle" :selectedLeagues="selectedLeagues" :maxPrice="maxPrice" />
          </div>
          <div v-else>
            <template v-if="anyLeagueHasZeroCoverage">
              <div class="max-w-2xl mx-auto bg-white border-4 border-black p-8 my-8 flex items-center justify-center dark:bg-[#181824] dark:border-primary">
                <p class="text-2xl font-extrabold font-mono text-red-700 text-center uppercase dark:text-accent-yellow">
                  No streaming service covers all your selected leagues.<br />
                  You may need a live TV service for full coverage.
                </p>
              </div>
            </template>
            <template v-else>
              <p class="text-lg text-orange-500 text-center">No bundle found that matches your price range.<br />Try increasing your max price or selecting fewer leagues.</p>
              <div v-if="closestBundle" class="mt-6">
                <div class="flex flex-col items-center mb-2">
                  <span class="inline-block bg-accent-yellow text-black dark:text-white px-4 py-1 border-2 border-black dark:border-white text-base font-bold font-mono uppercase tracking-wider mb-2">
                    Closest Bundle (Over Budget)
                  </span>
                  <span class="text-sm text-black dark:text-white font-mono text-center">This is the closest bundle we could find, but it is <b>over your max price</b>. Try adjusting your budget or selections for a better match.</span>
                </div>
                <BundleCard :item="closestBundle" :selectedLeagues="selectedLeagues" :maxPrice="maxPrice" />
              </div>
            </template>
          </div>
        </div>
      </transition>

      <!-- Fixed Back to Selection Button -->
      <transition name="fade-slide">
        <button
          v-if="hasBuilt && !isLoading"
          @click="scrollToSelection"
          class="w-full relative px-4 py-4 border-b-4 border-black bg-white text-black font-extrabold font-mono text-lg shadow-none hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 uppercase tracking-widest dark:bg-black dark:text-white dark:border-primary text-center mt-6 mb-4"
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
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import BundleCard from '@/components/BundleCard.vue';
import leaguesData from '@/data/leagues.json';
import streamingServicesData from '@/data/streamingServicesData.json';

const allLeagues = leaguesData.flatMap(cat => cat.leagues);
const selectedLeagueIds = ref([]);
const maxPrice = ref(20);
const hardCap = ref(false);

const hasBuilt = ref(false);
const isLoading = ref(false);
const resultsRef = ref(null);
const selectionRef = ref(null);
const selectionCollapsed = ref(false);

// When selections change after building, require rebuild
watch([selectedLeagueIds, maxPrice, hardCap], () => {
  hasBuilt.value = false;
  isLoading.value = false;
  selectionCollapsed.value = false;
});

async function handleBuild() {
  isLoading.value = true;
  // Simulate loading animation
  await new Promise(res => setTimeout(res, 1200));
  isLoading.value = false;
  hasBuilt.value = true;
  selectionCollapsed.value = true;
  // Animate scroll to results
  await nextTick();
  if (resultsRef.value) {
    resultsRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function scrollToSelection() {
  if (selectionRef.value) {
    selectionCollapsed.value = false;
    selectionRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Persist league selections to localStorage
const LEAGUE_KEY = 'streamfinder-leagues';

onMounted(() => {
  const saved = localStorage.getItem(LEAGUE_KEY);
  if (saved) {
    try {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr)) selectedLeagueIds.value = arr;
    } catch {
      // Ignore JSON parse errors
    }
  }
});

watch(selectedLeagueIds, (val) => {
  localStorage.setItem(LEAGUE_KEY, JSON.stringify(val));
}, { deep: true });

function getBestGreedyBundle() {
  const services = streamingServicesData;
  const leaguesToCover = new Set(selectedLeagueIds.value);
  const selectedServices = [];
  let totalPrice = 0;
  let perLeagueCoverage = {};
  let coveredLeagues = {};
  let totalCoveragePercent = 0;
  let budget = hardCap.value ? maxPrice.value : maxPrice.value + 5;

  // Track which leagues are already fully covered
  const leagueCoverageSoFar = {};
  selectedLeagueIds.value.forEach(id => { leagueCoverageSoFar[id] = 0; });

  while (leaguesToCover.size > 0 && totalPrice < budget) {
    // Find the service that provides the most additional coverage per dollar
    let bestService = null;
    let bestValue = 0;
    let bestServiceCoverage = {};
    for (const service of services) {
      if (selectedServices.includes(service)) continue;
      let addedCoverage = 0;
      let serviceCoverage = {};
      for (const leagueId of leaguesToCover) {
        const league = service.leagues && service.leagues[leagueId];
        if (league && league.coveragePercent && leagueCoverageSoFar[leagueId] < 100) {
          const additional = Math.max(0, Math.min(league.coveragePercent, 100 - leagueCoverageSoFar[leagueId]));
          addedCoverage += additional;
          serviceCoverage[leagueId] = additional;
        }
      }
      const price = parseFloat((service.price || '').replace(/[^\d.]/g, '')) || 0;
      if (price > 0 && addedCoverage > 0) {
        const value = addedCoverage / price;
        if (value > bestValue) {
          bestValue = value;
          bestService = service;
          bestServiceCoverage = serviceCoverage;
        }
      }
    }
    if (!bestService) break; // No more useful services
    selectedServices.push(bestService);
    totalPrice += parseFloat((bestService.price || '').replace(/[^\d.]/g, '')) || 0;
    // Update league coverage so far
    for (const leagueId of Object.keys(bestServiceCoverage)) {
      leagueCoverageSoFar[leagueId] += bestServiceCoverage[leagueId];
      leagueCoverageSoFar[leagueId] = Math.min(leagueCoverageSoFar[leagueId], 100);
      if (leagueCoverageSoFar[leagueId] >= 100) {
        leaguesToCover.delete(leagueId);
      }
    }
  }

  // Build per-league and overall coverage
  perLeagueCoverage = {};
  coveredLeagues = {};
  let coveredCount = 0;
  selectedLeagueIds.value.forEach(id => {
    perLeagueCoverage[id] = leagueCoverageSoFar[id] || 0;
    if (perLeagueCoverage[id] > 0) {
      // Find the first service that covers this league for description/channels
      let leagueCoverageDesc = '';
      let leagueChannels = [];
      for (const service of selectedServices) {
        const league = service.leagues && service.leagues[id];
        if (league && league.coveragePercent) {
          if (!leagueCoverageDesc && league.coverage) leagueCoverageDesc = league.coverage;
          leagueChannels = leagueChannels.concat((league.channels || []).map(ch => `${ch} (on ${service.name})`));
        }
      }
      coveredLeagues[id] = {
        name: allLeagues.find(l => l.id === id)?.name || id,
        icon: allLeagues.find(l => l.id === id)?.icon || '?',
        channels: leagueChannels,
        coverage: leagueCoverageDesc,
        coveragePercent: perLeagueCoverage[id]
      };
      coveredCount++;
    }
  });
  totalCoveragePercent = selectedLeagueIds.value.length > 0
    ? selectedLeagueIds.value.reduce((sum, id) => sum + (perLeagueCoverage[id] || 0), 0) / selectedLeagueIds.value.length
    : 0;

  if (
    coveredCount > 0 &&
    Object.values(perLeagueCoverage).every(v => v > 0) &&
    totalPrice <= budget
  ) {
    return [{
      id: `bundle_${selectedServices.map(s => s.id).join('_')}`,
      type: 'bundle',
      servicesInvolved: selectedServices,
      displayName: selectedServices.length === 1 ? selectedServices[0].name : selectedServices.map(s => s.name).join(' + '),
      totalNumericPrice: totalPrice,
      selectedLeaguesCoveredDetails: coveredLeagues,
      totalCoveredLeaguesCount: coveredCount,
      totalCoveragePercentByLeague: perLeagueCoverage,
      overallCoveragePercent: totalCoveragePercent
    }];
  }
  return [];
}

const allBundles = computed(() => getBestGreedyBundle());

const filteredBundles = computed(() => {
  // Only show bundles that cover at least one selected league
  return allBundles.value.filter(bundle => bundle.totalCoveredLeaguesCount > 0);
});

const priceCap = computed(() => hardCap.value ? maxPrice.value : maxPrice.value + 5);
const inBudgetBundles = computed(() => filteredBundles.value.filter(bundle => bundle.totalNumericPrice <= priceCap.value));
const outOfBudgetBundles = computed(() => filteredBundles.value.filter(bundle => bundle.totalNumericPrice > priceCap.value));

const bestBundle = computed(() => {
  if (inBudgetBundles.value.length === 0) return null;
  let candidates = [...inBudgetBundles.value];
  candidates.sort((a, b) => {
    if ((b.overallCoveragePercent || 0) !== (a.overallCoveragePercent || 0)) {
      return (b.overallCoveragePercent || 0) - (a.overallCoveragePercent || 0);
    }
    return a.totalNumericPrice - b.totalNumericPrice;
  });
  const best = candidates[0];
  if (best) {
    best.badge = 'Top Coverage';
  }
  return best;
});

const closestBundle = computed(() => {
  if (inBudgetBundles.value.length > 0) return null;
  if (outOfBudgetBundles.value.length === 0) return null;
  let sorted = [...outOfBudgetBundles.value].sort((a, b) => {
    if ((b.overallCoveragePercent || 0) !== (a.overallCoveragePercent || 0)) {
      return (b.overallCoveragePercent || 0) - (a.overallCoveragePercent || 0);
    }
    return a.totalNumericPrice - b.totalNumericPrice;
  });
  const closest = sorted[0];
  if (closest) {
    closest.badge = 'Closest Match';
  }
  return closest;
});

const selectedLeagues = computed(() =>
  allLeagues.filter(l => selectedLeagueIds.value.includes(l.id))
);

const selectedLeaguesSummary = computed(() =>
  allLeagues.filter(l => selectedLeagueIds.value.includes(l.id))
);

const anyLeagueHasZeroCoverage = computed(() => {
  // For each selected league, check if any service or bundle covers it at all
  if (!selectedLeagues.value.length) return false;
  return selectedLeagues.value.some(league => {
    // Check all services and bundles
    const hasCoverage = allBundles.value.some(item => {
      if (!item.selectedLeaguesCoveredDetails) return false;
      const details = item.selectedLeaguesCoveredDetails[league.id];
      return details && details.coveragePercent > 0;
    });
    return !hasCoverage;
  });
});
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
