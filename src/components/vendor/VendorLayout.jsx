// src/components/vendor/VendorLayout.jsx
import { NavLink, Outlet } from 'react-router-dom';

const NAV = [
  { to: '/vendor', label: 'Dashboard', end: true },
  { to: '/vendor/orders', label: 'Orders' },
];

export default function VendorLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
      <aside className="md:w-52 flex-shrink-0">
        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3 px-3">Seller Center</p>
        <nav className="flex md:flex-col gap-1 overflow-x-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-3 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive ? 'bg-scarlet-50 text-scarlet-700' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
