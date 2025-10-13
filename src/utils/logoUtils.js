// Utility function to construct proper logo URLs
export const getLogoUrl = (logoPath) => {
  if (!logoPath) return null;

  // If already a full URL, return as is
  if (logoPath.startsWith('http')) {
    return logoPath;
  }

  // Get base URL from environment or default
  const baseUrl = 'http://localhost:8000';

  // Ensure logoPath starts with /
  const path = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;

  return `${baseUrl}${path}`;
};
