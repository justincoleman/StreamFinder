<template>
    <div class="container mx-auto p-4 sm:p-6 min-h-screen bg-gray-50">
        <header class="mb-8 text-center">
            <h1 class="text-2xl sm:text-3xl font-bold text-blue-700">Your Subscriptions</h1>
            <p class="text-md sm:text-lg text-gray-600 mt-2">
                Select any streaming services you are already subscribed to. This will help us find the most cost-effective options.
            </p>
        </header>

        <main class="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-xl">
            <div v-if="Object.keys(store.servicesByType).length === 0" class="text-center text-gray-500 py-10">
                <p class="text-xl">No streaming services available to select.</p>
                <p class="text-sm mt-2">Please check the data source for streaming services.</p>
            </div>

            <div class="space-y-8" v-else>
                <div v-for="(services, typeName) in store.servicesByType" :key="typeName"
                    class="p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-200/80">
                    <div class="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                        <h3 class="text-xl sm:text-2xl font-semibold text-gray-800">{{ typeName }}</h3>
                         <div v-if="services && services.length > 0" class="flex items-center">
                            <input type="checkbox"
                                   :id="getServiceTypeCheckboxId(typeName)"
                                   :checked="areAllServicesInTypeSelected(typeName)"
                                   @change="toggleSelectAllServicesInType(typeName, $event.target.checked)"
                                   class="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:ring-offset-1 cursor-pointer">
                            <label :for="getServiceTypeCheckboxId(typeName)" class="ml-2 text-sm font-medium text-gray-700 cursor-pointer select-none">
                                Select All
                            </label>
                        </div>
                    </div>
                    <div v-if="services && services.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <StreamingServiceCard
                            v-for="service in services"
                            :key="service.id"
                            :service="service"
                            :is-selected="store.subscribedServiceIds.includes(service.id)"
                            @toggle-selection="store.toggleSubscribedService(service.id)"
                        />
                    </div>
                     <div v-else class="text-sm text-gray-500">
                        No services listed in this category.
                    </div>
                </div>
            </div>

            <div class="mt-10 text-center space-x-4">
                <button @click="navigateToResults"
                        class="px-6 py-3 text-md sm:text-lg font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md hover:shadow-lg bg-green-500 text-white hover:bg-green-600 focus:ring-green-400">
                    Find My Streams &rarr;
                </button>
                 <button @click="skipStep"
                        class="px-6 py-3 text-md sm:text-lg font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md hover:shadow-lg bg-gray-400 text-white hover:bg-gray-500 focus:ring-gray-300">
                    Skip This Step
                </button>
            </div>
        </main>

        <footer class="text-center mt-12 py-6 text-sm text-gray-500">
            <p>&copy; {{ new Date().getFullYear() }} StreamFinder. All rights reserved.</p>
        </footer>
    </div>
</template>

<script setup>
import { useStreamingStore } from '@/stores/streamingStore';
import { useRouter } from 'vue-router';
import StreamingServiceCard from '@/components/StreamingServiceCard.vue';

const store = useStreamingStore();
const router = useRouter();

// Helper function to generate a unique ID for the checkbox label association
const getServiceTypeCheckboxId = (typeName) => {
    return 'select-all-service-' + typeName.toLowerCase().replace(/\s+/g, '-');
};

const areAllServicesInTypeSelected = (typeName) => {
    const servicesInType = store.servicesByType[typeName] || [];
    if (servicesInType.length === 0) return false;
    return servicesInType.every(service => store.subscribedServiceIds.includes(service.id));
};

const toggleSelectAllServicesInType = (typeName, shouldSelect) => {
    const servicesInType = store.servicesByType[typeName] || [];
    servicesInType.forEach(service => {
        const isSelected = store.subscribedServiceIds.includes(service.id);
        if (shouldSelect && !isSelected) {
            store.toggleSubscribedService(service.id);
        } else if (!shouldSelect && isSelected) {
            store.toggleSubscribedService(service.id);
        }
    });
};

const navigateToResults = () => {
    // Results are calculated on ResultsView mount if needed, or can be triggered here
    // store.calculateBundleOptions(); // Optionally trigger here
    router.push('/results');
};

const skipStep = () => {
    // Clear any selected subscriptions if skipping means no pre-selected ones
    // store.subscribedServiceIds.value = []; // This is a design choice
    // store.calculateBundleOptions(); // Recalculate with (potentially) no subscriptions
    router.push('/results');
};
</script>

<style scoped>
/* Add any view-specific styles here if needed */
</style>