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

export const getCachedData = (key: string) => {
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : null
}

export const setCachedData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data))
  console.log(localStorage.getItem(key))
}
