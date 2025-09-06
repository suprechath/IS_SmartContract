const projectManagementResp = await fetch('../../contracts/artifacts/contracts/ProjectManagement.sol/ProjectManagement.json');
const ProjectManagement = await projectManagementResp.json();
const projectTokenResp = await fetch('../../contracts/artifacts/contracts/ProjectToken.sol/ProjectToken.json');
const ProjectToken = await projectTokenResp.json();

const API_BASE_URL = 'http://localhost:5001/api';
const projectIdSelect = document.getElementById('ProjectIdInput');

const allTokenCheck = async() => {
    updateStatus('Checking all project tokens...');
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    try {
        const projectRes = await axios.get(`${API_BASE_URL}/projects/onchain/id/${projectIdSelect.value}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("jwt_token")}`
            }
        });
        const projectData = projectRes.data.data;
        const tokenContractAddress = projectData.token_contract_address;
        const usdcContractAddress = projectData.usdc_contract_address;
        const projectContractAddress = projectData.management_contract_address;
        if (!tokenContractAddress || !usdcContractAddress) {
            updateStatus('Project contract addresses not found. Has the project been deployed?');
            return;
        }

        // const projectContract = new ethers.Contract(projectContractAddress, ProjectManagement.abi, provider);
        // const usdcBalance = await usdcContract.balanceOf(signerAddress);
        // updateStatus(`Mock USDC Balance: ${ethers.formatUnits(usdcBalance, 6)}`);

        const tokenContract = new ethers.Contract(tokenContractAddress, ProjectToken.abi, provider);
        const tokenBalance = await tokenContract.balanceOf(signerAddress);
        const usdcContract = new ethers.Contract(usdcContractAddress, ProjectToken.abi, provider);
        const usdcBalance = await usdcContract.balanceOf(signerAddress);
        const projectBalance = await usdcContract.balanceOf(projectContractAddress);
        const ethBalance = await provider.getBalance(signerAddress);

        updateStatus(`Project Contract USDC Balance: ${ethers.formatUnits(projectBalance, 6)}`);
        updateStatus(`My USDC Balance: ${ethers.formatUnits(usdcBalance, 6)}`);
        updateStatus(`My Project Token ${await tokenContract.symbol()} Balance: ${ethers.formatUnits(tokenBalance, 6)}`);
        updateStatus(`My ETH Balance: ${ethers.formatEther(ethBalance)}`);
    }
    catch (error) {
        console.error("Error during checking all project tokens:", error);
        updateStatus(`Checking all project tokens failed: ${error.response.data.message || error.message}`);
    }
};

window.allTokenCheck = allTokenCheck;

