const { execFile } = require('child_process');
const path = require('path');
const hre = require('hardhat'); // to get the path to the hardhat executable

const deploy = (project) => {
    return new Promise((resolve, reject) => {
        const hardhatExecutable = path.resolve(__dirname, '../../node_modules/.bin/hardhat');

        const scriptPath = path.resolve(__dirname, '../../scripts/deploy.js');

        const options = {
            env: {
                ...process.env,
                CREATOR_ADDRESS: project.creator_wallet_address, // This needs to be added to the project model/data
                FUNDING_GOAL: project.funding_goal.toString(),
                FUNDING_DURATION: project.funding_duration.toString(),
                PLATFORM_FEE: project.platform_fee_percentage.toString(),
                REWARD_FEE: project.reward_fee_percentage.toString(),
                PROJECT_NAME: project.title,
                PROJECT_SYMBOL: project.title.substring(0, 4).toUpperCase() // Simple symbol generation
            }
        };

        const args = ['run', scriptPath, '--network', 'localhost']; // For now, deploy to localhost hardhat network

        execFile(hardhatExecutable, args, options, (error, stdout, stderr) => {
            if (error) {
                console.error('Deployment script error:', stderr);
                return reject(new Error(`Failed to execute deployment script: ${stderr}`));
            }

            console.log('Deployment script output:', stdout);

            // Find the line with the deployed addresses
            const addressLine = stdout.split('\n').find(line => line.startsWith('DEPLOYED_ADDRESSES:'));
            if (!addressLine) {
                return reject(new Error('Could not find deployed addresses in script output.'));
            }

            try {
                const addressesJson = addressLine.substring('DEPLOYED_ADDRESSES: '.length);
                const addresses = JSON.parse(addressesJson);
                resolve(addresses);
            } catch (parseError) {
                reject(new Error(`Failed to parse deployed addresses: ${parseError.message}`));
            }
        });
    });
};

module.exports = {
    deploy
};
