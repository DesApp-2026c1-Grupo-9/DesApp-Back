const { Sequelize } = require('sequelize');
const config = require('./lib/config/config').db;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  port: config.port,
  logging: false,
});

async function check() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database:', config.database);
    
    // Check if tables exist
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    console.log('\nExisting tables:');
    tables.forEach(t => console.log(' -', t.table_name));
    
    // Check SequelizeMeta for ran migrations
    const [meta] = await sequelize.query(`SELECT * FROM "SequelizeMeta"`);
    console.log('\nRan migrations:');
    meta.forEach(m => console.log(' -', m.name));
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await sequelize.close();
  }
}

check();
