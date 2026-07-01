import { createRouter, createWebHistory } from 'vue-router';

import { auth } from '../auth.js';
import Dashboard from '../views/Dashboard.vue';
import InputProject from '../views/InputProject.vue';
import Kanban from '../views/Kanban.vue';
import AllProjects from '../views/AllProjects.vue';
import CashFlow from '../views/CashFlow.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';

const routes = [
  { path: '/login', name: 'login', component: Login, meta: { public: true } },
  { path: '/register', name: 'register', component: Register, meta: { public: true } },
  { path: '/', name: 'dashboard', component: Dashboard },
  { path: '/input-project', name: 'input-project', component: InputProject },
  { path: '/kanban', name: 'kanban', component: Kanban },
  { path: '/all-projects', name: 'all-projects', component: AllProjects },
  { path: '/cash-flow', name: 'cash-flow', component: CashFlow },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  if (!to.meta.public && !auth.isAuthenticated) {
    return { name: 'login' };
  }
  if (to.meta.public && auth.isAuthenticated) {
    return { name: 'dashboard' };
  }
});

export default router;
