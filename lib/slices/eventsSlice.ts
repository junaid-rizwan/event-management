import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface Event {
  id: string
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
  organizerId: string
  organizerName: string
  attendees: string[]
  status: "active" | "cancelled" | "completed"
  createdAt: string
}

interface EventsState {
  events: Event[]
  filteredEvents: Event[]
  loading: boolean
  filters: {
    category: string
    date: string
    location: string
    search: string
  }
}

const initialState: EventsState = {
  events: [
    {
      id: "1",
      title: "Tech Conference 2024",
      description:
        "Join us for the biggest tech conference of the year featuring industry leaders and cutting-edge technologies.",
      category: "Technology",
      date: "2024-03-15",
      time: "09:00",
      location: "San Francisco, CA",
      image: "/placeholder.svg?height=300&width=500",
      ticketLimit: 500,
      ticketsSold: 234,
      price: 299,
      organizerId: "1",
      organizerName: "TechEvents Inc",
      attendees: [],
      status: "active",
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      title: "Music Festival Summer",
      description: "Experience the best music festival with top artists from around the world.",
      category: "Music",
      date: "2024-06-20",
      time: "18:00",
      location: "Los Angeles, CA",
      image: "/placeholder.svg?height=300&width=500",
      ticketLimit: 1000,
      ticketsSold: 567,
      price: 150,
      organizerId: "2",
      organizerName: "Music Events Co",
      attendees: [],
      status: "active",
      createdAt: "2024-01-20",
    },
    {
      id: "3",
      title: "Food & Wine Expo",
      description: "Discover amazing cuisines and wines from local and international vendors.",
      category: "Food",
      date: "2024-04-10",
      time: "12:00",
      location: "New York, NY",
      image: "/placeholder.svg?height=300&width=500",
      ticketLimit: 300,
      ticketsSold: 89,
      price: 75,
      organizerId: "3",
      organizerName: "Culinary Events",
      attendees: [],
      status: "active",
      createdAt: "2024-01-25",
    },
  ],
  filteredEvents: [],
  loading: false,
  filters: {
    category: "",
    date: "",
    location: "",
    search: "",
  },
}

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload
      state.filteredEvents = action.payload
    },
    addEvent: (state, action: PayloadAction<Event>) => {
      state.events.push(action.payload)
      state.filteredEvents.push(action.payload)
    },
    updateEvent: (state, action: PayloadAction<Event>) => {
      const index = state.events.findIndex((event) => event.id === action.payload.id)
      if (index !== -1) {
        state.events[index] = action.payload
        state.filteredEvents = state.events.filter(
          (event) =>
            event.title.toLowerCase().includes(state.filters.search.toLowerCase()) &&
            (state.filters.category === "" || event.category === state.filters.category) &&
            (state.filters.location === "" || event.location.includes(state.filters.location)),
        )
      }
    },
    deleteEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter((event) => event.id !== action.payload)
      state.filteredEvents = state.filteredEvents.filter((event) => event.id !== action.payload)
    },
    registerForEvent: (state, action: PayloadAction<{ eventId: string; userId: string }>) => {
      const event = state.events.find((e) => e.id === action.payload.eventId)
      if (event && !event.attendees.includes(action.payload.userId)) {
        event.attendees.push(action.payload.userId)
        event.ticketsSold += 1
      }
    },
    setFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload }
      state.filteredEvents = state.events.filter(
        (event) =>
          event.title.toLowerCase().includes(state.filters.search.toLowerCase()) &&
          (state.filters.category === "" || event.category === state.filters.category) &&
          (state.filters.location === "" || event.location.includes(state.filters.location)) &&
          (state.filters.date === "" || event.date === state.filters.date),
      )
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { setEvents, addEvent, updateEvent, deleteEvent, registerForEvent, setFilters, setLoading } =
  eventsSlice.actions
export default eventsSlice.reducer
