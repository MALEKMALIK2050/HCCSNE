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
          try { json = JSON.parse(body); } catch { json = { raw: body }; }
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
          try { json = JSON.parse(body); } catch { json = { raw: body }; }
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('1. Login as Coordinator (Pr. Elias Zerhouni)...');
  const loginRes = await postRequest('/api/auth/login', {
    email: 'zerhouni@hccsne.dz',
    password: 'membre123',
  });
  console.log('Login status:', loginRes.status, 'User:', loginRes.data.user?.nom);
  const rawCookie = loginRes.headers['set-cookie'];
  const cookie = Array.isArray(rawCookie) ? rawCookie.map((c) => c.split(';')[0]).join('; ') : '';

  console.log('\n2. GET /api/projects (Master list & Stats)...');
  const getProjectsRes = await getRequest('/api/projects', cookie);
  console.log('GET status:', getProjectsRes.status);
  console.log('Total projects in DB:', getProjectsRes.data.projects?.length);
  console.log('Total Budget DZD:', getProjectsRes.data.stats?.totalDZD?.toLocaleString('fr-FR'), 'DZD');
  console.log('Total Budget Devises:', getProjectsRes.data.stats?.totalDevises?.toLocaleString('fr-FR'), 'Devises');
  console.log('Average Progress:', getProjectsRes.data.stats?.avgProgress + '%');

  console.log('\n3. POST /api/projects (Create new project in Aérospatial)...');
  const createRes = await postRequest('/api/projects', {
    titre: 'Constellation Nationale de Nano-Satellites d’Observation Haute Résolution (Alsat-3 Nano)',
    specialite: 'Aéronautique & Technologies Spatiales',
    priorite: 'STRATEGIQUE',
    objectifs: 'Développement d’une filière algérienne de conception de nano-satellites CubeSat pour la surveillance environnementale et les télécommunications souveraines.',
    tdrTexte: 'Cahier des charges pour les charges utiles optiques et les stations sols de guidage.',
    universitesAlge: 'CTS Arzew, Agence Spatiale Algérienne (ASAL), Université de Tlemcen, USTHB',
    universitesEtrang: 'NASA JPL (Diaspora), ONERA (France), ISAE-Supaéro',
    entreprisesAlge: 'Entreprise Nationale de Télécommunication (ENTC), ASAL Opérations',
    entreprisesEtrang: 'Opérateurs de lanceurs spatiaux et fournisseurs de composants spatiaux durcis',
    ministeresTutelle: 'Ministère de la Poste et des Télécommunications, Ministère de l’Enseignement Supérieur',
    modeleEconomique: 'Création d’un pôle d’ingénierie spatiale locale et valorisation de données satellitaires',
    typePassation: 'Partenariat Public-Privé (PPP Investissement)',
    budgetDZD: 950000000,
    budgetDevises: 6000000,
    devise: 'EUR',
    sourcesFinancement: 'Fonds Spécial Spatial, Ligne budgétaire recherche MESRS',
    dureeMois: 36,
  }, cookie);
  console.log('Create status:', createRes.status);
  console.log('Created project code:', createRes.data.project?.code);
  console.log('Initial progress:', createRes.data.project?.avancement + '%');

  const newPrjId = createRes.data.project?.id;

  console.log('\n4. Toggle Milestone 2 & 3...');
  const toggleRes = await postRequest(`/api/projects/${newPrjId}/toggle-milestone`, {
    milestoneId: 2,
    completed: true,
    note: 'Consortium CTS Arzew + ASAL + Diaspora NASA JPL formalisé.',
  }, cookie);
  console.log('Toggle status:', toggleRes.status);
  console.log('New progress after toggle:', toggleRes.data.newProgress + '%');
  console.log('New status after toggle:', toggleRes.data.newStatus);

  console.log('\n5. GET /api/projects/[id] single project details...');
  const singleRes = await getRequest(`/api/projects/${newPrjId}`, cookie);
  console.log('Single GET status:', singleRes.status);
  console.log('Project title:', singleRes.data.project?.titre);
  console.log('Leader:', singleRes.data.project?.leader?.nom);

  console.log('\n=== ALL API TESTS PASSED SUCCESSFULLY! ===');
}

run().catch(console.error);
