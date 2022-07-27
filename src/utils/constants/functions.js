import { ethers } from "ethers";
import { api } from "../contexts/CurrentContext";
import Web3 from "web3";

// export async function getWalletBalance(walletAddress) {
//   // const Web3js me banana hai abhi
// }

export async function getWalletBalance(walletAddress) {
  try {
    if (!walletAddress) return "";
    const nonStringBalance = await window.ethereum.request({
      method: "eth_getBalance",
      params: [walletAddress?.toString(), "latest"],
    });
    const balance = ethers.utils.formatEther(nonStringBalance);
    console.log(balance);
    return balance;
  } catch (error) {
    // console.log(error);
  }
}

export async function getWalletAddress(provider) {
  try {
    const w3 = new Web3(detectProvider());
    const accounts = await w3.eth.getAccounts();
    if (accounts?.length === 0) {
      console.error(
        "No wallet detected,this likely happens when the metamask account is locked"
      );
    } else {
      return accounts[0];
    }
  } catch (error) {
    console.log(error);
  }
}

// export async function getWalletAddress(){
// try {
//   const accounts = await window.ethereum.request({
//     method: "eth_requestAccounts",
//   });
//   return accounts[0];
// } catch (error) {
//   console.log(error);
// }
// }

export function detectProvider() {
  let provider;
  if (window.ethereum) {
    provider = window.ethereum;
  } else if (window.web3) {
    provider = window.web3.currentProvider;
  } else {
    console.warn("No ethereum browser detected, Install Metamask");
  }
  return provider;
}

export function onValuesChange(e, setValues) {
  const { id, value, name } = e.target;
  // console.log(id, value, name);
  setValues((prev) => {
    return {
      ...prev,
      [name ? name : id]: value,
    };
  });
}

//API Calls --------------------------------------------------------------------------------------->

export async function addUser(walletAddress) {
  if (!walletAddress) return; // To not send empty string
  const res = await api.post("/add-user", {
    walletAddress,
  });
  return res;
}

export async function addParentClient(req) {
  if (!req) return;
  const { walletAddress, contractAddress } = req;
  if (!walletAddress || !contractAddress) return;
  const res = await api.post("/add-parent-client", req);
  return res;
}

export async function addChildClient(req) {
  if (!req) return;
  const { walletAddress, child } = req;
  if (!walletAddress || !child) return;
  const { contractAddress, id, walletAddress: childWalletAddress } = child;
  if (!contractAddress || !id || !childWalletAddress) return;
  const res = await api.post("/add-child-client", req);
  return res;
}

export async function getParentClient(walletAddress) {
  if (!walletAddress) return;
  const res = await api.get("/parent-clients/" + walletAddress);
  return res;
}

export async function addToken(req) {
  if (!req) return;
  const { id, URI, walletAddress, contractAddress } = req;
  if (!id || !URI || !walletAddress || !contractAddress) return;
  const res = await api.post("/add-token", req);
  return res;
}

export async function regenerateAPIToken(walletAddress) {
  if (!walletAddress) return;
  console.log("jhfjkd");
  const res = await api.post("/parent-client/regenerate-api-token", {
    walletAddress,
  });
  console.log(res);
  return res;
}

//-------------------------------Web3 Functions

export async function mintNFT() {
  return {
    contractAddress: "contractAddress",
    id: "id", //Token Id
    URI: "URI",
  };
}

export async function createSmartContractInstance() {
  return "contractAddress";
}
