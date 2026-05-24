import mongoose, { Document, Model, Types } from 'mongoose'

export interface IProduct extends Document{
    _id: Types.ObjectId;
    storeId: Types.ObjectId;
    shopifyProductId: string;
    title: string;
    handle: string;
    description: string;
    featuredImage: string;
    seoTitle: string;
    seoDescription: string;
    status: string;
    syncAt: Date;
    updatedAtShopify: Date;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new mongoose.Schema<IProduct>({
    storeId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stores',
        required: true
    },
    shopifyProductId:{
        type: String,
        required: true
    },
    title:{
        type: String,
        required: true
    },
    handle:{
        type: String,
        required: true
    },
    description:{
        type: String,
        default: ""
    },
    featuredImage:{
        type: String,
        required: true
    },
    seoTitle:{
        type: String,
        required: true
    },
    seoDescription:{
        type: String,
        required: true
    },
    status:{
        type: String,
        required: true
    },
    syncAt:{
        type: Date,
        default: Date.now
    },
    updatedAtShopify:{
        type: Date,
        default: Date.now
    },
},{timestamps: true})

productSchema.index({storeId: 1, shopifyProductId: 1}, {unique: true})

const Product: Model<IProduct> = mongoose.models.Products || mongoose.model('Products', productSchema)

export default Product
