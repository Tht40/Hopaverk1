CREATE EXTENSION
IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.categories
(
  id SERIAL PRIMARY KEY,
  title VARCHAR(64) NOT NULL UNIQUE
);

CREATE TABLE public.items
(
  id SERIAL PRIMARY KEY,
  title VARCHAR(64) NOT NULL UNIQUE,
  price INTEGER NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(256) NOT NULL,
  category INTEGER NOT NULL REFERENCES categories(id),
  created TIMESTAMP
  WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP
  WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);


  CREATE TABLE public.users
  (
    id serial primary key,
    name character varying(64) NOT NULL,
    username character varying(64) NOT NULL,
    password character varying(256) NOT NULL,
    admin bit NOT NULL
  );

  CREATE TABLE public.cart
  (
    id uuid PRIMARY KEY default uuid_generate_v4(),
    created TIMESTAMP
    WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

    CREATE TABLE public.order
    (
      id uuid PRIMARY KEY default uuid_generate_v4(),
      created TIMESTAMP
      WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
 name VARCHAR
      (64) NOT NULL
);


/*CONSTRAINT event FOREIGN KEY
      (event) REFERENCES events
      (id);*/
