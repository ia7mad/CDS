import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowRight, BookOpen } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'general',
    color: '#1E293B',
    lightColor: '#1E293B18',
    emoji: '🗑️',
    name: 'General Waste (Black Bin)',
    subtitle: 'Non-hazardous, non-infectious waste',
    description:
      'General waste makes up the majority of healthcare waste — roughly 75–90%. It includes items that have not come into contact with blood, body fluids, or hazardous chemicals. This waste is treated the same as municipal solid waste.',
    examples: [
      'Packaging materials (wrappers, boxes)',
      'Clean gloves not exposed to body fluids',
      'Food waste and patient meal containers',
      'Paper, cardboard, administrative waste',
      'Empty IV bags containing basic fluids (D5W, Normal Saline)',
    ],
    rules: [
      'Never contaminate with infectious material',
      'Do not mix with sharps or pharmaceutical waste',
      'Standard black bag — municipal disposal pathway',
    ],
    reference: 'WHO Guidelines Ch. 4 — Non-hazardous Healthcare Waste',
  },
  {
    id: 'infectious',
    color: '#EAB308',
    lightColor: '#EAB30818',
    emoji: '⚠️',
    name: 'Infectious Waste (Yellow Bin)',
    subtitle: 'Waste containing pathogens in quantities sufficient to cause disease',
    description:
      'Infectious waste poses a biological risk to healthcare workers, patients, and the public. It includes anything contaminated with blood, body fluids, secretions, or excretions (other than sweat), as well as materials from isolation wards.',
    examples: [
      'Blood-soaked gauze, swabs, or dressings',
      'Cultures and stocks of infectious agents',
      'PPE worn during care for infectious patients (TB, COVID, etc.)',
      'Contaminated N95 masks and face shields',
      'Tissues and anatomical waste',
    ],
    rules: [
      'Segregate at the point of generation',
      'Double-bag for highly infectious material',
      'Yellow bag — must be treated before final disposal (autoclave, incineration)',
      'Label clearly with biohazard symbol',
    ],
    reference: 'WHO Guidelines Ch. 4.2 — Infectious and Pathological Waste',
  },
  {
    id: 'sharps',
    color: '#EF4444',
    lightColor: '#EF444418',
    emoji: '🔴',
    name: 'Sharps / Biohazard (Red Bin)',
    subtitle: 'Any item that can cause a cut or puncture wound',
    description:
      'Sharps are one of the most hazardous categories of healthcare waste. Even if the item contained only sterile or non-infectious material (e.g., saline), it is still classified as sharps waste because of its ability to cause injury and potential infection.',
    examples: [
      'Used and unused needles and syringes',
      'Scalpel blades after surgical procedures',
      'Broken glass ampoules (regardless of contents)',
      'Lancets and blood glucose test needles',
      'IV catheters and cannulas',
    ],
    rules: [
      'Dispose immediately at point of use — never recap needles',
      'Puncture-proof, leak-proof red sharps container',
      'Never fill above ¾ full',
      'Incineration is the preferred final disposal method',
    ],
    reference: 'WHO Guidelines Ch. 7 — Sharps Waste Management',
  },
  {
    id: 'pharmaceutical',
    color: '#3B82F6',
    lightColor: '#3B82F618',
    emoji: '💊',
    name: 'Pharmaceutical Waste (Blue Bin)',
    subtitle: 'Expired, unused, or contaminated pharmaceutical products',
    description:
      'Pharmaceutical waste includes drugs, vaccines, and related substances that are expired, unused, contaminated, or no longer needed. Improper disposal of pharmaceutical waste can contaminate water supplies and contribute to antimicrobial resistance.',
    examples: [
      'Expired medications and vaccines',
      'Partially used antibiotic vials',
      'Unused or excess chemotherapy drugs (cytotoxic)',
      'Bottles and ampoules with pharmaceutical residues',
      'Contaminated pharmaceutical packaging',
    ],
    rules: [
      'Never flush medications down the drain',
      'Cytotoxic drugs require separate handling — extremely hazardous',
      'Blue container — dedicated pharmaceutical waste stream',
      'Return unused drugs to pharmacy when possible',
    ],
    reference: 'WHO Guidelines Ch. 4.3 — Pharmaceutical Waste',
  },
];

const KEY_PRINCIPLES = [
  {
    icon: '🏷️',
    title: 'Segregate at the Source',
    body: 'Waste must be sorted into the correct bin at the exact point where it is generated — the bedside, operating table, or treatment area. Never mix waste categories after the fact.',
  },
  {
    icon: '🔒',
    title: 'Color Coding is Mandatory',
    body: 'Each waste category has a designated color. Black = General, Yellow = Infectious, Red = Sharps, Blue = Pharmaceutical. The color of the bin is not a suggestion — it is a regulatory requirement.',
  },
  {
    icon: '⚡',
    title: 'Sharps: Immediate Disposal',
    body: 'Used sharps must be placed in the sharps container immediately after use. Never recap needles using two hands. Needle-stick injuries are the leading cause of bloodborne pathogen exposure in healthcare settings.',
  },
  {
    icon: '📋',
    title: 'When in Doubt, Treat as Infectious',
    body: 'If you are unsure whether an item is infectious or general waste, default to the infectious waste (yellow) bin. Over-segregation is safer than under-segregation.',
  },
];

function CategoryCard({ cat }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      border: `2px solid ${cat.color}44`,
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
          gap: '14px',
          padding: '18px 20px',
          background: cat.lightColor,
          border: 'none',
          cursor: 'pointer',
          textAlign: 'start',
        }}
      >
        <div style={{
          width: '48px',
          height: '58px',
          flexShrink: 0,
          background: cat.color,
          borderRadius: '6px 6px 4px 4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
        }}>
          {cat.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--color-text-main)', margin: 0 }}>{cat.name}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>{cat.subtitle}</p>
        </div>
        {open ? <ChevronUp size={20} color="var(--color-text-muted)" /> : <ChevronDown size={20} color="var(--color-text-muted)" />}
      </button>

      {/* Body */}
      {open && (
        <div style={{ padding: '20px', borderTop: `1px solid ${cat.color}33` }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '16px' }}>
            {cat.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {/* Examples */}
            <div>
              <p style={{ fontWeight: '700', fontSize: '0.82rem', color: 'var(--color-text-main)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Examples
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {cat.examples.map(ex => (
                  <li key={ex} style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span style={{ color: cat.color, fontWeight: '700', flexShrink: 0 }}>•</span>
                    {ex}
                  </li>
                ))}
              </ul>
            </div>

            {/* Rules */}
            <div>
              <p style={{ fontWeight: '700', fontSize: '0.82rem', color: 'var(--color-text-main)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Key Rules
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {cat.rules.map(rule => (
                  <li key={rule} style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span style={{ color: 'var(--color-success)', fontWeight: '700', flexShrink: 0 }}>✓</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            📋 {cat.reference}
          </p>
        </div>
      )}
    </div>
  );
}

export default function InfoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = location.state?.userInfo;

  const handleStartTest = () => {
    navigate('/quiz', { state: { userInfo } });
  };

  return (
    <div className="container" style={{ maxWidth: '760px', marginTop: '28px', marginBottom: '60px' }}>
      {/* Header */}
      <div style={{
        background: 'var(--color-bg-white)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        padding: '28px 32px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
      }}>
        <BookOpen size={36} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-text-main)', marginBottom: '6px' }}>
            Medical Waste Disposal Guide
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.65 }}>
            Based on WHO Healthcare Waste Management Guidelines. Read through the four waste categories, their examples, and disposal rules before taking the assessment.
          </p>
        </div>
      </div>

      {/* Key principles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}>
        {KEY_PRINCIPLES.map(p => (
          <div key={p.title} style={{
            background: 'var(--color-bg-white)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '1.5rem', lineHeight: 1, flexShrink: 0 }}>{p.icon}</span>
            <div>
              <p style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--color-text-main)', marginBottom: '4px' }}>{p.title}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{p.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category cards */}
      <p style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        The Four Waste Categories — click to expand
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {CATEGORIES.map(cat => <CategoryCard key={cat.id} cat={cat} />)}
      </div>

      {/* Start test CTA */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginBottom: '16px' }}>
          Ready to test your knowledge? You have <strong>10 seconds</strong> per question.
        </p>
        <button
          onClick={handleStartTest}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 32px',
            background: 'white',
            color: 'var(--color-primary-dark)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800',
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          Start Assessment
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
