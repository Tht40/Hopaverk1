import express from 'express';
import { catchErrors } from '../lib/catch-errors.js';
import { findOrderById } from '../lib/db.js';

export const ordersRouter = express.Router();


async function allOrders(req, res) {
    const orders = await findOrderById();

    res.json({
        orders
    });
}

async function viewOrder(req, res) {
    const { slug } = req.params;
    const order = await findOrderById(slug);

    if (!order) {
        res.JSON({ message: 'Engin pöntun fannst.' });
    }

    res.json({
        order
    });
}

async function viewOrderHistory(req, res) {
    const { slug } = req.params;
    const order = await findOrderById(slug);

    if (!order) {
        res.JSON({ message: 'Engin pöntun fannst.' });
    }

    res.json({
        order
    });
}



ordersRouter.get('/:slug', catchErrors(viewOrder));

ordersRouter.post('/:slug/status', catchErrors(viewOrderHistory));

ordersRouter.get('/', catchErrors(allOrders));