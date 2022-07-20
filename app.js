require('dotenv').config();
const express = require("express");
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocacalMongoose = require('passport-local-mongoose');
const flash = require('connect-flash');
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static('public'));
app.set('view-engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: "our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_URI);

const todoSchema = new mongoose.Schema({
    task: String
});

const Todo = new mongoose.model('Todo', todoSchema);

const userSchema = new mongoose.Schema({
    username: String,
    fullname: String,
    password: String,
    date: {
        type: Date,
        default: Date.now,
    },
    todo: [todoSchema]
});


userSchema.plugin(passportLocacalMongoose);

const User = new mongoose.model("User", userSchema);


passport.use(User.createStrategy());
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, {
            id: user.id,
            username: user.username,
            picture: user.picture
        });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});


app.use(flash());

//Global Vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

app.get('/', (req, res) => {
    res.render('login.ejs');
});
app.post('/', (req, res) => {
    let errors = [];
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    if (user.username === '' || user.password === '') {

        errors.push({ msg: "Invalid Credintials" })
        res.render('login.ejs', { errors })
    }

    req.logIn(user, (err) => {

        if (err) {
            errors.push({ msg: "Cannot authorize" })
            res.render('login.ejs', { errors });
        }
        else {
            passport.authenticate("local")(req, res, () => {
                res.redirect('/dashboard');
            });
        }
    });
})
app.get('/register', (req, res) => {

    res.render('register.ejs');
});

app.post('/register', (req, res) => {
    let errors = [];
    // const { email, name, password, password2 } = req.body;
    const name = req.body.fullname;
    const email = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    //Check passwords match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' })
    }

    //Check pass length
    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register.ejs', {
            errors, name, email, password, password2
        })
    }
    else {
        User.register({ username: email, fullname: name }, password, (err, user) => {
            if (err) {
                console.log(err);
                res.redirect('/register');
            }
            else {
                passport.authenticate('local')(req, res, () => {
                    res.redirect('/dashboard');
                });
            }
        });
    }
});

app.get('/dashboard', (req, res) => {
    if (req.isAuthenticated()) {
        User.findOne({ username: req.user.username }, (err, userData) => {
            if (err)
                console.log(err);
            else {

                res.render('dashboard.ejs', { user: userData })
            }
        })
    }
    else {
        res.redirect('/');
    }
});

app.get('/logout', (req, res) => {
    req.logout(err => {
        if (err)
            console.log(err);
        else
            res.redirect('/')
    })
});
app.get('/todo', (req, res) => {
    if (req.isAuthenticated()) {
        User.findOne({ username: req.user.username }, (err, userData) => {
            res.render('todo.ejs', { todo: userData.todo });

        });
    }
    else {
        res.redirect('/');
    }
});

app.post('/newtask', (req, res) => {
    const newTask = new Todo({
        task: req.body.newtask
    });
    User.findOneAndUpdate({ username: req.user.username }, {
        $push: {
            todo: newTask
        }
    }, (err) => {
        if (err)
            console.log(err);
        else {
            res.redirect('/todo');
        }
    });
});

app.get('/todo/delete/:id', (req, res) => {
    const id = req.params.id
    const user = req.user
    if (req.isAuthenticated()) {
        User.findOne({ username: user.username }, function (err, data) {
            const result = data.todo.id(id).remove();
            data.save(err => {
                res.redirect('/todo');
            });

        });
    }
})

app.post('/todo/update/:id', (req, res) => {
    const id = req.params.id
    const user = req.user
    if (req.isAuthenticated()) {
        User.findOne({ username: user.username }, function (err, data) {
            data.todo.id(id).task = req.body.updatedtitle;
            data.save(err => {
                if (err)
                    console.log(err);
                else
                    res.redirect('/todo');
            });

        });
    }
});

app.get('/task/q1', (req, res) => {
    if (req.isAuthenticated())
        res.render('q1.ejs');
    else
        res.redirect('/');
});

app.get('/task/q2', (req, res) => {
    if (req.isAuthenticated())
        res.render('q2.ejs');
    else
        res.redirect('/');
});


app.listen(PORT, () => {
    console.log(`server started listening at ${PORT}`);
})