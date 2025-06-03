<template>
  <div class="social-export-container">
    <!-- Export Button -->
    <button
      @click="showExportModal = true"
      class="inline-flex items-center gap-2 px-4 py-2 border-2 border-black bg-white text-black font-bold font-display text-sm uppercase tracking-widest hover:bg-black hover:text-white dark:bg-black dark:text-white dark:border-primary dark:hover:bg-primary dark:hover:text-black transition-all duration-200 rounded-lg share-button"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
      </svg>
      Share Bundle
    </button>

    <!-- Export Modal -->
    <transition name="fade">
      <div v-if="showExportModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
        <div class="relative w-full max-w-2xl bg-white dark:bg-[#181824] border-4 border-black dark:border-primary rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold font-display uppercase text-black dark:text-white">Share Your Bundle</h3>
            <button @click="showExportModal = false" class="text-black dark:text-white hover:text-red-500 text-2xl font-bold">
              ×
            </button>
          </div>

          <!-- Format Selection -->
          <div class="mb-6">
            <h4 class="text-lg font-semibold font-display mb-3 text-black dark:text-white">Choose Format:</h4>
            <div class="grid grid-cols-2 gap-3">
              <button
                @click="selectedFormat = 'instagram'"
                :class="[
                  'p-3 border-2 rounded-lg font-medium transition-all',
                  selectedFormat === 'instagram'
                    ? 'border-primary bg-primary text-black'
                    : 'border-gray-300 hover:border-primary text-black dark:text-white dark:border-gray-600'
                ]"
              >
                <div class="font-display font-bold">Instagram</div>
                <div class="text-sm">1080 × 1080 (Square)</div>
              </button>
              <button
                @click="selectedFormat = 'twitter'"
                :class="[
                  'p-3 border-2 rounded-lg font-medium transition-all',
                  selectedFormat === 'twitter'
                    ? 'border-primary bg-primary text-black'
                    : 'border-gray-300 hover:border-primary text-black dark:text-white dark:border-gray-600'
                ]"
              >
                <div class="font-display font-bold">Twitter/Facebook</div>
                <div class="text-sm">1200 × 630 (Landscape)</div>
              </button>
            </div>
          </div>

          <!-- Preview -->
          <div class="mb-6">
            <h4 class="text-lg font-semibold font-display mb-3 text-black dark:text-white">Preview:</h4>
            <div class="flex justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <canvas
                ref="previewCanvas"
                :width="previewDimensions.width"
                :height="previewDimensions.height"
                class="border border-gray-300 rounded-lg max-w-full h-auto"
                style="max-height: 300px;"
              ></canvas>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              @click="downloadImage"
              :disabled="isGenerating"
              class="flex-1 px-4 py-3 border-2 border-black bg-primary text-black font-bold font-display uppercase tracking-widest hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-lg"
            >
              <span v-if="!isGenerating">Download Image</span>
              <span v-else>Generating...</span>
            </button>
            <button
              @click="copyToClipboard"
              :disabled="isGenerating"
              class="flex-1 px-4 py-3 border-2 border-black bg-white text-black font-bold font-display uppercase tracking-widest hover:bg-black hover:text-white dark:bg-black dark:text-white dark:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-lg"
            >
              Copy Image
            </button>
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center font-medium">
            {{ successMessage }}
          </div>
        </div>
      </div>
    </transition>

    <!-- Hidden high-res canvas for export -->
    <canvas ref="exportCanvas" style="display: none;"></canvas>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useAnalytics } from '@/composables/useAnalytics';

const props = defineProps({
  bundle: {
    type: Object,
    required: true
  },
  selectedLeagues: {
    type: Array,
    required: true
  }
});

const showExportModal = ref(false);
const selectedFormat = ref('instagram');
const isGenerating = ref(false);
const successMessage = ref('');
const previewCanvas = ref(null);
const exportCanvas = ref(null);

const { trackSocialMediaExport } = useAnalytics();

// Computed dimensions based on format
const previewDimensions = computed(() => {
  const formats = {
    instagram: { width: 200, height: 200 }, // Preview size
    twitter: { width: 240, height: 126 }     // Preview size
  };
  return formats[selectedFormat.value];
});

const exportDimensions = computed(() => {
  const formats = {
    instagram: { width: 1080, height: 1080 },
    twitter: { width: 1200, height: 630 }
  };
  return formats[selectedFormat.value];
});

// Watch for format changes to regenerate preview
watch([selectedFormat, showExportModal], async () => {
  if (showExportModal.value) {
    await nextTick();
    generatePreview();
  }
});

// Generate preview image
async function generatePreview() {
  if (!previewCanvas.value) return;

  const canvas = previewCanvas.value;
  const ctx = canvas.getContext('2d');
  const { width, height } = previewDimensions.value;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Generate the graphic at preview size
  await generateGraphic(ctx, width, height, false);
}

// Generate the actual graphic
async function generateGraphic(ctx, width, height, isHighRes = true) {
  const isSquare = selectedFormat.value === 'instagram';
  const fontSize = isHighRes ? (isSquare ? 48 : 36) : (isSquare ? 12 : 9);
  const padding = isHighRes ? 60 : 15;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // StreamFinder branding
  ctx.fillStyle = 'white';
  ctx.font = `bold ${fontSize * 0.6}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('STREAMFINDER', width / 2, padding + fontSize * 0.6);

  // Bundle price - prominent display
  ctx.fillStyle = '#FFD700'; // Gold color
  ctx.font = `bold ${fontSize * 1.8}px Arial, sans-serif`;
  const priceY = isSquare ? height * 0.25 : height * 0.3;
  ctx.fillText(`$${props.bundle.totalNumericPrice?.toFixed(2)}/mo`, width / 2, priceY);

  // "Your Perfect Bundle" text
  ctx.fillStyle = 'white';
  ctx.font = `${fontSize * 0.7}px Arial, sans-serif`;
  ctx.fillText('Your Perfect Streaming Bundle', width / 2, priceY + fontSize);

  // Services list - redesigned for readability
  ctx.fillStyle = 'white';
  ctx.font = `bold ${fontSize * 0.55}px Arial, sans-serif`;
  ctx.textAlign = 'center';

  const servicesY = priceY + fontSize * 2.2;
  let currentY = servicesY;
  const lineHeight = fontSize * 0.7;

  // Display service count if there are many services
  if (props.bundle.servicesInvolved.length > 6) {
    ctx.font = `${fontSize * 0.5}px Arial, sans-serif`;
    ctx.fillStyle = '#E0E0E0';
    ctx.fillText(`${props.bundle.servicesInvolved.length} Premium Services Included:`, width / 2, currentY);
    currentY += lineHeight * 0.8;
    ctx.fillStyle = 'white';
    ctx.font = `bold ${fontSize * 0.55}px Arial, sans-serif`;
  }

  // Display top services (limit to prevent overcrowding)
  const servicesToShow = props.bundle.servicesInvolved.slice(0, isSquare ? 8 : 6);

  servicesToShow.forEach((service) => {
    // Truncate very long service names for better display
    let serviceName = service.name;
    if (serviceName.length > 25) {
      serviceName = serviceName.substring(0, 22) + '...';
    }

    ctx.fillText(serviceName, width / 2, currentY);
    currentY += lineHeight;
  });

  // Show remaining count if there are more services
  if (props.bundle.servicesInvolved.length > servicesToShow.length) {
    ctx.font = `${fontSize * 0.45}px Arial, sans-serif`;
    ctx.fillStyle = '#E0E0E0';
    const remaining = props.bundle.servicesInvolved.length - servicesToShow.length;
    ctx.fillText(`+ ${remaining} more service${remaining > 1 ? 's' : ''}`, width / 2, currentY + lineHeight * 0.3);
    currentY += lineHeight * 0.8;
  }

  // League coverage (moved down to accommodate better service layout)
  if (isSquare) {
    ctx.font = `${fontSize * 0.5}px Arial, sans-serif`;
    ctx.fillStyle = '#E0E0E0';
    currentY += fontSize * 0.3;

    const coveredLeagues = props.selectedLeagues.filter(league =>
      props.bundle.selectedLeaguesCoveredDetails[league.id]?.coveragePercent > 0
    );

    const leagueText = `Covers ${coveredLeagues.length} of ${props.selectedLeagues.length} selected leagues`;
    ctx.fillText(leagueText, width / 2, currentY);

    // League icons
    currentY += fontSize * 0.8;
    const iconSize = fontSize * 0.7;
    const iconsToShow = Math.min(coveredLeagues.length, 6);
    const totalIconWidth = iconsToShow * iconSize + (iconsToShow - 1) * 15;
    let startX = (width - totalIconWidth) / 2;

    coveredLeagues.slice(0, 6).forEach((league, index) => {
      ctx.font = `${iconSize}px Arial, sans-serif`;
      ctx.fillText(league.icon, startX + index * (iconSize + 15), currentY);
    });

    if (coveredLeagues.length > 6) {
      ctx.font = `${fontSize * 0.4}px Arial, sans-serif`;
      ctx.fillText(`+${coveredLeagues.length - 6} more`, width / 2, currentY + fontSize * 0.6);
    }
  }

  // Call to action
  ctx.fillStyle = 'white';
  ctx.font = `${fontSize * 0.45}px Arial, sans-serif`;
  const ctaY = height - padding;
  ctx.fillText('Find your perfect bundle at StreamFinder.com', width / 2, ctaY);
}

// Download image
async function downloadImage() {
  isGenerating.value = true;
  try {
    const canvas = exportCanvas.value;
    const ctx = canvas.getContext('2d');
    const { width, height } = exportDimensions.value;

    canvas.width = width;
    canvas.height = height;

    await generateGraphic(ctx, width, height, true);

    // Create download link
    const link = document.createElement('a');
    link.download = `streamfinder-bundle-${selectedFormat.value}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    successMessage.value = 'Image downloaded successfully!';
    setTimeout(() => successMessage.value = '', 3000);

    // Track analytics for download
    try {
      await trackSocialMediaExport(props.bundle, selectedFormat.value);
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  } catch (error) {
    console.error('Download failed:', error);
  } finally {
    isGenerating.value = false;
  }
}

// Copy to clipboard
async function copyToClipboard() {
  isGenerating.value = true;
  try {
    const canvas = exportCanvas.value;
    const ctx = canvas.getContext('2d');
    const { width, height } = exportDimensions.value;

    canvas.width = width;
    canvas.height = height;

    await generateGraphic(ctx, width, height, true);

    // Convert to blob and copy
    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        successMessage.value = 'Image copied to clipboard!';
        setTimeout(() => successMessage.value = '', 3000);

        // Track analytics for copy
        try {
          await trackSocialMediaExport(props.bundle, selectedFormat.value);
        } catch (error) {
          console.warn('Analytics tracking failed:', error);
        }
      } catch (error) {
        console.error('Clipboard copy failed:', error);
        successMessage.value = 'Copy failed. Please try download instead.';
        setTimeout(() => successMessage.value = '', 3000);
      } finally {
        isGenerating.value = false;
      }
    }, 'image/png');
  } catch (error) {
    console.error('Copy failed:', error);
    isGenerating.value = false;
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.social-export-container canvas {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.share-button {
  animation: subtle-pulse 3s ease-in-out infinite;
}

@keyframes subtle-pulse {
  0%, 70%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }
  15% {
    transform: scale(1.05);
    box-shadow: 0 0 0 8px rgba(99, 102, 241, 0);
  }
}

.share-button:hover {
  animation: none;
}
</style>