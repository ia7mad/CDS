import React from 'react';

/**
 * Official Logo: The Clinical Shield
 * 
 * Design: A professional shield representing safety and containment,
 * featuring a stylized droplet symbolizing clinical waste management.
 * Strictly avoids the "+" symbol for a modern, institutional look.
 */
export default function Logo({ size = 40, color = 'var(--color-primary)', textColor = 'var(--color-text-main)', showText = false }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Shield Shape */}
        <path
          d="M50 5L10 20V45C10 70.5 27 92.5 50 95C73 92.5 90 70.5 90 45V20L50 5Z"
          fill={color}
        />
        {/* Stylized Droplet (Clinical Waste Symbolism) */}
        <path
          d="M50 30C41.7 30 35 36.7 35 45C35 55 50 70 50 70C50 70 65 55 65 45C65 36.7 58.3 30 50 30ZM50 55C45.6 55 42 51.4 42 47C42 42.6 45.6 39 50 39C54.4 39 58 42.6 58 47C58 51.4 54.4 55 50 55Z"
          fill="white"
        />
      </svg>
      {showText && (
        <span style={{ 
          fontSize: `${size * 0.4}px`, 
          fontWeight: '800', 
          color: textColor,
          letterSpacing: '-0.02em',
          lineHeight: '1.1'
        }}>
          CDS <span style={{ fontWeight: '400', fontSize: '0.9em', color: 'var(--color-text-muted)' }}>Training</span>
        </span>
      )}
    </div>
  );
}
