const BASE = import.meta.env.BASE_URL;

export const resolveImageUrl = (url) => {
  if (!url) return '';
  if (/^(https?:|data:)/.test(url)) return url;
  const clean = url.replace(/^\/CDS\//, '/');
  return BASE + clean.replace(/^\//, '');
};

export const wasteCategoriesData = [
  {
    id: 'general',
    name: { en: 'General Waste', ar: 'نفايات عامة' },
    colorCode: 'black',
    hexCode: '#1E293B',
    imageUrl: 'items/bin_general.png',
    description: {
      en: 'Non-hazardous waste that does not pose any biological, chemical, or radioactive danger.',
      ar: 'نفايات غير خطرة ولا تشكل أي خطر بيولوجي أو كيميائي أو إشعاعي.'
    },
    examples: {
      en: ['Paper', 'Packaging', 'Food waste', 'Clean PPE'],
      ar: ['ورق', 'تغليف', 'بقايا طعام', 'معدات وقاية نظيفة']
    },
    icon: 'trash-2'
  },
  {
    id: 'infectious',
    name: { en: 'Infectious Waste', ar: 'نفايات معدية' },
    colorCode: 'yellow',
    hexCode: '#EAB308',
    imageUrl: 'items/bin_infectious.png',
    description: {
      en: 'Waste suspected to contain pathogens in sufficient concentration to cause disease.',
      ar: 'نفايات يُشتبه في احتوائها على مسببات الأمراض بتركيز يكفي لتسبيب الأمراض.'
    },
    examples: {
      en: ['Blood-soaked items', 'Cultures', 'Swabs', 'Used PPE'],
      ar: ['عناصر مشبعة بالدم', 'مزارع بكتيرية', 'مسحات', 'معدات وقاية مستعملة']
    },
    icon: 'biohazard'
  },
  {
    id: 'sharps',
    name: { en: 'Sharps / Biohazard', ar: 'أدوات حادة / خطر بيولوجي' },
    colorCode: 'red',
    hexCode: '#EF4444',
    imageUrl: 'items/bin_sharps.png',
    description: {
      en: 'Any item that can cause a cut or puncture wound and is potentially infectious.',
      ar: 'أي عنصر يمكن أن يسبب جرحاً أو ثقباً ومن المحتمل أن يكون معدياً.'
    },
    examples: {
      en: ['Needles', 'Scalpels', 'Broken ampoules', 'Lancets'],
      ar: ['إبر', 'مشارط', 'أمبولات زجاجية مكسورة', 'مشارط دقيقة']
    },
    icon: 'syringe'
  },
  {
    id: 'pharmaceutical',
    name: { en: 'Pharmaceutical Waste', ar: 'نفايات صيدلانية' },
    colorCode: 'blue',
    hexCode: '#3B82F6',
    imageUrl: 'items/bin_pharmaceutical.png',
    description: {
      en: 'Expired, unused, split, and contaminated pharmaceutical products.',
      ar: 'منتجات صيدلانية منتهية الصلاحية، غير مستخدمة، مسكوبة، وملوثة.'
    },
    examples: {
      en: ['Expired drugs', 'Vaccines', 'Bottles with residues'],
      ar: ['أدوية منتهية الصلاحية', 'لقاحات', 'زجاجات بها بقايا']
    },
    icon: 'pill'
  }
];

export const getWasteCategories = (lang = 'en') => {
  return wasteCategoriesData.map(cat => ({
    ...cat,
    name: cat.name[lang] || cat.name.en,
    description: cat.description[lang] || cat.description.en,
    examples: cat.examples[lang] || cat.examples.en,
    imageUrl: resolveImageUrl(cat.imageUrl),
  }));
};
