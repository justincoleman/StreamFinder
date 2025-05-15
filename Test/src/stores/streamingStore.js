// src/stores/streamingStore.js
import { defineStore } from 'pinia';
import allServicesData from '@/data/streamingServicesData.json';

// Helper function to parse price string to a number
function parsePrice(priceString) {
  if (!priceString || typeof priceString !== 'string') {
    return Infinity;
  }
  const match = priceString.match(/[\d\.]+/);
  return match ? parseFloat(match[0]) : Infinity;
}

// Helper to calculate unique covered leagues for a set of services
function getBundleCoverageDetails(servicesInBundle, selectedLeagueIds, allLeaguesFlat) {
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
  return { count: coveredLeaguesSet.size, details: coveredLeaguesDetails };
}

export const useStreamingStore = defineStore('streaming', {
  state: () => ({
    allLeaguesByCategory: [
      {
        categoryName: 'American Football', icon: '🏈',
        leagues: [{ id: 'nfl', name: 'NFL', icon: '🏈' }]
      },
      {
        categoryName: 'Basketball', icon: '🏀',
        leagues: [{ id: 'nba', name: 'NBA', icon: '🏀' }]
      },
      {
        categoryName: 'Baseball', icon: '⚾️',
        leagues: [{ id: 'mlb', name: 'MLB', icon: '⚾️' }]
      },
      {
        categoryName: 'Ice Hockey', icon: '🏒',
        leagues: [{ id: 'nhl', name: 'NHL', icon: '🏒' }]
      },
      {
        categoryName: 'Soccer', icon: '⚽️',
        leagues: [
          { id: 'mls', name: 'MLS', icon: '⚽️' }, { id: 'epl', name: 'Premier League (England)', icon: '🇬🇧' },
          { id: 'laliga', name: 'La Liga (Spain)', icon: '🇪🇸' }, { id: 'bundesliga', name: 'Bundesliga (Germany)', icon: '🇩🇪' },
          { id: 'seriea', name: 'Serie A (Italy)', icon: '🇮🇹' }, { id: 'ligue1', name: 'Ligue 1 (France)', icon: '🇫🇷' },
          { id: 'ucl', name: 'UEFA Champions League', icon: '⭐' }, { id: 'uel', name: 'UEFA Europa League', icon: '🏆' },
        ]
      },
      {
        categoryName: 'Motorsport', icon: '🏎️',
        leagues: [{ id: 'f1', name: 'Formula 1', icon: '🏎️' }]
      },
      {
        categoryName: 'Major Events', icon: '🌍',
        leagues: [
            { id: 'fifa_wc', name: 'FIFA World Cup', icon: '🏆🌍' },
            { id: 'olympics_summer', name: 'Summer Olympics', icon: '🥇' },
            { id: 'olympics_winter', name: 'Winter Olympics', icon: '❄️' },
        ]
      }
    ],
    allAvailableServices: allServicesData,
    selectedLeagueIds: [],
    subscribedServiceIds: [],
    expandedCategories: [],
    expandedServiceCategories: [],
  }),

  getters: {
    allLeaguesFlat(state) {
      return state.allLeaguesByCategory.reduce((acc, category) => acc.concat(category.leagues), []);
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

    processedAvailableServicesFlat(state) {
        if (!Array.isArray(state.allAvailableServices)) {
            return [];
        }
        return state.allAvailableServices.map(s => ({
            ...s,
            numericPrice: parsePrice(s.price),
            isSubscribed: state.subscribedServiceIds.includes(s.id),
        }));
    },

    selectedLeagues(state) {
      return this.allLeaguesFlat.filter(league => state.selectedLeagueIds.includes(league.id));
    },

    subscribedServicesDetails(state) {
      return this.processedAvailableServicesFlat.filter(service => service.isSubscribed);
    },

    getFilteredServices(state) {
      if (state.selectedLeagueIds.length === 0) {
        return [];
      }
      const allLeaguesFlatForHelper = this.allLeaguesFlat;
      const currentProcessedAvailableServices = this.processedAvailableServicesFlat;

      const userSubscribedServices = currentProcessedAvailableServices.filter(s => s.isSubscribed);
      const nonSubscribedServices = currentProcessedAvailableServices.filter(s => !s.isSubscribed);

      const baseCoverageFromSubscribed = getBundleCoverageDetails(userSubscribedServices, state.selectedLeagueIds, allLeaguesFlatForHelper);
      const baseCoveredLeagueIds = new Set(Object.keys(baseCoverageFromSubscribed.details));

      // --- 1. Generate Candidate Bundles for "Top Coverage Pick" ---
      let candidateBundles = [];
      // Option A: User's current subscriptions
      if (userSubscribedServices.length > 0) {
        candidateBundles.push({
          idSuffix: 'subscribed_only',
          servicesInvolved: [...userSubscribedServices],
          additionalNumericCost: 0,
        });
      } else { // If no subscriptions, add an empty base for +1/+2 logic
         candidateBundles.push({ idSuffix: 'empty_base', servicesInvolved: [], additionalNumericCost: 0 });
      }

      // Option B: Current subscriptions + 1 new service
      nonSubscribedServices.forEach(ns1 => {
        candidateBundles.push({
          idSuffix: `plus_${ns1.id}`,
          servicesInvolved: [...userSubscribedServices, ns1],
          additionalNumericCost: ns1.numericPrice,
        });
      });

      // Option C: Current subscriptions + 2 new services
      if (nonSubscribedServices.length >= 2) {
        for (let i = 0; i < nonSubscribedServices.length; i++) {
          for (let j = i + 1; j < nonSubscribedServices.length; j++) {
            const ns1 = nonSubscribedServices[i];
            const ns2 = nonSubscribedServices[j];
            candidateBundles.push({
              idSuffix: `plus_${ns1.id}_${ns2.id}`,
              servicesInvolved: [...userSubscribedServices, ns1, ns2],
              additionalNumericCost: ns1.numericPrice + ns2.numericPrice,
            });
          }
        }
      }

      // Option D: Individual services (from ALL available) as standalone options
      currentProcessedAvailableServices.forEach(service => {
        candidateBundles.push({
          idSuffix: `single_${service.id}`,
          servicesInvolved: [service],
          additionalNumericCost: service.isSubscribed ? 0 : service.numericPrice,
        });
      });

      // Option E: Pairs of services (from ALL available)
      if (currentProcessedAvailableServices.length >= 2) {
        for (let i = 0; i < currentProcessedAvailableServices.length; i++) {
          for (let j = i + 1; j < currentProcessedAvailableServices.length; j++) {
            const s1 = currentProcessedAvailableServices[i];
            const s2 = currentProcessedAvailableServices[j];
            let additionalCost = 0;
            if (!s1.isSubscribed) additionalCost += s1.numericPrice;
            if (!s2.isSubscribed) additionalCost += s2.numericPrice;
            candidateBundles.push({
              idSuffix: `pair_${s1.id}_${s2.id}`,
              servicesInvolved: [s1, s2],
              additionalNumericCost: additionalCost,
            });
          }
        }
      }
      // Consider adding Triplets if performance allows and it's deemed necessary for edge cases.

      // Enrich and Deduplicate candidateBundles
      const enrichedAndUniqueBundles = [];
      const seenCanonicalBundleIds = new Set();

      candidateBundles.forEach(bundleProto => {
        // Ensure servicesInvolved are unique in case of overlap (e.g. single service bundle where service is also in userSubscribedServices)
        const uniqueServicesInBundle = [];
        const seenServiceIdsInCurrentBundle = new Set();
        bundleProto.servicesInvolved.forEach(s => {
            if(!seenServiceIdsInCurrentBundle.has(s.id)){
                uniqueServicesInBundle.push(s);
                seenServiceIdsInCurrentBundle.add(s.id);
            }
        });
        bundleProto.servicesInvolved = uniqueServicesInBundle;

        // Skip empty bundles that can arise if user has no subscriptions and we try to make "subscribed_only"
        if (bundleProto.idSuffix === 'subscribed_only' && bundleProto.servicesInvolved.length === 0 && userSubscribedServices.length > 0) {
            // This case should not happen if userSubscribedServices.length > 0, but as a safeguard.
        } else if (bundleProto.servicesInvolved.length === 0 && bundleProto.idSuffix !== 'empty_base' ) {
            return;
        }


        const canonicalServiceIds = bundleProto.servicesInvolved.map(s => s.id).sort().join(',');
        const canonicalBundleId = `bundle_services:${canonicalServiceIds}`; // More robust ID

        if (!seenCanonicalBundleIds.has(canonicalBundleId)) {
          const item = { ...bundleProto, id: canonicalBundleId, type: 'bundle' }; // All are 'bundle' type now

          const coverage = getBundleCoverageDetails(item.servicesInvolved, state.selectedLeagueIds, allLeaguesFlatForHelper);
          item.totalCoveredLeaguesCount = coverage.count;
          item.selectedLeaguesCoveredDetails = coverage.details;
          item.totalNumericPrice = item.servicesInvolved.reduce((sum, s) => sum + (s.numericPrice || 0), 0);

          item.newlyCoveredLeaguesDetails = {};
          Object.keys(coverage.details).forEach(leagueId => {
            const isNewServiceBundle = item.servicesInvolved.every(s => !userSubscribedServices.find(us => us.id === s.id));
            if (!baseCoveredLeagueIds.has(leagueId) || isNewServiceBundle) {
              item.newlyCoveredLeaguesDetails[leagueId] = coverage.details[leagueId];
            }
          });

          if (item.servicesInvolved.length === 1) {
              item.displayName = item.servicesInvolved[0].name;
          } else if (item.servicesInvolved.length > 1) {
              item.displayName = item.servicesInvolved.map(s => s.name).join(' + ');
          } else {
              item.displayName = "No Services Needed";
          }
          item.valueScore = item.additionalNumericCost > 0
                              ? item.totalCoveredLeaguesCount / item.additionalNumericCost
                              : (item.totalCoveredLeaguesCount > 0 ? Infinity : 0);
          item.badge = null;
          item.redundantSubscriptions = [];
          item.potentialSavings = 0;

          if (item.totalCoveredLeaguesCount > 0) { // Only consider bundles that cover at least one selected league
             enrichedAndUniqueBundles.push(item);
          }
          seenCanonicalBundleIds.add(canonicalBundleId);
        }
      });

      if (enrichedAndUniqueBundles.length === 0) return [];

      // Sort for "Top Coverage Pick"
      enrichedAndUniqueBundles.sort((a, b) => {
        if (b.totalCoveredLeaguesCount !== a.totalCoveredLeaguesCount) return b.totalCoveredLeaguesCount - a.totalCoveredLeaguesCount;
        if (a.totalNumericPrice !== b.totalNumericPrice) return a.totalNumericPrice - b.totalNumericPrice;
        if (a.additionalNumericCost !== b.additionalNumericCost) return a.additionalNumericCost - b.additionalNumericCost;
        return a.servicesInvolved.length - b.servicesInvolved.length;
      });

      let topCoverageItem = { ...enrichedAndUniqueBundles[0], badge: 'Top Coverage' };
      if (topCoverageItem.servicesInvolved.length > 0) { // Ensure it's not an empty bundle
        const servicesInTopCoverageSet = new Set(topCoverageItem.servicesInvolved.map(s => s.id));
        userSubscribedServices.forEach(subscribedService => {
          if (!servicesInTopCoverageSet.has(subscribedService.id)) {
            topCoverageItem.redundantSubscriptions.push({
              id: subscribedService.id, name: subscribedService.name,
              price: subscribedService.price, numericPrice: subscribedService.numericPrice
            });
            topCoverageItem.potentialSavings += subscribedService.numericPrice;
          }
        });
      } else {
        topCoverageItem = null; // No valid top coverage pick
      }

      // --- 2. Determine "Best Value Pick (Cheaper Alt.)" ---
      let bestValueCheaperItem = null;
      if (topCoverageItem) {
        const poolForCheaperValue = enrichedAndUniqueBundles.filter(item =>
          item.id !== topCoverageItem.id &&
          item.totalNumericPrice < topCoverageItem.totalNumericPrice &&
          item.totalCoveredLeaguesCount > 0
        );

        if (poolForCheaperValue.length > 0) {
          poolForCheaperValue.sort((a, b) => {
            if (b.valueScore !== a.valueScore) return b.valueScore - a.valueScore;
            if (b.totalCoveredLeaguesCount !== a.totalCoveredLeaguesCount) return b.totalCoveredLeaguesCount - a.totalCoveredLeaguesCount;
            return a.additionalNumericCost - b.additionalNumericCost;
          });
          bestValueCheaperItem = { ...poolForCheaperValue[0], badge: 'Best Value' };
            if (bestValueCheaperItem.type === 'bundle') { // All items are 'bundle' type now
                const servicesInValueBundleSet = new Set(bestValueCheaperItem.servicesInvolved.map(s => s.id));
                bestValueCheaperItem.redundantSubscriptions = [];
                bestValueCheaperItem.potentialSavings = 0;
                userSubscribedServices.forEach(subscribedService => {
                    if (!servicesInValueBundleSet.has(subscribedService.id)) {
                        bestValueCheaperItem.redundantSubscriptions.push({
                            id: subscribedService.id, name: subscribedService.name,
                            price: subscribedService.price, numericPrice: subscribedService.numericPrice
                        });
                        bestValueCheaperItem.potentialSavings += subscribedService.numericPrice;
                    }
                });
            }
        }
      }

      // --- Assemble Final List ---
      const finalList = [];
      if (topCoverageItem) finalList.push(topCoverageItem);

      const addedToFinalListPrimaryIds = new Set();
      if(topCoverageItem) addedToFinalListPrimaryIds.add(topCoverageItem.id);

      if (bestValueCheaperItem && (!topCoverageItem || bestValueCheaperItem.id !== topCoverageItem.id)) {
        finalList.push(bestValueCheaperItem);
        addedToFinalListPrimaryIds.add(bestValueCheaperItem.id);
      }

      // Add remaining *individual services* that are not part of ANY services within the badged items
      const servicesInFinalBadgedItems = new Set(finalList.flatMap(item => item.servicesInvolved.map(s => s.id)));

      currentProcessedAvailableServices
        .filter(service => !servicesInFinalBadgedItems.has(service.id))
        .map(service => {
            const coverage = getBundleCoverageDetails([service], state.selectedLeagueIds, allLeaguesFlatForHelper);
            if (coverage.count > 0) {
                const effectiveNumericPrice = service.isSubscribed ? 0 : service.numericPrice;
                return {
                    id: service.id, type: 'service', servicesInvolved: [service], displayName: service.name,
                    totalCoveredLeaguesCount: coverage.count, selectedLeaguesCoveredDetails: coverage.details,
                    additionalNumericCost: effectiveNumericPrice,
                    numericPrice: service.numericPrice, totalNumericPrice: service.numericPrice,
                    isSubscribed: service.isSubscribed,
                    valueScore: effectiveNumericPrice > 0 ? coverage.count / effectiveNumericPrice : (coverage.count > 0 ? Infinity : 0),
                    badge: null, notes: service.notes, link: service.link, originalService: service,
                    newlyCoveredLeaguesDetails: {},
                };
            }
            return null;
        })
        .filter(item => item !== null)
        .sort((a,b) => {
            if (a.isSubscribed && !b.isSubscribed) return -1;
            if (!a.isSubscribed && b.isSubscribed) return 1;
            if (b.totalCoveredLeaguesCount !== a.totalCoveredLeaguesCount) return b.totalCoveredLeaguesCount - a.totalCoveredLeaguesCount;
            return a.additionalNumericCost - b.additionalNumericCost;
        })
        .forEach(item => {
            // Ensure this individual service (now an item with type 'service') isn't already represented by a badged item's ID
            if (!finalList.some(fi => fi.id === item.id)) {
                 finalList.push(item);
            }
        });

      // Debugging logs (optional, remove for production)
      // console.log("Top Coverage Pick:", JSON.parse(JSON.stringify(topCoverageItem)));
      // console.log("Best Value Cheaper Pick:", JSON.parse(JSON.stringify(bestValueCheaperItem)));
      // console.log("Final List for UI:", JSON.parse(JSON.stringify(finalList.map(i => ({id: i.id, name: i.displayName, badge: i.badge, services: i.servicesInvolved.map(s=>s.name)})))));
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
    }
  },
});
