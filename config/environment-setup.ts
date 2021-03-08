import chalk from "chalk";
import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";
import config from "../taquitest.config.js";
import { sh } from "../utils/utils";
import originateContracts from "./originateContracts";
import type { InitReturn } from "./types";

process.stdout.write(chalk.blue("    Starting setup...\n"));

const changeSigner = (
  tezos: TezosToolkit,
  sk: string
): TezosToolkit | string => {
  try {
    const signer = new InMemorySigner(sk);
    tezos.setSignerProvider(signer);

    return tezos;
  } catch (error) {
    return JSON.stringify(error);
  }
};

const init = async (): InitReturn => {
  const { Tezos } = global;

  try {
    // verifies if Ligo is installed
    const ligoVersion = await sh("ligo --version");
    if (ligoVersion.stderr) throw "Ligo is not installed";
    // logs Ligo version
    const match = ligoVersion.stdout.match(/Commit Date: (.*)/);
    if (match) {
      process.stdout.write(
        chalk.blue(`    - Ligo version from: ${match[1]}`) + "\n"
      );
    }
    // originates contracts
    process.stdout.write(chalk.blue("    - Originating the contracts...\n"));
    const contracts = await originateContracts(tezos);
    if (Array.isArray(contracts)) {
      return { success: true, contracts };
    } else {
      throw contracts;
    }
  } catch (error) {
    console.error(error);
  }
};

let tezos: TezosToolkit;
const { url, port, accounts, timeout } = config;
const { alice } = accounts;
const rpcUrl = `${url}:${port}`;

// sets up Tezos Toolkit
tezos = new TezosToolkit(rpcUrl);
// sets up signer
const signer = new InMemorySigner(alice.sk);
tezos.setProvider({
  signer,
  config: {
    confirmationPollingIntervalSecond: 5,
    confirmationPollingTimeoutSecond: timeout,
    defaultConfirmationCount: 1,
    shouldObservableSubscriptionRetry: true
  }
});
process.stdout.write(
  chalk.blue("    ✓ Tezos toolkit successfully initialized!\n")
);
process.stdout.write(chalk.blue("    ✓ Signer successfully set!\n\n"));

// setting up global variables
(global as any).TaquiTest = {
  init,
  changeSigner
};
(global as any).Tezos = tezos;
