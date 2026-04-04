import React from 'react';
import { CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FeedbackPanel({ isCorrect, isTimeout, question, onNext, isLastQuestion, pointsEarned }) {
  const { t } = useTranslation();

  const isWrong = !isCorrect || isTimeout;
  const bgColor = isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)';
  const borderColor = isCorrect ? 'var(--color-success)' : 'var(--color-danger)';
  const textColor = isCorrect ? 'var(--color-success)' : 'var(--color-danger)';

  return (
    <div
      className="animate-fade-in"
      style={{
        padding: '20px',
        borderRadius: 'var(--radius-lg)',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        marginBottom: '24px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        {isTimeout ? (
          <Clock size={24} color="var(--color-danger)" />
        ) : isCorrect ? (
          <CheckCircle2 size={24} color="var(--color-success)" />
        ) : (
          <XCircle size={24} color="var(--color-danger)" />
        )}

        <div style={{ flex: 1 }}>
          <h3 style={{ color: textColor, margin: 0, fontSize: '1.05rem', fontWeight: '700' }}>
            {isTimeout ? t('timeUp') : isCorrect ? t('correct') : t('incorrect')}
          </h3>
          {isTimeout && (
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
              {t('timesUpMessage')}
            </p>
          )}
        </div>

        {/* Next button — top right */}
        <button
          onClick={onNext}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 18px',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: '700',
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {isLastQuestion ? t('finishAssessment') : t('nextQuestion')}
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Explanation */}
      <p style={{ marginBottom: '8px', lineHeight: 1.65, fontSize: '0.92rem', color: 'var(--color-text-main)' }}>
        <strong>{t('explanation')}:</strong> {question.explanation}
      </p>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: isCorrect && pointsEarned > 0 ? '12px' : '0' }}>
        📋 {question.standard}
      </p>

      {/* Points badge — bottom */}
      {isCorrect && pointsEarned > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{
            background: 'var(--color-success)',
            color: 'white',
            borderRadius: 'var(--radius-full)',
            padding: '4px 14px',
            fontWeight: '800',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap',
          }}>
            +{pointsEarned} pts
          </div>
        </div>
      )}
    </div>
  );
}
