import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiPhone, HiMail } from 'react-icons/hi';
import { getAgent } from '../api/agents';
import PropertyCard from '../components/PropertyCard';
import Breadcrumbs from '../components/Breadcrumbs';

export default function AgentProfile() {
  const { id } = useParams();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAgent(id)
      .then(setAgent)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Agent not found.</p>
        <Link to="/listings" className="text-indigo-600 mt-4 inline-block">Browse properties</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Agents', href: '/agents' }, { label: agent.name }]} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-3xl flex-shrink-0">
            {agent.name.charAt(0)}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <p className="text-gray-500 mb-3">Real Estate Agent</p>
            <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
              {agent.phone && (
                <p className="flex items-center gap-2 text-sm text-gray-600">
                  <HiPhone className="w-4 h-4" /> {agent.phone}
                </p>
              )}
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <HiMail className="w-4 h-4" /> {agent.email}
              </p>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {agent.properties?.length || 0} active listing{(agent.properties?.length || 0) !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-6">Properties by {agent.name}</h2>
      {agent.properties?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {agent.properties.map(p => <PropertyCard key={p.id} property={p} />)}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-400">This agent has no active listings.</p>
        </div>
      )}
    </div>
  );
}
