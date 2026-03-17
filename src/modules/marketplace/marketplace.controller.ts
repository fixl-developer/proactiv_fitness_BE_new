import { Request, Response } from 'express';
import marketplaceService from './marketplace.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';

class MarketplaceController {
    getProducts = asyncHandler(async (req: Request, res: Response) => {
        const products = await marketplaceService.getProducts(req.query);
        res.json({ success: true, data: products });
    });

    getProductById = asyncHandler(async (req: Request, res: Response) => {
        const product = await marketplaceService.getProductById(req.params.id);
        res.json({ success: true, data: product });
    });

    createProduct = asyncHandler(async (req: Request, res: Response) => {
        const product = await marketplaceService.createProduct(req.body);
        res.status(201).json({ success: true, data: product });
    });

    updateProduct = asyncHandler(async (req: Request, res: Response) => {
        const product = await marketplaceService.updateProduct(req.params.id, req.body);
        res.json({ success: true, data: product });
    });

    deleteProduct = asyncHandler(async (req: Request, res: Response) => {
        await marketplaceService.deleteProduct(req.params.id);
        res.json({ success: true, message: 'Product deleted' });
    });

    searchProducts = asyncHandler(async (req: Request, res: Response) => {
        const products = await marketplaceService.searchProducts(req.query.q as string);
        res.json({ success: true, data: products });
    });

    getCategories = asyncHandler(async (req: Request, res: Response) => {
        const categories = await marketplaceService.getCategories();
        res.json({ success: true, data: categories });
    });

    addToCart = asyncHandler(async (req: Request, res: Response) => {
        const result = await marketplaceService.addToCart(req.user.id, req.body);
        res.json({ success: true, data: result });
    });

    getCart = asyncHandler(async (req: Request, res: Response) => {
        const cart = await marketplaceService.getCart(req.user.id);
        res.json({ success: true, data: cart });
    });

    checkout = asyncHandler(async (req: Request, res: Response) => {
        const order = await marketplaceService.checkout(req.user.id, req.body);
        res.json({ success: true, data: order });
    });

    getOrders = asyncHandler(async (req: Request, res: Response) => {
        const orders = await marketplaceService.getOrders(req.user.id);
        res.json({ success: true, data: orders });
    });
}

export default new MarketplaceController();
