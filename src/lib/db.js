import { supabase, HOSPITAL_ID } from './supabase';

const PENDING_KEY = 'cds_pending_sync';

// ── saveResultToDb ────────────────────────────────────────────────────────────
// Inserts one result into Supabase. Returns true on success, false on failure.
// Called from ResultsScreen immediately after the localStorage write.
export async function saveResultToDb(result) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('quiz_results')
      .insert({
        local_id:        String(result.id),
        hospital_id:     HOSPITAL_ID,
        cert_id:         result.certId         || null,
        name:            result.name,
        profile_number:  result.profileNumber,
        department:      result.department,
        score:           result.score,
        percentage:      result.percentage,
        passed:          result.passed,
        correct_count:   result.correctCount,
        total_questions: result.totalQuestions,
        date:            result.date,
      });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase insert failed, queuing for later sync:', err.message);
    return false;
  }
}

// ── getResultsFromDb ──────────────────────────────────────────────────────────
// Loads all results for this hospital from Supabase (RLS filters by hospital).
// Returns camelCase objects matching the shape the rest of the UI already uses.
// Returns [] on any error.
export async function getResultsFromDb(adminHospitalId = null) {
  if (!supabase) return [];
  
  let query = supabase.from('quiz_results').select('*');
  
  // If a specific hospital ID is provided, filter by it. 
  // If null, it means it's a super-admin and pulls all records.
  if (adminHospitalId) {
    query = query.eq('hospital_id', adminHospitalId);
  }

  const { data, error } = await query
    .order('date', { ascending: false })
    .limit(2000);
  if (error) {
    console.error('Failed to load results from Supabase:', error.message);
    return null;
  }
  return (data || []).map(r => ({
    id:             r.id,
    certId:         r.cert_id,
    name:           r.name,
    profileNumber:  r.profile_number,
    department:     r.department,
    score:          r.score,
    percentage:     r.percentage,
    passed:         r.passed,
    correctCount:   r.correct_count,
    totalQuestions: r.total_questions,
    date:           r.date,
  }));
}

// ── saveQuestionAttemptsToDb ──────────────────────────────────────────────────
// Inserts one row per question answered in a quiz session.
// questionResults shape: [{ id, itemName, category, correct, timeUsed }]
export async function saveQuestionAttemptsToDb(questionResults) {
  if (!supabase || !questionResults?.length) return;
  const rows = questionResults.map(q => ({
    hospital_id:  HOSPITAL_ID,
    question_id:  q.id,
    item_name:    q.itemName,
    category:     q.category,
    correct:      q.correct,
    time_used:    q.timeUsed ?? null,
    date:         new Date().toISOString(),
  }));
  const { error } = await supabase.from('question_attempts').insert(rows);
  if (error) console.warn('Failed to save question attempts:', error.message);
}

// ── getQuestionStatsFromDb ────────────────────────────────────────────────────
// Returns per-question aggregates: attempts, correct count, wrong count, avg time.
export async function getQuestionStatsFromDb(adminHospitalId = null) {
  if (!supabase) return null;
  let query = supabase
    .from('question_attempts')
    .select('question_id, item_name, category, correct, time_used');
  if (adminHospitalId) query = query.eq('hospital_id', adminHospitalId);
  const { data, error } = await query;
  if (error) { console.error('Failed to load question stats:', error.message); return null; }

  // Aggregate client-side
  const map = {};
  (data || []).forEach(row => {
    if (!map[row.question_id]) {
      map[row.question_id] = { questionId: row.question_id, itemName: row.item_name, category: row.category, attempts: 0, correct: 0, timeSum: 0, timeCount: 0 };
    }
    const e = map[row.question_id];
    e.attempts++;
    if (row.correct) e.correct++;
    if (row.time_used != null) { e.timeSum += row.time_used; e.timeCount++; }
  });

  return Object.values(map).map(e => ({
    ...e,
    wrong:       e.attempts - e.correct,
    passRate:    e.attempts ? Math.round((e.correct / e.attempts) * 100) : 0,
    avgTime:     e.timeCount ? Math.round((e.timeSum / e.timeCount) * 10) / 10 : null,
  })).sort((a, b) => a.passRate - b.passRate); // hardest first
}

// ── Question Bank Cloud Sync ──────────────────────────────────────────────────
export async function getHospitalQuestionsFromDb(hospitalId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('hospital_configs')
      .select('questions_jsonb')
      .eq('hospital_id', hospitalId)
      .single();
    if (error) return null;
    return data?.questions_jsonb || null;
  } catch (e) {
    return null;
  }
}

export async function saveHospitalQuestionsToDb(hospitalId, questions) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('hospital_configs')
      .upsert({
        hospital_id: hospitalId,
        questions_jsonb: questions,
        updated_at: new Date().toISOString()
      }, { onConflict: 'hospital_id' });
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Failed to sync questions to cloud:', e);
    return false;
  }
}

// ── addToPendingQueue ─────────────────────────────────────────────────────────
// Saves a result to the local pending-sync queue so it can be retried later.
export function addToPendingQueue(result) {
  const pending = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
  if (!pending.find(p => p.id === result.id)) {
    pending.push(result);
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  }
}

// ── syncPendingResults ────────────────────────────────────────────────────────
// Called once on app mount. Retries any queued results that failed to sync.
// Successfully synced records are removed from the queue.
export async function syncPendingResults() {
  if (!supabase) return;
  const pending = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
  if (!pending.length) return;

  const stillPending = [];
  for (const result of pending) {
    const ok = await saveResultToDb(result);
    if (!ok) stillPending.push(result);
  }
  localStorage.setItem(PENDING_KEY, JSON.stringify(stillPending));
}
