import React from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function GameHUD({ score, currentIndex, totalQuestions, bestScore }) {
  const { t } = useTranslation();
  const isNewRecord = score > 0 && score > bestScore;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--color-bg-white)',
      borderRadius: 'var(--radius-lg)',
      padding: '12px 20px',
      boxShadow: 'var(--shadow-sm)',
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
