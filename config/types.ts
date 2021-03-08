import {
  TezosToolkit,
  ContractAbstraction,
  ContractProvider
} from "@taquito/taquito";

export interface ContractOriginationInfo {
  name: string;
  address: string | undefined;
  contract: ContractAbstraction<ContractProvider>;
}

export interface InitReturn {
  success: boolean;
  rpcUrl: string;
  contracts: ContractOriginationInfo[];
  errorMsg?: string;
}
