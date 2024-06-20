import axios from 'axios';

const root = import.meta.env.VITE_API_ROOT;

const instance = axios.create({
    baseURL: root,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default instance;