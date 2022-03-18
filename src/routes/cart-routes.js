
import express from 'express';
import { validationResult } from 'express-validator';
import { catchErrors } from '../lib/catch-errors.js';
import {
  addToCart,
  createCart,
  findCartById,
  findLinesInCart,
  getMenuItemById
} from '../lib/db.js';


export const cartRouter = express.Router();

async function postCartRoute(req, res, next) {
  const valResults = validationResult(req);


  if (!valResults.isEmpty()) {
    next();
    return
  }

  const newCart = await createCart()

  if (!newCart) {
    console.log('hehe');
    next();
    return;
  }

  res.json({ data: newCart });
}

async function getCartidRoute(req, res, next) {
  const valResults = validationResult(req);
  const { cartid } = req.params;

  if (!valResults.isEmpty()) {
    next();
    return;
  }

  const result = findLinesInCart(cartid)

  if (!result) {
    next();
    return;
  }


  res.json({ data: result });
}


async function addItem(req, res) {
  /* const valResulst = validationResult(req); */
  const { cartid } = req.params;
  const { id } = req.body;

  /*
    if (!valResulst.isEmpty()) {
      next();
      return;
    }
  */
  const cart = findCartById(cartid);
  const menuid = getMenuItemById(id);
  const result = addToCart(cart, menuid);


  res.json({ data: result });

}
/*

async function eventRoute(req, res, next) {
  const { cartid } = req.params;
  const cart = await listCart(slug);

  if (!cart) {
    return next();
  }

  return cart  total price og öllum items í cart ;
}
*/


cartRouter.post('/', catchErrors(postCartRoute));

cartRouter.get('/:cartid', catchErrors(getCartidRoute));

cartRouter.post('/:cartid,', catchErrors(addItem));
/*

cartRouter.delete('/:slug',);

cartRouter.get('cart/:cartid/line/:id',);
cartRouter.patch('cart/:cartid/line/:id',);
cartRouter.delete('cart/:cartid/line/:id',);

*/
