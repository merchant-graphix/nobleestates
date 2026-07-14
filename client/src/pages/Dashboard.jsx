import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiHeart, HiOutlineUser, HiMail, HiPhone, HiCash, HiOutlineCamera, HiOutlinePencil } from 'react-icons/hi';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { getFavorites } from '../api/favorites';
import { getMyPayments } from '../api/payments';
import { updateProfile, uploadAvatar, sendVerification } from '../api/auth';
import { formatMK } from '../utils';
import PropertyCard from '../components/PropertyCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { TableRowSkeleton } from '../components/Skeleton';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loadingFavs, setLoadingFavs] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', bio: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setProfileForm({ name: user.name || '', phone: user.phone || '', bio: user.bio || '' });
    getFavorites().then(data => setFavorites(data)).catch(() => {}).finally(() => setLoadingFavs(false));
    getMyPayments().then(data => setPayments(data)).catch(() => {}).finally(() => setLoadingPayments(false));
  }, [user]);

  const handleFavChange = (propertyId) => {
    setFavorites(prev => prev.filter(f => f.id !== propertyId));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile(profileForm);
      updateUser(updated);
      setEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { avatar } = await uploadAvatar(file);
      updateUser({ ...user, avatar });
      toast.success('Avatar updated');
    } catch (err) {
      toast.error('Failed to upload avatar');
    }
  };

  const handleSendVerification = async () => {
    try {
      await sendVerification();
      toast.success('Verification email sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send verification');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Helmet>
        <title>Dashboard | Noble Estates</title>
      </Helmet>

      <Breadcrumbs items={[{ label: 'Dashboard' }]} />
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

      <div className="card p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <HiOutlineUser className="w-6 h-6" /> Profile
          </h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
              <HiOutlinePencil className="w-4 h-4" /> Edit
            </button>
          )}
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0)
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <HiOutlineCamera className="w-6 h-6 text-white" />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
          <div>
            <p className="font-semibold text-lg">{user?.name}</p>
            <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
            {!user?.email_verified && (
              <button onClick={handleSendVerification} className="text-xs text-indigo-600 hover:underline mt-1">
                Verify email
              </button>
            )}
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Name</label>
              <input value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} className="input-field w-full" />
            </div>
            <div>
              <label className="text-sm text-gray-500">Phone</label>
              <input value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} className="input-field w-full" placeholder="+265..." />
            </div>
            <div>
              <label className="text-sm text-gray-500">Bio</label>
              <textarea value={profileForm.bio} onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))} className="input-field w-full" rows={3} placeholder="Tell us about yourself..." />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSaveProfile} disabled={saving} className="btn-primary text-sm">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => { setEditing(false); setProfileForm({ name: user.name || '', phone: user.phone || '', bio: user.bio || '' }); }} className="btn-secondary text-sm">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500 text-sm">Name</span>
              <p className="font-medium">{user?.name}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Email</span>
              <p className="font-medium flex items-center gap-1"><HiMail className="w-4 h-4" /> {user?.email}</p>
            </div>
            {user?.phone && (
              <div>
                <span className="text-gray-500 text-sm">Phone</span>
                <p className="font-medium flex items-center gap-1"><HiPhone className="w-4 h-4" /> {user?.phone}</p>
              </div>
            )}
            {user?.bio && (
              <div className="sm:col-span-2">
                <span className="text-gray-500 text-sm">Bio</span>
                <p className="font-medium">{user.bio}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <HiCash className="w-6 h-6 text-emerald-600" /> My Payments
        </h2>
        {loadingPayments ? (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
            <table className="w-full text-sm">
              <tbody>
                <TableRowSkeleton cols={6} />
                <TableRowSkeleton cols={6} />
                <TableRowSkeleton cols={6} />
              </tbody>
            </table>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <HiCash className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No payments made yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-700 text-left text-gray-500">
                  <th className="p-3 font-medium">Reference</th>
                  <th className="p-3 font-medium">Property</th>
                  <th className="p-3 font-medium">Amount</th>
                  <th className="p-3 font-medium">Method</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(pay => (
                  <tr key={pay.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-3 font-mono text-xs">{pay.reference || '—'}</td>
                    <td className="p-3">
                      <Link to={`/listings/${pay.property_id}`} className="text-indigo-600 hover:underline">
                        {pay.property_title || 'View Property'}
                      </Link>
                    </td>
                    <td className="p-3 font-semibold">{formatMK(pay.amount)}</td>
                    <td className="p-3 capitalize">{pay.method.replace('_', ' ')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        pay.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        pay.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        pay.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{pay.status}</span>
                    </td>
                    <td className="p-3 text-gray-500 text-xs">{new Date(pay.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <HiHeart className="w-6 h-6 text-red-500" /> Saved Properties ({favorites.length})
        </h2>
        {loadingFavs ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <HiHeart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No saved properties yet.</p>
            <Link to="/listings" className="text-indigo-600 hover:underline mt-2 inline-block">Browse properties</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(fav => (
              <PropertyCard key={fav.id} property={fav} onFavChange={() => handleFavChange(fav.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
