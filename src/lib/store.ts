import { configureStore } from "@reduxjs/toolkit"
import authSlice from "./slices/authSlice"
import eventsSlice from "./slices/eventsSlice"
import usersSlice from "./slices/usersSlice"

export const store = configureStore({
  reducer: {
    auth: authSlice,
    events: eventsSlice,
    users: usersSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
