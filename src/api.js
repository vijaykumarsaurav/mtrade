import axios from "axios";
const performServerAction = axios.create({
    baseURL: ''
  });
export default performServerAction;