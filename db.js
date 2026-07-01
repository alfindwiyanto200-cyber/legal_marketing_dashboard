import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, updateDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const projectsCol = collection(db, 'projects');

// Fungsi untuk menyimpan project baru
export const saveProject = async (projectData) => {
    try {
        const docRef = await addDoc(projectsCol, {
            ...projectData,
            createdAt: serverTimestamp(),
            status: 'leads' // Status awal default
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

// Fungsi untuk mendengarkan perubahan data project secara real-time
export const listenToProjects = (callback) => {
    const q = query(projectsCol, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const projects = [];
        snapshot.forEach((doc) => {
            projects.push({ id: doc.id, ...doc.data() });
        });
        callback(projects);
    });
};

// Fungsi untuk update status kanban (leads, drafting, dll)
export const updateProjectStatus = async (projectId, newStatus) => {
    try {
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, { status: newStatus });
    } catch (e) {
        console.error("Error updating status: ", e);
    }
};

// Fungsi untuk update tahapan/progress
export const updateProjectStages = async (projectId, newStages) => {
    try {
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, { stages: newStages });
    } catch (e) {
        console.error("Error updating stages: ", e);
    }
};

// Data Template Tahapan Default berdasarkan Layanan
export const getStageTemplate = (serviceType) => {
    switch (serviceType) {
        case 'legal-pt':
        case 'legal-cv':
            return [
                { name: 'Pengecekan Nama', progress: 0 },
                { name: 'Draft Akta', progress: 0 },
                { name: 'Tanda Tangan', progress: 0 },
                { name: 'SK Kemenkumham', progress: 0 },
                { name: 'NIB & Izin Dasar', progress: 0 }
            ];
        case 'legal-haki':
            return [
                { name: 'Pengecekan Merek', progress: 0 },
                { name: 'Pembuatan Akun', progress: 0 },
                { name: 'Pembayaran PNBP', progress: 0 },
                { name: 'Submit Permohonan', progress: 0 }
            ];
        default:
            return [
                { name: 'Setup Awal', progress: 0 },
                { name: 'Pengerjaan', progress: 0 },
                { name: 'Selesai', progress: 0 }
            ];
    }
};
