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
        gap: '10px',
        padding: '20px 16px',
        background: 'var(--color-bg-white)',
        borderRadius: 'var(--radius-lg)',
        border: `2px solid ${borderColor}`,
        boxShadow,
        opacity,
        transition: 'opacity 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        cursor: showFeedback ? 'default' : 'pointer',
        position: 'relative',
        overflow: 'visible',
        width: '100%',
        color: 'inherit',
      }}
    >
      <div style={{
        width: '52px',
        height: '64px',
        background: bin.hexCode,
        borderRadius: '6px 6px 4px 4px',
        border: '2px solid rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={22} color="white" strokeWidth={2.5} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontWeight: '700', color: 'var(--color-text-main)', fontSize: '0.9rem', marginBottom: '2px' }}>
          {bin.name}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
          {bin.description.length > 45 ? bin.description.substring(0, 45) + '…' : bin.description}
        </p>
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
