import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserShield,
  faUsers,
  faSignOutAlt,
  faCogs,
  faKey,
  faBuilding,
} from '@fortawesome/free-solid-svg-icons';
import {
  MdDashboard,
  MdPeople,
  MdCategory,
  MdInventory,
  MdShoppingCart,
  MdSupervisorAccount,
  MdAnalytics,
  MdAccountCircle,
  MdLogout,
  MdKeyboardArrowDown,
  MdMoreHoriz,
} from 'react-icons/md';
import {
  HiOutlineDocumentText,
  HiOutlineClipboardDocumentList,
  HiOutlineShoppingBag,
  HiOutlineTruck,
  HiOutlineArchiveBox,
  HiOutlineScale,
  HiOutlineChartBarSquare,
} from 'react-icons/hi2';
import { GridIcon, HorizontaLDots, ChevronDownIcon } from '../icons';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../hooks/useAuth';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../context/ThemeContext';
import { fetchUserSidebarMenu } from '../features/userPermissionSlice';
// import DebugSidebar from './DebugSidebar'; // Debug component - removed

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: {
    name: string;
    path: string;
    icon?: React.ReactNode;
    pro?: boolean;
    new?: boolean;
  }[];
};

// Convert sidebar menu from backend to NavItem format
const convertSidebarMenuToNavItems = (sidebarMenu: any[]): NavItem[] => {
  if (!sidebarMenu || sidebarMenu.length === 0) {
    return [];
  }

  const iconMap: { [key: string]: React.ReactNode } = {
    dashboard: <MdDashboard className="w-4 h-4" />,
    contacts: <MdPeople className="w-4 h-4" />,
    categories: <MdCategory className="w-4 h-4" />,
    products: <MdInventory className="w-4 h-4" />,
    'proforma-invoices': <HiOutlineDocumentText className="w-4 h-4" />,
    orders: <MdShoppingCart className="w-4 h-4" />,
    'purchase-orders': <HiOutlineClipboardDocumentList className="w-4 h-4" />,
    'staff-management': <MdSupervisorAccount className="w-4 h-4" />,
    'user-profile': <MdAccountCircle className="w-4 h-4" />,
    'all-orders': <HiOutlineShoppingBag className="w-4 h-4" />,
    shipments: <HiOutlineTruck className="w-4 h-4" />,
    'packing-lists': <HiOutlineArchiveBox className="w-4 h-4" />,
    'vgm-documents': <HiOutlineScale className="w-4 h-4" />,
    reports: <HiOutlineChartBarSquare className="w-4 h-4" />,
  };

  return sidebarMenu.map((menu) => {
    const navItem: NavItem = {
      name: menu.name,
      icon: iconMap[menu.slug] || <MdDashboard className="w-4 h-4" />,
      path: menu.path,
    };

    if (menu.submenus && menu.submenus.length > 0) {
      navItem.subItems = menu.submenus.map((submenu) => ({
        name: submenu.name,
        path: submenu.path || `/${menu.slug}/${submenu.slug}`,
        icon: iconMap[submenu.slug] || <MdDashboard className="w-4 h-4" />,
      }));
      delete navItem.path; // Remove path for parent menu if it has submenus
    }

    return navItem;
  });
};

const getNavItems = (userRole: string): NavItem[] => {
  if (userRole === 'SUPER_ADMIN') {
    return [
      {
        icon: <GridIcon />,
        name: 'Dashboard',
        path: '/dashboard',
      },
      {
        icon: <FontAwesomeIcon icon={faBuilding} />,
        name: 'Company Management',
        path: '/super-admin/companies',
      },
      {
        icon: <FontAwesomeIcon icon={faUsers} />,
        name: 'User Management',
        path: '/super-admin/users',
      },
      {
        icon: <FontAwesomeIcon icon={faUserShield} />,
        name: 'Role Management',
        path: '/super-admin/roles',
      },
      {
        icon: <FontAwesomeIcon icon={faCogs} />,
        name: 'Menu Management',
        path: '/super-admin/menus',
      },
      {
        icon: <FontAwesomeIcon icon={faKey} />,
        name: 'User Permissions',
        path: '/super-admin/permissions',
      },
    ];
  }

  // For regular users, return empty array - only use permission-based menus
  return [];
};

const Sidebar: React.FC = () => {
  const {
    isExpanded,
    isMobileOpen,
    isHovered,
    setIsHovered,
    toggleMobileSidebar,
  } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = useSelector((state: any) => state.user.user);
  const { sidebarMenu } = useSelector((state: any) => state.userPermission);
  const { theme } = useTheme();

  const userRole = currentUser?.role?.name || null;
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const hasNoRole = !currentUser?.role;

  // Use permission-based menu for regular users, static menu for super admin
  const navItems = isSuperAdmin
    ? getNavItems(userRole)
    : convertSidebarMenuToNavItems(sidebarMenu || []);

  const [openSubmenu, setOpenSubmenu] = useState<{ index: number } | null>(
    null
  );
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Fetch user sidebar menu for regular users
  useEffect(() => {
    if (currentUser && !isSuperAdmin) {
      console.log(
        '🔄 Fetching sidebar menu for user:',
        currentUser.id,
        'Role:',
        userRole
      );
      dispatch(fetchUserSidebarMenu())
        .then((result) => {
          console.log('✅ Sidebar menu fetch result:', result);
        })
        .catch((error) => {
          console.error('❌ Sidebar menu fetch error:', error);
        });
    }
  }, [dispatch, currentUser, isSuperAdmin, userRole]);

  // Debug log for sidebar menu
  useEffect(() => {
    console.log('📋 Current sidebar menu state:', sidebarMenu);
    console.log('👤 Current user:', currentUser);
    console.log('🔑 Is Super Admin:', isSuperAdmin);
    console.log('📊 Nav items count:', navItems.length);
    console.log('🗺 Converted nav items:', navItems);
    navItems.forEach((item, index) => {
      console.log(`Menu ${index}:`, item.name, 'Path:', item.path);
      if (item.subItems) {
        item.subItems.forEach((sub, subIndex) => {
          console.log(`  Submenu ${subIndex}:`, sub.name, 'Path:', sub.path);
        });
      }
    });
  }, [sidebarMenu, currentUser, isSuperAdmin, navItems]);

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
    let foundActiveSubmenu = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems && !foundActiveSubmenu) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({ index });
            foundActiveSubmenu = true;
          }
        });
      }
    });
  }, [location.pathname]);

  useEffect(() => {
    // Calculate heights for all submenus
    const timeoutId = setTimeout(() => {
      navItems.forEach((nav, index) => {
        if (nav.subItems) {
          const key = `main-${index}`;
          if (subMenuRefs.current[key]) {
            setSubMenuHeight((prevHeights) => ({
              ...prevHeights,
              [key]: subMenuRefs.current[key]?.scrollHeight || 0,
            }));
          }
        }
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isExpanded, isHovered, isMobileOpen]);

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
              className={`menu-item group w-full text-left ${
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
                className={`menu-item-icon-size ${
                  openSubmenu?.index === index
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive'
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text flex-1">{nav.name}</span>
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

                  console.log('🔄 Navigating to:', nav.path);
                  
                  if (isMobileOpen) {
                    toggleMobileSidebar();
                  }

                  navigate(nav.path);
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
              className={`transition-all duration-300 ${
                openSubmenu?.index === index ? 'block' : 'hidden'
              }`}
            >
              <ul className="mt-1 space-y-1 ml-6">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        console.log('🔄 Navigating to submenu:', subItem.path);
                        
                        if (isMobileOpen) {
                          toggleMobileSidebar();
                        }

                        navigate(subItem.path);
                      }}
                      className={`menu-dropdown-item w-full text-left flex items-center gap-2 ${
                        isActive(subItem.path)
                          ? 'menu-dropdown-item-active'
                          : 'menu-dropdown-item-inactive'
                      }`}
                    >
                      {subItem.icon && (
                        <span
                          className={`${
                            isActive(subItem.path)
                              ? 'text-slate-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {subItem.icon}
                        </span>
                      )}
                      <span className="flex-1">{subItem.name}</span>
                      <span className="flex items-center gap-1">
                        {subItem.new && (
                          <span
                            className={`${
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
                            className={`${
                              isActive(subItem.path)
                                ? 'menu-dropdown-badge-active'
                                : 'menu-dropdown-badge-inactive'
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </button>
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
    <>

      
      <aside
        className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-slate-800 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
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
          className={`flex ${
            !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-center'
          }`}
        >
          <Link to={isSuperAdmin ? '/dashboard' : '/'}>
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
                    isSuperAdmin ? (
                      'SUPER ADMIN MENU'
                    ) : (
                      'Menu'
                    )
                  ) : (
                    <MdMoreHoriz className="w-4 h-4" />
                  )}
                </h2>
                {navItems.length > 0 ? (
                  renderMenuItems(navItems)
                ) : !isSuperAdmin ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {isExpanded || isHovered || isMobileOpen
                        ? 'No menu permissions assigned. Contact your administrator.'
                        : '⚠️'}
                    </p>
                  </div>
                ) : (
                  renderMenuItems(navItems)
                )}
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
            {isSuperAdmin ? (
              <FontAwesomeIcon
                icon={faSignOutAlt}
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              />
            ) : (
              <MdLogout
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              />
            )}
            {(isExpanded || isHovered || isMobileOpen) && (
              <span>{isLoading ? 'Signing out...' : 'Sign Out'}</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
