export interface DocumentInfo {
  owner: string;
  timestamp: number;
  hash: string;
  ipfsHash?: string;
}

export interface PDFDocument {
  filePath: string;
  hash: string;
  ipfsHash: string;
  timestamp: number;
}

export interface BlockchainConfig {
  rpcUrl: string;
  privateKey: string;
  contractAddress: string;
  networkId: number;
}

export interface IPFSConfig {
  apiUrl: string;
  gatewayUrl: string;
}

export interface DocumentRegistrationResult {
  success: boolean;
  transactionHash?: string;
  documentHash: string;
  ipfsHash: string;
  error?: string;
}
