
import {
  TOKEN_INFO,
  UNISWAP_FACTORY_TESTNET,
  PUNISWAP_TESTNET_CONTRACT_ADDRESS,
  PUNISWAP_MAINNET_CONTRACT_ADDRESS,
  INCOGNITO_TESTNET_CONTRACT_ADDRESS,
  INCOGNITO_MAINNET_CONTRACT_ADDRESS,
  UNISWAP_FACTORY_MAINNET,
  INCOGNITO_TESTNET_FULLNODE,
  INCOGNITO_MAINNET_FULLNODE,
  ETH_INFURA_TESTNET_NODE,
  ETH_INFURA_MAINNET_NODE, WETH_TESTNET, WETH_MAINNET,
} from './constants';

import Web3 from 'web3';
import Wallet from 'ethereumjs-wallet';
import {func} from "prop-types";
const secp256k1 = require('secp256k1');
const bs58 = require('bs58');

function isTestnet() {
  return process.env.NODE_ENV !== 'production';
}

function getIncognitoFullnode(isMainnet) {
  if(!isMainnet) {
    return INCOGNITO_TESTNET_FULLNODE;
  }
  return INCOGNITO_MAINNET_FULLNODE;
}

function getETHFullnodeHost(isMainnet) {
  if (!isMainnet) {
    return ETH_INFURA_TESTNET_NODE;
  }
  return ETH_INFURA_MAINNET_NODE;
}

function getUniswapTradeContractAddress(isMainnet){
  if(!isMainnet) {
    return PUNISWAP_TESTNET_CONTRACT_ADDRESS;
  }
  return PUNISWAP_MAINNET_CONTRACT_ADDRESS;
}

function getWETH(isMainnet){
  if(!isMainnet) {
    return WETH_TESTNET;
  }
  return WETH_MAINNET;
}

function getUniswapFactoryContractAddress(isMainnet){
  if(!isMainnet) {
    return UNISWAP_FACTORY_TESTNET;
  }
  return UNISWAP_FACTORY_MAINNET;
}

function getIncognitoContractAddr(isMainnet) {
  if(!isMainnet) {
    return INCOGNITO_TESTNET_CONTRACT_ADDRESS;
  }
  return INCOGNITO_MAINNET_CONTRACT_ADDRESS;
}

function getIncContractABI() {
  return [{ "inputs": [{ "internalType": "address", "name": "admin", "type": "address" }, { "internalType": "address", "name": "incognitoProxyAddress", "type": "address" }, { "internalType": "address", "name": "_prevVault", "type": "address" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "claimer", "type": "address" }], "name": "Claim", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "token", "type": "address" }, { "indexed": false, "internalType": "string", "name": "incognitoAddress", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Deposit", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "ndays", "type": "uint256" }], "name": "Extend", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "returnedTokenAddress", "type": "address" }], "name": "LogVerifier1", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "returnedAmount", "type": "uint256" }], "name": "LogVerifier2", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "newVault", "type": "address" }], "name": "Migrate", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address[]", "name": "assets", "type": "address[]" }], "name": "MoveAssets", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "pauser", "type": "address" }], "name": "Paused", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "pauser", "type": "address" }], "name": "Unpaused", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "newIncognitoProxy", "type": "address" }], "name": "UpdateIncognitoProxy", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address[]", "name": "assets", "type": "address[]" }, { "indexed": false, "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }], "name": "UpdateTokenTotal", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "token", "type": "address" }, { "indexed": false, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Withdraw", "type": "event" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "constant": true, "inputs": [], "name": "ETH_TOKEN", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "admin", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "claim", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "expire", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "n", "type": "uint256" }], "name": "extend", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "incognito", "outputs": [{ "internalType": "contract Incognito", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "newVault", "outputs": [{ "internalType": "address payable", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "pause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "paused", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "prevVault", "outputs": [{ "internalType": "contract Withdrawable", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "_successor", "type": "address" }], "name": "retire", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "name": "sigDataUsed", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "successor", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "totalDepositedToSCAmount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "unpause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "withdrawRequests", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "name": "withdrawed", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "string", "name": "incognitoAddress", "type": "string" }], "name": "deposit", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "string", "name": "incognitoAddress", "type": "string" }], "name": "depositERC20", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "bytes32", "name": "hash", "type": "bytes32" }], "name": "isWithdrawed", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "bytes", "name": "inst", "type": "bytes" }], "name": "parseBurnInst", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }, { "internalType": "uint8", "name": "", "type": "uint8" }, { "internalType": "address", "name": "", "type": "address" }, { "internalType": "address payable", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "pure", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "bytes", "name": "inst", "type": "bytes" }, { "internalType": "uint256[2]", "name": "heights", "type": "uint256[2]" }, { "internalType": "bytes32[][2]", "name": "instPaths", "type": "bytes32[][2]" }, { "internalType": "bool[][2]", "name": "instPathIsLefts", "type": "bool[][2]" }, { "internalType": "bytes32[2]", "name": "instRoots", "type": "bytes32[2]" }, { "internalType": "bytes32[2]", "name": "blkData", "type": "bytes32[2]" }, { "internalType": "uint256[][2]", "name": "sigIdxs", "type": "uint256[][2]" }, { "internalType": "uint8[][2]", "name": "sigVs", "type": "uint8[][2]" }, { "internalType": "bytes32[][2]", "name": "sigRs", "type": "bytes32[][2]" }, { "internalType": "bytes32[][2]", "name": "sigSs", "type": "bytes32[][2]" }], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "bytes", "name": "inst", "type": "bytes" }, { "internalType": "uint256[2]", "name": "heights", "type": "uint256[2]" }, { "internalType": "bytes32[][2]", "name": "instPaths", "type": "bytes32[][2]" }, { "internalType": "bool[][2]", "name": "instPathIsLefts", "type": "bool[][2]" }, { "internalType": "bytes32[2]", "name": "instRoots", "type": "bytes32[2]" }, { "internalType": "bytes32[2]", "name": "blkData", "type": "bytes32[2]" }, { "internalType": "uint256[][2]", "name": "sigIdxs", "type": "uint256[][2]" }, { "internalType": "uint8[][2]", "name": "sigVs", "type": "uint8[][2]" }, { "internalType": "bytes32[][2]", "name": "sigRs", "type": "bytes32[][2]" }, { "internalType": "bytes32[][2]", "name": "sigSs", "type": "bytes32[][2]" }], "name": "submitBurnProof", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "bytes", "name": "signData", "type": "bytes" }, { "internalType": "bytes32", "name": "hash", "type": "bytes32" }], "name": "sigToAddress", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "pure", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "bytes32", "name": "hash", "type": "bytes32" }], "name": "isSigDataUsed", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "string", "name": "incognitoAddress", "type": "string" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bytes", "name": "signData", "type": "bytes" }, { "internalType": "bytes", "name": "timestamp", "type": "bytes" }], "name": "requestWithdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "address", "name": "recipientToken", "type": "address" }, { "internalType": "address", "name": "exchangeAddress", "type": "address" }, { "internalType": "bytes", "name": "callData", "type": "bytes" }, { "internalType": "bytes", "name": "timestamp", "type": "bytes" }, { "internalType": "bytes", "name": "signData", "type": "bytes" }], "name": "execute", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address[]", "name": "tokens", "type": "address[]" }, { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }, { "internalType": "address[]", "name": "recipientTokens", "type": "address[]" }, { "internalType": "address", "name": "exchangeAddress", "type": "address" }, { "internalType": "bytes", "name": "callData", "type": "bytes" }, { "internalType": "bytes", "name": "timestamp", "type": "bytes" }, { "internalType": "bytes", "name": "signData", "type": "bytes" }], "name": "executeMulti", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "owner", "type": "address" }], "name": "getDepositedBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address payable", "name": "_newVault", "type": "address" }], "name": "migrate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address[]", "name": "assets", "type": "address[]" }], "name": "moveAssets", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address[]", "name": "assets", "type": "address[]" }, { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }], "name": "updateAssets", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "newIncognitoProxy", "type": "address" }], "name": "updateIncognitoProxy", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "token", "type": "address" }], "name": "getDecimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "token", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }];
}

function getDefaultSupportedTokens(isMainnet) {
  if (!isMainnet) {
    return [
      {
        incTokenId: TOKEN_INFO.PRV.tokenId,
        extTokenId: null,
        tokenName: TOKEN_INFO.PRV.name,
        eDecimals: 0,
        pDecimals: 9,
        icon: 'https://s3.amazonaws.com/incognito-org/wallet/cryptocurrency-icons/32@2x/color/prv@2x.png',
      },
      {
        incTokenId: 'ffd8d42dc40a8d166ea4848baf8b5f6e9fe0e9c30d60062eb7d44a8df9e00854',
        extTokenId: '0x0000000000000000000000000000000000000000',
        tokenName: 'Ether',
        eDecimals: 18,
        pDecimals: 9,
        icon: 'https://s3.amazonaws.com/incognito-org/wallet/cryptocurrency-icons/32@2x/color/eth@2x.png',
      },
      {
        incTokenId: 'c7545459764224a000a9b323850648acf271186238210ce474b505cd17cc93a0',
        extTokenId: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
        tokenName: 'DAI',
        eDecimals: 18,
        pDecimals: 9,
        icon: 'https://s3.amazonaws.com/incognito-org/wallet/cryptocurrency-icons/32@2x/color/dai@2x.png',
      },
      {
        incTokenId: '497159cf6c9f8d5a7cffd38d392649fee7b61558689ba631b26ef1b2dd8c9a06',
        extTokenId: '0xf3e0d7bf58c5d455d31ef1c2d5375904df525105',
        tokenName: 'USDT',
        eDecimals: 6,
        pDecimals: 6,
        icon: 'https://s3.amazonaws.com/incognito-org/wallet/cryptocurrency-icons/32@2x/color/usdt@2x.png',
      },
      {
        incTokenId: '61e1efbf6be9decc46fdf8250cdae5be12bee501b65f774a58af4513b645f6a3',
        extTokenId: '0x75b0622cec14130172eae9cf166b92e5c112faff',
        tokenName: 'USDC',
        eDecimals: 6,
        pDecimals: 6,
        icon: 'https://s3.amazonaws.com/incognito-org/wallet/cryptocurrency-icons/32@2x/color/usdc@2x.png',
      },
    ];
  }
  return [
    {
      incTokenId: TOKEN_INFO.PRV.tokenId,
      extTokenId: null,
      tokenName: TOKEN_INFO.PRV.name,
      eDecimals: 0,
      pDecimals: 9,
      icon: 'https://s3.amazonaws.com/incognito-org/wallet/cryptocurrency-icons/32@2x/color/prv@2x.png',
    },
    {
      incTokenId: 'ffd8d42dc40a8d166ea4848baf8b5f6e912ad79875f4373070b59392b1756c8f',
      extTokenId: '0x0000000000000000000000000000000000000000',
      tokenName: 'Ether',
      eDecimals: 18,
      pDecimals: 9,
      icon: 'https://s3.amazonaws.com/incognito-org/wallet/cryptocurrency-icons/32@2x/color/eth@2x.png',
    },
    {
      incTokenId: '3f89c75324b46f13c7b036871060e641d996a24c09b3065835cb1d38b799d6c1',
      extTokenId: '0x6b175474e89094c44da98b954eedeac495271d0f',
      tokenName: 'DAI',
      eDecimals: 18,
      pDecimals: 9,
      icon: 'https://s3.amazonaws.com/incognito-org/wallet/cryptocurrency-icons/32@2x/color/dai@2x.png',
    },
    {
      incTokenId: '716fd1009e2a1669caacc36891e707bfdf02590f96ebd897548e8963c95ebac0',
      extTokenId: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      tokenName: 'USDT',
      eDecimals: 6,
      pDecimals: 6,
      icon: 'https://s3.amazonaws.com/incognito-org/wallet/cryptocurrency-icons/32@2x/color/usdt@2x.png',
    },
    {
      incTokenId: '1ff2da446abfebea3ba30385e2ca99b0f0bbeda5c6371f4c23c939672b429a42',
      extTokenId: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      tokenName: 'USDC',
      eDecimals: 6,
      pDecimals: 6,
      icon: 'https://s3.amazonaws.com/incognito-org/wallet/cryptocurrency-icons/32@2x/color/usdc@2x.png',
    },
  ];
}

// generated eth from incKey success
function genETHAccFromIncPrivKey(incPrivKey) {
  const web3 = new Web3();
  let bytes = bs58.decode(incPrivKey);
  bytes = bytes.slice(1, bytes.length - 4);
  const privHexStr = web3.utils.bytesToHex(bytes);
  let privKey = web3.utils.keccak256(privHexStr);
  let temp, temp2;
  temp = web3.utils.hexToBytes(privKey);
  temp2 = new Uint8Array(temp);
  secp256k1.privateKeyVerify(temp2);
  while (!secp256k1.privateKeyVerify(temp2)) {
    privKey = web3.utils.keccak256(privKey);
    temp = web3.utils.hexToBytes(privKey);
    temp2 = new Uint8Array(temp);
  }
  const fixturePrivateBuffer = Buffer.from(privKey.replace('0x', ''), 'hex');
  return Wallet.fromPrivateKey(fixturePrivateBuffer);
}

export {
  isTestnet,
  getETHFullnodeHost,
  getIncContractABI,
  getDefaultSupportedTokens,
  genETHAccFromIncPrivKey,
  getUniswapTradeContractAddress,
  getIncognitoContractAddr,
  getUniswapFactoryContractAddress,
  getIncognitoFullnode,
  getWETH,
};