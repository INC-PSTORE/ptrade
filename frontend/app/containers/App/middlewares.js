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
} from './actions';

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
      const isMainnet = getState().app.metaMask.chainId === MAINNET_CHAIN_ID;
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

export function enableMetaMask() {
  return async (dispatch, getState) => {
    let metaMask = getState().app.metaMask;
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        const accounts = await window.ethereum.enable();
        if (!accounts || accounts.length === 0) {
          return false;
        }
        metaMask.isMetaMaskEnabled = true;
        metaMask.metaMaskAccounts = accounts;
        metaMask.chainId = window.ethereum.chainId;
        if (metaMask.chainId !== KOVAN_CHAIN_ID && metaMask.chainId !== MAINNET_CHAIN_ID) {
          metaMask.metaMaskRequiredMess = "Only Kovan testnet and Mainnet supported on ptrade!";
        }
      } catch (error) {
        metaMask.metaMaskRequiredMess = "App error can not connect to metamask. Please try again";
        if (error.code === -32002) {
          metaMask.metaMaskRequiredMess = "Please check meta mask extension to give us permission";
        }
        metaMask.isMetaMaskEnabled = false;
        metaMask.metaMaskAccounts = null;
      }
    } else {
      metaMask.metaMaskRequiredMess = "Need meta mask installed and enabled to use awesome features";
      metaMask.isMetaMaskEnabled = false;
      metaMask.metaMaskAccounts = null;
    }
    if (metaMask.isMetaMaskEnabled) {
      window.ethereum.on('chainChanged', (chainId) => {
        let metaMask = getState().app.metaMask;
        let isSupportedChain = true;
        metaMask.chainId = chainId;
        if (chainId !== KOVAN_CHAIN_ID && chainId !== MAINNET_CHAIN_ID) {
          metaMask.metaMaskRequiredMess = "Only Kovan testnet and Mainnet supported on ptrade!";
          isSupportedChain = false;
        }
        if (metaMask.isMetaMaskEnabled) {
          let generatedETHAccFromIncAcc = getState().app.generatedETHAccFromIncAcc;
          dispatch(updateMetaMask(metaMask));
          if (isSupportedChain) {
            dispatch(loadDeployedTokensThunk(generatedETHAccFromIncAcc.address));
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
            dispatch(loadTokens());
          }
        }
      });
      window.ethereum.on('disconnect', (error) => {
        console.log("Metamask Disconnected ", error);
        let metaMask = getState().app.metaMask;
        metaMask.isMetaMaskEnabled = false;
        dispatch(updateMetaMask(metaMask));
      });
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          let metaMask = getState().app.metaMask;
          metaMask.isMetaMaskEnabled = false;
          dispatch(updateMetaMask(metaMask));
        }
      });
    }
    dispatch(updateMetaMask(metaMask));
  }
}