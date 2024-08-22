const session = require('express-session');

module.exports = {
    isowner:(req)=>{
        if(req.session.user_id) {
            return true;
        }
        else {
            return false;
        }
    }
}