const { execSync, spawn } = require('child_process');
const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });
    req.on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Building project...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (e) {
    console.error('Build failed');
    process.exit(1);
  }

  console.log('Starting server...');
  const server = spawn('node', ['./dist/bin/www'], {
    env: { ...process.env, NODE_ENV: 'development' }
  });

  server.stdout.on('data', (data) => {
    console.log(`Server: ${data}`);
  });

  server.stderr.on('data', (data) => {
    console.error(`Server error: ${data}`);
  });

  // Wait for server to start
  console.log('Waiting for server to be ready...');
  let attempts = 0;
  while (attempts < 20) {
    try {
      await sleep(1000);
      const res = await makeRequest('http://localhost:3001/api/carreras');
      console.log('\n✓ Server is ready!');
      console.log('Status:', res.status);
      console.log('Response:', res.data);
      server.kill();
      process.exit(0);
    } catch (err) {
      attempts++;
      process.stdout.write('.');
    }
  }

  console.error('\n✗ Server did not start in time');
  server.kill();
  process.exit(1);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
