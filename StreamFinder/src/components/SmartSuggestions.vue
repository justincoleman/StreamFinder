<template>
  <div v-if="suggestions.length > 0" class="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 border-2 border-indigo-200 dark:border-indigo-400 p-6 rounded-lg mb-6">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full">
          <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-bold font-display text-indigo-800 dark:text-indigo-200 uppercase tracking-wide">Smart Suggestions</h3>
          <p class="text-sm text-indigo-600 dark:text-indigo-300 font-sans">Popular bundles based on real user data</p>
        </div>
      </div>
      <button
        @click="refreshSuggestions"
        :disabled="isRefreshing"
        class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition disabled:opacity-50"
      >
        <svg v-if="!isRefreshing" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <div class="grid gap-3">
      <div
        v-for="suggestion in suggestions"
        :key="suggestion.bundleHash"
        class="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-600 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        @click="applySuggestion(suggestion)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <div class="flex items-center gap-1">
                <svg class="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span class="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {{ suggestion.popularity }} users chose this
                </span>
              </div>
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                ${{ suggestion.totalPrice?.toFixed(2) || 'N/A' }}
              </div>
            </div>

            <div class="mb-3">
              <div class="flex flex-wrap gap-1 mb-2">
                <span
                  v-for="leagueId in suggestion.leagueIds?.slice(0, 6) || []"
                  :key="leagueId"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium rounded-full"
                >
                  <span>{{ getLeagueIcon(leagueId) }}</span>
                  <span>{{ leagueId.toUpperCase() }}</span>
                </span>
                <span v-if="(suggestion.leagueIds?.length || 0) > 6" class="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full">
                  +{{ (suggestion.leagueIds?.length || 0) - 6 }} more
                </span>
              </div>

              <div class="flex flex-wrap gap-1">
                <span
                  v-for="serviceId in suggestion.serviceIds?.slice(0, 4) || []"
                  :key="serviceId"
                  class="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded-full"
                >
                  {{ formatServiceName(serviceId) }}
                </span>
                <span v-if="(suggestion.serviceIds?.length || 0) > 4" class="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full">
                  +{{ (suggestion.serviceIds?.length || 0) - 4 }} more
                </span>
              </div>
            </div>

            <div class="text-xs text-gray-600 dark:text-gray-400">
              Last used: {{ formatDate(suggestion.lastGenerated) }}
            </div>
          </div>

          <div class="ml-4 flex-shrink-0">
            <button class="p-2 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800 text-indigo-600 dark:text-indigo-300 rounded-lg transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Show loading state while fetching -->
      <div v-if="isLoading" class="flex items-center justify-center py-8">
        <div class="flex items-center gap-3">
          <svg class="animate-spin h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span class="text-indigo-600 dark:text-indigo-400 font-medium">Loading smart suggestions...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAnalytics } from '@/composables/useAnalytics'
import { useStreamingStoreWithPersistence } from '@/stores/streamingStore'

const props = defineProps({
  selectedLeagueIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['apply-suggestion'])

const store = useStreamingStoreWithPersistence()
const { getPopularBundles } = useAnalytics()

const suggestions = ref([])
const isLoading = ref(false)
const isRefreshing = ref(false)

// Load suggestions when component mounts or leagues change
onMounted(() => {
  loadSuggestions()
})

watch(() => props.selectedLeagueIds, () => {
  loadSuggestions()
}, { deep: true })

async function loadSuggestions() {
  if (props.selectedLeagueIds.length === 0) {
    suggestions.value = []
    return
  }

  isLoading.value = true
  try {
    const popularBundles = await getPopularBundles(props.selectedLeagueIds, 3)
    suggestions.value = popularBundles
  } catch (error) {
    console.warn('Failed to load smart suggestions:', error)
    suggestions.value = []
  } finally {
    isLoading.value = false
  }
}

async function refreshSuggestions() {
  isRefreshing.value = true
  try {
    const popularBundles = await getPopularBundles(props.selectedLeagueIds, 3)
    suggestions.value = popularBundles
  } catch (error) {
    console.warn('Failed to refresh suggestions:', error)
  } finally {
    isRefreshing.value = false
  }
}

function applySuggestion(suggestion) {
  emit('apply-suggestion', suggestion)
}

function getLeagueIcon(leagueId) {
  const league = store.allLeaguesFlat.find(l => l.id === leagueId)
  return league?.icon || '🏆'
}

function formatServiceName(serviceId) {
  return serviceId
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

function formatDate(dateString) {
  if (!dateString) return 'Recently'
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInHours < 48) return 'Yesterday'
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
  return `${Math.floor(diffInHours / 168)}w ago`
}
</script>