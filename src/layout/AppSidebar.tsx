import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Assume these icons are imported from an icon library
import {
  MdDashboard,
  MdPeople,
  MdCategory,
  MdInventory,
  MdDescription,
  MdShoppingCart,
  MdAssignment,
  MdSupervisorAccount,
  MdAnalytics,
  MdSettings,
  MdAccountCircle,
  MdLogout,
  MdKeyboardArrowDown,
  MdMoreHoriz,
} from 'react-icons/md';
import {
  HiOutlineDocumentText,
  HiOutlineClipboardDocumentList,
} from 'react-icons/hi2';
import {
  ChevronDownIcon,
  HorizontaLDots,
} from '../icons';
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
    icon: <MdDashboard className="w-4 h-4" />,
    name: 'Dashboard',
    path: '/dashboard',
  },
  ...(userRole !== 'SUPER_ADMIN'
    ? [
        {
          icon: <MdPeople className="w-4 h-4" />,
          name: 'Customer&prospect',
          path: '/cprospect',
        },
        {
          icon: <MdCategory className="w-4 h-4" />,
          name: 'Categories',
          path: '/categories',
        },
        {
          icon: <MdInventory className="w-4 h-4" />,
          name: 'Products',
          path: '/products',
        },
        {
          icon: <HiOutlineDocumentText className="w-4 h-4" />,
          name: 'Proforma Invoices',
          path: '/proforma-invoices',
        },
        {
          icon: <MdShoppingCart className="w-4 h-4" />,
          name: 'Orders',
          path: '/orders',
        },
        {
          icon: <HiOutlineClipboardDocumentList className="w-4 h-4" />,
          name: 'Purchase Orders',
          path: '/purchase-orders',
        },
      ]
    : []),
  ...(['ADMIN', 'SUPER_ADMIN'].includes(userRole)
    ? [
        {
          icon: <MdSupervisorAccount className="w-4 h-4" />,
          name: 'Staff Management',
          path: '/staff-management',
        },
        {
          icon: <MdAnalytics className="w-4 h-4" />,
          name: 'Activity Logs',
          path: '/activity-logs',
        },
      ]
    : []),
  ...(userRole === 'SUPER_ADMIN'
    ? [
        {
          icon: <MdSettings className="w-4 h-4" />,
          name: 'Super Admin',
          subItems: [
            { name: 'Dashboard', path: '/super-admin/dashboard' },
            { name: 'User Management', path: '/super-admin/users' },
            { name: 'Password Management', path: '/super-admin/passwords' },
            { name: 'Company Management', path: '/super-admin/companies' },
          ],
        },
      ]
    : []),
  {
    icon: <MdAccountCircle className="w-4 h-4" />,
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
    <ul className="flex flex-col gap-2">
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
                <MdKeyboardArrowDown
                  className={`ml-auto w-4 h-4 transition-transform duration-200 ${
                    openSubmenu?.index === index
                      ? 'rotate-180 text-slate-600'
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
              <ul className="mt-1 space-y-1 ml-6">
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
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-slate-800 h-screen transition-all duration-300 ease-in-out z-40 border-r border-gray-200 
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-slate-500 ${
                  !isExpanded && !isHovered
                    ? 'lg:justify-center'
                    : 'justify-start'
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  'Menu'
                ) : (
                  <MdMoreHoriz className="w-4 h-4" />
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
          className={`w-full flex items-center gap-2 px-2 py-1 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors ${
            !isExpanded && !isHovered && !isMobileOpen
              ? 'justify-center'
              : 'justify-start'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <MdLogout
            className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
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
