const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de sesión
app.use(session({
    secret: 'gratifix-unova-secret',
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// Configuración de Google OAuth
passport.use(new GoogleStrategy({
    clientID: "591914072848-394jua1rdivse5dji7vfh6tl212r58h8.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "/auth/google/callback"
},
(accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

// Serialización
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Configuración para servir archivos públicos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ruta raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta de autenticación con Google
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Ruta de callback de Google
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/profile');
    }
);

// Ruta de perfil (panel de usuario)
app.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// Ruta de logout
app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
