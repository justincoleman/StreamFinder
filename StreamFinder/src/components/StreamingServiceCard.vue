<template>
  <div
    class="border rounded-lg shadow-md p-5 md:p-6 mb-8 hover:shadow-lg transition-shadow duration-200 relative h-full flex flex-col"
    :class="[
      (service.isSubscribed && !isSecondaryOption && !isPrimaryRecommendation) ? 'border-green-400 bg-green-50 ring-1 ring-green-200' :
      (isSecondaryOption && service.isSubscribed) ? 'bg-white border-gray-300' :
      'border-gray-300 bg-white',
      {'border-2 border-teal-500 bg-teal-50 ring-teal-300': service.badge === 'Best Value' && isPrimaryRecommendation}
    ]"
  >
    <div
      v-if="service.badge && isPrimaryRecommendation"
      class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-bold rounded-full shadow-md z-10 border-2"
      :class="{
        'bg-teal-500 text-white border-teal-600': service.badge === 'Best Value',
      }"
    >
      {{ service.badge }}
    </div>

    <div
      v-if="service.isSubscribed && !isSecondaryOption && (!service.badge || !isPrimaryRecommendation)"
      class="absolute top-2 right-2 bg-green-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow z-10"
    >
      ✓ Subscribed
    </div>
     <div
      v-if="service.isSubscribed && isSecondaryOption"
      class="absolute top-2 right-2 text-green-700 text-xs font-medium p-1 bg-green-100 rounded"
    >
      (Subscribed)
    </div>


    <div class="flex flex-col sm:flex-row justify-between sm:items-start mb-3 pt-4">
      <h3 class="text-xl font-bold mb-2 sm:mb-0"
          :class="[
            isMainPick ? 'md:text-2xl' : 'md:text-xl',
            {'text-green-700': service.isSubscribed && !isSecondaryOption && !service.badge},
            {'text-teal-700': service.badge === 'Best Value' && isPrimaryRecommendation},
            {'text-blue-700': !service.isSubscribed && !service.badge && !isSecondaryOption},
            {'text-gray-700': isSecondaryOption && !service.badge}
          ]">
        {{ service.name || service.displayName }}
      </h3>
      <a
        :href="service.link"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm bg-blue-500 text-white hover:bg-blue-600 font-medium py-2 px-4 rounded-lg transition-colors duration-150 inline-block sm:inline whitespace-nowrap mt-2 sm:mt-0"
      >
        Visit Site →
      </a>
    </div>

    <p class="text-md sm:text-lg text-gray-700 mb-1 pb-3 border-b"
       :class="{
         'border-green-200': service.isSubscribed && !isSecondaryOption && !service.badge,
         'border-teal-200': service.badge === 'Best Value' && isPrimaryRecommendation,
         'border-gray-200': !isPrimaryRecommendation || !service.badge || isSecondaryOption
       }">
      <span class="font-semibold">Price:</span>
      <span v-if="service.isSubscribed && !isSecondaryOption" class="text-green-600 font-bold">$0.00 (Already Subscribed)</span>
      <span v-else-if="service.isSubscribed && isSecondaryOption" class="text-gray-600">{{ service.originalService ? service.originalService.price : (service.numericPrice !== Infinity ? service.numericPrice.toFixed(2) : 'N/A') }} <span class="text-xs">(Subscribed)</span></span>
      <span v-else>{{ service.originalService ? service.originalService.price : (service.numericPrice !== Infinity ? service.numericPrice.toFixed(2) : 'N/A') }}</span>
      <span v-if="!service.isSubscribed && service.numericPrice !== Infinity" class="text-xs text-gray-500 ml-1">(${{ service.numericPrice.toFixed(2) }}/mo value)</span>
    </p>

    <p v-if="service.notes" class="text-xs sm:text-sm text-gray-600 my-3 italic">
      {{ service.notes }}
    </p>

    <div class="mt-auto">
      <div v-if="Object.keys(service.selectedLeaguesCoveredDetails || {}).length > 0" class="pt-4 border-t"
          :class="{
            'border-green-200': service.isSubscribed && !isSecondaryOption && !service.badge,
            'border-teal-200': service.badge === 'Best Value' && isPrimaryRecommendation,
            'border-gray-200': !isPrimaryRecommendation || !service.badge || isSecondaryOption
          }">
        <button
            @click="toggleChannelsVisibility"
            class="w-full text-left text-sm font-semibold text-gray-600 hover:text-gray-800 mb-1 py-2 rounded-md focus:outline-none flex justify-between items-center"
          >
            <span>Leagues & Channels Covered ({{ service.totalCoveredLeaguesCount }})</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 transition-transform duration-200" :class="{'rotate-180': channelsVisible}">
              <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
            </svg>
          </button>
          <transition name="fade-slide">
            <div v-show="channelsVisible">
              <ul class="list-none pl-0 space-y-1.5 text-xs mt-2">
                <li v-for="(leagueData, leagueId) in service.selectedLeaguesCoveredDetails" :key="leagueId" class="p-2.5 bg-gray-50 rounded shadow-sm">
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
      <div v-else class="mt-4 pt-4 border-t text-sm text-gray-500"
            :class="{
              'border-green-200': service.isSubscribed && !isSecondaryOption && !service.badge,
              'border-teal-200': service.badge === 'Best Value' && isPrimaryRecommendation,
              'border-gray-200': !isPrimaryRecommendation || !service.badge || isSecondaryOption
            }">
          This service does not cover any of your selected leagues with the current data.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  service: {
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

const toggleChannelsVisibility = () => {
  channelsVisible.value = !channelsVisible.value;
};

const isSubscribedAndNotSecondary = computed(() => {
  return props.service.isSubscribed && !props.isSecondaryOption;
});
</script>
