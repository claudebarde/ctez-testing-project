import {
  TezosToolkit,
  ContractAbstraction,
  ContractProvider
} from "@taquito/taquito";

export interface ContractOriginationInfo {
  name: string;
  contract: ContractAbstraction<ContractProvider>;
}

export interface InitReturn {
  success: boolean;
  contracts: ContractOriginationInfo[];
  errorMsg?: string;
}
