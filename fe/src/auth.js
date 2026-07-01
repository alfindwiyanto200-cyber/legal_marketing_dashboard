import { reactive } from 'vue';
import { api } from './services/api.js';

const AUTH_KEY = 'auth';
const saved = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');

// Shared auth state, persisted to localStorage so a refresh keeps the session.
export const auth = reactive({
  token: saved?.token || null,
  user: saved?.user || null,

  get isAuthenticated() {
    return !!this.token;
  },

  _persist() {
    if (this.token) {
      localStorage.setItem(AUTH_KEY, JSON.stringify({ token: this.token, user: this.user }));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  },

  async login(username, password) {
    const data = await api.login({ username, password });
    this.token = data.token;
    this.user = data.user;
    this._persist();
  },

  async register(username, password) {
    const data = await api.register({ username, password });
    this.token = data.token;
    this.user = data.user;
    this._persist();
  },

  logout() {
    this.token = null;
    this.user = null;
    this._persist();
  },
});
