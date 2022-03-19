INSERT INTO public.categories
    (title)
VALUES
    ('Pizzur');

INSERT INTO public.categories
    (title)
VALUES
    ('Pasta');

INSERT INTO public.categories
    (title)
VALUES
    ('Kebab');

INSERT INTO public.items
    (Title, Price, description, category, image)
VALUES
    ('Ananas pizza', '1890', 'Pizza með ananas', 1, 'https://static.wikia.nocookie.net/2007scape/images/4/42/Pineapple_pizza_detail.png/revision/latest?cb=20180415215111');

INSERT INTO public.items
    (Title, Price, description, category, image)
VALUES
    ('Pepperoni pizza', '1890', 'Pizza með pepperoni', 1, 'https://cdn.imgbin.com/5/0/21/imgbin-old-school-runescape-hawaiian-pizza-anchovy-anchovy-9qjc2NtRPwGm6G03QfFim2a5K.jpg');

INSERT INTO public.items
    (Title, Price, description, category, image)
VALUES
    ('Margarita pizza', '1290', 'Pizza með engu', 1, 'https://oldschool.runescape.wiki/images/thumb/Servery_incomplete_pizza_detail.png/1200px-Servery_incomplete_pizza_detail.png?5aaa7');

INSERT INTO public.items
    (Title, Price, description, category, image)
VALUES
    ('Hálf pizza', '1290', 'half pizza', 1, 'https://static.wikia.nocookie.net/2007scape/images/6/64/1-2_meat_pizza_detail.png/revision/latest?cb=20180415232800');

INSERT INTO public.items
    (Title, Price, description, category, image)
VALUES
    ('Kebab pizza', '3600', 'Pizza með kebabi', 1, 'https://static.wikia.nocookie.net/2007scape/images/6/64/1-2_meat_pizza_detail.png/revision/latest?cb=20180415232800');

INSERT INTO public.items
    (Title, Price, description, category, image)
VALUES
    ('Pasta carbonara', '21500', 'pasta með osti og skinku :)', 2, 'https://static.wikia.nocookie.net/2007scape/images/6/64/1-2_meat_pizza_detail.png/revision/latest?cb=20180415232800');

INSERT INTO public.items
    (Title, Price, description, category, image)
VALUES
    ('Spaghetti bolognese', '2990', 'spaghetti með kjötbollum', 2, 'https://static.wikia.nocookie.net/2007scape/images/6/64/1-2_meat_pizza_detail.png/revision/latest?cb=20180415232800');

INSERT INTO public.items
    (Title, Price, description, category, image)
VALUES
    ('Pasta alfredo', '2400', 'Veit ekki alveg hvað pasta alfredo er', 2, 'https://static.wikia.nocookie.net/2007scape/images/6/64/1-2_meat_pizza_detail.png/revision/latest?cb=20180415232800');

INSERT INTO public.items
    (Title, Price, description, category, image)
VALUES
    ('Shawarma', '2500', 'Kebab í vefju', 3, 'https://static.wikia.nocookie.net/2007scape/images/6/64/1-2_meat_pizza_detail.png/revision/latest?cb=20180415232800');

INSERT INTO public.items
    (Title, Price, description, category, image)
VALUES
    ('Kebab diskur', '1290', 'Kebab og diskur og franskar', 3, 'https://static.wikia.nocookie.net/2007scape/images/6/64/1-2_meat_pizza_detail.png/revision/latest?cb=20180415232800');

INSERT INTO public.items
    (Title, Price, description, category, image)
VALUES
    ('Pizza kebab', '1290', 'Kebab með pizzubragði', 3, 'https://static.wikia.nocookie.net/2007scape/images/6/64/1-2_meat_pizza_detail.png/revision/latest?cb=20180415232800');

INSERT INTO public.items
    (Title, Price, description, category, image)
VALUES
    ('shish kebab', '1290', 'Kebab á spjóti', 3, 'https://static.wikia.nocookie.net/2007scape/images/6/64/1-2_meat_pizza_detail.png/revision/latest?cb=20180415232800');


INSERT INTO public.cart
    (cartid)
VALUES
    ('f99f5811-2c07-4c6d-8e53-1d17927c3962');


INSERT INTO users
    (name, username, email, password, admin)
VALUES
    ('admin adminsson', 'admin', 'admin@admin.is' , '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', '1');
INSERT INTO users
    (name, username, email, password, admin)
VALUES
    ('user userson', 'user', 'user@user.is', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', '0');