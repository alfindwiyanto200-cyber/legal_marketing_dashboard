import { listenToProjects, saveProject } from './db.js';

// ===================================================
// 1. LOGIKA UNTUK HALAMAN INDEX.HTML (DASHBOARD REALTIME)
// ===================================================
const totalProjectsEl = document.getElementById('total-projects');
const kanbanBadgeEl = document.getElementById('kanban-badge');

listenToProjects((projects) => {
  if (totalProjectsEl) {
    totalProjectsEl.innerHTML = `${projects.length} <span style="font-size: 1rem; color: #8E8E93;">Aktif</span>`;
  }
  if (kanbanBadgeEl) {
    kanbanBadgeEl.textContent = projects.length;
  }
});

// ===================================================
// 2. LOGIKA UNTUK HALAMAN INPUT-PROJECT.HTML (SIMPAN DATA)
// ===================================================
const form = document.getElementById('projectForm');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Target tombol untuk membuat efek loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="ph ph-spinner-gap ph-spin"></i> Menyimpan...';
    submitBtn.disabled = true;

    // Kumpulkan data secara rapi menggunakan ID baru
    const projectData = {
      picName: document.getElementById('picName').value,
      picPhone: document.getElementById('picPhone').value,
      companyName: document.getElementById('companyName').value,
      businessField: document.getElementById('businessField').value,
      service: document.getElementById('serviceType').value,
      source: document.getElementById('trafficSource').value,
      paymentStatus: document.getElementById('paymentStatus').value,
      deadline: document.getElementById('deadline').value,
      notes: document.getElementById('notes').value
    };

    try {
      // Kirim objek data langsung ke fungsi bawaan db.js
      await saveProject(projectData);
      alert('Project baru berhasil disimpan ke Firebase!');
      form.reset();
    } catch (error) {
      alert('Gagal menyimpan project: ' + error.message);
    } finally {
      // Kembalikan tombol ke status semula
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}