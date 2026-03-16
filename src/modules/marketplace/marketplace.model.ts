import { Schema, model } from 'mongoose';

const productSchema = new Schema({
    name: { type: String, required: true },
    description: String,
    category: String,
    price: { type: Number, required: true },
    image: String,
    stock: Number,
    rating: Number,
    reviews: [{ userId: Schema.Types.ObjectId, rating: Number, comment: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });

export default model('Product', productSchema);
