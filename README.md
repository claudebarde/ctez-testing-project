# Jest tests for ctez token

##### To start: `npm install && npm start-sandbox && npm run test`

## Contract structure and test plan:

### Entrypoints:

- **AddLiquidity**
  - [Parameters: { owner: address; minLqtMinted : nat; maxTokensDeposited : nat }](https://github.com/murbard/ctez/blob/main/cfmm.mligo#L18)
  - Storage output: storage with lqtTotal ; tokenPool ; cashPool
  - Operation emitting: 2
  - Failwith:
    - [ ] `if storage.pendingPoolUpdates > 0n then error_PENDING_POOL_UPDATES_MUST_BE_ZERO`
    - [ ] `if Tezos.now >= deadline then error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE`
    - [ ] `if tokens_deposited > maxTokensDeposited then error_MAX_TOKENS_DEPOSITED_MUST_BE_GREATER_THAN_OR_EQUAL_TO_TOKENS_DEPOSITED`
    - [ ] `if lqt_minted < minLqtMinted then error_LQT_MINTED_MUST_BE_GREATER_THAN_MIN_LQT_MINTED`
- **RemoveLiquidity**
  - [Parameters: { to: address; lqtBurned: nat; minCashWithdrawn: nat; minTokensWithdrawn: nat; deadline: timestamp }](https://github.com/murbard/ctez/blob/main/cfmm.mligo#L29)
  - Storage output: storage with cashPool ; lqtTotal ; tokenPool
  - Operation emitting: 3
  - Failwith:
    - [ ] `if storage.pendingPoolUpdates > 0n then error_PENDING_POOL_UPDATES_MUST_BE_ZERO`
    - [ ] `if Tezos.now >= deadline then error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE`
    - [ ] `if Tezos.amount > 0mutez then error_AMOUNT_MUST_BE_ZERO`
    - [ ] `cash_withdrawn < minCashWithdrawn then error_THE_AMOUNT_OF_CASH_WITHDRAWN_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_CASH_WITHDRAWN`
    - [ ] `if tokens_withdrawn < minTokensWithdrawn then error_THE_AMOUNT_OF_TOKENS_WITHDRAWN_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_TOKENS_WITHDRAWN`
    - [ ] `match new_lqtTotal with None error_CANNOT_BURN_MORE_THAN_THE_TOTAL_AMOUNT_OF_LQT`
    - [ ] `match new_tokenPool with None error_TOKEN_POOL_MINUS_TOKENS_WITHDRAWN_IS_NEGATIVE`
    - [ ] `match new_cashPool with error_CASH_POOL_MINUS_CASH_WITHDRAWN_IS_NEGATIVE`
- **CashToToken**
  - [Parameters: { to: address; minTokensBought: nat; deadline: timestamp; if !CASH_IS_TEZ cashSold: nat }](https://github.com/murbard/ctez/blob/main/cfmm.mligo#L38)
  - Storage output: storage with cashPool ; tokenPool
  - Operation emitting: if !CASH_IS_TEZ 2 else 1
  - Failwith:
    - [ ] `if storage.pendingPoolUpdates > 0n then error_PENDING_POOL_UPDATES_MUST_BE_ZERO`
    - [ ] `if Tezos.now >= deadline then error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE`
    - [ ] `bought < minTokensBought then error_TOKENS_BOUGHT_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_TOKENS_BOUGHT`
    - [ ] `match new_tokenPool with None error_TOKEN_POOL_MINUS_TOKENS_BOUGHT_IS_NEGATIVE`
- **TokenToCash**
  - [Parameters: { to: address; tokensSold: nat; minCashBought: nat;
    deadline: timestamp }](https://github.com/murbard/ctez/blob/main/cfmm.mligo#L48)
  - Storage output: storage with tokenPool ; cashPool
  - Operation emitting: 2
  - Failwith:
    - [ ] `if storage.pendingPoolUpdates > 0n then error_PENDING_POOL_UPDATES_MUST_BE_ZERO`
    - [ ] `if Tezos.now >= deadline then error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE`
    - [ ] `if Tezos.amount > 0mutez then error_AMOUNT_MUST_BE_ZERO`
    - [ ] `if bought < minCashBought then error_CASH_BOUGHT_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_CASH_BOUGHT`
    - [ ] `match new_cashPool with None error_ASSERTION_VIOLATED_CASH_BOUGHT_SHOULD_BE_LESS_THAN_CASHPOOL`
- **TokenToToken**
  - [Parameters: { outputCfmmContract: address; minTokensBought: nat; to: address; tokensSold: nat; deadline: timestamp; }](https://github.com/murbard/ctez/blob/main/cfmm.mligo#L57)
  - Storage output:
    - [ ] if ORACLE -> storage || { storage with lastOracleUpdate }
    - [ ] if !ORACLE -> { storage with tokenPool ; cashPool }
  - Operation emitting: if !CASH_IS_TEZ 4 else 2
  - Failwith:
    - if ORACLE:
      - [ ] `match Tezos.get_entrypoint_opt "%cfmm_price" storage.consumerAddress with None error_CANNOT_GET_CFMM_PRICE_ENTRYPOINT_FROM_CONSUMER`
    - if !ORACLE:
      - [ ] `match Tezos.get_entrypoint_opt "%cashToToken" outputCfmmContract with None error_INVALID_INTERMEDIATE_CONTRACT`
      - [ ] `if storage.pendingPoolUpdates > 0n then error_PENDING_POOL_UPDATES_MUST_BE_ZERO`
      - [ ] `if Tezos.amount > 0mutez then error_AMOUNT_MUST_BE_ZERO`
      - [ ] `if Tezos.now >= deadline then error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE`
      - [ ] `match new_cashPool with None error_CASH_POOL_MINUS_CASH_BOUGHT_IS_NEGATIVE`
      - [ ] `match Tezos.get_entrypoint_opt "%approve" storage.cashAddress with None error_MISSING_APPROVE_ENTRYPOINT_IN_CASH_CONTRACT`
      - [ ] `IF !CASH_IS_FA12 failwith "unsupported"` [[link]](https://github.com/murbard/ctez/blob/main/cfmm.mligo#L665)
- **UpdatePools**
  - [Parameters: unit](https://github.com/murbard/ctez/blob/main/cfmm.mligo#L98)
  - Storage output: { storage with pendingPoolUpdates }
  - Operation emitting: 2
  - Failwith:
    - [ ] `if Tezos.sender <> Tezos.source then error_CALL_NOT_FROM_AN_IMPLICIT_ACCOUNT`
    - [ ] `if Tezos.amount > 0mutez then error_AMOUNT_MUST_BE_ZERO`
    - [ ] if TOKEN_IS_FA2 `match Tezos.get_entrypoint_opt "%balance_of" storage.tokenAddress with None error_INVALID_FA2_TOKEN_CONTRACT_MISSING_BALANCE_OF`
    - [ ] if !TOKEN_IS_FA2 `match Tezos.get_entrypoint_opt "%getBalance" storage.tokenAddress with None error_INVALID_FA12_TOKEN_CONTRACT_MISSING_GETBALANCE`
    - [ ] if CASH_IS_FA12 `match Tezos.get_entrypoint_opt "%getBalance" storage.cashAddress with None error_INVALID_FA12_CASH_CONTRACT_MISSING_GETBALANCE`
    - [ ] if CASH_IS_FA2 `match Tezos.get_entrypoint_opt "%balance_of" storage.cashAddress with None error_INVALID_FA2_CASH_CONTRACT_MISSING_GETBALANCE`
- **UpdateTokenPoolInternal**
  - [Parameters: if TOKEN*IS_FA2 nat else ((address * nat) \_ nat) list](https://)
  - Storage output: { storage with tokenPool ; pendingPoolUpdates }
  - Operation emitting: 0
  - Failwith:
    - [ ] `if (storage.pendingPoolUpdates = 0n or Tezos.sender <> storage.tokenAddress) then error_THIS_ENTRYPOINT_MAY_ONLY_BE_CALLED_BY_GETBALANCE_OF_TOKENADDRESS`
- **SetLqtAddress**
  - [Parameters: address](https://github.com/murbard/ctez/blob/main/cfmm.mligo#L108)
  - Storage output: storage with lqtAddress
  - Operation emitting: 0
  - Failwith:
    - [ ] `if storage.pendingPoolUpdates > 0n then error_PENDING_POOL_UPDATES_MUST_BE_ZERO`
    - [ ] `if Tezos.amount > 0mutez then error_AMOUNT_MUST_BE_ZERO`
    - [ ] `if storage.lqtAddress <> null_address thenerror_LQT_ADDRESS_ALREADY_SET`

_if HAS_BAKER_

- **SetBaker**
  - [Parameters: { baker: key_hash option; freezeBaker: bool }](https://github.com/murbard/ctez/blob/main/cfmm.mligo#L67)
  - Storage output: { storage with freezeBaker }
  - Operation emitting: 1
  - Failwith:
    - [ ] `if storage.pendingPoolUpdates > 0n then error_PENDING_POOL_UPDATES_MUST_BE_ZERO`
    - [ ] `if Tezos.amount > 0mutez then error_AMOUNT_MUST_BE_ZERO`
    - [ ] `if Tezos.sender <> storage.manager then error_ONLY_MANAGER_CAN_SET_BAKER`
    - [ ] `if storage.freezeBaker then error_BAKER_PERMANENTLY_FROZEN`
- **SetManager**
  - [Parameters: address](https://github.com/murbard/ctez/blob/main/cfmm.mligo#L102)
  - Storage output: { storage with manager }
  - Operation emitting: 1
  - Failwith:
    - [ ] `if storage.pendingPoolUpdates > 0n then error_PENDING_POOL_UPDATES_MUST_BE_ZERO`
    - [ ] `if Tezos.amount > 0mutez then error_AMOUNT_MUST_BE_ZERO`
    - [ ] `if Tezos.sender <> storage.manager then error_ONLY_MANAGER_CAN_SET_MANAGER`
- **Default**
  - [Parameters: unit](https://github.com/murbard/ctez/blob/main/cfmm.mligo#L103)
  - Storage output: storage with cashPool
  - Operation emitting: 0
  - Failwith:
    - [ ] if CASH_IS_TEZ `if storage.pendingPoolUpdates > 0n then error_PENDING_POOL_UPDATES_MUST_BE_ZERO`
    - [ ] if !CASH_IS_TEZ `error_TEZ_DEPOSIT_WOULD_BE_BURNED`

_if !CASH_IS_TEZ_

- **UpdateCashPoolInternal**
  - [Parameters: if CASH*IS_FA2 nat else if CASH_IS_FA12 ((address * nat) \_ nat) list](https://github.com/murbard/ctez/blob/main/cfmm.mligo#L84)
  - Storage output: { storage with cashPool ; pendingPoolUpdates }
  - Operation emitting: 0
  - Failwith:
    - [ ] `if (storage.pendingPoolUpdates = 0n or Tezos.sender <> storage.cashAddress) then error_THIS_ENTRYPOINT_MAY_ONLY_BE_CALLED_BY_GETBALANCE_OF_CASHADDRESS`
