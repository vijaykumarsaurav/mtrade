var axios = require('axios');
var moment = require('moment');
var fs = require('fs');

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


function chartinkAutoOrder (req, callback) {

  console.log('req', req.body);


  const sybollist = req.body
  var obj, fillertedData = [];

  fs.readFile('../public/staticData.json', 'utf8', function (err, data) {
    if (err) throw err;
    obj = JSON.parse(data);

    sybollist.forEach(element => {
      for (let index = 0; index < obj.length; index++) {
        // if(obj[index].name.startsWith(symbolName) && obj[index].lotsize == "1" && obj[index].exch_seg == "NSE"  && !obj[index].symbol.endsWith("-BL")) {
        //   fillertedData.push(obj[index])
        // }
        if(obj[index].symbol.endsWith('-EQ')  && obj[index].name == element.name  && obj[index].lotsize == "1") {
          fillertedData.push(obj[index])
        }
      }
    });

    console.log("fillertedData", fillertedData);

    if (req.userTokens)
    header.Authorization =  'Bearer ' + req.userTokens.jwtToken,

    let config = {
      method: 'get',
      url: 'https://apiconnect.angelbroking.com/rest/secure/angelbroking/order/v1/chartinkAutoOrder',
      headers: header,
    };
    axios(config)
      .then(function (res) {
        if (res.status === 200) {
          let response = res.data; 
          console.log('position res', response);
        
          let found = false;

          for (let indexO = 0; indexO < fillertedData.length; indexO++) {
            const elementO = fillertedData[indexO];
            
            for (let index = 0; index < response.length; index++) {
              if(response[index].tradingsymbol ==  elementO.symbol){
                found = true; 
                break; 
              }
            }
            //let found = response.filter( item => item.tradingsymbol ==  element.symbol); 
            if(!found){
              let data = {
                transactiontype : "BUY", 
                tradingsymbol: elementO.symbol, 
                symboltoken: elementO.token, 
                quantity: 1, 
                buyPrice: 0, 
              }

             // historyWiseOrderPlace(elementO.token, elementO.symbol)

              placeOrderMethod(data); 
            }
          }
          // fillertedData.forEach((element)=> {
          //   for (let index = 0; index < response.length; index++) {
          //     if(item.tradingsymbol ==  element.symbol){
          //       found = true; 
          //       break; 
          //     }
          //   }
          //   //let found = response.filter( item => item.tradingsymbol ==  element.symbol); 
          //   if(!found){
          //     let data = {
          //       transactiontype : "BUY", 
          //       tradingsymbol: element.symbol, 
          //       symboltoken: element.token, 
          //       quantity: 1, 
          //       buyPrice: 0, 
          //     }

          //     historyWiseOrderPlace(element.token, element.symbol)

          //    // placeOrderMethod(data); 
          //   }
          // })
  
        }
      })
      .catch(function (error) {
        console.log('position cartch err', error);
      });

  });



} 

function placeOrderMethod (orderOption){

  var data = {
      "transactiontype": orderOption.transactiontype,//BUY OR SELL
      "tradingsymbol": orderOption.tradingsymbol,
      "symboltoken": orderOption.symboltoken,
      "quantity": orderOption.quantity,
      "ordertype": orderOption.buyPrice === 0 ? "MARKET" : "LIMIT",
      "price": orderOption.buyPrice,
      "producttype": "DELIVERY",//"DELIVERY",
      "duration": "DAY",
      "squareoff": "0",
      "stoploss": "0",
      "exchange": "NSE",
      "variety": "NORMAL"
  }
  console.log("place order option", data);

    var config = {
      method: 'post',
      url: 'https://apiconnect.angelbroking.com/rest/secure/angelbroking/order/v1/placeOrder',
      headers: header,
      data: data
    };
    axios(config)
      .then(function (res) {
        if (res.status === 200) {
          let response = res.data; 
          console.log('order resp', response);
          if (response.status && response.message === 'SUCCESS') {
            // if (orderOption.stopLossPrice) {
            //     placeSLMOrder(orderOption);
            // }
           // placeSLMOrder(orderOption);
        }
        }
      })
      .catch(function (error) {
        console.log('order cartch err', error);
      });

}


function placeSLMOrder (orderOption){

  var data = {
    "triggerprice": slmOption.stopLossPrice,
    "tradingsymbol": slmOption.tradingsymbol,
    "symboltoken": slmOption.symboltoken,
    "quantity": slmOption.quantity,
    "transactiontype": slmOption.transactiontype === "BUY" ? "SELL" : "BUY",
    "exchange": 'NSE',
    "producttype": "DELIVERY",//"DELIVERY",
    "duration": "DAY",
    "price": 0,
    "squareoff": "0",
    "stoploss": "0",
    "ordertype": "STOPLOSS_MARKET", //STOPLOSS_MARKET STOPLOSS_LIMIT
    "variety": "STOPLOSS"
  }
  console.log("slm option", data);

    var config = {
      method: 'post',
      url: 'https://apiconnect.angelbroking.com/rest/secure/angelbroking/order/v1/placeOrder',
      headers: header,
      data: data
    };
    axios(config)
      .then(function (res) {
        if (res.status === 200) {
          let response = res.data; 
          console.log('order resp', response);
          if (response.status && response.message === 'SUCCESS') {
            if (orderOption.stopLossPrice) {
                placeSLMOrder(orderOption);
            }
        }
        }
      })
      .catch(function (error) {
        console.log('order cartch err', error);
      });

}

function getLTP(data){
  
  console.log("ltp option", data);
    var config = {
      method: 'get',
      url: 'https://apiconnect.angelbroking.com/rest/secure/angelbroking/order/v1/getLtpData',
      headers: header,
      data: data
    };
   return  axios(config); 
}


function historyWiseOrderPlace (token, symbol) {

  var ltpdata = { "exchange": "NSE", "tradingsymbol": symbol, "symboltoken": token, }
  getLTP(ltpdata).then(res => {

      console.log("ltp res", res.data)
      // let ltpres = resolveResponse(res, 'noPop');
      // var LtpData = ltpres && ltpres.data;
      // console.log(symbol, " ltd data ", LtpData);
      // let quantity = 0;
      // if (LtpData && LtpData.ltp) {
      //     let perTradeExposureAmt = TradeConfig.totalCapital * TradeConfig.perTradeExposurePer / 100;
      //     quantity = Math.floor(perTradeExposureAmt / LtpData.ltp);
      // }


      // quantity = quantity > 0 ? 1 : 0;
      // console.log(symbol, "  quantity can be order ", quantity);
      // if (quantity) {
      //     const format1 = "YYYY-MM-DD HH:mm";
      //     var beginningTime = moment('9:15am', 'h:mma').format(format1);

      //     console.log("beginningTime", beginningTime);

      //     var time = moment.duration("21:10:00");
      //     var startdate = moment(new Date()).subtract(time);
      //     var data = {
      //         "exchange": "NSE",
      //         "symboltoken": token,
      //         "interval": "FIVE_MINUTE", //ONE_DAY FIVE_MINUTE 
      //         "fromdate": moment(startdate).format(format1),
      //         "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
      //     }

      //     AdminService.getHistoryData(data).then(res => {
      //         let histdata = resolveResponse(res, 'noPop');
      //         // console.log("candle history", histdata); 
      //         if (histdata && histdata.data && histdata.data.length) {


      //             var candleData = histdata.data, clossest = 0, lowerest = 0, highestHigh = 0, lowestLow = 0;
      //             candleData.reverse();
      //             lowestLow = candleData[0][3];
      //             highestHigh = candleData[0][2];
      //             if (candleData && candleData.length > 0) {
      //                 for (let index = 0; index < 20; index++) {
      //                     if (candleData[index]) {
      //                         clossest += candleData[index][4]; //close  
      //                         lowerest += candleData[index][3];  //low
      //                         if (candleData[index][2] > highestHigh) {
      //                             console.log(index, highestHigh, candleData[index][2]);
      //                             highestHigh = candleData[index][2];
      //                         }
      //                         if (candleData[index][3] <= lowestLow) {
      //                             lowestLow = candleData[index][3];
      //                         }
      //                     }
      //                 }


      //                 let devideLen = candleData.length > 20 ? 20 : candleData.length;

      //                 var bbmiddleValue = clossest / devideLen;
      //                 var bblowerValue = lowerest / devideLen;

      //                 var stoploss = bblowerValue - (highestHigh - lowestLow) * 3 / 100;
      //                 stoploss = this.getMinPriceAllowTick(stoploss);

      //                 var stoplossPer = (highestHigh - stoploss) * 100 / highestHigh;

      //                 console.log(symbol + "highestHigh:", highestHigh, "lowestLow", lowestLow, "stoploss after tick:", stoploss, "stoploss%", stoplossPer);

      //                 var orderOption = {
      //                     transactiontype: 'BUY',
      //                     tradingsymbol: symbol,
      //                     symboltoken: token,
      //                     buyPrice: 0,
      //                     quantity: quantity,
      //                     stopLossPrice: stoploss
      //                 }
      //                 let mySL = 3.5; 
      //                 if (stoplossPer) {
      //                     this.placeOrderMethod(orderOption);
      //                 } else {
      //                     console.log(symbol + " SL "+stoplossPer+"% is grater than my SL: "+mySL+"  not fullfilled");
      //                 }
      //             }


      //         } else {
      //             //localStorage.setItem('NseStock_' + symbol, "");
      //             console.log(symbol + " candle data emply");
      //         }
      //     })

      // }
  })
  // await new Promise(r => setTimeout(r, 2000)); 
}



module.exports = chartinkAutoOrder;