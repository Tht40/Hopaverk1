<<<<<<< HEAD
CREATE TABLE public.items
(
=======
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.items (
>>>>>>> 4f60c3d066b2f3b97353171f7d0f8908751cfe5d
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

<<<<<<< HEAD
  CREATE TABLE public.categoreis
  (
    id SERIAL PRIMARY KEY,
    Title VARCHAR(64) NOT NULL UNIQUE,
    comment TEXT,
    event INTEGER NOT NULL,
    created TIMESTAMP
    WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
=======
CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  Title VARCHAR(64) NOT NULL UNIQUE,
  comment TEXT,
  event INTEGER NOT NULL,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
>>>>>>> 4f60c3d066b2f3b97353171f7d0f8908751cfe5d

);

    CREATE TABLE public.users
    (
      id serial primary key,
      name character varying(64) NOT NULL,
      username character varying(64) NOT NULL,
      password character varying(256) NOT NULL,
      admin bit NOT NULL
    );

<<<<<<< HEAD
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
=======
CREATE TABLE public.cart (
  id uuid DEFAULT uuid_generate_v4 (),
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.order (
  id uuid DEFAULT uuid_generate_v4 (),
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(64) NOT NULL
>>>>>>> 4f60c3d066b2f3b97353171f7d0f8908751cfe5d
);


/*CONSTRAINT event FOREIGN KEY (event) REFERENCES events (id)*/
