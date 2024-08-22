const pool = require('./db.js');

module.exports = async (req) => {
    const db = await pool.getConnection();
    try {
      let result = [];
      const [user] = await db.query('select account_id from user where   user_id=?',[req.session.user_id]);
      const [user_stock] = await db.query('select * from stock_user where account_id=?',[user[0].account_id]);
      for (let i = 0; i < user_stock.length; i++) {
        const [stock_name] = await db.query('select name, price from stock_inform where stock_id=?',[user_stock[i].stock_id]);
        await result.push(
          {
              stock_name: stock_name[0].name,
              stock_number: user_stock[i].stock_number,
              stock_price: stock_name[0].price,
              average_price: user_stock[i].average_price  
          }
        );
      }
        // JSON.stringify(user_stock, null, 2) // js 에서 객체를 문자열로 바꾸면 [object object] 가 되서 josn 문자열로 바꾸고 반환함
        return result;
        //구현 성공 ㅅㅅㅅㅅㅅㅅㅅㅅㅅㅅㅅㅅㅅㅅㅅㅅㅅㅅㅅㅅㅅ
    } catch(err) {
      console.log(err) 
    } finally {
      db.release();
    }
}
