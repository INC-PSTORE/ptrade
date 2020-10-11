/*
 * Trades Page actions
 */

import {
  UPDATE_VALIDATE_INPUT,
  UPDATE_TRADES_MODAL,
  UPDATE_DEX_SELECTED,
  UPDATE_TOKEN_LIST,
  UPDATE_TOKENS_FILTER, UPDATE_TRADE_FORM,
} from './constants';

export function updateValidateForm(validateForm) {
  return {
    type: UPDATE_VALIDATE_INPUT,
    validateForm,
  }
}

export function onChangeModal(modal, value) {
  return {
    type: UPDATE_TRADES_MODAL,
    modal,
    value,
  }
}

export function onChangeTradeForm(tradeForm) {
  return {
    type: UPDATE_TRADE_FORM,
    tradeForm,
  }
}

export function onChangeSelectedDex(dex) {
  return {
    type: UPDATE_DEX_SELECTED,
    dex,
  }
}

export function onChangeTokenList(tokens) {
  return {
    type: UPDATE_TOKEN_LIST,
    tokens,
  }
}

export function onChangeFilterToken(filter) {
  return {
    type: UPDATE_TOKENS_FILTER,
    filter,
  }
}