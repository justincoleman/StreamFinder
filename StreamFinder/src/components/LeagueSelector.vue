<template>
  <div>
    <div class="mb-6 flex items-center justify-between gap-4 flex-wrap">
      <h2 class="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-white mb-0">
        Select Your Favorite Leagues
      </h2>
      <div class="flex justify-end space-x-3">
        <button
          @click="store.selectAllLeagues()"
          class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-150 min-h-[44px] min-w-[44px]"
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
    </div>

    <div class="space-y-4 bg-white/80 dark:bg-slate-700/80 rounded-2xl border border-slate-200 dark:border-slate-700/50 backdrop-blur-md p-4 sm:p-6 md:p-8">
      <div v-for="category in store.allLeaguesByCategory" :key="category.categoryName" class="border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-lg overflow-hidden bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <button
          @click="store.toggleCategoryExpansion(category.categoryName)"
          class="w-full flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-slate-200 dark:from-slate-800/50 dark:to-slate-700/50 hover:from-slate-100 hover:to-slate-300 dark:hover:from-slate-700/50 dark:hover:to-slate-600/50 transition-all duration-300 focus:outline-none"
        >
          <div class="flex items-center">
            <span class="mr-2 text-xl">{{ category.icon || '🏆' }}</span>
            <span class="font-semibold text-base sm:text-lg text-slate-800 dark:text-slate-200 break-words">{{ category.categoryName }}</span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 transition-transform duration-300"
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
          <div v-show="store.expandedCategories.includes(category.categoryName)" class="p-4 bg-slate-50 dark:bg-slate-800/20">
            <div class="space-y-2">
              <button
                v-for="league in category.leagues"
                :key="league.id"
                @click="store.toggleLeagueSelection(league.id)"
                :class="[
                  'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-between shadow-sm hover:shadow-md',
                  store.selectedLeagueIds.includes(league.id)
                    ? 'bg-gradient-to-r from-blue-200/40 to-indigo-200/40 text-blue-700 dark:from-blue-500/20 dark:to-indigo-600/20 dark:text-white hover:from-blue-200/60 hover:to-indigo-200/60 dark:hover:from-blue-500/30 dark:hover:to-indigo-600/30 focus:ring-blue-300 dark:focus:ring-blue-500 border border-blue-200 dark:border-blue-500/30'
                    : 'bg-slate-100/60 text-slate-800 dark:bg-slate-700/30 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700/50 focus:ring-slate-300 dark:focus:ring-slate-500 border border-slate-200 dark:border-slate-700/50'
                ]"
              >
                <span>{{ league.name }}</span>
                <span v-if="store.selectedLeagueIds.includes(league.id)" class="text-xs bg-blue-200 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 px-2 py-1 rounded-full font-semibold border border-blue-200 dark:border-blue-500/30">Selected</span>
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
