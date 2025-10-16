import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from '../icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faDownload,
  faEllipsisV,
  faSun,
  faBell,
  faChevronDown,
  faBars,
  faSignOutAlt,
  faBuilding,
  faFileAlt,
  faFileInvoice,
  faPalette,
  faUsers,
  faBox,
  faShoppingCart,
  faFileInvoiceDollar,
  faTruck,
  faCheckSquare,
  faChartLine,
  faCog,
  faHandshake,
  faUser,
  faTimes,
  faCube,
  faFileContract,
  faCreditCard,
} from '@fortawesome/free-solid-svg-icons';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../hooks/useAuth';
import { useSelector } from 'react-redux';
import UserAvatar from '../components/common/UserAvatar';
import { useTheme } from '../context/ThemeContext';

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const getNavItems = (userRole: string): NavItem[] => [
  {
    icon: <GridIcon />,
    name: 'Dashboard',
    path: '/dashboard',
  },
  {
    icon: <FontAwesomeIcon icon={faUsers} />,
    name: 'Customer&prospect',
    path: '/cprospect',
  },
  {
    icon: <FontAwesomeIcon icon={faBox} />,
    name: 'Categories',
    path: '/categories',
  },
  // {
  //   icon: <FontAwesomeIcon icon={faCog} />,
  //   name: "Attributes",
  //   path: "/attributes",
  // },
  {
    icon: <FontAwesomeIcon icon={faCube} />,
    name: 'Products',
    path: '/products',
  },
  {
    icon: <FontAwesomeIcon icon={faFileAlt} />,
    name: 'Proforma Invoices',
    path: '/proforma-invoices',
  },
  {
    icon: <FontAwesomeIcon icon={faShoppingCart} />,
    name: 'Orders',
    path: '/orders',
  },
  {
    icon: <FontAwesomeIcon icon={faFileContract} />,
    name: 'Purchase Orders',
    path: '/purchase-orders',
  },
  {
    icon: <FontAwesomeIcon icon={faCreditCard} />,
    name: 'Payment Tracking',
    path: '/payments',
  },
  ...(['ADMIN', 'SUPER_ADMIN'].includes(userRole)
    ? [
        {
          icon: <FontAwesomeIcon icon={faUsers} />,
          name: 'Staff Management',
          path: '/staff-management',
        },
        {
          icon: <FontAwesomeIcon icon={faChartLine} />,
          name: 'Activity Logs',
          path: '/activity-logs',
        },
      ]
    : []),
  ...(userRole === 'SUPER_ADMIN'
    ? [
        {
          icon: <FontAwesomeIcon icon={faCog} />,
          name: 'User Management',
          path: '/super-admin/users',
        },
      ]
    : []),
  {
    icon: <UserCircleIcon />,
    name: 'User Profile',
    path: '/profile',
  },
];

const AppSidebar: React.FC = () => {
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
  const currentUser = useSelector((state: any) => state.user.user);
  const { theme } = useTheme();

  const navItems = getNavItems(currentUser?.role || 'STAFF');

  const [openSubmenu, setOpenSubmenu] = useState<{
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Handle logout
  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
    setIsLoading(false);
  };

  // const isActive = (path: string) => location.pathname === path;
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

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index)}
              className={`menu-item group ${
                openSubmenu?.index === index
                  ? 'menu-item-active'
                  : 'menu-item-inactive'
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? 'lg:justify-center'
                  : 'lg:justify-start'
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.index === index
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive'
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.index === index
                      ? 'rotate-180 text-brand-500'
                      : ''
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Button clicked, navigating to:', nav.path);

                  // Close mobile sidebar if open
                  if (isMobileOpen) {
                    toggleMobileSidebar();
                  }

                  // Force navigation with replace
                  navigate(nav.path, { replace: true });

                  // Also dispatch a custom event to force re-render
                  window.dispatchEvent(
                    new CustomEvent('forceNavigation', { detail: nav.path })
                  );
                }}
                className={`menu-item group ${
                  isActive(nav.path) ? 'menu-item-active' : 'menu-item-inactive'
                } w-full text-left`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? 'menu-item-icon-active'
                      : 'menu-item-icon-inactive'
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
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
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      onClick={() => {
                        if (isMobileOpen) {
                          toggleMobileSidebar();
                        }
                      }}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? 'menu-dropdown-item-active'
                          : 'menu-dropdown-item-inactive'
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? 'menu-dropdown-badge-active'
                                : 'menu-dropdown-badge-inactive'
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? 'menu-dropdown-badge-active'
                                : 'menu-dropdown-badge-inactive'
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
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
            ? 'w-[290px]'
            : isHovered
              ? 'w-[290px]'
              : 'w-[90px]'
        }
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Section */}
      <div
        className={` flex ${
          !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-center'
        }`}
      >
        <Link to="/">
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

      {/* User Profile Section */}
      {/* <div className="py-4 mb-6 border-b border-gray-200 dark:border-gray-800">
        <UserAvatar
          user={user}
          size="md"
          showName={isExpanded || isHovered || isMobileOpen}
          showEmail={isExpanded || isHovered || isMobileOpen}
        />
      </div> */}

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
                  'Menu'
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
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors ${
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

export default AppSidebar;
