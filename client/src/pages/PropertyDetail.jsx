import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiHeart, HiOutlineHeart, HiMap, HiPhone, HiMail, HiX, HiCash, HiShieldCheck } from 'react-icons/hi';
import { Helmet } from 'react-helmet-async';
import { getProperty, getProperties } from '../api/properties';
import { toggleFavorite } from '../api/favorites';
import { submitInquiry } from '../api/inquiries';
import { makePayment } from '../api/payments';
import { useAuth } from '../context/AuthContext';
import { formatMK } from '../utils';
import ImageGallery from '../components/ImageGallery';
import PropertyCard from '../components/PropertyCard';
import PropertyMap from '../components/PropertyMap';
import Breadcrumbs from '../components/Breadcrumbs';
import { PropertyDetailSkeleton } from '../components/Skeleton';
import toast from 'react-hot-toast';

const DEPOSIT_RATE = 0.1;

export default function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faved, setFaved] = useState(false);
  const [inquiry, setInquiry] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('airtel_money');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProperty(id)
      .then(data => {
        setProperty(data);
        setFaved(data.is_favorite);
        if (data.city) {
          getProperties({ city: data.city, limit: 4 }).then(d => {
            setRelated(d.properties.filter(p => p.id !== data.id));
          }).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user) {
      setInquiry(prev => ({ ...prev, name: user.name, email: user.email }));
    }
  }, [user]);

  const handleFav = async () => {
    if (!user) return;
    const res = await toggleFavorite(id);
    setFaved(res.favorited);
    toast.success(res.favorited ? 'Property saved!' : 'Removed from saved');
  };

  const handleInquiry = async (e) => {
    e.preventDefault();
    try {
      await submitInquiry({ ...inquiry, property_id: parseInt(id) });
      setSent(true);
      toast.success('Inquiry sent successfully!');
    } catch {
      toast.error('Failed to send inquiry');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!user) return;
    setPaymentProcessing(true);
    try {
      const amount = parseFloat(property.price) * DEPOSIT_RATE;
      await makePayment({
        property_id: parseInt(id),
        amount,
        method: paymentMethod,
        phone: paymentPhone,
      });
      setPaymentDone(true);
      toast.success('Payment successful!');
    } catch (err) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return <PropertyDetailSkeleton />;
  }

  if (!property) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Property not found.</p>
        <Link to="/listings" className="text-indigo-600 mt-4 inline-block">Browse properties</Link>
      </div>
    );
  }

  const depositAmount = parseFloat(property.price) * DEPOSIT_RATE;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Helmet>
        <title>{property.title} | Noble Estates</title>
        <meta name="description" content={property.description?.slice(0, 160)} />
      </Helmet>

      <Breadcrumbs items={[
        { label: 'Listings', href: '/listings' },
        { label: property.city, href: `/listings?city=${property.city}` },
        { label: property.title },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ImageGallery images={property.images} />
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{property.title}</h1>
              <p className="text-gray-500 flex items-center gap-1 mt-2">
                <HiMap className="w-5 h-5" /> {property.address}, {property.city}, {property.state}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-indigo-600">
                {property.type === 'buy' ? formatMK(property.price) : `${formatMK(property.price)}/mo`}
              </p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold text-white ${
                property.type === 'buy' ? 'bg-indigo-600' : 'bg-emerald-600'
              }`}>
                {property.type === 'buy' ? 'For Sale' : 'For Rent'}
              </span>
            </div>
          </div>

          {user && (
            <div className="flex gap-3 flex-wrap">
              <button onClick={handleFav} className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                faved ? 'border-red-300 text-red-600 bg-red-50' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}>
                {faved ? <HiHeart className="w-5 h-5" /> : <HiOutlineHeart className="w-5 h-5" />}
                {faved ? 'Saved' : 'Save Property'}
              </button>
              <button
                onClick={() => setShowPayment(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors border border-emerald-600"
              >
                <HiCash className="w-5 h-5" />
                Reserve with Deposit
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div><span className="text-gray-500 text-sm">Bedrooms</span><p className="font-semibold text-lg">{property.bedrooms}</p></div>
            <div><span className="text-gray-500 text-sm">Bathrooms</span><p className="font-semibold text-lg">{property.bathrooms}</p></div>
            <div><span className="text-gray-500 text-sm">Area</span><p className="font-semibold text-lg">{property.area_sqft.toLocaleString()} sqm</p></div>
            <div><span className="text-gray-500 text-sm">Status</span><p className="font-semibold text-lg capitalize">{property.status}</p></div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{property.description}</p>
          </div>

          {property.lat && property.lng && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Location</h2>
              <PropertyMap lat={property.lat} lng={property.lng} title={property.title} />
            </div>
          )}
        </div>

        <div className="space-y-6">
          {property.agent_name && (
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4">Listed by</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                  {property.agent_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{property.agent_name}</p>
                  <p className="text-sm text-gray-500">Agent</p>
                </div>
              </div>
              {property.agent_phone && (
                <p className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <HiPhone className="w-4 h-4" /> {property.agent_phone}
                </p>
              )}
              {property.agent_email && (
                <p className="flex items-center gap-2 text-sm text-gray-600">
                  <HiMail className="w-4 h-4" /> {property.agent_email}
                </p>
              )}
              {property.agent_id && (
                <Link to={`/agents/${property.agent_id}`} className="text-sm text-indigo-600 hover:underline mt-3 inline-block">
                  View Agent Profile
                </Link>
              )}
            </div>
          )}

          {user && (
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <HiCash className="w-5 h-5 text-emerald-600" /> Reserve This Property
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                Pay a {DEPOSIT_RATE * 100}% deposit ({formatMK(depositAmount)}) to reserve this property while you complete the full process.
              </p>
              <button
                onClick={() => setShowPayment(true)}
                className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <HiShieldCheck className="w-5 h-5" />
                Pay {formatMK(depositAmount)} Deposit
              </button>
            </div>
          )}

          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4">Send Inquiry</h3>
            {sent ? (
              <p className="text-green-600 font-medium">Inquiry sent successfully! The agent will contact you soon.</p>
            ) : (
              <form onSubmit={handleInquiry} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={inquiry.name}
                  onChange={(e) => setInquiry(p => ({ ...p, name: e.target.value }))}
                  className="input-field"
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={inquiry.email}
                  onChange={(e) => setInquiry(p => ({ ...p, email: e.target.value }))}
                  className="input-field"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={inquiry.phone}
                  onChange={(e) => setInquiry(p => ({ ...p, phone: e.target.value }))}
                  className="input-field"
                />
                <textarea
                  placeholder="Your message..."
                  value={inquiry.message}
                  onChange={(e) => setInquiry(p => ({ ...p, message: e.target.value }))}
                  className="input-field h-28 resize-none"
                  required
                />
                <button type="submit" className="btn-primary w-full">Send Message</button>
              </form>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Similar Properties in {property.city}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        </section>
      )}

      {showPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 relative">
            <button onClick={() => { setShowPayment(false); if (!paymentDone) setPaymentDone(false); }} className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <HiX className="w-6 h-6" />
            </button>

            {paymentDone ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiShieldCheck className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold mb-2">Payment Successful!</h2>
                <p className="text-gray-500 text-sm mb-4">
                  Your deposit of {formatMK(depositAmount)} for <strong>{property.title}</strong> has been received.
                </p>
                <p className="text-xs text-gray-400 mb-6">The agent will contact you within 24 hours to proceed.</p>
                <button onClick={() => setShowPayment(false)} className="btn-primary">Done</button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-1">Reserve Property</h2>
                <p className="text-sm text-gray-500 mb-6">{property.title}</p>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Property Price</span>
                    <span className="font-medium">{formatMK(property.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Deposit ({DEPOSIT_RATE * 100}%)</span>
                    <span className="font-semibold text-emerald-600">{formatMK(depositAmount)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-medium">Total Due Now</span>
                    <span className="font-bold text-lg text-emerald-600">{formatMK(depositAmount)}</span>
                  </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="input-field"
                    >
                      <option value="airtel_money">Airtel Money</option>
                      <option value="tnm_mpamba">TNM Mpamba</option>
                      <option value="card">Card Payment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+265 999 000 000"
                      value={paymentPhone}
                      onChange={(e) => setPaymentPhone(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={paymentProcessing}
                    className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {paymentProcessing ? 'Processing...' : `Pay ${formatMK(depositAmount)}`}
                  </button>
                  <p className="text-xs text-gray-400 text-center">
                    Payment is processed securely via our payment partners.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
