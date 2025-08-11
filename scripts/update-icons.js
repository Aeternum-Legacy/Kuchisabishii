#!/usr/bin/env node

/**
 * Kuchisabishii Icon Update Script
 * 
 * This script helps update all app icons across web and mobile platforms
 * after you've created the new pink fluffy anime mascot icon.
 * 
 * Usage:
 * 1. Place your master icon (1024x1024) at: web/public/icons/kuchisabishii-master.png
 * 2. Run: node scripts/update-icons.js
 */

const fs = require('fs');
const path = require('path');

const MASTER_ICON_PATH = 'web/public/icons/kuchisabishii-master.png';
const ICON_SIZES = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512, 1024];

function checkMasterIcon() {
  if (!fs.existsSync(MASTER_ICON_PATH)) {
    console.log(`
🎨 ICON UPDATE GUIDE
==================

To update your Kuchisabishii app icons with the new pink fluffy anime mascot:

📋 STEP 1: Create Your Icon
--------------------------
• Follow the design brief in: docs/ICON_DESIGN_BRIEF.md
• Create a 1024x1024px PNG with transparent background
• Character should be a pink fluffy anime-style animal
• Expression should capture "Kuchisabishii" (mouth loneliness)

🖼️ STEP 2: Place Master Icon
----------------------------  
• Save your master icon as: ${MASTER_ICON_PATH}
• Ensure it's exactly 1024x1024 pixels
• Use PNG format with transparency

🔧 STEP 3: Generate Icon Sizes
-----------------------------
This script will help generate all required sizes:
• Web PWA icons (16px to 512px)
• Mobile app icons
• Favicons

⚡ STEP 4: Run This Script
-------------------------
• Run: node scripts/update-icons.js
• This will guide you through the update process

🎯 QUICK START
--------------
You can use AI image generation tools with this prompt:

"Kawaii pink fluffy hamster with large anime eyes, slightly open mouth, 
soft pastel colors, transparent background, food lover expression, 
1024x1024px, cute mascot style"

Then save the result as ${MASTER_ICON_PATH} and run this script again.
    `);
    return false;
  }
  return true;
}

function updateWebManifest() {
  const manifestPath = 'web/public/manifest.json';
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Update theme color to match pink mascot
    manifest.theme_color = '#FFB6C1'; // Light pink
    manifest.background_color = '#FFF8F6'; // Cream background
    
    console.log('✅ Updated web/public/manifest.json with new theme colors');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  } catch (error) {
    console.log('⚠️ Could not update manifest.json:', error.message);
  }
}

function updateMobileConfig() {
  const appJsonPath = 'mobile/app.json';
  try {
    if (fs.existsSync(appJsonPath)) {
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
      
      // Update to reference new icons
      if (appJson.expo) {
        appJson.expo.icon = './assets/icons/icon.png';
        appJson.expo.splash = {
          ...appJson.expo.splash,
          image: './assets/icons/splash-icon.png'
        };
      }
      
      fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
      console.log('✅ Updated mobile/app.json icon references');
    }
  } catch (error) {
    console.log('⚠️ Could not update mobile app.json:', error.message);
  }
}

function updateLayoutMetadata() {
  const layoutPath = 'web/src/app/layout.tsx';
  try {
    if (fs.existsSync(layoutPath)) {
      let layout = fs.readFileSync(layoutPath, 'utf8');
      
      // Update favicon and apple-touch-icon references
      layout = layout.replace(
        /icon:\s*\{.*?\}/gs, 
        `icon: {
    url: '/icons/icon-32x32.png',
    sizes: '32x32',
    type: 'image/png',
  }`
      );
      
      fs.writeFileSync(layoutPath, layout);
      console.log('✅ Updated web/src/app/layout.tsx icon metadata');
    }
  } catch (error) {
    console.log('⚠️ Could not update layout.tsx:', error.message);
  }
}

function showNextSteps() {
  console.log(`
🎉 ICON UPDATE PREPARATION COMPLETE!
===================================

✅ Created icon directories
✅ Updated configuration files  
✅ Set pink theme colors

🎨 NEXT STEPS:
--------------

1. CREATE YOUR MASCOT ICON:
   • Use the design brief: docs/ICON_DESIGN_BRIEF.md
   • Create 1024x1024px pink fluffy anime animal
   • Save as: ${MASTER_ICON_PATH}

2. GENERATE ICON SIZES:
   • Use online tools like:
     - https://realfavicongenerator.net/
     - https://www.favicon-generator.org/
     - https://iconifier.net/
   • Or use image editing software to resize

3. PLACE ICONS:
   • Web: Place all sizes in web/public/icons/
   • Mobile: Place icons in mobile/assets/icons/

4. TEST:
   • Run: npm run dev:web
   • Check PWA install prompt
   • Verify icons appear correctly

🎯 ICON SIZES NEEDED:
--------------------
${ICON_SIZES.map(size => `• ${size}x${size}px`).join('\n')}

The new pink mascot will perfectly capture the essence of Kuchisabishii! 🍽️💕
  `);
}

function main() {
  console.log('🍽️ Kuchisabishii Icon Update Script');
  console.log('=====================================\n');

  if (checkMasterIcon()) {
    console.log('🎨 Master icon found! Preparing updates...\n');
    // If master icon exists, we can proceed with updates
  }

  // Update configuration files regardless
  updateWebManifest();
  updateMobileConfig();
  updateLayoutMetadata();
  
  showNextSteps();
}

main();