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
            ifNotBought : true,
            autoSearchTemp : [],
            symboltoken: "", 
            tradingsymbol : "" ,
            buyPrice : 0,
            quantity : 1,
            producttype : "INTRADAY",
            symbolList : JSON.parse(localStorage.getItem('watchList'))
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
            this.setState({bankNiftyInterval :  setInterval(() => {this.getLTP(); }, 1002)}) 
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

        // var scanendTime = moment('3:00pm', 'h:mma');
        // if(today <= friday && currentTime.isBetween(beginningTime, scanendTime)){
        //     this.setState({scaninterval :  setInterval(() => {this.getNSETopStock(); }, 1002)}) 
        // }else{
        //     clearInterval(this.state.scaninterval); 
        // }

        this.getPositionData();
        this.getNSETopStock();

       
    }
    componentWillUnmount() {
        clearInterval(this.state.positionInterval);
        clearInterval(this.state.scaninterval);
        clearInterval(this.state.bankNiftyInterval);
        
    }
    getPositionData = async() => {
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
                    totalsellvalue+=parseFloat( element.totalsellvalue); 
                    totalQtyTraded+=parseInt( element.buyqty); 
                    allbuyavgprice+=parseFloat(element.buyavgprice); 
                    allsellavgprice+=parseFloat(element.sellavgprice); 
                    element.percentPnL=percentPnL;
                    totalPercentage+= parseFloat( percentPnL); 
                }); 
                this.setState({ todayProfitPnL :todayProfitPnL.toFixed(2), totalbuyvalue: totalbuyvalue.toFixed(2), totalsellvalue : totalsellvalue.toFixed(2), totalQtyTraded: totalQtyTraded}); 
                this.setState({ allbuyavgprice :(allbuyavgprice/positionList.length).toFixed(2) ,allsellavgprice :(allsellavgprice/positionList.length).toFixed(2) , totalPercentage: totalPercentage    }); 
                this.setState({ totalBrokerCharges: ((totalbuyvalue + totalsellvalue) * 0.25/100).toFixed(2)}); 

            }
       })
    }
    getNSETopStock(){

        var totalDayLoss = TradeConfig.totalCapital*TradeConfig.dailyLossPer/100; 
        totalDayLoss = -Math.abs(totalDayLoss); 
        if(this.state.todayProfitPnL < totalDayLoss) {
            console.log("daily loss crossed"); 
            clearInterval(this.state.scaninterval);
        }else{
            console.log("still ok"); 
            AdminService.getNSETopStock().then(res => {
                let data = resolveResponse(res, "noPop");
                if(data.status  && data.message === 'SUCCESS'){ 
                    var scandata =  data.result;   
                    for (let index = 0; index < scandata.length; index++) {

                        var symbol = scandata[index].symbolName;               
                            var isFound = false; 
                            for (let j = 0; j < this.state.positionList.length; j++) {
                                 if(this.state.positionList[j].symbolname === symbol){
                                    isFound  = true; 
                                 }
                            }
                            if (!isFound && !localStorage.getItem('scannedstock_' + symbol)){
                                console.log("found new ", symbol)
                                var msg = new SpeechSynthesisUtterance();
                                msg.text = 'hey Vijay, '+symbol; 
                                window.speechSynthesis.speak(msg);
                                localStorage.setItem('scannedstock_' + symbol , "orderdone");
                                this.checkAndPlaceOrderMultipleOrder(symbol); 
                            }
                    }
                }
            })  
        }
    }

    checkAndPlaceOrderMultipleOrder = (stock)=>{
        AdminService.autoCompleteSearch(stock).then(res => {
            let data =  res.data; 
            var found = data.filter(row => row.exch_seg  === "NSE" &&  row.lotsize === "1");
            console.log("stockfound",found);  
            this.getHistory(found[0].token, found[0].symbol);
       })
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

    orderWithCandleHistory = (token, symbol) => {
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


    getStockOnebyOne(){

        var totalDayLoss = TradeConfig.totalCapital*TradeConfig.dailyLossPer/100; 
        totalDayLoss = -Math.abs(totalDayLoss); 
        if(this.state.todayProfitPnL < totalDayLoss) {
            console.log("daily loss crossed"); 
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
             console.log(LtpData);
             if(LtpData && LtpData.ltp){
                this.setState({ BankLtpltp : LtpData.ltp });
             }
            
       })
    }

    compareLTPandOrder =(token,symbol, clossest, lowerest)=> {
        var data  = {
            "exchange":"NSE",
            "tradingsymbol": symbol,
            "symboltoken":token,
        }
        AdminService.getLTP(data).then(res => {
            let data = resolveResponse(res, 'noPop');
             var LtpData = data && data.data; 
             console.log("after candle ltd", LtpData);
             

            
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
                localStorage.setItem('ifNotBought' ,  'false')
                this.setState({ orderid : data.data && data.data.orderid });
                if(orderOption.stopLossPrice){
                    this.placeSLMOrder(orderOption);
                }
            }
        })
    }



    getHistory = (token, symbol) => {
        const format1 = "YYYY-MM-DD HH:mm";

        var time = moment.duration("09:10:00");
        var startdate = moment(new Date()).subtract(time);

        var data  = {
            "exchange": "NSE",
            "symboltoken": token ,
            "interval": "FIVE_MINUTE", //ONE_DAY FIVE_MINUTE 
            "fromdate": moment(startdate).format(format1) , 
            "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
       }
       
        AdminService.getHistoryData(data).then(res => {
             let data = resolveResponse(res,'noPop' );
              console.log(data); 
              if(data && data.data){

                var candleData = data.data, clossest =0, lowerest=0; 
                for (let index = 0; index < candleData.length; index++) {
                    const element = candleData[index];
                    console.log("candleData close",candleData[index][4]);
                    console.log("candleData low",candleData[index][3]);
                    clossest += candleData[index][4];  
                    // if(candleData[index][4] > clossest ){
                    //     clossest += candleData[index][4];  
                    // }
                    lowerest += candleData[index][3];  
                    // if(candleData[index][3] ){
                    //     lowerest += candleData[index][3];  
                    // }
                }

                this.compareLTPandOrder(token,symbol, clossest, lowerest); 


                console.log("bbmiddle",clossest/candleData.length,  "lowerest", lowerest/candleData.length);

              }
        })
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
          
             this.setState({ symbolList : JSON.parse(localStorage.getItem('watchList')), search : "" });
            setTimeout(() => {
                this.updateSocketWatch();
            }, 100);
            
        }
     
    }

    deleteItemWatchlist = (symbol) => {
        var list = JSON.parse( localStorage.getItem('watchList'));
        var index = list.findIndex(data => data.symbol === symbol)
        list.splice(index,1);
        localStorage.setItem('watchList',  JSON.stringify(list)); 
        this.setState({ symbolList : list });
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
                localStorage.setItem('ifNotBought' ,  'false')
                this.setState({ orderid : data.data && data.data.orderid });
               // this.updateOrderList(); 
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

        console.log(row.symbolname,  'chng %',percentChange);
         if(!localStorage.getItem('firstTimeModify'+row.symboltoken) && percentChange > 0.5){
                var minPrice =  avgPrice + (avgPrice * 0.1/100);
                minPrice = this.getMinPriceAllowTick(minPrice); 
                this.modifyOrderMethod(row, minPrice);
         }else{
           //var lastTriggerprice =  this.state['lastTriggerprice_'+row.symboltoken]; 
           var lastTriggerprice =  parseFloat(localStorage.getItem('lastTriggerprice_'+row.symboltoken)); 
           var perchngfromTriggerPrice = ((ltp - lastTriggerprice)*100/lastTriggerprice).toFixed(2);   
           console.log(row.symbolname, 'chng form Trigger Price',perchngfromTriggerPrice);
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
                
                    <Grid direction="row" alignItems="center" container>
                        <Grid item xs={12} sm={7} >
                            <Typography  variant="h6" color="primary" gutterBottom>
                         &nbsp;   Positions ({this.state.positionList && this.state.positionList.length})
                         &nbsp;    Bank Nify: <b>{this.state.BankLtpltp}  </b>
                            </Typography>
                         
                        </Grid>
                       

                        
                        <Grid item xs={12} sm={2} >
                          <Typography component="h3"  style={{color:"red"}} >
                            <b> Charges -{this.state.totalBrokerCharges} </b>
                            </Typography> 
                        </Grid>
                        
                        <Grid item xs={12} sm={1} >
                          <Typography component="h3"  style={{color:this.state.todayProfitPnL>0?"red":"green"}} >
                            <b>  P/L {this.state.todayProfitPnL} </b>
                            </Typography> 
                        </Grid>

                        <Grid item xs={12} sm={1} >
                          <Typography component="h3"  style={{color:"red"}} >
                            <b> Net P/L {this.state.totalBrokerCharges ? (this.state.todayProfitPnL - this.state.totalBrokerCharges) : ""} </b>
                            </Typography> 
                        </Grid>
                        
                        <Grid item xs={12} sm={1} >
                        
                            <Button  type="number" variant="contained" style={{float:"right"}} onClick={() => this.getPositionData()}>Refresh</Button>    

                        </Grid>
                </Grid>
               
                 <Grid spacing={1}  direction="row" alignItems="center" container>
                                

                    <Grid item xs={12} sm={12}> 
                    <Paper style={{padding:"10px", overflow:"auto"}} >
                                 
                    <Table  size="small"   aria-label="sticky table" >
                        <TableHead  style={{whiteSpace: "nowrap", backgroundColor: "lightgray" }} variant="head">
                            <TableRow   variant="head" style={{fontWeight: 'bold'}}>

                                {/* <TableCell className="TableHeadFormat" align="left">Instrument</TableCell> */}
                                <TableCell style={{paddingLeft:"3px"}} className="TableHeadFormat" align="left">Trading symbol</TableCell>
                                {/* <TableCell className="TableHeadFormat" align="left">Trading Token</TableCell> */}
                                {/* <TableCell className="TableHeadFormat" align="left">Product type</TableCell> */}
                                <TableCell className="TableHeadFormat" align="left">Bought Qty</TableCell>
                                
                                <TableCell  className="TableHeadFormat" align="left">Net Qty</TableCell>
                                <TableCell  className="TableHeadFormat" align="left">Average Buy Price</TableCell>
                                <TableCell  className="TableHeadFormat" align="left">Total buy value</TableCell>

                                <TableCell  className="TableHeadFormat" align="left">Average Sell Price</TableCell>
                                <TableCell  className="TableHeadFormat" align="left">Total Sell value</TableCell>
                               
                                <TableCell  className="TableHeadFormat" align="left">Last Modify Price</TableCell>
                                <TableCell  className="TableHeadFormat" align="left">LTP</TableCell>
                                <TableCell className="TableHeadFormat" align="left">P/L </TableCell>
                                <TableCell className="TableHeadFormat" align="left">Chng % </TableCell>

                                <TableCell className="TableHeadFormat" align="left">Action </TableCell>
                           
                            </TableRow>
                        </TableHead>
                        <TableBody style={{width:"",whiteSpace: "nowrap"}}>

                            {this.state.positionList ? this.state.positionList.map(row => (
                                <TableRow hover key={row.productId} style={{background : row.netqty !== '0'? 'gray': ""}} >

                                    <TableCell style={{paddingLeft:"3px"}} align="left"><a target="_blank" href={"https://chartink.com/stocks/"+row.tradingsymbol.split('-')[0]+".html"}> {row.tradingsymbol.split('-')[0]}</a> </TableCell>
                                    {/* <TableCell align="left">{row.symboltoken}</TableCell> */}
                                    {/* <TableCell align="left">{row.producttype}</TableCell> */}
                                    <TableCell align="left">{row.buyqty}</TableCell>
                                    <TableCell align="left">{row.netqty}</TableCell>
                                    <TableCell align="left">{row.totalbuyavgprice}</TableCell>
                                    <TableCell align="left">{row.totalbuyvalue}</TableCell>

                                    <TableCell align="left">{row.totalsellavgprice}</TableCell>
                                    <TableCell align="left">{row.totalsellvalue}</TableCell>
                                    <TableCell align="left">{(localStorage.getItem('lastTriggerprice_'+row.symboltoken))}</TableCell>
                                    <TableCell align="left">{row.ltp}</TableCell>
                                    <TableCell align="left"><b>{row.pnl}</b></TableCell>
                                    <TableCell align="left">
                                        { row.netqty != 0 ? this.getPercentage(row.totalbuyavgprice, row.ltp, row) : ""} 
                                        {new Date().getHours() >= 15 && new Date().getMinutes() > 30 ? row.percentPnL : ""}
                                      </TableCell> 
                                   
                                     
                                    <TableCell align="left">
                                        {row.netqty != 0 ? <Button size={'small'}  type="number" variant="contained" color="Secondary"  onClick={() => this.squareOff(row)}>Square Off</Button>  : ""}  
                                    </TableCell>

                                </TableRow>
                            )):''}

                                <TableRow   variant="head" style={{fontWeight: 'bold', backgroundColor: "lightgray"}}>

                                {/* <TableCell className="TableHeadFormat" align="left">Instrument</TableCell> */}
                                {/* <TableCell className="TableHeadFormat" align="left"></TableCell> */}
                                {/* <TableCell className="TableHeadFormat" align="left"></TableCell> */}
                                <TableCell className="TableHeadFormat" align="left">Total</TableCell>
                                <TableCell  className="TableHeadFormat" align="left">{this.state.totalQtyTraded}</TableCell>
                                <TableCell  className="TableHeadFormat" align="left"></TableCell>
                                <TableCell  className="TableHeadFormat" align="left">{this.state.allbuyavgprice}</TableCell>
                                <TableCell  className="TableHeadFormat" align="left">{this.state.totalbuyvalue}</TableCell>


                                <TableCell  className="TableHeadFormat" align="left">{ this.state.allsellavgprice}</TableCell>
                                <TableCell  className="TableHeadFormat" align="left">{this.state.totalsellvalue}</TableCell>

                                <TableCell  className="TableHeadFormat" align="left"></TableCell>
                                <TableCell  className="TableHeadFormat" align="left"></TableCell>
                                <TableCell className="TableHeadFormat" align="left">{this.state.todayProfitPnL} </TableCell>
                                <TableCell className="TableHeadFormat" align="left">
                                    
                                {new Date().getHours() >= 15 && new Date().getMinutes() > 30 ? this.state.totalPercentage && this.state.totalPercentage.toFixed(2) : ""}
                                     
                                </TableCell>
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