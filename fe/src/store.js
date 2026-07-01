import { reactive } from 'vue';
import { api } from './services/api.js';

// Lightweight shared state: the projects list drives both the views and the
// sidebar "kanban" badge, so a refresh after any mutation keeps everything in sync.
export const store = reactive({
  projects: [],
  loaded: false,

  async loadProjects() {
    this.projects = await api.getProjects();
    this.loaded = true;
    return this.projects;
  },
});
