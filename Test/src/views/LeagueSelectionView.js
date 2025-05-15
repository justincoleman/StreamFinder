<template>
    <div class="container mx-auto p-4 sm:p-6 min-h-screen bg-gray-50">
        <header class="mb-8 text-center">
            <h1 class="text-3xl sm:text-4xl font-bold text-blue-700">StreamFinder</h1>
            <p class="text-md sm:text-lg text-gray-600 mt-2">
                Find the best streaming services for your favorite sports leagues.
            </p>
        </header>

        <main class="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-xl">
            <LeagueSelector />

            <div class="mt-10 text-center">
                <button @click="navigateToSelectSubscriptions" :disabled="store.selectedLeagueIds.length === 0" :class="[
                    'px-6 py-3 text-md sm:text-lg font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md hover:shadow-lg',
                    store.selectedLeagueIds.length > 0
                        ? 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-400'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed focus:ring-gray-300'
                ]">
                    Next: Select Subscriptions &rarr;
                </button>
            </div>
        </main>

        <footer class="text-center mt-12 py-6 text-sm text-gray-500">
            <p>&copy; {{ new Date().getFullYear() }} StreamFinder. All rights reserved.</p>
        </footer>
    </div>
</template>

<script setup>
import LeagueSelector from '@/components/LeagueSelector.vue';
import { useStreamingStore } from '@/stores/streamingStore';
import { useRouter } from 'vue-router';

const store = useStreamingStore();
const router = useRouter();

const navigateToSelectSubscriptions = () => {
    if (store.selectedLeagueIds.length > 0) {
        router.push('/select-subscriptions');
    }
};
</script>

<style scoped>
.container {
    max-width: 900px;
    /* Adjusted for potentially more content */
}
</style>