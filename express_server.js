const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['baloney'],
}));


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "45965a" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  p6BoGm: { longURL: "https://www.lighthouselabs.ca", userID: "45965a" },
  h4BoKf: { longURL: "https://www.thebeatles.com", userID: "45965a" }
};


const users =
  { '45965a':
     { id: '45965a',
       email: 'rebecca.gold@mail.mcgill.ca',
       hashedPassword: '$2b$10$7zAOPtKq1yqeVsoP/awj7eizgpslpzA/aHC3vl6HJSnGVPOnB1eWG'
     },
    'aJ48lW':
     { id: 'aJ48lW',
       email: 'rebecca@mail.ca',
       hashedPassword: '$2b$10$5z0uSAx8/bzM.QSnZ2aVUeqVSBdZoXA9kbZ7/mK9NvKANcodxp1gq'
     },
     '7cba2f':
      { id: '7cba2f',
      email: 'test@test.com',
      hashedPassword: '$2b$10$zo/Ndj2.65.BzP3FH8ZB7u73HGfAeguoZhtFrL1XytNcvo0Yf59W6' }
  };


//Function to generate ID. Used for user ID and short URL ID.
const generateRandomString = function() {

  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);

}


//Function to add new URL to URL Database and associate to user
const addNewURL = function(website, userid) {

  const newID = generateRandomString();

  const newURL = {
    longURL: website,
    userID: userid
  }

  urlDatabase[newID] = newURL;

}


//Function to create a list of URLs based on the logged in user
const filteredUrlDB = function(database, user) {

  var newList = {};

  for (const urlID in database) {

    if (database[urlID].userID === user) {

      newList[urlID] = database[urlID];

    }

  }

  return newList;

}


//Function to add a new user to list of users. Used for registration.
const addNewUser = function(email, password) {

  const hashedPassword = bcrypt.hashSync(password, 10);
  const user_id = generateRandomString()

  const newUser = {
    id: user_id,
    email: email,
    hashedPassword: hashedPassword
  }

  users[user_id] = newUser;

  return user_id;
}


//Function to validate that user is logged in
const isLoggedIn = function(user) {

  if (user) {

    return true;

  }

}


//Function to return user based on email address
var findUser = function(email) {

  for (var uid in users) {

    if (users[uid].email === email ) {

      return users[uid];

    }

  }

  return false;

}


//Function to verify if email is already used during registration (email must be unique)
var checkExistingUser = function(email) {

  for (var uid in users) {

    if (users[uid].email === email ) {

      return true;

    }

  }

  return false;

}


app.get("/", (req, res) => {

  const userId = req.session.user_id;

  if (isLoggedIn(userId)) {

    res.redirect("/urls");

  } else {

    res.redirect("/login");

  }

});


app.get("/urls.json", (req, res) => {

  res.json(urlDatabase);

});


app.get("/hello", (req, res) => {

  res.send("<html><body>Hello <b>World</b></body></html>\n");

});


app.get("/urls", (req, res) => {

    let templateVars = { urls: filteredUrlDB(urlDatabase,req.session.user_id) , user: users[req.session.user_id] };
    res.render("urls_index", templateVars);

});


//Add new URL to "My URLs" (user's list of URLs)
app.post("/urls", (req, res) => {

  const newURL = req.body.longURL;
  const userId = req.session.user_id;
  addNewURL(newURL, userId);
  res.redirect("/urls");

});

//Delete URL from "My URLs" (user's list of URLs)
app.post("/urls/:shortURL/delete", (req, res) => {

  const userId = req.session.user_id;

  if (isLoggedIn(userId)) {

    if (urlDatabase[req.params.shortURL].userID === userId) {

      let urlToDelete = req.params.shortURL
      let templateVars = {shortURL: urlToDelete}
      delete urlDatabase[urlToDelete];
      res.redirect("/urls");

    } else {

      res.status(403).send('Error! This is not your URL.');

    }

  } else {

    res.status(403).send('Error! Please register or login.')

  }

});


app.get("/urls/new", (req, res) => {

  let templateVars = { user: users[req.session.user_id] };

  if (users[req.session.user_id]) {

    res.render("urls_new", templateVars);

  } else {

    res.redirect("/login");

  }

});


app.get("/urls/:shortURL", (req, res) => {

  const userId = req.session.user_id;

  if (isLoggedIn(userId)) {

    if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {

      let templateVars = { shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
        user: users[req.session.user_id]
      };

      res.render("urls_show", templateVars);

    } else {

      res.status(403).send('Error! Cannot view this URL.')

    }

  } else {

    res.status(403).send('Error! Please register or login.')

  }

});


//Edit existing URL. User must be logged in and URL must belong to user.
app.post("/urls/:shortURL", (req, res) => {

  const shortURL = req.params.shortURL;
  const newlongURL = req.body.newLongURL;
  const userId = req.session.user_id;

  if (isLoggedIn(userId)) {

    if(urlDatabase[shortURL].userID === userId) {

      urlDatabase[shortURL].longURL = newlongURL;
      res.redirect("/urls");

    } else {

      res.status(403).send('Error! This is not your URL.');

    }

  } else {

      res.status(403).send('Error! Please register or login.')

  }

});


app.get("/u/:shortURL", (req, res) => {

  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);

});


app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  res.render("urls_login", templateVars);
});


//Login to TinyApp
app.post("/login", (req, res) => {

  var email = req.body.email;
  var password = req.body.password;

  if (checkExistingUser(email)) {

    var us_id = findUser(email);

    if (bcrypt.compareSync(password, us_id.hashedPassword)) {

      req.session.user_id = us_id.id;

      res.redirect('/urls');

    } else {

      res.status(403).send('Access denied: invalid password');

    }

  } else {

    res.status(403).send('Access denied: invalid email address');

  }

});


//Logout of TinyApp (i.e. clear cookies) & return to homepage
app.post("/logout", (req, res) => {

  req.session = null;
  res.redirect('/urls');

});


app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  res.render("urls_registration", templateVars);
});


//Register for TinyApp
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

    req.session.user_id = addNewUser(email, password);

    res.redirect('/urls');

  }


});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});