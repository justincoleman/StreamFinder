<template>
  <div class="container mx-auto p-4 sm:p-6 min-h-screen bg-gray-25 max-w-full sm:max-w-xl">
    <header class="mb-8">
      <div class="flex justify-start items-center mb-4">
        <router-link to="/" class="text-blue-600 hover:text-blue-800 transition-colors duration-150 flex items-center text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 mr-1">
            <path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
          </svg>
          Back to League Selection
        </router-link>
      </div>
      <div class="text-center">
        <h1 class="text-2xl sm:text-4xl font-bold text-blue-700">My Current Subscriptions</h1>
        <p class="text-base sm:text-lg text-gray-600 mt-2">
          Select any streaming services you already subscribe to. This will help us tailor your results.
        </p>
      </div>
    </header>

    <main class="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-xl">
      <div class="mb-6 flex space-x-3">
        <button
          @click="store.selectAllServices()"
          class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
        >
          Select All My Services
        </button>
        <button
          @click="store.unselectAllServices()"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors duration-150"
        >
          Unselect All
        </button>
      </div>

      <div class="space-y-4">
        <div v-for="category in store.allServicesGroupedByCategory" :key="category.categoryName" class="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <button
            @click="store.toggleServiceCategoryExpansion(category.categoryName)"
            class="w-full flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200 transition-colors duration-150 focus:outline-none"
          >
            <div class="flex items-center">
              <span class="text-2xl mr-3">{{ category.icon }}</span>
              <span class="font-semibold text-lg text-gray-800">{{ category.categoryName }}</span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="w-6 h-6 text-gray-600 transition-transform duration-200"
              :class="{'rotate-180': store.expandedServiceCategories.includes(category.categoryName)}"
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
            <div v-show="store.expandedServiceCategories.includes(category.categoryName)" class="p-4 bg-white">
              <div class="space-y-2">
                <button
                  v-for="service in category.services"
                  :key="service.id"
                  @click="store.toggleServiceSubscription(service.id)"
                  :class="[
                    'w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-between shadow-sm hover:shadow-md',
                    store.subscribedServiceIds.includes(service.id)
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-indigo-400'
                  ]"
                >
                  <span>{{ service.name }}</span>
                  <span v-if="store.subscribedServiceIds.includes(service.id)" class="text-xs bg-white text-indigo-700 px-1.5 py-0.5 rounded-full font-semibold">Subscribed</span>
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <div v-if="store.subscribedServiceIds.length > 0" class="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
        <p class="text-md text-indigo-700">
          <span class="font-semibold">Currently Selected Subscriptions ({{ store.subscribedServiceIds.length }}):</span>
          {{ selectedServiceNames }}
        </p>
      </div>
      <div class="mt-10 text-center">
        <button
          @click="navigateToResults"
          class="px-8 py-3 text-md sm:text-lg font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 transition-colors duration-150 shadow-md hover:shadow-lg"
        >
          View Tailored Results →
        </button>
      </div>
    </main>

    <footer class="text-center mt-12 py-6 text-sm text-gray-500">
      <p>© {{ new Date().getFullYear() }} StreamFinder. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useStreamingStoreWithPersistence } from '@/stores/streamingStore';
import { useRouter } from 'vue-router';

const store = useStreamingStoreWithPersistence();
const router = useRouter();

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
