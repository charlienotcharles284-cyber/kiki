const fs = require('node:fs');

const sourcePath = 'JS/Runestone_V3.js';
const outputPath = 'JS/Runestone_V3_MIPS.js';
const source = fs.readFileSync(sourcePath, 'utf8');
const marker = /const RUNESTONE = \{repository: "[^"]+", personal: false\};/;

const output = source
  .replace(
    '/* Runestone V3',
    '/* Runestone V3 MIPS Beta — based on Runestone V3'
  )
  .replace(
    marker,
    'const RUNESTONE = {repository: "kiki-rgb-00/kiki", personal: false, tunStack: "mips"};'
  )
  .replace(
    '  const fixed = Object.assign({}, config);',
    '  const fixed = Object.assign({}, config);\n' +
    '  // Beta only: change the TUN stack and retain all other Hako settings.\n' +
    '  fixed.tun = Object.assign({}, config.tun, {stack: RUNESTONE.tunStack});'
  );

if (
  output === source ||
  !output.includes('stack: RUNESTONE.tunStack')
) {
  throw new Error('Runestone V3 build marker missing');
}

if (process.argv.includes('--check')) {
  if (
    !fs.existsSync(outputPath) ||
    fs.readFileSync(outputPath, 'utf8') !== output
  ) {
    throw new Error('MIPS Beta is stale: node scripts/build-v3-mips.cjs');
  }
} else {
  fs.writeFileSync(outputPath, output);
}
