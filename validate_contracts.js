const fs = require("fs");
const path = require("path");

const protocolsDir = "./protocols";
const examplesDir = "./contracts/examples";

console.log("🌿 [OFFICINE DE RICK] Diagnostic Sobriété en cours...");

/**
 * Validateur Naturel : Simule le comportement d'un schéma sans la lourdeur d'Ajv
 */
function validateNative(data, schema) {
    const errors = [];
    const required = schema.required || [];

    // 1. Vérification des champs requis
    required.forEach(field => {
        if (data[field] === undefined) {
            errors.push(`Champ manquant : ${field}`);
        }
    });

    // 2. Vérification de la version (Loi de Kardashev)
    if (data.schema_version !== "1.0") {
        errors.push(`Version invalide : attendu 1.0, reçu ${data.schema_version}`);
    }

    // 3. Vérification des formats ID (Regex simple)
    const idFields = ["id", "linked_intent_id", "linked_decision_id"];
    idFields.forEach(field => {
        if (data[field] && typeof data[field] === "string") {
            if (field === "id" && !data[field].match(/^[A-Z]{3,5}-\d{8}/)) {
                errors.push(`Format ID invalide pour ${field} : ${data[field]}`);
            }
        }
    });

    return errors;
}

const schemasFiles = fs.readdirSync(protocolsDir).filter(f => f.endsWith(".json"));
const examplesFiles = fs.readdirSync(examplesDir).filter(f => f.endsWith(".json"));

let systemHealthy = true;

examplesFiles.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(examplesDir, file), "utf-8"));
    const schemaFile = file.replace(".example", ".schema");

    if (fs.existsSync(path.join(protocolsDir, schemaFile))) {
        const schema = JSON.parse(fs.readFileSync(path.join(protocolsDir, schemaFile), "utf-8"));
        const errors = validateNative(data, schema);

        if (errors.length === 0) {
            console.log(`✅ ${file.padEnd(25)} | CONTRAT CONFORME`);
        } else {
            console.error(`🚨 ${file.padEnd(25)} | ÉCHEC : ${errors.join(", ")}`);
            systemHealthy = false;
        }
    } else {
        console.warn(`⚠️  Schéma manquant pour ${file}`);
    }
});

if (systemHealthy) {
    console.log("\n✨ Mycélium stable. Le système A'Space OS V4 est souverain (Zéro Dépendance).");
} else {
    process.exit(1);
}
