import { ref } from 'vue'
import axios from '../myAxios'
import ngeohash from 'ngeohash'

export interface Event {
  _embedded: {
    venues: [
      {
        name: string
        type: string
        id: string
        test: boolean
        url: string
        locale: string
        postalCode: string
        timezone: string
        city: {
          name: string
        }
        state: {
          name: string
          stateCode: string
        }
        country: {
          name: string
          countryCode: string
        }
        address: {
          line1: string
        }
        location: {
          longitude: string
          latitude: string
        }
        markets: [{ id: string }]
        dmas: [{ id: string }]
        _links: {
          self: {
            href: string
          }
        }
      }
    ]
    attractions: [
      {
        name: string
        type: string
        id: string
        test: boolean
        url: string
        locale: string
        images: [
          {
            ratio: string
            url: string
            width: number
            height: number
            fallback: boolean
          }
        ]
        classifications: [
          {
            primary: boolean
            segment: {
              id: string
              name: string
            }
            genre: {
              id: string
              name: string
            }
            subGenre: {
              id: string
              name: string
            }
          }
        ]
        _links: {
          self: {
            href: string
          }
        }
      }
    ]
  }
  _links: {
    self: {
      href: string
    }
    attractions: [{ href: string }]
    venues: [{ href: string }]
  }
  classifications: [
    {
      primary: boolean
      segment: {
        id: string
        name: string
      }
      genre: {
        id: string
        name: string
      }
      subGenre: {
        id: string
        name: string
      }
    }
  ]
  dates: {
    start: {
      localDate: string
      localTime: string
      dateTime: string
      dateTBD: boolean
      dateTBA: boolean
      timeTBA: boolean
      noSpecificTime: boolean
    }
    timezone: string
    status: {
      code: string
    }
  }
  id: string
  images: [
    {
      ratio: string
      url: string
      width: number
      height: number
      fallback: boolean
    }
  ]
  locale: string
  name: string
  pleaseNote: string
  priceRanges: [
    {
      type: string
      currency: string
      min: number
      max: number
    }
  ]
  promoter: {
    id: string
  }
  sales: {
    public: {
      startDateTime: string
      startTBD: boolean
      endDateTime: string
    }
  }
  test: boolean
  type: string
  url: string
}

export const getEvents = async (keyword: string, sort?: string, geoHash?: string) => {
  try {
    const response = await axios.get('/api/ticketmaster/events', {
      params: {
        keyword,
        sort,
        geoHash
      }
    })
    if (!response.data._embedded) {
      return []
    }
    return response.data._embedded.events
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export const getUserGeoHash = async () => {
  try {
    const position: GeolocationPosition = await new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      } else {
        reject(new Error('Geolocation is not supported by this browser.'))
      }
    })
    const { latitude, longitude } = position.coords
    const geohash = ngeohash.encode(latitude, longitude)
    return geohash
  } catch (error) {
    console.error('Error getting user location or encoding geohash:', error)
  }
}
