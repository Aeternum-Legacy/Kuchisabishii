// Food emoji mappings for fallback images
export const getFoodEmoji = (foodName: string, cuisineType: string, foodType: string): string => {
  const food = foodName.toLowerCase();
  const cuisine = cuisineType.toLowerCase();
  const type = foodType.toLowerCase();

  // Specific food name matches
  if (food.includes('bulgogi') || food.includes('bbq')) return '🥩';
  if (food.includes('pizza')) return '🍕';
  if (food.includes('sushi') || food.includes('sashimi') || food.includes('roll')) return '🍣';
  if (food.includes('ramen') || food.includes('noodle')) return '🍜';
  if (food.includes('taco')) return '🌮';
  if (food.includes('pad thai')) return '🍝';
  if (food.includes('burger')) return '🍔';
  if (food.includes('pancake')) return '🥞';
  if (food.includes('croissant')) return '🥐';
  if (food.includes('latte') || food.includes('coffee')) return '☕';
  if (food.includes('tea') && food.includes('green')) return '🍵';
  if (food.includes('energy') || food.includes('drink')) return '🥤';

  // Cuisine-based matches
  if (cuisine === 'korean') return '🇰🇷';
  if (cuisine === 'japanese') return '🍱';
  if (cuisine === 'italian') return '🍝';
  if (cuisine === 'mexican') return '🌶️';
  if (cuisine === 'thai') return '🌶️';
  if (cuisine === 'chinese') return '🥢';
  if (cuisine === 'french') return '🥖';
  if (cuisine === 'indian') return '🍛';
  if (cuisine === 'american') return '🍔';

  // Food type matches
  if (type === 'main dish') return '🍽️';
  if (type === 'appetizer') return '🥗';
  if (type === 'dessert') return '🍰';
  if (type === 'beverage') return '🥤';
  if (type === 'soup') return '🍲';
  if (type === 'salad') return '🥗';
  if (type === 'side dish') return '🍚';
  if (type === 'snack') return '🍿';
  if (type === 'bread') return '🍞';
  if (type === 'noodles') return '🍜';
  if (type === 'rice') return '🍚';
  if (type === 'meat') return '🥩';
  if (type === 'seafood') return '🐟';

  // Default fallback
  return '🍽️';
};

// Rating-based emoji for Kuchisabishii scale
export const getKuchisabishiEmoji = (rating: number): string => {
  switch (rating) {
    case 1: return '😞';
    case 2: return '😕';
    case 3: return '😐';
    case 4: return '😊';
    case 5: return '😍';
    default: return '🤔';
  }
};

// Food category emojis
export const getCategoryEmoji = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'restaurant': return '🍽️';
    case 'cafe': return '☕';
    case 'convenience store': return '🏪';
    case 'grocery store': return '🛒';
    case 'home': return '🏠';
    case 'food truck': return '🚚';
    case 'market': return '🛒';
    case 'bakery': return '🧁';
    default: return '🏪';
  }
};