const http = require('http');

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

async function testDelete() {
  const loginRes = await postRequest('/api/auth/login', {
    email: 'zerhouni@hccsne.dz',
    password: 'membre123',
  });
  const rawCookie = loginRes.headers['set-cookie'];
  const cookie = Array.isArray(rawCookie) ? rawCookie.map((c) => c.split(';')[0]).join('; ') : '';

  console.log('Testing delete CV endpoint...');
  const delRes = await postRequest('/api/profile/delete-document', { docType: 'cv' }, cookie);
  console.log('Delete status:', delRes.status, 'Message:', delRes.data.message);
  console.log('cvUrl after delete:', delRes.data.user?.cvUrl);

  // Restore CV
  const dummyCvBase64 = 'data:application/pdf;base64,' + Buffer.from('%PDF-1.4 Mock CV Elias Zerhouni').toString('base64');
  await postRequest('/api/profile/upload-document', {
    file: dummyCvBase64,
    docType: 'cv',
    filename: 'CV_Officiel_Elias_Zerhouni.pdf',
  }, cookie);
  console.log('CV re-uploaded successfully.');
}

testDelete().catch(console.error);
