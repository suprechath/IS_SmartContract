const projectManagementResp = await fetch('../../contracts/artifacts/contracts/ProjectManagement.sol/ProjectManagement.json');
const ProjectManagement = await projectManagementResp.json();
const projectTokenResp = await fetch('../../contracts/artifacts/contracts/ProjectToken.sol/ProjectToken.json');
const ProjectToken = await projectTokenResp.json();

const API_BASE_URL = 'http://localhost:5001/api';
const projectIdSelect = document.getElementById('ProjectIdInput');

function randomString(length) {
    return Math.random().toString(36).substring(2, 2 + length);
}

const createProject = async () => {
    updateStatus('Creating project...');
    const fundingGoal = document.getElementById('fundingGoalInput').value;
    const durationInput = document.getElementById('durationInput').value;
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        const createProjectResponse = await axios.post(`${API_BASE_URL}/projects/`, {
            title: `${signerAddress.slice(-4)}_${randomString(6)}`,
            project_overview: `${randomString(30)}`,
            proposed_solution: `${randomString(10)}`,
            location: "Thailand",
            cover_image_url: "https://example.com/images/metropolis-tower.jpg",
            tags: ["Smart Building"],
            CO2_reduction: 1500,
            projected_roi: 12.5,
            projected_payback_period_months: 72,
            project_plan_url: "https://example.com/docs/metropolis-project-plan.pdf",
            technical_specifications_urls: [
                "https://example.com/docs/hvac-specs.pdf",
                "https://example.com/docs/led-specs.pdf"
            ],
            third_party_verification_urls: [
                "https://example.com/docs/auditor-verification.pdf"
            ],
            funding_USDC_goal: fundingGoal,
            funding_duration_second: durationInput,
            platform_fee_percentage: 500,
            reward_fee_percentage: 300
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("jwt_token")}`
            }
        });
        console.log("Create project response:", createProjectResponse);
        updateStatus(`Project creation successful! Project ID: ${createProjectResponse.data.data.id}`);
    } catch (error) {
        console.error("Error during project creation:", error);
        updateStatus(`Project creation failed: ${error.response.data.message || error.message}`);
    }
};

const verifyProject = async () => {
    updateStatus('Verifying project...');
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        const verifyResponse = await axios.post(`${API_BASE_URL}/admin/projects/review`, {
                projectId: projectIdSelect.value,
                status: "Approved"
            },{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("jwt_token")}`
            }
        });
        console.log("Verify project response:", verifyResponse);
        updateStatus(`Project verification successful! Is Verified: ${verifyResponse.data.message}`);
    } catch (error) {
        console.error("Error during project verification:", error);
        updateStatus(`Project verification failed: ${error.response.data.message || error.message}`);
    }
};

const invest = async () => {
    updateStatus('Investing in project...');
    const amountInput = document.getElementById('amountInput').value;
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    try {
        const signerAddress = await signer.getAddress();
        const investResponse = await axios.post(`${API_BASE_URL}/investments/check`, {
            projectId: projectIdSelect.value,
            amount: amountInput
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("jwt_token")}`
            }
        });
        const { unsignedTx, management_contract_address, usdc_address, amount } = investResponse.data.data;

        const usdcContract = new ethers.Contract(usdc_address, ProjectToken.abi, signer);
        const amountInWei = ethers.parseUnits(amount.toString(), 6);
        
        updateStatus('Approving USDC spend...');
        const approveTx = await usdcContract.approve(management_contract_address, amountInWei);
        await approveTx.wait();
        updateStatus('USDC spend approved.');

        const tx = await signer.sendTransaction(unsignedTx);
        await tx.wait();
        updateStatus(`Investment successful! Transaction Hash: ${tx.hash}`);

    } catch (error) {
        console.error("Error during investment:", error);
        updateStatus(`Investment failed: ${error.response.data.message || error.message}`);
    }
};

const mintToken = async () => {
    updateStatus('Minting project tokens...');
    const selectedProjectId = projectIdSelect.value;
    const batchLimit = 2; // As specified in your previous code
    if (!selectedProjectId) {
        updateStatus("Please select a project.");
        return;
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        updateStatus(`Requesting unsigned transaction for project ID: ${selectedProjectId} with batch limit: ${batchLimit}...`);     
        const prepMintResponse = await axios.post(`${API_BASE_URL}/projects/mint/prepare`, {
            projectId: selectedProjectId,
            batchLimit: batchLimit
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("jwt_token")}`
            }
        });
        const { unsignedTx } = prepMintResponse.data.data;
        updateStatus('Unsigned transaction received from backend.');
        updateStatus('Please confirm the minting transaction in your wallet...');
        const mintTx = await signer.sendTransaction(unsignedTx);
        updateStatus(`Transaction sent! Waiting for confirmation... Hash: ${mintTx.hash}`);
        await mintTx.wait();
        updateStatus(`Token minting successful! Transaction Hash: ${mintTx.hash}`);
    } catch (error) {
        console.error("Error during token minting:", error);
        const errorMsg = error.response ? error.response.data.message : (error.reason || error.message);
        updateStatus(`Token minting failed: ${errorMsg}`);
    }
};

const withdrawal = async () => {
    updateStatus('Withdrawing funds from project...');
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    try {
        const projectRes = await axios.get(`${API_BASE_URL}/projects/onchain/id/${projectIdSelect.value}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("jwt_token")}`
            }
        });
        const signerAddress = await signer.getAddress();
        const mgmtContract = new ethers.Contract(projectRes.data.data.management_contract_address, ProjectManagement.abi, signer);
        const withdrawTx = await mgmtContract.withdrawFunds();
        await withdrawTx.wait();
        updateStatus(`Withdrawal successful! Transaction Hash: ${withdrawTx.hash}`);
    } catch (error) {
        console.error("Error during withdrawal:", error);
        updateStatus(`Withdrawal failed: ${error.message}`);
    }
};
window.withdrawal = withdrawal;
window.verifyProject = verifyProject;
window.createProject = createProject;
window.invest = invest;
window.mintToken = mintToken;
