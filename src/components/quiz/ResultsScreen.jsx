import React, { useState, useEffect } from 'react';
import { saveResultToDb, addToPendingQueue, saveQuestionAttemptsToDb, saveEvaluationToDb } from '../../lib/db';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, RotateCcw, Award, Trophy, ChevronDown, ChevronUp, Star, Clock, BookOpen, CreditCard } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const getBinNames = (lang) => ({
  general:        { name: lang === 'ar' ? 'نفايات عامة' : 'General Waste',           color: '#1E293B', emoji: '🗑️' },
  infectious:     { name: lang === 'ar' ? 'نفايات معدية' : 'Infectious Waste',        color: '#EAB308', emoji: '⚠️' },
  sharps:         { name: lang === 'ar' ? 'أدوات حادة' : 'Sharps / Biohazard',        color: '#EF4444', emoji: '🔴' },
  pharmaceutical: { name: lang === 'ar' ? 'نفايات صيدلانية' : 'Pharmaceutical Waste', color: '#3B82F6', emoji: '💊' },
});

export default function ResultsScreen({ score, questionResults, totalQuestions, bestScore, userInfo = {}, onRestart }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  const binNames = getBinNames(i18n.language);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [certId, setCertId] = useState('');
  const hospitalName = localStorage.getItem('cds_hospital_name') || '';

  // Evaluation modal state
  const [showEval, setShowEval]         = useState(false);
  const [evalSubmitted, setEvalSubmitted] = useState(
    () => sessionStorage.getItem('cds_eval_done') === '1'
  );
  const [evalRatings, setEvalRatings]   = useState({ r1: 0, r2: 0, r3: 0 });
  const [evalHovers, setEvalHovers]     = useState({ r1: 0, r2: 0, r3: 0 });
  const [evalComment, setEvalComment]   = useState('');
  const [evalThanks, setEvalThanks]     = useState(false);
  // 'cert' | 'card' | null — which download to run after eval closes
  const [evalPendingAction, setEvalPendingAction] = useState(null);

  const correctCount = questionResults.filter(r => r.correct).length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const passed = percentage >= 70;
  const isNewRecord = score > bestScore;
  const wrongAnswers = questionResults.filter(r => !r.correct);

  // On mount: generate cert ID (if passed) and save result record
  useEffect(() => {
    let id = '';
    if (passed) {
      const counter = parseInt(localStorage.getItem('cds_cert_counter') || '0', 10) + 1;
      localStorage.setItem('cds_cert_counter', String(counter));
      const r_suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      id = `HWDT-${new Date().getFullYear()}-${String(counter).padStart(4, '0')}-${r_suffix}`;
      setCertId(id);
    }

    // Build the result record once
    const resultRecord = {
      id: Date.now(),
      certId: id,
      name: userInfo.name || 'Unknown',
      profileNumber: userInfo.profileNumber || '-',
      department: userInfo.department || '-',
      score,
      percentage,
      passed,
      correctCount,
      totalQuestions,
      date: new Date().toISOString(),
    };

    // 1. Save to localStorage first — always works, even offline
    const results = JSON.parse(localStorage.getItem('cds_results') || '[]');
    results.unshift(resultRecord);
    localStorage.setItem('cds_results', JSON.stringify(results.slice(0, 500)));

    // 2. Best-effort Supabase write — fire and forget, never blocks the UI
    saveResultToDb(resultRecord).then(ok => {
      if (!ok) addToPendingQueue(resultRecord);
    });
    saveQuestionAttemptsToDb(questionResults);

    // Auto-show evaluation modal 2.5s after passing
    if (passed) {
      const timer = setTimeout(() => setShowEval(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const allRated = evalRatings.r1 > 0 && evalRatings.r2 > 0 && evalRatings.r3 > 0;

  const handleEvalSubmit = () => {
    if (!allRated) return;
    // Save to localStorage
    const entry = {
      id: Date.now(),
      name: userInfo.name || 'Unknown',
      department: userInfo.department || '-',
      ratingContent: evalRatings.r1,
      ratingEase:    evalRatings.r2,
      ratingOverall: evalRatings.r3,
      comment:       evalComment,
      date:          new Date().toISOString(),
      lang:          i18n.language,
    };
    const stored = JSON.parse(localStorage.getItem('cds_evaluations') || '[]');
    stored.unshift(entry);
    localStorage.setItem('cds_evaluations', JSON.stringify(stored.slice(0, 1000)));
    // Save to Supabase (fire-and-forget)
    saveEvaluationToDb({ ...entry, hospitalId: localStorage.getItem('cds_hospital_id') || 'KFHBH' });

    // Capture pending action before any state update
    const pending = evalPendingAction;

    setEvalThanks(true);
    setTimeout(() => {
      sessionStorage.setItem('cds_eval_done', '1');
      setEvalSubmitted(true);
      setShowEval(false);
      setEvalPendingAction(null);
      // Execute the deferred download directly (bypasses the guard since evalSubmitted is now true)
      if (pending === 'cert') doCertDownload();
      else if (pending === 'card') doCardDownload();
    }, 1600);
  };

  const issueDate = new Date();
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  const formatDate = (d) => d.toLocaleDateString(isRTL ? 'ar-SA' : 'en-GB');

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

  // Core cert download — no eval guard
  const doCertDownload = async () => {
    const template = document.getElementById('certificate-template');
    if (!template) return;
    setGenerating(true);
    try {
      template.style.visibility = 'visible';
      template.style.opacity = '1';
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 150));
      const CERT_W = 1122, CERT_H = 793;
      const canvas = await html2canvas(template, {
        scale: 2, useCORS: true, allowTaint: false, logging: false,
        backgroundColor: '#ffffff', width: CERT_W, height: CERT_H,
        windowWidth: CERT_W, windowHeight: CERT_H,
        ignoreElements: (el) => el.tagName === 'CANVAS' && el.id !== 'certificate-template',
      });
      template.style.visibility = 'hidden';
      template.style.opacity = '0';
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
      pdf.save(`Certificate-${userInfo.name || 'Participant'}-${certId}.pdf`);
    } catch (err) {
      console.error('Cert generation failed:', err);
      alert('Certificate generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (!evalSubmitted) { setEvalPendingAction('cert'); setShowEval(true); return; }
    doCertDownload();
  };

  const handleReviewMaterials = () => {
    navigate('/learn', { state: { userInfo } });
  };

  const [generatingCard, setGeneratingCard] = useState(false);

  // Core card download — no eval guard
  const doCardDownload = async () => {
    setGeneratingCard(true);
    try {
      const front = document.getElementById('card-front-template');
      const back  = document.getElementById('card-back-template');
      if (!front || !back) return;

      const CARD_W = 856;
      const CARD_H = 540;

      const captureOpts = {
        scale: 2, useCORS: true, allowTaint: false, logging: false,
        backgroundColor: '#ffffff', width: CARD_W, height: CARD_H,
        windowWidth: CARD_W, windowHeight: CARD_H,
        ignoreElements: (el) => el.tagName === 'CANVAS',
      };

      front.style.visibility = 'visible'; front.style.opacity = '1';
      back.style.visibility  = 'visible'; back.style.opacity  = '1';

      // Ensure Tajawal and all fonts are loaded before capture
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 150));

      const frontCanvas = await html2canvas(front, captureOpts);
      const backCanvas  = await html2canvas(back,  captureOpts);

      front.style.visibility = 'hidden'; front.style.opacity = '0';
      back.style.visibility  = 'hidden'; back.style.opacity  = '0';

      // Credit card size in mm: 85.6 × 54, landscape
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [54, 85.6] });
      pdf.addImage(frontCanvas.toDataURL('image/png'), 'PNG', 0, 0, 85.6, 54);
      pdf.addPage([54, 85.6], 'landscape');
      pdf.addImage(backCanvas.toDataURL('image/png'),  'PNG', 0, 0, 85.6, 54);

      pdf.save(`HWDT-WalletCard-${userInfo.name || 'Participant'}.pdf`);
    } catch (err) {
      console.error('Card generation failed:', err);
      alert('Card generation failed. Please try again.');
    } finally {
      setGeneratingCard(false);
    }
  };

  const handleDownloadCard = () => {
    if (!evalSubmitted) { setEvalPendingAction('card'); setShowEval(true); return; }
    doCardDownload();
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '720px', marginTop: '28px', marginBottom: '48px' }}>

      {/* ── Header result card ── */}
      <div style={{
        background: 'var(--color-bg-white)', borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)', padding: '36px', textAlign: 'center', marginBottom: '20px',
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
              label: t('avgTime'),
              value: `${(questionResults.reduce((s, r) => s + r.timeUsed, 0) / questionResults.length).toFixed(1)}s`,
              sub: t('perQuestion'),
              subColor: 'var(--color-text-muted)',
              icon: <Clock size={20} color="var(--color-secondary)" />,
            },
          ].map(({ label, value, sub, subColor, icon }) => (
            <div key={label} style={{
              background: 'var(--color-bg-light)', borderRadius: 'var(--radius-md)',
              padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
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
          <button onClick={onRestart} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '11px 24px', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', fontWeight: '600', fontSize: '0.9rem',
            cursor: 'pointer', background: 'var(--color-bg-white)', color: 'var(--color-text-main)',
          }}>
            <RotateCcw size={16} />
            {t('tryAgain')}
          </button>

          {/* Failed: show Review Materials button */}
          {!passed && (
            <button onClick={handleReviewMaterials} style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '11px 24px', background: 'var(--color-primary)',
              color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
              fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer',
              boxShadow: 'var(--shadow-md)',
            }}>
              <BookOpen size={16} />
              {t('reviewMaterials')}
            </button>
          )}

          {/* Passed: show Certificate + Card download */}
          {passed && (
            <>
              <button onClick={handleDownloadCertificate} disabled={generating} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '11px 24px', background: 'var(--color-primary)',
                color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
                fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer',
                boxShadow: 'var(--shadow-md)', opacity: generating ? 0.7 : 1,
              }}>
                <Award size={16} />
                {generating ? (t('generating') || 'Generating…') : t('downloadCertificate')}
              </button>
              <button onClick={handleDownloadCard} disabled={generatingCard} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '11px 24px', background: 'var(--color-bg-white)',
                color: 'var(--color-primary)', border: '2px solid var(--color-primary)',
                borderRadius: 'var(--radius-md)', fontWeight: '700', fontSize: '0.9rem',
                cursor: 'pointer', opacity: generatingCard ? 0.7 : 1,
              }}>
                <CreditCard size={16} />
                {generatingCard ? t('cardGenerating') : t('downloadCard')}
              </button>
            </>
          )}
        </div>

        {/* Passed: show cert ID badge */}
        {passed && certId && (
          <p style={{ marginTop: '14px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            {t('certNumber')}: <strong style={{ color: 'var(--color-primary)', letterSpacing: '0.05em' }}>{certId}</strong>
            &nbsp;·&nbsp;{t('certValidUntil')}: <strong>{formatDate(expiryDate)}</strong>
          </p>
        )}
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
          🟢 {t('correct')} · 🔴 {t('incorrect')} / {t('timeout')}
        </p>
      </div>

      {/* ── Wrong answer review ── */}
      {wrongAnswers.length > 0 && (
        <div style={{
          background: 'var(--color-bg-white)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)', overflow: 'hidden', marginBottom: '20px',
        }}>
          <button onClick={() => setReviewOpen(o => !o)} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 24px', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: reviewOpen ? '1px solid var(--color-border)' : 'none',
          }}>
            <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XCircle size={17} color="var(--color-danger)" />
              {t('reviewWrongAnswers')}
              <span style={{ fontSize: '0.75rem', fontWeight: '700', background: 'var(--color-danger)', color: 'white', padding: '1px 8px', borderRadius: 'var(--radius-full)' }}>
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
                  <div key={r.id} style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-light)', border: '1px solid var(--color-border)' }}>
                    <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--color-text-main)', marginBottom: '10px' }}>
                      {i + 1}. {r.itemName}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{t('correctAnswer')}:</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: '700', color: 'white', background: correctBin.color, padding: '2px 10px', borderRadius: 'var(--radius-full)' }}>
                          {correctBin.emoji} {correctBin.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{t('yourAnswer')}:</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-danger)', padding: '2px 10px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-danger)' }}>
                          {selectedBinInfo ? `${selectedBinInfo.emoji} ${selectedBinInfo.name}` : `⏱ ${t('timeout')}`}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>{r.explanation}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Hidden Certificate Template ── */}
      <div
        id="certificate-template"
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{
          visibility: 'hidden',
          opacity: '0',
          position: 'absolute',
          top: 0,
          left: '-9999px',
          width: '1122px',
          height: '793px',
          backgroundColor: '#ffffff',
          boxSizing: 'border-box',
          fontFamily: isRTL ? "'Tajawal', Arial, sans-serif" : "Georgia, 'Times New Roman', serif",
          direction: isRTL ? 'rtl' : 'ltr',
          pointerEvents: 'none',
        }}
      >
        {/* Outer border */}
        <div style={{ width: '100%', height: '100%', border: '12px solid #0d5c56', boxSizing: 'border-box', padding: '6px' }}>
          <div style={{ width: '100%', height: '100%', border: '3px solid #c8a84b', boxSizing: 'border-box', padding: '32px 48px', display: 'flex', flexDirection: 'column' }}>

            {/* Top: hospital name + program name */}
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              {hospitalName && (
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#0d5c56', margin: '0 0 4px', letterSpacing: isRTL ? '0' : '0.08em', textTransform: 'uppercase' }}>
                  {hospitalName}
                </p>
              )}
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, letterSpacing: isRTL ? '0' : '0.05em' }}>
                {isRTL ? 'إدارة مكافحة العدوى وسلامة البيئة' : 'Department of Infection Control & Environmental Safety'}
              </p>
            </div>

            {/* Decorative divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #c8a84b)' }} />
              <span style={{ fontSize: '22px' }}>✦</span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #c8a84b)' }} />
            </div>

            {/* Certificate title */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h1 style={{ fontSize: '42px', color: '#0d5c56', margin: '0 0 6px', fontWeight: '700', letterSpacing: isRTL ? '0' : '0.02em' }}>
                {t('certAchievement')}
              </h1>
              <p style={{ fontSize: '16px', color: '#475569', margin: 0, letterSpacing: isRTL ? '0' : '0.04em' }}>
                {t('certProgram')}
              </p>
            </div>

            {/* This certifies that */}
            <p style={{ textAlign: 'center', fontSize: '16px', color: '#64748b', margin: '0 0 8px', fontStyle: isRTL ? 'normal' : 'italic' }}>
              {t('certThisCertifies')}
            </p>

            {/* Candidate name */}
            <div style={{ textAlign: 'center', margin: '0 0 8px' }}>
              <h2 style={{ fontSize: '38px', color: '#0f172a', margin: 0, fontWeight: '700', borderBottom: '2px solid #c8a84b', display: 'inline-block', paddingBottom: '4px', minWidth: '400px' }}>
                {userInfo.name || (isRTL ? 'المتدرب' : 'Participant')}
              </h2>
            </div>

            {/* Employee ID + Department */}
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', margin: '0 0 12px' }}>
              {[userInfo.profileNumber, userInfo.department || ''].filter(Boolean).join('  ·  ')}
            </p>

            {/* Body text */}
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#475569', lineHeight: '1.7', maxWidth: '700px', margin: '0 auto 20px' }}>
              {t('certCompletedPart1')} <strong>{t('certCompletedPart2')}</strong> {t('certCompletedPart3')}
            </p>

            {/* Score badge */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ display: 'inline-block', padding: '6px 24px', background: '#0d5c56', color: 'white', borderRadius: '20px', fontSize: '14px', fontWeight: '700', letterSpacing: isRTL ? '0' : '0.05em' }}>
                {isRTL ? 'النتيجة' : 'Score'}: {percentage}% &nbsp;|&nbsp; {correctCount}/{totalQuestions} {isRTL ? 'صحيح' : 'Correct'}
              </span>
            </div>

            {/* Signature lines */}
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', marginBottom: '16px' }}>
              {[t('certProgCoord'), t('certDeptHead')].map(role => (
                <div key={role} style={{ textAlign: 'center', minWidth: '200px' }}>
                  <div style={{ width: '180px', height: '1px', background: '#334155', margin: '0 auto 6px' }} />
                  <p style={{ fontSize: '12px', color: '#475569', margin: 0, fontWeight: '600' }}>{role}</p>
                </div>
              ))}
            </div>

            {/* Footer: cert ID, dates, reference */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                <strong style={{ color: '#475569' }}>{t('certNumber')}:</strong> {certId}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
                {isRTL ? 'مستند إلى إرشادات منظمة الصحة العالمية لإدارة النفايات الطبية (2014)' : 'Based on WHO Healthcare Waste Management Guidelines (2014)'}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: isRTL ? 'left' : 'right' }}>
                <span><strong style={{ color: '#475569' }}>{t('certIssuedBy').replace('By','').replace('عن','').trim()}:</strong> {formatDate(issueDate)}</span>
                &nbsp;&nbsp;
                <span><strong style={{ color: '#475569' }}>{t('certValidUntil')}:</strong> {formatDate(expiryDate)}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Hidden Card Templates (captured by html2canvas) ── */}
      {/* 856×540px = 85.6mm×54mm at 10px/mm — browser renders Arabic/RTL perfectly */}

      {/* FRONT */}
      <div id="card-front-template" dir={isRTL ? 'rtl' : 'ltr'} style={{
        visibility: 'hidden', opacity: '0',
        position: 'absolute', top: 0, left: '-9999px',
        width: '856px', height: '540px',
        fontFamily: isRTL ? "'Tajawal', Arial, sans-serif" : "Arial, sans-serif",
        direction: isRTL ? 'rtl' : 'ltr',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}>
        {/* Teal header */}
        <div style={{ background: '#0d5c56', padding: '0 32px', height: '170px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <p style={{ color: 'white', fontWeight: '900', fontSize: '26px', margin: 0, letterSpacing: '0.06em', textAlign: 'center' }}>
            {(localStorage.getItem('cds_hospital_name') || 'HWDT').toUpperCase()}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '18px', margin: 0, textAlign: 'center' }}>
            {isRTL ? 'فرز النفايات الطبية' : 'Medical Waste Segregation'}
          </p>
          {/* Gold certified badge */}
          <div style={{ marginTop: '8px', background: '#c8a84b', borderRadius: '20px', padding: '6px 28px' }}>
            <span style={{ color: 'white', fontWeight: '800', fontSize: '16px', letterSpacing: isRTL ? '0' : '0.08em' }}>
              {isRTL ? 'معتمد ✓' : 'CERTIFIED ✓'}
            </span>
          </div>
        </div>

        {/* White body */}
        <div style={{ padding: '18px 32px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Name */}
          <p style={{ fontWeight: '900', fontSize: '30px', color: '#0f172a', margin: 0, textAlign: 'center' }}>
            {userInfo.name || (isRTL ? 'المتدرب' : 'Participant')}
          </p>
          {/* Meta */}
          <p style={{ color: '#64748b', fontSize: '15px', margin: 0, textAlign: 'center' }}>
            {[userInfo.profileNumber, userInfo.department].filter(Boolean).join('  ·  ')}
          </p>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />

          {/* Details row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              {[
                { label: isRTL ? 'تاريخ الإصدار:' : 'Issued:',      value: formatDate(issueDate) },
                { label: isRTL ? 'صالحة حتى:'    : 'Expires:',     value: formatDate(expiryDate) },
                { label: isRTL ? 'رقم الشهادة:'  : 'Cert No:',     value: certId || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                  <span style={{ color: '#94a3b8', fontSize: '13px', minWidth: '90px', textAlign: isRTL ? 'right' : 'left' }}>{label}</span>
                  <span style={{ color: '#0f172a', fontWeight: '700', fontSize: '14px' }}>{value}</span>
                </div>
              ))}
            </div>
            {/* Score badge */}
            <div style={{ background: '#0d5c56', borderRadius: '14px', width: '120px', height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, margin: isRTL ? '0 16px 0 0' : '0 0 0 16px' }}>
              <span style={{ color: 'white', fontWeight: '900', fontSize: '34px', lineHeight: 1 }}>{percentage}%</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '4px' }}>{isRTL ? 'النتيجة' : 'Score'}</span>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#f1f5f9', padding: '8px 32px', textAlign: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: '11px', fontStyle: 'italic' }}>
            {isRTL ? 'إرشادات منظمة الصحة العالمية لإدارة النفايات الطبية' : 'WHO Healthcare Waste Management Guidelines'}
          </span>
        </div>
      </div>

      {/* BACK */}
      <div id="card-back-template" dir={isRTL ? 'rtl' : 'ltr'} style={{
        visibility: 'hidden', opacity: '0',
        position: 'absolute', top: 0, left: '-9999px',
        width: '856px', height: '540px',
        fontFamily: isRTL ? "'Tajawal', Arial, sans-serif" : "Arial, sans-serif",
        direction: isRTL ? 'rtl' : 'ltr',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}>
        {/* Teal header */}
        <div style={{ background: '#0d5c56', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'white', fontWeight: '800', fontSize: '22px', margin: 0, letterSpacing: isRTL ? '0' : '0.04em' }}>
            {isRTL ? 'دليل فرز النفايات السريع' : 'Quick Waste Segregation Guide'}
          </p>
        </div>

        {/* Bin list */}
        <div style={{ padding: '18px 40px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { color: '#1E293B', en: 'General Waste',      ar: 'النفايات العامة',     bin: isRTL ? 'الحاوية السوداء' : 'Black Bin' },
            { color: '#EAB308', en: 'Infectious Waste',   ar: 'النفايات المعدية',    bin: isRTL ? 'الحاوية الصفراء' : 'Yellow Bin' },
            { color: '#EF4444', en: 'Sharps / Biohazard', ar: 'الأدوات الحادة',      bin: isRTL ? 'الحاوية الحمراء' : 'Red Bin' },
            { color: '#3B82F6', en: 'Pharmaceutical',     ar: 'النفايات الصيدلانية', bin: isRTL ? 'الحاوية الزرقاء' : 'Blue Bin' },
          ].map(({ color, en, ar, bin }) => (
            <div key={en} style={{ display: 'flex', alignItems: 'center', gap: '16px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: color, flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: isRTL ? 'right' : 'left' }}>
                <span style={{ fontWeight: '800', fontSize: '16px', color: '#0f172a' }}>{isRTL ? ar : en}</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{bin}</span>
              </div>
            </div>
          ))}
        </div>

        {/* When in doubt rule */}
        <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px', background: '#fefce8', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px 20px', textAlign: 'center' }}>
          <span style={{ color: '#92400e', fontWeight: '800', fontSize: '16px' }}>
            {isRTL ? '⚠ عند الشك → ضع في الحاوية الصفراء' : '⚠ When in doubt → Use the Yellow bin'}
          </span>
        </div>
      </div>

      {/* ── Evaluation Modal ── */}
      {showEval && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}>
          <div dir={isRTL ? 'rtl' : 'ltr'} style={{
            background: 'white', borderRadius: '20px', padding: '36px 32px',
            maxWidth: '420px', width: '100%', textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            fontFamily: isRTL ? "'Tajawal', sans-serif" : 'inherit',
            animation: 'fadeIn 0.25s ease',
          }}>
            {evalThanks ? (
              <div style={{ padding: '20px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
                <p style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-success)', margin: 0 }}>
                  {t('evalThankYou')}
                </p>
              </div>
            ) : (
              <>
                {/* Title */}
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⭐</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-text-main)', marginBottom: '4px' }}>
                  {t('evalTitle')}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                  {t('evalSubtitle')}
                </p>

                {/* 3 rating categories */}
                {[
                  { key: 'r1', label: t('evalCat1') },
                  { key: 'r2', label: t('evalCat2') },
                  { key: 'r3', label: t('evalCat3') },
                ].map(({ key, label }) => (
                  <div key={key} style={{ marginBottom: '14px', textAlign: isRTL ? 'right' : 'left' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-main)', margin: '0 0 5px' }}>
                      {label}
                    </p>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setEvalRatings(prev => ({ ...prev, [key]: star }))}
                          onMouseEnter={() => setEvalHovers(prev => ({ ...prev, [key]: star }))}
                          onMouseLeave={() => setEvalHovers(prev => ({ ...prev, [key]: 0 }))}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                            fontSize: '1.7rem', lineHeight: 1,
                            color: star <= (evalHovers[key] || evalRatings[key]) ? '#F59E0B' : '#CBD5E1',
                            transform: star <= (evalHovers[key] || evalRatings[key]) ? 'scale(1.2)' : 'scale(1)',
                            transition: 'color 0.12s, transform 0.12s',
                          }}
                        >★</button>
                      ))}
                      {(evalHovers[key] || evalRatings[key]) > 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: '600', alignSelf: 'center', marginInlineStart: '6px' }}>
                          {t(`evalStar${evalHovers[key] || evalRatings[key]}`)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Comment textarea */}
                <textarea
                  value={evalComment}
                  onChange={e => setEvalComment(e.target.value)}
                  placeholder={t('evalCommentPlaceholder')}
                  rows={2}
                  style={{
                    width: '100%', borderRadius: '10px', border: '1.5px solid var(--color-border)',
                    padding: '9px 12px', fontSize: '0.83rem', resize: 'none', marginTop: '6px',
                    fontFamily: isRTL ? "'Tajawal', sans-serif" : 'inherit',
                    direction: isRTL ? 'rtl' : 'ltr',
                    color: 'var(--color-text-main)', outline: 'none', boxSizing: 'border-box',
                  }}
                />

                {/* Submit button (no skip) */}
                <button
                  onClick={handleEvalSubmit}
                  disabled={!allRated}
                  style={{
                    width: '100%', marginTop: '14px', padding: '12px',
                    border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.92rem',
                    cursor: allRated ? 'pointer' : 'not-allowed',
                    background: allRated ? 'var(--color-primary)' : 'var(--color-border)',
                    color: allRated ? 'white' : 'var(--color-text-muted)',
                    transition: 'background 0.2s',
                    fontFamily: isRTL ? "'Tajawal', sans-serif" : 'inherit',
                  }}
                >
                  {t('evalSubmit')}
                </button>
                {!allRated && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '6px' }}>
                    {t('evalAllRequired')}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
