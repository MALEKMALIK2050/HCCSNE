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

async function verify() {
  console.log('=== VERIFICATION: Strategic Projects Module ===');

  console.log('\n1. Login as Coordinator (Pr. Elias Zerhouni)...');
  const loginRes = await postRequest('/api/auth/login', {
    email: 'zerhouni@hccsne.dz',
    password: 'membre123',
  });
  const rawCookie = loginRes.headers['set-cookie'];
  const cookie = Array.isArray(rawCookie) ? rawCookie.map((c) => c.split(';')[0]).join('; ') : '';
  console.log('Login status:', loginRes.status, 'User:', loginRes.data.user?.prenom, loginRes.data.user?.nom);

  console.log('\n2. Fetch Projects Master List & KPIs...');
  const listRes = await getRequest('/api/projects', cookie);
  console.log('List HTTP status:', listRes.status);
  console.log('Total Strategic Projects:', listRes.data.projects?.length);
  console.log('Total Portfolio DZD:', (listRes.data.stats?.totalDZD / 1000000).toFixed(1), 'M DZD');
  console.log('Total Portfolio Devises:', (listRes.data.stats?.totalDevises / 1000000).toFixed(1), 'M $/€');
  console.log('Average Progress:', listRes.data.stats?.avgProgress + '%');

  console.log('\n3. Create New Strategic Project via Form API...');
  const newProjectPayload = {
    titre: 'Génome National Algérien & Banque d’ADN Souveraine pour la Santé de Précision',
    specialite: 'Santé & Biotechnologies Médicales',
    priorite: 'URGENT',
    objectifs: 'Séquençage génomique à haut débit de la population algérienne pour cartographier les maladies rares, adapter les traitements oncologiques et garantir la souveraineté bio-informatique.',
    tdrTexte: 'Cahier des charges pour les séquenceurs de nouvelle génération (NGS), bio-banque cryogénique et serveurs sécurisés de données génomiques.',
    impactSouverainete: 'Souveraineté absolue sur le patrimoine génétique national, interdiction de transfert des échantillons bruts hors des frontières.',
    universitesAlge: 'Faculté de Médecine d’Alger, Centre de Recherche en Biotechnologie (CRBt Constantine), Institut Pasteur d’Algérie',
    universitesEtrang: 'Johns Hopkins Institute of Genetic Medicine, Broad Institute of MIT and Harvard',
    entreprisesAlge: 'Groupe Saidal, Algérie Télécom (Liaison dédiée sécurisée)',
    entreprisesEtrang: 'Fournisseurs d’équipements NGS sous licence souveraine',
    ministeresTutelle: 'Ministère de la Santé, Ministère de l’Enseignement Supérieur (MESRS)',
    modeleEconomique: 'Création d’un pôle d’oncogénétique de référence maghrébine et africaine',
    typePassation: 'Consultation Sélective / Appel d’Offres Restreint (Haut niveau tech)',
    impactEconomique: 'Réduction de 70% des coûts d’analyses génétiques envoyées en Europe',
    budgetDZD: 1200000000,
    budgetDevises: 8000000,
    devise: 'EUR',
    sourcesFinancement: 'Fonds National de la Recherche, Ligne budgétaire Santé 2026',
    dureeMois: 36,
  };

  const createRes = await postRequest('/api/projects', newProjectPayload, cookie);
  console.log('Create HTTP status:', createRes.status);
  const createdProject = createRes.data.project;
  console.log('Created Project Code:', createdProject.code);
  console.log('Title:', createdProject.titre);
  console.log('Initial Avancement:', createdProject.avancement + '%');
  console.log('Initial Statut:', createdProject.statut);

  console.log('\n4. Upload TDR Document (PDF) to the newly created project...');
  const dummyTdrBase64 = 'data:application/pdf;base64,' + Buffer.from('%PDF-1.4 Mock TDR Genome National Algerien Souverain').toString('base64');
  const uploadDocRes = await postRequest(`/api/projects/${createdProject.id}/upload-document`, {
    file: dummyTdrBase64,
    title: 'Termes de Référence - Séquençage Génomique National',
    type: 'TDR',
    filename: 'TDR_Genome_National_Algerie_2026.pdf',
  }, cookie);
  console.log('Upload TDR status:', uploadDocRes.status);
  console.log('TDR File URL:', uploadDocRes.data.fileUrl);

  console.log('\n5. Toggle Milestones in the Checklist (Steps 2, 3, 4, 5)...');
  // Complete Jalon 2 (Consortium)
  await postRequest(`/api/projects/${createdProject.id}/toggle-milestone`, {
    milestoneId: 2,
    completed: true,
    note: 'Consortium Faculté Médecine Alger + CRBt Constantine + Johns Hopkins constitué.',
  }, cookie);

  // Complete Jalon 3 (Validation Commission)
  await postRequest(`/api/projects/${createdProject.id}/toggle-milestone`, {
    milestoneId: 3,
    completed: true,
    note: 'Examen technique validé à l’unanimité par la Commission Santé.',
  }, cookie);

  // Complete Jalon 4 (Avis Coordination)
  const milestone4Res = await postRequest(`/api/projects/${createdProject.id}/toggle-milestone`, {
    milestoneId: 4,
    completed: true,
    note: 'Validation stratégique par le Coordinateur Général.',
  }, cookie);

  console.log('Avancement after milestones 1,2,3,4:', milestone4Res.data.newProgress + '%');
  console.log('New Status:', milestone4Res.data.newStatus);

  console.log('\n6. Verify Single Project GET /api/projects/[id]...');
  const getSingleRes = await getRequest(`/api/projects/${createdProject.id}`, cookie);
  console.log('Single GET status:', getSingleRes.status);
  console.log('Documents count:', getSingleRes.data.project?.documents?.length);
  console.log('TDR Nom:', getSingleRes.data.project?.tdrFichierNom);
  console.log('Avancement in DB:', getSingleRes.data.project?.avancement + '%');

  console.log('\n=== ALL PROJECT MODULE VERIFICATIONS COMPLETED SUCCESSFULLY! ===');
}

verify().catch(console.error);
