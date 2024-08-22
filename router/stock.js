const pool = require('../lib/db.js');
const session = require('express-session');
const isowner = require('../lib/checkowner.js');
const path = require('path');
var express = require('express');
var router = express.Router();

 async function checkowner(reqq, ress) {
  const owner = await isowner.isowner(reqq);
  if (owner === false) {
    ress.status(400).send('<script>alert("로그인이 필요한 서비스입니다."); window.location.href="/";</script>');
    return;
  }
}

router.get('/', async (req, res) => {
  try {
    checkowner(req, res);
    res.sendFile(path.join(__dirname, '../public', 'html','1000.html'));  
  } catch(err) {
    console.log(err)
  }
});
  
  router.post('/buy', async(req, res) => {
    checkowner(req, res);
    const buy = req.body;
    const db = await pool.getConnection();
    try {
      if (isNaN(buy.number) || buy.number <= 0) { // 올바른 값인지 확인
        res.status(400).send('<script>alert("잘못된 값 입니다."); window.location.href="/";</script>');
        return;
      }
      const [user_inform] = await db.query('select account_id, money from user where user_id=?',[req.session.user_id]);
      const [stock] = await db.query('select stock_id, price, status from stock_inform where name=?',[buy.stock_name]);
      //유효성 검사
      if (stock[0].status === 'N') {
        res.status(400).send('<script>alert("상장폐지된 종목입니다."); window.location.href="/stock";</script>');
        return;
      }
      else if (stock[0].price * buy.number > user_inform[0].money) {
        res.status(400).send('<script>alert("돈이 부족합니다."); window.location.href="/stock";</script>');
        return;
      }
      // 지갑 업데이트
      const new_money = user_inform[0].money - (stock[0].price * buy.number);
      await db.query('update user set money=? where user_id=?',[new_money, req.session.user_id])
      //첫 구매인지 두번째 구매인지 구별
      const [ybuy] = await db.query('select * from stock_user where account_id=? AND stock_id=?',[user_inform[0].account_id, stock[0].stock_id]);
      if (ybuy.length > 0) {
       const [number] = await db.query('select stock_number, average_price from stock_user where account_id=? AND stock_id=?',[user_inform[0].account_id, stock[0].stock_id]);
       const a = parseInt(number[0].stock_number);
       const b = parseInt(buy.number);
       const average = ((number[0].average_price * number[0].stock_number) + (stock[0].price * buy.number)) / (a + b); // 문자열 더하기 문자열로 되서 1이 11로 계산됨 ㅋㅋㅋㅋㅋㅋㅋㅋ
       const reu = parseInt(number[0].stock_number) + parseInt(buy.number);
       await db.query('update stock_user set stock_number=?, average_price=? where account_id=? AND stock_id=?',[reu, average, user_inform[0].account_id, stock[0].stock_id]); 
      }
      else {
        await db.query('insert into stock_user values(?, ?, ?, ?)',[user_inform[0].account_id, stock[0].stock_id, buy.number, stock[0].price]);
      }
      res.redirect('/stock');
    } catch (err) {
      console.log(err);
    } finally {
      db.release();
    }
  });
  
  router.post('/sell', async (req, res) => {
    checkowner(req, res);
    const sell = req.body;
    const db = await pool.getConnection();
    try {
      if (isNaN(sell.number) || sell.number <= 0) { // 올바른 값인지 확인
        res.status(400).send('<script>alert("잘못된 값 입니다."); window.location.href="/";</script>');
        return;
      }
      const [user] = await db.query('select user_id ,account_id, money from user where user_id=?',[req.session.user_id]);
      const [user_account] = await db.query('select * from stock_user where account_id=?',[user[0].account_id]);
      const [stock] = await db.query('select stock_id, price, status from stock_inform where name=?',[sell.stock_name]);
      if (stock[0].status === 'N') {
        res.status(400).send('<script>alert("상장폐지된 종목입니다."); window.location.href="/stock";</script>');
        return;
      }
      const [temp] = await db.query('select * from stock_user where stock_id=? AND account_id=?',[stock[0].stock_id, user[0].account_id]);
      if (temp.length <= 0 || temp[0].stock_number < sell.number) {
        res.status(400).send('<script>alert("잘못된 값 입니다."); window.location.href="/stock";</script>');
        return;
      }
      //지갑 업데이트
      let money = user[0].money;
      money += stock[0].price * sell.number;
      await db.query('update user set money=? where user_id=?',[money, user[0].user_id]);
      sum = temp[0].stock_number - sell.number;
      if (sum === 0) {
        await db.query('delete from stock_user where account_id=? AND stock_id=?', [user[0].account_id, stock[0].stock_id]);
      }
      else {
        await db.query('update stock_user set stock_number=? where account_id=? AND stock_id=?',[sum, user[0].account_id, stock[0].stock_id]);
      }
      res.redirect('/stock');
    } catch (err) {
      console.log(err)
    } finally {
      db.release();
    }
  });

  module.exports = router;
// 구매
// 판매
///할때마다 계좌 조회도 같이 해야댐
