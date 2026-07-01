<script setup>
import { ref, computed, onMounted } from 'vue';
import { store } from '../store.js';
import { api } from '../services/api.js';

const columns = [
  { key: 'leads', label: 'Leads', icon: 'ph-funnel', color: 'var(--status-leads)' },
  { key: 'drafting', label: 'Drafting', icon: 'ph-file-text', color: 'var(--status-drafting)' },
  { key: 'process', label: 'On Process', icon: 'ph-spinner-gap ph-spin', color: 'var(--status-process)' },
  { key: 'hold', label: 'On Hold', icon: 'ph-pause-circle', color: 'var(--status-hold)' },
  { key: 'done', label: 'Done', icon: 'ph-check-circle', color: 'var(--status-done)' },
  { key: 'trouble', label: 'Trouble', icon: 'ph-warning-circle', color: 'var(--status-trouble)' },
];

const serviceBadge = {
  'legal-pt': 'Pendirian PT',
  'legal-cv': 'Pendirian CV',
  'legal-haki': 'HAKI',
};

const projects = computed(() => store.projects);
const draggedId = ref(null);

function projectsFor(statusKey) {
  return projects.value.filter((p) => (p.status || 'leads') === statusKey);
}

function sliderStyle(progress, color) {
  const val = progress || 0;
  return {
    background: `linear-gradient(to right, ${color} 0%, ${color} ${val}%, #f0f0f0 ${val}%, #f0f0f0 100%)`,
  };
}

function onDragStart(id) {
  draggedId.value = id;
}

async function onDrop(statusKey) {
  const id = draggedId.value;
  draggedId.value = null;
  if (!id) return;
  const project = projects.value.find((p) => p.id === id);
  if (!project || project.status === statusKey) return;
  try {
    await api.updateStatus(id, statusKey);
    await store.loadProjects();
  } catch (err) {
    alert('Gagal memindahkan: ' + err.message);
  }
}

async function onStageChange(project) {
  try {
    await api.updateStages(project.id, project.stages);
  } catch (err) {
    alert('Gagal menyimpan progres: ' + err.message);
  }
}

async function addProgress(project) {
  const name = prompt('Nama tahapan progres baru:', 'Tahap Baru');
  if (!name) return;
  const stages = [...(project.stages || []), { name, progress: 0 }];
  try {
    await api.updateStages(project.id, stages);
    await store.loadProjects();
  } catch (err) {
    alert('Gagal menambah progres: ' + err.message);
  }
}

async function removeProject(project) {
  if (!confirm('⚠️ Yakin ingin menghapus project ini? Data tidak bisa dikembalikan.')) return;
  try {
    await api.deleteProject(project.id);
    await store.loadProjects();
  } catch (err) {
    alert('Gagal menghapus: ' + err.message);
  }
}

onMounted(() => {
  if (!store.loaded) store.loadProjects().catch((err) => console.error(err));
});
</script>

<template>
  <main class="main-content" style="padding-right: 20px;">
    <header class="header">
      <div class="header-title">
        <h1>Project Tracking</h1>
        <p>Kanban Board & Gantt Timeline</p>
      </div>
      <div class="header-actions">
        <div style="background: white; padding: 4px; border-radius: 20px; border: var(--glass-border); display: flex;">
          <button class="btn-outline" style="border: none; background: var(--text-main); color: white; border-radius: 16px; padding: 8px 16px;">Kanban</button>
          <button class="btn-outline" style="border: none; padding: 8px 16px;">Gantt</button>
        </div>
      </div>
    </header>

    <section class="kanban-board">
      <div class="kanban-column" v-for="col in columns" :key="col.key"
           @dragover.prevent @drop.prevent="onDrop(col.key)">
        <div class="column-header">
          <h3><i class="ph" :class="col.icon" :style="{ color: col.color }"></i> {{ col.label }}</h3>
          <span class="count-badge">{{ projectsFor(col.key).length }}</span>
        </div>
        <div class="kanban-cards">
          <div class="kanban-card" v-for="project in projectsFor(col.key)" :key="project.id"
               draggable="true" @dragstart="onDragStart(project.id)">
            <div class="card-header-row" style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div class="card-badges">
                <span v-if="serviceBadge[project.service]" class="badge"
                      style="background: rgba(59, 130, 246, 0.1); color: #3B82F6;">{{ serviceBadge[project.service] }}</span>
                <span v-if="project.paymentStatus === 'unpaid'" class="badge"
                      style="background: rgba(245, 158, 11, 0.1); color: #F59E0B;">Unpaid</span>
                <span v-else class="badge"
                      style="background: rgba(16, 185, 129, 0.1); color: #10B981;">Paid</span>
              </div>
              <button class="btn-delete-card" title="Hapus Project" @click="removeProject(project)"
                      style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:1rem;padding:2px 4px;border-radius:4px;opacity:0.6;"
                      onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">
                <i class="ph ph-trash"></i>
              </button>
            </div>
            <h4>{{ project.picName }} <br><span style="font-size:0.75rem; color:var(--text-muted); font-weight:400;">{{ project.companyName || '-' }}</span></h4>
            <div class="client-info">Source: {{ project.source || '-' }}</div>
            <div class="stages-container">
              <div class="progress-item" style="margin-top: 10px;"
                   v-for="(stage, index) in project.stages" :key="index">
                <div class="progress-header" style="font-size: 0.75rem;">
                  <span>{{ stage.name }}</span>
                  <span class="progress-text">{{ stage.progress || 0 }}%</span>
                </div>
                <input type="range" class="progress-slider" min="0" max="100"
                       v-model.number="stage.progress"
                       :style="sliderStyle(stage.progress, col.color)"
                       @change="onStageChange(project)">
              </div>
            </div>
            <button class="btn-add-progress" @click="addProgress(project)"><i class="ph ph-plus"></i> Tambah Progres</button>
            <div class="card-footer">
              <div class="due-date"><i class="ph ph-calendar-blank"></i> {{ project.deadline || '-' }}</div>
              <div class="pic-avatar" :title="'PIC: ' + project.picName">{{ project.picName ? project.picName.charAt(0).toUpperCase() : '?' }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
