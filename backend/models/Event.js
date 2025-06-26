const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide an event title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide an event description'],
        maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
        enum: [
            'Technology',
            'Music',
            'Food',
            'Sports',
            'Business',
            'Education',
            'Health & Wellness',
            'Arts & Culture',
            'Networking',
            'Other'
        ]
    },
    date: {
        type: Date,
        required: [true, 'Please provide an event date']
    },
    time: {
        type: String,
        required: [true, 'Please provide an event time']
    },
    location: {
        type: String,
        required: [true, 'Please provide an event location'],
        maxlength: [200, 'Location cannot be more than 200 characters']
    },
    image: {
        type: String,
        default: ''
    },
    ticketLimit: {
        type: Number,
        required: [true, 'Please provide ticket limit'],
        min: [1, 'Ticket limit must be at least 1']
    },
    ticketsSold: {
        type: Number,
        default: 0,
        min: [0, 'Tickets sold cannot be negative']
    },
    price: {
        type: Number,
        required: [true, 'Please provide ticket price'],
        min: [0, 'Price cannot be negative']
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organizerName: {
        type: String,
        required: true
    },
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['active', 'cancelled', 'completed', 'draft'],
        default: 'active'
    },
    tags: [{
        type: String,
        trim: true
    }],
    featured: {
        type: Boolean,
        default: false
    },
    registrationDeadline: {
        type: Date
    },
    maxAttendeesPerUser: {
        type: Number,
        default: 1,
        min: [1, 'Max attendees per user must be at least 1']
    },
    refundPolicy: {
        type: String,
        maxlength: [500, 'Refund policy cannot be more than 500 characters']
    },
    contactEmail: {
        type: String,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    contactPhone: {
        type: String
    },
    venueDetails: {
        type: String,
        maxlength: [1000, 'Venue details cannot be more than 1000 characters']
    },
    requirements: {
        type: String,
        maxlength: [1000, 'Requirements cannot be more than 1000 characters']
    }
}, {
    timestamps: true
});

// Index for better query performance
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ location: 'text', title: 'text', description: 'text' });

// Virtual for available tickets
eventSchema.virtual('availableTickets').get(function () {
    return this.ticketLimit - this.ticketsSold;
});

// Virtual for isSoldOut
eventSchema.virtual('isSoldOut').get(function () {
    return this.ticketsSold >= this.ticketLimit;
});

// Virtual for isUpcoming
eventSchema.virtual('isUpcoming').get(function () {
    return new Date(this.date) > new Date();
});

// Ensure virtual fields are serialized
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

// Pre-save middleware to update organizer name
eventSchema.pre('save', async function (next) {
    if (this.isModified('organizer') && this.organizer) {
        const User = mongoose.model('User');
        const user = await User.findById(this.organizer);
        if (user) {
            this.organizerName = user.name;
        }
    }
    next();
});

module.exports = mongoose.model('Event', eventSchema); 