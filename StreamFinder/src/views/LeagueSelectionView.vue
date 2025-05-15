<template>
  <div class="container mx-auto p-4 sm:p-6 min-h-screen bg-gray-25 max-w-full sm:max-w-xl">
    <header class="mb-8 text-center">
      <h1 class="text-2xl sm:text-4xl font-bold text-blue-700">StreamFinder</h1>
      <p class="text-base sm:text-lg text-gray-600 mt-2">
        Find the best streaming services for your favorite sports leagues.
      </p>
    </header>

    <main class="bg-white p-6 md:p-8 rounded-xl shadow-lg">
      <LeagueSelector />

      <div class="mt-10 text-center">
        <button
          @click="navigateToSelectSubscriptions"
          :disabled="store.selectedLeagueIds.length === 0"
          :class="[
            'px-8 py-3 text-lg font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2',
            store.selectedLeagueIds.length > 0
              ? 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-400'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed focus:ring-gray-300'
          ]"
        >
          Next: Select Subscriptions &rarr;
        </button>
      </div>
    </main>

    <footer class="text-center mt-12 text-sm text-gray-500">
      <p>&copy; {{ new Date().getFullYear() }} StreamFinder. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import LeagueSelector from '@/components/LeagueSelector.vue';
import { useStreamingStoreWithPersistence } from '@/stores/streamingStore';
import { useRouter } from 'vue-router';

const store = useStreamingStoreWithPersistence();
const router = useRouter();

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