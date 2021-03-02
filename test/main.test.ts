import { url, port, accounts } from "../taquitest.config";
import { TezosToolkit } from "@taquito/taquito";

const rpcUrl = `${url}:${port}`;
const { alice, bob } = accounts;

let Tezos: TezosToolkit;

beforeAll(async () => {
  Tezos = new TezosToolkit(rpcUrl);
});

describe("Initial settings", () => {
  test("Fetches Alice's balance", async () => {
    const aliceBalance = await Tezos.tz.getBalance(alice.pkh);
    expect(aliceBalance.toNumber()).not.toBeUndefined();
    expect(aliceBalance.toNumber()).toEqual(2000000000000);
  });
});
