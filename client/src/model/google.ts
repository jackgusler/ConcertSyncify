import router from '@/router'
import axios from '../myAxios'

export const googleLogin = async () => {
  window.location.href = axios.defaults.baseURL + '/api/google/login'
}

export const googleLogout = async () => {
  try {
    const response = await axios.get('/api/google/logout')
    router.push(response.data.redirectUrl)
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

export const isLoggedInGoogle = async () => {
  try {
    const response = await axios.get('/api/google/logged-in')
    return response.data.logged_in
  } catch (error) {
    console.error('Error checking login status:', error)
    return false
  }
}
