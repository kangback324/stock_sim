const pool = require('./db.js');
const random = require('./random.js');

module.exports = async (io) => {
    io.on('connection', async (socket) => {
        // 클라이언트가 연결되었을 때 로그 출력
        const db = await pool.getConnection();
        const fi = await db.query('select * from stock_inform'); // 변수이름 왜 이렇게 지었더라
        socket.emit('update_stock', fi);
        // socket.on('disconnect', () => {
        //   // 클라이언트가 연결 해제되었을 때 로그 출력
        //   console.log('User disconnected: ' + socket.id);
        // });
    });

  setInterval(async () => {
      const db = await pool.getConnection();
      try {
          for (let i = 1; i <= 6; i++) {
              const [results] = await db.query('SELECT * FROM stock_inform WHERE stock_id = ?', [i]);
              if (results.length === 0 || results[0].price === 0) continue;
              let price = results[0].price;
              let randomValue;

              if (price < 1000) randomValue = random(-75, 75);
              else if (price <= 10000) randomValue = random(-250, 250);
              else if (price <= 50000) randomValue = random(-750, 750);
              else if (price <= 100000) randomValue = random(-2000, 2000);
              else if (price < 100000) randomValue = random(-4500, 4500);
              else randomValue = random(-7500, 7500);

              price -= randomValue;
              if (price <= 0) {
                  await db.query('UPDATE stock_inform SET status = ?, broken_at = NOW(), price = ? WHERE stock_id=?', ['N', 0, i]);
              } else {
                  await db.query('UPDATE stock_inform SET price = ? WHERE stock_id = ?', [price, i]);
              }
          }
          const fi = await db.query('select * from stock_inform'); // 변수이름 왜 이렇게 지었더라
          io.emit('update_stock', fi);
      } catch (err) {
          console.log(err);
      } finally {
          db.release();
      }
  }, 3500);

};
