/**
 * Trade Page selectors
 */

import { createSelector } from 'reselect';

const selectTrade = state => state.trade; // 'trade' here should match to registered reducer name in index.js

const makeSelectValidateForm = () =>
  createSelector(
    selectTrade,
    tradeState => tradeState.validateForm,
  );

const makeSelectTradeForm = () =>
  createSelector(
    selectTrade,
    tradeState => tradeState.tradeForm,
  );

const makeSelectDexList = () =>
  createSelector(
    selectTrade,
    tradeState => tradeState.dexList,
  );

const makeSelectedDex = () =>
  createSelector(
    selectTrade,
    tradeState => tradeState.dexSelected,
  )

const makeSelectTokenList = () =>
  createSelector(
    selectTrade,
    tradeState => tradeState.tokens,
  )

const makeSelectFilter = () =>
  createSelector(
    selectTrade,
    tradeState => tradeState.filter,
  )

export {
  makeSelectValidateForm,
  makeSelectTradeForm,
  makeSelectDexList,
  makeSelectedDex,
  makeSelectTokenList,
  makeSelectFilter,
};

