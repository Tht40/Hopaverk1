import { readFile } from 'fs/promises';
import pg from 'pg';

const SCHEMA_FILE = './sql/schema.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';
const INSERT_DATA_FILE = './sql/insert.sql';

const { DATABASE_URL: connectionString, NODE_ENV: nodeEnv = 'development' } =
  process.env;

if (!connectionString) {
  console.error('vantar DATABASE_URL í .env');
  process.exit(-1);
}

// Notum SSL tengingu við gagnagrunn ef við erum *ekki* í development
// mode, á heroku, ekki á local vél
const ssl = nodeEnv === 'production' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

export async function query(q, values = []) {
  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    console.error('unable to get client from pool', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    if (nodeEnv !== 'test') {
      console.error('unable to query', e);
    }
    return null;
  } finally {
    client.release();
  }
}

export async function createSchema(schemaFile = SCHEMA_FILE) {
  const data = await readFile(schemaFile);

  return query(data.toString('utf-8'));
}

export async function dropSchema(dropFile = DROP_SCHEMA_FILE) {
  const data = await readFile(dropFile);

  return query(data.toString('utf-8'));
}

export async function insertData(insertFile = INSERT_DATA_FILE) {
  const data = await readFile(insertFile);

  return query(data.toString('utf-8'));
}

export async function getMenu(offset, limit, category, search) {
  if (search) {
    // eslint-disable-next-line no-param-reassign
    search = `%${search}%`;
  }

  let nrOfArguments = 0;

  let q = 'SELECT * FROM public.items';

  if (category || search) {
    q += ' WHERE';
  }

  if (category) {
    nrOfArguments += 1;
    q += ` CATEGORY = $${nrOfArguments}`;
  }

  if (category && search) {
    q += ' AND';
  }

  if (search) {
    nrOfArguments += 1;
    q += ` (LOWER(title) like LOWER($${nrOfArguments}) OR LOWER(description) LIKE LOWER($${nrOfArguments}))`;
  }

  q += ` OFFSET $${nrOfArguments + 1} LIMIT $${nrOfArguments + 2}`;

  let result;

  if (category && search) {
    result = await query(q, [category, search, offset, limit]);
  } else if (category) {
    result = await query(q, [category, offset, limit]);
  } else if (search) {
    result = await query(q, [search, offset, limit]);
  } else {
    result = await query(q, [offset, limit]);
  }

  return result.rows;
}

export async function getMenuItemById(id) {
  const q = `
    SELECT * FROM public.items WHERE itemid = $1;
  `;

  const results = await query(q, [id]);

  if (results.rows.length === 0) {
    return null;
  }

  return results.rows[0];
}

export async function getMenuItemByTitle(title) {
  const q = `
    SELECT * FROM public.items WHERE title=$1
  `;

  const results = await query(q, [title]);

  if (results.rows.length === 0) {
    return null;
  }

  return results.rows[0];
}

export async function getOrderByName(name) {
  const q = `
    SELECT * FROM public.order WHERE name=$1
  `;

  const results = await query(q, [name]);

  if (results.rows.length === 0) {
    return null;
  }

  return results.rows[0];
}




export async function getMenuItemsByCategory(category) {
  const q = `
    SELECT * FROM public.items WHERE category=$1
  `;

  const results = await query(q, [category]);

  if (results.rows.length === 0) {
    return null;
  }

  return results.rows;
}

export async function getCategoriesPage(offset, limit) {
  const q = `
    SELECT * FROM public.categories LIMIT $1 OFFSET $2
  `;

  const results = await query(q, [limit, offset]);

  return results.rows;
}

export async function getCategoryByTitle(title) {
  const q = `
    SELECT * FROM public.categories WHERE title=$1
  `;

  const results = await query(q, [title]);

  if (results.rows.length === 0) {
    return null;
  }

  return results.rows[0];
}

export async function getCategoryById(id) {
  const q = `
    SELECT * FROM public.categories WHERE id=$1
  `;

  const results = await query(q, [id]);

  if (results.rows.length === 0) {
    return null;
  }

  return results.rows[0];
}

export async function getPasswordByUsername(username) {
  const q = `
    SELECT password from public.users WHERE username=$1
  `;

  const results = await query(q, [username]);

  if (results.rows.length === 0) {
    return null;
  }
  return results.rows[0].password;
}

export async function getUserByUsername(username) {
  const q = `
  SELECT id, name, username, admin FROM public.users WHERE username=$1
`;

  const results = await query(q, [username]);

  if (results.rows.length === 0) {
    return null;
  }

  return results.rows[0];
}

export async function getUserById(id) {
  const q = `
  SELECT id, name, username, admin FROM public.users WHERE id=$1
`;

  const results = await query(q, [id]);

  if (results.rows.length === 0) {
    return null;
  }

  return results.rows[0];
}

export async function createCart() {
  const q = `
    INSERT INTO cart
    VALUES
    (DEFAULT, DEFAULT)
    RETURNING cartid;
  `;

  const result = await query(q);

  if (result) {
    return result.rows[0];
  }
  return null;
}

export async function createOrder(cartid, name) {
  const q = `
    INSERT INTO public.order
    (orderid, created, name)
    VALUES
    ($1, DEFAULT, $2)
    RETURNING orderid, name;
  `;

  const result = await query(q, [cartid, name]);

  if (result) {

    return result.rows[0];
  }
  return null;
}

export async function createEvent({ name, slug, description } = {}) {
  const q = `
    INSERT INTO events
      (name, slug, description)
    VALUES
      ($1, $2, $3)
    RETURNING id, name, slug, description;
  `;
  const values = [name, slug, description];
  const result = await query(q, values);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function updateMenuItemImage(id, url) {
  const q = `
    UPDATE public.items SET image=$1 WHERE id=$2
  `;

  await query(q, [url, id]);
}

export async function updateUserPassword(val, username) {
  const q = `
    UPDATE public.users SET password=$1 WHERE username=$2
  `;

  await query(q, [val, username]);
}

export async function updateUserEmail(val, username) {
  const q = `
    UPDATE public.users SET email=$1 WHERE username=$2
  `;

  await query(q, [val, username]);
}

export async function updateAdmin(val, username) {
  const q = `
    UPDATE public.users SET admin=$1 WHERE username=$2
  `;

  await query(q, [val, username]);
}

export async function updateMenuItem(id, title, price, description, category) {
  let q = `
    UPDATE public.items SET
  `;

  const params = [];
  let nrOfParams = 0;

  if (title) {
    nrOfParams += 1;
    q += ` title=$${nrOfParams},`;
    params.push(title);
  }

  if (price) {
    nrOfParams += 1;
    q += ` price=$${nrOfParams},`;
    params.push(price);
  }

  if (description) {
    nrOfParams += 1;
    q += ` description=$${nrOfParams},`;
    params.push(description);
  }

  if (category) {
    nrOfParams += 1;
    q += ` category=$${nrOfParams},`;
    params.push(category);
  }

  q += ' updated=CURRENT_TIMESTAMP';

  q += ` WHERE id=$${nrOfParams + 1}`;
  params.push(id);

  await query(q, params);
}

export async function updateCategory(id, title) {
  const q = `
    UPDATE public.categories SET title=$1 WHERE id=$2
  `;

  await query(q, [title, id]);
}

export async function updateCartLine(total, cartid) {
  const q = `
  UPDATE public.line SET total=$1 WHERE cartid=$2
`;

  await query(q, [total, cartid]);
}



export async function insertMenuItem(title, description, category, price, url = 'Not uploaded') {
  const q = `
    INSERT INTO public.items (title, price, description, category, image)
      VALUES ($1, $2, $3, $4, $5) RETURNING id
  `;

  const result = await query(q, [title, price, description, category, url]);

  const { id } = result.rows[0];

  return id;
}

export async function insertCategory(title) {
  const q = `
    INSERT INTO public.categories (title) VALUES ($1) RETURNING *
  `;

  const results = await query(q, [title]);

  return results.rows[0];
}

export async function deleteMenuItem(id) {
  const q = `
    DELETE FROM public.items WHERE id=$1
  `;

  await query(q, [id]);
}

export async function deleteCategory(id) {
  const q = `
    DELETE FROM public.categories WHERE id = $1
  `;

  await query(q, [id]);
}

export async function deleteCart(id) {
  const q = `
    DELETE FROM public.cart WHERE cartid = $1;
  `;

  await query(q, [id]);
}

export async function deleteLine(id) {
  const q = `
    DELETE FROM public.line WHERE id = $1;
  `;

  await query(q, [id]);
}

// Updatear ekki description, erum ekki að útfæra partial update
export async function updateEvent(id, { name, slug, description } = {}) {
  const q = `
    UPDATE events
      SET
        name = $1,
        slug = $2,
        description = $3,
        updated = CURRENT_TIMESTAMP
    WHERE
      id = $4
    RETURNING id, name, slug, description;
  `;
  const values = [name, slug, description, id];
  const result = await query(q, values);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function register({ name, comment, event } = {}) {
  const q = `
    INSERT INTO registrations
      (name, comment, event)
    VALUES
      ($1, $2, $3)
    RETURNING
      id, name, comment, event;
  `;
  const values = [name, comment, event];
  const result = await query(q, values);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}


export async function listItems() {
  const q = `
    SELECT
      id, Title, Price, description, image, category, created, updated
    FROM
      items
  `;

  const result = await query(q);

  if (result) {
    return result.rows;
  }

  return null;
}

export async function seeOrderState(id) {
  const q = `
  SELECT * FROM public.statusorder WHERE orderid = $1
  `;

  const result = await query(q, [id]);

  if (result) {
    return result.rows[0];
  }

  return null;
}

export async function setOrderState(status, id) {
  const q = `
    INSERT INTO public.statusorder
    (orderlvl, orderid)
    VALUES
    ($1, $2)
    RETURNING orderlvl, updated;
  `;

  const result = await query(q, [status, id]);

  if (result) {
    return result.rows[0];
  }
  return null;

}

/* eslint-disable-next-line */
export async function updateOrderState(status, id) {
  const q = `
    UPDATE public.statusorder SET orderlvl=$1 WHERE orderid = $2;
  `;

  await query(q, [status, id]);


}


export async function listOrders(offset = 0, limit = 10) {
  const q = 'SELECT * FROM public.order ORDER BY created OFFSET $1 LIMIT $2';

  try {
    const result = await query(q, [offset, limit]);

    if (result) {
      return result.rows;
    }
  } catch (e) {
    console.error('Engar pantanir fundust');
  }

  return null;
}

export async function findOrderById(id) {
  const q = `
    SELECT * FROM public.order WHERE orderid = $1;
  `;

  const result = await query(q, [id]);

  if (result.rows.length === 0) {

    return null;
  }

  return result.rows[0];

}

export async function findCartById(id) {
  const q = `
    SELECT * FROM cart WHERE cartid = $1;
  `;

  const result = await query(q, [id]);

  if (result.rows.length === 0) {

    return null;
  }

  return result.rows[0];

}

export async function findLinesInCart(cartid) {
  const q = `
    SELECT *
    FROM
      line
    WHERE
      cartid = $1;
  `;

  const result = await query(q, [cartid]);

  if (result) {
    return result.rows;
  }

  return null;
}

export async function findLinesInOrder(orderid) {
  const q = `
    SELECT *
    FROM
      lineorder
    WHERE
      orderid = $1;
  `;

  const result = await query(q, [orderid]);

  if (result) {
    return result.rows;
  }

  return null;
}

export async function getLineInCart(cartid, lineid) {
  const q = `
    SELECT *
    FROM
      line
    WHERE
      cartid = $1 AND id = $2;
  `;

  const result = await query(q, [cartid, lineid]);
  if (result) {
    return result.rows[0];
  }

  return null;
}


export async function addToCart(cartid, itemID, numberOfItems) {
  const q = `
    INSERT INTO line
      (cartid, itemid, total)
    VALUES
      ($1, $2, $3)
    RETURNING cartid, itemid, total;
  `;

  const result = await query(q, [cartid, itemID, numberOfItems]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;

}

export async function listEvents() {
  const q = `
    SELECT
      id, name, slug, description, created, updated
    FROM
      events
  `;

  const result = await query(q);

  if (result) {
    return result.rows;
  }

  return null;
}

export async function listUsers(offset = 0, limit = 10) {
  const q = `
    SELECT
     name, username, id, admin
    FROM
      users
      LIMIT $1 OFFSET $2
  `;

  const result = await query(q, [limit, offset]);

  if (result) {
    return result.rows;
  }

  return null;
}


export async function listEvent(slug) {
  const q = `
    SELECT
      id, name, slug, description, created, updated
    FROM
      events
    WHERE slug = $1
  `;

  const result = await query(q, [slug]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

// TODO gætum fellt þetta fall saman við það að ofan
export async function listEventByName(name) {
  const q = `
    SELECT
      id, name, slug, description, created, updated
    FROM
      events
    WHERE name = $1
  `;

  const result = await query(q, [name]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function listRegistered(event) {
  const q = `
    SELECT
      id, name, comment
    FROM
      registrations
    WHERE event = $1
  `;

  const result = await query(q, [event]);

  if (result) {
    return result.rows;
  }

  return null;
}

export async function end() {
  await pool.end();
}
