const BASE = import.meta.env.BASE_URL;   // e.g. '/CDS/' in prod, '/' in dev

// Helper: ensure an imageUrl stored in questions always gets the current base prefix
export const resolveImageUrl = (url) => {
  if (!url) return '';
  // Already a full URL (http/https/data:base64) → leave as-is
  if (/^(https?:|data:)/.test(url)) return url;
  // Strip any old base prefix so we don't double-prefix
  const clean = url.replace(/^\/CDS\//, '/');
  // Prepend current base (Vite guarantees it ends with '/')
  return BASE + clean.replace(/^\//, '');
};

export const DEFAULT_QUESTIONS = [
  {
    id: 'q1',
    scenario: {
      en: 'You just finished drawing blood from a patient. You are holding the used needle attached to the syringe.',
      ar: 'لقد انتهيت للتو من سحب عينة دم من مريض. أنت تحمل الإبرة المستعملة المرفقة بالحقنة.'
    },
    itemName: { en: 'Used Syringe with Needle', ar: 'حقنة مستعملة مع إبرة' },
    itemIcon: 'syringe',
    imageUrl: 'items/syringe_needle.png',
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
    imageUrl: 'items/clean_wrapper.png',
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
    imageUrl: 'items/blood_gauze.png',
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
    imageUrl: 'items/antibiotic_vial.png',
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
    imageUrl: 'items/exam_gloves.png',
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
    imageUrl: 'items/glass_ampoule.png',
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
    imageUrl: 'items/food_waste.png',
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
    imageUrl: 'items/n95_mask.png',
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
    imageUrl: 'items/scalpel_blade.png',
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
    imageUrl: 'items/iv_bag.png',
    category: 'general',
    difficulty: 'advanced',
    correctBin: 'general',
    explanation: {
      en: 'Empty IV bags that contained basic fluids (non-medicated, non-cytotoxic) and do not have needles attached are generally safe to dispose of as general waste (Black bin).',
      ar: 'أكياس الوريد الفارغة التي كانت تحتوي على سوائل أساسية (غير دوائية، غير سامة للخلايا) والمقطوعة عنها الإبر، تعتبر آمنة بشكل عام للتخلص منها كنفايات عامة (الحاوية السوداء).'
    },
    standard: 'WHO Guidelines Ch. 4'
  },
  {
    id: 'q11',
    scenario: { en: 'You are a nurse in a diabetic care unit and have just administered insulin to a patient using a pen device. You need to detach the used needle.', ar: 'أنت ممرضة في وحدة رعاية مرضى السكري وقمت للتو بحقن إنسولين لمريض باستخدام قلم الحقن. تحتاج إلى فصل الإبرة المستعملة.' },
    itemName: { en: 'Insulin Pen Needle', ar: 'إبرة قلم الإنسولين' },
    itemIcon: 'syringe',
    imageUrl: 'items/insulin_pen_needle.png',
    category: 'sharps',
    difficulty: 'beginner',
    correctBin: 'sharps',
    explanation: { en: 'All needles, regardless of what medication they delivered, must be disposed of immediately in the red sharps container to prevent needle-stick injuries.', ar: 'يجب التخلص من جميع الإبر فوراً في حاوية الأدوات الحادة الحمراء بصرف النظر عن نوع الدواء، وذلك لمنع إصابات الوخز بالإبرة.' },
    standard: 'WHO Guidelines Ch. 7'
  },
  {
    id: 'q12',
    scenario: { en: 'After completing a chemotherapy infusion, a small amount of cytotoxic drug remains in the IV bag. You need to dispose of the bag and tubing.', ar: 'بعد اكتمال جلسة العلاج الكيماوي، تبقت كمية صغيرة من الدواء السام للخلايا داخل كيس المحلول الوريدي. تحتاج إلى التخلص من الكيس والأنبوب.' },
    itemName: { en: 'Partial Chemotherapy IV Bag', ar: 'كيس محلول كيماوي متبقٍّ' },
    itemIcon: 'bag-water',
    imageUrl: 'items/chemo_iv_bag.png',
    category: 'pharmaceutical',
    difficulty: 'advanced',
    correctBin: 'pharmaceutical',
    explanation: { en: 'Any residual cytotoxic or chemotherapy drugs must be disposed of in the pharmaceutical waste (blue) stream due to their carcinogenic and mutagenic properties.', ar: 'يجب التخلص من أي بقايا أدوية سامة للخلايا في تيار النفايات الصيدلانية (الأزرق) بسبب خصائصها المسرطنة والمحوِّرة للجينات.' },
    standard: 'WHO Guidelines Ch. 4.3'
  },
  {
    id: 'q13',
    scenario: { en: 'You are removing a used Foley catheter and drainage bag from a patient who has been catheterized for 3 days.', ar: 'تقوم بإزالة قسطرة فولي مستعملة وكيس التصريف من مريض تم تركيب القسطرة له منذ 3 أيام.' },
    itemName: { en: 'Used Urinary Catheter & Bag', ar: 'قسطرة بولية مستعملة وكيس التصريف' },
    itemIcon: 'bag-water',
    imageUrl: 'items/urinary_catheter_bag.png',
    category: 'infectious',
    difficulty: 'beginner',
    correctBin: 'infectious',
    explanation: { en: 'Used catheters and drainage bags are contaminated with body fluids (urine) and must be disposed of as infectious waste in the yellow bin.', ar: 'القسطرات المستعملة وأكياس التصريف ملوثة بسوائل الجسم (البول) ويجب التخلص منها كنفايات معدية في الحاوية الصفراء.' },
    standard: 'WHO Guidelines Ch. 4.2'
  },
  {
    id: 'q14',
    scenario: { en: "You just tested a patient's blood glucose level with a finger-prick. The test strip has a small amount of the patient's blood on it.", ar: 'انتهيت للتو من قياس مستوى سكر الدم لمريض باستخدام وخز الإصبع. يوجد على شريط الاختبار كمية صغيرة من دم المريض.' },
    itemName: { en: 'Used Blood Glucose Test Strip', ar: 'شريط قياس سكر الدم المستعمل' },
    itemIcon: 'droplets',
    imageUrl: 'items/blood_glucose_strip.png',
    category: 'infectious',
    difficulty: 'intermediate',
    correctBin: 'infectious',
    explanation: { en: 'Any item contaminated with blood, even in small amounts, must be treated as infectious waste and placed in the yellow bin.', ar: 'يجب التعامل مع أي عنصر ملوث بالدم، حتى بكميات صغيرة، كنفايات معدية وتوضع في الحاوية الصفراء.' },
    standard: 'WHO Guidelines Ch. 4.2'
  },
  {
    id: 'q15',
    scenario: { en: 'You used a paper towel to apply pressure to a venipuncture site. The towel has visible blood on it.', ar: 'استخدمت منشفة ورقية للضغط على موضع سحب الدم. على المنشفة آثار دم واضحة.' },
    itemName: { en: 'Blood-Stained Paper Towel', ar: 'منشفة ورقية ملوثة بالدم' },
    itemIcon: 'droplets',
    imageUrl: 'items/blood_stained_towel.png',
    category: 'infectious',
    difficulty: 'beginner',
    correctBin: 'infectious',
    explanation: { en: 'Paper towels visibly contaminated with blood are classified as infectious waste and must be placed in the yellow infectious waste bag.', ar: 'المناشف الورقية الملوثة بشكل واضح بالدم تُصنَّف كنفايات معدية ويجب وضعها في كيس النفايات المعدية الأصفر.' },
    standard: 'WHO Guidelines Ch. 4.2'
  },
  {
    id: 'q16',
    scenario: { en: 'You have just finished administering the last dose from a multi-dose flu vaccine vial. The vial is now empty.', ar: 'انتهيت للتو من إعطاء آخر جرعة من قارورة لقاح الأنفلونزا متعددة الجرعات. القارورة الآن فارغة.' },
    itemName: { en: 'Empty Vaccine Vial', ar: 'قارورة لقاح فارغة' },
    itemIcon: 'pill',
    imageUrl: 'items/vaccine_vial.png',
    category: 'pharmaceutical',
    difficulty: 'intermediate',
    correctBin: 'pharmaceutical',
    explanation: { en: 'Empty vaccine vials may contain residual biological material and adjuvants. They must be disposed of in the pharmaceutical waste stream (blue bin).', ar: 'قوارير اللقاح الفارغة قد تحتوي على مواد بيولوجية متبقية ويجب التخلص منها في تيار النفايات الصيدلانية (الحاوية الزرقاء).' },
    standard: 'WHO Guidelines Ch. 4.3'
  },
  {
    id: 'q17',
    scenario: { en: 'You have removed a peripheral intravenous cannula (angiocath) from a patient\'s arm after it became blocked. The needle stylet was already removed at insertion.', ar: 'قمت بإزالة كانيولا وريدية طرفية من ذراع المريض بعد أن انسدت. تمت إزالة الموجِّه الإبري عند الإدخال.' },
    itemName: { en: 'Used IV Cannula (Angiocath)', ar: 'كانيولا وريدية مستعملة' },
    itemIcon: 'syringe',
    imageUrl: 'items/iv_cannula.png',
    category: 'sharps',
    difficulty: 'intermediate',
    correctBin: 'sharps',
    explanation: { en: 'IV cannulas are sharp devices contaminated with blood. They must be disposed of in the red sharps container regardless of whether the needle stylet is still attached.', ar: 'الكانيولا الوريدية أدوات حادة ملوثة بالدم. يجب التخلص منها في حاوية الأدوات الحادة الحمراء بصرف النظر عن وجود الموجِّه الإبري.' },
    standard: 'WHO Guidelines Ch. 7'
  },
  {
    id: 'q18',
    scenario: { en: 'You have removed all tablets from a blister pack of oral antibiotics dispensed to a patient. The pack is completely empty with no residual medication.', ar: 'قمت بإخراج جميع الأقراص من علبة بليستر مضاد حيوي فموي صُرف للمريض. العلبة فارغة تماماً بلا بقايا دواء.' },
    itemName: { en: 'Empty Antibiotic Blister Pack', ar: 'علبة بليستر مضاد حيوي فارغة' },
    itemIcon: 'pill',
    imageUrl: 'items/empty_blister_pack.png',
    category: 'general',
    difficulty: 'advanced',
    correctBin: 'general',
    explanation: { en: 'Completely empty blister packs from solid dosage forms (no residual medication) are considered general non-hazardous waste and can be disposed of in the black bin.', ar: 'عبوات البليستر الفارغة تماماً من الجرعات الصلبة (بلا بقايا أدوية) تُعتبر نفايات عامة غير خطرة ويمكن التخلص منها في الحاوية السوداء.' },
    standard: 'WHO Guidelines Ch. 4'
  },
  {
    id: 'q19',
    scenario: { en: 'A patient being investigated for pulmonary tuberculosis has provided a sputum sample in a specimen container. Testing is now complete.', ar: 'قدّم مريض يُجرى له فحص لمرض السُّل الرئوي عينة بلغم في حاوية عينات. اكتمل التحليل الآن.' },
    itemName: { en: 'Used Sputum Sample Container', ar: 'حاوية عينة بلغم مستعملة' },
    itemIcon: 'shield-alert',
    imageUrl: 'items/sputum_container.png',
    category: 'infectious',
    difficulty: 'intermediate',
    correctBin: 'infectious',
    explanation: { en: 'Sputum from a suspected TB patient is highly infectious. The specimen container must be disposed of as infectious waste (yellow bin) and handled with extreme caution.', ar: 'يُصنَّف البلغم من مريض يُشتبه بإصابته بالسُّل كنفايات شديدة العدوى. يجب التخلص من الحاوية كنفايات معدية (الحاوية الصفراء) والتعامل معها بحذر شديد.' },
    standard: 'WHO Guidelines Ch. 4.2'
  },
  {
    id: 'q20',
    scenario: { en: 'While checking medication storage, you discover several insulin vials that have passed their expiration date and must be disposed of.', ar: 'أثناء فحص مخزن الأدوية، اكتشفت عدة قوارير إنسولين تجاوزت تاريخ انتهاء صلاحيتها ويجب التخلص منها.' },
    itemName: { en: 'Expired Insulin Vials', ar: 'قوارير إنسولين منتهية الصلاحية' },
    itemIcon: 'pill',
    imageUrl: 'items/expired_insulin_vials.png',
    category: 'pharmaceutical',
    difficulty: 'beginner',
    correctBin: 'pharmaceutical',
    explanation: { en: 'Expired insulin and all other expired medications must be disposed of in the pharmaceutical waste container (blue bin). Never discard them in general or infectious waste.', ar: 'يجب التخلص من الإنسولين منتهي الصلاحية وجميع الأدوية الأخرى المنتهية في حاوية النفايات الصيدلانية (الحاوية الزرقاء). لا تتخلص منها في النفايات العامة أو المعدية أبداً.' },
    standard: 'WHO Guidelines Ch. 4.3'
  },
  {
    id: 'q21',
    scenario: { en: 'You assisted with a minor surgical procedure and your gloves became visibly contaminated with the patient\'s blood during the operation.', ar: 'كنت تساعد في إجراء عملية جراحية بسيطة وتلوثت قفازاتك بشكل واضح بدم المريض أثناء العملية.' },
    itemName: { en: 'Surgical Gloves (Blood-Contaminated)', ar: 'قفازات جراحية ملوثة بالدم' },
    itemIcon: 'hand',
    imageUrl: 'items/bloody_surgical_gloves.png',
    category: 'infectious',
    difficulty: 'beginner',
    correctBin: 'infectious',
    explanation: { en: 'Gloves visibly contaminated with blood must be disposed of as infectious waste in the yellow bin, not as general waste.', ar: 'يجب التخلص من القفازات الملوثة بشكل واضح بالدم كنفايات معدية في الحاوية الصفراء، وليس كنفايات عامة.' },
    standard: 'WHO Guidelines Ch. 4.2'
  },
  {
    id: 'q22',
    scenario: { en: 'A diabetes patient has completed their morning blood glucose check and hands you the used lancet from the lancing device.', ar: 'أجرى مريض مصاب بالسكري قياسه الصباحي لسكر الدم وأعطاك المشرط المستعمل من جهاز الوخز.' },
    itemName: { en: 'Used Blood Lancet', ar: 'مشرط وخز مستعمل' },
    itemIcon: 'syringe',
    imageUrl: 'items/blood_lancet.png',
    category: 'sharps',
    difficulty: 'beginner',
    correctBin: 'sharps',
    explanation: { en: 'Lancets are sharp objects that were in contact with blood. Place them directly into the red sharps container. Never recap or resheathe used lancets.', ar: 'المشارط هي أدوات حادة كانت على تماس مع الدم. ضعها مباشرة في حاوية الأدوات الحادة الحمراء. لا تعد غطاء المشرط المستعمل أبداً.' },
    standard: 'WHO Guidelines Ch. 7'
  },
  {
    id: 'q23',
    scenario: { en: 'An IV infusion of normal saline has completed. You are removing the giving set (IV tubing). The tubing has no needles attached and only contained saline.', ar: 'اكتملت جلسة تسريب محلول ملحي عادي. تقوم بإزالة طقم التسريب (أنبوب المحلول). الأنبوب لا يحتوي على إبر وكان يحتوي فقط على محلول ملحي.' },
    itemName: { en: 'IV Giving Set (Saline, No Needle)', ar: 'طقم تسريب وريدي (محلول ملحي، بدون إبرة)' },
    itemIcon: 'bag-water',
    imageUrl: 'items/iv_giving_set.png',
    category: 'general',
    difficulty: 'advanced',
    correctBin: 'general',
    explanation: { en: 'IV tubing that only carried non-hazardous fluids (like normal saline) with no needles attached is classified as general non-infectious waste (black bin).', ar: 'أنبوب المحلول الذي كان يحمل فقط سوائل غير خطرة (مثل المحلول الملحي) وليس به إبر يُصنَّف كنفايات عامة غير معدية (الحاوية السوداء).' },
    standard: 'WHO Guidelines Ch. 4'
  },
  {
    id: 'q24',
    scenario: { en: 'You are changing the dressing on a post-operative wound that has become infected. The removed dressing is soaked with pus and wound exudate.', ar: 'تقوم بتغيير ضمادة جرح ما بعد العملية الجراحية الذي أصبح مصاباً بالعدوى. الضمادة المزالة مشبعة بالقيح وإفراز الجرح.' },
    itemName: { en: 'Infected Wound Dressing (with Pus)', ar: 'ضمادة جرح مصابة بالعدوى' },
    itemIcon: 'droplets',
    imageUrl: 'items/infected_wound_dressing.png',
    category: 'infectious',
    difficulty: 'beginner',
    correctBin: 'infectious',
    explanation: { en: 'Dressings saturated with infected wound exudate (pus) are infectious waste and must be placed in the yellow bin.', ar: 'الضمادات المشبعة بإفراز الجروح المصابة (القيح) نفايات معدية ويجب وضعها في الحاوية الصفراء.' },
    standard: 'WHO Guidelines Ch. 4.2'
  },
  {
    id: 'q25',
    scenario: { en: 'A blood transfusion is complete. The bag still has a small residual amount of blood inside, and the IV tubing is still attached.', ar: 'اكتمل نقل الدم. لا يزال كيس الدم يحتوي على كمية صغيرة متبقية من الدم، ولا يزال أنبوب المحلول الوريدي متصلاً به.' },
    itemName: { en: 'Used Blood Transfusion Bag', ar: 'كيس نقل الدم المستعمل' },
    itemIcon: 'droplets',
    imageUrl: 'items/blood_transfusion_bag.png',
    category: 'infectious',
    difficulty: 'beginner',
    correctBin: 'infectious',
    explanation: { en: 'Blood transfusion bags with residual blood are infectious and must be disposed of in the yellow infectious waste container.', ar: 'أكياس نقل الدم التي تحتوي على بقايا دم تُعدّ معدية ويجب التخلص منها في حاوية النفايات المعدية الصفراء.' },
    standard: 'WHO Guidelines Ch. 4.2'
  },
  {
    id: 'q26',
    scenario: { en: 'You are cleaning up after administering methotrexate (a cytotoxic agent). The vial still has a small residual volume of drug inside.', ar: 'تقوم بالتنظيف بعد إعطاء جرعة من الميثوتريكسات (عامل سام للخلايا). القارورة لا تزال تحتوي على حجم صغير متبقٍّ من الدواء.' },
    itemName: { en: 'Cytotoxic Drug Vial (Methotrexate)', ar: 'قارورة دواء سام للخلايا (ميثوتريكسات)' },
    itemIcon: 'pill',
    imageUrl: 'items/cytotoxic_drug_vial.png',
    category: 'pharmaceutical',
    difficulty: 'advanced',
    correctBin: 'pharmaceutical',
    explanation: { en: 'Cytotoxic drug vials must be disposed of in the pharmaceutical waste stream (blue). These agents require specialized disposal due to their genotoxic and carcinogenic properties.', ar: 'يجب التخلص من قوارير الأدوية السامة للخلايا في تيار النفايات الصيدلانية (الأزرق). تتطلب هذه المواد التخلص المتخصص بسبب خصائصها الجينية السامة والمسرطنة.' },
    standard: 'WHO Guidelines Ch. 4.3'
  },
  {
    id: 'q27',
    scenario: { en: "A patient's nasogastric tube is being removed after 5 days of enteral feeding. The tube is covered in gastric secretions.", ar: 'تتم إزالة أنبوب أنفي معدي (NG) من مريض بعد 5 أيام من التغذية المعوية. الأنبوب مغطى بإفرازات المعدة.' },
    itemName: { en: 'Removed Nasogastric Tube', ar: 'أنبوب أنفي معدي مُزال' },
    itemIcon: 'bag-water',
    imageUrl: 'items/nasogastric_tube.png',
    category: 'infectious',
    difficulty: 'intermediate',
    correctBin: 'infectious',
    explanation: { en: 'Used nasogastric tubes are contaminated with gastric secretions (body fluids) and must be disposed of as infectious waste in the yellow bin.', ar: 'الأنابيب الأنفية المعدية المستخدمة ملوثة بإفرازات المعدة (سوائل الجسم) ويجب التخلص منها كنفايات معدية في الحاوية الصفراء.' },
    standard: 'WHO Guidelines Ch. 4.2'
  },
  {
    id: 'q28',
    scenario: { en: 'You have finished cleaning a patient\'s skin with an alcohol swab before IV insertion. The small paper wrapper from the alcohol swab is on the tray.', ar: 'انتهيت من تنظيف جلد المريض بمسحة كحول قبل إدخال الكانيولا. الغلاف الورقي الصغير لعبوة مسحة الكحول على الصينية.' },
    itemName: { en: 'Alcohol Swab Wrapper (Empty)', ar: 'غلاف مسحة الكحول الفارغ' },
    itemIcon: 'package',
    imageUrl: 'items/alcohol_swab_wrapper.png',
    category: 'general',
    difficulty: 'advanced',
    correctBin: 'general',
    explanation: { en: 'Empty wrappers from alcohol swabs that have not directly touched the patient or body fluids are non-hazardous general waste (black bin).', ar: 'الأغلفة الفارغة من مسحات الكحول التي لم تلامس المريض أو سوائل الجسم مباشرة هي نفايات عامة غير خطرة (الحاوية السوداء).' },
    standard: 'WHO Guidelines Ch. 4'
  },
  {
    id: 'q29',
    scenario: { en: 'You have finished caring for a patient in contact isolation for a multi-drug resistant organism (MDRO). You are removing your disposable protective gown.', ar: 'انتهيت من رعاية مريض في عزل احتكاكي بسبب كائن مقاوم لمتعدد الأدوية (MDRO). تقوم بخلع الرداء الواقي المستهلك.' },
    itemName: { en: 'Contaminated Isolation Gown', ar: 'رداء عزل ملوث' },
    itemIcon: 'shield-alert',
    imageUrl: 'items/isolation_gown.png',
    category: 'infectious',
    difficulty: 'intermediate',
    correctBin: 'infectious',
    explanation: { en: 'Disposable PPE gowns worn during contact isolation for infectious patients must be disposed of as infectious waste in the yellow bin.', ar: 'أردية الوقاية الشخصية المستهلكة المرتداة أثناء العزل الاحتكاكي للمرضى المعديين نفايات معدية ويجب التخلص منها في الحاوية الصفراء.' },
    standard: 'WHO Guidelines Ch. 4.2'
  },
  {
    id: 'q30',
    scenario: { en: 'A patient\'s sterile dressing pack accidentally fell on the floor before use. Hospital policy requires any dropped sterile item to be discarded. The pack is still sealed.', ar: 'سقطت عبوة ضمادة معقمة للمريض على الأرض بشكل عرضي قبل الاستخدام. تتطلب سياسة المستشفى إتلاف أي مستلزم طبي يسقط. العبوة لا تزال مغلقة.' },
    itemName: { en: 'Dropped Sealed Sterile Pack', ar: 'عبوة معقمة مغلقة سقطت على الأرض' },
    itemIcon: 'package',
    imageUrl: 'items/dropped_sterile_pack.png',
    category: 'general',
    difficulty: 'advanced',
    correctBin: 'general',
    explanation: { en: 'An unopened sealed sterile package discarded due to dropping (not contaminated by body fluids or a patient) is classified as general non-infectious waste (black bin).', ar: 'العبوة المعقمة المغلقة التي يُتخلص منها بسبب السقوط (غير ملوثة بسوائل جسم أو مريض) تُصنَّف كنفايات عامة غير معدية (الحاوية السوداء).' },
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

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const getQuestions = (lang = 'en', count = 10) => {
  const activeQuestions = getAllRawQuestions();
  const shuffled = shuffleArray(activeQuestions);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  return selected.map(q => ({
    ...q,
    scenario: q.scenario[lang] || q.scenario.en,
    itemName: q.itemName[lang] || q.itemName.en,
    explanation: q.explanation[lang] || q.explanation.en,
    imageUrl: resolveImageUrl(q.imageUrl),
  }));
};
