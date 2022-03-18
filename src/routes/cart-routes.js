
import express from 'express';
import { validationResult } from 'express-validator';
import { catchErrors } from '../lib/catch-errors.js';
import {
  addToCart,
  createCart, deleteCart, findCartById, findLinesInCart, getLineInCart, getMenuItemById
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

  const result = await findLinesInCart(cartid)
  console.log(result);
  if (!result) {
    next();
    return;
  }

  if (result.length === 0) {
    res.json({ msg: 'The cart is empty' });
    return;
  }


  let totalcost = 0;
  let totalitems = 0;
  // loopa til að telja total items i körfu og price
  for (let i = 0; i < result.length; i++) {
    const { itemid } = result[i];
    const itemdata = await getMenuItemById(itemid);
    const cost = itemdata.price * result[i].total;
    const totaldata = result[i].total
    totalcost += cost;
    totalitems += totaldata;
  }

  const cartInfo = {
    numitemsincart: totalitems,
    totalprice: totalcost
  };

  res.json({ data: result, cartInfo });
}


async function addItem(req, res, next) {

  const valResulst = validationResult(req);
  const { cartid } = req.params;
  const { itemid, num } = req.body;


  if (!valResulst.isEmpty()) {
    next();
    return;
  }


  const menuid = await getMenuItemById(itemid);


  if (!menuid) {
    next();
    return;
  }

  const result = await addToCart(cartid, menuid.itemid, num);

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


  if (!cart) {
    res.json({ msg: 'no cart with that id exists' });
    next();
    return;
  }
  const tempcartid = cart.cartid;
  await deleteCart(cart);

  res.json({ msg: '200 deleted cart with id: ', data: tempcartid });

}

async function getoneLine(req, res, next) {
  const valResults = validationResult(req);
  const { cartid, id } = req.params;



  if (!valResults.isEmpty()) {
    res.status(400).json({ msg: '400 Bad request', data: valResults.errors });
    return;
  }

  const line = await getLineInCart(cartid, id);
  if (!line) {
    res.json({ msg: 'no line with that cartid and line id exists' });
    next();
  }
  const { itemid } = line;

  const itemdata = await getMenuItemById(itemid);
  if (!itemdata) {
    res.json({ msg: 'item doesnt have id' });
    next();
  }
  const itemInfo = {
    numitems: line.total,
    title: itemdata.title,
    price: itemdata.price * line.total,
    description: itemdata.description,
    image: itemdata.image
  };

  res.json({ data: line, itemInfo });

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

cartRouter.get('/:cartid/line/:id', catchErrors(getoneLine));

cartRouter.patch('/:cartid/line/:id', catchErrors());
/*

cartRouter.delete('/:slug',);

cartRouter.get('cart/:cartid/line/:id',);
cartRouter.patch('cart/:cartid/line/:id',);
cartRouter.delete('cart/:cartid/line/:id',);

*/
