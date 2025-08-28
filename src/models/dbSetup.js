import pool from '../config/db.js';
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
        SELECT 1 FROM pg_type WHERE typname = 'sanction_status'
      ) THEN
        CREATE TYPE kyc_status AS ENUM ('Pending', 'Verified', 'Rejected');
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'project_status'
      ) THEN
        CREATE TYPE project_status AS ENUM ('Pending', 'Approved', 'Rejected', 'Funding', 'Succeeded', 'Failed', 'Active');
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'transaction_type'
      ) THEN
        CREATE TYPE transaction_type AS ENUM (
          'Investment',
          'Withdrawal',
          'RewardDeposit',
          'RewardClaim',
          'Refund'
        );
      END IF;
  END$$;

  CREATE TABLE IF NOT EXISTS users_offchain (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) UNIQUE NOT NULL,
    date_of_birth DATE NOT NULL,
    address TEXT,
    identification_number VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    kyc_status kyc_status NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS users_onchain (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_offchain_id UUID NOT NULL REFERENCES users_offchain(id),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    role user_role NOT NULL,
    sanction_status sanction_status NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS project_offchain (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(255) UNIQUE NOT NULL,
    project_overview TEXT,
    proposed_solution TEXT,
    location TEXT,

    cover_image_url TEXT,
    tags VARCHAR(50)[],

    CO2_reduction DECIMAL,
    projected_roi DECIMAL,
    projected_payback_period_months DECIMAL,

    project_plan_url TEXT,
    technical_specifications_urls TEXT[],
    third_party_verification_urls TEXT[],

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS project_onchain (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_onchain_id UUID NOT NULL REFERENCES users_onchain(id),
    project_offchain_id UUID NOT NULL REFERENCES project_offchain(id),

    funding_USDC_goal NUMERIC(78, 0) NOT NULL,
    funding_duration_second BIGINT NOT NULL,
    management_contract_address VARCHAR(42),
    token_contract_address VARCHAR(42),
    usdc_contract_address VARCHAR(42),
    platform_fee_percentage NUMERIC(5, 0) NOT NULL DEFAULT 500,
    reward_fee_percentage NUMERIC(5, 0) NOT NULL DEFAULT 300,
    project_status project_status NOT NULL DEFAULT 'Pending',

    total_contributions NUMERIC(78, 0) DEFAULT 0,
    token_total_supply NUMERIC(78, 0) DEFAULT 0,
    tokens_minted BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_onchain_id UUID NOT NULL REFERENCES users_onchain(id),
    project_onchain_id UUID NOT NULL REFERENCES project_onchain(id),
    USDC_amount NUMERIC(78, 0) NOT NULL,
    transaction_type transaction_type NOT NULL,
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    related_transaction_hash VARCHAR(66),
    platform_fee NUMERIC(78, 0) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_onchain_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_project_id ON transactions(project_onchain_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);

  DO $$
  DECLARE
    offchain_user_id UUID;
  BEGIN
    INSERT INTO users_offchain (full_name, date_of_birth, address, identification_number, email, kyc_status)
    VALUES (
      'HH0',
      '2000-01-01',
      'Admin',
      '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      'admin@buildingyield.com',
      'Verified'
    )
    ON CONFLICT (email) DO NOTHING;

    SELECT id INTO offchain_user_id FROM users_offchain WHERE email = 'admin@buildingyield.com';

    IF offchain_user_id IS NOT NULL THEN
      INSERT INTO users_onchain (user_offchain_id, wallet_address, role, nonce, sanction_status)
      VALUES (
        offchain_user_id,
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        'Platform Operator',
        'comm-efficient-login',
        'Verified'
      )
      ON CONFLICT (wallet_address) DO NOTHING;
    END IF;
  END $$;

`;

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