import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HiOutlineHome, HiOutlineEye, HiOutlineCurrencyDollar, HiOutlinePlus } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { getProperties, deleteProperty } from '../api/properties';
import { formatMK } from '../utils';
import Breadcrumbs from '../components/Breadcrumbs';
import toast from 'react-hot-toast';

export default function AgentDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProperties({ limit: 50 })
      .then(data => setProperties(data.properties.filter(p => p.user_id === user?.id)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this property?')) return;
    try {
      await deleteProperty(id);
      setProperties(prev => prev.filter(p => p.id !== id));
      toast.success('Property deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const totalViews = properties.reduce((sum, p) => sum + (p.views_count || 0), 0);
  const activeCount = properties.filter(p => p.status === 'active').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Helmet><title>Agent Dashboard | Noble Estates</title></Helmet>
      <Breadcrumbs items={[{ label: 'Agent Dashboard' }]} />

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Agent Dashboard</h1>
        <Link to="/admin" className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-5 h-5" /> New Property
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 text-center">
          <HiOutlineHome className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
          <p className="text-3xl font-bold">{properties.length}</p>
          <p className="text-gray-500 text-sm">Total Properties</p>
        </div>
        <div className="card p-6 text-center">
          <HiOutlineEye className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
          <p className="text-3xl font-bold">{totalViews.toLocaleString()}</p>
          <p className="text-gray-500 text-sm">Total Views</p>
        </div>
        <div className="card p-6 text-center">
          <HiOutlineCurrencyDollar className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-3xl font-bold">{activeCount}</p>
          <p className="text-gray-500 text-sm">Active Listings</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <HiOutlineHome className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">You haven't listed any properties yet.</p>
          <Link to="/admin" className="btn-primary">Create Your First Listing</Link>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 dark:bg-gray-700 text-left text-gray-500">
                <th className="p-3 font-medium">Property</th>
                <th className="p-3 font-medium">Price</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Views</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-3">
                    <Link to={`/listings/${p.id}`} className="font-medium text-indigo-600 hover:underline">{p.title}</Link>
                    <p className="text-xs text-gray-500">{p.city}</p>
                  </td>
                  <td className="p-3 font-semibold">{formatMK(p.price)}</td>
                  <td className="p-3 capitalize">{p.type}</td>
                  <td className="p-3">{(p.views_count || 0).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.status === 'active' ? 'bg-green-100 text-green-700' :
                      p.status === 'sold' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{p.status}</span>
                  </td>
                  <td className="p-3">
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
