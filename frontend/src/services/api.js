import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Criar instância do axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      
      // Buscar dados do usuário
      const userResponse = await api.get('/users/me');
      localStorage.setItem('user', JSON.stringify(userResponse.data));
      
      return { token: response.data.access_token, user: userResponse.data };
    }
    
    throw new Error('Token não recebido');
  },

  async register(name, email, password) {
    const response = await api.post('/users', { name, email, password });
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/users/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export const usersService = {
  async getAllUsers() {
    const response = await api.get('/users');
    return response.data;
  }
};

export const postsService = {
  async getPosts(params = {}) {
    const response = await api.get('/posts', { params });
    return response.data;
  },

  async createPost(data) {
    const response = await api.post('/posts', data);
    return response.data;
  },

  async updatePost(id, data) {
    const response = await api.put(`/posts/${id}`, data);
    return response.data;
  },

  async deletePost(id) {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  async getPost(id) {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  }
};

export { api };
export default api;