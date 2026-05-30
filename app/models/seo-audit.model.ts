import mongoose, { Document, Model, Types } from "mongoose";

export interface ISeoAudit extends Document {
    storeId: Types.ObjectId;
    productId: Types.ObjectId;
    aiModel: string;
    seoScore: number;
    titleScore: number;
    descriptionScore: number;
    handleScore: number;
    priority: 'High' | 'Medium' | 'Low';
    auditStatus: 'PENDING' | 'COMPLETED' | 'FAILED'
    issues: string[];
    recommendations: string[];
    strengths: string[];
    auditedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const seoAuditSchema = new mongoose.Schema<ISeoAudit>({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stores',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true
    },
    aiModel: {
        type: String,
        default: 'gpt-3.5-turbo'
    },
    seoScore: {
        type: Number,
        default: 0
    },
    titleScore: {
        type: Number,
        default: 0
    },
    descriptionScore: {
        type: Number,
        default: 0
    },
    handleScore: {
        type: Number,
        default: 0
    },
    issues: [
        {
            field: { type: String },
            issue: { type: String },
            severity: {
                type: String,
                enum: ['High', 'Medium', 'Low'],
            },
        }
    ],
    recommendations: [
        {
            field: { type: String },
            suggestion: { type: String },
            impact: { type: String },
        }
    ],
    strengths: [
        {
            type: String
        }
    ],
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
    },
    auditStatus: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'COMPLETED'
    },
    auditedAt: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true })

seoAuditSchema.index({ productId: 1 });
seoAuditSchema.index({ storeId: 1 });

const SeoAudits: Model<ISeoAudit> = mongoose.models.SeoAudits || mongoose.model('SeoAudits', seoAuditSchema)

export default SeoAudits