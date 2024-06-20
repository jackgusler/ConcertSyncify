import axios from '../myAxios'

export const login = async () => {
    window.location.href = axios.defaults.baseURL + '/users/login';
};
