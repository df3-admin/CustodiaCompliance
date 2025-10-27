import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getAccessToken() {
  try {
    // Load credentials
    const credentialsPath = path.resolve(__dirname, '../../credentials.json');
    
    if (!fs.existsSync(credentialsPath)) {
      console.error('❌ credentials.json not found!');
      console.log('📝 Please ensure credentials.json is in the project root.');
      process.exit(1);
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      credentials.client_id,
      credentials.client_secret,
      'http://localhost:3000/auth/callback'
    );

    // Generate auth URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/webmasters.readonly']
    });

    console.log('🔗 Authorization URL:');
    console.log(authUrl);
    console.log('\n📝 Please visit the URL above to authorize access.');
    console.log('📋 Copy the code from the redirect URL.\n');

    // For now, we'll use service account instead
    console.log('⚠️  Note: For Search Console API, you\'ll need to:');
    console.log('1. Visit https://console.cloud.google.com/apis/credentials');
    console.log('2. Create OAuth 2.0 credentials (not service account)');
    console.log('3. Download the credentials JSON');
    console.log('4. Run this script again\n');

    // Alternative: Use service account impersonation
    console.log('💡 Alternative: Use Google Search Console UI to verify your site,');
    console.log('   then use the service account email to share access.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getAccessToken();
