import BigNumber from "bignumber.js";
import { Network } from "zilswap-sdk/lib/constants";

export const DIST_CONTRACT = {
  [Network.MainNet]: "zil1efkn743p324gnnfqgpk0y2hwy6ag7cyfephyjt",
  [Network.TestNet]: "zil187a9fqhytxhge3s3g06aeglnk389ncrmenfr7t",
}
export const TOKEN_CONTRACT = {
  [Network.MainNet]: "zil1p5suryq6q647usxczale29cu3336hhp376c627",
  [Network.TestNet]: "zil1ktmx2udqc77eqq0mdjn8kqdvwjf9q5zvy6x7vu",
}

export const RETROACTIVE_AIRDROP_FACTOR = 0.05;
export const TOTAL_SUPPLY = new BigNumber(1000000).shiftedBy(12);
