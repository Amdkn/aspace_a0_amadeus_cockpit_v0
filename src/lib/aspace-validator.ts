/**
 * A'Space Validator - Zero Dependency JSON Schema Validator
 * 
 * Shared validation logic used by:
 * - validate_contracts.js (CLI validation)
 * - contract-guard.ts (runtime validation)
 * 
 * Mission: Enforce Law, Not Poetry
 * This validator implements a subset of JSON Schema Draft 7
 * sufficient for A'Space contract validation without external dependencies.
 */

import * as fs from 'fs';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class ASpaceValidator {
  private errors: string[] = [];

  /**
   * Validate data against a JSON schema
   */
  validate(
    data: any,
    schema: any,
    currentPath: string = 'Root',
    rootContext: any = null
  ): ValidationResult {
    this.errors = [];
    
    // Capture root context on first call
    if (!rootContext) rootContext = schema;

    this.validateNode(data, schema, currentPath, rootContext);

    return {
      valid: this.errors.length === 0,
      errors: [...this.errors]
    };
  }

  /**
   * Validate a single node in the data tree
   */
  private validateNode(
    data: any,
    schema: any,
    currentPath: string,
    rootContext: any
  ): void {
    if (!schema) return;

    // 1. Dereference $ref if present
    if (schema.$ref) {
      try {
        const resolved = this.resolveRef(schema.$ref, rootContext);
        // Merge schema attributes with resolved schema (pattern, title, etc)
        schema = { ...resolved, ...schema };
        delete schema.$ref;
      } catch (e) {
        this.addError(currentPath, `Reference error: ${e instanceof Error ? e.message : String(e)}`);
        return;
      }
    }

    // Handle case where schema might be empty after ref resolution or null
    if (!schema || typeof schema !== 'object') return;

    // 2. Type Checking
    if (schema.type) {
      const actualType = Array.isArray(data) ? 'array' : (data === null ? 'null' : typeof data);
      let expectedType = schema.type;

      // Basic type alias for integer
      if (expectedType === 'integer') expectedType = 'number';

      if (expectedType === 'number' && typeof data === 'number') {
        if (schema.type === 'integer' && !Number.isInteger(data)) {
          this.addError(currentPath, `Expected integer, received float ${data}`);
        }
      } else if (actualType !== expectedType) {
        this.addError(currentPath, `Invalid type: expected ${schema.type}, received ${actualType}`);
        return;
      }
    }

    // 3. Const & Enum
    if (schema.const !== undefined && data !== schema.const) {
      this.addError(currentPath, `Invalid const value: expected ${schema.const}, received ${JSON.stringify(data)}`);
    }
    if (schema.enum && !schema.enum.includes(data)) {
      this.addError(currentPath, `Value not in enum: received ${JSON.stringify(data)}, expected one of [${schema.enum.join(', ')}]`);
    }

    // 4. Object Validation
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const properties = schema.properties || {};
      const required = schema.required || [];

      required.forEach((field: string) => {
        if (data[field] === undefined) {
          this.addError(currentPath, `Missing required field: ${field}`);
        }
      });

      // Validate defined properties
      Object.keys(data).forEach((key) => {
        if (properties[key]) {
          this.validateNode(data[key], properties[key], `${currentPath}.${key}`, rootContext);
        } else if (schema.additionalProperties === false) {
          this.addError(currentPath, `Property not allowed: ${key}`);
        }
      });
    }

    // 5. Array Validation
    if (Array.isArray(data)) {
      if (schema.minItems !== undefined && data.length < schema.minItems) {
        this.addError(currentPath, `Too few elements: min ${schema.minItems}`);
      }
      if (schema.maxItems !== undefined && data.length > schema.maxItems) {
        this.addError(currentPath, `Too many elements: max ${schema.maxItems}`);
      }
      if (schema.items) {
        data.forEach((item, index) => {
          this.validateNode(item, schema.items, `${currentPath}[${index}]`, rootContext);
        });
      }
    }

    // 6. String constraints
    if (typeof data === 'string') {
      if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
        this.addError(currentPath, `Invalid format (regex): ${data}`);
      }
      if (schema.minLength !== undefined && data.length < schema.minLength) {
        this.addError(currentPath, `Too short: min ${schema.minLength}`);
      }
      if (schema.maxLength !== undefined && data.length > schema.maxLength) {
        this.addError(currentPath, `Too long: max ${schema.maxLength}`);
      }
    }

    // 7. Number constraints
    if (typeof data === 'number') {
      if (schema.minimum !== undefined && data < schema.minimum) {
        this.addError(currentPath, `Value too low: ${data} < minimum ${schema.minimum}`);
      }
      if (schema.maximum !== undefined && data > schema.maximum) {
        this.addError(currentPath, `Value too high: ${data} > maximum ${schema.maximum}`);
      }
    }
  }

  /**
   * Resolve JSON Schema $ref
   */
  private resolveRef(ref: string, rootSchema: any): any {
    if (ref.startsWith('#/')) {
      const parts = ref.split('/').slice(1);
      let current = rootSchema;
      for (const part of parts) {
        if (current[part] === undefined) {
          throw new Error(`Unresolved reference: ${ref}`);
        }
        current = current[part];
      }
      return current;
    }
    // External refs are not supported - fail explicitly for sovereignty
    throw new Error(`External $ref not supported (sovereignty): ${ref}`);
  }

  /**
   * Add an error message
   */
  private addError(path: string, message: string): void {
    this.errors.push(`[${path}] ${message}`);
  }
}

/**
 * Convenience function to validate data against a schema file
 */
export function validateAgainstSchemaFile(
  data: any,
  schemaPath: string
): ValidationResult {
  try {
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
    const validator = new ASpaceValidator();
    return validator.validate(data, schema);
  } catch (error) {
    return {
      valid: false,
      errors: [`Failed to load or parse schema: ${error instanceof Error ? error.message : String(error)}`]
    };
  }
}

/**
 * Validate data against a schema object
 */
export function validateAgainstSchema(
  data: any,
  schema: any
): ValidationResult {
  const validator = new ASpaceValidator();
  return validator.validate(data, schema);
}

export default ASpaceValidator;
