const fs = require('fs');
const http = require('http');

const imagePath = 'C:/Users/Ahmed/.gemini/antigravity/brain/5975c2d1-3b87-49ed-bfc2-021b4f297d8c/.user_uploaded/media_1793495926678_802b9d54.jpg';

function postRequest(path, data, cookie = '') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 3000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          ...(cookie ? { Cookie: cookie } : {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          let json = {};
          try {
            json = JSON.parse(body);
          } catch {
            json = { raw: body };
          }
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('Login as zerhouni@hccsne.dz...');
  const loginRes = await postRequest('/api/auth/login', {
    email: 'zerhouni@hccsne.dz',
    password: 'membre123',
  });
  console.log('Login status:', loginRes.status);
  const rawCookie = loginRes.headers['set-cookie'];
  const cookie = Array.isArray(rawCookie) ? rawCookie.map((c) => c.split(';')[0]).join('; ') : '';

  console.log('Reading uploaded image from path:', imagePath);
  const imgBuffer = fs.readFileSync(imagePath);
  const base64 = 'data:image/jpeg;base64,' + imgBuffer.toString('base64');
  console.log('Base64 length:', base64.length);

  console.log('Uploading photo to /api/profile/upload-photo...');
  const res = await postRequest('/api/profile/upload-photo', { image: base64 }, cookie);
  console.log('Upload result status:', res.status, 'Response:', res.data);
}

run().catch(console.error);
