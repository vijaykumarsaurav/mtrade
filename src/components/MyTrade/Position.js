import React from 'react';
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AdminService from "../service/AdminService";
import Grid from '@material-ui/core/Grid';
import PostLoginNavBar from "../PostLoginNavbar";
import {resolveResponse} from "../../utils/ResponseHandler";
import Paper from '@material-ui/core/Paper';
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import * as moment from 'moment';
import OrderBook from './Orderbook';
import TradeConfig from './TradeConfig.json';

class Home extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            positionList : [],
            autoSearchList :[],
            InstrumentLTP : {},
            autoSearchTemp : [],
            symboltoken: "", 
            tradingsymbol : "" ,
            buyPrice : 0,
            quantity : 1,
            producttype : "INTRADAY",
        };
    }
    componentDidMount() {
        var beginningTime = moment('9:15am', 'h:mma');
        var endTime = moment('3:30pm', 'h:mma');
        const friday = 5; // for friday
        var currentTime = moment(new Date(), "h:mma");
        const today = moment().isoWeekday();
        //market hours
        if(today <= friday && currentTime.isBetween(beginningTime, endTime)){
            this.setState({positionInterval :  setInterval(() => {this.getPositionData(); }, 2002)}) 
          //  this.setState({bankNiftyInterval :  setInterval(() => {this.getLTP(); }, 1002)}) 
        }else{
            clearInterval(this.state.positionInterval);
            clearInterval(this.state.scaninterval); 
            clearInterval(this.state.bankNiftyInterval); 
        }
         //scans from chartink 
        // var scanendTime = moment('3:00pm', 'h:mma');
        // if(today <= friday && currentTime.isBetween(beginningTime, scanendTime)){
        //     this.setState({scaninterval :  setInterval(() => {this.getStockOnebyOne(); }, 1002)}) 
        // }else{
        //     clearInterval(this.state.scaninterval); 
        // }

        var scanendTime = moment('3:00pm', 'h:mma');
        if(today <= friday && currentTime.isBetween(beginningTime, scanendTime)){
            this.setState({scaninterval :  setInterval(() => {this.getNSETopStock(); }, 5000)}) 
            this.setState({scaninterval :  setInterval(() => {this.findTweezerTopPattern() }, 5000)}) 

        }else{
            clearInterval(this.state.scaninterval); 
        }

        // this.getPositionData();
        // this.getNSETopStock();


       // this.findTweezerTopPattern(); 


    //    setInterval(() => {
    //        this.getCandleHistoryAndStore(); 
    //    }, 1000 * 60 * 5);
       

       this.getCandleHistoryAndStore(); 
    }


    componentWillUnmount() {
        clearInterval(this.state.positionInterval);
        clearInterval(this.state.scaninterval);
        clearInterval(this.state.bankNiftyInterval); 
    }

    getCandleHistoryAndStore = async()=> {


       var watchList =   localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList'))

       const format1 = "YYYY-MM-DD HH:mm";
       var time = moment.duration("31:10:00");
       var startdate = moment(new Date()).subtract(time);
       

        for (let index = 0; index < watchList.length; index++) {
            const element = watchList[index];
            var data  = {
                "exchange": "NSE",
                "symboltoken": element.token,
                "interval": "FIVE_MINUTE", //ONE_DAY FIVE_MINUTE 
                "fromdate": moment(startdate).format(format1) , 
                "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
            }

            AdminService.getHistoryData(data).then(res => {
                let histdata = resolveResponse(res,'noPop' );
                console.log("candle history", histdata); 
                if(histdata && histdata.data && histdata.data.length){
                   
                    var candleData = histdata.data; 
                    candleData.reverse(); 
    
                    var data = {
                        data : candleData, 
                        token: element.token
                    }
                    AdminService.saveCandleHistory(data).then(storeRes=>{
                        console.log("storeRes",storeRes); 
                    }); 
                
                }else{
                    //localStorage.setItem('NseStock_' + symbol, "");
                    console.log(" candle data emply"); 
                }
            })
            await new Promise(r => setTimeout(r, 500));  
        }

    }

     findTweezerTopPattern = async() => {

        var watchList = localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')); 
       
        for (let index = 0; index < watchList.length; index++) {
            
            const format1 = "YYYY-MM-DD HH:mm";
            var time = moment.duration("20:10:00");
            var startdate = moment(new Date()).subtract(time);

             console.log("watchlist item",  watchList[index].symbol);
             var data  = {
                "exchange": "NSE",
                "symboltoken": watchList[index].token ,
                "interval": "FIVE_MINUTE", //ONE_DAY FIVE_MINUTE 
                "fromdate": moment(startdate).format(format1) , 
                "todate": moment(new Date()).format(format1)
            }
        
            AdminService.getHistoryData(data).then(res => {
                let histdata = resolveResponse(res,'noPop' );

                console.log("got candle data",  watchList[index].symbol);
                if(histdata && histdata.data.length > 0){

                    var candleHist = histdata.data.reverse(); 

                
                    var lastTrendCandleLow = candleHist[9][3]; 
                    var firstTrendCandleHigh = candleHist[2][2]; 

                    var firstCandle = {
                        open: candleHist[0][1],
                        high: candleHist[0][2],
                        low: candleHist[0][3],
                        close: candleHist[0][4]
                    }
                    
                    var secondCandle = {
                        open: candleHist[1][1],
                        high: candleHist[1][2],
                        low: candleHist[1][3],
                        close: candleHist[1][4]
                    }

                    var diffPer = (firstTrendCandleHigh - lastTrendCandleLow)*100/lastTrendCandleLow;
                    console.log("last 8th candle diff% ",  diffPer, "8th Low", lastTrendCandleLow,"3rd high", firstTrendCandleHigh);
                    //uptrend movement 1.5% 
                    if(diffPer >= 1.5){

                        console.log( 'more than 1.5% up', watchList[index].symbol);
                        //1st candle green & 2nd candle is red check
                        if(secondCandle.close > secondCandle.open && firstCandle.open < firstCandle.close){ 
                          // var candleWickHighDiff = (secondCandle.high - firstCandle.high)*100/secondCandle.high; 

                          console.log( 'making twisser top candlewise', watchList[index].symbol, new Date().toLocaleString());

                            var lowestOfBoth = secondCandle.low < firstCandle.low ? secondCandle.low : firstCandle.low;
                            var highestOfBoth = secondCandle.high < firstCandle.high ? secondCandle.high : firstCandle.high;
                            if(Math.round(secondCandle.close) ==  Math.round(firstCandle.open) || Math.round(secondCandle.open) ==  Math.round(firstCandle.close)){

                                console.log('making twisser top close=open || open=close', watchList[index].symbol, new Date().toLocaleString());

                            
                                highestOfBoth = highestOfBoth + (highestOfBoth*0.16/100); //SL calculation
                                var stopLossPrice = this.getMinPriceAllowTick(highestOfBoth); 
                                let perTradeExposureAmt =  TradeConfig.totalCapital * TradeConfig.perTradeExposurePer/100; 
                                let quantity = Math.floor(perTradeExposureAmt/lowestOfBoth); 

                                quantity = quantity>0 ? 1 : 0; 
                                var orderOption = {
                                    transactiontype: 'SELL',
                                    tradingsymbol: watchList[index].symbol,
                                    symboltoken:watchList[index].token,
                                    buyPrice : 0,
                                    quantity: quantity, 
                                    stopLossPrice: stopLossPrice,
                                    entryBelow : lowestOfBoth
                                }
                                if(quantity){
                                    localStorage.setItem('foundTweezerTop_'+watchList[index].token, JSON.stringify(orderOption)); 
                                }

                            //     var data  = {
                            //         "exchange":"NSE",
                            //         "tradingsymbol": watchList[index].symbol,
                            //         "symboltoken":watchList[index].token,
                            //     }
                            //     AdminService.getLTP(data).then(res => {
                            //          let data = resolveResponse(res, 'noPop');
                            //          var LtpData = data && data.data; 
                            //          if(LtpData && LtpData.ltp && LtpData.ltp  < lowestOfBoth){

                            //             console.log( 'pefect time to sell ', watchList[index].symbol);
                                        
                            //             highestOfBoth = highestOfBoth + (highestOfBoth*0.16/100); //SL calculation
                            //             var stopLossPrice = this.getMinPriceAllowTick(highestOfBoth); 
                            //             let perTradeExposureAmt =  TradeConfig.totalCapital * TradeConfig.perTradeExposurePer/100; 
                            //             let quantity = Math.floor(perTradeExposureAmt/LtpData.ltp); 
                            //             console.log( watchList[index].symbol + 'ltp '+ LtpData.ltp , "quantity",quantity,"stopLossPrice",stopLossPrice, "perTradeExposureAmt",perTradeExposureAmt ); 
                            //             var orderOption = {
                            //                   transactiontype: 'SELL',
                            //                   tradingsymbol: watchList[index].symbol,
                            //                   symboltoken:watchList[index].token,
                            //                   buyPrice : 0,
                            //                   quantity: quantity, 
                            //                   stopLossPrice: stopLossPrice
                            //               }
                          
                            //             if(quantity && stopLossPrice){
                            //              // this.placeOrderMethod(orderOption);   
                            //             }
                            //         }
                            //    })

                            }
                        }
                    }

                    
                    // for (let indexj = 0; indexj < 10; indexj++) {
                    //     console.log( watchList[index].symbol ," candle history ", candleHist[indexj][0], candleHist[indexj][1]); 
                        
                    //     var lastCandle = candleHist[indexj][9]; 
                    // }
                }
            });

            

            await new Promise(r => setTimeout(r, 500));   
        }

    }
    getStoplossFromOrderbook = (row) => {
       var oderbookData = localStorage.getItem('oderbookData'); 
       oderbookData =  JSON.parse(oderbookData);
       var stopLoss = 0; 
       var data = {}; 
       oderbookData.forEach(element => {
        if(element.status === "trigger pending" && element.symboltoken === row.symboltoken){
            data.stopLoss = element.triggerprice + "("+ ((element.triggerprice-row.buyavgprice)*100/row.buyavgprice).toFixed(2) + "%)"; 
            data.maxLossAmount = ((element.triggerprice-row.buyavgprice)* parseInt(row.netqty)).toFixed(2); 
        }
       });
       return data; 
    }
    getPositionData = async() => {
     //   document.getElementById('orderRefresh') && document.getElementById('orderRefresh').click(); 
        var maxPnL = 0, totalMaxPnL = 0; 
        AdminService.getPosition().then(res => {
            let data = resolveResponse(res, 'noPop');
             var positionList = data && data.data;
             if (positionList && positionList.length>0){
                this.setState({ positionList : positionList}); 
                 var todayProfitPnL=0, totalbuyvalue=0, totalsellvalue=0, totalQtyTraded=0, allbuyavgprice=0,allsellavgprice=0,totalPercentage=0;
                  positionList.forEach(element => {
                    var percentPnL =((parseFloat(element.sellavgprice)-parseFloat(element.buyavgprice))*100/parseFloat(element.buyavgprice)).toFixed(2); 
                    todayProfitPnL+= parseFloat( element.pnl); 
                    totalbuyvalue+=parseFloat( element.totalbuyvalue); 
                    totalsellvalue+= parseFloat(element.totalsellvalue) === 0 ? parseFloat(element.totalbuyvalue) : parseFloat(element.totalsellvalue); 
                    totalQtyTraded+=parseInt( element.buyqty); 
                    allbuyavgprice+=parseFloat(element.buyavgprice); 
                    allsellavgprice+=parseFloat(element.sellavgprice); 
                    element.percentPnL=percentPnL;
                    totalPercentage+= parseFloat( percentPnL); 
                    var slData  = this.getStoplossFromOrderbook(element) ; 
                    element.stopLoss = element.totalsellavgprice === "0.00" ? slData.stopLoss : element.totalsellavgprice + "("+ ((element.totalsellavgprice-element.totalbuyavgprice)*100/element.totalbuyavgprice).toFixed(2) + "%)"; 
                    element.stopLossAmount = slData.maxLossAmount; 
                    totalMaxPnL += parseFloat(slData.maxLossAmount) ? parseFloat(slData.maxLossAmount) : 0;                     
                }); 
                this.setState({ todayProfitPnL :todayProfitPnL.toFixed(2), totalbuyvalue: totalbuyvalue.toFixed(2), totalsellvalue : totalsellvalue.toFixed(2), totalQtyTraded: totalQtyTraded}); 
                this.setState({ allbuyavgprice :(allbuyavgprice/positionList.length).toFixed(2) ,allsellavgprice :(allsellavgprice/positionList.length).toFixed(2) , totalPercentage: totalPercentage    }); 
                this.setState({ totalBrokerCharges: ((totalbuyvalue + totalsellvalue) * 0.25/100).toFixed(2)});                

                this.setState({totalTornOver: (totalbuyvalue + totalsellvalue).toFixed(2), totalMaxPnL : totalMaxPnL.toFixed(2)}); 
            }
       })
    }
   
    getNSETopStock(){

        var totalDayLoss = TradeConfig.totalCapital*TradeConfig.dailyLossPer/100; 
        totalDayLoss = -Math.abs(totalDayLoss); 
        if(this.state.todayProfitPnL < totalDayLoss) {
            console.log("daily loss crossed",totalDayLoss); 
            clearInterval(this.state.scaninterval);
        }else{
               AdminService.getNSETopStock().then(res => {
                let data = resolveResponse(res, "noPop");
                if(data.status  && data.message === 'SUCCESS'){ 
                    var scandata =  data.result;   
                   // console.log("scandata",scandata); 
            
                    for (let index = 0; index < scandata.length; index++) {
                            var isFound = false; 
                            for (let j = 0; j < this.state.positionList.length; j++) {
                                 if(this.state.positionList[j].symbolname === scandata[index].symbolName){
                                    isFound  = true; 
                                 }
                            }
                           
                         //   console.log("index",index, "symbolName",scandata[index].symbolName);    
                            if (!isFound && !localStorage.getItem('NseStock_' + scandata[index].symbolName)){
                               
                                AdminService.autoCompleteSearch(scandata[index].symbolName).then(searchRes => {

                                    let searchResdata =  searchRes.data; 
                                    var found = searchResdata.filter(row => row.exch_seg  === "NSE" &&  row.lotsize === "1" && row.name === scandata[index].symbolName);                                
                                   
                                    if(found.length){
                                        console.log(found[0].symbol, "found",found);      
                                        localStorage.setItem('NseStock_' + scandata[index].symbolName, "orderdone");
                                        this.historyWiseOrderPlace(found[0].token, found[0].symbol,  scandata[index].symbolName);
                                    }
                               })
                             
                            }
                    }
                }
            })  
        }
        
    }

    checkAndPlaceSingleOrder = (stock)=>{
        AdminService.autoCompleteSearch(stock).then(res => {
            let data =  res.data; 
            var found = data.filter(row => row.exch_seg  === "NSE" &&  row.lotsize === "1");
             console.log("stockfound",found);  
            if(found && found.length){
                this.orderWithFlatstoploss(found[0].token,found[0].symbol); 
            }
       })
    }


    getStockOnebyOne(){

        var totalDayLoss = TradeConfig.totalCapital*TradeConfig.dailyLossPer/100; 
        totalDayLoss = -Math.abs(totalDayLoss); 
        if(this.state.todayProfitPnL < totalDayLoss) {
            console.log("daily loss crossed",totalDayLoss); 
            clearInterval(this.state.scaninterval);
        }else{
            console.log("still ok"); 
            AdminService.getAutoScanStock().then(res => {
                let data = resolveResponse(res, "noPop");
                if(data.status  && data.message === 'SUCCESS'){ 
                    var scandata =  data.result;   
                    if(scandata && scandata.length>0){
                        var lastSeachStock = scandata[scandata.length-1].symbolName;               
                        localStorage.setItem('scannedStocks',JSON.stringify(scandata)); 
                        var isFound = false; 
                        for (let index = 0; index < this.state.positionList.length; index++) {
                             if(this.state.positionList[index].symbolname === lastSeachStock){
                                isFound  = true; 
                             }
                        }
                        if (!isFound && !localStorage.getItem('scannedstock_' + lastSeachStock)){
                            console.log("found new", lastSeachStock)
                            var msg = new SpeechSynthesisUtterance();
                            msg.text = 'hey Vijay, '+lastSeachStock; 
                            window.speechSynthesis.speak(msg);
                            localStorage.setItem('scannedstock_' + lastSeachStock , "orderdone");
                            this.checkAndPlaceSingleOrder(lastSeachStock); 
                        }
                    }
                    
                }
            })  
        }
    }


    orderWithFlatstoploss = (token, symbol) => {
        var data  = {
            "exchange":"NSE",
            "tradingsymbol": symbol,
            "symboltoken": token,
        }
        AdminService.getLTP(data).then(res => {
            let data = resolveResponse(res, 'noPop');

             var LtpData = data && data.data; 
             var ltpPrice  = LtpData.ltp
             if(ltpPrice){ 
              
            //  var stopLossPrice = ltp - (ltp*0.7/100);
              var stopLossPrice = ltpPrice - (ltpPrice * TradeConfig.perTradeStopLossPer/100);
              stopLossPrice = this.getMinPriceAllowTick(stopLossPrice); 
              let perTradeExposureAmt =  TradeConfig.totalCapital * TradeConfig.perTradeExposurePer/100; 
              let quantity = Math.floor(perTradeExposureAmt/ltpPrice); 
              console.log(symbol + 'ltp '+ ltpPrice, "quantity",quantity,"stopLossPrice",stopLossPrice, "perTradeExposureAmt",perTradeExposureAmt ); 
              var orderOption = {
                    transactiontype: 'BUY',
                    tradingsymbol: symbol,
                    symboltoken:token,
                    buyPrice : 0,
                    quantity: quantity, 
                    stopLossPrice: stopLossPrice
                }

              if(quantity && stopLossPrice){
                this.placeOrderMethod(orderOption);   
              }
               
            }         

       }).catch((error)=>{
            console.log(symbol, "not found", 'error', error);
        })  
    }
  
    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value});
        var data  = e.target.value; 
        AdminService.autoCompleteSearch(data).then(res => {
            let data =  res.data; 
        //    console.log(data);       
            localStorage.setItem('autoSearchTemp',JSON.stringify(data)); 
            this.setState({ autoSearchList : data });
       })
    }

    getLTP =() => {
        var data  = {
            "exchange":"NSE",
            "tradingsymbol": "BANKNIFTY",
            "symboltoken":"26009",
        }
        AdminService.getLTP(data).then(res => {
            let data = resolveResponse(res, 'noPop');
             var LtpData = data && data.data; 
             //console.log(LtpData);
             if(LtpData && LtpData.ltp){
                 localStorage.setItem({'BankLtpltp': LtpData.ltp + '  '+ ((LtpData.ltp-LtpData.close)*100/LtpData.close).toFixed(2) +'%'});
              //  this.setState({ BankLtpltp : LtpData.ltp + '  '+ ((LtpData.ltp-LtpData.close)*100/LtpData.close).toFixed(2) +'%' });
             }
            
       })
    }


    getStopLossPrice = async(token, symbol) => {
        var data  = {
            "exchange":"NSE",
            "tradingsymbol": symbol,
            "symboltoken": token,
        }
      
        await AdminService.getLTP(data).then(res => {
            let data = resolveResponse(res, 'noPop');
             var LtpData = data && data.data; 
             if(LtpData &&  LtpData.ltp){
                var ltp = parseFloat(LtpData.ltp); 
                ltp  = ltp - (ltp*0.7/100);
                var slPrice = this.getMinPriceAllowTick(ltp); 

                this.setState({ stoploss : slPrice});
                return slPrice; 
             }
           
       })
    }
  
    placeOrderMethod = (orderOption) => { 
       
        var data = {
            "transactiontype":orderOption.transactiontype,//BUY OR SELL
            "tradingsymbol": orderOption.tradingsymbol,
            "symboltoken":orderOption.symboltoken,
            "quantity":orderOption.quantity,
            "ordertype": orderOption.buyPrice  === 0 ? "MARKET" : "LIMIT", 
            "price": orderOption.buyPrice,
            "producttype": "INTRADAY",//"DELIVERY",
            "duration":"DAY",
            "squareoff":"0",
            "stoploss":"0",
            "exchange":"NSE",
            "variety":"NORMAL"
        }
        console.log("place order option", data);
        AdminService.placeOrder(data).then(res => {
            let data = resolveResponse(res);
          //  console.log(data);   
            if(data.status  && data.message === 'SUCCESS'){
                this.setState({ orderid : data.data && data.data.orderid });
                if(orderOption.stopLossPrice){
                    this.placeSLMOrder(orderOption);
                }
            }
        })
    }

    historyWiseOrderPlace = (token, symbol, LockedSymbolName) => {

        var ltpdata  = {"exchange":"NSE","tradingsymbol": symbol,"symboltoken":token,}
        AdminService.getLTP(ltpdata).then(res => {
            let ltpres = resolveResponse(res, 'noPop');
                var LtpData = ltpres && ltpres.data; 
                console.log(symbol, " ltd data ", LtpData);
                let quantity =0; 
                if(LtpData && LtpData.ltp){
                    let perTradeExposureAmt =  TradeConfig.totalCapital * TradeConfig.perTradeExposurePer/100; 
                     quantity = Math.floor(perTradeExposureAmt/LtpData.ltp); 
                }
                
                quantity = quantity>0 ? 1 : 0; 
                console.log(symbol, "  quantity can be order ", quantity);
                if(quantity){
                    const format1 = "YYYY-MM-DD HH:mm";
                    var time = moment.duration("21:10:00");
                    var startdate = moment(new Date()).subtract(time);
                    var data  = {
                        "exchange": "NSE",
                        "symboltoken": token ,
                        "interval": "FIVE_MINUTE", //ONE_DAY FIVE_MINUTE 
                        "fromdate": moment(startdate).format(format1) , 
                        "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
                    }
                
                    AdminService.getHistoryData(data).then(res => {
                        let histdata = resolveResponse(res,'noPop' );
                        console.log("candle history", histdata); 
                        if(histdata && histdata.data && histdata.data.length){
                           
                            var candleData = histdata.data, clossest =0, lowerest=0, highestHigh = 0, lowestLow=0; 
                            candleData.reverse(); 

                            if(candleData && candleData.length>0){
                                for (let index = 0; index < 20; index++) {
                                    if(candleData[index]){
                                        clossest += candleData[index][4]; //close  
                                        lowerest += candleData[index][3];  //low
                                        if(candleData[index][4] > highestHigh ){
                                            highestHigh = candleData[index][4];  
                                        }
                                        if(lowestLow < candleData[index][3]){
                                            lowestLow = candleData[index][3];  
                                        }
                                    }
                                    
                                }
    
                                var bbmiddleValue = clossest/20; 
                                var bblowerValue =lowerest/20;  
                                
                                var stoploss = bblowerValue - (highestHigh - lowestLow)*3/100;  
                                stoploss = this.getMinPriceAllowTick(stoploss); 
    
                                var stoplossPer = (highestHigh - stoploss)*100/highestHigh; 
                                
                                // console.log(symbol,  " LTP ",LtpData.ltp ); 
                                // console.log(symbol + "highestHigh:",highestHigh,  "lowestLow", lowestLow, "stoploss after tick:", stoploss , "stoploss%", stoplossPer);
                                // console.log(symbol + "  close avg middle ", bbmiddleValue,  "lowerest avg", bblowerValue);
                            
                                var orderOption = {
                                    transactiontype: 'BUY',
                                    tradingsymbol: symbol,
                                    symboltoken:token,
                                    buyPrice : 0,
                                    quantity: quantity, 
                                    stopLossPrice: stoploss
                                }
                                if(LtpData && LtpData.ltp > highestHigh && stoplossPer <= 1.5){ 
                                this.placeOrderMethod(orderOption);
                                }else{
                                    localStorage.setItem('NseStock_' + LockedSymbolName, "");
                                    console.log(symbol + " its not fullfilled"); 
                                }
                            }

                           
                        }else{
                            //localStorage.setItem('NseStock_' + symbol, "");
                            console.log(symbol + " candle data emply"); 
                        }
                    })

                }
        })
       // await new Promise(r => setTimeout(r, 2000)); 
    }

    onSelectItem = (event, values) =>{
    
        var autoSearchTemp = JSON.parse( localStorage.getItem('autoSearchTemp')); 
        if(autoSearchTemp.length> 0){
            var fdata = '';       
             for (let index = 0; index < autoSearchTemp.length; index++) {
                console.log("fdata", autoSearchTemp[index].symbol); 
                if( autoSearchTemp[index].symbol === values){
                 fdata = autoSearchTemp[index];
                 break;
                }  
             }
           
             var list = localStorage.getItem('watchList');
             if(!list){
                var data = []; 
                data.push(fdata); 
                localStorage.setItem('watchList',  JSON.stringify(data)); 
             }else{
                list = JSON.parse( localStorage.getItem('watchList'));
                var found = list.filter(row => row.symbol  === values);
                if(found.length === 0){
                    list.push(fdata); 
                    localStorage.setItem('watchList',  JSON.stringify(list)); 
                }
               
             }
          
            setTimeout(() => {
                this.updateSocketWatch();
            }, 100);
            
        }
     
    }

    getAveragePrice =(orderId) => {

       var  oderbookData = localStorage.getItem('oderbookData');
       var averageprice = 0; 
        for (let index = 0; index < oderbookData.length; index++) {
           if(oderbookData[index].orderid ===  'orderId'){
            averageprice =oderbookData[index].averageprice 
            this.setState({ averageprice : averageprice });
            break;
           }
        } 
        return averageprice;
    }

    cancelOrderOfSame = (row) =>  {
       
        var orderData =  this.getOpenPeningOrderId(row.symboltoken);  
        var data = {
            "variety":orderData.variety,
            "orderid":orderData.orderId,
        }
        AdminService.cancelOrder(data).then(res => {
            let data = resolveResponse(res);
            if(data.status  && data.message === 'SUCCESS'){
                console.log("cancel order", data);   
               // this.setState({ orderid : data.data && data.data.orderid });
            }
        })
       
    }

    squareOff = (row) =>  {
       
        var data = {
            "variety":"NORMAL",
            "tradingsymbol": row.tradingsymbol,
            "symboltoken":row.symboltoken,
            "transactiontype":row.buyqty > 0 ? 'SELL' : "BUY", 
            "exchange": row.exchange, 
            "ordertype": "MARKET", 
            "producttype": row.producttype, //"INTRADAY",//"DELIVERY",
            "duration":"DAY",
            "price": 0,
            "squareoff":"0",
            "stoploss":"0",
            "quantity": row.buyqty,
        }

        // if(window.confirm("Squire Off!!! Sure?")){
            
        // }
        AdminService.placeOrder(data).then(res => {
            let data = resolveResponse(res);
            console.log("squireoff", data);   
            if(data.status  && data.message === 'SUCCESS'){
                this.setState({ orderid : data.data && data.data.orderid });
                this.cancelOrderOfSame(row); 
                document.getElementById('orderRefresh') && document.getElementById('orderRefresh').click(); 

            }
        })
       
    }
    updateOrderList = () => {
        AdminService.retrieveOrderBook()
        .then((res) => {
            let data = resolveResponse(res);
            if(data && data.data){
                var orderlist = data.data; 
                  orderlist.sort(function(a,b){
                    return new Date(b.updatetime) - new Date(a.updatetime);
                  });
                localStorage.setItem('oderbookData', JSON.stringify( orderlist ));                       
            }
        });
    }
    
    placeSLMOrder = (slmOption) => {
        
        var data = {
            "triggerprice":slmOption.stopLossPrice,
            "tradingsymbol": slmOption.tradingsymbol,
            "symboltoken": slmOption.symboltoken,
            "quantity": slmOption.quantity,
            "transactiontype": slmOption.transactiontype === "BUY" ? "SELL" : "BUY", 
            "exchange": 'NSE', 
            "producttype": "INTRADAY",//"DELIVERY",
            "duration":"DAY",
            "price": 0,
            "squareoff":"0",
            "stoploss":"0",
            "ordertype":"STOPLOSS_MARKET", //STOPLOSS_MARKET STOPLOSS_LIMIT
            "variety" : "STOPLOSS"
        }
        console.log("SLM option data", data); 
        AdminService.placeOrder(data).then(res => {
            let data = resolveResponse(res);
          //  console.log(data);   
            if(data.status  && data.message === 'SUCCESS'){
                this.setState({ orderid : data.data && data.data.orderid });
               // this.updateOrderList(); 
               var msg = new SpeechSynthesisUtterance();
               msg.text = 'hey Vijay, '+ slmOption.tradingsymbol; 
               window.speechSynthesis.speak(msg);

               document.getElementById('orderRefresh') && document.getElementById('orderRefresh').click(); 
            }
        })
    }

    getOpenPeningOrderId =(symboltoken) => {

        var oderbookData = JSON.parse(localStorage.getItem('oderbookData'));
        var data = {}; 
         for (let index = 0; index < oderbookData.length; index++) {
            if(oderbookData[index].symboltoken === symboltoken && oderbookData[index].transactiontype ===  "SELL"){
                data.orderId = oderbookData[index].orderid  
                data.variety = oderbookData[index].variety  
                break;
            }
         } 
         return data;
     }
    modifyOrderMethod = (row, minPrice) => {
        //console.log(this.state.triggerprice);

        var orderData = this.getOpenPeningOrderId(row.symboltoken); 
        console.log("orderid", this.state.orderData);

        var data = {
            "variety" : "STOPLOSS",
            "orderid": orderData.orderId,
            "ordertype": "STOPLOSS_MARKET",   // "STOPLOSS_LIMIT",
            "producttype":  row.producttype, //"DELIVERY",
            "duration": "DAY",
            "price":  0,
            "triggerprice": parseFloat( minPrice ),
            "quantity":row.buyqty,
            "tradingsymbol": row.tradingsymbol,
            "symboltoken": row.symboltoken,
            "exchange": row.exchange
        }
        AdminService.modifyOrder(data).then(res => {
            let data = resolveResponse(res, "noPop");

            var msg = new SpeechSynthesisUtterance();
          
          
            if(data.status  && data.message ===  'SUCCESS'){
              //  this.setState({ ['lastTriggerprice_' + row.symboltoken]:  parseFloat(minPrice)})
              msg.text = row.tradingsymbol +' modified '+data.message
              window.speechSynthesis.speak(msg);
              localStorage.setItem('firstTimeModify'+row.symboltoken, 'No');
                localStorage.setItem('lastTriggerprice_' + row.symboltoken, parseFloat(minPrice));
            }
        })
    }
    getMinPriceAllowTick = (minPrice) => {
        minPrice =  minPrice.toFixed(2); 
       // console.log("minPrice",minPrice); 
        var wholenumber = parseInt( minPrice.split('.')[0]);
      //  console.log("wholenumber",wholenumber); 
        var decimal =  parseFloat( minPrice.split('.')[1]);
       // console.log("decimal",decimal); 
        var tickedecimal =  decimal-decimal%5; 
        minPrice = parseFloat( wholenumber + '.'+tickedecimal); 
     //   console.log("minPricexxxx",minPrice); 
        return minPrice; 
    }

    getPercentage = (avgPrice,  ltp , row) =>  {

        avgPrice =  parseFloat(avgPrice); 
        var percentChange = ((ltp - avgPrice)*100/avgPrice).toFixed(2); 

      //  console.log(row.symbolname,  'chng %',percentChange);
         if(!localStorage.getItem('firstTimeModify'+row.symboltoken) && percentChange > 0.7){
                var minPrice =  avgPrice + (avgPrice * 0.1/100);
                minPrice = this.getMinPriceAllowTick(minPrice); 
                this.modifyOrderMethod(row, minPrice);
         }else{
           //var lastTriggerprice =  this.state['lastTriggerprice_'+row.symboltoken]; 
           var lastTriggerprice =  parseFloat(localStorage.getItem('lastTriggerprice_'+row.symboltoken)); 
           var perchngfromTriggerPrice = ((ltp - lastTriggerprice)*100/lastTriggerprice).toFixed(2);   
        //   console.log(row.symbolname, 'chng form Trigger Price',perchngfromTriggerPrice);
           if(perchngfromTriggerPrice > 0.7){
                minPrice =  lastTriggerprice + (lastTriggerprice * 0.25/100);
                minPrice = this.getMinPriceAllowTick(minPrice); 
                this.modifyOrderMethod(row, minPrice);
           }

         }

        let sqrOffbeginningTime = moment('3:10pm', 'h:mma');
        let sqrOffendTime = moment('3:14pm', 'h:mma');
        let sqrOffcurrentTime = moment(new Date(), "h:mma");
        if(sqrOffcurrentTime.isBetween(sqrOffbeginningTime, sqrOffendTime)){

            if(!localStorage.getItem('squiredOff'+row.symboltoken)){
                localStorage.setItem('squiredOff'+row.symboltoken, 'yes');
                this.squareOff(row); 
                console.log("Sqr off called for",row.symbolname);  
            }
            

        }

        return percentChange;
    }


    render() {
      

        return(
            <React.Fragment>
                 <PostLoginNavBar/>
                     <br />
                
                    <Grid style={{padding:'5px'}} justify="space-between" direction="row" container>
                        <Grid item >
                            <Typography variant="h6" >
                            <b>Positions ({this.state.positionList && this.state.positionList.length}) </b>
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3} >
                          <Typography component="h3">
                            <b>Date: {new Date().toLocaleString()} </b>
                            </Typography> 
                        </Grid>

                        
                        <Grid item  >
                          <Typography component="h3">
                            <b>Total Turnover {this.state.totalTornOver} </b>
                            </Typography> 
                        </Grid>
                        
                       
                        <Grid item >
                          <Typography component="h3"  >
                            <b> Charges</b> <b style={{color:"#00cbcb"}}>-{this.state.totalBrokerCharges} </b>
                            </Typography> 
                        </Grid>
                        
                        <Grid item  >
                          <Typography component="h3"   >
                            <b>  P/L </b> <b style={{color:this.state.todayProfitPnL>0?"darkmagenta":"#00cbcb"}}>{this.state.todayProfitPnL} </b>
                            </Typography> 
                        </Grid>

                        <Grid itemType>
                          <Typography component="h3" >
                            <b> Net P/L </b> <b style={{color:(this.state.todayProfitPnL - this.state.totalBrokerCharges)>0?"darkmagenta":"#00cbcb"}}>{this.state.totalBrokerCharges ? (this.state.todayProfitPnL - this.state.totalBrokerCharges).toFixed(2) : ""} </b>
                            </Typography> 
                        </Grid>
                        
                        <Grid item  >
                            <Button  type="number" variant="contained" style={{float:"right"}} onClick={() => this.getPositionData()}>Refresh</Button>    
                        </Grid>
                </Grid>
               
                 <Grid style={{padding:'5px'}}  spacing={1}  direction="row" alignItems="center" container>
                                

                    <Grid item xs={12} sm={12}> 
                    <Paper style={{overflow:"auto", padding:'5px'}} >
                                 
                    <Table  size="small"   aria-label="sticky table" >
                        <TableHead  style={{whiteSpace: "nowrap", backgroundColor: "lightgray" }} variant="head">
                            <TableRow key="1"  variant="head" style={{fontWeight: 'bold'}}>

                                {/* <TableCell className="TableHeadFormat" align="left">Instrument</TableCell> */}
                                <TableCell style={{paddingLeft:"3px"}} className="TableHeadFormat" align="left">&nbsp;Trading symbol</TableCell>
                                {/* <TableCell className="TableHeadFormat" align="left">Trading Token</TableCell> */}
                                {/* <TableCell className="TableHeadFormat" align="left">Product type</TableCell> */}
  
                                <TableCell  className="TableHeadFormat" align="left">Average Buy Price</TableCell>
                                {/* <TableCell  className="TableHeadFormat" align="left">Total buy value</TableCell> */}

                                <TableCell  className="TableHeadFormat" align="left">Average Sell Price</TableCell>
                                {/* <TableCell  className="TableHeadFormat" align="left">Total Sell value</TableCell> */}
                                <TableCell className="TableHeadFormat" align="left">Bought Qty</TableCell>
                                
                                <TableCell  className="TableHeadFormat" align="left">Net Qty</TableCell>

                                <TableCell  className="TableHeadFormat" align="left">Trailing SL</TableCell>
                                <TableCell  className="TableHeadFormat" align="left">Max Locked P/L</TableCell>

                                
                                <TableCell className="TableHeadFormat" align="left">P/L </TableCell>
                                <TableCell className="TableHeadFormat" align="left">Chng % </TableCell>
                                <TableCell  className="TableHeadFormat" align="left">LTP</TableCell>
        
    

                                <TableCell className="TableHeadFormat" align="left">Action</TableCell>
                           
                            </TableRow>
                        </TableHead>
                        <TableBody style={{width:"",whiteSpace: "nowrap"}}>

                            {this.state.positionList ? this.state.positionList.map(row => (
                                <TableRow hover key={row.symboltoken} style={{background : row.netqty !== '0'? 'gray': ""}} >

                                    <TableCell style={{paddingLeft:"3px"}} align="left">&nbsp; <a rel="noopener noreferrer" target="_blank" href={"https://chartink.com/stocks/"+row.tradingsymbol.split('-')[0]+".html"}>{row.tradingsymbol.split('-')[0]}</a> </TableCell>
                                    {/* <TableCell align="left">{row.symboltoken}</TableCell> */}
                                    {/* <TableCell align="left">{row.producttype}</TableCell> */}
                                 
                                    <TableCell align="left">{row.totalbuyavgprice}</TableCell>
                                    {/* <TableCell align="left">{row.totalbuyvalue}</TableCell> */}

                                    <TableCell align="left">{row.totalsellavgprice}</TableCell>
                                    <TableCell align="left">{row.buyqty}</TableCell>
                                    <TableCell align="left">{row.netqty}</TableCell>
                                    {/* <TableCell align="left">{row.totalsellvalue}</TableCell> */}
                                    <TableCell align="left"> {row.stopLoss}</TableCell> 
                                    <TableCell align="left"> {row.stopLossAmount}</TableCell> 

                                    
                                    {/* {(localStorage.getItem('lastTriggerprice_'+row.symboltoken))} */}
                                    <TableCell align="left" style={{color: parseFloat( row.pnl ) >0 ?  'darkmagenta' : '#00cbcb'}}><b>{row.pnl}</b></TableCell>
                                    <TableCell align="left">
                                        { row.netqty !== '0' ? this.getPercentage(row.totalbuyavgprice, row.ltp, row) : ""} 
                                        {new Date().getHours() >= 15 && new Date().getMinutes() > 30 ? row.percentPnL : ""}
                                      </TableCell> 
                                    <TableCell align="left">{row.ltp}</TableCell>
                                  
                                    <TableCell align="left">
                                        {row.netqty !== "0" ? <Button size={'small'}  type="number" variant="contained" color="Secondary"  onClick={() => this.squareOff(row)}>Square Off</Button>  : ""}  
                                    </TableCell>

                                </TableRow>
                            )):''}

                                <TableRow   variant="head" style={{fontWeight: 'bold', backgroundColor: "lightgray"}}>

                                {/* <TableCell className="TableHeadFormat" align="left">Instrument</TableCell> */}
                                {/* <TableCell className="TableHeadFormat" align="left"></TableCell> */}
                                {/* <TableCell className="TableHeadFormat" align="left"></TableCell> */}
                                <TableCell className="TableHeadFormat" align="left">&nbsp;Total</TableCell>
                                <TableCell  className="TableHeadFormat" align="left">{this.state.allbuyavgprice}</TableCell>
                                {/* <TableCell  className="TableHeadFormat" align="left">{this.state.totalbuyvalue}</TableCell> */}


                                <TableCell  className="TableHeadFormat" align="left">{ this.state.allsellavgprice}</TableCell>
          
                                <TableCell  className="TableHeadFormat" align="left">{this.state.totalQtyTraded}</TableCell>
                                <TableCell  className="TableHeadFormat" align="left"></TableCell>
                                                     {/* <TableCell  className="TableHeadFormat" align="left">{this.state.totalsellvalue}</TableCell> */}

                                <TableCell  className="TableHeadFormat" align="left"></TableCell>
                                <TableCell  className="TableHeadFormat" align="left">{this.state.totalMaxPnL}</TableCell>
                                
                                <TableCell className="TableHeadFormat" align="left" style={{color: parseFloat( this.state.todayProfitPnL ) > 0 ?  'darkmagenta' : '#00cbcb'}}>{this.state.todayProfitPnL} </TableCell>
 
                                <TableCell className="TableHeadFormat" align="left">
                                    
                                {new Date().getHours() >= 15 && new Date().getMinutes() > 30 ? this.state.totalPercentage && this.state.totalPercentage.toFixed(2) : ""}
                    
                                </TableCell>
                                <TableCell  className="TableHeadFormat" align="left"></TableCell>

                                <TableCell  className="TableHeadFormat" align="left"></TableCell>

                                </TableRow>


                        </TableBody>
                    </Table>

                    </Paper>


                    </Grid>

                  

                        <Grid item xs={12} sm={12} >
                             <OrderBook/>
                        </Grid>
                               

                    </Grid>
            
               
            </React.Fragment>
        )


    }


}


// const styles ={
//     footerButton: {
//         position: 'fixed',
//     }
// };

export default Home;