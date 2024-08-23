const path = require('path');
const pool = require('../lib/db.js');
var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'html','0000.html'));
});
  
router.post('/', async (req, res) => {
    const user = req.body;
    const db = await pool.getConnection();
    try {
      const [results] = await db.query('select user_id, password from user where user_id=? AND password=?', [user.id, user.password]);
      if(results.length > 0){
        req.session.user_id = user.id;
        req.session.save(()=>{
            res.redirect('/stock');
          }
        )
      }
      else {
        res.status(400).send('<script>alert("잘못된 아이디 또는 비밀번호를 입력하셨습니다."); window.location.href="/login";</script>');
      } 
    } catch(err) {
      console.err(err)
      res.status(500).send('500 Internal Server Error');
    } finally {
      db.release();
    }
});

module.exports = router;