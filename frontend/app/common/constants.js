export const PRIMARY_COLOR = '#2777ff';

export const INITIAL_PAGING_SKIP = 0;
export const PAGING_LIMIT = 15;

export const INCOGNITO_TESTNET_CONTRACT_ADDRESS = '0xE0D5e7217c6C4bc475404b26d763fAD3F14D2b86';
export const INCOGNITO_MAINNET_CONTRACT_ADDRESS = '0xE0D5e7217c6C4bc475404b26d763fAD3F14D2b86';

export const PUNISWAP_TESTNET_CONTRACT_ADDRESS = '0x7783C8c5AEC5cBFEF7311b4F4F33302DA6624d69';
export const PUNISWAP_MAINNET_CONTRACT_ADDRESS = '0x7783C8c5AEC5cBFEF7311b4F4F33302DA6624d69';

export const UNISWAP_TRADE_ABI = [
  {
    "inputs": [
      {
        "internalType": "contract UniswapV2",
        "name": "_uniswapV2",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "ETH_CONTRACT_ADDRESS",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "srcToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "srcQty",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "destToken",
        "type": "address"
      }
    ],
    "name": "getAmountsOut",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "incognitoSmartContract",
    "outputs": [
      {
        "internalType": "address payable",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC20",
        "name": "srcToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "srcQty",
        "type": "uint256"
      },
      {
        "internalType": "contract IERC20",
        "name": "destToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amountOutMin",
        "type": "uint256"
      }
    ],
    "name": "trade",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "uniswapV2",
    "outputs": [
      {
        "internalType": "contract UniswapV2",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "wETH",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

export const UNISWAP_FACTORY_TESTNET = '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f';
export const UNISWAP_FACTORY_MAINNET = '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f';

export const UNISWAP_FACTORY_ABI = [{
  "constant": true,
  "inputs": [{"internalType": "address", "name": "", "type": "address"}, {
    "internalType": "address",
    "name": "",
    "type": "address"
  }],
  "name": "getPair",
  "outputs": [{"internalType": "address", "name": "", "type": "address"}],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}];

export const UNISWAP_PAIR_ABI = [{
  "constant": true,
  "inputs": [],
  "name": "getReserves",
  "outputs": [{"internalType": "uint112", "name": "_reserve0", "type": "uint112"}, {
    "internalType": "uint112",
    "name": "_reserve1",
    "type": "uint112"
  }, {"internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32"}],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "token0",
  "outputs": [{"internalType": "address", "name": "", "type": "address"}],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}];

export const ETHER_ID = '0x0000000000000000000000000000000000000000';
export const WETH = '0xd0a1e359811322d97991e03f863a0c30c2cf029c';

export const STORAGE_KEY = {
  INC_WALLET: 'INC_WALLET',
  ETH_PRIVATE_KEY: 'ETH_PRIVATE_KEY',
}

export const INC_WALLET_BACKUP_PASS = '123';
export const INC_WALLET_PASSPHRASE = '123';

export const DEFAULT_PRV_FEE = 100;   // in nano PRV

export const TOKEN_INFO = {
  PRV: {
    tokenId: '0000000000000000000000000000000000000000000000000000000000000004',
    name: 'Privacy coin',
    symbol: 'PRV'
  }
};