// import { ethers } from 'ethers';
// import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';
const TOKEN_KEY = 'jwt_token';
const TOKEN_EXPIRATION_KEY = 'jwt_token_expiration';
const WALLET_ADDRESS_KEY = 'wallet_address';

let currentWalletAddress = null;

const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const onchainDeployButton = document.getElementById('onchainDeployButton');
const sanctionButton = document.getElementById('checkButton');

async function walletAddress() {
  if (!window.ethereum) {
    updateStatus("Please install MetaMask to deploy the project!");
    alert("Please install MetaMask to deploy the project!");
    return;
  }
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []); // Request wallet connection
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    // updateStatus(`User wallet address: ${signerAddress}`);
    return signerAddress;
  } catch (error) {
    updateStatus('An error occurred while fetching wallet address:', error.message);
  }
}

async function checkLoginStatus() {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiration = localStorage.getItem(TOKEN_EXPIRATION_KEY);
  const storedWalletAddress = localStorage.getItem(WALLET_ADDRESS_KEY);
  currentWalletAddress = await walletAddress(); // Fetch current wallet address

  if (token && expiration && new Date().getTime() < parseInt(expiration) && currentWalletAddress === storedWalletAddress) {
    updateStatus('✅ Already logged in. Token is still valid.');
    updateStatus(`Expiration: ${new Date(parseInt(expiration)).toLocaleString()}`);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    loginButton.disabled = true;
    logoutButton.disabled = false;
    onchainDeployButton.disabled = false;
    sanctionButton.disabled = false;
  } else {
    updateStatus('Please log in with MetaMask.');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRATION_KEY);
    localStorage.removeItem(WALLET_ADDRESS_KEY);
    delete axios.defaults.headers.common['Authorization'];
  }
}

function logOut() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRATION_KEY);
    localStorage.removeItem(WALLET_ADDRESS_KEY);
    delete axios.defaults.headers.common['Authorization'];
    updateStatus('Logged out.');
    loginButton.disabled = false;
    logoutButton.disabled = true;
    onchainDeployButton.disabled = true;
    sanctionButton.disabled = true;
}

async function logIn() {
  if (!window.ethereum) {
    updateStatus("Please install MetaMask to deploy the project!");
    alert("Please install MetaMask to deploy the project!");
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []); // Request wallet connection
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    updateStatus(`User wallet address: ${signerAddress}`);
    const nonceResponse = await axios.get(`${API_BASE_URL}/auth/nonce/${signerAddress}`);
    const { nonceToken } = nonceResponse.data.data;
    if (!nonceToken) {
      throw new Error("Nonce not received from the server.");
    }

    updateStatus(`✅ Success! Nonce received: "${nonceToken}"`);
    updateStatus('Please sign the message in the MetaMask popup...');
    const signature = await signer.signMessage(nonceToken);
    console.log(`Signature: ${signature}`);
    updateStatus('✅ Success! Message signed.');
    const verifyResponse = await axios.post(`${API_BASE_URL}/auth/verify`, {
      nonceToken: nonceToken,
      signature: signature
    });
    const { token, user } = verifyResponse.data.data;
    console.log(`JWT Token received: ${token}`);
    updateStatus(`User status: ${user.sanction_status}`);

    const payloadBase64 = token.split('.')[1];
    const decodedPayload = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(decodedPayload);
    const expirationTime = payload.exp * 1000;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRATION_KEY, expirationTime);
    localStorage.setItem(WALLET_ADDRESS_KEY, signerAddress); 
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    loginButton.disabled = true;
    logoutButton.disabled = false;
    onchainDeployButton.disabled = false;
    sanctionButton.disabled = false;
    updateStatus(`Login successful! Token will expire at: ${Date(parseInt(expirationTime)).toLocaleString()}`);  

  } catch (error) {
    if (error.code === 4001) {
      updateStatus('Login failed: You rejected the signature request.');
    } else if (error.response) {
      console.error("API Error:", error.response.data);
      updateStatus(`Login failed: ${error.response.data.message || 'Server error'}`);
    } else {
      console.error('An error occurred during login:', error);
      updateStatus('An error occurred during login: ' + error.message);
    }
  }
}

window.login = logIn;
window.logout = logOut;
// Check login status when the script is loaded
checkLoginStatus();

if (window.ethereum) {
  window.ethereum.on('accountsChanged', (accounts) => {
    console.log('MetaMask account changed. Reloading page...');
    // Reloads the page to re-evaluate the login status with the new account
    window.location.reload();
  });
}



/**
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'

Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a'

Account #3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
privateKey: '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6'

Account #4: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
privateKey: '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a'

Account #5: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
privateKey: "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba"

Account #6: 0x976EA74026E726554dB657fA54763abd0C3a0aa9
privateKey: "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e"

Account #7: 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955
privateKey: "0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356"

Account #8: 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f
privateKey: "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97"

Account #9: 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720
privateKey: "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6"

Account #10: 0xBcd4042DE499D14e55001CcbB24a551F3b954096
privateKey: "0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897"

Account #11: 0x71bE63f3384f5fb98995898A86B02Fb2426c5788
privateKey: "0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82"

Account #12: 0xFABB0ac9d68B0B445fB7357272Ff202C5651694a
privateKey: "0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1"

Account #13: 0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec
privateKey: "0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd"

Account #14: 0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097
privateKey: "0xc526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa"

Account #15: 0xcd3B766CCDd6AE721141F452C550Ca635964ce71
privateKey: "0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61"

Account #16: 0x2546BcD3c84621e976D8185a91A922aE77ECEc30
privateKey: "0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0"

Account #17: 0xbDA5747bFD65F08deb54cb465eB87D40e51B197E
privateKey: "0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd"

Account #18: 0xdD2FD4581271e230360230F9337D5c0430Bf44C0
privateKey: "0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0"

Account #19: 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199
privateKey: "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e" 
*/