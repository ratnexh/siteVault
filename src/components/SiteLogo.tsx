'use client';

import React from 'react';
import Image from 'next/image';

interface SiteLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  activeCount?: number;
  className?: string;
}

export const SiteLogo: React.FC<SiteLogoProps> = ({
  size = 'md',
  showText = true,
  activeCount,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-12 h-12',
  }[size];

  const textSizes = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* 3D Ribbon Vault Logo Mark */}
      <div className={`relative ${iconDimensions} flex items-center justify-center shrink-0 group`}>
        <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-sm transition-all group-hover:blur-md" />
        <img
          src="/logo.png"
          alt="SiteVault Logo"
          className="w-full h-full object-contain relative z-10 drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
        />
      </div>

      {/* Brand Text on the right */}
      {showText && (
        <div className="min-w-0 flex items-center gap-2">
          <div className="flex items-baseline tracking-tight font-extrabold leading-none">
            <span className={`text-slate-900 dark:text-white ${textSizes}`}>
              Site
            </span>
            <span className={`bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 bg-clip-text text-transparent ${textSizes}`}>
              Vault
            </span>
          </div>

          {typeof activeCount === 'number' && (
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5 animate-pulse"></span>
              {activeCount} Sites
            </span>
          )}
        </div>
      )}
    </div>
  );
};
