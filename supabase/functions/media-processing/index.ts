/**
 * Advanced Media Processing Edge Function for Kuchisabishii
 * Handles image/video upload, AI analysis, and food recognition
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MediaProcessingRequest {
  type: 'upload' | 'analyze' | 'recognize' | 'enhance';
  mediaType: 'image' | 'video';
  mediaUrl?: string;
  base64Data?: string;
  fileName?: string;
  contentType?: string;
  analysisOptions?: {
    foodRecognition?: boolean;
    nutritionAnalysis?: boolean;
    aestheticScoring?: boolean;
    colorAnalysis?: boolean;
    textExtraction?: boolean;
    emotionalAnalysis?: boolean;
    qualityEnhancement?: boolean;
  };
  metadata?: {
    experienceId?: string;
    restaurantId?: string;
    dishName?: string;
    userLocation?: { lat: number; lng: number };
    timestamp?: string;
  };
}

interface MediaProcessingResponse {
  success: boolean;
  mediaUrl?: string;
  thumbnailUrl?: string;
  analysis?: {
    foodRecognition?: FoodRecognitionResult;
    nutritionEstimate?: NutritionEstimate;
    aestheticScore?: AestheticScore;
    colorPalette?: ColorPalette;
    extractedText?: ExtractedText;
    emotionalTone?: EmotionalTone;
    qualityMetrics?: QualityMetrics;
  };
  metadata?: Record<string, any>;
  processingTime?: number;
}

interface FoodRecognitionResult {
  detectedFoods: Array<{
    name: string;
    confidence: number;
    category: string;
    cuisine?: string;
    boundingBox?: { x: number; y: number; width: number; height: number };
  }>;
  dishType?: string;
  cuisineStyle?: string[];
  servingSize?: 'small' | 'medium' | 'large' | 'extra-large';
  presentationStyle?: string[];
  confidence: number;
}

interface NutritionEstimate {
  estimatedCalories: number;
  macronutrients: {
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
  estimatedIngredients: string[];
  allergenWarnings: string[];
  confidence: number;
}

interface AestheticScore {
  overallScore: number;
  composition: number;
  lighting: number;
  colorBalance: number;
  presentation: number;
  plating: number;
  garnishing: number;
  suggestions: string[];
}

interface ColorPalette {
  dominantColors: Array<{ color: string; percentage: number; name: string }>;
  colorHarmony: number;
  warmth: number; // -1 (cool) to 1 (warm)
  vibrancy: number;
  contrast: number;
}

interface ExtractedText {
  menuItems: string[];
  prices: Array<{ item: string; price: string; currency: string }>;
  restaurantName?: string;
  location?: string;
  descriptions: string[];
  confidence: number;
}

interface EmotionalTone {
  mood: string[];
  atmosphere: string;
  ambiance: number; // 1-10 scale
  sophistication: number; // 1-10 scale
  comfort: number; // 1-10 scale
  excitement: number; // 1-10 scale
}

interface QualityMetrics {
  resolution: { width: number; height: number };
  sharpness: number;
  brightness: number;
  contrast: number;
  saturation: number;
  noisiness: number;
  overallQuality: number;
  enhancementSuggestions: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )

    // Authenticate user
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: user, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user.user) {
      throw new Error('Unauthorized')
    }

    const body: MediaProcessingRequest = await req.json()
    const { type, mediaType, analysisOptions = {}, metadata = {} } = body

    let result: MediaProcessingResponse = { success: false }

    switch (type) {
      case 'upload':
        result = await handleMediaUpload(supabase, body, user.user.id)
        break
      case 'analyze':
        result = await handleMediaAnalysis(supabase, body, user.user.id)
        break
      case 'recognize':
        result = await handleFoodRecognition(supabase, body, user.user.id)
        break
      case 'enhance':
        result = await handleMediaEnhancement(supabase, body, user.user.id)
        break
      default:
        throw new Error('Invalid processing type')
    }

    result.processingTime = Date.now() - startTime

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        processingTime: Date.now() - startTime
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

async function handleMediaUpload(
  supabase: any,
  request: MediaProcessingRequest,
  userId: string
): Promise<MediaProcessingResponse> {
  
  if (!request.base64Data || !request.fileName || !request.contentType) {
    throw new Error('Missing required upload data')
  }

  // Convert base64 to blob
  const base64Data = request.base64Data.split(',')[1] // Remove data URL prefix
  const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))

  // Generate unique filename
  const timestamp = new Date().getTime()
  const randomId = Math.random().toString(36).substring(2)
  const fileExtension = request.fileName.split('.').pop()
  const uniqueFileName = `${userId}/${timestamp}_${randomId}.${fileExtension}`
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('food-media')
    .upload(uniqueFileName, binaryData, {
      contentType: request.contentType,
      upsert: false
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('food-media')
    .getPublicUrl(uniqueFileName)

  let thumbnailUrl
  let analysis

  // Generate thumbnail for images
  if (request.mediaType === 'image') {
    thumbnailUrl = await generateThumbnail(supabase, uniqueFileName, urlData.publicUrl)
  }

  // Perform automatic analysis if requested
  if (Object.keys(request.analysisOptions || {}).length > 0) {
    analysis = await performMediaAnalysis(urlData.publicUrl, request.analysisOptions!)
  }

  // Store media record in database
  await storeMediaRecord(supabase, {
    userId,
    mediaUrl: urlData.publicUrl,
    thumbnailUrl,
    mediaType: request.mediaType,
    fileName: request.fileName,
    contentType: request.contentType,
    analysis,
    metadata: request.metadata
  })

  return {
    success: true,
    mediaUrl: urlData.publicUrl,
    thumbnailUrl,
    analysis,
    metadata: {
      fileName: uniqueFileName,
      uploadedAt: new Date().toISOString(),
      size: binaryData.length
    }
  }
}

async function handleMediaAnalysis(
  supabase: any,
  request: MediaProcessingRequest,
  userId: string
): Promise<MediaProcessingResponse> {
  
  if (!request.mediaUrl) {
    throw new Error('Media URL required for analysis')
  }

  const analysis = await performMediaAnalysis(request.mediaUrl, request.analysisOptions || {})

  // Update existing media record with analysis
  if (request.metadata?.mediaId) {
    await updateMediaAnalysis(supabase, request.metadata.mediaId, analysis)
  }

  return {
    success: true,
    analysis,
    metadata: {
      analyzedAt: new Date().toISOString(),
      mediaUrl: request.mediaUrl
    }
  }
}

async function handleFoodRecognition(
  supabase: any,
  request: MediaProcessingRequest,
  userId: string
): Promise<MediaProcessingResponse> {
  
  if (!request.mediaUrl) {
    throw new Error('Media URL required for food recognition')
  }

  // Specialized food recognition analysis
  const foodRecognition = await performFoodRecognition(request.mediaUrl)
  const nutritionEstimate = await estimateNutrition(foodRecognition)

  const analysis = {
    foodRecognition,
    nutritionEstimate
  }

  return {
    success: true,
    analysis,
    metadata: {
      recognizedAt: new Date().toISOString(),
      confidence: foodRecognition.confidence
    }
  }
}

async function handleMediaEnhancement(
  supabase: any,
  request: MediaProcessingRequest,
  userId: string
): Promise<MediaProcessingResponse> {
  
  if (!request.mediaUrl) {
    throw new Error('Media URL required for enhancement')
  }

  // Enhance image quality (placeholder - would integrate with actual AI service)
  const enhancedUrl = await enhanceImageQuality(request.mediaUrl)
  const qualityMetrics = await analyzeImageQuality(request.mediaUrl)

  return {
    success: true,
    mediaUrl: enhancedUrl,
    analysis: {
      qualityMetrics
    },
    metadata: {
      enhancedAt: new Date().toISOString(),
      originalUrl: request.mediaUrl
    }
  }
}

async function performMediaAnalysis(
  mediaUrl: string,
  options: MediaProcessingRequest['analysisOptions']
): Promise<MediaProcessingResponse['analysis']> {
  
  const analysis: any = {}

  // Food recognition
  if (options?.foodRecognition) {
    analysis.foodRecognition = await performFoodRecognition(mediaUrl)
  }

  // Nutrition analysis
  if (options?.nutritionAnalysis && analysis.foodRecognition) {
    analysis.nutritionEstimate = await estimateNutrition(analysis.foodRecognition)
  }

  // Aesthetic scoring
  if (options?.aestheticScoring) {
    analysis.aestheticScore = await performAestheticAnalysis(mediaUrl)
  }

  // Color analysis
  if (options?.colorAnalysis) {
    analysis.colorPalette = await analyzeColorPalette(mediaUrl)
  }

  // Text extraction (for menu recognition)
  if (options?.textExtraction) {
    analysis.extractedText = await extractTextFromImage(mediaUrl)
  }

  // Emotional analysis
  if (options?.emotionalAnalysis) {
    analysis.emotionalTone = await analyzeEmotionalTone(mediaUrl)
  }

  // Quality enhancement
  if (options?.qualityEnhancement) {
    analysis.qualityMetrics = await analyzeImageQuality(mediaUrl)
  }

  return analysis
}

// AI Analysis Functions (These would integrate with actual AI services)

async function performFoodRecognition(mediaUrl: string): Promise<FoodRecognitionResult> {
  // Placeholder - would integrate with Google Vision API, AWS Rekognition, or custom model
  return {
    detectedFoods: [
      {
        name: 'Ramen',
        confidence: 0.92,
        category: 'Main Course',
        cuisine: 'Japanese',
        boundingBox: { x: 10, y: 10, width: 300, height: 200 }
      },
      {
        name: 'Green Onions',
        confidence: 0.85,
        category: 'Garnish',
        boundingBox: { x: 50, y: 20, width: 100, height: 50 }
      }
    ],
    dishType: 'Noodle Soup',
    cuisineStyle: ['Japanese', 'Asian'],
    servingSize: 'medium',
    presentationStyle: ['Traditional', 'Bowl Presentation'],
    confidence: 0.89
  }
}

async function estimateNutrition(foodRecognition: FoodRecognitionResult): Promise<NutritionEstimate> {
  // Placeholder - would use nutrition databases and portion estimation
  return {
    estimatedCalories: 450,
    macronutrients: {
      protein: 20,
      carbohydrates: 55,
      fat: 15,
      fiber: 3
    },
    estimatedIngredients: ['Wheat Noodles', 'Pork Broth', 'Green Onions', 'Sesame Oil', 'Soy Sauce'],
    allergenWarnings: ['Gluten', 'Soy'],
    confidence: 0.78
  }
}

async function performAestheticAnalysis(mediaUrl: string): Promise<AestheticScore> {
  // Placeholder - would analyze composition, lighting, etc.
  return {
    overallScore: 8.2,
    composition: 8.5,
    lighting: 7.8,
    colorBalance: 8.0,
    presentation: 8.7,
    plating: 8.3,
    garnishing: 7.9,
    suggestions: [
      'Consider adjusting lighting to reduce shadows',
      'The plating is excellent with good color contrast',
      'Adding a simple garnish could enhance visual appeal'
    ]
  }
}

async function analyzeColorPalette(mediaUrl: string): Promise<ColorPalette> {
  // Placeholder - would extract and analyze color information
  return {
    dominantColors: [
      { color: '#D4A574', percentage: 35, name: 'Golden Brown' },
      { color: '#8B4513', percentage: 25, name: 'Saddle Brown' },
      { color: '#228B22', percentage: 15, name: 'Forest Green' },
      { color: '#FFFFFF', percentage: 25, name: 'White' }
    ],
    colorHarmony: 0.85,
    warmth: 0.6,
    vibrancy: 0.7,
    contrast: 0.78
  }
}

async function extractTextFromImage(mediaUrl: string): Promise<ExtractedText> {
  // Placeholder - would use OCR to extract text from menus, receipts, etc.
  return {
    menuItems: ['Tonkotsu Ramen', 'Miso Ramen', 'Gyoza'],
    prices: [
      { item: 'Tonkotsu Ramen', price: '14.99', currency: 'USD' },
      { item: 'Gyoza (6 pieces)', price: '8.99', currency: 'USD' }
    ],
    restaurantName: 'Ramen House',
    location: 'Downtown',
    descriptions: ['Rich pork bone broth', 'Handmade noodles', 'Fresh vegetables'],
    confidence: 0.82
  }
}

async function analyzeEmotionalTone(mediaUrl: string): Promise<EmotionalTone> {
  // Placeholder - would analyze visual cues for emotional response
  return {
    mood: ['Comfort', 'Satisfaction', 'Warmth'],
    atmosphere: 'Cozy',
    ambiance: 8,
    sophistication: 6,
    comfort: 9,
    excitement: 7
  }
}

async function analyzeImageQuality(mediaUrl: string): Promise<QualityMetrics> {
  // Placeholder - would analyze technical image quality
  return {
    resolution: { width: 1920, height: 1080 },
    sharpness: 0.85,
    brightness: 0.72,
    contrast: 0.68,
    saturation: 0.75,
    noisiness: 0.15,
    overallQuality: 8.2,
    enhancementSuggestions: [
      'Slight contrast boost recommended',
      'Good sharpness and resolution',
      'Consider reducing noise levels'
    ]
  }
}

// Utility Functions

async function generateThumbnail(supabase: any, fileName: string, originalUrl: string): Promise<string> {
  // Placeholder - would generate thumbnail and upload
  const thumbnailFileName = fileName.replace(/\.(jpg|jpeg|png)$/i, '_thumb.jpg')
  return `${originalUrl.replace(fileName, thumbnailFileName)}`
}

async function enhanceImageQuality(mediaUrl: string): Promise<string> {
  // Placeholder - would enhance image and return new URL
  return mediaUrl.replace('.jpg', '_enhanced.jpg')
}

async function storeMediaRecord(supabase: any, record: any): Promise<void> {
  const { error } = await supabase
    .from('media_records')
    .insert({
      user_id: record.userId,
      media_url: record.mediaUrl,
      thumbnail_url: record.thumbnailUrl,
      media_type: record.mediaType,
      file_name: record.fileName,
      content_type: record.contentType,
      ai_analysis: record.analysis || {},
      metadata: record.metadata || {},
      created_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error storing media record:', error)
  }
}

async function updateMediaAnalysis(supabase: any, mediaId: string, analysis: any): Promise<void> {
  const { error } = await supabase
    .from('media_records')
    .update({
      ai_analysis: analysis,
      analyzed_at: new Date().toISOString()
    })
    .eq('id', mediaId)

  if (error) {
    console.error('Error updating media analysis:', error)
  }
}