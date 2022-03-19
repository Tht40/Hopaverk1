import bcrypt from 'bcrypt';
import { validate } from 'email-validator';
import express from 'express';
import { query, validationResult } from 'express-validator';
import xss from 'xss';
import { catchErrors } from '../lib/catch-errors.js';
import { getPasswordByUsername, getUserByUsername, listUsers, updateAdmin, updateUserEmail, updateUserPassword } from '../lib/db.js';
import { ensureIsAdmin, generateAccessToken, jwtPassport } from '../lib/jwt-tools.js';
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
    email: selectedUser.email,
    username: selectedUser.username,
    admin: selectedUser.admin,
  };

  const token = generateAccessToken(userToSend);

  res.json({ token });
}
/* eslint-disable prefer-template */
// eslint-disable-next-line no-unused-vars
async function allUsers(req, res) {
  const valResults = validationResult(req);

  if (!valResults.isEmpty()) {
    res.status(400).json({ msg: '400 Bad request', data: valResults.errors });
    return;
  }

  let { page } = req.query;
  const limit = 10;

  if (!page) {
    page = 1;
  }

  page -= 1;

  const users = await listUsers(limit * page, limit);

  page += 1;

  const url = req.protocol + '://' + req.get('host');

  res.json({
    msg: '200 OK',
    data: users,
    _links: {
      self: {
        href: url + '/users?page=' + page,
      },
      previous: {
        href: url + '/users?page=' + (page === 1 ? page : page - 1),
      },
      next: {
        href: url + '/users?page=' + (page + 1),
      }
    }
  });
}

/* eslint-enable prefer-template */

async function viewUser(req, res) {
  const { slug } = req.params;
  const user = await findById(slug);
  if (!user) {
    res.JSON({ message: 'User not found.' });
  }
  const User = {
    id: user.id,
    name: user.name,
    email: user.email,
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
  const { username } = req.user;
  const { email, password } = req.body;

  await updateUserPassword(password, username);
  if (validate(email)) {
    await updateUserEmail(email, username);
  }

  const userToSend = await findByUsername(username);
  const token = generateAccessToken(userToSend);

  res.json({ token, userToSend });
}


async function patchUser(req, res) {
  const { slug } = req.params;
  const { username, id, admin } = req.user;
  if (String(id) === slug) {
    console.log("erher")
    return res.json({ message });
  }

  else if (admin === '0') {
    await updateAdmin('1', username);
    const message = `${username} admin status changed to: True`;
    res.json({ message });
  }
  else if (admin === '1') {
    await updateAdmin('0', username);
    const message = `${username} admin status changed to: False`;
    res.json({ message });
  }

}

usersRouter.get('/me', jwtPassport.authenticate('jwt', { session: false }),
  catchErrors(viewMe));
usersRouter.patch('/me', jwtPassport.authenticate('jwt', { session: false }),
  catchErrors(patchMe));

usersRouter.get('/:slug', jwtPassport.authenticate('jwt', { session: false }),
  ensureIsAdmin, catchErrors(viewUser));
usersRouter.patch('/:slug', jwtPassport.authenticate('jwt', { session: false }),
  ensureIsAdmin, catchErrors(patchUser));

const getAllUsersValidation = [
  query('page')
    .optional()
    .isInt()
    .withMessage('Page must be an integer'),
];
const getAllUsersXssClean = [
  query('page')
    .customSanitizer((value) => xss(value))
];
usersRouter.get('/', jwtPassport.authenticate('jwt', { session: false }),
  ensureIsAdmin, getAllUsersValidation, getAllUsersXssClean, catchErrors(allUsers));

usersRouter.post('/login', catchErrors(loginRoute));

// býr til nýjann account
usersRouter.post('/register', (req, res) => {

  const { name, username, email, password } = req.body;

  if (JSON.stringify(getUserByUsername(username)) === '{}') {
    createUser(name, username, email, password);

    const selectedUser = getUserByUsername(username);
    const userToSend = {
      id: selectedUser.id,
      name: selectedUser.name,
      email: selectedUser.email,
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