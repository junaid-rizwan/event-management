"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Trophy, Edit } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { updateProfile } from "@/lib/slices/authSlice"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const { events } = useAppSelector((state) => state.events)
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })
  const [loading, setLoading] = useState(false)

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
        </div>
      </div>
    )
  }

  const registeredEvents = events.filter((event) => event.attendees.includes(user.id))
  const createdEvents = events.filter((event) => event.organizerId === user.id)
  const totalRevenue = createdEvents.reduce((sum, event) => sum + event.price * event.ticketsSold, 0)

  const handleSave = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      dispatch(
        updateProfile({
          name: formData.name,
          email: formData.email,
        }),
      )

      setIsEditing(false)
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
    })
    setIsEditing(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <Badge variant={user.role === "organizer" ? "default" : "secondary"}>{user.role}</Badge>
                </div>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="outline" onClick={() => setIsEditing(!isEditing)} disabled={loading}>
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </CardHeader>

          {isEditing && (
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="text-2xl font-bold">{registeredEvents.length}</h3>
              <p className="text-muted-foreground">Events Attended</p>
            </CardContent>
          </Card>

          {user.role === "organizer" && (
            <>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="text-2xl font-bold">{createdEvents.length}</h3>
                  <p className="text-muted-foreground">Events Created</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="text-2xl font-bold">${totalRevenue}</h3>
                  <p className="text-muted-foreground">Total Revenue</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest event interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {registeredEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Registered • {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">Registered</Badge>
                </div>
              ))}

              {user.role === "organizer" &&
                createdEvents.slice(0, 3).map((event) => (
                  <div key={`created-${event.id}`} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">Created • {event.ticketsSold} attendees</p>
                    </div>
                    <Badge>Organizer</Badge>
                  </div>
                ))}

              {registeredEvents.length === 0 && createdEvents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No recent activity</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
