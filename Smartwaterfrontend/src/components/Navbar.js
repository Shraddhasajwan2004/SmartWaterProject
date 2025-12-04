
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Home, Settings, LogIn, LogOut, Sun, Moon, Camera, Code, Bluetooth } from 'lucide-react';

const Navbar = ({ isDarkMode, toggleTheme, isAuthenticated, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const linkClass = ({ isActive }) => `
    flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-display text-sm uppercase tracking-wider whitespace-nowrap
    ${isActive 
      ? 'text-neon-blue bg-blue-50 dark:bg-blue-900/20 shadow-[0_0_10px_rgba(0,243,255,0.3)]' 
      : 'text-gray-600 dark:text-gray-400 hover:text-neon-blue hover:bg-gray-100 dark:hover:bg-gray-800'}
  `;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-dark-bg/80 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple animate-pulse"></div>
            <span className="text-xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple hidden sm:block">
              HydroNeon
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 overflow-x-auto">
            <NavLink to="/" className={linkClass}>
              <Home size={18} /> Home
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/arena" className={linkClass}>
                  <LayoutDashboard size={18} /> Arena
                </NavLink>
                <NavLink to="/bluetooth" className={linkClass}>
                  <Bluetooth size={18} /> Bluetooth Control
                </NavLink>
                <NavLink to="/analysis" className={linkClass}>
                  <Camera size={18} /> AI Analysis
                </NavLink>
                <NavLink to="/code" className={linkClass}>
                  <Code size={18} /> Code
                </NavLink>
                <NavLink to="/config" className={linkClass}>
                  <Settings size={18} /> Config
                </NavLink>
              </>
            )}
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2"></div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-neon-blue transition-colors"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 ml-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-display text-sm uppercase"
              >
                <LogOut size={18} />
              </button>
            ) : (
              <NavLink to="/login" className="flex items-center gap-2 px-4 py-2 ml-2 rounded-lg bg-neon-blue text-black font-bold hover:bg-cyan-400 transition-all shadow-[0_0_10px_rgba(0,243,255,0.4)] font-display text-sm uppercase">
                <LogIn size={18} /> Login
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
