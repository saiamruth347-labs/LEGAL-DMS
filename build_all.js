const { execSync } = require('child_process');
const path = require('path');

console.log('=======================================================');
console.log('  NCRB FULL-STACK BUILD PIPELINE (SIH26190)            ');
console.log('=======================================================\n');

function run(cmd, cwd) {
  console.log(`> [${cwd ? path.basename(cwd) : 'root'}] ${cmd}`);
  execSync(cmd, {
    cwd: cwd || __dirname,
    stdio: 'inherit',
    env: process.env,
  });
}

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

// 1. Install backend dependencies
run('npm install', backendDir);

// 2. Generate Prisma Client
run('npx prisma generate', backendDir);

// 3. Install frontend dependencies
run('npm install', frontendDir);

// 4. Build Vite production bundle
run('npm run build', frontendDir);

console.log('\n✓ Build completed successfully! Production assets ready in frontend/dist.\n');
