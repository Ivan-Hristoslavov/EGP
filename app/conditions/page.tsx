"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { siteConfig } from "@/config/site";
import { Search, Filter, Grid, List, ArrowLeft, Info, Plus, Clock, CheckCircle } from "lucide-react";
import Link from 'next/link';

// Conditions data with detailed information
const conditionsData = {
  // FACE CONDITIONS
  'acne-acne-scarring': {
    name: 'Acne & Acne Scarring',
    category: 'Face',
    description: 'Comprehensive treatment for active acne and scar reduction',
    details: 'Our advanced acne treatments combine medical-grade products with professional techniques to clear active breakouts and reduce the appearance of acne scars. We offer various approaches including chemical peels, microneedling, and laser treatments.',
    treatments: ['Chemical Peels', 'Microneedling', 'Laser Therapy', 'Medical Skincare'],
    severity: ['Mild', 'Moderate', 'Severe'],
    duration: '60-90 minutes',
    sessions: '3-6 sessions'
  },
  'rosacea': {
    name: 'Rosacea',
    category: 'Face',
    description: 'Specialized treatment for rosacea and facial redness',
    details: 'Rosacea treatment focuses on reducing facial redness, inflammation, and visible blood vessels. Our gentle yet effective treatments help calm irritated skin and improve overall complexion.',
    treatments: ['Laser Therapy', 'Gentle Chemical Peels', 'Medical Skincare', 'Light Therapy'],
    severity: ['Mild', 'Moderate'],
    duration: '45-60 minutes',
    sessions: '4-8 sessions'
  },
  'hyperpigmentation-melasma': {
    name: 'Hyperpigmentation & Melasma',
    category: 'Face',
    description: 'Advanced treatments for dark spots and uneven skin tone',
    details: 'Hyperpigmentation treatments target dark spots, age spots, and melasma using advanced lightening agents, chemical peels, and laser technology to achieve even, radiant skin tone.',
    treatments: ['Chemical Peels', 'Laser Therapy', 'Medical Skincare', 'Microneedling'],
    severity: ['Mild', 'Moderate', 'Severe'],
    duration: '45-90 minutes',
    sessions: '4-10 sessions'
  },
  'barcode-lines-around-lips': {
    name: 'Barcode Lines Around Lips',
    category: 'Face',
    description: 'Treatment for vertical lines around the mouth area',
    details: 'Barcode lines around the lips are treated with targeted botulinum toxin injections to smooth the vertical lines that form around the mouth, creating a more youthful appearance.',
    treatments: ['Anti-Wrinkle Injections', 'Dermal Fillers', 'Laser Therapy'],
    severity: ['Mild', 'Moderate'],
    duration: '30 minutes',
    sessions: '1-2 sessions'
  },
  'bruxism': {
    name: 'Bruxism (Teeth Grinding)',
    category: 'Face',
    description: 'Treatment for teeth grinding and jaw tension',
    details: 'Bruxism treatment uses botulinum toxin injections to relax the masseter muscles, reducing teeth grinding, jaw clenching, and associated pain while protecting your teeth.',
    treatments: ['Anti-Wrinkle Injections', 'Muscle Relaxation Therapy'],
    severity: ['Mild', 'Moderate', 'Severe'],
    duration: '45 minutes',
    sessions: '2-3 sessions'
  },
  'dark-under-eye-circles': {
    name: 'Dark Under-Eye Circles',
    category: 'Face',
    description: 'Specialized treatment for under-eye dark circles and hollows',
    details: 'Dark under-eye circles are treated using a combination of dermal fillers, specialized skincare, and sometimes laser therapy to brighten the eye area and reduce shadows.',
    treatments: ['Tear Trough Fillers', 'Medical Skincare', 'Laser Therapy', 'Microneedling'],
    severity: ['Mild', 'Moderate'],
    duration: '60 minutes',
    sessions: '2-4 sessions'
  },
  'double-chin': {
    name: 'Double Chin',
    category: 'Face',
    description: 'Non-surgical treatment for chin and jawline contouring',
    details: 'Double chin treatment uses advanced techniques including fat-dissolving injections and skin tightening to create a more defined jawline and reduce excess fat under the chin.',
    treatments: ['Fat Dissolving Injections', 'Skin Tightening', 'Dermal Fillers', 'Ultrasound Therapy'],
    severity: ['Mild', 'Moderate'],
    duration: '45-60 minutes',
    sessions: '2-4 sessions'
  },
  'nasolabial-folds': {
    name: 'Nasolabial Folds',
    category: 'Face',
    description: 'Treatment for lines extending from nose to mouth corners',
    details: 'Nasolabial folds are treated with dermal fillers to smooth the lines that extend from the nose to the corners of the mouth, restoring youthful facial contours.',
    treatments: ['Dermal Fillers', 'Skin Tightening', 'Chemical Peels'],
    severity: ['Mild', 'Moderate', 'Severe'],
    duration: '45 minutes',
    sessions: '1-2 sessions'
  },
  'shadows-around-nasolabial-folds': {
    name: 'Shadows Around Nasolabial Folds',
    category: 'Face',
    description: 'Treatment for shadowing and hollowing in the mid-face area',
    details: 'Shadows around nasolabial folds are addressed using strategic dermal filler placement to restore volume and eliminate the appearance of hollowing in the mid-face area.',
    treatments: ['Dermal Fillers', 'Skin Boosters', 'Laser Therapy'],
    severity: ['Mild', 'Moderate'],
    duration: '45-60 minutes',
    sessions: '1-2 sessions'
  },
  'under-eye-hollows': {
    name: 'Under-Eye Hollows',
    category: 'Face',
    description: 'Treatment for under-eye hollows and tear troughs',
    details: 'Under-eye hollows are treated with specialized tear trough fillers to restore volume and eliminate the sunken appearance, creating a more refreshed and youthful look.',
    treatments: ['Tear Trough Fillers', 'Skin Boosters', 'Laser Therapy'],
    severity: ['Mild', 'Moderate', 'Severe'],
    duration: '60 minutes',
    sessions: '1-2 sessions'
  },
  'eye-bags': {
    name: 'Eye Bags',
    category: 'Face',
    description: 'Treatment for under-eye puffiness and bags',
    details: 'Eye bags are treated using a combination of dermal fillers to smooth the area and sometimes surgical techniques to remove excess skin and fat for a more refreshed appearance.',
    treatments: ['Dermal Fillers', 'Skin Tightening', 'Laser Therapy'],
    severity: ['Mild', 'Moderate'],
    duration: '45-60 minutes',
    sessions: '1-2 sessions'
  },
  'flat-cheeks': {
    name: 'Flat Cheeks',
    category: 'Face',
    description: 'Cheek enhancement and volume restoration',
    details: 'Flat cheeks are enhanced using dermal fillers to restore volume and create more defined, youthful cheekbones and mid-face contours.',
    treatments: ['Cheek Fillers', 'Skin Tightening', 'Laser Therapy'],
    severity: ['Mild', 'Moderate', 'Severe'],
    duration: '60 minutes',
    sessions: '1-2 sessions'
  },
  'flat-pebble-chin': {
    name: 'Flat / Pebble Chin',
    category: 'Face',
    description: 'Chin enhancement and contouring treatment',
    details: 'Flat or pebble chin is enhanced using dermal fillers or botulinum toxin injections to create better chin projection and smoother texture.',
    treatments: ['Chin Fillers', 'Anti-Wrinkle Injections', 'Skin Smoothing'],
    severity: ['Mild', 'Moderate'],
    duration: '45 minutes',
    sessions: '1-2 sessions'
  },
  'gummy-smile': {
    name: 'Gummy Smile',
    category: 'Face',
    description: 'Treatment to reduce excessive gum exposure when smiling',
    details: 'Gummy smile is treated with botulinum toxin injections to relax the upper lip muscles, reducing excessive gum exposure and creating a more balanced smile.',
    treatments: ['Anti-Wrinkle Injections', 'Muscle Relaxation'],
    severity: ['Mild', 'Moderate'],
    duration: '30 minutes',
    sessions: '1-2 sessions'
  },
  'heavy-lower-face': {
    name: 'Heavy Lower Face',
    category: 'Face',
    description: 'Lower face contouring and lifting treatment',
    details: 'Heavy lower face is addressed using a combination of dermal fillers and botulinum toxin injections to create better definition and lift in the lower face area.',
    treatments: ['Jawline Fillers', 'Anti-Wrinkle Injections', 'Skin Tightening'],
    severity: ['Mild', 'Moderate', 'Severe'],
    duration: '60-90 minutes',
    sessions: '2-3 sessions'
  },
  'jowling': {
    name: 'Jowling',
    category: 'Face',
    description: 'Treatment for sagging jawline and jowls',
    details: 'Jowling is treated using advanced skin tightening techniques, dermal fillers, and sometimes surgical procedures to restore a more defined jawline.',
    treatments: ['Skin Tightening', 'Jawline Fillers', 'Ultrasound Therapy'],
    severity: ['Mild', 'Moderate', 'Severe'],
    duration: '60-90 minutes',
    sessions: '3-6 sessions'
  },
  'low-eyebrows': {
    name: 'Low Eyebrows',
    category: 'Face',
    description: 'Brow lifting and positioning treatment',
    details: 'Low eyebrows are lifted using botulinum toxin injections to create a more lifted, youthful brow position and open up the eye area.',
    treatments: ['Brow Lift Injections', 'Anti-Wrinkle Injections'],
    severity: ['Mild', 'Moderate'],
    duration: '30 minutes',
    sessions: '1-2 sessions'
  },

  // BODY CONDITIONS
  'cellulite-thighs-buttocks-abdomen': {
    name: 'Cellulite (Thighs, Buttocks, Abdomen)',
    category: 'Body',
    description: 'Advanced cellulite reduction treatment for multiple areas',
    details: 'Cellulite treatment combines radiofrequency, ultrasound, and specialized massage techniques to break down fat deposits and improve skin texture in the thighs, buttocks, and abdomen.',
    treatments: ['Radiofrequency Therapy', 'Ultrasound Treatment', 'Specialized Massage', 'Skin Tightening'],
    severity: ['Mild', 'Moderate', 'Severe'],
    duration: '90 minutes',
    sessions: '6-12 sessions'
  },
  'stubborn-belly-fat-abdominal-fat': {
    name: 'Stubborn Belly Fat / Abdominal Fat',
    category: 'Body',
    description: 'Targeted fat reduction for abdominal area',
    details: 'Stubborn belly fat is treated using fat-freezing technology, mesotherapy, and radiofrequency to reduce localized fat deposits and tighten the abdominal area.',
    treatments: ['Fat Freezing', 'Mesotherapy', 'Radiofrequency', 'Skin Tightening'],
    severity: ['Mild', 'Moderate', 'Severe'],
    duration: '60-90 minutes',
    sessions: '4-8 sessions'
  },
  'love-handles-flanks': {
    name: 'Love Handles / Flanks',
    category: 'Body',
    description: 'Contouring treatment for side body fat',
    details: 'Love handles and flank fat are targeted using fat-freezing technology and skin tightening treatments to create a more contoured waistline.',
    treatments: ['Fat Freezing', 'Skin Tightening', 'Radiofrequency', 'Ultrasound'],
    severity: ['Mild', 'Moderate'],
    duration: '60-75 minutes',
    sessions: '4-6 sessions'
  },
  'sagging-skin-skin-laxity': {
    name: 'Sagging Skin (Skin Laxity)',
    category: 'Body',
    description: 'Comprehensive skin tightening treatment',
    details: 'Sagging skin is treated using advanced radiofrequency and ultrasound technology to stimulate collagen production and tighten loose skin.',
    treatments: ['Radiofrequency', 'Ultrasound Therapy', 'Skin Tightening', 'Laser Therapy'],
    severity: ['Mild', 'Moderate', 'Severe'],
    duration: '60-90 minutes',
    sessions: '6-10 sessions'
  },
  'stretch-marks': {
    name: 'Stretch Marks',
    category: 'Body',
    description: 'Treatment for stretch marks and skin texture improvement',
    details: 'Stretch marks are treated using microneedling, laser therapy, and specialized skincare to improve skin texture and reduce the appearance of stretch marks.',
    treatments: ['Microneedling', 'Laser Therapy', 'Medical Skincare', 'Radiofrequency'],
    severity: ['Mild', 'Moderate', 'Severe'],
    duration: '45-75 minutes',
    sessions: '6-12 sessions'
  },
  'arm-fat-bingo-wings': {
    name: 'Arm Fat & "Bingo Wings"',
    category: 'Body',
    description: 'Arm contouring and skin tightening treatment',
    details: 'Arm fat and loose skin are treated using fat-freezing technology and skin tightening treatments to create more toned, defined arms.',
    treatments: ['Fat Freezing', 'Skin Tightening', 'Radiofrequency', 'Ultrasound'],
    severity: ['Mild', 'Moderate', 'Severe'],
    duration: '60-75 minutes',
    sessions: '4-8 sessions'
  },
  'thigh-fat-inner-thigh-laxity': {
    name: 'Thigh Fat & Inner Thigh Laxity',
    category: 'Body',
    description: 'Inner thigh contouring and tightening',
    details: 'Inner thigh fat and skin laxity are addressed using fat-freezing technology and skin tightening treatments to create smoother, more toned inner thighs.',
    treatments: ['Fat Freezing', 'Skin Tightening', 'Radiofrequency', 'Mesotherapy'],
    severity: ['Mild', 'Moderate', 'Severe'],
    duration: '60-90 minutes',
    sessions: '4-8 sessions'
  },
  'double-chin-jawline-fat': {
    name: 'Double Chin / Jawline Fat',
    category: 'Body',
    description: 'Jawline and chin contouring treatment',
    details: 'Double chin and jawline fat are treated using fat-dissolving injections and skin tightening to create a more defined jawline and eliminate excess chin fat.',
    treatments: ['Fat Dissolving Injections', 'Skin Tightening', 'Ultrasound Therapy', 'Dermal Fillers'],
    severity: ['Mild', 'Moderate'],
    duration: '45-60 minutes',
    sessions: '2-4 sessions'
  },
  'post-pregnancy-tummy': {
    name: 'Post-Pregnancy Tummy',
    category: 'Body',
    description: 'Post-pregnancy abdominal restoration treatment',
    details: 'Post-pregnancy tummy concerns are addressed using a combination of skin tightening, fat reduction, and muscle toning treatments to restore pre-pregnancy contours.',
    treatments: ['Skin Tightening', 'Fat Freezing', 'Radiofrequency', 'Ultrasound Therapy'],
    severity: ['Mild', 'Moderate', 'Severe'],
    duration: '75-90 minutes',
    sessions: '6-12 sessions'
  },
  'water-retention-bloating-swelling': {
    name: 'Water Retention / Bloating / Swelling',
    category: 'Body',
    description: 'Lymphatic drainage and swelling reduction treatment',
    details: 'Water retention and swelling are treated using lymphatic drainage massage, specialized treatments, and lifestyle recommendations to reduce bloating and improve circulation.',
    treatments: ['Lymphatic Drainage', 'Specialized Massage', 'Radiofrequency', 'Ultrasound Therapy'],
    severity: ['Mild', 'Moderate'],
    duration: '60-75 minutes',
    sessions: '4-8 sessions'
  }
};

const categories = [
  'All',
  'Face',
  'Body'
];

const severityLevels = [
  { label: 'All Severities', value: 'All' },
  { label: 'Mild', value: 'Mild' },
  { label: 'Moderate', value: 'Moderate' },
  { label: 'Severe', value: 'Severe' }
];

const sessionRanges = [
  { label: 'All Sessions', min: 0, max: Infinity },
  { label: '1-3 sessions', min: 1, max: 3 },
  { label: '4-6 sessions', min: 4, max: 6 },
  { label: '7-10 sessions', min: 7, max: 10 },
  { label: '10+ sessions', min: 10, max: Infinity }
];

function ConditionsPageContent() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All Severities');
  const [selectedSessionRange, setSelectedSessionRange] = useState('All Sessions');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  
  const itemsPerPage = 12;

  // Handle URL parameters
  useEffect(() => {
    const category = searchParams.get('category');
    if (category && categories.includes(category)) {
      setSelectedCategory(category);
      setShowFilters(true);
    }
  }, [searchParams]);

  // Filter conditions based on selected criteria
  const filteredConditions = useMemo(() => {
    return Object.entries(conditionsData).filter(([conditionId, condition]) => {
      const matchesCategory = selectedCategory === 'All' || condition.category === selectedCategory;
      const matchesSeverity = selectedSeverity === 'All Severities' || condition.severity.includes(selectedSeverity);
      const selectedRange = sessionRanges.find(range => range.label === selectedSessionRange);
      const matchesSessionRange = selectedRange ? (
        selectedRange.min <= parseInt(condition.sessions.split('-')[0]) && 
        selectedRange.max >= parseInt(condition.sessions.split('-')[condition.sessions.split('-').length - 1].split(' ')[0])
      ) : true;
      const matchesSearch = condition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           condition.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           condition.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesSeverity && matchesSessionRange && matchesSearch;
    });
  }, [selectedCategory, selectedSeverity, selectedSessionRange, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredConditions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedConditions = filteredConditions.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filters change
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);
    switch (filterType) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'severity':
        setSelectedSeverity(value);
        break;
      case 'sessions':
        setSelectedSessionRange(value);
        break;
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const renderConditionModal = () => {
    if (!selectedCondition) return null;
    
    const condition = conditionsData[selectedCondition as keyof typeof conditionsData];
    if (!condition) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white px-8 py-6 flex items-center justify-between rounded-t-2xl flex-shrink-0">
            <div>
              <h2 className="text-3xl font-bold mb-2">{condition.name}</h2>
              <div className="flex items-center gap-4 text-rose-100">
                <span className="flex items-center gap-1 text-lg">
                  <Clock className="w-5 h-5" />
                  {condition.duration}
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{condition.category}</span>
                <span className="text-sm">{condition.sessions}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedCondition(null)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6 overflow-y-auto flex-1">
            {/* Description */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-rose-500" />
                Overview
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {condition.description}
              </p>
            </div>

            {/* Details */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Treatment Details
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {condition.details}
              </p>
            </div>

            {/* Treatments */}
            {condition.treatments && condition.treatments.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Available Treatments
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {condition.treatments.map((treatment, index) => (
                    <div key={index} className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{treatment}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Severity Levels */}
            {condition.severity && condition.severity.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-500">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Severity Levels
                </h3>
                <div className="flex flex-wrap gap-2">
                  {condition.severity.map((level, index) => (
                    <span key={index} className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                      {level}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Button */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href={`/book?condition=${selectedCondition}`}
                onClick={() => setSelectedCondition(null)}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl block text-center"
              >
                Book Treatment for This Condition
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 font-playfair">
            Conditions We Treat
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 font-montserrat font-light max-w-3xl mx-auto">
            Discover our comprehensive range of treatments for various aesthetic concerns and conditions
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search conditions..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>

            {/* View Mode */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-rose-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-rose-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Severity Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Severity Level
                  </label>
                  <select
                    value={selectedSeverity}
                    onChange={(e) => handleFilterChange('severity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {severityLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                {/* Sessions Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Treatment Sessions
                  </label>
                  <select
                    value={selectedSessionRange}
                    onChange={(e) => handleFilterChange('sessions', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {sessionRanges.map(range => (
                      <option key={range.label} value={range.label}>{range.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredConditions.length} of {Object.keys(conditionsData).length} conditions
          </p>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedSeverity('All Severities');
                setSelectedSessionRange('All Sessions');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Conditions Grid/List */}
        {paginatedConditions.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No conditions found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedSeverity('All Severities');
                setSelectedSessionRange('All Sessions');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all"
            >
              Show All Conditions
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {paginatedConditions.map(([conditionId, condition]) => (
              <div
                key={conditionId}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden ${
                  viewMode === 'list' ? 'flex items-center p-8' : 'p-0'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Image Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10"></div>
                      <div className="text-center z-10">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Condition Image</p>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{condition.name}</h3>
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-3">
                          {condition.category}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed text-sm line-clamp-2">
                        {condition.description}
                      </p>
                      <div className="flex items-center justify-between mb-6">
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {condition.duration}
                        </span>
                        <span className="text-sm text-gray-500">
                          {condition.sessions}
                        </span>
                      </div>
                      
                      {/* Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => setSelectedCondition(conditionId)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium text-sm"
                        >
                          <Info className="w-4 h-4" />
                          Details
                        </button>
                        <Link
                          href={`/book?condition=${conditionId}`}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all font-medium text-sm shadow-md hover:shadow-lg"
                        >
                          <Plus className="w-4 h-4" />
                          Book
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* List View with Image */}
                    <div className="w-32 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg flex items-center justify-center mr-6 flex-shrink-0">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-1">
                          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400">Image</p>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{condition.name}</h3>
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-4">
                          {condition.category}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                        {condition.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {condition.duration}
                        </span>
                        <span>
                          {condition.sessions}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-6 flex-shrink-0">
                      <button
                        onClick={() => setSelectedCondition(conditionId)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 border border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium text-sm"
                      >
                        <Info className="w-4 h-4" />
                        Details
                      </button>
                      <Link
                        href={`/book?condition=${conditionId}`}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all font-medium text-sm shadow-md hover:shadow-lg"
                      >
                        <Plus className="w-4 h-4" />
                        Book
                      </Link>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-rose-500 text-white'
                    : 'border border-gray-300 dark:border-gray-600 hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Condition Modal */}
        {renderConditionModal()}
      </div>
    </div>
  );
}

export default function ConditionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ConditionsPageContent />
    </Suspense>
  );
}