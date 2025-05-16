<template>
  <article
    class="rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-slate-200 dark:border-slate-700/50 bg-white/80 dark:bg-slate-700/80 backdrop-blur-md transition-all duration-300 relative h-full flex flex-col animated-glow ring-1 ring-emerald-400/30 [box-shadow:0_0_16px_2px_rgba(16,185,129,0.25)]"
    :class="[
      isPrimaryRecommendation && item.badge === 'Top Coverage' ? 'ring-2 ring-emerald-400/60' + (isMainPick ? ' md:shadow-2xl' : '') :
      isPrimaryRecommendation && item.badge === 'Best Value' ? 'ring-2 ring-teal-400/60' :
      isSecondaryOption && item.isSubscribed ? 'bg-emerald-50/60 dark:bg-slate-900/60 border-emerald-400/20' :
      'bg-slate-100/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50'
    ]"
  >
    <div v-if="item.badge && isPrimaryRecommendation"
      class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 text-xs sm:text-sm font-bold rounded-full shadow-lg z-20 border-2"
      :class="{
        'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white border-emerald-600/50': item.badge === 'Top Coverage',
        'bg-gradient-to-r from-teal-400 to-teal-600 text-white border-teal-600/50': item.badge === 'Best Value',
      }">
      {{ item.badge }}
    </div>
    <div class="pt-5 flex-grow flex flex-col">
      <div v-if="item.type === 'bundle'" class="mb-3 text-center">
        <h3 class="text-xl sm:text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-500"
            :class="{
                'md:text-3xl': item.badge === 'Top Coverage' && isPrimaryRecommendation,
                'md:text-2xl': item.badge === 'Best Value' && isPrimaryRecommendation,
                'text-slate-200': !isPrimaryRecommendation || !item.badge
            }">
          {{ (item.badge === 'Top Coverage' || item.badge === 'Best Value') && isPrimaryRecommendation ? 'Recommended Bundle' : item.displayName }}
        </h3>
        <div class="flex flex-wrap justify-center items-center gap-x-1.5 gap-y-2 p-2 rounded-md shadow-inner bg-slate-100/60 dark:bg-slate-900/40">
          <template v-for="(service) in item.servicesInvolved" :key="service.id">
            <span
                  class="px-2 py-1 text-xs sm:text-sm font-semibold rounded-full shadow-sm break-words"
                  :class="service.isSubscribed ?
                            (isPrimaryRecommendation && item.badge === 'Top Coverage' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700') :
                            'bg-slate-200 text-slate-800 dark:bg-slate-700/40 dark:text-slate-200'">
              {{ service.name }}
            </span>
          </template>
        </div>
      </div>
      <h3 v-else class="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-3 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-500"
          :class="{
            'text-emerald-400': item.badge === 'Top Coverage' && isPrimaryRecommendation,
            'text-teal-400': item.badge === 'Best Value' && isPrimaryRecommendation,
            'text-slate-200': (!item.badge || !isPrimaryRecommendation) && !item.isSubscribed,
            'text-emerald-300': item.isSubscribed && (!item.badge || !isPrimaryRecommendation) && !isSecondaryOption,
            'text-slate-400': isSecondaryOption && !item.badge
          }">
        {{ item.displayName }}
      </h3>
      <div class="text-center my-3 py-3 border-y border-slate-200 dark:border-slate-700/40">
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-0.5">Total Monthly Cost {{ item.type === 'bundle' ? 'for this Bundle' : 'for this Service' }}:</p>
        <div class="inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-br from-blue-200/20 to-indigo-200/20 dark:from-blue-500/20 dark:to-indigo-600/20">
          <span class="px-3 py-1.5 bg-white/80 dark:bg-slate-900/60 text-lg sm:text-xl md:text-2xl font-bold rounded-full shadow-inner text-slate-800 dark:text-slate-100">
            ${{ item.totalNumericPrice != null && isFinite(item.totalNumericPrice) ? item.totalNumericPrice.toFixed(2) : '0.00' }}
          </span>
        </div>
        <p v-if="(item.additionalNumericCost > 0 || (item.type === 'bundle' && userHasSubscriptions)) && isFinite(item.additionalNumericCost)" class="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 mt-1.5">
          Additional cost: <span class="font-semibold">${{ item.additionalNumericCost.toFixed(2) }}</span>
        </p>
         <p v-else-if="item.totalCoveredLeaguesCount > 0 && item.additionalNumericCost === 0 && !userHasSubscriptions && item.type === 'bundle'" class="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 mt-1.5">
          This bundle option is <span class="font-semibold">Free</span> (if ad-supported, etc.)
        </p>
      </div>
      <div v-if="item.badge === 'Top Coverage' && isPrimaryRecommendation && item.redundantSubscriptions && item.redundantSubscriptions.length > 0"
           class="my-3 p-3 bg-orange-50/60 dark:bg-orange-100/20 border border-orange-200 dark:border-orange-300/40 rounded-lg shadow-sm">
        <button @click="savingsVisible = !savingsVisible" class="w-full text-left focus:outline-none group block min-h-[44px]" :aria-expanded="savingsVisible" aria-label="Toggle potential savings details">
          <div class="flex justify-between items-center">
            <h4 class="text-sm font-semibold text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-500">Potential Savings!</h4>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 group-hover:text-orange-500 transition-transform duration-200" :class="{'rotate-180': savingsVisible}">
              <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
            </svg>
          </div>
          <p class="text-xs text-orange-500 dark:text-orange-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">
            Save ~<strong class="text-orange-400">${{ item.potentialSavings.toFixed(2) }}/mo</strong>.
            <span class="underline ml-1">{{ savingsVisible ? 'Hide Details' : 'Show Details' }}</span>
          </p>
        </button>
        <transition name="fade-slide">
          <div v-show="savingsVisible" class="mt-2 pt-2 border-t border-orange-200/40">
            <p class="text-xs text-orange-400 dark:text-orange-200 mb-1">By potentially unsubscribing from:</p>
            <ul class="list-disc pl-5 space-y-0.5 text-xs">
              <li v-for="sub in item.redundantSubscriptions" :key="sub.id" class="text-orange-400 dark:text-orange-200">
                {{ sub.name }} <span class="text-orange-300">({{ sub.price }})</span>
              </li>
            </ul>
          </div>
        </transition>
      </div>
      <div class="grid md:grid-cols-2 gap-x-4 mb-3 items-center">
        <div>
            <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-0.5">Leagues Covered:</h4>
          <p class="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 break-words">
            {{ item.totalCoveredLeaguesCount }}
            <span class="text-xs sm:text-sm font-normal text-slate-500 dark:text-slate-400">of {{ store.selectedLeagueIds.length }}</span>
            </p>
        </div>
        <div v-if="isPrimaryRecommendation && item.badge === 'Top Coverage' && item.totalCoveredLeaguesCount < store.selectedLeagueIds.length" class="flex flex-col items-end justify-center w-full">
          <span class="text-sm font-semibold text-orange-500 dark:text-orange-300">Missing:</span>
          <p class="text-lg sm:text-sm font-bold text-orange-600 dark:text-orange-400 mt-0.5 text-right break-words">
            <span v-for="(league, idx) in missingLeagues" :key="league.id">
              <span class="mr-1">{{ league.icon }}</span>{{ league.name }}<span v-if="idx < missingLeagues.length - 1">, </span>
            </span>
          </p>
        </div>
      </div>
        <div v-if="item.type === 'bundle' && Object.keys(item.newlyCoveredLeaguesDetails || {}).length > 0">
            <h4 class="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-0.5">Newly Added:</h4>
            <p class="text-lg sm:text-xl font-bold text-blue-700 dark:text-blue-300">
                {{ Object.keys(item.newlyCoveredLeaguesDetails).length }} <span class="text-xs sm:text-sm font-normal text-blue-400 dark:text-blue-200">Leagues</span>
            </p>
        </div>
      </div>
      <div v-if="item.type === 'bundle' && item.servicesInvolved.length > 0" class="mt-2 mb-auto">
        <h4 class="text-md font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Services in this Bundle:</h4>
        <ul class="list-none pl-0 space-y-2">
          <li v-for="service in item.servicesInvolved" :key="service.id"
              class="p-2 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm border border-slate-200 dark:border-slate-700/40 bg-slate-100/80 dark:bg-slate-900/40 gap-y-1"
              :class="service.isSubscribed
                        ? 'border-emerald-300/40 bg-emerald-50/60 dark:border-emerald-400/40 dark:bg-emerald-900/10'
                        : (isPrimaryRecommendation && item.badge === 'Top Coverage' ? 'border-yellow-300/40 bg-yellow-50/60 dark:border-yellow-400/40 dark:bg-yellow-900/10' : 'border-slate-200 dark:border-slate-700/40 bg-slate-100/80 dark:bg-slate-900/40')
                     "
          >
            <div>
              <strong class="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 break-words">{{ service.name }}</strong>
              <span class="text-xs sm:text-sm block sm:inline sm:ml-1 text-slate-500 dark:text-slate-400">({{ service.price }})</span>
              <span v-if="service.isSubscribed" class="text-xs font-bold ml-1 text-emerald-600 dark:text-emerald-400">(Subscribed)</span>
              <span v-if="!service.isSubscribed && isPrimaryRecommendation && item.badge === 'Top Coverage'" class="text-xs font-bold ml-1 text-yellow-600 dark:text-yellow-300">(New in this bundle)</span>
            </div>
            <a
              :href="getServiceLink(service)"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm font-medium mt-1.5 sm:mt-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 px-5 py-2 rounded-xl transition-all duration-300 whitespace-nowrap shadow-md hover:shadow-lg hover:scale-[1.02] flex items-center justify-center min-h-0 min-w-0"
              :aria-label="'Visit ' + service.name + ' website'"
            >
              Visit {{ service.name }} &rarr;
            </a>
          </li>
        </ul>
      </div>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStreamingStoreWithPersistence } from '@/stores/streamingStore';
import affiliateLinks from '@/data/affiliateLinks.json';
import loginLinks from '@/data/loginLinks.json';
import serviceHomepages from '@/data/serviceHomepages.json';

const store = useStreamingStoreWithPersistence();

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  isPrimaryRecommendation: {
    type: Boolean,
    default: false,
  },
  isSecondaryOption: {
    type: Boolean,
    default: false,
  },
  isMainPick: {
    type: Boolean,
    default: false
  }
});

const savingsVisible = ref(false);

const missingLeagues = computed(() => {
  // Find selected leagues that are not in the bundle's covered leagues
  const coveredIds = Object.keys(props.item.selectedLeaguesCoveredDetails || {});
  return store.selectedLeagues.filter(l => !coveredIds.includes(l.id));
});

const getServiceLink = (service) => {
  if (service.isSubscribed) {
    return loginLinks[service.id] || serviceHomepages[service.id] || '';
  } else {
    return affiliateLinks[service.id] || serviceHomepages[service.id] || '';
  }
};

const userHasSubscriptions = computed(() => store.subscribedServiceIds.length > 0);
</script>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease, max-height 0.4s ease-in-out;
  max-height: 1000px;
  overflow: hidden;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px);
  max-height: 0;
}
@keyframes neon-glow {
  0%, 100% {
    box-shadow: 0 0 16px 4px rgba(16,185,129,0.25), 0 0 0 0 rgba(16,185,129,0.15);
    border-color: #34d399;
  }
  50% {
    box-shadow: 0 0 32px 8px rgba(16,185,129,0.45), 0 0 0 4px rgba(16,185,129,0.25);
    border-color: #6ee7b7;
  }
}
.animated-glow {
  animation: neon-glow 2.2s ease-in-out infinite;
  border-color: #34d399 !important;
}
</style>