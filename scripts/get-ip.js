const { exec } = require('child_process');
const { spawn } = require('child_process');

function getLocalIP() {
  return new Promise((resolve) => {
    exec('ipconfig', (err, stdout) => {
      if (err) {
        resolve('localhost');
        return;
      }
      const lines = stdout.split('\n');
      for (const line of lines) {
        const match = line.match(/IPv4.*?(\d+\.\d+\.\d+\.\d+)/);
        if (match && !match[1].startsWith('127.')) {
          resolve(match[1]);
          return;
        }
      }
      resolve('localhost');
    });
  });
}

async function main() {
  const ip = await getLocalIP();
  console.log(`\n\x1b[36m🌐 Starting development server...\x1b[0m`);
  console.log(`\x1b[32m   Local:   \x1b[0mhttp://localhost:3000`);
  console.log(`\x1b[32m   Network: \x1b[0mhttp://${ip}:3000\n`);
  
  const nextDev = spawn('npx', ['next', 'dev', '-H', ip], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });
  
  nextDev.on('close', (code) => {
    process.exit(code);
  });
}

main();
