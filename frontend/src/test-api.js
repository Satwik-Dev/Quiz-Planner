// For testing in the browser console

// Function to test login and material creation
async function testLoginAndCreate() {
    try {
      // Step 1: Login
      console.log("1. Testing login...");
      const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });
      
      if (!loginResponse.ok) {
        throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
      }
      
      const loginData = await loginResponse.json();
      console.log("Login successful:", loginData);
      
      // Step 2: Store token
      const token = loginData.access_token;
      localStorage.setItem('token', token);
      console.log("Token stored in localStorage");
      
      // Step 3: Create material
      console.log("2. Testing material creation with token...");
      const materialResponse = await fetch('http://localhost:5000/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: "Test Material",
          content: "This is a test material content",
          description: "Created by test script"
        })
      });
      
      if (!materialResponse.ok) {
        throw new Error(`Create material failed: ${materialResponse.status} ${materialResponse.statusText}`);
      }
      
      const materialData = await materialResponse.json();
      console.log("Material creation successful:", materialData);
      
      return "All tests passed successfully!";
    } catch (error) {
      console.error("Test failed:", error);
      return `Test failed: ${error.message}`;
    }
  }
  
  // Run this function in your browser console:
  // testLoginAndCreate().then(console.log)