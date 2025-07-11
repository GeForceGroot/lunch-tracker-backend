import mongoose, { Document, Schema } from 'mongoose';
import BaseEntity from "../common/baseEntity";

export interface IAdmin extends Document {
    email: string;
    name: string;
    password: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    lastLogin?: Date;
    isActive: boolean;
    // BaseEntity properties
    id: string;
    uId: string;
    dType: string;
    createdOn: string;
    updatedOn: string;
    expireAt: string;
    version: number;
    active: boolean;
    archived: boolean;
    customFields: any[];
}

const adminSchema = new Schema<IAdmin>({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long']
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Password must be at least 6 characters long']
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    lastLogin: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // BaseEntity properties
    id: {
        type: String,
        required: true,
        unique: true
    },
    uId: {
        type: String,
        required: true
    },
    dType: {
        type: String,
        required: true
    },
    createdOn: {
        type: String,
        required: true
    },
    updatedOn: {
        type: String,
        required: true
    },
    expireAt: {
        type: String
    },
    version: {
        type: Number,
        default: 1
    },
    active: {
        type: Boolean,
        default: true
    },
    archived: {
        type: Boolean,
        default: false
    },
    customFields: {
        type: Schema.Types.Mixed,
        default: []
    }
}, {
    timestamps: false, // We're using our own timestamp fields
    collection: 'admins'
});

// Index for better query performance
adminSchema.index({ email: 1 });
adminSchema.index({ uId: 1 });
adminSchema.index({ active: 1, archived: 1 });

const AdminModel = mongoose.model<IAdmin>('Admin', adminSchema);

class Admin extends BaseEntity {
    email: string;
    name: string;
    password: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    lastLogin?: Date;
    isActive: boolean;

    constructor(props: Partial<Admin>) {
        super();
        this.email = props.email || '';
        this.name = props.name || '';
        this.password = props.password || '';
        this.resetPasswordToken = props.resetPasswordToken;
        this.resetPasswordExpires = props.resetPasswordExpires;
        this.lastLogin = props.lastLogin;
        this.isActive = props.isActive ?? true;
    }
}

export { AdminModel };
export default Admin;