import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as AppleStrategy } from 'passport-apple';
import { Strategy as SpotifyStrategy } from 'passport-spotify';
import prisma from './prismaClient';
import dotenv from 'dotenv';

dotenv.config();

// Session serialization
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user || undefined);
    } catch (error) {
        done(error as Error, undefined);
    }
});

// Helpers
function firstEmail(profile: any): string | undefined {
    return profile?.emails?.[0]?.value as string | undefined;
}

function firstPhoto(profile: any): string | null {
    const p = profile?.photos?.[0];
    if (!p) return null;
    if (typeof p === 'string') return p;
    if (typeof p?.value === 'string') return p.value;
    return null;
}

// Google Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackURL:
                process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback',
            scope: ['profile', 'email']
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                let user = await prisma.user.findUnique({ where: { googleId: profile.id } });
                if (!user) {
                    const email = firstEmail(profile);
                    if (email) {
                        user = await prisma.user.findUnique({ where: { email } });
                        if (user) {
                            user = await prisma.user.update({ where: { id: user.id }, data: { googleId: profile.id } });
                        } else {
                            user = await prisma.user.create({
                                data: {
                                    email,
                                    name: profile.displayName,
                                    profileImage: firstPhoto(profile),
                                    googleId: profile.id
                                }
                            });
                        }
                    }
                }
                return done(null, user || undefined);
            } catch (e) {
                return done(e as Error, undefined);
            }
        }
    )
);

// Apple Strategy
passport.use(
    new AppleStrategy(
        {
            clientID: process.env.APPLE_CLIENT_ID || '',
            teamID: process.env.APPLE_TEAM_ID || '',
            keyID: process.env.APPLE_KEY_ID || '',
            callbackURL:
                process.env.APPLE_CALLBACK_URL || 'http://localhost:4000/auth/apple/callback',
            privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH || '',
            passReqToCallback: true
        },
        // Apple sends limited profile info; email may be present only on first auth
        async (req: any, _accessToken, _refreshToken, _idToken, profile, done) => {
            try {
                const appleId = profile.id as string;
                let user = await prisma.user.findUnique({ where: { appleId } });

                if (!user) {
                    const email: string | undefined = req?.body?.email || firstEmail(profile);
                    if (email) {
                        user = await prisma.user.findUnique({ where: { email } });
                        if (user) {
                            user = await prisma.user.update({ where: { id: user.id }, data: { appleId } });
                        } else {
                            const first = req?.body?.name?.firstName;
                            const last = req?.body?.name?.lastName;
                            user = await prisma.user.create({
                                data: {
                                    email,
                                    name: first && last ? `${first} ${last}` : undefined,
                                    appleId
                                }
                            });
                        }
                    }
                }
                return done(null, user || undefined);
            } catch (e) {
                return done(e as Error, undefined);
            }
        }
    )
);

// Spotify Strategy
passport.use(
    new SpotifyStrategy(
        {
            clientID: process.env.SPOTIFY_CLIENT_ID || '',
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
            callbackURL:
                process.env.SPOTIFY_CALLBACK_URL || 'http://localhost:4000/auth/spotify/callback'
        },
        async (_accessToken, _refreshToken, _expiresIn, profile, done) => {
            try {
                let user = await prisma.user.findUnique({ where: { spotifyId: profile.id } });
                if (!user) {
                    const email = firstEmail(profile);
                    if (email) {
                        user = await prisma.user.findUnique({ where: { email } });
                        if (user) {
                            user = await prisma.user.update({ where: { id: user.id }, data: { spotifyId: profile.id } });
                        } else {
                            user = await prisma.user.create({
                                data: {
                                    email,
                                    name: profile.displayName,
                                    profileImage: firstPhoto(profile),
                                    spotifyId: profile.id
                                }
                            });
                        }
                    }
                }
                return done(null, user || undefined);
            } catch (e) {
                return done(e as Error, undefined);
            }
        }
    )
);

export default passport;
