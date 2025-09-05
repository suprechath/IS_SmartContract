const statusDiv = document.getElementById('status');
const roleDropdown = document.getElementById('roleDropdown');
const API_BASE_URL = 'http://localhost:5001/api';

const register = async () => {
    updateStatus('Registering...');
    if (!window.ethereum) {
        statusDiv.innerHTML = "Please install MetaMask to register!";
        alert("Please install MetaMask to register!");
        return;
    }
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        updateStatus(`User wallet address: ${signerAddress}`);
        const registerResponse = await axios.post(`${API_BASE_URL}/users/register`, {
            "full_name": signerAddress.slice(-4),
            "date_of_birth": "2000-01-15",
            "address": "Bangkok",
            "identification_number": `ID${signerAddress.substring(2, 10)}`,
            "email": `${signerAddress.slice(-4)}@example.com`,
            "wallet_address": signerAddress,
            "role": roleDropdown.value
        });
        console.log("Registration response:", registerResponse);
        updateStatus(`Registration successful! User ID: ${registerResponse.data.data.id}`);
    } catch (error) {
        console.error("Error during registration:", error);
        updateStatus(`Registration failed: ${error.message}`);
    }
};

const sanction = async () => {
    updateStatus('Checking...');
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        updateStatus(`User wallet address: ${signerAddress}`);
        const sanctionResponse = await axios.get(`${API_BASE_URL}/sanctions/check`,{
            headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt_token")}`
            } 
        });
        console.log("Sanction check response:", sanctionResponse);
        updateStatus(`Sanction check successful! Status: ${sanctionResponse.data.data.isSanctioned}`);

    } catch (error) {
        console.error("Error during sanction check:", error);
        updateStatus(`Sanction check failed: ${error.message}`);
    }
};


window.register = register;
window.sanction = sanction;