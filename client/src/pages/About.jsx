import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { HiOutlineShieldCheck, HiOutlineUsers, HiOutlineGlobe } from 'react-icons/hi';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Helmet>
        <title>About Us | Noble Estates</title>
        <meta name="description" content="Learn about Noble Estates — Malawi's trusted real estate marketplace connecting buyers, sellers, and agents." />
      </Helmet>
      <Breadcrumbs items={[{ label: 'About' }]} />

      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-3xl font-bold mb-4">About Noble Estates</h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          Noble Estates is Malawi&apos;s premier online real estate marketplace, connecting property buyers, sellers,
          and agents across all 28 districts. Our mission is to make property transactions transparent, accessible,
          and efficient for every Malawian.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiOutlineShieldCheck className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Trust & Transparency</h3>
          <p className="text-gray-500">Every listing is verified, every price is real, and every agent is vetted.</p>
        </div>
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiOutlineUsers className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">People First</h3>
          <p className="text-gray-500">We prioritize the needs of Malawian families finding their perfect homes.</p>
        </div>
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiOutlineGlobe className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Nationwide Coverage</h3>
          <p className="text-gray-500">From Lilongwe to Blantyre, Mzuzu to Mangochi — we cover all of Malawi.</p>
        </div>
      </div>

      <div className="bg-indigo-50 dark:bg-gray-800 rounded-2xl p-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Find Your Dream Home?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Browse our listings and discover the perfect property for you and your family.</p>
        <Link to="/listings" className="btn-primary text-lg px-8 py-3">Browse Listings</Link>
      </div>
    </div>
  );
}
