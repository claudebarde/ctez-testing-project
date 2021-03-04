import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";
import isOnline from "is-online";
import axios from "axios";
import chalk from "chalk";
import { url, port, accounts, timeout } from "../taquitest.config";
import { sh } from "../utils/utils";
import { InitReturn } from "./types";
import originateContracts from "./originateContracts";

const rpcUrl = `${url}:${port}`;
const { alice } = accounts;
let tezos: TezosToolkit;

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

const init = async (): Promise<InitReturn> => {
  try {
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
    process.stdout.write(chalk.blue("    ✓ Signer successfully set!\n"));
    // verifies if Ligo is installed
    const ligoVersion = await sh("ligo --version");
    if (ligoVersion.stderr) throw "Ligo is not installed";
    // checks if newer version is available to inform the user
    /*if (isOnline({ timeout: 2000 })) {
      const result = await axios.get(
        "https://hub.docker.com/v2/ligolang/ligo/tags/list",
        {
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
      console.log(result);
    }*/

    const match = ligoVersion.stdout.match(/Commit Date: (.*)/);
    if (match) {
      process.stdout.write(
        chalk.blue(`    - Last Ligo update: ${match[1]}`) + "\n"
      );
    }
    // originates contracts
    process.stdout.write(chalk.blue("    - Originating the contracts\n"));
    originateContracts(tezos);

    process.stdout.write("\n\n");

    return { success: true, tezos, changeSigner };
  } catch (error) {
    process.stdout.write("\n\n");

    return { success: true, tezos: null, changeSigner };
  }
};

export default init;
