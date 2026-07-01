<script setup>
import { ref, computed, onMounted } from 'vue';
import { store } from '../store.js';
import { api } from '../services/api.js';

const trafficColors = {
  wa: { color: '#D2FA15', label: 'WhatsApp' },
  ig: { color: '#818CF8', label: 'Instagram' },
  web: { color: '#38BDF8', label: 'Website' },
  google: { color: '#FB923C', label: 'Google' },
};
const serviceGroups = {
  Legalitas: ['legal-pt', 'legal-cv', 'legal-haki'],
  'Digital Marketing': ['marketing-social', 'marketing-ads', 'marketing-web'],
};
const serviceGroupColors = {
  Legalitas: 'var(--primary-neon)',
  'Digital Marketing': 'var(--primary-blue)',
};
const bubbleSizes = ['130px', '90px', '65px', '50px'];

const finance = ref({
  omset: 0,
  pemasukan: 0,
  pengeluaran: 0,
  totalPiutang: 0,
  targetPct: 0,
  monthlyBars: [],
});

const projects = computed(() => store.projects);
const total = computed(() => projects.value.length);
const activeCount = computed(() => projects.value.filter((p) => p.status !== 'done').length);

const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;

const trafficBubbles = computed(() => {
  if (total.value === 0) return [];
  const counts = {};
  projects.value.forEach((p) => {
    const src = p.source || 'other';
    counts[src] = (counts[src] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([src, count], i) => {
      const info = trafficColors[src] || { color: '#e0e0e0', label: src };
      return {
        pct: Math.round((count / total.value) * 100),
        color: info.color,
        label: info.label,
        size: bubbleSizes[i] || '45px',
        fs: i === 0 ? '1.1rem' : '0.85rem',
        fslbl: i === 0 ? '0.75rem' : '0.65rem',
      };
    });
});

const serviceBars = computed(() => {
  if (total.value === 0) return [];
  return Object.entries(serviceGroups).map(([groupName, services]) => {
    const count = projects.value.filter((p) => services.includes(p.service)).length;
    const pct = total.value > 0 ? Math.round((count / total.value) * 100) : 0;
    return { groupName, count, pct, color: serviceGroupColors[groupName] };
  });
});

onMounted(async () => {
  try {
    if (!store.loaded) await store.loadProjects();
    finance.value = await api.getDashboard();
  } catch (err) {
    console.error('Dashboard load failed:', err);
  }
});
</script>

<template>
  <main class="main-content">
    <!-- Header -->
    <header class="header">
      <div class="header-title">
        <h1>Overview</h1>
        <p>Lihat performa perusahaan dan campaign bulan ini</p>
      </div>
      <div class="header-actions">
        <button class="icon-btn"><i class="ph ph-magnifying-glass"></i></button>
        <button class="icon-btn"><i class="ph ph-bell"></i></button>
        <div class="user-profile">
          <img src="https://ui-avatars.com/api/?name=Admin+User&background=D2FA15&color=000" alt="User">
          <div class="user-info">
            <span>Welcome back</span>
            <span>Admin User</span>
          </div>
          <i class="ph ph-caret-down"></i>
        </div>
      </div>
    </header>

    <!-- Metrics -->
    <section class="metrics-grid">
      <div class="metric-card primary">
        <div class="card-header">
          <div class="card-icon"><i class="ph ph-money"></i></div>
          <button class="card-action"><i class="ph ph-arrow-up-right"></i></button>
        </div>
        <div>
          <div class="card-value" id="total-omset">{{ rupiah(finance.omset) }}</div>
          <div class="card-label">Omset Bulan Ini</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="card-header">
          <div class="card-icon"><i class="ph ph-trend-up"></i></div>
          <button class="card-action"><i class="ph ph-arrow-up-right"></i></button>
        </div>
        <div>
          <div class="card-value">{{ finance.targetPct }}%</div>
          <div class="card-label">Pencapaian Target</div>
          <div class="trend up" style="visibility:hidden;"><i class="ph ph-trend-up"></i> -</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="card-header">
          <div class="card-icon"><i class="ph ph-briefcase"></i></div>
          <button class="card-action"><i class="ph ph-arrow-up-right"></i></button>
        </div>
        <div>
          <div class="card-value">{{ activeCount }} <span style="font-size: 1rem; color: #8E8E93;">Aktif</span></div>
          <div class="card-label">Total Projek Berjalan</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="card-header">
          <div class="card-icon"><i class="ph ph-wallet"></i></div>
          <button class="card-action"><i class="ph ph-arrow-up-right"></i></button>
        </div>
        <div>
          <div class="card-value">{{ rupiah(finance.totalPiutang) }}</div>
          <div class="card-label">Total Piutang Client</div>
        </div>
      </div>
    </section>

    <!-- Charts Section -->
    <section class="dashboard-grid">
      <!-- Expenses & Cashflow -->
      <div class="chart-card">
        <div class="chart-header">
          <h3><i class="ph ph-chart-bar"></i> Arus Kas & Pengeluaran</h3>
          <select class="form-control" style="width: auto; padding: 6px 30px 6px 12px; border-radius: 8px;">
            <option>Bulan Ini</option>
            <option>Bulan Lalu</option>
          </select>
        </div>

        <div style="display: flex; gap: 40px;">
          <div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Pemasukan</div>
            <div style="font-size: 1.5rem; font-weight: 600;">{{ rupiah(finance.pemasukan) }}</div>
            <div class="trend up" style="visibility:hidden;"><i class="ph ph-trend-up"></i> -</div>
          </div>
          <div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Pengeluaran</div>
            <div style="font-size: 1.5rem; font-weight: 600;">{{ rupiah(finance.pengeluaran) }}</div>
            <div class="trend down" style="visibility:hidden;"><i class="ph ph-trend-down"></i> -</div>
          </div>
        </div>

        <!-- Data-driven CSS Bar Chart (last 5 months) -->
        <div class="css-bar-chart">
          <div class="bar-group" v-for="(bar, i) in finance.monthlyBars" :key="i">
            <div class="bars">
              <div class="bar income" :style="{ height: bar.incomePct + '%' }"></div>
              <div class="bar spend" :style="{ height: bar.spendPct + '%' }"></div>
            </div>
            <span class="bar-label">{{ bar.label }}</span>
          </div>
        </div>
      </div>

      <!-- Traffic / Services Performance -->
      <div class="chart-card">
        <div class="chart-header">
          <h3><i class="ph ph-users-three"></i> Sumber Trafik & Layanan</h3>
        </div>

        <!-- Dynamic Traffic Bubbles -->
        <div class="bubble-chart-container">
          <div v-if="trafficBubbles.length === 0"
               style="width:100%;text-align:center;color:var(--text-muted);padding:20px;font-size:0.85rem;">
            <i class="ph ph-chart-pie" style="font-size:2rem;display:block;margin-bottom:6px;"></i>
            Belum ada data trafik
          </div>
          <div v-for="(b, i) in trafficBubbles" :key="i" class="bubble"
               :style="{ width: b.size, height: b.size, background: b.color, position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', margin: '4px' }">
            <span :style="{ fontWeight: 700, fontSize: b.fs, color: '#111' }">{{ b.pct }}%</span>
            <span :style="{ fontSize: b.fslbl, color: '#333' }">{{ b.label }}</span>
          </div>
        </div>

        <!-- Dynamic Service Performance Bars -->
        <div class="progress-list">
          <div v-if="total === 0" style="color:var(--text-muted);font-size:0.85rem;text-align:center;padding:10px;">
            Belum ada data layanan
          </div>
          <div v-for="s in serviceBars" :key="s.groupName" class="progress-item">
            <div class="progress-header">
              <span>{{ s.groupName }}</span>
              <span>{{ s.pct }}% ({{ s.count }} projek)</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: s.pct + '%', background: s.color, transition: 'width 0.5s ease' }"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
