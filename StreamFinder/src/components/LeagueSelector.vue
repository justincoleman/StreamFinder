<template>
  <div>
    <h2 class="text-xl sm:text-2xl font-semibold mb-4 text-gray-700">
      Select Your Favorite Leagues
    </h2>
    <div class="mb-6 flex space-x-3">
      <button
        @click="store.selectAllLeagues()"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 min-h-[44px] min-w-[44px]"
      >
        Select All Leagues
      </button>
      <button
        @click="store.unselectAllLeagues()"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors duration-150 min-h-[44px] min-w-[44px]"
      >
        Unselect All
      </button>
    </div>

    <div class="space-y-4">
      <div v-for="category in store.allLeaguesByCategory" :key="category.categoryName" class="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <button
          @click="store.toggleCategoryExpansion(category.categoryName)"
          class="w-full flex justify-between items-center p-2 sm:p-4 bg-gray-100 hover:bg-gray-200 transition-colors duration-150 focus:outline-none"
        >
          <div class="flex items-center">
            <!-- <span class="text-base sm:text-lg mr-3">{{ category.icon }}</span> -->
            <span class="font-semibold text-base sm:text-lg text-gray-800 break-words">{{ category.categoryName }}</span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 transition-transform duration-200"
            :class="{'rotate-180': store.expandedCategories.includes(category.categoryName)}"
          >
            <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
          </svg>
        </button>

        <transition
          enter-active-class="transition ease-out duration-300"
          enter-from-class="transform opacity-0 -translate-y-4 max-h-0"
          enter-to-class="transform opacity-100 translate-y-0 max-h-screen"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="transform opacity-100 translate-y-0 max-h-screen"
          leave-to-class="transform opacity-0 -translate-y-4 max-h-0"
        >
          <div v-show="store.expandedCategories.includes(category.categoryName)" class="p-2 sm:p-4 bg-white">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <button
                v-for="league in category.leagues"
                :key="league.id"
                @click="store.toggleLeagueSelection(league.id)"
                :class="[
                  'px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-start text-left w-full shadow-sm hover:shadow-md min-h-[44px] min-w-[44px] gap-x-2 break-words',
                  store.selectedLeagueIds.includes(league.id)
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-blue-400'
                ]"
              >
                <span class="text-base sm:text-lg mr-2 w-5 text-center">{{ league.icon }}</span>
                <span class="break-words">{{ league.name }}</span>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <div v-if="store.selectedLeagueIds.length > 0" class="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <p class="text-base sm:text-md text-blue-700">
        <span class="font-semibold">Selected Leagues ({{ store.selectedLeagueIds.length }}):</span>
        {{ selectedLeagueNames }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useStreamingStoreWithPersistence } from '@/stores/streamingStore';

const store = useStreamingStoreWithPersistence();

const selectedLeagueNames = computed(() => {
  return store.selectedLeagues.map(league => league.name).join(', ');
});

onMounted(() => {
  const isDesktop = window.matchMedia('(min-width: 640px)').matches;
  if (isDesktop) {
    store.expandedCategories = store.allLeaguesByCategory.map(cat => cat.categoryName);
  } else {
    store.expandedCategories = [];
  }
});
</script>
