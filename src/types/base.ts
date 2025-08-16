/**
 * Kuchisabishii Base Type Definitions
 * ARCHITECTURE AUTHORITY: Architecture Agent (Weight 10)
 * 
 * These are the foundational types that ALL components and interfaces
 * must extend. No exceptions.
 * 
 * Reference: /docs/KUCHISABISHII_ARCHITECTURE.md
 */

// =============================================================================
// BASE ENTITY INTERFACES
// =============================================================================

export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

export interface BaseUserProfile extends BaseEntity {
  username: string | null
  display_name: string | null
  bio: string | null
  location: string | null
  dietary_restrictions: string[]
  allergies: string[]
  profile_visibility: 'public' | 'friends' | 'private'
  allow_recommendations: boolean
  share_analytics: boolean
}

export interface BaseComponent<T = unknown> {
  className?: string
  testId?: string
  ariaLabel?: string
  data?: T
}

// =============================================================================
// STANDARD COMPONENT PROP PATTERNS
// =============================================================================

export interface StandardComponentProps<TData = unknown> extends BaseComponent<TData> {
  // Required data
  children?: React.ReactNode
  
  // State management
  loading?: boolean
  error?: string | null
  
  // Event handlers (always async for data operations)
  onSave?: (data: TData) => Promise<void>
  onCancel?: () => void
  onError?: (error: string) => void
  
  // Customization
  variant?: 'default' | 'compact' | 'detailed'
  size?: 'sm' | 'md' | 'lg'
}

export interface FormComponentProps<TFormData> extends StandardComponentProps<TFormData> {
  initialData?: Partial<TFormData>
  validationSchema?: ValidationSchema<TFormData>
  onSubmit: (data: TFormData) => Promise<void>
  onValidationError?: (errors: ValidationErrors<TFormData>) => void
}

export interface ListComponentProps<TItem> extends StandardComponentProps<TItem[]> {
  items: readonly TItem[]
  onItemSelect?: (item: TItem) => void
  onItemUpdate?: (id: string, updates: Partial<TItem>) => Promise<void>
  onItemDelete?: (id: string) => Promise<void>
  renderItem?: (item: TItem, index: number) => React.ReactNode
  emptyState?: React.ReactNode
}

// =============================================================================
// ASYNC OPERATION PATTERNS
// =============================================================================

export interface AsyncOperation<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export type ComponentState<T> = 
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: string }

// =============================================================================
// API INTERFACE STANDARDS
// =============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T | null
  error: string | null
  metadata?: {
    timestamp: string
    requestId: string
    version: string
  }
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiClient {
  get<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>>
  post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>>
  put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>>
  delete<T>(endpoint: string): Promise<ApiResponse<T>>
}

// =============================================================================
// SETTINGS & PREFERENCES TYPES
// =============================================================================

export type NotificationType = 
  | 'food_recommendations'
  | 'friend_activity'
  | 'new_followers'
  | 'review_responses'
  | 'system_updates'
  | 'email_digest'
  | 'push_notifications'

export type PrivacySettingKey = 
  | 'profile_visibility'
  | 'show_location'
  | 'show_activity'
  | 'allow_friend_requests'
  | 'share_analytics'
  | 'allow_recommendations'

export type PrivacySettingValue = boolean | 'public' | 'friends' | 'private'

export type DataSettingKey = 
  | 'auto_backup'
  | 'photo_quality'
  | 'offline_mode'

export type DataSettingValue = boolean | 'low' | 'medium' | 'high'

export type UserPreference = 
  | 'theme'
  | 'language'
  | 'timezone'
  | 'currency'

// =============================================================================
// FOOD & TASTE EXPERIENCE TYPES
// =============================================================================

export interface TasteExperience {
  saltiness: number | null
  sweetness: number | null
  sourness: number | null
  bitterness: number | null
  umami: number | null
}

export interface FoodExperience extends BaseEntity {
  dish_name: string
  custom_notes: string | null
  experienced_at: string
  amount_spent: number | null
  overall_rating: number | null
  photos: string[]
  meal_time: string | null
  dining_method: string | null
  dining_companions: number
  taste_experience?: TasteExperience
  restaurant?: {
    id: string
    name: string
    cuisine_types: string[]
  }
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

export type ValidationSchema<T> = {
  [K in keyof T]?: {
    required?: boolean
    type?: 'string' | 'number' | 'boolean' | 'array' | 'object'
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: RegExp
    custom?: (value: T[K]) => string | null
  }
}

export type ValidationErrors<T> = {
  [K in keyof T]?: string[]
}

// =============================================================================
// TYPE UTILITIES
// =============================================================================

export type SettingValue = string | boolean | number | string[]

export interface SettingUpdate<T extends SettingValue> {
  key: string
  value: T
}

// =============================================================================
// USER SETTINGS MAPPED TYPES
// =============================================================================

export type UserNotificationSettings = {
  [K in NotificationType]: boolean
}

export type UserPrivacySettings = {
  profile_visibility: 'public' | 'friends' | 'private'
  show_location: boolean
  show_activity: boolean
  allow_friend_requests: boolean
  share_analytics: boolean
  allow_recommendations: boolean
}

export type UserDataSettings = {
  auto_backup: boolean
  photo_quality: 'low' | 'medium' | 'high'
  offline_mode: boolean
}

export type UserPreferenceSettings = {
  [K in UserPreference]: string | number | boolean
}

export interface UserSettings {
  notifications: UserNotificationSettings
  privacy: UserPrivacySettings
  data: UserDataSettings
  preferences: UserPreferenceSettings
}

// =============================================================================
// ARCHITECTURAL COMPLIANCE UTILITIES
// =============================================================================

/**
 * Type guard to ensure proper typing instead of Record<string, unknown>
 */
export function isValidSettingValue(value: unknown): value is SettingValue {
  return (
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    (Array.isArray(value) && value.every(item => typeof item === 'string'))
  )
}

/**
 * Type-safe setting update function
 */
export function createSettingUpdater<TSettings extends Record<string, SettingValue>>(
  setState: React.Dispatch<React.SetStateAction<TSettings>>
) {
  return <K extends keyof TSettings>(key: K, value: TSettings[K]) => {
    if (!isValidSettingValue(value)) {
      throw new Error(`Invalid setting value for ${String(key)}: ${value}`)
    }
    setState(prev => ({ ...prev, [key]: value }))
  }
}

// =============================================================================
// EXPORT GUARDS
// =============================================================================

/**
 * These types are the SINGLE SOURCE OF TRUTH for Kuchisabishii architecture.
 * 
 * ALL components must use these types. NO exceptions.
 * 
 * For questions or new type requirements:
 * 1. Check if existing types can be extended
 * 2. If not, consult Architecture Agent (Weight 10)
 * 3. Update this file with Architecture Agent approval
 * 4. Update architecture documentation
 * 
 * DO NOT create duplicate interfaces in other files.
 * DO NOT use Record<string, unknown> for typed data.
 * DO NOT bypass these type definitions.
 */