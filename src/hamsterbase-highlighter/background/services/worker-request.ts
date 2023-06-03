import { registrationService, ServiceContext } from "../registration-service";
import { HamsterBase, HamsterBaseRequestLibOption } from "@hamsterbase/sdk";

export const workerRequest = registrationService(
  async (
    _ctx: ServiceContext,
    url: string,
    option: HamsterBaseRequestLibOption
  ) => {
    console.log(url, option);
    const result = await HamsterBase.fetchToRequestLib(fetch)(url, option);
    console.log(result);
    return result;
  },
  "workerRequest"
);
