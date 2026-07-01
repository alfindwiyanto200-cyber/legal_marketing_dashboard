const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data.error || message;
    } catch {
      /* ignore non-JSON error bodies */
    }
    throw new Error(message);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  // Projects
  getProjects: () => request('/projects'),
  createProject: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, status) =>
    request(`/projects/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateStages: (id, stages) =>
    request(`/projects/${id}/stages`, { method: 'PATCH', body: JSON.stringify({ stages }) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  // Transactions
  getTransactions: (month) =>
    request(`/transactions${month ? `?month=${month}` : ''}`),
  createTransaction: (formData) =>
    request('/transactions', { method: 'POST', body: formData }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),

  // Dashboard
  getDashboard: () => request('/dashboard'),
};
