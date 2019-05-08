var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  let templateVars = { urls: urlDatabase };
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
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});