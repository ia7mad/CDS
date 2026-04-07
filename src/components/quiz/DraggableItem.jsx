import React, { useRef, useEffect, useState } from 'react';
import { GripVertical, Hand } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { sensoryEngine } from '../../utils/sensory';

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
  const [isGrabbing, setIsGrabbing] = useState(false);

  const dragRef = useRef(null);
  const ghostRef = useRef(null);
  const imgRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  // Track image load state for smooth transition
  const [imgLoaded, setImgLoaded] = useState(false);
  useEffect(() => {
    setImgLoaded(true); // Force instant reveal since App.jsx preloaded it
  }, [question.imageUrl]);
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
      // Position ghost so finger sits below the bottom-center of the ghost
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

  // Clean up any stray ghost when the question changes or component unmounts mid-drag
  useEffect(() => {
    return () => {
      if (ghostRef.current) {
        document.body.removeChild(ghostRef.current);
        ghostRef.current = null;
        setIsGrabbing(false);
      }
    };
  }, [question.id]);

  const handleTouchStart = (e) => {
    if (showFeedback || isGrabbing || ghostRef.current) return;
    // Ignore multi-touch (e.g. accidentaly putting 2 fingers down)
    if (e.touches.length > 1) return;
    
    const touch = e.touches[0];

    // Ghost width/height constants used for centering
    const GHOST_W = 240;
    const GHOST_H = 76;

    // Finger sits 12px below the bottom-center of the ghost
    offsetRef.current = {
      x: GHOST_W / 2,
      y: GHOST_H + 12,
    };

    // Build a compact ghost showing only the item icon + name (not the whole card)
    const ghost = document.createElement('div');

    const iconHtml = question.imageUrl
      ? `<img src="${question.imageUrl}" alt="" style="width:100%;height:100%;object-fit:cover;" />`
      : `<span style="font-size:1.8rem;line-height:1;">${EMOJI_MAP[question.itemIcon] || '🗑️'}</span>`;

    ghost.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;padding:14px 18px;">
        <div style="width:48px;height:48px;flex-shrink:0;border-radius:50%;background:#f8fafc;border:2px solid #e2e8f0;overflow:hidden;display:flex;align-items:center;justify-content:center;">
          ${iconHtml}
        </div>
        <span style="font-weight:800;font-size:0.95rem;color:#1e293b;font-family:inherit;line-height:1.3;max-width:140px;">${question.itemName}</span>
      </div>
    `;

    Object.assign(ghost.style, {
      position:      'fixed',
      left:          `${touch.clientX - GHOST_W / 2}px`,
      top:           `${touch.clientY - GHOST_H - 12}px`,
      width:         `${GHOST_W}px`,
      zIndex:        '9999',
      pointerEvents: 'none',
      background:    'white',
      borderRadius:  '16px',
      boxShadow:     '0 20px 50px rgba(0,0,0,0.3), 0 0 0 2.5px #0d9488',
      transform:     'scale(1.06) rotate(2deg)',
      transition:    'none',
    });

    document.body.appendChild(ghost);
    ghostRef.current = ghost;
    setIsGrabbing(true);
    sensoryEngine.playPickup();
    onDragStart();
  };

  const handleTouchEnd = (e) => {
    if (!ghostRef.current) return;

    const touch = e.changedTouches[0];
    document.body.removeChild(ghostRef.current);
    ghostRef.current = null;
    setIsGrabbing(false);

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
    sensoryEngine.playPickup();
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
      onTouchCancel={isTouchDevice && !showFeedback ? handleTouchEnd : undefined}
      onContextMenu={e => e.preventDefault()}
      className={showFeedback ? '' : 'glass-panel'}
      style={{
        borderRadius:            'var(--radius-lg)',
        boxShadow:               isGrabbing ? '0 10px 25px rgba(0,0,0,0.1)' : 'var(--shadow-md)',
        padding:                 showFeedback ? '12px 16px' : '20px 24px',
        marginBottom:            showFeedback ? '12px' : '20px',
        cursor:                  showFeedback ? 'default' : 'grab',
        userSelect:              'none',
        WebkitUserSelect:        'none',
        WebkitTouchCallout:      'none',
        border:                  isGrabbing ? '2px solid var(--color-primary)' : (showFeedback ? '2px solid var(--color-border)' : '1px solid rgba(255,255,255,0.6)'),
        touchAction:             'none',
        background:              showFeedback ? 'var(--color-bg-white)' : undefined,
        opacity:                 isGrabbing ? 0.45 : 1,
        transition:              'opacity 0.15s, border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {/* Top row */}
      {!showFeedback && (
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

          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            {isTouchDevice
              ? <><Hand size={13} /> {t('orTapBin')}</>
              : <><GripVertical size={14} /> {t('dragToSort')}</>
            }
          </span>
        </div>
      )}

      {/* Scenario */}
      {!showFeedback && (
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
      )}

      {/* Item visual */}
      <div style={{
        display:       'flex',
        alignItems:    'center',
        gap:           showFeedback ? '14px' : '20px',
        padding:       showFeedback ? '10px 14px' : '14px 18px',
        background:    'rgba(255, 255, 255, 0.45)',
        borderRadius:  'var(--radius-md)',
        border:        '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow:     'inset 0 2px 6px rgba(255,255,255,0.8)',
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
          fontSize:       '2.2rem',
          lineHeight:     1,
        }}>
          {question.imageUrl ? (
            <img
              ref={imgRef}
              src={question.imageUrl}
              alt={question.itemName}
              draggable={false}
              onLoad={() => setImgLoaded(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
                WebkitTouchCallout: 'none',
                opacity: imgLoaded ? 1 : 1, // Instant
              }}
            />
          ) : (
            EMOJI_MAP[question.itemIcon] || '🗑️'
          )}
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
