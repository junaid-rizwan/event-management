const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
    return localStorage.getItem('token');
};

// Helper function to set auth token
const setAuthToken = (token: string): void => {
    localStorage.setItem('token', token);
};

// Helper function to remove auth token
const removeAuthToken = (): void => {
    localStorage.removeItem('token');
};

// Helper function to make API requests
const apiRequest = async (
    endpoint: string,
    options: RequestInit = {}
): Promise<any> => {
    const token = getAuthToken();

    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
};

// Authentication API
export const authAPI = {
    // Register user
    register: async (userData: {
        name: string;
        email: string;
        password: string;
        role?: 'attendee' | 'organizer';
    }) => {
        const response = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });

        if (response.success && response.token) {
            setAuthToken(response.token);
        }

        return response;
    },

    // Login user
    login: async (credentials: { email: string; password: string }) => {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        if (response.success && response.token) {
            setAuthToken(response.token);
        }

        return response;
    },

    // Get current user
    getCurrentUser: async () => {
        return await apiRequest('/auth/me');
    },

    // Update profile
    updateProfile: async (profileData: {
        name?: string;
        bio?: string;
        phone?: string;
        avatar?: File;
    }) => {
        const formData = new FormData();

        Object.entries(profileData).forEach(([key, value]) => {
            if (value !== undefined) {
                if (key === 'avatar' && value instanceof File) {
                    formData.append('image', value);
                } else {
                    formData.append(key, value as string);
                }
            }
        });

        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    },

    // Change password
    changePassword: async (passwords: {
        currentPassword: string;
        newPassword: string;
    }) => {
        return await apiRequest('/auth/changepassword', {
            method: 'PUT',
            body: JSON.stringify(passwords),
        });
    },

    // Logout
    logout: () => {
        removeAuthToken();
    },

    // Forgot password
    forgotPassword: async (email: string) => {
        return await apiRequest('/auth/forgotpassword', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    // Reset password
    resetPassword: async (token: string, password: string) => {
        return await apiRequest(`/auth/resetpassword/${token}`, {
            method: 'PUT',
            body: JSON.stringify({ password }),
        });
    },
};

// Events API
export const eventsAPI = {
    // Get all events
    getEvents: async (params?: {
        page?: number;
        limit?: number;
        category?: string;
        location?: string;
        search?: string;
        date?: string;
        status?: string;
        featured?: boolean;
        sort?: string;
    }) => {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        return await apiRequest(`/events?${queryParams.toString()}`);
    },

    // Get single event
    getEvent: async (id: string) => {
        return await apiRequest(`/events/${id}`);
    },

    // Create event
    createEvent: async (eventData: {
        title: string;
        description: string;
        category: string;
        date: string;
        time: string;
        location: string;
        ticketLimit: number;
        price: number;
        image?: File;
        tags?: string[];
        featured?: boolean;
        registrationDeadline?: string;
        maxAttendeesPerUser?: number;
        refundPolicy?: string;
        contactEmail?: string;
        contactPhone?: string;
        venueDetails?: string;
        requirements?: string;
    }) => {
        const formData = new FormData();

        Object.entries(eventData).forEach(([key, value]) => {
            if (value !== undefined) {
                if (key === 'image' && value instanceof File) {
                    formData.append('image', value);
                } else if (Array.isArray(value)) {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    },

    // Update event
    updateEvent: async (id: string, eventData: any) => {
        const formData = new FormData();

        Object.entries(eventData).forEach(([key, value]) => {
            if (value !== undefined) {
                if (key === 'image' && value instanceof File) {
                    formData.append('image', value);
                } else if (Array.isArray(value)) {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/events/${id}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    },

    // Delete event
    deleteEvent: async (id: string) => {
        return await apiRequest(`/events/${id}`, {
            method: 'DELETE',
        });
    },

    // Register for event
    registerForEvent: async (id: string) => {
        return await apiRequest(`/events/${id}/register`, {
            method: 'POST',
        });
    },

    // Unregister from event
    unregisterFromEvent: async (id: string) => {
        return await apiRequest(`/events/${id}/register`, {
            method: 'DELETE',
        });
    },

    // Get user's events
    getUserEvents: async (type?: 'all' | 'created' | 'registered') => {
        const queryParams = type ? `?type=${type}` : '';
        return await apiRequest(`/events/user/me${queryParams}`);
    },
};

// Users API (Admin only)
export const usersAPI = {
    // Get all users
    getUsers: async (params?: {
        page?: number;
        limit?: number;
        role?: string;
        search?: string;
        sort?: string;
    }) => {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        return await apiRequest(`/users?${queryParams.toString()}`);
    },

    // Get single user
    getUser: async (id: string) => {
        return await apiRequest(`/users/${id}`);
    },

    // Update user
    updateUser: async (id: string, userData: any) => {
        return await apiRequest(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    },

    // Delete user
    deleteUser: async (id: string) => {
        return await apiRequest(`/users/${id}`, {
            method: 'DELETE',
        });
    },

    // Get user statistics
    getUserStats: async () => {
        return await apiRequest('/users/stats/overview');
    },
};

// Health check
export const healthAPI = {
    check: async () => {
        return await apiRequest('/health');
    },
};

// Export utility functions
export { getAuthToken, setAuthToken, removeAuthToken }; 