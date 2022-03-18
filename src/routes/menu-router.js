import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import multer from 'multer';
import xss from 'xss';
import { catchErrors } from '../lib/catch-errors.js';
import { uploadFileBuffer } from '../lib/cloudinary.js';
import {
    deleteCategory, deleteMenuItem,
    getCategoriesPage,
    getCategoryById,
    getCategoryByTitle,
    getMenu,
    getMenuItemById,
    getMenuItemByTitle,
    getMenuItemsByCategory,
    insertCategory,
    insertMenuItem,
    updateMenuItem
} from '../lib/db.js';

export const menuRouter = express.Router();
export const categoriesRouter = express.Router();

const upload = multer();

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

    page -= 1;

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
    page += 1;

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

async function postMenuItemRoute(req, res) {
    // TODO: Tékka hvort að notandi sé loggaður inn
    const valResults = validationResult(req);
    let otherError = false;
    let errors = valResults.errors;

    if (!req.file) {
        otherError = true;
        errors.push({
            value: '',
            msg: 'Picture cannot be empty',
            param: 'picture',
            location: 'body',
        });
    } else if (req.file.mimetype !== 'image/png' && req.file.mimetype !== 'image/jpeg') {
        otherError = true;
        errors.push({
            value: '',
            msg: 'Picture not correct type',
            param: 'picture',
            location: 'body',
        });
    }

    const {
        title, description, category, price
    } = req.body;

    const itemResult = await getMenuItemByTitle(title);

    if (itemResult) {
        otherError = true;
        errors.push({
            value: '',
            msg: 'Title taken',
            param: 'title',
            location: 'body',
        });
    }

    if (!valResults.isEmpty() || otherError) {
        res.status(400).json({ msg: '400 Bad request', data: valResults.errors });
        return;
    }

    const itemId = await insertMenuItem(title, description, category, price);

    uploadFileBuffer(itemId, req.file.buffer);

    res.status(201).json({ msg: '201 Created' });
}

async function deleteMenuItemRoute(req, res, next) {
    //TODO: passa að notandi þarf að vera loggaður inn til þess að gera þetta

    const valResults = validationResult(req);
    const { id } = req.params;

    if (!valResults.isEmpty()) {
        res.status(400).json({ msg: '400 Bad request', data: valResults.errors });
        return;
    }

    const item = await getMenuItemById(id);

    if (!item) {
        next();
        return;
    }

    await deleteMenuItem(id);

    res.json({ msg: '200 Deleted' });
}

async function updateMenuItemRoute(req, res, next) {
    // TODO: tékka hvort að notandi sé skráður inn.
    const valResults = validationResult(req);

    if (!valResults.isEmpty()) {
        res.status(400).json({ msg: '400 Bad request', data: valResults.errors });
        return;
    }

    const {
        title,
        price,
        description,
        category,
    } = req.body;

    const { id } = req.params;

    const item = await getMenuItemById(id);

    if (!item) {
        next();
        return;
    }

    const item2 = await getMenuItemByTitle(title);

    if (item2 && item2.id !== id) {
        res.status(400).json({
            msg: '400 Bad request', data: [{
                msg: 'Menu item with same title already exists',
            }]
        });
        return;
    }

    if (!title && !price && !description && !category) {
        res.json({ msg: '200 Updated' });
        return;
    }

    if (category) {
        const categoryCheck = await getCategoryById(category);
        if (!categoryCheck) {
            res.status(400).json({
                msg: '400 Bad request', data: [{
                    msg: 'category does not exist',
                }]
            });
            return;
        }
    }

    await updateMenuItem(id, title, price, description, category);

    res.json({ msg: '200 Updated' });
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

    page -= 1;

    const results = await getCategoriesPage(limit * page, limit);

    page += 1;
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

async function createCategoryRoute(req, res) {
    // TODO: Tékka hvort notandi sé loggaður inn

    const valResults = validationResult(req);

    if (!valResults.isEmpty()) {
        res.status(400).json({ msg: '400 Bad request', data: valResults.errors });
        return;
    }

    const { title } = req.body;

    const checkIfExists = await getCategoryByTitle(title);

    if (checkIfExists) {
        res.status(400).json({ msg: '400 Bad request category with the same title already exists' });
    }

    const results = await insertCategory(title);

    res.json({ msg: '200 Created', data: [results] });
}

async function deleteCategoryRoute(req, res, next) {
    // TODO: Tékka hvort notandi sé loggaður inn
    const valResults = validationResult(req);
    const { id } = req.params;

    if (!valResults.isEmpty()) {
        res.status(400).json({ msg: '400 Bad request', data: valResults.errors });
        return;
    }

    const checkIfExists = await getCategoryById(id);

    if (!checkIfExists) {
        next();
        return;
    }

    // Athuga hvort að það séu einhver item sem tilheyra þessum flokki.
    const itemsInCategory = await getMenuItemsByCategory(id);

    if (itemsInCategory) {
        res.status(400).json({
            msg: '400 Bad request', data: [{
                msg: 'Cannot delete category because there are items that belong to this category',
            }]
        });

        return;
    }

    await deleteCategory(id);

    res.json({ msg: '200 deleted' });
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

const postMenuItemValidators = [
    body('title')
        .trim()
        .escape()
        .isLength({ min: 1 })
        .withMessage('Title cannot be empty'),
    body('price')
        .trim()
        .isInt()
        .withMessage('Price needs to be an integer')
        .toInt(),
    body('description')
        .trim()
        .escape()
        .isLength({ min: 1 })
        .withMessage('description cannot be empty'),
    body('category')
        .trim()
        .isInt()
        .withMessage('category must be an integer')
        .toInt(),
];
const postMenuItemXssClean = [
    body('title')
        .customSanitizer((value) => xss(value)),
    body('price')
        .customSanitizer((value) => xss(value)),
    body('description')
        .customSanitizer((value) => xss(value)),
    body('category')
        .customSanitizer((value) => xss(value)),
];
menuRouter.post('/', upload.single('picture'), postMenuItemValidators,
    postMenuItemXssClean, catchErrors(postMenuItemRoute))

const menuItemByIdValidationChain = [
    param('id')
        .trim()
        .isInt()
        .withMessage('id must be an integer')
        .toInt(),
];

const menuItemByIdXssClean = [
    param('id')
        .customSanitizer((value) => xss(value)),
];
menuRouter.get('/:id', menuItemByIdValidationChain,
    menuItemByIdXssClean, catchErrors(getMenuByIdRoute));

const deleteMenuItemValidation = [
    param('id')
        .isInt()
        .withMessage('Id verður að vera tala')
        .toInt(),
];
const deleteMenuItemXssClean = [
    param('id')
        .customSanitizer((value) => xss(value)),
];
menuRouter.delete('/:id', deleteMenuItemValidation,
    deleteMenuItemXssClean, catchErrors(deleteMenuItemRoute))

const updateMenuItemValidation = [
    param('id')
        .isInt()
        .withMessage('Id verður að vera tala')
        .toInt(),
    body('title')
        .optional()
        .trim()
        .escape()
        .isLength({ max: 64 })
        .withMessage('title cannot be longer than 64 letters'),
    body('price')
        .optional()
        .isInt()
        .withMessage('Price must be an integer')
        .toInt(),
    body('description')
        .optional()
        .trim()
        .escape(),
    body('category')
        .optional()
        .isInt()
        .withMessage('category must be an integer')
        .toInt(),
];
const updateMenuItemXssClean = [
    param('id')
        .customSanitizer((value) => xss(value)),
    body('title')
        .customSanitizer((value) => xss(value)),
    body('price')
        .customSanitizer((value) => xss(value)),
    body('description')
        .customSanitizer((value) => xss(value)),
    body('category')
        .customSanitizer((value) => xss(value)),
];
menuRouter.patch('/:id', updateMenuItemValidation, updateMenuItemXssClean, catchErrors(updateMenuItemRoute));

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

const createCategoryValidation = [
    body('title')
        .trim()
        .escape()
        .isLength({ max: 64 })
        .withMessage('title cannot be longer than 64 letter')
        .isLength({ min: 1 })
        .withMessage('title cannot be empty'),
];
const createCategoryXssClean = [
    body('title')
        .customSanitizer((value) => xss(value)),
];
categoriesRouter.post('/', createCategoryValidation, createCategoryXssClean, catchErrors(createCategoryRoute));

const deleteCategoryValidation = [
    param('id')
        .isInt()
        .withMessage('id verður að vera tala')
        .toInt()
];
const deleteCategoryXssClean = [
    param('id')
        .customSanitizer((value) => xss(value))
];

categoriesRouter.delete('/:id', deleteCategoryValidation, deleteCategoryXssClean, catchErrors(deleteCategoryRoute));