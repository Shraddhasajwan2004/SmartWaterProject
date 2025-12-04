
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import ProjectArena from './pages/ProjectArena';
import ThingSpeakConfig from './pages/ThingSpeakConfig';
import ImageAnalysis from './pages/ImageAnalysis';
import CodeGenerator from './pages/CodeGenerator';
import BluetoothDashboard from './pages/BluetoothDashboard';

// Protected Route Wrapper
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  // Initialize state
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [auth, setAuth] = useState({ isAuthenticated: false, user: null });

  // Theme effect
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogin = (username) => {
    setAuth({ isAuthenticated: true, user: username });
  };

  const handleLogout = () => {
    setAuth({ isAuthenticated: false, user: null });
  };

  return (
    <Router>
      <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'dark bg-dark-bg' : 'bg-gray-50'}`}>
        <Navbar 
          isDarkMode={isDarkMode} 
          toggleTheme={toggleTheme} 
          isAuthenticated={auth.isAuthenticated}
          onLogout={handleLogout}
        />
        
        <main className="flex-grow flex flex-col relative">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            
            <Route 
              path="/arena" 
              element={
                <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
                  <ProjectArena />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/bluetooth" 
              element={
                <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
                  <BluetoothDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/config" 
              element={
                <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
                  <ThingSpeakConfig />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/analysis" 
              element={
                <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
                  <ImageAnalysis />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/code" 
              element={
                <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
                  <CodeGenerator />
                </ProtectedRoute>
              } 
            />

            {/* Catch all redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg py-6 text-center text-sm text-gray-500 z-10">
           <p>© 2025 HydroNeon Systems. Powered by Gemini AI & ThingSpeak.</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
