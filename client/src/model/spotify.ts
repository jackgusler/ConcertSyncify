import { ref } from 'vue'
import axios from '../myAxios'
import router from '@/router'

export const loadingArtists = ref(0)
export const loadingGenres = ref(0)
export const loadingEvents = ref(0)

export interface Artist {
  external_urls: {
    spotify: string
  }
  followers: {
    href: string | null
    total: number
  }
  genres: string[]
  href: string
  id: string
  images: {
    url: string
    height: number
    width: number
  }[]
  name: string
  popularity: number
  type: 'artist'
  uri: string
}

export interface Genre {
  genre: string
  artist: Artist
}

export const spotifyLogin = async () => {
  window.location.href = axios.defaults.baseURL + '/api/spotify/login'
}

export const spotifyLogout = async () => {
  try {
    const response = await axios.get('/api/spotify/logout')
    window.location.reload()
    router.push(response.data.redirectUrl)
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

export const isLoggedInSpotify = async () => {
  try {
    const response = await axios.get('/api/spotify/logged-in')
    return response.data.logged_in
  } catch (error) {
    console.error('Error checking login status:', error)
    return false
  }
}

export const getTopArtists = async () => {
  try {
    const response = await axios.get('/api/spotify/top-artists')
    return response.data.items
  } catch (error) {
    console.error('Error fetching top artists:', error)
  }
}

export const getTopGenres = async () => {
  try {
    const response = await axios.get('/api/spotify/top-genres')
    return response.data.genres
  } catch (error) {
    console.error('Error fetching top genres:', error)
  }
}

export const searchSpotify = async (q: string, type: string) => {
  try {
    const response = await axios.get('/api/spotify/search', {
      params: {
        q,
        type
      }
    })
    return response.data
  } catch (error) {
    console.error('Error searching Spotify:', error)
  }
}

export const handleLoading = (type: string, sign: string) => {
  const loadingMap: { [key: string]: any } = {
    'artist': loadingArtists,
    'genre': loadingGenres,
    'event': loadingEvents
  };

  const loadingVariable = loadingMap[type];
  if (loadingVariable) {
    loadingVariable.value += sign === '+' ? 1 : -1;
  }
};
