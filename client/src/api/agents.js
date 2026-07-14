import api from './axios';

export const getAgents = () => api.get('/agents').then(r => r.data);
export const getAgent = (id) => api.get(`/agents/${id}`).then(r => r.data);
