import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark' | 'auto';
  showSubtitle?: boolean;
  subtitle?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  theme = 'auto',
  showSubtitle = true,
  subtitle = 'Salesforce Light Enterprise CPQ',
  className = '',
}) => {
  const isDark = theme === 'dark';

  // Dimension configurations
  const dimensions = {
    sm: { box: 'w-7 h-7', icon: 16, title: 'text-sm', sub: 'text-[9px]' },
    md: { box: 'w-8 h-8', icon: 18, title: 'text-base', sub: 'text-[10px]' },
    lg: { box: 'w-10 h-10', icon: 22, title: 'text-lg', sub: 'text-xs' },
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 3D Tactile Isometric Logo Emblem */}
      <div
        className={`relative ${dimensions.box} rounded-xl bg-gradient-to-b from-[#0180e6] via-[#0176D3] to-[#005da8] border border-blue-400/50 flex items-center justify-center shrink-0 transition-transform duration-200 hover:-translate-y-0.5`}
        style={{
          boxShadow:
            '0 3px 0 #003f73, 0 6px 14px -2px rgba(1, 118, 211, 0.4), inset 0 1.5px 0 rgba(255, 255, 255, 0.6), inset 0 -1.5px 0 rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Top Gloss Reflection */}
        <div className="absolute top-0.5 left-1 right-1 h-1.5 rounded-t-lg bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

        {/* 3D Engineered Emblem with Drop Shadow */}
        <svg
          width={dimensions.icon}
          height={dimensions.icon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 filter drop-shadow-[0_1.5px_2px_rgba(0,30,70,0.5)]"
        >
          {/* Outer 3D Shield Outline */}
          <path
            d="M12 2L4 5V11C4 16.5 7.5 21.3 12 22.5C16.5 21.3 20 16.5 20 11V5L12 2Z"
            fill="#ffffff"
            fillOpacity="0.15"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Inner 3D Geometric Planes - 360 Flow */}
          <path
            d="M12 6L7 9V11.5C7 14.5 9 17.5 12 18.5C15 17.5 17 14.5 17 11.5V9L12 6Z"
            fill="#ffffff"
            fillOpacity="0.35"
          />
          {/* Dynamic Tactile Check / Flow Core */}
          <path
            d="M9.5 11.5L11.5 13.5L15 10"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Bottom Ambient Glow Dot */}
        <div className="absolute -bottom-1 w-3 h-1 rounded-full bg-blue-400/40 blur-xs" />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col text-left leading-tight">
        <span
          className={`font-extrabold tracking-tight ${dimensions.title} ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          DealFlow<span className="text-[#0176D3]">360</span>
        </span>
        {showSubtitle && (
          <span
            className={`font-semibold uppercase tracking-wide ${dimensions.sub} ${
              isDark ? 'text-blue-200/80' : 'text-slate-500'
            } -mt-0.5`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;
