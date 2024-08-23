// var express = require("express");
// const pool = require('../lib/db.js');
// const path = require('path');
// var router = express.Router();

// router.get('/', async (req, res)=> {
//     const db = await pool.getConnection();
//     try {
//         const [check] = await db.query('select admin from user where user_id=?',[req.session.user_id]);
//         if (check[0].admin !== 'Y') {
//             res.status(400).send('<script>alert("접근 권한이 없는 계좌 입니다."); window.location.href="/";</script>');
//             return;
//         }
//         res.sendFile(path.join(__dirname, "../public", "html", "ADMIN.html"));
//     } catch (err) {
//         console.log(err);
//     } finally {
//         db.release();
//     }
// });

// module.exports = router