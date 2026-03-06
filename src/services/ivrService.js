import api from './api';

export const ivrService = {
  submitIVR: (data) => api.post('/insurance/verify', data),
  getIVRRequests: (params) => api.get('/ivr', { params }),
  getIVRById: (id) => api.get(`/ivr/${id}`),
  getStatusCounts: () => api.get('/ivr/status-counts'),
};
