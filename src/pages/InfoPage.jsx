import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, ArrowRight, BookOpen } from 'lucide-react';
import { getWasteCategories } from '../data/wasteCategories';

function CategoryCard({ cat, t }) {
  const [open, setOpen] = useState(false);
  const isRTL = document.dir === 'rtl';

  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      border: `2px solid ${cat.hexCode}44`,
      background: 'var(--color-bg-white)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '18px 20px',
          background: `${cat.hexCode}08`,
          border: 'none',
          cursor: 'pointer',
          textAlign: isRTL ? 'right' : 'left',
          flexDirection: isRTL ? 'row-reverse' : 'row'
        }}
      >
        <div style={{
          width: '60px',
          height: '60px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img 
            src={cat.imageUrl} 
            alt={t(`cat_${cat.id}_name`)} 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--color-text-main)', margin: 0 }}>
            {t(`cat_${cat.id}_name`)}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
            {t(`cat_${cat.id}_subtitle`)}
          </p>
        </div>
        {open ? <ChevronUp size={20} color="var(--color-text-muted)" /> : <ChevronDown size={20} color="var(--color-text-muted)" />}
      </button>

      {/* Body */}
      {open && (
        <div style={{ padding: '24px', borderTop: `1px solid ${cat.hexCode}22` }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.75, marginBottom: '20px' }}>
            {t(`cat_${cat.id}_desc`)}
          </p>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '24px', 
            marginBottom: '20px' 
          }}>
            {/* Examples */}
            <div>
              <p style={{ 
                fontWeight: '800', 
                fontSize: '0.8rem', 
                color: 'var(--color-text-main)', 
                marginBottom: '12px', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.hexCode }}></span>
                {t('examples')}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(t(`cat_${cat.id}_ex`, { returnObjects: true }) || []).map((ex, idx) => (
                  <li key={idx} style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--color-text-muted)', 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '8px' 
                  }}>
                    <span style={{ color: cat.hexCode, fontWeight: '700', flexShrink: 0 }}>•</span>
                    {ex}
                  </li>
                ))}
              </ul>
            </div>

            {/* Rules */}
            <div>
              <p style={{ 
                fontWeight: '800', 
                fontSize: '0.8rem', 
                color: 'var(--color-text-main)', 
                marginBottom: '12px', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }}></span>
                {t('keyRules')}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(t(`cat_${cat.id}_rules`, { returnObjects: true }) || []).map((rule, idx) => (
                  <li key={idx} style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--color-text-muted)', 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '8px' 
                  }}>
                    <span style={{ color: 'var(--color-success)', fontWeight: '700', flexShrink: 0 }}>✓</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ 
            marginTop: '16px', 
            padding: '10px 14px', 
            background: 'var(--color-bg-light)', 
            borderRadius: '6px',
            borderLeft: `3px solid ${cat.hexCode}`
          }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0 }}>
              📋 {t(`cat_${cat.id}_ref`)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InfoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const userInfo = location.state?.userInfo || (() => {
    const stored = sessionStorage.getItem('cds_user_info');
    return stored ? JSON.parse(stored) : null;
  })();

  if (!userInfo) return <Navigate to="/" replace />;

  const categories = useMemo(() => getWasteCategories(i18n.language), [i18n.language]);

  const principals = [
    { id: 1, icon: '🏷️' },
    { id: 2, icon: '🔒' },
    { id: 3, icon: '⚡' },
    { id: 4, icon: '📋' },
  ];

  const handleStartTest = () => {
    navigate('/quiz', { state: { userInfo } });
  };

  return (
    <div className="container" style={{ 
      maxWidth: '800px', 
      marginTop: '28px', 
      marginBottom: '60px',
      direction: isRTL ? 'rtl' : 'ltr'
    }}>
      {/* Header Section */}
      <div style={{
        background: 'var(--color-bg-white)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        padding: '32px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '20px',
        flexDirection: isRTL ? 'row-reverse' : 'row',
        textAlign: isRTL ? 'right' : 'left'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '12px',
          background: 'var(--color-primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <BookOpen size={32} color="var(--color-primary)" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--color-text-main)', marginBottom: '8px' }}>
            {t('medicalWasteGuide')}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.7 }}>
            {t('medicalWasteGuideSub')}
          </p>
        </div>
      </div>

      {/* Key Principles Grid */}
      <h3 style={{ 
        fontWeight: '800', 
        fontSize: '0.9rem', 
        color: 'var(--color-text-muted)', 
        marginBottom: '16px', 
        textTransform: 'uppercase', 
        letterSpacing: '0.05em',
        textAlign: isRTL ? 'right' : 'left'
      }}>
        {t('keyPrinciples')}
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px',
        marginBottom: '40px',
      }}>
        {principals.map(p => (
          <div key={p.id} style={{
            background: 'var(--color-bg-white)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start',
            flexDirection: isRTL ? 'row-reverse' : 'row',
            textAlign: isRTL ? 'right' : 'left'
          }}>
            <span style={{ fontSize: '1.75rem', lineHeight: 1, flexShrink: 0 }}>{p.icon}</span>
            <div>
              <p style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--color-text-main)', marginBottom: '6px' }}>
                {t(`principle${p.id}_title`)}
              </p>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                {t(`principle${p.id}_body`)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Categories Accordion */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
        <h3 style={{ 
          fontWeight: '800', 
          fontSize: '0.9rem', 
          color: 'var(--color-text-muted)', 
          margin: 0, 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em' 
        }}>
          {t('fourCategories')}
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: '700' }}>
          {t('clickToExpand')}
        </span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
        {categories.map(cat => <CategoryCard key={cat.id} cat={cat} t={t} />)}
      </div>

      {/* Start Test CTA */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
        borderRadius: 'var(--radius-lg)',
        padding: '40px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-lg)',
        color: 'white'
      }}>
        <h4 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '12px' }}>
          {t('readyToTest')}
        </h4>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
          {t('takeTestSub')}
        </p>
        <button
          onClick={handleStartTest}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 40px',
            background: 'white',
            color: 'var(--color-primary-dark)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: '900',
            fontSize: '1.1rem',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s',
            flexDirection: isRTL ? 'row-reverse' : 'row'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {t('startAssessment')}
          <ArrowRight size={22} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
        </button>
      </div>
    </div>
  );
}
