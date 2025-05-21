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
              <label v-for="league in allLeagues" :key="league.id"
                class="flex items-center gap-2 px-3 py-2 border-2 border-black bg-white cursor-pointer select-none hover:bg-primary/10 transition dark:bg-[#232336] dark:border-primary dark:hover:bg-primary/20 rounded-lg"
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
              <input type="range" min="5" max="100" step="1" v-model="maxPrice" class="w-full accent-primary border-2 border-black dark:border-primary dark:bg-[#232336] rounded-lg" />
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

      <!-- Recommendation Area -->
      <transition name="fade-bounce">
        <div v-if="hasBuilt && !isLoading" ref="resultsRef">
          <!-- Selections summary -->
          <div class="flex flex-wrap gap-2 justify-center mb-6">
            <span v-for="league in selectedLeaguesSummary" :key="league.id" class="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 border border-slate-300 text-base font-bold font-mono uppercase text-black shadow-sm">
              <span class="text-xl">{{ league.icon }}</span>
              <span>{{ league.name }}</span>
            </span>
          </div>
          <div v-if="selectedLeagueIds.length === 0">
            <div class="max-w-2xl mx-auto bg-white border-4 border-black p-6 my-8 flex items-center justify-center dark:bg-[#181824] dark:border-primary rounded-lg">
              <p class="text-xl font-bold font-mono text-black text-center dark:text-white">
                Select one or more leagues and set your max price to see the best streaming bundle for you.
              </p>
            </div>
          </div>
          <div v-else-if="bundleToShow">
            <div v-if="scenario === 'B' || scenario === 'D'" class="max-w-2xl mx-auto bg-red-600 text-white p-8 my-8 flex flex-col items-center justify-center rounded-lg shadow-lg">
              <p class="text-xl font-extrabold font-mono text-white text-center uppercase mb-2">
                No bundle covers all your selected leagues.<br />
                The following leagues are <b>not covered</b>:
              </p>
              <ul class="flex flex-wrap gap-2 justify-center mt-2">
                <li v-for="league in missingLeaguesBundle" :key="league.id" class="flex items-center gap-1 px-3 py-2 rounded-lg bg-white text-red-700 font-bold font-mono text-lg uppercase shadow">
                  <span class="text-xl">{{ league.icon }}</span>
                  <span>{{ league.name }}</span>
                </li>
              </ul>
            </div>
            <div v-if="scenario === 'C' || scenario === 'D'" class="flex flex-col items-center mb-2">
              <span class="inline-block bg-accent-yellow text-black dark:text-white px-4 py-1 border-2 border-black dark:border-white text-base font-bold font-mono uppercase tracking-wider mb-2">
                Bundle Over Budget
              </span>
              <span class="text-sm text-black dark:text-white font-mono text-center">This is the best bundle we could find, but it is <b>over your max price</b>. Try adjusting your budget or selections for a better match.</span>
            </div>
            <BundleCard :item="bundleToShow" :selectedLeagues="selectedLeagues" :maxPrice="maxPrice" class="rounded-lg" />
          </div>
          <div v-else>
            <div class="max-w-2xl mx-auto bg-white border-4 border-black p-8 my-8 flex items-center justify-center dark:bg-[#181824] dark:border-primary rounded-lg">
              <p class="text-2xl font-extrabold font-mono text-red-700 text-center uppercase dark:text-accent-yellow">
                No bundles found for your selections.<br />
                Try selecting fewer leagues.
              </p>
            </div>
          </div>
        </div>
      </transition>

      <!-- Fixed Back to Selection Button -->
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
  const selected = selectedLeagueIds.value;
  if (!selected.length) return [];
  const budget = hardCap.value ? maxPrice.value : maxPrice.value + 5;

  // Generate all possible non-empty combinations of services
  function getAllCombinations(arr) {
    const results = [];
    const n = arr.length;
    for (let i = 1; i < (1 << n); i++) {
      const combo = [];
      for (let j = 0; j < n; j++) {
        if (i & (1 << j)) combo.push(arr[j]);
      }
      results.push(combo);
    }
    return results;
  }

  const allCombos = getAllCombinations(services);
  const allLeagues = leaguesData.flatMap(cat => cat.leagues);
  const bundles = allCombos.map(combo => {
    let totalPrice = combo.reduce((sum, s) => sum + (parseFloat((s.price || '').replace(/[^\d.]/g, '')) || 0), 0);
    let coveredLeagues = {};
    let perLeagueCoverage = {};
    let coveredCount = 0;
    selected.forEach(id => {
      let bestCoverage = 0;
      let leagueCoverageDesc = '';
      let leagueChannels = [];
      combo.forEach(service => {
        const league = service.leagues && service.leagues[id];
        if (league && league.coveragePercent) {
          if (league.coveragePercent > bestCoverage) {
            bestCoverage = league.coveragePercent;
            leagueCoverageDesc = league.coverage;
          }
          leagueChannels = leagueChannels.concat((league.channels || []).map(ch => `${ch} (on ${service.name})`));
        }
      });
      if (bestCoverage > 0) {
        coveredLeagues[id] = {
          name: allLeagues.find(l => l.id === id)?.name || id,
          icon: allLeagues.find(l => l.id === id)?.icon || '?',
          channels: leagueChannels,
          coverage: leagueCoverageDesc,
          coveragePercent: bestCoverage
        };
        coveredCount++;
      }
      perLeagueCoverage[id] = bestCoverage;
    });
    const totalCoveragePercent = selected.length > 0
      ? selected.reduce((sum, id) => sum + (perLeagueCoverage[id] || 0), 0) / selected.length
      : 0;
    return {
      id: `bundle_${combo.map(s => s.id).join('_')}`,
      type: 'bundle',
      servicesInvolved: combo,
      displayName: combo.length === 1 ? combo[0].name : combo.map(s => s.name).join(' + '),
      totalNumericPrice: totalPrice,
      selectedLeaguesCoveredDetails: coveredLeagues,
      totalCoveredLeaguesCount: coveredCount,
      totalCoveragePercentByLeague: perLeagueCoverage,
      overallCoveragePercent: totalCoveragePercent,
      isUnderBudget: totalPrice <= budget,
      coversAll: coveredCount === selected.length
    };
  }).filter(b => b.totalCoveredLeaguesCount > 0);

  // Sort bundles: most leagues covered, then under budget, then price, then coverage percent
  bundles.sort((a, b) => {
    if (b.totalCoveredLeaguesCount !== a.totalCoveredLeaguesCount) return b.totalCoveredLeaguesCount - a.totalCoveredLeaguesCount;
    if (a.isUnderBudget !== b.isUnderBudget) return b.isUnderBudget - a.isUnderBudget;
    if (a.totalNumericPrice !== b.totalNumericPrice) return a.totalNumericPrice - b.totalNumericPrice;
    return (b.overallCoveragePercent || 0) - (a.overallCoveragePercent || 0);
  });

  // Find best for each scenario
  const bestAllUnder = bundles.find(b => b.coversAll && b.isUnderBudget);
  const bestPartialUnder = bundles.find(b => !b.coversAll && b.isUnderBudget);
  const bestAllOver = bundles.find(b => b.coversAll && !b.isUnderBudget);
  const bestPartialOver = bundles.find(b => !b.coversAll && !b.isUnderBudget);

  // Return all for UI to pick
  return [bestAllUnder, bestPartialUnder, bestAllOver, bestPartialOver].filter(Boolean);
}

const allBundles = computed(() => getBestGreedyBundle());

// Pick the best bundle for each scenario
const bestAllUnder = computed(() => allBundles.value.find(b => b.coversAll && b.isUnderBudget));
const bestPartialUnder = computed(() => allBundles.value.find(b => !b.coversAll && b.isUnderBudget));
const bestAllOver = computed(() => allBundles.value.find(b => b.coversAll && !b.isUnderBudget));
const bestPartialOver = computed(() => allBundles.value.find(b => !b.coversAll && !b.isUnderBudget));

// For UI: which scenario are we in?
const scenario = computed(() => {
  if (bestAllUnder.value) return 'A';
  if (bestPartialUnder.value) return 'B';
  if (bestAllOver.value) return 'C';
  if (bestPartialOver.value) return 'D';
  return 'E';
});

const bundleToShow = computed(() => {
  if (scenario.value === 'A') return bestAllUnder.value;
  if (scenario.value === 'B') return bestPartialUnder.value;
  if (scenario.value === 'C') return bestAllOver.value;
  if (scenario.value === 'D') return bestPartialOver.value;
  return null;
});

const missingLeaguesBundle = computed(() => {
  if (!bundleToShow.value) return [];
  const covered = Object.keys(bundleToShow.value.selectedLeaguesCoveredDetails || {});
  return allLeagues.filter(l => selectedLeagueIds.value.includes(l.id) && !covered.includes(l.id));
});

const selectedLeagues = computed(() =>
  allLeagues.filter(l => selectedLeagueIds.value.includes(l.id))
);

const selectedLeaguesSummary = computed(() =>
  allLeagues.filter(l => selectedLeagueIds.value.includes(l.id))
);
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
