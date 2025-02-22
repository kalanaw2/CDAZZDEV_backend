const db = require('../config/database');

class Admins {

static login(email){
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM students WHERE email = ? "
        
        db.query(query, [email], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        })
    })
}
   
}

module.exports = Admins;
