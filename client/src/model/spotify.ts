import axios from '../myAxios'
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
