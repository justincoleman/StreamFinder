<template>
  <div class="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 border-2 border-purple-200 dark:border-purple-400 p-4 sm:p-6 rounded-lg">
    <!-- Header -->
    <div class="text-center mb-6 sm:mb-8">
      <div class="flex items-center justify-center gap-2 sm:gap-3 mb-2">
        <div class="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
          <svg class="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold font-display text-purple-800 dark:text-purple-200 uppercase tracking-wide">
          Popular Bundles
        </h2>
      </div>
      <p class="text-base sm:text-lg text-purple-600 dark:text-purple-300 font-sans">
        The most chosen streaming bundles by our users
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-8 sm:py-12">
      <div class="flex items-center gap-3">
        <svg class="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span class="text-purple-600 dark:text-purple-400 font-medium text-sm sm:text-base">Loading popular bundles...</span>
      </div>
    </div>

    <!-- Podium Display -->
    <div v-else-if="topBundles.length > 0" class="relative">

      <!-- Info Message for Limited Data -->
      <div v-if="topBundles.length < 3" class="text-center mb-4 sm:mb-6">
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
          <div class="flex items-center justify-center gap-2 mb-2">
            <span class="text-blue-500 text-base sm:text-lg">ℹ️</span>
            <span class="text-blue-700 dark:text-blue-300 font-medium text-sm sm:text-base">
              {{ topBundles.length === 1 ? 'Only one popular bundle so far!' : `Only ${topBundles.length} popular bundles so far!` }}
            </span>
          </div>
          <p class="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
            More bundles will appear here as users create and share their preferences.
          </p>
        </div>
      </div>

      <!-- Mobile Stack Layout (< sm) -->
      <div class="sm:hidden space-y-4 mb-6">
        <!-- 1st Place (Mobile) -->
        <div v-if="topBundles[0]" class="bg-white dark:bg-slate-800 border-2 border-yellow-400 rounded-lg p-4 shadow-xl">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-8 h-8 bg-gradient-to-t from-yellow-500 to-yellow-400 border border-yellow-600 rounded-full flex items-center justify-center">
              <span class="text-white font-bold text-sm">🥇</span>
            </div>
            <div class="flex-1">
              <div class="text-lg font-bold text-gray-700 dark:text-gray-300">
                {{ generateBundleName(topBundles[0]) }}
              </div>
              <div class="text-xl font-bold text-green-600 dark:text-green-400">
                ${{ topBundles[0].totalPrice?.toFixed(2) }}
              </div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex flex-wrap gap-1">
              <span v-for="leagueId in topBundles[0].leagueIds?.slice(0, 4)" :key="leagueId"
                class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                {{ leagueId.toUpperCase() }}
              </span>
              <span v-if="(topBundles[0].leagueIds?.length || 0) > 4"
                class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                +{{ (topBundles[0].leagueIds?.length || 0) - 4 }}
              </span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {{ topBundles[0].popularity }} users chose this
            </div>
          </div>
        </div>

        <!-- 2nd Place (Mobile) -->
        <div v-if="topBundles[1]" class="bg-white dark:bg-slate-800 border-2 border-gray-400 rounded-lg p-4 shadow-lg">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-8 h-8 bg-gradient-to-t from-gray-400 to-gray-300 border border-gray-500 rounded-full flex items-center justify-center">
              <span class="text-white font-bold text-sm">2</span>
            </div>
            <div class="flex-1">
              <div class="text-base font-bold text-gray-700 dark:text-gray-300">
                {{ generateBundleName(topBundles[1]) }}
              </div>
              <div class="text-lg font-bold text-green-600 dark:text-green-400">
                ${{ topBundles[1].totalPrice?.toFixed(2) }}
              </div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex flex-wrap gap-1">
              <span v-for="leagueId in topBundles[1].leagueIds?.slice(0, 3)" :key="leagueId"
                class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                {{ leagueId.toUpperCase() }}
              </span>
              <span v-if="(topBundles[1].leagueIds?.length || 0) > 3"
                class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                +{{ (topBundles[1].leagueIds?.length || 0) - 3 }}
              </span>
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">
              {{ topBundles[1].popularity }} users
            </div>
          </div>
        </div>

        <!-- 3rd Place (Mobile) -->
        <div v-if="topBundles[2]" class="bg-white dark:bg-slate-800 border-2 border-amber-600 rounded-lg p-4 shadow-lg">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-8 h-8 bg-gradient-to-t from-amber-700 to-amber-600 border border-amber-700 rounded-full flex items-center justify-center">
              <span class="text-white font-bold text-sm">3</span>
            </div>
            <div class="flex-1">
              <div class="text-base font-bold text-gray-700 dark:text-gray-300">
                {{ generateBundleName(topBundles[2]) }}
              </div>
              <div class="text-lg font-bold text-green-600 dark:text-green-400">
                ${{ topBundles[2].totalPrice?.toFixed(2) }}
              </div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex flex-wrap gap-1">
              <span v-for="leagueId in topBundles[2].leagueIds?.slice(0, 3)" :key="leagueId"
                class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                {{ leagueId.toUpperCase() }}
              </span>
              <span v-if="(topBundles[2].leagueIds?.length || 0) > 3"
                class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                +{{ (topBundles[2].leagueIds?.length || 0) - 3 }}
              </span>
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">
              {{ topBundles[2].popularity }} users
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop Podium Base (sm+) -->
      <div class="hidden sm:flex items-end justify-center gap-2 lg:gap-4 mb-6 lg:mb-8">
        <!-- 2nd Place (Left) - Only show if exists -->
        <div v-if="topBundles[1]" class="flex flex-col items-center">
          <div class="bg-white dark:bg-slate-800 border-2 border-gray-400 rounded-lg p-3 lg:p-4 w-32 sm:w-40 lg:w-48 mb-3 lg:mb-4 shadow-lg transform hover:scale-105 transition">
            <div class="text-center mb-2 lg:mb-3">
              <div class="text-sm lg:text-lg font-bold text-gray-700 dark:text-gray-300 mb-1 lg:mb-2">
                {{ generateBundleName(topBundles[1]) }}
              </div>
              <div class="text-lg lg:text-2xl font-bold text-green-600 dark:text-green-400">
                ${{ topBundles[1].totalPrice?.toFixed(2) }}
              </div>
            </div>
            <div class="space-y-1 lg:space-y-2">
              <div class="flex flex-wrap gap-1 justify-center">
                <span v-for="leagueId in topBundles[1].leagueIds?.slice(0, 3)" :key="leagueId"
                  class="text-xs bg-purple-100 text-purple-800 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full">
                  {{ leagueId.toUpperCase() }}
                </span>
                <span v-if="(topBundles[1].leagueIds?.length || 0) > 3"
                  class="text-xs bg-gray-100 text-gray-600 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full">
                  +{{ (topBundles[1].leagueIds?.length || 0) - 3 }}
                </span>
              </div>
              <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                {{ topBundles[1].popularity }} users
              </div>
            </div>
          </div>
          <div class="w-24 sm:w-28 lg:w-32 h-12 lg:h-16 bg-gradient-to-t from-gray-400 to-gray-300 border-2 border-gray-500 rounded-t-lg flex items-center justify-center">
            <span class="text-white font-bold text-xs lg:text-sm">2nd</span>
          </div>
        </div>

        <!-- 1st Place (Center, Taller) - Always show if any data exists -->
        <div v-if="topBundles[0]" class="flex flex-col items-center">
          <div class="bg-white dark:bg-slate-800 border-2 border-yellow-400 rounded-lg p-4 lg:p-6 w-36 sm:w-44 lg:w-56 mb-3 lg:mb-4 shadow-xl transform hover:scale-105 transition">
            <div class="text-center mb-3 lg:mb-4">
              <div class="text-base lg:text-xl font-bold text-gray-700 dark:text-gray-300 mb-2 lg:mb-3">
                {{ generateBundleName(topBundles[0]) }}
              </div>
              <div class="text-xl lg:text-3xl font-bold text-green-600 dark:text-green-400">
                ${{ topBundles[0].totalPrice?.toFixed(2) }}
              </div>
            </div>
            <div class="space-y-2 lg:space-y-3">
              <div class="flex flex-wrap gap-1 justify-center">
                <span v-for="leagueId in topBundles[0].leagueIds?.slice(0, 4)" :key="leagueId"
                  class="text-xs bg-yellow-100 text-yellow-800 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full font-medium">
                  {{ leagueId.toUpperCase() }}
                </span>
                <span v-if="(topBundles[0].leagueIds?.length || 0) > 4"
                  class="text-xs bg-gray-100 text-gray-600 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full">
                  +{{ (topBundles[0].leagueIds?.length || 0) - 4 }}
                </span>
              </div>
              <div class="text-xs lg:text-sm text-center text-gray-600 dark:text-gray-400 font-medium">
                {{ topBundles[0].popularity }} users chose this
              </div>
            </div>
          </div>
          <div class="w-24 sm:w-28 lg:w-32 h-16 lg:h-24 bg-gradient-to-t from-yellow-500 to-yellow-400 border-2 border-yellow-600 rounded-t-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm lg:text-base">{{ topBundles.length === 1 ? '🥇' : '1st' }}</span>
          </div>
        </div>

        <!-- 3rd Place (Right) - Only show if exists -->
        <div v-if="topBundles[2]" class="flex flex-col items-center">
          <div class="bg-white dark:bg-slate-800 border-2 border-amber-600 rounded-lg p-3 lg:p-4 w-32 sm:w-40 lg:w-48 mb-3 lg:mb-4 shadow-lg transform hover:scale-105 transition">
            <div class="text-center mb-2 lg:mb-3">
              <div class="text-sm lg:text-lg font-bold text-gray-700 dark:text-gray-300 mb-1 lg:mb-2">
                {{ generateBundleName(topBundles[2]) }}
              </div>
              <div class="text-lg lg:text-2xl font-bold text-green-600 dark:text-green-400">
                ${{ topBundles[2].totalPrice?.toFixed(2) }}
              </div>
            </div>
            <div class="space-y-1 lg:space-y-2">
              <div class="flex flex-wrap gap-1 justify-center">
                <span v-for="leagueId in topBundles[2].leagueIds?.slice(0, 3)" :key="leagueId"
                  class="text-xs bg-purple-100 text-purple-800 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full">
                  {{ leagueId.toUpperCase() }}
                </span>
                <span v-if="(topBundles[2].leagueIds?.length || 0) > 3"
                  class="text-xs bg-gray-100 text-gray-600 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full">
                  +{{ (topBundles[2].leagueIds?.length || 0) - 3 }}
                </span>
              </div>
              <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                {{ topBundles[2].popularity }} users
              </div>
            </div>
          </div>
          <div class="w-24 sm:w-28 lg:w-32 h-8 lg:h-12 bg-gradient-to-t from-amber-700 to-amber-600 border-2 border-amber-700 rounded-t-lg flex items-center justify-center">
            <span class="text-white font-bold text-xs lg:text-sm">3rd</span>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div class="text-center">
        <button @click="refreshBundles" :disabled="isRefreshing"
          class="px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold font-display uppercase tracking-wider rounded-lg transition disabled:opacity-50 text-sm sm:text-base">
          <svg v-if="!isRefreshing" class="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <svg v-else class="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ isRefreshing ? 'Refreshing...' : 'Refresh Data' }}
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8 sm:py-12">
      <div class="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
        <span class="text-xl sm:text-2xl">📊</span>
      </div>
      <h3 class="text-base sm:text-lg font-bold font-display text-gray-600 dark:text-gray-400 mb-2">No Data Yet</h3>
      <p class="text-xs sm:text-sm font-sans text-gray-500 dark:text-gray-500">
        Popular bundles will appear here as users create more bundles.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAnalytics } from '@/composables/useAnalytics'

const { getPopularBundles } = useAnalytics()

const topBundles = ref([])
const isLoading = ref(false)
const isRefreshing = ref(false)

onMounted(() => {
  loadPopularBundles()
})

async function loadPopularBundles() {
  isLoading.value = true
  try {
    // Get top 3 popular bundles without filtering by leagues
    const bundles = await getPopularBundles([], 3)
    topBundles.value = bundles
  } catch (error) {
    console.warn('Failed to load popular bundles:', error)
    topBundles.value = []
  } finally {
    isLoading.value = false
  }
}

async function refreshBundles() {
  isRefreshing.value = true
  try {
    const bundles = await getPopularBundles([], 3)
    topBundles.value = bundles
  } catch (error) {
    console.warn('Failed to refresh popular bundles:', error)
  } finally {
    isRefreshing.value = false
  }
}

function generateBundleName(bundle) {
  if (!bundle || !bundle.leagueIds || bundle.leagueIds.length === 0) {
    return 'Mystery Bundle'
  }

  const leagues = bundle.leagueIds
  const leagueCount = leagues.length

  // Analyze league composition
  const soccerLeagues = leagues.filter(l => ['epl', 'mls', 'laliga', 'bundesliga', 'seriea', 'ligue1', 'ucl', 'uel'].includes(l))
  const americanSports = leagues.filter(l => ['nfl', 'nba', 'mlb', 'nhl'].includes(l))
  const collegeLeagues = leagues.filter(l => ['ncaa_football', 'ncaa_basketball'].includes(l))
  const motorsports = leagues.filter(l => ['f1'].includes(l))
  const olympics = leagues.filter(l => ['summer_olympics', 'winter_olympics'].includes(l))

  // Name generation logic - Check specific combinations FIRST before generic ones

  // Specific sport focuses (check these before broad categories)
  if (leagues.includes('nfl') && leagues.includes('ncaa_football') && !leagues.includes('nba')) {
    const names = ['Football Fanatic', 'Gridiron Glory', 'Touchdown Bundle', 'Pigskin Package', 'Football Central']
    return names[Math.floor(Math.random() * names.length)]
  }

  if (leagues.includes('nba') && leagues.includes('ncaa_basketball') && !leagues.includes('nfl')) {
    const names = ['Hoops Heaven', 'Basketball Bonanza', 'Court Kings', 'Slam Dunk Special', 'Hardwood Heroes']
    return names[Math.floor(Math.random() * names.length)]
  }

  // Soccer + Motorsports combination
  if (soccerLeagues.length >= 3 && motorsports.length > 0) {
    const names = ['Global Sports Elite', 'International Sports Fan', 'European Sports Pack', 'Speed & Soccer Bundle', 'Global Competition Package']
    return names[Math.floor(Math.random() * names.length)]
  }

  // Soccer-focused bundles (must be majority soccer)
  if (soccerLeagues.length >= 3 && soccerLeagues.length / leagueCount >= 0.6) {
    const names = ['Global Football Fan', 'Soccer Central', 'The Beautiful Game', 'Football Worldwide', 'Pitch Perfect Bundle']
    return names[Math.floor(Math.random() * names.length)]
  }

  // American sports focused (must be majority American sports)
  if (americanSports.length >= 3 && americanSports.length / leagueCount >= 0.6) {
    const names = ['All-American Sports', 'USA Sports Special', 'Big League Bundle', 'American Classic', 'Stars & Stripes Sports']
    return names[Math.floor(Math.random() * names.length)]
  }

  // College sports focused
  if (collegeLeagues.length >= 1 && collegeLeagues.length / leagueCount >= 0.4) {
    const names = ['College Game Day', 'Campus Sports Pack', 'Student Section Special', 'NCAA Madness', 'University Bundle']
    return names[Math.floor(Math.random() * names.length)]
  }

  // Individual sport focuses (smaller bundles)
  if (leagues.includes('mlb') && leagueCount <= 3) {
    const names = ['Baseball Basics', 'Diamond Dreams', 'Home Run Bundle', 'Baseball Fan', 'America\'s Pastime']
    return names[Math.floor(Math.random() * names.length)]
  }

  if (motorsports.length > 0 && leagueCount <= 3) {
    const names = ['Speed Demon', 'Racing Enthusiast', 'Fast Lane Bundle', 'Motor Madness', 'High Octane Package']
    return names[Math.floor(Math.random() * names.length)]
  }

  if (olympics.length > 0) {
    const names = ['Olympic Dreams', 'Games Bundle', 'Medal Contender', 'Olympic Spirit', 'Global Games Package']
    return names[Math.floor(Math.random() * names.length)]
  }

  // Premier League specific
  if (leagues.includes('epl') && soccerLeagues.length <= 2 && leagueCount <= 4) {
    const names = ['Premier Fan', 'EPL Enthusiast', 'English Football', 'Premier Package', 'Manchester to Liverpool']
    return names[Math.floor(Math.random() * names.length)]
  }

  // Budget-conscious bundles (fewer leagues)
  if (leagueCount <= 2) {
    const names = ['Essential Sports', 'Sports Starter', 'Basic Fan Bundle', 'Core Package', 'Sports Essentials']
    return names[Math.floor(Math.random() * names.length)]
  }

  // Mixed/balanced bundles (medium size)
  if (leagueCount >= 4 && leagueCount <= 6) {
    const names = ['Sports Variety Pack', 'Fan Favorites', 'Balanced Bundle', 'Sports Sampler', 'The Well-Rounded Fan']
    return names[Math.floor(Math.random() * names.length)]
  }

  // Complete coverage - ONLY for truly comprehensive bundles (10+ leagues)
  if (leagueCount >= 10) {
    const names = ['The Everything Package', 'Sports Omnibus', 'Ultimate Fan Bundle', 'Complete Coverage', 'The Sports Universe']
    return names[Math.floor(Math.random() * names.length)]
  }

  // Large but focused bundles (7-9 leagues)
  if (leagueCount >= 7) {
    const names = ['Premium Sports Pack', 'Sports Enthusiast Bundle', 'Major Leagues Package', 'Sports Aficionado', 'Championship Collection']
    return names[Math.floor(Math.random() * names.length)]
  }

  // Default fallback
  const fallbackNames = ['Sports Special', 'Fan Bundle', 'Custom Package', 'Sports Selection', 'Viewer\'s Choice']
  return fallbackNames[Math.floor(Math.random() * fallbackNames.length)]
}
</script>