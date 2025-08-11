/**
 * Image optimization utilities for Kuchisabishii
 * Handles compression, resizing, and progressive loading for food photos
 */

export interface ImageOptimizationOptions {
  quality?: number; // 0-100
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  progressive?: boolean;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  aspectRatio: number;
}

export interface OptimizedImageResult {
  original: string;
  optimized: string;
  metadata: ImageMetadata;
  compressionRatio: number;
  variants?: {
    thumbnail: string;
    medium: string;
    large: string;
  };
}

// Image compression and optimization
export class ImageOptimizer {
  private static readonly DEFAULT_QUALITY = 85;
  private static readonly MAX_FOOD_IMAGE_SIZE = 1920;
  private static readonly THUMBNAIL_SIZE = 300;
  private static readonly MEDIUM_SIZE = 800;

  /**
   * Optimize food image for upload
   */
  static async optimizeFoodImage(
    file: File | string,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImageResult> {
    const {
      quality = this.DEFAULT_QUALITY,
      maxWidth = this.MAX_FOOD_IMAGE_SIZE,
      maxHeight = this.MAX_FOOD_IMAGE_SIZE,
      format = 'webp',
      progressive = true,
    } = options;

    const originalImage = await this.loadImage(file);
    const originalMetadata = this.getImageMetadata(originalImage);

    // Calculate optimal dimensions
    const { width, height } = this.calculateOptimalDimensions(
      originalMetadata.width,
      originalMetadata.height,
      maxWidth,
      maxHeight
    );

    // Create optimized version
    const optimizedCanvas = this.createOptimizedCanvas(originalImage, width, height, {
      quality,
      format,
      progressive,
    });

    // Generate variants
    const variants = await this.generateImageVariants(originalImage);

    const optimizedDataUrl = optimizedCanvas.toDataURL(`image/${format}`, quality / 100);
    const compressionRatio = this.calculateCompressionRatio(file, optimizedDataUrl);

    return {
      original: typeof file === 'string' ? file : URL.createObjectURL(file),
      optimized: optimizedDataUrl,
      metadata: {
        width,
        height,
        format,
        size: this.getDataUrlSize(optimizedDataUrl),
        aspectRatio: width / height,
      },
      compressionRatio,
      variants,
    };
  }

  /**
   * Generate progressive loading placeholders
   */
  static async generateProgressivePlaceholder(
    file: File | string
  ): Promise<{
    blurredPlaceholder: string;
    lowQualityPreview: string;
  }> {
    const image = await this.loadImage(file);
    
    // Generate ultra-low quality blur placeholder (base64)
    const blurCanvas = this.createOptimizedCanvas(image, 20, 20, {
      quality: 10,
      format: 'jpeg',
    });
    
    // Generate low quality preview
    const previewCanvas = this.createOptimizedCanvas(image, 100, 100, {
      quality: 30,
      format: 'jpeg',
    });

    return {
      blurredPlaceholder: blurCanvas.toDataURL('image/jpeg', 0.1),
      lowQualityPreview: previewCanvas.toDataURL('image/jpeg', 0.3),
    };
  }

  /**
   * Optimize profile image
   */
  static async optimizeProfileImage(file: File): Promise<OptimizedImageResult> {
    return this.optimizeFoodImage(file, {
      quality: 90,
      maxWidth: 400,
      maxHeight: 400,
      format: 'webp',
    });
  }

  /**
   * Load image from file or URL
   */
  private static loadImage(source: File | string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => resolve(img);
      img.onerror = reject;
      
      if (typeof source === 'string') {
        img.src = source;
      } else {
        img.src = URL.createObjectURL(source);
      }
    });
  }

  /**
   * Get image metadata
   */
  private static getImageMetadata(image: HTMLImageElement): ImageMetadata {
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
      format: 'unknown', // Would need EXIF parsing for accurate format
      size: 0, // Would need file size
      aspectRatio: image.naturalWidth / image.naturalHeight,
    };
  }

  /**
   * Calculate optimal dimensions maintaining aspect ratio
   */
  private static calculateOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    let width = originalWidth;
    let height = originalHeight;

    // Scale down if too wide
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    // Scale down if too tall
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  /**
   * Create optimized canvas
   */
  private static createOptimizedCanvas(
    image: HTMLImageElement,
    width: number,
    height: number,
    options: { quality: number; format: string; progressive?: boolean }
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');

    canvas.width = width;
    canvas.height = height;

    // Apply image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw the resized image
    ctx.drawImage(image, 0, 0, width, height);

    // Apply sharpening filter for food images
    if (width > 200) {
      this.applySharpeningFilter(ctx, width, height);
    }

    return canvas;
  }

  /**
   * Apply subtle sharpening filter for food images
   */
  private static applySharpeningFilter(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const weights = [-0.1, -0.1, -0.1, -0.1, 1.8, -0.1, -0.1, -0.1, -0.1];

    // Apply convolution matrix for sharpening
    const newData = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) { // RGB channels only
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const pixel = ((y + ky) * width + (x + kx)) * 4 + c;
              sum += data[pixel] * weights[(ky + 1) * 3 + (kx + 1)];
            }
          }
          newData[(y * width + x) * 4 + c] = Math.max(0, Math.min(255, sum));
        }
      }
    }

    const newImageData = new ImageData(newData, width, height);
    ctx.putImageData(newImageData, 0, 0);
  }

  /**
   * Generate image variants for different use cases
   */
  private static async generateImageVariants(
    image: HTMLImageElement
  ): Promise<{ thumbnail: string; medium: string; large: string }> {
    const thumbnail = this.createOptimizedCanvas(image, this.THUMBNAIL_SIZE, this.THUMBNAIL_SIZE, {
      quality: 80,
      format: 'webp',
    });

    const medium = this.createOptimizedCanvas(image, this.MEDIUM_SIZE, this.MEDIUM_SIZE, {
      quality: 85,
      format: 'webp',
    });

    const large = this.createOptimizedCanvas(image, this.MAX_FOOD_IMAGE_SIZE, this.MAX_FOOD_IMAGE_SIZE, {
      quality: 90,
      format: 'webp',
    });

    return {
      thumbnail: thumbnail.toDataURL('image/webp', 0.8),
      medium: medium.toDataURL('image/webp', 0.85),
      large: large.toDataURL('image/webp', 0.9),
    };
  }

  /**
   * Calculate compression ratio
   */
  private static calculateCompressionRatio(original: File | string, optimized: string): number {
    if (typeof original === 'string') {
      return 1; // Can't calculate without original file size
    }

    const originalSize = original.size;
    const optimizedSize = this.getDataUrlSize(optimized);
    
    return originalSize / optimizedSize;
  }

  /**
   * Estimate data URL size
   */
  private static getDataUrlSize(dataUrl: string): number {
    // Remove data URL prefix and calculate base64 size
    const base64String = dataUrl.split(',')[1];
    return Math.round(base64String.length * 0.75); // Base64 is ~133% of binary
  }
}

// Progressive image loading component helper
export class ProgressiveImageLoader {
  private static loadedImages = new Set<string>();

  /**
   * Load image progressively with blur-to-sharp transition
   */
  static async loadProgressively(
    src: string,
    onProgress?: (stage: 'placeholder' | 'lowquality' | 'highquality') => void
  ): Promise<HTMLImageElement> {
    // Check if already loaded
    if (this.loadedImages.has(src)) {
      return this.loadImage(src);
    }

    // Generate progressive variants if needed
    const { blurredPlaceholder, lowQualityPreview } = await ImageOptimizer.generateProgressivePlaceholder(src);

    // Load placeholder first
    onProgress?.('placeholder');
    
    // Load low quality preview
    onProgress?.('lowquality');
    await this.loadImage(lowQualityPreview);

    // Load high quality final image
    onProgress?.('highquality');
    const finalImage = await this.loadImage(src);
    
    this.loadedImages.add(src);
    return finalImage;
  }

  /**
   * Preload images for emotional food experiences
   */
  static async preloadEmotionalImages(imageUrls: string[]): Promise<void> {
    const preloadPromises = imageUrls.map(url => {
      if (!this.loadedImages.has(url)) {
        return this.loadImage(url).then(() => {
          this.loadedImages.add(url);
        });
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  private static loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
}

// Image analysis for emotional context
export class ImageAnalyzer {
  /**
   * Analyze food image for emotional cues
   */
  static analyzeFoodImageEmotion(image: HTMLImageElement): {
    warmthScore: number;
    comfortScore: number;
    excitementScore: number;
    socialScore: number;
  } {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;

    let warmColors = 0;
    let coolColors = 0;
    let brightPixels = 0;
    let totalPixels = data.length / 4;

    // Analyze color temperature and brightness
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;

      // Warm vs cool color analysis
      if (r > b && (r + g) > b * 1.5) {
        warmColors++;
      } else if (b > r && b > g) {
        coolColors++;
      }

      if (brightness > 128) {
        brightPixels++;
      }
    }

    const warmthRatio = warmColors / totalPixels;
    const brightnessRatio = brightPixels / totalPixels;

    return {
      warmthScore: Math.min(10, warmthRatio * 15), // Warm colors suggest comfort
      comfortScore: Math.min(10, (warmthRatio + (1 - brightnessRatio)) * 7), // Warm, soft lighting
      excitementScore: Math.min(10, brightnessRatio * 12), // Bright, vibrant images
      socialScore: this.detectSocialContext(image), // Would need more sophisticated analysis
    };
  }

  /**
   * Detect social context from image composition
   */
  private static detectSocialContext(image: HTMLImageElement): number {
    // Simplified heuristic - would use ML model in production
    const aspectRatio = image.width / image.height;
    
    // Wider images might suggest social dining
    if (aspectRatio > 1.5) {
      return 7; // Likely showing multiple plates/people
    } else if (aspectRatio < 0.8) {
      return 3; // Likely focused on single dish
    }
    
    return 5; // Neutral
  }
}