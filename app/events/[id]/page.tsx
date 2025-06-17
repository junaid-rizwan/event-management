"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, Users, DollarSign, Clock, ArrowLeft, Share2, Heart, Edit, Trash2 } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { registerForEvent, deleteEvent } from "@/lib/slices/eventsSlice"
import { useToast } from "@/hooks/use-toast"

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const { events } = useAppSelector((state) => state.events)
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  const event = events.find((e) => e.id === params.id)

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event not found</h1>
          <Button asChild>
            <Link href="/">Back to Events</Link>
          </Button>
        </div>
      </div>
    )
  }

  const isRegistered = user && event.attendees.includes(user.id)
  const isFull = event.ticketsSold >= event.ticketLimit
  const isOrganizer = user?.id === event.organizerId
  const canEdit = isOrganizer || user?.role === "admin"

  const handleRegister = async () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user && !isRegistered && !isFull) {
      setLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call
        dispatch(registerForEvent({ eventId: event.id, userId: user.id }))
        toast({
          title: "Registration successful!",
          description: "You have been registered for this event.",
        })
      } catch (error) {
        toast({
          title: "Registration failed",
          description: "Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this event?")) {
      dispatch(deleteEvent(event.id))
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted.",
      })
      router.push("/")
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Event Image */}
          <div className="relative overflow-hidden rounded-lg">
            <Image
              src={event.image || "/placeholder.svg"}
              alt={event.title}
              width={800}
              height={400}
              className="w-full h-64 md:h-96 object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                {event.category}
              </Badge>
            </div>
            {isFull && (
              <div className="absolute top-4 right-4">
                <Badge variant="destructive">Sold Out</Badge>
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
                {canEdit && (
                  <>
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/events/${event.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleDelete}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>{formatTime(event.time)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>
                  {event.ticketsSold}/{event.ticketLimit} attendees
                </span>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">About this event</h2>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">Organizer</h2>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder.svg" alt={event.organizerName} />
                  <AvatarFallback>{event.organizerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{event.organizerName}</h3>
                  <p className="text-sm text-muted-foreground">Event Organizer</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Event Ticket</span>
                <div className="flex items-center space-x-1 text-2xl font-bold">
                  <DollarSign className="h-6 w-6" />
                  <span>{event.price}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Available tickets</span>
                  <span>{event.ticketLimit - event.ticketsSold}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(event.ticketsSold / event.ticketLimit) * 100}%` }}
                  />
                </div>
              </div>

              {isAuthenticated ? (
                <Button
                  className="w-full"
                  onClick={handleRegister}
                  disabled={isRegistered || isFull || loading || isOrganizer}
                >
                  {loading
                    ? "Registering..."
                    : isRegistered
                      ? "Already Registered"
                      : isFull
                        ? "Sold Out"
                        : isOrganizer
                          ? "You are the organizer"
                          : "Register Now"}
                </Button>
              ) : (
                <Button className="w-full" asChild>
                  <Link href="/login">Login to Register</Link>
                </Button>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Free cancellation up to 24 hours before the event
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{event.location}</p>
                  <p className="text-sm text-muted-foreground">View on map</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
