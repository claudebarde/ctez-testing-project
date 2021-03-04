import init from "./init";

(async () => {
  const state = await init();
  console.log(Object.entries(state));
})();
