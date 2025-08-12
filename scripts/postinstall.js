const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Prevent infinite recursion
if (process.env.SKIP_SHARED_INSTALL === '1') {
  console.log('Skipping shared install (recursion guard)');
  process.exit(0);
}

const sharedDir = path.join(process.cwd(), 'shared');
const sharedPkgPath = path.join(sharedDir, 'package.json');

if (!fs.existsSync(sharedPkgPath)) {
  console.log('No shared/package.json found, skipping');
  process.exit(0);
}

console.log('Installing shared dependencies...');
const result = spawnSync('npm', ['ci'], {
  cwd: sharedDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, SKIP_SHARED_INSTALL: '1' }
});

process.exit(result.status ?? 0);
