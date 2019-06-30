var db = require("../db");

save_user_information = data => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO lottery_information SET ?",
      data,
      (err, results, fields) => {
        if (err) {
          reject("could not insert into lottery information");
        }
        resolve("successful");
      }
    );
  });
};

get_total_amount = data => {
  return new Promise((resolve, reject) => {
    db.query(
      "select sum(amount) as total_amount from lottery_information",
      data,
      (err, results, fields) => {
        if (err) {
          reject("could not get total amount from lottery information");
        }
        resolve(results);
      }
    );
  });
};

module.exports = save_user_information;
