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
export async function getResultsFromDb() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .order('date', { ascending: false })
    .limit(2000);
  if (error) {
    console.error('Failed to load results from Supabase:', error.message);
    return [];
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
