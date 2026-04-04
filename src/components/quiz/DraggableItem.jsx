import React, { useRef, useEffect } from 'react';
import { GripVertical, Hand } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

export default function DraggableItem({
  question,
  isTouchDevice,
  onDragStart,
  onDragEnd,
  onTouchBinHover,   // (binId | null) — called during touch drag
  onTouchDrop,       // (binId) — called on touch release over a bin
  showFeedback,
}) {
  const { t } = useTranslation();
  const difficultyColor = DIFFICULTY_COLOR[question.difficulty] || 'var(--color-text-muted)';

  const dragRef = useRef(null);
  const ghostRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  // Keep hover callback fresh without re-attaching the listener
  const hoverRef = useRef(onTouchBinHover);
  hoverRef.current = onTouchBinHover;

  // Attach non-passive touchmove so we can call e.preventDefault()
  // (prevents page scroll during drag — required for drag to feel right on mobile)
  useEffect(() => {
    const el = dragRef.current;
    if (!el) return;

    const onMove = (e) => {
      if (!ghostRef.current) return;
      e.preventDefault(); // block scroll

      const touch = e.touches[0];
      ghostRef.current.style.left = `${touch.clientX - offsetRef.current.x}px`;
      ghostRef.current.style.top  = `${touch.clientY - offsetRef.current.y}px`;

      // Ghost has pointer-events:none so elementFromPoint sees through it
      const under  = document.elementFromPoint(touch.clientX, touch.clientY);
      const binEl  = under?.closest('[data-bin-id]');
      hoverRef.current(binEl?.dataset.binId ?? null);
    };

    el.addEventListener('touchmove', onMove, { passive: false });
    return () => el.removeEventListener('touchmove', onMove);
  }, []); // only once — uses ref to stay fresh

  const handleTouchStart = (e) => {
    if (showFeedback) return;
    const touch = e.touches[0];
    const rect  = e.currentTarget.getBoundingClientRect();

    // Remember where the finger landed relative to the card top-left
    offsetRef.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };

    // Clone the card as a floating ghost
    const ghost = e.currentTarget.cloneNode(true);
    Object.assign(ghost.style, {
      position:      'fixed',
      left:          `${rect.left}px`,
      top:           `${rect.top}px`,
      width:         `${rect.width}px`,
      margin:        '0',
      zIndex:        '9999',
      pointerEvents: 'none',
      opacity:       '0.88',
      transform:     'scale(1.04) rotate(1.5deg)',
      boxShadow:     '0 24px 48px rgba(0,0,0,0.28)',
      transition:    'none',
      borderRadius:  '12px',
    });
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
    onDragStart();
  };

  const handleTouchEnd = (e) => {
    if (!ghostRef.current) return;

    const touch = e.changedTouches[0];
    document.body.removeChild(ghostRef.current);
    ghostRef.current = null;

    // Find the bin under the lifted finger
    const under = document.elementFromPoint(touch.clientX, touch.clientY);
    const binEl = under?.closest('[data-bin-id]');

    hoverRef.current(null);
    onDragEnd();

    if (binEl?.dataset.binId) {
      onTouchDrop(binEl.dataset.binId);
    }
  };

  // ── HTML5 drag (desktop) ──
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', question.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart();
  };

  return (
    <div
      ref={dragRef}
      draggable={!isTouchDevice && !showFeedback}
      onDragStart={!isTouchDevice && !showFeedback ? handleDragStart : undefined}
      onDragEnd={!isTouchDevice && !showFeedback ? onDragEnd : undefined}
      onTouchStart={isTouchDevice && !showFeedback ? handleTouchStart : undefined}
      onTouchEnd={isTouchDevice && !showFeedback ? handleTouchEnd : undefined}
      className="animate-fade-in"
      style={{
        background:    'var(--color-bg-white)',
        borderRadius:  'var(--radius-lg)',
        boxShadow:     'var(--shadow-md)',
        padding:       '20px 24px',
        marginBottom:  '20px',
        cursor:        showFeedback ? 'default' : isTouchDevice ? 'grab' : 'grab',
        userSelect:    'none',
        border:        '2px solid var(--color-border)',
        touchAction:   'none', // tell browser we handle touch ourselves
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{
          fontSize:        '0.72rem',
          fontWeight:      '700',
          color:           difficultyColor,
          textTransform:   'uppercase',
          letterSpacing:   '0.08em',
          background:      `${difficultyColor}18`,
          padding:         '3px 10px',
          borderRadius:    'var(--radius-full)',
        }}>
          {question.difficulty}
        </span>

        {!showFeedback && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            {isTouchDevice
              ? <><Hand size={13} /> {t('orTapBin')}</>
              : <><GripVertical size={14} /> {t('dragToSort')}</>
            }
          </span>
        )}
      </div>

      {/* Scenario */}
      <p style={{
        color:         'var(--color-text-muted)',
        fontSize:      '0.9rem',
        lineHeight:    1.65,
        marginBottom:  '14px',
        paddingBottom: '14px',
        borderBottom:  '1px solid var(--color-border)',
      }}>
        {question.scenario}
      </p>

      {/* Item visual */}
      <div style={{
        display:       'flex',
        alignItems:    'center',
        gap:           '20px',
        padding:       '14px 18px',
        background:    'var(--color-bg-light)',
        borderRadius:  'var(--radius-md)',
        border:        '1px dashed var(--color-border)',
      }}>
        <div style={{
          width:          '76px',
          height:         '76px',
          flexShrink:     0,
          borderRadius:   '50%',
          background:     'var(--color-bg-white)',
          border:         '2px solid var(--color-border)',
          boxShadow:      'var(--shadow-sm)',
          overflow:       'hidden',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
        }}>
          <img 
            src={`${import.meta.env.BASE_URL}items/${question.itemIcon}.jpg`} 
            alt={question.itemName} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://loremflickr.com/400/400/medical'; }}
          />
        </div>

        <div>
          <p style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--color-text-main)', marginBottom: '4px' }}>
            {question.itemName}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            {isTouchDevice ? t('selectBin') : t('selectBin')}
          </p>
        </div>
      </div>
    </div>
  );
}
