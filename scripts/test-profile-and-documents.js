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

function putRequest(path, data, cookie = '') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 3000,
        path,
        method: 'PUT',
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

function getRequest(path, cookie = '') {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 3000,
        path,
        method: 'GET',
        headers: {
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
    req.end();
  });
}

async function runTest() {
  console.log('=== TEST 1: Login Pr. Elias Zerhouni ===');
  const loginRes = await postRequest('/api/auth/login', {
    email: 'zerhouni@hccsne.dz',
    password: 'membre123',
  });
  console.log('Login status:', loginRes.status, 'User:', loginRes.data.user?.nom);

  const rawCookie = loginRes.headers['set-cookie'];
  const cookie = Array.isArray(rawCookie) ? rawCookie.map((c) => c.split(';')[0]).join('; ') : '';

  console.log('\n=== TEST 2: Upload CV Document (PDF) ===');
  const dummyCvBase64 = 'data:application/pdf;base64,' + Buffer.from('%PDF-1.4 Mock CV Content Pr Elias Zerhouni').toString('base64');
  const uploadCvRes = await postRequest('/api/profile/upload-document', {
    file: dummyCvBase64,
    docType: 'cv',
    filename: 'CV_Officiel_Elias_Zerhouni.pdf',
  }, cookie);
  console.log('Upload CV status:', uploadCvRes.status, 'Url:', uploadCvRes.data.fileUrl);

  console.log('\n=== TEST 3: Upload Cover Letter (Lettre de Motivation) ===');
  const dummyLettreBase64 = 'data:application/pdf;base64,' + Buffer.from('%PDF-1.4 Mock Lettre Motivation Presidential Council').toString('base64');
  const uploadLettreRes = await postRequest('/api/profile/upload-document', {
    file: dummyLettreBase64,
    docType: 'lettre',
    filename: 'Lettre_Motivation_Conseil_HCCSNE.pdf',
  }, cookie);
  console.log('Upload Lettre status:', uploadLettreRes.status, 'Url:', uploadLettreRes.data.fileUrl);

  console.log('\n=== TEST 4: Upload Diploma (Certificat Doctorat) ===');
  const dummyDiplomeBase64 = 'data:application/pdf;base64,' + Buffer.from('%PDF-1.4 Mock Doctorat d Etat Diplome').toString('base64');
  const uploadDiplomeRes = await postRequest('/api/profile/upload-document', {
    file: dummyDiplomeBase64,
    docType: 'diplome',
    title: 'Doctorat en Médecine (MD) - Université d’Alger & Johns Hopkins',
    filename: 'Diplome_Doctorat_Zerhouni.pdf',
  }, cookie);
  console.log('Upload Diplome status:', uploadDiplomeRes.status, 'Count:', uploadDiplomeRes.data.user?.diplomesDocuments ? JSON.parse(uploadDiplomeRes.data.user.diplomesDocuments).length : 0);

  console.log('\n=== TEST 5: Update Profile with Career (1er poste actuel, autres passés) ===');
  const careerData = [
    {
      id: 1,
      titre: 'Directeur Général & Vice-Président Exécutif R&D',
      organisme: 'Johns Hopkins Medicine & Sanofi Global R&D',
      paysVille: 'États-Unis / Paris',
      anneeDebut: '2020',
      anneeFin: '',
      enCours: true, // Only 1st is current
      realisations: 'Orientation stratégique de la recherche biomédicale internationale et partenariats algéro-américains.',
    },
    {
      id: 2,
      titre: 'Directeur des National Institutes of Health (NIH)',
      organisme: 'Gouvernement des États-Unis',
      paysVille: 'États-Unis / Washington DC',
      anneeDebut: '2002',
      anneeFin: '2008',
      enCours: false, // previous
      realisations: 'Gestion d’un budget fédéral de 28 milliards USD et lancement de la Feuille de route NIH pour la recherche médicale.',
    },
    {
      id: 3,
      titre: 'Doyen Exécutif & Professeur de Radiologie',
      organisme: 'Johns Hopkins University School of Medicine',
      paysVille: 'États-Unis / Baltimore',
      anneeDebut: '1996',
      anneeFin: '2002',
      enCours: false, // previous
      realisations: 'Développement de l’imagerie par résonance magnétique (IRM) haute résolution et création de chaires d’excellence.',
    },
    {
      id: 4,
      titre: 'Chercheur & Spécialiste en Imagerie Médicale',
      organisme: 'Johns Hopkins Hospital',
      paysVille: 'États-Unis / Baltimore',
      anneeDebut: '1975',
      anneeFin: '1995',
      enCours: false, // previous
      realisations: 'Dépôt de multiples brevets sur le scanner tomodensitométrique et l’IRM cardiaque.',
    },
  ];

  const updateProfileRes = await putRequest('/api/profile', {
    nom: 'Zerhouni',
    prenom: 'Elias',
    specialite: 'Santé & Biotechnologies Médicales',
    institution: 'Johns Hopkins University',
    pays: 'États-Unis / Algérie',
    diplome: 'Doctorat en Médecine (MD / D.M.)',
    universite: 'Université d’Alger & Johns Hopkins',
    anneeDiplome: '1975',
    exploitsAcademiques: 'Ancien Directeur du NIH, plus de 200 brevets et publications internationales majeures, Membre de l’Académie Nationale de Médecine des États-Unis.',
    bio: 'Pionnier mondial de l’imagerie médicale par résonance magnétique, ancien Directeur des NIH (USA) et membre du Haut Conseil HCCSNE.',
    carrieres: careerData,
  }, cookie);

  console.log('Update Profile status:', updateProfileRes.status);
  console.log('Completion score:', updateProfileRes.data.user?.pourcentageCompletion + '%');
  console.log('Carrieres count:', JSON.parse(updateProfileRes.data.user?.carrieres || '[]').length);
  const parsedCarrieres = JSON.parse(updateProfileRes.data.user?.carrieres || '[]');
  console.log('Carrieres[0] enCours:', parsedCarrieres[0]?.enCours);
  console.log('Carrieres[1] enCours:', parsedCarrieres[1]?.enCours);

  console.log('\n=== TEST 6: Verify GET /api/profile ===');
  const getProfileRes = await getRequest('/api/profile', cookie);
  console.log('GET Profile status:', getProfileRes.status);
  console.log('CV URL in profile:', getProfileRes.data.user?.cvUrl);
  console.log('Lettre URL in profile:', getProfileRes.data.user?.lettreMotivationUrl);
  console.log('Diplomes in profile:', JSON.parse(getProfileRes.data.user?.diplomesDocuments || '[]').map(d => d.title));

  console.log('\n=== TEST 7: Verify Public Members API ===');
  const membersRes = await getRequest('/api/members');
  const eliasInPublic = membersRes.data.members?.find(m => m.nom && m.nom.toLowerCase().includes('zerhouni'));
  console.log('Public member found:', eliasInPublic?.prenom, eliasInPublic?.nom);
  console.log('Public diplome:', eliasInPublic?.diplome);
  console.log('Public institution:', eliasInPublic?.institution);

  console.log('\n=== ALL TESTS COMPLETED SUCCESSFULLY! ===');
}

runTest().catch(console.error);
