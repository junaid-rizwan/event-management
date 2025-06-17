"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Calendar, DollarSign, TrendingUp, Eye, Trash2, Ban, CheckCircle } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { deleteEvent, updateEvent } from "@/lib/slices/eventsSlice"
import { deleteUser } from "@/lib/slices/usersSlice"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const { events } = useAppSelector((state) => state.events)
  const { users } = useAppSelector((state) => state.users)
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  const totalUsers = users.length
  const totalEvents = events.length
  const totalRevenue = events.reduce((sum, event) => sum + event.price * event.ticketsSold, 0)
  const totalAttendees = events.reduce((sum, event) => sum + event.ticketsSold, 0)

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      dispatch(deleteEvent(eventId))
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted.",
      })
    }
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteUser(userId))
      toast({
        title: "User deleted",
        description: "The user has been successfully deleted.",
      })
    }
  }

  const handleToggleEventStatus = (eventId: string, currentStatus: string) => {
    const event = events.find((e) => e.id === eventId)
    if (event) {
      const newStatus = currentStatus === "active" ? "cancelled" : "active"
      dispatch(updateEvent({ ...event, status: newStatus as any }))
      toast({
        title: `Event ${newStatus}`,
        description: `The event has been ${newStatus}.`,
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, events, and platform analytics</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="text-2xl font-bold">{totalUsers}</h3>
            <p className="text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="text-2xl font-bold">{totalEvents}</h3>
            <p className="text-muted-foreground">Total Events</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="text-2xl font-bold">${totalRevenue}</h3>
            <p className="text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="text-2xl font-bold">{totalAttendees}</h3>
            <p className="text-muted-foreground">Total Attendees</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="events">Events Management</TabsTrigger>
          <TabsTrigger value="users">Users Management</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Events Management</CardTitle>
              <CardDescription>Manage and moderate all events on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Organizer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Attendees</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{event.category}</p>
                        </div>
                      </TableCell>
                      <TableCell>{event.organizerName}</TableCell>
                      <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {event.ticketsSold}/{event.ticketLimit}
                      </TableCell>
                      <TableCell>${event.price * event.ticketsSold}</TableCell>
                      <TableCell>
                        <Badge variant={event.status === "active" ? "default" : "destructive"}>{event.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/events/${event.id}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleEventStatus(event.id, event.status)}
                          >
                            {event.status === "active" ? (
                              <Ban className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users Management</CardTitle>
              <CardDescription>Manage all users on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Events Created</TableHead>
                    <TableHead>Events Attended</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userData) => {
                    const userEvents = events.filter((e) => e.organizerId === userData.id)
                    const attendedEvents = events.filter((e) => e.attendees.includes(userData.id))

                    return (
                      <TableRow key={userData.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.name} />
                              <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{userData.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{userData.email}</TableCell>
                        <TableCell>
                          <Badge variant={userData.role === "organizer" ? "default" : "secondary"}>
                            {userData.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{userEvents.length}</TableCell>
                        <TableCell>{attendedEvents.length}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(userData.id)}
                            className="text-destructive hover:text-destructive"
                            disabled={userData.id === user?.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
