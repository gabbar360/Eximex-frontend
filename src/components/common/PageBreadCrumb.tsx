import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  pageTitle: string;
  breadcrumbItems?: BreadcrumbItem[];
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({
  pageTitle,
  breadcrumbItems,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        {pageTitle}
      </h2>
      <nav>
        <ol className="flex items-center gap-1.5">
          <li>
            <Link
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
              to="/"
            >
              Home
            </Link>
          </li>
          {breadcrumbItems &&
            breadcrumbItems.map((item, index) => (
              <li key={index}>
                <span className="text-gray-500 dark:text-gray-400">/</span>
                {item.href ? (
                  <Link
                    className="ml-1.5 text-sm text-gray-500 dark:text-gray-400"
                    to={item.href}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="ml-1.5 text-sm text-gray-800 dark:text-white/90">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          <li>
            <span className="text-gray-500 dark:text-gray-400">/</span>
            <span className="ml-1.5 text-sm text-gray-800 dark:text-white/90">
              {pageTitle}
            </span>
          </li>
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumb;
