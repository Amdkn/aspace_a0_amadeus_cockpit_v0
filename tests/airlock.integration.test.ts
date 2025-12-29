#!/usr/bin/env tsx
/**
 * A'Space OS V2 - Air Lock Integration Test
 * 
 * Tests that ContractGuard operates safely when database is unavailable
 * and Air Lock mode is active. Validates defensive guards.
 */

import ContractGuard, { ContractInput } from '../src/lib/contract-guard';

// Test colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  logs?: string[];
}

class AirLockIntegrationTests {
  private results: TestResult[] = [];
  private capturedLogs: string[] = [];

  // Override console methods to capture logs
  private originalConsoleLog = console.log;
  private originalConsoleWarn = console.warn;
  private originalConsoleError = console.error;

  constructor() {
    this.setupLogCapture();
  }

  /**
   * Capture console output for assertions
   */
  private setupLogCapture(): void {
    console.log = (...args: any[]) => {
      const message = args.join(' ');
      this.capturedLogs.push(`[LOG] ${message}`);
      this.originalConsoleLog(...args);
    };

    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      this.capturedLogs.push(`[WARN] ${message}`);
      this.originalConsoleWarn(...args);
    };

    console.error = (...args: any[]) => {
      const message = args.join(' ');
      this.capturedLogs.push(`[ERROR] ${message}`);
      this.originalConsoleError(...args);
    };
  }

  /**
   * Restore original console methods
   */
  private restoreConsole(): void {
    console.log = this.originalConsoleLog;
    console.warn = this.originalConsoleWarn;
    console.error = this.originalConsoleError;
  }

  async runAllTests(): Promise<void> {
    console.log(`${colors.blue}🔒 A'Space OS - Air Lock Integration Test Suite${colors.reset}`);
    console.log('='.repeat(70));
    console.log();

    // Test 1: Verify Air Lock mode is active
    await this.testAirLockModeActive();

    // Test 2: writeContract returns failure without throwing
    await this.testWriteContractReturnsFailure();

    // Test 3: Verify projection writes are skipped
    await this.testProjectionWritesSkipped();

    // Test 4: Verify audit logs contain Air Lock warnings
    await this.testAuditLogsContainWarnings();

    // Print summary
    this.printSummary();
    
    // Restore console
    this.restoreConsole();
  }

  /**
   * Test 1: Verify Air Lock mode is active
   */
  async testAirLockModeActive(): Promise<void> {
    console.log(`${colors.blue}Test 1: Air Lock mode is active${colors.reset}`);
    
    const testName = 'ASPACE_AIR_LOCK_MODE environment variable is set to true';
    
    try {
      const isAirLockMode = process.env.ASPACE_AIR_LOCK_MODE === 'true';
      const noDatabaseUrl = !process.env.DATABASE_URL || process.env.DATABASE_URL === '';
      
      // Air Lock mode is active when ASPACE_AIR_LOCK_MODE === 'true' OR !DATABASE_URL (matching ContractGuard logic)
      const passed = isAirLockMode || noDatabaseUrl;
      
      this.results.push({
        name: testName,
        passed
      });

      console.log(passed
        ? `  ${colors.green}✓${colors.reset} ${testName}`
        : `  ${colors.red}✗${colors.reset} ${testName}: Air Lock mode not active`);
    } catch (error) {
      this.results.push({
        name: testName,
        passed: false,
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`  ${colors.red}✗${colors.reset} ${testName}: ${error}`);
    }

    console.log();
  }

  /**
   * Test 2: writeContract returns failure without throwing
   */
  async testWriteContractReturnsFailure(): Promise<void> {
    console.log(`${colors.blue}Test 2: writeContract returns failure without throwing${colors.reset}`);
    
    const testName = 'writeContract returns {success: false} in Air Lock mode';
    
    try {
      const guard = new ContractGuard();
      
      // Minimal valid contract example
      const testContract: ContractInput = {
        contractId: 'TEST-AIRLOCK-001',
        contractType: 'Order',
        data: {
          id: 'TEST-AIRLOCK-001',
          schema_version: '1.0.0',
          created_at: new Date().toISOString(),
          created_by: 'A0',
          project_id: 'TEST-PROJECT',
          cycle: {
            type: '12WY',
            week: 1
          },
          rock: {
            title: 'Test Rock',
            definition_of_done: ['Complete Air Lock test']
          },
          tactics: [],
          constraints: {},
          escalation_rules: {}
        }
      };

      // Call writeContract - should not throw, should return failure
      const result = await guard.writeContract(testContract);
      
      const passed = result.success === false && !!result.error;
      
      this.results.push({
        name: testName,
        passed,
        logs: this.capturedLogs.slice()
      });

      console.log(passed
        ? `  ${colors.green}✓${colors.reset} ${testName}`
        : `  ${colors.red}✗${colors.reset} ${testName}: Expected {success: false}, got ${JSON.stringify(result)}`);
    } catch (error) {
      // Test FAILS if writeContract throws instead of returning failure
      this.results.push({
        name: testName,
        passed: false,
        error: `writeContract threw an error instead of returning failure: ${error instanceof Error ? error.message : String(error)}`
      });
      console.log(`  ${colors.red}✗${colors.reset} ${testName}: Threw error instead of returning failure`);
    }

    console.log();
  }

  /**
   * Test 3: Verify projection writes are skipped
   */
  async testProjectionWritesSkipped(): Promise<void> {
    console.log(`${colors.blue}Test 3: Projection writes are skipped in Air Lock mode${colors.reset}`);
    
    const testName = 'No projection write attempts in captured logs';
    
    try {
      // Check captured logs for projection write messages
      const hasProjectionWriteAttempt = this.capturedLogs.some(log => 
        log.includes('Projection written:') && !log.includes('Skipping')
      );
      
      const hasSkipMessage = this.capturedLogs.some(log =>
        log.includes('Skipping projection write') || log.includes('Air Lock Mode')
      );
      
      const passed = !hasProjectionWriteAttempt && hasSkipMessage;
      
      this.results.push({
        name: testName,
        passed
      });

      console.log(passed
        ? `  ${colors.green}✓${colors.reset} ${testName}`
        : `  ${colors.red}✗${colors.reset} ${testName}: Found projection write attempt or missing skip message`);
    } catch (error) {
      this.results.push({
        name: testName,
        passed: false,
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`  ${colors.red}✗${colors.reset} ${testName}: ${error}`);
    }

    console.log();
  }

  /**
   * Test 4: Verify audit logs contain Air Lock warnings
   */
  async testAuditLogsContainWarnings(): Promise<void> {
    console.log(`${colors.blue}Test 4: Audit logs contain Air Lock warnings${colors.reset}`);
    
    const testName = 'Audit logs contain clear Air Lock warnings';
    
    try {
      const hasAirLockWarning = this.capturedLogs.some(log =>
        log.includes('[WARN]') && log.includes('Air Lock')
      );
      
      const hasDatabaseMessage = this.capturedLogs.some(log =>
        log.includes('Database unavailable') || 
        log.includes('Database writes disabled') ||
        log.includes('Cannot write to database')
      );
      
      const passed = hasAirLockWarning && hasDatabaseMessage;
      
      this.results.push({
        name: testName,
        passed
      });

      console.log(passed
        ? `  ${colors.green}✓${colors.reset} ${testName}`
        : `  ${colors.red}✗${colors.reset} ${testName}: Missing Air Lock warnings in logs`);
      
      // Print captured logs for evidence
      if (passed) {
        console.log(`\n  ${colors.yellow}Captured Air Lock warnings:${colors.reset}`);
        this.capturedLogs
          .filter(log => log.includes('Air Lock') || log.includes('Database'))
          .forEach(log => console.log(`    ${log}`));
      }
    } catch (error) {
      this.results.push({
        name: testName,
        passed: false,
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`  ${colors.red}✗${colors.reset} ${testName}: ${error}`);
    }

    console.log();
  }

  /**
   * Print test summary
   */
  printSummary(): void {
    console.log('='.repeat(70));
    console.log(`${colors.blue}📊 AIR LOCK TEST SUMMARY${colors.reset}`);
    console.log('='.repeat(70));

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    console.log(`Total tests:     ${total}`);
    console.log(`${colors.green}✓ Passed:       ${passed}${colors.reset}`);
    console.log(`${colors.red}✗ Failed:       ${failed}${colors.reset}`);
    console.log('='.repeat(70));

    if (failed > 0) {
      console.log(`\n${colors.red}Failed tests:${colors.reset}`);
      this.results.filter(r => !r.passed).forEach(r => {
        console.log(`  - ${r.name}`);
        if (r.error) {
          console.log(`    ${r.error.split('\n')[0]}`);
        }
      });
    }

    // Output logs as JSON for CI capture
    console.log('\n' + '='.repeat(70));
    console.log('📋 EVIDENCE OUTPUT (JSON)');
    console.log('='.repeat(70));
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      test_suite: 'Air Lock Integration',
      environment: {
        ASPACE_AIR_LOCK_MODE: process.env.ASPACE_AIR_LOCK_MODE,
        DATABASE_URL_SET: !!process.env.DATABASE_URL
      },
      results: this.results.map(r => ({
        name: r.name,
        passed: r.passed,
        error: r.error
      })),
      captured_logs: this.capturedLogs,
      summary: {
        total,
        passed,
        failed
      }
    }, null, 2));

    if (failed === 0) {
      console.log(`\n${colors.green}✨ All Air Lock integration tests passed!${colors.reset}`);
      process.exit(0);
    } else {
      console.log(`\n${colors.red}❌ Some Air Lock integration tests failed${colors.reset}`);
      process.exit(1);
    }
  }
}

// Run tests with Air Lock mode enforced
const tests = new AirLockIntegrationTests();
tests.runAllTests().catch((error) => {
  console.error(`\n${colors.red}🚨 FATAL ERROR:${colors.reset}`, error);
  process.exit(1);
});
