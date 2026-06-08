import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    phone: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        
    },
    createdByName: {
        type: String,
        
    },
    createdByRole: {
        type:String,
        enum: ['admin', 'sales'],
        
    },

    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true })

export default mongoose.model('Customer', customerSchema);