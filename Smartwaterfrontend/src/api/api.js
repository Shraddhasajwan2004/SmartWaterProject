import axios from 'axios';

const BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
});

export default api;
