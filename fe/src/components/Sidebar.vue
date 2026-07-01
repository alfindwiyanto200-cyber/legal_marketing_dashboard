<script setup>
import { computed } from 'vue';
import { store } from '../store.js';

const kanbanCount = computed(() => store.projects.length);
</script>

<template>
  <aside class="sidebar">
    <div class="logo">
      <img src="/image/logoResmiin1.svg" alt="Logo" style="height: 48px; width: auto; max-width: 100%;">
    </div>

    <ul class="nav-menu">
      <li class="nav-item">
        <router-link to="/" class="nav-link" exact-active-class="active">
          <i class="ph ph-house"></i> Dashboard
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/input-project" class="nav-link" exact-active-class="active">
          <i class="ph ph-plus-circle"></i> Input Project
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/kanban" class="nav-link" exact-active-class="active">
          <i class="ph ph-kanban"></i> Kanban Board
          <span class="badge">{{ kanbanCount }}</span>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/all-projects" class="nav-link" exact-active-class="active">
          <i class="ph ph-folders"></i> All Projects
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/cash-flow" class="nav-link" exact-active-class="active">
          <i class="ph ph-wallet"></i> Cash Flow
        </router-link>
      </li>
    </ul>
  </aside>
</template>
