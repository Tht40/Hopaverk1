import bcrypt from 'bcrypt';
import express from 'express';
import { validationResult } from 'express-validator';
import { catchErrors } from '../lib/catch-errors.js';
import { getPasswordByUsername, getUserByUsername, listUsers } from '../lib/db.js';
import { generateAccessToken } from '../lib/jwt-tools.js';
import { ensureLoggedIn } from '../lib/login.js';
import { createUser, findById, findByUsername } from '../lib/users.js';

export const usersRouter = express.Router();

// Föll fyrir login routerinn
async function loginRoute(req, res) {
  const valResults = validationResult(req);

  if (!valResults.isEmpty()) {
    res.status(400).json({ msg: '400 Bad request', data: valResults.errors });
    return;
  }

  const { username, password } = req.body;

  const selectedPassword = await getPasswordByUsername(username);
  const selectedUser = await getUserByUsername(username);

  if (!selectedPassword) {
    res.status(403).json({ msg: '403 Forbidden password or username incorrect' });
    return;
  }

  const passwordCorrect = await bcrypt.compare(password, selectedPassword);

  if (!passwordCorrect) {
    res.status(403).json({ msg: '403 Forbidden password or username incorrect' });
    return;
  }

  const userToSend = {
    id: selectedUser.id,
    name: selectedUser.name,
    username: selectedUser.username,
    admin: selectedUser.admin,
  };

  const token = generateAccessToken(userToSend);

  res.json({ token });
}

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
  catchErrors(loginRoute)
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