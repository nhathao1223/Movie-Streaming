const quickTest = async () => {
  try {
    console.log('⚡ Quick test: Swagger UI at localhost:5000\n');
    
    const response = await fetch('http://localhost:5000');
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    
    if (response.status === 200) {
      const content = await response.text();
      if (content.includes('swagger-ui') || content.includes('Swagger UI')) {
        console.log('✅ SUCCESS: Swagger UI is working at localhost:5000!');
      } else {
        console.log('❌ FAILED: Not Swagger UI content');
      }
    } else {
      console.log('❌ FAILED: Server not responding correctly');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 Make sure server is running: npm run dev');
  }
};

quickTest();