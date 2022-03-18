import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { jwtPassport } from './lib/jwt-tools.js';
import { isInvalid } from './lib/template-helpers.js';
import { cartRouter } from './routes/cart-routes.js';
import { categoriesRouter, menuRouter } from './routes/menu-router.js';
import { ordersRouter } from './routes/orders-routes.js';
import { usersRouter } from './routes/users-routes.js';
import { websockets } from './websocket-server.js';

dotenv.config();

const {
  PORT: port = 3000,
  SESSION_SECRET: sessionSecret,
  DATABASE_URL: connectionString,
} = process.env;

if (!connectionString || !sessionSecret) {
  console.error('Vantar gögn í env');
  process.exit(1);
}

const app = express();

// Sér um að req.body innihaldi gögn úr formi
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const path = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(path, '../public')));

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    maxAge: 20 * 1000, // 20 sek
  })
);

app.locals = {
  isInvalid,
};

app.use(jwtPassport.initialize());

app.use('/users', usersRouter);
app.use('/menu', menuRouter);
app.use('/categories', categoriesRouter);
app.use('/cart', cartRouter);
app.use('/orders', ordersRouter);

/** Middleware sem sér um 404 villur. */
app.use((req, res) => {
  res.status(404).json({ msg: '404 Not found' });
});

/** Middleware sem sér um villumeðhöndlun. */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const title = 'Villa kom upp';
  res.status(500).render('error', { title });
});

const server = app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});

websockets(server);
