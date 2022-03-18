import express from 'express';
import { validationResult } from 'express-validator';
import { catchErrors } from '../lib/catch-errors.js';
import { findOrderById, createOrder } from '../lib/db.js';
import { ensureIsAdmin } from '../lib/jwt-tools.js';

export const ordersRouter = express.Router();


async function allOrders(req, res) {
  const orders = await findOrderById();

  res.json({
    orders
  });
}

async function newOrder(req, res, next) {
  const valResults = validationResult(req);


  if (!valResults.isEmpty()) {
    next();
    return
  }

  const newOrder = await createOrder()

  if (!newOrder) {
    next();
    return;
  }

  res.json({ data: newOrder });
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


async function updateOrder(req, res) {
  return null;
}




ordersRouter.get('/:slug', catchErrors(viewOrder));

ordersRouter.get('/:slug/status', catchErrors(viewOrderHistory));
ordersRouter.post('/:slug/status', jwtPassport.authenticate('jwt', { session: false }), ensureIsAdmin, catchErrors(updateOrder));


ordersRouter.get('/', jwtPassport.authenticate('jwt', { session: false }), ensureIsAdmin, catchErrors(allOrders));
ordersRouter.post('/', catchErrors(newOrder));
