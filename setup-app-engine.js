#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Google App Engine Setup Wizard');
console.log('================================\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupAppEngine() {
  try {
    console.log('📋 Please provide the following information:\n');

    // Get Project ID
    const projectId = await askQuestion('Enter your Google Cloud Project ID: ');
    
    // Get MongoDB URI
    const mongoUri = await askQuestion('Enter your MongoDB Atlas connection string: ');
    
    // Get Firebase Project ID
    const firebaseProjectId = await askQuestion('Enter your Firebase Project ID: ');
    
    // Get Firebase Private Key
    const firebasePrivateKey = await askQuestion('Enter your Firebase Private Key (full key with newlines): ');
    
    // Get Firebase Client Email
    const firebaseClientEmail = await askQuestion('Enter your Firebase Client Email: ');
    
    // Generate JWT Secret
    const jwtSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Create env_variables.yaml
    const envContent = `env_variables:
  # MongoDB Configuration
  MONGODB_URI: "${mongoUri}"
  
  # Firebase Configuration
  FIREBASE_PROJECT_ID: "${firebaseProjectId}"
  FIREBASE_PRIVATE_KEY: "${firebasePrivateKey}"
  FIREBASE_CLIENT_EMAIL: "${firebaseClientEmail}"
  
  # JWT Configuration
  JWT_SECRET: "${jwtSecret}"
  
  # App Configuration
  NODE_ENV: "production"
  PORT: "8080"
  
  # Timezone
  TZ: "Asia/Kolkata"
`;

    fs.writeFileSync('env_variables.yaml', envContent);
    console.log('\n✅ Created env_variables.yaml');

    // Update deploy scripts
    const deployShContent = fs.readFileSync('deploy.sh', 'utf8');
    const updatedDeploySh = deployShContent.replace(
      'PROJECT_ID="your-google-cloud-project-id"',
      `PROJECT_ID="${projectId}"`
    );
    fs.writeFileSync('deploy.sh', updatedDeploySh);

    const deployBatContent = fs.readFileSync('deploy.bat', 'utf8');
    const updatedDeployBat = deployBatContent.replace(
      'set PROJECT_ID=your-google-cloud-project-id',
      `set PROJECT_ID=${projectId}`
    );
    fs.writeFileSync('deploy.bat', updatedDeployBat);

    console.log('✅ Updated deployment scripts with Project ID');

    console.log('\n🎉 Setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install');
    console.log('2. Run: gcloud auth login');
    console.log('3. Run: gcloud config set project ' + projectId);
    console.log('4. Run: gcloud services enable appengine.googleapis.com');
    console.log('5. Deploy with: ./deploy.sh (Linux/macOS) or deploy.bat (Windows)');
    console.log('\n⚠️  Important: env_variables.yaml contains sensitive data. Do not commit it to Git!');

  } catch (error) {
    console.error('❌ Error during setup:', error.message);
  } finally {
    rl.close();
  }
}

setupAppEngine(); 