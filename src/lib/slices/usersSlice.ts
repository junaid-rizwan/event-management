import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface User {
  id: string
  name: string
  email: string
  role: "attendee" | "organizer" | "admin"
  avatar?: string
  registeredEvents: string[]
  createdEvents: string[]
}

interface UsersState {
  users: User[]
  loading: boolean
}

const initialState: UsersState = {
  users: [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "organizer",
      registeredEvents: [],
      createdEvents: ["1"],
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "attendee",
      registeredEvents: ["1", "2"],
      createdEvents: [],
    },
  ],
  loading: false,
}

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload)
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex((user) => user.id === action.payload.id)
      if (index !== -1) {
        state.users[index] = action.payload
      }
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((user) => user.id !== action.payload)
    },
  },
})

export const { setUsers, addUser, updateUser, deleteUser } = usersSlice.actions
export default usersSlice.reducer
