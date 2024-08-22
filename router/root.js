const isowner = require("../lib/checkowner.js");
const pool = require('../lib/db.js');
var express = require("express");
var router = express.Router();

router.get("/", async (req, res) => {
  try {
    let check
      const db = await pool.getConnection();
      try {
          [check] = await db.query('select admin from user where user_id=?',[req.session.user_id]);
      } catch (err) {
          console.log(err);
      } finally {
          db.release();
      }

    const owner = await isowner.isowner(req);
    if(check[0].admin === 'Y') {
      console.log('ss')
      res.redirect('/admin');
    } 
    else if (owner) {
      res.redirect("/stock");
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("500 Internal Server Error");
  }
});

module.exports = router;
