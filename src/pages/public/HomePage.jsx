// src/pages/public/HomePage.jsx
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-scarlet-600 to-scarlet-800 text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Shop Smart. Shop Local.
          </h1>
          <p className="text-scarlet-100 text-lg mb-8 max-w-xl mx-auto">
            Discover thousands of products from local vendors, delivered to your door.
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-scarlet-700 font-semibold px-8 py-3 rounded-btn hover:bg-scarlet-50 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Phase placeholder */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">
        <p className="text-sm">
          Featured products &amp; categories — coming in Phase 2
        </p>
      </section>
    </main>
  );
}
