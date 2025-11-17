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
  faExclamationTriangle,
  faCreditCard
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
    name: 'Role Management',
    path: '/super-admin/roles',
  },
  {
    icon: <FontAwesomeIcon icon={faUsers} />,
    name: 'User Management',
    path: '/super-admin/users',
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
              className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                openSubmenu?.index === index
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              } ${
                !isExpanded && !isHovered
                  ? 'lg:justify-center'
                  : 'lg:justify-start'
              }`}
            >
              <span className="text-base sm:text-lg flex-shrink-0">
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <>
                  <span className="flex-1 text-left min-w-0 truncate">{nav.name}</span>
                  <ChevronDownIcon
                    className={`w-3 sm:w-4 h-3 sm:h-4 transition-transform duration-200 flex-shrink-0 ${
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
                className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(nav.path)
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span className="text-base sm:text-lg flex-shrink-0">
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="flex-1 text-left min-w-0 truncate">{nav.name}</span>
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
              <ul className="mt-2 space-y-1 ml-4 sm:ml-6 lg:ml-8">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      onClick={() => {
                        if (isMobileOpen) {
                          toggleMobileSidebar();
                        }
                      }}
                      className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 lg:px-4 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 ${
                        isActive(subItem.path)
                          ? 'bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      {subItem.icon && (
                        <span className="text-xs sm:text-sm flex-shrink-0">
                          {subItem.icon}
                        </span>
                      )}
                      <span className="flex-1 min-w-0 truncate">{subItem.name}</span>
                      {subItem.badge && (
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full flex-shrink-0 ${
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
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-3 sm:px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-40 border-r border-gray-200 overflow-x-hidden
        ${
          isExpanded || isMobileOpen
            ? 'w-[240px]'
            : isHovered
              ? 'w-[240px]'
              : 'w-[70px]'
        }
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Section */}
      <div className={`flex py-2 ${
        !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-center'
      }`}>
        <Link to="/super-admin/dashboard" className="flex-shrink-0">
          {isExpanded || isHovered || isMobileOpen ? (
            <img
              src={
                theme === 'dark'
                  ? '/dark-theme-logo.png'
                  : '/light-theme-logo.png'
              }
              alt="Exim-Ex Logo"
              className="h-20 sm:h-28 w-auto max-w-[200px] sm:max-w-[220px] object-contain"
            />
          ) : (
            <img
              src={
                theme === 'dark'
                  ? '/dark-theme-logo.png'
                  : '/light-theme-logo.png'
              }
              alt="Exim-Ex Logo"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          )}
        </Link>
      </div>

      {/* Super Admin Badge */}
      {/* {(isExpanded || isHovered || isMobileOpen) && (
        <div className="mb-4 sm:mb-6 px-2 sm:px-4">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 sm:px-3 py-2 rounded-lg text-center">
            <FontAwesomeIcon icon={faUserShield} className="mr-1 sm:mr-2 text-sm" />
            <span className="text-xs sm:text-sm font-semibold">SUPER ADMIN</span>
          </div>
        </div>
      )} */}

      {/* Navigation Menu */}
      <div className="flex flex-col flex-1 overflow-y-auto duration-300 ease-linear no-scrollbar min-h-0">
        <nav className="mb-4 sm:mb-6 flex-1">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div>
              <h2
                className={`mb-3 sm:mb-4 text-xs uppercase flex leading-[20px] text-gray-400 px-2 sm:px-0 ${
                  !isExpanded && !isHovered
                    ? 'lg:justify-center'
                    : 'justify-start'
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  <span className="truncate">SUPER ADMIN MENU</span>
                ) : (
                  <HorizontaLDots className="size-5 sm:size-6" />
                )}
              </h2>
              {renderMenuItems(navItems)}
            </div>
          </div>
        </nav>
      </div>

      {/* Logout Section */}
      <div className="py-3 sm:py-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
            !isExpanded && !isHovered && !isMobileOpen
              ? 'justify-center'
              : 'justify-start'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FontAwesomeIcon
            icon={faSignOutAlt}
            className={`w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0 ${isLoading ? 'animate-spin' : ''}`}
          />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="truncate">{isLoading ? 'Signing out...' : 'Sign Out'}</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;