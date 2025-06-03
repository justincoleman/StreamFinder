import { ref, computed } from 'vue';

const isEnabled = ref(true);
const baseURL = ref(import.meta.env.VITE_ANALYTICS_API || 'http://localhost:3003/api');

// Anonymous session ID for tracking (no personal data)
const sessionId = ref(generateSessionId());

function generateSessionId() {
  return 'session_' + Math.random().toString(36).substr(2, 16) + '_' + Date.now();
}

// Generate anonymous bundle hash for tracking duplicates
function generateBundleHash(services, leagues, preferences) {
  const bundleSignature = {
    services: services.map(s => s.id).sort(),
    leagues: leagues.sort(),
    preferences: Object.fromEntries(
      Object.entries(preferences).sort(([a], [b]) => a.localeCompare(b))
    )
  };
  return btoa(JSON.stringify(bundleSignature)).replace(/[^a-zA-Z0-9]/g, '').substr(0, 32);
}

// Track bundle generation event
export async function trackBundleGenerated(bundleData) {
  if (!isEnabled.value) return;

  try {
    const event = {
      type: 'bundle_generated',
      sessionId: sessionId.value,
      timestamp: new Date().toISOString(),
      bundleHash: generateBundleHash(
        bundleData.services,
        bundleData.selectedLeagues,
        bundleData.preferences
      ),
      data: {
        // Bundle metadata (anonymized)
        serviceCount: bundleData.services.length,
        serviceIds: bundleData.services.map(s => s.id),
        totalPrice: bundleData.totalPrice,

        // League selection patterns
        leagueCount: bundleData.selectedLeagues.length,
        leagueIds: bundleData.selectedLeagues,
        leaguePreferences: bundleData.preferences,

        // Coverage metrics
        totalCoverage: bundleData.totalCoverage,
        totalWeightedCoverage: bundleData.totalWeightedCoverage,
        averageCoveragePerLeague: bundleData.totalCoverage / bundleData.selectedLeagues.length,

        // User behavior patterns
        hasSubscriptions: bundleData.subscribedServices?.length > 0,
        subscriptionCount: bundleData.subscribedServices?.length || 0,

        // Context
        userAgent: getUserAgentCategory(),
        deviceType: getDeviceType(),
        budgetRange: getBudgetRange(bundleData.totalPrice)
      }
    };

    await sendAnalyticsEvent(event);
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
}

// Track social media share events
export async function trackSocialMediaExport(bundleData, format) {
  if (!isEnabled.value) return;

  try {
    const event = {
      type: 'social_media_export',
      sessionId: sessionId.value,
      timestamp: new Date().toISOString(),
      bundleHash: generateBundleHash(
        bundleData.servicesInvolved,
        Object.keys(bundleData.selectedLeaguesCoveredDetails),
        {}
      ),
      data: {
        format: format, // 'instagram' or 'twitter'
        bundlePrice: bundleData.totalNumericPrice,
        serviceCount: bundleData.servicesInvolved.length,
        leagueCount: Object.keys(bundleData.selectedLeaguesCoveredDetails).length
      }
    };

    await sendAnalyticsEvent(event);
  } catch (error) {
    console.warn('Social media analytics tracking failed:', error);
  }
}

// Track user interaction patterns
export async function trackUserInteraction(interactionType, details = {}) {
  if (!isEnabled.value) return;

  try {
    const event = {
      type: 'user_interaction',
      sessionId: sessionId.value,
      timestamp: new Date().toISOString(),
      data: {
        interactionType, // 'league_selected', 'service_subscribed', 'preference_changed', etc.
        ...details
      }
    };

    await sendAnalyticsEvent(event);
  } catch (error) {
    console.warn('Interaction analytics tracking failed:', error);
  }
}

// Send event to analytics API
async function sendAnalyticsEvent(event) {
  try {
    const response = await fetch(`${baseURL.value}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`Analytics API responded with status: ${response.status}`);
    }
  } catch (error) {
    // Always fail silently to prevent blocking the main application
    if (import.meta.env.DEV) {
      console.warn('Failed to send analytics event:', error.message);
    }
    // Don't re-throw the error to prevent blocking
  }
}

// Get popular bundles for recommendations
export async function getPopularBundles(leagueIds = [], limit = 5) {
  if (!isEnabled.value) return [];

  try {
    const queryParams = new URLSearchParams({
      leagues: leagueIds.join(','),
      limit: limit.toString()
    });

    const response = await fetch(`${baseURL.value}/popular-bundles?${queryParams}`);

    if (!response.ok) {
      throw new Error(`Popular bundles API responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch popular bundles:', error);
    return [];
  }
}

// Get usage analytics summary
export async function getAnalyticsSummary() {
  try {
    const response = await fetch(`${baseURL.value}/analytics/summary`);

    if (!response.ok) {
      throw new Error(`Analytics summary API responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch analytics summary:', error);
    return null;
  }
}

// Get bundle log with filtering and pagination
export async function getBundleLog(options = {}) {
  if (!isEnabled.value) return { bundles: [], pagination: null };

  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'creation_count',
      sortOrder = 'desc',
      search = '',
      minPrice = 0,
      maxPrice = 1000,
      minCount = 1
    } = options;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
      search,
      minPrice: minPrice.toString(),
      maxPrice: maxPrice.toString(),
      minCount: minCount.toString()
    });

    const response = await fetch(`${baseURL.value}/bundle-log?${queryParams}`);

    if (!response.ok) {
      throw new Error(`Bundle log API responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch bundle log:', error);
    return { bundles: [], pagination: null };
  }
}

// Helper functions
function getUserAgentCategory() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('mobile')) return 'mobile';
  if (ua.includes('tablet')) return 'tablet';
  return 'desktop';
}

function getDeviceType() {
  if (window.innerWidth < 768) return 'mobile';
  if (window.innerWidth < 1024) return 'tablet';
  return 'desktop';
}

function getBudgetRange(price) {
  if (price < 25) return 'budget';
  if (price < 75) return 'mid';
  if (price < 150) return 'premium';
  return 'luxury';
}

// Analytics configuration
export function useAnalytics() {
  return {
    isEnabled,
    sessionId: computed(() => sessionId.value),
    trackBundleGenerated,
    trackSocialMediaExport,
    trackUserInteraction,
    getPopularBundles,
    getAnalyticsSummary,
    getBundleLog,
    setEnabled: (enabled) => { isEnabled.value = enabled; },
    setAPIUrl: (url) => { baseURL.value = url; }
  };
}