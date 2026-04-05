import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import QuizPage from './pages/QuizPage';
import InfoPage from './pages/InfoPage';
import AdminPage from './pages/AdminPage';
import Logo from './components/Logo';
import { BookOpen, ClipboardCheck, User, Hash, Building2 } from 'lucide-react';

const DEPARTMENTS = [
  'emergency', 'icu', 'operating', 'general', 'pediatrics', 
  'oncology', 'radiology', 'laboratory', 'pharmacy', 
  'outpatient', 'other'
];

function Navbar() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  const toggleLang = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <nav style={{
      padding: '14px 24px',
      backgroundColor: 'var(--color-bg-white)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <Logo size={32} showText={true} />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {isLanding && (
          <button
            onClick={toggleLang}
            style={{
              padding: '7px 16px',
              background: 'var(--color-bg-light)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {i18n.language === 'en' ? 'العربية' : 'English'}
          </button>
        )}
      </div>
    </nav>
  );
}

function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', profileNumber: '', department: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t('nameRequired');
    if (!form.profileNumber.trim()) e.profileNumber = t('profileRequired');
    if (!form.department) e.department = t('deptRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const go = (path) => {
    if (!validate()) return;
    sessionStorage.setItem('cds_user_info', JSON.stringify(form));
    navigate(path, { state: { userInfo: form } });
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm(f => ({ ...f, [key]: e.target.value }));
      if (errors[key]) setErrors(er => ({ ...er, [key]: undefined }));
    },
  });

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${hasError ? 'var(--color-danger)' : 'var(--color-border)'}`,
    fontSize: '0.9rem',
    color: 'var(--color-text-main)',
    background: 'var(--color-bg-white)',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  });

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.82rem',
    fontWeight: '600',
    color: 'var(--color-text-muted)',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  return (
    <div className="container" style={{ maxWidth: '580px', padding: '40px 20px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Logo size={80} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-text-main)', marginBottom: '10px' }}>
          {t('landingHeroTitle')}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: 1.65, maxWidth: '440px', margin: '0 auto' }}>
          {t('landingHeroSub')}
        </p>
      </div>

      {/* User info form */}
      <div style={{
        background: 'var(--color-bg-white)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        padding: '28px',
        marginBottom: '20px',
      }}>
        <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--color-text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={16} color="var(--color-primary)" />
          {t('userInfoTitle')}
        </p>

        {/* Name */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>
            <User size={13} />
            {t('fullName')}
          </label>
          <input
            type="text"
            placeholder={t('fullName')}
            style={inputStyle(!!errors.name)}
            {...field('name')}
          />
          {errors.name && <p style={{ fontSize: '0.78rem', color: 'var(--color-danger)', marginTop: '4px' }}>{errors.name}</p>}
        </div>

        {/* Profile Number */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>
            <Hash size={13} />
            {t('profileNumber')}
          </label>
          <input
            type="text"
            placeholder={t('profileNumber')}
            style={inputStyle(!!errors.profileNumber)}
            {...field('profileNumber')}
          />
          {errors.profileNumber && <p style={{ fontSize: '0.78rem', color: 'var(--color-danger)', marginTop: '4px' }}>{errors.profileNumber}</p>}
        </div>

        {/* Department */}
        <div>
          <label style={labelStyle}>
            <Building2 size={13} />
            {t('department')}
          </label>
          <select
            style={{ ...inputStyle(!!errors.department), cursor: 'pointer' }}
            value={form.department}
            onChange={(e) => {
              setForm(f => ({ ...f, department: e.target.value }));
              if (errors.department) setErrors(er => ({ ...er, department: undefined }));
            }}
          >
            <option value="">{t('selectDepartment')}</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{t(`dept_${d}`)}</option>)}
          </select>
          {errors.department && <p style={{ fontSize: '0.78rem', color: 'var(--color-danger)', marginTop: '4px' }}>{errors.department}</p>}
        </div>
      </div>

      {/* Two action buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {/* Learn option */}
        <button
          onClick={() => go('/learn')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            padding: '22px 16px',
            background: 'var(--color-bg-white)',
            border: '2px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
        >
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: 'rgba(13,148,136,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={24} color="var(--color-primary)" />
          </div>
          <div>
            <p style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--color-text-main)', margin: 0 }}>
              {t('readFirst')}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '4px 0 0', lineHeight: 1.4 }}>
              {t('readFirstSub')}
            </p>
          </div>
        </button>

        {/* Take test option */}
        <button
          onClick={() => go('/quiz')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            padding: '22px 16px',
            background: 'var(--color-primary)',
            border: '2px solid var(--color-primary)',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-dark)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary)'}
        >
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ClipboardCheck size={24} color="white" />
          </div>
          <div>
            <p style={{ fontWeight: '700', fontSize: '0.92rem', color: 'white', margin: 0 }}>
              {t('takeTest')}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)', margin: '4px 0 0', lineHeight: 1.4 }}>
              {t('takeTestSub')}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '0 0 40px' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/learn" element={<InfoPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
