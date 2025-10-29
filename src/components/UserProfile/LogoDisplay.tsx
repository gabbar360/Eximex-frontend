import React from 'react';

interface LogoDisplayProps {
  logoUrl: string | null;
  alt?: string;
  className?: string;
}

const LogoDisplay: React.FC<LogoDisplayProps> = ({
  logoUrl,
  alt = 'Logo',
  className = 'w-16 h-16',
}) => {
  console.log('LogoDisplay received:', { logoUrl });

  if (!logoUrl) {
    console.log('No logo URL provided, showing placeholder');
    return (
      <div
        className={`${className} rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700`}
      >
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      </div>
    );
  }

  const fullUrl = logoUrl.startsWith('http')
    ? logoUrl
    : `${window.location.origin}${logoUrl}`;
  console.log('Logo URL constructed:', { logoUrl, fullUrl });

  return (
    <img
      src={fullUrl}
      alt={alt}
      className={`${className} rounded-lg object-cover border border-gray-200 dark:border-gray-700`}
      onLoad={() => console.log('Logo loaded successfully:', fullUrl)}
      onError={(e) => {
        console.log('Logo failed to load:', { logoUrl, fullUrl });
        const target = e.currentTarget as HTMLImageElement;
        target.style.display = 'none';
      }}
    />
  );
};

export default LogoDisplay;
