import jwt from 'jsonwebtoken';
import passport from 'passport';
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt';
import { getUserByUsername } from './db.js';

const { TOKEN_SECRET } = process.env;

export const jwtPassport = passport;

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: TOKEN_SECRET,
};

passport.use(new JWTStrategy(jwtOptions, (jwtPayload, done) => {
    const user = jwtPayload;
    return done(null, user);
}));

export function generateAccessToken(user) {
    return jwt.sign(user, TOKEN_SECRET, { expiresIn: '20000s' });
}

export async function ensureIsAdmin(req, res, next) {
    const { token } = req.body;
    const { username } = jwt.verify(token, TOKEN_SECRET);
    const user = await getUserByUsername(username);
    const { admin } = user;

    if (!admin || admin == '0') {
        res.json({ message: 'Notandi hefur ekki réttindi' });
    }
    else {
        return next();
    }
};