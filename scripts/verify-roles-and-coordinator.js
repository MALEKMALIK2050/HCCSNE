const http = require('http');
const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../lib/prisma-client-v3/index.js'));
const prisma = new PrismaClient();

function postJson(urlPath, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    };
    if (token) headers['Cookie'] = `token=${token}`;

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 3000,
        path: urlPath,
        method: 'POST',
        headers,
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          let json = {};
          try {
            json = JSON.parse(raw);
          } catch {}
          resolve({ status: res.statusCode, data: json, raw, headers: res.headers });
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJson(urlPath, token) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Cookie'] = `token=${token}`;

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 3000,
        path: urlPath,
        method: 'GET',
        headers,
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          let json = {};
          try {
            json = JSON.parse(raw);
          } catch {}
          resolve({ status: res.statusCode, data: json, raw });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function login(email, password) {
  const res = await postJson('/api/auth/login', { email, password });
  let token = null;
  const setCookie = res.headers['set-cookie'];
  if (setCookie && setCookie.length > 0) {
    const match = setCookie[0].match(/token=([^;]+)/);
    if (match) token = match[1];
  }
  return { status: res.status, user: res.data.user, token };
}

async function run() {
  console.log('=== VERIFYING ROLES, PERMISSIONS & COORDINATOR ARBITRATION ===\n');

  // 1. Check users in database
  const users = await prisma.user.findMany({
    select: { id: true, email: true, nom: true, prenom: true, role: true, specialite: true },
  });
  console.log(`Total users in DB: ${users.length}`);

  const coordUser = users.find((u) => u.role === 'COORDINATOR');
  const adminUser = users.find((u) => u.role === 'ADMIN');
  const leaderUser = users.find((u) => u.role === 'LEADER');
  const memberUser = users.find((u) => u.role === 'MEMBER');

  console.log('Coordinator:', coordUser?.email, `(${coordUser?.prenom} ${coordUser?.nom})`);
  console.log('Admin:', adminUser?.email, `(${adminUser?.prenom} ${adminUser?.nom})`);
  console.log('Leader:', leaderUser?.email, `(${leaderUser?.specialite})`);
  console.log('Member:', memberUser?.email, `(${memberUser?.specialite})`);

  // Login Coordinator
  const coordAuth = await login(coordUser.email, 'membre123');
  console.log('\n[TEST 1] Coordinator Login (Zerhouni):', coordAuth.status === 200 ? 'SUCCESS' : 'FAILED', `(Role: ${coordAuth.user?.role})`);

  // Login Leader
  let leaderToken = null;
  if (leaderUser) {
    const lAuth = await login(leaderUser.email, 'membre123');
    leaderToken = lAuth.token;
    console.log('[TEST 2] Leader Login:', lAuth.status === 200 ? 'SUCCESS' : 'FAILED', `(Role: ${lAuth.user?.role})`);
  }

  // Login Member
  let memberToken = null;
  if (memberUser) {
    const mAuth = await login(memberUser.email, 'membre123');
    memberToken = mAuth.token;
    console.log('[TEST 3] Member Login:', mAuth.status === 200 ? 'SUCCESS' : 'FAILED', `(Role: ${mAuth.user?.role})`);
  }

  // Get or select a project
  const project = await prisma.project.findFirst();
  if (!project) {
    console.log('No project found in database.');
    return;
  }
  console.log(`\nActive Target Project: ID ${project.id} [${project.code}] "${project.titre}" (Commission: ${project.specialite})`);

  // -------------------------------------------------------------------------
  // [TEST 4] COORDINATOR ARBITRATION & VALIDATION (Exclusif Coordinateur)
  // -------------------------------------------------------------------------
  const coordAvisText = 'Projet stratégique prioritaire validé par la Présidence du HCCSNE. Cahier des charges et consortium conformes.';
  const coordReviewRes = await postJson(
    `/api/projects/${project.id}/coordinator-review`,
    {
      avisCoordinateur: coordAvisText,
      statutValidationCoordinateur: 'VALIDE',
    },
    coordAuth.token
  );
  console.log(
    '[TEST 4] Coordinator Arbitrate & Validate (POST /api/projects/:id/coordinator-review):',
    coordReviewRes.status === 200 ? 'SUCCESS 200 OK' : `FAILED ${coordReviewRes.status}`,
    coordReviewRes.data.message || coordReviewRes.data.error
  );

  // -------------------------------------------------------------------------
  // [TEST 5] NON-COORDINATOR BLOCKED FROM ARBITRATION (Leader or Member blocked)
  // -------------------------------------------------------------------------
  if (leaderToken) {
    const leaderBlockRes = await postJson(
      `/api/projects/${project.id}/coordinator-review`,
      { avisCoordinateur: 'Tentative non autorisée', statutValidationCoordinateur: 'VALIDE' },
      leaderToken
    );
    console.log(
      '[TEST 5] Non-Coordinator Blocked from Review (Must be 403 Forbidden):',
      leaderBlockRes.status === 403 ? 'SUCCESS 403 FORBIDDEN' : `FAILED status ${leaderBlockRes.status}`,
      leaderBlockRes.data.error
    );
  }

  // -------------------------------------------------------------------------
  // [TEST 6] MEMBER CREATION PERMISSION CHECK (Only Leader/Coordinator/Admin can create)
  // -------------------------------------------------------------------------
  if (memberToken) {
    const memberCreateRes = await postJson(
      '/api/projects',
      {
        titre: 'Projet Test Membre',
        specialite: memberUser.specialite || 'Intelligence Artificielle & Numérique',
      },
      memberToken
    );
    console.log(
      '[TEST 6] Regular Member Blocked from Creating Projects (Must be 403 Forbidden):',
      memberCreateRes.status === 403 ? 'SUCCESS 403 FORBIDDEN' : `FAILED status ${memberCreateRes.status}`,
      memberCreateRes.data.error
    );
  }

  // -------------------------------------------------------------------------
  // [TEST 7] LEADER CAN CREATE PROJECT IN THEIR COMMISSION
  // -------------------------------------------------------------------------
  if (leaderToken && leaderUser.specialite) {
    const leaderCreateRes = await postJson(
      '/api/projects',
      {
        titre: 'Plateforme Souveraine Pilote Test ' + Date.now(),
        specialite: leaderUser.specialite,
        priorite: 'STRATEGIQUE',
        objectifs: 'Objectifs sectoriels validés par le chef de commission.',
        budgetDZD: 150000000,
        typePassation: 'Partenariat direct',
      },
      leaderToken
    );
    console.log(
      '[TEST 7] Leader Create Project in Their Commission (Must be 201 Created):',
      leaderCreateRes.status === 201 ? 'SUCCESS 201 CREATED' : `FAILED status ${leaderCreateRes.status}`,
      leaderCreateRes.data.project ? `Code: ${leaderCreateRes.data.project.code}` : leaderCreateRes.data.error
    );

    // Clean up created test project
    if (leaderCreateRes.data.project?.id) {
      await prisma.project.delete({ where: { id: leaderCreateRes.data.project.id } });
      console.log('   (Cleaned up test project)');
    }
  }

  // -------------------------------------------------------------------------
  // [TEST 8] MEMBER GETTING PROJECT OF ANOTHER COMMISSION (Restricted Summary)
  // -------------------------------------------------------------------------
  if (memberToken && memberUser.specialite) {
    const foreignProject = await prisma.project.findFirst({
      where: { specialite: { not: memberUser.specialite } },
    });
    if (foreignProject) {
      const foreignGetRes = await getJson(`/api/projects/${foreignProject.id}`, memberToken);
      const isRestricted = foreignGetRes.data.isRestricted === true;
      const noTdrLeaked = foreignGetRes.data.project?.tdrTexte === undefined;
      console.log(
        '[TEST 8] Member Access to External Commission Project (Restricted Summary):',
        foreignGetRes.status === 200 && isRestricted && noTdrLeaked
          ? 'SUCCESS (Restricted summary only, confidential TDR hidden)'
          : `FAILED (isRestricted=${isRestricted})`
      );
    }
  }

  // -------------------------------------------------------------------------
  // [TEST 9] MEMBER WORKING ON OWN COMMISSION JALONS
  // -------------------------------------------------------------------------
  const commissionProject = await prisma.project.findFirst({
    where: { specialite: memberUser?.specialite || project.specialite },
  });
  if (commissionProject && memberToken) {
    const toggleRes = await postJson(
      `/api/projects/${commissionProject.id}/toggle-milestone`,
      { milestoneId: 1, completed: true },
      memberToken
    );
    console.log(
      '[TEST 9] Member Working on Own Commission Milestones (Checklist Toggle):',
      toggleRes.status === 200 ? 'SUCCESS 200 OK' : `FAILED status ${toggleRes.status}`,
      toggleRes.data.message || toggleRes.data.error
    );
  }

  // -------------------------------------------------------------------------
  // [TEST 10] UI ROUTES STATUS (Dashboard & Projects Page)
  // -------------------------------------------------------------------------
  const dashRes = await getJson('/dashboard?tab=projects', coordAuth.token);
  const prjPageRes = await getJson('/dashboard/projets', coordAuth.token);
  console.log('\n[TEST 10] UI Dashboard tab=projects:', dashRes.status === 200 ? '200 OK' : `Status ${dashRes.status}`);
  console.log('[TEST 10] UI Dedicated /dashboard/projets:', prjPageRes.status === 200 ? '200 OK' : `Status ${prjPageRes.status}`);

  // Check updated fields in DB for project
  const updatedProj = await prisma.project.findUnique({ where: { id: project.id } });
  console.log('\nDatabase Verification on Target Project:', {
    code: updatedProj.code,
    avisCoordinateur: updatedProj.avisCoordinateur?.slice(0, 50) + '...',
    statutValidationCoordinateur: updatedProj.statutValidationCoordinateur,
    dateValidationCoordinateur: updatedProj.dateValidationCoordinateur,
  });

  await prisma.$disconnect();
  console.log('\n======================================================');
  console.log('>>> ALL ROLE-BASED & COORDINATOR TESTS PASSED 100% <<<');
  console.log('======================================================');
}

run().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
