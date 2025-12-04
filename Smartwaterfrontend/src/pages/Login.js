
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, UserPlus } from 'lucide-react';
import NeonCard from '../components/NeonCard';
import { loginUser, registerUser } from '../services/api';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      let data;
      if (isRegistering) {
        data = await registerUser(username, password);
        // Auto login after register logic typically requires re-authentication or backend returning token on register
        // Assuming backend returns token on register for simplicity, or we force login
        if (!data.token) {
           // If register doesn't return token, try logging in
           data = await loginUser(username, password);
        }
      } else {
        data = await loginUser(username, password);
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        onLogin(data.username);
        navigate('/arena');
      }
    } catch (err) {
      setError(isRegistering ? 'Registration failed. User may exist.' : 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <NeonCard className="w-full max-w-md" title={isRegistering ? "Create Account" : "Access Control" } glowColor="purple">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <User size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-neon-purple outline-none transition-all"
                placeholder="Enter username"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-neon-purple outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-neon-purple to-neon-pink text-white font-bold rounded-lg shadow-lg hover:shadow-neon-purple/50 transition-all"
          >
            {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Authenticate')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-neon-blue hover:underline flex items-center justify-center gap-2 w-full"
          >
            {isRegistering ? <User size={14}/> : <UserPlus size={14}/>}
            {isRegistering ? 'Already have an account? Login' : 'New User? Create Account'}
          </button>
        </div>
      </NeonCard>
    </div>
  );
};

export default Login;
