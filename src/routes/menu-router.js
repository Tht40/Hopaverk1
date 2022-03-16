import express from 'express';
import { catchErrors } from '../lib/catch-errors.js';
import { getMenu } from '../lib/db.js';

export const menuRouter = express.Router();

async function getMenuRoute(req, res) {
    const menuItems = await getMenu();

    res.json({ data: menuItems });
}

menuRouter.get('/', catchErrors(getMenuRoute));
