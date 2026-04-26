import bcrypt from "bcryptjs";
import mongoose, { Document, Model } from "mongoose";
import jwt from 'jsonwebtoken'

export interface IUser extends Document{
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    phone: string;
    password: string;
    isVerified: boolean
    otp?: string
    otpExpiry?: Date
    refreshToken?: string
    comparePassword(enteredPassword: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
    createdAt: Date
    updatedAt: Date
}

const userSchema = new mongoose.Schema<IUser>({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    userName: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
        default: null
    },
    otpExpiry: {
        type: Date,
        default: null
    },
    refreshToken: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }
}, { timestamps: true })

userSchema.pre('save', async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.generateAccessToken = function(){
    if(process.env.ACCESS_TOKEN_SECRET){
        return jwt.sign({ _id: this._id, userName: this.userName, name: `${this.firstName} ${this.lastName}`, email: this.email, phone: this.phone}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'})
    }

    return "";
}

userSchema.methods.generateRefreshToken = function(){
    if(process.env.REFRESH_TOKEN_SECRET){
        return jwt.sign({ _id: this._id, userName: this.userName}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})
    }

    return "";
}

const User:Model<IUser> = mongoose.models.Users || mongoose.model('Users', userSchema)

export default User
