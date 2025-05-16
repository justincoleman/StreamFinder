<template>
  <div class="min-h-screen bg-gradient-to-br from-white via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <div class="container mx-auto p-4 sm:p-6 max-w-full sm:max-w-xl">
      <header class="mb-12 text-center">
        <div class="text-center">
          <h1 class="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-4">My Current Subscriptions</h1>
          <p class="text-base sm:text-lg text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
            Select any streaming services you already subscribe to. This will help us tailor your results.
          </p>
        </div>
      </header>

      <main class="bg-white/80 dark:bg-slate-700/80 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/50">
        <div class="flex flex-col sm:flex-row justify-between items-center mb-8 gap-3 sm:gap-0">
          <router-link to="/" class="w-full sm:w-auto inline-flex items-center px-4 py-2 text-base font-medium text-white bg-slate-600/80 hover:bg-slate-500 border border-white/20 rounded-lg shadow transition-all duration-200 justify-center mb-2 sm:mb-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 mr-2">
              <path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
            </svg>
            Back to League Selection
          </router-link>
          <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-3 sm:gap-0 sm:space-x-3">
            <button
              @click="store.selectAllServices()"
              class="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-emerald-500"
            >
              Select All My Services
            </button>
            <button
              @click="store.unselectAllServices()"
              class="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500 border border-slate-600/50"
            >
              Unselect All
            </button>
          </div>
        </div>
        <div class="space-y-4 bg-white/80 dark:bg-slate-700/80 rounded-2xl border border-slate-200 dark:border-slate-700/50 backdrop-blur-md p-4 sm:p-6 md:p-8">
          <ul>
            <li v-for="category in store.allServicesGroupedByCategory" :key="category.categoryName" class="border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-lg overflow-hidden bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <button
                @click="store.toggleServiceCategoryExpansion(category.categoryName)"
                class="w-full flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-slate-200 dark:from-slate-800/50 dark:to-slate-700/50 hover:from-slate-100 hover:to-slate-300 dark:hover:from-slate-700/50 dark:hover:to-slate-600/50 transition-all duration-300 focus:outline-none min-h-[44px] min-w-[44px]"
                :aria-expanded="store.expandedServiceCategories.includes(category.categoryName)"
                :aria-controls="`category-panel-${category.categoryName}`"
              >
                <div class="flex items-center">
                  <span class="text-2xl mr-3" aria-hidden="true">{{ category.icon }}</span>
                  <span class="font-semibold text-lg text-slate-800 dark:text-slate-200">{{ category.categoryName }}</span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="w-6 h-6 text-slate-400 transition-transform duration-300"
                  :class="{'rotate-180': store.expandedServiceCategories.includes(category.categoryName)}"
                  aria-hidden="true"
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
                <div v-show="store.expandedServiceCategories.includes(category.categoryName)" :id="`category-panel-${category.categoryName}`" class="p-4 bg-slate-50 dark:bg-slate-800/20">
                  <ul class="space-y-2">
                    <li v-for="service in category.services" :key="service.id">
                      <button
                        @click="store.toggleServiceSubscription(service.id)"
                        :class="[
                          'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-between shadow-sm hover:shadow-md min-h-[44px] min-w-[44px]',
                          store.subscribedServiceIds.includes(service.id)
                            ? 'bg-gradient-to-r from-indigo-200/40 to-blue-200/40 text-indigo-700 dark:from-indigo-500/20 dark:to-blue-600/20 dark:text-white hover:from-indigo-200/60 hover:to-blue-200/60 dark:hover:from-indigo-500/30 dark:hover:to-blue-600/30 focus:ring-indigo-300 dark:focus:ring-indigo-500 border border-indigo-200 dark:border-indigo-500/30'
                            : 'bg-slate-100/60 text-slate-800 dark:bg-slate-700/30 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700/50 focus:ring-slate-300 dark:focus:ring-slate-500 border border-slate-200 dark:border-slate-700/50'
                        ]"
                        :aria-pressed="store.subscribedServiceIds.includes(service.id)"
                      >
                        <span>{{ service.name }}</span>
                        <span v-if="store.subscribedServiceIds.includes(service.id)" class="text-xs bg-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 px-2 py-1 rounded-full font-semibold border border-indigo-200 dark:border-indigo-500/30">Subscribed</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </transition>
            </li>
          </ul>
        </div>

        <div v-if="store.subscribedServiceIds.length > 0" class="mt-8 p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
          <p class="text-md text-indigo-300">
            <span class="font-semibold">Currently Selected Subscriptions ({{ store.subscribedServiceIds.length }}):</span>
            {{ selectedServiceNames }}
          </p>
        </div>
        <div class="mt-10 text-center">
          <button
            @click="navigateToResults"
            class="px-8 py-3.5 text-lg font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 focus:ring-blue-500 shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            View Tailored Results →
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
import { computed, onMounted } from 'vue';
import { useStreamingStoreWithPersistence } from '@/stores/streamingStore';
import { useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';

const store = useStreamingStoreWithPersistence();
const router = useRouter();
useTheme();

onMounted(() => {
  const isDesktop = window.matchMedia('(min-width: 640px)').matches;
  if (isDesktop) {
    store.expandedServiceCategories = store.allServicesGroupedByCategory.map(cat => cat.categoryName);
  } else {
    store.expandedServiceCategories = [];
        }
    });

const navigateToResults = () => {
    router.push('/results');
};

// NEW: Computed property for selected service names
const selectedServiceNames = computed(() => {
  // The store.subscribedServicesDetails getter already returns the full service objects
  // that are in the subscribedServiceIds list.
  return store.subscribedServicesDetails.map(service => service.name).join(', ');
});
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
