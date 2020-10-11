/*
 * Trade Page reducer
 */

import {
  UPDATE_TRADE_FORM,
  UPDATE_VALIDATE_INPUT,
  UNISWAP_DEX,
  UPDATE_TRADES_MODAL,
  UPDATE_DEX_SELECTED,
  UPDATE_TOKEN_LIST,
  UPDATE_TOKENS_FILTER,
} from './constants';
import {func} from "prop-types";

// The initial state of the WalletPage
export const initialState = {
  error: null,
  dexList: [UNISWAP_DEX],
  dexSelected: UNISWAP_DEX,
  tokens: null,
  filter: '',
  tradeForm: {
    selectToken1: false,
    selectToken2: false,
    token1: null,
    token2: null,
    reserve1: 0,
    reserve2: 0,
    inputAmount: 0,
    outputAmount: 0,
    slippage: 1,
  },
  settings: null,
  validateForm: null,
};

function updateTradeModal(state, action) {
  const {modal, value} = action;
  switch (modal) {
    case 1:
      return {
        ...state,
        tradeForm: {
          ...state.tradeForm,
          selectToken1: value,
          selectToken2: false,
        }
      }
    default:
      return {
        ...state,
        tradeForm: {
          ...state.tradeForm,
          selectToken2: value,
          selectToken1: false,
        }
      }
  }
}

function tradeReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_VALIDATE_INPUT:
      return {
        ...state,
        validateForm: action.validateForm,
      }
    case UPDATE_TRADE_FORM:
      return {
        ...state,
        tradeForm: {
          ...state.tradeForm,
          token1: action.tradeForm.token1,
          token2: action.tradeForm.token2,
          inputAmount: action.tradeForm.inputAmount,
          outputAmount: action.tradeForm.outputAmount,
          slippage: action.tradeForm.slippage,
          reserve1: action.tradeForm.reserve1,
          reserve2: action.tradeForm.reserve2,
        }
      }
    case UPDATE_TRADES_MODAL:
      return updateTradeModal(state, action);
    case UPDATE_DEX_SELECTED:
      return {
        ...state,
        dexSelected: action.dex,
      }
    case UPDATE_TOKEN_LIST:
      return {
        ...state,
        tokens: action.tokens,
      }
    case UPDATE_TOKENS_FILTER:
      return {
        ...state,
        filter: action.filter,
      }
    default:
      return state;
  }
}

export default tradeReducer;