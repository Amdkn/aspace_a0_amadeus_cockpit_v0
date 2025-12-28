// validate_contracts.js (CLI wrapper)
// Single source of truth: src/lib/aspace-validator.ts (compiled to dist/)

const fs = require("fs");
const path = require("path");

let validator;
try {
  // After `npm run build`, this file exists:
  validator = require("./dist/src/lib/aspace-validator.js");
} catch (e) {
  console.error("❌ Validator not built. Run: npm run build");
  console.error("   (This repo uses a single validator source: src/lib/aspace-validator.ts)");
  process.exit(1);
}

const { validateAgainstSchemaFile } = validator;

const protocolsDir = "./protocols";
const examplesDir = "./contracts/examples";

console.log("🌿 [OFFICINE DE RICK] Audit de Souveraineté : Validation Récursive (single-validator)...");

const exampleFiles = fs.readdirSync(examplesDir).filter(f => f.endsWith(".json"));

const invalidDir = "./contracts/invalid";
let invalidFiles = [];
if (fs.existsSync(invalidDir)) {
  invalidFiles = fs.readdirSync(invalidDir).filter(f => f.endsWith(".json"));
}

let systemHealthy = true;
let validCount = 0;
let invalidCount = 0;

console.log("\n📋 VALID CONTRACTS (must pass):");
console.log("================================");

for (const file of exampleFiles) {
  const data = JSON.parse(fs.readFileSync(path.join(examplesDir, file), "utf-8"));
  const schemaFile = file.replace(".example", ".schema");
  const schemaPath = path.join(protocolsDir, schemaFile);

  if (!fs.existsSync(schemaPath)) {
    console.warn(`⚠️  Schéma manquant pour ${file}`);
    continue;
  }

  const res = validateAgainstSchemaFile(data, schemaPath);

  if (res.valid) {
    console.log(`✅ ${file.padEnd(25)} | CONTRAT CONFORME`);
    validCount++;
  } else {
    console.error(`🚨 ${file.padEnd(25)} | ÉCHECS :`);
    res.errors.forEach(err => console.error(`   - ${err}`));
    systemHealthy = false;
  }
}

if (invalidFiles.length > 0) {
  console.log("\n🔥 INVALID CONTRACTS (must fail):");
  console.log("=================================");

  for (const file of invalidFiles) {
    const data = JSON.parse(fs.readFileSync(path.join(invalidDir, file), "utf-8"));

    // e.g. "decision.extra_property.json" -> "decision.schema.json"
    const schemaName = file.split(".")[0];
    const schemaFile = `${schemaName}.schema.json`;
    const schemaPath = path.join(protocolsDir, schemaFile);

    if (!fs.existsSync(schemaPath)) {
      console.warn(`⚠️  Schéma manquant pour ${file}`);
      continue;
    }

    const res = validateAgainstSchemaFile(data, schemaPath);

    if (!res.valid) {
      console.log(`✅ ${file.padEnd(35)} | REJETÉ (attendu)`);
      console.log(`   └─ ${res.errors[0]}`);
      invalidCount++;
    } else {
      console.error(`🚨 ${file.padEnd(35)} | ACCEPTÉ (DANGER!)`);
      console.error(`   └─ Ce contrat invalide a passé la validation`);
      systemHealthy = false;
    }
  }
}

console.log("\n" + "=".repeat(50));
console.log(`📊 Résultats: ${validCount} valides | ${invalidCount} invalides rejetés`);

if (systemHealthy) {
  console.log("\n✨ Mycélium stable. La Loi est exécutée via un seul validator.");
  process.exit(0);
} else {
  console.error("\n❌ Corruption détectée. Alignement requis.");
  process.exit(1);
}
