import axios from '../myAxios'
import router from '@/router'
import { loadingArtists } from './util'

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

// Function to get the token from the URL or localStorage
const getToken = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')
  if (token) {
    localStorage.setItem('spotify_token', token)
    window.history.replaceState({}, document.title, window.location.pathname) // Remove the token from the URL
  }
  return localStorage.getItem('spotify_token')
}

export const spotifyLogin = async () => {
  window.location.href = axios.defaults.baseURL + '/api/spotify/login'
}

export const spotifyLogout = async () => {
  try {
    localStorage.clear()
    const response = await axios.get('/api/spotify/logout')
    window.location.reload()
    router.push(response.data.redirectUrl)
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

export const isLoggedInSpotify = () => {
  const token = getToken()
  if (!token) return false
  else return true
}

export const getTopArtists = async () => {
  try {
    const token = getToken()
    const response = await axios.get('/api/spotify/top-artists', {
      params: { token }
    })
    return response.data.items
  } catch (error) {
    console.error('Error fetching top artists:', error)
  }
}

export const getTopGenres = async () => {
  try {
    const token = getToken()
    const response = await axios.get('/api/spotify/top-genres', {
      params: { token }
    })
    return response.data.genres
  } catch (error) {
    console.error('Error fetching top genres:', error)
  }
}

export const searchSpotify = async (q: string, type: string) => {
  try {
    const token = getToken()
    const response = await axios.get('/api/spotify/search', {
      params: { q, type, token }
    })
    return response.data
  } catch (error) {
    console.error('Error searching Spotify:', error)
  }
}
