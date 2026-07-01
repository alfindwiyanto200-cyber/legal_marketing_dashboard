<script setup>
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './components/Sidebar.vue';
import { store } from './store.js';
import { auth } from './auth.js';

const route = useRoute();
const isPublic = computed(() => route.meta.public);

// Load projects (for sidebar badge etc.) whenever we have a session.
watch(
  () => auth.isAuthenticated,
  (authed) => {
    if (authed) store.loadProjects().catch((err) => console.error('Failed to load projects:', err));
  },
  { immediate: true }
);
</script>

<template>
  <!-- Auth pages: full-screen, no sidebar -->
  <router-view v-if="isPublic" />

  <!-- App shell -->
  <div v-else class="app-container">
    <Sidebar />
    <router-view />
  </div>
</template>
