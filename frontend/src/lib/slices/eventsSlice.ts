import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { eventsAPI } from "../api"

export interface Event {
  _id: string
  title: string
  description: string
  category: string
  date: string
  time: string
  location: string
  image: string
  ticketLimit: number
  ticketsSold: number
  price: number
  organizer: {
    _id: string
    name: string
    email: string
    avatar?: string
  }
  organizerName: string
  attendees: Array<{
    _id: string
    name: string
    email: string
    avatar?: string
  }>
  status: "active" | "cancelled" | "completed" | "draft"
  tags?: string[]
  featured?: boolean
  registrationDeadline?: string
  maxAttendeesPerUser?: number
  refundPolicy?: string
  contactEmail?: string
  contactPhone?: string
  venueDetails?: string
  requirements?: string
  availableTickets?: number
  isSoldOut?: boolean
  isUpcoming?: boolean
  isRegistered?: boolean
  createdAt: string
  updatedAt: string
}

interface EventsState {
  events: Event[]
  currentEvent: Event | null
  userEvents: Event[]
  loading: boolean
  error: string | null
  filters: {
    category: string
    date: string
    location: string
    search: string
    status: string
    featured: boolean | null
    sort: string
  }
  pagination: {
    currentPage: number
    totalPages: number
    total: number
    limit: number
  }
}

const initialState: EventsState = {
  events: [],
  currentEvent: null,
  userEvents: [],
  loading: false,
  error: null,
  filters: {
    category: "",
    date: "",
    location: "",
    search: "",
    status: "active",
    featured: null,
    sort: "date"
  },
  pagination: {
    currentPage: 1,
    totalPages: 0,
    total: 0,
    limit: 10
  }
}

// Async thunks
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (params?: {
    page?: number
    limit?: number
    category?: string
    location?: string
    search?: string
    date?: string
    status?: string
    featured?: boolean
    sort?: string
  }, { rejectWithValue }) => {
    try {
      const response = await eventsAPI.getEvents(params)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch events')
    }
  }
)

export const fetchEvent = createAsyncThunk(
  'events/fetchEvent',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await eventsAPI.getEvent(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch event')
    }
  }
)

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData: {
    title: string
    description: string
    category: string
    date: string
    time: string
    location: string
    ticketLimit: number
    price: number
    image?: File
    tags?: string[]
    featured?: boolean
    registrationDeadline?: string
    maxAttendeesPerUser?: number
    refundPolicy?: string
    contactEmail?: string
    contactPhone?: string
    venueDetails?: string
    requirements?: string
  }, { rejectWithValue }) => {
    try {
      const response = await eventsAPI.createEvent(eventData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create event')
    }
  }
)

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, eventData }: { id: string; eventData: any }, { rejectWithValue }) => {
    try {
      const response = await eventsAPI.updateEvent(id, eventData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update event')
    }
  }
)

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id: string, { rejectWithValue }) => {
    try {
      await eventsAPI.deleteEvent(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete event')
    }
  }
)

export const registerForEvent = createAsyncThunk(
  'events/registerForEvent',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await eventsAPI.registerForEvent(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to register for event')
    }
  }
)

export const unregisterFromEvent = createAsyncThunk(
  'events/unregisterFromEvent',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await eventsAPI.unregisterFromEvent(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to unregister from event')
    }
  }
)

export const fetchUserEvents = createAsyncThunk(
  'events/fetchUserEvents',
  async (type?: 'all' | 'created' | 'registered', { rejectWithValue }) => {
    try {
      const response = await eventsAPI.getUserEvents(type)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user events')
    }
  }
)

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = initialState.filters
    },
    clearError: (state) => {
      state.error = null
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null
    }
  },
  extraReducers: (builder) => {
    // Fetch events
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false
        state.events = action.payload.data
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
          limit: action.payload.limit || 10
        }
        state.error = null
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch single event
    builder
      .addCase(fetchEvent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEvent.fulfilled, (state, action) => {
        state.loading = false
        state.currentEvent = action.payload.data
        state.error = null
      })
      .addCase(fetchEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Create event
    builder
      .addCase(createEvent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false
        state.events.unshift(action.payload.data)
        state.error = null
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Update event
    builder
      .addCase(updateEvent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false
        const updatedEvent = action.payload.data
        state.events = state.events.map(event =>
          event._id === updatedEvent._id ? updatedEvent : event
        )
        if (state.currentEvent?._id === updatedEvent._id) {
          state.currentEvent = updatedEvent
        }
        state.userEvents = state.userEvents.map(event =>
          event._id === updatedEvent._id ? updatedEvent : event
        )
        state.error = null
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Delete event
    builder
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false
        const deletedId = action.payload
        state.events = state.events.filter(event => event._id !== deletedId)
        state.userEvents = state.userEvents.filter(event => event._id !== deletedId)
        if (state.currentEvent?._id === deletedId) {
          state.currentEvent = null
        }
        state.error = null
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Register for event
    builder
      .addCase(registerForEvent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerForEvent.fulfilled, (state, action) => {
        state.loading = false
        const updatedEvent = action.payload.data
        state.events = state.events.map(event =>
          event._id === updatedEvent._id ? updatedEvent : event
        )
        if (state.currentEvent?._id === updatedEvent._id) {
          state.currentEvent = updatedEvent
        }
        state.error = null
      })
      .addCase(registerForEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Unregister from event
    builder
      .addCase(unregisterFromEvent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(unregisterFromEvent.fulfilled, (state, action) => {
        state.loading = false
        const updatedEvent = action.payload.data
        state.events = state.events.map(event =>
          event._id === updatedEvent._id ? updatedEvent : event
        )
        if (state.currentEvent?._id === updatedEvent._id) {
          state.currentEvent = updatedEvent
        }
        state.error = null
      })
      .addCase(unregisterFromEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch user events
    builder
      .addCase(fetchUserEvents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserEvents.fulfilled, (state, action) => {
        state.loading = false
        state.userEvents = action.payload.data
        state.error = null
      })
      .addCase(fetchUserEvents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { setFilters, clearFilters, clearError, clearCurrentEvent } = eventsSlice.actions
export default eventsSlice.reducer
