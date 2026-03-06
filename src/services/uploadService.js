import api from './api';

export const uploadService = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name || 'document.pdf',
      type: file.type || 'application/pdf',
    });
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
