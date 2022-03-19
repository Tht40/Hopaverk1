import express from 'express';
import { query, validationResult } from 'express-validator';
import xss from 'xss';
import { catchErrors } from '../lib/catch-errors.js';
import {
    createOrder, findOrderById, listOrders, setOrderState
} from '../lib/db.js';
import { ensureIsAdmin, jwtPassport } from '../lib/jwt-tools.js';

export const ordersRouter = express.Router();

// eslint-disable-next-line no-unused-vars
async function allOrders(req, res) {
    let { page } = req.query;
    const limit = 10;
    if (!page) {
        page = 1;
    }

    page -= 1;

    const orders = await listOrders(page * limit, limit);
    const url = req.protocol + '://' + req.get('host');

    page += 1;

    res.json({
        msg: '200 OK',
        data: orders,
        _links: {
            self: {
                href: url + '/orders?page=' + page
            },
            previous: {
                href: url + '/orders?page=' + (page == 1 ? page : page - 1),
            },
            next: {
                href: url + '/orders?page=' + (page + 1),
            }
        }
    });
}

async function newOrder(req, res, next) {
    const valResults = validationResult(req);
    const { cartid, name } = req.body;



    if (!valResults.isEmpty()) {
        next();
        return
    }

    const Order = await createOrder(cartid, name)

    if (!Order) {
        res.json({ msg: 'something went wrong while creating an order' });
    }

    const { orderid } = Order;

    const statuschange = await setOrderState('NEW', orderid);

    const orderInfo = {
        OrderID: orderid,
        Name: name,
        Status: statuschange.orderlvl
    };


    res.json({ data: orderInfo });
}

async function viewOrder(req, res) {
    const { orderid } = req.params;

    const order = await findOrderById(orderid);

    if (!order) {
        res.JSON({ message: 'Engin pöntun fannst.' });
    }

    const cart = await findLinesInCart(orderid);
    if (!cart) {
        res.JSON({ message: 'Engin karfa fannst.' });
    }

    let totalcost = 0;
    let totalitems = 0;
    const itemsarr = [];
    // loopa til að telja total items i körfu og price
    for (let i = 0; i < cart.length; i += 1) {
        const { itemid } = cart[i];
        // eslint-disable-next-line no-await-in-loop
        const itemdata = await getMenuItemById(itemid);
        const cost = itemdata.price * cart[i].total;
        const totaldata = cart[i].total
        itemsarr.push(String(`${itemdata.title} x ${totaldata}`));
        totalcost += cost;
        totalitems += totaldata;
    }

    const status = await seeOrderState(orderid);
    const { orderlvl } = status;

    const orderInfo = {
        OrderID: orderid,
        NumberofItems: totalitems,
        PriceofItems: totalcost,
        items: itemsarr,
        Status: orderlvl
    };

    res.json({
        orderInfo
    });
}


async function viewOrderHistory(req, res) {
    const { id } = req.params;
    const order = await findOrderById(id);

    if (!order) {
        res.JSON({ message: 'Engin pöntun fannst.' });
    }

    res.json({
        order
    });
}

// eslint-disable-next-line no-unused-vars
async function updateOrder(req, res) {
    return null;
}




ordersRouter.get('/:orderid', catchErrors(viewOrder));

ordersRouter.get('/:id/status', catchErrors(viewOrderHistory));
ordersRouter.post('/:id/status', jwtPassport.authenticate('jwt', { session: false }),
    ensureIsAdmin, catchErrors(updateOrder));

const allOrdersValidation = [
    query('page')
        .optional()
        .isInt()
        .withMessage('id must be an integer')
        .toInt(),
];
const allOrdersXss = [
    query('page')
        .customSanitizer((value) => xss(value)),
];
ordersRouter.get('/', jwtPassport.authenticate('jwt', { session: false }), ensureIsAdmin, allOrdersValidation, allOrdersXss,
    catchErrors(allOrders));
ordersRouter.post('/', catchErrors(newOrder));
