const testSwaggerAtRoot = async () => {
  try {
    console.log('🎯 Testing Swagger UI at localhost:5000...\n');
    
    // Test 1: Swagger UI at root path
    console.log('1️⃣ Testing Swagger UI at root (localhost:5000)');
    const rootResponse = await fetch('http://localhost:5000');
    console.log(`   📊 Status: ${rootResponse.status}`);
    console.log(`   📄 Content-Type: ${rootResponse.headers.get('content-type')}`);
    
    if (rootResponse.status === 200 && rootResponse.headers.get('content-type')?.includes('text/html')) {
      const content = await rootResponse.text();
      if (content.includes('swagger-ui') || content.includes('Swagger UI')) {
        console.log('   ✅ SUCCESS: Swagger UI is served at root path!\n');
      } else {
        console.log('   ❌ FAILED: Root path does not serve Swagger UI\n');
      }
    } else {
      console.log('   ❌ FAILED: Root path not accessible\n');
    }
    
    // Test 2: Swagger UI at /api-docs (should still work)
    console.log('2️⃣ Testing Swagger UI at /api-docs');
    const docsResponse = await fetch('http://localhost:5000/api-docs');
    console.log(`   📊 Status: ${docsResponse.status}`);
    console.log(`   📄 Content-Type: ${docsResponse.headers.get('content-type')}`);
    
    if (docsResponse.status === 200 && docsResponse.headers.get('content-type')?.includes('text/html')) {
      console.log('   ✅ SUCCESS: Swagger UI also available at /api-docs!\n');
    } else {
      console.log('   ❌ FAILED: /api-docs not working\n');
    }
    
    // Test 3: Health check endpoint
    console.log('3️⃣ Testing health check (/health)');
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthData = await healthResponse.json();
    
    console.log(`   📊 Status: ${healthResponse.status}`);
    console.log(`   📋 Message: ${healthData.message}`);
    console.log(`   🔗 Endpoints: ${Object.keys(healthData.endpoints).length} available\n`);
    
    // Test 4: API endpoint
    console.log('4️⃣ Testing API endpoint (/api)');
    const apiResponse = await fetch('http://localhost:5000/api');
    const apiData = await apiResponse.json();
    
    console.log(`   📊 Status: ${apiResponse.status}`);
    console.log(`   📋 Message: ${apiData.message}`);
    console.log(`   🔗 Endpoints: ${Object.keys(apiData.endpoints).length} available\n`);
    
    console.log('🎉 Testing completed!');
    console.log('\n📝 Usage:');
    console.log('   • http://localhost:5000 → Swagger UI (main page)');
    console.log('   • http://localhost:5000/api-docs → Swagger UI (alternative)');
    console.log('   • http://localhost:5000/health → Health check');
    console.log('   • http://localhost:5000/api → API info');
    
  } catch (error) {
    console.error('❌ Error testing Swagger UI:', error.message);
    console.log('💡 Make sure the server is running: npm run dev');
  }
};

testSwaggerAtRoot();