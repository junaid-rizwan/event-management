"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { EventCard } from "@/components/event-card"
import { Calendar, Plus, Users, Edit, Trash2, Eye } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { deleteEvent } from "@/lib/slices/eventsSlice"
import { useToast } from "@/hooks/use-toast"

export default function MyEventsPage() {
  const { events } = useAppSelector((state) => state.events)
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your events</h1>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  const registeredEvents = events.filter((event) => event.attendees.includes(user.id))
  const createdEvents = events.filter((event) => event.organizerId === user.id)

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      dispatch(deleteEvent(eventId))
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted.",
      })
    }
  }

  const CreatedEventCard = ({ event }: { event: any }) => (
    <Card className="group transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg line-clamp-1">{event.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(event.date).toLocaleDateString()} • {event.location}
            </p>
          </div>
          <Badge variant={event.status === "active" ? "default" : "secondary"}>{event.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>
                {event.ticketsSold}/{event.ticketLimit}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span>${event.price * event.ticketsSold}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/events/${event.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/events/${event.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteEvent(event.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Events</h1>
        {user.role === "organizer" && (
          <Button asChild>
            <Link href="/create-event">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="registered" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="registered">Registered Events ({registeredEvents.length})</TabsTrigger>
          {user.role === "organizer" && (
            <TabsTrigger value="created">Created Events ({createdEvents.length})</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="registered" className="space-y-6">
          {registeredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No registered events</h3>
              <p className="text-muted-foreground mb-4">You haven't registered for any events yet.</p>
              <Button asChild>
                <Link href="/">Browse Events</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        {user.role === "organizer" && (
          <TabsContent value="created" className="space-y-6">
            {createdEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {createdEvents.map((event) => (
                  <CreatedEventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No events created</h3>
                <p className="text-muted-foreground mb-4">You haven't created any events yet.</p>
                <Button asChild>
                  <Link href="/create-event">Create Your First Event</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
