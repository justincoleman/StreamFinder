<template>
  <div class="relative w-full flex flex-col items-center">
    <!-- Badge inside the card, top center -->
    <article
      class="shadow-none p-2 sm:p-4 md:p-6 mb-6 border-4 border-indigo-500 bg-white flex flex-col gap-3 relative text-base dark:bg-[#181824] dark:border-indigo-500 w-full max-w-full box-border overflow-x-hidden rounded-lg"
      :class="{}"
      style="margin-top: 1rem;"
    >
      <div v-if="item.badge" class="flex justify-center mb-4 mt-2">
        <span v-if="item.badge === 'Best Value'"
          class="bundle-badge bundle-badge-best inline-block px-6 py-2 border-4 border-indigo-white bg-accent-yellow text-indigo-500 font-bold font-display text-lg uppercase tracking-widest rounded-lg dark:bg-indigo-500 dark:text-white dark:border-white">
          {{ item.badge }}
        </span>
        <span v-else
          class="bundle-badge bundle-badge-main inline-block px-4 sm:px-6 py-2 border-4 border-white bg-indigo-500 text-white font-bold font-display text-lg uppercase tracking-widest rounded-lg">
          {{ item.badge }}
        </span>
      </div>
      <!-- Bundle Heading -->
      <div class="flex flex-row items-start justify-between mb-2 w-full min-w-0">
        <div class="flex flex-col gap-1 min-w-0 w-full">
          <div class="flex flex-row items-center gap-4 flex-wrap min-w-0 w-full">
            <h3 class="text-2xl md:text-3xl font-bold font-display text-center text-black uppercase tracking-widest dark:text-white min-w-0 w-3/3 mt-3">
              <template v-if="item.servicesInvolved.length > 1">Recommended Bundle</template>
              <template v-else>{{ item.servicesInvolved[0]?.name || item.displayName }}</template>
            </h3>
          </div>
          <div class="flex items-baseline gap-2 flex-shrink-0 mb-2 mt-2 justify-center">
            <span class="text-4xl md:text-5xl font-extrabold text-indigo-600 dark:text-accent-yellow whitespace-nowrap">${{ item.totalNumericPrice?.toFixed(2) }}</span>
            <span class="text-base font-sans text-black dark:text-white">/mo</span>
          </div>
          <div v-if="whyThisBundle" class="flex flex-col items-center gap-2 mb-1 mt-1 w-full min-w-0 break-words text-center">
            <span class="flex items-center gap-2 justify-center">
              <svg class="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span class="text-base text-black dark:text-blue-300 font-sans font-medium break-words w-full min-w-0">{{ whyThisBundle }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Coverage by League Heading -->
      <div v-if="leaguesWithCoverage.length > 0" class="mt-2 mb-1">
        <h4 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Coverage by League</h4>
      </div>

      <!-- Per-League Coverage (for all selected leagues) -->
      <div v-if="leaguesWithCoverage.length > 0" class="mt-2 mb-1 grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2 w-full max-w-full min-w-0">
        <div v-for="league in leaguesWithCoverage" :key="league.id" class="flex flex-col items-center flex-1 min-w-0 box-border rounded-lg">
          <div class="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-2">
            <svg viewBox="0 0 48 48" class="absolute top-0 left-0 w-20 h-20 sm:w-24 sm:h-24">
              <defs>
                <linearGradient id="coverage-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#3a186a" />
                  <stop offset="100%" stop-color="#a259ff" />
                </linearGradient>
              </defs>
              <circle cx="24" cy="24" r="20" fill="none" stroke="#e5e7eb" stroke-width="6" />
              <circle
                cx="24" cy="24" r="20" fill="none"
                :stroke="(league.id === 'nfl' ? getNflCoverageCapped : item.selectedLeaguesCoveredDetails[league.id].coveragePercent || 0) === 100 ? 'url(#coverage-gradient)' : 'url(#coverage-gradient)'"
                stroke-width="6"
                :stroke-dasharray="(league.id === 'nfl' ? getNflCoverageCapped : item.selectedLeaguesCoveredDetails[league.id].coveragePercent || 0) * 1.257 + ', 125.7'"
                stroke-linecap="round"
                :style="{ transition: 'stroke-dasharray 0.7s cubic-bezier(0.4,0,0.2,1)' }"
                transform="rotate(-90 24 24)"
              />
            </svg>
            <span class="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <span class="text-lg font-extrabold px-2 dark:text-white">{{ league.id === 'nfl' ? getNflCoverageCapped : item.selectedLeaguesCoveredDetails[league.id].coveragePercent || 0 }}%</span>
            </span>
            <!-- NFL warning icon and tooltip -->
            <span v-if="league.id === 'nfl' && getNflCoverageCapped >= 80" class="absolute top-2 right-2 z-20">
              <span class="relative group">
                <span class="absolute left-1/2 -translate-x-1/2 mt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus:opacity-100 group-focus:pointer-events-auto transition-opacity duration-200 bg-amber-100 text-amber-700 border border-amber-400 rounded px-3 py-2 text-xs font-bold shadow-xl w-56 text-center">
                  This bundle does NOT provide 100% live NFL coverage. You will miss FOX Sunday games and out-of-market games.
                </span>
              </span>
            </span>
          </div>
          <div class="flex items-center justify-center text-xs font-bold font-display text-center mb-1 mt-1 uppercase gap-2 w-full min-w-0 flex-wrap break-words">
            <span class="text-2xl">{{ league.icon }}</span>
            <span>{{ league.name }}</span>
            <span v-if="league.id === 'nfl' && getNflCoverageCapped >= 80" class="ml-2 flex items-center">
              <span class="relative group">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-500 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" tabindex="0">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span class="absolute left-1/2 -translate-x-1/2 mt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus:opacity-100 group-focus:pointer-events-auto transition-opacity duration-200 bg-amber-100 text-amber-700 border border-amber-400 rounded px-3 py-2 text-xs font-bold shadow-xl w-56 text-center z-50">
                  This bundle does NOT provide 100% live NFL coverage. You will miss FOX Sunday games and out-of-market games.
                </span>
              </span>
            </span>
          </div>
          <div v-if="getAggregatedCoverageNotes(league.id).length" class="mb-1">
            <button @click="openLeagueModal(league)" class="text-xs text-blue-600 dark:text-blue-300 underline hover:no-underline focus:outline-none">
              More Info
            </button>
          </div>
          <div v-if="(item.selectedLeaguesCoveredDetails[league.id].coveragePercent || 0) < 100" class="mt-1 text-xs text-orange-600 dark:text-orange-400">
            <span v-if="showBudgetMessage">Your budget does not allow for full {{ league.name }} coverage. </span>
            <span v-if="league.id === 'nfl'">Due to US broadcast rights and blackout rules, 100% live NFL coverage is not possible, even with all available services.</span>
          </div>
        </div>
      </div>

      <!-- Services Included as Links -->
      <div class="grid grid-cols-2 gap-2 mt-1 w-full max-w-full min-w-0">
        <span class="text-base font-bold font-display text-black dark:text-white col-span-2">Service Links:</span>
        <template v-for="service in item.servicesInvolved" :key="service.id">
          <a :href="getServiceLink(service.id)" target="_blank" rel="noopener noreferrer"
             class="font-bold font-display text-lg uppercase border-b-4 border-black dark:border-white pb-1 service-btn break-words w-full min-w-0 rounded-lg hover:text-primary dark:hover:text-accent-yellow transition-colors">
            {{ service.name }}
          </a>
        </template>
      </div>

      <!-- Affiliate Disclaimer -->
      <div v-if="hasAffiliateLinks" class="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center italic">
        <p>Some links above are affiliate links. If you purchase through these links, we may receive a small commission at no additional cost to you.</p>
      </div>

      <!-- Details Section (only if there are details) -->
      <div v-if="hasDetails" class="mt-2">
        <button @click="detailsOpen = !detailsOpen"
                class="inline-flex items-center gap-2 px-4 py-2 border-4 border-black bg-white text-black font-bold font-display text-base shadow-none hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 mt-4 uppercase tracking-widest dark:bg-black dark:text-white dark:border-primary w-full justify-center rounded-lg"
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
              <table class="min-w-full border-4 border-black dark:border-white bg-white dark:bg-black text-base font-sans brutalist-table">
                <thead>
                  <tr>
                    <th class="p-4 font-extrabold text-left border-4 border-black dark:border-indigo-500 uppercase">Service</th>
                    <th v-for="league in leaguesToShow" :key="league.id" class="p-4 font-extrabold text-center border-4 border-black dark:border-indigo-500 uppercase">
                      <span class="flex flex-col items-center">
                        <span class="text-2xl">{{ league.icon }}</span>
                        <span class="text-xs mt-1">{{ league.name }}</span>
                        <span class="text-xs mt-1" :class="getPreferenceColor(getLeaguePreference(league.id))">
                          {{ getPreferenceLabel(getLeaguePreference(league.id)) }}
                        </span>
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="service in item.servicesInvolved" :key="service.id">
                    <td class="p-4 font-extrabold border-4 border-black dark:border-indigo-500 uppercase">{{ service.name }}</td>
                    <td v-for="league in leaguesToShow" :key="service.id + '-' + league.id" class="p-4 text-center font-extrabold border-4 border-black dark:border-indigo-500">
                      <span v-if="service.leagues && service.leagues[league.id] && service.leagues[league.id].coveragePercent > 0" class="inline-flex items-center justify-center text-3xl text-indigo-500">
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

    <!-- Add modal markup at the end of the template -->
    <transition name="fade">
      <div v-if="modalLeague" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 w-full overflow-x-hidden">
        <div class="relative w-full max-w-xs sm:max-w-md mx-2 p-4 sm:p-8 border-4 border-black dark:border-indigo-500 bg-white dark:bg-[#181824] rounded-lg shadow-2xl brutalist-modal box-border overflow-y-auto max-h-[90vh]">
          <button @click="closeLeagueModal" class="absolute top-4 right-4 text-black dark:text-white font-extrabold text-2xl leading-none focus:outline-none">×</button>
          <div class="flex flex-col sm:flex-row items-center gap-4 mb-4 w-full">
            <span class="text-4xl">{{ modalLeague.icon }}</span>
            <div class="flex flex-col items-center sm:items-start">
              <span class="text-2xl font-bold font-display uppercase break-words w-full">{{ modalLeague.name }}</span>
              <span class="font-sans font-medium" :class="getPreferenceColor(getLeaguePreference(modalLeague.id))">
                Importance: {{ getPreferenceLabel(getLeaguePreference(modalLeague.id)) }}
              </span>
            </div>
          </div>
          <div>
            <h2 class="text-lg font-bold font-display uppercase mb-2 text-black dark:text-white break-words">Coverage Details</h2>
            <ul class="list-disc ml-6 text-base font-sans text-black dark:text-white break-words">
              <li v-for="note in getAggregatedCoverageNotes(modalLeague.id)" :key="note">{{ note }}</li>
            </ul>
          </div>
          <div v-if="(item.selectedLeaguesCoveredDetails[modalLeague.id]?.coveragePercent || 0) < 100" class="mt-4 text-sm text-orange-600 dark:text-orange-400 font-sans break-words">
            <span v-if="modalLeague.id === 'nfl'">Due to US broadcast rights and blackout rules, 100% live NFL coverage is not possible, even with all available services.</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import affiliateLinks from '@/data/affiliateLinks.json';
import serviceHomepages from '@/data/serviceHomepages.json';
import { useStreamingStoreWithPersistence } from '@/stores/streamingStore';

const store = useStreamingStoreWithPersistence();

const props = defineProps({
  item: { type: Object, required: true },
  selectedLeagues: { type: Array, required: true },
  maxPrice: { type: Number, required: false, default: 999 }
});

const detailsOpen = ref(false);

// Leagues actually covered by this bundle
const leaguesToShow = computed(() => {
  // Only show leagues that are both selected and actually covered by the service
  const selectedLeagues = store.selectedLeaguesSortedByPreference;
  return selectedLeagues.filter(l => props.item.selectedLeaguesCoveredDetails && props.item.selectedLeaguesCoveredDetails[l.id]);
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

const modalLeague = ref(null);
function openLeagueModal(league) {
  modalLeague.value = league;
}
function closeLeagueModal() {
  modalLeague.value = null;
}

const hasAffiliateLinks = computed(() => {
  // Check if any service in the bundle has an affiliate link available
  return props.item.servicesInvolved.some(service => affiliateLinks[service.id]);
});

function getServiceLink(serviceId) {
  // First try to use affiliate link, then fall back to service homepage
  return affiliateLinks[serviceId] || serviceHomepages[serviceId] || '#';
}

// Helper functions to get league preference info
function getLeaguePreference(leagueId) {
  return store.leaguePreferences[leagueId] || 3; // Default to medium priority
}

function getPreferenceLabel(weight) {
  const labels = {
    1: 'Very Low',
    2: 'Low',
    3: 'Medium',
    4: 'High',
    5: 'Very High'
  };
  return labels[weight] || 'Medium';
}

function getPreferenceColor(weight) {
  const colors = {
    1: 'text-gray-500',
    2: 'text-blue-500',
    3: 'text-green-500',
    4: 'text-amber-500',
    5: 'text-red-500'
  };
  return colors[weight] || 'text-green-500';
}
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
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
@media (max-width: 640px) {
  .brutalist-table th,
  .brutalist-table td {
    padding: 0.5rem !important;
    font-size: 0.8rem !important;
    word-break: break-word;
  }
}
</style>