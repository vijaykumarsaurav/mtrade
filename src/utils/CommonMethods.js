import {resolveResponse} from "./ResponseHandler";
import AdminService from "../service/AdminService";

speckIt = (text) => {
    var msg = new SpeechSynthesisUtterance();
    msg.text = text.toString();
    window.speechSynthesis.speak(msg);
}

getMinPriceAllowTick = (minPrice) => {
    minPrice = minPrice.toFixed(2);
    // console.log("minPrice",minPrice); 
    var wholenumber = parseInt(minPrice.split('.')[0]);
    //  console.log("wholenumber",wholenumber); 
    var decimal = parseFloat(minPrice.split('.')[1]);
    // console.log("decimal",decimal); 
    var tickedecimal = decimal - decimal % 5;
    minPrice = parseFloat(wholenumber + '.' + tickedecimal);
    //   console.log("minPricexxxx",minPrice); 
    return minPrice;
}


export default function placeOrderMethod(orderOption){
    var data = {
        "transactiontype": orderOption.transactiontype,//BUY OR SELL
        "tradingsymbol": orderOption.tradingsymbol,
        "symboltoken": orderOption.symboltoken,
        "quantity": orderOption.quantity,
        "ordertype": orderOption.buyPrice === 0 ? "MARKET" : "LIMIT",
        "price": orderOption.buyPrice,
        "producttype": "INTRADAY",//"DELIVERY",
        "duration": "DAY",
        "squareoff": "0",
        "stoploss": "0",
        "exchange": "NSE",
        "variety": "NORMAL"
    }
    console.log("place order option", data);
    AdminService.placeOrder(data).then(res => {
        let data = resolveResponse(res);
        //  console.log(data);   
        if (data.status && data.message === 'SUCCESS') {
            if (orderOption.stopLossPrice) {
                placeSLMOrder(orderOption);
            }
        }
    })

}

export default function placeSLMOrder(slmOption) {

    var data = {
        "triggerprice": slmOption.stopLossPrice,
        "tradingsymbol": slmOption.tradingsymbol,
        "symboltoken": slmOption.symboltoken,
        "quantity": slmOption.quantity,
        "transactiontype": slmOption.transactiontype === "BUY" ? "SELL" : "BUY",
        "exchange": 'NSE',
        "producttype": "INTRADAY",//"DELIVERY",
        "duration": "DAY",
        "price": 0,
        "squareoff": "0",
        "stoploss": "0",
        "ordertype": "STOPLOSS_MARKET", //STOPLOSS_MARKET STOPLOSS_LIMIT
        "variety": "STOPLOSS"
    }
    console.log("SLM option data", data);
    AdminService.placeOrder(data).then(res => {
        let data = resolveResponse(res);
        //  console.log(data);   
        if (data.status && data.message === 'SUCCESS') {
            this.setState({ orderid: data.data && data.data.orderid });
            // this.updateOrderList(); 
            this.speckIt('hey Vijay, ' + slmOption.tradingsymbol + " buy order placed");
            this.getTodayOrder();
            document.getElementById('orderRefresh') && document.getElementById('orderRefresh').click();
        }
    })
}



export default function historyWiseOrderPlace(sectorItem, orderType, isAutomatic, spinnerIndex) {

<<<<<<< Updated upstream
=======
    getStockTokenDetails = (name) => {
        const CashStocks = localStorage.getItem('staticData') ? JSON.parse(localStorage.getItem('staticData')).CashStocks : []; 
        var uppercaseName = name.toUpperCase() + "-EQ";
        var found = CashStocks.filter(row => row.name === name && row.exch_seg === "NSE");
        if (found.length) {
            return found[0]; 
        }  
        return null;       
    }
>>>>>>> Stashed changes

    this.setState({ [spinnerIndex]: true })

    var token = sectorItem.token;
    var symbol = sectorItem.symbol;

    if (isAutomatic != "Automatic") {
        if (!window.confirm(orderType + " " + symbol + " Are you sure ? ")) {
            return;
        }
    }

    var ltpdata = { "exchange": "NSE", "tradingsymbol": symbol, "symboltoken": token, }
    AdminService.getLTP(ltpdata).then(res => {
        let ltpres = resolveResponse(res, 'noPop');
        var LtpData = ltpres && ltpres.data;
        console.log(symbol, " ltd data ", LtpData);
        let quantity = 0;
        if (LtpData && LtpData.ltp) {
            let perTradeExposureAmt = TradeConfig.totalCapital * TradeConfig.perTradeExposurePer / 100;
            quantity = Math.floor(perTradeExposureAmt / LtpData.ltp);
        }


        quantity = quantity > 0 ? 1 : 0;
        console.log(symbol, "  quantity can be order ", quantity);

        if (quantity) {
            const format1 = "YYYY-MM-DD HH:mm";
            var beginningTime = moment('9:15am', 'h:mma').format(format1);

            console.log("beginningTime", beginningTime);

            var time = moment.duration("54:10:00");  //21:10:00"
            var startdate = moment(new Date()).subtract(time);
            var data = {
                "exchange": "NSE",
                "symboltoken": token,
                "interval": "FIVE_MINUTE", //ONE_DAY FIVE_MINUTE 
                "fromdate": moment(startdate).format(format1),
                "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
            }

            AdminService.getHistoryData(data).then(res => {
                let histdata = resolveResponse(res, 'noPop');
                // console.log("candle history", histdata); 
                if (histdata && histdata.data && histdata.data.length) {

                    var candleData = histdata.data, clossest = 0, lowerest = 0, highestHigh = 0, lowestLow = 0, highestsum = 0;
                    candleData.reverse();
                    lowestLow = candleData[0][3];
                    highestHigh = candleData[0][2];
                    if (candleData && candleData.length > 0) {
                        for (let index = 0; index < 20; index++) {
                            if (candleData[index]) {
                                clossest += candleData[index][4]; //close  
                                lowerest += candleData[index][3];  //low
                                highestsum += candleData[index][2];  //low
                                if (candleData[index][2] > highestHigh) {
                                    console.log(index, highestHigh, candleData[index][2]);
                                    highestHigh = candleData[index][2];
                                }
                                if (candleData[index][3] <= lowestLow) {
                                    lowestLow = candleData[index][3];
                                }
                            }
                        }

                        let devideLen = candleData.length > 20 ? 20 : candleData.length;

                        var bbmiddleValue = clossest / devideLen;
                        var bblowerValue = lowerest / devideLen;
                        var bbhigerValue = highestsum / devideLen;

                        var stoploss = 0, stoplossPer = 0;

                        if (orderType == "BUY") {
                            stoploss = bblowerValue - (highestHigh - lowestLow) * 3 / 100;
                            stoploss = this.getMinPriceAllowTick(stoploss);
                            stoplossPer = (LtpData.ltp - stoploss) * 100 / LtpData.ltp;

                            console.log(symbol, orderType, " LTP ", LtpData.ltp);
                            console.log(symbol + "highestHigh:", highestHigh, "lowestLow", lowestLow, "stoploss after tick:", stoploss, "stoploss%", stoplossPer);
                            console.log(symbol + "  close avg middle ", bbmiddleValue, "lowerest avg", bblowerValue, "bbhigerValue", bbhigerValue);

                        }


                        if (orderType == "SELL") {
                            stoploss = bbhigerValue + (highestHigh - lowestLow) * 3 / 100;
                            stoploss = this.getMinPriceAllowTick(stoploss);
                            stoplossPer = (stoploss - LtpData.ltp) * 100 / LtpData.ltp;

                            console.log(symbol, orderType, " LTP ", LtpData.ltp);
                            console.log(symbol + "highestHigh:", highestHigh, "lowestLow", lowestLow, "stoploss after tick:", stoploss, "stoploss%", stoplossPer);
                            console.log(symbol + "  close avg middle ", bbmiddleValue, "lowerest avg", bblowerValue, "bbhigerValue", bbhigerValue);

                        }



                        var orderOption = {
                            transactiontype: orderType,
                            tradingsymbol: symbol,
                            symboltoken: token,
                            buyPrice: 0,
                            quantity: quantity,
                            stopLossPrice: stoploss
                        }
                        if (quantity) {

                            this.placeOrderMethod(orderOption);
                            this.setState({ [spinnerIndex]: false })

                        } else {
                            Notify.showError(symbol + " stoploss is > 1.5% Rejected");
                            console.log(symbol + " its not fullfilled");

                        }
                    }


                } else {
                    //localStorage.setItem('NseStock_' + symbol, "");
                    Notify.showError(symbol + " candle data emply");
                    console.log(symbol + " candle data emply");
                    this.setState({ [spinnerIndex]: true })
                }
            })

        }else{
            Notify.showError(quantity + "  quantity |  " + symbol + " " + orderType + " Rejected");
            this.setState({ [spinnerIndex]: false })
        }
    }).catch(function(error){
        this.setState({ [spinnerIndex]: true })
    })
    // await new Promise(r => setTimeout(r, 2000)); 
}