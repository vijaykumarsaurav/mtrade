import React from 'react';
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import AdminService from "../service/AdminService";
import Grid from '@material-ui/core/Grid';
import PostLoginNavBar from "../PostLoginNavbar";
import {resolveResponse} from "../../utils/ResponseHandler";
import MaterialUIDateTimePicker from '../../utils/MaterialUIDateTimePicker';
import Paper from '@material-ui/core/Paper';
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import * as moment from 'moment';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Notify from "../../utils/Notify";

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Spinner from "react-spinner-material";

import { w3cwebsocket } from 'websocket'; 
import pako from 'pako';
import DeleteIcon from '@material-ui/icons/Delete';


import Position from './Position'; 

import Tab from './Tab'

const wsClint =  new w3cwebsocket('wss://omnefeeds.angelbroking.com/NestHtml5Mobile/socket/stream'); 

class Home extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            sumPercentage:0,
            autoSearchList :[],
            isDasable:false,
            isError:false,
            InstrumentLTP : {},
            ifNotBought : true,
            autoSearchTemp : [],
            backTestResult : [],
            backTestFlag : true,
            patternType :"NR4",
            symboltoken: "", 
            tradingsymbol : "" ,
            buyPrice : 0,
            quantity : 1,
            producttype : "INTRADAY",
            symbolList : localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')) || [],
            selectedWatchlist : 'NIFTY 50'
        
        };
        this.myCallback = this.myCallback.bind(this);
        this.updateSocketWatch = this.updateSocketWatch.bind(this);

        
    }
    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value});
        var data  = e.target.value; 
        AdminService.autoCompleteSearch(data).then(res => {
            let data =  res.data; 
            console.log(data);       
            localStorage.setItem('autoSearchTemp',JSON.stringify(data)); 
            this.setState({ autoSearchList : data });
       })

    }
    onChangePattern = (e) => {
        this.setState({ [e.target.name]: e.target.value});
    }
    onChangeWatchlist = (e) => {
        this.setState({ [e.target.name]: e.target.value});
        var staticData = this.state.staticData; 
        this.setState({symbolList : staticData[e.target.value]});
    }

    myCallback = (date, fromDate) => {
        if (fromDate === "START_DATE") {
          this.setState({ startDate: date  });
        } else if (fromDate === "END_DATE") {
          this.setState({ endDate: date  });
        }
      };
    getLTP =() => {
        var data  = {
            "exchange":"NSE",
            "tradingsymbol":  this.state.tradingsymbol,
            "symboltoken":this.state.symboltoken,
        }
        AdminService.getLTP(data).then(res => {
            let data = resolveResponse(res, 'noPop');
             var LtpData = data && data.data; 
             this.setState({ InstrumentLTP : LtpData});

            //  if(!localStorage.getItem('ifNotBought') && LtpData &&  LtpData.ltp > this.state.buyPrice){
            //    this.placeOrder(this.state.buyPrice); 
            //  }

            //  if(LtpData.ltp > this.getAveragePrice(this.state.orderid)){
            //    this.placeSLMOrder(LtpData.ltp); 
            //  }
       })
    }
    decodeWebsocketData =(array)  => {
        var newarray = [];
        try {
            for (var i = 0; i < array.length; i++) {
                newarray.push(String.fromCharCode(array[i]));
            }
        } catch (e) { }
    
        return newarray.join('');
    }

    makeConnection = (feedToken ,clientcode ) => {

       var firstTime_req = '{"task":"cn","channel":"NONLM","token":"' + this.state.feedToken + '","user": "' + this.state.clientcode + '","acctid":"' + this.state.clientcode + '"}';
     //  console.log("1st Request :- " + firstTime_req);
       wsClint.send(firstTime_req);
    }

    updateSocketWatch = (feedToken,clientcode ) => {
      
        var channel = this.state.symbolList.map(element => {
             return 'nse_cm|'+ element.token; 
        });

       channel = channel.join('&'); 
        var sbin =  {
            "task":"mw",
            "channel": channel,
            "token":this.state.feedToken,
            "user":this.state.clientcode,
            "acctid":this.state.clientcode
        }
       wsClint.send( JSON.stringify( sbin)); 
    }

    
    componentDidMount() {
     
        AdminService.getStaticData().then(res => {
            var data = res.data;
            //data = JSON.parse(data);   
            var totalWatchlist =  Object.keys(data); 
            this.setState({totalWatchlist: totalWatchlist}); 
            this.setState({staticData: data}); 
        
            var watchlist = [];  
            totalWatchlist.forEach(element => {
               var mylist =  data[element]; 
               mylist.forEach(element => {
                watchlist.push(element); 
               });
            });

            localStorage.setItem('watchList', JSON.stringify(watchlist));
            
            this.setState({symbolList :data[this.state.selectedWatchlist] });
        });

        var tokens = JSON.parse(localStorage.getItem("userTokens")); 
        var feedToken =   tokens &&  tokens.feedToken;

        var userProfile = JSON.parse(localStorage.getItem("userProfile")); 
        var clientcode =   userProfile &&  userProfile.clientcode;
        this.setState({ feedToken : feedToken,clientcode : clientcode  });
    
            
    //    wsClint.onopen  = (res) => {

    //          this.makeConnection();
    //          this.updateSocketWatch(feedToken ,clientcode);
                
    //         //  setTimeout(function(){
    //         //    this.updateSocketWatch(feedToken ,clientcode);
    //         //  }, 800);
    //    }

        wsClint.onmessage = (message) => {
            
            
            var decoded = window.atob(message.data);
            var data = this.decodeWebsocketData(pako.inflate(decoded));
            var liveData =  JSON.parse(data); 

            this.state.symbolList &&  this.state.symbolList.forEach(element => {

                var foundLive = liveData.filter(row => row.tk  == element.token);


                if(foundLive.length>0 &&  foundLive[0].ltp)
                    this.setState({ [element.symbol+'ltp'] : foundLive.length>0 &&  foundLive[0].ltp})
                if(foundLive.length>0 &&  foundLive[0].cng)
                    this.setState({ [element.symbol+'nc'] : foundLive.length>0 &&  foundLive[0].nc})
                
                var foundTweezerTop =  localStorage.getItem('foundTweezerTop_'+element.token) && JSON.parse(localStorage.getItem('foundTweezerTop'+element.token) ); 

                if(foundTweezerTop && foundTweezerTop.symboltoken == element.token){

                  if(foundTweezerTop.entryBelow < foundLive[0].ltp){
                        console.log('TweezerTop ',  foundTweezerTop.tradingsymbol,  "entry found at ", foundLive[0].ltp); 
                        this.setState({ tradingsymbol : foundTweezerTop.tradingsymbol, symboltoken : foundTweezerTop.symboltoken,buyPrice : 0,producttype: 'INTRADAY', quantity : foundTweezerTop.quantity })
                    //    this.placeOrder('SELL', "BUY"); 

                   }

                }
                 
                });
        
        }

        wsClint.onerror = (e) => {
            console.log("socket error", e); 
        }

        setInterval(() => {
            var _req = '{"task":"hb","channel":"","token":"' + feedToken + '","user": "' + clientcode + '","acctid":"' + clientcode + '"}';
           // console.log("Request :- " + _req);
            wsClint.send(_req);
          //  this.makeConnection(feedToken ,clientcode );
        }, 59000);


        var list = localStorage.getItem('watchList');
        if(!list){
            localStorage.setItem('watchList', []);
        }

        // setInterval(() => {
        //     AdminService.getAutoScanStock().then(res => {
        //         let data = resolveResponse(res);
        //         console.log(data);  
        //         if(data.status  && data.message == 'SUCCESS'){ 
        //         //    this.setState({ orderid : data.data && data.data.orderid });  
        //         }
        //     })    
        // }, 2000);
      
    }

    backTestAnyPattern = async() =>{



        if(!this.state.patternType){
            Notify.showError("Select pattern type");
            return;
        }

        if(this.state.patternType === 'NR4'){
            this.backTestNR4(); 
            return; 
        }

        this.setState({backTestResult : [], backTestFlag : false}); 

        
        console.log("pattername", this.state.patternType); 

        var watchList = this.state.symbolList; //localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')); 
        var runningTest = 1; 
        for (let index = 0; index < watchList.length; index++) {
            const element = watchList[index];


            var data  = {
                "exchange": "NSE",
                "symboltoken": element.token,
                "interval": "FIFTEEN_MINUTE", //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
                "fromdate": moment(this.state.startDate).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
                "todate":  moment(new Date()).format("YYYY-MM-DD HH:mm") // moment("2020-06-30 14:00").format("YYYY-MM-DD HH:mm") 
            }

            AdminService.getHistoryData(data).then(res => {
                let histdata = resolveResponse(res,'noPop' );
                //console.log("candle history", histdata); 
                if(histdata && histdata.data && histdata.data.length){
                   
                    var candleData = histdata.data; 
                    for (let index2 = 0; index2 < candleData.length-35; index2++) {
                       // var startindex = index2 * 10; 
                        var last10Candle = candleData.slice(index2, index2+10);    
                        var next10Candle = candleData.slice(index2+10 , index2+35 );    
                       
                       // console.log(element.symbol, 'backside',  last10Candle, '\n forntside',  next10Candle);
                      
                        console.log('\n'); //&& new Date(candleData[index2][0]).toLocaleTimeString() < "14:15:00"
                        if(last10Candle.length >= 10  && new Date(candleData[index2][0]).toLocaleTimeString() < "14:15:00"){
                          //  console.log(element.symbol, 'findingtime', new Date(candleData[index2][0]).toLocaleTimeString()); 

                            switch (this.state.patternType) {
                                case 'TweezerTop':
                                    this.backtestTweezerTop(last10Candle, element.symbol, next10Candle);
                                    break;
                                case 'TweezerBottom':
                                    this.backtestTweezerBottom(last10Candle, element.symbol, next10Candle);       
                                    break;
                                default:
                                    break;
                            }
                            
                        }
                        runningTest=runningTest+candleData.length-35; 
                    }
                }else{
                    //localStorage.setItem('NseStock_' + symbol, "");
                    console.log(" candle data emply"); 
                }
            })
            await new Promise(r => setTimeout(r, 300));  
            this.setState({stockTesting:  index+1 + ". " + element.symbol , runningTest: runningTest})
        }

    }


    backTestNR4 = async() =>{

        this.setState({backTestResult : [], backTestFlag : false}); 

        var watchList = this.state.symbolList //localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')); 
        var runningTest = 1, sumPercentage =0 ; 
        for (let index = 0; index < watchList.length; index++) {
            const element = watchList[index];

            var data  = {
                "exchange": "NSE",
                "symboltoken": element.token,
                "interval": "ONE_DAY", //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
                "fromdate": moment(this.state.startDate).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
                "todate":  moment(this.state.endDate).format("YYYY-MM-DD HH:mm") // moment("2020-06-30 14:00").format("YYYY-MM-DD HH:mm") 
            }

            AdminService.getHistoryData(data).then(res => {
                let histdata = resolveResponse(res,'noPop' );
                //console.log("candle history", histdata); 
                if(histdata && histdata.data && histdata.data.length){
                   
                    var candleData = histdata.data; 
                  //  candleData.reverse(); 
                    for (let index2 = 0; index2 < candleData.length-4; index2++) {
                       // var startindex = index2 * 10; 
                        var last4Candle = candleData.slice(index2, index2+4);    
                       // var next10Candle = candleData.slice(index2+5 , index2+35 );    
                       
                       // console.log(element.symbol, 'backside',  last10Candle, '\n forntside',  next10Candle);
                      
                        //&& new Date(candleData[index2][0]).toLocaleTimeString() < "14:15:00"
                        if(last4Candle.length >= 4  && new Date(candleData[index2][0]).toLocaleTimeString() < "14:15:00"){
                         
                            last4Candle.reverse(); 
                         
                            var rangeArr=[]; 
                            last4Candle.forEach(element => {
                                rangeArr.push(element[2] - element[3]); 
                            });
                            var firstElement = rangeArr[0], rgrangeCount = 0; 
                            rangeArr.forEach(element => {
                                if(firstElement <= element){
                                    firstElement = element; 
                                    rgrangeCount+=1; 
                                }
                            });

                          //  console.log(element.symbol, last4Candle, rangeArr, rgrangeCount); 
                            if(rgrangeCount == 4){
                                var firstCandle =  last4Candle[0]; 
                                var next5thCandle = candleData[index2+4]; 
                                
                                if(next5thCandle[2] > firstCandle[2]){
                                    var perChng =  (next5thCandle[4] - firstCandle[2])*100/firstCandle[2];  
                                    sumPercentage += perChng; 
                                    console.log(element.symbol,firstCandle[0],"upside", "same day high" , firstCandle[2],"same day low" , firstCandle[3], "nextdaylow", next5thCandle[3], "nextdayhigh", next5thCandle[2], 'next day closing', next5thCandle[4],  perChng + '%'); 
                               
                                    var foundStock = {
                                        foundAt: new Date( firstCandle[0]).toLocaleString(), 
                                        symbol : element.symbol, 
                                        sellEntyPrice : next5thCandle[4], 
                                        stopLoss : firstCandle[3], 
                                        buyExitPrice : firstCandle[2],
                                        brokerageCharges: 0.06,
                                        perChange : perChng.toFixed(2),
                                        squareOffAt : new Date( next5thCandle[0] ).toLocaleString(), 
                                        quantity : Math.floor(10000/firstCandle[2]),
                                    }
                               
                                    this.setState({backTestResult : [...this.state.backTestResult, foundStock]}); 
                                    
                                }

                            }
                            
                        }
                        runningTest=runningTest+candleData.length-35; 
                    }
                }else{
                    //localStorage.setItem('NseStock_' + symbol, "");
                    console.log(element.symbol, " candle data emply"); 
                }
            })
            await new Promise(r => setTimeout(r, 300));  
            this.setState({stockTesting:  index+1 + ". " + element.symbol , runningTest: runningTest})
        }
        this.setState({backTestFlag : true});
        console.log("sumPercentage", sumPercentage)
    }

    backtestTweezerTop = (candleHist,symbol, next10Candle) => {

        if(candleHist && candleHist.length > 0){

            candleHist = candleHist.reverse(); 
           // console.log(symbol, "candleHist",candleHist, new Date().toString()); 


            var maxHigh = candleHist[2] && candleHist[2][2], maxLow = candleHist[2] && candleHist[2][3]; 
            for (let index = 3; index < candleHist.length; index++) {
                if(maxHigh < candleHist[index][2])
                maxHigh = candleHist[index][2];
                if(candleHist[index][3] < maxLow)
                maxLow = candleHist[index][3];  
            } 
            

            var lastTrendCandleLow = candleHist[9][3]; 
            var firstTrendCandleHigh = candleHist[2][2]; 

            var firstCandle = {
                time : candleHist[0]  && candleHist[0][0],
                open: candleHist[0]  && candleHist[0][1],
                high: candleHist[0]  && candleHist[0][2],
                low: candleHist[0]  && candleHist[0][3],
                close: candleHist[0]  && candleHist[0][4]
            }
            var secondCandle = {
                time:candleHist[1] && candleHist[1][0],
                open: candleHist[1] && candleHist[1][1],
                high: candleHist[1] && candleHist[1][2],
                low: candleHist[1] && candleHist[1][3],
                close: candleHist[1] && candleHist[1][4]
            }
            
           

            var diffPer = (firstTrendCandleHigh - lastTrendCandleLow)*100/lastTrendCandleLow;
            var lowestOfBoth = secondCandle.low < firstCandle.low ? secondCandle.low : firstCandle.low;
            var highestOfBoth = secondCandle.high < firstCandle.high ? secondCandle.high : firstCandle.high;
            //uptrend movement 1.5% 
        //    console.log(symbol, "last 8th candle diff% ",  diffPer, "10th Low", lastTrendCandleLow,"3rd high", firstTrendCandleHigh);

            
            if(diffPer >= 1.5 && maxHigh < highestOfBoth && maxLow < lowestOfBoth){
                //1st candle green & 2nd candle is red check
                if(secondCandle.open < secondCandle.close && firstCandle.open > firstCandle.close){ 
               // console.log(symbol, "candleHist",candleHist); 
              //  console.log(symbol, "last 8th candle diff% ",  diffPer, "10th Low", lastTrendCandleLow,"3rd high", firstTrendCandleHigh);
              //  console.log(symbol, 'making twisser 1st green & 2nd red' , firstCandle, secondCandle );

                    if(Math.round(secondCandle.close) ==  Math.round(firstCandle.open) && Math.round(secondCandle.open) ==  Math.round(firstCandle.close)){

                        console.log('%c' + new Date( candleHist[0][0]).toString(), 'color: green'); 
                        console.log(symbol, "last 8th candle diff% ",  diffPer, "10th Low", lastTrendCandleLow,"3rd high", firstTrendCandleHigh);

                        console.log(symbol, "maxHigh", maxHigh, "maxLow", maxLow);                 
                        console.log("last10Candle",candleHist); 
                        console.log(symbol, 'perfect twisser top done close=open || open=close', );
                        console.log("next10Candle",next10Candle); 
                        
                        if(next10Candle && next10Candle.length){
                           // next10Candle = next10Candle.reverse(); 
                        
                           var higherStopLoss =  (highestOfBoth + (highestOfBoth/100/10)).toFixed(2); 
                           var sellEntyPrice = (lowestOfBoth - (lowestOfBoth/100/10)).toFixed(2); 

                           //flat 3:15 or SL hit squired off 
                           var squiredOffAt315 = 0, squareOffAt315Time = '';
                            for (let indexTarget = 0; indexTarget < next10Candle.length; indexTarget++) {
                                
                                if(next10Candle[indexTarget][2] > higherStopLoss){
                                    squiredOffAt315 = higherStopLoss;  
                                    squareOffAt315Time = next10Candle[indexTarget][0];  
                                    break; 
                                }
                                if(new Date(next10Candle[indexTarget][0]).toLocaleTimeString()  == "15:15:00"){
                                    squiredOffAt315 = next10Candle[indexTarget][4];
                                    squareOffAt315Time = next10Candle[indexTarget][0]; 
                                    break; 
                                }
                            } 
                             //lowest of 3:15 profit booking
                            var lowestOf315 = next10Candle[0][4], lowestSquareOffAt = ''; 
                            for (let indexTarget2 = 1; indexTarget2 < next10Candle.length; indexTarget2++) {     
                                if(next10Candle[indexTarget2][4] < lowestOf315){
                                    lowestOf315 = next10Candle[indexTarget2][4];  
                                    lowestSquareOffAt = next10Candle[indexTarget2][0];  
                                }
                                if(new Date(next10Candle[indexTarget2][0]).toLocaleTimeString() == "15:15:00"){
                                    break;  
                                }
                            } 

                             //trailing profit till of 3:15 
                            var trailingSL = higherStopLoss, trailingSLAT = ''; 
                            for (let indexTarget3 = 0; indexTarget3 < next10Candle.length; indexTarget3++) {
                                if(trailingSL > next10Candle[indexTarget3][2]){
                                    trailingSL = (next10Candle[indexTarget3][2] + (next10Candle[indexTarget3][2]/100/4)).toFixed(2);  
                                    trailingSLAT = next10Candle[indexTarget3][0];  
                                }
                                else{
                                    trailingSL = (next10Candle[indexTarget3][4]).toFixed(2);  
                                    trailingSLAT = next10Candle[indexTarget3][0];  
                                    break; 
                                }
                                if(new Date(next10Candle[indexTarget3][0]).toLocaleTimeString() == "15:15:00"){
                                    break;  
                                }
                            } 
                            //flat 0.75% or SL hit profit booking
                            var flatSellingPrice = 0, flatSellingPriceAt = ''; 
                            for (let indexTarget4 = 0; indexTarget4 < next10Candle.length; indexTarget4++) {
                                
                                var priceDiff = (next10Candle[indexTarget4][3] - sellEntyPrice)*100/sellEntyPrice; 

                                if(priceDiff < -0.70){
                                    flatSellingPrice = next10Candle[indexTarget4][3];  
                                    flatSellingPriceAt = next10Candle[indexTarget4][0];  
                                    break; 
                                }
                                if(next10Candle[indexTarget4][2] > higherStopLoss){
                                    flatSellingPrice = higherStopLoss;  
                                    flatSellingPriceAt = next10Candle[indexTarget4][0];  
                                    break; 
                                }
                                if(new Date(next10Candle[indexTarget4][0]).toLocaleTimeString() == "15:15:00"){
                                    flatSellingPrice = next10Candle[indexTarget4][3];  
                                    flatSellingPriceAt = next10Candle[indexTarget4][0];  
                                    break;  
                                }
                            } 

                            //range based target range*1.5% or SL hit profit booking
                            var rangeSellingPrice = 0, rangeSellingPriceAt = ''; 
                            for (let indexTarget5 = 0; indexTarget5 < next10Candle.length; indexTarget5++) {
                                
                                var rangePriceDiff = (next10Candle[indexTarget5][3] - sellEntyPrice)*100/sellEntyPrice; 

                                if(rangePriceDiff <= -1.5){
                                    rangeSellingPrice = next10Candle[indexTarget5][3];  
                                    rangeSellingPriceAt = next10Candle[indexTarget5][0];  
                                    break; 
                                }
                                if(next10Candle[indexTarget5][2] > higherStopLoss){
                                    rangeSellingPrice = higherStopLoss;  
                                    rangeSellingPriceAt = next10Candle[indexTarget5][0];  
                                    break; 
                                }
                                if(new Date(next10Candle[indexTarget5][0]).toLocaleTimeString() == "15:15:00"){
                                    rangeSellingPrice = next10Candle[indexTarget5][3];  
                                    rangeSellingPriceAt = next10Candle[indexTarget5][0];  
                                    break;  
                                }
                            } 
    
                            var backTestResult = localStorage.getItem("backTestResult") ? JSON.parse(localStorage.getItem("backTestResult")) : []; 
                            

                            if(next10Candle[0][3]  < lowestOfBoth || next10Candle[1][3] < lowestOfBoth || next10Candle[2][3] < lowestOfBoth){
                                var foundStock = {
                                    foundAt: new Date( candleHist[0][0]).toLocaleString(), 
                                    symbol : symbol, 
                                    sellEntyPrice : sellEntyPrice, 
                                    stopLoss : higherStopLoss, 
                                    orderActivated: false, 
                                    buyExitPrice : 0,
                                    brokerageCharges: 0.06,
                                    quantity : Math.floor(10000/sellEntyPrice),
                                }
                                foundStock.orderActivated = true;
                                //sqr off at 3:15
                            //   foundStock.squareOffAt = new Date( squareOffAt315Time ).toLocaleString();
                            //   foundStock.buyExitPrice = squiredOffAt315; 

                             //  lowest of 3:15
                                // foundStock.squareOffAt = new Date( lowestSquareOffAt ).toLocaleString();
                                // foundStock.buyExitPrice = lowestOf315 

                                //trailing till 3:15
                                // foundStock.squareOffAt = new Date( trailingSLAT ).toLocaleString();
                                // foundStock.buyExitPrice = trailingSL;

                                //flat profit booking at 0.70%
                                foundStock.squareOffAt = new Date( flatSellingPriceAt ).toLocaleString();
                                foundStock.buyExitPrice = flatSellingPrice;


                                  //range based target range*1.5%
                            //    foundStock.squareOffAt = new Date( rangeSellingPriceAt ).toLocaleString();
                            //    foundStock.buyExitPrice = rangeSellingPrice;

                                foundStock.perChange = ((foundStock.sellEntyPrice - foundStock.buyExitPrice)*100/foundStock.sellEntyPrice).toFixed(2);
                                backTestResult.push(foundStock); 

                                this.setState({backTestResult : [...this.state.backTestResult, foundStock]}); 
    
                              //  localStorage.setItem('backTestResult', JSON.stringify(backTestResult));
                            }
    
                          

                           
                        }
            
                    }
                }
            }

        }

        this.setState({backTestFlag : true});
    }

    backtestTweezerBottom = (candleHist,symbol, next10Candle) => {
        if(candleHist && candleHist.length > 0){

            candleHist = candleHist.reverse(); 
           // console.log(symbol, "candleHist",candleHist, new Date().toString()); 


            var maxHigh = candleHist[2] && candleHist[2][2], maxLow = candleHist[2] && candleHist[2][3]; 
            for (let index = 3; index < candleHist.length; index++) {
                if(maxHigh < candleHist[index][2])
                maxHigh = candleHist[index][2];
                if(candleHist[index][3] < maxLow)
                maxLow = candleHist[index][3];  
            } 
            

            var lastTrendCandleLow = candleHist[9][3]; 
            var firstTrendCandleHigh = candleHist[2][2]; 

            var firstCandle = {
                time : candleHist[0]  && candleHist[0][0],
                open: candleHist[0]  && candleHist[0][1],
                high: candleHist[0]  && candleHist[0][2],
                low: candleHist[0]  && candleHist[0][3],
                close: candleHist[0]  && candleHist[0][4]
            }
            var secondCandle = {
                time:candleHist[1] && candleHist[1][0],
                open: candleHist[1] && candleHist[1][1],
                high: candleHist[1] && candleHist[1][2],
                low: candleHist[1] && candleHist[1][3],
                close: candleHist[1] && candleHist[1][4]
            }
            
           

            var diffPer = (firstTrendCandleHigh - lastTrendCandleLow)*100/lastTrendCandleLow;
            var lowestOfBoth = secondCandle.low < firstCandle.low ? secondCandle.low : firstCandle.low;
            var highestOfBoth = secondCandle.high < firstCandle.high ? secondCandle.high : firstCandle.high;
            //uptrend movement 1.5% 
        //    console.log(symbol, "last 8th candle diff% ",  diffPer, "10th Low", lastTrendCandleLow,"3rd high", firstTrendCandleHigh);

            
        if(diffPer <= -1.5 && highestOfBoth < maxHigh  && lowestOfBoth < maxLow){
            //1st candle green & 2nd candle is red check
            if(secondCandle.open > secondCandle.close && firstCandle.close  > firstCandle.open){ 
                // console.log(symbol, "candleHist",candleHist); 
              //  console.log(symbol, "last 8th candle diff% ",  diffPer, "10th Low", lastTrendCandleLow,"3rd high", firstTrendCandleHigh);
              //  console.log(symbol, 'making twisser 1st green & 2nd red' , firstCandle, secondCandle );

                    if(Math.round(secondCandle.close) ==  Math.round(firstCandle.open) || Math.round(secondCandle.open) ==  Math.round(firstCandle.close)){

                        console.log('%c' + new Date( candleHist[0][0]).toString(), 'color: green'); 
                        console.log(symbol, "last 8th candle diff% ",  diffPer, "10th Low", lastTrendCandleLow,"3rd high", firstTrendCandleHigh);

                        console.log(symbol, "maxHigh", maxHigh, "maxLow", maxLow);                 
                        console.log("last10Candle",candleHist); 
                        console.log(symbol, 'perfect twisser top done close=open || open=close', );
                        console.log("next10Candle",next10Candle); 
                        
                        if(next10Candle && next10Candle.length){
                           // next10Candle = next10Candle.reverse(); 
                        
                           var buyEntyPrice =  (highestOfBoth + (highestOfBoth/100/10)).toFixed(2); 
                           var LowerStopLoss = (lowestOfBoth - (lowestOfBoth/100/10)).toFixed(2); 

                           //flat 3:15 or SL hit squired off 
                           var squiredOffAt315 = 0, squareOffAt315Time = '';
                            for (let indexTarget = 0; indexTarget < next10Candle.length; indexTarget++) {
                                
                                if(next10Candle[indexTarget][2] < LowerStopLoss){
                                    squiredOffAt315 = LowerStopLoss;  
                                    squareOffAt315Time = next10Candle[indexTarget][0];  
                                    break; 
                                }
                                if(new Date(next10Candle[indexTarget][0]).toLocaleTimeString()  == "15:15:00"){
                                    squiredOffAt315 = next10Candle[indexTarget][4];
                                    squareOffAt315Time = next10Candle[indexTarget][0]; 
                                    break; 
                                }
                            } 
                             //highest of 3:15 profit booking
                            var highestOf315 = next10Candle[0][4], highestSquareOffAt = ''; 
                            for (let indexTarget2 = 1; indexTarget2 < next10Candle.length; indexTarget2++) {     
                                if(highestOf315 < next10Candle[indexTarget2][4]){
                                    highestOf315 = next10Candle[indexTarget2][4];  
                                    highestSquareOffAt = next10Candle[indexTarget2][0];  
                                }
                                if(new Date(next10Candle[indexTarget2][0]).toLocaleTimeString() == "15:15:00"){
                                    break;  
                                }
                            } 

                             //trailing profit till of 3:15 
                            var trailingSL = LowerStopLoss, trailingSLAT = ''; 
                            for (let indexTarget3 = 0; indexTarget3 < next10Candle.length; indexTarget3++) {
                                if(trailingSL > next10Candle[indexTarget3][2]){
                                    trailingSL = (next10Candle[indexTarget3][2] + (next10Candle[indexTarget3][2]/100/4)).toFixed(2);  
                                    trailingSLAT = next10Candle[indexTarget3][0];  
                                }
                                else{
                                    trailingSL = (next10Candle[indexTarget3][4]).toFixed(2);  
                                    trailingSLAT = next10Candle[indexTarget3][0];  
                                    break; 
                                }
                                if(new Date(next10Candle[indexTarget3][0]).toLocaleTimeString() == "15:15:00"){
                                    break;  
                                }
                            } 
                            //flat 0.75% or SL hit profit booking
                            var flatSellingPrice = 0, flatSellingPriceAt = ''; 
                            for (let indexTarget4 = 0; indexTarget4 < next10Candle.length; indexTarget4++) {
                                
                                var priceDiff = (next10Candle[indexTarget4][3] - buyEntyPrice)*100/buyEntyPrice; 

                                if(priceDiff > 0.70){
                                    flatSellingPrice = next10Candle[indexTarget4][3];  
                                    flatSellingPriceAt = next10Candle[indexTarget4][0];  
                                    break; 
                                }
                                if(next10Candle[indexTarget4][2] > LowerStopLoss){
                                    flatSellingPrice = LowerStopLoss;  
                                    flatSellingPriceAt = next10Candle[indexTarget4][0];  
                                    break; 
                                }
                                if(new Date(next10Candle[indexTarget4][0]).toLocaleTimeString() == "15:15:00"){
                                    flatSellingPrice = next10Candle[indexTarget4][3];  
                                    flatSellingPriceAt = next10Candle[indexTarget4][0];  
                                    break;  
                                }
                            } 

                            //range based target range*1.5% or SL hit profit booking
                            var rangeSellingPrice = 0, rangeSellingPriceAt = ''; 
                            for (let indexTarget5 = 0; indexTarget5 < next10Candle.length; indexTarget5++) {
                                
                                var rangePriceDiff = (next10Candle[indexTarget5][3] - buyEntyPrice)*100/buyEntyPrice; 

                                if(rangePriceDiff >= -1.5){
                                    rangeSellingPrice = next10Candle[indexTarget5][3];  
                                    rangeSellingPriceAt = next10Candle[indexTarget5][0];  
                                    break; 
                                }
                                if(next10Candle[indexTarget5][2] > LowerStopLoss){
                                    rangeSellingPrice = LowerStopLoss;  
                                    rangeSellingPriceAt = next10Candle[indexTarget5][0];  
                                    break; 
                                }
                                if(new Date(next10Candle[indexTarget5][0]).toLocaleTimeString() == "15:15:00"){
                                    rangeSellingPrice = next10Candle[indexTarget5][3];  
                                    rangeSellingPriceAt = next10Candle[indexTarget5][0];  
                                    break;  
                                }
                            } 
    
                            var backTestResult = localStorage.getItem("backTestResult") ? JSON.parse(localStorage.getItem("backTestResult")) : []; 
                            

                            if(next10Candle[0][3]  < lowestOfBoth || next10Candle[1][3] < lowestOfBoth || next10Candle[2][3] < lowestOfBoth){
                                var foundStock = {
                                    foundAt: new Date( candleHist[0][0]).toLocaleString(), 
                                    symbol : symbol, 
                                    sellEntyPrice : 0, 
                                    stopLoss : LowerStopLoss, 
                                    orderActivated: false, 
                                    buyExitPrice : buyEntyPrice,
                                    brokerageCharges: 0.06,
                                    quantity : Math.floor(10000/buyEntyPrice),
                                }
                                foundStock.orderActivated = true;
                                //sqr off at 3:15
                              foundStock.squareOffAt = new Date( squareOffAt315Time ).toLocaleString();
                              foundStock.sellEntyPrice = squiredOffAt315; 

                             //  lowest of 3:15
                                // foundStock.squareOffAt = new Date( lowestSquareOffAt ).toLocaleString();
                                // foundStock.sellEntyPrice = lowestOf315 

                                //trailing till 3:15
                                // foundStock.squareOffAt = new Date( trailingSLAT ).toLocaleString();
                                // foundStock.sellEntyPrice = trailingSL;

                                //flat profit booking at 0.70%
                                // foundStock.squareOffAt = new Date( flatSellingPriceAt ).toLocaleString();
                                // foundStock.sellEntyPrice = flatSellingPrice;


                                  //range based target range*1.5%
                            //    foundStock.squareOffAt = new Date( rangeSellingPriceAt ).toLocaleString();
                            //    foundStock.sellEntyPrice = rangeSellingPrice;

                                foundStock.perChange = ((foundStock.sellEntyPrice - foundStock.buyExitPrice)*100/foundStock.sellEntyPrice).toFixed(2);
                                backTestResult.push(foundStock); 

                                this.setState({backTestResult : [...this.state.backTestResult, foundStock]}); 
    
                              //  localStorage.setItem('backTestResult', JSON.stringify(backTestResult));
                            }
    
                          

                           
                        }
            
                    }
                }
            }

        }
        this.setState({backTestFlag : true});
       
    }

    placeOrder = (transactiontype, slmOrderType) => {
   
        var data = {
            "variety":"NORMAL",
            "tradingsymbol": this.state.tradingsymbol,
            "symboltoken": this.state.symboltoken,
            "transactiontype":transactiontype, //BUY OR SELL
            "exchange":"NSE",
            "ordertype":   this.state.buyPrice  === 0 ? "MARKET" : "LIMIT", 
            "producttype": this.state.producttype, //"INTRADAY",//"DELIVERY",
            "duration":"DAY",
            "price": this.state.buyPrice,
            "squareoff":"0",
            "stoploss":"0",
            "quantity":this.state.quantity,
        }

        AdminService.placeOrder(data).then(res => {
            let data = resolveResponse(res);
         //   console.log(data);   
            if(data.status  && data.message === 'SUCCESS'){
                localStorage.setItem('ifNotBought' ,  'false')
                this.setState({ orderid : data.data && data.data.orderid });

                if(this.state.stoploss){
                    this.placeSLMOrder(this.state.stoploss, slmOrderType);
                }
            }
        })
    }

    LoadSymbolDetails =(name) => {
       
        var token= ''; 
        for (let index = 0; index <  this.state.symbolList.length; index++) {
            if(this.state.symbolList[index].symbol === name){
                    token =  this.state.symbolList[index].token; 
                   this.setState({ tradingsymbol : name, symboltoken : this.state.symbolList[index].token});
                    break; 
            }
        }  
        this.getHistory(token); 
    }

    placeSLMOrder = (slmOrderType) => {

        var data = {
            "tradingsymbol": this.state.tradingsymbol,
            "symboltoken":this.state.symboltoken,
            "transactiontype":slmOrderType ? slmOrderType :  "SELL",
            "exchange":"NSE",
            "ordertype":"STOPLOSS_MARKET", //STOPLOSS_MARKET STOPLOSS_LIMIT
            "producttype": this.state.producttype, //"INTRADAY",//"DELIVERY",
            "duration":"DAY",
            "price": 0,
            "squareoff":"0",
            "stoploss":"0",
            "quantity": this.state.quantity, 
            "triggerprice" : this.state.stoploss,
            "variety" : "STOPLOSS"
        }

        AdminService.placeOrder(data).then(res => {
            let data = resolveResponse(res);
       //     console.log(data);   
            if(data.status  && data.message === 'SUCCESS'){
                localStorage.setItem('ifNotBought' ,  'false')
                this.setState({ orderid : data.data && data.data.orderid });
            }
        })


    }

    getHistory = (token) => {

        const format1 = "YYYY-MM-DD HH:mm";

        var time = moment.duration("00:50:00");
        var startdate = moment(new Date()).subtract(time);
     // var startdate = moment(this.state.startDate).subtract(time);

        var data  = {
            "exchange": "NSE",
            "symboltoken": token ,
            "interval": "ONE_MINUTE", //ONE_DAY FIVE_MINUTE 
            "fromdate": moment(startdate).format(format1) , 
            "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
       }
       
        AdminService.getHistoryData(data).then(res => {
             let data = resolveResponse(res,'noPop' );
          //    console.log(data); 
              if(data && data.data){
                 
                var histCandles = data.data; 
                histCandles &&  histCandles.sort(function(a,b){
                  return new Date(b[0]) - new Date(a[0]);
                });
                if(histCandles.length > 0){
                    localStorage.setItem('InstrumentHistroy', JSON.stringify(histCandles));
                    this.setState({ InstrumentHistroy :histCandles , buyPrice : histCandles[0][2]});
                }
                this.getLTP();
              }
        })
    }

    onSelectItem = (event, values) =>{
        

        var autoSearchTemp = JSON.parse( localStorage.getItem('autoSearchTemp')); 
      //  console.log("values", values); 
     //   console.log("autoSearchTemp", autoSearchTemp); 
        if(autoSearchTemp.length> 0){
            var fdata = '';       
             for (let index = 0; index < autoSearchTemp.length; index++) {
                console.log("fdata", autoSearchTemp[index].symbol); 
                if( autoSearchTemp[index].symbol === values){
                 fdata = autoSearchTemp[index];
                 break;
                }  
             }
           

             var watchlist = localStorage.getItem("watchList") ? JSON.parse(localStorage.getItem("watchList")) : []; 
             var foundInWatchlist = watchlist.filter(row => row.token  === values);                                
             if(!foundInWatchlist.length){
                watchlist.push(fdata); 
                localStorage.setItem('watchList', JSON.stringify(watchlist));
                 
                AdminService.saveWatchListJSON({stock : fdata}).then(res => {
                  let resdata = resolveResponse(res,'noPop' );
                  console.log(resdata);
                });
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


    render() {
        const dateParam = {
            myCallback: this.myCallback,
            startDate: '',
            endDate:'', 
            firstLavel : "Start Date and Time", 
            secondLavel : "End Date and Time"
          }

        var sumPerChange = 0, sumBrokeragePer =0,netSumPerChange =0, sumPnlValue=0, sumSellEntyPrice=0;

        return(
            <React.Fragment>
                 <PostLoginNavBar/>
                
                <Grid direction="row" container>
               
                     <Grid item xs={3} sm={3}  > 
                   
                         <Autocomplete
                            freeSolo
                            id="free-solo-2-demo"
                            disableClearable
                            style={{paddingLeft: "10px",paddingRight: "10px"}}
                            onChange={this.onSelectItem}
                            //+ ' '+  option.exch_seg
                            options={this.state.autoSearchList.length> 0 ?  this.state.autoSearchList.map((option) => 
                            option.symbol
                            ) : [] }
                            renderInput={(params) => (
                            <TextField
                                onChange={this.onChange}
                                {...params}
                                label= {"Search Symbol (" + this.state.symbolList.length+")"} 
                                margin="normal"
                                variant="standard"
                            
                                name="search"
                                value={this.state.search}
                                InputProps={{ ...params.InputProps, type: 'search' }}
                            />
                            )}
                        />

                        <div style={{marginLeft: '10px'}}>
                            <FormControl style={{paddingLeft: '12px'}} style={styles.selectStyle} >
                                <InputLabel  htmlFor="gender">Select Watchlist</InputLabel>
                                <Select value={this.state.selectedWatchlist}  name="selectedWatchlist" onChange={this.onChangeWatchlist}>
                                    {this.state.totalWatchlist && this.state.totalWatchlist.map(element => (
                                        <MenuItem value={element}>{element}</MenuItem>
                                    ))
                                    }
                                   
                                </Select>
                            </FormControl>
                        
                        </div>
                            

            
                        <div style={{ overflowY: 'scroll', height: "75vh" }}> 

                            {this.state.symbolList && this.state.symbolList ? this.state.symbolList.map(row => (
                               <>
                            <ListItem button style={{ fontSize: '12px'}} >
                                <ListItemText style={{color:this.state[row.symbol+'nc'] > 0 ? 'green' : "red" }}  onClick={() => this.LoadSymbolDetails(row.symbol)} primary={row.name} /> {this.state[row.symbol+'ltp']} ({this.state[row.symbol+'nc']}%) <DeleteIcon  onClick={() => this.deleteItemWatchlist(row.symbol)} />
                            </ListItem>
                           
                            </>
                            )):''}
                        </div>

                        {/* <Tab style={{position: 'fixed'}}  data={{symbolList : this.state.symbolList, LoadSymbolDetails: this.LoadSymbolDetails, deleteItemWatchlist: this.deleteItemWatchlist }}/> */}
                                                    
                </Grid>

               


                <Grid item xs={9} sm={9}> 
           

                    <Grid  direction="row" alignItems="center" container>

                        <Grid item xs={10} sm={5}> 
                            <Typography variant="h5"  >
                            {this.state.tradingsymbol} : {this.state.InstrumentLTP ? this.state.InstrumentLTP.ltp : "" }   {this.state.sbinLtp}
                            </Typography>    
                            Open : {this.state.InstrumentLTP ? this.state.InstrumentLTP.open : "" } &nbsp;
                            High : {this.state.InstrumentLTP ? this.state.InstrumentLTP.high : "" } &nbsp;
                            Low :  {this.state.InstrumentLTP ? this.state.InstrumentLTP.low : "" }&nbsp;
                            Previous Close :  {this.state.InstrumentLTP ? this.state.InstrumentLTP.close : "" } &nbsp;

                        </Grid>
                        <Grid item xs={12} sm={2}>
                                <FormControl style={styles.selectStyle}>
                                    <InputLabel  htmlFor="gender">Order Type</InputLabel>
                                    <Select value={this.state.producttype}  name="producttype" onChange={this.onChange}>
                                        <MenuItem value={"INTRADAY"}>INTRADAY</MenuItem>
                                        <MenuItem value={"DELIVERY"}>DELIVERY</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        <Grid item xs={10} sm={1}> 
                            <TextField  id="buyPrice"  label="Buy Price"  value={this.state.buyPrice}   name="buyPrice" onChange={this.onChange}/>
                        </Grid>
                        <Grid item xs={10} sm={1}> 
                            <TextField  id="quantity"  label="Qty"  value={this.state.quantity}   name="quantity" onChange={this.onChange}/>
                        </Grid>
                        <Grid item xs={10} sm={1}> 
                            <TextField  id="stoploss"  label="SL"  value={this.state.stoploss}   name="stoploss" onChange={this.onChange}/>
                        </Grid>
                    
                    
                        <Grid item xs={1} sm={2}  > 
                        
                            <Button variant="contained" color="secondary" style={{marginLeft: '20px'}} onClick={() => this.placeOrder('BUY')}>Buy</Button> 
                            <Button variant="contained" color="primary" style={{marginLeft: '20px'}} onClick={() => this.placeOrder('SELL')}>Sell</Button>    
                        </Grid>


                        <Grid item xs={10} sm={12}> 
                        <Paper style={{padding:"10px", overflow:"auto"}} >


                        <Table  size="small"   aria-label="sticky table" >
                            <TableHead  style={{width:"",whiteSpace: "nowrap"}} variant="head">
                                <TableRow   variant="head" style={{fontWeight: 'bold'}}>

                                    {/* <TableCell className="TableHeadFormat" align="center">Instrument</TableCell> */}
                                    <TableCell className="TableHeadFormat" align="center">Timestamp</TableCell>
                                    <TableCell className="TableHeadFormat" align="center">Open</TableCell>
                                    <TableCell  className="TableHeadFormat" align="center">High</TableCell>
                                    <TableCell  className="TableHeadFormat" align="center">Low</TableCell>
                                    <TableCell className="TableHeadFormat" align="center">Close </TableCell>
                                    <TableCell  className="TableHeadFormat"   align="center">Volume</TableCell>

                                </TableRow>
                            </TableHead>
                            <TableBody style={{width:"",whiteSpace: "nowrap"}}>


                                {this.state.InstrumentHistroy && this.state.InstrumentHistroy ? this.state.InstrumentHistroy.map((row, i) => (
                                    <TableRow key={i} >

                                        <TableCell align="center">{new Date(row[0]).toLocaleString()}</TableCell>
                                        <TableCell align="center">{row[1]}</TableCell>
                                        <TableCell align="center">{row[2]}</TableCell>
                                        <TableCell align="center">{row[3]}</TableCell>
                                        <TableCell align="center">{row[4]}</TableCell>
                                        <TableCell align="center">{row[5]}</TableCell>
                                    
                                    </TableRow>
                                )):''}
                            </TableBody>
                        </Table>

                        </Paper>



                        <Paper style={{padding:"10px", overflow:"auto"}} >
                        <Grid direction="row" container>
                            
                            <Grid item xs={12} sm={4} style={{marginTop: '15px'}}>
                                <FormControl style={styles.selectStyle}>
                                    <InputLabel htmlFor="Nationality">Pattern Type</InputLabel>
                                    <Select value={this.state.patternType}  name="patternType" onChange={this.onChangePattern}>
                                        <MenuItem value={"TweezerTop"}>Tweezer Top</MenuItem>
                                        <MenuItem value={"TweezerBottom"}>Tweezer Bottom</MenuItem>
                                        <MenuItem value={"NR4"}>Narrow Range 4</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>


                            <Grid item xs={12} sm={6}>
                                <MaterialUIDateTimePicker callbackFromParent={dateParam}/>
                            </Grid>
                            
                            <Grid item xs={12} sm={2} style={{marginTop: '28px'}}> 
                              {this.state.backTestFlag ? <Button variant="contained" onClick={() => this.backTestAnyPattern()}>Back Test</Button> : <Spinner/>} 
                                <br />  
                              Stock: {this.state.stockTesting}  Total Test Count: {this.state.runningTest}
                            </Grid>

                        </Grid>

                       
                        <Table  size="small"   aria-label="sticky table" >
                            <TableHead  style={{width:"",whiteSpace: "nowrap"}} variant="head">
                                <TableRow   variant="head" style={{fontWeight: 'bold'}}>

                                  <TableCell className="TableHeadFormat" align="center">Sr. </TableCell>
                                    <TableCell className="TableHeadFormat" align="center">Symbol</TableCell>
                                    <TableCell className="TableHeadFormat" align="center">FoundAt</TableCell>
                                    <TableCell  className="TableHeadFormat"   align="center">Buy</TableCell>
                                    <TableCell  className="TableHeadFormat" align="center">Sell(Qty)</TableCell>
                                 
                                    <TableCell  className="TableHeadFormat"   align="center">SquiredOff</TableCell>
                                    <TableCell  className="TableHeadFormat" align="center">StopLoss</TableCell>

                                    <TableCell  className="TableHeadFormat"   align="center">PnL %</TableCell>

                                    <TableCell className="TableHeadFormat" align="center">Brokerage</TableCell>

                                    <TableCell  className="TableHeadFormat"   align="center">Net PnL %</TableCell>

                                    <TableCell  className="TableHeadFormat"  title="Qty of 100"  align="center">Net PnL</TableCell>

                                </TableRow>
                            </TableHead>
                            <TableBody style={{width:"",whiteSpace: "nowrap"}}>


                                { this.state.backTestResult ? this.state.backTestResult.map((row, i) => (
                                   
                                 

                                //    style={{display: row.orderActivated ? 'visible' : 'none'}}
                                 <TableRow key={i} >
                                      
                                        <TableCell align="left">{i+1}</TableCell>
                                        <TableCell align="center">{row.symbol}</TableCell>
                                        <TableCell align="center">{row.foundAt}</TableCell>
                                        <TableCell align="center">{row.buyExitPrice}</TableCell>

                                        <TableCell align="center" {...sumSellEntyPrice = sumSellEntyPrice + parseFloat(row.sellEntyPrice * row.quantity) }>{row.sellEntyPrice}({row.quantity})</TableCell>
                                        <TableCell align="center">{row.squareOffAt}</TableCell>
                                        <TableCell align="center">{row.stopLoss}</TableCell>
                                        <TableCell style={{color: row.perChange > 0 ? "darkmagenta" : "#00cbcb"}} align="center" {...sumPerChange = sumPerChange + parseFloat(row.perChange || 0) }> <b>{row.perChange}%</b></TableCell>
                                        <TableCell  style={{color: "#00cbcb"}} align="center" {...sumBrokeragePer = sumBrokeragePer + parseFloat(row.brokerageCharges) }>{row.brokerageCharges}%</TableCell>

                                        <TableCell style={{color: (row.perChange - row.brokerageCharges) > 0 ? "darkmagenta" : "#00cbcb"}} align="center" {...netSumPerChange = netSumPerChange + parseFloat(row.perChange - row.brokerageCharges) }> <b>{(row.perChange - row.brokerageCharges).toFixed(2)}%</b></TableCell>
                    
                                        <TableCell {...sumPnlValue = sumPnlValue + ((row.sellEntyPrice * (row.perChange - row.brokerageCharges)/100) * row.quantity)} style={{color: ((row.sellEntyPrice * (row.perChange - row.brokerageCharges)/100) * row.quantity) > 0 ? "darkmagenta" : "#00cbcb"}} align="center" > <b>{((row.sellEntyPrice * (row.perChange - row.brokerageCharges)/100) * row.quantity).toFixed(2)}</b></TableCell>

                                    </TableRow>



                                )):''}


                                <TableRow >

                                <TableCell align="center">Total</TableCell>
                                <TableCell align="left"> </TableCell>
                                <TableCell align="left"> </TableCell>

                                <TableCell align="center"><b>{sumSellEntyPrice.toFixed(2)}</b></TableCell>
                                <TableCell align="left"> </TableCell>
                                <TableCell align="left"> </TableCell>

                                <TableCell align="left"> </TableCell>


                                <TableCell style={{color: sumPerChange > 0 ? "darkmagenta" : "#00cbcb"}} align="center"><b>{sumPerChange.toFixed(2)}%</b></TableCell>
                               <TableCell style={{color: "#00cbcb"}} align="center"><b>-{(sumBrokeragePer).toFixed(2)}%</b></TableCell>
                                <TableCell style={{color: netSumPerChange > 0 ? "darkmagenta" : "#00cbcb"}} align="center"><b>{(netSumPerChange).toFixed(2)}%</b></TableCell>

                                <TableCell style={{color: sumPnlValue > 0 ? "darkmagenta" : "#00cbcb"}} align="center"><b>{(sumPnlValue).toFixed(2)}</b></TableCell>

                                
                                </TableRow>
                            </TableBody>
                        </Table>


                        <b> Average gross/trade PnL: </b> <b style={{color: netSumPerChange > 0 ? "darkmagenta" : "#00cbcb"}} >{(sumPerChange/this.state.backTestResult.length).toFixed(2)}%</b>





                        </Paper>


                        

                        {/* <Position /> */}
                        </Grid>

                        

                        
                        </Grid>
                    </Grid>


                            


                
                
                </Grid>
               
            </React.Fragment>
        )


    }


}


const styles ={
    formContainer : {
        display: 'flex',
        flexFlow: 'row wrap'
    },

    textStyle :{
        display: 'flex',
        justifyContent: 'center'

    },
    imgStyle:{
        display:'flex'
    }, 

    selectStyle:{
        minWidth: '100%',
        marginBottom: '10px'
    },
    MuiTextField:{
        overflowY: 'scroll',
        fontSize:"12px", 
        maxHeight:"50px",
        
    },
    footerButton: {
        position: 'fixed',
        left: 0,
        bottom: '20px',
        width: '100%',
        textAlign: 'right'
    }

};

export default Home;