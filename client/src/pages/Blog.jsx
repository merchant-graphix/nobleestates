import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { HiOutlineCalendar, HiOutlineUser } from 'react-icons/hi';
import { getBlogPosts } from '../api/blog';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogPosts({ limit: 20 })
      .then(data => setPosts(data.posts))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fallbackPosts = [
    {
      id: 1, slug: 'first-time-home-buyer-guide',
      title: 'First-Time Home Buyer Guide for Malawi',
      excerpt: 'Everything you need to know about purchasing your first property in Malawi, from securing financing to understanding the legal process.',
      author_name: 'Noble Estates Team', created_at: '2024-11-15',
      category: 'Buying Guide', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600',
    },
    {
      id: 2, slug: 'property-prices-across-malawi',
      title: 'Understanding Property Prices Across Malawian Districts',
      excerpt: 'A comprehensive overview of real estate pricing trends in Lilongwe, Blantyre, Mzuzu, and other major cities.',
      author_name: 'Grace Mwangi', created_at: '2024-10-28',
      category: 'Market Trends', image: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=600',
    },
    {
      id: 3, slug: 'tips-selling-property-quickly',
      title: 'Tips for Selling Your Property Quickly',
      excerpt: "Maximize your property's value and attract buyers with these proven staging and pricing strategies.",
      author_name: 'Peter Kamanga', created_at: '2024-10-10',
      category: 'Selling Tips', image: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=600',
    },
    {
      id: 4, slug: 'renting-vs-buying',
      title: "Renting vs. Buying: What's Right for You?",
      excerpt: "Consider the pros and cons of renting versus buying property in Malawi based on your financial situation and lifestyle.",
      author_name: 'Noble Estates Team', created_at: '2024-09-20',
      category: 'Advice', image: 'https://images.unsplash.com/photo-1560520031-4a581fbd37cf?w=600',
    },
  ];

  const displayPosts = posts.length > 0 ? posts : fallbackPosts;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Resources' }]} />
      <h1 className="text-3xl font-bold mb-2">Resources & Guides</h1>
      <p className="text-gray-500 mb-8">Expert advice and insights for buying, selling, and renting property in Malawi.</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-xl" />
              <div className="p-6 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayPosts.map(article => (
            <article key={article.id} className="card group cursor-pointer">
              {article.image && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                  {article.category && (
                    <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-xs font-medium">{article.category}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <HiOutlineCalendar className="w-4 h-4" /> {new Date(article.created_at || article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <h2 className="text-xl font-semibold mb-2 group-hover:text-indigo-600 transition-colors">{article.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed">{article.excerpt}</p>
                <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                  <HiOutlineUser className="w-4 h-4" /> {article.author_name || article.author}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
