const session = require("express-session");
const pool = require("../lib/db.js");
var express = require("express");
const update_account = require("../lib/update_account.js");
var router = express.Router();

router.get("/login-inform", async (req, res) => {
  const db = await pool.getConnection();
  try {
    const [result] = await db.query(
      "select user_id, money from user where user_id=?",
      [req.session.user_id]
    );
    res.json({
      user_id: result[0].user_id,
      money: result[0].money,
    });
  } catch (err) {
    console.log(err);
  } finally {
    db.release();
  }
});

router.get("/account_update_N", async (req, res) => {
  const rr = await update_account(req); // 변수명 보소
  res.json({
    rr,
  });
});

router.get("/rank", async (req, res) => {
  const db = await pool.getConnection();
  try {
    const [rank] = await db.query(
      "select user_id, money from user order by money desc limit 5"
    );
    res.json({
      rank,
    });
  } catch (err) {
    console.log(err);
  } finally {
    db.release();
  }
});

module.exports = router;

// router.get('/stock_price', async (req, res)=> {
//     const db = await pool.getConnection();
//     try {
//         const [result] = await db.query('select * from stock_inform');
//         res.json({
//             result
//         })
//     } catch(err) {
//         console.log(err)
//     } finally {
//         db.release();
//     }
// });

// router.get('/account_update', async (req, res) => {
//       const db = await pool.getConnection();
//       try {
//         const [user] = await db.query('select account_id from user where user_id=?',[req.session.user_id]);
//         const [user_stock] = await db.query('select * from stock_user where account_id=?',[user[0].account_id]);
//         res.json({
//           user_stock
//         })
//       } catch(err) {
//         console.log(err)
//       } finally {
//         db.release();
//       }
// });

//모듈로 계좌조회하는거 만듬
// 거기다가 req 빵빵 쏴줌
// 그러면 계좌 상태 반환
// 난 천재야
