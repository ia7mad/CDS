import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, RotateCcw, Award, Trophy, ChevronDown, ChevronUp, Star, Clock } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const getBinNames = (lang) => ({
  general: { name: lang === 'ar' ? 'نفايات عامة' : 'General Waste', color: '#1E293B', emoji: '🗑️' },
  infectious: { name: lang === 'ar' ? 'نفايات معدية' : 'Infectious Waste', color: '#EAB308', emoji: '⚠️' },
  sharps: { name: lang === 'ar' ? 'أدوات حادة / خطر بيولوجي' : 'Sharps / Biohazard', color: '#EF4444', emoji: '🔴' },
  pharmaceutical: { name: lang === 'ar' ? 'نفايات صيدلانية' : 'Pharmaceutical Waste', color: '#3B82F6', emoji: '💊' },
});

export default function ResultsScreen({ score, questionResults, totalQuestions, bestScore, userInfo = {}, onRestart }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const binNames = getBinNames(i18n.language);
  const [reviewOpen, setReviewOpen] = useState(false);

  const correctCount = questionResults.filter(r => r.correct).length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const passed = percentage >= 70;
  const isNewRecord = score > bestScore;

  const wrongAnswers = questionResults.filter(r => !r.correct);

  // Chart
  const chartData = {
    labels: questionResults.map((_, i) => `Q${i + 1}`),
    datasets: [{
      data: questionResults.map(r => r.points),
      backgroundColor: questionResults.map(r => r.correct ? 'rgba(16,185,129,0.75)' : 'rgba(244,63,94,0.5)'),
      borderColor: questionResults.map(r => r.correct ? '#10B981' : '#F43F5E'),
      borderWidth: 2,
      borderRadius: 4,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw} pts` } } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
    },
  };

  const handleDownloadCertificate = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();

    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, w, h, 'F');
    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(2);
    doc.rect(8, 8, w - 16, h - 16, 'S');
    doc.setLineWidth(0.5);
    doc.rect(11, 11, w - 22, h - 22, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(13, 148, 136);
    doc.text(isRTL ? 'شهادة إتمام التدريب' : 'Certificate of Completion', w / 2, 40, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    doc.setTextColor(71, 85, 105);
    doc.text(isRTL ? 'التدريب على التخلص من النفايات الطبية' : 'Healthcare Waste Disposal Training', w / 2, 52, { align: 'center' });

    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(0.8);
    doc.line(40, 58, w - 40, 58);

    // "This certifies that"
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(isRTL ? 'يُشهد أن' : 'This certifies that', w / 2, 68, { align: 'center' });

    // Recipient name — large and prominent
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text(userInfo.name || 'Participant', w / 2, 80, { align: 'center' });

    // Profile & department
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    const infoLine = [userInfo.profileNumber, userInfo.department].filter(Boolean).join('  ·  ');
    if (infoLine) doc.text(infoLine, w / 2, 88, { align: 'center' });

    // "has successfully completed"
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(
      isRTL ? 'أتمّ بنجاح برنامج التدريب على التخلص من النفايات الطبية'
             : 'has successfully completed the Healthcare Waste Disposal Training Program',
      w / 2, 97, { align: 'center' }
    );

    // Score badge
    doc.setFillColor(13, 148, 136);
    doc.roundedRect(w / 2 - 38, 104, 76, 20, 4, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(`${score.toLocaleString()} pts  ·  ${percentage}%  ·  ${correctCount}/${totalQuestions}`, w / 2, 117, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    const dateStr = new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`${isRTL ? 'التاريخ' : 'Date'}: ${dateStr}`, w / 2, 132, { align: 'center' });
    doc.text('Reference: WHO Healthcare Waste Management Guidelines', w / 2, 139, { align: 'center' });

    doc.save('waste-disposal-certificate.pdf');
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '720px', marginTop: '28px', marginBottom: '48px' }}>

      {/* ── Header result card ── */}
      <div style={{
        background: 'var(--color-bg-white)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        padding: '36px',
        textAlign: 'center',
        marginBottom: '20px',
      }}>
        {passed
          ? <Trophy size={56} color="var(--color-accent)" style={{ margin: '0 auto 16px' }} />
          : <XCircle size={56} color="var(--color-danger)" style={{ margin: '0 auto 16px' }} />
        }

        <h2 style={{ fontSize: '1.85rem', marginBottom: '6px', color: passed ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {passed ? t('assessmentPassed') : t('assessmentFailed')}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
          {t('correctAnswers')}: {correctCount}/{totalQuestions} ({percentage}%)
        </p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
          {[
            {
              label: t('totalPoints'),
              value: score.toLocaleString(),
              sub: isNewRecord ? t('newRecord') : `${t('yourBestScore')}: ${bestScore.toLocaleString()}`,
              subColor: isNewRecord ? 'var(--color-accent)' : 'var(--color-text-muted)',
              icon: <Award size={20} color="var(--color-primary)" />,
            },
            {
              label: t('correctAnswers'),
              value: `${correctCount}/${totalQuestions}`,
              sub: `${percentage}%`,
              subColor: percentage >= 70 ? 'var(--color-success)' : 'var(--color-danger)',
              icon: <CheckCircle2 size={20} color="var(--color-success)" />,
            },
            {
              label: 'Avg. Time',
              value: `${(questionResults.reduce((s, r) => s + r.timeUsed, 0) / questionResults.length).toFixed(1)}s`,
              sub: 'per question',
              subColor: 'var(--color-text-muted)',
              icon: <Clock size={20} color="var(--color-secondary)" />,
            },
          ].map(({ label, value, sub, subColor, icon }) => (
            <div key={label} style={{
              background: 'var(--color-bg-light)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 10px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            }}>
              {icon}
              <p style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--color-text-main)', margin: 0 }}>{value}</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>{label}</p>
              {sub && <p style={{ fontSize: '0.7rem', color: subColor, fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
                {isNewRecord && label === t('totalPoints') && <Star size={10} fill="currentColor" />}
                {sub}
              </p>}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={onRestart}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '11px 24px', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', fontWeight: '600', fontSize: '0.9rem',
              cursor: 'pointer', background: 'var(--color-bg-white)', color: 'var(--color-text-main)',
            }}
          >
            <RotateCcw size={16} />
            {t('tryAgain')}
          </button>
          {passed && (
            <button
              onClick={handleDownloadCertificate}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '11px 24px', background: 'var(--color-primary)',
                color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
                fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <Award size={16} />
              {t('downloadCertificate')}
            </button>
          )}
        </div>
      </div>

      {/* ── Performance chart ── */}
      <div style={{
        background: 'var(--color-bg-white)', borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)', padding: '24px', marginBottom: '20px',
      }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '16px', color: 'var(--color-text-main)' }}>
          {t('performanceBreakdown')} — {t('pointsPerQuestion')}
        </h3>
        <Bar data={chartData} options={chartOptions} />
        <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '10px', textAlign: 'center' }}>
          🟢 Correct · 🔴 Incorrect / Timed Out
        </p>
      </div>

      {/* ── Wrong answer review ── */}
      {wrongAnswers.length > 0 && (
        <div style={{
          background: 'var(--color-bg-white)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)', overflow: 'hidden',
        }}>
          <button
            onClick={() => setReviewOpen(o => !o)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 24px', background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: reviewOpen ? '1px solid var(--color-border)' : 'none',
            }}
          >
            <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XCircle size={17} color="var(--color-danger)" />
              {t('reviewWrongAnswers')}
              <span style={{
                fontSize: '0.75rem', fontWeight: '700',
                background: 'var(--color-danger)', color: 'white',
                padding: '1px 8px', borderRadius: 'var(--radius-full)',
              }}>
                {wrongAnswers.length}
              </span>
            </span>
            {reviewOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {reviewOpen && (
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {wrongAnswers.map((r, i) => {
                const correctBin = binNames[r.correctBin];
                const selectedBinInfo = r.selectedBin === '__timeout__' ? null : binNames[r.selectedBin];
                return (
                  <div key={r.id} style={{
                    padding: '16px', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-light)', border: '1px solid var(--color-border)',
                  }}>
                    <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--color-text-main)', marginBottom: '10px' }}>
                      {i + 1}. {r.itemName}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      {/* Correct bin */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                          {t('correctAnswer')}:
                        </span>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          fontSize: '0.78rem', fontWeight: '700',
                          color: 'white', background: correctBin.color,
                          padding: '2px 10px', borderRadius: 'var(--radius-full)',
                        }}>
                          {correctBin.emoji} {correctBin.name}
                        </span>
                      </div>
                      {/* What they picked */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                          {t('yourAnswer')}:
                        </span>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          fontSize: '0.78rem', fontWeight: '700',
                          color: 'var(--color-danger)',
                          padding: '2px 10px', borderRadius: 'var(--radius-full)',
                          border: '1px solid var(--color-danger)',
                        }}>
                          {selectedBinInfo ? `${selectedBinInfo.emoji} ${selectedBinInfo.name}` : `⏱ ${t('timeout')}`}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>
                      {r.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
