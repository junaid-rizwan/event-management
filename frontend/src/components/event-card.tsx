"use client"

import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, DollarSign } from "lucide-react"
import type { Event } from "@/lib/slices/eventsSlice"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { registerForEvent } from "@/lib/slices/eventsSlice"

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  const isRegistered = user && event.attendees.includes(user.id)
  const isFull = event.ticketsSold >= event.ticketLimit
  const isOrganizer = user?.id === event.organizerId

  const handleRegister = () => {
    if (user && !isRegistered && !isFull) {
      dispatch(registerForEvent({ eventId: event.id, userId: user.id }))
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden">
          <img
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-xl line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2">{event.description}</p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {event.ticketsSold}/{event.ticketLimit}
              </span>
            </div>
            <div className="flex items-center space-x-1 font-semibold">
              <DollarSign className="h-4 w-4" />
              <span>${event.price}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex space-x-2">
        <Button asChild variant="outline" className="flex-1">
          <Link to={`/events/${event.id}`}>View Details</Link>
        </Button>
        {isAuthenticated && !isOrganizer && (
          <Button onClick={handleRegister} disabled={isRegistered || isFull} className="flex-1">
            {isRegistered ? "Registered" : isFull ? "Sold Out" : "Register"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
