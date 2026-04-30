/**
 * Cross-platform build script.
 *
 * TypeScript emits JS files even when type errors exist (noEmitOnError: false).
 * This script runs `tsc` then `tsc-alias`, ignoring tsc's non-zero exit code,
 * and verifies that dist/server.js was emitted before reporting success.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd) {
    console.log(`\n> ${cmd}`);
    const result = spawnSync(cmd, { stdio: 'inherit', shell: true });
    if (result.error) {
        console.error(`[build.js] Failed to launch: ${result.error.message}`);
        return 1;
    }
    return typeof result.status === 'number' ? result.status : 1;
}

const tscStatus = run('npx tsc --skipLibCheck --noEmitOnError false');
if (tscStatus !== 0) {
    console.warn(`\n[build.js] tsc exited with code ${tscStatus} (type errors present; JS files are still emitted by tsc).`);
}

const aliasStatus = run('npx tsc-alias');
if (aliasStatus !== 0) {
    console.warn(`\n[build.js] tsc-alias exited with code ${aliasStatus}. Continuing — dist may still be runnable.`);
}

const distEntry = path.join(__dirname, 'dist', 'server.js');
if (!fs.existsSync(distEntry)) {
    console.error(`\n[build.js] Build output missing: ${distEntry}`);
    process.exit(1);
}

console.log('\n[build.js] Build complete. dist/server.js is ready.');
process.exit(0);
