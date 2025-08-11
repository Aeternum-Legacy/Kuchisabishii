# Kuchisabishii (口さびしい)

A food journaling application that helps you track and remember your culinary adventures. "Kuchisabishii" is a Japanese word that describes the feeling of wanting to eat something not because you're hungry, but because your mouth feels lonely.

## Project Structure

This monorepo contains:

- **web/**: Next.js 14 web application with Tailwind CSS
- **mobile/**: React Native/Expo mobile application
- **shared/**: Shared TypeScript types and utilities
- **docs/**: Project documentation

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kuchisabishii
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Build the shared package:
```bash
npm run build:shared
```

### Development

#### Web Application
```bash
npm run dev:web
# or
cd web && npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the web app.

#### Mobile Application
```bash
npm run dev:mobile
# or
cd mobile && npm start
```
Use the Expo Go app to view the mobile app on your device.

### Building

#### Build all:
```bash
npm run build
```

#### Build individual projects:
```bash
npm run build:web      # Build web app
npm run build:mobile   # Build mobile app
npm run build:shared   # Build shared package
```

### Code Quality

```bash
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues
npm run type-check     # TypeScript type checking
```

## Features

- 📱 Cross-platform (Web + Mobile)
- 📸 Photo-based food logging
- ⭐ Rating system
- 📍 Location tracking
- 🏷️ Tags and categories
- 😊 Mood tracking
- 📊 Statistics and insights
- 🔍 Search and filtering

## Tech Stack

### Web
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

### Mobile
- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **Language**: TypeScript

### Shared
- **Language**: TypeScript
- **Build**: tsc (TypeScript Compiler)

## Project Scripts

### Root Level
- `npm run dev` - Start web development server
- `npm run dev:web` - Start web development server
- `npm run dev:mobile` - Start mobile development server
- `npm run build` - Build shared package and web app
- `npm run lint` - Lint all code
- `npm run type-check` - Run TypeScript checks
- `npm run clean` - Clean all node_modules and build artifacts

### Web App (web/)
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Lint web code

### Mobile App (mobile/)
- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web

### Shared Package (shared/)
- `npm run build` - Build TypeScript
- `npm run dev` - Build in watch mode

## Documentation

- [Architecture Overview](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests and linting: `npm run lint && npm run type-check`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you have questions or need help, please open an issue in the GitHub repository.# Deploy trigger
# Deployment trigger Mon Aug 11 17:37:59 MDT 2025

---
Deployment: 2025-08-11 17:43:14
