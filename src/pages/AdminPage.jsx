import React, { useState, useEffect, useRef } from 'react';
import { getAllRawQuestions, saveAdminQuestions, resetQuestions } from '../data/questions';
import { Plus, Edit2, Trash2, Save, RotateCcw, Download, Upload, X, Image, ArrowLeft, ArrowUp, ArrowDown, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  id: '',
  itemName:    { en: '', ar: '' },
  scenario:    { en: '', ar: '' },
  explanation: { en: '', ar: '' },
  itemIcon:    'syringe',
  imageUrl:    '',        // base64 or external URL
  category:    'general',
  difficulty:  'beginner',
  correctBin:  'general',
  standard:    '',
};

// ── Image picker sub-component ──────────────────────────────────────────────
function ImagePicker({ value, onChange }) {
  const [tab, setTab] = useState('upload'); // 'upload' | 'url'
  const [urlDraft, setUrlDraft] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const loadFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleFilePick = (e) => loadFile(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    loadFile(e.dataTransfer.files[0]);
  };
  const applyUrl = () => {
    if (urlDraft.trim()) onChange(urlDraft.trim());
  };
  const clear = () => { onChange(''); setUrlDraft(''); };

  const tabBtn = (key, label) => (
    <button
      onClick={() => setTab(key)}
      style={{
        padding: '6px 16px',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '0.82rem',
        background: tab === key ? 'var(--color-primary)' : 'var(--color-bg-light)',
        color: tab === key ? 'white' : 'var(--color-text-muted)',
      }}
    >
      {label}
    </button>
  );

  return (
    <div>
      <label style={labelStyle}>
        <Image size={13} /> Item Image
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'start' }}>
        {/* Left: controls */}
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            {tabBtn('upload', '📁 Upload File')}
            {tabBtn('url', '🔗 Paste URL')}
          </div>

          {tab === 'upload' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current.click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragOver ? 'rgba(13,148,136,0.05)' : 'var(--color-bg-light)',
                transition: 'all 0.15s',
              }}
            >
              <Upload size={24} color="var(--color-text-muted)" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Drag & drop an image here, or <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>click to browse</span>
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                PNG, JPG, WEBP · stored as base64 in browser
              </p>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFilePick} style={{ display: 'none' }} />
            </div>
          )}

          {tab === 'url' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={urlDraft}
                onChange={e => setUrlDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyUrl()}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={applyUrl}
                style={{
                  padding: '0 16px',
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  fontSize: '0.85rem',
                }}
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Right: preview */}
        <div style={{ position: 'relative', width: '90px', flexShrink: 0 }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            border: '2px solid var(--color-border)',
            background: 'var(--color-bg-light)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.2rem',
          }}>
            {value ? (
              <img src={value} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => onChange('')} />
            ) : (
              <span style={{ color: 'var(--color-border)', fontSize: '1.2rem' }}>
                <Image size={28} color="var(--color-border)" />
              </span>
            )}
          </div>
          {value && (
            <button
              onClick={clear}
              title="Remove image"
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: 'var(--color-danger)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              <X size={12} />
            </button>
          )}
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '4px' }}>Preview</p>
        </div>
      </div>
    </div>
  );
}

// ── Main AdminPage ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setQuestions(getAllRawQuestions()); }, []);

  // ── Helpers ──
  const set = (key, val) => setFormData(f => ({ ...f, [key]: val }));
  const setL10n = (key, lang, val) => setFormData(f => ({ ...f, [key]: { ...f[key], [lang]: val } }));

  // ── Actions ──
  const handleSaveAll = () => {
    saveAdminQuestions(questions);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
    const a = document.createElement('a');
    a.href = url; a.download = 'questions_config.json';
    a.click(); URL.revokeObjectURL(url);
  };

  const openEditor = (q) => { setEditingId(q.id); setFormData(JSON.parse(JSON.stringify(q))); };
  const openNew = () => { setEditingId('new'); setFormData({ ...EMPTY_QUESTION, id: `q${Date.now()}` }); };
  const duplicate = (q) => {
    const copy = { ...JSON.parse(JSON.stringify(q)), id: `q${Date.now()}` };
    setQuestions(qs => [...qs, copy]);
  };

  const deleteQuestion = (id) => {
    if (window.confirm('Delete this question?')) setQuestions(qs => qs.filter(q => q.id !== id));
  };

  const moveQuestion = (id, dir) => {
    setQuestions(qs => {
      const idx = qs.findIndex(q => q.id === id);
      const next = idx + dir;
      if (next < 0 || next >= qs.length) return qs;
      const a = [...qs];
      [a[idx], a[next]] = [a[next], a[idx]];
      return a;
    });
  };

  const saveForm = () => {
    if (!formData.itemName.en.trim()) { alert('Item name (English) is required.'); return; }
    if (!formData.scenario.en.trim()) { alert('Scenario (English) is required.'); return; }
    if (!formData.correctBin) { alert('Correct bin is required.'); return; }
    if (editingId === 'new') {
      setQuestions(qs => [...qs, formData]);
    } else {
      setQuestions(qs => qs.map(q => q.id === editingId ? formData : q));
    }
    setEditingId(null);
    setFormData(null);
  };

  // ── Editor ──────────────────────────────────────────────────────────────
  if (editingId) {
    return (
      <div style={{ maxWidth: '820px', margin: '32px auto', padding: '0 20px 60px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <ActionBtn title="Back" onClick={() => { setEditingId(null); setFormData(null); }}>
            <ArrowLeft size={18} color="var(--color-text-muted)" />
          </ActionBtn>
          <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-primary-dark)' }}>
            {editingId === 'new' ? 'New Question' : `Edit: ${formData.itemName.en || formData.id}`}
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ── Image ── */}
          <Section title="Item Image">
            <ImagePicker value={formData.imageUrl || ''} onChange={v => set('imageUrl', v)} />
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
              If no image is uploaded, the emoji fallback for the selected icon will be used.
            </p>
          </Section>

          {/* ── Identity ── */}
          <Section title="Identity">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="ID (auto-generated, read-only)">
                <input value={formData.id} style={{ ...inputStyle, opacity: 0.55 }} disabled />
              </Field>
              <Field label="Item Icon (emoji fallback key)">
                <select value={formData.itemIcon} onChange={e => set('itemIcon', e.target.value)} style={inputStyle}>
                  {Object.entries(EMOJI_MAP).map(([k, v]) => (
                    <option key={k} value={k}>{v} {k}</option>
                  ))}
                </select>
              </Field>
            </div>
          </Section>

          {/* ── Item Name ── */}
          <Section title="Item Name">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="English *">
                <input value={formData.itemName.en} onChange={e => setL10n('itemName', 'en', e.target.value)} style={inputStyle} placeholder="e.g. Used Syringe with Needle" />
              </Field>
              <Field label="Arabic">
                <input value={formData.itemName.ar} onChange={e => setL10n('itemName', 'ar', e.target.value)} style={{ ...inputStyle, direction: 'rtl', textAlign: 'right' }} placeholder="الاسم بالعربية" />
              </Field>
            </div>
          </Section>

          {/* ── Scenario ── */}
          <Section title="Scenario">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="English *">
                <textarea value={formData.scenario.en} onChange={e => setL10n('scenario', 'en', e.target.value)} style={{ ...inputStyle, height: '100px', resize: 'vertical' }} placeholder="Describe the situation the healthcare worker is in…" />
              </Field>
              <Field label="Arabic">
                <textarea value={formData.scenario.ar} onChange={e => setL10n('scenario', 'ar', e.target.value)} style={{ ...inputStyle, height: '100px', resize: 'vertical', direction: 'rtl', textAlign: 'right' }} placeholder="الموقف بالعربية…" />
              </Field>
            </div>
          </Section>

          {/* ── Classification ── */}
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
              <Field label="Category (internal tag)">
                <select value={formData.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
                  <option value="general">General</option>
                  <option value="infectious">Infectious</option>
                  <option value="sharps">Sharps</option>
                  <option value="pharmaceutical">Pharmaceutical</option>
                </select>
              </Field>
            </div>
          </Section>

          {/* ── Explanation ── */}
          <Section title="Explanation (shown after answer)">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="English *">
                <textarea value={formData.explanation.en} onChange={e => setL10n('explanation', 'en', e.target.value)} style={{ ...inputStyle, height: '110px', resize: 'vertical' }} placeholder="Why does this item go in that bin? Reference the relevant rule…" />
              </Field>
              <Field label="Arabic">
                <textarea value={formData.explanation.ar} onChange={e => setL10n('explanation', 'ar', e.target.value)} style={{ ...inputStyle, height: '110px', resize: 'vertical', direction: 'rtl', textAlign: 'right' }} placeholder="الشرح بالعربية…" />
              </Field>
            </div>
          </Section>

          {/* ── Standard ── */}
          <Section title="Reference Standard">
            <Field label="WHO Guideline / MOH Protocol reference">
              <input value={formData.standard} onChange={e => set('standard', e.target.value)} style={inputStyle} placeholder="e.g. WHO Guidelines Ch. 7, MOH Safety Protocol A.1" />
            </Field>
          </Section>

          {/* ── Live preview ── */}
          <Section title="Live Preview">
            <div style={{
              display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px',
              background: 'var(--color-bg-light)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)',
            }}>
              <div style={{
                width: '76px', height: '76px', flexShrink: 0, borderRadius: '50%',
                background: 'var(--color-bg-white)', border: '2px solid var(--color-border)',
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.2rem',
              }}>
                {formData.imageUrl
                  ? <img src={formData.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (EMOJI_MAP[formData.itemIcon] || '🗑️')
                }
              </div>
              <div>
                <p style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--color-text-main)', margin: 0 }}>
                  {formData.itemName.en || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Item name…</span>}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                  {formData.scenario.en?.substring(0, 80) || <span style={{ fontStyle: 'italic' }}>Scenario…</span>}
                  {formData.scenario.en?.length > 80 ? '…' : ''}
                </p>
                <span style={{
                  display: 'inline-block', marginTop: '6px', padding: '2px 10px',
                  background: BIN_COLORS[formData.correctBin] + '22', color: BIN_COLORS[formData.correctBin],
                  borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '700',
                  border: `1px solid ${BIN_COLORS[formData.correctBin]}44`,
                }}>
                  → {formData.correctBin}
                </span>
              </div>
            </div>
          </Section>

        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '28px' }}>
          <button onClick={saveForm} style={btnStyle('var(--color-primary)', 'white')}>
            <Save size={16} /> Save Question
          </button>
          <button onClick={() => { setEditingId(null); setFormData(null); }} style={btnStyle('var(--color-bg-light)', 'var(--color-text-main)')}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Question list ────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '1000px', margin: '32px auto', padding: '0 20px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', margin: 0 }}>Question Manager</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            {questions.length} questions · Changes saved in browser storage
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/')} style={btnStyle('var(--color-bg-light)', 'var(--color-text-main)')}>
            <ArrowLeft size={16} /> Back
          </button>
          <button onClick={handleReset} style={btnStyle('#fee2e2', 'var(--color-danger)')}>
            <RotateCcw size={16} /> Reset
          </button>
          <button onClick={exportJson} style={btnStyle('var(--color-bg-light)', 'var(--color-text-main)')}>
            <Download size={16} /> Export JSON
          </button>
          <button onClick={handleSaveAll} style={btnStyle(saved ? 'var(--color-success)' : 'var(--color-primary)', 'white')}>
            <Save size={16} /> {saved ? 'Saved ✓' : 'Save All'}
          </button>
          <button onClick={openNew} style={btnStyle('var(--color-primary)', 'white')}>
            <Plus size={16} /> Add Question
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--color-bg-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
        {questions.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No questions yet. <button onClick={openNew} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: 'inherit' }}>Add the first one →</button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-light)' }}>
                <th style={{ ...thStyle, width: '48px' }}>#</th>
                <th style={{ ...thStyle, width: '72px' }}>Image</th>
                <th style={thStyle}>Item Name</th>
                <th style={thStyle}>Scenario (excerpt)</th>
                <th style={{ ...thStyle, width: '130px' }}>Bin</th>
                <th style={{ ...thStyle, width: '100px' }}>Difficulty</th>
                <th style={{ ...thStyle, width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => (
                <tr key={q.id} style={{ borderTop: '1px solid var(--color-border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Order */}
                  <td style={{ ...tdStyle, color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{idx + 1}</td>

                  {/* Image */}
                  <td style={tdStyle}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      background: 'var(--color-bg-light)', border: '1px solid var(--color-border)',
                      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.4rem',
                    }}>
                      {q.imageUrl
                        ? <img src={q.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : (EMOJI_MAP[q.itemIcon] || '🗑️')
                      }
                    </div>
                  </td>

                  {/* Name */}
                  <td style={tdStyle}>
                    <p style={{ fontWeight: '700', margin: 0, fontSize: '0.9rem' }}>{q.itemName.en}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', direction: 'rtl', textAlign: 'right' }}>{q.itemName.ar}</p>
                  </td>

                  {/* Scenario */}
                  <td style={{ ...tdStyle, maxWidth: '260px' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {q.scenario.en}
                    </p>
                  </td>

                  {/* Bin */}
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '3px 10px', borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem', fontWeight: '700',
                      background: BIN_COLORS[q.correctBin] + '18',
                      color: BIN_COLORS[q.correctBin],
                      border: `1px solid ${BIN_COLORS[q.correctBin]}44`,
                    }}>
                      {q.correctBin}
                    </span>
                  </td>

                  {/* Difficulty */}
                  <td style={tdStyle}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {{ beginner: '🟢', intermediate: '🟡', advanced: '🔴' }[q.difficulty]} {q.difficulty}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <ActionBtn title="Move up" onClick={() => moveQuestion(q.id, -1)} disabled={idx === 0}>
                        <ArrowUp size={14} />
                      </ActionBtn>
                      <ActionBtn title="Move down" onClick={() => moveQuestion(q.id, 1)} disabled={idx === questions.length - 1}>
                        <ArrowDown size={14} />
                      </ActionBtn>
                      <ActionBtn title="Duplicate" onClick={() => duplicate(q)}>
                        <Copy size={14} color="var(--color-secondary)" />
                      </ActionBtn>
                      <ActionBtn title="Edit" onClick={() => openEditor(q)}>
                        <Edit2 size={14} color="var(--color-primary)" />
                      </ActionBtn>
                      <ActionBtn title="Delete" onClick={() => deleteQuestion(q.id)}>
                        <Trash2 size={14} color="var(--color-danger)" />
                      </ActionBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '16px', textAlign: 'center' }}>
        Click <strong>Save All</strong> after making changes. Changes persist in browser storage and are used immediately in the quiz.
      </p>
    </div>
  );
}

// ── Small helpers ────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ background: 'var(--color-bg-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: '20px 24px' }}>
      <p style={{ fontWeight: '700', fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px' }}>
        {title}
      </p>
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
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: 'none', border: 'none', cursor: disabled ? 'default' : 'pointer',
        padding: '5px', borderRadius: '6px', opacity: disabled ? 0.3 : 1,
        display: 'flex', alignItems: 'center',
      }}
    >
      {children}
    </button>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const labelStyle = {
  display: 'flex', alignItems: 'center', gap: '5px',
  fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};

const thStyle = { padding: '12px 16px', fontWeight: '600', fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'left' };
const tdStyle = { padding: '12px 16px', verticalAlign: 'middle' };

const btnStyle = (bg, color) => ({
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  background: bg, color,
  border: bg === 'var(--color-bg-light)' || bg === '#fee2e2' ? `1px solid ${color}44` : 'none',
  padding: '8px 16px', borderRadius: 'var(--radius-md)',
  cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem', whiteSpace: 'nowrap',
});

const inputStyle = {
  width: '100%', padding: '10px 14px',
  borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
  fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--color-text-main)',
  background: 'var(--color-bg-white)', outline: 'none', boxSizing: 'border-box',
};
