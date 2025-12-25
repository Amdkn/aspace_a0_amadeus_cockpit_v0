const fs = require("fs");
const path = require("path");

const protocolsDir = "./protocols";
const examplesDir = "./contracts/examples";

console.log("🌿 [OFFICINE DE RICK] Audit de Souveraineté : Validation Récursive...");

/**
 * Validateur Naturel A'Space (Zero Dependency)
 * Enforce Law, Not Poetry.
 */
class ASpaceValidator {
    constructor() {
        this.errors = [];
    }

    validate(data, schema, path = "", rootContext = null) {
        const currentPath = path || "Root";
        // console.log(`Debugging: Validating ${currentPath}`); // Uncomment for verbose debug

        if (!schema) return;

        // Capture root context on first call
        if (!rootContext) rootContext = schema;

        // 1. Dereference $ref if present
        if (schema.$ref) {
            try {
                const resolved = this.resolveRef(schema.$ref, rootContext);
                // Merge schema attributes with resolved schema (pattern, title, etc)
                schema = { ...resolved, ...schema };
                delete schema.$ref;
            } catch (e) {
                this.addError(currentPath, `Erreur de référence : ${e.message}`);
                return;
            }
        }

        // Handle case where schema might be empty after ref resolution or null
        if (!schema || typeof schema !== "object") return;

        // 2. Type Checking
        if (schema.type) {
            const actualType = Array.isArray(data) ? "array" : (data === null ? "null" : typeof data);
            let expectedType = schema.type;

            // Basic type alias for integer
            if (expectedType === "integer") expectedType = "number";

            if (expectedType === "number" && typeof data === "number") {
                if (schema.type === "integer" && !Number.isInteger(data)) {
                    this.addError(currentPath, `attendu entier, reçu flottant ${data}`);
                }
            } else if (actualType !== expectedType) {
                this.addError(currentPath, `type invalide : attendu ${schema.type}, reçu ${actualType}`);
                return;
            }
        }

        // 3. Const & Enum
        if (schema.const !== undefined && data !== schema.const) {
            this.addError(currentPath, `valeur constante invalide : attendu ${schema.const}, reçu ${JSON.stringify(data)}`);
        }
        if (schema.enum && !schema.enum.includes(data)) {
            this.addError(currentPath, `valeur hors enum : reçu ${JSON.stringify(data)}, attendu parmi [${schema.enum.join(", ")}]`);
        }

        // 4. Object Validation
        if (typeof data === "object" && data !== null && !Array.isArray(data)) {
            const properties = schema.properties || {};
            const required = schema.required || [];

            required.forEach(field => {
                if (data[field] === undefined) {
                    this.addError(currentPath, `champ requis manquant : ${field}`);
                }
            });

            // Validate defined properties
            Object.keys(data).forEach(key => {
                if (properties[key]) {
                    this.validate(data[key], properties[key], `${currentPath}.${key}`, rootContext);
                } else if (schema.additionalProperties === false) {
                    this.addError(currentPath, `propriété non autorisée : ${key}`);
                }
            });
        }

        // 5. Array Validation
        if (Array.isArray(data)) {
            if (schema.minItems !== undefined && data.length < schema.minItems) {
                this.addError(currentPath, `trop peu d'éléments : min ${schema.minItems}`);
            }
            if (schema.items) {
                data.forEach((item, index) => {
                    this.validate(item, schema.items, `${currentPath}[${index}]`, rootContext);
                });
            }
        }

        // 6. Basic String/Number constraints
        if (typeof data === "string") {
            if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
                this.addError(currentPath, `format invalide (regex) : ${data}`);
            }
            if (schema.minLength !== undefined && data.length < schema.minLength) {
                this.addError(currentPath, `trop court : min ${schema.minLength}`);
            }
        }
    }

    resolveRef(ref, rootSchema) {
        if (ref.startsWith("#/")) {
            const parts = ref.split("/").slice(1);
            let current = rootSchema;
            for (const part of parts) {
                if (current[part] === undefined) {
                    throw new Error(`Référence non résolue : ${ref}`);
                }
                current = current[part];
            }
            return current;
        }
        return {}; // Non-local refs not supported in this sovereign validator
    }

    addError(path, message) {
        this.errors.push(`[${path}] ${message}`);
    }
}

// Execution logic
const schemasFiles = fs.readdirSync(protocolsDir).filter(f => f.endsWith(".json"));
const examplesFiles = fs.readdirSync(examplesDir).filter(f => f.endsWith(".json"));

let systemHealthy = true;

examplesFiles.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(examplesDir, file), "utf-8"));
    const schemaFile = file.replace(".example", ".schema");
    const schemaPath = path.join(protocolsDir, schemaFile);

    if (fs.existsSync(schemaPath)) {
        const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
        const validator = new ASpaceValidator();

        // Root context for $ref resolution
        schema.rootContext = schema;

        validator.validate(data, schema);

        if (validator.errors.length === 0) {
            console.log(`✅ ${file.padEnd(25)} | CONTRAT CONFORME`);
        } else {
            console.error(`🚨 ${file.padEnd(25)} | ÉCHECS :`);
            validator.errors.forEach(err => console.error(`   - ${err}`));
            systemHealthy = false;
        }
    } else {
        console.warn(`⚠️  Schéma manquant pour ${file}`);
    }
});

if (systemHealthy) {
    console.log("\n✨ Mycélium stable. La Loi est exécutée sans dépendances externes.");
} else {
    console.error("\n❌ Corruption détectée. Alignement requis.");
    process.exit(1);
}
