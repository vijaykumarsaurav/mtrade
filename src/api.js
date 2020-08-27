import axios from "axios";
import * as api  from "../src/utils/config"
const performServerAction = axios.create({
    baseURL: api.RECHARGE_PACK_GET_BY_ID
  });
export default performServerAction;