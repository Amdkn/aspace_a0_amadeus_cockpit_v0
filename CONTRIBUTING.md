# Contributing to A'Space OS

Thank you for considering contributing to the A'Space OS! We are building a sovereign, agentic operating system where **the Law is Executable**.

## Architectural Principles
1.  **Sovereignty**: No hard dependencies on cloud-only services. Local-first is the default.
2.  **Contract-First**: Every action between agents must follow a JSON Schema defined in `/protocols`.
3.  **Zero Runtime Dependency**: The core validator and logic must run with vanilla Node.js or Python.

## How to Contribute
1.  **Propose a Protocol**: If you need a new interaction type, add a `.schema.json` in `/protocols`.
2.  **Add Examples**: Provide `.example.json` in `/contracts/examples`.
3.  **Validate**: Run `npm run validate` to ensure your changes align with the system's law.
4.  **EPCT Workflow**: Respect the **Explore, Plan, Code, Test** cycle.

## Code of Conduct
Respect the Architect. Respect the Agent. Respect the Sovereignty.

---
"Freedom is found in the rigor of the code."
