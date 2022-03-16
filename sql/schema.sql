CREATE EXTENSION
IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.items
(
  id SERIAL PRIMARY KEY,
  Title VARCHAR(64) NOT NULL UNIQUE,
  Price INTEGER NOT NULL UNIQUE,
  description TEXT NOT NULL,
  /*image longblob NOT NULL,*/
  category INTEGER NOT NULL,
  created TIMESTAMP
  WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP
  WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

  CREATE TABLE public.categoreis
  (
    id SERIAL PRIMARY KEY,
    Title VARCHAR(64) NOT NULL UNIQUE,
    comment TEXT,
    event INTEGER NOT NULL,
    created TIMESTAMP
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


/*CONSTRAINT event FOREIGN KEY (event) REFERENCES events (id)*/
