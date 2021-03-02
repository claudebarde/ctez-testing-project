import { url, port, accounts } from "../taquitest.config";
import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";

const rpcUrl = `${url}:${port}`;
const { alice, bob } = accounts;

let Tezos: TezosToolkit;

beforeAll(async () => {
  Tezos = new TezosToolkit(rpcUrl);
  const signer = new InMemorySigner(alice.sk);
  Tezos.setSignerProvider(signer);

  jest.setTimeout(20000);
});

describe("Initial settings", () => {
  test("Fetches account balances", async () => {
    const initialBalance = 2000000000000;

    const aliceBalance = await Tezos.tz.getBalance(alice.pkh);
    const bobBalance = await Tezos.tz.getBalance(bob.pkh);

    expect(aliceBalance.toNumber()).not.toBeUndefined();
    expect(aliceBalance.toNumber()).toBeLessThanOrEqual(initialBalance);
    expect(bobBalance.toNumber()).toBeGreaterThanOrEqual(initialBalance);
    console.log(aliceBalance.toNumber(), bobBalance.toNumber());
  });

  test("Sends 1 tez from Alice to Bob", async () => {
    let opHash: string;
    const bobInitialBalance = await Tezos.tz.getBalance(bob.pkh);

    try {
      const op = await Tezos.contract.transfer({ to: bob.pkh, amount: 1 });
      opHash = op.hash;
      const result = await op.confirmation();
      console.log(result);
    } catch (error) {
      console.log(error);
    }

    expect(opHash).toBeTruthy();
    const bobNewBalance = await Tezos.tz.getBalance(bob.pkh);
    expect(bobNewBalance.toNumber()).toEqual(
      bobInitialBalance.toNumber() + 1000000
    );
  });
});
