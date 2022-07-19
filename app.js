require('dotenv').config();
const express = require("express");
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocacalMongoose = require('passport-local-mongoose');
const e = require('connect-flash');
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

mongoose.connect("mongodb+srv://Shubh:lptcI7Ix1Dx7B9OI@cluster0.90qsz.mongodb.net/myuserDB");

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

app.get('/', (req, res) => {
    res.render('login.ejs');
});
app.post('/', (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.logIn(user, (err) => {
        if (err)
            console.log(err);
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
    const newUser = req.body;
    if (newUser.password === newUser.password2) {
        User.register({ username: newUser.username, fullname: newUser.fullname }, newUser.password, (err, user) => {
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