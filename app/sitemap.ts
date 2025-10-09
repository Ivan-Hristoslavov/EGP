import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://egp.com'
  const currentDate = new Date()
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/press`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/membership`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/book`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/book-consultation`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/conditions`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  // Face conditions
  const faceConditions = [
    'acne-acne-scarring',
    'rosacea',
    'hyperpigmentation-melasma',
    'barcode-lines-around-lips',
    'bruxism',
    'dark-under-eye-circles',
    'double-chin',
    'nasolabial-folds',
    'shadows-around-nasolabial-folds',
    'under-eye-hollows',
    'eye-bags',
    'flat-cheeks',
    'flat-pebble-chin',
    'gummy-smile',
    'heavy-lower-face',
    'jowling',
    'low-eyebrows'
  ]

  // Body conditions
  const bodyConditions = [
    'cellulite',
    'cellulite-thighs-buttocks-abdomen',
    'stubborn-belly-fat',
    'stubborn-belly-fat-abdominal-fat',
    'love-handles',
    'love-handles-flanks',
    'sagging-skin',
    'sagging-skin-skin-laxity',
    'stretch-marks',
    'arm-fat-bingo-wings',
    'thigh-fat-inner-thigh-laxity',
    'double-chin-jawline-fat',
    'post-pregnancy-tummy',
    'water-retention-bloating-swelling'
  ]

  // Generate condition pages
  const conditionPages = [
    ...faceConditions.map(condition => ({
      url: `${baseUrl}/conditions/${condition}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...bodyConditions.map(condition => ({
      url: `${baseUrl}/conditions/${condition}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  ]

  return [
    ...staticPages,
    ...conditionPages,
  ]
} 