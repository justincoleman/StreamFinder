<template>
  <article
    class="shadow-none p-4 md:p-6 mb-6 border-4 border-indigo-500 bg-white flex flex-col gap-3 relative text-base dark:bg-[#181824] dark:border-indigo-500"
    :class="{}"
  >
    <!-- Badge -->
    <div v-if="item.badge" class="absolute -top-6 right-4">
      <span v-if="item.badge === 'Best Value'"
        class="bundle-badge bundle-badge-best inline-block px-6 py-2 border-4 border-indigo-white bg-accent-yellow bg-indigo-500 text-white font-extrabold font-mono text-lg uppercase tracking-widest dark:bg-indigo-500 dark:text-white dark:border-white">
        {{ item.badge }}
      </span>
      <span v-else
        class="bundle-badge bundle-badge-main inline-block px-6 py-2 border-4 border-primary bg-primary text-white font-extrabold font-mono text-lg uppercase tracking-widest">
        {{ item.badge }}
      </span>
    </div>

    <!-- Bundle Heading -->
    <div class="flex flex-row items-start justify-between mb-2">
      <div class="flex flex-col gap-1">
        <div class="flex flex-row items-center gap-6">
          <h3 class="text-4xl md:text-5xl font-extrabold font-mono text-black uppercase tracking-widest dark:text-white">
            <template v-if="item.servicesInvolved.length > 1">Recommended Bundle</template>
            <template v-else>{{ item.servicesInvolved[0]?.name || item.displayName }}</template>
          </h3>
          <span class="text-4xl md:text-5xl font-extrabold text-primary ml-2 dark:text-accent-yellow">${{ item.totalNumericPrice?.toFixed(2) }}</span>
          <span class="text-xs font-mono text-black ml-1 dark:text-white">/mo</span>
        </div>
        <div v-if="leaguesToShow.length > 0" class="flex items-center gap-2 flex-wrap mt-1">
          <span v-for="league in leaguesToShow" :key="league.id" class="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-black dark:text-white text-base font-medium border-2 border-black">
            <span class="text-xl">{{ league.icon }}</span>
            <span class="text-sm">{{ league.name }}</span>
          </span>
        </div>
        <div v-if="whyThisBundle" class="flex items-center gap-2 mb-1 mt-1 ">
          <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span class="text-base text-black dark:text-blue-300 font-mono font-bold">{{ whyThisBundle }}</span>
        </div>
      </div>
    </div>

    <!-- Coverage by League Heading -->
    <div v-if="leaguesWithCoverage.length > 0" class="mt-2 mb-1">
      <h4 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Coverage by League</h4>
    </div>

    <!-- Per-League Coverage (for all selected leagues) -->
    <div v-if="leaguesWithCoverage.length > 0" class="mt-2 mb-1 space-y-3">
      <div v-for="league in leaguesWithCoverage" :key="league.id">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-lg font-extrabold font-mono text-black uppercase dark:text-white">{{ league.name }} Coverage:</span>
          <span class="text-base font-extrabold text-primary">
            {{ league.id === 'nfl' && getNflCoverageCapped < (item.selectedLeaguesCoveredDetails[league.id].coveragePercent || 0)
              ? getNflCoverageCapped
              : item.selectedLeaguesCoveredDetails[league.id].coveragePercent || 0 }}%
          </span>
        </div>
        <div class="w-full h-6 border-4 border-primary bg-white mb-1 overflow-hidden dark:bg-[#10101a] dark:border-indigo-400">
          <div
            class="h-full bg-black transition-all duration-700 dark:bg-indigo-500"
            :style="{ width: (animatedCoverage[league.id] > 0 ? animatedCoverage[league.id] : 0) + '%' }"
          ></div>
        </div>
        <div v-if="getAggregatedCoverageNotes(league.id).length" class="mb-1">
          <button @click="toggleLeagueInfo(league.id)" class="text-xs text-blue-600 dark:text-blue-300 underline hover:no-underline focus:outline-none">
            {{ expandedLeagues[league.id] ? 'Hide Info' : 'More Info' }}
          </button>
          <transition name="fade-slide">
            <div v-show="expandedLeagues[league.id]" class="mt-1 text-sm text-slate-600 dark:text-slate-300">
              <ul class="list-disc ml-5">
                <li v-for="note in getAggregatedCoverageNotes(league.id)" :key="note">{{ note }}</li>
              </ul>
            </div>
          </transition>
        </div>
        <div v-if="league.id === 'nfl' && getNflCoverageCapped >= 80" class="mt-2 text-sm text-amber-600 dark:text-amber-400">
          <span class="inline-flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Warning: This bundle does NOT provide 100% live NFL coverage. You will miss FOX Sunday games and out-of-market games.
          </span>
        </div>
        <div v-if="(item.selectedLeaguesCoveredDetails[league.id].coveragePercent || 0) < 100" class="mt-1 text-xs text-orange-600 dark:text-orange-400">
          <span v-if="showBudgetMessage">Your budget does not allow for full {{ league.name }} coverage. </span>
          <span v-if="league.id === 'nfl'">Due to US broadcast rights and blackout rules, 100% live NFL coverage is not possible, even with all available services.</span>
        </div>
      </div>
    </div>

    <!-- Services Included as Links -->
    <div class="flex items-center gap-2 flex-wrap mt-1">
      <span class="text-base font-bold font-mono text-black dark:text-white">Services:</span>
      <template v-for="service in item.servicesInvolved" :key="service.id">
        <span class="font-extrabold font-mono text-lg uppercase border-b-4 border-black dark:border-white pb-1 mr-4 service-btn">{{ service.name }}</span>
      </template>
    </div>

    <!-- Details Section (only if there are details) -->
    <div v-if="hasDetails" class="mt-2">
      <button @click="detailsOpen = !detailsOpen"
              class="inline-flex items-center gap-2 px-4 py-2 border-4 border-black bg-white text-black font-extrabold font-mono text-base shadow-none hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 mt-4 uppercase tracking-widest dark:bg-black dark:text-white dark:border-primary"
              :aria-expanded="detailsOpen"
              aria-controls="bundle-details">
        <svg v-if="!detailsOpen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
        <span>{{ detailsOpen ? 'Hide Details' : 'Show Details' }}</span>
      </button>
      <transition name="fade-slide">
        <div v-show="detailsOpen" id="bundle-details" class="mt-2">
          <!-- Brutalist Coverage Table: Services as rows, Leagues as columns, checkmark if covered -->
          <div class="overflow-x-auto">
            <table class="min-w-full border-4 border-black dark:border-white bg-white dark:bg-black text-base font-mono brutalist-table">
              <thead>
                <tr>
                  <th class="p-4 font-extrabold text-left border-4 border-black dark:border-indigo-500 uppercase">Service</th>
                  <th v-for="league in leaguesToShow" :key="league.id" class="p-4 font-extrabold text-center border-4 border-black dark:border-indigo-500 uppercase">
                    <span class="flex flex-col items-center">
                      <span class="text-2xl">{{ league.icon }}</span>
                      <span class="text-xs mt-1">{{ league.name }}</span>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="service in item.servicesInvolved" :key="service.id">
                  <td class="p-4 font-extrabold border-4 border-black dark:border-indigo-500 uppercase">{{ service.name }}</td>
                  <td v-for="league in leaguesToShow" :key="service.id + '-' + league.id" class="p-4 text-center font-extrabold border-4 border-black dark:border-indigo-500">
                    <span v-if="service.leagues && service.leagues[league.id] && service.leagues[league.id].coveragePercent > 0" class="inline-flex items-center justify-center text-3xl">
                      ✓
                    </span>
                    <span v-else class="inline-block w-8 h-8 text-2xl">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </transition>
    </div>
  </article>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';

const props = defineProps({
  item: { type: Object, required: true },
  selectedLeagues: { type: Array, required: true },
  maxPrice: { type: Number, required: false, default: 999 }
});

const detailsOpen = ref(false);

// Leagues actually covered by this bundle
const leaguesToShow = computed(() => {
  // Only show leagues that are both selected and actually covered by the service
  return props.selectedLeagues.filter(l => props.item.selectedLeaguesCoveredDetails && props.item.selectedLeaguesCoveredDetails[l.id]);
});

const hasDetails = computed(() => {
  return props.item.servicesInvolved.length > 1 || leaguesToShow.value.length > 1;
});

// Why This Bundle logic
const whyThisBundle = computed(() => {
  if (props.item.badge === 'Top Coverage') {
    if (props.item.totalCoveredLeaguesCount === props.selectedLeagues.length) {
      return 'Covers all your selected leagues in one bundle at the best price.';
    }
    return 'Covers the most leagues for your selection.';
  }
  if (props.item.badge === 'Best Value') {
    return 'Best value for your current subscriptions and selected leagues.';
  }
  if (props.item.potentialSavings > 0) {
    return `Save $${props.item.potentialSavings.toFixed(2)}/mo compared to individual subscriptions.`;
  }
  return 'Recommended based on your selections.';
});

// NFL Budget logic
const showBudgetMessage = computed(() => {
  // Only show if NFL is selected and coverage is less than 100%
  if (!props.selectedLeagues.some(l => l.id === 'nfl')) return false;
  if ((props.item.totalCoveragePercentByLeague?.nfl || 0) >= 100) return false;
  // Only show if user budget is less than the price of this bundle
  return props.maxPrice < props.item.totalNumericPrice;
});

const leaguesWithCoverage = computed(() => {
  return props.selectedLeagues.filter(l => props.item.selectedLeaguesCoveredDetails && props.item.selectedLeaguesCoveredDetails[l.id]);
});

const getNflCoverageCapped = computed(() => {
  // Cap NFL coverage at 80% for display purposes
  const nfl = props.item.selectedLeaguesCoveredDetails?.nfl;
  if (!nfl) return 0;
  return Math.min(nfl.coveragePercent || 0, 80);
});

// Aggregated coverage notes for each league from all services in the bundle
const getAggregatedCoverageNotes = (leagueId) => {
  if (!props.item.servicesInvolved) return [];
  return props.item.servicesInvolved
    .filter(service => service.leagues && service.leagues[leagueId] && service.leagues[leagueId].coveragePercent > 0)
    .map(service => {
      const c = service.leagues[leagueId];
      return `${service.name}: ${c.coverage || ''}`.trim();
    })
    .filter(Boolean);
};

// Track expanded state for each league's More Info
const expandedLeagues = ref({});
const toggleLeagueInfo = (leagueId) => {
  expandedLeagues.value[leagueId] = !expandedLeagues.value[leagueId];
};

// For animating the progress bars
const animatedCoverage = ref({});
const prevCoverage = ref({});
let debounceTimeout = null;
function animateCoverage() {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    leaguesWithCoverage.value.forEach(league => {
      const newVal = league.id === 'nfl' && getNflCoverageCapped.value < (props.item.selectedLeaguesCoveredDetails[league.id].coveragePercent || 0)
        ? getNflCoverageCapped.value
        : props.item.selectedLeaguesCoveredDetails[league.id].coveragePercent || 0;
      if (prevCoverage.value[league.id] !== newVal) {
        animatedCoverage.value[league.id] = 0;
        nextTick(() => {
          setTimeout(() => {
            animatedCoverage.value[league.id] = newVal;
            prevCoverage.value[league.id] = newVal;
          }, 100);
        });
      }
    });
  }, 200); // Only animate after 200ms of no changes
}
onMounted(animateCoverage);
watch(leaguesWithCoverage, animateCoverage);
</script>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.3s, max-height 0.3s;
  max-height: 500px;
  overflow: hidden;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  max-height: 0;
}
.brutalist-table th,
.brutalist-table td {
  border-width: 4px !important;
  /* border-color: #000 !important; */
  font-family: 'IBM Plex Mono', 'Menlo', 'Monaco', 'Consolas', monospace;
  text-transform: uppercase;
  font-weight: 800;
  /* background: #fff;
  color: #000; */
}
.dark .brutalist-table th,
.dark .brutalist-table td {
  /* background: #000 !important;
  color: #fff !important; */
  /* border-color: var(--color-primary, #a259ff) !important; */
}
</style>