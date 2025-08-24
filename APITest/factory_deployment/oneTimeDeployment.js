// import { ethers } from 'ethers';
// import axios from 'axios';
const projectTokenResp = await fetch('../../artifacts/contracts/ProjectToken.sol/ProjectToken.json');
const ProjectToken = await projectTokenResp.json();
const projectManagementResp = await fetch('../../artifacts/contracts/ProjectManagement.sol/ProjectManagement.json');
const ProjectManagement = await projectManagementResp.json();
const ProjectFactoryResp = await fetch('../../artifacts/contracts/ProjectFactory.sol/ProjectFactory.json');
const ProjectFactory = await ProjectFactoryResp.json();

const API_BASE_URL = 'http://localhost:5001/api';
const factoryButton = document.getElementById('factoryButton');
const usdcButton = document.getElementById('usdcButton');

async function factoryContractDeployment() {
  updateStatus('Deployment started...');
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
    const Factory = new ethers.ContractFactory(ProjectFactory.abi, ProjectFactory.bytecode, signer);
    const factoryContract = await Factory.deploy();
    updateStatus(`⏳ Transaction sent! Waiting for confirmation...<br>Tx Hash: ${factoryContract.deploymentTransaction().hash}`);
    await factoryContract.waitForDeployment();
    const factoryContractAddress = await factoryContract.getAddress();
    updateStatus(`✅ Factory contract deployed at: ${factoryContractAddress}`);
    const deployedProjectFactory = new ethers.Contract(factoryContractAddress, ProjectFactory.abi, signer);
    updateStatus(`Owner: ${await deployedProjectFactory.platformOwner()}`);
    const registerFactoryRes = await axios.post(`${API_BASE_URL}/users/regBP`,
      {
        wallet_address: factoryContractAddress,
        name: "factoryContract",
        email: "factoryContract@commeff.com",
        nonce: "factoryContract",
        role: "Platform Operator"
      }
    );
    updateStatus(`Backend registered the factory contract as a Platform Operator: ${registerFactoryRes.data.message}`);
  } catch (error) {
    console.error("Deployment failed:", error);
    updateStatus(`❌ Deployment failed: ${error.reason || error.message}`);
  } finally {
    factoryButton.disabled = true;
  }
};

async function usdcContractDeployment() {
  updateStatus('USDC Deployment started...');
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

    const USDC = new ethers.ContractFactory(ProjectToken.abi, ProjectToken.bytecode, signer);
    const usdcContract = await USDC.deploy("USD Coin", "USDC", 1000000);
    updateStatus(`⏳ Transaction sent! Waiting for confirmation...<br>Tx Hash: ${usdcContract.deploymentTransaction().hash}`);
    await usdcContract.waitForDeployment();
    const usdcContractAddress = await usdcContract.getAddress();
    updateStatus(`✅ USDC contract deployed at: ${usdcContractAddress}`);
    const deployedUSDC = new ethers.Contract(usdcContractAddress, ProjectToken.abi, signer);
    await deployedUSDC.connect(signer).setMinter(signerAddress);
    updateStatus(`Minter set to: ${signerAddress}`);
    await delay(3000);
    await deployedUSDC.connect(signer).mint("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 100000);
    await deployedUSDC.connect(signer).mint("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 100000);
    await deployedUSDC.connect(signer).mint("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", 100000);
    await deployedUSDC.connect(signer).mint("0x90F79bf6EB2c4f870365E785982E1f101E93b906", 100000);
    await deployedUSDC.connect(signer).mint("0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", 100000);
    await deployedUSDC.connect(signer).mint("0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc", 100000);
    await delay(5000);
    updateStatus(`Minted ${await deployedUSDC.balanceOf("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")} USDC to deployer address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"`);
    updateStatus(`Minted ${await deployedUSDC.balanceOf("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")} USDC to project creator`);
    updateStatus(`Minted ${await deployedUSDC.balanceOf("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC")} USDC to investor1`);
    updateStatus(`Minted ${await deployedUSDC.balanceOf("0x90F79bf6EB2c4f870365E785982E1f101E93b906")} USDC to investor2`);
    updateStatus(`Minted ${await deployedUSDC.balanceOf("0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65")} USDC to investor3`);
    updateStatus(`Minted ${await deployedUSDC.balanceOf("0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc")} USDC to investor4`);
    updateStatus(`Name: ${await deployedUSDC.name()}, Symbol: ${await deployedUSDC.symbol()}, Total Supply: ${await deployedUSDC.totalSupply()}`);
    const registerUSDCRes = await axios.post(`${API_BASE_URL}/users/regBP`,
      {
        wallet_address: usdcContractAddress,
        name: "USDC",
        email: "USDC@commeff.com",
        nonce: "USDC",
        role: "Platform Operator"
      }
    );
    updateStatus(`Backend registered the USDC contract as a Platform Operator: ${registerUSDCRes.data.message}`);
  } catch (error) {
    console.error("Deployment failed:", error);
    updateStatus(`❌ Deployment failed: ${error.reason || error.message}`);
  } finally {
    usdcButton.disabled = true;
  }
};

window.factoryContractDeployment = factoryContractDeployment;
window.usdcContractDeployment = usdcContractDeployment;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

