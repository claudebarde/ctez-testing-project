import fs from "fs";
import path from "path";
import {
  TezosToolkit,
  ContractAbstraction,
  ContractProvider
} from "@taquito/taquito";
import { Parser } from "@taquito/michel-codec";
import chalk from "chalk";
import { sh } from "../utils/utils";

export default async (
  tezos: TezosToolkit
): Promise<ContractAbstraction<ContractProvider>[] | string> => {
  try {
    // gets all the files in the originators folder
    fs.readdir(path.join(__dirname, "../originators"), (err, files) => {
      files.forEach(async file => {
        if (/origin_[a-z0-9-_]+\.[tj]s/.test(file)) {
          // fetches the contract details
          const contractToOriginate = (
            await import(path.join(__dirname, "../originators", file))
          ).default;
          // validates contract details
          if (
            !contractToOriginate ||
            !contractToOriginate.hasOwnProperty("contractName") ||
            typeof contractToOriginate.contractName !== "string" ||
            !contractToOriginate.hasOwnProperty("initialState") ||
            !contractToOriginate.hasOwnProperty("entrypoint") ||
            typeof contractToOriginate.entrypoint !== "string"
          ) {
            throw "Invalid contract properties";
          } else {
            // compiles contract with Ligo
            const { stdout: michelson, stderr: compileError } = await sh(
              `ligo compile-contract ${path.join(
                __dirname,
                "../contracts",
                contractToOriginate.contractName
              )} ${contractToOriginate.entrypoint}`
            );
            if (compileError) {
              throw compileError;
            } else {
              // originates contract with Taquito
              process.stdout.write(
                chalk.blue(
                  `    - Originating ${contractToOriginate.contractName}...`
                )
              );
              let op;
              const p = new Parser();
              let code = JSON.stringify(p.parseMichelineExpression(michelson));
              try {
                op = await tezos.contract.originate({
                  code,
                  storage: contractToOriginate.initialStorage
                });
              } catch (err) {
                process.stdout.clearLine(0);
                console.log(err);
                throw err;
              }
              process.stdout.write(
                chalk.blue(
                  `    ✓ Contract successfully originated!\n        - Address: ${op.contractAddress}`
                )
              );
            }
          }
        }
      });
    });
  } catch (error) {
    process.stdout.write("");
    return JSON.stringify(error);
  }
};
