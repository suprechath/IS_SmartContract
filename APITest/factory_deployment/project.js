const API_BASE_URL = 'http://localhost:5001/api';

function randomString(length) {
    return Math.random().toString(36).substring(2, 2 + length);
}

const createProject = async () => {
    updateStatus('Creating project...');
    const fundingGoal = document.getElementById('fundingGoalInput').value;
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
            funding_duration_second: 3600,
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
    const projectId = document.getElementById('projectIdInput').value;
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        const verifyResponse = await axios.post(`${API_BASE_URL}/admin/projects/review`, {
                projectId: projectId,
                status: "Approved"
            },{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("jwt_token")}`
            }
        });
        console.log("Verify project response:", verifyResponse);
        updateStatus(`Project verification successful! Is Verified: ${verifyResponse.data.data.isVerified}`);
    } catch (error) {
        console.error("Error during project verification:", error);
        updateStatus(`Project verification failed: ${error.response.data.message || error.message}`);
    }
};

const invest = async () => {
    updateStatus('Investing in project...');
    const amount = document.getElementById('amountInput').value;
};

window.verifyProject = verifyProject;
window.createProject = createProject;
window.invest = invest;
