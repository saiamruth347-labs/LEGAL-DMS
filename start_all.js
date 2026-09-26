const path = require('path');

const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

if (isProduction) {
  console.log('=======================================================');
  console.log('  NCRB FULL-STACK SYSTEM (PRODUCTION - RENDER DEPLOY)  ');
  console.log('  Starting unified Express server on PORT:', process.env.PORT || 5000);
  console.log('=======================================================\n');
  require(path.join(__dirname, 'backend', 'src', 'server.js'));
} else {
  const { spawn } = require('child_process');

  console.log('=======================================================');
  console.log('  STARTING NCRB FULL-STACK SYSTEM (SIH26190)           ');
  console.log('  Backend:  http://localhost:5000                     ');
  console.log('  Frontend: http://localhost:5173                     ');
  console.log('=======================================================\n');

  function runService(name, command, args, cwd) {
    const child = spawn(command, args, {
      cwd,
      shell: true,
      env: process.env,
    });

    child.stdout.on('data', (data) => {
      process.stdout.write(`[${name}] ${data}`);
    });

    child.stderr.on('data', (data) => {
      process.stderr.write(`[${name} ERROR] ${data}`);
    });

    child.on('close', (code) => {
      console.log(`[${name}] process exited with code ${code}`);
    });

    return child;
  }

  const backend = runService('BACKEND', 'node', ['src/server.js'], path.join(__dirname, 'backend'));
  const frontend = runService('FRONTEND', 'npm', ['run', 'dev'], path.join(__dirname, 'frontend'));

  function cleanup() {
    console.log('\nShutting down backend and frontend...');
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', backend.pid, '/f', '/t']);
        spawn('taskkill', ['/pid', frontend.pid, '/f', '/t']);
      } else {
        backend.kill();
        frontend.kill();
      }
    } catch (e) {}
    process.exit();
  }

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}
