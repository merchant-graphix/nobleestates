import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-3">Noble Estates</h3>
            <p className="text-sm">Malawi's trusted real estate marketplace. Browse properties for sale and rent across all districts.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/listings" className="hover:text-white transition-colors">Browse Properties</Link></li>
              <li><Link to="/listings?type=buy" className="hover:text-white transition-colors">Buy</Link></li>
              <li><Link to="/listings?type=rent" className="hover:text-white transition-colors">Rent</Link></li>
              <li><Link to="/agents" className="hover:text-white transition-colors">Our Agents</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/blog" className="hover:text-white transition-colors">Buying Guide</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Market Trends</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Selling Tips</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Renting Advice</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>info@nobleestates.mw</li>
              <li>+265 1 234 567</li>
              <li>Lilongwe, Malawi</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          &copy; {new Date().getFullYear()} Noble Estates. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
