import { Router } from 'express';
import marketplaceController from './marketplace.controller';
import { authenticate } from '@/middleware/auth';

const router = Router();

router.get('/products', marketplaceController.getProducts);
router.get('/products/search', marketplaceController.searchProducts);
router.get('/products/:id', marketplaceController.getProductById);
router.post('/products', authenticate, marketplaceController.createProduct);
router.put('/products/:id', authenticate, marketplaceController.updateProduct);
router.delete('/products/:id', authenticate, marketplaceController.deleteProduct);

router.get('/categories', marketplaceController.getCategories);

router.use(authenticate);
router.post('/cart', marketplaceController.addToCart);
router.get('/cart', marketplaceController.getCart);
router.post('/checkout', marketplaceController.checkout);
router.get('/orders', marketplaceController.getOrders);

export default router;
