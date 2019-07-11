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

get_list_of_participants = data =>
  new Promise((resolve, reject) => {
    db.query("select email from lottery_information", null, function(
      err,
      results,
      fields
    ) {
      if (err) {
        reject("Could not get a list of participants");
      }
      resolve(results);
    });
  });

delete_users = async data =>
  new Promise((resolve, reject) => {
    db.query("delete from lottery_information where ID > 0", null, function(
      err,
      results,
      fields
    ) {
      if (err) {
        reject("could not delete participants");
      }
      resolve("successfully deleted all users");
    });
  });

module.exports = {
  save_user_information,
  get_list_of_participants,
  delete_users
};
