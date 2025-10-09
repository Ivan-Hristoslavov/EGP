"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { siteConfig } from "@/config/site";
import { Search, Filter, Grid, List, ArrowLeft, Info, Plus, Clock, CheckCircle } from "lucide-react";
import Link from 'next/link';

// Service data from the booking system
const servicesData = {
  // FACE Services
  'book-treatment-now': { 
    name: 'Free Discovery Consultation', 
    price: 50, 
    category: 'Face', 
    duration: 30,
    description: 'Comprehensive skin analysis and personalized treatment plan consultation',
    details: 'Our expert practitioners will assess your skin condition, discuss your concerns and goals, and create a customized treatment plan. Includes detailed skin analysis, treatment recommendations, and transparent pricing information.',
    benefits: ['Expert skin assessment', 'Personalized treatment plan', 'Transparent pricing', 'Professional advice'],
    preparation: 'Come with clean skin, no makeup. Bring any current skincare products.',
    aftercare: 'No special aftercare required. Follow practitioner recommendations for next steps.'
  },
  'digital-skin-analysis': { 
    name: 'Digital Skin Analysis', 
    price: 50, 
    category: 'Face', 
    duration: 45,
    description: 'Advanced digital analysis of your skin condition and concerns',
    details: 'Using state-of-the-art digital imaging technology, we capture detailed images of your skin to analyze texture, pigmentation, pores, and underlying skin conditions. This comprehensive assessment helps identify specific concerns and track treatment progress over time.',
    benefits: ['Detailed skin mapping', 'Progress tracking', 'Personalized recommendations', 'Professional documentation'],
    preparation: 'Clean, makeup-free skin required. Avoid retinoids 48 hours prior.',
    aftercare: 'Receive detailed analysis report with recommendations for home care.'
  },
  'prp': { 
    name: 'PRP (Platelet-Rich Plasma)', 
    price: 480, 
    category: 'Face', 
    duration: 60,
    description: 'Natural skin rejuvenation using your own blood platelets',
    details: 'PRP therapy uses your own blood platelets to stimulate natural healing and collagen production. Blood is drawn, processed to concentrate platelets, and injected back into targeted areas. This promotes skin regeneration, reduces fine lines, improves texture, and enhances overall skin quality.',
    benefits: ['Natural skin regeneration', 'Reduced fine lines and wrinkles', 'Improved skin texture', 'Stimulates collagen production', 'Minimal downtime', 'Long-lasting results'],
    preparation: 'Avoid blood thinners 1 week prior. Hydrate well. No alcohol 24 hours before.',
    aftercare: 'Avoid sun exposure for 48 hours. Use gentle skincare. No makeup for 12 hours. Results improve over 3-6 months.'
  },
  'exosomes': { 
    name: 'Exosomes', 
    price: 550, 
    category: 'Face', 
    duration: 60,
    description: 'Advanced regenerative therapy using stem cell-derived exosomes',
    details: 'Exosomes are tiny vesicles derived from stem cells that contain growth factors and proteins essential for cellular repair and regeneration. When applied to the skin, they promote healing, reduce inflammation, improve texture, and enhance skin quality without the risks associated with live stem cells.',
    benefits: ['Advanced cellular repair', 'Reduced inflammation', 'Improved skin texture', 'Enhanced healing', 'Safe and effective'],
    preparation: 'Clean skin required. Avoid retinoids 48 hours prior. Stay hydrated.',
    aftercare: 'Gentle skincare for 48 hours. Avoid sun exposure. Results visible in 2-4 weeks.'
  },
  'polynucleotides': { 
    name: 'Polynucleotides', 
    price: 390, 
    category: 'Face', 
    duration: 45,
    description: 'DNA-based therapy for skin rejuvenation and hydration',
    details: 'Polynucleotides are fragments of DNA that promote cellular repair and regeneration. They improve skin hydration, reduce inflammation, enhance collagen production, and provide antioxidant protection. This treatment is particularly effective for aging skin, dehydration, and improving overall skin quality.',
    benefits: ['Enhanced hydration', 'Improved skin texture', 'Reduced inflammation', 'Antioxidant protection', 'Cellular repair'],
    preparation: 'Clean, makeup-free skin. Avoid retinoids 48 hours prior.',
    aftercare: 'Gentle skincare for 24 hours. Avoid sun exposure. Use hydrating products.'
  },
  '5-point-facelift': { 
    name: '5-Point Facelift', 
    price: 950, 
    category: 'Face', 
    duration: 90,
    description: 'Comprehensive facial lifting using strategic injection points',
    details: 'The 5-point facelift targets five key areas of the face to create a natural lifting effect. Using advanced dermal fillers, we restore volume, lift sagging skin, and create a more youthful appearance. This non-surgical approach provides immediate results with minimal downtime.',
    benefits: ['Natural lifting effect', 'Immediate results', 'Non-surgical', 'Minimal downtime', 'Long-lasting'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required. Stay hydrated.',
    aftercare: 'Avoid touching treated areas. No makeup for 12 hours. Gentle massage as instructed.'
  },
  'profhilo': { 
    name: 'Profhilo', 
    price: 390, 
    category: 'Face', 
    duration: 45,
    description: 'Hyaluronic acid treatment for skin hydration and tightening',
    details: 'Profhilo is a unique hyaluronic acid treatment that provides deep hydration while stimulating collagen and elastin production. It improves skin quality, reduces fine lines, and creates a natural lifting effect. The treatment works gradually over time for natural-looking results.',
    benefits: ['Deep hydration', 'Skin tightening', 'Collagen stimulation', 'Natural results', 'Gradual improvement'],
    preparation: 'Clean skin required. Avoid retinoids 48 hours prior.',
    aftercare: 'Gentle skincare for 48 hours. Avoid sun exposure. Results develop over 4-8 weeks.'
  },
  'sculptra': { 
    name: 'Sculptra', 
    price: 790, 
    category: 'Face', 
    duration: 60,
    description: 'Poly-L-lactic acid for gradual facial volume restoration',
    details: 'Sculptra stimulates your body\'s own collagen production to gradually restore facial volume and improve skin texture. This treatment is ideal for addressing volume loss, improving skin quality, and creating natural-looking results that develop over several months.',
    benefits: ['Gradual volume restoration', 'Collagen stimulation', 'Natural results', 'Long-lasting effects', 'Improves skin texture'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Massage treated areas as instructed. Avoid sun exposure. Results develop over 3-6 months.'
  },
  'skin-boosters': { 
    name: 'Skin Boosters', 
    price: 230, 
    category: 'Face', 
    duration: 45,
    description: 'Hyaluronic acid injections for deep skin hydration',
    details: 'Skin boosters deliver hyaluronic acid directly into the skin for deep hydration and improved texture. This treatment addresses dehydration, fine lines, and improves overall skin quality. Results are immediate with continued improvement over several weeks.',
    benefits: ['Deep hydration', 'Improved skin texture', 'Reduced fine lines', 'Immediate results', 'Natural appearance'],
    preparation: 'Clean, makeup-free skin required.',
    aftercare: 'Gentle skincare for 24 hours. Avoid sun exposure. Use hydrating products.'
  },
  'deep-cleansing-facial': { 
    name: 'Deep Cleansing Facial', 
    price: 170, 
    category: 'Face', 
    duration: 60,
    description: 'Professional deep cleansing and exfoliation treatment',
    details: 'Our deep cleansing facial includes thorough cleansing, exfoliation, extractions, and deep pore cleaning. This treatment removes impurities, unclogs pores, and leaves your skin feeling refreshed and revitalized. Perfect for acne-prone or congested skin.',
    benefits: ['Deep pore cleaning', 'Acne treatment', 'Improved skin texture', 'Reduced congestion', 'Refreshed appearance'],
    preparation: 'Clean skin preferred. Avoid retinoids 48 hours prior.',
    aftercare: 'Use gentle skincare for 48 hours. Avoid sun exposure. Follow recommended routine.'
  },
  'medical-skin-peels': { 
    name: 'Medical Skin Peels', 
    price: 200, 
    category: 'Face', 
    duration: 45,
    description: 'Professional chemical peels for skin renewal and improvement',
    details: 'Medical-grade chemical peels remove damaged skin layers to reveal smoother, more even-toned skin underneath. We use various acid formulations to address specific concerns like acne, pigmentation, fine lines, and uneven texture.',
    benefits: ['Skin renewal', 'Improved texture', 'Reduced pigmentation', 'Acne treatment', 'Even skin tone'],
    preparation: 'Avoid retinoids 1 week prior. Clean skin required.',
    aftercare: 'Gentle skincare only. Avoid sun exposure. Follow peeling schedule.'
  },
  'deep-hydra-detox-facial': { 
    name: 'Deep Hydra Detox Facial', 
    price: 200, 
    category: 'Face', 
    duration: 60,
    description: 'Hydrating and detoxifying facial treatment',
    details: 'This comprehensive treatment combines deep cleansing, detoxification, and intensive hydration. It removes toxins and impurities while delivering deep moisture to dehydrated skin. Perfect for stressed, dull, or dehydrated skin.',
    benefits: ['Deep hydration', 'Toxin removal', 'Improved radiance', 'Stress relief', 'Skin detoxification'],
    preparation: 'Clean skin required. Avoid retinoids 48 hours prior.',
    aftercare: 'Use hydrating products. Avoid sun exposure. Maintain hydration.'
  },
  'nctf-under-eye-skin-booster': { 
    name: 'NCTF Under-Eye Skin Booster', 
    price: 159, 
    category: 'Face', 
    duration: 30,
    description: 'Specialized treatment for under-eye area rejuvenation',
    details: 'NCTF (New Cellular Treatment Factor) is specifically designed for the delicate under-eye area. It provides hydration, reduces fine lines, improves texture, and addresses dark circles. The treatment uses mesotherapy techniques for optimal absorption.',
    benefits: ['Reduced fine lines', 'Improved hydration', 'Brighter under-eyes', 'Better texture', 'Targeted treatment'],
    preparation: 'Clean skin required. Remove eye makeup thoroughly.',
    aftercare: 'Gentle eye care products only. Avoid rubbing. Use eye cream as recommended.'
  },
  '3-step-under-eye-treatment': { 
    name: '3-Step Under-Eye Treatment', 
    price: 390, 
    category: 'Face', 
    duration: 60,
    description: 'Comprehensive under-eye rejuvenation treatment',
    details: 'Our signature 3-step under-eye treatment combines multiple techniques to address all aspects of under-eye concerns. This includes hydration, firming, and brightening treatments to reduce fine lines, dark circles, and puffiness.',
    benefits: ['Comprehensive treatment', 'Multiple benefits', 'Reduced fine lines', 'Brighter appearance', 'Firmer skin'],
    preparation: 'Clean skin required. Remove all eye makeup.',
    aftercare: 'Use gentle eye products. Avoid rubbing. Follow specific eye care routine.'
  },
  'injectable-mesotherapy': { 
    name: 'Injectable Mesotherapy', 
    price: 170, 
    category: 'Face', 
    duration: 45,
    description: 'Micro-injections for targeted skin improvement',
    details: 'Injectable mesotherapy delivers active ingredients directly into the skin using micro-injections. This treatment can address various concerns including hydration, pigmentation, acne, and skin texture. The ingredients are customized based on your specific needs.',
    benefits: ['Targeted treatment', 'Customized ingredients', 'Improved skin quality', 'Reduced concerns', 'Natural approach'],
    preparation: 'Clean skin required. Avoid retinoids 48 hours prior.',
    aftercare: 'Gentle skincare for 48 hours. Avoid sun exposure. Follow ingredient-specific care.'
  },
  'microneedling-facial': { 
    name: 'Microneedling Facial', 
    price: 170, 
    category: 'Face', 
    duration: 60,
    description: 'Collagen induction therapy for skin renewal',
    details: 'Microneedling creates controlled micro-injuries in the skin to stimulate natural healing and collagen production. This treatment improves skin texture, reduces fine lines, scars, and pigmentation while enhancing overall skin quality.',
    benefits: ['Collagen stimulation', 'Improved texture', 'Reduced scars', 'Better pigmentation', 'Skin renewal'],
    preparation: 'Clean skin required. Avoid retinoids 1 week prior.',
    aftercare: 'Gentle skincare for 72 hours. Avoid sun exposure. Use healing products.'
  },
  'full-face-balancing': { 
    name: 'Full Face Balancing', 
    price: 790, 
    category: 'Face', 
    duration: 90,
    description: 'Comprehensive facial harmony and balance treatment',
    details: 'Full face balancing addresses overall facial proportions and symmetry using advanced techniques. This comprehensive treatment may include multiple modalities to achieve natural-looking results and facial harmony.',
    benefits: ['Facial harmony', 'Improved proportions', 'Natural results', 'Comprehensive approach', 'Balanced appearance'],
    preparation: 'Clean skin required. Avoid blood thinners 1 week prior.',
    aftercare: 'Follow specific care instructions. Avoid sun exposure. Gentle skincare.'
  },

  // ANTI-WRINKLE INJECTIONS
  'baby-botox': { 
    name: 'Baby Botox', 
    price: 199, 
    category: 'Anti-Wrinkle Injections', 
    duration: 30,
    description: 'Subtle botulinum toxin treatment for natural-looking results',
    details: 'Baby Botox uses smaller doses of botulinum toxin to create more subtle, natural-looking results. This treatment is perfect for younger patients or those who want to prevent wrinkles while maintaining natural facial expressions.',
    benefits: ['Natural-looking results', 'Preventive treatment', 'Subtle effect', 'Maintains expressions', 'Long-lasting'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Avoid lying down 4 hours post-treatment. No exercise for 24 hours. Results appear in 3-7 days.'
  },
  'brow-lift': { 
    name: 'Brow Lift', 
    price: 279, 
    category: 'Anti-Wrinkle Injections', 
    duration: 30,
    description: 'Botulinum toxin treatment to lift and shape eyebrows',
    details: 'Brow lift treatment uses strategic botulinum toxin injections to lift drooping eyebrows and create a more youthful, alert appearance. This non-surgical approach can significantly improve the overall appearance of the upper face.',
    benefits: ['Lifted eyebrows', 'Youthful appearance', 'Alert look', 'Non-surgical', 'Quick procedure'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Avoid lying down 4 hours. No exercise for 24 hours. Results in 3-7 days.'
  },
  'eye-wrinkles': { 
    name: 'Eye Wrinkles (Crow\'s Feet)', 
    price: 179, 
    category: 'Anti-Wrinkle Injections', 
    duration: 30,
    description: 'Treatment for fine lines around the eyes',
    details: 'This treatment targets the fine lines and wrinkles around the eyes (crow\'s feet) using botulinum toxin. It smooths the skin while maintaining natural eye movement and expression.',
    benefits: ['Smoother eye area', 'Reduced crow\'s feet', 'Natural movement', 'Quick treatment', 'Effective results'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Avoid lying down 4 hours. No exercise for 24 hours. Results in 3-7 days.'
  },
  'forehead-lines': { 
    name: 'Forehead Lines', 
    price: 179, 
    category: 'Anti-Wrinkle Injections', 
    duration: 30,
    description: 'Treatment for horizontal forehead lines',
    details: 'Forehead line treatment smooths horizontal lines across the forehead using botulinum toxin. This creates a smoother, more youthful appearance while maintaining natural facial expressions.',
    benefits: ['Smoother forehead', 'Reduced lines', 'Youthful appearance', 'Natural expressions', 'Long-lasting'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Avoid lying down 4 hours. No exercise for 24 hours. Results in 3-7 days.'
  },
  'glabella-lines': { 
    name: 'Glabella Lines (Frown Lines)', 
    price: 179, 
    category: 'Anti-Wrinkle Injections', 
    duration: 30,
    description: 'Treatment for vertical lines between eyebrows',
    details: 'Glabella line treatment targets the vertical lines between the eyebrows (frown lines) using botulinum toxin. This creates a smoother, more relaxed appearance between the brows.',
    benefits: ['Smoother brow area', 'Reduced frown lines', 'Relaxed appearance', 'Quick treatment', 'Effective results'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Avoid lying down 4 hours. No exercise for 24 hours. Results in 3-7 days.'
  },
  'barcode-lips': { 
    name: 'Barcode Lips', 
    price: 129, 
    category: 'Anti-Wrinkle Injections', 
    duration: 30,
    description: 'Treatment for vertical lines around the lips',
    details: 'Barcode lip treatment targets the vertical lines around the lips using botulinum toxin. This creates smoother, more youthful-looking lips while maintaining natural lip movement.',
    benefits: ['Smoother lips', 'Reduced lip lines', 'Youthful appearance', 'Natural movement', 'Quick treatment'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Avoid lying down 4 hours. No exercise for 24 hours. Results in 3-7 days.'
  },
  'bunny-lines': { 
    name: 'Bunny Lines', 
    price: 129, 
    category: 'Anti-Wrinkle Injections', 
    duration: 30,
    description: 'Treatment for lines on the nose when smiling',
    details: 'Bunny line treatment targets the small lines that appear on the sides of the nose when smiling. This creates a smoother appearance while maintaining natural facial expressions.',
    benefits: ['Smoother nose area', 'Reduced bunny lines', 'Natural expressions', 'Quick treatment', 'Subtle results'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Avoid lying down 4 hours. No exercise for 24 hours. Results in 3-7 days.'
  },
  'lip-lines': { 
    name: 'Lip Lines (Smoker\'s Lines)', 
    price: 179, 
    category: 'Anti-Wrinkle Injections', 
    duration: 30,
    description: 'Treatment for fine lines above the upper lip',
    details: 'Lip line treatment targets the fine lines above the upper lip using botulinum toxin. This creates smoother, more youthful-looking lips while maintaining natural lip function.',
    benefits: ['Smoother upper lip', 'Reduced lip lines', 'Youthful appearance', 'Natural function', 'Effective results'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Avoid lying down 4 hours. No exercise for 24 hours. Results in 3-7 days.'
  },
  'gummy-smile': { 
    name: 'Gummy Smile', 
    price: 129, 
    category: 'Anti-Wrinkle Injections', 
    duration: 30,
    description: 'Treatment to reduce excessive gum exposure when smiling',
    details: 'Gummy smile treatment uses botulinum toxin to relax the muscles that cause excessive gum exposure when smiling. This creates a more balanced, natural-looking smile.',
    benefits: ['Balanced smile', 'Reduced gum exposure', 'Natural appearance', 'Quick treatment', 'Effective results'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Avoid lying down 4 hours. No exercise for 24 hours. Results in 3-7 days.'
  },
  'neck-lift': { 
    name: 'Neck Lift', 
    price: 329, 
    category: 'Anti-Wrinkle Injections', 
    duration: 45,
    description: 'Botulinum toxin treatment for neck bands and lines',
    details: 'Neck lift treatment targets the vertical bands and horizontal lines in the neck area using botulinum toxin. This creates a smoother, more youthful neck appearance.',
    benefits: ['Smoother neck', 'Reduced neck bands', 'Youthful appearance', 'Firmer look', 'Long-lasting results'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Avoid lying down 4 hours. No exercise for 24 hours. Results in 3-7 days.'
  },
  'jaw-slimming': { 
    name: 'Jaw Slimming', 
    price: 279, 
    category: 'Anti-Wrinkle Injections', 
    duration: 45,
    description: 'Treatment to slim and contour the jawline',
    details: 'Jaw slimming treatment uses botulinum toxin to relax the masseter muscles, creating a slimmer, more contoured jawline. This is particularly effective for those with strong jaw muscles.',
    benefits: ['Slimmer jawline', 'Contoured appearance', 'Balanced face shape', 'Non-surgical', 'Natural results'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Avoid lying down 4 hours. No exercise for 24 hours. Results develop over 2-4 weeks.'
  },
  'pebble-chin': { 
    name: 'Pebble Chin', 
    price: 179, 
    category: 'Anti-Wrinkle Injections', 
    duration: 30,
    description: 'Treatment for chin dimpling and irregular texture',
    details: 'Pebble chin treatment targets the irregular texture and dimpling in the chin area using botulinum toxin. This creates a smoother, more even chin appearance.',
    benefits: ['Smoother chin', 'Reduced dimpling', 'Even texture', 'Natural appearance', 'Quick treatment'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Avoid lying down 4 hours. No exercise for 24 hours. Results in 3-7 days.'
  },
  'bruxism': { 
    name: 'Bruxism (Teeth Grinding)', 
    price: 279, 
    category: 'Anti-Wrinkle Injections', 
    duration: 45,
    description: 'Treatment for teeth grinding and jaw clenching',
    details: 'Bruxism treatment uses botulinum toxin to relax the masseter muscles responsible for teeth grinding and jaw clenching. This reduces muscle tension and protects teeth from damage.',
    benefits: ['Reduced teeth grinding', 'Less jaw tension', 'Tooth protection', 'Pain relief', 'Better sleep'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Avoid lying down 4 hours. No exercise for 24 hours. Results develop over 2-4 weeks.'
  },

  // FILLERS
  'cheek-mid-face-filler': { 
    name: 'Cheek & Mid-Face Filler', 
    price: 390, 
    category: 'Fillers', 
    duration: 60,
    description: 'Dermal filler treatment for cheek volume and mid-face enhancement',
    details: 'Cheek and mid-face filler treatment restores volume and enhances facial contours using hyaluronic acid fillers. This treatment addresses volume loss, lifts sagging skin, and creates a more youthful, defined appearance.',
    benefits: ['Restored cheek volume', 'Enhanced facial contours', 'Lifted appearance', 'Youthful look', 'Natural results'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required. Stay hydrated.',
    aftercare: 'Avoid touching treated areas. No makeup for 12 hours. Gentle massage as instructed. Results last 12-18 months.'
  },
  'chin-filler': { 
    name: 'Chin Filler', 
    price: 290, 
    category: 'Fillers', 
    duration: 45,
    description: 'Dermal filler treatment for chin enhancement and contouring',
    details: 'Chin filler treatment enhances chin projection and creates better facial balance using hyaluronic acid fillers. This can improve profile appearance and create a more defined jawline.',
    benefits: ['Enhanced chin projection', 'Better facial balance', 'Improved profile', 'Defined jawline', 'Natural enhancement'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Avoid touching treated areas. No makeup for 12 hours. Gentle massage as instructed. Results last 12-18 months.'
  },
  'marionette-lines-filler': { 
    name: 'Marionette Lines Filler', 
    price: 290, 
    category: 'Fillers', 
    duration: 45,
    description: 'Treatment for lines extending from mouth corners downward',
    details: 'Marionette lines filler treatment addresses the lines that extend from the corners of the mouth downward. Using hyaluronic acid fillers, this treatment smooths these lines and creates a more youthful appearance.',
    benefits: ['Smoother mouth area', 'Reduced marionette lines', 'Youthful appearance', 'Natural results', 'Improved smile'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Avoid touching treated areas. No makeup for 12 hours. Gentle massage as instructed. Results last 12-18 months.'
  },
  'nasolabial-folds-filler': { 
    name: 'Nasolabial Folds Filler', 
    price: 290, 
    category: 'Fillers', 
    duration: 45,
    description: 'Treatment for lines extending from nose to mouth corners',
    details: 'Nasolabial folds filler treatment addresses the lines that extend from the nose to the corners of the mouth. Using hyaluronic acid fillers, this treatment smooths these folds and creates a more youthful appearance.',
    benefits: ['Smoother mid-face', 'Reduced nasolabial folds', 'Youthful appearance', 'Natural enhancement', 'Improved facial contours'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Avoid touching treated areas. No makeup for 12 hours. Gentle massage as instructed. Results last 12-18 months.'
  },
  'jawline-filler': { 
    name: 'Jawline Filler', 
    price: 550, 
    category: 'Fillers', 
    duration: 60,
    description: 'Comprehensive jawline enhancement and contouring',
    details: 'Jawline filler treatment enhances and defines the jawline using hyaluronic acid fillers. This comprehensive treatment can improve facial structure, create better definition, and enhance overall facial harmony.',
    benefits: ['Defined jawline', 'Enhanced facial structure', 'Better definition', 'Improved harmony', 'Youthful contours'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Avoid touching treated areas. No makeup for 12 hours. Gentle massage as instructed. Results last 12-18 months.'
  },
  'lip-enhancement': { 
    name: 'Lip Enhancement', 
    price: 290, 
    category: 'Fillers', 
    duration: 45,
    description: 'Lip volume and shape enhancement using dermal fillers',
    details: 'Lip enhancement treatment adds volume, improves shape, and enhances the natural beauty of your lips using hyaluronic acid fillers. This treatment can create fuller, more defined lips while maintaining natural movement.',
    benefits: ['Fuller lips', 'Enhanced shape', 'Natural movement', 'Improved definition', 'Youthful appearance'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Avoid touching lips. No kissing for 24 hours. Gentle care. Results last 6-12 months.'
  },
  'lip-hydration': { 
    name: 'Lip Hydration', 
    price: 190, 
    category: 'Fillers', 
    duration: 30,
    description: 'Subtle lip enhancement focusing on hydration and texture',
    details: 'Lip hydration treatment provides subtle enhancement while focusing on improving lip texture and hydration. Using lighter hyaluronic acid fillers, this treatment creates natural-looking results with emphasis on smoothness and moisture.',
    benefits: ['Improved hydration', 'Better texture', 'Natural enhancement', 'Smooth appearance', 'Subtle results'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Avoid touching lips. Gentle care. Use lip balm. Results last 6-9 months.'
  },
  'tear-trough-filler': { 
    name: 'Tear Trough Filler', 
    price: 390, 
    category: 'Fillers', 
    duration: 60,
    description: 'Treatment for under-eye hollows and dark circles',
    details: 'Tear trough filler treatment addresses under-eye hollows and dark circles using specialized hyaluronic acid fillers. This delicate treatment requires expert technique to achieve natural-looking results in this sensitive area.',
    benefits: ['Reduced under-eye hollows', 'Brighter appearance', 'Youthful look', 'Natural results', 'Expert technique'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Gentle eye care. Avoid rubbing. Use eye cream. Results last 12-18 months.'
  },
  'temple-filler': { 
    name: 'Temple Filler', 
    price: 290, 
    category: 'Fillers', 
    duration: 45,
    description: 'Treatment for temple volume loss and hollowing',
    details: 'Temple filler treatment addresses volume loss in the temple area, which can cause a sunken appearance. Using hyaluronic acid fillers, this treatment restores volume and creates a more youthful, balanced facial appearance.',
    benefits: ['Restored temple volume', 'Balanced appearance', 'Youthful look', 'Natural enhancement', 'Improved contours'],
    preparation: 'Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Avoid touching treated areas. No makeup for 12 hours. Gentle care. Results last 12-18 months.'
  },
  'filler-dissolving': { 
    name: 'Filler Dissolving', 
    price: 150, 
    category: 'Fillers', 
    duration: 30,
    description: 'Removal of unwanted or excessive dermal filler',
    details: 'Filler dissolving treatment uses hyaluronidase enzyme to break down hyaluronic acid fillers. This treatment can correct over-filled areas, asymmetries, or remove unwanted filler results. Safe and effective when performed by experienced practitioners.',
    benefits: ['Corrects over-filling', 'Removes unwanted results', 'Safe and effective', 'Quick procedure', 'Expert technique'],
    preparation: 'Clean skin required. Discuss goals with practitioner.',
    aftercare: 'Gentle care of treated areas. Follow practitioner instructions. Results visible in 24-48 hours.'
  },

  // BODY
  'body-fat-burning-mesotherapy': { 
    name: 'Body Fat Burning Mesotherapy', 
    price: 170, 
    category: 'Body', 
    duration: 60,
    description: 'Targeted fat reduction using mesotherapy injections',
    details: 'Body fat burning mesotherapy uses specialized injections to target stubborn fat deposits in specific areas. The treatment combines fat-dissolving compounds with circulation-enhancing ingredients to reduce localized fat and improve skin texture.',
    benefits: ['Targeted fat reduction', 'Improved skin texture', 'Non-surgical approach', 'Minimal downtime', 'Effective results'],
    preparation: 'Stay hydrated. Avoid blood thinners 1 week prior. Clean skin required.',
    aftercare: 'Gentle massage of treated areas. Stay hydrated. Avoid sun exposure. Results develop over 4-8 weeks.'
  },
  'radiofrequency-ultrasound': { 
    name: 'Radiofrequency & Ultrasound', 
    price: 250, 
    category: 'Body', 
    duration: 90,
    description: 'Advanced skin tightening and cellulite reduction treatment',
    details: 'Radiofrequency and ultrasound treatment combines two powerful technologies to tighten skin, reduce cellulite, and improve body contours. The treatment heats deep tissue to stimulate collagen production and break down fat cells.',
    benefits: ['Skin tightening', 'Cellulite reduction', 'Improved contours', 'Collagen stimulation', 'Non-invasive'],
    preparation: 'Clean skin required. Stay hydrated. Avoid blood thinners 1 week prior.',
    aftercare: 'Gentle skincare. Stay hydrated. Avoid sun exposure. Results develop over 6-12 weeks.'
  },
  'fat-freezing-treatment': { 
    name: 'Fat Freezing Treatment (Cryolipolysis)', 
    price: 200, 
    category: 'Body', 
    duration: 60,
    description: 'Non-surgical fat reduction using controlled cooling technology',
    details: 'Fat freezing treatment uses controlled cooling technology to target and destroy fat cells without surgery. The treatment freezes fat cells, which are then naturally eliminated by the body over several months.',
    benefits: ['Non-surgical fat reduction', 'Permanent fat cell elimination', 'No downtime', 'Safe and effective', 'Natural elimination'],
    preparation: 'Clean skin required. Stay hydrated. Avoid blood thinners 1 week prior.',
    aftercare: 'Gentle massage of treated areas. Stay hydrated. Results develop over 2-4 months.'
  },
  'ultrasound-lift-tighten': { 
    name: 'Ultrasound Lift & Tighten', 
    price: 190, 
    category: 'Body', 
    duration: 60,
    description: 'Ultrasound technology for skin tightening and lifting',
    details: 'Ultrasound lift and tighten treatment uses focused ultrasound energy to heat deep tissue layers, stimulating collagen production and creating a lifting effect. This treatment is effective for body contouring and skin tightening.',
    benefits: ['Skin lifting', 'Tissue tightening', 'Collagen stimulation', 'Body contouring', 'Non-invasive'],
    preparation: 'Clean skin required. Stay hydrated. Avoid blood thinners 1 week prior.',
    aftercare: 'Gentle skincare. Stay hydrated. Avoid sun exposure. Results develop over 3-6 months.'
  },
  'combined-treatment': { 
    name: 'Combined Body Treatment', 
    price: 350, 
    category: 'Body', 
    duration: 120,
    description: 'Comprehensive body treatment combining multiple technologies',
    details: 'Combined body treatment integrates multiple technologies for comprehensive body contouring and skin improvement. This may include mesotherapy, radiofrequency, ultrasound, or other modalities tailored to your specific needs.',
    benefits: ['Comprehensive treatment', 'Multiple benefits', 'Tailored approach', 'Enhanced results', 'Professional care'],
    preparation: 'Clean skin required. Stay hydrated. Avoid blood thinners 1 week prior.',
    aftercare: 'Follow specific care instructions. Stay hydrated. Avoid sun exposure. Results develop over 4-12 weeks.'
  }
};

const categories = [
  'All',
  'Face',
  'Anti-Wrinkle Injections', 
  'Fillers',
  'Body'
];

const priceRanges = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under £200', min: 0, max: 199 },
  { label: '£200 - £400', min: 200, max: 400 },
  { label: '£400 - £600', min: 400, max: 600 },
  { label: 'Over £600', min: 600, max: Infinity }
];

const durationRanges = [
  { label: 'All Durations', min: 0, max: Infinity },
  { label: 'Under 45 min', min: 0, max: 44 },
  { label: '45 - 60 min', min: 45, max: 60 },
  { label: '60 - 90 min', min: 60, max: 90 },
  { label: 'Over 90 min', min: 90, max: Infinity }
];

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All Prices');
  const [selectedDurationRange, setSelectedDurationRange] = useState('All Durations');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  
  const itemsPerPage = 12;

  // Handle URL parameters
  useEffect(() => {
    const category = searchParams.get('category');
    if (category && categories.includes(category)) {
      setSelectedCategory(category);
      setShowFilters(true);
    }
  }, [searchParams]);

  // Filter services based on selected criteria
  const filteredServices = useMemo(() => {
    return Object.entries(servicesData).filter(([serviceId, service]) => {
      const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
      const matchesPrice = priceRanges.find(range => range.label === selectedPriceRange)?.min <= service.price && 
                         priceRanges.find(range => range.label === selectedPriceRange)?.max >= service.price;
      const matchesDuration = durationRanges.find(range => range.label === selectedDurationRange)?.min <= service.duration && 
                            durationRanges.find(range => range.label === selectedDurationRange)?.max >= service.duration;
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesPrice && matchesDuration && matchesSearch;
    });
  }, [selectedCategory, selectedPriceRange, selectedDurationRange, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filters change
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);
    switch (filterType) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'price':
        setSelectedPriceRange(value);
        break;
      case 'duration':
        setSelectedDurationRange(value);
        break;
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const renderServiceModal = () => {
    if (!selectedService) return null;
    
    const service = servicesData[selectedService as keyof typeof servicesData];
    if (!service) return null;

  return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white px-8 py-6 flex items-center justify-between rounded-t-2xl flex-shrink-0">
            <div>
              <h2 className="text-3xl font-bold mb-2">{service.name}</h2>
              <div className="flex items-center gap-4 text-rose-100">
                <span className="flex items-center gap-1 text-lg">
                <Clock className="w-5 h-5" />
                  {service.duration} minutes
                </span>
                <span className="text-2xl font-bold">£{service.price}</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{service.category}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedService(null)}
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
                {service.description}
            </p>
          </div>

            {/* Details */}
            {service.details && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Treatment Details
                      </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {service.details}
                </p>
              </div>
            )}

            {/* Benefits */}
            {service.benefits && service.benefits.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Key Benefits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {service.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
                    </div>
            )}

            {/* Preparation */}
            {service.preparation && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-500">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Preparation
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {service.preparation}
                </p>
                      </div>
            )}

            {/* Aftercare */}
            {service.aftercare && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border-l-4 border-purple-500">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Aftercare
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {service.aftercare}
                </p>
                    </div>
            )}

            {/* CTA Button */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href={`/book?service=${selectedService}`}
                onClick={() => setSelectedService(null)}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl block text-center"
              >
                Book This Treatment - £{service.price}
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
            href="/book"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Booking
          </Link>
                </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 font-playfair">
            Our Services
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 font-montserrat font-light max-w-3xl mx-auto">
            Discover our comprehensive range of aesthetic treatments designed to enhance your natural beauty
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
                placeholder="Search services..."
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

                {/* Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range
                  </label>
                  <select
                    value={selectedPriceRange}
                    onChange={(e) => handleFilterChange('price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {priceRanges.map(range => (
                      <option key={range.label} value={range.label}>{range.label}</option>
                    ))}
                  </select>
              </div>

                {/* Duration Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration
                  </label>
                  <select
                    value={selectedDurationRange}
                    onChange={(e) => handleFilterChange('duration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {durationRanges.map(range => (
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
            Showing {filteredServices.length} of {Object.keys(servicesData).length} services
          </p>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedPriceRange('All Prices');
                setSelectedDurationRange('All Durations');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Services Grid/List */}
        {paginatedServices.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No services found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedPriceRange('All Prices');
                setSelectedDurationRange('All Durations');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all"
            >
              Show All Services
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {paginatedServices.map(([serviceId, service]) => (
              <div
                key={serviceId}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden ${
                  viewMode === 'list' ? 'flex items-center p-8' : 'p-0'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Image Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-pink-500/10"></div>
                      <div className="text-center z-10">
                        <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-8 h-8 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">Service Image</p>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{service.name}</h3>
                        <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-3">
                          {service.category}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed text-sm line-clamp-2">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between mb-6">
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {service.duration} min
                        </span>
                        <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                          £{service.price}
                        </span>
                      </div>
                      
                      {/* Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => setSelectedService(serviceId)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium text-sm"
                        >
                          <Info className="w-4 h-4" />
                          Details
                        </button>
                        <Link
                          href={`/book?service=${serviceId}`}
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
                    <div className="w-32 h-24 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 rounded-lg flex items-center justify-center mr-6 flex-shrink-0">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-1">
                          <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <p className="text-xs text-rose-600 dark:text-rose-400">Image</p>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{service.name}</h3>
                        <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-4">
                          {service.category}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {service.duration} minutes
                        </span>
                        <span className="text-xl font-bold text-rose-600 dark:text-rose-400">
                          £{service.price}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-6 flex-shrink-0">
                      <button
                        onClick={() => setSelectedService(serviceId)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 border border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium text-sm"
                      >
                        <Info className="w-4 h-4" />
                        Details
                      </button>
                      <Link
                        href={`/book?service=${serviceId}`}
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

        {/* Service Modal */}
        {renderServiceModal()}
      </div>
    </div>
  );
}