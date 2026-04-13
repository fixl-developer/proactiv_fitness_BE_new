import { Schema, model } from 'mongoose';
import { baseSchemaOptions } from '../../shared/base/base.model';

// ── MarketplaceItem (Product) ──────────────────────────────────────────────

const marketplaceItemSchema = new Schema({
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
    category: { type: String, trim: true, index: true },
    imageUrl: { type: String, trim: true },
    stock: { type: Number, default: 0, min: [0, 'Stock cannot be negative'] },
    isActive: { type: Boolean, default: true, index: true },
    rating: { type: Number, default: 0 },
    reviews: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        rating: Number,
        comment: String,
    }],
}, {
    ...baseSchemaOptions,
});

marketplaceItemSchema.index({ name: 'text', description: 'text' });

// ── Cart ────────────────────────────────────────────────────────────────────

const cartItemSchema = new Schema({
    itemId: { type: Schema.Types.ObjectId, ref: 'MarketplaceItem', required: true },
    quantity: { type: Number, required: true, min: [1, 'Quantity must be at least 1'] },
    price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
}, { _id: false });

const cartSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    items: { type: [cartItemSchema], default: [] },
    total: { type: Number, default: 0, min: [0, 'Total cannot be negative'] },
}, {
    ...baseSchemaOptions,
});

// ── Order ───────────────────────────────────────────────────────────────────

const orderItemSchema = new Schema({
    itemId: { type: Schema.Types.ObjectId, ref: 'MarketplaceItem', required: true },
    quantity: { type: Number, required: true, min: [1, 'Quantity must be at least 1'] },
    price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
}, { _id: false });

const orderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true, min: [0, 'Total cannot be negative'] },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending',
        index: true,
    },
    paymentId: { type: String, trim: true },
    shippingAddress: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        zip: { type: String, trim: true },
        country: { type: String, trim: true },
    },
}, {
    ...baseSchemaOptions,
});

orderSchema.index({ userId: 1, createdAt: -1 });

// ── Exports ─────────────────────────────────────────────────────────────────

const Product = model('MarketplaceItem', marketplaceItemSchema);
const Cart = model('Cart', cartSchema);
const Order = model('Order', orderSchema);

export default Product;
export { Product, Cart, Order };
