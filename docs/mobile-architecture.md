# Kuchisabishii Mobile Architecture Plan

## Overview
This document outlines the comprehensive React Native/Expo mobile architecture for Kuchisabishii, focusing on performance optimization, offline-first capabilities, and emotional UX design that captures the essence of "mouth loneliness."

## 1. React Native/Expo Architecture with Performance Optimizations

### Core Setup
```typescript
// Expo SDK 49+ with React Native 0.72+
// Optimized for performance and development velocity

// expo.json configuration
{
  "expo": {
    "name": "Kuchisabishii",
    "slug": "kuchisabishii",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "userInterfaceStyle": "automatic",
    "updates": {
      "enabled": true,
      "checkAutomatically": "ON_LOAD"
    },
    "assetBundlePatterns": ["**/*"],
    "plugins": [
      "expo-camera",
      "expo-media-library",
      "expo-image-picker",
      "expo-location",
      "expo-notifications",
      "expo-local-authentication",
      "@react-native-async-storage/async-storage",
      "react-native-reanimated"
    ]
  }
}
```

### Performance Optimizations
- **Hermes Engine**: Enabled for faster startup and reduced memory usage
- **Code Splitting**: Lazy loading of screens and heavy components
- **Image Optimization**: WebP format with progressive loading
- **Bundle Analysis**: Metro bundler optimization with tree shaking
- **Memory Management**: Proper cleanup of listeners and subscriptions

### Architecture Layers
```
┌─────────────────────────────────────┐
│           Presentation Layer         │
│  (Screens, Components, Navigation)   │
├─────────────────────────────────────┤
│          Application Layer           │
│     (Hooks, Context, State Mgmt)     │
├─────────────────────────────────────┤
│            Domain Layer              │
│      (Business Logic, Services)      │
├─────────────────────────────────────┤
│         Infrastructure Layer         │
│  (API, Storage, Camera, Location)    │
└─────────────────────────────────────┘
```

## 2. Camera/Video Integration Strategy

### Media Capture Architecture
```typescript
// src/lib/media/CameraService.ts
export interface CameraService {
  capturePhoto(): Promise<MediaResult>
  captureVideo(): Promise<MediaResult>
  processImage(uri: string): Promise<ProcessedMedia>
  optimizeForUpload(media: MediaResult): Promise<OptimizedMedia>
}

// Media formats and optimization
const MEDIA_CONFIG = {
  photo: {
    quality: 0.8,
    format: 'webp',
    maxWidth: 1080,
    maxHeight: 1080,
    compress: true
  },
  video: {
    quality: 'high',
    maxDuration: 30,
    format: 'mp4',
    codec: 'h264'
  }
}
```

### Integration Points
- **Expo Camera**: Primary camera interface with custom overlay
- **Expo Image Picker**: Gallery selection with cropping
- **Expo Media Library**: Local media management
- **React Native Vision Camera**: Advanced features (if needed)

### Media Processing Pipeline
1. **Capture** → Raw media from camera/gallery
2. **Process** → Resize, compress, format conversion
3. **Optimize** → Progressive upload, thumbnail generation
4. **Store** → Local cache + cloud storage
5. **Sync** → Background upload with retry logic

## 3. Offline-First Data Architecture

### Storage Strategy
```typescript
// Multi-layer storage approach
┌──────────────────┐
│   Memory Cache   │  ← React Query/SWR
├──────────────────┤
│  SQLite Local    │  ← Expo SQLite
├──────────────────┤
│  File System     │  ← Media files
├──────────────────┤
│  Cloud Storage   │  ← Supabase
└──────────────────┘
```

### Sync Architecture
```typescript
// src/lib/sync/SyncManager.ts
export class SyncManager {
  // Queue-based sync with conflict resolution
  private syncQueue: SyncOperation[] = []
  
  async queueOperation(operation: SyncOperation): Promise<void>
  async processQueue(): Promise<SyncResult[]>
  async resolveConflicts(conflicts: Conflict[]): Promise<void>
  
  // Optimistic updates with rollback
  async optimisticUpdate<T>(operation: () => Promise<T>): Promise<T>
}

// Sync strategies by data type
const SYNC_STRATEGIES = {
  foodEntries: 'immediate', // Critical user data
  reviews: 'batched',      // Can be delayed
  media: 'background',     // Large files, low priority
  social: 'realtime'       // Friend interactions
}
```

### Data Flow Architecture
```typescript
// Offline-first data flow
User Action → Local State → Local DB → Sync Queue → Cloud DB
     ↓              ↑            ↑           ↑
UI Update ←── Query Cache ←─ Local Query ←─ Sync Success
```

## 4. Cross-Platform Component Library

### Design System Structure
```
src/
├── components/
│   ├── atoms/           # Basic building blocks
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Icon/
│   │   └── Typography/
│   ├── molecules/       # Combined atoms
│   │   ├── FoodCard/
│   │   ├── RatingStars/
│   │   ├── SearchBar/
│   │   └── MediaCapture/
│   ├── organisms/       # Complex components
│   │   ├── FoodJournal/
│   │   ├── RestaurantList/
│   │   ├── CameraOverlay/
│   │   └── SocialFeed/
│   └── templates/       # Layout templates
│       ├── MainLayout/
│       ├── OnboardingLayout/
│       └── DetailLayout/
```

### Emotional UX Components
```typescript
// src/components/emotional/
├── WhimsicalLoader/     # Animated loading states
├── MoodIndicator/       # Emotional state visualization
├── CravingPulse/        # Hunger indication animation
├── SatisfactionMeter/   # Post-meal satisfaction UI
├── LonelinessCompass/   # Social connection indicator
└── FlavorWheel/         # Taste preference selector
```

### Theme System (Mouth Loneliness Palette)
```typescript
// src/theme/colors.ts
export const emotionalPalette = {
  // Primary: Warm oranges representing food comfort
  primary: {
    50: '#FFF7ED',   // Cream
    100: '#FFEDD5',  // Light peach
    500: '#F59332',  // Main orange (existing)
    700: '#C2410C',  // Deep orange
    900: '#9A3412'   // Dark burnt orange
  },
  
  // Secondary: Soft purples for loneliness/introspection
  secondary: {
    50: '#FAF5FF',
    300: '#C084FC',
    500: '#8B5CF6',
    700: '#6D28D9'
  },
  
  // Emotional states
  emotions: {
    satisfied: '#22C55E',    // Green
    neutral: '#6B7280',      // Gray
    craving: '#EF4444',      // Red
    nostalgic: '#8B5CF6',    // Purple
    social: '#3B82F6'        // Blue
  }
}
```

## 5. Navigation Structure for Emotional Journey

### Navigation Architecture
```typescript
// src/navigation/NavigationTypes.ts
export type RootStackParamList = {
  Auth: NavigationProp<AuthStackParamList>
  Main: NavigationProp<MainTabParamList>
  Modal: NavigationProp<ModalStackParamList>
}

export type MainTabParamList = {
  Discover: undefined
  Capture: undefined
  Journal: undefined
  Social: undefined
  Profile: undefined
}

export type ModalStackParamList = {
  FoodEntry: { restaurantId?: string }
  RestaurantReview: { restaurantId: string }
  CameraCapture: { mode: 'photo' | 'video' }
  Settings: undefined
}
```

### Emotional Flow Design
```typescript
// Navigation with emotional context
const EmotionalNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: getEmotionalColor(route.name)
        },
        cardStyleInterpolator: getEmotionalTransition(route.name)
      })}
    >
      {/* Each screen has contextual emotional design */}
    </Stack.Navigator>
  )
}

// Micro-interactions for emotional feedback
const NavigationTransitions = {
  capture: 'slideFromBottom',  // Excitement
  journal: 'fadeIn',           // Contemplation  
  social: 'slideFromRight',    # Connection
  profile: 'slideFromLeft'     # Introspection
}
```

### Quick Actions & Gestures
```typescript
// Gesture-based interactions
const QuickCaptureGesture = {
  swipeUp: 'quickPhoto',       # Instant food capture
  longPress: 'videoMode',      # Video journaling
  doubleTap: 'favoriteSpot',   # Mark current location
  pinch: 'zoomMenu'            # Restaurant menu zoom
}
```

## 6. Image Optimization & Storage Strategy

### Multi-tier Storage System
```typescript
// src/lib/storage/MediaStorage.ts
export class MediaStorageManager {
  // Local storage tiers
  private thumbCache: AsyncStorage     // 64x64 thumbnails
  private previewCache: FileSystem     # 256x256 previews
  private fullImages: FileSystem       # Original/optimized
  
  // Cloud storage integration
  private cloudStorage: SupabaseStorage
  
  async storeMedia(media: MediaFile): Promise<StorageResult> {
    // 1. Generate thumbnails
    const thumb = await this.generateThumbnail(media, { size: 64 })
    const preview = await this.generatePreview(media, { size: 256 })
    
    // 2. Store locally first (offline-first)
    await this.storeLocal(media, { thumb, preview })
    
    # 3. Queue for cloud upload
    await this.queueCloudUpload(media)
    
    return { localUri: media.uri, cloudUrl: null }
  }
}
```

### Progressive Loading Strategy
```typescript
// Progressive image loading for emotional UX
const EmotionalImageLoader = ({ uri, emotion }) => {
  const [loadState, setLoadState] = useState('thumbnail')
  
  return (
    <View style={getEmotionalContainer(emotion)}>
      {/* Thumbnail with blur effect */}
      <BlurView intensity={loadState === 'thumbnail' ? 10 : 0}>
        <Image source={{ uri: getThumbnail(uri) }} />
      </BlurView>
      
      {/* Full image with fade-in */}
      <FadeIn delay={300}>
        <Image source={{ uri }} onLoad={() => setLoadState('full')} />
      </FadeIn>
    </View>
  )
}
```

## 7. Push Notifications & Meal Reminders

### Notification Strategy
```typescript
// src/lib/notifications/NotificationManager.ts
export class NotificationManager {
  // Meal reminder logic based on eating patterns
  async scheduleSmartReminders(userPreferences: UserPrefs): Promise<void> {
    const patterns = await this.analyzeMealPatterns()
    
    patterns.forEach(pattern => {
      this.scheduleNotification({
        id: `meal-${pattern.type}`,
        title: this.getEmotionalTitle(pattern),
        body: this.getPersonalizedMessage(pattern),
        trigger: this.calculateOptimalTime(pattern),
        categoryId: 'meal-reminder'
      })
    })
  }
  
  // Emotional notification content
  private getEmotionalTitle(pattern: MealPattern): string {
    const titles = {
      breakfast: "Good morning! Ready to start your food journey?",
      lunch: "Midday cravings calling? Time to explore!",
      dinner: "Evening comfort awaits... What sounds good?",
      snack: "A little something to cure that kuchisabishii?"
    }
    return titles[pattern.type]
  }
}
```

### Social Notifications
```typescript
// Friend activity notifications
const SocialNotificationCategories = {
  friendPost: {
    title: "{{friend}} shared a delicious discovery!",
    body: "Check out their latest food adventure",
    action: "VIEW_SOCIAL_FEED"
  },
  recommendation: {
    title: "Perfect match found!",
    body: "We found a dish that matches your taste perfectly",
    action: "VIEW_RECOMMENDATION"
  },
  reminder: {
    title: "Missing your food stories?",
    body: "Your journal is waiting for today's culinary adventure",
    action: "OPEN_CAPTURE"
  }
}
```

## 8. Geolocation Integration

### Location Architecture
```typescript
// src/lib/location/LocationService.ts
export class LocationService {
  private currentLocation: Location | null = null
  private nearbyRestaurants: Restaurant[] = []
  
  async getCurrentLocation(): Promise<Location> {
    // Smart location detection with privacy controls
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    })
    
    this.currentLocation = location
    this.updateNearbyRestaurants(location)
    return location
  }
  
  async findNearbyRestaurants(
    location: Location,
    radius: number = 5000
  ): Promise<Restaurant[]> {
    // Integration with restaurant database
    const nearby = await this.restaurantAPI.findNearby({
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      radius
    })
    
    return this.rankByUserPreferences(nearby)
  }
  
  // Geofencing for automatic restaurant detection
  async setupGeofencing(): Promise<void> {
    // Monitor favorite restaurants
    const favorites = await this.getFavoriteRestaurants()
    favorites.forEach(restaurant => {
      Location.startGeofencingAsync('favorites', [
        {
          identifier: restaurant.id,
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
          radius: 100 // 100m radius
        }
      ])
    })
  }
}
```

### Map Integration
```typescript
// Restaurant discovery map with emotional context
const EmotionalMap = () => {
  const { location } = useLocation()
  const { restaurants } = useNearbyRestaurants(location)
  
  return (
    <MapView
      style={styles.map}
      region={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }}
    >
      {restaurants.map(restaurant => (
        <EmotionalMarker
          key={restaurant.id}
          restaurant={restaurant}
          emotion={getUserEmotionalContext()}
        />
      ))}
    </MapView>
  )
}
```

## 9. Biometric Authentication

### Authentication Flow
```typescript
// src/lib/auth/BiometricAuth.ts
export class BiometricAuthManager {
  async initializeBiometrics(): Promise<BiometricCapability> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync()
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync()
    const isEnrolled = await LocalAuthentication.isEnrolledAsync()
    
    return {
      available: hasHardware && isEnrolled,
      types: supportedTypes,
      fallbackToPin: true
    }
  }
  
  async authenticateUser(
    reason: string = "Secure access to your food journal"
  ): Promise<AuthResult> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: "Cancel",
        fallbackLabel: "Use PIN",
        disableDeviceFallback: false
      })
      
      if (result.success) {
        await this.logSuccessfulAuth()
        return { success: true, method: 'biometric' }
      }
      
      return { success: false, error: result.error }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  // Quick access for food capture
  async quickCaptureAuth(): Promise<boolean> {
    const settings = await this.getUserSecuritySettings()
    
    if (settings.requireAuthForCapture) {
      return this.authenticateUser("Secure your food memories")
    }
    
    return true
  }
}
```

## 10. Performance Optimization for Media-Heavy Content

### Memory Management
```typescript
// src/lib/performance/MemoryManager.ts
export class MemoryManager {
  private imageCache = new Map<string, CachedImage>()
  private readonly MAX_CACHE_SIZE = 100 * 1024 * 1024 // 100MB
  private currentCacheSize = 0
  
  async optimizeMemoryUsage(): Promise<void> {
    // Clear old cached images
    const sortedImages = Array.from(this.imageCache.entries())
      .sort(([,a], [,b]) => a.lastAccessed - b.lastAccessed)
    
    while (this.currentCacheSize > this.MAX_CACHE_SIZE && sortedImages.length > 0) {
      const [key, image] = sortedImages.shift()!
      this.imageCache.delete(key)
      this.currentCacheSize -= image.size
    }
  }
  
  // Preload strategy for smooth scrolling
  async preloadNextImages(currentIndex: number, items: MediaItem[]): Promise<void> {
    const preloadCount = 3
    const nextItems = items.slice(currentIndex + 1, currentIndex + preloadCount + 1)
    
    await Promise.all(
      nextItems.map(item => this.preloadImage(item.uri))
    )
  }
}
```

### List Performance Optimization
```typescript
// Virtual scrolling for large food journals
const VirtualizedFoodJournal = () => {
  const { foodEntries } = useFoodJournal()
  
  const renderItem = useCallback(({ item, index }: ListRenderItemInfo<FoodEntry>) => (
    <Animated.View entering={FadeInUp.delay(index * 50)}>
      <FoodEntryCard entry={item} />
    </Animated.View>
  ), [])
  
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index
  }), [])
  
  return (
    <FlashList
      data={foodEntries}
      renderItem={renderItem}
      estimatedItemSize={ITEM_HEIGHT}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={21}
      initialNumToRender={10}
    />
  )
}
```

## Implementation Strategy

### Phase 1: Core Architecture (Weeks 1-2)
1. Set up enhanced Expo configuration with all required plugins
2. Implement basic offline-first data architecture
3. Create foundational component library with emotional theming
4. Set up navigation structure with micro-interactions

### Phase 2: Media & Location (Weeks 3-4)
1. Implement camera/video integration with optimization
2. Build geolocation services with restaurant discovery
3. Create image storage and sync architecture
4. Add biometric authentication system

### Phase 3: Advanced Features (Weeks 5-6)
1. Implement smart notification system
2. Build performance optimizations for media content
3. Add social features and real-time updates
4. Create whimsical animations and emotional feedback

### Phase 4: Polish & Testing (Weeks 7-8)
1. Comprehensive testing across devices
2. Performance optimization and memory management
3. Accessibility improvements
4. App store preparation and deployment

## Key Dependencies

```json
{
  "dependencies": {
    "expo": "~49.0.0",
    "expo-camera": "~13.4.0",
    "expo-media-library": "~15.4.0",
    "expo-image-picker": "~14.3.0",
    "expo-location": "~16.1.0",
    "expo-notifications": "~0.20.0",
    "expo-local-authentication": "~13.4.0",
    "expo-sqlite": "~11.3.0",
    "expo-file-system": "~15.4.0",
    "react-native-reanimated": "~3.3.0",
    "@react-native-async-storage/async-storage": "1.18.2",
    "@tanstack/react-query": "^4.29.0",
    "react-native-fast-image": "^8.6.3",
    "@shopify/flash-list": "1.4.3",
    "react-native-maps": "1.7.1",
    "react-native-gesture-handler": "~2.12.0"
  }
}
```

## Conclusion

This architecture provides a robust foundation for the Kuchisabishii mobile app, prioritizing:
- **Emotional User Experience**: Every interaction designed to address "mouth loneliness"
- **Performance**: Optimized for media-heavy content and smooth animations
- **Offline-First**: Reliable functionality regardless of connectivity
- **Scalability**: Modular architecture supporting future feature expansion
- **Cross-Platform Consistency**: Shared components and business logic with web version

The architecture leverages React Native/Expo's strengths while addressing the unique challenges of a media-rich, emotion-focused food journaling application.