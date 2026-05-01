#!/usr/bin/env node

/**
 * Seed temporal para entorno de pruebas:
 * - crea compañías
 * - crea desarrolladores
 * - crea proyectos enlazando ambos
 *
 * Uso:
 *   API_BASE_URL="https://mi-api.com" npm run seed:temp
 *
 * También toma VITE_API_BASE_URL si API_BASE_URL no existe.
 */

const apiBaseRaw = process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || "";
const apiBase = String(apiBaseRaw).trim().replace(/\/$/, "");

if (!apiBase) {
  console.error("Missing API base URL.");
  console.error("Set API_BASE_URL (or VITE_API_BASE_URL) and run again.");
  process.exit(1);
}

function nowIso() {
  return new Date().toISOString();
}

function randId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function parseJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function postFirstOk(paths, payload) {
  for (const path of paths) {
    const url = `${apiBase}${path}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) continue;
      const data = await parseJsonSafe(res);
      return { ok: true, path, data };
    } catch {
      // try next
    }
  }
  return { ok: false, path: null, data: null };
}

function readId(data) {
  if (data && typeof data === "object" && typeof data.id === "string") {
    return data.id.trim();
  }
  return "";
}

const companySeeds = [
  {
    firstName: "Marta Salinas",
    email: "marta.salinas+seed@acme-demo.com",
    phone: "+52 55 1111 2222",
    company: "Acme Logistics",
    subject: "Desarrollo de plataforma interna",
    message: "Necesitamos modernizar operación y tableros en tiempo real.",
    campaignID: "seed-temporal",
  },
  {
    firstName: "Diego Herrera",
    email: "diego.herrera+seed@nova-demo.com",
    phone: "+52 55 3333 4444",
    company: "Nova Retail Group",
    subject: "Automatización con IA",
    message: "Queremos automatizar clasificación de tickets y SLA.",
    campaignID: "seed-temporal",
  },
];

const developerSeeds = [
  {
    fullName: "Lucia Ortega",
    email: "lucia.ortega+seed@devmail.test",
    phoneNumber: "+52 55 7777 8888",
    role: "Frontend Developer",
    howTheyKnowVado: "Seed temporal",
    startVado: "Inmediata",
    validVisa: true,
    availabilityToTravel: true,
    currentlyEmployed: false,
    expertiseJson: JSON.stringify(["React", "TypeScript", "TailwindCSS"]),
    resumeURL: null,
  },
  {
    fullName: "Ricardo Ibarra",
    email: "ricardo.ibarra+seed@devmail.test",
    phoneNumber: "+52 55 9999 0000",
    role: "Backend Developer",
    howTheyKnowVado: "Seed temporal",
    startVado: "2 semanas",
    validVisa: false,
    availabilityToTravel: true,
    currentlyEmployed: true,
    expertiseJson: JSON.stringify(["Node.js", "PostgreSQL", "Docker"]),
    resumeURL: null,
  },
  {
    fullName: "Paula Mendez",
    email: "paula.mendez+seed@devmail.test",
    phoneNumber: "+52 55 1212 3434",
    role: "QA Engineer",
    howTheyKnowVado: "Seed temporal",
    startVado: "Inmediata",
    validVisa: true,
    availabilityToTravel: false,
    currentlyEmployed: false,
    expertiseJson: JSON.stringify(["Cypress", "Playwright", "Jest"]),
    resumeURL: null,
  },
];

function developerProspecto(dev, fallbackId) {
  const fullName = String(dev.fullName || "").trim();
  return {
    id: dev.id || fallbackId,
    nombre: fullName || "Developer Seed",
    rol: String(dev.role || "Developer"),
    correo: String(dev.email || "seed@example.com"),
  };
}

async function run() {
  console.log(`Seeding temporary data into ${apiBase}`);

  const companies = [];
  for (const seed of companySeeds) {
    const created = await postFirstOk(
      ["/contact/company-submissions", "/contact/company-submission"],
      seed,
    );
    if (!created.ok) {
      console.warn(`Company insert failed: ${seed.company}`);
      companies.push({ ...seed, id: randId("seed-company"), _inserted: false });
      continue;
    }
    const id = readId(created.data) || randId("seed-company");
    console.log(`Company inserted via ${created.path}: ${seed.company} (${id})`);
    companies.push({ ...seed, id, _inserted: true });
  }

  const developers = [];
  for (const seed of developerSeeds) {
    const created = await postFirstOk(["/users/developers", "/developers"], seed);
    if (!created.ok) {
      console.warn(`Developer insert failed: ${seed.fullName}`);
      developers.push({ ...seed, id: randId("seed-dev"), _inserted: false });
      continue;
    }
    const id = readId(created.data) || randId("seed-dev");
    console.log(`Developer inserted via ${created.path}: ${seed.fullName} (${id})`);
    developers.push({ ...seed, id, _inserted: true });
  }

  const projectsToCreate = [
    {
      id: randId("seed-project"),
      contactId: companies[0]?.id || randId("seed-contact"),
      titulo: "Portal operativo Acme",
      empresa: companies[0]?.company || "Acme Logistics",
      contactoNombre: companies[0]?.firstName || "Marta Salinas",
      servicio: companies[0]?.subject || "Desarrollo de plataforma interna",
      descripcion:
        companies[0]?.message ||
        "Proyecto seed temporal para validar flujo admin/company/dev.",
      prospectos: [
        developerProspecto(developers[0] || {}, randId("seed-dev")),
        developerProspecto(developers[1] || {}, randId("seed-dev")),
      ],
      createdAt: nowIso(),
    },
    {
      id: randId("seed-project"),
      contactId: companies[1]?.id || randId("seed-contact"),
      titulo: "Automatización de tickets Nova",
      empresa: companies[1]?.company || "Nova Retail Group",
      contactoNombre: companies[1]?.firstName || "Diego Herrera",
      servicio: companies[1]?.subject || "Automatización con IA",
      descripcion:
        companies[1]?.message ||
        "Proyecto seed temporal para validar badges y asignaciones.",
      prospectos: [
        developerProspecto(developers[2] || {}, randId("seed-dev")),
      ],
      createdAt: nowIso(),
    },
  ];

  let projectsInserted = 0;
  for (const project of projectsToCreate) {
    const created = await postFirstOk(["/projects"], project);
    if (!created.ok) {
      console.warn(`Project insert failed: ${project.titulo}`);
      continue;
    }
    projectsInserted += 1;
    console.log(`Project inserted: ${project.titulo}`);
  }

  console.log("\nSeed summary:");
  console.log(`- Companies: ${companies.length}`);
  console.log(`- Developers: ${developers.length}`);
  console.log(`- Projects: ${projectsInserted}/${projectsToCreate.length}`);
  console.log("Done.");
}

run().catch((err) => {
  console.error("Seed failed with unexpected error.");
  console.error(err);
  process.exit(1);
});
