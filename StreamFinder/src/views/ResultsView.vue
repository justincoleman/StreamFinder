<template>
  <div class="min-h-screen bg-white dark:bg-slate-900">
    <div class="container mx-auto p-4 sm:p-6 max-w-full sm:max-w-2xl">
      <header class="mb-8 text-center">
        <img src="@/assets/StreamFinderLogo.svg" alt="StreamFinder Logo" class="mx-auto mb-4 transform hover:scale-105 transition-transform duration-300" style="height:80px;width:auto;" />
        <p class="text-lg sm:text-xl font-display font-bold text-black mt-4 leading-relaxed dark:text-white">
          Find the best streaming bundle for your favorite sports leagues—instantly.
        </p>
        <!--
        <div class="flex justify-center gap-4 mt-6">
          <button @click="toggleTheme" class="px-4 py-2 border-4 border-black bg-white text-black font-extrabold font-mono uppercase tracking-widest hover:bg-black hover:text-white dark:bg-black dark:text-white dark:border-primary transition">
            Toggle {{ theme === 'dark' ? 'Light' : 'Dark' }} Mode
          </button>
          <button v-if="isManual" @click="resetTheme" class="px-4 py-2 border-4 border-black bg-white text-black font-extrabold font-mono uppercase tracking-widest hover:bg-black hover:text-white dark:bg-black dark:text-white dark:border-primary transition">
            Reset to System
          </button>
        </div>
        -->
      </header>

      <!-- Navigation -->
      <NavBar
        :activeTab="activeTab"
        @tab-changed="activeTab = $event"
      />

      <!-- Leaderboard View -->
      <div v-if="activeTab === 'leaderboard'">
        <PopularBundles />
      </div>

      <!-- Bundle Builder View -->
      <div v-else-if="activeTab === 'builder'">
        <!-- Expand/collapse toggle -->
        <div v-if="selectionCollapsed" class="mb-6">
          <!-- Current Selection Summary -->
          <div class="bg-white dark:bg-[#181824] border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="font-bold font-display text-black dark:text-white mb-2">Current Selection:</h3>
                <div class="flex flex-wrap gap-1 mb-2">
                  <span v-for="league in store.selectedLeagues.slice(0, 4)" :key="league.id"
                    class="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary-dark text-xs font-medium rounded-full">
                    <span>{{ league.icon }}</span>
                    <span>{{ league.name }}</span>
                  </span>
                  <span v-if="store.selectedLeagues.length > 4"
                    class="inline-flex items-center px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full">
                    +{{ store.selectedLeagues.length - 4 }} more
                  </span>
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  Budget: ${{ maxPrice }} •
                  Preferences: {{ showPreferences ? 'Customized' : 'Default' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Expand Button -->
          <div class="flex justify-center">
            <button @click="selectionCollapsed = false" class="px-6 py-3 bg-primary text-black font-bold font-display uppercase tracking-widest rounded-lg shadow hover:bg-black hover:text-white transition text-lg">
              <span class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Selections
              </span>
            </button>
          </div>
        </div>

        <!-- Selection Controls -->
        <transition name="fade-slide">
          <section v-show="!selectionCollapsed" ref="selectionRef" class="bg-white border-4 border-black p-4 sm:p-6 mb-8 flex flex-col gap-6 mb-10 dark:bg-[#181824] dark:border-primary rounded-lg">

            <!-- Step 1: League Selection -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <h2 class="text-2xl font-bold font-display text-primary uppercase tracking-wider">
                  <span class="inline-flex items-center gap-2">
                    <span class="w-8 h-8 bg-primary text-black rounded-full flex items-center justify-center font-bold text-lg">1</span>
                    Select Leagues
                  </span>
                </h2>
                <div class="flex items-center gap-2">
                  <div v-if="store.selectedLeagueIds.length > 0" class="text-sm text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900 px-3 py-1 rounded-full">
                    ✓ {{ store.selectedLeagueIds.length }} selected
                  </div>
                  <button
                    v-if="store.selectedLeagueIds.length > 0"
                    @click="clearAllSelections"
                    class="px-3 py-1 border-2 border-red-500 bg-red-50 text-red-700 font-medium font-sans text-sm hover:bg-red-500 hover:text-white dark:bg-red-900 dark:text-red-200 dark:border-red-400 dark:hover:bg-red-600 rounded-lg transition"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                <label v-for="league in store.allLeaguesFlat" :key="league.id"
                  class="flex items-center gap-2 px-3 py-2 border-2 border-black bg-white cursor-pointer select-none hover:bg-primary/10 transition dark:bg-[#232336] dark:border-primary dark:hover:bg-primary/20 rounded-lg"
                  :class="{
                    'bg-primary text-black dark:bg-primary dark:text-black': store.selectedLeagueIds.includes(league.id),
                    'dark:bg-[#232336] dark:text-white': !store.selectedLeagueIds.includes(league.id)
                  }"
                >
                  <input type="checkbox" v-model="store.selectedLeagueIds" :value="league.id" class="accent-primary w-5 h-5 border-2 border-black dark:border-primary" />
                  <span class="text-lg">{{ league.icon }}</span>
                  <span class="text-base font-sans font-medium text-black dark:text-white"
                    :class="store.selectedLeagueIds.includes(league.id) ? 'text-black dark:text-black' : 'dark:text-white'"
                  >{{ league.name }}</span>
                </label>
              </div>
            </div>

            <!-- Step 2: League Preferences (Collapsible, Optional) -->
            <div v-if="store.selectedLeagueIds.length > 0" class="border-t-2 border-gray-200 dark:border-gray-600 pt-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-bold font-display text-primary uppercase tracking-wider">
                  <span class="inline-flex items-center gap-2">
                    <span class="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-lg">2</span>
                    League Importance
                    <span class="text-sm font-normal text-gray-600 dark:text-gray-400 ml-1">(Optional)</span>
                  </span>
                </h2>
                <div class="flex items-center gap-2">
                  <button
                    @click="showPreferences = !showPreferences"
                    class="px-3 py-2 border-2 border-amber-500 text-amber-700 font-medium font-sans text-sm hover:bg-amber-500 hover:text-white dark:bg-amber-900 dark:text-amber-200 dark:border-amber-400 dark:hover:bg-amber-600 rounded-lg transition"
                    :class="showPreferences ? 'bg-amber-500 text-white' : 'bg-amber-50'"
                  >
                    {{ showPreferences ? 'Hide Rankings' : 'Customize Rankings' }}
                  </button>
                  <div v-if="showPreferences" class="flex gap-2">
                    <button @click="resetLeaguePreferences" class="px-3 py-2 border-2 border-black bg-white text-black font-medium font-sans text-sm hover:bg-black hover:text-white dark:bg-[#232336] dark:text-white dark:border-primary dark:hover:bg-primary/20 rounded-lg">
                      Reset
                    </button>
                    <div class="preset-menu-container relative">
                      <button @click.stop="togglePresetMenu" class="px-3 py-2 border-2 border-black bg-white text-black font-medium font-sans text-sm hover:bg-black hover:text-white dark:bg-[#232336] dark:text-white dark:border-primary dark:hover:bg-primary/20 rounded-lg">
                        Quick Rank
                      </button>
                      <div v-if="showPresetMenu" class="preset-menu-container absolute top-full right-0 mt-1 z-50 bg-white dark:bg-[#181824] border-2 border-black dark:border-primary rounded-lg shadow-lg p-2 w-48">
                        <button
                          v-for="preset in rankingPresets"
                          :key="preset.name"
                          @click.stop="applyPreset(preset.rankingRules)"
                          class="block w-full text-left px-2 py-1 text-sm font-sans hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                        >
                          {{ preset.name }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <transition name="fade-slide">
                <div v-if="showPreferences">
                  <p class="text-sm font-sans text-gray-600 dark:text-gray-400 mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    💡 <strong>Tip:</strong> Higher importance leagues get priority in bundle recommendations. Leave as default if unsure.
                  </p>
                  <div class="space-y-3">
                    <div v-for="league in store.selectedLeagues" :key="league.id" class="flex flex-col gap-2 p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2 min-w-0">
                          <span class="text-lg">{{ league.icon }}</span>
                          <span class="text-sm font-sans font-medium text-black dark:text-white">{{ league.name }}</span>
                        </div>
                        <div class="flex-shrink-0">
                          <span class="text-xs font-sans font-medium px-2 py-1 rounded-full border" :class="getWeightColorClasses(store.leaguePreferences[league.id] || 3)">
                            {{ getWeightLabel(store.leaguePreferences[league.id] || 3) }}
                          </span>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="text-xs font-sans text-gray-500 whitespace-nowrap">Low</span>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          :value="store.leaguePreferences[league.id] || 3"
                          @input="updateLeaguePreference(league.id, $event.target.value)"
                          class="flex-1 accent-amber-500"
                        />
                        <span class="text-xs font-sans text-gray-500 whitespace-nowrap">High</span>
                      </div>
                    </div>
                  </div>
                </div>
              </transition>
            </div>

            <!-- Build Button - Always Visible When Leagues Selected -->
            <div v-if="store.selectedLeagueIds.length > 0" class="flex justify-center pt-6 border-t-2 border-gray-200 dark:border-gray-600">
              <button
                @click="handleBuild"
                :disabled="isLoading"
                class="px-8 py-4 border-4 border-black bg-primary text-black font-bold font-display text-xl uppercase tracking-widest transition disabled:opacity-40 disabled:cursor-not-allowed dark:bg-indigo-500 dark:text-white dark:border-primary rounded-lg hover:scale-105 hover:shadow-lg transform"
              >
                <span v-if="!isLoading" class="flex items-center gap-3">
                  <div class="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                    <svg class="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  Build My Bundle
                </span>
                <span v-else class="flex items-center gap-3">
                  <svg class="animate-spin h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Building your bundle...
                </span>
              </button>
            </div>

            <!-- Help Text When No Leagues Selected -->
            <div v-else class="text-center py-8">
              <div class="max-w-md mx-auto">
                <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="text-2xl">🎯</span>
                </div>
                <h3 class="text-lg font-bold font-display text-gray-600 dark:text-gray-400 mb-2">Get Started</h3>
                <p class="text-sm font-sans text-gray-500 dark:text-gray-500">
                  Select one or more leagues above to see your personalized streaming bundle recommendations.
                </p>
              </div>
            </div>
          </section>
        </transition>

        <!-- Enhanced Loading Animation -->
        <transition name="fade-slide">
          <div v-if="isLoading" ref="loadingRef" class="flex flex-col items-center justify-center my-12" key="loading">
            <!-- Animated Loading Spinner -->
            <div class="relative mb-6">
              <svg class="animate-spin h-20 w-20 text-primary dark:text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <!-- Progress ring -->
              <svg class="absolute inset-0 h-20 w-20 transform -rotate-90" viewBox="0 0 24 24">
                <circle
                  cx="12" cy="12" r="10"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                  class="text-primary/30 dark:text-indigo-500/30"
                  :stroke-dasharray="63"
                  :stroke-dashoffset="63 - (loadingProgress * 63 / 100)"
                  style="transition: stroke-dashoffset 0.5s ease-in-out"
                ></circle>
              </svg>
            </div>

            <!-- Loading Stage Text -->
            <div class="text-center mb-4">
              <div class="text-2xl font-display font-bold uppercase text-black dark:text-white tracking-widest mb-2">
                {{ loadingStageText }}
              </div>
              <div class="text-lg font-sans text-black/70 dark:text-white/70">
                {{ loadingStageDescription }}
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
              <div
                class="bg-primary dark:bg-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
                :style="{ width: `${loadingProgress}%` }"
              ></div>
            </div>

            <!-- Skeleton Preview -->
            <div class="w-full max-w-2xl mt-8 opacity-50">
              <SkeletonLoader type="bundle" />
            </div>
          </div>
        </transition>

        <!-- Results Area - Always rendered but conditionally visible -->
        <div
          v-show="hasBuilt && !isLoading"
          ref="resultsRef"
          class="results-container"
        >
          <!-- Selected Leagues Summary -->
          <div v-if="bundleState.bundleToShow" class="flex flex-wrap gap-2 justify-center mb-6">
            <span v-for="league in store.selectedLeaguesSortedByPreference" :key="league.id"
              class="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 border border-slate-300 text-base font-sans font-medium uppercase text-black shadow-sm">
                <span class="text-xl">{{ league.icon }}</span>
                <span>{{ league.name }}</span>
                <span class="ml-1" :class="getWeightColor(store.leaguePreferences[league.id] || 3)">
                  ({{ getWeightLabel(store.leaguePreferences[league.id] || 3) }})
                </span>
              </span>
          </div>

          <!-- Max Price Slider - Always visible if bundle exists -->
          <div v-if="bundleState.bundleToShow" class="mb-6">
            <label class="block text-base font-display font-bold text-black mb-1 dark:text-white">
              Max Price: <span class="font-bold text-primary dark:text-accent-yellow">${{ displayPrice }}</span>
            </label>
            <input
              type="range"
              :min="5"
              :max="bundleState.optimalBundle ? Math.ceil(bundleState.optimalBundle.totalPrice) : 100"
              step="1"
              v-model="maxPrice"
              @input="handlePriceInput"
              class="w-full accent-primary border-2 border-black dark:border-primary dark:bg-[#232336] rounded-lg"
            />
          </div>

          <!-- Consolidated Status Message Area -->
          <div v-if="bundleState.bundleToShow && !initialBuild && (bundleState.removedServices.length > 0 || bundleState.missingLeaguesBundle.length > 0 || bundleState.scenario === 'C' || bundleState.scenario === 'D')"
               class="max-w-2xl mx-auto p-4 my-4 border-2 rounded-lg"
               :class="{
                 'bg-amber-50 border-amber-200 text-amber-800': bundleState.removedServices.length > 0 && !bundleState.missingLeaguesBundle.length,
                 'bg-red-50 border-red-300 text-red-700': bundleState.missingLeaguesBundle.length > 0,
                 'bg-amber-50 border-amber-200 text-amber-800': !bundleState.removedServices.length && !bundleState.missingLeaguesBundle.length && (bundleState.scenario === 'C' || bundleState.scenario === 'D')
               }">

            <!-- Status header with icon -->
            <div class="flex items-center gap-2 mb-2">
              <span v-if="bundleState.missingLeaguesBundle.length > 0" class="text-red-500 text-xl">⚠️</span>
              <span v-else-if="bundleState.removedServices.length > 0" class="text-amber-500 text-xl">ℹ️</span>
              <span v-else-if="bundleState.scenario === 'C' || bundleState.scenario === 'D'" class="text-amber-500 text-xl">💰</span>

              <h3 class="font-display font-bold text-lg uppercase">
                <span v-if="bundleState.missingLeaguesBundle.length > 0">Missing Coverage</span>
                <span v-else-if="bundleState.removedServices.length > 0">Services Removed</span>
                <span v-else>Budget Alert</span>
              </h3>
            </div>

            <!-- Main message content -->
            <div class="space-y-3">
              <!-- Services removed message -->
              <p v-if="bundleState.removedServices.length > 0" class="font-sans font-medium">
                To fit your budget of ${{ maxPrice }}, we removed: {{ bundleState.removedServices.join(', ') }}.
                <span class="block text-sm mt-1">This affects the coverage of some leagues. See details below.</span>
              </p>

              <!-- Bundle over budget message -->
              <p v-if="bundleState.scenario === 'C' || bundleState.scenario === 'D' && !bundleState.removedServices.length">
                <span class="inline-block bg-accent-yellow text-black px-3 py-1 rounded-md border border-amber-400 font-display font-bold text-sm mb-2">Bundle Over Budget</span>
                <span class="block font-sans">This is the best bundle we could find, but it costs <b>${{ bundleState.bundleToShow.totalNumericPrice.toFixed(2) }}</b> which is over your max price of <b>${{ maxPrice }}</b>. Try adjusting your budget or selections for a better match.</span>
              </p>

              <!-- Missing leagues message -->
              <div v-if="bundleState.missingLeaguesBundle.length > 0">
                <p class="font-sans font-medium mb-2">
                  No bundle covers all your selected leagues. The following leagues are <b>not covered</b>:
                </p>
                <ul class="flex flex-wrap gap-2">
                  <li v-for="league in bundleState.missingLeaguesBundle" :key="league.id"
                      class="flex items-center gap-1 px-2 py-1 rounded-md bg-white text-red-700 font-sans font-medium text-sm uppercase shadow-sm border border-red-200">
                    <span class="text-lg">{{ league.icon }}</span>
                    <span>{{ league.name }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- No Leagues Selected -->
          <div v-if="store.selectedLeagueIds.length === 0">
            <div class="max-w-2xl mx-auto bg-white border-4 border-black p-6 my-8 flex items-center justify-center dark:bg-[#181824] dark:border-primary rounded-lg">
                <p class="text-xl font-bold font-mono text-black text-center dark:text-white">
                  Select one or more leagues and set your max price to see the best streaming bundle for you.
                </p>
              </div>
            </div>

          <!-- Bundle Results -->
          <div v-else-if="bundleState.bundleToShow">
            <!-- Bundle Card with staggered animation -->
            <transition
              name="slide-up"
              appear
              @before-enter="beforeEnter"
              @enter="enter"
            >
              <BundleCard
                :item="bundleState.bundleToShow"
                :selectedLeagues="store.selectedLeagues"
                :maxPrice="maxPrice"
                class="rounded-lg"
                style="animation-delay: 0.2s"
              />
            </transition>
          </div>

          <!-- No Bundles Found -->
            <div v-else>
            <div class="max-w-2xl mx-auto bg-white border-4 border-black p-8 my-8 flex items-center justify-center dark:bg-[#181824] dark:border-primary rounded-lg">
                  <p class="text-2xl font-extrabold font-mono text-red-700 text-center uppercase dark:text-accent-yellow">
                No bundles found for your selections.<br />
                Try selecting fewer leagues.
              </p>
            </div>
          </div>
        </div>

        <!-- Back to Selection Button -->
        <transition name="fade-slide">
          <button
            v-if="hasBuilt && !isLoading"
            @click="scrollToSelection"
            class="w-full relative px-4 py-4 border-b-4 border-black bg-white text-black font-bold font-display text-lg shadow-none hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 uppercase tracking-widest dark:bg-black dark:text-white dark:border-primary text-center mt-2 mb-4 rounded-lg"
            style="z-index:10;"
          >
            CHANGE SELECTIONS ^
          </button>
        </transition>
      </div>

      <footer class="text-center mt-12 text-sm text-slate-400 font-sans">
        <p>&copy; {{ new Date().getFullYear() }} StreamFinder. All rights reserved.</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted, computed } from 'vue';
import BundleCard from '@/components/BundleCard.vue';
import SkeletonLoader from '@/components/SkeletonLoader.vue';
import PopularBundles from '@/components/PopularBundles.vue';
import NavBar from '@/components/NavBar.vue';
import { useStreamingStoreWithPersistence } from '@/stores/streamingStore';
import { useAnalytics } from '@/composables/useAnalytics';

const store = useStreamingStoreWithPersistence();
const { trackBundleGenerated } = useAnalytics();

// UI state
const maxPrice = ref(100); // Start with a high max price
const hasBuilt = ref(false);
const isLoading = ref(false);
const loadingStage = ref(''); // Track which stage of loading we're in
const resultsRef = ref(null);
const loadingRef = ref(null);
const selectionRef = ref(null);
const selectionCollapsed = ref(false);
const currentSelectedLeagueIds = ref([]); // Track the leagues used for the current bundle

// Progressive disclosure state
const showPreferences = ref(false);

// Navigation state
const activeTab = ref('builder');

// Loading stage computeds
const loadingStageText = computed(() => {
  switch (loadingStage.value) {
    case 'analyzing':
      return 'Analyzing Selections';
    case 'calculating':
      return 'Calculating Bundles';
    case 'optimizing':
      return 'Optimizing Results';
    default:
      return 'Building Your Bundle';
  }
});

const loadingStageDescription = computed(() => {
  switch (loadingStage.value) {
    case 'analyzing':
      return 'Reviewing your league preferences and importance rankings...';
    case 'calculating':
      return 'Finding the best streaming service combinations...';
    case 'optimizing':
      return 'Optimizing for coverage and value...';
    default:
      return 'Please wait while we find your perfect bundle...';
  }
});

const loadingProgress = computed(() => {
  switch (loadingStage.value) {
    case 'analyzing':
      return 25;
    case 'calculating':
      return 65;
    case 'optimizing':
      return 90;
    default:
      return 0;
  }
});

// Bundle state - use separate objects for optimal and display bundle
const bundleState = ref({
  optimalBundle: null,
  bundleToShow: null,
  scenario: 'E',
  missingLeaguesBundle: [],
  removedServices: []
});

// Use a simple flag to track if we're in the initial build
const initialBuild = ref(true);

// Add a new reactive property for the displayed price
const displayPrice = ref(maxPrice.value);

// Preset ranking menu
const showPresetMenu = ref(false);
const rankingPresets = [
  {
    name: "Football Focus",
    rankingRules: {
      nfl: 5,
      ncaa_football: 4,
      default: 2
    }
  },
  {
    name: "Basketball Focus",
    rankingRules: {
      nba: 5,
      ncaa_basketball: 4,
      default: 2
    }
  },
  {
    name: "Soccer Focus",
    rankingRules: {
      epl: 5,
      mls: 4,
      ucl: 5,
      laliga: 4,
      bundesliga: 4,
      seriea: 4,
      ligue1: 3,
      uel: 3,
      default: 1
    }
  },
  {
    name: "Major Sports",
    rankingRules: {
      nfl: 5,
      nba: 5,
      mlb: 5,
      nhl: 4,
      default: 2
    }
  },
  {
    name: "Equal Importance",
    rankingRules: {
      default: 3
    }
  }
];

function togglePresetMenu() {
  showPresetMenu.value = !showPresetMenu.value;
}

function applyPreset(rankingRules) {
  // Reset all preferences first
  store.resetLeaguePreferences();

  // Apply the rankings from the preset
  store.selectedLeagueIds.forEach(leagueId => {
    // If there's a specific rule for this league, use it; otherwise use the default
    const weight = rankingRules[leagueId] !== undefined ? rankingRules[leagueId] : rankingRules.default || 3;
    store.updateLeaguePreference(leagueId, weight);
  });

  // Close the menu
  showPresetMenu.value = false;
}

// Helper functions for league importance ranking
function updateLeaguePreference(leagueId, value) {
  store.updateLeaguePreference(leagueId, parseInt(value, 10));
}

function resetLeaguePreferences() {
  store.resetLeaguePreferences();
}

function getWeightLabel(weight) {
  const labels = {
    1: 'Very Low',
    2: 'Low',
    3: 'Medium',
    4: 'High',
    5: 'Very High'
  };
  return labels[weight] || 'Medium';
}

function getWeightColor(weight) {
  const colors = {
    1: 'text-gray-500',
    2: 'text-blue-500',
    3: 'text-green-500',
    4: 'text-amber-500',
    5: 'text-red-500'
  };
  return colors[weight] || 'text-green-500';
}

function getWeightColorClasses(weight) {
  const classes = {
    1: 'text-gray-600 bg-gray-100 border-gray-300',
    2: 'text-blue-600 bg-blue-100 border-blue-300',
    3: 'text-green-600 bg-green-100 border-green-300',
    4: 'text-amber-600 bg-amber-100 border-amber-300',
    5: 'text-red-600 bg-red-100 border-red-300'
  };
  return classes[weight] || 'text-green-600 bg-green-100 border-green-300';
}

// When selections change, reset build state
onMounted(() => {
  console.log('Component mounted');
  // Initialize with current selection
  currentSelectedLeagueIds.value = [...store.selectedLeagueIds];

  // Add click event listener to close preset menu when clicking outside
  document.addEventListener('click', handleDocumentClick);
});

function handleDocumentClick(event) {
  // Check if the preset menu is open and the click is outside the menu
  if (showPresetMenu.value && !event.target.closest('.preset-menu-container')) {
    showPresetMenu.value = false;
  }
}

// Clean up event listeners when component is unmounted
onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
});

// Reset build state when selections change
function resetBuildState() {
  hasBuilt.value = false;
  isLoading.value = false;
  selectionCollapsed.value = false;
  initialBuild.value = true;

  // Reset progressive disclosure state
  showPreferences.value = false;

  // Update our tracked league selection with the latest from the store
  currentSelectedLeagueIds.value = [...store.selectedLeagueIds];

  // Clear bundle state
  bundleState.value = {
    optimalBundle: null,
    bundleToShow: null,
    scenario: 'E',
    missingLeaguesBundle: [],
    removedServices: []
  };
}

// Watch for selection changes and reset build state
store.$subscribe((mutation) => {
  // Only reset when the selectedLeagueIds array changes
  if (mutation.storeId === 'streaming' && mutation.type === 'direct' && mutation.events.key === 'selectedLeagueIds') {
    console.log('League selections changed, resetting build state');
    resetBuildState();
  }
});

async function handleBuild() {
  if (isLoading.value) return;

  // Set loading state and force update
  isLoading.value = true;
  loadingStage.value = 'analyzing';

  // Ensure we're using the current selection of leagues
  currentSelectedLeagueIds.value = [...store.selectedLeagueIds];
  console.log('Current leagues for build:', currentSelectedLeagueIds.value);

  await nextTick();

  // Scroll to loading animation smoothly
  await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure loading element is rendered
  if (loadingRef.value) {
    loadingRef.value.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    });
  }

  try {
    console.log('Building bundle for leagues:', currentSelectedLeagueIds.value);

    // Stage 1: Analyzing selections
    loadingStage.value = 'analyzing';
    await new Promise(res => setTimeout(res, 1600)); // Increased from 800ms to 1600ms

    // Stage 2: Calculating bundles
    loadingStage.value = 'calculating';
    await new Promise(res => setTimeout(res, 1200)); // Increased from 600ms to 1200ms

    // Stage 3: Optimizing results
    loadingStage.value = 'optimizing';
    await new Promise(res => setTimeout(res, 800)); // Increased from 400ms to 800ms

    // Get bundle from store using only the current selection
    const rawBundle = store.buildOptimalBundle(currentSelectedLeagueIds.value);
    console.log('Raw bundle from store for leagues:', currentSelectedLeagueIds.value, rawBundle);

    if (!rawBundle || !rawBundle.services) {
      console.error('No valid bundle returned from store');
      // Create placeholder bundle
      bundleState.value = {
        optimalBundle: null,
        bundleToShow: {
          id: 'empty_bundle',
          type: 'bundle',
          servicesInvolved: [],
          displayName: 'No Bundle Available',
          totalNumericPrice: 0,
          selectedLeaguesCoveredDetails: {},
          totalCoveredLeaguesCount: 0,
          totalCoveragePercentByLeague: {},
          overallCoveragePercent: 0,
          isUnderBudget: true,
          coversAll: false
        },
        scenario: 'E',
        missingLeaguesBundle: [],
        removedServices: []
      };
    } else {
      // Format bundle for UI - ensure all selected leagues are included
      const formattedBundle = {
        id: `bundle_${rawBundle.services.map(s => s.id).join('_')}`,
        type: 'bundle',
        servicesInvolved: [...rawBundle.services], // Clone to ensure reactivity
        displayName: rawBundle.services.length === 1 ?
          rawBundle.services[0].name :
          rawBundle.services.map(s => s.name).join(' + '),
        totalNumericPrice: rawBundle.totalPrice,
        selectedLeaguesCoveredDetails: {},
        totalCoveredLeaguesCount: Object.keys(rawBundle.coveredLeagues || {}).length,
        totalCoveragePercentByLeague: {...rawBundle.perLeagueCoverage},
        overallCoveragePercent: rawBundle.totalCoverage / currentSelectedLeagueIds.value.length,
        isUnderBudget: true,
        coversAll: Object.keys(rawBundle.coveredLeagues || {}).length === currentSelectedLeagueIds.value.length
      };

      // Include all selected leagues in the coverage details, even if with 0%
      store.selectedLeagues.forEach(league => {
        if (rawBundle.coveredLeagues && rawBundle.coveredLeagues[league.id]) {
          formattedBundle.selectedLeaguesCoveredDetails[league.id] = {...rawBundle.coveredLeagues[league.id]};
        } else {
          // Add league with 0% coverage
          formattedBundle.selectedLeaguesCoveredDetails[league.id] = {
            name: league.name,
            icon: league.icon,
            channels: [],
            coverage: "Not covered with current budget",
            coveragePercent: 0
          };
        }
      });

      console.log('Formatted bundle:', formattedBundle);

      // Update state - create new object to ensure reactivity
      bundleState.value = {
        optimalBundle: {...rawBundle},
        bundleToShow: formattedBundle,
        scenario: 'A', // Always use scenario A on initial build
        missingLeaguesBundle: getMissingLeagues(formattedBundle),
        removedServices: []
      };

      // Track analytics for bundle generation (non-blocking)
      trackBundleGenerated({
        services: rawBundle.services,
        selectedLeagues: currentSelectedLeagueIds.value,
        preferences: store.leaguePreferences,
        totalPrice: rawBundle.totalPrice,
        totalCoverage: rawBundle.totalCoverage,
        totalWeightedCoverage: rawBundle.totalWeightedCoverage,
        subscribedServices: store.subscribedServicesDetails
      }).catch(error => {
        console.warn('Analytics tracking failed (non-blocking):', error);
      });

      // Set max price to bundle price only on initial build
      // Otherwise preserve user's existing max price preference
      if (initialBuild.value) {
        // Set max price clearly above the bundle price to avoid floating point issues
        maxPrice.value = Math.ceil(rawBundle.totalPrice + 1); // Add a full dollar to ensure it's clearly above
        displayPrice.value = maxPrice.value;
      } else {
        // If user's budget is higher than new bundle price, keep their setting
        // If it's lower, we need to adjust the bundle to fit their budget
        if (maxPrice.value < Math.ceil(rawBundle.totalPrice)) {
          // Try to adjust bundle for user's budget
          updateBundleForPrice(maxPrice.value);
        }
      }
    }
  } catch (error) {
    console.error('Error building bundle:', error);
  } finally {
    // Update UI state
    hasBuilt.value = true;
    isLoading.value = false;
    loadingStage.value = '';
    selectionCollapsed.value = true;
    initialBuild.value = false;

    // Force UI update and scroll to results
    await nextTick();
    await new Promise(res => setTimeout(res, 100)); // Small delay to ensure results are rendered

    if (resultsRef.value) {
      resultsRef.value.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  }
}

function handlePriceInput(event) {
  if (!bundleState.value.optimalBundle || !bundleState.value.bundleToShow) {
    console.warn('Cannot adjust price: no bundle available');
    return;
  }

  // Update the displayed price immediately while dragging
  const newPrice = Number(event.target.value);
  displayPrice.value = newPrice;

  // Don't process bundle changes during the actual drag - just update display price
  // This prevents the flashing effect during dragging

  // For actual price changes, use a debounced function
  clearTimeout(handlePriceInput.debounceTimer);
  handlePriceInput.debounceTimer = setTimeout(() => {
    updateBundleForPrice(newPrice);
  }, 200); // Wait 200ms after sliding stops to update the bundle
}

// Store the timeout ID
handlePriceInput.debounceTimer = null;

function updateBundleForPrice(newPrice) {
  try {
    console.log('Price changed to:', newPrice);
    // Get current services before adjustment
    const currentServices = [...bundleState.value.bundleToShow.servicesInvolved];

    // If price increased to or above optimal, show full bundle
    if (newPrice >= (bundleState.value.optimalBundle?.totalPrice || 0)) {
      console.log('Price increased to optimal level, showing full bundle');

      const optBundle = bundleState.value.optimalBundle;
      const fullBundle = {
        id: `bundle_${optBundle.services.map(s => s.id).join('_')}`,
        type: 'bundle',
        servicesInvolved: [...optBundle.services],
        displayName: optBundle.services.length === 1 ?
          optBundle.services[0].name :
          optBundle.services.map(s => s.name).join(' + '),
        totalNumericPrice: optBundle.totalPrice,
        selectedLeaguesCoveredDetails: {},
        totalCoveragePercentByLeague: {...optBundle.perLeagueCoverage},
        overallCoveragePercent: optBundle.totalCoverage / currentSelectedLeagueIds.value.length,
        isUnderBudget: true,
        coversAll: Object.keys(optBundle.coveredLeagues || {}).length === currentSelectedLeagueIds.value.length
      };

      // Include all selected leagues in the coverage details
      store.selectedLeagues.forEach(league => {
        if (optBundle.coveredLeagues && optBundle.coveredLeagues[league.id]) {
          fullBundle.selectedLeaguesCoveredDetails[league.id] = {...optBundle.coveredLeagues[league.id]};
        } else {
          // Add league with 0% coverage
          fullBundle.selectedLeaguesCoveredDetails[league.id] = {
            name: league.name,
            icon: league.icon,
            channels: [],
            coverage: "Not covered with current budget",
            coveragePercent: 0
          };
        }
      });

      // Update bundle state with a new object to ensure reactivity
      bundleState.value = {
        ...bundleState.value,
        bundleToShow: fullBundle,
        removedServices: [],
        scenario: 'A', // Always set to scenario A when showing full bundle
        missingLeaguesBundle: getMissingLeagues(fullBundle)
      };

      return;
    }

    // Adjust bundle for new price
    const adjustedBundle = store.adjustBundleForBudget(bundleState.value.optimalBundle, newPrice);
    console.log('Adjusted bundle:', adjustedBundle);

    if (adjustedBundle && adjustedBundle.services && adjustedBundle.services.length > 0) {
      // Format adjusted bundle
      const formattedBundle = {
        id: `bundle_${adjustedBundle.services.map(s => s.id).join('_')}`,
        type: 'bundle',
        servicesInvolved: [...adjustedBundle.services],
        displayName: adjustedBundle.services.length === 1 ?
          adjustedBundle.services[0].name :
          adjustedBundle.services.map(s => s.name).join(' + '),
        totalNumericPrice: adjustedBundle.totalPrice,
        selectedLeaguesCoveredDetails: {},
        totalCoveragePercentByLeague: {...adjustedBundle.perLeagueCoverage},
        overallCoveragePercent: adjustedBundle.totalCoverage / currentSelectedLeagueIds.value.length,
        isUnderBudget: true,
        coversAll: Object.keys(adjustedBundle.coveredLeagues || {}).length === currentSelectedLeagueIds.value.length
      };

      // Include all selected leagues in the coverage details, even if with 0%
      store.selectedLeagues.forEach(league => {
        if (adjustedBundle.coveredLeagues && adjustedBundle.coveredLeagues[league.id]) {
          formattedBundle.selectedLeaguesCoveredDetails[league.id] = {...adjustedBundle.coveredLeagues[league.id]};
        } else {
          // Add league with 0% coverage
          formattedBundle.selectedLeaguesCoveredDetails[league.id] = {
            name: league.name,
            icon: league.icon,
            channels: [],
            coverage: "Not covered with current budget",
            coveragePercent: 0
          };
        }
      });

      // Find removed services
      const newServiceIds = adjustedBundle.services.map(s => s.id);
      const removedServiceNames = currentServices
        .filter(s => !newServiceIds.includes(s.id))
        .map(s => s.name);

      // Update bundle state with new object to ensure reactivity
      bundleState.value = {
        ...bundleState.value,
        bundleToShow: formattedBundle,
        removedServices: removedServiceNames,
        scenario: determineScenario(formattedBundle),
        missingLeaguesBundle: getMissingLeagues(formattedBundle)
      };
    } else {
      console.warn('Could not adjust bundle for price, keeping current bundle visible');

      // Keep current bundle but update removed services
      bundleState.value = {
        ...bundleState.value,
        removedServices: currentServices.map(s => s.name)
      };
    }
  } catch (error) {
    console.error('Error adjusting price:', error);
  }
}

function determineScenario(bundle) {
  if (!bundle) return 'E';

  // Never show budget alerts during initial build
  if (initialBuild.value) return 'A';

  // Count leagues with greater than 0% coverage
  const leaguesWithCoverage = Object.values(bundle.selectedLeaguesCoveredDetails || {})
    .filter(league => league.coveragePercent > 0)
    .length;

  const hasAllLeaguesCovered = leaguesWithCoverage === currentSelectedLeagueIds.value.length;

  // Check if bundle price is over the user's current max price setting
  // Use a small epsilon value (0.01) to account for floating point precision issues
  const epsilon = 0.01;
  const isUnderBudget = bundle.totalNumericPrice <= (maxPrice.value + epsilon);

  // Normal scenarios - simplified logic with better tolerance for floating point issues
  if (hasAllLeaguesCovered && isUnderBudget) return 'A';
  if (!hasAllLeaguesCovered && isUnderBudget) return 'B';
  if (hasAllLeaguesCovered && !isUnderBudget) return 'C';
  if (!hasAllLeaguesCovered && !isUnderBudget) return 'D';

  return 'E';
}

function getMissingLeagues(bundle) {
  if (!bundle || !bundle.selectedLeaguesCoveredDetails) return [];

  // Return leagues with 0% coverage
  return store.selectedLeagues.filter(league =>
    !bundle.selectedLeaguesCoveredDetails[league.id] ||
    bundle.selectedLeaguesCoveredDetails[league.id].coveragePercent === 0
  );
}

// Animation methods
function beforeEnter(el) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(50px) scale(0.9)';
}

function enter(el, done) {
  const delay = parseFloat(el.style.animationDelay) * 1000 || 0;

  setTimeout(() => {
    el.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0) scale(1)';

    setTimeout(() => {
      done();
    }, 600);
  }, delay);
}

function scrollToSelection() {
  selectionCollapsed.value = false;
  // Scroll to the top of the page for better UX
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function clearAllSelections() {
  store.selectedLeagueIds = [];
  resetBuildState();
}
</script>

<style scoped>
.container {
  max-width: 100%;
}
@media (min-width: 640px) {
  .container {
    max-width: 900px;
  }
}

/* Enhanced fade animations */
.fade-slide-enter-active {
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.755, 0.05, 0.855, 0.06);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(1.02);
}

/* Slide up animation for results */
.slide-up-enter-active {
  transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(60px) scale(0.8);
}

/* Enhanced bounce animation */
.fade-bounce-enter-active {
  animation: fade-bounce-in 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes fade-bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(100px) rotate(-10deg);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05) translateY(-10px) rotate(2deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0) rotate(0deg);
  }
}

/* Loading spinner enhancements */
@keyframes spin-smooth {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin-smooth 2s linear infinite;
}

/* Pulse animation for skeleton */
@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

/* Button hover enhancements */
button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

button:active {
  transform: translateY(0);
  transition-duration: 0.1s;
}

.brutalist-progress {
  border-radius: 0;
}
</style>
