const express = require('express');
const bodyParser = require('body-parser')
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const updateStock = require('./lib/update_stock.js');
// const rateLimit = require('express-rate-limit');
// const limiter = rateLimit({
//     windowMs: 1000, 
//     max: 150
// });
const app = express();
const server = http.createServer(app);
const io = new Server(server);
updateStock(io);

// 세션 파일을 저장할 디렉토리 경로 설정
const sessionDir = path.join(__dirname, 'sessions');

// 세션 디렉토리가 존재하지 않으면 생성
if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

const root = require('./router/root.js');
const login = require('./router/login.js');
const signup = require('./router/signup.js');
const stock = require('./router/stock.js');
const api = require('./router/api.js');
// const admin = require('./router/admin.js');

// app.use(limiter);
app.use(express.static( path.join(__dirname, '/public')));

app.use(bodyParser.urlencoded({extended : true}));
app.use(session({
  secret: 'disisrealsecretpwd',
  resave: false,
  saveUninitialized: false,
  store:new FileStore(),
  // cookie: { secure: true }
}));

app.use('/', root);
app.use('/login', login);
app.use('/signup', signup);
app.use('/stock', stock);
app.use('/api', api);
// app.use('/admin', admin);

app.use((req, res, next) => {
    res.status(404).send('404 not found');
});
  
app.use((err, req, res, next) => {
  console.error(err.stack);
  // 이미 응답이 전송되었는지 확인
  if (res.headersSent) {
      return next(err);
  }
  res.status(500).send('500 Internal Server Error!');
});


server.listen(8080, () => {
  console.log('Server running');
});