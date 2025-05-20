<template>
  <div class="min-h-screen bg-gradient-to-br from-white via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <div class="container mx-auto p-4 sm:p-6 max-w-full sm:max-w-2xl">
      <header class="mb-8 text-center">
        <h1 class="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2">StreamFinder</h1>
        <p class="text-base sm:text-lg text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
          Find the best streaming bundle for your favorite sports leagues—instantly.
        </p>
      </header>

      <!-- Selection Controls -->
      <section class="bg-white/80 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-lg p-4 sm:p-6 mb-8 flex flex-col gap-6 mb-10">
        <!-- League Selection -->
        <div>
          <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Select Leagues:</h2>
          <div class="flex flex-wrap gap-2">
            <label v-for="league in allLeagues" :key="league.id" class="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 cursor-pointer select-none hover:bg-blue-50 dark:hover:bg-blue-900/30 transition">
              <input type="checkbox" v-model="selectedLeagueIds" :value="league.id" class="accent-blue-600 w-4 h-4" />
              <span class="text-lg">{{ league.icon }}</span>
              <span class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ league.name }}</span>
            </label>
          </div>
        </div>
        <!-- Price Slider & Hard Cap -->
        <div class="flex flex-col sm:flex-row items-center gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Max Price: <span class="font-bold text-blue-600 dark:text-blue-300">${{ maxPrice }}</span></label>
            <input type="range" min="5" max="100" step="1" v-model="maxPrice" class="w-full accent-blue-600" />
          </div>
          <label class="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <input type="checkbox" v-model="hardCap" class="accent-blue-600 w-4 h-4" />
            Hard cap (don't show bundles above max price)
          </label>
        </div>
      </section>

      <!-- Recommendation Area -->
      <div v-if="selectedLeagueIds.length === 0">
        <div class="max-w-2xl mx-auto bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-lg p-6 my-8 flex items-center justify-center">
          <p class="text-lg text-slate-600 dark:text-slate-300 text-center font-medium">
            Select one or more leagues and set your max price to see the best streaming bundle for you.
          </p>
        </div>
      </div>
      <div v-else-if="bestBundle">
        <BundleCard :item="bestBundle" :selectedLeagues="selectedLeagues" :maxPrice="maxPrice" />
      </div>
      <div v-else>
        <template v-if="anyLeagueHasZeroCoverage">
          <div class="max-w-2xl mx-auto bg-orange-50 border border-orange-200 rounded-2xl shadow-lg p-6 my-8 flex items-center justify-center">
            <p class="text-lg text-orange-700 text-center font-semibold">
              No streaming service covers all your selected leagues.<br />
              You may need a live TV service for full coverage.
            </p>
          </div>
        </template>
        <template v-else>
          <p class="text-lg text-orange-500 text-center">No bundle found that matches your criteria.<br />Try increasing your max price or selecting fewer leagues.</p>
          <div v-if="closestBundle" class="mt-6">
            <div class="flex justify-center mb-2">
              <span class="inline-block bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-4 py-1 rounded-full text-base font-semibold shadow-sm border border-orange-200 dark:border-orange-400/50">
                Closest Match
              </span>
            </div>
            <BundleCard :item="closestBundle" :selectedLeagues="selectedLeagues" :maxPrice="maxPrice" />
          </div>
        </template>
      </div>

      <footer class="text-center mt-12 text-sm text-slate-400">
        <p>&copy; {{ new Date().getFullYear() }} StreamFinder. All rights reserved.</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BundleCard from '@/components/BundleCard.vue';
import { useTheme } from '@/composables/useTheme';
import leaguesData from '@/data/leagues.json';
import streamingServicesData from '@/data/streamingServicesData.json';

const allLeagues = leaguesData.flatMap(cat => cat.leagues);
const selectedLeagueIds = ref([]);
const maxPrice = ref(20);
const hardCap = ref(false);

function getBestGreedyBundle() {
  const services = streamingServicesData;
  const leaguesToCover = new Set(selectedLeagueIds.value);
  const selectedServices = [];
  let totalPrice = 0;
  let perLeagueCoverage = {};
  let coveredLeagues = {};
  let totalCoveragePercent = 0;
  let budget = maxPrice.value + 5;

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

  if (coveredCount > 0 && Object.values(perLeagueCoverage).every(v => v > 0)) {
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

const bestBundle = computed(() => {
  let candidates = filteredBundles.value.filter(bundle => {
    if (hardCap.value) {
      return bundle.totalNumericPrice <= maxPrice.value;
    } else {
      return bundle.totalNumericPrice <= maxPrice.value + 5;
    }
  });
  if (candidates.length === 0) return null;
  // Sort by overall coverage percent, then price
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
  if (filteredBundles.value.length === 0) return null;
  let sorted = [...filteredBundles.value].sort((a, b) => {
    if ((b.overallCoveragePercent || 0) !== (a.overallCoveragePercent || 0)) {
      return (b.overallCoveragePercent || 0) - (a.overallCoveragePercent || 0);
    }
    return a.totalNumericPrice - b.totalNumericPrice;
  });
  const closest = sorted[0];
  if (closest) {
    closest.badge = 'Best Value';
  }
  return closest;
});

const selectedLeagues = computed(() =>
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

useTheme();
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
</style>
