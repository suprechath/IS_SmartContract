import pool from '../config/db.js';
// All your CREATE TYPE and CREATE TABLE queries go here
// Using a single multi-statement query is efficient
const setupQueries = `
  DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'user_role'
      ) THEN
        CREATE TYPE user_role AS ENUM ('Investor', 'Project Creator', 'Platform Operator');
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'kyc_status'
      ) THEN
        CREATE TYPE kyc_status AS ENUM ('Pending', 'Verified', 'Rejected');
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'project_status'
      ) THEN
        CREATE TYPE project_status AS ENUM ('Pending', 'Approved', 'Rejected', 'Funding', 'Succeeded', 'Failed', 'Active');
      END IF;
  END$$;

  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    nonce VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    kyc_status kyc_status NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    funding_goal NUMERIC(78, 0) NOT NULL,
    funding_duration BIGINT NOT NULL,
    projected_roi DECIMAL,
    projected_payback_period_months DECIMAL,
    project_plan_url TEXT,
    status project_status NOT NULL DEFAULT 'Pending',
    management_contract_address VARCHAR(42),
    token_contract_address VARCHAR(42),
    platform_fee_percentage NUMERIC(5, 0),
    reward_fee_percentage NUMERIC(5, 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id UUID NOT NULL REFERENCES users(id),
    project_id UUID NOT NULL REFERENCES projects(id),
    amount NUMERIC(78, 0) NOT NULL,
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS reward_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id UUID NOT NULL REFERENCES users(id),
    project_id UUID NOT NULL REFERENCES projects(id),
    amount NUMERIC(78, 0) NOT NULL,
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

// An async function to run the setup queries
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    console.log("Successfully connected to PostgreSQL.");
    
    await client.query(setupQueries);
    console.log("Database tables checked/created successfully.");
    
    client.release();
  } catch (err) {
    console.error("Error initializing database:", err.stack);
    // Exit the process if the database can't be initialized
    process.exit(1);
  }
};

export default initializeDatabase;