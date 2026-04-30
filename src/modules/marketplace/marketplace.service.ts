import Product, { Cart, Order } from './marketplace.model';
import logger from '@/shared/utils/logger.util';

class MarketplaceService {
    async getProducts(filters: any) {
        try {
            const query: any = { isActive: true };
            if (filters.category) query.category = filters.category;
            if (filters.search) query.$text = { $search: filters.search };
            const products = await Product.find(query).limit(filters.limit || 20).skip(filters.skip || 0).lean();
            const total = await Product.countDocuments(query);
            return { data: products, total };
        } catch (error) {
            logger.error('Error fetching products', error);
            throw error;
        }
    }

    async getProductById(productId: string) {
        try {
            const product = await Product.findById(productId).lean();
            if (!product) throw new Error('Product not found');
            return product;
        } catch (error) {
            logger.error(`Error fetching product ${productId}`, error);
            throw error;
        }
    }

    async createProduct(data: any) {
        try {
            const product = new Product(data);
            await product.save();
            logger.info(`Product created: ${product._id}`);
            return product;
        } catch (error) {
            logger.error('Error creating product', error);
            throw error;
        }
    }

    async updateProduct(productId: string, data: any) {
        try {
            const product = await Product.findByIdAndUpdate(productId, data, { new: true });
            if (!product) throw new Error('Product not found');
            logger.info(`Product updated: ${productId}`);
            return product;
        } catch (error) {
            logger.error(`Error updating product ${productId}`, error);
            throw error;
        }
    }

    async deleteProduct(productId: string) {
        try {
            await Product.findByIdAndDelete(productId);
            logger.info(`Product deleted: ${productId}`);
        } catch (error) {
            logger.error(`Error deleting product ${productId}`, error);
            throw error;
        }
    }

    async searchProducts(query: string) {
        try {
            return await Product.find({ $text: { $search: query }, isActive: true }).lean();
        } catch (error) {
            logger.error('Error searching products', error);
            throw error;
        }
    }

    async getCategories() {
        try {
            const categories = await Product.distinct('category', { isActive: true });
            return categories.length > 0 ? categories : ['Equipment', 'Apparel', 'Nutrition', 'Accessories'];
        } catch (error) {
            logger.error('Error fetching categories', error);
            throw error;
        }
    }

    async addToCart(userId: string, data: any) {
        try {
            const { itemId, quantity } = data;

            const product = await Product.findById(itemId).lean();
            if (!product) throw new Error('Product not found');
            if ((product as any).stock < quantity) throw new Error('Insufficient stock');

            let cart = await Cart.findOne({ userId });
            if (!cart) {
                cart = new Cart({ userId, items: [], total: 0 });
            }

            const existingIndex = cart.items.findIndex(
                (item: any) => item.itemId.toString() === itemId
            );

            if (existingIndex >= 0) {
                cart.items[existingIndex].quantity += quantity;
            } else {
                cart.items.push({ itemId, quantity, price: (product as any).price });
            }

            cart.total = cart.items.reduce(
                (sum: number, item: any) => sum + item.price * item.quantity,
                0
            );

            await cart.save();
            logger.info(`Product ${itemId} added to cart for user ${userId}`);
            return { success: true, cart };
        } catch (error) {
            logger.error(`Error adding to cart for user ${userId}`, error);
            throw error;
        }
    }

    async getCart(userId: string) {
        try {
            const cart = await Cart.findOne({ userId })
                .populate('items.itemId', 'name imageUrl price stock')
                .lean();

            if (!cart) {
                return { items: [], total: 0 };
            }

            return cart;
        } catch (error) {
            logger.error(`Error fetching cart for user ${userId}`, error);
            throw error;
        }
    }

    async checkout(userId: string, data: any) {
        try {
            const { paymentId, shippingAddress } = data;

            const cart = await Cart.findOne({ userId });
            if (!cart || cart.items.length === 0) {
                throw new Error('Cart is empty');
            }

            // Verify stock availability for all items
            for (const item of cart.items) {
                const product = await Product.findById(item.itemId);
                if (!product) throw new Error(`Product ${item.itemId} not found`);
                if ((product as any).stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${(product as any).name}`);
                }
            }

            // Decrement stock
            for (const item of cart.items) {
                await Product.findByIdAndUpdate(item.itemId, {
                    $inc: { stock: -item.quantity },
                });
            }

            const order = new Order({
                userId,
                items: cart.items.map((item: any) => ({
                    itemId: item.itemId,
                    quantity: item.quantity,
                    price: item.price,
                })),
                total: cart.total,
                status: 'confirmed',
                paymentId,
                shippingAddress,
            });

            await order.save();

            // Clear the cart after successful order
            cart.items = [] as any;
            cart.total = 0;
            await cart.save();

            logger.info(`Order ${order._id} created for user ${userId}`);
            return { orderId: order._id, status: order.status };
        } catch (error) {
            logger.error(`Error during checkout for user ${userId}`, error);
            throw error;
        }
    }

    async getOrders(userId: string) {
        try {
            const orders = await Order.find({ userId })
                .populate('items.itemId', 'name imageUrl')
                .sort({ createdAt: -1 })
                .lean();

            return orders;
        } catch (error) {
            logger.error(`Error fetching orders for user ${userId}`, error);
            throw error;
        }
    }
}

export default new MarketplaceService();
