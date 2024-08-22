const path = require("path");
const pool = require("../lib/db.js");
var express = require("express");
var router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "html", "0001.html"));
});

router.post("/", async (req, res) => {
  const user = req.body;
  const db = await pool.getConnection();
  try {
    const [results] = await db.query("select * from user where user_id=?", [
      user.id,
    ]);
    if (results.length > 0) {
      res
        .status(400)
        .send(
          '<script>alert("이미 존재하는 ID입니다."); window.location.href="/signup";</script>'
        );
      return;
    } else {
      await db.query(
        "insert into user (user_id, password, money) values(?, ?, ?)",
        [user.id, user.password, 500000]
      );
      res
        .status(200)
        .send(
          '<script>alert("회원가입이 완료되었습니다."); window.location.href="/login";</script>'
        );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("500 Internal Server Error");
    return;
  } finally {
    db.release();
  }
});

module.exports = router;
