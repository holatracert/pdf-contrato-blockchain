import { BlockchainConfig, IPFSConfig } from '../types';

// Configuración para desarrollo local con Anvil
export const developmentConfig = {
  blockchain: {
    rpcUrl: 'http://localhost:8545',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    contractAddress: '0x4ed7c70f96b99c776995fb64377f0d4ab3b0e1c1',
    networkId: 31337,
  } as BlockchainConfig,

  ipfs: {
    apiUrl: 'http://localhost:5001',
    gatewayUrl: 'http://localhost:8080',
  } as IPFSConfig,
};

// Configuración de red Anvil
export const anvilConfig = {
  chainId: 31337,
  accounts: [
    {
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      balance: '10000 ETH',
    },
    {
      address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
      balance: '10000 ETH',
    },
  ],
};

// Configuración de IPFS local
export const ipfsConfig = {
  local: {
    apiUrl: 'http://localhost:5001',
    gatewayUrl: 'http://localhost:8080',
  },
  public: {
    apiUrl: 'https://ipfs.io/api/v0',
    gatewayUrl: 'https://ipfs.io/ipfs',
  },
};
