export const wasteCategories = [
  {
    id: 'general',
    name: 'General Waste',
    colorCode: 'black',
    hexCode: '#1E293B',
    description: 'Non-hazardous waste that does not pose any biological, chemical, or radioactive danger.',
    examples: ['Paper', 'Packaging', 'Food waste', 'Clean PPE'],
    icon: 'trash-2'
  },
  {
    id: 'infectious',
    name: 'Infectious Waste',
    colorCode: 'yellow',
    hexCode: '#EAB308',
    description: 'Waste suspected to contain pathogens in sufficient concentration to cause disease.',
    examples: ['Blood-soaked items', 'Cultures', 'Swabs', 'Used PPE'],
    icon: 'biohazard'
  },
  {
    id: 'sharps',
    name: 'Sharps / Biohazard',
    colorCode: 'red',
    hexCode: '#EF4444',
    description: 'Any item that can cause a cut or puncture wound and is potentially infectious.',
    examples: ['Needles', 'Scalpels', 'Broken ampoules', 'Lancets'],
    icon: 'syringe'
  },
  {
    id: 'pharmaceutical',
    name: 'Pharmaceutical Waste',
    colorCode: 'blue',
    hexCode: '#3B82F6',
    description: 'Expired, unused, split, and contaminated pharmaceutical products.',
    examples: ['Expired drugs', 'Vaccines', 'Bottles with residues'],
    icon: 'pill'
  }
];
