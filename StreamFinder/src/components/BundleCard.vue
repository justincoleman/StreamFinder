<template>
  <div
    class="rounded-xl shadow-lg p-5 md:p-6 mb-8 relative ring-1 flex flex-col"
    :class="[
      isPrimaryRecommendation && item.badge === 'Top Coverage' ? 'border-2 border-green-500 bg-green-50 ring-green-400' + (isMainPick ? ' md:shadow-2xl' : '') :
      isPrimaryRecommendation && item.badge === 'Best Value' ? 'border-2 border-teal-500 bg-teal-50 ring-teal-400' :
      isSecondaryOption && item.isSubscribed ? 'bg-gray-50 border-gray-200 ring-gray-200' :
      'bg-white border-gray-200 ring-gray-200'
    ]"
  >
    <div
      v-if="item.badge && isPrimaryRecommendation"
      class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 text-xs sm:text-sm font-bold rounded-full shadow-lg z-20 border-2"
      :class="{
        'bg-green-500 text-white border-green-600': item.badge === 'Top Coverage',
        'bg-teal-500 text-white border-teal-600': item.badge === 'Best Value',
      }"
    >
      {{ item.badge }}
    </div>

    <div class="pt-5 flex-grow flex flex-col">
      <div v-if="item.type === 'bundle'" class="mb-3 text-center">
        <h3 class="text-lg sm:text-xl font-bold mb-3"
            :class="{
                'text-green-700 md:text-2xl': item.badge === 'Top Coverage' && isPrimaryRecommendation,
                'text-teal-700 md:text-xl': item.badge === 'Best Value' && isPrimaryRecommendation,
                'text-gray-800 md:text-xl': !isPrimaryRecommendation || !item.badge
            }">
          {{ (item.badge === 'Top Coverage' || item.badge === 'Best Value') && isPrimaryRecommendation ? 'Recommended Bundle' : item.displayName }}
        </h3>
        <div class="flex flex-wrap justify-center items-center gap-x-1.5 gap-y-1 p-2 rounded-md shadow-inner"
             :class="isPrimaryRecommendation && item.badge ? 'bg-white' : 'bg-gray-50'">
          <template v-for="(service) in item.servicesInvolved" :key="service.id">
            <span
                  class="px-2 py-0.5 text-xs font-semibold rounded-full shadow-sm"
                  :class="service.isSubscribed ?
                            (isPrimaryRecommendation && item.badge === 'Top Coverage' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700') :
                            'bg-gray-200 text-gray-700'">
              {{ service.name }}
            </span>
          </template>
        </div>
      </div>
      <h3 v-else class="text-lg sm:text-xl md:text-2xl font-bold text-center mb-3"
          :class="{
            'text-green-700': item.badge === 'Top Coverage' && isPrimaryRecommendation,
            'text-teal-700': item.badge === 'Best Value' && isPrimaryRecommendation,
            'text-gray-800': (!item.badge || !isPrimaryRecommendation) && !item.isSubscribed,
            'text-green-700': item.isSubscribed && (!item.badge || !isPrimaryRecommendation) && !isSecondaryOption,
            'text-gray-700': isSecondaryOption && !item.badge
          }">
        {{ item.displayName }}
      </h3>

      <div class="text-center my-3 py-3 border-y"
           :class="{
             'border-green-200': item.badge === 'Top Coverage' && isPrimaryRecommendation,
             'border-teal-200': item.badge === 'Best Value' && isPrimaryRecommendation,
             'border-gray-200': !isPrimaryRecommendation || !item.badge
           }">
        <p class="text-xs text-gray-500 mb-0.5">Total Monthly Cost {{ item.type === 'bundle' ? 'for this Bundle' : 'for this Service' }}:</p>
        <div class="inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-br"
             :class="{
                'from-green-400 to-green-600': item.badge === 'Top Coverage' && isPrimaryRecommendation,
                'from-teal-400 to-teal-600': item.badge === 'Best Value' && isPrimaryRecommendation,
                'from-gray-400 to-gray-600': !isPrimaryRecommendation || !item.badge
             }">
          <span class="px-3 py-1.5 bg-white text-xl md:text-2xl font-bold rounded-full shadow-inner"
                :class="{
                    'text-green-700': item.badge === 'Top Coverage' && isPrimaryRecommendation,
                    'text-teal-700': item.badge === 'Best Value' && isPrimaryRecommendation,
                    'text-gray-700': !isPrimaryRecommendation || !item.badge
                }">
            ${{ item.totalNumericPrice != null && isFinite(item.totalNumericPrice) ? item.totalNumericPrice.toFixed(2) : '0.00' }}
          </span>
        </div>
        <p v-if="(item.additionalNumericCost > 0 || (item.type === 'bundle' && userHasSubscriptions)) && isFinite(item.additionalNumericCost)" class="text-xs sm:text-sm text-gray-600 mt-1.5">
          Additional cost: <span class="font-semibold text-green-600">${{ item.additionalNumericCost.toFixed(2) }}</span>
        </p>
         <p v-else-if="item.totalCoveredLeaguesCount > 0 && item.additionalNumericCost === 0 && !userHasSubscriptions && item.type === 'bundle'" class="text-xs sm:text-sm text-gray-600 mt-1.5">
          This bundle option is <span class="font-semibold text-green-600">Free</span> (if ad-supported, etc.)
        </p>
      </div>

      <div v-if="item.badge === 'Top Coverage' && isPrimaryRecommendation && item.redundantSubscriptions && item.redundantSubscriptions.length > 0"
           class="my-3 p-3 bg-orange-50 border border-orange-200 rounded-lg shadow-sm">
        <button @click="savingsVisible = !savingsVisible" class="w-full text-left focus:outline-none group block">
          <div class="flex justify-between items-center">
            <h4 class="text-sm font-semibold text-orange-700 group-hover:text-orange-800">Potential Savings!</h4>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-orange-500 group-hover:text-orange-600 transition-transform duration-200" :class="{'rotate-180': savingsVisible}">
              <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
            </svg>
          </div>
          <p class="text-xs text-gray-600 group-hover:text-gray-700">
            Save ~<strong class="text-orange-600">${{ item.potentialSavings.toFixed(2) }}/mo</strong>.
            <span class="underline ml-1">{{ savingsVisible ? 'Hide Details' : 'Show Details' }}</span>
          </p>
        </button>
        <transition name="fade-slide">
          <div v-show="savingsVisible" class="mt-2 pt-2 border-t border-orange-100">
            <p class="text-xs text-gray-500 mb-1">By potentially unsubscribing from:</p>
            <ul class="list-disc pl-5 space-y-0.5 text-xs">
              <li v-for="sub in item.redundantSubscriptions" :key="sub.id" class="text-gray-500">
                {{ sub.name }} <span class="text-gray-400">({{ sub.price }})</span>
              </li>
            </ul>
          </div>
        </transition>
      </div>

      <div class="grid md:grid-cols-2 gap-x-4 mb-3 items-center">
        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-0.5">Leagues Covered:</h4>
          <p class="text-lg sm:text-xl font-bold text-gray-800">
            {{ item.totalCoveredLeaguesCount }}
            <span class="text-xs sm:text-sm font-normal text-gray-600">of {{ store.selectedLeagueIds.length }}</span>
          </p>
        </div>
        <div v-if="isPrimaryRecommendation && item.badge === 'Top Coverage' && item.totalCoveredLeaguesCount < store.selectedLeagueIds.length" class="flex flex-col items-end justify-center w-full">
          <span class="text-sm font-semibold">Missing:</span>
          <p class="text-lg sm:text-sm font-bold text-red-600 mt-0.5 text-right">
            <span v-for="(league, idx) in missingLeagues" :key="league.id">
              <span class="mr-1">{{ league.icon }}</span>{{ league.name }}<span v-if="idx < missingLeagues.length - 1">, </span>
            </span>
          </p>
        </div>
      </div>

      <div v-if="item.type === 'bundle' && Object.keys(item.newlyCoveredLeaguesDetails || {}).length > 0">
            <h4 class="text-sm font-semibold text-gray-700 mb-0.5">Newly Added:</h4>
            <p class="text-lg sm:text-xl font-bold text-blue-600">
                {{ Object.keys(item.newlyCoveredLeaguesDetails).length }} <span class="text-xs sm:text-sm font-normal text-gray-600">Leagues</span>
            </p>
        </div>
      </div>

      <div v-if="item.type === 'bundle' && item.servicesInvolved.length > 0" class="mt-2 mb-auto">
        <h4 class="text-md font-semibold text-gray-700 mb-1.5">Services in this Bundle:</h4>
        <ul class="list-none pl-0 space-y-1.5">
          <li v-for="service in item.servicesInvolved" :key="service.id"
              class="p-2.5 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm border"
              :class="service.isSubscribed
                        ? 'bg-white border-green-300'
                        : (isPrimaryRecommendation && item.badge === 'Top Coverage' ? 'bg-yellow-100 border-yellow-400' : 'bg-gray-100 border-gray-200')
                     "
          >
            <div>
              <strong class="text-sm font-medium text-gray-800">{{ service.name }}</strong>
              <span class="text-xs block sm:inline sm:ml-1 text-gray-500">({{ service.price }})</span>
              <span v-if="service.isSubscribed" class="text-xs font-bold ml-1 text-green-600">(Subscribed)</span>
              <span v-if="!service.isSubscribed && isPrimaryRecommendation && item.badge === 'Top Coverage'" class="text-xs font-bold ml-1 text-yellow-700">(New in this bundle)</span>
            </div>
            <a
              v-if="!service.isSubscribed"
              :href="service.link"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs mt-1.5 sm:mt-0 bg-blue-500 text-white hover:bg-blue-600 font-medium py-1 px-2.5 rounded-lg transition-colors duration-150 whitespace-nowrap"
            >
              Visit {{ service.name }} &rarr;
            </a>
          </li>
        </ul>
      </div>

      <div v-if="Object.keys(item.selectedLeaguesCoveredDetails || {}).length > 0" class="mt-auto pt-3"
           :class="{
             'border-t border-green-200': item.badge === 'Top Coverage' && isPrimaryRecommendation,
             'border-t border-teal-200': item.badge === 'Best Value' && isPrimaryRecommendation,
             'border-t border-gray-200': !isPrimaryRecommendation || !item.badge
           }">
        <button
          @click="toggleChannelsVisibility"
          class="w-full text-left text-sm font-semibold text-gray-600 hover:text-gray-800 mb-1 py-2 rounded-md focus:outline-none flex justify-between items-center"
        >
          <span>Leagues & Channels Details</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 transition-transform duration-200" :class="{'rotate-180': channelsVisible}">
            <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
          </svg>
        </button>
        <transition name="fade-slide">
          <div v-show="channelsVisible">
            <ul class="list-none pl-0 space-y-1.5 text-xs">
              <li v-for="(leagueData, leagueId) in item.selectedLeaguesCoveredDetails" :key="leagueId" class="p-2 bg-gray-50 rounded shadow-sm">
                <div class="flex items-center mb-0.5">
                  <span class="mr-1.5 text-lg w-6 text-center">{{ leagueData.icon }}</span>
                  <strong class="text-gray-700">{{ leagueData.name }}:</strong>
                </div>
                <p class="ml-8 text-xs text-gray-500 leading-snug">
                  <span v-for="(channel, index) in leagueData.channels" :key="index">
                    {{ channel.replace(/\s*\(on.*?\)\s*/g, '') }}<span class="text-gray-400 font-medium italic text-[0.7rem]">{{ channel.match(/\s*\(on.*?\)\s*/g) ? channel.match(/\s*\(on.*?\)\s*/g)[0] : '' }}</span>{{ index < leagueData.channels.length - 1 ? ', ' : '' }}
                  </span>
                </p>
              </li>
            </ul>
          </div>
        </transition>
      </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStreamingStore } from '@/stores/streamingStore';

const store = useStreamingStore();

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

const channelsVisible = ref(false);
const savingsVisible = ref(false);

const missingLeagues = computed(() => {
  // Find selected leagues that are not in the bundle's covered leagues
  const coveredIds = Object.keys(props.item.selectedLeaguesCoveredDetails || {});
  return store.selectedLeagues.filter(l => !coveredIds.includes(l.id));
});

const toggleChannelsVisibility = () => {
  channelsVisible.value = !channelsVisible.value;
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
</style>