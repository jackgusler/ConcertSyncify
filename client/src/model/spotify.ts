import axios from '../myAxios'
// router to push user to home page
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

export interface Artist {
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string | null;
    total: number;
  };
  genres: string[];
  href: string;
  id: string;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  name: string;
  popularity: number;
  type: 'artist';
  uri: string;
}

export interface Genre {
  genre: string;
  image: string;
}

export const login = async () => {
  window.location.href = axios.defaults.baseURL + '/api/spotify/login';
};

export const logout = async () => {
  const authStore = useAuthStore()
  authStore.clearTokens()
  router.push('/')
};

export const isLoggedIn = async () => {
  const authStore = useAuthStore();
  const accessToken = authStore.accessToken;
  if (accessToken) {
    try {
      const response = await axios.get('/api/spotify/logged-in', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return response.data.logged_in;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }
  return false;
};

export const getTopArtists = async () => {
  const authStore = useAuthStore()
  const accessToken = authStore.accessToken
  if (accessToken) {
    try {
      const response = await axios.get('/api/spotify/top-artists', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      return response.data.items
    } catch (error) {
      console.error('Error fetching top artists:', error)
    }
  }
}

export const getTopGenres = async () => {
  const authStore = useAuthStore();
  const accessToken = authStore.accessToken;
  if (accessToken) {
    try {
      const response = await axios.get('/api/spotify/top-genres', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return response.data.topGenres; // This should be an array of objects [{ genre: 'Genre Name', image: 'Image URL' }, ...]
    } catch (error) {
      console.error('Error fetching top genres:', error);
    }
  }
};