const { execSync } = require('child_process');

const runTests = () => {
  console.log('🧪 Running all test suites...\n');

  const testFiles = [
    'auth.test.js',
    'movies.test.js', 
    'favorites.test.js',
    'reviews.test.js',
    'watchHistory.test.js',
    'genres.test.js',
    'users.test.js'
  ];

  let totalPassed = 0;
  let totalFailed = 0;
  const results = [];

  testFiles.forEach((testFile, index) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 Running ${testFile} (${index + 1}/${testFiles.length})`);
    console.log('='.repeat(60));

    try {
      const output = execSync(`npx jest __tests__/${testFile} --verbose`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      console.log(output);
      
      // Parse results (basic parsing)
      const passedMatch = output.match(/(\d+) passed/);
      const failedMatch = output.match(/(\d+) failed/);
      
      const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      
      totalPassed += passed;
      totalFailed += failed;
      
      results.push({
        file: testFile,
        passed,
        failed,
        status: failed === 0 ? '✅ PASSED' : '❌ FAILED'
      });

    } catch (error) {
      console.error(`❌ Error running ${testFile}:`);
      console.error(error.stdout || error.message);
      
      results.push({
        file: testFile,
        passed: 0,
        failed: 1,
        status: '❌ ERROR'
      });
      totalFailed += 1;
    }
  });

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  
  results.forEach(result => {
    console.log(`${result.status} ${result.file.padEnd(25)} - ${result.passed} passed, ${result.failed} failed`);
  });
  
  console.log('\n' + '-'.repeat(80));
  console.log(`🎯 TOTAL: ${totalPassed} passed, ${totalFailed} failed`);
  
  if (totalFailed === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log(`⚠️  ${totalFailed} test(s) failed`);
  }
  console.log('-'.repeat(80));
};

// Check if Jest is available
try {
  execSync('npx jest --version', { stdio: 'pipe' });
  runTests();
} catch (error) {
  console.error('❌ Jest is not installed or not available');
  console.log('💡 Install Jest with: npm install --save-dev jest supertest');
  process.exit(1);
}