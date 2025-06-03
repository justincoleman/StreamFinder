<template>
  <nav class="bg-white dark:bg-slate-800 border-b-4 border-black dark:border-primary mb-8">
    <div class="flex justify-center">
      <div class="flex space-x-0">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="$emit('tab-changed', tab.id)"
          class="px-6 py-3 font-bold font-display text-lg uppercase tracking-wider transition-all border-r-4 border-black dark:border-primary last:border-r-0"
          :class="[
            tab.id === activeTab
              ? 'bg-primary text-black dark:bg-indigo-500 dark:text-white'
              : 'bg-white text-black hover:bg-primary/10 dark:bg-slate-800 dark:text-white dark:hover:bg-indigo-500/20'
          ]"
        >
          <span class="flex items-center gap-2">
            <span class="text-xl">{{ tab.icon }}</span>
            {{ tab.label }}
          </span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
defineProps({
  activeTab: {
    type: String,
    required: true
  }
})

defineEmits(['tab-changed'])

const tabs = [
  {
    id: 'builder',
    label: 'Bundle Builder',
    icon: '🎯'
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    icon: '🏆'
  }
]
</script>