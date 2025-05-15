<template>
  <div class="container mx-auto p-4 sm:p-6 min-h-screen bg-gray-100">
    <header class="mb-8">
      <div class="flex justify-start items-center mb-4">
        <router-link
            to="/select-subscriptions"
            class="text-blue-600 hover:text-blue-800 transition-colors duration-150 flex items-center text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 mr-1">
            <path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
          </svg>
          Back to Subscription Selection
        </router-link>
      </div>
      <div class="text-center">
        <h1 class="text-3xl sm:text-4xl font-bold text-blue-700">Streaming Options</h1>
        <p v-if="store.selectedLeagueIds.length > 0" class="text-md sm:text-lg text-gray-600 mt-2">
          Based on your selection of <span class="font-semibold">{{ selectedLeagueNames }}</span>.
        </p>
         <p v-else class="text-md sm:text-lg text-gray-600 mt-2">
          Please select some leagues to see relevant streaming options.
        </p>
      </div>
    </header>

    <main class="rounded-xl">
      <div v-if="store.selectedLeagueIds.length === 0" class="text-center py-10 bg-white p-6 rounded-xl shadow-lg">
        <p class="text-xl text-gray-500">No leagues selected.</p>
        <router-link to="/" class="mt-4 inline-block bg-blue-500 text-white hover:bg-blue-600 font-medium py-2 px-4 rounded-lg transition-colors duration-150">
          Select Leagues
        </router-link>
      </div>
      <div v-else-if="topPicks.length > 0 || otherOptions.length > 0">
        <section class="mb-10">
          <h2 v-if="topPicks.length > 0" class="text-2xl font-semibold text-gray-700 mb-2 text-center">Our Top Recommendations</h2>
          <p v-if="topPicks.length > 0" class="text-sm text-gray-500 mb-8 text-center">We've highlighted two key options based on your selections.</p>

          <div class="flex flex-col md:flex-row md:items-stretch md:justify-center gap-6 md:gap-8">
            <div v-if="bestValuePick" class="w-full md:w-[45%] lg:w-2/5 md:order-1 flex"> {/* flex to make card take height */}
              <BundleCard v-if="bestValuePick.type === 'bundle'" :item="bestValuePick" :is-primary-recommendation="true" class="w-full"/>
              <StreamingServiceCard v-else :service="bestValuePick" :is-primary-recommendation="true" class="w-full"/>
            </div>

            <div v-if="topCoveragePick" class="w-full flex"
                 :class="bestValuePick ? 'md:w-[55%] lg:w-3/5 md:order-2' : 'md:w-full md:max-w-2xl mx-auto'">
              <BundleCard v-if="topCoveragePick.type === 'bundle'" :item="topCoveragePick" :is-primary-recommendation="true" :is-main-pick="true" class="w-full"/>
              <StreamingServiceCard v-else :service="topCoveragePick" :is-primary-recommendation="true" :is-main-pick="true" class="w-full"/>
            </div>
          </div>
        </section>

        <section v-if="otherOptions.length > 0" class="mt-12 pt-8 border-t border-gray-300">
          <button
            @click="showOtherOptions = !showOtherOptions"
            class="w-full flex justify-between items-center py-3.5 px-5 bg-slate-200 hover:bg-slate-300 rounded-lg text-lg font-semibold text-slate-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
          >
            <span>{{ showOtherOptions ? 'Hide' : 'Show' }} Other Options ({{ otherOptions.length }})</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-6 h-6 transition-transform duration-300" :class="{'rotate-180': showOtherOptions}">
              <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
            </svg>
          </button>
          <transition
            enter-active-class="transition-all ease-out duration-500 overflow-hidden"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[5000px]" /* Increased max-h significantly */
            leave-active-class="transition-all ease-in duration-300 overflow-hidden"
            leave-from-class="opacity-100 max-h-[5000px]"
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-show="showOtherOptions" class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="item in otherOptions" :key="item.id" class="flex flex-col">
                <BundleCard v-if="item.type === 'bundle'" :item="item" :is-secondary-option="true" class="flex-grow"/>
                <StreamingServiceCard v-else :service="item" :is-secondary-option="true" class="flex-grow"/>
              </div>
            </div>
          </transition>
        </section>
      </div>
      <div v-else class="text-center py-10 bg-white p-6 rounded-xl shadow-lg">
        <p class="text-xl text-gray-500">No streaming services or bundles found that match your criteria.</p>
        <p class="text-sm text-gray-400 mt-2">Try selecting fewer or different leagues, or adjust your subscriptions.</p>
      </div>
    </main>

    <footer class="text-center mt-12 py-6 text-sm text-gray-500">
      <p>&copy; {{ new Date().getFullYear() }} StreamFinder. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStreamingStore } from '@/stores/streamingStore';
import StreamingServiceCard from '@/components/StreamingServiceCard.vue';
import BundleCard from '@/components/BundleCard.vue';

const store = useStreamingStore();
const showOtherOptions = ref(false);
const allFilteredItems = computed(() => store.getFilteredServices);

const topCoveragePick = computed(() => {
  return allFilteredItems.value.find(item => item.badge === 'Top Coverage');
});

const bestValuePick = computed(() => {
  return allFilteredItems.value.find(item => item.badge === 'Best Value');
});

const topPicks = computed(() => {
    const picks = [];
    // Order for display: Best Value (smaller, left/top), Top Coverage (larger, right/bottom or middle)
    if (bestValuePick.value) picks.push(bestValuePick.value); // This will be md:order-1
    if (topCoveragePick.value) {
        // Ensure it's not the same item as bestValuePick before adding
        if (!bestValuePick.value || topCoveragePick.value.id !== bestValuePick.value.id) {
            picks.push(topCoveragePick.value); // This will be md:order-2
        } else if (!bestValuePick.value) { // Only Top Coverage Pick exists
             picks.push(topCoveragePick.value);
        }
    }
    return picks;
});

const otherOptions = computed(() => {
  const topPickIds = new Set(topPicks.value.map(pick => pick.id));
  return allFilteredItems.value.filter(item => !topPickIds.has(item.id));
});

const selectedLeagueNames = computed(() => {
  return store.selectedLeagues.map(league => league.name).join(', ');
});
</script>

<style scoped>
.container {
  max-width: 1200px;
}
.max-h-\[5000px\] { /* Custom Tailwind class for large max-height */
    max-height: 5000px;
}
</style>