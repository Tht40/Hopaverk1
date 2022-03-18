import jwt from 'jsonwebtoken';
import passport from 'passport';
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt';

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
    return jwt.sign(user, TOKEN_SECRET, { expiresIn: '8000s' });
}
