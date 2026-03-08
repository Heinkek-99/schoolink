import axios from 'axios';

// PascalCase → camelCase converter
function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function convertKeysToCamelCase(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(convertKeysToCamelCase);
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj as Record<string, unknown>).reduce((acc, key) => {
      if (key === '$type') return acc;
      acc[toCamelCase(key)] = convertKeysToCamelCase((obj as Record<string, unknown>)[key]);
      return acc;
    }, {} as Record<string, unknown>);
  }
  return obj;
}

// camelCase → PascalCase converter for outgoing requests
function toPascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function convertKeysToPascalCase(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(convertKeysToPascalCase);
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj as Record<string, unknown>).reduce((acc, key) => {
      acc[toPascalCase(key)] = convertKeysToPascalCase((obj as Record<string, unknown>)[key]);
      return acc;
    }, {} as Record<string, unknown>);
  }
  return obj;
}

const api = axios.create({
  baseURL: 'https://schoolflow-8e86.onrender.com',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT + convert to PascalCase
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Convert request body to PascalCase for .NET API
  if (config.data && typeof config.data === 'object') {
    config.data = convertKeysToPascalCase(config.data);
  }
  return config;
});

// Response interceptor: unwrap Result<T> wrapper + convert to camelCase
api.interceptors.response.use(
  (response) => {
    const data = response.data;
    // Unwrap .NET Result<T> wrapper: { IsSuccess, Data, Error }
    if (data && typeof data === 'object' && 'IsSuccess' in data) {
      if (data.IsSuccess) {
        response.data = convertKeysToCamelCase(data.Data);
      } else {
        const errorMsg = data.Error || data.Errors?.join(', ') || 'Erreur serveur';
        return Promise.reject(new Error(errorMsg));
      }
    } else {
      response.data = convertKeysToCamelCase(data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
