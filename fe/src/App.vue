<script setup>
import { onMounted } from 'vue';
import Sidebar from './components/Sidebar.vue';
import { store } from './store.js';

// Load projects once so the sidebar badge is populated on first paint.
onMounted(() => {
  store.loadProjects().catch((err) => console.error('Failed to load projects:', err));
});
</script>

<template>
  <div class="app-container">
    <Sidebar />
    <router-view />
  </div>
</template>
