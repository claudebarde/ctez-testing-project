declare var Tezos: TezosToolkit | undefined;
declare var TaquiTest: {
  init: () => InitReturn;
  changeSigner: (tezos: TezosToolkit, sk: string) => TezosToolkit | string;
};
