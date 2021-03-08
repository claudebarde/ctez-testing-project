import config from "./taquitest.config.js";
const { timeout } = config;

export default {
  testTimeout: timeout * 1000,
  setupFiles: ["./config/environment-setup.ts"],
  globals: {
    Tezos: true
  }
};
