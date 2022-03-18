
import express from 'express';
import { validationResult } from 'express-validator';
import { catchErrors } from '../lib/catch-errors.js';
import {
  addToCart,
  createCart, deleteCart, findCartById, findLinesInCart,
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


async function addItem(req, res, next) {

  const valResulst = validationResult(req);
  const { cartid } = req.params;
  const { id, num } = req.body;


  if (!valResulst.isEmpty()) {
    next();
    return;
  }


  const menuid = await getMenuItemById(id);


  if (!menuid) {
    next();
    return;
  }

  const result = await addToCart(cartid, menuid.id, num);

  res.json({ data: result });


}

async function deleteWholeCart(req, res, next) {
  // TODO: Tékka hvort notandi sé loggaður inn
  const valResults = validationResult(req);
  const { cartid } = req.params;

  if (!valResults.isEmpty()) {
    res.status(400).json({ msg: '400 Bad request', data: valResults.errors });
    return;
  }
  const cart = await findCartById(cartid)

  console.log(cart);

  if (!cart) {
    res.json({ msg: 'no cart with that id exists' });
    next();
    return;
  }
  const tempcartid = cart.cartid;
  await deleteCart(cart);

  res.json({ msg: '200 deleted cart with id: ', data: tempcartid });

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

cartRouter.post('/:cartid', catchErrors(addItem));

cartRouter.delete('/:cartid', catchErrors(deleteWholeCart));
/*

cartRouter.delete('/:slug',);

cartRouter.get('cart/:cartid/line/:id',);
cartRouter.patch('cart/:cartid/line/:id',);
cartRouter.delete('cart/:cartid/line/:id',);

*/
