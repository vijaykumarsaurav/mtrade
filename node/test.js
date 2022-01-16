var axios = require('axios');
var moment = require('moment');

var data = JSON.stringify({
    "exchange":"NSE",
    "tradingsymbol":"SBIN-EQ",
    "symboltoken":"3045"
});


var jwtToken = "eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6IlYxOTM1ODgiLCJyb2xlcyI6MCwidXNlcnR5cGUiOiJVU0VSIiwiaWF0IjoxNjQyMjY1Nzk3LCJleHAiOjE3Mjg2NjU3OTd9.4GNdLGkyzDLfzqoSA91gM3mXzrYcerML1MOYLRIPAYrTp0vmtYnBRR1tuxDrw7ao0sKlOvtV8I2W078QYD4sXw"; 


var config = {
  method: 'post',
  url: 'https://apiconnect.angelbroking.com/rest/secure/angelbroking/order/v1/getLtpData',

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

for (let index = 0; index < 10; index++) {
    
    axios(config)
    .then(function (response) {
    console.log('index',index,  JSON.stringify(response.data));
    })
    .catch(function (error) {
    console.log('index',index,  error);
    });
    
}






// const format1 = "YYYY-MM-DD HH:mm";
// var time = moment.duration("20:10:00");
// var startdate = moment(new Date()).subtract(time);



// getCandleData = async(config ,index) => {
//     await axios(config)
//     .then(function (response) {
//     console.log('response',index,   JSON.stringify(response.data));
//     })
//     .catch(function (error) {
//     console.log('error',index);
//     }); 

//   }



// const getCandleDataurl = 'https://apiconnect.angelbroking.com/rest/secure/angelbroking/historical/v1/getCandleData'; 

//   var array = [{"token":"5900","symbol":"AXISBANK-EQ","name":"AXISBANK","expiry":"","strike":"-1.000000","lotsize":"1","instrumenttype":"","exch_seg":"NSE","tick_size":"5.000000"},{"token":"2263","symbol":"BANDHANBNK-EQ","name":"BANDHANBNK","expiry":"","strike":"-1.000000","lotsize":"1","instrumenttype":"","exch_seg":"NSE","tick_size":"5.000000"},{"token":"10666","symbol":"PNB-EQ","name":"PNB","expiry":"","strike":"-1.000000","lotsize":"1","instrumenttype":"","exch_seg":"NSE","tick_size":"5.000000"},{"token":"1922","symbol":"KOTAKBANK-EQ","name":"KOTAKBANK","expiry":"","strike":"-1.000000","lotsize":"1","instrumenttype":"","exch_seg":"NSE","tick_size":"5.000000"},{"token":"3045","symbol":"SBIN-EQ","name":"SBIN","expiry":"","strike":"-1.000000","lotsize":"1","instrumenttype":"","exch_seg":"NSE","tick_size":"5.000000"},{"token":"4963","symbol":"ICICIBANK-EQ","name":"ICICIBANK","expiry":"","strike":"-1.000000","lotsize":"1","instrumenttype":"","exch_seg":"NSE","tick_size":"5.000000"},{"token":"1333","symbol":"HDFCBANK-EQ","name":"HDFCBANK","expiry":"","strike":"-1.000000","lotsize":"1","instrumenttype":"","exch_seg":"NSE","tick_size":"5.000000"},{"token":"18391","symbol":"RBLBANK-EQ","name":"RBLBANK","expiry":"","strike":"-1.000000","lotsize":"1","instrumenttype":"","exch_seg":"NSE","tick_size":"5.000000"},{"token":"1023","symbol":"FEDERALBNK-EQ","name":"FEDERALBNK","expiry":"","strike":"-1.000000","lotsize":"1","instrumenttype":"","exch_seg":"NSE","tick_size":"5.000000"},{"token":"11184","symbol":"IDFCFIRSTB-EQ","name":"IDFCFIRSTB","expiry":"","strike":"-1.000000","lotsize":"1","instrumenttype":"","exch_seg":"NSE","tick_size":"5.000000"},{"token":"5258","symbol":"INDUSINDBK-EQ","name":"INDUSINDBK","expiry":"","strike":"-1.000000","lotsize":"1","instrumenttype":"","exch_seg":"NSE","tick_size":"5.000000"},{"token":"21238","symbol":"AUBANK-EQ","name":"AUBANK","expiry":"","strike":"-1.000000","lotsize":"1","instrumenttype":"","exch_seg":"NSE","tick_size":"5.000000"}]; 


//   for (let index = 0; index < array.length; index++) {
    
//     var symbol =  array[index].symbol; 

//     var data  = {
//         "exchange": "NSE",
//         "symboltoken": symbol ,
//         "interval": "FIVE_MINUTE", //ONE_DAY FIVE_MINUTE 
//         "fromdate": moment(startdate).format(format1) , 
//         "todate": moment(new Date()).format(format1)
//     }

//         var config = {
//             method: 'post',
//             url: getCandleDataurl,
//             headers: { 
//             'Authorization': 'Bearer '+jwtToken, 
//             'Content-Type': 'application/json', 
//             'Accept': 'application/json', 
//             'X-UserType': 'USER', 
//             'X-SourceID': 'WEB', 
//             'X-ClientLocalIP':'192.168.1.128',
//             'X-ClientPublicIP':'91.0.4472.114',
//             'X-MACAddress':'f0:18:98:26:c4:cc',
//             'X-PrivateKey':'I4O6PJAn'
//             },
//             data : data
//         };

//         getCandleData(config ,index);          
         
//   }
