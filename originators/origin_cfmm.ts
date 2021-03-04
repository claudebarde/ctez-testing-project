// TOKEN_IS_FA2
// CASH_IS_TEZ

const initialStorage = {
  tokenPool: 1,
  cashPool: 1,
  lqtTotal: 1,
  pendingPoolUpdates: 0,
  tokenId: 1,
  tokenAddress: "tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU",
  lqtAddress: "tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU",
  lastOracleUpdate: "2021-01-01T00:00:00Z",
  consumerEntrypoint: "tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU"
};

export default {
  name: "cfmm.mligo",
  initialStorage,
  entrypoint: "main"
};
