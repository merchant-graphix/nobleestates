import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HiOutlineCalendar, HiOutlineUser, HiOutlineArrowLeft } from 'react-icons/hi';
import { getBlogPost } from '../api/blog';
import Breadcrumbs from '../components/Breadcrumbs';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    getBlogPost(slug)
      .then(setPost)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
        <p className="text-gray-500 mb-6">The article you&apos;re looking for doesn&apos;t exist.</p>
        <Link to="/blog" className="btn-primary">Back to Resources</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Helmet>
        <title>{post.title} | Noble Estates</title>
        <meta name="description" content={post.excerpt || post.title} />
      </Helmet>

      <Breadcrumbs items={[{ label: 'Resources', link: '/blog' }, { label: post.title }]} />

      <Link to="/blog" className="inline-flex items-center gap-1 text-indigo-600 hover:underline text-sm mb-6">
        <HiOutlineArrowLeft className="w-4 h-4" /> Back to Resources
      </Link>

      {post.category && (
        <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-medium">{post.category}</span>
      )}

      <h1 className="text-3xl font-bold mt-4 mb-4">{post.title}</h1>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
        <span className="flex items-center gap-1"><HiOutlineCalendar className="w-4 h-4" /> {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        {post.author_name && (
          <span className="flex items-center gap-1"><HiOutlineUser className="w-4 h-4" /> {post.author_name}</span>
        )}
      </div>

      {post.image && (
        <img src={post.image} alt={post.title} className="w-full h-64 object-cover rounded-xl mb-8" />
      )}

      <div className="prose dark:prose-invert max-w-none">
        {post.content.split('\n').map((paragraph, i) => (
          paragraph.trim() ? <p key={i} className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{paragraph}</p> : null
        ))}
      </div>
    </div>
  );
}
