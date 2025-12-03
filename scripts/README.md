# PostForge Database Scripts

This directory contains utility scripts for database management, testing, and validation.

## Available Scripts

### 1. Step 3 Validation (⭐ Main Validation)
```bash
npx tsx scripts/step3-validation.ts
```

**Purpose**: Comprehensive validation of database schema and core models

**Checks**:
- ✅ Database connection
- ✅ All models accessible (User, Post, CreditTransaction)
- ✅ All relationships working (OneToMany, ManyToOne)
- ✅ Indexes optimized (14 total)
- ✅ Foreign key constraints (2 total)
- ✅ Seed data present

**Output**: Pass/Fail report with detailed messages

---

### 2. Check Database State
```bash
npx tsx scripts/check-db.ts
```

**Purpose**: Quick overview of current database state

**Shows**:
- User count and details
- Post count
- Credit transaction count
- Relationship counts (_count)

**Use Case**: Quick health check before/after operations

---

### 3. Test Relationships
```bash
npx tsx scripts/test-relationships.ts
```

**Purpose**: Detailed relationship testing and verification

**Tests**:
1. User -> Posts (OneToMany)
2. User -> CreditTransactions (OneToMany)
3. Post -> User (ManyToOne)
4. CreditTransaction -> User (ManyToOne)
5. Cascade delete configuration
6. Index verification

**Output**: Detailed test results with data samples

---

## Quick Commands

### Database Management
```bash
# Validate schema
npx prisma validate

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run db:migrate

# Check migration status
npx prisma migrate status

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### Testing
```bash
# Full validation (recommended)
npx tsx scripts/step3-validation.ts

# Quick check
npx tsx scripts/check-db.ts

# Detailed relationships
npx tsx scripts/test-relationships.ts

# TypeScript check
npx tsc --noEmit
```

---

## Script Dependencies

All scripts require:
- `tsx` (TypeScript execution): Installed as dev dependency
- `@prisma/client`: Generated from schema
- `DATABASE_URL`: Set in .env file

---

## Troubleshooting

### Script won't run
```bash
# Install tsx if missing
npm install -D tsx

# Regenerate Prisma Client
npm run prisma:generate
```

### Connection errors
```bash
# Check .env file has DATABASE_URL
# Verify Supabase connection
npx prisma studio
```

### Type errors
```bash
# Regenerate Prisma Client
npm run prisma:generate

# Check TypeScript
npx tsc --noEmit
```

---

## Development Workflow

1. **After schema changes**:
```bash
npm run db:migrate
npm run prisma:generate
npx tsx scripts/step3-validation.ts
```

2. **Before committing**:
```bash
npx tsx scripts/step3-validation.ts
npx tsc --noEmit
```

3. **For new team members**:
```bash
npm install
npm run db:migrate
npm run db:seed
npx tsx scripts/check-db.ts
```

---

## Production Notes

⚠️ **WARNING**: These scripts are for development only.

For production:
- Use environment-specific DATABASE_URL
- Never run seed scripts in production
- Use connection pooling
- Enable query logging
- Set up monitoring

---

**Last Updated**: 2025-12-03
**Maintained by**: PostForge Development Team
