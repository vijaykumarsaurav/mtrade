var axios = require('axios');
var moment = require('moment');

var jwtToken = "eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6IlYxOTM1ODgiLCJyb2xlcyI6MCwidXNlcnR5cGUiOiJVU0VSIiwiaWF0IjoxNjQyOTU3MTU2LCJleHAiOjE3MjkzNTcxNTZ9.l2pqXb67-adYLA4WS9MiIieyCikj5vszpjff7iTdQqv4jfL2utq9Sa2KcnGaakrPToyTb8fuS_2hDOfCboQmBw";
let header = {
  'Authorization': 'Bearer ' + jwtToken,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-UserType': 'USER',
  'X-SourceID': 'WEB',
  'X-ClientLocalIP': '192.168.1.128',
  'X-ClientPublicIP': '91.0.4472.114',
  'X-MACAddress': 'f0:18:98:26:c4:cc',
  'X-PrivateKey': 'I4O6PJAn'
};


const GET_POSITION_API =  'https://apiconnect.angelbroking.com/rest/secure/angelbroking/order/v1/getPosition';

class AdminService {

    getPosition(data){
      return axios.get(GET_POSITION_API, header);
    }
    // placeOrder(credentials) {
    //     return axios.post(apiConstant.PlaceOrderApi, credentials, header);
    // } 

    // modifyOrder(credentials) {
    //     return axios.post(apiConstant.modifyOrderApi, credentials, header);
    // } 
    // cancelOrder(credentials) {
    //     return axios.post(apiConstant.cancelOrderApi, credentials, header);
    // } 

    // getLTP(credentials) {
    //     return axios.post(apiConstant.GetLTPAPI, credentials, header);
    // } 

    // getHistoryData(credentials) {
    //     return axios.post(apiConstant.getCandleData, credentials, header);
    // } 
}

module.exports = AdminService;