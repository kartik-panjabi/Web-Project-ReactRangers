import mongoose from 'mongoose';

const leaseSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    landlord: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    rentAmount: {
        type: Number,
        required: true
    },
    securityDeposit: {
        type: Number,
        required: true
    },
    paymentDueDay: {
        type: Number,
        required: true,
        min: [1, 'Payment due day must be between 1 and 31'],
        max: [31, 'Payment due day must be between 1 and 31']
    },
    terms: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending_tenant_signature', 'tenant_signed', 'pending_landlord_signature', 'active', 'expired', 'terminated'],
        default: 'pending_tenant_signature'
    },
    tenantSignature: {
        type: String,
        default: null
    },
    landlordSignature: {
        type: String,
        default: null
    },
    advancedPayment: {
        amount: Number,
        dueDate: Date,
        status: {
            type: String,
            enum: ['pending', 'paid'],
            default: null
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
leaseSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const Lease = mongoose.models.Lease || mongoose.model('Lease', leaseSchema);

export default Lease;
