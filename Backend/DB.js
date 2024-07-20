// db.js
const sql = require('mssql');

const config = {
  user: 'admin', // MSSQL kullanıcı adı
  password: '1234', // MSSQL şifresi
  server: 'localhost',
  database: 'blogsite', // Kullanmak istediğiniz veritabanı
  options: {
    encrypt: true, // Azure kullanıyorsanız
    trustServerCertificate: true // Yerel geliştirme ve test için
  }
};

const connectToDatabase = async () => {
  try {
    const pool = await sql.connect(config);
    if (pool.connected) console.log('Connected to MSSQL');
    return pool;
  } catch (err) {
    console.error('Database connection failed: ', err);
    throw err;
  }
};

module.exports = { sql, connectToDatabase };
