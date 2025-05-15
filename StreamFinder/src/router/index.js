// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import LeagueSelectionView from '../views/LeagueSelectionView.vue';
// Import the new view
import SubscribedServicesView from '../views/SubscribedServicesView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'league-selection', // Renamed for clarity
      component: LeagueSelectionView
    },
    { // NEW ROUTE
      path: '/select-subscriptions',
      name: 'select-subscriptions',
      component: SubscribedServicesView
    },
    {
      path: '/results',
      name: 'results',
      component: () => import('../views/ResultsView.vue')
    }
  ]
});

export default router;