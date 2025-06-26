import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { authAPI, getAuthToken } from "../api"

interface User {
  id: string
  name: string
  email: string
  role: "attendee" | "organizer" | "admin"
  avatar?: string
  bio?: string
  phone?: string
  isVerified?: boolean
  lastLogin?: string
  createdAt?: string
  updatedAt?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string; role?: 'attendee' | 'organizer' }, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed')
    }
  }
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed')
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getCurrentUser()
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get user data')
    }
  }
)

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: { name?: string; bio?: string; phone?: string; avatar?: File }, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Profile update failed')
    }
  }
)

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwords: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.changePassword(passwords)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password change failed')
    }
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
      authAPI.logout()
    },
    clearError: (state) => {
      state.error = null
    },
    checkAuthStatus: (state) => {
      const token = getAuthToken()
      if (token) {
        state.isAuthenticated = true
      }
    }
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false
        state.user = null
        state.isAuthenticated = false
        state.error = action.payload as string
      })

    // Update profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.error = null
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Change password
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { logout, clearError, checkAuthStatus } = authSlice.actions
export default authSlice.reducer
