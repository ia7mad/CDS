import { useState, useEffect } from 'react';
import { syncPendingResults, getHospitalQuestionsFromDb, getHospitalConfigFromDb } from './lib/db';
import { saveAdminQuestions, getAllRawQuestions, resolveImageUrl } from './data/questions';
import { HOSPITAL_ID } from './lib/supabase';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import QuizPage from './pages/QuizPage';
import InfoPage from './pages/InfoPage';
import AdminPage from './pages/AdminPage';
import Logo from './components/Logo';
import { BookOpen, ClipboardCheck, User, Hash, Building2, Award, Clock, FileCheck } from 'lucide-react';

const DEPARTMENTS = [
  'emergency', 'icu', 'operating', 'general', 'pediatrics',
  'oncology', 'radiology', 'laboratory', 'pharmacy',
  'outpatient', 'other'
];

function Navbar() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const toggleLang = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <nav style={{
      padding: '14px 24px',
      background: 'rgba(255, 255, 255, 0.4)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <Logo size={32} showText={true} />
      </div>
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
    </nav>
  );
}

function Footer({ hospitalName }) {
  const { t } = useTranslation();
  return (
    <footer style={{
      borderTop: '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.4)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      padding: '16px 24px',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.8 }}>
        {hospitalName && <><strong style={{ color: 'var(--color-text-main)' }}>{hospitalName}</strong> · </>}
        {t('footerRef')} · {t('footerVersion')}
      </p>
    </footer>
  );
}

function LandingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  const [form, setForm] = useState(() => {
    const saved = sessionStorage.getItem('cds_user_info');
    return saved ? JSON.parse(saved) : { name: '', profileNumber: '', department: '' };
  });
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
    border: `1px solid ${hasError ? 'var(--color-danger)' : 'rgba(255,255,255,0.6)'}`,
    fontSize: '0.92rem',
    color: 'var(--color-text-main)',
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(4px)',
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

  const programHighlights = [
    { icon: <FileCheck size={20} color="var(--color-primary)" />, label: t('programQuestions') },
    { icon: <Clock size={20} color="var(--color-primary)" />,     label: t('programTime') },
    { icon: <Award size={20} color="var(--color-primary)" />,     label: t('programCertificate') },
  ];

  return (
    <div className="container" style={{ maxWidth: '580px', padding: '40px 20px', direction: isRTL ? 'rtl' : 'ltr' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Logo size={80} />
        </div>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--color-primary-dark)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          {t('landingHeroTitle')}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: 1.65, maxWidth: '440px', margin: '0 auto' }}>
          {t('landingHeroSub')}
        </p>
      </div>

      {/* Program intro highlights */}
      <div className="glass-panel" style={{
        borderRadius: 'var(--radius-lg)',
        padding: '20px 26px',
        marginBottom: '20px',
      }}>
        <p style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
          {t('programTitle')}
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '14px' }}>
          {t('programDesc')}
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {programHighlights.map(({ icon, label }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px',
              background: 'rgba(13,148,136,0.07)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-primary)',
            }}>
              {icon} {label}
            </div>
          ))}
        </div>
      </div>

      {/* User info form */}
      <div className="glass-panel" style={{
        borderRadius: 'var(--radius-lg)',
        padding: '30px 28px',
        marginBottom: '24px',
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
          <input type="text" placeholder={t('fullName')} style={inputStyle(!!errors.name)} {...field('name')} />
          {errors.name && <p style={{ fontSize: '0.78rem', color: 'var(--color-danger)', marginTop: '4px' }}>{errors.name}</p>}
        </div>

        {/* Profile Number */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>
            <Hash size={13} />
            {t('profileNumber')}
          </label>
          <input type="text" placeholder={t('profileNumber')} style={inputStyle(!!errors.profileNumber)} {...field('profileNumber')} />
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
        <button
          onClick={() => go('/learn')}
          className="glass-panel"
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
            padding: '22px 16px',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer', textAlign: 'center',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.07)'; }}
        >
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={24} color="var(--color-primary)" />
          </div>
          <div>
            <p style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--color-text-main)', margin: 0 }}>{t('readFirst')}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '4px 0 0', lineHeight: 1.4 }}>{t('readFirstSub')}</p>
          </div>
        </button>

        <button
          onClick={() => {
            if (typeof window !== 'undefined' && window.sensoryInit) window.sensoryInit();
            go('/quiz');
          }}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
            padding: '22px 16px', 
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
            border: 'none', borderRadius: 'var(--radius-lg)',
            cursor: 'pointer', textAlign: 'center', boxShadow: '0 8px 20px -4px rgba(13, 148, 136, 0.5)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 24px -4px rgba(13, 148, 136, 0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(13, 148, 136, 0.5)'; }}
        >
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardCheck size={24} color="white" />
          </div>
          <div>
            <p style={{ fontWeight: '700', fontSize: '0.92rem', color: 'white', margin: 0 }}>{t('takeTest')}</p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)', margin: '4px 0 0', lineHeight: 1.4 }}>{t('takeTestSub')}</p>
          </div>
        </button>
      </div>
    </div>
  );
}

function preloadImageUrls(urls) {
  urls.forEach(url => {
    if (!url) return;
    const img = new window.Image();
    img.src = resolveImageUrl(url);
  });
}

function App() {
  // Initialise from localStorage so the footer shows instantly on repeat visits,
  // then overwrite with whatever the cloud config says.
  const [hospitalName, setHospitalName] = useState(
    () => localStorage.getItem('cds_hospital_name') || ''
  );

  useEffect(() => {
    // 1. Preload bin images immediately — these appear on every quiz question
    preloadImageUrls([
      'items/bin_general.png',
      'items/bin_infectious.png',
      'items/bin_sharps.png',
      'items/bin_pharmaceutical.png',
    ]);

    // 2. Preload question item images from local bank immediately (no network wait)
    preloadImageUrls(getAllRawQuestions().map(q => q.imageUrl));

    // 3. Retry offline results + sync cloud question bank in the background
    syncPendingResults();
    async function syncCloudBank() {
      const cloudBank = await getHospitalQuestionsFromDb(HOSPITAL_ID);
      if (cloudBank) {
        saveAdminQuestions(cloudBank);
        preloadImageUrls(cloudBank.map(q => q.imageUrl));
      }
    }
    syncCloudBank();

    // 4. Load hospital display name from cloud — updates footer reactively
    getHospitalConfigFromDb(HOSPITAL_ID).then(cfg => {
      if (cfg?.hospital_name) {
        localStorage.setItem('cds_hospital_name', cfg.hospital_name);
        setHospitalName(cfg.hospital_name);
      }
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '0 0 40px' }}>
        <Routes>
          <Route path="/"      element={<LandingPage />} />
          <Route path="/learn" element={<InfoPage />} />
          <Route path="/quiz"  element={<QuizPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*"      element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer hospitalName={hospitalName} />
    </div>
  );
}

export default App;
