const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            role,
            search,
            sort = 'createdAt'
        } = req.query;

        // Build query
        const query = {};

        if (role) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        let sortObj = {};
        switch (sort) {
            case 'name':
                sortObj = { name: 1 };
                break;
            case 'email':
                sortObj = { email: 1 };
                break;
            case 'role':
                sortObj = { role: 1 };
                break;
            case 'lastLogin':
                sortObj = { lastLogin: -1 };
                break;
            default:
                sortObj = { createdAt: -1 };
        }

        const users = await User.find(query)
            .select('-password')
            .sort(sortObj)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin or same user)
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is requesting their own data or is admin
        if (req.user.id !== req.params.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this user data'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
});

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
});

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats/overview
// @access  Private (Admin)
router.get('/stats/overview', protect, authorize('admin'), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const attendees = await User.countDocuments({ role: 'attendee' });
        const organizers = await User.countDocuments({ role: 'organizer' });
        const admins = await User.countDocuments({ role: 'admin' });
        const verifiedUsers = await User.countDocuments({ isVerified: true });

        // Get users registered in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentUsers = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                attendees,
                organizers,
                admins,
                verifiedUsers,
                recentUsers
            }
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user statistics',
            error: error.message
        });
    }
});

module.exports = router; 