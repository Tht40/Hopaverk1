CREATE EXTENSION
IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.categories
(
  id SERIAL PRIMARY KEY,
  title VARCHAR(64) NOT NULL UNIQUE
);

CREATE TABLE public.items
(
  itemid SERIAL PRIMARY KEY,
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
    email character varying(64) NOT NULL,
    password character varying(256) NOT NULL,
    admin bit NOT NULL
  );

  CREATE TABLE public.cart
  (
    cartid uuid PRIMARY KEY default uuid_generate_v4(),
    created TIMESTAMP
    WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

  CREATE TABLE public.order
  (
    orderid uuid PRIMARY KEY default uuid_generate_v4(),
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name VARCHAR(64) NOT NULL
);

      CREATE TABLE public.line
      (
        id serial primary key,
        cartid uuid,
        itemid SERIAL,
        total INTEGER,

        FOREIGN KEY (cartid) REFERENCES cart(cartid),
        FOREIGN KEY (itemid) REFERENCES items(itemid)

      );

      CREATE TABLE public.lineorder
      (
        id serial primary key,
        orderid uuid,
        itemid SERIAL,
        total INTEGER,

        FOREIGN KEY (orderid) REFERENCES public.order(orderid),
        FOREIGN KEY (itemid) REFERENCES items(itemid)

      );

      CREATE TABLE public.statusorder
      (
        id serial primary key,
        orderid uuid,
        orderlvl VARCHAR(64),
        updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (orderid) REFERENCES public.order(orderid)
      )

