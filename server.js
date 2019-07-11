const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const publicPath = path.join(__dirname, "./public");
const paypal = require("paypal-rest-sdk");
const session = require("express-session");

const {
  save_user_information,
  get_list_of_participants
} = require("./models/server_db");

app.use(
  session({
    secret: "my web app",
    cookie: {
      maxAge: 60000
    }
  })
);

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

  var fee_amount = amount * 0.9;
  var result = await save_user_information({
    amount: fee_amount,
    email: email
  });

  req.session.paypal_amount = amount;

  var create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal"
    },
    redirect_urls: {
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel"
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Lottery",
              sku: "Funding",
              price: req.session.paypal_amount,
              currency: "USD",
              quantity: 1
            }
          ]
        },
        amount: {
          currency: "USD",
          total: req.session.paypal_amount
        },
        payee: {
          email: "lottery_manager123@lotteryapp.com"
        },
        description: "Lottery purchase"
      }
    ]
  };

  paypal.payment.create(create_payment_json, function(error, payment) {
    if (error) {
      throw error;
    } else {
      console.log("Create Payment Response");
      console.log(payment);
      for (var i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          return res.send(payment.links[i].href);
        }
      }
    }
  });
});

app.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  var execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: 100
        }
      }
    ]
  };
  paypal.payment.execute(paymentId, execute_payment_json, function(
    err,
    payment
  ) {
    if (err) {
      console.log(err.response.details);
      throw err;
    }
    console.log(payment);
  });
  res.redirect("http://localhost:3000");
});

app.get("/get_total_amount", async (req, res) => {
  var result = await get_total_amount();
  res.send(result);
});

app.get("/pick_winner", async (req, res) => {
  var result = await get_total_amount();
  var total_amount = result[0].total_amount;
  req.session.paypal_amount = total_amount;

  var list_of_participants = await get_list_of_participants();
  list_of_participants = JSON.parse(JSON.stringify(list_of_participants));

  var email_array = [];
  list_of_participants.forEach(function(element) {
    email_array.push(element.email);
  });
  var winner = email_array[Math.floor(Math.random() * email_array.length)];
  console.log(winner);
  return true;

  // create paypal payment
  var create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal"
    },
    redirect_urls: {
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel"
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Lottery",
              sku: "Funding",
              price: req.session.paypal_amount,
              currency: "USD",
              quantity: 1
            }
          ]
        },
        amount: {
          currency: "USD",
          total: req.session.paypal_amount
        },
        payee: {
          email: winner_email
        },
        description: "Pay winner!!!"
      }
    ]
  };

  paypal.payment.create(create_payment_json, function(error, payment) {
    if (error) {
      throw error;
    } else {
      console.log("Create Payment Response");
      console.log(payment);
      for (var i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          return res.send(payment.links[i].href);
        }
      }
    }
  });
});

app.listen(3000, () => console.log("server is running on port 3000"));
