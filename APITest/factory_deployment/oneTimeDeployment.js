// import { ethers } from 'ethers';
// import axios from 'axios';
const projectTokenResp = await fetch('../../contracts/artifacts/contracts/ProjectToken.sol/ProjectToken.json');
const ProjectToken = await projectTokenResp.json();
const projectManagementResp = await fetch('../../contracts/artifacts/contracts/ProjectManagement.sol/ProjectManagement.json');
const ProjectManagement = await projectManagementResp.json();
const ProjectFactoryResp = await fetch('../../contracts/artifacts/contracts/ProjectFactory.sol/ProjectFactory.json');
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

    updateStatus('Requesting unsigned transaction from backend...');
    updateStatus(localStorage.getItem("jwt_token"));
    const prepResponse = await axios.post(`${API_BASE_URL}/admin/deploy-factory/prepare`, {}, { 
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt_token")}`
      }
    });
    const { unsignedTx } = prepResponse.data.data;
    updateStatus('✅ Unsigned transaction received.');
    updateStatus('Please confirm the deployment transaction in MetaMask...');
    const txResponse = await signer.sendTransaction(unsignedTx);
    updateStatus(`⏳ Transaction sent! Waiting for confirmation... Tx Hash: ${txResponse.hash}`);
    const receipt = await txResponse.wait();
    const deployedContractAddress = receipt.contractAddress;
    if (!deployedContractAddress) {
      throw new Error("Contract address could not be retrieved from the transaction receipt.");
    }
    updateStatus(`✅ Factory contract deployed at: ${deployedContractAddress}`);

    updateStatus('Recording new factory address with the backend...');
    await axios.post(`${API_BASE_URL}/admin/deploy-factory/record`, {
      factoryAddress: deployedContractAddress
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt_token")}`
      }
    });

    updateStatus('✅ Address recorded. Please check server logs for final configuration steps.');
    updateStatus("🎉🎉🎉 DEPLOYMENT COMPLETE! 🎉🎉🎉");

  } catch (error) {
    const errorMsg = error.response ? error.response.data.message : error.message;
    updateStatus(`❌ Deployment failed: ${errorMsg}`);
    console.error('Deployment error:', error.response || error);
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
    const USDC_DECIMALS = 6; 

    const USDC = new ethers.ContractFactory(ProjectToken.abi, ProjectToken.bytecode, signer);
    const usdcContract = await USDC.deploy("USD Coin", "USDC", ethers.parseUnits("2000000000", USDC_DECIMALS));
    updateStatus(`⏳ Transaction sent! Waiting for confirmation...<br>Tx Hash: ${usdcContract.deploymentTransaction().hash}`);
    await usdcContract.waitForDeployment();
    const usdcContractAddress = await usdcContract.getAddress();
    updateStatus(`✅ USDC contract deployed at: ${usdcContractAddress}`);
    const deployedUSDC = new ethers.Contract(usdcContractAddress, ProjectToken.abi, signer);
    await deployedUSDC.connect(signer).setMinter(signerAddress);
    updateStatus(`Minter set to: ${signerAddress}`);
    await delay(3000);
    await deployedUSDC.connect(signer).mint("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", ethers.parseUnits("250000000", USDC_DECIMALS));
    await delay(2000);
    await deployedUSDC.connect(signer).mint("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", ethers.parseUnits("250000000", USDC_DECIMALS));    
    await delay(2000);
    await deployedUSDC.connect(signer).mint("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", ethers.parseUnits("250000000", USDC_DECIMALS));    
    await delay(2000);
    await deployedUSDC.connect(signer).mint("0x90F79bf6EB2c4f870365E785982E1f101E93b906", ethers.parseUnits("250000000", USDC_DECIMALS));    
    await delay(2000);
    await deployedUSDC.connect(signer).mint("0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", ethers.parseUnits("250000000", USDC_DECIMALS));    
    await delay(2000);
    await deployedUSDC.connect(signer).mint("0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc", ethers.parseUnits("250000000", USDC_DECIMALS));    
    await delay(5000);
    updateStatus(`Minted ${await deployedUSDC.balanceOf("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")} USDC to deployer address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"`);
    updateStatus(`Minted ${await deployedUSDC.balanceOf("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")} USDC to project creator`);
    updateStatus(`Minted ${await deployedUSDC.balanceOf("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC")} USDC to investor1`);
    updateStatus(`Minted ${await deployedUSDC.balanceOf("0x90F79bf6EB2c4f870365E785982E1f101E93b906")} USDC to investor2`);
    updateStatus(`Minted ${await deployedUSDC.balanceOf("0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65")} USDC to investor3`);
    updateStatus(`Minted ${await deployedUSDC.balanceOf("0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc")} USDC to investor4`);
    updateStatus(`Name: ${await deployedUSDC.name()}, Symbol: ${await deployedUSDC.symbol()}, Total Supply: ${await deployedUSDC.totalSupply()}`);
    updateStatus('Recording new factory address with the backend...');
    console.log(usdcContractAddress);

    const registerUSDCRes = await axios.post(`${API_BASE_URL}/admin/deploy/record`, {
      recordKey: "USDC_CONTRACT_ADDRESS",
      address: usdcContractAddress 
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt_token")}`
      }
    });

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

