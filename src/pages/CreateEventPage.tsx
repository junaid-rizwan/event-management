import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Plus, Save, ArrowLeft, Upload, X } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { createEvent, updateEvent, fetchEvent, clearError, clearCurrentEvent } from "@/lib/slices/eventsSlice"

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

export default function CreateEventPage() {
    const { eventId } = useParams<{ eventId: string }>()
    const isEditing = !!eventId

    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { user, isAuthenticated } = useAppSelector((state) => state.auth)
    const { currentEvent, loading, error } = useAppSelector((state) => state.events)

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        date: "",
        time: "",
        location: "",
        ticketLimit: "",
        price: "",
        image: ""
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [imagePreview, setImagePreview] = useState<string>("")
    const [imageFile, setImageFile] = useState<File | null>(null)

    // Check authentication
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login")
            return
        }

        if (isEditing && eventId) {
            dispatch(fetchEvent(eventId))
        }

        return () => {
            dispatch(clearError())
            dispatch(clearCurrentEvent())
        }
    }, [isAuthenticated, navigate, isEditing, eventId, dispatch])

    // Load event data if editing
    useEffect(() => {
        if (isEditing && currentEvent) {
            setFormData({
                title: currentEvent.title,
                description: currentEvent.description,
                category: currentEvent.category,
                date: currentEvent.date.split('T')[0], // Convert to date input format
                time: currentEvent.time,
                location: currentEvent.location,
                ticketLimit: currentEvent.ticketLimit.toString(),
                price: currentEvent.price.toString(),
                image: currentEvent.image
            })
            setImagePreview(currentEvent.image)
        }
    }, [isEditing, currentEvent])

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.title.trim()) {
            newErrors.title = "Event title is required"
        }

        if (!formData.description.trim()) {
            newErrors.description = "Event description is required"
        }

        if (!formData.category) {
            newErrors.category = "Please select a category"
        }

        if (!formData.date) {
            newErrors.date = "Event date is required"
        } else {
            const selectedDate = new Date(formData.date)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            if (selectedDate < today) {
                newErrors.date = "Event date cannot be in the past"
            }
        }

        if (!formData.time) {
            newErrors.time = "Event time is required"
        }

        if (!formData.location.trim()) {
            newErrors.location = "Event location is required"
        }

        if (!formData.ticketLimit || parseInt(formData.ticketLimit) <= 0) {
            newErrors.ticketLimit = "Please enter a valid ticket limit"
        }

        if (!formData.price || parseFloat(formData.price) < 0) {
            newErrors.price = "Please enter a valid price"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }))
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onload = (e) => {
                const result = e.target?.result as string
                setImagePreview(result)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setImagePreview("")
        setImageFile(null)
        setFormData(prev => ({ ...prev, image: "" }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        const eventData = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category,
            date: formData.date,
            time: formData.time,
            location: formData.location.trim(),
            ticketLimit: parseInt(formData.ticketLimit),
            price: parseFloat(formData.price),
            ...(imageFile && { image: imageFile })
        }

        if (isEditing && eventId) {
            dispatch(updateEvent({ id: eventId, eventData }))
        } else {
            dispatch(createEvent(eventData))
        }

        // Navigate to my events after successful creation/update
        setTimeout(() => {
            navigate("/my-events")
        }, 1000)
    }

    if (!isAuthenticated) {
        return null // Will redirect to login
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center space-x-2 mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="mr-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <Calendar className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">
                        {isEditing ? "Edit Event" : "Create New Event"}
                    </h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Event Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="title">Event Title *</Label>
                                        <Input
                                            id="title"
                                            placeholder="Enter event title"
                                            value={formData.title}
                                            onChange={(e) => handleInputChange("title", e.target.value)}
                                            className={errors.title ? "border-red-500" : ""}
                                            disabled={loading}
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-red-500">{errors.title}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description *</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Describe your event..."
                                            value={formData.description}
                                            onChange={(e) => handleInputChange("description", e.target.value)}
                                            rows={4}
                                            className={errors.description ? "border-red-500" : ""}
                                            disabled={loading}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-500">{errors.description}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category *</Label>
                                            <Select
                                                value={formData.category}
                                                onValueChange={(value) => handleInputChange("category", value)}
                                                disabled={loading}
                                            >
                                                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {EVENT_CATEGORIES.map((category) => (
                                                        <SelectItem key={category} value={category}>
                                                            {category}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.category && (
                                                <p className="text-sm text-red-500">{errors.category}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="price">Price ($) *</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={formData.price}
                                                onChange={(e) => handleInputChange("price", e.target.value)}
                                                className={errors.price ? "border-red-500" : ""}
                                                disabled={loading}
                                            />
                                            {errors.price && (
                                                <p className="text-sm text-red-500">{errors.price}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Date & Time</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="date">Event Date *</Label>
                                            <Input
                                                id="date"
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => handleInputChange("date", e.target.value)}
                                                className={errors.date ? "border-red-500" : ""}
                                                disabled={loading}
                                            />
                                            {errors.date && (
                                                <p className="text-sm text-red-500">{errors.date}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="time">Event Time *</Label>
                                            <Input
                                                id="time"
                                                type="time"
                                                value={formData.time}
                                                onChange={(e) => handleInputChange("time", e.target.value)}
                                                className={errors.time ? "border-red-500" : ""}
                                                disabled={loading}
                                            />
                                            {errors.time && (
                                                <p className="text-sm text-red-500">{errors.time}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Location & Capacity</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Event Location *</Label>
                                        <Input
                                            id="location"
                                            placeholder="Enter event location"
                                            value={formData.location}
                                            onChange={(e) => handleInputChange("location", e.target.value)}
                                            className={errors.location ? "border-red-500" : ""}
                                            disabled={loading}
                                        />
                                        {errors.location && (
                                            <p className="text-sm text-red-500">{errors.location}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="ticketLimit">Ticket Limit *</Label>
                                        <Input
                                            id="ticketLimit"
                                            type="number"
                                            min="1"
                                            placeholder="Maximum number of tickets"
                                            value={formData.ticketLimit}
                                            onChange={(e) => handleInputChange("ticketLimit", e.target.value)}
                                            className={errors.ticketLimit ? "border-red-500" : ""}
                                            disabled={loading}
                                        />
                                        {errors.ticketLimit && (
                                            <p className="text-sm text-red-500">{errors.ticketLimit}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Event Image</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Event preview"
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-2 right-2"
                                                onClick={removeImage}
                                                disabled={loading}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                            <p className="text-sm text-gray-500 mb-2">
                                                Upload an event image
                                            </p>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id="image-upload"
                                                disabled={loading}
                                            />
                                            <Label
                                                htmlFor="image-upload"
                                                className="cursor-pointer text-primary hover:underline"
                                            >
                                                Choose file
                                            </Label>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            "Saving..."
                                        ) : (
                                            <>
                                                {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                                                {isEditing ? "Update Event" : "Create Event"}
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate(-1)}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
} 