import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faDatabase,
  faUsers,
  faBuilding,
  faCog,
  faUserShield,
  faLock,
  faFileAlt,
  faChevronDown,
  faSignOutAlt,
  faBell,
  faSearch,
  faDownload,
  faUpload,
  faServer,
  faShield,
  faKey,
  faHistory,
  faTools,
  faGlobe,
  faEnvelope,
  faChartBar,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { GridIcon, HorizontaLDots, ChevronDownIcon } from '../icons';

type SuperAdminNavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { 
    name: string; 
    path: string; 
    icon?: React.ReactNode;
    badge?: string;
    description?: string;
  }[];
};

const getSuperAdminNavItems = (): SuperAdminNavItem[] => [
  {
    icon: <GridIcon />,
    name: 'Dashboard',
    path: '/super-admin/dashboard',
  },
  {
    icon: <FontAwesomeIcon icon={faUserShield} />,
    name: 'Management Center',
    path: '/super-admin/management',
  },
  {
    icon: <FontAwesomeIcon icon={faDatabase} />,
    name: 'Database Management',
    subItems: [
      { 
        name: 'All Tables', 
        path: '/super-admin/database/tables',
        icon: <FontAwesomeIcon icon={faServer} />,
        description: 'View all database tables'
      },
      { 
        name: 'Data Export', 
        path: '/super-admin/database/export',
        icon: <FontAwesomeIcon icon={faDownload} />,
        description: 'Export database data'
      },
      { 
        name: 'Data Import', 
        path: '/super-admin/database/import',
        icon: <FontAwesomeIcon icon={faUpload} />,
        description: 'Import data to database'
      },
      { 
        name: 'Database Health', 
        path: '/super-admin/database/health',
        icon: <FontAwesomeIcon icon={faChartBar} />,
        description: 'Monitor database performance'
      }
    ],
  },
  {
    icon: <FontAwesomeIcon icon={faUsers} />,
    name: 'User Management',
    subItems: [
      { 
        name: 'All Users', 
        path: '/super-admin/users',
        icon: <FontAwesomeIcon icon={faUsers} />,
        description: 'Manage all system users'
      },
      { 
        name: 'User Roles', 
        path: '/super-admin/users/roles',
        icon: <FontAwesomeIcon icon={faUserShield} />,
        description: 'Configure user roles'
      },
      { 
        name: 'Password Management', 
        path: '/super-admin/passwords',
        icon: <FontAwesomeIcon icon={faLock} />,
        description: 'Reset user passwords'
      },
      { 
        name: 'User Activity', 
        path: '/super-admin/users/activity',
        icon: <FontAwesomeIcon icon={faHistory} />,
        description: 'View user activity logs'
      }
    ],
  },
  {
    icon: <FontAwesomeIcon icon={faBuilding} />,
    name: 'Company Management',
    subItems: [
      { 
        name: 'All Companies', 
        path: '/super-admin/companies',
        icon: <FontAwesomeIcon icon={faBuilding} />,
        description: 'Manage registered companies'
      },
      { 
        name: 'Company Settings', 
        path: '/super-admin/companies/settings',
        icon: <FontAwesomeIcon icon={faCog} />,
        description: 'Configure company settings'
      },
      { 
        name: 'Subscription Management', 
        path: '/super-admin/companies/subscriptions',
        icon: <FontAwesomeIcon icon={faFileAlt} />,
        badge: 'Pro',
        description: 'Manage company subscriptions'
      }
    ],
  },
  {
    icon: <FontAwesomeIcon icon={faShield} />,
    name: 'Security & Access',
    subItems: [
      { 
        name: 'Security Logs', 
        path: '/super-admin/security/logs',
        icon: <FontAwesomeIcon icon={faHistory} />,
        description: 'View security audit logs'
      },
      { 
        name: 'API Keys', 
        path: '/super-admin/security/api-keys',
        icon: <FontAwesomeIcon icon={faKey} />,
        description: 'Manage API access keys'
      },
      { 
        name: 'Access Control', 
        path: '/super-admin/security/access',
        icon: <FontAwesomeIcon icon={faLock} />,
        description: 'Configure access permissions'
      },
      { 
        name: 'Threat Detection', 
        path: '/super-admin/security/threats',
        icon: <FontAwesomeIcon icon={faExclamationTriangle} />,
        badge: 'Alert',
        description: 'Monitor security threats'
      }
    ],
  },
  {
    icon: <FontAwesomeIcon icon={faChartLine} />,
    name: 'Analytics & Reports',
    subItems: [
      { 
        name: 'System Analytics', 
        path: '/super-admin/analytics/system',
        icon: <FontAwesomeIcon icon={faChartBar} />,
        description: 'System performance analytics'
      },
      { 
        name: 'Usage Reports', 
        path: '/super-admin/analytics/usage',
        icon: <FontAwesomeIcon icon={faFileAlt} />,
        description: 'Generate usage reports'
      },
      { 
        name: 'Financial Reports', 
        path: '/super-admin/analytics/financial',
        icon: <FontAwesomeIcon icon={faChartLine} />,
        description: 'Financial analytics'
      }
    ],
  },
  {
    icon: <FontAwesomeIcon icon={faCog} />,
    name: 'System Settings',
    subItems: [
      { 
        name: 'Global Settings', 
        path: '/super-admin/settings/global',
        icon: <FontAwesomeIcon icon={faGlobe} />,
        description: 'Configure global settings'
      },
      { 
        name: 'Email Configuration', 
        path: '/super-admin/settings/email',
        icon: <FontAwesomeIcon icon={faEnvelope} />,
        description: 'Configure email settings'
      },
      { 
        name: 'System Maintenance', 
        path: '/super-admin/settings/maintenance',
        icon: <FontAwesomeIcon icon={faTools} />,
        description: 'System maintenance tools'
      },
      { 
        name: 'Backup & Restore', 
        path: '/super-admin/settings/backup',
        icon: <FontAwesomeIcon icon={faServer} />,
        description: 'Backup and restore data'
      }
    ],
  }
];

const SuperAdminSidebar: React.FC = () => {
  const {
    isExpanded,
    isMobileOpen,
    isHovered,
    setIsHovered,
    toggleMobileSidebar,
  } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();

  const navItems = getSuperAdminNavItems();

  const [openSubmenu, setOpenSubmenu] = useState<{
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
    setIsLoading(false);
  };

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({ index });
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `main-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu && prevOpenSubmenu.index === index) {
        return null;
      }
      return { index };
    });
  };

  const renderMenuItems = (items: SuperAdminNavItem[]) => (
    <ul className="flex flex-col gap-2">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                openSubmenu?.index === index
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              } ${
                !isExpanded && !isHovered
                  ? 'lg:justify-center'
                  : 'lg:justify-start'
              }`}
            >
              <span className="text-lg">
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <>
                  <span className="flex-1 text-left">{nav.name}</span>
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openSubmenu?.index === index ? 'rotate-180' : ''
                    }`}
                  />
                </>
              )}
            </button>
          ) : (
            nav.path && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  if (isMobileOpen) {
                    toggleMobileSidebar();
                  }
                  
                  navigate(nav.path, { replace: true });
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(nav.path)
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span className="text-lg">
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="flex-1 text-left">{nav.name}</span>
                )}
              </button>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`main-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.index === index
                    ? `${subMenuHeight[`main-${index}`]}px`
                    : '0px',
              }}
            >
              <ul className="mt-2 space-y-1 ml-8">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      onClick={() => {
                        if (isMobileOpen) {
                          toggleMobileSidebar();
                        }
                      }}
                      className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                        isActive(subItem.path)
                          ? 'bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      {subItem.icon && (
                        <span className="text-sm">
                          {subItem.icon}
                        </span>
                      )}
                      <span className="flex-1">{subItem.name}</span>
                      {subItem.badge && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          subItem.badge === 'Pro' 
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : subItem.badge === 'Alert'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {subItem.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? 'w-[320px]'
            : isHovered
              ? 'w-[320px]'
              : 'w-[90px]'
        }
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Section */}
      <div className={`flex ${
        !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-center'
      }`}>
        <Link to="/super-admin/dashboard">
          {isExpanded || isHovered || isMobileOpen ? (
            <img
              src={
                theme === 'dark'
                  ? '/dark-theme-logo.png'
                  : '/light-theme-logo.png'
              }
              alt="Exim-Ex Logo"
              className="h-28 w-52"
            />
          ) : (
            <img
              src={
                theme === 'dark'
                  ? '/dark-theme-logo.png'
                  : '/light-theme-logo.png'
              }
              alt="Exim-Ex Logo"
              className="h-12 w-30"
            />
          )}
        </Link>
      </div>

      {/* Super Admin Badge */}
      {(isExpanded || isHovered || isMobileOpen) && (
        <div className="mb-6 px-4">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg text-center">
            <FontAwesomeIcon icon={faUserShield} className="mr-2" />
            <span className="text-sm font-semibold">SUPER ADMIN</span>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <div className="flex flex-col flex-1 overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? 'lg:justify-center'
                    : 'justify-start'
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  'SUPER ADMIN MENU'
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems)}
            </div>
          </div>
        </nav>
      </div>

      {/* Logout Section */}
      <div className="py-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
            !isExpanded && !isHovered && !isMobileOpen
              ? 'justify-center'
              : 'justify-start'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FontAwesomeIcon
            icon={faSignOutAlt}
            className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
          />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span>{isLoading ? 'Signing out...' : 'Sign Out'}</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;