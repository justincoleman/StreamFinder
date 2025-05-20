// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import ResultsView from '../views/ResultsView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'results',
      component: ResultsView
    }
    // Old routes removed for single-screen app
  ]
});

export default router;