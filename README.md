# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
npx hardhat console --network localhost
```

API folder tree
.
├── src/
│   ├── config/             // Configuration files (database settings, environment variables)
│   ├── controllers/        // Request and response handling logic
│   ├── middlewares/        // Custom middleware functions (authentication, logging, error handling)
│   ├── models/             // Database schemas or ORM definitions
│   ├── routes/             // Application routes and endpoint definitions
│   ├── services/           // Business logic, data manipulation, third-party API integrations
│   ├── utils/              // Reusable utility functions (helpers, validators)
│   └── index.js            // Application entry point
├── tests/                  // Unit and integration tests
├── scripts/                // Development scripts (e.g., database seeding)
├── .env                    // Environment variables (not committed to version control)
├── .gitignore
├── package.json
└── README.md

using https://etherscan.io/verifiedsignatures# for testing signing nonce
 
