const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('admission_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Register Applicant
  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  // Login Applicant
  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return res.json();
  },

  // Fetch Current Applicant Profile
  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Fetch Offered Academic Programs
  getPrograms: async () => {
    const res = await fetch(`${API_BASE}/auth/programs`);
    return res.json();
  },

  // Pay Application Fee
  payFee: async () => {
    const res = await fetch(`${API_BASE}/admissions/pay-fee`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Update Status
  updateStatus: async (status) => {
    const res = await fetch(`${API_BASE}/admissions/update-status`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  }
};
