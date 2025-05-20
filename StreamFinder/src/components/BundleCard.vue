<template>
  <article
    class="rounded-2xl shadow-xl p-4 md:p-6 mb-6 border border-slate-200 dark:border-slate-700/50 bg-white/80 dark:bg-slate-700/80 flex flex-col gap-3 relative text-base"
    :class="{
      'bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-700/80': item.badge === 'Top Coverage',
      'bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-700/80': item.badge === 'Best Value'
    }"
  >
    <!-- Badge -->
    <div v-if="item.badge" class="absolute -top-3 right-4">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold shadow-lg"
        :class="{
          'bg-emerald-500 text-white': item.badge === 'Top Coverage',
          'bg-blue-500 text-white': item.badge === 'Best Value'
        }">
        {{ item.badge }}
      </span>
    </div>

    <!-- Bundle Heading -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex flex-col gap-1">
        <h3 class="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">
          <template v-if="item.servicesInvolved.length > 1">Recommended Bundle</template>
          <template v-else>{{ item.servicesInvolved[0]?.name || item.displayName }}</template>
        </h3>
        <div v-if="leaguesToShow.length > 0" class="flex items-center gap-2 flex-wrap mt-1">
          <span v-for="league in leaguesToShow" :key="league.id" class="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-base font-medium">
            <span class="text-xl">{{ league.icon }}</span>
            <span class="text-sm">{{ league.name }}</span>
          </span>
        </div>
        <div v-if="whyThisBundle" class="flex items-center gap-2 mb-1 mt-1">
          <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span class="text-base text-slate-700 dark:text-slate-200 font-medium">{{ whyThisBundle }}</span>
        </div>
      </div>
      <div class="flex flex-col items-end">
        <span class="text-4xl md:text-5xl font-extrabold text-blue-700 dark:text-blue-300">
          ${{ item.totalNumericPrice?.toFixed(2) }}
        </span>
        <span class="text-xs text-slate-500 dark:text-slate-400">/mo</span>
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
          <span class="text-lg font-semibold text-slate-700 dark:text-slate-200">{{ league.name }} Coverage:</span>
          <span class="text-base font-bold text-blue-700 dark:text-blue-300">
            {{ league.id === 'nfl' && getNflCoverageCapped < (item.selectedLeaguesCoveredDetails[league.id].coveragePercent || 0)
              ? getNflCoverageCapped
              : item.selectedLeaguesCoveredDetails[league.id].coveragePercent || 0 }}%
          </span>
        </div>
        <div class="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
          <div class="h-full bg-blue-500 dark:bg-blue-400" :style="{ width: (league.id === 'nfl' && getNflCoverageCapped < (item.selectedLeaguesCoveredDetails[league.id].coveragePercent || 0) ? getNflCoverageCapped : (item.selectedLeaguesCoveredDetails[league.id].coveragePercent || 0)) + '%' }"></div>
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
      <span class="text-base font-semibold text-slate-600 dark:text-slate-300">Services:</span>
      <template v-for="service in item.servicesInvolved" :key="service.id">
        <a
          :href="getServiceLink(service)"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1 px-4 py-2 rounded border-2 text-base font-semibold transition-colors duration-150 shadow-sm hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
          :class="service.isSubscribed ? 'border-emerald-400 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/10' : 'border-blue-400 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/10'"
          :aria-label="'Visit ' + service.name + ' website'"
        >
          <span>{{ service.name }}</span>
        </a>
      </template>
    </div>

    <!-- Details Section (only if there are details) -->
    <div v-if="hasDetails" class="mt-2">
      <button @click="detailsOpen = !detailsOpen"
              class="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 mt-2"
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
          <!-- Simple Coverage Table: Services as rows, Leagues as columns, checkmark if covered -->
          <div class="overflow-x-auto">
            <table class="min-w-full border border-slate-200 dark:border-slate-700/50 rounded-xl bg-white dark:bg-slate-800/80 text-sm">
              <thead>
                <tr>
                  <th class="p-3 font-bold text-left text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700/60 border-b border-slate-200 dark:border-slate-700/50">Service</th>
                  <th v-for="league in leaguesToShow" :key="league.id" class="p-3 font-bold text-center text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700/60 border-b border-slate-200 dark:border-slate-700/50">
                    <span class="flex flex-col items-center">
                      <span class="text-xl">{{ league.icon }}</span>
                      <span class="text-xs mt-1">{{ league.name }}</span>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="service in item.servicesInvolved" :key="service.id" class="border-b border-slate-100 dark:border-slate-700/30">
                  <td class="p-3 font-semibold text-blue-700 dark:text-blue-300">{{ service.name }}</td>
                  <td v-for="league in leaguesToShow" :key="service.id + '-' + league.id" class="p-3 text-center">
                    <span v-if="service.leagues && service.leagues[league.id] && service.leagues[league.id].coveragePercent > 0" class="inline-flex items-center justify-center text-emerald-600">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span v-else class="inline-block w-6 h-6 text-slate-300 dark:text-slate-600">—</span>
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
import { ref, computed } from 'vue';
import affiliateLinks from '@/data/affiliateLinks.json';
import loginLinks from '@/data/loginLinks.json';
import serviceHomepages from '@/data/serviceHomepages.json';

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

// Service links
const getServiceLink = (service) => {
  if (service.isSubscribed) {
    return loginLinks[service.id] || serviceHomepages[service.id] || '';
  } else {
    return affiliateLinks[service.id] || serviceHomepages[service.id] || '';
  }
};

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
</style>