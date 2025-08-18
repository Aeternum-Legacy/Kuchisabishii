/**
 * Metadata Generation Utility
 * Provides environment-aware metadata generation for proper SEO and Open Graph
 */

import { getBaseUrl } from './env'

interface MetadataConfig {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  siteName?: string
}

/**
 * Generate environment-aware metadata for pages
 */
export function generateMetadata(config: MetadataConfig = {}) {
  const baseUrl = getBaseUrl()
  const defaultConfig = {
    title: 'Kuchisabishii - Food Journaling & Recommendations',
    description: 'Discover, journal, and share your culinary adventures with personalized food recommendations.',
    image: `${baseUrl}/og-image.png`,
    url: baseUrl,
    type: 'website' as const,
    siteName: 'Kuchisabishii'
  }

  const mergedConfig = { ...defaultConfig, ...config }

  return {
    title: mergedConfig.title,
    description: mergedConfig.description,
    openGraph: {
      title: mergedConfig.title,
      description: mergedConfig.description,
      url: mergedConfig.url,
      siteName: mergedConfig.siteName,
      images: [
        {
          url: mergedConfig.image,
          width: 1200,
          height: 630,
          alt: mergedConfig.title,
        },
      ],
      locale: 'en_US',
      type: mergedConfig.type,
    },
    twitter: {
      card: 'summary_large_image',
      title: mergedConfig.title,
      description: mergedConfig.description,
      images: [mergedConfig.image],
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: mergedConfig.url,
    },
  }
}

/**
 * Generate metadata for food sharing pages
 */
export function generateFoodShareMetadata(food: {
  id: string
  name: string
  location: string
  rating: number
  image?: string
}) {
  const baseUrl = getBaseUrl()
  const title = `${food.name} at ${food.location} - ${food.rating}/5 stars`
  const description = `Check out this amazing food experience shared on Kuchisabishii!`
  const url = `${baseUrl}/share/food/${food.id}`
  const image = food.image || `${baseUrl}/og-food-default.png`

  return generateMetadata({
    title,
    description,
    url,
    image,
    type: 'article'
  })
}

/**
 * Generate metadata for user profile sharing
 */
export function generateUserProfileMetadata(user: {
  id: string
  displayName: string
  bio?: string
  profileImage?: string
}) {
  const baseUrl = getBaseUrl()
  const title = `${user.displayName}'s Food Journey - Kuchisabishii`
  const description = user.bio || `Discover ${user.displayName}'s culinary adventures and food recommendations.`
  const url = `${baseUrl}/profile/${user.id}`
  const image = user.profileImage || `${baseUrl}/og-profile-default.png`

  return generateMetadata({
    title,
    description,
    url,
    image,
    type: 'profile'
  })
}

/**
 * Generate environment-aware canonical URLs
 */
export function getCanonicalUrl(path: string): string {
  const baseUrl = getBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

/**
 * Generate environment-aware asset URLs
 */
export function getAssetUrl(assetPath: string): string {
  const baseUrl = getBaseUrl()
  const cleanPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`
  return `${baseUrl}${cleanPath}`
}