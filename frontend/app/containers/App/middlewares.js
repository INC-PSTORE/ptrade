/*
* App middlewares
*/

import Web3 from 'web3';
import { setupIncWallet, getIncKeyAccountByName } from '../../services/incognito/wallet';
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

import { ETH_PRIVATE_KEY_FIELD_NAME, INC_WALLET_FIELD_NAME, PRIVATE_INC_ACC_NAME } from './constants';
import { countUpRequests, countDownRequests } from './actions';

import {
  getDefaultSupportedTokens,
  getIncognitoContractAddr,
  genETHAccFromIncPrivKey,
  getIncContractABI,
  getETHFullnodeHost,
} from '../../common/utils';

function getSupportedTokens() {
  const supportedTokens = getDefaultSupportedTokens();
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
      // load ETH private key
      // let ethAccount;
      // const ethPrivateKey = loadedWalletData[ETH_PRIVATE_KEY_FIELD_NAME];
      // if (ethPrivateKey) {
      //   ethAccount = getETHAccountFromPrivateKeyStr(ethPrivateKey);
      // }

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

        const incContractAddr = getIncognitoContractAddr();
        const web3 = new Web3(getETHFullnodeHost());
        const incContract = new web3.eth.Contract(getIncContractABI(), incContractAddr);
        const supportedTokens = getSupportedTokens();
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

      const incContractAddr = getIncognitoContractAddr();
      const web3 = new Web3(getETHFullnodeHost());
      const incContract = new web3.eth.Contract(getIncContractABI(), incContractAddr);
      const supportedTokens = getSupportedTokens();
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
