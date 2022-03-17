import { readFile } from 'fs/promises';
import pg from 'pg';

const SCHEMA_FILE = './sql/schema.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';

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

export async function getMenu(offset, limit, category, search) {
  if (search) {
    search = '%' + search + '%';
  }

  let nrOfArguments = 0;

  let q = `SELECT * FROM public.items`;

  if (category || search) {
    q = q + ' WHERE';
  }

  if (category) {
    nrOfArguments += 1;
    q = q + ` CATEGORY = $${nrOfArguments}`;
  }

  if (category && search) {
    q = q + ' AND';
  }

  if (search) {
    nrOfArguments += 1;
    q = q + ` (LOWER(title) like LOWER($${nrOfArguments}) OR LOWER(description) LIKE LOWER($${nrOfArguments}))`;
  }

  q = q + ` OFFSET $${nrOfArguments + 1} LIMIT $${nrOfArguments + 2}`;

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
    SELECT * FROM public.items WHERE id = $1;
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

  return results.rows;
}

export async function getCategoriesPage(offset, limit) {
  const q = `
    SELECT * FROM public.categories LIMIT $1 OFFSET $2
  `;

  const results = await query(q, [limit, offset]);

  return results.rows;
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

export async function insertMenuItem(title, description, category, price, url = 'Not uploaded') {
  const q = `
    INSERT INTO public.items (title, price, description, category, image)
      VALUES ($1, $2, $3, $4, $5) RETURNING id
  `;

  const result = await query(q, [title, price, description, category, url]);

  const { id } = result.rows[0];

  return id;
}

export async function deleteMenuItem(id) {
  const q = `
    DELETE FROM public.items WHERE id=$1
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

export async function listUsers() {
  const q = `
    SELECT
     name, username, id
    FROM
      users
  `;

  const result = await query(q);

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
