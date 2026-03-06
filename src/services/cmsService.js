import api from './api';

export const cmsService = {
  getPage: (key) => api.get(`/cms/${key}`),
};
