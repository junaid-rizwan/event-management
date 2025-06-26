import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Users, MapPin, DollarSign, Search, Filter, Loader2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchEvents, registerForEvent, unregisterFromEvent, clearError } from "@/lib/slices/eventsSlice"

const EVENT_CATEGORIES = [
    "Technology",
    "Music",
    "Food",
    "Sports",
    "Business",
    "Education",
    "Health & Wellness",
    "Arts & Culture",
    "Networking",
    "Other"
]

export default function EventsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { user, isAuthenticated } = useAppSelector((state) => state.auth)
    const { events, loading, error, pagination } = useAppSelector((state) => state.events)

    const [filters, setFilters] = useState({
        search: "",
        category: "",
        location: "",
        date: "",
        sort: "date"
    })
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        dispatch(fetchEvents({
            page: 1,
            limit: 12,
            ...filters
        }))

        return () => {
            dispatch(clearError())
        }
    }, [dispatch, filters])

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const handleRegister = async (eventId: string) => {
        if (!isAuthenticated) {
            navigate("/login")
            return
        }
        dispatch(registerForEvent(eventId))
    }

    const handleUnregister = async (eventId: string) => {
        dispatch(unregisterFromEvent(eventId))
    }

    const isRegisteredForEvent = (event: any) => {
        return event.attendees?.some((attendee: any) => attendee._id === user?.id)
    }

    const loadMoreEvents = () => {
        if (pagination.currentPage < pagination.totalPages) {
            dispatch(fetchEvents({
                page: pagination.currentPage + 1,
                limit: 12,
                ...filters
            }))
        }
    }

    if (loading && events.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading events...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                    <Calendar className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">Discover Events</h1>
                </div>
                {isAuthenticated && (
                    <Button onClick={() => navigate("/create-event")}>
                        Create Event
                    </Button>
                )}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Search and Filters */}
            <Card className="mb-8">
                <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search events..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange("search", e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:w-auto"
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={filters.category}
                                    onValueChange={(value) => handleFilterChange("category", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All categories</SelectItem>
                                        {EVENT_CATEGORIES.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input
                                    placeholder="Enter location"
                                    value={filters.location}
                                    onChange={(e) => handleFilterChange("location", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input
                                    type="date"
                                    value={filters.date}
                                    onChange={(e) => handleFilterChange("date", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Sort By</Label>
                                <Select
                                    value={filters.sort}
                                    onValueChange={(value) => handleFilterChange("sort", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="date">Date (Earliest)</SelectItem>
                                        <SelectItem value="date-desc">Date (Latest)</SelectItem>
                                        <SelectItem value="price">Price (Low to High)</SelectItem>
                                        <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                                        <SelectItem value="created">Recently Created</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Events Grid */}
            {events.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {events.map((event) => (
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
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => navigate(`/events/${event._id}`)}
                                        >
                                            View Details
                                        </Button>
                                        {isAuthenticated && (
                                            isRegisteredForEvent(event) ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleUnregister(event._id)}
                                                    disabled={loading}
                                                >
                                                    Unregister
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRegister(event._id)}
                                                    disabled={loading || event.isSoldOut}
                                                >
                                                    {event.isSoldOut ? "Sold Out" : "Register"}
                                                </Button>
                                            )
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Load More */}
                    {pagination.currentPage < pagination.totalPages && (
                        <div className="text-center mt-8">
                            <Button
                                variant="outline"
                                onClick={loadMoreEvents}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    "Load More Events"
                                )}
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <Card>
                    <CardContent className="text-center py-12">
                        <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">No events found</h3>
                        <p className="text-muted-foreground mb-4">
                            Try adjusting your search criteria or check back later for new events.
                        </p>
                        <Button onClick={() => {
                            setFilters({
                                search: "",
                                category: "",
                                location: "",
                                date: "",
                                sort: "date"
                            })
                        }}>
                            Clear Filters
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
} 