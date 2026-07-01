<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { api } from '../services/api.js';

const categoryLabels = {
  sales: 'Penjualan Layanan',
  ads: 'Biaya Iklan (Ads)',
  salary: 'Gaji Karyawan',
  operational: 'Operasional Kantor',
  vendor: 'Pembayaran Vendor/Notaris',
  other: 'Lain-lain',
};

const emptyForm = () => ({
  date: '',
  type: 'in',
  amount: '',
  category: 'sales',
  description: '',
});

const form = reactive(emptyForm());
const proofFile = ref(null);
const fileInput = ref(null);
const saving = ref(false);

const transactions = ref([]);
const month = ref('');

const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
const pad = (n) => String(n).padStart(3, '0');

const rows = computed(() => {
  let saldo = 0;
  return transactions.value.map((t, i) => {
    saldo += t.type === 'in' ? t.amount : -t.amount;
    return { ...t, code: `TRX-${pad(i + 1)}`, saldo };
  });
});

async function loadTransactions() {
  try {
    transactions.value = await api.getTransactions(month.value || undefined);
  } catch (err) {
    console.error('Failed to load transactions:', err);
  }
}

function onFileChange(e) {
  proofFile.value = e.target.files[0] || null;
}

async function handleSubmit() {
  saving.value = true;
  try {
    const fd = new FormData();
    fd.append('date', form.date);
    fd.append('type', form.type);
    fd.append('amount', form.amount);
    fd.append('category', form.category);
    fd.append('description', form.description);
    if (proofFile.value) fd.append('proof', proofFile.value);

    await api.createTransaction(fd);
    Object.assign(form, emptyForm());
    proofFile.value = null;
    if (fileInput.value) fileInput.value.value = '';
    await loadTransactions();
  } catch (err) {
    alert('Gagal menyimpan transaksi: ' + err.message);
  } finally {
    saving.value = false;
  }
}

function exportCsv() {
  const header = ['Tanggal', 'Kode', 'Deskripsi', 'Kategori', 'Masuk', 'Keluar', 'Saldo'];
  const body = rows.value.map((r) => [
    r.date,
    r.code,
    r.description || '',
    categoryLabels[r.category] || r.category || '',
    r.type === 'in' ? r.amount : 0,
    r.type === 'out' ? r.amount : 0,
    r.saldo,
  ]);
  const csv = [header, ...body]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cashflow${month.value ? '-' + month.value : ''}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

watch(month, loadTransactions);
onMounted(loadTransactions);
</script>

<template>
  <main class="main-content">
    <header class="header">
      <div class="header-title">
        <h1>Arus Kas (Cash Flow)</h1>
        <p>Catat dan pantau transaksi pemasukan serta pengeluaran</p>
      </div>
    </header>

    <div class="dashboard-grid" style="grid-template-columns: 1fr 2fr; align-items: start;">

      <!-- Form Input Transaksi -->
      <section class="chart-card">
        <h3 style="margin-bottom: 20px; font-weight: 600; font-size: 1.1rem; border-bottom: 1px solid #eee; padding-bottom: 10px;">Input Transaksi Baru</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label">Tanggal Transaksi</label>
            <input type="date" v-model="form.date" class="form-control" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Jenis Transaksi</label>
              <select class="form-control" v-model="form.type" required>
                <option value="in">Pemasukan (In)</option>
                <option value="out">Pengeluaran (Out)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Nominal (Rp)</label>
              <input type="number" v-model="form.amount" class="form-control" placeholder="0" min="0" required>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Kategori</label>
            <select class="form-control" v-model="form.category">
              <option value="sales">Penjualan Layanan</option>
              <option value="ads">Biaya Iklan (Ads)</option>
              <option value="salary">Gaji Karyawan</option>
              <option value="operational">Operasional Kantor</option>
              <option value="vendor">Pembayaran Vendor/Notaris</option>
              <option value="other">Lain-lain</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Deskripsi / Keterangan</label>
            <input type="text" v-model="form.description" class="form-control" placeholder="Cth: Pelunasan PT Maju Jaya" required>
          </div>

          <div class="form-group">
            <label class="form-label">Bukti Transaksi (Opsional)</label>
            <input type="file" ref="fileInput" @change="onFileChange" class="form-control" style="padding: 10px;">
          </div>

          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: 10px;" :disabled="saving">
            <i class="ph ph-plus"></i> {{ saving ? 'Menyimpan...' : 'Tambah Transaksi' }}
          </button>
        </form>
      </section>

      <!-- Tabel Transaksi -->
      <section class="data-table-container">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="font-weight: 600; font-size: 1.1rem;">Riwayat Mutasi & Buku Kas</h3>
          <div style="display: flex; gap: 10px;">
            <input type="month" v-model="month" class="form-control" style="padding: 6px 12px; width: auto;">
            <button class="btn-outline" style="padding: 8px 12px;" @click="exportCsv"><i class="ph ph-export"></i> Export CSV</button>
          </div>
        </div>

        <div style="overflow-x: auto;">
          <table style="min-width: 600px;">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Kode</th>
                <th>Deskripsi</th>
                <th>Kategori</th>
                <th style="text-align: right;">Masuk (In)</th>
                <th style="text-align: right;">Keluar (Out)</th>
                <th style="text-align: right;">Saldo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="rows.length === 0">
                <td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">
                  <i class="ph ph-receipt" style="font-size:2rem; display:block; margin-bottom:8px;"></i>
                  Belum ada transaksi. Silakan input transaksi pertama Anda.
                </td>
              </tr>
              <tr v-for="t in rows" :key="t.id">
                <td>{{ t.date }}</td>
                <td><span style="font-family:monospace;color:var(--text-muted);font-size:0.85rem;">#{{ t.code }}</span></td>
                <td>{{ t.description || '-' }}</td>
                <td>{{ categoryLabels[t.category] || t.category || '-' }}</td>
                <td style="text-align: right; color:#10B981;">{{ t.type === 'in' ? rupiah(t.amount) : '-' }}</td>
                <td style="text-align: right; color:#EF4444;">{{ t.type === 'out' ? rupiah(t.amount) : '-' }}</td>
                <td style="text-align: right; font-weight:600;">{{ rupiah(t.saldo) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </div>
  </main>
</template>
