/**
 * Image utility functions for handling various image formats including HEIC
 */

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  convertedFile?: File;
  originalType: string;
  detectedType: string;
}

/**
 * Check if file is an image (including HEIC/HEIF)
 */
export function isImageFile(file: File): boolean {
  // Standard image types
  if (file.type.startsWith('image/')) {
    return true;
  }
  
  // Check file extension for HEIC/HEIF
  const fileName = file.name.toLowerCase();
  const heicExtensions = ['.heic', '.heif', '.heics', '.heifs'];
  
  return heicExtensions.some(ext => fileName.endsWith(ext));
}

/**
 * Get detected image type from file
 */
export function getImageType(file: File): string {
  // If browser recognizes the type
  if (file.type.startsWith('image/')) {
    return file.type;
  }
  
  // Check file extension for HEIC/HEIF
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.heic') || fileName.endsWith('.heics')) {
    return 'image/heic';
  }
  
  if (fileName.endsWith('.heif') || fileName.endsWith('.heifs')) {
    return 'image/heif';
  }
  
  // Unknown type
  return file.type || 'application/octet-stream';
}

/**
 * Validate image file with HEIC support
 */
export function validateImageFile(file: File, maxSizeMB: number = 10): ImageValidationResult {
  const result: ImageValidationResult = {
    isValid: false,
    originalType: file.type,
    detectedType: getImageType(file)
  };
  
  // Check if it's an image file
  if (!isImageFile(file)) {
    result.error = `File "${file.name}" is not a supported image format. Supported formats: JPEG, PNG, WebP, GIF, HEIC, HEIF`;
    return result;
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    result.error = `File "${file.name}" is too large. Maximum size: ${maxSizeMB}MB`;
    return result;
  }
  
  // Check for empty file
  if (file.size === 0) {
    result.error = `File "${file.name}" is empty`;
    return result;
  }
  
  result.isValid = true;
  return result;
}

/**
 * Convert HEIC file to JPEG using heic2any library
 */
export async function convertHeicToJpeg(file: File): Promise<File | null> {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.warn('heic2any requires browser environment');
      return null;
    }
    
    console.log('Converting HEIC file to JPEG:', file.name);
    
    // Dynamic import to avoid server-side issues
    const heic2any = (await import('heic2any')).default;
    
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.8
    }) as Blob; // Explicitly type as Blob
    
    // Create new file with converted data
    const convertedFile = new File([convertedBlob], 
      file.name.replace(/\.(heic|heif)$/i, '.jpg'), 
      { type: 'image/jpeg' }
    );
    
    console.log('HEIC conversion successful:', {
      original: file.name,
      converted: convertedFile.name,
      originalSize: file.size,
      convertedSize: convertedFile.size
    });
    
    return convertedFile;
  } catch (error) {
    console.error('Error converting HEIC to JPEG:', error);
    return null;
  }
}

/**
 * Compress image using Canvas API
 */
export async function compressImage(
  file: File, 
  maxWidth: number = 1920, 
  maxHeight: number = 1080, 
  quality: number = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Process image file (convert HEIC if needed and compress)
 */
export async function processImageFile(
  file: File, 
  maxSizeMB: number = 10,
  compress: boolean = true,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.85
): Promise<{
  file: File;
  wasConverted: boolean;
  wasCompressed: boolean;
  originalType: string;
  finalType: string;
  originalSize: number;
  finalSize: number;
  originalDimensions?: { width: number; height: number };
  finalDimensions?: { width: number; height: number };
}> {
  const validation = validateImageFile(file, maxSizeMB);
  
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  let processedFile = file;
  let wasConverted = false;
  let wasCompressed = false;
  let originalDimensions: { width: number; height: number } | undefined;
  let finalDimensions: { width: number; height: number } | undefined;
  
  // Get original dimensions
  if (typeof window !== 'undefined') {
    originalDimensions = await getImageDimensions(file);
  }
  
  // Check if it's a HEIC file that needs conversion
  const fileName = file.name.toLowerCase();
  const isHeic = fileName.endsWith('.heic') || fileName.endsWith('.heif');
  
  if (isHeic) {
    console.log('Detected HEIC file, attempting conversion:', file.name);
    const convertedFile = await convertHeicToJpeg(file);
    if (convertedFile) {
      processedFile = convertedFile;
      wasConverted = true;
    } else {
      console.warn('HEIC conversion failed, using original file:', file.name);
    }
  }
  
  // Compress image if requested and in browser environment
  if (compress && typeof window !== 'undefined') {
    try {
      const compressedFile = await compressImage(processedFile, maxWidth, maxHeight, quality);
      finalDimensions = await getImageDimensions(compressedFile);
      processedFile = compressedFile;
      wasCompressed = true;
      console.log('Image compressed:', {
        originalSize: file.size,
        compressedSize: compressedFile.size,
        compressionRatio: ((file.size - compressedFile.size) / file.size * 100).toFixed(1) + '%'
      });
    } catch (error) {
      console.warn('Image compression failed, using original:', error);
    }
  }
  
  return {
    file: processedFile,
    wasConverted,
    wasCompressed,
    originalType: validation.originalType,
    finalType: processedFile.type,
    originalSize: file.size,
    finalSize: processedFile.size,
    originalDimensions,
    finalDimensions
  };
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Get supported image formats for file input
 */
export function getSupportedImageFormats(): string {
  return 'image/jpeg,image/jpg,image/png,image/webp,image/gif,.heic,.heif';
}

/**
 * Get human-readable list of supported formats
 */
export function getSupportedFormatsText(): string {
  return 'JPEG, PNG, WebP, GIF, HEIC, HEIF up to 10MB';
} 