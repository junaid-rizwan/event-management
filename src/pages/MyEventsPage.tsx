import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Edit, Plus, MapPin, DollarSign, Loader2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchUserEvents, clearError } from "@/lib/slices/eventsSlice"

export default function MyEventsPage() {
    const { user, isAuthenticated } = useAppSelector((state) => state.auth)
    const { userEvents, loading, error } = useAppSelector((state) => state.events)
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchUserEvents('all'))
        }

        return () => {
            dispatch(clearError())
        }
    }, [isAuthenticated, dispatch])

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Please log in to view your events</h1>
                    <Button onClick={() => navigate("/login")}>Login</Button>
                </div>
            </div>
        )
    }

    const userCreatedEvents = userEvents.filter(event => event.organizer._id === user?.id)
    const userRegisteredEvents = userEvents.filter(event =>
        event.attendees.some(attendee => attendee._id === user?.id) && event.organizer._id !== user?.id
    )

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading your events...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                    <Calendar className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">My Events</h1>
                </div>
                <Button onClick={() => navigate("/create-event")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                </Button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Events I Created */}
            {userCreatedEvents.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Events I Created</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userCreatedEvents.map((event) => (
                            <Card key={event._id} className="hover:shadow-lg transition-shadow">
                                <div className="aspect-video overflow-hidden">
                                    <img
                                        src={event.image || "/placeholder.svg?height=300&width=500"}
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <CardHeader>
                                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="h-4 w-4" />
                                            <span className="line-clamp-1">{event.location}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <DollarSign className="h-4 w-4" />
                                            <span>${event.price}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Users className="h-4 w-4" />
                                            <span>{event.ticketsSold}/{event.ticketLimit} attendees</span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => navigate(`/create-event/${event._id}`)}
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => navigate(`/events/${event._id}`)}
                                        >
                                            View
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Events I Registered For */}
            {userRegisteredEvents.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Events I Registered For</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userRegisteredEvents.map((event) => (
                            <Card key={event._id} className="hover:shadow-lg transition-shadow">
                                <div className="aspect-video overflow-hidden">
                                    <img
                                        src={event.image || "/placeholder.svg?height=300&width=500"}
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <CardHeader>
                                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="h-4 w-4" />
                                            <span className="line-clamp-1">{event.location}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <DollarSign className="h-4 w-4" />
                                            <span>${event.price}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Users className="h-4 w-4" />
                                            <span>{event.ticketsSold}/{event.ticketLimit} attendees</span>
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={() => navigate(`/events/${event._id}`)}
                                    >
                                        View Details
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* No Events */}
            {userCreatedEvents.length === 0 && userRegisteredEvents.length === 0 && !loading && (
                <Card>
                    <CardContent className="text-center py-12">
                        <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">No events found</h3>
                        <p className="text-muted-foreground mb-4">
                            You haven't created or registered for any events yet.
                        </p>
                        <div className="flex space-x-4 justify-center">
                            <Button onClick={() => navigate("/events")}>Browse Events</Button>
                            <Button onClick={() => navigate("/create-event")}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Event
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
} 