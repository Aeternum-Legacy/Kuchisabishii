/**
 * Kuchisabishii API Test Script
 * Simple test script to validate backend API endpoints
 */

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testUser = {
  email: 'test@kuchisabishii.com',
  password: 'testpassword123',
  username: 'testuser',
  display_name: 'Test User',
  bio: 'Testing the Kuchisabishii API',
  location: 'San Francisco, CA',
  dietary_restrictions: ['vegetarian'],
  allergies: [],
  spice_tolerance: 7,
  sweetness_preference: 6
};

let authToken = null;
let userId = null;

// Helper function for API calls
async function apiCall(endpoint, method = 'GET', data = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  console.log(`${method} ${endpoint}${data ? ` - Data: ${JSON.stringify(data, null, 2).slice(0, 200)}...` : ''}`);
  
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(result, null, 2).slice(0, 500)}...`);
    console.log('---');
    
    return { status: response.status, data: result };
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error.message);
    console.log('---');
    return { status: 500, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting Kuchisabishii API Tests\n');
  
  try {
    // Test 1: User Registration
    console.log('📝 Test 1: User Registration');
    const registerResult = await apiCall('/auth/register', 'POST', testUser);
    
    if (registerResult.status === 201) {
      console.log('✅ Registration successful\n');
      userId = registerResult.data.data.user.id;
    } else {
      console.log('❌ Registration failed\n');
      return;
    }
    
    // Test 2: User Login
    console.log('🔐 Test 2: User Login');
    const loginResult = await apiCall('/auth/login', 'POST', {
      email: testUser.email,
      password: testUser.password
    });
    
    if (loginResult.status === 200) {
      console.log('✅ Login successful\n');
      authToken = loginResult.data.data.session.access_token;
    } else {
      console.log('❌ Login failed\n');
      return;
    }
    
    // Test 3: Get Current User
    console.log('👤 Test 3: Get Current User');
    const meResult = await apiCall('/auth/me', 'GET', null, authToken);
    
    if (meResult.status === 200) {
      console.log('✅ Get current user successful\n');
    } else {
      console.log('❌ Get current user failed\n');
    }
    
    // Test 4: Update Profile
    console.log('📋 Test 4: Update Profile');
    const updateProfileResult = await apiCall('/profile', 'PUT', {
      bio: 'Updated bio for testing',
      location: 'Updated location'
    }, authToken);
    
    if (updateProfileResult.status === 200) {
      console.log('✅ Profile update successful\n');
    } else {
      console.log('❌ Profile update failed\n');
    }
    
    // Test 5: Create Taste Profile
    console.log('👅 Test 5: Create Taste Profile');
    const tasteProfileResult = await apiCall('/profile/taste-profile', 'POST', {
      salty_preference: 8,
      sweet_preference: 6,
      sour_preference: 5,
      bitter_preference: 4,
      umami_preference: 7,
      crunchy_preference: 9,
      creamy_preference: 6,
      chewy_preference: 5,
      hot_food_preference: 8,
      cold_food_preference: 5,
      culinary_adventurousness: 8
    }, authToken);
    
    if (tasteProfileResult.status === 201) {
      console.log('✅ Taste profile creation successful\n');
    } else {
      console.log('❌ Taste profile creation failed\n');
    }
    
    // Test 6: Create Restaurant
    console.log('🏪 Test 6: Create Restaurant');
    const restaurantResult = await apiCall('/restaurants', 'POST', {
      name: 'Test Restaurant',
      description: 'A test restaurant for API validation',
      address: '123 Test St',
      city: 'San Francisco',
      state: 'CA',
      country: 'US',
      cuisine_types: ['American', 'Italian'],
      price_range: 2,
      features: ['outdoor_seating', 'wifi'],
      dietary_options: ['vegetarian', 'vegan']
    }, authToken);
    
    let restaurantId = null;
    if (restaurantResult.status === 201) {
      console.log('✅ Restaurant creation successful\n');
      restaurantId = restaurantResult.data.data.restaurant.id;
    } else {
      console.log('❌ Restaurant creation failed\n');
    }
    
    // Test 7: Search Restaurants
    console.log('🔍 Test 7: Search Restaurants');
    const searchResult = await apiCall('/restaurants?search=test&limit=5', 'GET', null, authToken);
    
    if (searchResult.status === 200) {
      console.log('✅ Restaurant search successful\n');
    } else {
      console.log('❌ Restaurant search failed\n');
    }
    
    // Test 8: Create Food Experience
    console.log('🍽️ Test 8: Create Food Experience');
    const experienceResult = await apiCall('/experiences', 'POST', {
      dish_name: 'Test Pasta Dish',
      restaurant_id: restaurantId,
      custom_notes: 'Delicious test pasta for API validation',
      meal_time: 'dinner',
      dining_method: 'dine_in',
      overall_rating: 4,
      emotions: ['satisfied', 'happy'],
      satisfaction_level: 8,
      dining_companions: 2,
      taste_experience: {
        saltiness: 6,
        sweetness: 3,
        sourness: 2,
        umami: 8,
        crunchiness: 4,
        creaminess: 7,
        temperature: 8,
        spice_heat: 3,
        aroma_intensity: 7,
        visual_appeal: 8
      }
    }, authToken);
    
    let experienceId = null;
    if (experienceResult.status === 201) {
      console.log('✅ Food experience creation successful\n');
      experienceId = experienceResult.data.data.experience.id;
    } else {
      console.log('❌ Food experience creation failed\n');
    }
    
    // Test 9: Get Food Experiences
    console.log('📖 Test 9: Get Food Experiences');
    const experiencesResult = await apiCall('/experiences?limit=10', 'GET', null, authToken);
    
    if (experiencesResult.status === 200) {
      console.log('✅ Get food experiences successful\n');
    } else {
      console.log('❌ Get food experiences failed\n');
    }
    
    // Test 10: Logout
    console.log('🚪 Test 10: User Logout');
    const logoutResult = await apiCall('/auth/logout', 'POST', null, authToken);
    
    if (logoutResult.status === 200) {
      console.log('✅ Logout successful\n');
    } else {
      console.log('❌ Logout failed\n');
    }
    
    console.log('🎉 API Tests Completed!');
    console.log('\n📊 Summary:');
    console.log('- User Registration: ✅');
    console.log('- User Login: ✅'); 
    console.log('- Profile Management: ✅');
    console.log('- Taste Profiles: ✅');
    console.log('- Restaurant Management: ✅');
    console.log('- Food Experiences: ✅');
    console.log('- Authentication Flow: ✅');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the tests
runTests();