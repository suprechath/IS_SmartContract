// import { ethers } from 'ethers';
// import axios from 'axios';
const projectTokenResp = await fetch('../../contracts/artifacts/contracts/ProjectToken.sol/ProjectToken.json');
const ProjectToken = await projectTokenResp.json();
const projectManagementResp = await fetch('../../contracts/artifacts/contracts/ProjectManagement.sol/ProjectManagement.json');
const ProjectManagement = await projectManagementResp.json();
const ProjectFactoryResp = await fetch('../../contracts/artifacts/contracts/ProjectFactory.sol/ProjectFactory.json');
const ProjectFactory = await ProjectFactoryResp.json();

const API_BASE_URL = 'http://localhost:5001/api';
const onchainDeployButton = document.getElementById('onchainDeployButton');
const onchainProjectIdInput = document.getElementById('ProjectIdInput');
// const onchainProjectIdInput = "86f0b345-bade-412d-9937-5dc6420f064b";

let unsignedTxData = null;

async function onchainDeployContracts() {
  updateStatus('Onchain deployment started...');
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

    const jwt_token = localStorage.getItem("jwt_token");
    updateStatus(`Using JWT token: ${jwt_token}`);

    const prepDeployRes = await axios.post(`${API_BASE_URL}/projects/deploy/onchain`,
      {
        projectId: onchainProjectIdInput.value,
        // projectId: onchainProjectIdInput,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`
        } 
      }
    );
    unsignedTxData = prepDeployRes.data.data.unsignedTx;
    updateStatus('Unsigned transaction data received from backend.');
    // updateStatus(JSON.stringify(unsignedTxData, null, 2));

    const txResponse = await signer.sendTransaction(unsignedTxData);
    const receipt = await txResponse.wait();
    updateStatus(`Tx Hash: ${txResponse.hash}`);
    updateStatus(`Block Number: ${receipt.blockNumber}`);
    const factoryInterface = new ethers.Interface(ProjectFactory.abi);
    const projectDeployedLog = receipt.logs.find(log => {
      try {
          return factoryInterface.parseLog(log)?.name === 'ProjectDeployed';
      } catch (e) {
          return false;
      }
    });
    if (projectDeployedLog) {
      const parsedLog = factoryInterface.parseLog(projectDeployedLog);
      const { projectId, tokenContract, managementContract } = parsedLog.args;
      updateStatus(`✅ ProjectToken Contract: ${tokenContract}`);
      updateStatus(`✅ ProjectManagement Contract: ${managementContract}`);

      const deployedProjectToken = new ethers.Contract(tokenContract, ProjectToken.abi, signer);
      updateStatus(`name: ${await deployedProjectToken.name()}`);
      updateStatus(`symbol: ${await deployedProjectToken.symbol()}`);
      updateStatus(`cap: ${await deployedProjectToken.cap()}`);

      const deployedProjectManagement = new ethers.Contract(managementContract, ProjectManagement.abi, signer);
      updateStatus(`creator: ${await deployedProjectManagement.creator()}`);
      updateStatus(`proJectToken: ${await deployedProjectManagement.projectToken()}`);
      updateStatus(`owner: ${await deployedProjectManagement.owner()}`);

      const onboard = await axios.post(`${API_BASE_URL}/projects/deploy/onboard`,
        {
          projectId: onchainProjectIdInput.value,
          tokenContractAddress: tokenContract,
          managementContractAddress: managementContract
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt_token")}`
          }
        }
      );
      updateStatus(`✅ Onboarded successfully: ${await deployedProjectToken.minter()} and ${await deployedProjectToken.projectManagement()}`);
      updateStatus("🎉🎉🎉 DEPLOYMENT COMPLETE! 🎉🎉🎉"); 
    } else {
        updateStatus('Error: Could not find ProjectDeployed event in transaction receipt.');
    }

    // updateStatus('Deployment transaction confirmed.');
  } catch (error) {
    const errorMsg = error.response ? error.response.data.message : error.message;
    updateStatus(`Error: ${errorMsg}`);
    console.error('API error:', error.response || error);
  }
}


async function deployManagementAndFinalize() {
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

    updateStatus('🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀');
    updateStatus('Deploying ProjectToken contract');
    updateStatus(`Project ID entered: ${projectIdInput}`);
    // updateStatus(`token: ${localStorage.getItem("jwt_token")}`);
    const prepTokenRes = await axios.post(`${API_BASE_URL}/projects/deploy/projectTokenPrep`,
      {
        projectId: projectIdInput // body
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`
        }
      }
    );
    const { tokenDeployment } = prepTokenRes.data.data;
    const tokenTx = await signer.sendTransaction(tokenDeployment);
    const tokenReceipt = await tokenTx.wait();
    const tokenContractAddress = tokenReceipt.contractAddress;
    updateStatus(`✅ ProjectToken contract deployed at: ${tokenContractAddress}`);
    const deployedProjectToken = new ethers.Contract(tokenContractAddress, ProjectToken.abi, signer);
    updateStatus(`name: ${await deployedProjectToken.name()}`);
    updateStatus(`symbol: ${await deployedProjectToken.symbol()}`);
    updateStatus(`cap: ${await deployedProjectToken.cap()}`);

    updateStatus('🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀');
    updateStatus('Deploying ProjectManagement contract');
    updateStatus(`Project ID entered: ${projectIdInput}`);
    const prepMgmtRes = await axios.post(`${API_BASE_URL}/projects/deploy/projectMgmtPrep`,
      {
        projectId: projectIdInput, // body
        tokenContractAddress: tokenContractAddress // body
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`
        }
      }
    );
    const { managementDeployment } = prepMgmtRes.data.data;
    const mgmtTx = await signer.sendTransaction(managementDeployment);
    const mgmtReceipt = await mgmtTx.wait();
    const managementContractAddress = mgmtReceipt.contractAddress;
    console.log(`✅ ProjectManagement deployed successfully at: ${managementContractAddress}`);
    const deployedProjectManagement = new ethers.Contract(managementContractAddress, ProjectManagement.abi, signer);
    updateStatus(`creator: ${await deployedProjectManagement.creator()}`);
    updateStatus(`proJectToken: ${await deployedProjectManagement.projectToken()}`);
    updateStatus(`owner: ${await deployedProjectManagement.owner()}`);
    
    updateStatus('🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀');
    updateStatus('Onboard contract');
    alert('Linking the ProjectToken to the ProjectManagement contract for reward updates...\nThere are two transactions that will be sent to the blockchain.\nPlease confirm them in MetaMask.');
    await deployedProjectToken.setMinter(managementContractAddress);
    await deployedProjectToken.setProjectManagement(managementContractAddress);
    const onboard = await axios.post(`${API_BASE_URL}/projects/deploy/onboard`,
      {
        projectId: projectIdInput, // body
        tokenContractAddress: tokenContractAddress, // body
        managementContractAddress: managementContractAddress // body
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`
        }
      }
    );
    updateStatus(`✅ Onboarded successfully: ${await deployedProjectToken.minter()} and ${await deployedProjectToken.projectManagement()}`);
    updateStatus("🎉🎉🎉 DEPLOYMENT COMPLETE! 🎉🎉🎉");
  } catch (error) {
    if (error.response && error.response.data) {
      updateStatus(`Error: ${JSON.stringify(error.response.data)}`);
      console.error('Axios error data:', error.response.data);
    } else {
      updateStatus(`Error: ${error.message}`);
      console.error('General error:', error);
    }
  }
}

window.deployContracts = deployManagementAndFinalize;
window.onchainDeployContracts = onchainDeployContracts;

