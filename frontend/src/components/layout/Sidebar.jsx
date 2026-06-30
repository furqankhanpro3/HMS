import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  Building2,
  UtensilsCrossed,
  CalendarOff,
  MessageSquare,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Building2Icon,
  // BanknoteArrowUp,
  BanknoteIcon,
  Receipt,
  ShieldCheck,
  Settings,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useHostel } from "@/context/useHostel";

const Sidebar = ({ isMobile = false, mobileOpen = false, onCloseMobile = () => {} }) => {
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();
  const {
    isSidebarCollapsed: isCollapsed,
    setIsSidebarCollapsed: setIsCollapsed,
    leaveApplications,
    complaints,
  } = useHostel();

  const isSuperAdmin = user?.role === "superadmin";
  const canView = (module) => isSuperAdmin || hasPermission(module, "view");

  // Auto-close mobile sidebar on route change
  React.useEffect(() => {
    if (isMobile && mobileOpen) {
      onCloseMobile();
    }
  }, [location.pathname]);

  // On mobile, return nothing when sidebar is closed
  if (isMobile && !mobileOpen) return null;

  // Calculate pending counts
  const pendingLeaves =
    leaveApplications?.filter((l) => l.status === "Pending").length || 0;
  const openComplaints =
    complaints?.filter(
      (c) => c.status === "Pending" || c.status === "In Progress",
    ).length || 0;

  const mainNavigation = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      module: "dashboard",
      show: true, // Always show for all admin users
    },
    {
      name: "Admissions",
      href: "/admin/admissions",
      icon: UserPlus,
      module: "admissions",
      show: canView("admissions"),
    },
    {
      name: "Hostels & Rooms",
      href: "/admin/hostels",
      icon: Building2,
      module: "hostels",
      show: canView("hostels"),
    },
  ];

  const operationsNavigation = [
    {
      name: "Inventory",
      href: "/admin/inventory",
      icon: Building2Icon,
      module: "inventory",
      show: canView("inventory"),
    },
    {
      name: "Mess Management",
      href: "/admin/mess",
      icon: UtensilsCrossed,
      module: "mess",
      show: canView("mess"),
    },
    {
      name: "Student Tracking",
      href: "/admin/tracking",
      icon: Users,
      module: "admissions",
      show: canView("admissions"),
    },
    {
      name: "Complaints",
      href: "/admin/complaints",
      icon: MessageSquare,
      module: "complaints",
      show: canView("complaints"),
      badge: openComplaints,
      badgeType: "secondary",
    },
  ];
  const finance = [
    {
      name: "Fee Management",
      href: "/admin/fee",
      icon: DollarSign,
      module: "fee",
      show: canView("fee"),
    },
    {
      name: "Income",
      href: "/admin/income",
      icon: BanknoteIcon,
      module: "finance",
      show: canView("finance"),
    },
    {
      name: "Expense",
      href: "/admin/expense",
      icon: Receipt,
      module: "finance",
      show: canView("finance"),
    },
  ];

  const managementNavigation = [
    {
      name: "Admins",
      href: "/admin/admins",
      icon: ShieldCheck,
      module: "admins",
      show: canView("admins"),
    },
    {
      name: "Staff Management",
      href: "/admin/staff",
      icon: Briefcase,
      module: "staff",
      show: canView("staff"),
    },
    {
      name: "My Account",
      href: "/admin/profile",
      icon: Settings,
      show: !!user,
    },
  ];

  const getUserInitial = () => {
    const name = user?.name || "Admin";
    return name.charAt(0).toUpperCase();
  };

  if (isCollapsed && !isMobile) {
    return (
      <aside
        className="fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-all duration-200 ease-in-out"
        style={{
          width: "60px",
          backgroundColor: "#1E1E1E",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Toggle Button - hidden on mobile */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-1/2 -translate-y-1/2 z-50 items-center justify-center transition-none hidden md:flex"
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            border: "0.5px solid #E2E8F0",
            cursor: "pointer",
            right: "-12px",
          }}
        >
          <ChevronRight
            style={{ width: "12px", height: "12px", color: "#1E1E1E" }}
          />
        </button>

        {/* Logo Only */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            padding: "14px 0",
            borderBottom: "0.5px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: "30px",
              height: "30px",
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
            }}
          >
            <Building2
              style={{ width: "14px", height: "14px", color: "#1E1E1E" }}
            />
          </div>
        </div>

        {/* Navigation Icons Only */}
        <nav
          className="flex flex-col flex-1 overflow-y-auto"
          style={{
            padding: "16px 0",
            scrollbarWidth: "none",
          }}
        >
          <style>
            {`
              nav::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>

          {/* Main Navigation Icons */}
          {mainNavigation
            .filter((item) => item.show)
            .map((item) => {
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="relative flex items-center justify-center transition-all"
                  style={{
                    width: "40px",
                    height: "36px",
                    margin: "0 auto 1px",
                    borderRadius: "6px",
                    backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                    color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.40)",
                    textDecoration: "none",
                    transitionProperty: "background-color, color",
                    transitionDuration: "0.15s",
                    transitionTimingFunction: "ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255, 255, 255, 0.04)";
                      e.currentTarget.style.color = "#FFFFFF";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "rgba(255, 255, 255, 0.40)";
                    }
                  }}
                >
                  <item.icon
                    style={{
                      width: "14px",
                      height: "14px",
                      flexShrink: 0,
                      strokeWidth: 1.5,
                    }}
                  />
                </Link>
              );
            })}

          {/* Divider */}
          <div
            style={{
              height: "0.5px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              margin: "12px 10px",
            }}
          />

          {/* Operations Navigation Icons */}
          {operationsNavigation
            .filter((item) => item.show)
            .map((item) => {
              const isActive = location.pathname === item.href;
              const hasBadge = item.badge > 0;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="relative flex items-center justify-center transition-all"
                  style={{
                    width: "40px",
                    height: "36px",
                    margin: "0 auto 1px",
                    borderRadius: "6px",
                    backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                    color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.40)",
                    textDecoration: "none",
                    transitionProperty: "background-color, color",
                    transitionDuration: "0.15s",
                    transitionTimingFunction: "ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255, 255, 255, 0.04)";
                      e.currentTarget.style.color = "#FFFFFF";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "rgba(255, 255, 255, 0.40)";
                    }
                  }}
                >
                  <item.icon
                    style={{
                      width: "14px",
                      height: "14px",
                      flexShrink: 0,
                      strokeWidth: 1.5,
                    }}
                  />
                  {/* Badge Dot */}
                  {hasBadge && (
                    <div
                      style={{
                        position: "absolute",
                        top: "6px",
                        right: "6px",
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        backgroundColor:
                          item.badgeType === "urgent"
                            ? "#EF4444"
                            : "rgba(255, 255, 255, 0.3)",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          {/* Finance Operation Navigation Icons */}
          {finance
            .filter((item) => item.show)
            .map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="relative flex items-center justify-center transition-all"
                  style={{
                    width: "40px",
                    height: "36px",
                    margin: "0 auto 1px",
                    borderRadius: "6px",
                    backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                    color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.40)",
                    textDecoration: "none",
                    transitionProperty: "background-color, color",
                    transitionDuration: "0.15s",
                    transitionTimingFunction: "ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255, 255, 255, 0.04)";
                      e.currentTarget.style.color = "#FFFFFF";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "rgba(255, 255, 255, 0.40)";
                    }
                  }}
                >
                  <item.icon
                    style={{
                      width: "14px",
                      height: "14px",
                      flexShrink: 0,
                      strokeWidth: 1.5,
                    }}
                  />
                </Link>
              );
            })}
          {/* Management Navigation Icons */}
          {managementNavigation
            .filter((item) => item.show)
            .map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="relative flex items-center justify-center transition-all"
                  style={{
                    width: "40px",
                    height: "36px",
                    margin: "0 auto 1px",
                    borderRadius: "6px",
                    backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                    color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.40)",
                    textDecoration: "none",
                    transitionProperty: "background-color, color",
                    transitionDuration: "0.15s",
                    transitionTimingFunction: "ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255, 255, 255, 0.04)";
                      e.currentTarget.style.color = "#FFFFFF";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "rgba(255, 255, 255, 0.40)";
                    }
                  }}
                >
                  <item.icon
                    style={{
                      width: "14px",
                      height: "14px",
                      flexShrink: 0,
                      strokeWidth: 1.5,
                    }}
                  />
                </Link>
              );
            })}
        </nav>

        {/* Footer - Avatar Only */}
        <div
          className="shrink-0 flex items-center justify-center"
          style={{
            padding: "12px 0",
            borderTop: "0.5px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div className="relative shrink-0">
            <div
              className="flex items-center justify-center"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: "#FFFFFF",
                color: "#1E1E1E",
                fontSize: "11px",
                fontWeight: 400,
              }}
            >
              {getUserInitial()}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "0",
                right: "0",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#22C55E",
                border: "2px solid #1E1E1E",
              }}
            />
          </div>
        </div>
      </aside>
    );
  }

  // On mobile, render as overlay drawer
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={onCloseMobile}
        />
        {/* Drawer */}
        <aside
          className="fixed left-0 top-0 bottom-0 z-50 flex flex-col"
          style={{
            width: "220px",
            backgroundColor: "#1E1E1E",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          {/* Close button for mobile */}
          <button
            onClick={onCloseMobile}
            className="absolute top-3 right-3 z-50 flex items-center justify-center"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: 'none',
              cursor: 'pointer',
              color: '#FFFFFF',
            }}
          >
            <ChevronLeft style={{ width: '14px', height: '14px' }} />
          </button>

          {/* Brand Section */}
          <div
            className="flex items-center shrink-0"
            style={{
              padding: "12px",
              borderBottom: "0.5px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: "28px",
                height: "28px",
                backgroundColor: "#FFFFFF",
                borderRadius: "7px",
                marginRight: "8px",
              }}
            >
              <Building2
                style={{ width: "13px", height: "13px", color: "#1E1E1E" }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  lineHeight: "1.2",
                }}
              >
                HMS
              </div>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 300,
                  color: "rgba(255, 255, 255, 0.30)",
                  lineHeight: "1.3",
                }}
              >
                Hostel Management
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav
            className="flex flex-col flex-1 overflow-y-auto"
            style={{
              padding: "0 8px",
              scrollbarWidth: "none",
            }}
          >
            <style>
              {`
                nav::-webkit-scrollbar {
                  display: none;
                }
              `}
            </style>

            {/* MAIN Section */}
            <div
              style={{
                fontSize: "8px",
                fontWeight: 400,
                color: "rgba(255, 255, 255, 0.20)",
                letterSpacing: "0.12em",
                padding: "10px 4px 4px",
                textTransform: "uppercase",
              }}
            >
              MAIN
            </div>

            {mainNavigation
              .filter((item) => item.show)
              .map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onCloseMobile}
                    className="relative flex items-center transition-all"
                    style={{
                      height: "34px",
                      padding: "0 8px",
                      marginBottom: "1px",
                      borderRadius: "6px",
                      backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                      color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.40)",
                      fontSize: "11px",
                      fontWeight: isActive ? 400 : 300,
                      textDecoration: "none",
                      gap: "7px",
                      transitionProperty: "background-color, color",
                      transitionDuration: "0.15s",
                      transitionTimingFunction: "ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor =
                          "rgba(255, 255, 255, 0.04)";
                        e.currentTarget.style.color = "#FFFFFF";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "rgba(255, 255, 255, 0.40)";
                      }
                    }}
                  >
                    <item.icon
                      style={{
                        width: "13px",
                        height: "13px",
                        flexShrink: 0,
                        strokeWidth: 1.5,
                      }}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

            {/* FINANCE Section */}
            <div
              style={{
                fontSize: "8px",
                fontWeight: 400,
                color: "rgba(255, 255, 255, 0.20)",
                letterSpacing: "0.12em",
                padding: "10px 4px 4px",
                textTransform: "uppercase",
              }}
            >
              FINANCE
            </div>

            {finance
              .filter((item) => item.show)
              .map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onCloseMobile}
                    className="relative flex items-center transition-all"
                    style={{
                      height: "34px",
                      padding: "0 8px",
                      marginBottom: "1px",
                      borderRadius: "6px",
                      backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                      color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.40)",
                      fontSize: "11px",
                      fontWeight: isActive ? 400 : 300,
                      textDecoration: "none",
                      gap: "7px",
                      transitionProperty: "background-color, color",
                      transitionDuration: "0.15s",
                      transitionTimingFunction: "ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor =
                          "rgba(255, 255, 255, 0.04)";
                        e.currentTarget.style.color = "#FFFFFF";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "rgba(255, 255, 255, 0.40)";
                      }
                    }}
                  >
                    <item.icon
                      style={{
                        width: "13px",
                        height: "13px",
                        flexShrink: 0,
                        strokeWidth: 1.5,
                      }}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

            {/* OPERATIONS Section */}
            <div
              style={{
                fontSize: "8px",
                fontWeight: 400,
                color: "rgba(255, 255, 255, 0.20)",
                letterSpacing: "0.12em",
                padding: "10px 4px 4px",
                textTransform: "uppercase",
              }}
            >
              OPERATIONS
            </div>

            {operationsNavigation
              .filter((item) => item.show)
              .map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onCloseMobile}
                    className="relative flex items-center justify-between transition-all"
                    style={{
                      height: "34px",
                      padding: "0 8px",
                      marginBottom: "1px",
                      borderRadius: "6px",
                      backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                      color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.40)",
                      fontSize: "11px",
                      fontWeight: isActive ? 400 : 300,
                      textDecoration: "none",
                      transitionProperty: "background-color, color",
                      transitionDuration: "0.15s",
                      transitionTimingFunction: "ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor =
                          "rgba(255, 255, 255, 0.04)";
                        e.currentTarget.style.color = "#FFFFFF";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "rgba(255, 255, 255, 0.40)";
                      }
                    }}
                  >
                    <div className="flex items-center" style={{ gap: "7px" }}>
                      <item.icon
                        style={{
                          width: "13px",
                          height: "13px",
                          flexShrink: 0,
                          strokeWidth: 1.5,
                        }}
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.badge > 0 && (
                      <div
                        style={{
                          fontSize: "8px",
                          fontWeight: 400,
                          padding: "2px 5px",
                          borderRadius: "10px",
                          backgroundColor:
                            item.badgeType === "urgent"
                              ? "#EF4444"
                              : "rgba(255, 255, 255, 0.15)",
                          color: "#FFFFFF",
                          lineHeight: "1",
                        }}
                      >
                        {item.badge}
                      </div>
                    )}
                  </Link>
                );
              })}

            {/* MANAGEMENT Section */}
            <div
              style={{
                fontSize: "8px",
                fontWeight: 400,
                color: "rgba(255, 255, 255, 0.20)",
                letterSpacing: "0.12em",
                padding: "10px 4px 4px",
                textTransform: "uppercase",
              }}
            >
              MANAGEMENT
            </div>

            {managementNavigation
              .filter((item) => item.show)
              .map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onCloseMobile}
                    className="relative flex items-center transition-all"
                    style={{
                      height: "34px",
                      padding: "0 8px",
                      marginBottom: "1px",
                      borderRadius: "6px",
                      backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                      color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.40)",
                      fontSize: "11px",
                      fontWeight: isActive ? 400 : 300,
                      textDecoration: "none",
                      gap: "7px",
                      transitionProperty: "background-color, color",
                      transitionDuration: "0.15s",
                      transitionTimingFunction: "ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor =
                          "rgba(255, 255, 255, 0.04)";
                        e.currentTarget.style.color = "#FFFFFF";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "rgba(255, 255, 255, 0.40)";
                      }
                    }}
                  >
                    <item.icon
                      style={{
                        width: "13px",
                        height: "13px",
                        flexShrink: 0,
                        strokeWidth: 1.5,
                      }}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}


          </nav>

          {/* Footer Section */}
          <div
            className="shrink-0"
            style={{
              padding: "12px",
              borderTop: "0.5px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            {/* User Info Row */}
            <div
              className="flex items-center"
              style={{
                marginBottom: "8px",
                gap: "8px",
              }}
            >
              <div className="relative shrink-0">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: "#FFFFFF",
                    color: "#1E1E1E",
                    fontSize: "11px",
                    fontWeight: 400,
                  }}
                >
                  {getUserInitial()}
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    right: "0",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#22C55E",
                    border: "2px solid #1E1E1E",
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 400,
                    color: "#FFFFFF",
                    lineHeight: "1.3",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.name || "Admin User"}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 300,
                    color: "rgba(255, 255, 255, 0.30)",
                    lineHeight: "1.3",
                  }}
                >
                  {user?.role === "superadmin"
                    ? "Super Admin"
                    : user?.role === "admin"
                      ? "Admin"
                      : "User"}
                </div>
              </div>
            </div>

            {/* Sign Out Row */}
            <button
              onClick={() => { logout(); onCloseMobile(); }}
              className="flex items-center w-full transition-all"
              style={{
                padding: "8px 0 8px 8px",
                borderRadius: "6px",
                backgroundColor: "transparent",
                border: "none",
                color: "rgba(255, 255, 255, 0.28)",
                fontSize: "11px",
                fontWeight: 300,
                cursor: "pointer",
                gap: "8px",
                transitionProperty: "color",
                transitionDuration: "0.15s",
                transitionTimingFunction: "ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#F87171";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.28)";
              }}
            >
              <LogOut style={{ width: "13px", height: "13px", strokeWidth: 1.5 }} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>
      </>
    );
  }

  // Desktop expanded sidebar
  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-all duration-200 ease-in-out"
      style={{
        width: "180px",
        backgroundColor: "#1E1E1E",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Collapse Toggle Button - hidden on mobile */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-1/2 -translate-y-1/2 z-50 items-center justify-center transition-none hidden md:flex"
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          backgroundColor: "#FFFFFF",
          border: "0.5px solid #E2E8F0",
          cursor: "pointer",
          right: "-12px",
        }}
      >
        <ChevronLeft
          style={{ width: "12px", height: "12px", color: "#1E1E1E" }}
        />
      </button>

      {/* Brand Section */}
      <div className="flex items-center shrink-0" style={{ padding: "12px", borderBottom: "0.5px solid rgba(255, 255, 255, 0.06)" }}>
        <div className="flex items-center justify-center shrink-0" style={{ width: "28px", height: "28px", backgroundColor: "#FFFFFF", borderRadius: "7px", marginRight: "8px" }}>
          <Building2 style={{ width: "13px", height: "13px", color: "#1E1E1E" }} />
        </div>
        <div>
          <div style={{ fontSize: "12px", fontWeight: 400, color: "#FFFFFF", lineHeight: "1.2" }}>HMS</div>
          <div style={{ fontSize: "9px", fontWeight: 300, color: "rgba(255, 255, 255, 0.30)", lineHeight: "1.3" }}>Hostel Management</div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col flex-1 overflow-y-auto" style={{ padding: "0 8px", scrollbarWidth: "none" }}>
        <style>{`nav::-webkit-scrollbar { display: none; }`}</style>

        {/* MAIN */}
        <div style={{ fontSize: "8px", fontWeight: 400, color: "rgba(255, 255, 255, 0.20)", letterSpacing: "0.12em", padding: "10px 4px 4px", textTransform: "uppercase" }}>MAIN</div>
        {mainNavigation.filter((item) => item.show).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.name} to={item.href} className="relative flex items-center transition-all" style={{ height: "34px", padding: "0 8px", marginBottom: "1px", borderRadius: "6px", backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent", color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.40)", fontSize: "11px", fontWeight: isActive ? 400 : 300, textDecoration: "none", gap: "7px" }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)"; e.currentTarget.style.color = "#FFFFFF"; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "rgba(255, 255, 255, 0.40)"; } }}
            ><item.icon style={{ width: "13px", height: "13px", flexShrink: 0, strokeWidth: 1.5 }} /><span>{item.name}</span></Link>
          );
        })}

        {/* FINANCE */}
        <div style={{ fontSize: "8px", fontWeight: 400, color: "rgba(255, 255, 255, 0.20)", letterSpacing: "0.12em", padding: "10px 4px 4px", textTransform: "uppercase" }}>FINANCE</div>
        {finance.filter((item) => item.show).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.name} to={item.href} className="relative flex items-center transition-all" style={{ height: "34px", padding: "0 8px", marginBottom: "1px", borderRadius: "6px", backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent", color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.40)", fontSize: "11px", fontWeight: isActive ? 400 : 300, textDecoration: "none", gap: "7px" }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)"; e.currentTarget.style.color = "#FFFFFF"; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "rgba(255, 255, 255, 0.40)"; } }}
            ><item.icon style={{ width: "13px", height: "13px", flexShrink: 0, strokeWidth: 1.5 }} /><span>{item.name}</span></Link>
          );
        })}

        {/* OPERATIONS */}
        <div style={{ fontSize: "8px", fontWeight: 400, color: "rgba(255, 255, 255, 0.20)", letterSpacing: "0.12em", padding: "10px 4px 4px", textTransform: "uppercase" }}>OPERATIONS</div>
        {operationsNavigation.filter((item) => item.show).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.name} to={item.href} className="relative flex items-center justify-between transition-all" style={{ height: "34px", padding: "0 8px", marginBottom: "1px", borderRadius: "6px", backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent", color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.40)", fontSize: "11px", fontWeight: isActive ? 400 : 300, textDecoration: "none" }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)"; e.currentTarget.style.color = "#FFFFFF"; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "rgba(255, 255, 255, 0.40)"; } }}
            >
              <div className="flex items-center" style={{ gap: "7px" }}><item.icon style={{ width: "13px", height: "13px", flexShrink: 0, strokeWidth: 1.5 }} /><span>{item.name}</span></div>
              {item.badge > 0 && <div style={{ fontSize: "8px", fontWeight: 400, padding: "2px 5px", borderRadius: "10px", backgroundColor: item.badgeType === "urgent" ? "#EF4444" : "rgba(255, 255, 255, 0.15)", color: "#FFFFFF", lineHeight: "1" }}>{item.badge}</div>}
            </Link>
          );
        })}

        {/* MANAGEMENT */}
        <div style={{ fontSize: "8px", fontWeight: 400, color: "rgba(255, 255, 255, 0.20)", letterSpacing: "0.12em", padding: "10px 4px 4px", textTransform: "uppercase" }}>MANAGEMENT</div>
        {managementNavigation.filter((item) => item.show).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.name} to={item.href} className="relative flex items-center transition-all" style={{ height: "34px", padding: "0 8px", marginBottom: "1px", borderRadius: "6px", backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent", color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.40)", fontSize: "11px", fontWeight: isActive ? 400 : 300, textDecoration: "none", gap: "7px" }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)"; e.currentTarget.style.color = "#FFFFFF"; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "rgba(255, 255, 255, 0.40)"; } }}
            ><item.icon style={{ width: "13px", height: "13px", flexShrink: 0, strokeWidth: 1.5 }} /><span>{item.name}</span></Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="shrink-0" style={{ padding: "12px", borderTop: "0.5px solid rgba(255, 255, 255, 0.06)" }}>
        <div className="flex items-center" style={{ marginBottom: "8px", gap: "8px" }}>
          <div className="relative shrink-0">
            <div className="flex items-center justify-center" style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#FFFFFF", color: "#1E1E1E", fontSize: "11px", fontWeight: 400 }}>{getUserInitial()}</div>
            <div style={{ position: "absolute", bottom: "0", right: "0", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#22C55E", border: "2px solid #1E1E1E" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "11px", fontWeight: 400, color: "#FFFFFF", lineHeight: "1.3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || "Admin User"}</div>
            <div style={{ fontSize: "10px", fontWeight: 300, color: "rgba(255, 255, 255, 0.30)", lineHeight: "1.3" }}>{user?.role === "superadmin" ? "Super Admin" : user?.role === "admin" ? "Admin" : "User"}</div>
          </div>
        </div>
        <button onClick={logout} className="flex items-center w-full transition-all" style={{ padding: "8px 0 8px 8px", borderRadius: "6px", backgroundColor: "transparent", border: "none", color: "rgba(255, 255, 255, 0.28)", fontSize: "11px", fontWeight: 300, cursor: "pointer", gap: "8px" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#F87171"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255, 255, 255, 0.28)"; }}
        ><LogOut style={{ width: "13px", height: "13px", strokeWidth: 1.5 }} /><span>Sign Out</span></button>
      </div>
    </aside>
  );
};

export default Sidebar;