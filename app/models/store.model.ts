import mongoose, { Document, Model, Types } from "mongoose";

export interface IStore extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    shop: string;
    accessToken: string;
    scope: string;
    isActive: boolean;
    connectedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const storeSchema = new mongoose.Schema<IStore>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    shop: {
        type: String,
        required: true,
        unique: true
    },
    accessToken:{
        type: String,
        required: true
    },
    scope:{
        type: String
    },
    isActive:{
        type: Boolean,
        default: true
    },
    connectedAt:{
        type: Date,
        default: Date.now
    }
},{timestamps: true})

const Store: Model<IStore> = mongoose.models.Stores || mongoose.model('Stores', storeSchema)

export default Store
