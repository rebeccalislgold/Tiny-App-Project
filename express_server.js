var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users =
  { '45965a':
     { id: '45965a',
       email: 'rebecca.gold@mail.mcgill.ca',
       password: 'test'
     }
  };

let addNewUser = function(email, password) {

  const user_id = generateRandomString()

  const newUser = {
    id: user_id,
    email: email,
    password: password
  }

  users[user_id] = newUser;

  return user_id;

}

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const newID = generateRandomString();
  urlDatabase[newID] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let urlToDelete = req.params.shortURL
  let templateVars = {shortURL: urlToDelete}
  delete urlDatabase[urlToDelete];
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

//FINISH THIS
app.post("/urls/:shortURL", (req, res) => {
  // let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // let newLongURL = req.body
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  urlDatabase[req.params.shortURL] = req.body.newLongURL;
  // res.render("urls_show", templateVars);
  res.redirect("/urls");

});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {

  var email = req.body.email;
  var password = req.body.password;

  //In Users obj, loop through the users and find the email and corresponding password.
  //Validate that the passwords match.

  if (checkExistingUser(email)) {

    var us_id = findUserID(email);

    if (users[us_id].password === password) {

      // Set the cookie to login the user with their user ID
      res.cookie('user_id', us_id);

      // Redirect to main page
      res.redirect('/urls');

    } else {

      //Return error if invalid password entered;
      res.status(403).send('Access denied: invalid password');

    }

  } else {

    res.status(403).send('Access denied: invalid email address');

  }

});

app.post("/logout", (req, res) => {

  res.clearCookie('user_id');
  res.redirect('/urls');

});

app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_registration", templateVars);
});

var checkExistingUser = function(email) {

  for (var uid in users) {

    if (users[uid].email === email ) {

      return true;

    }

  }

  return false;

}

/// NEED FIND USER FUNCTION

var findUserID = function(email) {

  for (var uid in users) {

    if (users[uid].email === email ) {

      return uid;

    }

  }

  return false;

}


app.post("/register", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;

  if (email === '') {

    res.status(400).send('Please enter a valid email address.');

  } else if (password === '') {

    res.status(400).send('Please enter a valid password.');

  } else if (checkExistingUser(email)) {

    res.status(400).send('Email already exists!');

  } else {

    addNewUser(email, password);
    console.log(users);

    res.cookie('user_id', addNewUser(email, password))

    res.redirect('/urls');

  }

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});