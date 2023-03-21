var mongoClient = require("mongodb").MongoClient;
var express = require("express");
const jwt = require("jsonwebtoken");
const secretKey = "secretKey";
const session = require("express-session");
const axios = require("axios");

var url = "mongodb://127.0.0.1:27017";
var app = express();
const { ObjectId } = require("mongodb");
var bodyParser = require("body-parser");
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 1000 },
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var cors = require("cors");
const { response } = require("express");
app.use(cors());

app.post("/postUserDetails", async (req, resp) => {
  const { email, password } = req.body;
  const user = {
    email: email,
    password: password,
  };


  try {
    const client = await mongoClient.connect(url);
    const db = client.db("test");

    const result = await db.collection("userDetails").findOne(user);

    // console.log(result);
    let token;
    if (result) {
      token = jwt.sign( {email} , secretKey, { expiresIn: "1m" });

      token = token;
      resp.status(200).send({ token: token, username: email });
    }else{
      resp.status(401).send("user Id Or Password is wrong");

    }

  } catch (err) {
    console.error(err);
    resp.status(500).send(err);
  }
});




app.post("/profile", verifyToken, (req, resp) => {
  let token = req.body.headers.Authorization;
  console.log(token);
  if (token) {
    resp.status(200).send({ isToken: true, message: "success" });
  } else {
    resp.status(500).send({ isToken: true, message: "server error" });
  }
});




function verifyToken(req, res, next) {
  let token = req.body.headers.Authorization;
  console.log(req.headers)
  if (token) {
    token = token.split(" ")[1];
    // console.log("middleware called if", token);
    jwt.verify(token, secretKey, (err, valid) => {
      if (err) {
        res.status(401).send({ isToken: false, message: "Unauthorized" });

      } else {
        next();
      }
    });
  } else {
    res.status(404).send({ isToken: false, message: "token not found" });
  }
}

app.listen(8080);
console.log("server is run on 8080");
