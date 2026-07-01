<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { store } from '../store.js';
import { auth } from '../auth.js';

const router = useRouter();
const kanbanCount = computed(() => store.projects.length);
const username = computed(() => auth.user?.username || 'User');

function logout() {
  auth.logout();
  store.projects = [];
  store.loaded = false;
  router.push({ name: 'login' });
}
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

    <div class="sidebar-footer">
      <div class="sidebar-user" :title="username">
        <div class="pic-avatar">{{ username.charAt(0).toUpperCase() }}</div>
        <span class="sidebar-username">{{ username }}</span>
      </div>
      <button class="nav-link logout-btn" @click="logout">
        <i class="ph ph-sign-out"></i> Logout
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}
.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  margin-bottom: 4px;
}
.sidebar-username {
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.logout-btn {
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 1rem;
  text-align: left;
}
.logout-btn:hover {
  color: var(--status-trouble);
}
</style>
