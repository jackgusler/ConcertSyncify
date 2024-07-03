import { ref } from 'vue'
import axios from '../myAxios'

export const loadingArtists = ref(0)
export const loadingGenres = ref(0)
export const loadingEvents = ref(0)

export const loadingGoogle = ref(0)

export const handleLoading = (type: string, sign: string) => {
  const loadingMap: { [key: string]: any } = {
    artist: loadingArtists,
    genre: loadingGenres,
    event: loadingEvents
  }

  const loadingVariable = loadingMap[type]
  if (loadingVariable) {
    loadingVariable.value += sign === '+' ? 1 : -1
  }
}

export const getCachedData = async (key: string) => {
  try {
    const response = await axios.get('/util/get-cache', {
      params: {
        key
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching cached data:', error)
  }
}

export const setCachedData = async (key: string, data: any) => {
  try {
    const response = await axios.post('/util/set-cache', {
      key,
      value: data
    })
    return response
  } catch (error) {
    console.error('Error setting cached data:', error)
  }
}
