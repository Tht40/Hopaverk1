INSERT INTO public.categories
    (title)
VALUES
    ('Pizzur');

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


INSERT INTO public.cart
    (cartid)
VALUES
    ('f99f5811-2c07-4c6d-8e53-1d17927c3962');
INSERT INTO public.order
    (orderid)
VALUES
    ('f4fe8717-9db3-467d-a12f-b5b8de909531');


INSERT INTO users
    (name, username, password, admin)
VALUES
    ('admin adminsson', 'admin', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', '1');
INSERT INTO users
    (name, username, password, admin)
VALUES
    ('user userson', 'user', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', '0');
