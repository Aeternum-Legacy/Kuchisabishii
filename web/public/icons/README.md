# Kuchisabishii App Icons

## 📁 Icon Files Structure

```
icons/
├── icon-16x16.png          # Favicon small
├── icon-32x32.png          # Favicon standard
├── icon-180x180.png        # Apple touch icon
├── icon-192x192.png        # PWA icon small
├── icon-512x512.png        # PWA icon large
├── icon-1024x1024.png      # Master icon
├── favicon.ico             # Multi-size favicon
└── kuchisabishii-logo.svg  # Vector source
```

## 🎨 Current Status

**Icons needed**: Pink fluffy anime-style animal mascot
**Design brief**: See `/docs/ICON_DESIGN_BRIEF.md`

## 🔄 To Update Icons

1. Place new icon files in this directory following the naming convention
2. Update `/web/public/manifest.json` with new icon references  
3. Update `/web/src/app/layout.tsx` for favicon and apple-touch-icon
4. Update `/mobile/app.json` for mobile app icons
5. Run `npm run build` to regenerate optimized icons

## 📐 Icon Requirements

- **Style**: Kawaii/anime pink fluffy animal
- **Emotion**: Captures "Kuchisabishii" (mouth loneliness)  
- **Background**: Transparent or subtle
- **Scalability**: Must work from 16px to 1024px
- **Format**: PNG with transparency + SVG source