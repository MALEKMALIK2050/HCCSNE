const { PrismaClient } = require('../lib/prisma-client-v3/index.js');
const prisma = new PrismaClient();
const { DEFAULT_PROJECT_MILESTONES, calculateProgressFromMilestones, determineStatusFromProgress } = require('../lib/projects-config.js');

const INITIAL_PROJECTS = [
  {
    code: 'PRJ-SANTE-2026-001',
    titre: 'Plateforme Nationale d’Imagerie Médicale Haute Résolution & IA Diagnostique',
    specialite: 'Santé & Biotechnologies Médicales',
    roomId: 6,
    leaderEmail: 'zerhouni@hccsne.dz',
    priorite: 'URGENT',
    objectifs: 'Création d’un réseau national unifié reliant les CHU d’Alger, Oran et Constantine aux centres d’expertise de la diaspora, doté d’algorithmes IA d’aide au diagnostic précoce du cancer et des pathologies cardiovasculaires.',
    tdrTexte: 'Cahier des charges pour l’acquisition, l’interconnexion sécurisée des équipements IRM/Scanner et le déploiement sur Cloud Souverain algérien.',
    tdrFichierNom: 'TDR_Imagerie_Medicale_Souveraine_HCCSNE.pdf',
    tdrFichierUrl: '/uploads/documents/TDR_Imagerie_Medicale_Souveraine_HCCSNE.pdf',
    impactSouverainete: 'Autonomie diagnostique complète, réduction des évacuations sanitaires à l’étranger, constitution d’une base de données épidémiologique nationale.',
    universitesAlge: 'Faculté de Médecine d’Alger (Ben Aknoun), Université d’Oran 1, CHU Mustapha Pacha, CHU Benbadis Constantine',
    universitesEtrang: 'Johns Hopkins Medicine (USA), Harvard Medical School, Institut Curie (France)',
    entreprisesAlge: 'Groupe Saidal, Algérie Télécom (backbone fibre), Centre de Recherche en Biotechnologie (C.R.Bt)',
    entreprisesEtrang: 'Consortium d’équipements d’imagerie médicale & Partenaires R&D diaspora',
    ministeresTutelle: 'Ministère de la Santé, Ministère de l’Enseignement Supérieur et de la Recherche Scientifique',
    modeleEconomique: 'R&D collaborative avec industrialisation locale de solutions logicielles et formation médicale continue',
    typePassation: 'Appel d’Offres Restreint (Haut niveau tech) & Partenariat Public-Privé',
    impactEconomique: 'Économie estimée de 45 millions USD/an en transferts technologiques et prises en charge locales',
    budgetDZD: 850000000,
    budgetDevises: 5500000,
    devise: 'USD',
    sourcesFinancement: 'Fonds National de la Recherche (FNR), Ligne budgétaire sectorielle Santé, Co-financement Diaspora',
    dureeMois: 24,
    completedJalonsCount: 3, // Jalons 1, 2, 3 done
  },
  {
    code: 'PRJ-IA-2026-002',
    titre: 'Supercalculateur HPC Souverain & Modèles LLM Arabo-Berbères Spécialisés',
    specialite: 'Intelligence Artificielle & Sciences des Données',
    roomId: 2,
    leaderEmail: 'yassaa@hccsne.dz',
    priorite: 'STRATEGIQUE',
    objectifs: 'Déploiement d’un supercalculateur de classe Petaflopique au Pôle Technologique de Sidi Abdellah et entraînement de modèles de langage spécialisés dans l’ingénierie énergétique et le patrimoine juridique national.',
    tdrTexte: 'Spécifications d’architecture GPU, système de refroidissement éco-efficace et pipeline d’entraînement de données massives.',
    tdrFichierNom: 'TDR_Supercalculateur_HPC_SidiAbdellah.docx',
    tdrFichierUrl: '/uploads/documents/TDR_Supercalculateur_HPC_SidiAbdellah.docx',
    impactSouverainete: 'Souveraineté des données algorithmiques, indépendance vis-à-vis des clouds étrangers pour la recherche critique.',
    universitesAlge: 'CERIST Alger, École Nationale Supérieure d’Intelligence Artificielle (ENSIA Sidi Abdellah), USTHB',
    universitesEtrang: 'MIT CSAIL, Université de Stanford, CNRS (France)',
    entreprisesAlge: 'Sonatrach (Direction Centrale R&D), Sonelgaz, Algérie Poste',
    entreprisesEtrang: 'Nvidia Research Alliance, Partenaires technologiques diaspora Silicon Valley',
    ministeresTutelle: 'Ministère de l’Enseignement Supérieur, Haut-Commissariat à la Numérisation',
    modeleEconomique: 'Infrastructure nationale critique partagée entre universités et grands groupes industriels publics',
    typePassation: 'Appel d’Offres Ouvert National & International avec clause de compensation technologique (Offset)',
    impactEconomique: 'Rétention des talents en data science et création de 200 emplois d’ingénieurs IA en Algérie',
    budgetDZD: 1400000000,
    budgetDevises: 9200000,
    devise: 'EUR',
    sourcesFinancement: 'Programme National Prioritaire IA, Fonds de la Recherche Scientifique, Sonatrach R&D',
    dureeMois: 36,
    completedJalonsCount: 2, // Jalons 1, 2 done
  },
  {
    code: 'PRJ-SEMI-2026-003',
    titre: 'Unité Nationale de Design de Puces & Packaging 3D Avancé pour Micro-capteurs',
    specialite: 'Science des matériaux & Puces',
    roomId: 4,
    leaderEmail: 'haba@hccsne.dz',
    priorite: 'STRATEGIQUE',
    objectifs: 'Mise en place d’un centre de design de puces électroniques (Fabless) et d’une ligne pilote de packaging 3D haute densité sous la direction scientifique du Dr. Belgacem Haba.',
    tdrTexte: 'Étude d’ingénierie pour les salles blanches, outils CAD (EDA) et bancs d’essais thermomécaniques de puces.',
    tdrFichierNom: 'TDR_Packaging_Puces_Microelectronique.pdf',
    tdrFichierUrl: '/uploads/documents/TDR_Packaging_Puces_Microelectronique.pdf',
    impactSouverainete: 'Maîtrise des briques matérielles fondamentales pour l’électronique de puissance, les télécoms et l’industrie militaire.',
    universitesAlge: 'CDTA (Centre de Développement des Technologies Avancées Baba Hassen), École Polytechnique d’Alger (ENP)',
    universitesEtrang: 'Stanford Nano Shared Facilities, Xperi Labs (Silicon Valley), Université de Tokyo',
    entreprisesAlge: 'ENIE Sidi Bel Abbès, Entreprise Nationale des Systèmes Électroniques (ENSE), DGRSDT',
    entreprisesEtrang: 'Foundries internationales partenaires & équipementiers semiconducteurs',
    ministeresTutelle: 'Ministère de l’Industrie, Ministère de l’Enseignement Supérieur',
    modeleEconomique: 'Création d’une filière de fabrication sans usine (Fabless) et valorisation de brevets internationaux',
    typePassation: 'Partenariat Public-Privé (PPP Investissement) & Convention Stratégique de Co-développement',
    impactEconomique: 'Insertion de l’Algérie dans la chaîne de valeur mondiale des puces et micro-systèmes MEMS',
    budgetDZD: 1800000000,
    budgetDevises: 12000000,
    devise: 'USD',
    sourcesFinancement: 'Fonds Spécial de Promotion des Exportations, Partenariats industriels diaspora',
    dureeMois: 30,
    completedJalonsCount: 4, // Jalons 1, 2, 3, 4 done
  },
  {
    code: 'PRJ-ENERGIE-2026-004',
    titre: 'Filière Pilote d’Hydrogène Vert Saharien & Électrolyseurs Haute Efficacité',
    specialite: 'Énergies Renouvelables & Transition Énergétique',
    roomId: 5,
    leaderEmail: 'youcef-toumi@hccsne.dz',
    priorite: 'STRUCTURANT',
    objectifs: 'Conception et installation d’un démonstrateur de production d’hydrogène vert par électrolyse alimentée par champ solaire à Hassi R’Mel, avec injection pilote dans le gazoduc.',
    tdrTexte: 'Cahier des charges pour l’intégration PV-Électrolyseur, compression d’hydrogène et analyse de cycle de vie.',
    tdrFichierNom: 'TDR_Hydrogene_Vert_HassiRMel.pdf',
    tdrFichierUrl: '/uploads/documents/TDR_Hydrogene_Vert_HassiRMel.pdf',
    impactSouverainete: 'Préparation de l’après-pétrole, décarbonation industrielle et positionnement stratégique pour l’exportation vers l’Europe.',
    universitesAlge: 'Centre de Développement des Énergies Renouvelables (CDER Bouzaréah), USTO Oran, Université de Ouargla',
    universitesEtrang: 'MIT Energy Initiative, Fraunhofer Institute (Allemagne), McGill University (Canada)',
    entreprisesAlge: 'Sonatrach, Sonelgaz, Groupe Asmidal',
    entreprisesEtrang: 'Consortium germano-algérien de l’énergie, Partenaires technologiques diaspora',
    ministeresTutelle: 'Ministère de l’Énergie et des Mines, Ministère de l’Environnement',
    modeleEconomique: 'Projet d’infrastructure structurante avec économies d’échelle et certification carbone',
    typePassation: 'Appel d’Offres Ouvert National & International',
    impactEconomique: 'Génération prévisionnelle de devises par exportations d’ammoniac vert et hydrogène propre',
    budgetDZD: 2200000000,
    budgetDevises: 15000000,
    devise: 'EUR',
    sourcesFinancement: 'Sonatrach Investissements Verts, Fonds National pour la Maîtrise de l’Énergie, Prêts verts bilatéraux',
    dureeMois: 36,
    completedJalonsCount: 2,
  },
  {
    code: 'PRJ-AGRI-2026-005',
    titre: 'Numérisation par Drones & Revégétalisation Haute Résilience du Barrage Vert',
    specialite: 'Agriculture Saharienne & Sécurité Alimentaire',
    roomId: 7,
    leaderEmail: 'zaghib@hccsne.dz',
    priorite: 'STRATEGIQUE',
    objectifs: 'Surveillance satellitaire et par essaims de drones multispectraux de la bande du Barrage Vert, avec réintroduction d’espèces forestières et pastorales xérophiles à haute fixation carbonée.',
    tdrTexte: 'Spécifications techniques des capteurs de stress hydrique, cartographie SIG et stations météo autonomes.',
    tdrFichierNom: 'TDR_Barrage_Vert_Numerique_Drones.pdf',
    tdrFichierUrl: '/uploads/documents/TDR_Barrage_Vert_Numerique_Drones.pdf',
    impactSouverainete: 'Protection des terres fertiles du Nord contre la désertification et souveraineté alimentaire.',
    universitesAlge: 'École Nationale Supérieure Agronomique (ENSA El Harrach), INRAA, Université de Djelfa, Université de Biskra',
    universitesEtrang: 'INRAE (France), University of California Davis, Wageningen University (Pays-Bas)',
    entreprisesAlge: 'Groupe Génie Rural (GGR), Agence Spatiale Algérienne (ASAL), Entreprise Nationale de Foresterie',
    entreprisesEtrang: 'Opérateurs de télédétection spatiale et capteurs IoT environnementaux',
    ministeresTutelle: 'Ministère de l’Agriculture et du Développement Rural, Ministère des Eaux',
    modeleEconomique: 'Préservation des actifs agricoles nationaux, séquestration de carbone et crédit carbone international',
    typePassation: 'Appel à Projets National (FNR / MESRS) & Conventions interministérielles',
    impactEconomique: 'Sauvegarde de 1,5 million d’hectares de terres agricoles et création d’emplois en zones steppiques',
    budgetDZD: 650000000,
    budgetDevises: 2800000,
    devise: 'EUR',
    sourcesFinancement: 'Budget National du Barrage Vert, Fonds Mondial pour l’Environnement (FEM), MESRS',
    dureeMois: 24,
    completedJalonsCount: 5, // Jalons 1 to 5 done (En réalisation)
  },
];

async function seed() {
  console.log('Seeding strategic projects...');
  const users = await prisma.user.findMany();
  const admin = users.find((u) => u.role === 'ADMIN') || users[0];

  for (const item of INITIAL_PROJECTS) {
    const leader = users.find((u) => u.email === item.leaderEmail) || admin;

    // Build milestones
    const milestones = DEFAULT_PROJECT_MILESTONES.map((m, idx) => {
      const isCompleted = idx < item.completedJalonsCount;
      return {
        ...m,
        completed: isCompleted,
        completedAt: isCompleted ? `2026-0${idx + 1}-15` : null,
        note: isCompleted ? `Phase validée avec succès par le comité de pilotage.` : '',
      };
    });

    const progress = calculateProgressFromMilestones(milestones);
    const status = determineStatusFromProgress(progress);

    const data = {
      code: item.code,
      titre: item.titre,
      specialite: item.specialite,
      roomId: item.roomId,
      leaderId: leader.id,
      createdById: admin.id,
      statut: status,
      avancement: progress,
      priorite: item.priorite,
      objectifs: item.objectifs,
      tdrTexte: item.tdrTexte,
      tdrFichierNom: item.tdrFichierNom,
      tdrFichierUrl: item.tdrFichierUrl,
      impactSouverainete: item.impactSouverainete,
      universitesAlge: item.universitesAlge,
      universitesEtrang: item.universitesEtrang,
      entreprisesAlge: item.entreprisesAlge,
      entreprisesEtrang: item.entreprisesEtrang,
      ministeresTutelle: item.ministeresTutelle,
      modeleEconomique: item.modeleEconomique,
      typePassation: item.typePassation,
      impactEconomique: item.impactEconomique,
      budgetDZD: item.budgetDZD,
      budgetDevises: item.budgetDevises,
      devise: item.devise,
      sourcesFinancement: item.sourcesFinancement,
      dureeMois: item.dureeMois,
      dateDebut: new Date('2026-01-15'),
      dateFin: new Date('2028-06-30'),
      jalons: JSON.stringify(milestones),
    };

    const project = await prisma.project.upsert({
      where: { code: item.code },
      update: data,
      create: data,
    });

    console.log(`✅ Seeded project: ${project.code} - ${project.titre} (${project.avancement}%)`);
  }

  const count = await prisma.project.count();
  console.log(`\n🎉 Total strategic projects in DB: ${count}`);
  await prisma.$disconnect();
}

seed().catch(console.error);


