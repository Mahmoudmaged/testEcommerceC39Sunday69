import mongoose, { Schema, Types, model } from "mongoose";

const productSchema = new Schema({
    customId: String,
    name: { type: String, required: true, trim: true, lowercase: true },
    slug: { type: String, required: true },
    description: { type: String },
    stock: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true, default: 1 },
    discount: { type: Number, default: 0 },
    finalPrice: { type: Number, required: true, default: 1 },
    colors: [String],
    size: {
        type: [String],
        enum: ['s', 'm', 'lg', 'xl']
    },
    mainImage: { type: Object, required: true },
    subImages: { type: [Object] },
    categoryId: { type: Types.ObjectId, ref: 'Category', required: true },
    subcategoryId: { type: Types.ObjectId, ref: 'Subcategory', required: true },
    brandId: { type: Types.ObjectId, ref: 'Brand', required: true },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
    wishUser: [{ type: Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true
})

const productModel = mongoose.models.Product || model('Product', productSchema)
export default productModel