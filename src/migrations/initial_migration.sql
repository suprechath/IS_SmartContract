-- Create Enum Types
CREATE TYPE user_role AS ENUM ('Investor', 'Project Creator', 'Admin');
CREATE TYPE kyc_status AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE project_status AS ENUM ('Pending', 'Approved', 'Rejected', 'Funding', 'Succeeded', 'Failed', 'Active');

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(42) UNIQUE,
    role user_role NOT NULL,
    kyc_status kyc_status DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    creator_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    funding_goal NUMERIC(78, 0) NOT NULL, -- Corresponds to uint256
    funding_duration BIGINT NOT NULL, -- Corresponds to uint256 for seconds
    status project_status DEFAULT 'Pending',
    project_token_address VARCHAR(42),
    project_management_address VARCHAR(42),
    platform_fee_percentage INTEGER,
    reward_fee_percentage INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Investments Table
CREATE TABLE investments (
    id SERIAL PRIMARY KEY,
    investor_id INTEGER NOT NULL REFERENCES users(id),
    project_id INTEGER NOT NULL REFERENCES projects(id),
    amount NUMERIC(78, 0) NOT NULL, -- Corresponds to uint256
    transaction_hash VARCHAR(66) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_projects_creator_id ON projects(creator_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_investments_investor_id ON investments(investor_id);
CREATE INDEX idx_investments_project_id ON investments(project_id);
