import { createRouter, createWebHistory } from 'vue-router';

import Dashboard from '../views/Dashboard.vue';
import InputProject from '../views/InputProject.vue';
import Kanban from '../views/Kanban.vue';
import AllProjects from '../views/AllProjects.vue';
import CashFlow from '../views/CashFlow.vue';

const routes = [
  { path: '/', name: 'dashboard', component: Dashboard },
  { path: '/input-project', name: 'input-project', component: InputProject },
  { path: '/kanban', name: 'kanban', component: Kanban },
  { path: '/all-projects', name: 'all-projects', component: AllProjects },
  { path: '/cash-flow', name: 'cash-flow', component: CashFlow },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
