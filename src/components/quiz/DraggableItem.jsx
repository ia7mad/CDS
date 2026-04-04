import React from 'react';
import { GripVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Emoji map for instant visual recognition — neutral, no color hints
const EMOJI_MAP = {
  'syringe':      '💉',
  'package':      '📦',
  'droplets':     '🩸',
  'pill':         '💊',
  'hand':         '🧤',
  'glass-water':  '🫗',
  'apple':        '🍎',
  'shield-alert': '😷',
  'scissors':     '✂️',
  'bag-water':    '🧪',
};

const DIFFICULTY_COLOR = {
  beginner:     'var(--color-success)',
  intermediate: 'var(--color-accent)',
  advanced:     'var(--color-danger)',
};

export default function DraggableItem({ question, isTouchDevice, onDragStart, onDragEnd, showFeedback }) {
  const { t } = useTranslation();
  const emoji = EMOJI_MAP[question.itemIcon] || '🗑️';
  const difficultyColor = DIFFICULTY_COLOR[question.difficulty] || 'var(--color-text-muted)';

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', question.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart();
  };

  return (
    <div
      draggable={!isTouchDevice && !showFeedback}
      onDragStart={!isTouchDevice && !showFeedback ? handleDragStart : undefined}
      onDragEnd={!isTouchDevice && !showFeedback ? onDragEnd : undefined}
      className="animate-fade-in"
      style={{
        background: 'var(--color-bg-white)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        padding: '20px 24px',
        marginBottom: '20px',
        cursor: showFeedback ? 'default' : isTouchDevice ? 'default' : 'grab',
        userSelect: 'none',
        border: '2px solid var(--color-border)',
      }}
    >
      {/* Top row: difficulty badge + drag hint */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{
          fontSize: '0.72rem',
          fontWeight: '700',
          color: difficultyColor,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          background: `${difficultyColor}18`,
          padding: '3px 10px',
          borderRadius: 'var(--radius-full)',
        }}>
          {question.difficulty}
        </span>
        {!isTouchDevice && !showFeedback && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            <GripVertical size={14} />
            {t('dragToSort')}
          </span>
        )}
      </div>

      {/* Scenario */}
      <p style={{
        color: 'var(--color-text-muted)',
        fontSize: '0.9rem',
        lineHeight: 1.65,
        marginBottom: '14px',
        paddingBottom: '14px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        {question.scenario}
      </p>

      {/* Item visual — neutral colors, no bin hints */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '14px 18px',
        background: 'var(--color-bg-light)',
        borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--color-border)',
      }}>
        {/* Large emoji in a neutral circle */}
        <div style={{
          width: '76px',
          height: '76px',
          flexShrink: 0,
          borderRadius: '50%',
          background: 'var(--color-bg-white)',
          border: '2px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.2rem',
          lineHeight: 1,
        }}>
          {emoji}
        </div>

        <div>
          <p style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--color-text-main)', marginBottom: '4px' }}>
            {question.itemName}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            {isTouchDevice ? t('orTapBin') : t('selectBin')}
          </p>
        </div>
      </div>
    </div>
  );
}
