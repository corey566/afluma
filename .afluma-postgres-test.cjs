const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.AFLUMA_DATABASE_TEST_URI,
});

async function run() {
  try {
    await client.connect();

    const result = await client.query(`
      SELECT
        current_database() AS database_name,
        current_user AS database_user,
        inet_server_addr() AS server_address,
        inet_server_port() AS server_port
    `);

    console.log(JSON.stringify(result.rows[0], null, 2));
  } catch (error) {
    console.error('DATABASE TEST FAILED');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

run();
