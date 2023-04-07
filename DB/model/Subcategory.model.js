import mongoose, { Schema, Types, model } from "mongoose";


const subcategorySchema = new Schema({
    customId: { type: String, required: true   ,lowercase: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: Object, required: true },
    categoryId: { type: Types.ObjectId, ref: 'Category', required: true },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
})

const subcategoryModel = mongoose.models.Subcategory || model('Subcategory', subcategorySchema)
export default subcategoryModel