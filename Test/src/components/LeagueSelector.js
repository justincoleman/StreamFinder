<template>
    <div class="league-selector space-y-8">
        <div v-if="Object.keys(store.allLeaguesByCategory).length === 0" class="text-center text-gray-500 py-10">
            <p class="text-xl">No leagues available to select.</p>
            <p class="text-sm mt-2">Please check the data source for leagues.</p>
        </div>
        <div v-for="(leagues, categoryName) in store.allLeaguesByCategory" :key="categoryName"
            class="p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-200/80">
            <div class="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                <h3 class="text-xl sm:text-2xl font-semibold text-gray-800">{{ categoryName }}</h3>
                <div v-if="leagues && leagues.length > 0" class="flex items-center">
                    <input type="checkbox"
                           :id="getCategoryCheckboxId(categoryName)"
                           :checked="areAllLeaguesInCategorySelected(categoryName)"
                           @change="toggleSelectAllLeaguesInCategory(categoryName, $event.target.checked)"
                           class="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer">
                    <label :for="getCategoryCheckboxId(categoryName)" class="ml-2 text-sm font-medium text-gray-700 cursor-pointer select-none">
                        Select All
                    </label>
                </div>
            </div>
            <div v-if="leagues && leagues.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
                <div v-for="league in leagues" :key="league.id"
                    @click="store.toggleLeagueSelection(league.id)"
                    :class="[
                        'p-3.5 border rounded-lg cursor-pointer transition-all duration-200 ease-in-out flex items-center space-x-3 group',
                        store.selectedLeagueIds.includes(league.id)
                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500 shadow-md'
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    ]">
                    <input type="checkbox"
                           :checked="store.selectedLeagueIds.includes(league.id)"
                           @change.stop="store.toggleLeagueSelection(league.id)"
                           class="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0 cursor-pointer accent-blue-600">
                    <img v-if="league.logo" :src="league.logo" :alt="league.name + ' logo'" class="h-7 w-7 sm:h-8 sm:w-8 object-contain flex-shrink-0">
                    <span :class="['text-sm sm:text-base font-medium group-hover:text-blue-700', store.selectedLeagueIds.includes(league.id) ? 'text-blue-700' : 'text-gray-700']">
                        {{ league.name }}
                    </span>
                </div>
            </div>
            <div v-else class="text-sm text-gray-500">
                No leagues listed in this category.
            </div>
        </div>
    </div>
</template>

<script setup>
import { useStreamingStore } from '@/stores/streamingStore';
import { computed } from 'vue';

const store = useStreamingStore();

// Helper function to generate a unique ID for the checkbox label association
const getCategoryCheckboxId = (categoryName) => {
    return 'select-all-' + categoryName.toLowerCase().replace(/\s+/g, '-');
};

const areAllLeaguesInCategorySelected = (categoryName) => {
    const leaguesInCategory = store.allLeaguesByCategory[categoryName] || [];
    if (leaguesInCategory.length === 0) return false;
    return leaguesInCategory.every(league => store.selectedLeagueIds.includes(league.id));
};

const toggleSelectAllLeaguesInCategory = (categoryName, shouldSelect) => {
    const leaguesInCategory = store.allLeaguesByCategory[categoryName] || [];
    leaguesInCategory.forEach(league => {
        const isSelected = store.selectedLeagueIds.includes(league.id);
        if (shouldSelect && !isSelected) {
            store.toggleLeagueSelection(league.id);
        } else if (!shouldSelect && isSelected) {
            store.toggleLeagueSelection(league.id);
        }
    });
};
</script>

<style scoped>
/* Add component-specific styles here if needed */
.league-selector {
    /* Example: Adjust spacing or global styles for this component */
}
</style>