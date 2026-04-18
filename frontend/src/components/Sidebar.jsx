import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Activity, Clock, LayoutDashboard } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/scan', name: 'New Scan', icon: Activity },
    { path: '/history', name: 'Scan History', icon: Clock },
  ];

  return (
    <aside className="w-64 glass-panel flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-xl font-bold tracking-wider text-white">PRESCAN</h1>
          <p className="text-xs text-text-muted">Pre-deployment scanner</p>
        </div>
      </div>
      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-text-muted hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10 text-center text-xs text-text-muted">
        v1.0.0 &copy; 2026
      </div>
    </aside>
  );
};

export default Sidebar;
