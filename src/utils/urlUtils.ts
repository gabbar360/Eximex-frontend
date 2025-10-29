/**
 * Utility functions for URL construction
 */

/**
 * Get the base API URL without the /api/v1 suffix
 */
export const getBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || window.location.origin;
};

/**
 * Construct full URL for assets (images, files, etc.)
 * @param path - The asset path (can be relative or absolute)
 * @returns Full URL for the asset
 */
export const getAssetUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  
  // If it's already a full URL (http/https) or data URL, return as is
  if (path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }
  
  // Construct full URL with base URL
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * Get logo URL with fallback
 * @param logoPath - The logo path from API
 * @param fallback - Fallback image path
 * @returns Full logo URL or fallback
 */
export const getLogoUrl = (logoPath: string | null | undefined, fallback?: string): string => {
  const logoUrl = getAssetUrl(logoPath);
  if (logoUrl) return logoUrl;
  
  return fallback || '/images/default-logo.png';
};