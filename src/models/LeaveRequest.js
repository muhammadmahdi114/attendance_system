const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
    email: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, required: true, default: 'Pending' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
