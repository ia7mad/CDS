import React, { useRef } from 'react';
import { Trash2, Biohazard, Syringe, Pill } from 'lucide-react';

const ICONS = {
  'trash-2': Trash2,
  biohazard: Biohazard,
  syringe: Syringe,
  pill: Pill,
};

export default function BinDropZone({
  bin,
  isDragOver,
  isDragging,
  animationType,
  showFeedback,
  isSelected,
  isCorrectBin,
  onClick,
  onDragEnter,
  onDragLeave,
  onDrop,
}) {
  const ref = useRef(null);
  const Icon = ICONS[bin.icon] || Trash2;

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    onDragEnter(bin.id);
  };

  const handleDragLeave = (e) => {
    if (ref.current && !ref.current.contains(e.relatedTarget)) {
      onDragLeave();
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    onDrop(bin.id);
  };

  let animClass = '';
  if (animationType === 'correct') animClass = 'bin-correct-shake';
  if (animationType === 'wrong') animClass = 'bin-wrong-shake';

  let borderColor = 'transparent';
  let boxShadow = 'var(--shadow-sm)';
  let opacity = 1;

  if (isDragOver) {
    borderColor = bin.hexCode;
    boxShadow = `0 0 0 3px ${bin.hexCode}, 0 8px 24px ${bin.hexCode}44`;
  } else if (animationType === 'correct') {
    borderColor = 'var(--color-success)';
    boxShadow = `0 0 0 3px var(--color-success), 0 8px 24px #10B98144`;
  } else if (animationType === 'wrong' && isSelected) {
    borderColor = 'var(--color-danger)';
    boxShadow = `0 0 0 3px var(--color-danger)`;
  } else if (isCorrectBin && showFeedback) {
    borderColor = 'var(--color-success)';
  } else if (isSelected && showFeedback) {
    borderColor = 'var(--color-danger)';
  }

  if (showFeedback && !isSelected && !isCorrectBin) opacity = 0.45;
  if (isDragging && !isDragOver) opacity = showFeedback ? opacity : 0.7;

  return (
    <button
      ref={ref}
      data-bin-id={bin.id}
      onClick={() => !showFeedback && onClick(bin.id)}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      disabled={showFeedback}
      className={`${animClass} ${isDragOver ? 'bin-drag-over' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: window.innerWidth < 500 ? '3px' : '6px',
        padding: window.innerWidth < 500 ? '10px 4px' : '16px 12px',
        background: 'var(--color-bg-white)',
        borderRadius: 'var(--radius-lg)',
        border: `2px solid ${borderColor}`,
        boxShadow,
        opacity,
        transition: 'all 0.2s ease',
        cursor: showFeedback ? 'default' : 'pointer',
        position: 'relative',
        overflow: 'visible',
        width: '100%',
        color: 'inherit',
      }}
    >
      {/* Realistic Bin Image */}
      <div style={{
        height: window.innerWidth < 500 ? '48px' : '80px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '4px',
        position: 'relative',
      }}>
        {bin.imageUrl ? (
          <img 
            src={bin.imageUrl} 
            alt={bin.name} 
            style={{ 
              maxHeight: '100%', 
              maxWidth: '100%', 
              objectFit: 'contain',
              filter: isDragOver ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' : 'none',
              transition: 'transform 0.2s ease',
              transform: isDragOver ? 'scale(1.1)' : 'scale(1)',
            }} 
          />
        ) : (
          <div style={{
            width: '40px',
            height: '50px',
            background: bin.hexCode,
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={20} color="white" />
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontWeight: '800', color: 'var(--color-text-main)', fontSize: window.innerWidth < 500 ? '0.62rem' : '0.82rem', marginBottom: '1px', lineHeight: 1.2 }}>
          {bin.name}
        </p>
        {window.innerWidth >= 500 && (
          <p style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', lineHeight: 1.3 }}>
            {bin.description.length > 35 ? bin.description.substring(0, 35) + '…' : bin.description}
          </p>
        )}
      </div>

      {isDragOver && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'var(--radius-lg)',
          background: `${bin.hexCode}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          pointerEvents: 'none',
        }}>
          ↓
        </div>
      )}
    </button>
  );
}
