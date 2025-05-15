// src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia'; // Make sure Pinia is imported
import App from './App.vue';
import router from './router';
import './assets/main.css'; // Your Tailwind CSS import

const app = createApp(App);

app.use(createPinia()); // Use Pinia
app.use(router);

app.mount('#app');