import { TezosToolkit } from "@taquito/taquito";

export interface InitReturn {
  success: boolean;
  tezos: TezosToolkit | null;
  changeSigner: (tezos: TezosToolkit, sk: string) => TezosToolkit | string;
  errorMsg?: string;
}
