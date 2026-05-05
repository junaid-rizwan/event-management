import { useEffect } from "react"
import { Link } from "react-router-dom"
import { EventCard } from "@/components/event-card"
import { EventFilters } from "@/components/event-filters"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Users, TrendingUp } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { setFilters, fetchEvents } from "@/lib/slices/eventsSlice"

export default function HomePage() {
    const { events, loading } = useAppSelector((state) => state.events)
    const { user, isAuthenticated } = useAppSelector((state) => state.auth)
    const dispatch = useAppDispatch()

    useEffect(() => {
        // Fetch events and initialize filters
        dispatch(fetchEvents())
        dispatch(setFilters({}))
    }, [dispatch])

    const upcomingEvents = (events || []).filter(
        (event) => new Date(event.date) >= new Date() && event.status === "active",
    )

    const stats = {
        totalEvents: events?.length || 0,
        totalAttendees: (events || []).reduce((sum, event) => sum + (event.ticketsSold || 0), 0),
        activeEvents: (events || []).filter((event) => event.status === "active").length,
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Hero Section */}
            <section className="text-center py-12 mb-12">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        Discover Amazing Events
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8">
                        Find and join events that match your interests, or create your own memorable experiences
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" asChild>
                            <Link to="#events">
                                <Calendar className="mr-2 h-5 w-5" />
                                Browse Events
                            </Link>
                        </Button>
                        {isAuthenticated && user?.role === "organizer" && (
                            <Button size="lg" variant="outline" asChild>
                                <Link to="/create-event">
                                    <Plus className="mr-2 h-5 w-5" />
                                    Create Event
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-card rounded-lg p-6 text-center border">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="text-2xl font-bold">{stats.activeEvents}</h3>
                    <p className="text-muted-foreground">Active Events</p>
                </div>
                <div className="bg-card rounded-lg p-6 text-center border">
                    <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="text-2xl font-bold">{stats.totalAttendees}</h3>
                    <p className="text-muted-foreground">Total Attendees</p>
                </div>
                <div className="bg-card rounded-lg p-6 text-center border">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="text-2xl font-bold">{stats.totalEvents}</h3>
                    <p className="text-muted-foreground">Total Events</p>
                </div>
            </section>

            {/* Events Section */}
            <section id="events">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold">Upcoming Events</h2>
                    {isAuthenticated && user?.role === "organizer" && (
                        <Button asChild>
                            <Link to="/create-event">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Event
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="mb-8">
                    <EventFilters />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
                        ))}
                    </div>
                ) : upcomingEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingEvents.map((event) => (
                            <EventCard key={event._id} event={event} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">No events found</h3>
                        <p className="text-muted-foreground mb-4">Try adjusting your filters or check back later for new events.</p>
                        {isAuthenticated && user?.role === "organizer" && (
                            <Button asChild>
                                <Link to="/create-event">Create the first event</Link>
                            </Button>
                        )}
                    </div>
                )}
            </section>
        </div>
    )
} 