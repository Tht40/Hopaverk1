import bcrypt from 'bcrypt';
import express from 'express';
import { validationResult } from 'express-validator';
import { catchErrors } from '../lib/catch-errors.js';
import { getPasswordByUsername, getUserByUsername, listUsers } from '../lib/db.js';
import { ensureIsAdmin, generateAccessToken, jwtPassport } from '../lib/jwt-tools.js';
import { createUser, findById } from '../lib/users.js';

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
  console.log(req.user);

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
  const User = {
    id: user.id,
    name: user.name,
    username: user.username,
    admin: user.admin,
  };

  res.json({
    User
  });
}

async function viewMe(req, res) {
  res.json(
    req.user
  );
}

async function patchMe(req, res) {
  const { slug } = req.params;
  const user = await findById(slug);
  if (!user) {
    res.JSON({ message: 'User not found.' });
  }
}


async function patchUser(req, res) {
  const { slug } = req.params;
  const { } = req.user;
  const message = "Admin user cannot revoke his own admin rights.";

}

usersRouter.get('/me', jwtPassport.authenticate('jwt', { session: false }),
  catchErrors(viewMe));
usersRouter.patch('/me', jwtPassport.authenticate('jwt', { session: false }),
  catchErrors(patchMe));

usersRouter.get('/:slug', jwtPassport.authenticate('jwt', { session: false }),
  ensureIsAdmin, catchErrors(viewUser));
usersRouter.patch('/:slug', jwtPassport.authenticate('jwt', { session: false }),
  ensureIsAdmin, catchErrors(patchUserAdmin));

usersRouter.get('/', jwtPassport.authenticate('jwt', { session: false }),
  ensureIsAdmin, catchErrors(allUsers));

usersRouter.post('/login', catchErrors(loginRoute));

// býr til nýjann account
usersRouter.post('/register', (req, res) => {

  const { name, username, password } = req.body;

  if (JSON.stringify(getUserByUsername(username)) === '{}') {
    createUser(name, username, password);

    const selectedUser = getUserByUsername(username);
    const userToSend = {
      id: selectedUser.id,
      name: selectedUser.name,
      username: selectedUser.username,
      admin: selectedUser.admin,
    };
    const token = generateAccessToken(userToSend);

    res.json({ token });
    return;
  }

  const message = 'Notandi er nú þegar til.';
  res.json({
    message
  });

});