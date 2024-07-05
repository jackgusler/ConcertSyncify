import axios from 'axios'

const root: string = import.meta.env.VITE_API_ROOT

const instance = axios.create({
  baseURL: root,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

export default instance
