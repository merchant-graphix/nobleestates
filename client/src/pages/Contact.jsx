import { Helmet } from 'react-helmet-async';
import Breadcrumbs from '../components/Breadcrumbs';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';

export default function Contact() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Helmet>
        <title>Contact Us | Noble Estates</title>
        <meta name="description" content="Get in touch with Noble Estates. We're here to help you find your dream home in Malawi." />
      </Helmet>
      <Breadcrumbs items={[{ label: 'Contact' }]} />

      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <p className="text-gray-500 text-lg">Have questions about a property or need help? We&apos;re here to assist you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="card p-6 text-center">
          <HiOutlinePhone className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Phone</h3>
          <p className="text-gray-500 text-sm">+265 1 234 567</p>
          <p className="text-gray-500 text-sm">+265 99 123 4567</p>
        </div>
        <div className="card p-6 text-center">
          <HiOutlineMail className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Email</h3>
          <p className="text-gray-500 text-sm">info@nobleestates.mw</p>
          <p className="text-gray-500 text-sm">support@nobleestates.mw</p>
        </div>
        <div className="card p-6 text-center">
          <HiOutlineLocationMarker className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Office</h3>
          <p className="text-gray-500 text-sm">Area 3, Plot 42</p>
          <p className="text-gray-500 text-sm">Lilongwe, Malawi</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="card p-8">
          <h2 className="text-xl font-semibold mb-6">Send Us a Message</h2>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" placeholder="Your Name" className="input-field" required />
              <input type="email" placeholder="Your Email" className="input-field" required />
            </div>
            <input type="text" placeholder="Subject" className="input-field w-full" required />
            <textarea placeholder="Your Message" className="input-field w-full" rows={5} required />
            <button type="submit" className="btn-primary">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}
