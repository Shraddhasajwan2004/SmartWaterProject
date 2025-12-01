import React from 'react';

const NeonCard = ({ children, title, className = '', glowColor = 'blue' }) => {
  const glowClasses = {
    blue: 'border-neon-blue shadow-[0_0_5px_rgba(0,243,255,0.2)] dark:shadow-[0_0_10px_rgba(0,243,255,0.15)] hover:shadow-[0_0_15px_rgba(0,243,255,0.4)]',
    pink: 'border-neon-pink shadow-[0_0_5px_rgba(255,0,255,0.2)] dark:shadow-[0_0_10px_rgba(255,0,255,0.15)] hover:shadow-[0_0_15px_rgba(255,0,255,0.4)]',
    purple: 'border-neon-purple shadow-[0_0_5px_rgba(157,0,255,0.2)] dark:shadow-[0_0_10px_rgba(157,0,255,0.15)] hover:shadow-[0_0_15px_rgba(157,0,255,0.4)]',
    green: 'border-neon-green shadow-[0_0_5px_rgba(0,255,65,0.2)] dark:shadow-[0_0_10px_rgba(0,255,65,0.15)] hover:shadow-[0_0_15px_rgba(0,255,65,0.4)]',
  };

  return (
    <div className={`
      bg-white dark:bg-dark-card 
      border border-opacity-50 dark:border-opacity-60
      rounded-xl p-6 transition-all duration-300
      ${glowClasses[glowColor]}
      ${className}
    `}>
      {title && (
        <h3 className="text-xl font-display font-semibold mb-4 text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 pb-2">
          {title}
        </h3>
      )}
      <div className="text-gray-600 dark:text-gray-300">
        {children}
      </div>
    </div>
  );
};

export default NeonCard;