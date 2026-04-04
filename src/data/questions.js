export const DEFAULT_QUESTIONS = [
  {
    id: 'q1',
    scenario: {
      en: 'You just finished drawing blood from a patient. You are holding the used needle attached to the syringe.',
      ar: 'لقد انتهيت للتو من سحب عينة دم من مريض. أنت تحمل الإبرة المستعملة المرفقة بالحقنة.'
    },
    itemName: { en: 'Used Syringe with Needle', ar: 'حقنة مستعملة مع إبرة' },
    itemIcon: 'syringe',
    category: 'sharps',
    difficulty: 'beginner',
    correctBin: 'sharps',
    explanation: {
      en: 'All sharp objects, especially those contaminated with blood or body fluids, must be disposed of immediately in a puncture-proof red Sharps container to prevent needle-stick injuries.',
      ar: 'يجب التخلص من جميع الأشياء الحادة، وخاصة تلك الملوثة بالدم أو سوائل الجسم، على الفور في حاوية الأدوات الحادة الحمراء المقاومة للثقب لمنع إصابات الوخز بالإبرة.'
    },
    standard: 'WHO Guidelines Ch. 7, MOH Safety Protocol A.1'
  },
  {
    id: 'q2',
    scenario: {
      en: 'You are discarding the plastic wrapper of a new, sterile IV line that has not touched the patient.',
      ar: 'أنت تتخلص من الغلاف البلاستيكي لأنبوب وريدي جديد ومعقم لم يلامس المريض.'
    },
    itemName: { en: 'Clean Plastic Wrapper', ar: 'غلاف بلاستيكي نظيف' },
    itemIcon: 'package',
    category: 'general',
    difficulty: 'beginner',
    correctBin: 'general',
    explanation: {
      en: 'Packaging materials that have not come into contact with body fluids or hazardous chemicals are considered general non-hazardous waste (Black bin).',
      ar: 'تعتبر مواد التغليف التي لم تتلامس مع سوائل الجسم أو المواد الكيميائية الخطرة نفايات عامة غير خطرة وتوضع في (الحاوية السوداء).'
    },
    standard: 'WHO Guidelines Ch. 4'
  },
  {
    id: 'q3',
    scenario: {
      en: 'A gauze pad is heavily soaked with blood after stopping a hemorrhage.',
      ar: 'توجد ضمادة شاش مشبعة بشدة بالدم بعد إيقاف نزيف مريض.'
    },
    itemName: { en: 'Blood-Soaked Gauze', ar: 'ضمادة شاش مشبعة بالدم' },
    itemIcon: 'droplets',
    category: 'infectious',
    difficulty: 'beginner',
    correctBin: 'infectious',
    explanation: {
      en: 'Materials heavily saturated or dripping with blood or body fluids are highly infectious and must be placed in a yellow infectious waste bag.',
      ar: 'تعتبر المواد المشبعة أو التي تقطر دماً أو سوائل جسمانية معدية بشدة ويجب وضعها في كيس النفايات المعدية (الأصفر).'
    },
    standard: 'WHO Guidelines Ch. 4.2'
  },
  {
    id: 'q4',
    scenario: {
      en: 'You are disposing of a vial containing a partially used, non-hazardous antibiotic.',
      ar: 'أنت تتخلص من قارورة تحتوي على مضاد حيوي غير خطر ومستخدم جزئياً.'
    },
    itemName: { en: 'Partially Used Antibiotic Vial', ar: 'قارورة مضاد حيوي مستخدمة جزئياً' },
    itemIcon: 'pill',
    category: 'pharmaceutical',
    difficulty: 'intermediate',
    correctBin: 'pharmaceutical',
    explanation: {
      en: 'Expired or unused pharmaceutical products should be disposed of in designated pharmaceutical waste containers (Blue) to prevent environmental contamination.',
      ar: 'يجب التخلص من المنتجات الصيدلانية منتهية الصلاحية أو غير المستخدمة في حاويات النفايات الصيدلانية المخصصة (الزرقاء) لمنع التلوث البيئي.'
    },
    standard: 'WHO Guidelines Ch. 4.3'
  },
  {
    id: 'q5',
    scenario: {
      en: 'You just took off your gloves after performing a routine, non-invasive physical exam (no body fluids encountered).',
      ar: 'لقد خلعت قفازاتك للتو بعد إجراء فحص بدني روتيني غير جراحي (لم يتم مواجهة أي سوائل جسدية).'
    },
    itemName: { en: 'Used Exam Gloves (No Fluids)', ar: 'قفازات فحص مستعملة (بدون سوائل)' },
    itemIcon: 'hand',
    category: 'general',
    difficulty: 'intermediate',
    correctBin: 'general',
    explanation: {
      en: 'Gloves used for routine exams without coming into contact with blood or body fluids should be disposed of as general waste (Black bin).',
      ar: 'تعتبر القفازات المستخدمة في الفحوصات الروتينية دون ملامسة الدم أو سوائل الجسم نفايات عامة توضع في (الحاوية السوداء).'
    },
    standard: 'WHO Guidelines Ch. 4'
  },
  {
    id: 'q6',
    scenario: {
      en: 'You have a broken glass ampoule that contained normal saline.',
      ar: 'لديك أمبولة زجاجية مكسورة كانت تحتوي على محلول ملحي عادي.'
    },
    itemName: { en: 'Broken Glass Ampoule', ar: 'أمبولة زجاجية مكسورة' },
    itemIcon: 'glass-water',
    category: 'sharps',
    difficulty: 'advanced',
    correctBin: 'sharps',
    explanation: {
      en: 'Even if the contents were not infectious or hazardous (like saline), broken glass is still a sharp object and must go into the puncture-proof sharps container.',
      ar: 'حتى لو لم تكن المحتويات معدية أو خطيرة (مثل المحلول الملحي)، يظل الزجاج المكسور أداة حادة ويجب وضعه في حاوية الأدوات الحادة المقاومة للثقب.'
    },
    standard: 'WHO Guidelines Ch. 7'
  },
  {
    id: 'q7',
    scenario: {
      en: 'A patient leaves behind an uneaten apple and a styrofoam cup from their lunch.',
      ar: 'ترك المريض تفاحة لم تؤكل وكوباً من الستايروفوم من غدائه.'
    },
    itemName: { en: 'Food Waste', ar: 'بقايا طعام' },
    itemIcon: 'apple',
    category: 'general',
    difficulty: 'beginner',
    correctBin: 'general',
    explanation: {
      en: 'Food waste and patient meal containers are general waste (Black bin) unless from a highly infectious isolation ward.',
      ar: 'تعتبر بقايا الطعام وحاويات وجبات المرضى نفايات عامة (الحاوية السوداء) ما لم تكن من جناح عزل شديد العدوى.'
    },
    standard: 'WHO Guidelines Ch. 4'
  },
  {
    id: 'q8',
    scenario: {
      en: 'You are disposing of a face mask worn during care for an infectious TB patient.',
      ar: 'أنت تتخلص من قناع وجه (كمامة) تم ارتداؤه أثناء رعاية مريض سُل معدٍ.'
    },
    itemName: { en: 'Contaminated N95 Mask', ar: 'كمامة N95 ملوثة' },
    itemIcon: 'shield-alert',
    category: 'infectious',
    difficulty: 'intermediate',
    correctBin: 'infectious',
    explanation: {
      en: 'PPE worn while caring for patients with highly infectious airborne diseases must be discarded as infectious waste (Yellow bin).',
      ar: 'يجب التخلص من معدات الوقاية الشخصية المستخدمة أثناء رعاية المرضى الذين يعانون من أمراض شديدة العدوى تنتقل عن طريق الهواء على أنها نفايات معدية (الحاوية الصفراء).'
    },
    standard: 'WHO Guidelines Ch. 4.2'
  },
  {
    id: 'q9',
    scenario: {
      en: 'You are discarding a scalpel blade after a minor surgical procedure.',
      ar: 'أنت تتخلص من شفرة مشرط بعد إجراء عملية جراحية بسيطة.'
    },
    itemName: { en: 'Used Scalpel Blade', ar: 'شفرة مشرط مستعملة' },
    itemIcon: 'scissors',
    category: 'sharps',
    difficulty: 'beginner',
    correctBin: 'sharps',
    explanation: {
      en: 'Scalpel blades are extremely sharp and biologically contaminated. They must go directly into the red sharps container.',
      ar: 'شفرات المشرط حادة للغاية وملوثة بيولوجياً. يجب وضعها مباشرة في حاوية الأدوات الحادة المقاومة للثقب (الحمراء).'
    },
    standard: 'WHO Guidelines Ch. 7'
  },
  {
    id: 'q10',
    scenario: {
      en: 'An empty IV bag that contained 5% Dextrose in Water (D5W).',
      ar: 'كيس وريدي فارغ كان يحتوي على 5٪ ديكستروز في الماء (D5W).'
    },
    itemName: { en: 'Empty D5W IV Bag', ar: 'كيس D5W فارغ' },
    itemIcon: 'bag-water',
    category: 'general',
    difficulty: 'advanced',
    correctBin: 'general',
    explanation: {
      en: 'Empty IV bags that contained basic fluids (non-medicated, non-cytotoxic) and do not have needles attached are generally safe to dispose of as general waste (Black bin).',
      ar: 'أكياس الوريد الفارغة التي كانت تحتوي على سوائل أساسية (غير دوائية، غير سامة للخلايا) والمقطوعة عنها الإبر، تعتبر آمنة بشكل عام للتخلص منها كنفايات عامة (الحاوية السوداء).'
    },
    standard: 'WHO Guidelines Ch. 4'
  }
];

export const getAllRawQuestions = () => {
  const stored = localStorage.getItem('cds_admin_questions');
  return stored ? JSON.parse(stored) : DEFAULT_QUESTIONS;
};

export const saveAdminQuestions = (questions) => {
  localStorage.setItem('cds_admin_questions', JSON.stringify(questions));
};

export const resetQuestions = () => {
  localStorage.removeItem('cds_admin_questions');
};

export const getQuestions = (lang = 'en') => {
  const activeQuestions = getAllRawQuestions();
  return activeQuestions.map(q => ({
    ...q,
    scenario: q.scenario[lang] || q.scenario.en,
    itemName: q.itemName[lang] || q.itemName.en,
    explanation: q.explanation[lang] || q.explanation.en
  }));
};
