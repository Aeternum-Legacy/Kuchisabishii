// Seed data for Kuchisabishii food review app
export interface FoodReview {
  id: string;
  name: string;
  location: string;
  shopType: string;
  cuisineType: string;
  foodType: string;
  dateEaten: string;
  kuchisabishiRating: number;
  image?: string;
  mealtime?: string;
  basicTastes: {
    sweet: number;
    savoury: number;
    sour: number;
    spicy: number;
    umami: number;
    bitter: number;
  };
  mouthfeel: string[];
  smell: string[];
  diningMethod?: string;
  cost?: number;
  worthCost?: string;
  experience: string;
  timestamp: string;
}

export interface Shop {
  id: string;
  name: string;
  type: string;
  address: string;
  coordinates: { lat: number; lng: number };
  phone?: string;
  hours?: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  specialties: string[];
  image?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  totalReviews: number;
  averageRating: number;
  kuchisabishiCount: number;
  favoritesCuisines: string[];
  dietaryRestrictions: string[];
  achievements: string[];
}

// 10 Food Reviews with High-Quality Food Images
export const mockFoodReviews: FoodReview[] = [
  {
    id: "1",
    name: "Korean BBQ Bulgogi",
    location: "Seoul House",
    shopType: "Restaurant",
    cuisineType: "Korean", 
    foodType: "Main Dish",
    dateEaten: "2024-08-10",
    kuchisabishiRating: 5,
    image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=400&fit=crop&crop=center",
    mealtime: "Dinner",
    basicTastes: { sweet: 3, savoury: 5, sour: 1, spicy: 2, umami: 5, bitter: 0 },
    mouthfeel: ["Juicy", "Rich", "Hot"],
    smell: ["Savory", "Sweet", "Buttery"],
    diningMethod: "Dine In",
    cost: 28.99,
    worthCost: "definitely",
    experience: "The marinated bulgogi was incredibly tender with perfect balance of sweet and savory. The sizzling plate arrived steaming hot, and each bite melted in my mouth. Reminded me of family dinners in Seoul. This is what I crave when my mouth is lonely!",
    timestamp: "2024-08-10T19:30:00Z"
  },
  {
    id: "2", 
    name: "Margherita Pizza",
    location: "Tony's Pizza",
    shopType: "Restaurant",
    cuisineType: "Italian",
    foodType: "Main Dish",
    dateEaten: "2024-08-09",
    kuchisabishiRating: 4,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop&crop=center",
    mealtime: "Lunch",
    basicTastes: { sweet: 2, savoury: 4, sour: 2, spicy: 0, umami: 3, bitter: 0 },
    mouthfeel: ["Crispy", "Soft", "Chewy"],
    smell: ["Buttery", "Earthy"],
    diningMethod: "Take Out",
    cost: 18.50,
    worthCost: "yes",
    experience: "Classic wood-fired pizza with perfect crust. The fresh basil and mozzarella created beautiful harmony. Crust had that perfect char and chew. Satisfied my Italian craving completely.",
    timestamp: "2024-08-09T12:15:00Z"
  },
  {
    id: "3",
    name: "Green Tea Latte",
    location: "Bean There Coffee",
    shopType: "Cafe",
    cuisineType: "Japanese",
    foodType: "Beverage", 
    dateEaten: "2024-08-08",
    kuchisabishiRating: 3,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop&crop=center",
    mealtime: "Snack Time",
    basicTastes: { sweet: 2, savoury: 0, sour: 0, spicy: 0, umami: 1, bitter: 2 },
    mouthfeel: ["Creamy", "Smooth", "Warm"],
    smell: ["Earthy", "Floral"],
    diningMethod: "Take Out",
    cost: 5.75,
    worthCost: "maybe",
    experience: "Nice matcha flavor but could be stronger. Foam art was beautiful but taste was a bit too sweet for my preference. Good for afternoon study break.",
    timestamp: "2024-08-08T15:45:00Z"
  },
  {
    id: "4",
    name: "Spicy Tuna Roll",
    location: "Mikado Sushi",
    shopType: "Restaurant", 
    cuisineType: "Japanese",
    foodType: "Appetizer",
    dateEaten: "2024-08-07",
    kuchisabishiRating: 5,
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=400&fit=crop&crop=center",
    mealtime: "Dinner",
    basicTastes: { sweet: 1, savoury: 4, sour: 1, spicy: 4, umami: 5, bitter: 0 },
    mouthfeel: ["Soft", "Sticky", "Juicy"],
    smell: ["Oily", "Pungent"],
    diningMethod: "Dine In",
    cost: 12.50,
    worthCost: "definitely",
    experience: "Perfect spice level with incredibly fresh tuna. The rice was perfectly seasoned and the nori had great snap. Each piece was a perfect bite-sized explosion of flavor. When my mouth is lonely, this is what I dream of!",
    timestamp: "2024-08-07T18:20:00Z"
  },
  {
    id: "5",
    name: "Pad Thai",
    location: "Bangkok Street Food Co.",
    shopType: "Food Truck",
    cuisineType: "Thai",
    foodType: "Main Dish",
    dateEaten: "2024-08-06", 
    kuchisabishiRating: 4,
    image: "https://images.unsplash.com/photo-1559314809-0f31657def5e?w=400&h=400&fit=crop&crop=center",
    mealtime: "Lunch",
    basicTastes: { sweet: 3, savoury: 4, sour: 3, spicy: 2, umami: 3, bitter: 0 },
    mouthfeel: ["Chewy", "Soft", "Hot"],
    smell: ["Pungent", "Citrusy"],
    diningMethod: "Take Out",
    cost: 14.00,
    worthCost: "yes", 
    experience: "Authentic street food flavor from this food truck. Perfect balance of tamarind, fish sauce, and palm sugar. Noodles had great texture and the peanuts added nice crunch.",
    timestamp: "2024-08-06T12:30:00Z"
  },
  {
    id: "6",
    name: "Chocolate Croissant",
    location: "The Garneau Cafe",
    shopType: "Cafe",
    cuisineType: "French",
    foodType: "Dessert",
    dateEaten: "2024-08-05",
    kuchisabishiRating: 4,
    image: "https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?w=400&h=400&fit=crop&crop=center",
    mealtime: "Breakfast",
    basicTastes: { sweet: 4, savoury: 1, sour: 0, spicy: 0, umami: 0, bitter: 1 },
    mouthfeel: ["Flaky", "Buttery", "Rich"],
    smell: ["Buttery", "Sweet"],
    diningMethod: "Dine In",
    cost: 4.25,
    worthCost: "yes",
    experience: "Perfectly laminated pastry with rich dark chocolate. Buttery layers flaked beautifully. Great with morning coffee. Reminded me of Paris bakeries.",
    timestamp: "2024-08-05T08:15:00Z"
  },
  {
    id: "7",
    name: "Chicken Tacos",
    location: "Mercado El Sol",
    shopType: "Grocery Store",
    cuisineType: "Mexican",
    foodType: "Main Dish", 
    dateEaten: "2024-08-04",
    kuchisabishiRating: 3,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center",
    mealtime: "Lunch",
    basicTastes: { sweet: 1, savoury: 4, sour: 2, spicy: 3, umami: 2, bitter: 0 },
    mouthfeel: ["Soft", "Juicy", "Hot"],
    smell: ["Pungent", "Citrusy"],
    diningMethod: "Take Out",
    cost: 8.99,
    worthCost: "maybe",
    experience: "Decent tacos from grocery deli. Chicken was well seasoned but tortillas were a bit dry. Good value for the price though. Added extra salsa verde.",
    timestamp: "2024-08-04T13:00:00Z"
  },
  {
    id: "8",
    name: "Ramen Bowl",
    location: "Lucky Supermarket",
    shopType: "Grocery Store",
    cuisineType: "Japanese",
    foodType: "Soup",
    dateEaten: "2024-08-03",
    kuchisabishiRating: 2,
    image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=400&fit=crop&crop=center",
    mealtime: "Dinner",
    basicTastes: { sweet: 1, savoury: 5, sour: 0, spicy: 1, umami: 4, bitter: 0 },
    mouthfeel: ["Soupy", "Soft", "Salty"],
    smell: ["Pungent", "Savory"],
    diningMethod: "Take Out",
    cost: 6.50,
    worthCost: "no",
    experience: "Instant ramen from grocery hot bar. Too salty and noodles were overcooked. Not terrible but left me wanting real ramen. Would skip next time.",
    timestamp: "2024-08-03T19:45:00Z"
  },
  {
    id: "9",
    name: "Energy Drink",
    location: "Campus Corner Store",
    shopType: "Convenience Store",
    cuisineType: "American",
    foodType: "Beverage",
    dateEaten: "2024-08-02",
    kuchisabishiRating: 1,
    image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400&h=400&fit=crop&crop=center",
    mealtime: "Snack Time",
    basicTastes: { sweet: 5, savoury: 0, sour: 2, spicy: 0, umami: 0, bitter: 1 },
    mouthfeel: ["Fizzy", "Cold"],
    smell: ["Citrusy", "Sweet"],
    diningMethod: "Take Out",
    cost: 3.25,
    worthCost: "no",
    experience: "Too sweet and artificial tasting. Gave me energy crash later. Regretted buying this instead of coffee. Never again - my mouth felt sad after.",
    timestamp: "2024-08-02T14:20:00Z"
  },
  {
    id: "10", 
    name: "Homemade Pancakes",
    location: "Home Kitchen",
    shopType: "Home",
    cuisineType: "American",
    foodType: "Main Dish",
    dateEaten: "2024-08-01",
    kuchisabishiRating: 5,
    image: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&h=400&fit=crop&crop=center",
    mealtime: "Breakfast",
    basicTastes: { sweet: 4, savoury: 1, sour: 0, spicy: 0, umami: 0, bitter: 0 },
    mouthfeel: ["Fluffy", "Soft", "Warm"],
    smell: ["Sweet", "Buttery"],
    diningMethod: "Homemade",
    cost: 2.50,
    worthCost: "definitely",
    experience: "Perfect Sunday morning pancakes with real maple syrup. Fluffy texture and golden brown color. Made with love and shared with family. These comfort food moments are what make life beautiful - pure Kuchisabishii!",
    timestamp: "2024-08-01T09:30:00Z"
  }
];

// 10 Shops
export const mockShops: Shop[] = [
  {
    id: "1",
    name: "Seoul House",
    type: "Restaurant", 
    address: "10220 103 St NW, Edmonton, AB",
    coordinates: { lat: 53.5171, lng: -113.6189 },
    phone: "(780) 424-7665",
    hours: "11:30 AM - 10:00 PM",
    rating: 4.6,
    reviewCount: 324,
    priceRange: "$$",
    specialties: ["Korean BBQ", "Bulgogi", "Bibimbap", "Kimchi"],
    image: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&h=400&fit=crop&crop=center"
  },
  {
    id: "2",
    name: "Tony's Pizza",
    type: "Restaurant",
    address: "8208 104 St NW, Edmonton, AB", 
    coordinates: { lat: 53.5103, lng: -113.5087 },
    phone: "(780) 433-3434",
    hours: "12:00 PM - 11:00 PM",
    rating: 4.3,
    reviewCount: 567,
    priceRange: "$",
    specialties: ["Wood-fired Pizza", "Margherita", "Italian Classics"],
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center"
  },
  {
    id: "3",
    name: "Mikado Sushi",
    type: "Restaurant",
    address: "10126 100 St NW, Edmonton, AB",
    coordinates: { lat: 53.5461, lng: -113.4869 },
    phone: "(780) 426-6475", 
    hours: "5:00 PM - 10:00 PM",
    rating: 4.8,
    reviewCount: 892,
    priceRange: "$$$",
    specialties: ["Fresh Sushi", "Sashimi", "Specialty Rolls"],
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=400&fit=crop&crop=center"
  },
  {
    id: "4", 
    name: "Bean There Coffee",
    type: "Cafe",
    address: "8525 112 St NW, Edmonton, AB",
    coordinates: { lat: 53.5167, lng: -113.5264 },
    phone: "(780) 439-3912",
    hours: "6:00 AM - 9:00 PM",
    rating: 4.4,
    reviewCount: 201,
    priceRange: "$",
    specialties: ["Specialty Coffee", "Matcha Lattes", "Fresh Pastries"],
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=400&fit=crop&crop=center"
  },
  {
    id: "5",
    name: "The Garneau Cafe",
    type: "Cafe", 
    address: "10932 88 Ave NW, Edmonton, AB",
    coordinates: { lat: 53.5189, lng: -113.5143 },
    phone: "(780) 433-6402",
    hours: "7:00 AM - 8:00 PM", 
    rating: 4.5,
    reviewCount: 156,
    priceRange: "$",
    specialties: ["French Pastries", "Coffee", "Croissants", "Light Lunch"],
    image: "https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?w=400&h=400&fit=crop&crop=center"
  },
  {
    id: "6",
    name: "Mercado El Sol",
    type: "Grocery Store",
    address: "9212 34 Ave NW, Edmonton, AB",
    coordinates: { lat: 53.4692, lng: -113.4654 },
    phone: "(780) 465-3663",
    hours: "8:00 AM - 10:00 PM",
    rating: 4.1, 
    reviewCount: 89,
    priceRange: "$",
    specialties: ["Mexican Groceries", "Fresh Produce", "Prepared Foods", "Tacos"]
  },
  {
    id: "7",
    name: "Lucky Supermarket", 
    type: "Grocery Store",
    address: "2508 Calgary Tr NW, Edmonton, AB",
    coordinates: { lat: 53.4821, lng: -113.4982 },
    phone: "(780) 436-9888",
    hours: "8:00 AM - 11:00 PM",
    rating: 3.9,
    reviewCount: 234,
    priceRange: "$",
    specialties: ["Asian Groceries", "Hot Food Bar", "Fresh Seafood"]
  },
  {
    id: "8",
    name: "Campus Corner Store",
    type: "Convenience Store",
    address: "8625 112 St NW, Edmonton, AB", 
    coordinates: { lat: 53.5178, lng: -113.5287 },
    phone: "(780) 492-1234",
    hours: "24 Hours",
    rating: 3.2,
    reviewCount: 45,
    priceRange: "$",
    specialties: ["Snacks", "Beverages", "Quick Meals", "School Supplies"]
  },
  {
    id: "9",
    name: "Bangkok Street Food Co.",
    type: "Food Truck",
    address: "109 St & Jasper Ave, Edmonton, AB",
    coordinates: { lat: 53.5461, lng: -113.4982 },
    phone: "(780) 555-THAI",
    hours: "11:00 AM - 8:00 PM",
    rating: 4.7,
    reviewCount: 127,
    priceRange: "$",
    specialties: ["Pad Thai", "Thai Curry", "Spring Rolls", "Authentic Street Food"]
  },
  {
    id: "10",
    name: "Old Strathcona Farmers Market",
    type: "Market",
    address: "10310 83 Ave NW, Edmonton, AB",
    coordinates: { lat: 53.5189, lng: -113.5072 },
    phone: "(780) 439-1844", 
    hours: "Sat 8:00 AM - 3:00 PM",
    rating: 4.6,
    reviewCount: 312,
    priceRange: "$$",
    specialties: ["Local Produce", "Artisan Foods", "Fresh Bread", "Organic Products"]
  }
];

// User Profile
export const mockUserProfile: UserProfile = {
  id: "user-1",
  name: "Alex Chen",
  email: "alex.chen@example.com", 
  totalReviews: 47,
  averageRating: 3.8,
  kuchisabishiCount: 8,
  favoritesCuisines: ["Japanese", "Korean", "Italian", "Thai"],
  dietaryRestrictions: ["No Shellfish", "Prefers Organic"],
  achievements: ["First Kuchisabishii!", "Streak Master", "Cuisine Explorer"]
};

// Transform mockFoodReviews for the app
export const transformedFoodReviews = mockFoodReviews.map(food => ({
  ...food,
  foodName: food.name,
  restaurant: food.location
}));

// Additional data for enhanced features
export const recommendedFoods = [
  {
    id: "rec-1",
    name: "Korean Fried Chicken",
    restaurant: "Seoul House", 
    restaurantName: "Seoul House", 
    cuisineType: "Korean",
    image: "https://images.unsplash.com/photo-1626082936687-ace09a26e8b8?w=400&h=400&fit=crop&crop=center",
    matchScore: 92,
    price: "$18.99",
    aiConfidence: 92,
    reasoning: ["Based on your love for Korean BBQ", "Similar spice profile"],
    estimatedRating: 4.5,
    recommendation_type: 'ai_match' as const
  },
  {
    id: "rec-2",
    name: "Truffle Pizza",
    restaurant: "Tony's Pizza",
    restaurantName: "Tony's Pizza",
    cuisineType: "Italian", 
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center",
    matchScore: 85,
    price: "$24.99",
    aiConfidence: 85,
    reasoning: ["Trending in your area", "Premium upgrade to Margherita"],
    estimatedRating: 4.8,
    recommendation_type: 'trending' as const
  },
  {
    id: "rec-3", 
    name: "Tom Yum Soup",
    restaurant: "Bangkok Street Food Co.",
    restaurantName: "Bangkok Street Food Co.",
    cuisineType: "Thai",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop&crop=center",
    matchScore: 88,
    price: "$12.99",
    aiConfidence: 88,
    reasoning: ["Friends with similar taste loved this", "Matches your spice preference"],
    estimatedRating: 4.3,
    recommendation_type: 'friend_loved' as const
  }
];

export const kuchisabishiFoods = mockFoodReviews.filter(food => food.kuchisabishiRating === 5);
export const recentFoods = mockFoodReviews.slice(0, 5);