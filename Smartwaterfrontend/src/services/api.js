
const API_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { 
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    } 
  };
};

export const loginUser = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    return await response.json();
  } catch (error) {
    console.error("Login API Error:", error);
    throw error;
  }
};

export const registerUser = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    return await response.json();
  } catch (error) {
    console.error("Register API Error:", error);
    throw error;
  }
};

export const saveDeviceConfig = async (config) => {
  const response = await fetch(`${API_URL}/data/config`, {
    method: 'PUT',
    ...getAuthHeader(),
    body: JSON.stringify(config),
  });
  if (!response.ok) throw new Error('Failed to save config');
  return await response.json();
};

export const getDeviceConfig = async () => {
  const response = await fetch(`${API_URL}/data/config`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!response.ok) return null;
  return await response.json();
};

export const fetchProxyData = async () => {
  const response = await fetch(`${API_URL}/data/readings`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  
  if (!response.ok) {
    const err = await response.text();
    console.error("Proxy Data Fetch Failed:", response.status, err);
    throw new Error(err || 'Failed to fetch data');
  }
  return await response.json();
};

export const saveGeneratedCode = async (name, code) => {
  const response = await fetch(`${API_URL}/data/code`, {
    method: 'POST',
    ...getAuthHeader(),
    body: JSON.stringify({ name, code }),
  });
  return await response.json();
};
