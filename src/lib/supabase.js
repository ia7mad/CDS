import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If env vars are not set (e.g. original single-hospital build), supabase is null.
// All db.js functions check for null and silently skip — app works fully offline.
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Allow dynamic hospital ID via URL (e.g., ?hospital=KFHBH) or fall back to localStorage/env
function getHospitalParam() {
  const urlParams = new URLSearchParams(window.location.search);
  let val = urlParams.get('hospital');
  if (!val && window.location.hash.includes('?')) {
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
    val = hashParams.get('hospital');
  }
  return val;
}

let dynamicHospitalId = getHospitalParam();
if (dynamicHospitalId) {
  localStorage.setItem('cds_hospital_id', dynamicHospitalId.toUpperCase());
} else {
  dynamicHospitalId = localStorage.getItem('cds_hospital_id') 
    || import.meta.env.VITE_HOSPITAL_ID 
    || 'KFHBH'; // Default if none provided
}

export const HOSPITAL_ID = dynamicHospitalId.toUpperCase();
