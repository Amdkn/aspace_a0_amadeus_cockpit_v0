# Supported JSON Schema Features

A'Space OS uses a **native, zero-dependency validator** to enforce contract law. This validator supports a carefully chosen subset of JSON Schema Draft 2020-12.

## ✅ Fully Supported

### Type Validation
- `type`: `string`, `number`, `integer`, `boolean`, `object`, `array`, `null`
- Type coercion: `integer` validated as `number` + `Number.isInteger()`

### Value Constraints
- `const`: Exact value matching
- `enum`: Value must be in allowed list
- `required`: Required object properties
- `additionalProperties: false`: Strict property enforcement (critical for agent safety)

### String Constraints
- `pattern`: Regex validation
- `minLength`: Minimum string length
- `maxLength`: Maximum string length

### Number Constraints
- `minimum`: Minimum value (inclusive)
- `maximum`: Maximum value (inclusive)

### Array Constraints
- `minItems`: Minimum array length
- `maxItems`: Maximum array length
- `items`: Schema for all array elements

### Object Constraints
- `properties`: Property schemas
- `required`: Required properties
- `additionalProperties`: Control extra properties

### References
- `$ref`: Internal references only (`#/$defs/...`)

## ❌ Not Supported (By Design)

- `format` (e.g., `date-time`, `email`, `uri`)
- `oneOf`, `anyOf`, `allOf`, `not`
- `patternProperties`
- `dependencies`, `dependentSchemas`
- External `$ref` (cross-file references)
- `if/then/else`
- `exclusiveMinimum`, `exclusiveMaximum`
- `multipleOf`

## 🎯 Design Philosophy

**Why this subset?**
1. **Sovereignty**: Zero external dependencies
2. **Clarity**: Simple, auditable validation logic
3. **Sufficiency**: Covers 95% of agent-to-agent contract needs
4. **Extensibility**: Can be enhanced incrementally

## 📋 Schema Design Guidelines

When creating new protocols:
1. Use only supported features
2. Prefer `enum` over complex patterns when possible
3. Always set `additionalProperties: false` on objects
4. Document any custom validation in comments
5. Test with both valid and invalid examples

---
"The Law is executable, not aspirational."
