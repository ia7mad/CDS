import React, { useState, useEffect } from 'react';
import { getAllRawQuestions, saveAdminQuestions, resetQuestions } from '../data/questions';
import { Plus, Edit2, Trash2, Save, RotateCcw, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EMPTY_QUESTION = {
  id: '',
  itemName: { en: '', ar: '' },
  scenario: { en: '', ar: '' },
  explanation: { en: '', ar: '' },
  itemIcon: '',
  category: 'general',
  difficulty: 'beginner',
  correctBin: 'general',
  standard: ''
};

export default function AdminPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    // Load existing questions
    setQuestions(getAllRawQuestions());
  }, []);

  const handleSaveAll = () => {
    saveAdminQuestions(questions);
    alert('Changes saved locally! Refresh the quiz page to see them.');
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset to default questions? All your custom questions will be lost!")) {
      resetQuestions();
      setQuestions(getAllRawQuestions());
    }
  };

  const exportConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "questions_config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const openEditor = (q) => {
    setEditingId(q.id);
    setFormData(JSON.parse(JSON.stringify(q))); // deep copy
  };

  const openNew = () => {
    setEditingId('new');
    setFormData({ ...EMPTY_QUESTION, id: `q${Date.now()}` });
  };

  const deleteQuestion = (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const saveForm = () => {
    if (editingId === 'new') {
      setQuestions([...questions, formData]);
    } else {
      setQuestions(questions.map(q => q.id === editingId ? formData : q));
    }
    setEditingId(null);
    setFormData(null);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary-dark)' }}>Admin Dashboard</h2>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/')} style={btnStyle('var(--color-bg-light)', 'var(--color-text-main)')}>
            Back to App
          </button>
          <button onClick={handleReset} style={btnStyle('var(--color-danger)', 'white')}>
            <RotateCcw size={16} /> Reset Default
          </button>
          <button onClick={exportConfig} style={btnStyle('var(--color-secondary)', 'white')}>
            <Download size={16} /> Export JSON
          </button>
          <button onClick={handleSaveAll} style={btnStyle('var(--color-primary)', 'white')}>
            <Save size={16} /> Save Changes Locally
          </button>
        </div>
      </div>

      {editingId ? (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ marginBottom: '20px' }}>{editingId === 'new' ? 'Create New Question' : 'Edit Question'}</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>ID (Unique)</label>
              <input value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} style={inputStyle} disabled={editingId !== 'new'} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>Correct Bin</label>
              <select value={formData.correctBin} onChange={e => setFormData({...formData, correctBin: e.target.value})} style={inputStyle}>
                <option value="general">General</option>
                <option value="infectious">Infectious</option>
                <option value="sharps">Sharps</option>
                <option value="pharmaceutical">Pharmaceutical</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>Item Name (English)</label>
              <input value={formData.itemName.en} onChange={e => setFormData({...formData, itemName: {...formData.itemName, en: e.target.value}})} style={inputStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>Item Name (Arabic)</label>
              <input value={formData.itemName.ar} onChange={e => setFormData({...formData, itemName: {...formData.itemName, ar: e.target.value}})} style={inputStyle} dir="rtl" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
              <label>Scenario (English)</label>
              <textarea value={formData.scenario.en} onChange={e => setFormData({...formData, scenario: {...formData.scenario, en: e.target.value}})} style={{...inputStyle, height: '80px'}} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
              <label>Scenario (Arabic)</label>
              <textarea value={formData.scenario.ar} onChange={e => setFormData({...formData, scenario: {...formData.scenario, ar: e.target.value}})} style={{...inputStyle, height: '80px'}} dir="rtl" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
              <label>Explanation (English)</label>
              <textarea value={formData.explanation.en} onChange={e => setFormData({...formData, explanation: {...formData.explanation, en: e.target.value}})} style={{...inputStyle, height: '80px'}} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
              <label>Explanation (Arabic)</label>
              <textarea value={formData.explanation.ar} onChange={e => setFormData({...formData, explanation: {...formData.explanation, ar: e.target.value}})} style={{...inputStyle, height: '80px'}} dir="rtl" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>Image URL or Icon Name (e.g., 'syringe' or 'https://...')</label>
              <input value={formData.itemIcon} onChange={e => setFormData({...formData, itemIcon: e.target.value})} style={inputStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>Difficulty</label>
              <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} style={inputStyle}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
            <button onClick={saveForm} style={btnStyle('var(--color-primary)', 'white')}>Save Question</button>
            <button onClick={() => setEditingId(null)} style={btnStyle('var(--color-bg-light)', 'var(--color-text-main)')}>Cancel</button>
          </div>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>Questions Map</h3>
            <button onClick={openNew} style={{...btnStyle('var(--color-primary)', 'white'), padding: '6px 14px'}}>
              <Plus size={16} /> Add New
            </button>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-light)', color: 'var(--color-text-muted)' }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Name (EN)</th>
                <th style={thStyle}>Bin</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map(q => (
                <tr key={q.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={tdStyle}>{q.id}</td>
                  <td style={tdStyle}><strong>{q.itemName.en}</strong></td>
                  <td style={tdStyle}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', background: '#f1f5f9' }}>
                      {q.correctBin}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEditor(q)} style={iconBtnStyle}>
                        <Edit2 size={16} color="var(--color-primary)" />
                      </button>
                      <button onClick={() => deleteQuestion(q.id)} style={iconBtnStyle}>
                        <Trash2 size={16} color="var(--color-danger)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Inline styles
const thStyle = { padding: '16px 20px', fontWeight: '600', fontSize: '0.85rem' };
const tdStyle = { padding: '16px 20px', color: 'var(--color-text-main)' };
const btnStyle = (bg, color) => ({
  display: 'flex', alignItems: 'center', gap: '6px',
  background: bg, color, border: bg === 'var(--color-bg-light)' ? '1px solid var(--color-border)' : 'none',
  padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem'
});
const iconBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px'
};
const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', 
  fontFamily: 'inherit', fontSize: '0.9rem'
};
