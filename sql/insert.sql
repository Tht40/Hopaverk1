INSERT INTO public.categories
    (title)
VALUES
    ('Pizzur');

INSERT INTO public.items
    (Title, Price, description, category, image)
VALUES
    ('Ananas pizza', '1890', 'Pizza með ananas', 1, 'https://res.cloudinary.com/dil4cpy2p/image/upload/v1647543490/k8otldcxtmfsusdtehrd.png');

INSERT INTO users
    (name, username, password, admin)
VALUES
    ('admin adminsson', 'admin', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', '1');
INSERT INTO users
    (name, username, password, admin)
VALUES
    ('user userson', 'user', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', '0');

