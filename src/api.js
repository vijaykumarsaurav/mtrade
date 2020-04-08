import axios from "axios";
import * as api  from "../src/utils/config"
const performServerAction = axios.create({
    baseURL: api.BASE_URL
  });
export default performServerAction;