const { spawn } = require('child_process');

console.log('🧪 Testing monthly production automation...');
console.log('🕐 Current time:', new Date().toLocaleString());

// Run the automation script
const child = spawn('npm', ['run', 'automate-production', 'test'], {
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  console.log(`✅ Test completed with exit code: ${code}`);
  process.exit(code);
});

child.on('error', (error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 