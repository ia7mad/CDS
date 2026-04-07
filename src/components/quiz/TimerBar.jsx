import React from 'react';

export default function TimerBar({ timeLeft, maxTime = 10 }) {
  const pct = (timeLeft / maxTime) * 100;
  const isUrgent = timeLeft <= 3;

  const barColor = isUrgent
    ? 'var(--color-danger)'
    : timeLeft <= 6
    ? 'var(--color-accent)'
    : 'var(--color-success)';

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px',
        fontSize: '0.85rem',
        color: isUrgent ? 'var(--color-danger)' : 'var(--color-text-muted)',
        fontWeight: isUrgent ? '700' : '400',
      }}>
        <span>⏱ {timeLeft}s</span>
      </div>
      <div style={{
        width: '100%',
        height: '14px',
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(4px)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.4)'
      }}>
        <div
          className={isUrgent ? 'timer-urgent' : ''}
          style={{
            width: `${pct}%`,
            height: '100%',
            background: barColor,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.9s linear, background 0.3s ease',
            boxShadow: isUrgent ? `0 0 10px ${barColor}` : 'none'
          }}
        />
      </div>
    </div>
  );
}
