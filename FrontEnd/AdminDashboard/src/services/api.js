import axios from 'axios';

// Use relative path to leverage Vite proxy
// If in production, this might need to change, but for dev this fixes CORS
const api = axios.create({
    baseURL: '', // Empty base URL to use relative paths
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
