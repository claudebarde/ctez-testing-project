import fs from "fs";
import path from "path";
import { TezosToolkit } from "@taquito/taquito";
import chalk from "chalk";
import { sh } from "../utils/utils";
import { ContractOriginationInfo } from "./types";

const originate = async (
  file: string,
  tezos: TezosToolkit
): Promise<ContractOriginationInfo> => {
  // fetches the contract details
  const contractToOriginate = (
    await import(path.join(__dirname, "../originators", file))
  ).default;
  // validates contract details
  if (
    !contractToOriginate ||
    !contractToOriginate.hasOwnProperty("name") ||
    typeof contractToOriginate.name !== "string" ||
    !contractToOriginate.hasOwnProperty("initialStorage") ||
    !contractToOriginate.hasOwnProperty("entrypoint") ||
    typeof contractToOriginate.entrypoint !== "string"
  ) {
    throw `Invalid contract properties: ${path.join(
      __dirname,
      "../originators",
      file
    )}-${JSON.stringify(contractToOriginate)}`;
  } else {
    // compiles contract with Ligo
    const { stdout: michelson, stderr: compileError } = await sh(
      `ligo compile-contract ${path.join(
        __dirname,
        "../contracts",
        contractToOriginate.name
      )} ${contractToOriginate.entrypoint}`
    );
    if (compileError) {
      throw compileError;
    } else {
      // originates contract with Taquito
      process.stdout.write(
        chalk.blue(`    - Originating ${contractToOriginate.name}...`)
      );
      let op;
      try {
        op = await tezos.contract.originate({
          code: michelson.replace(/\n/g, "").replace(/\s{2,}/g, " "),
          storage: contractToOriginate.initialStorage
        });
      } catch (err) {
        process.stdout.clearLine(0);
        console.log(err);
        throw err;
      }
      // prints confirmation
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(
        chalk.blue(
          `    ✓ Contract successfully originated!\n        - ${contractToOriginate.name}: ${op.contractAddress}\n\n`
        )
      );

      const contractAbstraction = await op.contract();

      return {
        name: contractToOriginate.name.replace(".", "_"),
        contract: contractAbstraction
      };
    }
  }
};

export default async (
  tezos: TezosToolkit
): Promise<ContractOriginationInfo[] | string> => {
  try {
    // gets all the files in the originators folder
    const files = fs.readdirSync(path.join(__dirname, "../originators"));
    if (files && Array.isArray(files) && files.length > 0) {
      const contractPromises: Promise<ContractOriginationInfo>[] = [];
      files.forEach(async file => {
        if (/origin_[a-z0-9-_]+\.[tj]s/.test(file)) {
          contractPromises.push(originate(file, tezos));
        } else {
          throw "No contract to compile";
        }
      });
      // resolves contract promises
      return await Promise.all(contractPromises);
    } else {
      return "error";
    }
  } catch (error) {
    process.stdout.write("");
    return JSON.stringify(error);
  }
};
