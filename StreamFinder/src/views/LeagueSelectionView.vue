<template>
  <div class="min-h-screen bg-gradient-to-br from-white via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <div class="container mx-auto p-4 sm:p-6 max-w-full sm:max-w-xl">
      <header class="mb-12 text-center">
        <div class="flex justify-center mb-6">
          <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 animate-pulse"></div>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-14 w-14 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
              <path d="M7 7l.01 0"/>
              <path d="M17 7l.01 0"/>
              <path d="M7 12l5 3 5-3"/>
            </svg>
          </div>
        </div>
        <h1 class="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent mb-4 dark:from-blue-400 dark:to-indigo-500">StreamFinder</h1>
        <p class="text-base sm:text-lg text-slate-700 dark:text-slate-300 mt-2 max-w-lg mx-auto leading-relaxed">
          Never miss a game again. Find the perfect streaming package for your favorite sports in seconds.
        </p>
        <div class="mt-8 flex justify-center space-x-6">
          <div class="flex items-center text-sm text-slate-700 dark:text-slate-300">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
              <span class="text-white font-bold">1</span>
            </div>
            <span class="font-medium">Select leagues</span>
          </div>
          <div class="flex items-center text-sm text-slate-700 dark:text-slate-300">
            <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
              <span class="text-white font-bold">2</span>
            </div>
            <span class="font-medium">Add subscriptions</span>
          </div>
          <div class="flex items-center text-sm text-slate-700 dark:text-slate-300">
            <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
              <span class="text-white font-bold">3</span>
            </div>
            <span class="font-medium">Get recommendations</span>
          </div>
        </div>
      </header>

      <main class="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/50">
        <LeagueSelector />

        <div class="mt-10 text-center">
          <button
            @click="navigateToSelectSubscriptions"
            :disabled="store.selectedLeagueIds.length === 0"
            :class="[
              'px-8 py-3.5 text-lg font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
              store.selectedLeagueIds.length > 0
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 focus:ring-blue-500 shadow-lg hover:shadow-xl hover:scale-[1.02]'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed focus:ring-slate-600'
            ]"
          >
            Next: Select Subscriptions →
          </button>
        </div>
      </main>

      <footer class="text-center mt-12 text-sm text-slate-400">
        <p>&copy; {{ new Date().getFullYear() }} StreamFinder. All rights reserved.</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import LeagueSelector from '@/components/LeagueSelector.vue';
import { useStreamingStoreWithPersistence } from '@/stores/streamingStore';
import { useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';

const store = useStreamingStoreWithPersistence();
const router = useRouter();

useTheme();

const navigateToSelectSubscriptions = () => { // Renamed function
  if (store.selectedLeagueIds.length > 0) {
    router.push('/select-subscriptions'); // New route
  }
};
</script>

<style scoped>
.container {
  max-width: 100%;
}
@media (min-width: 640px) {
.container {
  max-width: 800px;
  }
}
</style>