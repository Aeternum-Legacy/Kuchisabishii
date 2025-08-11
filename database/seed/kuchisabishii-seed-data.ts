/**
 * Comprehensive Seed Data for Kuchisabishii Food Review App
 * Includes realistic data for food reviews, restaurants, and user profiles
 * Located in Edmonton, Alberta, Canada area
 */

// Dummy User Profile
export const dummyUser = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "alex.chen@example.com",
  username: "alexfoodie",
  display_name: "Alex Chen",
  first_name: "Alex",
  last_name: "Chen",
  bio: "Food enthusiast exploring Edmonton's diverse culinary scene. Love trying new cuisines and documenting my taste adventures!",
  profile_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  location: "Edmonton, Alberta, Canada",
  date_of_birth: "1992-03-15",
  dietary_restrictions: ["gluten-sensitive"],
  favorite_cuisines: ["Japanese", "Korean", "Italian", "Thai", "Mexican"],
  privacy_level: "friends" as const,
  notification_preferences: {
    food_recommendations: true,
    friend_activity: true,
    new_followers: true,
    review_responses: true,
    system_updates: false
  },
  created_at: "2023-12-01T00:00:00Z",
  updated_at: "2024-01-15T10:30:00Z"
};

// User Preferences Profile
export const dummyUserPreferences = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  user_id: "550e8400-e29b-41d4-a716-446655440000",
  preferred_cuisines: {
    "Japanese": 9,
    "Korean": 8,
    "Italian": 8,
    "Thai": 7,
    "Mexican": 7,
    "Vietnamese": 6,
    "Indian": 5,
    "Chinese": 6
  },
  disliked_cuisines: ["overly-spicy-foods"],
  spice_tolerance: 6, // 1-10 scale
  sweetness_preference: 7,
  saltiness_preference: 8,
  sourness_preference: 6,
  bitterness_preference: 4,
  umami_preference: 9,
  dietary_restrictions: ["gluten-sensitive"],
  allergies: ["shellfish"],
  preferred_ingredients: ["garlic", "ginger", "basil", "cheese", "avocado"],
  disliked_ingredients: ["cilantro", "blue-cheese"],
  preferred_price_range: [2, 3], // $$ to $$$
  preferred_atmosphere: ["casual", "cozy", "trendy"],
  preferred_meal_times: {
    breakfast: "8:00-10:00",
    lunch: "12:00-14:00", 
    dinner: "18:00-21:00"
  },
  max_travel_distance: 25, // km
  preferred_neighborhoods: ["Downtown", "Whyte Avenue", "Kensington", "Garneau"],
  prefers_solo_dining: false,
  prefers_group_dining: true,
  shares_food_often: true,
  enable_smart_recommendations: true,
  recommendation_frequency: "daily",
  include_friend_recommendations: true,
  include_trending_recommendations: true,
  created_at: "2023-12-01T00:30:00Z",
  updated_at: "2024-01-15T11:00:00Z"
};

// 10 Restaurants with varied shop types
export const seedRestaurants = [
  {
    id: "rest-0001-japanese-sushi",
    name: "Mikado Sushi",
    description: "Authentic Japanese sushi restaurant with fresh daily catches and traditional preparations",
    address: "10126 100 Street NW",
    city: "Edmonton",
    state: "Alberta",
    country: "Canada",
    postal_code: "T5J 0P6",
    latitude: 53.5461,
    longitude: -113.4937,
    phone: "+1-780-555-0101",
    email: "info@mikadosushi.ca",
    website: "https://mikadosushi.ca",
    cuisine_types: ["Japanese", "Sushi", "Seafood"],
    price_range: 3,
    rating: 4.6,
    review_count: 127,
    opening_hours: {
      monday: "11:30-21:30",
      tuesday: "11:30-21:30", 
      wednesday: "11:30-21:30",
      thursday: "11:30-21:30",
      friday: "11:30-22:00",
      saturday: "12:00-22:00",
      sunday: "12:00-21:00"
    },
    menu_url: null,
    delivery_available: true,
    takeout_available: true,
    reservation_required: false,
    photos: [
      "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=600",
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600"
    ],
    amenities: ["wifi", "parking", "wheelchair_accessible"],
    is_verified: true,
    is_active: true,
    created_at: "2023-06-15T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z"
  },
  
  {
    id: "rest-0002-korean-bbq",
    name: "Seoul Kitchen",
    description: "Traditional Korean BBQ and authentic home-style dishes in a warm atmosphere",
    address: "8215 112 Street NW",
    city: "Edmonton", 
    state: "Alberta",
    country: "Canada",
    postal_code: "T6G 1K6",
    latitude: 53.5128,
    longitude: -113.5098,
    phone: "+1-780-555-0102",
    email: "hello@seoulkitchen.ca",
    website: "https://seoulkitchen.ca",
    cuisine_types: ["Korean", "BBQ", "Asian"],
    price_range: 2,
    rating: 4.4,
    review_count: 89,
    opening_hours: {
      monday: "16:00-22:00",
      tuesday: "16:00-22:00",
      wednesday: "16:00-22:00", 
      thursday: "16:00-22:00",
      friday: "16:00-23:00",
      saturday: "15:00-23:00",
      sunday: "15:00-21:30"
    },
    menu_url: null,
    delivery_available: false,
    takeout_available: true,
    reservation_required: true,
    photos: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600"
    ],
    amenities: ["parking", "groups_welcome", "grill_tables"],
    is_verified: true,
    is_active: true,
    created_at: "2023-08-20T00:00:00Z",
    updated_at: "2024-01-05T00:00:00Z"
  },

  {
    id: "rest-0003-italian-restaurant",
    name: "Nonna's Table",
    description: "Family-owned Italian restaurant serving homemade pasta and traditional recipes passed down through generations",
    address: "10162 102 Street NW",
    city: "Edmonton",
    state: "Alberta", 
    country: "Canada",
    postal_code: "T5J 1L5",
    latitude: 53.5444,
    longitude: -113.4969,
    phone: "+1-780-555-0103",
    email: "reservations@nonnastable.ca",
    website: "https://nonnastable.ca",
    cuisine_types: ["Italian", "Mediterranean", "Pasta"],
    price_range: 3,
    rating: 4.7,
    review_count: 156,
    opening_hours: {
      monday: "17:00-22:00",
      tuesday: "17:00-22:00",
      wednesday: "17:00-22:00",
      thursday: "17:00-22:00", 
      friday: "17:00-23:00",
      saturday: "16:30-23:00",
      sunday: "16:30-21:30"
    },
    menu_url: null,
    delivery_available: true,
    takeout_available: true,
    reservation_required: true,
    photos: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600",
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600"
    ],
    amenities: ["romantic_atmosphere", "wine_list", "private_dining"],
    is_verified: true,
    is_active: true,
    created_at: "2023-05-10T00:00:00Z",
    updated_at: "2024-01-08T00:00:00Z"
  },

  {
    id: "cafe-0004-specialty-coffee",
    name: "Steam Dot Coffee Co.",
    description: "Local coffee roastery and cafe specializing in single-origin beans and artisanal pastries",
    address: "8135 102 Street NW",
    city: "Edmonton",
    state: "Alberta",
    country: "Canada", 
    postal_code: "T6E 4A4",
    latitude: 53.5103,
    longitude: -113.4969,
    phone: "+1-780-555-0104",
    email: "hello@steamdot.ca",
    website: "https://steamdot.ca",
    cuisine_types: ["Coffee", "Cafe", "Pastries"],
    price_range: 2,
    rating: 4.5,
    review_count: 234,
    opening_hours: {
      monday: "6:30-18:00",
      tuesday: "6:30-18:00",
      wednesday: "6:30-18:00",
      thursday: "6:30-18:00",
      friday: "6:30-19:00", 
      saturday: "7:00-19:00",
      sunday: "8:00-17:00"
    },
    menu_url: null,
    delivery_available: true,
    takeout_available: true,
    reservation_required: false,
    photos: [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600",
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=600"
    ],
    amenities: ["wifi", "laptop_friendly", "outdoor_seating", "local_roasted"],
    is_verified: true,
    is_active: true,
    created_at: "2023-04-12T00:00:00Z",
    updated_at: "2024-01-12T00:00:00Z"
  },

  {
    id: "cafe-0005-brunch-spot",
    name: "The Garneau Cafe",
    description: "Cozy neighborhood cafe known for exceptional brunch dishes and house-made everything",
    address: "11151 87 Avenue NW",
    city: "Edmonton",
    state: "Alberta",
    country: "Canada",
    postal_code: "T6G 0X9",
    latitude: 53.5189,
    longitude: -113.5167,
    phone: "+1-780-555-0105",
    email: "info@garneaucafe.ca",
    website: null,
    cuisine_types: ["Cafe", "Brunch", "Canadian"],
    price_range: 2,
    rating: 4.3,
    review_count: 78,
    opening_hours: {
      monday: "7:00-15:00",
      tuesday: "7:00-15:00",
      wednesday: "7:00-15:00",
      thursday: "7:00-15:00",
      friday: "7:00-15:00",
      saturday: "8:00-16:00",
      sunday: "8:00-16:00"
    },
    menu_url: null,
    delivery_available: false,
    takeout_available: true,
    reservation_required: false,
    photos: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600"
    ],
    amenities: ["local_ingredients", "vegetarian_options", "dog_friendly"],
    is_verified: false,
    is_active: true,
    created_at: "2023-09-05T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z"
  },

  {
    id: "grocery-0006-mexican-market",
    name: "Mercado El Sol",
    description: "Authentic Mexican grocery store with fresh ingredients, prepared foods, and traditional spices",
    address: "11804 145 Street NW",
    city: "Edmonton",
    state: "Alberta", 
    country: "Canada",
    postal_code: "T5M 1V1",
    latitude: 53.5758,
    longitude: -113.6047,
    phone: "+1-780-555-0106",
    email: "mercado@elsol.ca",
    website: null,
    cuisine_types: ["Mexican", "Grocery", "Specialty_Foods"],
    price_range: 1,
    rating: 4.2,
    review_count: 45,
    opening_hours: {
      monday: "9:00-20:00",
      tuesday: "9:00-20:00",
      wednesday: "9:00-20:00",
      thursday: "9:00-20:00",
      friday: "9:00-21:00",
      saturday: "9:00-21:00", 
      sunday: "10:00-19:00"
    },
    menu_url: null,
    delivery_available: false,
    takeout_available: true,
    reservation_required: false,
    photos: [
      "https://images.unsplash.com/photo-1596040033229-a9821efc227d?w=800&h=600"
    ],
    amenities: ["authentic_ingredients", "prepared_foods", "butcher_counter"],
    is_verified: false,
    is_active: true,
    created_at: "2023-11-18T00:00:00Z",
    updated_at: "2024-01-09T00:00:00Z"
  },

  {
    id: "grocery-0007-asian-supermarket", 
    name: "Lucky Supermarket",
    description: "Large Asian supermarket featuring fresh produce, imported goods, and prepared foods from across Asia",
    address: "3045 Calgary Trail NW",
    city: "Edmonton",
    state: "Alberta",
    country: "Canada",
    postal_code: "T6J 7E4",
    latitude: 53.4692,
    longitude: -113.4909,
    phone: "+1-780-555-0107",
    email: "info@luckysupermarket.ca",
    website: "https://luckysupermarket.ca",
    cuisine_types: ["Asian", "Grocery", "International"],
    price_range: 1,
    rating: 4.1,
    review_count: 89,
    opening_hours: {
      monday: "9:00-21:00",
      tuesday: "9:00-21:00",
      wednesday: "9:00-21:00",
      thursday: "9:00-21:00",
      friday: "9:00-22:00",
      saturday: "9:00-22:00",
      sunday: "9:00-20:00"
    },
    menu_url: null,
    delivery_available: false,
    takeout_available: true,
    reservation_required: false,
    photos: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600"
    ],
    amenities: ["diverse_selection", "fresh_seafood", "prepared_foods", "bakery"],
    is_verified: true,
    is_active: true,
    created_at: "2023-07-22T00:00:00Z",
    updated_at: "2024-01-11T00:00:00Z"
  },

  {
    id: "convenience-0008-late-night",
    name: "Campus Corner Store",
    description: "24-hour convenience store near University of Alberta with quick bites and essentials",
    address: "8640 112 Street NW",
    city: "Edmonton",
    state: "Alberta",
    country: "Canada",
    postal_code: "T6G 2C5", 
    latitude: 53.5206,
    longitude: -113.5124,
    phone: "+1-780-555-0108",
    email: null,
    website: null,
    cuisine_types: ["Convenience", "Quick_Service"],
    price_range: 1,
    rating: 3.8,
    review_count: 23,
    opening_hours: {
      monday: "24/7",
      tuesday: "24/7", 
      wednesday: "24/7",
      thursday: "24/7",
      friday: "24/7",
      saturday: "24/7",
      sunday: "24/7"
    },
    menu_url: null,
    delivery_available: false,
    takeout_available: true,
    reservation_required: false,
    photos: [],
    amenities: ["24_hour", "atm", "lottery"],
    is_verified: false,
    is_active: true,
    created_at: "2023-10-30T00:00:00Z",
    updated_at: "2024-01-06T00:00:00Z"
  },

  {
    id: "truck-0009-thai-street",
    name: "Bangkok Street Food Co.",
    description: "Authentic Thai street food truck serving pad thai, curries, and fresh spring rolls", 
    address: "Mobile - Various locations",
    city: "Edmonton",
    state: "Alberta",
    country: "Canada",
    postal_code: null,
    latitude: 53.5444, // Downtown area
    longitude: -113.4909,
    phone: "+1-780-555-0109",
    email: "bangkokstreet@gmail.com",
    website: "https://instagram.com/bangkokstreetyyc",
    cuisine_types: ["Thai", "Street_Food", "Mobile"],
    price_range: 2,
    rating: 4.8,
    review_count: 167,
    opening_hours: {
      monday: "11:00-19:00",
      tuesday: "11:00-19:00",
      wednesday: "11:00-19:00",
      thursday: "11:00-19:00",
      friday: "11:00-21:00",
      saturday: "12:00-21:00",
      sunday: "closed"
    },
    menu_url: null,
    delivery_available: false,
    takeout_available: true,
    reservation_required: false,
    photos: [
      "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800&h=600"
    ],
    amenities: ["outdoor_dining", "authentic_recipes"],
    is_verified: false,
    is_active: true,
    created_at: "2023-12-02T00:00:00Z",
    updated_at: "2024-01-14T00:00:00Z"
  },

  {
    id: "market-0010-farmers-market",
    name: "Old Strathcona Farmers Market",
    description: "Year-round indoor farmers market featuring local producers, artisans, and prepared foods",
    address: "10310 83 Avenue NW", 
    city: "Edmonton",
    state: "Alberta",
    country: "Canada",
    postal_code: "T6E 2C3",
    latitude: 53.5194,
    longitude: -113.4942,
    phone: "+1-780-555-0110",
    email: "info@osfm.ca",
    website: "https://osfm.ca",
    cuisine_types: ["Market", "Local_Produce", "Artisan_Foods"],
    price_range: 2,
    rating: 4.6,
    review_count: 298,
    opening_hours: {
      monday: "closed",
      tuesday: "closed",
      wednesday: "closed", 
      thursday: "closed",
      friday: "closed",
      saturday: "8:00-15:00",
      sunday: "closed"
    },
    menu_url: null,
    delivery_available: false,
    takeout_available: true,
    reservation_required: false,
    photos: [
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=600",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600"
    ],
    amenities: ["local_vendors", "organic_options", "live_music", "artisan_crafts"],
    is_verified: true,
    is_active: true,
    created_at: "2023-03-25T00:00:00Z",
    updated_at: "2024-01-13T00:00:00Z"
  }
];

// 10 Food Reviews with comprehensive metadata
export const seedFoodEntries = [
  {
    id: "food-0001-chirashi-bowl",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    restaurant_id: "rest-0001-japanese-sushi",
    title: "Chirashi Bowl - Premium Selection",
    description: "Beautiful presentation of fresh sashimi over seasoned sushi rice. The fish quality was exceptional.",
    notes: "The salmon was buttery, tuna had perfect texture, and the tamago added a nice sweet contrast. Definitely coming back for this!",
    images: [
      "https://images.unsplash.com/photo-1563612142-b5906a8dc1de?w=800&h=600",
      "https://images.unsplash.com/photo-1559058922-aec55395d41e?w=800&h=600"
    ],
    category: "lunch" as const,
    occasion: "casual" as const,
    rating: 4.8,
    price: 28.50,
    currency: "CAD",
    tags: ["fresh", "sashimi", "rice", "authentic", "high-quality"],
    ingredients: ["salmon", "tuna", "tamago", "sushi-rice", "nori", "wasabi", "pickled-ginger"],
    cooking_method: "raw",
    spice_level: 1,
    location_name: "Mikado Sushi",
    location_address: "10126 100 Street NW, Edmonton, AB",
    location_latitude: 53.5461,
    location_longitude: -113.4937,
    is_public: true,
    allow_comments: true,
    calories: 520,
    protein_grams: 35.2,
    carbs_grams: 48.1,
    fat_grams: 18.7,
    consumed_at: "2024-01-15T12:30:00Z",
    created_at: "2024-01-15T13:15:00Z",
    updated_at: "2024-01-15T13:15:00Z"
  },

  {
    id: "food-0002-bulgogi-bbq",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    restaurant_id: "rest-0002-korean-bbq", 
    title: "Korean Bulgogi BBQ Set",
    description: "Traditional marinated beef bulgogi grilled tableside with all the classic banchan sides",
    notes: "The meat was incredibly tender and the marinade had that perfect sweet-savory balance. The kimchi was perfectly fermented - not too sour. Cooking it ourselves at the table made it so much more fun!",
    images: [
      "https://images.unsplash.com/photo-1552909114-f6e3e6d8af41?w=800&h=600"
    ],
    category: "dinner" as const,
    occasion: "friends" as const,
    rating: 4.5,
    price: 32.00,
    currency: "CAD",
    tags: ["grilled", "marinated", "interactive", "sharing", "authentic"],
    ingredients: ["beef", "soy-sauce", "garlic", "pear", "sesame-oil", "kimchi", "rice"],
    cooking_method: "grilled",
    spice_level: 2,
    location_name: "Seoul Kitchen",
    location_address: "8215 112 Street NW, Edmonton, AB",
    location_latitude: 53.5128,
    location_longitude: -113.5098,
    is_public: true,
    allow_comments: true,
    calories: 680,
    protein_grams: 42.8,
    carbs_grams: 35.2,
    fat_grams: 28.5,
    consumed_at: "2024-01-12T19:15:00Z",
    created_at: "2024-01-12T21:45:00Z",
    updated_at: "2024-01-12T21:45:00Z"
  },

  {
    id: "food-0003-truffle-pasta",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    restaurant_id: "rest-0003-italian-restaurant",
    title: "Handmade Truffle Tagliatelle", 
    description: "Fresh pasta with shaved black truffles, butter, parmesan, and a hint of garlic",
    notes: "This was pure indulgence! The truffle aroma hit you before the plate even reached the table. Pasta was perfectly al dente and the simplicity really let the truffle shine. Worth every penny for a special occasion.",
    images: [
      "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=800&h=600"
    ],
    category: "dinner" as const,
    occasion: "date" as const,
    rating: 5.0,
    price: 46.00,
    currency: "CAD",
    tags: ["truffle", "handmade", "luxury", "aromatic", "romantic"],
    ingredients: ["pasta", "black-truffle", "butter", "parmesan", "garlic", "egg"],
    cooking_method: "boiled",
    spice_level: 1,
    location_name: "Nonna's Table",
    location_address: "10162 102 Street NW, Edmonton, AB",
    location_latitude: 53.5444,
    location_longitude: -113.4969,
    is_public: true,
    allow_comments: true,
    calories: 420,
    protein_grams: 18.9,
    carbs_grams: 52.1,
    fat_grams: 16.8,
    consumed_at: "2024-01-10T20:00:00Z",
    created_at: "2024-01-10T22:30:00Z",
    updated_at: "2024-01-10T22:30:00Z"
  },

  {
    id: "food-0004-cortado-pastry",
    user_id: "550e8400-e29b-41d4-a716-446655440000", 
    restaurant_id: "cafe-0004-specialty-coffee",
    title: "Single Origin Cortado + Almond Croissant",
    description: "Ethiopian single-origin cortado paired with a buttery almond croissant",
    notes: "Perfect morning pick-me-up! The cortado had lovely floral notes that paired beautifully with the sweet almond filling. The coffee wasn't too bitter and the milk was steamed to perfection. Croissant was flaky and warm.",
    images: [
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&h=600"
    ],
    category: "breakfast" as const,
    occasion: "solo" as const,
    rating: 4.3,
    price: 12.75,
    currency: "CAD",
    tags: ["coffee", "pastry", "floral", "buttery", "morning"],
    ingredients: ["coffee-beans", "steamed-milk", "croissant", "almond-paste", "butter"],
    cooking_method: "espresso",
    spice_level: null,
    location_name: "Steam Dot Coffee Co.",
    location_address: "8135 102 Street NW, Edmonton, AB", 
    location_latitude: 53.5103,
    location_longitude: -113.4969,
    is_public: true,
    allow_comments: true,
    calories: 290,
    protein_grams: 8.4,
    carbs_grams: 28.2,
    fat_grams: 16.1,
    consumed_at: "2024-01-08T08:45:00Z",
    created_at: "2024-01-08T09:30:00Z",
    updated_at: "2024-01-08T09:30:00Z"
  },

  {
    id: "food-0005-eggs-benedict",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    restaurant_id: "cafe-0005-brunch-spot",
    title: "Classic Eggs Benedict with Hash Browns",
    description: "Poached eggs on English muffin with Canadian bacon and hollandaise, served with crispy hash browns",
    notes: "Solid brunch execution! Eggs were poached perfectly with runny yolks. Hollandaise was rich but not too heavy. The hash browns were golden and crispy on the outside. Great value for the portion size.",
    images: [
      "https://images.unsplash.com/photo-1550461716-dbf266b2a8a7?w=800&h=600"
    ],
    category: "brunch" as const,
    occasion: "casual" as const,
    rating: 4.2,
    price: 16.95,
    currency: "CAD",
    tags: ["eggs", "hollandaise", "brunch", "classic", "filling"],
    ingredients: ["eggs", "english-muffin", "canadian-bacon", "hollandaise", "potatoes"],
    cooking_method: "poached", 
    spice_level: 1,
    location_name: "The Garneau Cafe",
    location_address: "11151 87 Avenue NW, Edmonton, AB",
    location_latitude: 53.5189,
    location_longitude: -113.5167,
    is_public: true,
    allow_comments: true,
    calories: 540,
    protein_grams: 26.3,
    carbs_grams: 32.8,
    fat_grams: 32.1,
    consumed_at: "2024-01-07T10:30:00Z",
    created_at: "2024-01-07T12:00:00Z",
    updated_at: "2024-01-07T12:00:00Z"
  },

  {
    id: "food-0006-carnitas-tacos",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    restaurant_id: "grocery-0006-mexican-market",
    title: "Fresh Carnitas Tacos (3 pack)",
    description: "Slow-cooked pork carnitas on fresh corn tortillas with onion, cilantro, and salsa verde",
    notes: "These were incredible! The pork was so tender it fell apart at the touch of a fork. Tortillas were made fresh daily - you could taste the difference. Salsa verde had the perfect amount of heat. Best authentic tacos I've found in Edmonton!",
    images: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600"
    ],
    category: "lunch" as const,
    occasion: "casual" as const,
    rating: 4.9,
    price: 8.50,
    currency: "CAD",
    tags: ["authentic", "tender", "spicy", "fresh-tortillas", "value"],
    ingredients: ["pork", "corn-tortillas", "onion", "cilantro", "tomatillo", "jalapeño"],
    cooking_method: "slow-cooked",
    spice_level: 3,
    location_name: "Mercado El Sol",
    location_address: "11804 145 Street NW, Edmonton, AB",
    location_latitude: 53.5758,
    location_longitude: -113.6047,
    is_public: true,
    allow_comments: true,
    calories: 450,
    protein_grams: 28.7,
    carbs_grams: 36.2,
    fat_grams: 21.4,
    consumed_at: "2024-01-05T13:15:00Z",
    created_at: "2024-01-05T14:45:00Z",
    updated_at: "2024-01-05T14:45:00Z"
  },

  {
    id: "food-0007-bao-dumplings",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    restaurant_id: "grocery-0007-asian-supermarket",
    title: "Steamed Pork Bao Buns (4 pieces)",
    description: "Fluffy steamed buns filled with seasoned ground pork and vegetables from the prepared foods section",
    notes: "Great find in the prepared foods area! Buns were light and fluffy, filling was well-seasoned with ginger and soy. Perfect quick meal when you're craving dim sum but don't want to sit down for a full meal.",
    images: [
      "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&h=600"
    ],
    category: "snack" as const,
    occasion: "casual" as const,
    rating: 4.1,
    price: 6.99,
    currency: "CAD",
    tags: ["steamed", "dim-sum", "convenient", "filling", "ginger"],
    ingredients: ["flour", "pork", "ginger", "soy-sauce", "green-onion", "cabbage"],
    cooking_method: "steamed",
    spice_level: 1,
    location_name: "Lucky Supermarket",
    location_address: "3045 Calgary Trail NW, Edmonton, AB",
    location_latitude: 53.4692,
    location_longitude: -113.4909,
    is_public: true,
    allow_comments: true,
    calories: 320,
    protein_grams: 16.8,
    carbs_grams: 42.5,
    fat_grams: 9.7,
    consumed_at: "2024-01-04T15:20:00Z",
    created_at: "2024-01-04T16:00:00Z",
    updated_at: "2024-01-04T16:00:00Z"
  },

  {
    id: "food-0008-instant-ramen",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    restaurant_id: "convenience-0008-late-night",
    title: "Late Night Shin Ramyun + Soft Boiled Egg",
    description: "Korean instant noodles with added soft-boiled egg during a late study session",
    notes: "Sometimes you just need that 2 AM comfort food! Added an egg to make it more filling. Not gourmet but hit the spot during finals week. The spice level was perfect for staying awake.",
    images: [],
    category: "snack" as const, 
    occasion: "solo" as const,
    rating: 3.2,
    price: 3.49,
    currency: "CAD",
    tags: ["late-night", "comfort-food", "spicy", "quick", "student-food"],
    ingredients: ["instant-noodles", "egg", "gochugaru", "garlic"],
    cooking_method: "boiled",
    spice_level: 4,
    location_name: "Campus Corner Store",
    location_address: "8640 112 Street NW, Edmonton, AB",
    location_latitude: 53.5206,
    location_longitude: -113.5124,
    is_public: false,
    allow_comments: false,
    calories: 380,
    protein_grams: 14.2,
    carbs_grams: 52.8,
    fat_grams: 12.5,
    consumed_at: "2024-01-03T02:15:00Z",
    created_at: "2024-01-03T02:45:00Z",
    updated_at: "2024-01-03T02:45:00Z"
  },

  {
    id: "food-0009-pad-thai",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    restaurant_id: "truck-0009-thai-street",
    title: "Authentic Pad Thai with Shrimp",
    description: "Classic Thai stir-fried rice noodles with shrimp, egg, bean sprouts, and traditional garnishes",
    notes: "This food truck is a hidden gem! The pad thai tasted exactly like what I had in Bangkok. Perfect balance of sweet, sour, and salty. Shrimp were plump and fresh. The lime and peanuts on the side made it customizable to your taste.",
    images: [
      "https://images.unsplash.com/photo-1559314809-0f31657def5e?w=800&h=600"
    ],
    category: "lunch" as const,
    occasion: "casual" as const,
    rating: 4.7,
    price: 14.00,
    currency: "CAD",
    tags: ["authentic", "sweet-and-sour", "street-food", "fresh-shrimp", "customizable"],
    ingredients: ["rice-noodles", "shrimp", "egg", "bean-sprouts", "tamarind", "fish-sauce", "peanuts", "lime"],
    cooking_method: "stir-fried",
    spice_level: 2,
    location_name: "Bangkok Street Food Co.",
    location_address: "Mobile - Various locations, Edmonton, AB",
    location_latitude: 53.5444,
    location_longitude: -113.4909,
    is_public: true,
    allow_comments: true,
    calories: 520,
    protein_grams: 24.6,
    carbs_grams: 68.3,
    fat_grams: 16.8,
    consumed_at: "2024-01-02T12:45:00Z",
    created_at: "2024-01-02T13:30:00Z",
    updated_at: "2024-01-02T13:30:00Z"
  },

  {
    id: "food-0010-artisan-bread",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    restaurant_id: "market-0010-farmers-market",
    title: "Sourdough Loaf + Local Honey",
    description: "Fresh-baked sourdough bread from Prairie Mill Bread Co. with wildflower honey from Bee Maid Honey",
    notes: "Saturday morning market haul! This sourdough had such a beautiful crust and perfect tangy flavor. The crumb was open and chewy. Paired with the local honey, it made for the perfect weekend breakfast. Supporting local producers feels good too!",
    images: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600"
    ],
    category: "breakfast" as const,
    occasion: "family" as const,
    rating: 4.4,
    price: 18.50,
    currency: "CAD",
    tags: ["artisan", "local", "sourdough", "tangy", "supporting-local"],
    ingredients: ["sourdough-starter", "flour", "water", "salt", "wildflower-honey"],
    cooking_method: "baked", 
    spice_level: null,
    location_name: "Old Strathcona Farmers Market",
    location_address: "10310 83 Avenue NW, Edmonton, AB",
    location_latitude: 53.5194,
    location_longitude: -113.4942,
    is_public: true,
    allow_comments: true,
    calories: 245,
    protein_grams: 8.1,
    carbs_grams: 48.7,
    fat_grams: 2.3,
    consumed_at: "2023-12-30T09:00:00Z",
    created_at: "2023-12-30T10:15:00Z",
    updated_at: "2023-12-30T10:15:00Z"
  }
];

// Additional sensory data for enhanced emotional food journaling
export const sensoryProfiles = {
  "food-0001-chirashi-bowl": {
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
    emotions_felt: ["satisfied", "peaceful", "appreciative"],
    worth_rating: 4.8, // Price vs satisfaction
    craving_level: 4.5, // How much you'd want this again
    emotional_context: "Felt like a meditation on flavor - each piece of fish was a moment of pure taste"
  },

  "food-0002-bulgogi-bbq": {
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
    emotions_felt: ["social", "excited", "nostalgic"],
    worth_rating: 4.3,
    craving_level: 4.6,
    emotional_context: "Brought back memories of family gatherings - food that brings people together"
  },

  "food-0003-truffle-pasta": {
    taste: {
      umami: 10,
      saltiness: 5,
      sweetness: 2,
      sourness: 1,
      bitterness: 2
    },
    mouthfeel: {
      texture: "silky and al dente",
      temperature: "hot",
      richness: "very rich"
    },
    aroma: {
      intensity: 10,
      descriptors: ["earthy", "luxurious", "intoxicating"]
    },
    emotions_felt: ["indulgent", "romantic", "sophisticated"],
    worth_rating: 4.2,
    craving_level: 5.0,
    emotional_context: "Pure luxury on a plate - the kind of dish that makes you close your eyes and savor"
  }
};

// Worth assessment categories
export const worthCategories = {
  exceptional_value: "Exceptional value - exceeded expectations for the price",
  good_value: "Good value - fair price for quality received", 
  acceptable: "Acceptable - got what I paid for",
  overpriced: "Overpriced - quality didn't justify cost",
  luxury_justified: "Luxury pricing but experience justified it"
};

// Dining method variations
export const diningMethods = {
  dine_in: "Dine-in restaurant experience",
  takeout: "Ordered for pickup", 
  delivery: "Delivered to location",
  homemade: "Made at home",
  street_food: "Street vendor or food truck",
  market_fresh: "Fresh from market/grocery"
};

// Meal time contexts
export const mealTimes = {
  breakfast: "Morning meal (7-11 AM)",
  brunch: "Late morning meal (10 AM-2 PM)",
  lunch: "Midday meal (11 AM-3 PM)", 
  afternoon_snack: "Afternoon snack (2-5 PM)",
  dinner: "Evening meal (5-10 PM)",
  late_night: "Late night food (10 PM-2 AM)",
  dessert: "Sweet treat (anytime)"
};

export default {
  dummyUser,
  dummyUserPreferences, 
  seedRestaurants,
  seedFoodEntries,
  sensoryProfiles,
  worthCategories,
  diningMethods,
  mealTimes
};