// src/stores/streamingStore.js
import { defineStore } from 'pinia';
import allServicesData from '@/data/streamingServicesData.json';
import { watch } from 'vue';
import allLeaguesByCategory from '@/data/leagues.json';

// Helper function to parse price string to a number
function parsePrice(priceString) {
  if (!priceString || typeof priceString !== 'string') {
    return Infinity;
  }
  const match = priceString.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : Infinity;
}

// Memoized helper to calculate unique covered leagues for a set of services
const getBundleCoverageDetails = (() => {
  const cache = new Map();

  return (servicesInBundle, selectedLeagueIds, allLeaguesFlat) => {
    const cacheKey = JSON.stringify({
      services: servicesInBundle.map(s => s.id).sort(),
      leagues: selectedLeagueIds.sort()
    });

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

  const coveredLeaguesSet = new Set();
    const coveredLeaguesDetails = {};

  servicesInBundle.forEach(service => {
    selectedLeagueIds.forEach(leagueId => {
        if (service.leagues && service.leagues[leagueId]) {
        coveredLeaguesSet.add(leagueId);
        const leagueInfo = allLeaguesFlat.find(l => l.id === leagueId);
        if (!coveredLeaguesDetails[leagueId]) {
          coveredLeaguesDetails[leagueId] = {
            name: leagueInfo ? leagueInfo.name : leagueId,
            icon: leagueInfo ? leagueInfo.icon : '?',
              channels: [],
          };
        }
          const serviceChannels = service.leagues[leagueId].channels.map(ch => `${ch} (on ${service.name})`);
          coveredLeaguesDetails[leagueId].channels = [...new Set([...(coveredLeaguesDetails[leagueId].channels || []), ...serviceChannels])];
        }
      });
    });

    const result = { count: coveredLeaguesSet.size, details: coveredLeaguesDetails };
    cache.set(cacheKey, result);
    return result;
  };
})();

export const useStreamingStore = defineStore('streaming', {
  state: () => ({
    allLeaguesByCategory: allLeaguesByCategory,
    allAvailableServices: allServicesData,
    selectedLeagueIds: [],
    subscribedServiceIds: [],
    expandedCategories: [],
    expandedServiceCategories: [],
  }),

  getters: {
    allLeaguesFlat() {
      return this.allLeaguesByCategory.reduce((acc, category) => acc.concat(category.leagues), []);
    },

    allServicesGroupedByCategory(state) {
      const grouped = {};
      if (!Array.isArray(state.allAvailableServices)) {
        return [];
      }
      state.allAvailableServices.forEach(service => {
        const category = service.serviceCategory || 'Other';
        if (!grouped[category]) {
          grouped[category] = {
            categoryName: category,
            icon: category === 'Live TV Streaming' ? '📺' : (category === 'League/Sport Specific' ? '🎯' : (category === 'Sport Specific & Add-ons' ? '➕' : '📦')),
            services: []
          };
        }
        grouped[category].services.push(service);
      });
      const result = Object.values(grouped).sort((a,b) => a.categoryName.localeCompare(b.categoryName));
      return result;
    },

    processedAvailableServicesFlat() {
      if (!Array.isArray(this.allAvailableServices)) {
            return [];
        }
      return this.allAvailableServices.map(s => ({
            ...s,
        numericPrice: parsePrice(s.price),
        isSubscribed: this.subscribedServiceIds.includes(s.id),
        }));
    },

    selectedLeagues(state) {
      return this.allLeaguesFlat.filter(league => state.selectedLeagueIds.includes(league.id));
    },

    subscribedServicesDetails() {
      return this.processedAvailableServicesFlat.filter(service => service.isSubscribed);
    },

    getFilteredServices() {
      if (this.selectedLeagueIds.length === 0) {
        return [];
      }

      const allLeaguesFlatForHelper = this.allLeaguesFlat;
      const currentProcessedAvailableServices = this.processedAvailableServicesFlat;
      const userSubscribedServices = currentProcessedAvailableServices.filter(s => s.isSubscribed);
      const nonSubscribedServices = currentProcessedAvailableServices.filter(s => !s.isSubscribed);

      // Pre-calculate base coverage to avoid redundant calculations
      const baseCoverageFromSubscribed = getBundleCoverageDetails(
        userSubscribedServices,
        this.selectedLeagueIds,
        allLeaguesFlatForHelper
      );
      const baseCoveredLeagueIds = new Set(Object.keys(baseCoverageFromSubscribed.details));

      // Generate candidate bundles more efficiently
      const candidateBundles = new Set();

      // Helper to add bundle if not already exists
      const addBundleIfUnique = (services, idSuffix, additionalCost) => {
        const canonicalId = services.map(s => s.id).sort().join(',');
        if (!candidateBundles.has(canonicalId)) {
          candidateBundles.add(canonicalId);
          return {
            idSuffix,
            servicesInvolved: services,
            additionalNumericCost: additionalCost,
          };
        }
        return null;
      };

      // Generate bundles more efficiently
      const bundles = [];

      // Current subscriptions
      if (userSubscribedServices.length > 0) {
        const bundle = addBundleIfUnique(userSubscribedServices, 'subscribed_only', 0);
        if (bundle) bundles.push(bundle);
      }

      // Current subscriptions + 1 new service
      nonSubscribedServices.forEach(ns => {
        const bundle = addBundleIfUnique(
          [...userSubscribedServices, ns],
          `plus_${ns.id}`,
          ns.numericPrice
        );
        if (bundle) bundles.push(bundle);
      });

      // Current subscriptions + 2 new services
      if (nonSubscribedServices.length >= 2) {
        for (let i = 0; i < nonSubscribedServices.length; i++) {
          for (let j = i + 1; j < nonSubscribedServices.length; j++) {
            const ns1 = nonSubscribedServices[i];
            const ns2 = nonSubscribedServices[j];
            const bundle = addBundleIfUnique(
              [...userSubscribedServices, ns1, ns2],
              `plus_${ns1.id}_${ns2.id}`,
              ns1.numericPrice + ns2.numericPrice
            );
            if (bundle) bundles.push(bundle);
          }
        }
      }

      // Individual services
      currentProcessedAvailableServices.forEach(service => {
        const bundle = addBundleIfUnique(
          [service],
          `single_${service.id}`,
          service.isSubscribed ? 0 : service.numericPrice
        );
        if (bundle) bundles.push(bundle);
      });

      // Pairs of services
      if (currentProcessedAvailableServices.length >= 2) {
        for (let i = 0; i < currentProcessedAvailableServices.length; i++) {
          for (let j = i + 1; j < currentProcessedAvailableServices.length; j++) {
            const s1 = currentProcessedAvailableServices[i];
            const s2 = currentProcessedAvailableServices[j];
            const additionalCost = (!s1.isSubscribed ? s1.numericPrice : 0) + (!s2.isSubscribed ? s2.numericPrice : 0);
            const bundle = addBundleIfUnique(
              [s1, s2],
              `pair_${s1.id}_${s2.id}`,
              additionalCost
            );
            if (bundle) bundles.push(bundle);
              }
          }
      }

      // Process bundles more efficiently
      const enrichedAndUniqueBundles = bundles
        .map(bundleProto => {
          const canonicalServiceIds = bundleProto.servicesInvolved.map(s => s.id).sort().join(',');
          const canonicalBundleId = `bundle_services:${canonicalServiceIds}`;

          const coverage = getBundleCoverageDetails(
            bundleProto.servicesInvolved,
            this.selectedLeagueIds,
            allLeaguesFlatForHelper
          );

          if (coverage.count === 0) return null;

              const item = {
                ...bundleProto,
                id: canonicalBundleId,
            type: 'bundle',
            totalCoveredLeaguesCount: coverage.count,
            selectedLeaguesCoveredDetails: coverage.details,
            totalNumericPrice: bundleProto.servicesInvolved.reduce((sum, s) => sum + (s.numericPrice || 0), 0),
            newlyCoveredLeaguesDetails: {},
            displayName: bundleProto.servicesInvolved.length === 1
              ? bundleProto.servicesInvolved[0].name
              : bundleProto.servicesInvolved.map(s => s.name).join(' + '),
            valueScore: bundleProto.additionalNumericCost > 0
              ? coverage.count / bundleProto.additionalNumericCost
              : (coverage.count > 0 ? Infinity : 0),
            badge: null,
            redundantSubscriptions: [],
            potentialSavings: 0
          };

          // Calculate newly covered leagues
              Object.keys(coverage.details).forEach(leagueId => {
            const isNewServiceBundle = item.servicesInvolved.every(s => !userSubscribedServices.find(us => us.id === s.id));
            if (!baseCoveredLeagueIds.has(leagueId) || isNewServiceBundle) {
                  item.newlyCoveredLeaguesDetails[leagueId] = coverage.details[leagueId];
                }
              });

          return item;
        })
        .filter(Boolean);

      if (enrichedAndUniqueBundles.length === 0) return [];

      // Sort bundles more efficiently
      enrichedAndUniqueBundles.sort((a, b) => {
        if (b.totalCoveredLeaguesCount !== a.totalCoveredLeaguesCount) return b.totalCoveredLeaguesCount - a.totalCoveredLeaguesCount;
        if (a.totalNumericPrice !== b.totalNumericPrice) return a.totalNumericPrice - b.totalNumericPrice;
        if (a.additionalNumericCost !== b.additionalNumericCost) return a.additionalNumericCost - b.additionalNumericCost;
        return a.servicesInvolved.length - b.servicesInvolved.length;
      });

      // Process top coverage pick
      let topCoverageItem = enrichedAndUniqueBundles[0] ? {
        ...enrichedAndUniqueBundles[0],
        badge: 'Top Coverage'
      } : null;

      if (topCoverageItem?.servicesInvolved.length > 0) {
        const servicesInTopCoverageSet = new Set(topCoverageItem.servicesInvolved.map(s => s.id));
        topCoverageItem.redundantSubscriptions = userSubscribedServices
          .filter(subscribedService => !servicesInTopCoverageSet.has(subscribedService.id))
          .map(subscribedService => ({
            id: subscribedService.id,
            name: subscribedService.name,
            price: subscribedService.price,
              numericPrice: subscribedService.numericPrice
          }));
        topCoverageItem.potentialSavings = topCoverageItem.redundantSubscriptions.reduce((sum, s) => sum + s.numericPrice, 0);
      }

      // Process best value pick
      let bestValueCheaperItem = null;
      if (topCoverageItem) {
        const poolForCheaperValue = enrichedAndUniqueBundles
          .filter(item =>
            item.id !== topCoverageItem.id &&
            item.totalNumericPrice < topCoverageItem.totalNumericPrice &&
            item.totalCoveredLeaguesCount > 0
          )
          .sort((a, b) => {
            if (b.valueScore !== a.valueScore) return b.valueScore - a.valueScore;
            if (b.totalCoveredLeaguesCount !== a.totalCoveredLeaguesCount) return b.totalCoveredLeaguesCount - a.totalCoveredLeaguesCount;
            return a.additionalNumericCost - b.additionalNumericCost;
          });

        if (poolForCheaperValue.length > 0) {
          bestValueCheaperItem = {
            ...poolForCheaperValue[0],
            badge: 'Best Value',
            redundantSubscriptions: [],
            potentialSavings: 0
          };

          const servicesInValueBundleSet = new Set(bestValueCheaperItem.servicesInvolved.map(s => s.id));
          bestValueCheaperItem.redundantSubscriptions = userSubscribedServices
            .filter(subscribedService => !servicesInValueBundleSet.has(subscribedService.id))
            .map(subscribedService => ({
              id: subscribedService.id,
              name: subscribedService.name,
              price: subscribedService.price,
              numericPrice: subscribedService.numericPrice
            }));
          bestValueCheaperItem.potentialSavings = bestValueCheaperItem.redundantSubscriptions.reduce((sum, s) => sum + s.numericPrice, 0);
          }
        }

      // Assemble final list
      const finalList = [];
      const addedToFinalListPrimaryIds = new Set();

      if (topCoverageItem) {
        finalList.push(topCoverageItem);
        addedToFinalListPrimaryIds.add(topCoverageItem.id);
      }

      if (bestValueCheaperItem && (!topCoverageItem || bestValueCheaperItem.id !== topCoverageItem.id)) {
        finalList.push(bestValueCheaperItem);
        addedToFinalListPrimaryIds.add(bestValueCheaperItem.id);
      }

      // Add remaining individual services
      const servicesInFinalBadgedItems = new Set(finalList.flatMap(item => item.servicesInvolved.map(s => s.id)));

      const remainingServices = currentProcessedAvailableServices
        .filter(service => !servicesInFinalBadgedItems.has(service.id))
        .map(service => {
          const coverage = getBundleCoverageDetails([service], this.selectedLeagueIds, allLeaguesFlatForHelper);
          if (coverage.count === 0) return null;

          const effectiveNumericPrice = service.isSubscribed ? 0 : service.numericPrice;
          return {
            id: service.id,
            type: 'service',
            servicesInvolved: [service],
                    displayName: service.name,
                    totalCoveredLeaguesCount: coverage.count,
                    selectedLeaguesCoveredDetails: coverage.details,
            additionalNumericCost: effectiveNumericPrice,
            numericPrice: service.numericPrice,
                    totalNumericPrice: service.numericPrice,
            isSubscribed: service.isSubscribed,
            valueScore: effectiveNumericPrice > 0 ? coverage.count / effectiveNumericPrice : (coverage.count > 0 ? Infinity : 0),
            badge: null,
            notes: service.notes,
                    link: service.link,
            originalService: service,
            newlyCoveredLeaguesDetails: {}
          };
        })
        .filter(Boolean)
        .sort((a, b) => {
          if (a.isSubscribed && !b.isSubscribed) return -1;
          if (!a.isSubscribed && b.isSubscribed) return 1;
          if (b.totalCoveredLeaguesCount !== a.totalCoveredLeaguesCount) return b.totalCoveredLeaguesCount - a.totalCoveredLeaguesCount;
          return a.additionalNumericCost - b.additionalNumericCost;
        });

      remainingServices.forEach(item => {
        if (!finalList.some(fi => fi.id === item.id)) {
          finalList.push(item);
            }
        });

      return finalList;
    }
  },

  actions: {
    toggleLeagueSelection(leagueId) {
      const index = this.selectedLeagueIds.indexOf(leagueId);
      if (index > -1) this.selectedLeagueIds.splice(index, 1);
      else this.selectedLeagueIds.push(leagueId);
    },
    toggleServiceSubscription(serviceId) {
      const index = this.subscribedServiceIds.indexOf(serviceId);
      if (index > -1) this.subscribedServiceIds.splice(index, 1);
      else this.subscribedServiceIds.push(serviceId);
    },
    toggleCategoryExpansion(categoryName) {
      const index = this.expandedCategories.indexOf(categoryName);
      if (index > -1) this.expandedCategories.splice(index, 1);
      else this.expandedCategories.push(categoryName);
    },
    toggleServiceCategoryExpansion(categoryName) {
      const index = this.expandedServiceCategories.indexOf(categoryName);
      if (index > -1) {
        this.expandedServiceCategories.splice(index, 1);
      } else {
        this.expandedServiceCategories.push(categoryName);
      }
    },
    selectAllLeagues() {
      const allLeagueIds = this.allLeaguesFlat.map(league => league.id);
      this.selectedLeagueIds = [...new Set(allLeagueIds)];
    },
    unselectAllLeagues() {
      this.selectedLeagueIds = [];
    },
    selectAllServices() {
      const allServiceIds = this.allAvailableServices.map(service => service.id);
      this.subscribedServiceIds = [...new Set(allServiceIds)];
    },
    unselectAllServices() {
      this.subscribedServiceIds = [];
    },
    /**
     * Build the optimal bundle for the selected leagues (max total summed coverage, regardless of price)
     */
    buildOptimalBundle(selectedLeagueIds) {
      const allLeaguesFlat = this.allLeaguesFlat;
      const allServices = this.processedAvailableServicesFlat;
      if (!selectedLeagueIds.length) return null;
      // Generate all non-empty combinations of services
      function getAllCombinations(arr) {
        const results = [];
        const n = arr.length;
        for (let i = 1; i < (1 << n); i++) {
          const combo = [];
          for (let j = 0; j < n; j++) {
            if (i & (1 << j)) combo.push(arr[j]);
          }
          results.push(combo);
        }
        return results;
      }
      let bestBundle = null;
      let bestCoverage = -1;
      let bestPrice = Infinity;
      let bestServiceCount = Infinity;
      const combos = getAllCombinations(allServices);
      for (const combo of combos) {
        let totalPrice = combo.reduce((sum, s) => sum + (s.numericPrice || 0), 0);
        let perLeagueCoverage = {};
        let totalCoverage = 0;
        let coveredLeagues = {};
        for (const leagueId of selectedLeagueIds) {
          // Sum all coverage for this league from all services, capped at 100%
          let sumCoverage = 0;
          let leagueCoverageDesc = '';
          let leagueChannels = [];
          for (const service of combo) {
            const league = service.leagues && service.leagues[leagueId];
            if (league && league.coveragePercent) {
              sumCoverage += league.coveragePercent;
              if (!leagueCoverageDesc && league.coverage) leagueCoverageDesc = league.coverage;
              leagueChannels = leagueChannels.concat((league.channels || []).map(ch => `${ch} (on ${service.name})`));
            }
          }
          sumCoverage = Math.min(sumCoverage, 100);
          perLeagueCoverage[leagueId] = sumCoverage;
          totalCoverage += sumCoverage;
          if (sumCoverage > 0) {
            const leagueInfo = allLeaguesFlat.find(l => l.id === leagueId);
            coveredLeagues[leagueId] = {
              name: leagueInfo ? leagueInfo.name : leagueId,
              icon: leagueInfo ? leagueInfo.icon : '?',
              channels: leagueChannels,
              coverage: leagueCoverageDesc,
              coveragePercent: sumCoverage
            };
          }
        }
        // Prefer: more total coverage, then lower price, then fewer services
        if (
          totalCoverage > bestCoverage ||
          (totalCoverage === bestCoverage && totalPrice < bestPrice) ||
          (totalCoverage === bestCoverage && totalPrice === bestPrice && combo.length < bestServiceCount)
        ) {
          bestCoverage = totalCoverage;
          bestPrice = totalPrice;
          bestServiceCount = combo.length;
          bestBundle = {
            services: combo,
            totalPrice,
            perLeagueCoverage,
            totalCoverage,
            coveredLeagues
          };
        }
      }
      if (!bestBundle) return null;
      return bestBundle;
    },

    /**
     * Adjust a bundle to fit under a new max price by removing services with least impact on total coverage
     * Returns a new bundle object or null if impossible
     */
    adjustBundleForBudget(bundle, maxPrice, tolerance = 2) {
      if (!bundle || !bundle.services || bundle.services.length === 0) return null;
      let currentServices = [...bundle.services];
      let allLeaguesFlat = this.allLeaguesFlat;
      let selectedLeagueIds = Object.keys(bundle.perLeagueCoverage);

      // If our budget is very low (like $5), first try showing the individual
      // services that fit within that budget, in order of best coverage
      if (maxPrice <= 6 && this.processedAvailableServicesFlat) {
        // Find services that are under budget
        const affordableServices = this.processedAvailableServicesFlat
          .filter(s => s.numericPrice <= maxPrice)
          .sort((a, b) => {
            // Count leagues covered by each service
            const aLeaguesCovered = selectedLeagueIds.filter(lid => a.leagues && a.leagues[lid]).length;
            const bLeaguesCovered = selectedLeagueIds.filter(lid => b.leagues && b.leagues[lid]).length;
            return bLeaguesCovered - aLeaguesCovered || a.numericPrice - b.numericPrice;
          });

        // If we found any affordable services, create a bundle with the best one
        if (affordableServices.length > 0) {
          // Get the best affordable service
          const bestService = affordableServices[0];

          // Calculate coverage stats
          let perLeagueCoverage = {};
          let totalCoverage = 0;
          let coveredLeagues = {};

          for (const leagueId of selectedLeagueIds) {
            const league = bestService.leagues && bestService.leagues[leagueId];
            const coveragePercent = league ? league.coveragePercent || 0 : 0;

            perLeagueCoverage[leagueId] = coveragePercent;
            totalCoverage += coveragePercent;

            if (coveragePercent > 0) {
              const leagueInfo = allLeaguesFlat.find(l => l.id === leagueId);
              coveredLeagues[leagueId] = {
                name: leagueInfo ? leagueInfo.name : leagueId,
                icon: leagueInfo ? leagueInfo.icon : '?',
                channels: league.channels || [],
                coverage: league.coverage || "",
                coveragePercent
              };
            }
          }

          return {
            services: [bestService],
            totalPrice: bestService.numericPrice,
            perLeagueCoverage,
            totalCoverage,
            coveredLeagues
          };
        }
      }

      function getBundleStats(services) {
        let totalPrice = services.reduce((sum, s) => sum + (s.numericPrice || 0), 0);
        let perLeagueCoverage = {};
        let totalCoverage = 0;
        let coveredLeagues = {};
        for (const leagueId of selectedLeagueIds) {
          let sumCoverage = 0;
          let leagueCoverageDesc = '';
          let leagueChannels = [];
          for (const service of services) {
            const league = service.leagues && service.leagues[leagueId];
            if (league && league.coveragePercent) {
              sumCoverage += league.coveragePercent;
              if (!leagueCoverageDesc && league.coverage) leagueCoverageDesc = league.coverage;
              leagueChannels = leagueChannels.concat((league.channels || []).map(ch => `${ch} (on ${service.name})`));
            }
          }
          sumCoverage = Math.min(sumCoverage, 100);
          perLeagueCoverage[leagueId] = sumCoverage;
          totalCoverage += sumCoverage;
          if (sumCoverage > 0) {
            const leagueInfo = allLeaguesFlat.find(l => l.id === leagueId);
            coveredLeagues[leagueId] = {
              name: leagueInfo ? leagueInfo.name : leagueId,
              icon: leagueInfo ? leagueInfo.icon : '?',
              channels: leagueChannels,
              coverage: leagueCoverageDesc,
              coveragePercent: sumCoverage
            };
          }
        }
        return { services, totalPrice, perLeagueCoverage, totalCoverage, coveredLeagues };
      }
      // Remove services until under budget (with tolerance)
      while (currentServices.length > 0) {
        let stats = getBundleStats(currentServices);
        if (stats.totalPrice <= maxPrice + tolerance) {
          return stats;
        }
        // Find the service whose removal reduces total coverage the least
        let minImpact = Infinity;
        let serviceToRemove = null;
        for (const service of currentServices) {
          let testServices = currentServices.filter(s => s.id !== service.id);
          let testStats = getBundleStats(testServices);
          let impact = stats.totalCoverage - testStats.totalCoverage;
          if (impact < minImpact) {
            minImpact = impact;
            serviceToRemove = service;
          }
        }
        if (!serviceToRemove) break;
        currentServices = currentServices.filter(s => s.id !== serviceToRemove.id);
      }
      // If we get here, no bundle fits the budget
      return null;
    }
  },

  // LocalStorage persistence (Pinia plugin style)
  persist: false,
});

// --- LocalStorage Persistence ---
const LS_LEAGUES = 'sf_selectedLeagueIds';
const LS_SERVICES = 'sf_subscribedServiceIds';

function hydrateStoreFromLocalStorage(store) {
  try {
    const leagues = JSON.parse(localStorage.getItem(LS_LEAGUES));
    if (Array.isArray(leagues)) store.selectedLeagueIds = leagues;
    const services = JSON.parse(localStorage.getItem(LS_SERVICES));
    if (Array.isArray(services)) store.subscribedServiceIds = services;
  } catch { /* ignore */ }
}

function setupLocalStoragePersistence(store) {
  watch(() => store.selectedLeagueIds, (val) => {
    localStorage.setItem(LS_LEAGUES, JSON.stringify(val));
  }, { deep: true });
  watch(() => store.subscribedServiceIds, (val) => {
    localStorage.setItem(LS_SERVICES, JSON.stringify(val));
  }, { deep: true });
}

// Pinia plugin for localStorage persistence
export function useStreamingStoreWithPersistence() {
  const store = useStreamingStore();
  hydrateStoreFromLocalStorage(store);
  setupLocalStoragePersistence(store);
  return store;
}
