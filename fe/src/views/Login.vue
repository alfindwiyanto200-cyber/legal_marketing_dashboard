<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../auth.js';

const router = useRouter();
const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await auth.login(username.value.trim(), password.value);
    router.push({ name: 'dashboard' });
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-wrap">
    <div class="auth-card">
      <img src="/image/logoResmiin1.svg" alt="Logo" class="auth-logo">
      <h2>Masuk ke Dashboard</h2>
      <p class="auth-sub">Silakan login untuk melanjutkan</p>

      <form @submit.prevent="submit">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input type="text" v-model="username" class="form-control" placeholder="Username" required autofocus>
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" v-model="password" class="form-control" placeholder="Password" required>
        </div>

        <div v-if="error" class="auth-error">{{ error }}</div>

        <button type="submit" class="btn-primary" style="width:100%; justify-content:center; margin-top:8px;" :disabled="loading">
          <i class="ph ph-sign-in"></i> {{ loading ? 'Memproses...' : 'Login' }}
        </button>
      </form>

      <p class="auth-alt">
        Belum punya akun?
        <router-link to="/register">Daftar di sini</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.auth-card {
  background: white;
  padding: 40px;
  border-radius: var(--card-radius);
  border: var(--glass-border);
  box-shadow: var(--glass-shadow);
  width: 100%;
  max-width: 400px;
  text-align: center;
}
.auth-logo {
  height: 48px;
  margin-bottom: 20px;
}
.auth-card h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 4px;
}
.auth-sub {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 24px;
}
.auth-card form {
  text-align: left;
}
.auth-error {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 0.85rem;
  margin-bottom: 16px;
}
.auth-alt {
  margin-top: 20px;
  font-size: 0.9rem;
  color: var(--text-muted);
}
.auth-alt a {
  color: var(--text-main);
  font-weight: 600;
  text-decoration: none;
}
</style>
