
import express from 'express';
import { validationResult } from 'express-validator';
import { catchErrors } from '../lib/catch-errors.js';
import { createCart } from '../lib/db.js';


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
/*
async function getCartidRoute(req, res, next){

}


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

/*
cartRouter.get('/:cartid', );
cartRouter.post('/:cartid,' (req,res) => {
  const {item, }
});
cartRouter.delete('/:slug',);

cartRouter.get('cart/:cartid/line/:id',);
cartRouter.patch('cart/:cartid/line/:id',);
cartRouter.delete('cart/:cartid/line/:id',);

*/
