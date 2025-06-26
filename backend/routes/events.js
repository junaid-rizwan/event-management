const express = require('express');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadSingle, handleUploadError } = require('../middleware/upload');
const Event = require('../models/Event');

const router = express.Router();

// @desc    Get all events
// @route   GET /api/events
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            location,
            search,
            date,
            status = 'active',
            featured,
            sort = 'date'
        } = req.query;

        // Build query
        const query = { status };

        if (category) {
            query.category = category;
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (search) {
            query.$text = { $search: search };
        }

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.date = { $gte: startDate, $lt: endDate };
        }

        if (featured !== undefined) {
            query.featured = featured === 'true';
        }

        // Build sort object
        let sortObj = {};
        switch (sort) {
            case 'date':
                sortObj = { date: 1 };
                break;
            case 'date-desc':
                sortObj = { date: -1 };
                break;
            case 'price':
                sortObj = { price: 1 };
                break;
            case 'price-desc':
                sortObj = { price: -1 };
                break;
            case 'created':
                sortObj = { createdAt: -1 };
                break;
            default:
                sortObj = { date: 1 };
        }

        // Execute query
        const events = await Event.find(query)
            .populate('organizer', 'name email')
            .sort(sortObj)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        // Get total count
        const total = await Event.countDocuments(query);

        res.status(200).json({
            success: true,
            count: events.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: events
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching events',
            error: error.message
        });
    }
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name email bio avatar')
            .populate('attendees', 'name email avatar');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user is registered for this event
        let isRegistered = false;
        if (req.user) {
            isRegistered = event.attendees.some(attendee =>
                attendee._id.toString() === req.user._id.toString()
            );
        }

        res.status(200).json({
            success: true,
            data: {
                ...event.toObject(),
                isRegistered
            }
        });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching event',
            error: error.message
        });
    }
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Organizers & Admins)
router.post('/', protect, authorize('organizer', 'admin'), uploadSingle, handleUploadError, async (req, res) => {
    try {
        const eventData = {
            ...req.body,
            organizer: req.user.id,
            organizerName: req.user.name
        };

        // Handle image upload
        if (req.file) {
            eventData.image = `/uploads/${req.file.filename}`;
        }

        const event = await Event.create(eventData);

        await event.populate('organizer', 'name email');

        res.status(201).json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating event',
            error: error.message
        });
    }
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Event organizer or admin)
router.put('/:id', protect, uploadSingle, handleUploadError, async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Make sure user is event organizer or admin
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this event'
            });
        }

        const updateData = { ...req.body };

        // Handle image upload
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        event = await Event.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        }).populate('organizer', 'name email');

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating event',
            error: error.message
        });
    }
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Event organizer or admin)
router.delete('/:id', protect, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Make sure user is event organizer or admin
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this event'
            });
        }

        await event.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting event',
            error: error.message
        });
    }
});

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
router.post('/:id/register', protect, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if event is active
        if (event.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Event is not available for registration'
            });
        }

        // Check if event is sold out
        if (event.isSoldOut) {
            return res.status(400).json({
                success: false,
                message: 'Event is sold out'
            });
        }

        // Check if user is already registered
        if (event.attendees.includes(req.user.id)) {
            return res.status(400).json({
                success: false,
                message: 'You are already registered for this event'
            });
        }

        // Check registration deadline
        if (event.registrationDeadline && new Date() > event.registrationDeadline) {
            return res.status(400).json({
                success: false,
                message: 'Registration deadline has passed'
            });
        }

        // Add user to attendees
        event.attendees.push(req.user.id);
        event.ticketsSold += 1;

        await event.save();

        res.status(200).json({
            success: true,
            message: 'Successfully registered for event',
            data: event
        });
    } catch (error) {
        console.error('Register for event error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering for event',
            error: error.message
        });
    }
});

// @desc    Unregister from event
// @route   DELETE /api/events/:id/register
// @access  Private
router.delete('/:id/register', protect, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user is registered
        if (!event.attendees.includes(req.user.id)) {
            return res.status(400).json({
                success: false,
                message: 'You are not registered for this event'
            });
        }

        // Remove user from attendees
        event.attendees = event.attendees.filter(
            attendee => attendee.toString() !== req.user.id
        );
        event.ticketsSold = Math.max(0, event.ticketsSold - 1);

        await event.save();

        res.status(200).json({
            success: true,
            message: 'Successfully unregistered from event',
            data: event
        });
    } catch (error) {
        console.error('Unregister from event error:', error);
        res.status(500).json({
            success: false,
            message: 'Error unregistering from event',
            error: error.message
        });
    }
});

// @desc    Get user's events (created or registered)
// @route   GET /api/events/user/me
// @access  Private
router.get('/user/me', protect, async (req, res) => {
    try {
        const { type = 'all' } = req.query;

        let query = {};

        if (type === 'created') {
            query.organizer = req.user.id;
        } else if (type === 'registered') {
            query.attendees = req.user.id;
            query.organizer = { $ne: req.user.id }; // Exclude events created by user
        } else {
            // Get both created and registered events
            query.$or = [
                { organizer: req.user.id },
                { attendees: req.user.id }
            ];
        }

        const events = await Event.find(query)
            .populate('organizer', 'name email')
            .sort({ date: 1 });

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Get user events error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user events',
            error: error.message
        });
    }
});

module.exports = router; 