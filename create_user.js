import mariadb from 'mariadb';
import bcrypt   from 'bcrypt';

const pool = mariadb.createPool({
  host           : 'echoesofavalone.falixsrv.me',
  port           : 23003,
  user           : 'u2234829_f0VCVth5WE',
  password       : 'GzE@xMj.2.Cq.AYlP6C6XODw',
  database       : 's2234829_Onirux',
  connectionLimit: 5
});

async function main() {
  let conn;

  try {
    conn = await pool.getConnection();

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        username      VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL
      )
    `);
    console.log('Table users prête.');

    const plainPassword = 'Jeyzho';
    const saltRounds    = 10;
    const hash          = await bcrypt.hash(plainPassword, saltRounds);

    const res = await conn.query(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      ['Jeyzho', hash]
    );
    console.log(`Utilisateur créé avec l’ID : ${res.insertId}`);
  }
  catch (err) {
    console.error('Erreur lors de la création :', err);
  }
  finally {
    if (conn) await conn.end();
    await pool.end();
  }
}

main();