<script setup>
import { ref, computed, onMounted } from 'vue';
import { store } from '../store.js';

const serviceLabels = {
  'legal-pt': 'Pendirian PT', 'legal-cv': 'Pendirian CV',
  'legal-haki': 'HAKI', 'marketing-social': 'Social Media',
  'marketing-ads': 'Google/Meta Ads', 'marketing-web': 'Pembuatan Website',
};
const sourceLabels = { wa: 'WhatsApp', ig: 'Instagram', web: 'Website', google: 'Google' };
const statusLabels = {
  leads: 'Leads', drafting: 'Drafting', process: 'On Process',
  hold: 'On Hold', done: 'Done', trouble: 'Trouble',
};
const statusColors = {
  leads: '#F59E0B', drafting: '#3B82F6', process: '#8B5CF6',
  hold: '#6B7280', done: '#10B981', trouble: '#EF4444',
};
const paymentLabels = { unpaid: 'Unpaid', dp: 'DP', paid: 'Lunas' };
const paymentColors = { unpaid: '#F59E0B', dp: '#3B82F6', paid: '#10B981' };

function paymentBg(payment) {
  const rgb = payment === 'paid' ? '16,185,129' : payment === 'dp' ? '59,130,246' : '245,158,11';
  return `rgba(${rgb},0.1)`;
}
const pad = (n) => String(n).padStart(3, '0');

const search = ref('');

const rows = computed(() =>
  store.projects
    .map((p, i) => ({ ...p, displayId: i + 1 }))
    .filter((p) => {
      const q = search.value.trim().toLowerCase();
      if (!q) return true;
      return (
        (p.picName || '').toLowerCase().includes(q) ||
        (p.picPhone || '').toLowerCase().includes(q) ||
        (p.companyName || '').toLowerCase().includes(q)
      );
    })
);

onMounted(() => {
  if (!store.loaded) store.loadProjects().catch((err) => console.error(err));
});
</script>

<template>
  <main class="main-content">
    <header class="header">
      <div class="header-title">
        <h1>Database Projek</h1>
        <p>Seluruh riwayat dan status projek aktif maupun selesai</p>
      </div>
      <div class="header-actions">
        <div style="position: relative;">
          <i class="ph ph-magnifying-glass" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
          <input type="text" v-model="search" class="form-control" placeholder="Cari nama klien / no HP..." style="padding-left: 36px; width: 250px;">
        </div>
        <button class="btn-primary" style="padding: 10px 16px;"><i class="ph ph-funnel"></i> Filter</button>
      </div>
    </header>

    <section class="data-table-container">
      <table>
        <thead>
          <tr>
            <th>ID Projek</th>
            <th>Nama Klien / Perusahaan</th>
            <th>Layanan</th>
            <th>Sumber</th>
            <th>Tenggat Waktu</th>
            <th>Status Pembayaran</th>
            <th>Status Pengerjaan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="rows.length === 0">
            <td colspan="8" style="text-align:center; padding:30px; color:var(--text-muted);">
              Belum ada data project. Silakan input project baru.
            </td>
          </tr>
          <tr v-for="project in rows" :key="project.id">
            <td><span style="font-family:monospace;color:var(--text-muted);font-size:0.85rem;">#PRJ-{{ pad(project.displayId) }}</span></td>
            <td><strong>{{ project.picName || '-' }}</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">{{ project.companyName || '-' }}</span></td>
            <td>{{ serviceLabels[project.service] || project.service || '-' }}</td>
            <td>{{ sourceLabels[project.source] || project.source || '-' }}</td>
            <td>{{ project.deadline || '-' }}</td>
            <td>
              <span :style="{ background: paymentBg(project.paymentStatus || 'unpaid'), color: paymentColors[project.paymentStatus || 'unpaid'], padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500 }">
                {{ paymentLabels[project.paymentStatus || 'unpaid'] }}
              </span>
            </td>
            <td>
              <span :style="{ background: 'rgba(0,0,0,0.05)', color: statusColors[project.status || 'leads'], padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }">
                {{ statusLabels[project.status || 'leads'] }}
              </span>
            </td>
            <td><button class="icon-btn" style="width:32px;height:32px;"><i class="ph ph-dots-three"></i></button></td>
          </tr>
        </tbody>
      </table>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding: 0 10px;">
        <span style="color: var(--text-muted); font-size: 0.9rem;">{{ rows.length === 0 ? '0 projek' : `Total ${rows.length} projek` }}</span>
      </div>
    </section>
  </main>
</template>
