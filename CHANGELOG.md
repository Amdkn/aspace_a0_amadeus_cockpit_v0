# Changelog - A'Space OS

## [v0.1.0] - 2025-12-28 (Phoenix Baseline - PostgreSQL)

### Added
- **PostgreSQL Migration**: Migrated from SQLite to PostgreSQL for production readiness
- **JSONB Support**: Converted string JSON fields to proper JSONB type for better querying
- **Shared Validator Module**: Extracted `aspace-validator.ts` to eliminate code duplication
- **Production Dockerfile**: Created Docker container for Coolify/VPS deployment
- **Deployment Documentation**: Comprehensive `DEPLOYMENT.md` with setup instructions
- **Environment Configuration**: Added `.env.example` for easy configuration
- **Roadmap**: Created `ROADMAP.md` with version strategy and future plans
- **Deployment Notes**: Added `Deployment/DEPLOYMENT_NOTES.md` clarifying legacy Dockerfile

### Changed
- Updated `package.json` scripts for PostgreSQL compatibility
- Removed SQLite-specific commands from `db:reset`
- Added `prisma:deploy` for production migrations
- Updated README with deployment links and version info

### Technical Details
- ContractGuard now uses shared validator from `aspace-validator.ts`
- Prisma schema uses `Json` type instead of `String` for JSON fields
- Database URL now expects PostgreSQL format
- Integrity hash calculation uses stringified JSON (compatible with JSONB)

### Validation
- ✅ All contract validation tests passing (5 valid + 11 invalid)
- ✅ TypeScript builds without errors
- ✅ Zero-dependency validator maintained

---

## [V2.0.0] - 2025-12-25
### Added
- **Phoenix Architect V2**: Transition to autonomous management.
- **Financial Guard (Jerry)**: Real-time API cost monitoring and budget enforcement ($5/day cap).
- **Thinking Organ**: EPCT workflow integration with DeepSeek R1 audit.
- **Communication Organ**: Google Chat decision cards via n8n relay with local backlog resilience.
- **Native Contract Validator**: Recursive, zero-dependency JSON Schema validator for protocols.
- **Sovereignty Hardening**: Prioritization of Ollama 2025 local vortex models.
- **SECURITY.md**: Formalized secret management guidelines.
- **CONTRIBUTING.md**: Guidelines for contract-first development.

### Fixed
- Fixed regex mismatch in contract examples (`pulse`, `uplink`).
- Added timeouts to shell executions to prevent orchestrator hangs.

---
"L'Âge des Architectes commence ici."
