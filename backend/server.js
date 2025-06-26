const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://your-frontend-domain.com']
        : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Event Management API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
        });
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
}); 