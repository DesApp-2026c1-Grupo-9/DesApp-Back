const http = require('http');
const { exec } = require('child_process');

function waitForServer(port, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const req = http.get(`http://localhost:${port}/api/carreras`, (res) => {
        resolve(true);
        res.resume();
      });
      req.on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error('Server did not start in time'));
        } else {
          setTimeout(check, 500);
        }
      });
    };
    check();
  });
}

async function test() {
  console.log('Starting server...');
  const server = exec('npm run dev', { cwd: __dirname });
  
  try {
    await waitForServer(3001);
    console.log('Server is ready, testing endpoint...');
    
    const req = http.get('http://localhost:3001/api/carreras', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Response status:', res.statusCode);
        console.log('Response body:', data);
        server.kill();
        process.exit(0);
      });
    });
    
    req.on('error', (err) => {
      console.error('Request error:', err.message);
      server.kill();
      process.exit(1);
    });
  } catch (err) {
    console.error('Error:', err.message);
    server.kill();
    process.exit(1);
  }
}

test();
