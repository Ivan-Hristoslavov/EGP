// Dummy services data for development and demonstration
export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  mainTab: 'book-now' | 'by-condition';
  category: string; // Dynamic category based on mainTab
  duration: number; // in minutes
  price: number;
  isActive: boolean;
  requiresConsultation: boolean;
  downtimeDays: number;
  resultsDurationWeeks: number | null;
  displayOrder: number;
}

// Main tabs configuration
export const MAIN_TABS = {
  'book-now': {
    name: 'BOOK NOW',
    categories: {
      'face': 'FACE',
      'anti-wrinkle': 'ANTI-WRINKLE INJECTIONS', 
      'fillers': 'FILLERS',
      'body': 'BODY',
      'lips': 'LIPS',
      'skin': 'SKIN',
      'hair': 'HAIR'
    }
  },
  'by-condition': {
    name: 'BY CONDITION',
    categories: {
      'wrinkles': 'WRINKLES',
      'volume-loss': 'VOLUME LOSS',
      'acne': 'ACNE',
      'pigmentation': 'PIGMENTATION',
      'scars': 'SCARS',
      'hair-loss': 'HAIR LOSS',
      'body-contouring': 'BODY CONTOURING'
    }
  }
};

export const DUMMY_SERVICES: Service[] = [
  // BOOK NOW - FACE TREATMENTS
  {
    id: 'srv-1',
    name: 'Anti-Wrinkle Injections (Botox)',
    slug: 'anti-wrinkle-injections',
    description: 'Reduce fine lines and wrinkles with premium anti-wrinkle treatments. Popular for forehead, frown lines, and crow\'s feet.',
    mainTab: 'book-now',
    category: 'anti-wrinkle',
    duration: 30,
    price: 250.00,
    isActive: true,
    requiresConsultation: false,
    downtimeDays: 0,
    resultsDurationWeeks: 12,
    displayOrder: 1
  },
  {
    id: 'srv-2',
    name: 'Dermal Fillers - Cheeks',
    slug: 'dermal-fillers-cheeks',
    description: 'Restore volume and enhance cheek definition with premium hyaluronic acid fillers.',
    mainTab: 'book-now',
    category: 'fillers',
    duration: 45,
    price: 450.00,
    isActive: true,
    requiresConsultation: true,
    downtimeDays: 2,
    resultsDurationWeeks: 52,
    displayOrder: 2
  },
  {
    id: 'srv-3',
    name: 'Lip Fillers',
    slug: 'lip-fillers',
    description: 'Enhance lip volume and shape with natural-looking hyaluronic acid fillers.',
    mainTab: 'book-now',
    category: 'lips',
    duration: 30,
    price: 350.00,
    isActive: true,
    requiresConsultation: false,
    downtimeDays: 3,
    resultsDurationWeeks: 26,
    displayOrder: 3
  },
  {
    id: 'srv-4',
    name: 'Chemical Peel',
    slug: 'chemical-peel',
    description: 'Improve skin texture and tone with professional chemical peels.',
    mainTab: 'book-now',
    category: 'skin',
    duration: 60,
    price: 180.00,
    isActive: true,
    requiresConsultation: true,
    downtimeDays: 5,
    resultsDurationWeeks: 8,
    displayOrder: 4
  },
  {
    id: 'srv-5',
    name: 'Microneedling',
    slug: 'microneedling',
    description: 'Stimulate collagen production and improve skin texture with advanced microneedling.',
    mainTab: 'book-now',
    category: 'skin',
    duration: 90,
    price: 220.00,
    isActive: true,
    requiresConsultation: true,
    downtimeDays: 3,
    resultsDurationWeeks: 12,
    displayOrder: 5
  },
  {
    id: 'srv-6',
    name: 'HydraFacial',
    slug: 'hydrafacial',
    description: 'Deep cleanse, extract, and hydrate your skin with the revolutionary HydraFacial treatment.',
    mainTab: 'book-now',
    category: 'face',
    duration: 60,
    price: 150.00,
    isActive: true,
    requiresConsultation: false,
    downtimeDays: 0,
    resultsDurationWeeks: 2,
    displayOrder: 6
  },
  {
    id: 'srv-7',
    name: 'CoolSculpting',
    slug: 'coolsculpting',
    description: 'Non-invasive fat reduction treatment that freezes away stubborn fat cells.',
    mainTab: 'book-now',
    category: 'body',
    duration: 60,
    price: 800.00,
    isActive: true,
    requiresConsultation: true,
    downtimeDays: 0,
    resultsDurationWeeks: 16,
    displayOrder: 7
  },
  {
    id: 'srv-8',
    name: 'Laser Hair Removal',
    slug: 'laser-hair-removal',
    description: 'Permanent hair reduction using advanced laser technology.',
    mainTab: 'book-now',
    category: 'hair',
    duration: 30,
    price: 120.00,
    isActive: true,
    requiresConsultation: false,
    downtimeDays: 0,
    resultsDurationWeeks: null,
    displayOrder: 8
  },
  {
    id: 'srv-9',
    name: 'PRP Hair Treatment',
    slug: 'prp-hair-treatment',
    description: 'Stimulate hair growth using your own platelet-rich plasma.',
    mainTab: 'book-now',
    category: 'hair',
    duration: 90,
    price: 400.00,
    isActive: true,
    requiresConsultation: true,
    downtimeDays: 1,
    resultsDurationWeeks: 12,
    displayOrder: 9
  },
  {
    id: 'srv-10',
    name: 'Dermal Fillers - Nasolabial',
    slug: 'dermal-fillers-nasolabial',
    description: 'Smooth nasolabial folds and restore youthful facial contours.',
    mainTab: 'book-now',
    category: 'fillers',
    duration: 30,
    price: 380.00,
    isActive: true,
    requiresConsultation: false,
    downtimeDays: 2,
    resultsDurationWeeks: 52,
    displayOrder: 10
  },

  // BY CONDITION - WRINKLES
  {
    id: 'srv-11',
    name: 'Forehead Lines Treatment',
    slug: 'forehead-lines-treatment',
    description: 'Target horizontal forehead lines with precision anti-wrinkle injections.',
    mainTab: 'by-condition',
    category: 'wrinkles',
    duration: 20,
    price: 200.00,
    isActive: true,
    requiresConsultation: false,
    downtimeDays: 0,
    resultsDurationWeeks: 12,
    displayOrder: 11
  },
  {
    id: 'srv-12',
    name: 'Crow\'s Feet Treatment',
    slug: 'crows-feet-treatment',
    description: 'Smooth out crow\'s feet around the eyes for a refreshed appearance.',
    mainTab: 'by-condition',
    category: 'wrinkles',
    duration: 15,
    price: 180.00,
    isActive: true,
    requiresConsultation: false,
    downtimeDays: 0,
    resultsDurationWeeks: 12,
    displayOrder: 12
  },
  {
    id: 'srv-13',
    name: 'Frown Lines Treatment',
    slug: 'frown-lines-treatment',
    description: 'Relax the muscles between the eyebrows to smooth frown lines.',
    mainTab: 'by-condition',
    category: 'wrinkles',
    duration: 15,
    price: 180.00,
    isActive: true,
    requiresConsultation: false,
    downtimeDays: 0,
    resultsDurationWeeks: 12,
    displayOrder: 13
  },

  // BY CONDITION - VOLUME LOSS
  {
    id: 'srv-14',
    name: 'Cheek Volume Restoration',
    slug: 'cheek-volume-restoration',
    description: 'Restore lost cheek volume and create natural-looking lift.',
    mainTab: 'by-condition',
    category: 'volume-loss',
    duration: 45,
    price: 450.00,
    isActive: true,
    requiresConsultation: true,
    downtimeDays: 2,
    resultsDurationWeeks: 52,
    displayOrder: 14
  },
  {
    id: 'srv-15',
    name: 'Temple Hollow Treatment',
    slug: 'temple-hollow-treatment',
    description: 'Fill temple hollows to restore youthful facial contours.',
    mainTab: 'by-condition',
    category: 'volume-loss',
    duration: 30,
    price: 350.00,
    isActive: true,
    requiresConsultation: true,
    downtimeDays: 2,
    resultsDurationWeeks: 52,
    displayOrder: 15
  },
  {
    id: 'srv-16',
    name: 'Under Eye Hollow Treatment',
    slug: 'under-eye-hollow-treatment',
    description: 'Restore volume under the eyes to eliminate hollows and dark circles.',
    mainTab: 'by-condition',
    category: 'volume-loss',
    duration: 30,
    price: 400.00,
    isActive: true,
    requiresConsultation: true,
    downtimeDays: 3,
    resultsDurationWeeks: 26,
    displayOrder: 16
  },

  // BY CONDITION - ACNE
  {
    id: 'srv-17',
    name: 'Acne Scar Treatment',
    slug: 'acne-scar-treatment',
    description: 'Reduce the appearance of acne scars with advanced treatments.',
    mainTab: 'by-condition',
    category: 'acne',
    duration: 60,
    price: 280.00,
    isActive: true,
    requiresConsultation: true,
    downtimeDays: 5,
    resultsDurationWeeks: 12,
    displayOrder: 17
  },
  {
    id: 'srv-18',
    name: 'Active Acne Treatment',
    slug: 'active-acne-treatment',
    description: 'Target active acne with professional treatments and skincare.',
    mainTab: 'by-condition',
    category: 'acne',
    duration: 45,
    price: 150.00,
    isActive: true,
    requiresConsultation: true,
    downtimeDays: 2,
    resultsDurationWeeks: 8,
    displayOrder: 18
  },

  // BY CONDITION - PIGMENTATION
  {
    id: 'srv-19',
    name: 'Hyperpigmentation Treatment',
    slug: 'hyperpigmentation-treatment',
    description: 'Reduce dark spots and uneven skin tone with advanced treatments.',
    mainTab: 'by-condition',
    category: 'pigmentation',
    duration: 60,
    price: 200.00,
    isActive: true,
    requiresConsultation: true,
    downtimeDays: 3,
    resultsDurationWeeks: 8,
    displayOrder: 19
  },
  {
    id: 'srv-20',
    name: 'Melasma Treatment',
    slug: 'melasma-treatment',
    description: 'Target melasma and hormonal pigmentation with specialized treatments.',
    mainTab: 'by-condition',
    category: 'pigmentation',
    duration: 90,
    price: 250.00,
    isActive: true,
    requiresConsultation: true,
    downtimeDays: 5,
    resultsDurationWeeks: 12,
    displayOrder: 20
  },

  // BY CONDITION - SCARS
  {
    id: 'srv-21',
    name: 'Surgical Scar Treatment',
    slug: 'surgical-scar-treatment',
    description: 'Improve the appearance of surgical scars with advanced treatments.',
    mainTab: 'by-condition',
    category: 'scars',
    duration: 60,
    price: 300.00,
    isActive: true,
    requiresConsultation: true,
    downtimeDays: 3,
    resultsDurationWeeks: 16,
    displayOrder: 21
  },
  {
    id: 'srv-22',
    name: 'Trauma Scar Treatment',
    slug: 'trauma-scar-treatment',
    description: 'Reduce the appearance of trauma-related scars.',
    mainTab: 'by-condition',
    category: 'scars',
    duration: 60,
    price: 280.00,
    isActive: true,
    requiresConsultation: true,
    downtimeDays: 3,
    resultsDurationWeeks: 16,
    displayOrder: 22
  },

  // BY CONDITION - HAIR LOSS
  {
    id: 'srv-23',
    name: 'Male Pattern Baldness Treatment',
    slug: 'male-pattern-baldness-treatment',
    description: 'Comprehensive treatment for male pattern hair loss.',
    mainTab: 'by-condition',
    category: 'hair-loss',
    duration: 90,
    price: 400.00,
    isActive: true,
    requiresConsultation: true,
    downtimeDays: 1,
    resultsDurationWeeks: 12,
    displayOrder: 23
  },
  {
    id: 'srv-24',
    name: 'Female Hair Loss Treatment',
    slug: 'female-hair-loss-treatment',
    description: 'Specialized treatment for female hair loss and thinning.',
    mainTab: 'by-condition',
    category: 'hair-loss',
    duration: 90,
    price: 400.00,
    isActive: true,
    requiresConsultation: true,
    downtimeDays: 1,
    resultsDurationWeeks: 12,
    displayOrder: 24
  },

  // BY CONDITION - BODY CONTOURING
  {
    id: 'srv-25',
    name: 'Stubborn Fat Treatment',
    slug: 'stubborn-fat-treatment',
    description: 'Target stubborn fat areas that don\'t respond to diet and exercise.',
    mainTab: 'by-condition',
    category: 'body-contouring',
    duration: 60,
    price: 800.00,
    isActive: true,
    requiresConsultation: true,
    downtimeDays: 0,
    resultsDurationWeeks: 16,
    displayOrder: 25
  },
  {
    id: 'srv-26',
    name: 'Skin Tightening Treatment',
    slug: 'skin-tightening-treatment',
    description: 'Tighten loose skin and improve body contours.',
    mainTab: 'by-condition',
    category: 'body-contouring',
    duration: 90,
    price: 600.00,
    isActive: true,
    requiresConsultation: true,
    downtimeDays: 1,
    resultsDurationWeeks: 12,
    displayOrder: 26
  }
];

// Helper functions
export function getServiceById(id: string): Service | undefined {
  return DUMMY_SERVICES.find(service => service.id === id);
}

export function getServiceBySlug(slug: string): Service | undefined {
  return DUMMY_SERVICES.find(service => service.slug === slug);
}

export function getServicesByMainTab(mainTab: 'book-now' | 'by-condition'): Service[] {
  return DUMMY_SERVICES.filter(service => service.mainTab === mainTab);
}

export function getServicesByCategory(mainTab: 'book-now' | 'by-condition', category: string): Service[] {
  return DUMMY_SERVICES.filter(service => service.mainTab === mainTab && service.category === category);
}

export function getAllActiveServices(): Service[] {
  return DUMMY_SERVICES.filter(service => service.isActive);
}

export function getMainTabCategories(mainTab: 'book-now' | 'by-condition'): string[] {
  return Object.keys(MAIN_TABS[mainTab].categories);
}

export function getCategoryLabel(mainTab: 'book-now' | 'by-condition', category: string): string {
  return MAIN_TABS[mainTab].categories[category as keyof typeof MAIN_TABS[typeof mainTab]['categories']] || category;
}