<template>
  <div class="animate-pulse">
    <!-- Bundle Card Skeleton -->
    <div v-if="type === 'bundle'" class="bg-white border-4 border-black p-4 sm:p-6 dark:bg-[#181824] dark:border-primary rounded-lg">
      <!-- Header Skeleton -->
      <div class="flex flex-col gap-4 mb-6">
        <div class="flex justify-center">
          <div class="h-8 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        <div class="flex flex-col items-center gap-2">
          <div class="h-12 w-40 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div class="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      <!-- Coverage Section Skeleton -->
      <div class="mb-6">
        <div class="h-6 w-48 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="i in 4" :key="i" class="flex flex-col items-center">
            <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gray-300 dark:bg-gray-600 rounded-full mb-2"></div>
            <div class="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Services Section Skeleton -->
      <div class="grid grid-cols-2 gap-2">
        <div class="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded col-span-2 mb-2"></div>
        <div class="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>

    <!-- League Selection Skeleton -->
    <div v-else-if="type === 'leagues'" class="space-y-4">
      <div v-for="i in 3" :key="i" class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div class="p-4 bg-gray-100 dark:bg-gray-800">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded mr-3"></div>
              <div class="h-5 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div class="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Service List Skeleton -->
    <div v-else-if="type === 'services'" class="space-y-4">
      <div v-for="i in 6" :key="i" class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div class="flex items-center justify-between mb-2">
          <div class="h-5 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div class="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div class="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div class="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>

    <!-- Simple Content Skeleton -->
    <div v-else class="space-y-3">
      <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
      <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
      <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'content',
    validator: (value) => ['bundle', 'leagues', 'services', 'content'].includes(value)
  }
});
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>