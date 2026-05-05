import { Routes, Route } from 'react-router-dom'
import { Providers } from '@/components/providers'
import { Navbar } from '@/components/navbar'
import { Toaster } from '@/components/ui/toaster'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import EventsPage from '@/pages/EventsPage'
import CreateEventPage from '@/pages/CreateEventPage'
import MyEventsPage from '@/pages/MyEventsPage'
import ProfilePage from '@/pages/ProfilePage'
import AdminPage from '@/pages/AdminPage'

function App() {
    return (
        <Providers>
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-primary mb-4">EventHub</h1>
                        <p className="text-muted-foreground">Welcome to the event management platform</p>
                    </div>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/events" element={<EventsPage />} />
                        <Route path="/events/:id" element={<EventsPage />} />
                        <Route path="/create-event" element={<CreateEventPage />} />
                        <Route path="/create-event/:eventId" element={<CreateEventPage />} />
                        <Route path="/my-events" element={<MyEventsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/admin" element={<AdminPage />} />
                    </Routes>
                </main>
                <Toaster />
            </div>
        </Providers>
    )
}

export default App 