import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineHome, HiOutlineShieldCheck, HiOutlineChartBar, HiOutlineUserGroup, HiOutlineStar } from 'react-icons/hi';
import { Helmet } from 'react-helmet-async';
import { getProperties, getPropertyStats } from '../api/properties';
import PropertyCard from '../components/PropertyCard';

const testimonials = [
  {
    name: 'Chisomo Banda',
    role: 'Home Buyer',
    text: 'Noble Estates made finding my first home in Lilongwe incredibly easy. The agents were professional and the whole process was transparent.',
    rating: 5,
  },
  {
    name: 'Thandizo Phiri',
    role: 'Property Investor',
    text: 'I have bought multiple properties through Noble Estates. Their market knowledge and honest approach keep me coming back.',
    rating: 5,
  },
  {
    name: 'Felix Msowoya',
    role: 'Tenant',
    text: 'Found a beautiful apartment in Blantyre within days. The filtering system saved me so much time compared to other platforms.',
    rating: 5,
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [stats, setStats] = useState({ properties: 500, agents: 50, clients: 1200 });
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getProperties({ limit: 6, sort: 'newest' }).then(data => setFeatured(data.properties)).catch(() => {});
    getPropertyStats().then(data => setStats(data)).catch(() => {});
  }, []);

  return (
    <div>
      <Helmet>
        <title>Noble Estates - Find Your Dream Home in Malawi</title>
        <meta name="description" content="Malawi's trusted real estate marketplace. Browse properties for sale and rent across all districts." />
      </Helmet>

      <section className="relative bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight">
            Find Your <span className="text-yellow-300">Dream Home</span> in Malawi
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Browse properties for sale and rent across all districts of Malawi. Your perfect home is just a click away.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); navigate(`/listings?search=${encodeURIComponent(search)}`); }}
            className="max-w-2xl mx-auto flex gap-3"
          >
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by district, town, or keyword..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 text-lg focus:ring-2 focus:ring-yellow-300 outline-none"
              />
            </div>
            <button type="submit" className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-colors">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiOutlineHome className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nationwide Listings</h3>
            <p className="text-gray-500">Properties across all 28 districts of Malawi — from cities to rural areas.</p>
          </div>
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiOutlineShieldCheck className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Trusted Agents</h3>
            <p className="text-gray-500">Verified Malawian real estate professionals ready to help you.</p>
          </div>
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiOutlineChartBar className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fair Pricing</h3>
            <p className="text-gray-500">Transparent pricing in Malawian Kwacha (MK) with current market rates.</p>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Properties</h2>
            <Link to="/listings" className="text-indigo-600 hover:text-indigo-700 font-semibold">View All &rarr;</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        </div>
      </section>

      <section className="bg-indigo-50 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Trusted by Thousands Across Malawi</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-indigo-600 mb-1">{stats.properties.toLocaleString()}+</p>
              <p className="text-gray-500 text-sm">Properties Listed</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-indigo-600 mb-1">{stats.clients.toLocaleString()}+</p>
              <p className="text-gray-500 text-sm">Happy Clients</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-indigo-600 mb-1">{stats.agents}+</p>
              <p className="text-gray-500 text-sm">Verified Agents</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-indigo-600 mb-1">28</p>
              <p className="text-gray-500 text-sm">Districts Covered</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <HiOutlineStar key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-indigo-50 dark:bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Dream Home?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">Sign up today and start browsing properties, saving favorites, and connecting with agents across Malawi.</p>
          <Link to="/register" className="btn-primary text-lg px-10 py-3">Get Started</Link>
        </div>
      </section>
    </div>
  );
}
