import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GripVertical, Hand, Clock, Layers } from 'lucide-react';
import { getQuestions } from '../data/questions';
import { getWasteCategories } from '../data/wasteCategories';
import GameHUD from '../components/quiz/GameHUD';
import TimerBar from '../components/quiz/TimerBar';
import DraggableItem from '../components/quiz/DraggableItem';
import BinDropZone from '../components/quiz/BinDropZone';
import FeedbackPanel from '../components/quiz/FeedbackPanel';
import ResultsScreen from '../components/quiz/ResultsScreen';
import { sensoryEngine } from '../utils/sensory';

const MAX_TIME = 20;
const BASE_POINTS = 100;
const LS_KEY = 'cds_best_score';
const QUIZ_STATE_KEY = 'cds_quiz_state';

// Restore saved quiz state from sessionStorage (clears on tab close)
function loadSavedQuizState(lang) {
  try {
    const raw = sessionStorage.getItem(QUIZ_STATE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    // Discard if language changed between sessions
    if (state.lang && state.lang !== lang) return null;
    // Adjust timeLeft for real time elapsed since last save
    if (!state.showFeedback && state.timeLeft > 0 && state.savedAt) {
      const elapsed = Math.floor((Date.now() - state.savedAt) / 1000);
      state.timeLeft = Math.max(1, state.timeLeft - elapsed);
    }
    return state;
  } catch {
    return null;
  }
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function calcPoints(timeLeft) {
  return BASE_POINTS + Math.round((timeLeft / MAX_TIME) * 50);
}

export default function QuizPage() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const userInfo = location.state?.userInfo || (() => {
    const stored = sessionStorage.getItem('cds_user_info');
    return stored ? JSON.parse(stored) : null;
  })();

  if (!userInfo) return <Navigate to="/" replace />;

  const wasteCategories = useMemo(() => getWasteCategories(i18n.language), [i18n.language]);
  const bestScore = parseInt(localStorage.getItem(LS_KEY) || '0', 10);

  // Load saved state once on mount — lazy initializer runs only on first render
  const [init] = useState(() => {
    const saved = loadSavedQuizState(i18n.language);
    if (saved?.questions?.length) {
      return { ...saved, isRestoring: true };
    }
    return {
      questions: shuffle(getQuestions(i18n.language, 10, userInfo.department)),
      currentIndex: 0,
      selectedBin: null,
      showFeedback: false,
      score: 0,
      questionResults: [],
      timeLeft: MAX_TIME,
      isRestoring: false,
    };
  });

  // ── Core state (initialized from saved or fresh) ──
  const [questions]                       = useState(init.questions);
  const [currentIndex,   setCurrentIndex] = useState(init.currentIndex);
  const [selectedBin,    setSelectedBin]  = useState(init.selectedBin);
  const [showFeedback,   setShowFeedback] = useState(init.showFeedback);
  const [isFinished,     setIsFinished]   = useState(false);

  // ── Score ──
  const [score,           setScore]           = useState(init.score);
  const [lastPoints,      setLastPoints]       = useState(0);
  const [questionResults, setQuestionResults]  = useState(init.questionResults);

  // ── Timer ──
  const [timeLeft,    setTimeLeft]   = useState(init.timeLeft);
  // If restoring mid-question (no feedback panel), start the timer right away
  const [timerActive, setTimerActive] = useState(init.isRestoring && !init.showFeedback);

  // ── Animations ──
  const [animatingBinId, setAnimatingBinId] = useState(null);
  const [animationType,  setAnimationType]  = useState(null);
  const [showScreenFlash, setShowScreenFlash] = useState(false);
  const [floatingPoint,  setFloatingPoint]  = useState(null);

  // ── Instructions — skip if restoring a saved session ──
  const [showInstructions, setShowInstructions] = useState(!init.isRestoring);
  // Ready when the first question's image is decoded (or immediately if already cached / no image)
  const firstUrl = init.questions[0]?.imageUrl;
  const [firstImgReady, setFirstImgReady] = useState(() => {
    if (!firstUrl) return true;
    const probe = new window.Image();
    probe.src = firstUrl;
    return probe.complete; // true if already in browser cache
  });

  // ── Drag ──
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverBinId, setDragOverBinId] = useState(null);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Preload all question images so future questions load instantly
  useEffect(() => {
    questions.forEach(q => {
      if (q.imageUrl) {
        const img = new window.Image();
        img.src = q.imageUrl;
      }
    });
  }, [questions]);

  // Persist quiz progress to sessionStorage after each answer or question change.
  // On refresh, the tester resumes exactly where they left off.
  useEffect(() => {
    if (isFinished) {
      sessionStorage.removeItem(QUIZ_STATE_KEY);
      return;
    }
    sessionStorage.setItem(QUIZ_STATE_KEY, JSON.stringify({
      questions,
      currentIndex,
      selectedBin,
      showFeedback,
      score,
      questionResults,
      timeLeft,
      lang: i18n.language,
      savedAt: Date.now(),
    }));
  }, [currentIndex, showFeedback, score, questionResults, isFinished]);

  // ── Timer countdown ──
  useEffect(() => {
    if (!timerActive || showFeedback || isFinished || showInstructions) return;
    if (timeLeft <= 0) { handleTimeout(); return; }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, timerActive, showFeedback, isFinished, showInstructions]);

  const triggerAnimation = (binId, type, points) => {
    setAnimatingBinId(binId);
    setAnimationType(type);
    if (type === 'correct' && points > 0) {
      setFloatingPoint({ text: `+${points}`, key: Date.now() });
    }
    if (type === 'wrong') {
      setShowScreenFlash(true);
      setTimeout(() => setShowScreenFlash(false), 350);
    }
    setTimeout(() => {
      setAnimatingBinId(null);
      setAnimationType(null);
      setFloatingPoint(null);
    }, 700);
  };

  const handleBinSelect = useCallback((binId) => {
    if (showFeedback || isFinished) return;
    setTimerActive(false);
    setSelectedBin(binId);
    setShowFeedback(true);
    setIsDragging(false);
    setDragOverBinId(null);

    const q = questions[currentIndex];
    const correct = binId === q.correctBin;
    const timeUsed = MAX_TIME - timeLeft;
    let points = 0;

    if (correct) {
      points = calcPoints(timeLeft);
      setScore(s => s + points);
      setLastPoints(points);
      triggerAnimation(binId, 'correct', points);
      sensoryEngine.playCorrect();
    } else {
      setLastPoints(0);
      triggerAnimation(binId, 'wrong', 0);
      sensoryEngine.playWrong();
    }

    setQuestionResults(prev => [...prev, {
      id: q.id,
      itemName: q.itemName,
      itemIcon: q.itemIcon,
      category: q.category,
      correct,
      points,
      timeUsed,
      correctBin: q.correctBin,
      selectedBin: binId,
      explanation: q.explanation,
    }]);
  }, [showFeedback, isFinished, currentIndex, timeLeft, questions]);

  const handleTimeout = useCallback(() => {
    if (showFeedback || isFinished) return;
    setTimerActive(false);
    setSelectedBin('__timeout__');
    setShowFeedback(true);

    const q = questions[currentIndex];
    setLastPoints(0);
    triggerAnimation(q.correctBin, 'wrong', 0);
    sensoryEngine.playWrong();

    setQuestionResults(prev => [...prev, {
      id: q.id,
      itemName: q.itemName,
      itemIcon: q.itemIcon,
      category: q.category,
      correct: false,
      points: 0,
      timeUsed: MAX_TIME,
      correctBin: q.correctBin,
      selectedBin: '__timeout__',
      explanation: q.explanation,
    }]);
  }, [showFeedback, isFinished, currentIndex, questions]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedBin(null);
      setShowFeedback(false);
      setTimeLeft(MAX_TIME);
      setTimerActive(true);
      setAnimatingBinId(null);
      setAnimationType(null);
    } else {
      if (score > bestScore) localStorage.setItem(LS_KEY, String(score));
      setIsFinished(true);
    }
  };

  const restart = () => {
    sessionStorage.removeItem(QUIZ_STATE_KEY);
    navigate('/');
  };

  // ── Drag handlers ──
  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => { setIsDragging(false); setDragOverBinId(null); };
  const handleDragEnterBin = (binId) => setDragOverBinId(binId);
  const handleDragLeaveBin = () => setDragOverBinId(null);
  const handleDropOnBin = (binId) => {
    setIsDragging(false);
    setDragOverBinId(null);
    handleBinSelect(binId);
  };

  if (isFinished) {
    return (
      <ResultsScreen
        score={score}
        questionResults={questionResults}
        totalQuestions={questions.length}
        bestScore={bestScore}
        userInfo={userInfo}
        onRestart={restart}
      />
    );
  }

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedBin === currentQuestion.correctBin;
  const isTimeout = selectedBin === '__timeout__';

  const steps = [
    {
      icon: <Layers size={22} color="var(--color-primary)" />,
      title: t('step1Title'),
      body: t('step1Body'),
    },
    {
      icon: isTouchDevice
        ? <Hand size={22} color="var(--color-accent)" />
        : <GripVertical size={22} color="var(--color-accent)" />,
      title: isTouchDevice ? t('step2TitleTouch') : t('step2TitleDesktop'),
      body:  isTouchDevice ? t('step2BodyTouch')  : t('step2BodyDesktop'),
    },
    {
      icon: <Clock size={22} color="var(--color-danger)" />,
      title: t('step3Title'),
      body: t('step3Body'),
    },
  ];

  return (
    <div className="container" style={{ maxWidth: '860px', marginTop: '20px' }}>

      {/* ── Instructions overlay ── */}
      {showInstructions && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(15,23,42,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
          backdropFilter: 'blur(3px)',
        }}>
          <div style={{
            background: 'var(--color-bg-white)',
            borderRadius: '20px',
            padding: '32px 28px',
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '2.4rem', marginBottom: '10px' }}>🗑️</div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--color-text-main)', margin: '0 0 6px' }}>
                {t('howToPlayTitle')}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                {t('howToPlaySub')}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
              {steps.map((step, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '14px',
                  background: 'var(--color-bg-light)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                }}>
                  <div style={{
                    width: '40px', height: '40px', flexShrink: 0,
                    borderRadius: '50%', background: 'var(--color-bg-white)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {step.icon}
                  </div>
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--color-text-main)', margin: '0 0 3px' }}>
                      {step.title}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.55 }}>
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Hidden preload for the first question's image — loads while user reads instructions */}
            {questions[0]?.imageUrl && (
              <img
                src={questions[0].imageUrl}
                alt=""
                onLoad={() => setFirstImgReady(true)}
                onError={() => setFirstImgReady(true)}
                style={{ display: 'none' }}
              />
            )}

            <button
              onClick={() => { if (!firstImgReady && questions[0]?.imageUrl) return; setShowInstructions(false); setTimerActive(true); }}
              disabled={!firstImgReady && !!questions[0]?.imageUrl}
              style={{
                width: '100%',
                padding: '14px',
                background: firstImgReady || !questions[0]?.imageUrl ? 'var(--color-primary)' : 'var(--color-border)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: '800',
                fontSize: '1rem',
                cursor: firstImgReady || !questions[0]?.imageUrl ? 'pointer' : 'not-allowed',
                boxShadow: firstImgReady || !questions[0]?.imageUrl ? '0 4px 14px rgba(13,148,136,0.35)' : 'none',
                transition: 'background 0.3s, box-shadow 0.3s',
              }}
            >
              {firstImgReady || !questions[0]?.imageUrl ? t('gotItStart') : '…'}
            </button>
          </div>
        </div>
      )}
      {showScreenFlash && <div className="screen-flash-red" />}

      {floatingPoint && (
        <div key={floatingPoint.key} className="float-up-text" style={{ top: '80px', insetInlineEnd: '24px' }}>
          {floatingPoint.text}
        </div>
      )}

      <GameHUD
        score={score}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        bestScore={bestScore}
        correctCount={questionResults.filter(r => r.correct).length}
        wrongCount={questionResults.filter(r => !r.correct).length}
      />

      {/* Progress bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ width: '100%', height: '5px', background: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{
            width: `${(currentIndex / questions.length) * 100}%`,
            height: '100%',
            background: 'var(--color-primary)',
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {!showFeedback && <TimerBar timeLeft={timeLeft} maxTime={MAX_TIME} />}

      <DraggableItem
        question={currentQuestion}
        isTouchDevice={isTouchDevice}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTouchBinHover={handleDragEnterBin}
        onTouchDrop={handleDropOnBin}
        showFeedback={showFeedback}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth < 500 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: window.innerWidth < 500 ? '12px' : '14px',
        marginBottom: '24px',
      }}>
        {wasteCategories.map((bin) => (
          <BinDropZone
            key={bin.id}
            bin={bin}
            isDragOver={dragOverBinId === bin.id}
            isDragging={isDragging}
            animationType={animatingBinId === bin.id ? animationType : null}
            showFeedback={showFeedback}
            isSelected={selectedBin === bin.id}
            isCorrectBin={showFeedback && bin.id === currentQuestion.correctBin}
            onClick={handleBinSelect}
            onDragEnter={handleDragEnterBin}
            onDragLeave={handleDragLeaveBin}
            onDrop={handleDropOnBin}
          />
        ))}
      </div>

      {showFeedback && (
        <FeedbackPanel
          isCorrect={isCorrect && !isTimeout}
          isTimeout={isTimeout}
          question={currentQuestion}
          onNext={handleNext}
          isLastQuestion={currentIndex === questions.length - 1}
          pointsEarned={lastPoints}
        />
      )}
    </div>
  );
}
