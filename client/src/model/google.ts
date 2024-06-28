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
  summary: string;
  description: string;
  location: string;
  start: string; // ISO string format for date-time
  timeZone: string;
}

export const googleLogin = async () => {
  window.location.href = axios.defaults.baseURL + '/api/google/login'
}

export const googleLogout = async () => {
  try {
    const response = await axios.get('/api/google/logout')
    router.push(response.data.redirectUrl)
    window.location.reload()
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

export const getGoogleEvents = async () => {
  try {
    const response = await axios.get('/api/google/events')
    return response.data.items
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export const createGoogleEvent = async (event: GoogleEventInput) => {
  try {
    const response = await axios.post('/api/google/create-event', event);
    console.log('Event created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating Google event:', error);
    throw error; // Rethrow the error if you want to handle it outside this function
  }
};
