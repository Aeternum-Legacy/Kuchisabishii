/**
 * Restaurant Reviews and Additional Seed Data for Kuchisabishii
 * Comprehensive reviews matching the food entries and restaurants
 */

import { dummyUser, seedRestaurants } from './kuchisabishii-seed-data';

// Restaurant Reviews (separate from food experiences)
export const seedRestaurantReviews = [
  {
    id: "review-0001-mikado-sushi",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    restaurant_id: "rest-0001-japanese-sushi",
    food_entry_id: "food-0001-chirashi-bowl",
    title: "Exceptional sushi quality in downtown Edmonton",
    content: "Mikado consistently delivers restaurant-quality sushi that rivals what you'd find in Vancouver or Toronto. The fish is clearly fresh, rice is properly seasoned, and presentation is beautiful. While pricey, it's justified by the quality. The atmosphere is calm and authentic without being pretentious. Service was attentive without being intrusive. This is my go-to for special occasions or when I want to treat myself to premium sushi.",
    rating: 4.6,
    food_rating: 4.8,
    service_rating: 4.5,
    atmosphere_rating: 4.4,
    value_rating: 4.2,
    photos: [
      "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=600"
    ],
    visit_date: "2024-01-15",
    party_size: 1,
    wait_time_minutes: 15,
    total_cost: 45.50,
    currency: "CAD",
    recommended_dishes: ["Chirashi Bowl", "Salmon Sashimi", "Spicy Tuna Roll"],
    pros: ["Fresh fish quality", "Authentic preparation", "Beautiful presentation", "Knowledgeable staff"],
    cons: ["Premium pricing", "Limited parking", "Can get busy during lunch rush"],
    is_public: true,
    allow_responses: true,
    helpful_count: 0,
    is_verified: false,
    is_featured: false,
    is_flagged: false,
    created_at: "2024-01-15T14:00:00Z",
    updated_at: "2024-01-15T14:00:00Z"
  },

  {
    id: "review-0002-seoul-kitchen",
    user_id: "550e8400-e29b-41d4-a716-446655440000", 
    restaurant_id: "rest-0002-korean-bbq",
    food_entry_id: "food-0002-bulgogi-bbq",
    title: "Authentic Korean BBQ with great atmosphere",
    content: "Seoul Kitchen brings the real Korean BBQ experience to Edmonton. The tableside grilling is fun and interactive, perfect for groups. Banchan (side dishes) are refilled generously and the kimchi has that perfect fermentation tang. Bulgogi marinade is spot-on - sweet, savory, and not too salty. The restaurant gets loud with the grills and conversations, which adds to the authentic feel. Reservations are essential for dinner, especially weekends.",
    rating: 4.4,
    food_rating: 4.5,
    service_rating: 4.2,
    atmosphere_rating: 4.6,
    value_rating: 4.3,
    photos: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600"
    ],
    visit_date: "2024-01-12",
    party_size: 3,
    wait_time_minutes: 25,
    total_cost: 98.50,
    currency: "CAD",
    recommended_dishes: ["Bulgogi Set", "Galbi", "Seafood Pancake", "Soju"],
    pros: ["Interactive dining", "Generous banchan", "Authentic flavors", "Great for groups"],
    cons: ["Can get very loud", "Smoky atmosphere", "Reservations required"],
    is_public: true,
    allow_responses: true,
    helpful_count: 2,
    is_verified: false,
    is_featured: false,
    is_flagged: false,
    created_at: "2024-01-12T22:00:00Z",
    updated_at: "2024-01-12T22:00:00Z"
  },

  {
    id: "review-0003-nonnas-table", 
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    restaurant_id: "rest-0003-italian-restaurant",
    food_entry_id: "food-0003-truffle-pasta",
    title: "Romantic Italian dining with exceptional pasta",
    content: "Nonna's Table elevates Italian dining in Edmonton to another level. The handmade pasta is worth the premium price - you can taste the difference in every bite. Service is professional and knowledgeable about wine pairings. The atmosphere strikes the perfect balance between romantic and comfortable. While expensive, it's perfect for special occasions. The truffle pasta was a standout - rich, aromatic, and indulgent. Book ahead, especially for weekend dinners.",
    rating: 4.7,
    food_rating: 4.9,
    service_rating: 4.6,
    atmosphere_rating: 4.8,
    value_rating: 4.1,
    photos: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600"
    ],
    visit_date: "2024-01-10",
    party_size: 2,
    wait_time_minutes: 10,
    total_cost: 128.75,
    currency: "CAD",
    recommended_dishes: ["Truffle Tagliatelle", "Osso Buco", "Tiramisu"],
    pros: ["Handmade pasta", "Excellent service", "Romantic atmosphere", "Wine selection"],
    cons: ["High prices", "Limited vegetarian options", "Reservations essential"],
    is_public: true,
    allow_responses: true,
    helpful_count: 5,
    is_verified: false,
    is_featured: true,
    is_flagged: false,
    created_at: "2024-01-10T23:00:00Z",
    updated_at: "2024-01-10T23:00:00Z"
  },

  {
    id: "review-0004-steam-dot-coffee",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    restaurant_id: "cafe-0004-specialty-coffee", 
    food_entry_id: "food-0004-cortado-pastry",
    title: "Local coffee roastery with excellent single origins",
    content: "Steam Dot has become my regular coffee spot. They roast their own beans and really understand coffee. The baristas know their craft and can explain the flavor profiles of different origins. The Ethiopian single-origin I tried had beautiful floral notes. Pastries are sourced from local bakers and always fresh. Great laptop-friendly atmosphere with good wifi. Prices are reasonable for specialty coffee. Perfect spot for morning meetings or solo work sessions.",
    rating: 4.5,
    food_rating: 4.4,
    service_rating: 4.6, 
    atmosphere_rating: 4.5,
    value_rating: 4.4,
    photos: [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600"
    ],
    visit_date: "2024-01-08",
    party_size: 1,
    wait_time_minutes: 5,
    total_cost: 12.75,
    currency: "CAD",
    recommended_dishes: ["Single Origin Cortado", "Almond Croissant", "Pour Over Coffee"],
    pros: ["Local roasted beans", "Knowledgeable baristas", "Laptop friendly", "Fresh pastries"],
    cons: ["Limited food menu", "Can get busy mornings", "Parking is street only"],
    is_public: true,
    allow_responses: true,
    helpful_count: 3,
    is_verified: false,
    is_featured: false,
    is_flagged: false,
    created_at: "2024-01-08T10:00:00Z",
    updated_at: "2024-01-08T10:00:00Z"
  },

  {
    id: "review-0005-bangkok-street-food",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    restaurant_id: "truck-0009-thai-street",
    food_entry_id: "food-0009-pad-thai", 
    title: "Authentic Thai street food that rivals Bangkok",
    content: "This food truck is a hidden gem! The owners clearly know authentic Thai cooking - every dish I've tried tastes like what I had traveling in Thailand. The pad thai has that perfect balance of sweet, sour, and salty that's so hard to find. Shrimp are always fresh and the portions are generous. They move around the city but post their location on Instagram. Worth tracking down for authentic Thai flavors at great prices. Cash only, but there's usually an ATM nearby.",
    rating: 4.8,
    food_rating: 4.9,
    service_rating: 4.6,
    atmosphere_rating: 4.2,
    value_rating: 4.9,
    photos: [
      "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800&h=600"
    ],
    visit_date: "2024-01-02",
    party_size: 1,
    wait_time_minutes: 12,
    total_cost: 14.00,
    currency: "CAD",
    recommended_dishes: ["Pad Thai", "Green Curry", "Mango Sticky Rice"],
    pros: ["Authentic flavors", "Generous portions", "Great value", "Fresh ingredients"],
    cons: ["Mobile location", "Weather dependent", "Cash only", "Limited seating"],
    is_public: true,
    allow_responses: true,
    helpful_count: 8,
    is_verified: false,
    is_featured: true,
    is_flagged: false,
    created_at: "2024-01-02T14:00:00Z",
    updated_at: "2024-01-02T14:00:00Z"
  }
];

// Additional user activities and social features
export const seedUserActivities = [
  {
    id: "activity-0001-food-entry",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    activity_type: "food_entry" as const,
    title: "Tried amazing chirashi bowl",
    description: "Discovered exceptional sushi quality at Mikado Sushi downtown",
    metadata: {
      food_entry_id: "food-0001-chirashi-bowl",
      restaurant_name: "Mikado Sushi",
      rating: 4.8,
      cuisine: "Japanese"
    },
    is_public: true,
    created_at: "2024-01-15T13:15:00Z"
  },
  {
    id: "activity-0002-review",
    user_id: "550e8400-e29b-41d4-a716-446655440000", 
    activity_type: "review" as const,
    title: "Reviewed Bangkok Street Food Co.",
    description: "Shared authentic Thai food truck experience",
    metadata: {
      review_id: "review-0005-bangkok-street-food",
      restaurant_name: "Bangkok Street Food Co.",
      rating: 4.8,
      helpful_votes: 8
    },
    is_public: true,
    created_at: "2024-01-02T14:00:00Z"
  }
];

// User collections for organizing favorites
export const seedUserCollections = [
  {
    id: "collection-0001-date-night",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Perfect Date Night Spots",
    description: "Romantic restaurants for special occasions",
    is_public: false,
    color: "#FF6B6B",
    icon: "heart",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z"
  },
  {
    id: "collection-0002-comfort-food", 
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Ultimate Comfort Foods",
    description: "Foods that make my soul happy",
    is_public: true,
    color: "#4ECDC4",
    icon: "coffee",
    created_at: "2024-01-01T00:00:00Z", 
    updated_at: "2024-01-15T00:00:00Z"
  },
  {
    id: "collection-0003-hidden-gems",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Hidden Edmonton Gems",
    description: "Lesser-known spots with amazing food",
    is_public: true,
    color: "#45B7D1",
    icon: "star",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z"
  }
];

// Collection items linking foods/restaurants to collections
export const seedCollectionItems = [
  {
    id: "collection-item-0001",
    collection_id: "collection-0001-date-night",
    item_type: "restaurant" as const,
    item_id: "rest-0003-italian-restaurant",
    notes: "Perfect romantic atmosphere, amazing truffle pasta",
    created_at: "2024-01-10T23:30:00Z"
  },
  {
    id: "collection-item-0002",
    collection_id: "collection-0002-comfort-food", 
    item_type: "food_entry" as const,
    item_id: "food-0006-carnitas-tacos",
    notes: "Best authentic tacos in the city - pure comfort",
    created_at: "2024-01-05T15:00:00Z"
  },
  {
    id: "collection-item-0003",
    collection_id: "collection-0003-hidden-gems",
    item_type: "restaurant" as const, 
    item_id: "truck-0009-thai-street",
    notes: "Mobile Thai street food that rivals Bangkok",
    created_at: "2024-01-02T14:30:00Z"
  },
  {
    id: "collection-item-0004",
    collection_id: "collection-0002-comfort-food",
    item_type: "food_entry" as const,
    item_id: "food-0004-cortado-pastry",
    notes: "Perfect morning ritual - coffee and pastry perfection",
    created_at: "2024-01-08T10:30:00Z"
  }
];

// Taste profile evolution tracking
export const seedTasteProfileHistory = [
  {
    id: "taste-history-0001",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    food_entry_id: "food-0001-chirashi-bowl",
    review_id: null,
    learned_cuisines: {
      "Japanese": {
        preference_increase: 0.2,
        confidence: 0.85,
        specific_items: ["sashimi", "sushi_rice"]
      }
    },
    learned_ingredients: {
      "salmon": { 
        preference: 9.2,
        confidence: 0.9
      },
      "tuna": {
        preference: 8.8, 
        confidence: 0.85
      }
    },
    learned_flavors: {
      "umami": {
        preference: 9.1,
        tolerance_increase: 0.1
      },
      "oceanic": {
        preference: 8.5,
        new_discovery: true
      }
    },
    interaction_type: "positive_rating",
    confidence_score: 0.87,
    created_at: "2024-01-15T13:15:00Z"
  },
  {
    id: "taste-history-0002", 
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    food_entry_id: "food-0008-instant-ramen",
    review_id: null,
    learned_cuisines: {
      "Korean": {
        preference_change: -0.1,
        confidence: 0.6,
        note: "late_night_context_affects_rating"
      }
    },
    learned_ingredients: {
      "instant_noodles": {
        preference: 3.2,
        context_dependent: true
      }
    },
    learned_flavors: {
      "artificial": {
        preference: 2.8,
        tolerance: "context_dependent"
      }
    },
    interaction_type: "low_rating",
    confidence_score: 0.65,
    created_at: "2024-01-03T02:45:00Z"
  }
];

// Restaurant recommendations based on user preferences
export const seedRestaurantRecommendations = [
  {
    id: "rec-0001-ramen-shop",
    user_id: "550e8400-e29b-41d4-a716-446655440000", 
    restaurant_id: "rest-0001-japanese-sushi", // Would be a different restaurant in real scenario
    recommendation_type: "similar_cuisine_high_rating",
    confidence_score: 0.92,
    reasoning: "Based on your love for authentic Japanese food like the chirashi bowl, you'd enjoy their omakase experience",
    was_viewed: false,
    was_visited: false,
    was_liked: null,
    was_dismissed: false,
    generated_at: "2024-01-16T10:00:00Z",
    expires_at: "2024-01-23T10:00:00Z",
    created_at: "2024-01-16T10:00:00Z"
  },
  {
    id: "rec-0002-vietnamese-pho",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    restaurant_id: "rest-0002-korean-bbq", // Would be Vietnamese restaurant in real scenario
    recommendation_type: "flavor_profile_match",
    confidence_score: 0.78,
    reasoning: "Your preference for umami-rich broths and your 4.5 rating of Bangkok Street Food suggests you'd enjoy authentic pho",
    was_viewed: true,
    was_visited: false,
    was_liked: null,
    was_dismissed: false,
    generated_at: "2024-01-15T15:00:00Z",
    expires_at: "2024-01-22T15:00:00Z",
    created_at: "2024-01-15T15:00:00Z"
  }
];

// Food pairings data for recommendations
export const seedFoodPairings = [
  {
    id: "pairing-0001-sushi-sake",
    food_item_1: "sashimi",
    food_item_2: "sake",
    pairing_score: 9.2,
    pairing_type: "traditional",
    cuisine_context: ["Japanese"],
    user_votes: 145,
    created_at: "2023-12-01T00:00:00Z"
  },
  {
    id: "pairing-0002-pasta-wine",
    food_item_1: "truffle_pasta", 
    food_item_2: "red_wine",
    pairing_score: 8.8,
    pairing_type: "classic",
    cuisine_context: ["Italian"],
    user_votes: 98,
    created_at: "2023-12-01T00:00:00Z"
  },
  {
    id: "pairing-0003-tacos-lime",
    food_item_1: "carnitas_tacos",
    food_item_2: "lime_juice",
    pairing_score: 9.5,
    pairing_type: "essential",
    cuisine_context: ["Mexican"],
    user_votes: 234,
    created_at: "2023-12-01T00:00:00Z"
  }
];

// Emotional rating mapping for Kuchisabishii scale
export const emotionalRatingMap = {
  1: {
    label: "Never again",
    description: "Deeply disappointing - would not recommend",
    emotion: "disappointed",
    would_return: false
  },
  2: {
    label: "Meh", 
    description: "Forgettable - nothing special",
    emotion: "indifferent", 
    would_return: false
  },
  3: {
    label: "It's okay",
    description: "Neutral experience - might try again",
    emotion: "neutral",
    would_return: "maybe"
  },
  4: {
    label: "I'd crave this",
    description: "Creates desire - would seek this out again", 
    emotion: "satisfied",
    would_return: true
  },
  5: {
    label: "When my mouth is lonely",
    description: "Perfect soulmate food - deeply satisfying",
    emotion: "fulfilled",
    would_return: "definitely"
  }
};

// Social features: friend suggestions based on similar taste profiles
export const suggestedFriends = [
  {
    id: "user-friend-0001",
    username: "sushi_sam", 
    display_name: "Sam Rodriguez",
    profile_image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    mutual_restaurants: 3,
    taste_similarity_score: 0.84,
    shared_cuisines: ["Japanese", "Korean", "Thai"],
    reason: "Similar love for authentic Asian cuisine"
  },
  {
    id: "user-friend-0002", 
    username: "pasta_lover_yeg",
    display_name: "Maria Gonzalez",
    profile_image: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=200&h=200&fit=crop&crop=face",
    mutual_restaurants: 2,
    taste_similarity_score: 0.72,
    shared_cuisines: ["Italian", "Mexican"],
    reason: "Shared appreciation for comfort foods and family dining"
  }
];

export default {
  seedRestaurantReviews,
  seedUserActivities,
  seedUserCollections,
  seedCollectionItems, 
  seedTasteProfileHistory,
  seedRestaurantRecommendations,
  seedFoodPairings,
  emotionalRatingMap,
  suggestedFriends
};