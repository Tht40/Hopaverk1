import express from 'express';
import { catchErrors } from '../lib/catch-errors.js';
import { listUsers } from '../lib/db.js';
import passport, { ensureLoggedIn } from '../lib/login.js';
import { createUser, findById, findByUsername } from '../lib/users.js';

export const usersRouter = express.Router();



async function allUsers(req, res) {
  const users = await listUsers();

  res.json({
    users
  });
}

async function viewUser(req, res) {
  const { slug } = req.params;
  const user = await findById(slug);

  if (!user) {
    res.JSON({ message: 'User not found.' });
  }

  res.json({
    user
  });
}


usersRouter.get('/:slug', ensureLoggedIn, catchErrors(viewUser));

usersRouter.get('/', ensureLoggedIn, catchErrors(allUsers));

usersRouter.post(
  '/login',

  // Þetta notar strat að ofan til að skrá notanda inn
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/users/login',
  }),

  // Ef við komumst hingað var notandi skráður inn, senda á /admin
  (req, res) => {
    res.json({ token: 'token here' });
  }
);

// býr til nýjann account
usersRouter.post('/register', (req, res) => {

  const { name, username, password } = req.body;
  if (JSON.stringify(findByUsername(username)) === '{}') {
    createUser(name, username, password);
    const token = 'token here';
    res.json({ token });
  }

  const message = 'Notandi er nú þegar til.';
  res.json({
    message
  });

});