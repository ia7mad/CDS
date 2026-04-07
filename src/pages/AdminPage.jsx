import React, { useState, useEffect, useRef } from 'react';
import { getAllRawQuestions, saveAdminQuestions, resetQuestions, resolveImageUrl } from '../data/questions';
import { Plus, Edit2, Trash2, Save, RotateCcw, Download, Upload, X, Image, ArrowLeft, ArrowUp, ArrowDown, Copy, Lock, LogOut, Settings, List, BarChart2, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import { getResultsFromDb, saveHospitalQuestionsToDb, getHospitalQuestionsFromDb } from '../lib/db';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Filler);

const HOSPITAL_KEY = 'cds_hospital_name';

const BIN_COLORS = {
  general:        '#1E293B',
  infectious:     '#EAB308',
  sharps:         '#EF4444',
  pharmaceutical: '#3B82F6',
};

const EMOJI_MAP = {
  'syringe':      '💉',
  'package':      '📦',
  'droplets':     '🩸',
  'pill':         '💊',
  'hand':         '🧤',
  'glass-water':  '🫗',
  'apple':        '🍎',
  'shield-alert': '😷',
  'scissors':     '✂️',
  'bag-water':    '🧪',
};

const EMPTY_QUESTION = {
  id: '', itemName: { en: '', ar: '' }, scenario: { en: '', ar: '' },
  explanation: { en: '', ar: '' }, itemIcon: 'syringe', imageUrl: '',
  category: 'general', difficulty: 'beginner', correctBin: 'general', standard: '',
  departments: ['all'],
};

const DEPT_OPTIONS = [
  { value: 'all',          label: 'All Departments (Universal)' },
  { value: 'emergency',    label: 'Emergency' },
  { value: 'icu',          label: 'ICU' },
  { value: 'operating',    label: 'Operating Room' },
  { value: 'general',      label: 'General Ward' },
  { value: 'pediatrics',   label: 'Pediatrics' },
  { value: 'oncology',     label: 'Oncology' },
  { value: 'radiology',    label: 'Radiology' },
  { value: 'laboratory',   label: 'Laboratory' },
  { value: 'pharmacy',     label: 'Pharmacy' },
  { value: 'outpatient',   label: 'Outpatient / Clinic' },
  { value: 'other',        label: 'Other' },
];

// ── Auth Gate (email + password via Supabase) ────────────────────────────────
function AuthGate({ onUnlock }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const attempt = async () => {
    if (!email.trim() || !password) { setError('Email and password are required.'); return; }
    if (!supabase) { setError('Backend not configured. Contact your administrator.'); return; }
    setLoading(true);
    setError('');
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError('Invalid email or password.');
    } else {
      onUnlock(data.session.user.email);
    }
  };

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'var(--color-bg-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: '40px 36px', maxWidth: '380px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Lock size={28} color="var(--color-primary)" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-text-main)', margin: '0 0 8px' }}>Admin Login</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0 0 24px' }}>Sign in with your administrator account.</p>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && attempt()}
          autoFocus
          style={{ ...inputStyle, textAlign: 'left', marginBottom: '10px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && attempt()}
          style={{ ...inputStyle, marginBottom: '12px', border: error ? '2px solid var(--color-danger)' : '1px solid var(--color-border)' }}
        />
        {error && <p style={{ fontSize: '0.8rem', color: 'var(--color-danger)', marginBottom: '8px' }}>{error}</p>}
        <button
          onClick={attempt}
          disabled={loading}
          style={{ ...btnStyle('var(--color-primary)', 'white'), width: '100%', justifyContent: 'center', padding: '12px', opacity: loading ? 0.6 : 1 }}
        >
          <Lock size={15} /> {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </div>
    </div>
  );
}

// ── Image picker ────────────────────────────────────────────────────────────
function ImagePicker({ value, onChange }) {
  const [tab, setTab] = useState('upload');
  const [urlDraft, setUrlDraft] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const loadFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const MAX = 400; // Cloud optimization
        if (width > MAX || height > MAX) {
          if (width > height) { height *= MAX / width; width = MAX; } 
          else { width *= MAX / height; height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        onChange(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };
  const handleFilePick = (e) => loadFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); loadFile(e.dataTransfer.files[0]); };
  const applyUrl = () => { if (urlDraft.trim()) onChange(urlDraft.trim()); };
  const clear = () => { onChange(''); setUrlDraft(''); };

  const tabBtn = (key, label) => (
    <button onClick={() => setTab(key)} style={{ padding: '6px 16px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem', background: tab === key ? 'var(--color-primary)' : 'var(--color-bg-light)', color: tab === key ? 'white' : 'var(--color-text-muted)' }}>
      {label}
    </button>
  );

  return (
    <div>
      <label style={labelStyle}><Image size={13} /> Item Image</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            {tabBtn('upload', '📁 Upload File')}
            {tabBtn('url', '🔗 Paste URL')}
          </div>
          {tab === 'upload' && (
            <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileRef.current.click()}
              style={{ border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', padding: '24px', textAlign: 'center', cursor: 'pointer', background: dragOver ? 'rgba(13,148,136,0.05)' : 'var(--color-bg-light)', transition: 'all 0.15s' }}>
              <Upload size={24} color="var(--color-text-muted)" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Drag & drop or <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>click to browse</span>
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>PNG, JPG, WEBP</p>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFilePick} style={{ display: 'none' }} />
            </div>
          )}
          {tab === 'url' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="https://example.com/image.jpg" value={urlDraft} onChange={e => setUrlDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyUrl()} style={{ ...inputStyle, flex: 1 }} />
              <button onClick={applyUrl} style={{ padding: '0 16px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>Apply</button>
            </div>
          )}
        </div>
        <div style={{ position: 'relative', width: '90px', flexShrink: 0 }}>
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', border: '2px solid var(--color-border)', background: 'var(--color-bg-light)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem' }}>
            {value ? <img src={value} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => onChange('')} /> : <Image size={28} color="var(--color-border)" />}
          </div>
          {value && (
            <button onClick={clear} style={{ position: 'absolute', top: '-4px', right: '-4px', width: '22px', height: '22px', borderRadius: '50%', background: 'var(--color-danger)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
              <X size={12} />
            </button>
          )}
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '4px' }}>Preview</p>
        </div>
      </div>
    </div>
  );
}

// ── Settings Tab ────────────────────────────────────────────────────────────
function SettingsTab() {
  const [hospitalName, setHospitalName] = useState(localStorage.getItem(HOSPITAL_KEY) || '');
  const [settingsSaved, setSettingsSaved] = useState(false);

  const saveSettings = () => {
    localStorage.setItem(HOSPITAL_KEY, hospitalName.trim());
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '580px' }}>
      <Section title="Hospital / Facility Name (Local Device Layer)">
        <Field label="Name displayed on certificates (for this portal window)">
          <input value={hospitalName} onChange={e => setHospitalName(e.target.value)} style={inputStyle} placeholder="e.g. King Fahad Medical City" />
        </Field>
        <button onClick={saveSettings} style={{ ...btnStyle(settingsSaved ? 'var(--color-success)' : 'var(--color-primary)', 'white'), marginTop: '12px' }}>
          <Save size={15} /> {settingsSaved ? 'Saved ✓' : 'Save Settings'}
        </button>
      </Section>
    </div>
  );
}

// ── Super Admin: Hospitals Tab ──────────────────────────────────────────────
function HospitalsTab() {
  const [newCode, setNewCode] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  
  const generate = () => {
    if (!newCode.trim()) return;
    const cleanId = newCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const link = `https://ia7mad.github.io/CDS/?hospital=${cleanId}`;
    setGeneratedLink(link);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`Welcome to the Healthcare Waste Disposal Portal.\nYour dedicated hospital portal link is: ${generatedLink}`);
    alert('Link copied to clipboard!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px' }}>
      <Section title="Onboard New Hospital">
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
          Create a unique access portal link for a new hospital. Ensure you also manually create their local admin email account (e.g. <code>admin@hospitalcode.com</code>) in the Supabase Dashboard Authentication tab so they can access their isolated results tracking.
        </p>
        
        <Field label="Hospital Short Code (e.g. KFHBH)">
          <input 
            value={newCode} 
            onChange={e => setNewCode(e.target.value)} 
            style={{ ...inputStyle, textTransform: 'uppercase' }} 
            placeholder="MNGHA" 
          />
        </Field>
        
        <button onClick={generate} style={{ ...btnStyle('var(--color-primary)', 'white'), marginTop: '14px', width: 'fit-content' }}>
          <Plus size={15} /> Generate Custom Link
        </button>

        {generatedLink && (
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(13, 148, 136, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(13, 148, 136, 0.2)' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '6px', textTransform: 'uppercase' }}>Portal Ready</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', marginBottom: '12px', wordBreak: 'break-all', userSelect: 'all' }}>{generatedLink}</p>
            <button onClick={copyLink} style={{ ...btnStyle('white', 'var(--color-primary)'), border: '1px solid var(--color-primary)' }}>
              <Copy size={14} /> Copy Invite Message
            </button>
          </div>
        )}
      </Section>
    </div>
  );
}

// ── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab({ results, loading }) {
  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading analytics…</div>;
  if (!results.length) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)', background: 'var(--color-bg-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>No data yet — analytics will appear once assessments are completed.</div>;

  // ── Computed stats ──
  const total      = results.length;
  const passed     = results.filter(r => r.passed).length;
  const passRate   = Math.round((passed / total) * 100);
  const avgScore   = Math.round(results.reduce((s, r) => s + (r.percentage || 0), 0) / total);

  const now        = new Date();
  const thisMonth  = results.filter(r => { const d = new Date(r.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length;
  const lastMonthD = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth  = results.filter(r => { const d = new Date(r.date); return d.getMonth() === lastMonthD.getMonth() && d.getFullYear() === lastMonthD.getFullYear(); }).length;

  // Department breakdown
  const deptMap = {};
  results.forEach(r => {
    const d = r.department || 'other';
    if (!deptMap[d]) deptMap[d] = { total: 0, passed: 0, scoreSum: 0 };
    deptMap[d].total++;
    if (r.passed) deptMap[d].passed++;
    deptMap[d].scoreSum += (r.percentage || 0);
  });
  const depts = Object.entries(deptMap)
    .map(([d, v]) => ({ dept: d, total: v.total, passed: v.passed, passRate: Math.round((v.passed / v.total) * 100), avg: Math.round(v.scoreSum / v.total) }))
    .sort((a, b) => b.total - a.total);

  // Score distribution buckets
  const buckets = { '0–59': 0, '60–69': 0, '70–79': 0, '80–89': 0, '90–100': 0 };
  results.forEach(r => {
    const p = r.percentage || 0;
    if (p < 60) buckets['0–59']++;
    else if (p < 70) buckets['60–69']++;
    else if (p < 80) buckets['70–79']++;
    else if (p < 90) buckets['80–89']++;
    else buckets['90–100']++;
  });

  // 30-day trend
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i)); return d;
  });
  const trendLabels = days.map(d => `${d.getDate()}/${d.getMonth() + 1}`);
  const trendData   = days.map(d =>
    results.filter(r => { const rd = new Date(r.date); return rd.toDateString() === d.toDateString(); }).length
  );

  const chartOpts = (yLabel) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { beginAtZero: true, title: { display: !!yLabel, text: yLabel, font: { size: 11 } }, ticks: { font: { size: 11 }, stepSize: 1 } },
    },
  });

  const KPI = ({ label, value, sub, color }) => (
    <div style={{ background: 'var(--color-bg-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: '20px 24px', borderTop: `3px solid ${color}` }}>
      <p style={{ margin: '0 0 4px', fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '2rem', fontWeight: '800', color }}>{value}</p>
      {sub && <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{sub}</p>}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        <KPI label="Total Assessments" value={total} sub={`${thisMonth} this month · ${lastMonth} last month`} color="var(--color-primary)" />
        <KPI label="Pass Rate" value={`${passRate}%`} sub={`${passed} passed · ${total - passed} failed`} color={passRate >= 70 ? 'var(--color-success)' : 'var(--color-danger)'} />
        <KPI label="Average Score" value={`${avgScore}%`} sub={avgScore >= 70 ? 'Above pass threshold' : 'Below pass threshold'} color="var(--color-accent)" />
        <KPI label="Certified Staff" value={passed} sub={`${total - passed} need to retake`} color="#8B5CF6" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Score distribution */}
        <div style={{ background: 'var(--color-bg-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: '20px 24px' }}>
          <p style={{ margin: '0 0 16px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--color-text-main)' }}>Score Distribution</p>
          <div style={{ height: '200px' }}>
            <Bar
              data={{
                labels: Object.keys(buckets),
                datasets: [{ data: Object.values(buckets), backgroundColor: ['#F43F5E', '#F59E0B', '#10B981', '#10B981', '#0D9488'], borderRadius: 6 }],
              }}
              options={chartOpts('Staff')}
            />
          </div>
        </div>

        {/* Dept pass rate */}
        <div style={{ background: 'var(--color-bg-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: '20px 24px' }}>
          <p style={{ margin: '0 0 16px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--color-text-main)' }}>Pass Rate by Department</p>
          <div style={{ height: '200px' }}>
            <Bar
              data={{
                labels: depts.map(d => d.dept),
                datasets: [{ data: depts.map(d => d.passRate), backgroundColor: depts.map(d => d.passRate >= 70 ? '#10B98188' : '#F43F5E88'), borderRadius: 6 }],
              }}
              options={{ ...chartOpts('%'), scales: { ...chartOpts('%').scales, y: { ...chartOpts('%').scales.y, max: 100 } } }}
            />
          </div>
        </div>
      </div>

      {/* 30-day trend */}
      <div style={{ background: 'var(--color-bg-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: '20px 24px' }}>
        <p style={{ margin: '0 0 16px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--color-text-main)' }}>Assessments — Last 30 Days</p>
        <div style={{ height: '180px' }}>
          <Line
            data={{
              labels: trendLabels,
              datasets: [{
                data: trendData,
                borderColor: '#0D9488', backgroundColor: 'rgba(13,148,136,0.08)',
                fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#0D9488',
              }],
            }}
            options={chartOpts('Tests')}
          />
        </div>
      </div>

      {/* Department table */}
      <div style={{ background: 'var(--color-bg-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'auto' }}>
        <div style={{ padding: '16px 24px 8px', borderBottom: '1px solid var(--color-border)' }}>
          <p style={{ margin: 0, fontWeight: '700', fontSize: '0.88rem', color: 'var(--color-text-main)' }}>Department Breakdown</p>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-light)' }}>
              {['Department', 'Total Tests', 'Passed', 'Failed', 'Pass Rate', 'Avg Score'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {depts.map(d => (
              <tr key={d.dept} style={{ borderTop: '1px solid var(--color-border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-light)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ ...tdStyle, fontWeight: '600', textTransform: 'capitalize' }}>{d.dept}</td>
                <td style={tdStyle}>{d.total}</td>
                <td style={{ ...tdStyle, color: 'var(--color-success)', fontWeight: '600' }}>{d.passed}</td>
                <td style={{ ...tdStyle, color: d.total - d.passed > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)', fontWeight: d.total - d.passed > 0 ? '600' : '400' }}>{d.total - d.passed}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'var(--color-bg-light)', overflow: 'hidden', minWidth: '60px' }}>
                      <div style={{ width: `${d.passRate}%`, height: '100%', background: d.passRate >= 70 ? 'var(--color-success)' : 'var(--color-danger)', borderRadius: '3px' }} />
                    </div>
                    <span style={{ fontWeight: '700', color: d.passRate >= 70 ? 'var(--color-success)' : 'var(--color-danger)', minWidth: '38px' }}>{d.passRate}%</span>
                  </div>
                </td>
                <td style={{ ...tdStyle, fontWeight: '600', color: d.avg >= 70 ? 'var(--color-success)' : 'var(--color-danger)' }}>{d.avg}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Results Tab ─────────────────────────────────────────────────────────────
function ResultsTab({ results, loading, source, onClear }) {

  const exportExcel = () => {
    if (!results.length) return;
    const rows = results.map(r => ({
      'Name': r.name,
      'Employee ID': r.profileNumber,
      'Department': r.department,
      'Score (%)': r.percentage,
      'Result': r.passed ? 'PASS' : 'FAIL',
      'Correct': r.correctCount,
      'Total Q': r.totalQuestions,
      'Certificate No.': r.certId || '-',
      'Date & Time': new Date(r.date).toLocaleString('en-GB'),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Assessment Results');
    XLSX.writeFile(wb, `HWDT-Results-${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const clearResults = () => {
    if (!window.confirm('This will permanently delete all assessment records. Are you sure?')) return;
    localStorage.removeItem('cds_results');
    onClear();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          {loading ? 'Loading…' : `${results.length} record${results.length !== 1 ? 's' : ''} · ${source === 'supabase' ? '🟢 Live from database' : '📱 Local cache'}`}
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={exportExcel} disabled={!results.length} style={{ ...btnStyle('var(--color-primary)', 'white'), opacity: results.length ? 1 : 0.4 }}>
            <Download size={15} /> Export to Excel
          </button>
          <button onClick={clearResults} disabled={!results.length} style={{ ...btnStyle('#fee2e2', 'var(--color-danger)'), opacity: results.length ? 1 : 0.4 }}>
            <Trash size={15} /> Clear All
          </button>
        </div>
      </div>

      {!results.length ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)', background: 'var(--color-bg-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          No assessment results recorded yet.
        </div>
      ) : (
        <div style={{ background: 'var(--color-bg-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-light)' }}>
                {['Name','Employee ID','Department','Score','Result','Cert No.','Date'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--color-border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={tdStyle}><strong>{r.name}</strong></td>
                  <td style={{ ...tdStyle, color: 'var(--color-text-muted)' }}>{r.profileNumber}</td>
                  <td style={{ ...tdStyle, color: 'var(--color-text-muted)' }}>{r.department}</td>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: '700', color: r.percentage >= 70 ? 'var(--color-success)' : 'var(--color-danger)' }}>{r.percentage}%</span>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: '400' }}> ({r.correctCount}/{r.totalQuestions})</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '700', background: r.passed ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)', color: r.passed ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {r.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: '0.78rem' }}>{r.certId || '—'}</td>
                  <td style={{ ...tdStyle, color: 'var(--color-text-muted)' }}>{new Date(r.date).toLocaleString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main AdminPage ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked]           = useState(false);
  const [adminHospitalId, setAdminHospitalId] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [tab, setTab]                     = useState('questions');
  const [questions, setQuestions]         = useState([]);
  const [editingId, setEditingId]         = useState(null);
  const [formData, setFormData]           = useState(null);
  const [saved, setSaved]                 = useState(false);

  // ── Results state — shared between Results tab and Analytics tab ──
  const [results, setResults]   = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsSource, setResultsSource]   = useState('local');

  const handleAuthSuccess = (email) => {
    if (email.toLowerCase() === 'admin@ahmad.com') {
      setAdminHospitalId(null); // Super admin bypass
    } else {
      const domain = email.split('@')[1];
      const hostId = domain ? domain.split('.')[0].toUpperCase() : 'UNKNOWN';
      setAdminHospitalId(hostId);
    }
    setUnlocked(true);
  };

  // Check for an existing Supabase session on mount (auto-login if token is still valid)
  useEffect(() => {
    if (!supabase) { setCheckingSession(false); return; }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user && session.user.email) {
        handleAuthSuccess(session.user.email);
      }
      setCheckingSession(false);
    });
  }, []);

  useEffect(() => {
    if (unlocked) {
      // Load question bank
      const bankId = adminHospitalId || 'DEFAULT_MASTER_BANK';
      getHospitalQuestionsFromDb(bankId).then(cloudBank => {
        if (cloudBank) {
          setQuestions(cloudBank);
          saveAdminQuestions(cloudBank);
        } else {
          setQuestions(getAllRawQuestions());
        }
      });

      // Load results (shared by Results tab + Analytics tab)
      if (supabase) {
        setResultsLoading(true);
        getResultsFromDb(adminHospitalId)
          .then(rows => {
            if (rows !== null) { setResults(rows); setResultsSource('supabase'); }
            else { setResults(JSON.parse(localStorage.getItem('cds_results') || '[]')); setResultsSource('local'); }
          })
          .finally(() => setResultsLoading(false));
      } else {
        setResults(JSON.parse(localStorage.getItem('cds_results') || '[]'));
        setResultsSource('local');
      }
    }
  }, [unlocked, adminHospitalId]);

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setUnlocked(false);
  };

  if (checkingSession) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Checking session…</p>
      </div>
    );
  }

  if (!unlocked) return <AuthGate onUnlock={(email) => handleAuthSuccess(email)} />;

  // ── Helpers ──
  const set = (key, val) => setFormData(f => ({ ...f, [key]: val }));
  const setL10n = (key, lang, val) => setFormData(f => ({ ...f, [key]: { ...f[key], [lang]: val } }));

  const persistQuestions = async (updated) => {
    try {
      saveAdminQuestions(updated); // Save to local browser cache immediately
      setQuestions(updated);
      
      const bankId = adminHospitalId || 'DEFAULT_MASTER_BANK';
      await saveHospitalQuestionsToDb(bankId, updated); // Sync to cloud
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Failed to save questions:', e);
      alert('⚠️ Failed to save! The image may be too large. Try a smaller image or a URL.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset to default questions? All custom questions will be lost.')) {
      resetQuestions();
      setQuestions(getAllRawQuestions());
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'questions_config.json';
    a.click(); URL.revokeObjectURL(url);
  };

  const openEditor = (q) => { setEditingId(q.id); setFormData(JSON.parse(JSON.stringify(q))); };
  const openNew = () => { setEditingId('new'); setFormData({ ...EMPTY_QUESTION, id: `q${Date.now()}` }); };
  const duplicate = (q) => { persistQuestions([...questions, { ...JSON.parse(JSON.stringify(q)), id: `q${Date.now()}` }]); };
  const deleteQuestion = (id) => { if (window.confirm('Delete this question?')) persistQuestions(questions.filter(q => q.id !== id)); };
  const moveQuestion = (id, dir) => {
    const idx = questions.findIndex(q => q.id === id);
    const next = idx + dir;
    if (next < 0 || next >= questions.length) return;
    const a = [...questions]; [a[idx], a[next]] = [a[next], a[idx]]; persistQuestions(a);
  };

  const saveForm = () => {
    if (!formData.itemName.en.trim()) { alert('Item name (English) is required.'); return; }
    if (!formData.scenario.en.trim()) { alert('Scenario (English) is required.'); return; }
    if (!formData.correctBin) { alert('Correct bin is required.'); return; }
    const updated = editingId === 'new' ? [...questions, formData] : questions.map(q => q.id === editingId ? formData : q);
    persistQuestions(updated);
    setEditingId(null); setFormData(null);
  };

  // ── Editor view ──
  if (editingId) {
    return (
      <div style={{ maxWidth: '820px', margin: '32px auto', padding: '0 20px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <ActionBtn title="Back" onClick={() => { setEditingId(null); setFormData(null); }}>
            <ArrowLeft size={18} color="var(--color-text-muted)" />
          </ActionBtn>
          <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-primary-dark)' }}>
            {editingId === 'new' ? 'New Question' : `Edit: ${formData.itemName.en || formData.id}`}
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Section title="Item Image">
            <ImagePicker value={formData.imageUrl || ''} onChange={v => set('imageUrl', v)} />
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>If no image is uploaded, the emoji fallback will be used.</p>
          </Section>
          <Section title="Identity">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="ID (auto-generated)"><input value={formData.id} style={{ ...inputStyle, opacity: 0.55 }} disabled /></Field>
              <Field label="Item Icon (emoji fallback)">
                <select value={formData.itemIcon} onChange={e => set('itemIcon', e.target.value)} style={inputStyle}>
                  {Object.entries(EMOJI_MAP).map(([k, v]) => <option key={k} value={k}>{v} {k}</option>)}
                </select>
              </Field>
            </div>
          </Section>
          <Section title="Item Name">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="English *"><input value={formData.itemName.en} onChange={e => setL10n('itemName', 'en', e.target.value)} style={inputStyle} placeholder="e.g. Used Syringe with Needle" /></Field>
              <Field label="Arabic"><input value={formData.itemName.ar} onChange={e => setL10n('itemName', 'ar', e.target.value)} style={{ ...inputStyle, direction: 'rtl', textAlign: 'right' }} placeholder="الاسم بالعربية" /></Field>
            </div>
          </Section>
          <Section title="Scenario">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="English *"><textarea value={formData.scenario.en} onChange={e => setL10n('scenario', 'en', e.target.value)} style={{ ...inputStyle, height: '100px', resize: 'vertical' }} placeholder="Describe the clinical situation…" /></Field>
              <Field label="Arabic"><textarea value={formData.scenario.ar} onChange={e => setL10n('scenario', 'ar', e.target.value)} style={{ ...inputStyle, height: '100px', resize: 'vertical', direction: 'rtl', textAlign: 'right' }} placeholder="الموقف بالعربية…" /></Field>
            </div>
          </Section>
          <Section title="Classification">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <Field label="Correct Bin *">
                <select value={formData.correctBin} onChange={e => set('correctBin', e.target.value)} style={{ ...inputStyle, borderColor: BIN_COLORS[formData.correctBin], borderWidth: '2px' }}>
                  <option value="general">🗑️ General (Black)</option>
                  <option value="infectious">⚠️ Infectious (Yellow)</option>
                  <option value="sharps">🔴 Sharps (Red)</option>
                  <option value="pharmaceutical">💊 Pharmaceutical (Blue)</option>
                </select>
              </Field>
              <Field label="Difficulty">
                <select value={formData.difficulty} onChange={e => set('difficulty', e.target.value)} style={inputStyle}>
                  <option value="beginner">🟢 Beginner</option>
                  <option value="intermediate">🟡 Intermediate</option>
                  <option value="advanced">🔴 Advanced</option>
                </select>
              </Field>
              <Field label="Category">
                <select value={formData.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
                  <option value="general">General</option>
                  <option value="infectious">Infectious</option>
                  <option value="sharps">Sharps</option>
                  <option value="pharmaceutical">Pharmaceutical</option>
                </select>
              </Field>
            </div>
          </Section>
          <Section title="Explanation (shown after answer)">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="English *"><textarea value={formData.explanation.en} onChange={e => setL10n('explanation', 'en', e.target.value)} style={{ ...inputStyle, height: '110px', resize: 'vertical' }} placeholder="Why does this item go in that bin?" /></Field>
              <Field label="Arabic"><textarea value={formData.explanation.ar} onChange={e => setL10n('explanation', 'ar', e.target.value)} style={{ ...inputStyle, height: '110px', resize: 'vertical', direction: 'rtl', textAlign: 'right' }} placeholder="الشرح بالعربية…" /></Field>
            </div>
          </Section>
          <Section title="Reference Standard">
            <Field label="WHO / MOH reference">
              <input value={formData.standard} onChange={e => set('standard', e.target.value)} style={inputStyle} placeholder="e.g. WHO Guidelines Ch. 7, MOH Safety Protocol A.1" />
            </Field>
          </Section>
          <Section title="Applicable Departments">
            <Field label="Show this question to staff from">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '4px' }}>
                {DEPT_OPTIONS.map(opt => {
                  const depts = formData.departments || ['all'];
                  const checked = opt.value === 'all'
                    ? depts.includes('all')
                    : !depts.includes('all') && depts.includes(opt.value);
                  const toggle = () => {
                    if (opt.value === 'all') {
                      set('departments', ['all']);
                    } else {
                      const current = depts.includes('all') ? [] : [...depts];
                      const next = current.includes(opt.value)
                        ? current.filter(d => d !== opt.value)
                        : [...current, opt.value];
                      set('departments', next.length ? next : ['all']);
                    }
                  };
                  return (
                    <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: 'var(--radius-full)', border: `1.5px solid ${checked ? 'var(--color-primary)' : 'var(--color-border)'}`, background: checked ? 'var(--color-primary)' + '18' : 'var(--color-bg-light)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: checked ? '600' : '400', color: checked ? 'var(--color-primary)' : 'var(--color-text-muted)', userSelect: 'none' }}>
                      <input type="checkbox" checked={checked} onChange={toggle} style={{ display: 'none' }} />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                Select "All Departments" for universal questions (sharps, general hygiene). Select specific departments for role-specific items (e.g. chemo bags for Oncology only).
              </p>
            </Field>
          </Section>
          <Section title="Live Preview">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', background: 'var(--color-bg-light)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
              <div style={{ width: '76px', height: '76px', flexShrink: 0, borderRadius: '50%', background: 'var(--color-bg-white)', border: '2px solid var(--color-border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem' }}>
                {formData.imageUrl ? <img src={resolveImageUrl(formData.imageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (EMOJI_MAP[formData.itemIcon] || '🗑️')}
              </div>
              <div>
                <p style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--color-text-main)', margin: 0 }}>{formData.itemName.en || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Item name…</span>}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>{formData.scenario.en?.substring(0, 80) || <span style={{ fontStyle: 'italic' }}>Scenario…</span>}{formData.scenario.en?.length > 80 ? '…' : ''}</p>
                <span style={{ display: 'inline-block', marginTop: '6px', padding: '2px 10px', background: BIN_COLORS[formData.correctBin] + '22', color: BIN_COLORS[formData.correctBin], borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '700', border: `1px solid ${BIN_COLORS[formData.correctBin]}44` }}>→ {formData.correctBin}</span>
              </div>
            </div>
          </Section>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '28px' }}>
          <button onClick={saveForm} style={btnStyle('var(--color-primary)', 'white')}><Save size={16} /> Save Question</button>
          <button onClick={() => { setEditingId(null); setFormData(null); }} style={btnStyle('var(--color-bg-light)', 'var(--color-text-main)')}>Cancel</button>
        </div>
      </div>
    );
  }

  // ── Main list view ──
  const tabBtn = (key, icon, label) => (
    <button onClick={() => setTab(key)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem', background: tab === key ? 'var(--color-primary)' : 'var(--color-bg-light)', color: tab === key ? 'white' : 'var(--color-text-muted)', transition: 'all 0.15s' }}>
      {icon} {label}
    </button>
  );

  return (
    <div style={{ maxWidth: '1040px', margin: '32px auto', padding: '0 20px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', margin: 0 }}>Admin Panel</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            {adminHospitalId ? `Viewing records for: [${adminHospitalId}]` : '🌟 Super Admin Mode (All Records)'} · {questions.length} questions in bank
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleSignOut} style={btnStyle('#fee2e2', 'var(--color-danger)')}><LogOut size={16} /> Sign Out</button>
          <button onClick={() => navigate('/')} style={btnStyle('var(--color-bg-light)', 'var(--color-text-main)')}><ArrowLeft size={16} /> Back</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {tabBtn('questions', <List size={15} />, `Questions (${questions.length})`)}
        {tabBtn('results', <BarChart2 size={15} />, 'Results')}
        {tabBtn('analytics', <BarChart2 size={15} />, 'Analytics')}
        {tabBtn('settings', <Settings size={15} />, 'Settings')}
        {adminHospitalId === null && tabBtn('hospitals', <Plus size={15} />, 'Create Hospital')}
      </div>

      {/* ── Questions Tab ── */}
      {tab === 'questions' && (
        <>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', justifyContent: 'flex-end' }}>
            <button onClick={handleReset} style={btnStyle('#fee2e2', 'var(--color-danger)')}><RotateCcw size={16} /> Reset</button>
            <button onClick={exportJson} style={btnStyle('var(--color-bg-light)', 'var(--color-text-main)')}><Download size={16} /> Export JSON</button>
            <button onClick={() => persistQuestions(questions)} style={btnStyle(saved ? 'var(--color-success)' : 'var(--color-primary)', 'white')}><Save size={16} /> {saved ? 'Saved ✓' : 'Save All'}</button>
            <button onClick={openNew} style={btnStyle('var(--color-primary)', 'white')}><Plus size={16} /> Add Question</button>
          </div>
          <div style={{ background: 'var(--color-bg-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
            {questions.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No questions yet. <button onClick={openNew} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: 'inherit' }}>Add the first one →</button>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg-light)' }}>
                    {['#','Image','Item Name','Scenario (excerpt)','Bin','Difficulty','Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, idx) => (
                    <tr key={q.id} style={{ borderTop: '1px solid var(--color-border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ ...tdStyle, color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{idx + 1}</td>
                      <td style={tdStyle}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-bg-light)', border: '1px solid var(--color-border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                          {q.imageUrl ? <img src={resolveImageUrl(q.imageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (EMOJI_MAP[q.itemIcon] || '🗑️')}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <p style={{ fontWeight: '700', margin: 0, fontSize: '0.9rem' }}>{q.itemName.en}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', direction: 'rtl', textAlign: 'right' }}>{q.itemName.ar}</p>
                      </td>
                      <td style={{ ...tdStyle, maxWidth: '260px' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.scenario.en}</p>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: '700', background: BIN_COLORS[q.correctBin] + '18', color: BIN_COLORS[q.correctBin], border: `1px solid ${BIN_COLORS[q.correctBin]}44` }}>
                          {q.correctBin}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{{ beginner: '🟢', intermediate: '🟡', advanced: '🔴' }[q.difficulty]} {q.difficulty}</span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <ActionBtn title="Move up" onClick={() => moveQuestion(q.id, -1)} disabled={idx === 0}><ArrowUp size={14} /></ActionBtn>
                          <ActionBtn title="Move down" onClick={() => moveQuestion(q.id, 1)} disabled={idx === questions.length - 1}><ArrowDown size={14} /></ActionBtn>
                          <ActionBtn title="Duplicate" onClick={() => duplicate(q)}><Copy size={14} color="var(--color-secondary)" /></ActionBtn>
                          <ActionBtn title="Edit" onClick={() => openEditor(q)}><Edit2 size={14} color="var(--color-primary)" /></ActionBtn>
                          <ActionBtn title="Delete" onClick={() => deleteQuestion(q.id)}><Trash2 size={14} color="var(--color-danger)" /></ActionBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '12px', textAlign: 'center' }}>
            {questions.length} questions in bank · 10 are randomly selected per assessment session
          </p>
        </>
      )}

      {tab === 'results'   && <ResultsTab results={results} loading={resultsLoading} source={resultsSource} onClear={() => setResults([])} />}
      {tab === 'analytics' && <AnalyticsTab results={results} loading={resultsLoading} />}
      {tab === 'settings'  && <SettingsTab />}
      {tab === 'hospitals' && adminHospitalId === null && <HospitalsTab />}
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ background: 'var(--color-bg-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: '20px 24px' }}>
      <p style={{ fontWeight: '700', fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px' }}>{title}</p>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function ActionBtn({ title, onClick, disabled, children }) {
  return (
    <button title={title} onClick={onClick} disabled={disabled} style={{ background: 'none', border: 'none', cursor: disabled ? 'default' : 'pointer', padding: '5px', borderRadius: '6px', opacity: disabled ? 0.3 : 1, display: 'flex', alignItems: 'center' }}>
      {children}
    </button>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const labelStyle = { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' };
const thStyle = { padding: '12px 16px', fontWeight: '600', fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'left' };
const tdStyle = { padding: '12px 16px', verticalAlign: 'middle' };
const btnStyle = (bg, color) => ({ display: 'inline-flex', alignItems: 'center', gap: '6px', background: bg, color, border: bg === 'var(--color-bg-light)' || bg === '#fee2e2' ? `1px solid ${color}44` : 'none', padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem', whiteSpace: 'nowrap' });
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--color-text-main)', background: 'var(--color-bg-white)', outline: 'none', boxSizing: 'border-box' };
