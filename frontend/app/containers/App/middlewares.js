/*
* App middlewares
*/

import Web3 from 'web3';
import {setupIncWallet, getIncKeyAccountByName} from '../../services/incognito/wallet';
import {
  getETHAccountFromPrivateKeyStr,
} from '../../services/eth/wallet';
import {
  loadAccountsSuccess,
  loadAccountsFailure,
  loadDeployedTokensSuccess,
  loadDeployedTokensFailure,
  updateMetaMask,
  updateRefreshingBalances,
  openWalletList,
  updateWalletConnect,
} from './actions';

import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";

import {ETH_PRIVATE_KEY_FIELD_NAME, INC_WALLET_FIELD_NAME, PRIVATE_INC_ACC_NAME} from './constants';
import {countUpRequests, countDownRequests} from './actions';

import {
  getDefaultSupportedTokens,
  getIncognitoContractAddr,
  genETHAccFromIncPrivKey,
  getIncContractABI,
  getETHFullnodeHost,
} from '../../common/utils';
import {KOVAN_CHAIN_ID, MAINNET_CHAIN_ID} from "../../common/constants";
import {getReservedPool, loadTokens} from "../Trades/middlewares";
import {onChangeTradeForm} from "../Trades/actions";

function getSupportedTokens(isMainnet) {
  const supportedTokens = getDefaultSupportedTokens(isMainnet);
  return supportedTokens.filter(token => !!token.extTokenId).map(token => ({
    tokenId: token.extTokenId,
    tokenName: token.tokenName,
    eDecimals: token.eDecimals,
    icon: token.icon,
  }));
}

export function loadAccountsThunk(loadedWalletData) {
  return async (dispatch, getState) => {
    dispatch(countUpRequests());
    try {
      // load Inc Wallet from local storage
      let incWallet;
      const incWalletData = loadedWalletData[INC_WALLET_FIELD_NAME];
      if (incWalletData) {
        incWallet = await setupIncWallet(incWalletData);
      }

      let deployedTokens = [];
      const privateIncAccount = incWallet ? getIncKeyAccountByName(PRIVATE_INC_ACC_NAME, incWallet) : null;
      if (privateIncAccount) {
        const ethWallet = genETHAccFromIncPrivKey(privateIncAccount.privateKey);

        const connector = new WalletConnect({
          bridge: "https://bridge.walletconnect.org", // Required
          qrcodeModal: QRCodeModal,
        });

        let isMainnet = true;
        if (window.ethereum && window.ethereum.isConnected() && window.ethereum.isMetaMask) {
          const accounts = await window.ethereum.request({method: 'eth_accounts'});
          if (accounts.length > 0) {
            dispatch(enableMetaMask(ethWallet.getAddressString()));
            isMainnet = window.ethereum.chainId === MAINNET_CHAIN_ID;
          }
        } else if (connector.connected && connector.accounts.length > 0) {
          dispatch(enableWalletConnect(ethWallet.getAddressString()));
          isMainnet = "0x" + connector.chainId.toString(16) === MAINNET_CHAIN_ID;
        }

        const incContractAddr = getIncognitoContractAddr(isMainnet);
        const web3 = new Web3(getETHFullnodeHost(isMainnet));
        const incContract = new web3.eth.Contract(getIncContractABI(), incContractAddr);
        const supportedTokens = getSupportedTokens(isMainnet);
        for (const token of supportedTokens) {
          const balance = await incContract.methods.getDepositedBalance(token.tokenId, ethWallet.getAddressString()).call();
          const convertedBal = balance / (10 ** token.eDecimals);
          const newToken = {
            ...token,
            deployedBalance: convertedBal,
          };
          deployedTokens.push(newToken);
        }
      }

      dispatch(loadAccountsSuccess(null, incWallet, deployedTokens));

    } catch (e) {
      console.log('error occured while loading accounts: ', e);
      dispatch(loadAccountsFailure(e));
    }
    dispatch(countDownRequests());
  };
}

export function loadDeployedTokensThunk(generatedETHAddress) {
  return async (dispatch, getState) => {
    dispatch(updateRefreshingBalances(true));
    try {
      let deployedTokens = [];
      const isMainnet = getState().app.metaMask.chainId === MAINNET_CHAIN_ID;
      const incContractAddr = getIncognitoContractAddr(isMainnet);
      const web3 = new Web3(getETHFullnodeHost(isMainnet));
      const incContract = new web3.eth.Contract(getIncContractABI(), incContractAddr);
      const supportedTokens = getSupportedTokens(isMainnet);
      for (const token of supportedTokens) {
        const balance = await incContract.methods.getDepositedBalance(token.tokenId, generatedETHAddress).call();
        const convertedBal = balance / (10 ** token.eDecimals);
        const newToken = {
          ...token,
          deployedBalance: convertedBal,
        };
        deployedTokens.push(newToken);
      }
      dispatch(loadDeployedTokensSuccess(deployedTokens));
    } catch (error) {
      console.log('error occured while loading deployed tokens: ', error);
      dispatch(loadDeployedTokensFailure(error));
    }
    dispatch(updateRefreshingBalances(false));
  };
}

export function enableMetaMask(ethAddress) {
  return async (dispatch, getState) => {
    dispatch(countUpRequests());
    let metaMask = getState().app.metaMask;
    let chainId;
    let metaMaskReload = false;
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
        if (!accounts || accounts.length === 0) {
          throw new Error("Can not request accounts");
        }
        metaMask.isMetaMaskEnabled = true;
        metaMask.metaMaskAccounts = accounts;
        chainId = window.ethereum.chainId;
        metaMaskReload = metaMask.chainId !== chainId;
        metaMask.chainId = chainId;
        metaMask.requiredMess = chainId !== KOVAN_CHAIN_ID && chainId !== MAINNET_CHAIN_ID ? "Only Kovan testnet and Mainnet supported on ptrade!" : "";
      } catch (error) {
        metaMask.isMetaMaskEnabled = false;
        metaMask.metaMaskAccounts = null;
        metaMask.requiredMess = error.toString();
      }
    } else {
      metaMask.isMetaMaskEnabled = false;
      metaMask.metaMaskAccounts = null;
    }
    dispatch(updateMetaMask(metaMask));
    if (!metaMask.requiredMess && metaMaskReload) {
      let generatedETHAccFromIncAcc = getState().app.generatedETHAccFromIncAcc;
      resetTokenInfor(dispatch, generatedETHAccFromIncAcc.address ? generatedETHAccFromIncAcc.address : ethAddress);
    }

    if (metaMask.isMetaMaskEnabled) {
      window.ethereum.on('chainChanged', (chainId) => {
        let metaMask = getState().app.metaMask;
        const metaMaskReload = metaMask.chainId !== chainId;
        metaMask.chainId = chainId;
        metaMask.requiredMess = chainId !== KOVAN_CHAIN_ID && chainId !== MAINNET_CHAIN_ID ? "Only Kovan testnet and Mainnet supported on ptrade!" : "";

        dispatch(updateMetaMask(metaMask));
        if (!metaMask.requiredMess && metaMaskReload) {
          let generatedETHAccFromIncAcc = getState().app.generatedETHAccFromIncAcc;
          resetTokenInfor(dispatch, generatedETHAccFromIncAcc.address);
        }
      });
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          let metaMask = getState().app.metaMask;
          metaMask.isMetaMaskEnabled = false;
          dispatch(updateMetaMask(metaMask));
        }
      });
      dispatch(openWalletList(false));
    }
    dispatch(countDownRequests());
  }
}

export function enableWalletConnect(ethAddress) {
  // Create a connector
  return async (dispatch, getState) => {
    const metaMask = getState().app.metaMask;
    if (metaMask.isMetaMaskEnabled) {
      return
    }
    let walletConnect = getState().app.walletConnect;
    const connector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org", // Required
      qrcodeModal: QRCodeModal,
    });
    walletConnect.connector = connector;

    // Check if connection is already established
    if (!connector.connected) {
      // create new session
      await connector.createSession();
    }
    const chainId = "0x" + connector.chainId.toString(16);
    const walletConnectReload = walletConnect.chainId !== chainId;
    walletConnect.requiredMess = chainId !== KOVAN_CHAIN_ID && chainId !== MAINNET_CHAIN_ID ? "Only Kovan testnet and Mainnet supported on ptrade!" : "";
    walletConnect.connectorAccounts = connector.accounts;
    walletConnect.chainId = chainId;
    dispatch(openWalletList(false));
    dispatch(updateWalletConnect(walletConnect));
    if (!walletConnect.requiredMess && walletConnectReload) {
      const generatedETHAccFromIncAcc = getState().app.generatedETHAccFromIncAcc;
      resetTokenInfor(dispatch, generatedETHAccFromIncAcc.address ? generatedETHAccFromIncAcc.address : ethAddress);
    }

    // Subscribe to connection events
    connector.on("connect", (error, payload) => {
      if (error) {
        throw error;
      }
      let walletConnect = getState().app.walletConnect;
      // Get provided accounts and chainId
      const {accounts, chainId} = payload.params[0];
      const chainIdHex = "0x" + chainId.toString(16);
      const walletConnectReload = walletConnect.chainId !== ("0x" + chainId.toString(16));
      walletConnect.requiredMess = chainIdHex !== KOVAN_CHAIN_ID && chainIdHex !== MAINNET_CHAIN_ID ? "Only Kovan testnet and Mainnet supported on ptrade!" : "";
      walletConnect.connectorAccounts = accounts;
      walletConnect.chainId = "0x" + chainId.toString(16);
      dispatch(updateWalletConnect(walletConnect));
      if (!walletConnect.requiredMess && walletConnectReload) {
        const generatedETHAccFromIncAcc = getState().app.generatedETHAccFromIncAcc;
        resetTokenInfor(dispatch, generatedETHAccFromIncAcc.address);
      }
    });

    connector.on("session_update", (error, payload) => {
      if (error) {
        throw error;
      }
      let walletConnect = getState().app.walletConnect;
      // Get updated accounts and chainId
      const {accounts, chainId} = payload.params[0];
      const chainIdHex = "0x" + chainId.toString(16);
      const walletConnectReload = walletConnect.chainId !== chainIdHex;
      walletConnect.requiredMess = chainIdHex !== KOVAN_CHAIN_ID && chainIdHex !== MAINNET_CHAIN_ID ? "Only Kovan testnet and Mainnet supported on ptrade!" : "";
      walletConnect.connectorAccounts = accounts;
      walletConnect.chainId = "0x" + chainId.toString(16);

      dispatch(updateWalletConnect(walletConnect));
      if (!walletConnect.requiredMess && walletConnectReload) {
        const generatedETHAccFromIncAcc = getState().app.generatedETHAccFromIncAcc;
        resetTokenInfor(dispatch, generatedETHAccFromIncAcc.address);
      }
    });

    connector.on("disconnect", (error, payload) => {
      if (error) {
        throw error;
      }

      // Delete connector
      const walletConnect = {
        connector: null,
        requiredMess: null,
        connectorAccounts: null,
        chainId: MAINNET_CHAIN_ID,
      };
      dispatch(updateWalletConnect(walletConnect));
    });
  }
}

function resetTokenInfor(dispatch, ethAddress) {
  dispatch(onChangeTradeForm(
    {
      selectToken1: false,
      selectToken2: false,
      token1: null,
      token2: null,
      reserve1: 0,
      reserve2: 0,
      inputAmount: 0,
      outputAmount: 0,
      slippage: 1,
    }));
  if (ethAddress !== "") {
    dispatch(loadDeployedTokensThunk(ethAddress));
  }
  dispatch(loadTokens());
}