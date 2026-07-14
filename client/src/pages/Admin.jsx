import { useState, useEffect } from 'react';
import { HiUsers, HiOutlineHome, HiMail, HiTrash, HiPencil, HiPlus, HiX, HiCash } from 'react-icons/hi';
import { Helmet } from 'react-helmet-async';
import api from '../api/axios';
import { getUsers, updateUserRole, getAdminInquiries, getAdminProperties } from '../api/admin';
import { createProperty, updateProperty, deleteProperty, uploadImages } from '../api/properties';
import { getAllPayments } from '../api/payments';
import { formatMK } from '../utils';
import Breadcrumbs from '../components/Breadcrumbs';
import { TableRowSkeleton } from '../components/Skeleton';
import toast from 'react-hot-toast';

export default function Admin() {
  const [tab, setTab] = useState('properties');
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', price: '', type: 'buy', status: 'active',
    bedrooms: '', bathrooms: '', area_sqft: '', address: '', city: '', state: 'Central Region', zip: '', lat: '', lng: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const loadData = () => {
    getAdminProperties().then(setProperties).catch(() => {});
    getUsers().then(setUsers).catch(() => {});
    getAdminInquiries().then(setInquiries).catch(() => {});
    getAllPayments().then(setPayments).catch(() => {});
  };

  useEffect(loadData, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ title: '', description: '', price: '', type: 'buy', status: 'active', bedrooms: '', bathrooms: '', area_sqft: '', address: '', city: '', state: 'Central Region', zip: '', lat: '', lng: '' });
    setImageFiles([]);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditId(p.id);
    setForm({
      title: p.title, description: p.description, price: p.price, type: p.type, status: p.status,
      bedrooms: p.bedrooms, bathrooms: p.bathrooms, area_sqft: p.area_sqft,
      address: p.address, city: p.city, state: p.state, zip: p.zip || '', lat: p.lat || '', lng: p.lng || '',
    });
    setImageFiles([]);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), bedrooms: parseInt(form.bedrooms), bathrooms: parseInt(form.bathrooms), area_sqft: parseInt(form.area_sqft), lat: form.lat ? parseFloat(form.lat) : null, lng: form.lng ? parseFloat(form.lng) : null };
      if (editId) {
        await updateProperty(editId, payload);
        toast.success('Property updated!');
      } else {
        const created = await createProperty(payload);
        if (imageFiles.length > 0) {
          await uploadImages(created.id, imageFiles);
        }
        toast.success('Property created!');
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      toast.error('Failed to save property');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this property permanently?')) return;
    await deleteProperty(id);
    setProperties(p => p.filter(prop => prop.id !== id));
    toast.success('Property deleted');
  };

  const handleRoleChange = async (userId, role) => {
    await updateUserRole(userId, role);
    setUsers(u => u.map(user => user.id === userId ? { ...user, role } : user));
    toast.success('Role updated');
  };

  const handleDeleteInquiry = async (id) => {
    if (!confirm('Delete this inquiry?')) return;
    try {
      await api.delete(`/admin/inquiries/${id}`);
      setInquiries(prev => prev.filter(i => i.id !== id));
      toast.success('Inquiry deleted');
    } catch {}
  };

  const malawianDistricts = [
    'Balaka', 'Blantyre', 'Chikwawa', 'Chiradzulu', 'Chitipa', 'Dedza', 'Dowa',
    'Karonga', 'Kasungu', 'Likoma', 'Lilongwe', 'Machinga', 'Mangochi', 'Mchinji',
    'Mulanje', 'Mwanza', 'Mzimba', 'Neno', 'Nkhata Bay', 'Nkhotakota', 'Nsanje',
    'Ntcheu', 'Ntchisi', 'Phalombe', 'Rumphi', 'Salima', 'Thyolo', 'Zomba',
  ];

  const tabs = [
    { key: 'properties', label: 'Properties', icon: HiOutlineHome },
    { key: 'payments', label: 'Payments', icon: HiCash },
    { key: 'users', label: 'Users', icon: HiUsers },
    { key: 'inquiries', label: 'Inquiries', icon: HiMail },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Helmet>
        <title>Admin Dashboard | Noble Estates</title>
      </Helmet>

      <Breadcrumbs items={[{ label: 'Admin' }]} />
      <h1 className="text-3xl font-bold mb-2">Management Dashboard</h1>
      <p className="text-gray-500 mb-8">Full control over properties, users, and inquiries</p>

      <div className="flex gap-2 mb-8 border-b pb-2 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg font-medium text-sm transition-colors whitespace-nowrap ${
              tab === t.key ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <t.icon className="w-5 h-5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'properties' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{properties.length} properties total</p>
            <button onClick={openCreate} className="btn-primary text-sm flex items-center gap-1">
              <HiPlus className="w-4 h-4" /> Add Property
            </button>
          </div>
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-700 text-left text-gray-500">
                  <th className="p-3 font-medium">Title</th>
                  <th className="p-3 font-medium">Agent</th>
                  <th className="p-3 font-medium">Price (MK)</th>
                  <th className="p-3 font-medium">District</th>
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.length === 0 ? (
                  <TableRowSkeleton cols={7} />
                ) : (
                  properties.map(p => (
                    <tr key={p.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="p-3 font-medium max-w-[200px] truncate">{p.title}</td>
                      <td className="p-3 text-gray-500">{p.agent_name || 'N/A'}</td>
                      <td className="p-3">{formatMK(p.price)}</td>
                      <td className="p-3">{p.city}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.type === 'buy' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>{p.type}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>{p.status}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(p)} className="text-indigo-500 hover:text-indigo-700" title="Edit">
                            <HiPencil className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700" title="Delete">
                            <HiTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'users' && (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 dark:bg-gray-700 text-left text-gray-500">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Phone</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 text-gray-500">{u.email}</td>
                  <td className="p-3 text-gray-500">{u.phone || '—'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'agent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>{u.role}</span>
                  </td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded px-2 py-1"
                    >
                      <option value="user">User</option>
                      <option value="agent">Agent</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'payments' && (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
          <div className="flex justify-between items-center px-3 py-3 border-b dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
            <p className="text-sm text-gray-500">{payments.length} payments total</p>
            <span className="text-sm font-semibold text-emerald-600">
              Total: {formatMK(payments.reduce((s, p) => s + parseFloat(p.amount), 0))}
            </span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 dark:bg-gray-700 text-left text-gray-500">
                <th className="p-3 font-medium">Reference</th>
                <th className="p-3 font-medium">User</th>
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
                  <td className="p-3">{pay.user_name || <span className="text-gray-400">Guest</span>}</td>
                  <td className="p-3 max-w-[180px] truncate">{pay.property_title || 'N/A'}</td>
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
              {payments.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400">No payments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'inquiries' && (
        <div className="space-y-4">
          {inquiries.length === 0 ? (
            <p className="text-gray-400 text-center py-8 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">No inquiries yet.</p>
          ) : (
            inquiries.map(inq => (
              <div key={inq.id} className="card p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{inq.name}</p>
                    <p className="text-sm text-gray-500">{inq.email}{inq.phone ? ` | ${inq.phone}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{new Date(inq.created_at).toLocaleDateString()}</span>
                    <button onClick={() => handleDeleteInquiry(inq.id)} className="text-red-400 hover:text-red-600">
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mt-2">{inq.message}</p>
                <p className="text-xs text-gray-400 mt-2">Re: {inq.property_title || 'Unknown Property'}</p>
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-10">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl mx-4 p-6 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <HiX className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-6">{editId ? 'Edit Property' : 'Add New Property'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input-field" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input-field h-24 resize-none" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (MK)</label>
                  <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="input-field">
                    <option value="buy">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="input-field">
                    <option value="active">Active</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bedrooms</label>
                  <input type="number" value={form.bedrooms} onChange={e => setForm(p => ({ ...p, bedrooms: e.target.value }))} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bathrooms</label>
                  <input type="number" value={form.bathrooms} onChange={e => setForm(p => ({ ...p, bathrooms: e.target.value }))} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area (sqm)</label>
                  <input type="number" value={form.area_sqft} onChange={e => setForm(p => ({ ...p, area_sqft: e.target.value }))} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
                  <select value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="input-field" required>
                    <option value="">Select district</option>
                    {malawianDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region</label>
                  <select value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} className="input-field">
                    <option value="Central Region">Central Region</option>
                    <option value="Northern Region">Northern Region</option>
                    <option value="Southern Region">Southern Region</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                  <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
                  <input type="number" step="any" value={form.lat} onChange={e => setForm(p => ({ ...p, lat: e.target.value }))} className="input-field" placeholder="-13.9833" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
                  <input type="number" step="any" value={form.lng} onChange={e => setForm(p => ({ ...p, lng: e.target.value }))} className="input-field" placeholder="33.7833" />
                </div>
                {!editId && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Images</label>
                    <input type="file" multiple accept="image/*" onChange={e => setImageFiles([...e.target.files])} className="input-field" />
                    <p className="text-xs text-gray-400 mt-1">Upload up to 10 images (first will be primary). Images are auto-optimized.</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : editId ? 'Update Property' : 'Create Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
