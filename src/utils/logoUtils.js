// Utility function to construct proper logo URLs
export const getLogoUrl = (logoPath) => {
  console.log('getLogoUrl called with:', logoPath);
  console.log('Environment VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('Window origin:', window.location.origin);
  
  if (!logoPath) return null;

  // If already a full URL or data URL, return as is
  if (logoPath.startsWith('http') || logoPath.startsWith('data:')) {
    return logoPath;
  }

  // Get base URL from environment or use current origin
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || window.location.origin;

  // Ensure logoPath starts with /
  const path = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;

  const finalUrl = `${baseUrl}${path}`;
  console.log('Final logo URL:', finalUrl);
  return finalUrl;
};
