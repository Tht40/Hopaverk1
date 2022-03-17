import express from 'express';
import { param, query, validationResult } from 'express-validator';
import xss from 'xss';
import { catchErrors } from '../lib/catch-errors.js';
import { getCategoriesPage, getMenu, getMenuItemById } from '../lib/db.js';

export const menuRouter = express.Router();
export const categoriesRouter = express.Router();

async function getMenuRoute(req, res) {
    const { category, search } = req.query;
    let { page } = req.query;
    const valResults = validationResult(req);
    const limit = 10;

    if (!valResults.isEmpty()) {
        res.status(400).json({ msg: '400 Bad request', data: valResults.errors });
        return;
    }

    if (!page) {
        page = 1;
    }

    page = page - 1;

    // Fallið sækir eftir category ef category er ekki null
    // Annars sækir fallið alla items.
    const menuItems = await getMenu(page * limit, limit, category, search);

    let url = req.protocol + '://' + req.get('host') + req.originalUrl + '?';

    if (category) {
        url += 'category=' + category + '&';
    }
    if (search) {
        url += 'search=' + search + '&';
    }
    page = page + 1;

    res.json({
        data: menuItems,
        _links: {
            self: {
                href: url + 'page=' + page,
            },
            previous: {
                href: url + 'page=' + (page - 1 > 0 ? page - 1 : page),
            },
            next: {
                href: url + 'page=' + (page + 1),
            },
        }
    });
}

async function getMenuByIdRoute(req, res, next) {
    const { id } = req.params;
    const valResults = validationResult(req);

    if (!valResults.isEmpty()) {
        next(); // 404 not found
        return;
    }

    const menuItem = await getMenuItemById(id);

    if (!menuItem) {
        next();
        return;
    }

    res.json({ data: menuItem });
}

async function getCategoriesRoute(req, res) {
    const valResults = validationResult(req);
    let { page } = req.query;

    const limit = 10;

    if (!valResults.isEmpty()) {
        res.status(400).json({ msg: '400 Bad request', data: valResults.errors });
        return;
    }

    if (!page) {
        page = 1;
    }

    page = page - 1;

    const results = await getCategoriesPage(limit * page, limit);

    page = page + 1;
    const nextPage = page + 1;

    const url = req.protocol + '://' + req.get('host');

    res.json({
        data: results,
        _links: {
            self: {
                href: url + '/categories?page=' + page,
            },
            next: {
                href: url + '/categories?page=' + nextPage,
            }
        },
    });
}

// Route fyrir menu router
const menuItemsValidationChain = [
    query('page')
        .optional()
        .trim()
        .isInt()
        .withMessage('page must be a number')
        .toInt(),
    query('search')
        .optional()
        .trim(),
    query('category')
        .optional()
        .trim()
        .isInt()
        .withMessage('category must be a number')
        .toInt(),
];
const menuItemsXssClean = [
    query('page')
        .customSanitizer((value) => xss(value)),
    query('search')
        .customSanitizer((value) => xss(value)),
    query('category')
        .customSanitizer((value) => xss(value)),
];
menuRouter.get('/', menuItemsValidationChain, menuItemsXssClean, catchErrors(getMenuRoute));
const menuItemByIdValidationChain = [
    param('id')
        .trim()
        .isInt()
        .withMessage('id must be an integer'),
];

const menuItemByIdXssClean = [
    param('id')
        .customSanitizer((value) => xss(value)),
];

menuRouter.get('/:id', menuItemByIdValidationChain, menuItemByIdXssClean, catchErrors(getMenuByIdRoute));

// Route fyrir categories router
const categoriesValidationChain = [
    query('page')
        .optional()
        .trim()
        .isInt()
        .withMessage('page must be a number')
        .toInt(),
];
const xssCleanCategories = [
    query('page')
        .optional()
        .customSanitizer((value) => xss(value)),
];

categoriesRouter.get('/', categoriesValidationChain, xssCleanCategories, catchErrors(getCategoriesRoute));