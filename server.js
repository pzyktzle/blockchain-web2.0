const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const publicPath = path.join(__dirname, "./public");
const paypal = require("paypal-rest-sdk");

const save_user_information = require("./models/server_db");

app.use(bodyParser.json());
app.use(express.static(publicPath));

// paypal config
paypal.configure({
  mode: "sandbox",
  client_id:
    "AQFvDKE7ZCnj2uWq-c-Owub_ZVjJ7oo4JT8FbxwkIwnkuVgBltUCH7HpeEWkgRxB3dVtEVDXVd1gjyfb",
  client_secret:
    "EBC_W9DLtwrZHaWjr9dR3p84Z-BH3QY6R5ZUPGhlJH-RmTbStwYj5wseJp6G9ReqWo_7CrYjt3nxnbGV"
});

app.post("/post_info", async (req, res) => {
  var email = req.body.email;
  var amount = req.body.amount;

  if (amount <= 1) {
    return_info = {};
    return_info.error = true;
    return_info.message = "The amount should be greater than 1";
    return res.send(return_info);
  }

  var result = await save_user_information({ amount: amount, email: email });
  res.send(result);
});

app.get("/get_total_amount", async (req, res) => {
  var result = await get_total_amount();
  res.send(result);
});

app.listen(3000, () => console.log("server is running on port 3000"));
