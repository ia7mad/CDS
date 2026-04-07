import React from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function GameHUD({ score, currentIndex, totalQuestions, bestScore, correctCount, wrongCount }) {
  const { t } = useTranslation();
  const isNewRecord = score > 0 && score > bestScore;
  const answered = correctCount + wrongCount;

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 22px',
      marginBottom: '16px',
      flexWrap: 'wrap',
      gap: '12px',
    }}>
      {/* Question progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>
          Question
        </span>
        <span style={{
          fontSize: '1rem',
          fontWeight: '800',
          color: 'var(--color-text-main)',
        }}>
          {currentIndex + 1}
          <span style={{ fontWeight: '400', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            /{totalQuestions}
          </span>
        </span>
      </div>

      {/* Correct / Wrong counters — only show once at least one question is answered */}
      {answered > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '0.82rem', fontWeight: '700',
            color: 'var(--color-success)',
            background: 'rgba(16,185,129,0.12)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
          }}>
            ✓ {correctCount}
          </span>
          <span style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '0.82rem', fontWeight: '700',
            color: 'var(--color-danger)',
            background: 'rgba(244,63,94,0.12)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
          }}>
            ✗ {wrongCount}
          </span>
        </div>
      )}

      {/* Live score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isNewRecord && (
          <span style={{
            fontSize: '0.7rem',
            fontWeight: '700',
            color: 'var(--color-accent)',
            background: 'rgba(245,158,11,0.12)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}>
            <Star size={11} fill="currentColor" />
            {t('newRecord')}
          </span>
        )}
        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>
          {t('totalPoints')}
        </span>
        <span style={{
          fontSize: '1.3rem',
          fontWeight: '900',
          color: 'var(--color-primary)',
          minWidth: '56px',
          textAlign: 'end',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {score.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
