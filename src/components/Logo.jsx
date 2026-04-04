import React from 'react';

/**
 * Official Logo: HWDT (Healthcare Waste Disposal Training)
 * 
 * Design: Features the official PNG logo and rebranded text.
 */
export default function Logo({ size = 40, textColor = 'var(--color-text-main)', showText = false }) {
  // Use the Vite public path for the logo
  const logoPath = `${import.meta.env.BASE_URL}logo.png`.replace(/\/+$/, '') + '/logo.png';
  // Correction: import.meta.env.BASE_URL already contains the trailing slash if needed.
  // Actually, standard is:
  const finalLogoPath = `${import.meta.env.BASE_URL}logo.png`;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
      <img 
        src={finalLogoPath} 
        alt="HWDT Logo" 
        style={{ 
          width: size, 
          height: size, 
          objectFit: 'contain',
          flexShrink: 0
        }} 
      />
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ 
            fontSize: `${size * 0.45}px`, 
            fontWeight: '900', 
            color: 'var(--color-primary-dark)',
            letterSpacing: '-0.03em',
            lineHeight: '0.9',
            marginBottom: '2px'
          }}>
            HWDT
          </span>
          <span style={{ 
            fontSize: `${size * 0.22}px`, 
            fontWeight: '600', 
            color: 'var(--color-text-muted)',
            letterSpacing: '0.02em',
            lineHeight: '1',
            textTransform: 'uppercase'
          }}>
            Healthcare Waste Disposal Training
          </span>
        </div>
      )}
    </div>
  );
}
