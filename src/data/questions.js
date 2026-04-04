export const questions = [
  {
    id: 'q1',
    scenario: 'You just finished drawing blood from a patient. You are holding the used needle attached to the syringe.',
    itemName: 'Used Syringe with Needle',
    itemIcon: 'syringe',
    category: 'sharps',
    difficulty: 'beginner',
    correctBin: 'sharps',
    explanation: 'All sharp objects, especially those contaminated with blood or body fluids, must be disposed of immediately in a puncture-proof red Sharps container to prevent needle-stick injuries.',
    standard: 'WHO Guidelines Ch. 7, MOH Safety Protocol A.1'
  },
  {
    id: 'q2',
    scenario: 'You are discarding the plastic wrapper of a new, sterile IV line that has not touched the patient.',
    itemName: 'Clean Plastic Wrapper',
    itemIcon: 'package',
    category: 'general',
    difficulty: 'beginner',
    correctBin: 'general',
    explanation: 'Packaging materials that have not come into contact with body fluids or hazardous chemicals are considered general non-hazardous waste (Black bin).',
    standard: 'WHO Guidelines Ch. 4'
  },
  {
    id: 'q3',
    scenario: 'A gauze pad is heavily soaked with blood after stopping a hemorrhage.',
    itemName: 'Blood-Soaked Gauze',
    itemIcon: 'droplets',
    category: 'infectious',
    difficulty: 'beginner',
    correctBin: 'infectious',
    explanation: 'Materials heavily saturated or dripping with blood or body fluids are highly infectious and must be placed in a yellow infectious waste bag.',
    standard: 'WHO Guidelines Ch. 4.2'
  },
  {
    id: 'q4',
    scenario: 'You are disposing of a vial containing a partially used, non-hazardous antibiotic.',
    itemName: 'Partially Used Antibiotic Vial',
    itemIcon: 'pill',
    category: 'pharmaceutical',
    difficulty: 'intermediate',
    correctBin: 'pharmaceutical',
    explanation: 'Expired or unused pharmaceutical products should be disposed of in designated pharmaceutical waste containers (Blue) to prevent environmental contamination.',
    standard: 'WHO Guidelines Ch. 4.3'
  },
  {
    id: 'q5',
    scenario: 'You just took off your gloves after performing a routine, non-invasive physical exam (no body fluids encountered).',
    itemName: 'Used Exam Gloves (No Fluids)',
    itemIcon: 'hand',
    category: 'general',
    difficulty: 'intermediate',
    correctBin: 'general',
    explanation: 'Gloves used for routine exams without coming into contact with blood or body fluids should be disposed of as general waste (Black bin).',
    standard: 'WHO Guidelines Ch. 4'
  },
  {
    id: 'q6',
    scenario: 'You have a broken glass ampoule that contained normal saline.',
    itemName: 'Broken Glass Ampoule',
    itemIcon: 'glass-water',
    category: 'sharps',
    difficulty: 'advanced',
    correctBin: 'sharps',
    explanation: 'Even if the contents were not infectious or hazardous (like saline), broken glass is still a sharp object and must go into the puncture-proof sharps container.',
    standard: 'WHO Guidelines Ch. 7'
  },
  {
    id: 'q7',
    scenario: 'A patient leaves behind an uneaten apple and a styrofoam cup from their lunch.',
    itemName: 'Food Waste',
    itemIcon: 'apple',
    category: 'general',
    difficulty: 'beginner',
    correctBin: 'general',
    explanation: 'Food waste and patient meal containers are general waste (Black bin) unless from a highly infectious isolation ward.',
    standard: 'WHO Guidelines Ch. 4'
  },
  {
    id: 'q8',
    scenario: 'You are disposing of a face mask worn during care for an infectious TB patient.',
    itemName: 'Contaminated N95 Mask',
    itemIcon: 'shield-alert',
    category: 'infectious',
    difficulty: 'intermediate',
    correctBin: 'infectious',
    explanation: 'PPE worn while caring for patients with highly infectious airborne diseases must be discarded as infectious waste (Yellow bin).',
    standard: 'WHO Guidelines Ch. 4.2'
  },
  {
    id: 'q9',
    scenario: 'You are discarding a scalpel blade after a minor surgical procedure.',
    itemName: 'Used Scalpel Blade',
    itemIcon: 'scissors',
    category: 'sharps',
    difficulty: 'beginner',
    correctBin: 'sharps',
    explanation: 'Scalpel blades are extremely sharp and biologically contaminated. They must go directly into the red sharps container.',
    standard: 'WHO Guidelines Ch. 7'
  },
  {
    id: 'q10',
    scenario: 'An empty IV bag that contained 5% Dextrose in Water (D5W).',
    itemName: 'Empty D5W IV Bag',
    itemIcon: 'bag-water',
    category: 'general',
    difficulty: 'advanced',
    correctBin: 'general',
    explanation: 'Empty IV bags that contained basic fluids (non-medicated, non-cytotoxic) and do not have needles attached are generally safe to dispose of as general waste (Black bin).',
    standard: 'WHO Guidelines Ch. 4'
  }
];
