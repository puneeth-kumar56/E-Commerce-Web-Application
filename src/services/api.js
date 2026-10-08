const TOKEN_KEY = 'novamart_jwt_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: `Network response error: ${response.status} ${response.statusText}`,
  }));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    register: (payload) =>
      request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    login: (payload) =>
      request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    getProfile: () =>
      request('/api/auth/me', {
        method: 'GET',
      }),
  },

  // Products
  products: {
    getAll: (params) => {
      const searchParams = new URLSearchParams();
      if (params?.category && params.category !== 'All') searchParams.set('category', params.category);
      if (params?.search) searchParams.set('search', params.search);
      if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
      const queryStr = searchParams.toString();
      return request(`/api/products${queryStr ? `?${queryStr}` : ''}`);
    },

    getById: (id) => request(`/api/products/${id}`),

    getCategories: () => request('/api/products/categories'),

    create: (product) =>
      request('/api/products', {
        method: 'POST',
        body: JSON.stringify(product),
      }),

    update: (id, product) =>
      request(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(product),
      }),

    delete: (id) =>
      request(`/api/products/${id}`, {
        method: 'DELETE',
      }),
  },

  // Orders
  orders: {
    checkout: (payload) =>
      request('/api/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    getMyOrders: () => request('/api/orders'),

    getById: (id) => request(`/api/orders/${id}`),

    getAdminAll: () => request('/api/orders/admin/all'),

    updateStatus: (id, status) =>
      request(`/api/orders/admin/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // System
  system: {
    getStatus: () => request('/api/system/status'),

    resetData: () =>
      request('/api/system/reset', {
        method: 'POST',
      }),

    getSchemaSql: () => request('/api/system/schema'),
  },
};
