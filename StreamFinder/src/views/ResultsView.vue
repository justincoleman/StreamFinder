<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <div class="container mx-auto p-4 sm:p-6 max-w-full sm:max-w-3xl">
      <header class="mb-12">
        <div class="text-center">
          <h1 class="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-4">Streaming Options</h1>
          <p v-if="store.selectedLeagueIds.length > 0" class="text-base sm:text-lg text-slate-300 mt-2 leading-relaxed">
            Based on your selection of <span class="font-semibold text-indigo-300">{{ selectedLeagueNames }}</span>.
          </p>
          <p v-else class="text-base sm:text-lg text-slate-300 mt-2 leading-relaxed">
            Please select some leagues to see relevant streaming options.
          </p>
          <div class="mt-6">
            <router-link
                to="/select-subscriptions"
                class="inline-flex items-center px-4 py-2 text-base font-medium text-white bg-slate-600/80 hover:bg-slate-500 border border-white/20 rounded-lg shadow transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 mr-2">
                <path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
              </svg>
              Back to Subscription Selection
            </router-link>
          </div>
        </div>
      </header>

      <main class="rounded-2xl">
        <div v-if="store.selectedLeagueIds.length === 0" class="text-center py-10 bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-slate-700/50">
          <p class="text-xl text-slate-300">No leagues selected.</p>
          <router-link to="/" class="mt-4 inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]">
            Select Leagues
          </router-link>
        </div>
        <div v-else-if="topPicks.length > 0 || otherOptions.length > 0">
          <section class="mb-10">
            <h2 v-if="topPicks.length > 0" class="text-2xl font-semibold text-slate-200 mb-2 text-center">Our Top Recommendations</h2>
            <p v-if="topPicks.length > 0" class="text-sm text-slate-400 mb-8 text-center">We've highlighted key options based on your selections.</p>

            <div class="flex flex-col md:flex-row md:items-stretch md:justify-center gap-6 md:gap-8">
              <div v-if="topCoveragePick" class="w-full flex"
                   :class="bestValuePick ? 'md:w-[55%] lg:w-3/5 md:order-2' : 'md:w-full md:max-w-2xl mx-auto'">
                <StreamingServiceCard
                  v-if="topCoveragePick.type === 'bundle' && topCoveragePick.servicesInvolved.length === 1"
                  :service="topCoveragePick.servicesInvolved[0]"
                  :is-primary-recommendation="true"
                  :is-main-pick="true"
                  class="w-full"
                />
                <BundleCard
                  v-else-if="topCoveragePick.type === 'bundle'"
                  :item="topCoveragePick"
                  :is-primary-recommendation="true"
                  :is-main-pick="true"
                  class="w-full"
                />
                <StreamingServiceCard
                  v-else
                  :service="topCoveragePick"
                  :is-primary-recommendation="true"
                  :is-main-pick="true"
                  class="w-full"
                />
              </div>
            </div>
          </section>

          <section v-if="otherOptions.length > 0" class="mt-12 pt-8 border-t border-slate-700/50">
            <button
              @click="showOtherOptions = !showOtherOptions"
              class="w-full flex justify-between items-center py-3.5 px-5 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-lg font-semibold text-slate-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 shadow-lg hover:shadow-xl border border-slate-700/50"
            >
              <span>{{ showOtherOptions ? 'Hide' : 'Show' }} Other Options ({{ otherOptions.length }})</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-6 h-6 transition-transform duration-300" :class="{'rotate-180': showOtherOptions}">
                <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
              </svg>
            </button>
            <transition
              enter-active-class="transition-all ease-out duration-500 overflow-hidden"
              enter-from-class="opacity-0 max-h-0"
              enter-to-class="opacity-100 max-h-[5000px]"
              leave-active-class="transition-all ease-in duration-300 overflow-hidden"
              leave-from-class="opacity-100 max-h-[5000px]"
              leave-to-class="opacity-0 max-h-0"
            >
              <div v-show="showOtherOptions">
                <div class="flex flex-wrap items-center gap-3 mb-6 mt-6 justify-center">
                  <label class="font-medium text-sm text-slate-300">Sort by:</label>
                  <select v-model="sortBy" class="border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm bg-slate-800/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 min-w-[120px]">
                    <option value="price">Price</option>
                    <option value="leagues">Leagues Covered</option>
                  </select>
                  <button @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'" class="ml-2 px-3 py-1.5 border border-slate-700/50 rounded-lg text-sm font-medium bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 flex items-center justify-center" aria-label="Toggle sort order">
                    <span v-if="sortOrder === 'asc'" class="inline-block">▲</span>
                    <span v-else class="inline-block">▼</span>
                  </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div v-for="item in sortedOtherOptions" :key="item.id" class="flex flex-col">
                    <StreamingServiceCard
                      v-if="item.type === 'bundle' && item.servicesInvolved.length === 1"
                      :service="item.servicesInvolved[0]"
                      :is-secondary-option="true"
                      class="flex-grow"
                    />
                    <BundleCard
                      v-else-if="item.type === 'bundle'"
                      :item="item"
                      :is-secondary-option="true"
                      class="flex-grow"
                    />
                    <StreamingServiceCard
                      v-else
                      :service="item"
                      :is-secondary-option="true"
                      class="flex-grow"
                    />
                  </div>
                </div>
              </div>
            </transition>
          </section>
        </div>
        <div v-else class="text-center py-10 bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-slate-700/50">
          <p class="text-xl text-slate-300">No streaming services or bundles found that match your criteria.</p>
          <p class="text-sm text-slate-400 mt-2">Try selecting fewer or different leagues, or adjust your subscriptions.</p>
        </div>
      </main>

      <div class="mt-12 text-center">
        <button
          @click="resetEverything"
          class="inline-flex items-center px-6 py-3 text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500 border border-slate-600/50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 mr-2">
            <path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clip-rule="evenodd" />
          </svg>
          Start Over
        </button>
      </div>

      <footer class="text-center mt-12 text-sm text-slate-400">
        <p>&copy; {{ new Date().getFullYear() }} StreamFinder. All rights reserved.</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStreamingStoreWithPersistence } from '@/stores/streamingStore';
import StreamingServiceCard from '@/components/StreamingServiceCard.vue'; // Assuming correct path
import BundleCard from '@/components/BundleCard.vue'; // Assuming correct path
import { useRouter } from 'vue-router';

const store = useStreamingStoreWithPersistence();
const router = useRouter();
const showOtherOptions = ref(false);
const sortBy = ref('price'); // 'price' or 'leagues'
const sortOrder = ref('asc'); // 'asc' or 'desc'
const allFilteredItems = computed(() => store.getFilteredServices);

const topCoveragePick = computed(() => {
  return allFilteredItems.value.find(item => item.badge === 'Top Coverage');
});

const bestValuePick = computed(() => {
  return allFilteredItems.value.find(item => item.badge === 'Best Value');
});

// This computed property ensures distinct items for the top section and correct order for display
const topPicks = computed(() => {
  const tcPick = topCoveragePick.value;
  return tcPick ? [tcPick] : [];
});

const otherOptions = computed(() => {
  const topPickIds = new Set(topPicks.value.map(pick => pick.id));
  return allFilteredItems.value.filter(item => !topPickIds.has(item.id));
});

const sortedOtherOptions = computed(() => {
  const arr = [...otherOptions.value];
  arr.sort((a, b) => {
    let aVal, bVal;
    if (sortBy.value === 'price') {
      aVal = a.totalNumericPrice ?? a.numericPrice ?? Infinity;
      bVal = b.totalNumericPrice ?? b.numericPrice ?? Infinity;
    } else if (sortBy.value === 'leagues') {
      aVal = a.totalCoveredLeaguesCount ?? (a.selectedLeaguesCoveredDetails ? Object.keys(a.selectedLeaguesCoveredDetails).length : 0);
      bVal = b.totalCoveredLeaguesCount ?? (b.selectedLeaguesCoveredDetails ? Object.keys(b.selectedLeaguesCoveredDetails).length : 0);
    }
    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
  return arr;
});

const selectedLeagueNames = computed(() => {
  return store.selectedLeagues.map(league => league.name).join(', ');
});

const resetEverything = () => {
  store.selectedLeagueIds = [];
  store.subscribedServiceIds = [];
  router.push('/');
};
</script>

<style scoped>
.container {
  max-width: 100%;
}
@media (min-width: 640px) {
  .container {
    max-width: 1200px;
  }
}
.max-h-\[5000px\] {
    max-height: 5000px;
}
</style>
