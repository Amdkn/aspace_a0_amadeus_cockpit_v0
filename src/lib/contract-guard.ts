/**
 * ContractGuard - The Security Guardian for A'Space OS V2
 * 
 * Mission: Enforce contract-first architecture
 * Rule: Database is a cache for the Dashboard - invalid JSON must be blocked
 * 
 * This middleware ensures:
 * 1. All contracts are validated via validate_contracts.js before DB writes
 * 2. Contract ledger is updated with ACCEPTED/REJECTED status
 * 3. Only ACCEPTED contracts write to projection tables
 * 4. Validation errors are logged explicitly
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const prisma = new PrismaClient();

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ContractInput {
  contractId: string;
  contractType: 'Order' | 'Pulse' | 'Decision' | 'Intent' | 'Uplink';
  data: Record<string, any>;
}

export class ContractGuard {
  private protocolsDir: string;
  private validatorScript: string;

  constructor() {
    this.protocolsDir = path.join(process.cwd(), 'protocols');
    this.validatorScript = path.join(process.cwd(), 'validate_contracts.js');
  }

  /**
   * Validate a contract against its JSON schema
   * Uses the zero-dependency validator from validate_contracts.js
   */
  async validateContract(contract: ContractInput): Promise<ValidationResult> {
    const { contractType, data } = contract;

    // Map contract type to schema file
    const schemaMap: Record<string, string> = {
      'Order': 'order.schema.json',
      'Pulse': 'pulse.schema.json',
      'Decision': 'decision.schema.json',
      'Intent': 'intent.schema.json',
      'Uplink': 'uplink.schema.json'
    };

    const schemaFile = schemaMap[contractType];
    if (!schemaFile) {
      return {
        valid: false,
        errors: [`Unknown contract type: ${contractType}`]
      };
    }

    const schemaPath = path.join(this.protocolsDir, schemaFile);
    if (!fs.existsSync(schemaPath)) {
      return {
        valid: false,
        errors: [`Schema file not found: ${schemaPath}`]
      };
    }

    // Write contract to temporary file for validation
    const tmpDir = os.tmpdir();
    const tmpFile = path.join(tmpDir, `contract-${Date.now()}-${Math.random().toString(36).substring(7)}.json`);
    
    try {
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2));

      // Load and execute validation using the ASpaceValidator from validate_contracts.js
      const validationResult = this.runValidation(data, schemaPath);
      
      // Clean up temp file
      fs.unlinkSync(tmpFile);

      return validationResult;
    } catch (error) {
      // Clean up temp file on error
      if (fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }

      return {
        valid: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : String(error)}`]
      };
    }
  }

  /**
   * Run validation using the ASpaceValidator logic
   * This replicates the validation from validate_contracts.js
   */
  private runValidation(data: any, schemaPath: string): ValidationResult {
    try {
      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
      const errors: string[] = [];

      // Import the validation logic (simplified version)
      this.validate(data, schema, 'Root', schema, errors);

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      return {
        valid: false,
        errors: [`Schema validation failed: ${error instanceof Error ? error.message : String(error)}`]
      };
    }
  }

  /**
   * Validation logic (simplified from validate_contracts.js)
   */
  private validate(
    data: any,
    schema: any,
    currentPath: string,
    rootContext: any,
    errors: string[]
  ): void {
    if (!schema) return;

    // Dereference $ref if present
    if (schema.$ref) {
      try {
        const resolved = this.resolveRef(schema.$ref, rootContext);
        schema = { ...resolved, ...schema };
        delete schema.$ref;
      } catch (e) {
        errors.push(`[${currentPath}] Reference error: ${e instanceof Error ? e.message : String(e)}`);
        return;
      }
    }

    if (!schema || typeof schema !== 'object') return;

    // Type checking
    if (schema.type) {
      const actualType = Array.isArray(data) ? 'array' : (data === null ? 'null' : typeof data);
      let expectedType = schema.type;

      if (expectedType === 'integer') expectedType = 'number';

      if (expectedType === 'number' && typeof data === 'number') {
        if (schema.type === 'integer' && !Number.isInteger(data)) {
          errors.push(`[${currentPath}] Expected integer, received float ${data}`);
        }
      } else if (actualType !== expectedType) {
        errors.push(`[${currentPath}] Invalid type: expected ${schema.type}, received ${actualType}`);
        return;
      }
    }

    // Const & Enum
    if (schema.const !== undefined && data !== schema.const) {
      errors.push(`[${currentPath}] Invalid const value: expected ${schema.const}, received ${JSON.stringify(data)}`);
    }
    if (schema.enum && !schema.enum.includes(data)) {
      errors.push(`[${currentPath}] Value not in enum: received ${JSON.stringify(data)}, expected one of [${schema.enum.join(', ')}]`);
    }

    // Object validation
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const properties = schema.properties || {};
      const required = schema.required || [];

      required.forEach((field: string) => {
        if (data[field] === undefined) {
          errors.push(`[${currentPath}] Missing required field: ${field}`);
        }
      });

      Object.keys(data).forEach((key) => {
        if (properties[key]) {
          this.validate(data[key], properties[key], `${currentPath}.${key}`, rootContext, errors);
        } else if (schema.additionalProperties === false) {
          errors.push(`[${currentPath}] Property not allowed: ${key}`);
        }
      });
    }

    // Array validation
    if (Array.isArray(data)) {
      if (schema.minItems !== undefined && data.length < schema.minItems) {
        errors.push(`[${currentPath}] Too few elements: min ${schema.minItems}`);
      }
      if (schema.maxItems !== undefined && data.length > schema.maxItems) {
        errors.push(`[${currentPath}] Too many elements: max ${schema.maxItems}`);
      }
      if (schema.items) {
        data.forEach((item, index) => {
          this.validate(item, schema.items, `${currentPath}[${index}]`, rootContext, errors);
        });
      }
    }

    // String constraints
    if (typeof data === 'string') {
      if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
        errors.push(`[${currentPath}] Invalid format (regex): ${data}`);
      }
      if (schema.minLength !== undefined && data.length < schema.minLength) {
        errors.push(`[${currentPath}] Too short: min ${schema.minLength}`);
      }
      if (schema.maxLength !== undefined && data.length > schema.maxLength) {
        errors.push(`[${currentPath}] Too long: max ${schema.maxLength}`);
      }
    }

    // Number constraints
    if (typeof data === 'number') {
      if (schema.minimum !== undefined && data < schema.minimum) {
        errors.push(`[${currentPath}] Value too low: ${data} < minimum ${schema.minimum}`);
      }
      if (schema.maximum !== undefined && data > schema.maximum) {
        errors.push(`[${currentPath}] Value too high: ${data} > maximum ${schema.maximum}`);
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
    throw new Error(`External $ref not supported: ${ref}`);
  }

  /**
   * Write a contract to the database (with validation)
   * This is the ONLY way to write to the database
   */
  async writeContract(contract: ContractInput): Promise<{ success: boolean; error?: string; contractLedgerId?: string }> {
    const { contractId, contractType, data } = contract;

    console.log(`🔒 [ContractGuard] Validating ${contractType} contract: ${contractId}`);

    // Step 1: Validate contract
    const validation = await this.validateContract(contract);

    const rawJson = JSON.stringify(data);
    const status = validation.valid ? 'ACCEPTED' : 'REJECTED';
    const validationLog = validation.valid ? null : validation.errors.join('\n');

    // Step 2: Write to Contract ledger (always)
    try {
      const contractLedger = await prisma.contract.create({
        data: {
          contractId,
          contractType,
          rawJson,
          status,
          validationLog
        }
      });

      if (!validation.valid) {
        console.error(`❌ [ContractGuard] REJECTED: ${contractId}`);
        console.error(`   Validation errors:\n${validation.errors.map(e => `   - ${e}`).join('\n')}`);
        
        return {
          success: false,
          error: `Contract validation failed:\n${validation.errors.join('\n')}`,
          contractLedgerId: contractLedger.id
        };
      }

      console.log(`✅ [ContractGuard] ACCEPTED: ${contractId}`);

      // Step 3: Write to projection table (only for ACCEPTED contracts)
      await this.writeProjection(contractType, data);

      return {
        success: true,
        contractLedgerId: contractLedger.id
      };
    } catch (error) {
      console.error(`🚨 [ContractGuard] Database error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: `Database error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Write to projection tables (Order, Pulse, Decision, Intent, Uplink)
   */
  private async writeProjection(contractType: string, data: any): Promise<void> {
    switch (contractType) {
      case 'Order':
        await prisma.order.create({
          data: {
            orderId: data.id,
            schemaVersion: data.schema_version,
            createdAt: new Date(data.created_at),
            createdBy: data.created_by,
            projectId: data.project_id,
            cycleType: data.cycle.type,
            cycleWeek: data.cycle.week,
            rockTitle: data.rock.title,
            rockDoD: JSON.stringify(data.rock.definition_of_done),
            tactics: JSON.stringify(data.tactics),
            constraints: JSON.stringify(data.constraints),
            escalationRules: JSON.stringify(data.escalation_rules),
            linkedDecisionId: data.linked_decision_id || null,
            notes: data.notes || null
          }
        });
        break;

      case 'Pulse':
        await prisma.pulse.create({
          data: {
            pulseId: data.id,
            schemaVersion: data.schema_version,
            createdAt: new Date(data.created_at),
            createdBy: data.created_by,
            projectId: data.project_id,
            week: data.week,
            signalLevel: data.signal_level,
            kpiTmiCurrent: data.kpi.tmi_current,
            kpiTmiTarget: data.kpi.tmi_target,
            kpiTvrScore: data.kpi.tvr_score,
            kpi12wyCompletionPct: data.kpi?.['12wy_completion_pct'] || 0,
            domains: JSON.stringify(data.domains),
            type4DecisionsNeeded: JSON.stringify(data.type4_decisions_needed),
            notes: data.notes || null
          }
        });
        break;

      case 'Decision':
        await prisma.decision.create({
          data: {
            decisionId: data.id,
            schemaVersion: data.schema_version,
            createdAt: new Date(data.created_at),
            createdBy: data.created_by,
            linkedIntentId: data.linked_intent_id,
            projectId: data.project_id || null,
            signalLevel: data.signal_level,
            gate: data.gate || null,
            type4Question: data.type4_question,
            options: JSON.stringify(data.options),
            recommendation: data.recommendation,
            rationale: JSON.stringify(data.rationale_10_lines_max),
            deadline: new Date(data.deadline),
            a0Decision: data.a0_decision ? JSON.stringify(data.a0_decision) : null
          }
        });
        break;

      case 'Intent':
        await prisma.intent.create({
          data: {
            intentId: data.id,
            schemaVersion: data.schema_version,
            createdAt: new Date(data.created_at),
            createdBy: data.created_by,
            projectId: data.project_id || null,
            title: data.title,
            intentText: data.intent_text,
            domainsTouched: JSON.stringify(data.domains_touched),
            expectedEnergyCost: data.expected_energy_cost,
            timeHorizon: data.time_horizon,
            riskLevel: data.risk_level,
            constraints: JSON.stringify(data.constraints),
            successCriteria: JSON.stringify(data.success_criteria),
            needsType4Decision: data.needs_type4_decision,
            attachments: data.attachments ? JSON.stringify(data.attachments) : null,
            notes: data.notes || null
          }
        });
        break;

      case 'Uplink':
        await prisma.uplink.create({
          data: {
            uplinkId: data.id,
            schemaVersion: data.schema_version,
            createdAt: new Date(data.created_at),
            createdBy: data.created_by,
            week: data.week || null,
            projectId: data.project_id || null,
            lines: JSON.stringify(data.lines),
            linkedPulseIds: JSON.stringify(data.linked_pulse_ids),
            type4Required: data.type4_required
          }
        });
        break;

      default:
        throw new Error(`Unknown projection type: ${contractType}`);
    }

    console.log(`   📊 [ContractGuard] Projection written: ${contractType}`);
  }

  /**
   * Get contract status from ledger
   */
  async getContractStatus(contractId: string): Promise<{ status: string; validationLog?: string } | null> {
    const contract = await prisma.contract.findUnique({
      where: { contractId },
      select: { status: true, validationLog: true }
    });

    if (!contract) return null;

    return {
      status: contract.status,
      validationLog: contract.validationLog || undefined
    };
  }

  /**
   * List all contracts with optional filtering
   */
  async listContracts(filters?: {
    contractType?: string;
    status?: string;
    limit?: number;
  }): Promise<any[]> {
    const where: any = {};
    
    if (filters?.contractType) where.contractType = filters.contractType;
    if (filters?.status) where.status = filters.status;

    return await prisma.contract.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100
    });
  }
}

export default ContractGuard;
