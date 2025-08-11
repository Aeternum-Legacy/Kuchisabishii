/**
 * React Component-Ready Seed Data for Kuchisabishii
 * Formatted for easy integration with React components and TypeScript
 */

// User Profile with realistic preferences
export const mockUser = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "alex.chen@example.com",
  username: "alexfoodie",
  displayName: "Alex Chen",
  firstName: "Alex", 
  lastName: "Chen",
  bio: "Food enthusiast exploring Edmonton's diverse culinary scene. Love trying new cuisines and documenting my taste adventures!",
  profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  location: "Edmonton, Alberta, Canada",
  dateOfBirth: new Date("1992-03-15"),
  dietaryRestrictions: ["gluten-sensitive"],
  favoriteCuisines: ["Japanese", "Korean", "Italian", "Thai", "Mexican"],
  privacyLevel: "friends" as const,
  
  // Taste preferences (1-10 scale) 
  tasteProfile: {
    spiceTolerance: 6,
    sweetnessPreference: 7,
    saltinessPreference: 8,
    sournessPreference: 6,
    bitternessPreference: 4,
    umamiPreference: 9,
    crunchyPreference: 7,
    creamyPreference: 8,
    adventurousness: 8
  },
  
  // Food statistics
  stats: {
    totalReviews: 47,
    totalPhotos: 89,
    favoriteRestaurants: 12,
    friendsCount: 23,
    followersCount: 34,
    avgRating: 4.2,
    topCuisine: "Japanese",
    moodBooster: "Korean BBQ"
  },
  
  createdAt: new Date("2023-12-01T00:00:00Z"),
  updatedAt: new Date("2024-01-15T10:30:00Z")
};

// Food Reviews with rich emotional and sensory data
export const mockFoodReviews = [
  {
    id: "food-0001-chirashi-bowl",
    userId: "550e8400-e29b-41d4-a716-446655440000",
    title: "Chirashi Bowl - Premium Selection",
    description: "Beautiful presentation of fresh sashimi over seasoned sushi rice. The fish quality was exceptional.",
    
    // Rich emotional and sensory experience
    experience: {
      kuchisabishiiRating: 5, // 1-5 scale: "When my mouth is lonely"
      emotions: ["peaceful", "satisfied", "appreciative"],
      moodBefore: "stressed",
      moodAfter: "calm",
      worthIt: 4.8, // Price vs satisfaction
      cravingLevel: 4.5, // How much you'd want again
      emotionalContext: "Felt like a meditation on flavor - each piece of fish was a moment of pure taste"
    },
    
    // Detailed sensory profile
    sensory: {
      taste: {
        umami: 9,
        saltiness: 6,
        sweetness: 3,
        sourness: 4,
        bitterness: 1
      },
      mouthfeel: {
        texture: "silky and firm",
        temperature: "cool", 
        richness: "medium"
      },
      aroma: {
        intensity: 7,
        descriptors: ["oceanic", "clean", "fresh"]
      },
      visual: {
        appeal: 9,
        colorVibrancy: 8,
        presentation: "artful"
      }
    },
    
    // Practical details
    restaurant: {
      id: "rest-0001-japanese-sushi",
      name: "Mikado Sushi",
      address: "10126 100 Street NW, Edmonton, AB",
      latitude: 53.5461,
      longitude: -113.4937
    },
    
    price: 28.50,
    currency: "CAD",
    category: "lunch",
    diningMethod: "dine_in",
    mealTime: "lunch",
    
    tags: ["fresh", "sashimi", "rice", "authentic", "high-quality"],
    ingredients: ["salmon", "tuna", "tamago", "sushi-rice", "nori", "wasabi", "pickled-ginger"],
    
    images: [
      "https://images.unsplash.com/photo-1563612142-b5906a8dc1de?w=800&h=600",
      "https://images.unsplash.com/photo-1559058922-aec55395d41e?w=800&h=600"
    ],
    
    // Nutritional info
    nutrition: {
      calories: 520,
      protein: 35.2,
      carbs: 48.1,
      fat: 18.7
    },
    
    consumedAt: new Date("2024-01-15T12:30:00Z"),
    createdAt: new Date("2024-01-15T13:15:00Z"),
    
    // Social features
    isPublic: true,
    allowComments: true,
    likesCount: 12,
    commentsCount: 3
  },

  {
    id: "food-0002-bulgogi-bbq", 
    userId: "550e8400-e29b-41d4-a716-446655440000",
    title: "Korean Bulgogi BBQ Set",
    description: "Traditional marinated beef bulgogi grilled tableside with all the classic banchan sides",
    
    experience: {
      kuchisabishiiRating: 4, // "I'd crave this" 
      emotions: ["social", "excited", "nostalgic"],
      moodBefore: "tired",
      moodAfter: "energized",
      worthIt: 4.3,
      cravingLevel: 4.6,
      emotionalContext: "Brought back memories of family gatherings - food that brings people together"
    },
    
    sensory: {
      taste: {
        umami: 8,
        saltiness: 7,
        sweetness: 6,
        sourness: 2,
        bitterness: 1
      },
      mouthfeel: {
        texture: "tender and juicy",
        temperature: "hot",
        richness: "rich"
      },
      aroma: {
        intensity: 8,
        descriptors: ["smoky", "caramelized", "garlicky"]
      },
      visual: {
        appeal: 8,
        colorVibrancy: 7,
        presentation: "interactive"
      }
    },
    
    restaurant: {
      id: "rest-0002-korean-bbq",
      name: "Seoul Kitchen", 
      address: "8215 112 Street NW, Edmonton, AB",
      latitude: 53.5128,
      longitude: -113.5098
    },
    
    price: 32.00,
    currency: "CAD",
    category: "dinner",
    diningMethod: "dine_in", 
    mealTime: "dinner",
    
    tags: ["grilled", "marinated", "interactive", "sharing", "authentic"],
    ingredients: ["beef", "soy-sauce", "garlic", "pear", "sesame-oil", "kimchi", "rice"],
    
    images: [
      "https://images.unsplash.com/photo-1552909114-f6e3e6d8af41?w=800&h=600"
    ],
    
    nutrition: {
      calories: 680,
      protein: 42.8, 
      carbs: 35.2,
      fat: 28.5
    },
    
    consumedAt: new Date("2024-01-12T19:15:00Z"),
    createdAt: new Date("2024-01-12T21:45:00Z"),
    
    isPublic: true,
    allowComments: true,
    likesCount: 8,
    commentsCount: 2
  },

  {
    id: "food-0003-pad-thai",
    userId: "550e8400-e29b-41d4-a716-446655440000",
    title: "Authentic Pad Thai with Shrimp",
    description: "Classic Thai stir-fried rice noodles with shrimp, egg, bean sprouts, and traditional garnishes",
    
    experience: {
      kuchisabishiiRating: 5, // "When my mouth is lonely"
      emotions: ["delighted", "surprised", "nostalgic"],
      moodBefore: "hungry",
      moodAfter: "completely_satisfied",
      worthIt: 4.9,
      cravingLevel: 4.8,
      emotionalContext: "Transported me back to Bangkok street markets - authentic flavors that tell a story"
    },
    
    sensory: {
      taste: {
        umami: 7,
        saltiness: 6,
        sweetness: 7,
        sourness: 8,
        bitterness: 1
      },
      mouthfeel: {
        texture: "chewy with crunch",
        temperature: "hot",
        richness: "balanced" 
      },
      aroma: {
        intensity: 8,
        descriptors: ["tamarind", "fish-sauce", "lime", "peanuts"]
      },
      visual: {
        appeal: 7,
        colorVibrancy: 8,
        presentation: "rustic-authentic"
      }
    },
    
    restaurant: {
      id: "truck-0009-thai-street",
      name: "Bangkok Street Food Co.",
      address: "Mobile - Various locations, Edmonton, AB", 
      latitude: 53.5444,
      longitude: -113.4909
    },
    
    price: 14.00,
    currency: "CAD",
    category: "lunch",
    diningMethod: "takeout",
    mealTime: "lunch",
    
    tags: ["authentic", "sweet-and-sour", "street-food", "fresh-shrimp", "customizable"],
    ingredients: ["rice-noodles", "shrimp", "egg", "bean-sprouts", "tamarind", "fish-sauce", "peanuts", "lime"],
    
    images: [
      "https://images.unsplash.com/photo-1559314809-0f31657def5e?w=800&h=600"
    ],
    
    nutrition: {
      calories: 520,
      protein: 24.6,
      carbs: 68.3,
      fat: 16.8
    },
    
    consumedAt: new Date("2024-01-02T12:45:00Z"),
    createdAt: new Date("2024-01-02T13:30:00Z"),
    
    isPublic: true,
    allowComments: true,
    likesCount: 15,
    commentsCount: 4
  },

  {
    id: "food-0004-instant-ramen",
    userId: "550e8400-e29b-41d4-a716-446655440000",
    title: "Late Night Shin Ramyun + Soft Boiled Egg",
    description: "Korean instant noodles with added soft-boiled egg during a late study session",
    
    experience: {
      kuchisabishiiRating: 2, // "Meh"
      emotions: ["tired", "functional", "guilty"],
      moodBefore: "stressed",
      moodAfter: "temporarily_satisfied", 
      worthIt: 3.0,
      cravingLevel: 2.5,
      emotionalContext: "Sometimes you need that 2 AM comfort food. Not gourmet but served its purpose during finals week"
    },
    
    sensory: {
      taste: {
        umami: 4,
        saltiness: 9,
        sweetness: 2,
        sourness: 1,
        bitterness: 2
      },
      mouthfeel: {
        texture: "soft and mushy",
        temperature: "very hot",
        richness: "artificial"
      },
      aroma: {
        intensity: 6,
        descriptors: ["artificial", "spicy", "msg"]
      },
      visual: {
        appeal: 3,
        colorVibrancy: 6,
        presentation: "utilitarian"
      }
    },
    
    restaurant: {
      id: "convenience-0008-late-night",
      name: "Campus Corner Store",
      address: "8640 112 Street NW, Edmonton, AB",
      latitude: 53.5206,
      longitude: -113.5124
    },
    
    price: 3.49,
    currency: "CAD",
    category: "snack",
    diningMethod: "homemade",
    mealTime: "late_night",
    
    tags: ["late-night", "comfort-food", "spicy", "quick", "student-food"],
    ingredients: ["instant-noodles", "egg", "gochugaru", "garlic"],
    
    images: [],
    
    nutrition: {
      calories: 380,
      protein: 14.2,
      carbs: 52.8,
      fat: 12.5
    },
    
    consumedAt: new Date("2024-01-03T02:15:00Z"), 
    createdAt: new Date("2024-01-03T02:45:00Z"),
    
    isPublic: false,
    allowComments: false,
    likesCount: 0,
    commentsCount: 0
  }
];

// Restaurant data with comprehensive details
export const mockRestaurants = [
  {
    id: "rest-0001-japanese-sushi",
    name: "Mikado Sushi",
    description: "Authentic Japanese sushi restaurant with fresh daily catches and traditional preparations",
    
    location: {
      address: "10126 100 Street NW",
      city: "Edmonton",
      state: "Alberta", 
      country: "Canada",
      postalCode: "T5J 0P6",
      latitude: 53.5461,
      longitude: -113.4937
    },
    
    contact: {
      phone: "+1-780-555-0101",
      email: "info@mikadosushi.ca", 
      website: "https://mikadosushi.ca"
    },
    
    details: {
      cuisineTypes: ["Japanese", "Sushi", "Seafood"],
      priceRange: 3, // $$$
      rating: 4.6,
      reviewCount: 127,
      deliveryAvailable: true,
      takeoutAvailable: true,
      reservationRequired: false
    },
    
    hours: {
      monday: "11:30-21:30",
      tuesday: "11:30-21:30",
      wednesday: "11:30-21:30", 
      thursday: "11:30-21:30",
      friday: "11:30-22:00",
      saturday: "12:00-22:00",
      sunday: "12:00-21:00"
    },
    
    amenities: ["wifi", "parking", "wheelchair_accessible"],
    
    photos: [
      "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=600",
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600"
    ],
    
    isVerified: true,
    isActive: true,
    
    // Additional features for recommendations
    atmosphere: ["authentic", "calm", "upscale-casual"],
    specialties: ["chirashi", "sashimi", "traditional-rolls"],
    dietaryOptions: ["gluten-free-soy-sauce"],
    
    createdAt: new Date("2023-06-15T00:00:00Z"),
    updatedAt: new Date("2024-01-10T00:00:00Z")
  },

  {
    id: "truck-0009-thai-street", 
    name: "Bangkok Street Food Co.",
    description: "Authentic Thai street food truck serving pad thai, curries, and fresh spring rolls",
    
    location: {
      address: "Mobile - Various locations",
      city: "Edmonton",
      state: "Alberta",
      country: "Canada", 
      postalCode: null,
      latitude: 53.5444,
      longitude: -113.4909
    },
    
    contact: {
      phone: "+1-780-555-0109",
      email: "bangkokstreet@gmail.com",
      website: "https://instagram.com/bangkokstreetyyc"
    },
    
    details: {
      cuisineTypes: ["Thai", "Street_Food", "Mobile"],
      priceRange: 2, // $$
      rating: 4.8,
      reviewCount: 167,
      deliveryAvailable: false,
      takeoutAvailable: true,
      reservationRequired: false
    },
    
    hours: {
      monday: "11:00-19:00",
      tuesday: "11:00-19:00", 
      wednesday: "11:00-19:00",
      thursday: "11:00-19:00",
      friday: "11:00-21:00",
      saturday: "12:00-21:00",
      sunday: "closed"
    },
    
    amenities: ["outdoor_dining", "authentic_recipes"],
    
    photos: [
      "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800&h=600"
    ],
    
    isVerified: false,
    isActive: true,
    
    atmosphere: ["casual", "authentic", "street-food"],
    specialties: ["pad-thai", "green-curry", "mango-sticky-rice"],
    dietaryOptions: ["vegetarian", "vegan-options"],
    
    // Food truck specific
    locationUpdates: "Follow @bangkokstreetyyc for daily locations",
    paymentMethods: ["cash", "e-transfer"],
    
    createdAt: new Date("2023-12-02T00:00:00Z"),
    updatedAt: new Date("2024-01-14T00:00:00Z")
  }
];

// Recommendation engine data
export const mockRecommendations = {
  personalizedForYou: [
    {
      type: "similar_taste",
      restaurant: mockRestaurants[0],
      confidence: 0.92,
      reasoning: "Based on your love for authentic Japanese food and high umami preferences",
      dishes: ["Omakase Selection", "Salmon Teriyaki Bowl"]
    },
    {
      type: "new_cuisine_adventure", 
      restaurant: mockRestaurants[1],
      confidence: 0.78,
      reasoning: "Your adventurous rating suggests you'd enjoy authentic Thai street food",
      dishes: ["Green Curry", "Mango Sticky Rice"]
    }
  ],
  
  friendsLoved: [
    {
      friendName: "Sam Rodriguez",
      restaurant: "Haweli Indian Cuisine",
      dishes: ["Butter Chicken", "Garlic Naan"],
      rating: 4.5,
      review: "Perfect spice level and amazing naan!"
    }
  ],
  
  trending: [
    {
      restaurant: "Meat & Bread",
      trend: "Most photographed dish this week",
      dish: "Porchetta Sandwich",
      photoCount: 89
    }
  ]
};

// Social features data
export const mockSocialData = {
  recentActivity: [
    {
      id: "activity-001",
      type: "food_entry",
      user: "alexfoodie",
      action: "tried amazing chirashi bowl",
      restaurant: "Mikado Sushi",
      timeAgo: "2 hours ago",
      image: "https://images.unsplash.com/photo-1563612142-b5906a8dc1de?w=400&h=400"
    },
    {
      id: "activity-002", 
      type: "review",
      user: "pasta_lover_yeg",
      action: "left a 5-star review for",
      restaurant: "Nonna's Table",
      timeAgo: "5 hours ago",
      rating: 5
    }
  ],
  
  suggestedFriends: [
    {
      username: "sushi_sam",
      displayName: "Sam Rodriguez", 
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
      mutualRestaurants: 3,
      tasteSimilarity: 0.84,
      sharedCuisines: ["Japanese", "Korean", "Thai"]
    }
  ]
};

// Collections/Lists data
export const mockCollections = [
  {
    id: "collection-0001-date-night",
    name: "Perfect Date Night Spots", 
    description: "Romantic restaurants for special occasions",
    color: "#FF6B6B",
    icon: "heart",
    itemCount: 8,
    isPublic: false,
    items: [
      {
        type: "restaurant",
        id: "rest-0003-italian-restaurant",
        name: "Nonna's Table",
        note: "Perfect romantic atmosphere, amazing truffle pasta",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400"
      }
    ]
  },
  
  {
    id: "collection-0002-comfort-food",
    name: "Ultimate Comfort Foods",
    description: "Foods that make my soul happy",
    color: "#4ECDC4", 
    icon: "coffee",
    itemCount: 12,
    isPublic: true,
    items: [
      {
        type: "food_entry",
        id: "food-0006-carnitas-tacos",
        name: "Fresh Carnitas Tacos",
        note: "Best authentic tacos in the city - pure comfort",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400"
      }
    ]
  }
];

// Kuchisabishii rating system
export const kuchisabishiiScale = [
  {
    rating: 1,
    label: "Never again", 
    description: "Deeply disappointing",
    emoji: "😤",
    color: "#FF6B6B"
  },
  {
    rating: 2,
    label: "Meh",
    description: "Forgettable",
    emoji: "😐", 
    color: "#FFA726"
  },
  {
    rating: 3,
    label: "It's okay",
    description: "Neutral experience",
    emoji: "🙂",
    color: "#FFEE58"
  },
  {
    rating: 4, 
    label: "I'd crave this",
    description: "Creates desire",
    emoji: "😋",
    color: "#66BB6A"
  },
  {
    rating: 5,
    label: "When my mouth is lonely",
    description: "Perfect soulmate food",
    emoji: "😍", 
    color: "#42A5F5"
  }
];

export default {
  mockUser,
  mockFoodReviews,
  mockRestaurants,
  mockRecommendations,
  mockSocialData,
  mockCollections,
  kuchisabishiiScale
};