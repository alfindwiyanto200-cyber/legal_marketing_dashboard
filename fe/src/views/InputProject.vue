<script setup>
import { ref, reactive } from 'vue';
import { store } from '../store.js';
import { api } from '../services/api.js';

const emptyForm = () => ({
  picName: '',
  picPhone: '',
  companyName: '',
  businessField: '',
  service: '',
  source: '',
  paymentStatus: 'unpaid',
  paymentAmount: '',
  projectValue: '',
  deadline: '',
  notes: '',
});

const form = reactive(emptyForm());
const saving = ref(false);

async function handleSubmit() {
  saving.value = true;
  try {
    await api.createProject({
      ...form,
      paymentAmount: Number(form.paymentAmount) || 0,
      projectValue: Number(form.projectValue) || 0,
    });
    await store.loadProjects();
    alert('✅ Project berhasil disimpan ke database!');
    Object.assign(form, emptyForm());
  } catch (err) {
    console.error(err);
    alert('❌ Gagal menyimpan: ' + err.message);
  } finally {
    saving.value = false;
  }
}

function handleReset() {
  Object.assign(form, emptyForm());
}
</script>

<template>
  <main class="main-content">
    <header class="header">
      <div class="header-title">
        <h1>Input Project Baru</h1>
        <p>Tambahkan data klien dan layanan yang diambil</p>
      </div>
    </header>

    <section class="form-section">
      <div class="chart-card" style="max-width: 800px;">
        <form id="projectForm" @submit.prevent="handleSubmit" @reset.prevent="handleReset">

          <h3 style="margin-bottom: 20px; font-weight: 600; font-size: 1.1rem; border-bottom: 1px solid #eee; padding-bottom: 10px;">Informasi Klien</h3>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nama PIC</label>
              <input type="text" v-model="form.picName" class="form-control" placeholder="Masukkan nama lengkap" required>
            </div>
            <div class="form-group">
              <label class="form-label">No. WA / HP</label>
              <input type="text" v-model="form.picPhone" class="form-control" placeholder="Contoh: 08123456789" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nama Perusahaan / Merek</label>
              <input type="text" v-model="form.companyName" class="form-control" placeholder="PT / CV / Nama Usaha" required>
            </div>
            <div class="form-group">
              <label class="form-label">Bidang Bisnis</label>
              <input type="text" v-model="form.businessField" class="form-control" placeholder="Contoh: F&B, Retail, Jasa">
            </div>
          </div>

          <h3 style="margin: 30px 0 20px 0; font-weight: 600; font-size: 1.1rem; border-bottom: 1px solid #eee; padding-bottom: 10px;">Detail Layanan</h3>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Layanan yang Diambil</label>
              <select v-model="form.service" class="form-control" required>
                <option value="">Pilih Layanan</option>
                <option value="legal-pt">Pendirian PT</option>
                <option value="legal-cv">Pendirian CV</option>
                <option value="legal-haki">Pendaftaran HAKI</option>
                <option value="marketing-social">Social Media Management</option>
                <option value="marketing-ads">Google / Meta Ads</option>
                <option value="marketing-web">Pembuatan Website</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Sumber Traffic</label>
              <select v-model="form.source" class="form-control" required>
                <option value="">Pilih Sumber</option>
                <option value="wa">WhatsApp</option>
                <option value="ig">Instagram</option>
                <option value="web">Website</option>
                <option value="google">Google Search</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Status Pembayaran</label>
              <select v-model="form.paymentStatus" class="form-control">
                <option value="unpaid">Belum Dibayar (→ Leads)</option>
                <option value="dp">DP / Down Payment (→ Drafting)</option>
                <option value="paid">Lunas (→ On Process)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Jumlah Pembayaran (Rp)</label>
              <input type="number" v-model="form.paymentAmount" class="form-control" placeholder="0" min="0">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Total Nilai Project (Rp)</label>
              <input type="number" v-model="form.projectValue" class="form-control" placeholder="0" min="0">
            </div>
            <div class="form-group">
              <label class="form-label">Tenggat Waktu (Deadline)</label>
              <input type="date" v-model="form.deadline" class="form-control">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Catatan Tambahan</label>
            <textarea v-model="form.notes" class="form-control" rows="4" placeholder="Tuliskan catatan khusus atau to-do list awal..."></textarea>
          </div>

          <div style="display: flex; gap: 16px; margin-top: 30px;">
            <button type="submit" class="btn-primary" :disabled="saving">
              <i :class="saving ? 'ph ph-spinner-gap ph-spin' : 'ph ph-check-circle'"></i>
              {{ saving ? 'Menyimpan...' : 'Simpan Project' }}
            </button>
            <button type="reset" class="btn-outline">Reset Data</button>
          </div>

        </form>
      </div>
    </section>
  </main>
</template>
