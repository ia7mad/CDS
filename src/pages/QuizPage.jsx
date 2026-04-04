import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { questions as allQuestions } from '../data/questions';
import { wasteCategories } from '../data/wasteCategories';
import GameHUD from '../components/quiz/GameHUD';
import TimerBar from '../components/quiz/TimerBar';
import DraggableItem from '../components/quiz/DraggableItem';
import BinDropZone from '../components/quiz/BinDropZone';
import FeedbackPanel from '../components/quiz/FeedbackPanel';
import ResultsScreen from '../components/quiz/ResultsScreen';

const MAX_TIME = 10;
const BASE_POINTS = 100;
const LS_KEY = 'cds_best_score';

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
  const location = useLocation();
  const userInfo = location.state?.userInfo || { name: '', profileNumber: '', department: '' };

  const questions = useMemo(() => shuffle(allQuestions), []);
  const bestScore = parseInt(localStorage.getItem(LS_KEY) || '0', 10);

  // ── Core state ──
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedBin, setSelectedBin] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // ── Score ──
  const [score, setScore] = useState(0);
  const [lastPoints, setLastPoints] = useState(0);
  const [questionResults, setQuestionResults] = useState([]);

  // ── Timer ──
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [timerActive, setTimerActive] = useState(true);

  // ── Animations ──
  const [animatingBinId, setAnimatingBinId] = useState(null);
  const [animationType, setAnimationType] = useState(null);
  const [showScreenFlash, setShowScreenFlash] = useState(false);
  const [floatingPoint, setFloatingPoint] = useState(null);

  // ── Drag ──
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverBinId, setDragOverBinId] = useState(null);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // ── Timer countdown ──
  useEffect(() => {
    if (!timerActive || showFeedback || isFinished) return;
    if (timeLeft <= 0) { handleTimeout(); return; }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, timerActive, showFeedback, isFinished]);

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
    } else {
      setLastPoints(0);
      triggerAnimation(binId, 'wrong', 0);
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

  const restart = () => window.location.href = '/';

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

  return (
    <div className="container" style={{ maxWidth: '860px', marginTop: '20px' }}>
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
        showFeedback={showFeedback}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
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
