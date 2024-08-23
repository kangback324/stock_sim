const isowner = require("../lib/checkowner.js");
const pool = require('../lib/db.js');
var express = require("express");
var router = express.Router();

router.get("/", async (req, res) => {
  try {
    const owner = await isowner.isowner(req);
    if (owner) {
      res.redirect("/stock");
    } 
    else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("500 Internal Server Error");
  }
});

module.exports = router;
