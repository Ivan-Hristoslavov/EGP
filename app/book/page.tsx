"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { siteConfig } from "@/config/site";
import { Calendar, Clock, CreditCard, CheckCircle, Plus, Minus, X, ArrowLeft, Info, Shield } from "lucide-react";
import StripePaymentForm from '@/components/StripePaymentForm';

// Service data from the price list
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

// Mock calendar data - in real app this would come from API
const getAvailableDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Skip weekends for now (can be configured)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      dates.push({
        date: date.toISOString().split('T')[0],
        available: Math.random() > 0.3, // 70% availability
        timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
      });
    }
  }
  
  return dates;
};

interface OrderItem {
  serviceId: string;
  name: string;
  price: number;
  duration: number;
  category: string;
  quantity: number;
}

export default function BookingPage() {
  const searchParams = useSearchParams();
  const [selectedServices, setSelectedServices] = useState<OrderItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableDates, setAvailableDates] = useState(getAvailableDates());
  const [currentStep, setCurrentStep] = useState<'services' | 'date' | 'preview' | 'payment'>('services');
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [serviceInfoModal, setServiceInfoModal] = useState<string | null>(null);

  // Auto-select service from URL parameter
  useEffect(() => {
    const serviceParam = searchParams.get('service');
    const conditionParam = searchParams.get('condition');
    
    if (serviceParam && servicesData[serviceParam as keyof typeof servicesData]) {
      addService(serviceParam);
    }
    
    // If coming from condition, show service selector and suggest relevant services
    if (conditionParam) {
      setShowServiceSelector(true);
      
      // Auto-suggest relevant services based on condition
      const conditionServiceMapping: { [key: string]: string[] } = {
        'cellulite-thighs-buttocks-abdomen': ['radiofrequency-ultrasound', 'ultrasound-lift-tighten', 'body-fat-burning-mesotherapy'],
        'stubborn-belly-fat-abdominal-fat': ['fat-freezing-treatment', 'body-fat-burning-mesotherapy', 'radiofrequency-ultrasound'],
        'love-handles-flanks': ['fat-freezing-treatment', 'radiofrequency-ultrasound', 'body-fat-burning-mesotherapy'],
        'sagging-skin-skin-laxity': ['radiofrequency-ultrasound', 'ultrasound-lift-tighten', 'combined-treatment'],
        'stretch-marks': ['microneedling-facial', 'radiofrequency-ultrasound', 'prp-treatment'],
        'arm-fat-bingo-wings': ['fat-freezing-treatment', 'radiofrequency-ultrasound', 'ultrasound-lift-tighten'],
        'thigh-fat-inner-thigh-laxity': ['fat-freezing-treatment', 'radiofrequency-ultrasound', 'ultrasound-lift-tighten'],
        'double-chin-jawline-fat': ['fat-freezing-treatment', 'jaw-slimming', 'jawline-filler'],
        'post-pregnancy-tummy': ['radiofrequency-ultrasound', 'ultrasound-lift-tighten', 'body-fat-burning-mesotherapy'],
        'water-retention-bloating-swelling': ['body-fat-burning-mesotherapy', 'radiofrequency-ultrasound', 'combined-treatment']
      };
      
      const suggestedServices = conditionServiceMapping[conditionParam] || [];
      if (suggestedServices.length > 0) {
        // Add first suggested service automatically
        addService(suggestedServices[0]);
      }
    }
  }, [searchParams]);

  const totalAmount = selectedServices.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDuration = selectedServices.reduce((sum, item) => sum + (item.duration * item.quantity), 0);

  const addService = (serviceId: string) => {
    const service = servicesData[serviceId as keyof typeof servicesData];
    if (!service) return;

    const existingIndex = selectedServices.findIndex(item => item.serviceId === serviceId);
    
    if (existingIndex >= 0) {
      const updated = [...selectedServices];
      updated[existingIndex].quantity += 1;
      setSelectedServices(updated);
    } else {
      setSelectedServices([...selectedServices, {
        serviceId,
        name: service.name,
        price: service.price,
        duration: service.duration,
        category: service.category,
        quantity: 1
      }]);
    }
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(selectedServices.filter(item => item.serviceId !== serviceId));
  };

  const updateQuantity = (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeService(serviceId);
      return;
    }
    
    const updated = selectedServices.map(item => 
      item.serviceId === serviceId ? { ...item, quantity } : item
    );
    setSelectedServices(updated);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    setCurrentStep('date');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep('preview');
  };

  const proceedToPayment = () => {
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = (bookingId: string) => {
    // Redirect to success page or show success message
    window.location.href = `/book/success?booking=${bookingId}`;
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // You could show a toast notification here
  };

  const renderServiceInfoModal = () => {
    if (!serviceInfoModal) return null;
    
    const service = servicesData[serviceInfoModal as keyof typeof servicesData];
    if (!service) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
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
              </div>
            </div>
            <button
              onClick={() => setServiceInfoModal(null)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
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
                  <Shield className="w-5 h-5 text-blue-500" />
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
                  <Calendar className="w-5 h-5 text-purple-500" />
                  Aftercare
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {service.aftercare}
                </p>
              </div>
            )}

            {/* CTA Button */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  addService(serviceInfoModal);
                  setServiceInfoModal(null);
                  setShowServiceSelector(false);
                }}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Add to Booking - £{service.price}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderServiceSelector = () => {
    const categories = {
      'Face': Object.entries(servicesData).filter(([_, service]) => service.category === 'Face'),
      'Anti-Wrinkle Injections': Object.entries(servicesData).filter(([_, service]) => service.category === 'Anti-Wrinkle Injections'),
      'Fillers': Object.entries(servicesData).filter(([_, service]) => service.category === 'Fillers'),
      'Body': Object.entries(servicesData).filter(([_, service]) => service.category === 'Body')
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
            <h2 className="text-2xl font-bold">Select Services</h2>
            <button
              onClick={() => setShowServiceSelector(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1">
            {Object.entries(categories).map(([category, services]) => (
              <div key={category} className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map(([serviceId, service]) => (
                    <div
                      key={serviceId}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-rose-300 dark:hover:border-rose-600 transition-all duration-200 hover:shadow-lg relative group"
                    >
                      <div className="space-y-3">
                      <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">{service.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                              {service.description}
                            </p>
                        </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">£{service.price}</div>
                            <div className="text-sm text-gray-500">{service.duration} min</div>
                        </div>
                      </div>
                        
                        {service.details && (
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Treatment Details</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{service.details}</p>
                    </div>
                        )}
                        
                        {service.benefits && service.benefits.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {service.benefits.slice(0, 3).map((benefit, index) => (
                              <span key={index} className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-2 py-1 rounded-full text-xs">
                                {benefit}
                              </span>
                            ))}
                            {service.benefits.length > 3 && (
                              <span className="text-xs text-gray-500">+{service.benefits.length - 3} more</span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {service.duration} minutes
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            Professional treatment
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setServiceInfoModal(serviceId);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium"
                          >
                            <Info className="w-4 h-4" />
                            More Info
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                        addService(serviceId);
                        setShowServiceSelector(false);
                      }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all font-medium shadow-md hover:shadow-lg"
                          >
                            <Plus className="w-4 h-4" />
                            Add Service
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Select Date & Time</h3>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
          
          {availableDates.slice(0, 28).map((dateInfo) => {
            const date = new Date(dateInfo.date);
            const isSelected = selectedDate === dateInfo.date;
            const isAvailable = dateInfo.available;
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <button
                key={dateInfo.date}
                onClick={() => isAvailable ? handleDateSelect(dateInfo.date) : null}
                disabled={!isAvailable}
                className={`
                  aspect-square rounded-lg text-sm font-medium transition-all
                  ${isSelected 
                    ? 'bg-rose-500 text-white' 
                    : isAvailable 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-rose-100 dark:hover:bg-rose-900/30' 
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }
                  ${isToday ? 'ring-2 ring-rose-300' : ''}
                `}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
        
        {/* Time Slots */}
        {selectedDate && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Times</h4>
            <div className="grid grid-cols-3 gap-3">
              {availableDates.find(d => d.date === selectedDate)?.timeSlots.map(time => (
                <button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOrderPreview = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h3>
        
        {/* Selected Services */}
        <div className="space-y-6 mb-6">
          {selectedServices.map(item => {
            const serviceData = servicesData[item.serviceId as keyof typeof servicesData];
            return (
              <div key={item.serviceId} className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">{item.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                      {serviceData?.description || 'Professional aesthetic treatment'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.duration} minutes
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {item.category}
                      </span>
              </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.serviceId, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.serviceId, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-right">
                      <div className="text-lg font-bold text-rose-600 dark:text-rose-400">£{item.price * item.quantity}</div>
                      <div className="text-xs text-gray-500">£{item.price} each</div>
                </div>
              </div>
            </div>
                
                {serviceData?.benefits && serviceData.benefits.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">Key Benefits:</h5>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setServiceInfoModal(item.serviceId);
                        }}
                        className="flex items-center gap-1 px-3 py-1 text-xs border border-blue-500 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <Info className="w-3 h-3" />
                        Full Details
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {serviceData.benefits.slice(0, 4).map((benefit, index) => (
                        <span key={index} className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-2 py-1 rounded-full text-xs">
                          {benefit}
                        </span>
                      ))}
                      {serviceData.benefits.length > 4 && (
                        <span className="text-xs text-gray-500">+{serviceData.benefits.length - 4} more benefits</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Appointment Details */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-900 dark:text-white font-semibold">
              {new Date(selectedDate).toLocaleDateString('en-GB', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-900 dark:text-white font-semibold">{selectedTime}</span>
          </div>
        </div>
        
        {/* Total */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Duration:</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">{totalDuration} minutes</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900 dark:text-white">Total Amount:</span>
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">£{totalAmount}</span>
          </div>
        </div>
        
        <button
          onClick={proceedToPayment}
          className="w-full mt-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-lg font-semibold text-lg hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
        >
          <CreditCard className="w-5 h-5 inline mr-2" />
          Proceed to Payment
        </button>
      </div>
    );
  };

  const renderStripePayment = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentStep('preview')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Secure Payment</h3>
        </div>
        
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Secure Payment by Stripe</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-500 mt-1">
            Your payment information is encrypted and secure
          </p>
        </div>
        
        {/* Real Stripe Payment Form */}
        <StripePaymentForm
          amount={totalAmount}
          services={selectedServices.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            duration: item.duration,
          }))}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 font-playfair">
            Book Your Treatment
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 font-montserrat font-light max-w-3xl mx-auto">
            Select services, choose date & time, and pay securely
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[
              { key: 'services', label: 'Services', icon: CheckCircle },
              { key: 'date', label: 'Date & Time', icon: Calendar },
              { key: 'preview', label: 'Preview', icon: CheckCircle },
              { key: 'payment', label: 'Payment', icon: CreditCard }
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.key;
              const isCompleted = ['services', 'date', 'preview', 'payment'].indexOf(currentStep) > ['services', 'date', 'preview', 'payment'].indexOf(step.key);
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${isCompleted ? 'bg-green-500 text-white' : 
                      isActive ? 'bg-rose-500 text-white' : 
                      'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`ml-2 font-medium ${
                    isActive ? 'text-rose-600 dark:text-rose-400' : 
                    isCompleted ? 'text-green-600 dark:text-green-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {index < 3 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Current Step Content */}
          <div className="lg:col-span-2">
            {currentStep === 'services' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Selected Services</h3>
                  <button
                    onClick={() => setShowServiceSelector(true)}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all"
                  >
                    Add Services
                  </button>
                </div>
                
                {selectedServices.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No services selected</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Add services to your order to continue</p>
                    <button
                      onClick={() => setShowServiceSelector(true)}
                      className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all"
                    >
                      Browse Services
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedServices.map(item => {
                      const serviceData = servicesData[item.serviceId as keyof typeof servicesData];
                      return (
                        <div key={item.serviceId} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">{item.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {serviceData?.description || 'Professional aesthetic treatment'}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {item.duration} min
                                </span>
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  {item.category}
                                </span>
                        </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => setServiceInfoModal(item.serviceId)}
                                className="p-2 border border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                title="View detailed information"
                              >
                                <Info className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.serviceId, item.quantity - 1)}
                                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.serviceId, item.quantity + 1)}
                                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right">
                              <div className="font-bold text-rose-600 dark:text-rose-400 text-lg">£{item.price * item.quantity}</div>
                              <div className="text-xs text-gray-500">£{item.price} each</div>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentStep('date')}
                      disabled={selectedServices.length === 0}
                      className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-lg font-semibold text-lg hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to Date Selection
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {currentStep === 'date' && renderCalendar()}
            {currentStep === 'preview' && renderOrderPreview()}
            {currentStep === 'payment' && renderStripePayment()}
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Summary</h3>
                
                {selectedServices.length > 0 && (
                  <>
                    <div className="space-y-3 mb-4">
                      {selectedServices.map(item => (
                        <div key={item.serviceId} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{item.name} × {item.quantity}</span>
                          <span className="font-semibold">£{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-gray-900 dark:text-white">Total:</span>
                        <span className="text-rose-600 dark:text-rose-400">£{totalAmount}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Duration: {totalDuration} minutes
                      </div>
                    </div>
                  </>
                )}
                
                {selectedDate && selectedTime && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(selectedDate).toLocaleDateString('en-GB')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{selectedTime}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Service Selector Modal */}
      {showServiceSelector && renderServiceSelector()}
      
      {/* Service Info Modal */}
      {renderServiceInfoModal()}
    </div>
  );
}
