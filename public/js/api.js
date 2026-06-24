// API 工具函数
const API_BASE = '/api';

const api = {
  get: async (url) => {
    const res = await fetch(API_BASE + url);
    return res.json();
  },
  post: async (url, data) => {
    const res = await fetch(API_BASE + url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  del: async (url) => {
    const res = await fetch(API_BASE + url, { method: 'DELETE' });
    return res.json();
  }
};
