import { Link } from 'react-router-dom';
import { HiUserGroup } from 'react-icons/hi';
import { useState, useEffect } from 'react';
import { getAgents } from '../api/agents';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAgents()
      .then(setAgents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Our Agents' }]} />
      <h1 className="text-3xl font-bold mb-2">Our Agents</h1>
      <p className="text-gray-500 mb-8">Meet our team of professional real estate agents across Malawi.</p>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-20">
          <HiUserGroup className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No agents found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map(agent => (
            <Link key={agent.id} to={`/agents/${agent.id}`} className="card p-6 group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {agent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-indigo-600 transition-colors">{agent.name}</h3>
                  <p className="text-sm text-gray-500">Real Estate Agent</p>
                </div>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                {agent.phone && <p>Phone: {agent.phone}</p>}
                <p>Email: {agent.email}</p>
                <p className="text-indigo-600 font-medium mt-2">
                  {agent.active_listings} active listing{agent.active_listings !== 1 ? 's' : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
