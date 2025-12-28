# A'Space Cockpit - Roadmap

## Current Version: v0.1.0 (Phoenix Baseline)

**Status**: ✅ Production-ready for Coolify/VPS deployment  
**Release Date**: 2025-12-28

### What's Included (v0.1.0)

- ✅ Contract-first architecture with ContractGuard
- ✅ PostgreSQL database with JSONB support
- ✅ Zero-dependency JSON Schema validator
- ✅ Immutable contract ledger with SHA-256 integrity hashes
- ✅ 5 contract types: Order, Pulse, Decision, Intent, Uplink
- ✅ Validation suite (5 valid + 11 invalid test cases)
- ✅ Air Lock mode for graceful degradation
- ✅ Production-ready Dockerfile for Coolify
- ✅ Comprehensive deployment documentation

---

## V2: Phoenix Sovereign (Option A)

**Focus**: Persistent sovereignty + controlled ingestion  
**Target**: Q1 2025

### Core Enhancements

- [ ] **REST API Server**
  - POST endpoints for each contract type
  - GET endpoints for contract queries
  - Authentication middleware
  - Rate limiting
  - OpenAPI/Swagger documentation

- [ ] **Advanced Querying**
  - GraphQL API (optional)
  - JSONB field queries (PostgreSQL)
  - Full-text search on contracts
  - Audit trail queries

- [ ] **Backup & Audit**
  - Automated contract backup to Google Drive
  - Integrity verification scripts
  - Audit log exports (CSV/JSON)
  - Point-in-time recovery

- [ ] **Integration Layer**
  - n8n webhook integration
  - Google Chat bot ingestion
  - Slack bot ingestion (optional)
  - Email-to-contract parser

### Infrastructure

- [ ] **Monitoring**
  - Health check endpoints
  - Prometheus metrics
  - Grafana dashboards
  - Alert system (PagerDuty/Slack)

- [ ] **CI/CD**
  - Automated tests on PR
  - Automated deployment to staging
  - Blue-green deployment strategy
  - Rollback procedures

---

## Future Surfaces (Beyond V2)

These are **separate repos/packages**, not part of the Cockpit Core:

### V3: Dashboard (Visualization Layer)

**Repo**: `aspace-dashboard` (separate)

- React/Next.js frontend
- Real-time contract status
- KPI visualization (Pulse data)
- Decision approval workflow
- Intent tracking board

### V4: Intelligence Layer (AI/ML)

**Repo**: `aspace-intelligence` (separate)

- Contract recommendation engine
- Anomaly detection
- Trend analysis
- Natural language to contract parser
- Contract auto-completion

### V5: Multi-Tenant (Enterprise)

**Repo**: `aspace-enterprise` (separate)

- Multi-organization support
- RBAC (Role-Based Access Control)
- SSO integration
- Custom contract schemas per tenant
- Billing/metering

---

## Versioning Strategy

### Cockpit Core (This Repo)

- **v0.x.x**: Pre-production iterations
- **v1.x.x**: Stable API, backward compatible
- **v2.x.x**: REST API + integrations
- **v3.x.x**: Future (TBD)

### Semantic Versioning

- **Major (X.0.0)**: Breaking changes (schema, API)
- **Minor (0.X.0)**: New features, backward compatible
- **Patch (0.0.X)**: Bug fixes, performance improvements

---

## Development Principles

### Architectural Constraints

1. **Contract-First Always**: Database = projection/cache
2. **Zero External Dependencies for Validation**: Sovereignty over external libs
3. **Immutable Ledger**: Never delete, always append
4. **Air Lock Mode**: Graceful degradation when DB unavailable
5. **PostgreSQL Native**: Leverage JSONB, full-text search, etc.

### Code Quality

- **Test Coverage**: Minimum 80% for core logic
- **Security**: CodeQL scans on every commit
- **Documentation**: Every public API documented
- **Performance**: Sub-100ms validation, sub-500ms writes

---

## Release Process

### Pre-Release Checklist

- [ ] All tests passing (validation + integration)
- [ ] CodeQL security scan clean
- [ ] Documentation updated (README, DEPLOYMENT, CHANGELOG)
- [ ] Migration scripts tested (SQLite → PostgreSQL)
- [ ] Rollback procedure documented

### Release Steps

1. Update `CHANGELOG.md`
2. Tag release: `git tag v0.x.x`
3. Build Docker image: `docker build -t aspace-cockpit:v0.x.x .`
4. Push to registry
5. Deploy to staging
6. Verify staging
7. Deploy to production
8. Monitor for 24h

---

## Contributing

### How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes and add tests
4. Run validation: `npm run validate && npm run build && npm run test`
5. Commit: `git commit -m "feat: your feature"`
6. Push and open a Pull Request

### Commit Message Format

```
feat: add new contract type
fix: validation error handling
docs: update deployment guide
refactor: extract validator module
test: add contract-guard tests
chore: update dependencies
```

---

## Support

- **Issues**: https://github.com/Amdkn/aspace_a0_amadeus_cockpit_v0/issues
- **Discussions**: https://github.com/Amdkn/aspace_a0_amadeus_cockpit_v0/discussions
- **Email**: (Add your support email)

---

## License

ISC License - See LICENSE file for details

---

## Acknowledgments

- **Rick's Constitution**: Foundation of contract-first architecture
- **Prisma Team**: Excellent ORM with PostgreSQL support
- **Coolify**: Simplified deployment platform

---

**Last Updated**: 2025-12-28  
**Maintainer**: Amadeus (A'0)
