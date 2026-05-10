// src/components/layout/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth.api';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleLogout = async () => {
    try {
      await authApi.logout(refreshToken);
    } catch {
      // ignore
    } finally {
      logout();
      toast.success('Signed out.');
      navigate('/login');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (!q) return;
    navigate(`/products?q=${encodeURIComponent(q)}`);
    setSearchInput('');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 flex-shrink-0">
          <span className="text-2xl font-bold text-scarlet-600">Acocie</span>
          <span className="text-xs text-gray-400 font-normal hidden sm:block">Stores</span>
        </Link>

        {/* Search bar — center */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:flex">
          <div className="flex w-full">
            <input
              type="text"
              placeholder="Search products…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full border border-gray-300 rounded-l px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-scarlet-500 focus:border-scarlet-500 transition-colors"
            />
            <button
              type="submit"
              className="bg-scarlet-600 hover:bg-scarlet-700 text-white px-3 rounded-r border border-scarlet-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 flex-shrink-0">
          <Link to="/products" className="hover:text-scarlet-600 transition-colors">Products</Link>
          {(user?.role === 'vendor' || user?.role === 'admin' || user?.role === 'super_admin') && (
            <Link to="/vendor" className="hover:text-scarlet-600 transition-colors">Vendor</Link>
          )}
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <Link to="/admin" className="hover:text-scarlet-600 transition-colors">Admin</Link>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3 ml-auto flex-shrink-0">
          {user ? (
            <>
              <Link to="/cart" className="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Cart">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </Link>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-scarlet-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-scarlet-100 flex items-center justify-center text-scarlet-700 font-bold text-xs">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-card shadow-lg border border-gray-100 py-1 z-50">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Profile</Link>
                    <Link to="/orders"  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>My Orders</Link>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-scarlet-600 transition-colors">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm py-1.5 px-4 rounded-btn">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
