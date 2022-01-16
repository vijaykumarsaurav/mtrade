var axios = require('axios');
var moment = require('moment');


function getPosition(req,  callback){

  console.log('req',req.query.name);

  var data = JSON.stringify({
    "exchange":"NSE",
    "tradingsymbol":"SBIN-EQ",
    "symboltoken":"3045"
});

var jwtToken = "eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6IlYxOTM1ODgiLCJyb2xlcyI6MCwidXNlcnR5cGUiOiJVU0VSIiwiaWF0IjoxNjQyMjY1Nzk3LCJleHAiOjE3Mjg2NjU3OTd9.4GNdLGkyzDLfzqoSA91gM3mXzrYcerML1MOYLRIPAYrTp0vmtYnBRR1tuxDrw7ao0sKlOvtV8I2W078QYD4sXw"; 

var config = {
  method: 'get',
  url: 'https://apiconnect.angelbroking.com/rest/secure/angelbroking/order/v1/getPosition',

  headers: { 
    'Authorization': 'Bearer '+jwtToken, 
    'Content-Type': 'application/json', 
    'Accept': 'application/json', 
    'X-UserType': 'USER', 
    'X-SourceID': 'WEB', 
    'X-ClientLocalIP':'192.168.1.128',
    'X-ClientPublicIP':'91.0.4472.114',
    'X-MACAddress':'f0:18:98:26:c4:cc',
    'X-PrivateKey':'I4O6PJAn'
  },
  data : data
};
axios(config)
.then(function (response) {
console.log('index', JSON.stringify(response.data));
callback(response.data);
})
.catch(function (error) {
console.log('index',index,  error);
});

}

module.exports = getPosition;