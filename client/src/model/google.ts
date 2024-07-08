import router from '@/router'
import axios from '../myAxios'

export interface GoogleEvent {
  kind: 'calendar#event'
  etag: string
  id: string
  status: string
  htmlLink: string
  created: string
  updated: string
  summary: string
  description: string
  location: string
  colorId: string
  creator: {
    id: string
    email: string
    displayName: string
    self: boolean
  }
  organizer: {
    id: string
    email: string
    displayName: string
    self: boolean
  }
  start: {
    date: Date
    dateTime: string
    timeZone: string
  }
  end: {
    date: Date
    dateTime: string
    timeZone: string
  }
  endTimeUnspecified: boolean
  recurrence: [string]
  recurringEventId: string
  originalStartTime: {
    date: Date
    dateTime: string
    timeZone: string
  }
  transparency: string
  visibility: string
  iCalUID: string
  sequence: number
  attendees: [
    {
      id: string
      email: string
      displayName: string
      organizer: boolean
      self: boolean
      resource: boolean
      optional: boolean
      responseStatus: string
      comment: string
      additionalGuests: number
    }
  ]
  attendeesOmitted: boolean
  extendedProperties: {
    private: {
      (key: any): string
    }
    shared: {
      (key: any): string
    }
  }
  hangoutLink: string
  conferenceData: {
    createRequest: {
      requestId: string
      conferenceSolutionKey: {
        type: string
      }
      status: {
        statusCode: string
      }
    }
    entryPoints: [
      {
        entryPointType: string
        uri: string
        label: string
        pin: string
        accessCode: string
        meetingCode: string
        passcode: string
        password: string
      }
    ]
    conferenceSolution: {
      key: {
        type: string
      }
      name: string
      iconUri: string
    }
    conferenceId: string
    signature: string
    notes: string
  }
  gadget: {
    type: string
    title: string
    link: string
    iconLink: string
    width: number
    height: number
    display: string
    preferences: {
      (key: any): string
    }
  }
  anyoneCanAddSelf: boolean
  guestsCanInviteOthers: boolean
  guestsCanModify: boolean
  guestsCanSeeOtherGuests: boolean
  privateCopy: boolean
  locked: boolean
  reminders: {
    useDefault: boolean
    overrides: [
      {
        method: string
        minutes: number
      }
    ]
  }
  source: {
    url: string
    title: string
  }
  workingLocationProperties: {
    type: string
    homeOffice: string
    customLocation: {
      label: string
    }
    officeLocation: {
      buildingId: string
      floorId: string
      floorSectionId: string
      deskId: string
      label: string
    }
  }
  outOfOfficeProperties: {
    autoDeclineMode: string
    declineMessage: string
  }
  focusTimeProperties: {
    autoDeclineMode: string
    declineMessage: string
    chatStatus: string
  }
  attachments: [
    {
      fileUrl: string
      title: string
      mimeType: string
      iconLink: string
      fileId: string
    }
  ]
  eventType: string
}

export interface GoogleEventInput {
  summary: string
  description: string
  location: string
  start: string
  timeZone: string
  eventId: string
}

const getToken = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('google_token')
  if (token) {
    localStorage.setItem('google_token', token)
    window.history.replaceState({}, document.title, window.location.pathname) // Remove the token from the URL
  }
  return localStorage.getItem('google_token')
}

export const googleLogin = async () => {
  window.location.href = axios.defaults.baseURL + '/api/google/login'
}

export const googleLogout = async () => {
  try {
    const response = await axios.get('/api/google/logout', {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })
    localStorage.removeItem('google_token')
    router.push(response.data.redirectUrl)
    window.location.reload()
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

export const isLoggedInGoogle = () => {
  const token = getToken()
  if (!token) return false
  else return true
}

export const getGoogleEvents = async () => {
  try {
    const response = await axios.get('/api/google/events', {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })
    return response.data.items
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export const createGoogleEvent = async (event: GoogleEventInput) => {
  try {
    const response = await axios.post('/api/google/create-event', event, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })
    return response.data
  } catch (error) {
    console.error('Error creating Google event:', error)
    throw error
  }
}

export const googleEventExists = async (eventId: string) => {
  if (!isLoggedInGoogle()) return false
  try {
    const response = await axios.get('/api/google/event-exists', {
      params: { eventId },
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })
    return response.data.exists
  } catch (error) {
    console.error('Error checking if Google event exists:', error)
    return false
  }
}

export const deleteGoogleEvent = async (eventId: string) => {
  try {
    const response = await axios.delete('/api/google/delete-event', {
      data: { eventId },
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })
    return response.data
  } catch (error) {
    console.error('Error deleting Google event:', error)
    throw error
  }
}
