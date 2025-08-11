# Comprehensive Data Structure Specifications

## Overview
Complete data structure definitions for the Kuchisabishii emotional food journaling system, including core entities, relationships, and specialized structures for emotional intelligence and cross-platform functionality.

## Core Data Entities

### User and Identity Management

```typescript
interface User {
  // Identity
  id: string;                        // UUID v4
  email: string;                     // Unique, encrypted
  username?: string;                 // Optional display name
  
  // Authentication
  authProvider: AuthProvider;
  authProviderUserId: string;
  emailVerified: boolean;
  phoneNumber?: string;
  phoneVerified: boolean;
  
  // Profile information
  profile: UserProfile;
  preferences: UserPreferences;
  privacySettings: PrivacySettings;
  
  // Subscription and access
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt?: Date;
  
  // System metadata
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
  deviceIds: string[];               // Associated devices
  
  // Soft deletion
  deletedAt?: Date;
  deletionReason?: DeletionReason;
}

interface UserProfile {
  // Personal information
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  
  // Demographics (optional, for recommendations)
  birthYear?: number;
  location?: LocationData;
  timezone: string;
  locale: string;
  
  // Food-related profile
  tasteProfile: PersonalTasteProfile;
  dietaryRestrictions: DietaryRestriction[];
  allergies: Allergy[];
  nutritionalGoals: NutritionalGoal[];
  
  // Social preferences
  socialVisibility: SocialVisibility;
  shareExperiences: boolean;
  allowTasteTwinMatching: boolean;
  
  // Profile completeness and confidence
  completenessScore: number;         // 0-100
  confidenceMetrics: ProfileConfidenceMetrics;
}

enum AuthProvider {
  EMAIL = "email",
  GOOGLE = "google", 
  APPLE = "apple",
  FACEBOOK = "facebook"
}

enum SubscriptionTier {
  FREE = "free",
  PREMIUM = "premium",
  FAMILY = "family",
  PROFESSIONAL = "professional"
}

enum SocialVisibility {
  PRIVATE = "private",
  FRIENDS_ONLY = "friends_only", 
  PUBLIC = "public"
}
```

### Food Experience and Logging

```typescript
interface FoodExperience {
  // Identity and ownership
  id: string;                        // UUID v4
  userId: string;                    // Foreign key to User
  deviceId: string;                  // Capture device
  
  // Basic food information
  foodName: string;
  description?: string;
  cuisine: CuisineType;
  category: FoodCategory;
  tags: string[];
  
  // Media assets
  primaryImage?: MediaAsset;
  additionalMedia: MediaAsset[];
  audioNotes?: AudioAsset;
  
  // Experience details
  experienceDate: Date;
  mealType: MealType;
  diningContext: DiningContext;
  
  // Emotional and satisfaction data
  emotionalRating: EmotionalRating;
  tastingNotes: TastingNotes;
  
  // Context and environment
  location?: LocationData;
  weather?: WeatherData;
  socialContext?: SocialContext;
  
  // Cost and logistics
  cost?: MonetaryAmount;
  portionSize?: PortionSize;
  preparationTime?: number;          // minutes
  
  // Recipe and cooking (if home-made)
  recipe?: RecipeReference;
  cookingMethod?: CookingMethod[];
  ingredients?: Ingredient[];
  
  // Restaurant data (if dining out)
  restaurant?: RestaurantReference;
  menuItem?: MenuItemReference;
  serviceRating?: ServiceRating;
  
  // Processing and AI analysis
  aiAnalysis?: AIAnalysisResults;
  processingStatus: ProcessingStatus;
  confidence: ConfidenceMetrics;
  
  // Sharing and social
  sharingLevel: SharingLevel;
  sharedWith: string[];              // User IDs
  likes: number;
  comments: Comment[];
  
  // System metadata
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
  version: number;                   // For conflict resolution
  
  // Soft deletion and history
  deletedAt?: Date;
  editHistory: EditHistory[];
}

interface EmotionalRating {
  // Core emotional scale (0-4)
  experienceLevel: EmotionalLevel;   // "Never Again" to "When My Mouth is Lonely"
  
  // Dimensional emotional analysis
  satisfaction: number;              // 0-100
  craving: number;                   // 0-100, future desire
  comfort: number;                   // 0-100, emotional comfort
  excitement: number;                // 0-100, novelty/thrill
  nostalgia: number;                 // 0-100, memory connection
  
  // Emotional context
  mood: MoodState;                   // Pre-eating mood
  postMealMood: MoodState;           // Post-eating mood
  emotionalTriggers: EmotionalTrigger[];
  
  // Temporal emotional data
  immediateRating: EmotionalLevel;    // Right after eating
  reflectiveRating?: EmotionalLevel;  // 24+ hours later
  
  // Confidence and reliability
  certainty: number;                 // 0-100, how sure user is
  consistency: number;               // 0-100, matches past patterns
  
  // Context factors affecting rating
  hungerLevel: HungerLevel;
  socialInfluence: number;           // -50 to +50
  environmentalFactors: EnvironmentalFactor[];
  
  // Metadata
  ratingTimestamp: Date;
  reflectiveTimestamp?: Date;
  deviceContext: DeviceContext;
}

enum EmotionalLevel {
  NEVER_AGAIN = 0,                   // "Never Again"
  MEH = 1,                           // "Meh"
  DECENT = 2,                        // "Decent" 
  DAMN_GOOD = 3,                     // "Damn Good"
  MOUTH_LONELY = 4                   // "When My Mouth is Lonely"
}

interface TastingNotes {
  // Flavor analysis
  primaryFlavors: FlavorNote[];
  flavorIntensity: number;           // 0-100
  flavorBalance: number;             // 0-100
  
  // Texture analysis
  texture: TextureDescriptor[];
  mouthfeel: MouthfeelCharacteristic[];
  temperature: TemperatureDescription;
  
  // Aroma and smell
  aroma: AromaDescriptor[];
  aromaIntensity: number;            // 0-100
  
  // Visual presentation
  visualAppeal: number;              // 0-100
  colorProfile: ColorDescriptor[];
  presentationStyle: PresentationStyle;
  
  // Overall assessment
  novelty: number;                   // 0-100, how new/unique
  authenticity: number;              // 0-100, how "authentic" it felt
  craftsmanship: number;             // 0-100, quality of preparation
  
  // Freeform notes
  personalNotes?: string;
  publicNotes?: string;
  
  // Voice transcription
  voiceNotes?: AudioTranscription;
}
```

### Restaurant and Dining Context

```typescript
interface Restaurant {
  // Identity
  id: string;                        // UUID v4
  name: string;
  aliases: string[];                 // Common alternate names
  
  // Location and contact
  location: RestaurantLocation;
  contactInfo: ContactInformation;
  
  // Basic information
  cuisine: CuisineType[];            // Primary and secondary cuisines
  category: RestaurantCategory;
  priceRange: PriceRange;
  
  // Operational details
  hours: OperatingHours[];
  reservationPolicy: ReservationPolicy;
  orderingMethods: OrderingMethod[];
  
  // Dining experience
  diningStyles: DiningStyle[];       // Dine-in, takeout, delivery
  atmosphere: AtmosphereProfile;
  amenities: Amenity[];
  
  // Menu and offerings
  menu: Menu;
  specialties: string[];
  dietaryAccommodations: DietaryAccommodation[];
  
  // Ratings and reviews
  overallRating: number;             // 0-5
  ratingBreakdown: RatingBreakdown;
  reviewCount: number;
  
  // Verification and data quality
  verificationStatus: VerificationStatus;
  dataSource: DataSource[];
  lastUpdated: Date;
  
  // System metadata
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface Menu {
  // Identity and versioning
  id: string;
  restaurantId: string;
  version: string;                   // Menu version/date
  
  // Menu structure
  sections: MenuSection[];
  items: MenuItem[];
  
  // Menu metadata
  menuType: MenuType;                // Regular, seasonal, special
  validFrom: Date;
  validUntil?: Date;
  language: string;
  
  // Pricing and availability
  currency: string;
  taxIncluded: boolean;
  serviceChargeIncluded: boolean;
  
  // Data quality
  completeness: number;              // 0-100
  lastVerified: Date;
  verificationSource: string;
}

interface MenuItem {
  // Identity
  id: string;
  menuId: string;
  sectionId: string;
  
  // Basic information
  name: string;
  description?: string;
  shortDescription?: string;
  
  // Classification
  category: FoodCategory;
  subCategory?: string;
  dishType: DishType;
  
  // Pricing
  price: MonetaryAmount;
  sizes: MenuItemSize[];             // If multiple sizes available
  
  // Nutritional and dietary
  calories?: number;
  nutritionInfo?: NutritionInformation;
  allergens: Allergen[];
  dietaryLabels: DietaryLabel[];
  
  // Preparation and ingredients
  ingredients: string[];             // Listed ingredients
  preparationMethod?: string;
  spiceLevel?: SpiceLevel;
  customizationOptions: CustomizationOption[];
  
  // Visual and presentation
  images: MenuItemImage[];
  presentationStyle: string;
  
  // Popularity and recommendations
  popularityScore?: number;          // 0-100
  chefRecommendation: boolean;
  seasonalAvailability?: SeasonalAvailability;
  
  // Metadata
  isActive: boolean;
  lastUpdated: Date;
}
```

### Social and Relationship Management

```typescript
interface SocialRelationship {
  // Identity
  id: string;
  fromUserId: string;
  toUserId: string;
  
  // Relationship type and status
  relationshipType: RelationshipType;
  status: RelationshipStatus;
  
  // Connection context
  connectionDate: Date;
  connectionSource: ConnectionSource;
  mutualFriends: string[];           // User IDs
  
  // Interaction data
  interactionFrequency: InteractionFrequency;
  lastInteraction: Date;
  sharedExperiences: number;
  
  // Trust and privacy
  trustLevel: TrustLevel;
  sharingPermissions: SharingPermission[];
  
  // Taste compatibility
  tasteCompatibility?: TasteCompatibilityScore;
  tasteTwinStatus?: TasteTwinStatus;
  
  // System metadata
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface TasteTwin {
  // Identity and relationship
  id: string;
  userId: string;
  twinUserId: string;
  relationshipId: string;            // Reference to SocialRelationship
  
  // Matching metrics
  overallSimilarity: number;         // 0-100
  tasteSimilarity: number;           // 0-100
  emotionalSimilarity: number;       // 0-100
  behavioralSimilarity: number;      // 0-100
  contextualSimilarity: number;      // 0-100
  
  // Matching details
  matchingFactors: MatchingFactor[];
  matchStrength: TwinStrength;
  confidenceScore: number;           // 0-100
  
  // Relationship evolution
  matchedDate: Date;
  relationshipEvolution: RelationshipEvolution[];
  stabilityScore: number;            // 0-100
  
  // Validation and verification
  crossValidationScore: number;      // 0-100
  mutualValidation: boolean;
  validationSources: ValidationSource[];
  
  // Privacy and consent
  privacyLevel: PrivacyLevel;
  consentStatus: ConsentStatus;
  sharingAgreement: SharingAgreement;
  
  // System metadata
  createdAt: Date;
  updatedAt: Date;
  lastRecalculated: Date;
  isActive: boolean;
}

enum RelationshipType {
  FRIEND = "friend",
  FAMILY = "family", 
  COLLEAGUE = "colleague",
  TASTE_TWIN = "taste_twin",
  FOLLOWER = "follower",
  BLOCKED = "blocked"
}

enum TasteTwinStatus {
  POTENTIAL = "potential",           // Algorithm identified
  SUGGESTED = "suggested",           // Shown to user
  PENDING = "pending",               // Request sent
  CONFIRMED = "confirmed",           // Mutual agreement
  DECLINED = "declined",             // User rejected
  INACTIVE = "inactive"              // Relationship ended
}
```

### Recommendation and Discovery

```typescript
interface RecommendationSet {
  // Identity and targeting
  id: string;
  userId: string;
  requestId?: string;                // If user-requested
  
  // Context and generation
  generationContext: RecommendationContext;
  generatedAt: Date;
  expiresAt: Date;
  
  // Recommendations
  recommendations: Recommendation[];
  totalCount: number;
  
  // Performance metadata
  generationTimeMs: number;
  algorithmVersions: AlgorithmVersion[];
  
  // User interaction tracking
  viewed: boolean;
  viewedAt?: Date;
  interactions: RecommendationInteraction[];
}

interface Recommendation {
  // Identity
  id: string;
  recommendationSetId: string;
  rank: number;                      // Position in recommendation set
  
  // Recommended content
  contentType: RecommendationContentType;
  contentId: string;                 // ID of recommended item
  content: RecommendationContent;    // Denormalized for performance
  
  // Scoring and reasoning
  score: number;                     // 0-100, overall recommendation score
  scoreBreakdown: ScoreBreakdown;
  confidence: number;                // 0-100, algorithm confidence
  
  // Reasoning and explanation
  primaryReason: RecommendationReason;
  supportingReasons: RecommendationReason[];
  explanation: UserFacingExplanation;
  
  // Predictions
  predictedSatisfaction: number;     // 0-100
  predictedNovelty: number;          // 0-100  
  predictedEmotionalResponse: EmotionalResponsePrediction;
  
  // Context matching
  contextualRelevance: number;       // 0-100
  temporalRelevance: number;         // 0-100
  socialRelevance: number;           // 0-100
  
  // User interaction
  userActions: UserAction[];
  feedback: RecommendationFeedback[];
  
  // System metadata
  createdAt: Date;
  lastInteracted?: Date;
}

enum RecommendationContentType {
  FOOD_ITEM = "food_item",
  RESTAURANT = "restaurant", 
  RECIPE = "recipe",
  USER_EXPERIENCE = "user_experience",
  MENU_ITEM = "menu_item",
  TASTE_TWIN_SUGGESTION = "taste_twin_suggestion"
}

interface RecommendationContext {
  // User state
  currentMood?: MoodState;
  hungerLevel?: HungerLevel;
  energyLevel?: number;              // 0-100
  
  // Temporal context  
  timestamp: Date;
  mealType?: MealType;
  timeOfDay: TimeOfDay;
  dayOfWeek: DayOfWeek;
  seasonality: SeasonalContext;
  
  // Location context
  currentLocation?: LocationData;
  locationAccuracy?: number;
  
  // Social context
  socialSituation?: SocialSituation;
  groupSize?: number;
  companionUserIds?: string[];
  
  // Constraints
  budgetConstraints?: BudgetConstraints;
  timeConstraints?: TimeConstraints;
  dietaryConstraints?: DietaryConstraint[];
  
  // Intent and preferences
  explicitIntent?: ExplicitIntent;
  noveltyPreference?: number;        // 0-100
  diversityRequirement?: number;     // 0-100
}
```

### Search and Discovery Structures

```typescript
interface SearchQuery {
  // Identity and session
  id: string;
  sessionId: string;
  userId: string;
  
  // Query content
  queryText: string;
  queryLanguage: string;
  queryType: QueryType;
  
  // Parsed query understanding
  parsedQuery: ParsedQuery;
  extractedIntent: ExtractedIntent;
  extractedEntities: ExtractedEntity[];
  
  // Context and filters
  searchContext: SearchContext;
  filters: SearchFilter[];
  
  // Search parameters
  maxResults: number;
  offset: number;
  sortBy: SortCriteria[];
  
  // Personalization
  personalizeResults: boolean;
  useHistory: boolean;
  includeEmotionalContext: boolean;
  
  // System metadata
  createdAt: Date;
  processingTimeMs?: number;
}

interface SearchResult {
  // Identity and ranking
  id: string;
  queryId: string;
  rank: number;
  
  // Result content
  resultType: SearchResultType;
  contentId: string;
  content: SearchResultContent;
  
  // Relevance and scoring
  relevanceScore: number;            // 0-100, overall relevance
  scoreComponents: SearchScoreComponents;
  
  // Match information
  matchType: MatchType;
  matchedFields: string[];
  matchStrength: number;             // 0-100
  
  // Contextual fit
  contextualRelevance: number;       // 0-100
  personalRelevance: number;         // 0-100
  temporalRelevance: number;         // 0-100
  
  // Explanation and reasoning
  whyRelevant: RelevanceExplanation;
  highlightedText?: string[];
  
  // Discovery context
  noveltyScore: number;              // 0-100
  serendipityScore: number;          // 0-100
  
  // User interaction
  clicked: boolean;
  clickedAt?: Date;
  userActions: SearchResultAction[];
  
  // System metadata  
  createdAt: Date;
  cacheHit: boolean;
  retrievalTimeMs: number;
}

interface FoodKnowledgeGraph {
  // Graph structure
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  
  // Indexing and access
  nodeIndex: Map<string, KnowledgeNode>;
  typeIndex: Map<NodeType, KnowledgeNode[]>;
  relationshipIndex: Map<RelationshipType, KnowledgeEdge[]>;
  
  // Embeddings and similarity
  nodeEmbeddings: Map<string, number[]>;
  embeddingDimensions: number;
  embeddingModel: string;
  
  // Graph metadata
  totalNodes: number;
  totalEdges: number;
  lastUpdated: Date;
  version: string;
  
  // Quality metrics
  completeness: number;              // 0-100
  consistency: number;               // 0-100  
  coverage: GraphCoverage;
}

interface KnowledgeNode {
  // Identity
  id: string;
  type: NodeType;
  
  // Content
  name: string;
  aliases: string[];
  description?: string;
  
  // Properties
  properties: Map<string, any>;
  categories: string[];
  tags: string[];
  
  // Relationships (outgoing)
  relationships: KnowledgeEdge[];
  
  // Confidence and source
  confidence: number;                // 0-100
  sources: DataSource[];
  
  // Embeddings
  embedding?: number[];
  embeddingVersion?: string;
  
  // System metadata
  createdAt: Date;
  updatedAt: Date;
  accessCount: number;
  lastAccessed: Date;
}

enum NodeType {
  FOOD_ITEM = "food_item",
  INGREDIENT = "ingredient",
  CUISINE = "cuisine",
  COOKING_METHOD = "cooking_method",
  FLAVOR = "flavor",
  TEXTURE = "texture",
  RESTAURANT = "restaurant",
  USER = "user",
  EXPERIENCE = "experience",
  RECIPE = "recipe"
}
```

## Synchronization and Offline Support

```typescript
interface SyncOperation {
  // Identity and ordering
  id: string;
  operationId: string;               // Idempotency key
  deviceId: string;
  userId: string;
  
  // Operation details
  operationType: SyncOperationType;
  entityType: string;
  entityId: string;
  
  // Operation data
  data: any;                         // Serialized operation data
  previousData?: any;                // For conflict resolution
  
  // Versioning and conflict resolution
  version: number;
  vectorClock: VectorClock;
  checksum: string;
  
  // Timing and sequencing
  localTimestamp: Date;
  serverTimestamp?: Date;
  sequenceNumber: number;
  
  // Status and retry
  status: SyncOperationStatus;
  priority: SyncPriority;
  retryCount: number;
  lastRetryAt?: Date;
  
  // Dependencies
  dependsOn: string[];               // Other operation IDs
  blockedBy: string[];               // Conflicts/dependencies
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;                  // Auto-cleanup old operations
}

interface ConflictResolution {
  // Identity
  id: string;
  conflictId: string;
  resolutionStrategy: ResolutionStrategy;
  
  // Conflicting data
  localVersion: any;
  remoteVersion: any;
  resolvedVersion: any;
  
  // Resolution metadata
  resolvedBy: ResolutionMethod;
  resolvedAt: Date;
  confidence: number;                // 0-100
  
  // User involvement
  userNotified: boolean;
  userChoice?: UserConflictChoice;
  automaticResolution: boolean;
  
  // Audit trail
  resolutionSteps: ResolutionStep[];
  appliedTransforms: Transform[];
}

enum SyncOperationType {
  CREATE = "create",
  UPDATE = "update", 
  DELETE = "delete",
  RESTORE = "restore",
  MERGE = "merge"
}

enum ResolutionStrategy {
  LAST_WRITE_WINS = "last_write_wins",
  MERGE_CHANGES = "merge_changes",
  USER_CHOICE = "user_choice",
  KEEP_BOTH = "keep_both",
  PREFER_LOCAL = "prefer_local",
  PREFER_REMOTE = "prefer_remote",
  SEMANTIC_MERGE = "semantic_merge"
}
```

## Privacy and Security Structures

```typescript
interface PrivacySettings {
  // Identity and ownership
  userId: string;
  lastUpdated: Date;
  
  // Data sharing controls
  sharePersonalTasteProfile: SharingLevel;
  shareEmotionalData: SharingLevel;
  shareDiningHistory: SharingLevel;
  shareLocationData: SharingLevel;
  shareMediaContent: SharingLevel;
  
  // Social features
  allowTasteTwinMatching: boolean;
  allowSocialRecommendations: boolean;
  allowFriendRequests: boolean;
  showOnlineStatus: boolean;
  
  // Discovery and recommendations  
  allowPersonalizedRecommendations: boolean;
  allowCollaborativeFiltering: boolean;
  shareForAggregatedInsights: boolean;
  
  // Communication preferences
  allowDirectMessages: boolean;
  allowComments: boolean;
  allowTagging: boolean;
  
  // Data retention
  dataRetentionPeriod: DataRetentionPeriod;
  autoDeleteOldData: boolean;
  
  // Analytics and research
  participateInResearch: boolean;
  allowAnonymizedDataSharing: boolean;
  shareUsageStatistics: boolean;
  
  // Third-party integration
  allowThirdPartyIntegrations: boolean;
  approvedIntegrations: string[];
  
  // Granular permissions
  granularPermissions: GranularPermission[];
}

interface DataClassification {
  // Classification metadata
  dataId: string;
  dataType: DataType;
  sensitivityLevel: SensitivityLevel;
  
  // Classification tags
  personallyIdentifiable: boolean;
  emotionallyRevealing: boolean;
  locationBased: boolean;
  behavioralData: boolean;
  
  // Privacy requirements
  encryptionRequired: boolean;
  accessControls: AccessControl[];
  retentionPolicy: RetentionPolicy;
  
  // Compliance flags
  gdprApplicable: boolean;
  ccpaApplicable: boolean;
  hipaaApplicable: boolean;
  
  // Audit trail
  classifiedAt: Date;
  classifiedBy: string;
  lastReviewed: Date;
  autoClassified: boolean;
}

enum SensitivityLevel {
  PUBLIC = "public",                 // Can be shared publicly
  INTERNAL = "internal",             // Within app ecosystem only
  CONFIDENTIAL = "confidential",     // Restricted access
  HIGHLY_SENSITIVE = "highly_sensitive" // Minimal access, encryption required
}

enum SharingLevel {
  PRIVATE = "private",               // Only user
  CLOSE_FRIENDS = "close_friends",   // Designated close friends
  FRIENDS = "friends",               // All friends/connections
  COMMUNITY = "community",           // App community
  PUBLIC = "public"                  // Anyone
}
```

## Analytics and Machine Learning Structures

```typescript
interface UserBehaviorAnalytics {
  // Identity and time range
  userId: string;
  analysisStartDate: Date;
  analysisEndDate: Date;
  
  // Usage patterns
  sessionFrequency: SessionFrequency;
  avgSessionDuration: number;        // minutes
  peakUsageHours: number[];          // hours of day (0-23)
  usageByDayOfWeek: number[];        // usage per day of week
  
  // Feature usage
  featureUsageStats: FeatureUsageStats;
  mostUsedFeatures: string[];
  leastUsedFeatures: string[];
  
  // Content interaction
  experienceLoggingFrequency: number; // per week
  searchQueryFrequency: number;       // per week
  recommendationEngagement: number;   // 0-100
  socialInteractionLevel: number;     // 0-100
  
  // Engagement quality
  engagementScore: number;           // 0-100
  retentionRisk: number;             // 0-100
  satisfactionIndicators: SatisfactionIndicator[];
  
  // Personalization effectiveness
  recommendationAcceptance: number;  // 0-100
  searchSuccessRate: number;         // 0-100
  personalizationBenefit: number;    // 0-100
  
  // Growth and learning
  tasteProfileEvolution: number;     // 0-100, how much taste changed
  explorationTendency: number;       // 0-100, trying new things
  expertiseGrowth: number;           // 0-100, culinary knowledge growth
  
  // System metadata
  computedAt: Date;
  validUntil: Date;
  confidence: number;                // 0-100
}

interface MLModel {
  // Model identity
  id: string;
  name: string;
  version: string;
  modelType: MLModelType;
  
  // Training information
  trainingDataset: DatasetReference;
  trainingStarted: Date;
  trainingCompleted: Date;
  trainingDuration: number;          // minutes
  
  // Model architecture
  architecture: string;
  hyperparameters: Map<string, any>;
  featureSet: string[];
  
  // Performance metrics
  accuracy: number;                  // 0-100
  precision: number;                 // 0-100
  recall: number;                    // 0-100
  f1Score: number;                   // 0-100
  
  // Validation results
  crossValidationScore: number;      // 0-100
  testSetPerformance: PerformanceMetrics;
  
  // Deployment information
  deployedAt?: Date;
  servingEndpoint?: string;
  lastPrediction?: Date;
  predictionCount: number;
  
  // Model lifecycle
  status: ModelStatus;
  retrainingSchedule?: RetrainingSchedule;
  nextRetraining?: Date;
  
  // Monitoring
  performanceDrift: number;          // 0-100
  dataDistributionDrift: number;     // 0-100
  lastMonitored: Date;
  
  // System metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

enum MLModelType {
  TASTE_SIMILARITY = "taste_similarity",
  EMOTIONAL_PREDICTION = "emotional_prediction", 
  RECOMMENDATION_RANKING = "recommendation_ranking",
  FOOD_CLASSIFICATION = "food_classification",
  CONTEXT_DETECTION = "context_detection",
  SEARCH_RELEVANCE = "search_relevance",
  CHURN_PREDICTION = "churn_prediction"
}

enum ModelStatus {
  TRAINING = "training",
  VALIDATION = "validation",
  DEPLOYED = "deployed",
  RETIRED = "retired",
  FAILED = "failed"
}
```

## System Configuration and Metadata

```typescript
interface SystemConfiguration {
  // Configuration identity
  id: string;
  environment: Environment;
  version: string;
  
  // Feature flags
  features: FeatureFlag[];
  experimentFlags: ExperimentFlag[];
  
  // Performance settings
  performanceSettings: PerformanceSettings;
  cachingSettings: CachingSettings;
  
  // Machine learning configuration
  mlSettings: MLSettings;
  modelEndpoints: Map<string, string>;
  
  // Third-party integrations
  integrationSettings: IntegrationSettings;
  apiKeys: Map<string, string>;      // Encrypted
  
  // Security settings
  securitySettings: SecuritySettings;
  encryptionSettings: EncryptionSettings;
  
  // Monitoring and alerting
  monitoringSettings: MonitoringSettings;
  alertThresholds: AlertThreshold[];
  
  // System metadata
  deployedAt: Date;
  lastUpdated: Date;
  updatedBy: string;
  configHash: string;                // For integrity verification
}

interface FeatureFlag {
  // Flag identity
  name: string;
  description: string;
  
  // Flag status
  enabled: boolean;
  environment: Environment[];
  
  // Rollout configuration
  rolloutPercentage: number;         // 0-100
  userSegments: string[];            // Which user segments get the feature
  
  // A/B testing
  experimentId?: string;
  variantId?: string;
  
  // Lifecycle
  createdAt: Date;
  enabledAt?: Date;
  scheduledDisableAt?: Date;
  
  // Monitoring
  usageCount: number;
  lastUsed?: Date;
  performanceImpact?: PerformanceImpact;
}

interface AuditLog {
  // Log identity
  id: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  
  // Actor information
  actorType: ActorType;
  actorId: string;                   // User ID, system ID, etc.
  actorIP?: string;
  actorUserAgent?: string;
  
  // Target information
  targetType: string;
  targetId: string;
  targetData?: any;                  // Relevant data snapshot
  
  // Event details
  action: string;
  description: string;
  metadata: Map<string, any>;
  
  // Result information
  result: AuditResult;
  errorMessage?: string;
  
  // System context
  requestId?: string;
  sessionId?: string;
  deviceId?: string;
  
  // Timestamp information
  timestamp: Date;
  timezone: string;
  
  // Data retention
  retentionCategory: RetentionCategory;
  expiresAt?: Date;
}

enum AuditEventType {
  USER_ACTION = "user_action",
  DATA_MODIFICATION = "data_modification",
  SYSTEM_EVENT = "system_event",
  SECURITY_EVENT = "security_event",
  PRIVACY_EVENT = "privacy_event",
  PERFORMANCE_EVENT = "performance_event"
}

enum Environment {
  DEVELOPMENT = "development",
  STAGING = "staging", 
  PRODUCTION = "production",
  TEST = "test"
}
```

This comprehensive data structure specification provides the foundation for implementing the Kuchisabishii emotional food journaling system with robust data modeling, privacy controls, and scalable architecture support.