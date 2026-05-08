// src/components/auth/AuthCard.jsx
/** Centered card wrapper used by all auth pages */
export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-scarlet-600 tracking-tight">Acocie Stores</h1>
          <p className="text-sm text-gray-500 mt-1">Shop Smart. Shop Local.</p>
        </div>
        <div className="card p-8">
          {title && <h2 className="text-xl font-semibold text-gray-900 mb-1">{title}</h2>}
          {subtitle && <p className="text-sm text-gray-500 mb-6">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
