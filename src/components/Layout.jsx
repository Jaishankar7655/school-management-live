import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  HiOutlineAcademicCap,
  HiOutlineSquares2X2,
  HiOutlineUsers,
  HiOutlineBriefcase,
  HiOutlineBuildingLibrary,
  HiOutlineClipboardDocumentCheck,
  HiOutlineBanknotes,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineMagnifyingGlass,
  HiOutlineBell,
  HiOutlineArrowRightOnRectangle,
  HiOutlineChevronLeft,
} from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */
const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: HiOutlineSquares2X2 },
  { label: 'Students', path: '/students', icon: HiOutlineUsers },
  { label: 'Teachers', path: '/teachers', icon: HiOutlineBriefcase },
  { label: 'Classes', path: '/classes', icon: HiOutlineBuildingLibrary },
  { label: 'Attendance', path: '/attendance', icon: HiOutlineClipboardDocumentCheck },
  { label: 'Fees', path: '/fees', icon: HiOutlineBanknotes },
];

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/students': 'Students',
  '/teachers': 'Teachers',
  '/classes': 'Classes',
  '/attendance': 'Attendance',
  '/fees': 'Fee Management',
};

const SIDEBAR_FULL = 268;
const SIDEBAR_COLLAPSED = 72;
const MOBILE_BP = 768;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BP);

  /* Responsive listener */
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${MOBILE_BP - 1}px)`);
    const handler = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) setMobileOpen(false);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  /* Close mobile sidebar on navigation */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const sidebarWidth = isMobile ? SIDEBAR_FULL : collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_FULL;
  const showLabels = isMobile || !collapsed;

  const pageTitle =
    Object.entries(PAGE_TITLES).find(([prefix]) => location.pathname.startsWith(prefix))?.[1] ?? 'EduManager';

  /* -------- helpers -------- */
  const initials = user
    ? (user.name || user.username || 'U')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  /* ---------------------------------------------------------------- */
  /*  Sidebar                                                          */
  /* ---------------------------------------------------------------- */
  const sidebar = (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: sidebarWidth,
        backgroundColor: '#1B2A4A',
        color: '#cbd5e1',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1100,
        transition: 'width .25s cubic-bezier(.4,0,.2,1)',
        overflowX: 'hidden',
      }}
    >
      {/* Brand */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: showLabels ? '24px 22px 20px' : '24px 0 20px',
          justifyContent: showLabels ? 'flex-start' : 'center',
          borderBottom: '1px solid rgba(255,255,255,.08)',
          flexShrink: 0,
        }}
      >
        <HiOutlineAcademicCap size={28} color="#E8913A" style={{ flexShrink: 0 }} />
        {showLabels && (
          <span
            style={{
              fontSize: 19,
              fontWeight: 700,
              color: '#fff',
              whiteSpace: 'nowrap',
              letterSpacing: '-0.02em',
            }}
          >
            EduManager
          </span>
        )}

        {/* Mobile close */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <HiOutlineXMark size={22} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: showLabels ? '11px 22px' : '11px 0',
              justifyContent: showLabels ? 'flex-start' : 'center',
              margin: '2px 10px',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#fff' : '#94a3b8',
              backgroundColor: isActive ? 'rgba(232,145,58,.12)' : 'transparent',
              borderLeft: isActive ? '3px solid #E8913A' : '3px solid transparent',
              transition: 'all .15s',
              whiteSpace: 'nowrap',
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,.05)';
                e.currentTarget.style.color = '#e2e8f0';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#94a3b8';
              }
            }}
          >
            <Icon size={20} style={{ flexShrink: 0 }} />
            {showLabels && label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section – user + collapse toggle */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', flexShrink: 0 }}>
        {/* User info */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: showLabels ? '14px 22px' : '14px 0',
              justifyContent: showLabels ? 'flex-start' : 'center',
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                backgroundColor: '#E8913A',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>

            {showLabels && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#e2e8f0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user.name || user.username || 'User'}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>
                  {user.role || 'Admin'}
                </p>
              </div>
            )}

            {showLabels && (
              <button
                onClick={logout}
                title="Logout"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  padding: 4,
                  borderRadius: 6,
                  transition: 'color .15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                <HiOutlineArrowRightOnRectangle size={18} />
              </button>
            )}
          </div>
        )}

        {/* Collapse toggle (desktop only) */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 0',
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: 12,
              cursor: 'pointer',
              transition: 'color .15s',
              borderTop: '1px solid rgba(255,255,255,.06)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#cbd5e1')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
          >
            <HiOutlineChevronLeft
              size={16}
              style={{
                transition: 'transform .25s',
                transform: collapsed ? 'rotate(180deg)' : 'none',
              }}
            />
            {showLabels && <span>Collapse</span>}
          </button>
        )}
      </div>
    </aside>
  );

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F5F0' }}>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,.4)',
            zIndex: 1050,
          }}
        />
      )}

      {/* Sidebar (always rendered on desktop, conditional on mobile) */}
      {(!isMobile || mobileOpen) && sidebar}

      {/* Main area */}
      <div
        style={{
          marginLeft: isMobile ? 0 : sidebarWidth,
          transition: 'margin-left .25s cubic-bezier(.4,0,.2,1)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 900,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '0 28px',
            height: 62,
            backgroundColor: '#fff',
            borderBottom: '1px solid #e5e7eb',
            boxShadow: '0 1px 2px rgba(0,0,0,.03)',
          }}
        >
          {/* Mobile hamburger */}
          {isMobile && (
            <button
              onClick={() => setMobileOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 38,
                height: 38,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: '#1B2A4A',
                borderRadius: 8,
              }}
            >
              <HiOutlineBars3 size={22} />
            </button>
          )}

          {/* Page title */}
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1B2A4A', whiteSpace: 'nowrap' }}>
            {pageTitle}
          </h1>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Search (decorative) */}
          <div
            style={{
              position: 'relative',
              display: isMobile ? 'none' : 'block',
              width: 240,
            }}
          >
            <HiOutlineMagnifyingGlass
              size={16}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
              }}
            />
            <input
              type="text"
              placeholder="Search…"
              readOnly
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                fontSize: 13,
                fontFamily: 'inherit',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                outline: 'none',
                backgroundColor: '#f9fafb',
                color: '#9ca3af',
                cursor: 'default',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Notification bell */}
          <button
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              border: 'none',
              background: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              color: '#6b7280',
              transition: 'background .15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <HiOutlineBell size={20} />
            <span
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                border: '2px solid #fff',
              }}
            />
          </button>

          {/* User avatar */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#1B2A4A',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
              cursor: 'default',
            }}
          >
            {initials}
          </div>
        </header>

        {/* Main content */}
        <main style={{ flex: 1, padding: 28 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
