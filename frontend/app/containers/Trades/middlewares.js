/*
* Wallet middlewares
*/

import Web3 from 'web3';

import {
  makeCall,
  buildOptions,
} from '../../utils/api-call';

import {
  getTokens
} from '../../utils/api-routes';

import {
  updateValidateForm,
  onChangeTokenList,
  onChangeTradeForm,
} from './actions';

import {
  getETHFullnodeHost,
  getDefaultSupportedTokens,
  getUniswapFactoryContractAddress,
  getIncognitoContractAddr,
  getIncContractABI, getWETH,
} from '../../common/utils';

import {
  HANDLE_FAILURE_GLOBALLY,
} from '../App/constants'

import {countDownRequests, countUpRequests} from "../App/actions";
import en from "react-intl/src/en";
import {getUniswapTradeContractAddress} from "../../common/utils";
import {
  ETHER_ID,
  MAINNET_CHAIN_ID,
  UNISWAP_FACTORY_ABI,
  UNISWAP_PAIR_ABI,
  UNISWAP_TRADE_ABI,
} from "../../common/constants";
import {enableMetaMask} from "../App/middlewares";

const eutil = require('ethereumjs-util');

export function loadTokens() {
  return async (dispatch, getState) => {
    dispatch(countUpRequests());
    try {
      // TODO: update get token list when pstore ready
      // let options = await buildOptions('GET');
      // delete options.headers;
      // const tokensRes = await makeCall(
      //   dispatch,
      //   getTokens(),
      //   options,
      // );
      const isMainnet = getState().app.metaMask.chainId === MAINNET_CHAIN_ID;
      let tokensRes = {tokens: null};
      let tokenSupported = getDefaultSupportedTokens(isMainnet);
      tokenSupported.shift();
      tokensRes.tokens = tokenSupported;

      if (tokensRes && tokensRes.tokens) {
        dispatch(onChangeTokenList(tokensRes.tokens));
      }
    } catch (e) {
      console.log(e);
      dispatch(updateValidateForm({snackBar: {isError: true, message: "Cannot load tokens"}}));
    }
    dispatch(countDownRequests());
  }
}

export function getExchangeRate(tradeForm) {
  return (dispatch, getState) => {
    try {
      if (!tradeForm.token1 || !tradeForm.token2 || !tradeForm.inputAmount) {
        dispatch(onChangeTradeForm(tradeForm));
        return {};
      }
      if (tradeForm.token1.extTokenId === tradeForm.token2.extTokenId) {
        return {};
      }
      if (tradeForm.reserve1 === 0 || tradeForm.reserve2 === 0) {
        return {};
      }
      const web3 = new Web3();
      const reserve1BN = web3.utils.toBN(tradeForm.reserve1);
      const reserve2BN = web3.utils.toBN(tradeForm.reserve2);
      const invariant = reserve1BN.mul(reserve2BN);
      const decimalPart =  web3.utils.toBN(Math.floor(tradeForm.inputAmount)).mul(web3.utils.toBN(10 ** (tradeForm.token1.eDecimals)));
      const partition = (tradeForm.inputAmount - Math.floor(tradeForm.inputAmount)) * 10 ** (tradeForm.token1.eDecimals);
      const tradeAmountBN = decimalPart.add(web3.utils.toBN(Math.floor(partition)));
      let newToken1 = reserve1BN.add(tradeAmountBN.mul(web3.utils.toBN(997)).div(web3.utils.toBN(1000)));
      let newToken2 = invariant.div(newToken1);
      const receiveAmount = reserve2BN.sub(newToken2).sub(web3.utils.toBN(1));
      if (receiveAmount.cmp(web3.utils.toBN(0)) < 0) {
        tradeForm.outputAmount = 0;
      } else {
        tradeForm.outputAmount = receiveAmount.toString() / (10 ** tradeForm.token2.eDecimals);
      }
      dispatch(onChangeTradeForm(tradeForm));
    } catch (e) {
      console.log(e);
      dispatch(updateValidateForm({snackBar: {isError: true, message: "Cannot get token exchange rate"}}));
    }
  }
}

export function getReservedPool() {
  return async (dispatch, getState) => {
    let tradeForm = getState().trade.tradeForm;
    if(!tradeForm.token1 || !tradeForm.token2) {
      return {};
    }
    try {
      const isMainnet = getState().app.metaMask.chainId === MAINNET_CHAIN_ID;
      const web3 = new Web3(getETHFullnodeHost(isMainnet));
      const uniswapFactoryInstance = new web3.eth.Contract(UNISWAP_FACTORY_ABI, getUniswapFactoryContractAddress(isMainnet));
      let token1, token2;
      token1 = tradeForm.token1.extTokenId;
      token2 = tradeForm.token2.extTokenId;
      const weth = getWETH(isMainnet);
      if (token1.toLowerCase() === ETHER_ID) {
        token1 = weth;
      }
      if (token2.toLowerCase() === ETHER_ID) {
        token2 = weth;
      }
      const pairAddress = await uniswapFactoryInstance.methods.getPair(token1, token2).call();
      if (pairAddress === ETHER_ID) {
        throw 'Pair had not added yet';
      }
      const pairInstance = new web3.eth.Contract(UNISWAP_PAIR_ABI, pairAddress);
      const reservePool = await pairInstance.methods.getReserves().call();
      if (reservePool._reserve0 === "0" && reservePool._reserve1 === "0") {
        throw 'Pair has no liquidity';
      }
      const token0 = await pairInstance.methods.token0().call();
      if (token0.toLowerCase() === token1.toLowerCase()) {
        tradeForm.reserve1 = reservePool._reserve0;
        tradeForm.reserve2 = reservePool._reserve1;
      } else {
        tradeForm.reserve2 = reservePool._reserve0;
        tradeForm.reserve1 = reservePool._reserve1;
      }
      if (tradeForm.inputAmount) {
        dispatch(getExchangeRate(tradeForm));
      } else {
        dispatch(onChangeTradeForm(tradeForm));
      }
    } catch (e) {
      console.log(e);
      let errorText = "Cannot get pool size of this pair";
      if (e === 'Pair had not added yet') {
        tradeForm.reserve1 = 0;
        tradeForm.reserve2 = 0;
        tradeForm.inputAmount = 0;
        tradeForm.outputAmount = 0;
        dispatch(onChangeTradeForm(tradeForm));
        errorText = 'Pair had not added yet';
      } else if (e === 'Pair has no liquidity') {
        errorText = 'Pair has no liquidity';
      }
      dispatch(updateValidateForm({snackBar: {isError: true, message: errorText}}));
    }
  }
}

export function trade(tradeForm) {
  return async (dispatch, getState) => {
    dispatch(countUpRequests());
    try {
      const isMainnet = getState().app.metaMask.chainId === MAINNET_CHAIN_ID;
      const web3 = new Web3(getETHFullnodeHost(isMainnet));
      const incognitoInstance = new web3.eth.Contract(getIncContractABI(), getIncognitoContractAddr(isMainnet));
      const uniswapInstance = new web3.eth.Contract(UNISWAP_TRADE_ABI, getUniswapTradeContractAddress(isMainnet));
      let metaMask = getState().app.metaMask;
      if (!metaMask.isMetaMaskEnabled) {
        dispatch(enableMetaMask());
        dispatch(countDownRequests());
        return {};
      }
      let generatedETHAcc = getState().app.generatedETHAccFromIncAcc;
      if(!tradeForm.token1 || !tradeForm.token2 || !tradeForm.inputAmount || !tradeForm.outputAmount) {
        dispatch(countDownRequests());
        return {};
      }
      const inputAmount = tradeForm.inputAmount * 10 ** (tradeForm.token1.eDecimals);
      let yourVaultBalance = await incognitoInstance.methods.getDepositedBalance(tradeForm.token1.extTokenId, generatedETHAcc.address).call();
      if (inputAmount > yourVaultBalance) {
        dispatch(countDownRequests());
        dispatch(updateValidateForm({snackBar: {isError: true, message: "Insufficient deployed balance!"}}));
        return {
          type: HANDLE_FAILURE_GLOBALLY,
          error: "Insufficient deployed balance",
        };
      }

      const amountBN = web3.utils.toBN(inputAmount);
      let amountHex = web3.utils.toHex(amountBN);
      const amountExpected = (tradeForm.outputAmount - tradeForm.outputAmount * tradeForm.slippage / 100) * 10**(tradeForm.token2.eDecimals);
      const amountExpectedBN = web3.utils.toBN(Math.floor(amountExpected));
      let amountExpectedHex = web3.utils.toHex(amountExpectedBN);

      let swapRawData = uniswapInstance.methods.trade(tradeForm.token1.extTokenId, amountHex, tradeForm.token2.extTokenId, amountExpectedHex).encodeABI();
      let getTimestamp = (new Date()).getTime().toString(16);
      let randomBytes = '0x' + (getTimestamp.length % 2 === 0 ? getTimestamp : '0' + getTimestamp);
      let dataToSign = (getUniswapTradeContractAddress(isMainnet) + swapRawData + randomBytes + web3.utils.padLeft(amountHex, 64)).split("0x").join("");
      let hashData = web3.utils.keccak256("0x" + dataToSign)
      const signBytes = sigMess(hashData, generatedETHAcc.privateKey)
      dispatch(updateValidateForm({snackBar: {isSuccess: true, message:  "Created transaction successfully"}}));
    } catch (e) {
      console.log(e);
      dispatch(updateValidateForm({snackBar: {isError: true, message: "Something went wrong"}}));
    }
    dispatch(countDownRequests());
  }
}

export function sigMess(mess, privateKey) {
  let dataToSigBuff = Buffer.from(mess.replace('0x', ''), "hex");
  let privateKeyBuff = Buffer.from(privateKey.replace('0x', ''), "hex");
  let signature = eutil.ecsign(dataToSigBuff, privateKeyBuff);
  return '0x' + signature.r.toString('hex') + signature.s.toString('hex') + '0' + (signature.v - 27).toString(16);
}