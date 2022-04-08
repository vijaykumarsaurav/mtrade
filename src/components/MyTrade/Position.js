import React from 'react';
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AdminService from "../service/AdminService";
import Grid from '@material-ui/core/Grid';
import PostLoginNavBar from "../PostLoginNavbar";
import { resolveResponse } from "../../utils/ResponseHandler";
import Paper from '@material-ui/core/Paper';
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import * as moment from 'moment';
import OrderBook from './Orderbook';
import OrderWatchlist from './OrderWatchlist';
import TradeConfig from './TradeConfig.json';
import ChartDialog from './ChartDialog';
import ChartMultiple from './ChartMultiple';
import RefreshIcon from '@material-ui/icons/Refresh';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import Notify from "../../utils/Notify";
import ShowChartIcon from '@material-ui/icons/ShowChart';
import TextField from "@material-ui/core/TextField";
import CommonOrderMethod from "../../utils/CommonMethods";
import CommonMethods from '../../utils/CommonMethods';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            positionList: [],
            autoSearchList: [],
            InstrumentLTP: {},
            autoSearchTemp: [],
            foundPatternList: [], //localStorage.getItem('foundPatternList') && JSON.parse(localStorage.getItem('foundPatternList')) || [], 
            symboltoken: "",
            tradingsymbol: "",
            buyPrice: 0,
            quantity: 1,
            producttype: "DELIVERY",
            nr4TotalPer: 0,
            pnlAmountTotal: 0,
            totalNetProfit: 0,
            totelActivatedCount: 0,
            totalBrokerChargesNR4: 0,
            stockTesting: "",
            perHighLowTotal: 0,
            netPnLAmountOnHighlowTotal: 0,
            firstTimeMove : 0.6, 
            firstTimeSLMove: 0.5, 
            nextTimeMove : 0.6, 
            nextTimeSLMove: 0.3,
            firstTimeMoveOption : 10, 
            firstTimeSLMoveOption: 3, 
            nextTimeMoveOption : 10, 
            nextTimeSLMoveOption: 3,
            staticData: localStorage.getItem('staticData') && JSON.parse(localStorage.getItem('staticData')) || {},
            trackSLPrice: localStorage.getItem('trackSLPrice') && JSON.parse(localStorage.getItem('trackSLPrice')) || [], 
            enableSLMOrderUi:false,
            addSLInfo : {}, 
            niftyLtpSec: [],
            bnniftyLtpSec:[]
        };
    }
    componentDidMount() {

        this.updateOrderList(); 

        var beginningTime = moment('9:15am', 'h:mma');
        var endTime = moment('3:30pm', 'h:mma');
        const friday = 5; // for friday
        var currentTime = moment(new Date(), "h:mma");
        const today = moment().isoWeekday();
        //market hours
        if (today <= friday && currentTime.isBetween(beginningTime, endTime)) {
            this.setState({ positionInterval: setInterval(() => { this.getPositionData(); }, 1000) })
              this.setState({bankNiftyInterval :  setInterval(() => {this.getNiftyLTP(); this.getBankNiftyLTP(); }, 1000)}) 

            var squireInterval = setInterval(() => {
                let sqrOffbeginningTime = moment('3:14pm', 'h:mma');
                let sqrOffendTime = moment('3:15pm', 'h:mma');
                let sqrOffcurrentTime = moment(new Date(), "h:mma");
            
                if (sqrOffcurrentTime.isBetween(sqrOffbeginningTime, sqrOffendTime)) {
                    this.state.positionList.forEach((element, i)=> {
                        if(element.netqty > 0 || element.netqty < 0){
                            this.squareOff(element);
                        }
                        if(this.state.positionList.length == i+1){
                            clearInterval(squireInterval);
                            console.log("squireInterval ended"); 
                        }
                    });
                } 
            }, 5000);

        } else {
            clearInterval(this.state.positionInterval);
           // clearInterval(this.state.bankNiftyInterval);
        }

        var scanendTime = moment('3:30pm', 'h:mma');
        if (today <= friday && currentTime.isBetween(beginningTime, scanendTime)) {
            // setInterval(() => {
            //     this.getNSETopStock(); 
            //   //  console.log('chartink scan call 2 sec:', new Date()) 
            // }, 2000)

            //this.setState({selectedStockInteval :  setInterval(() => {this.getMySelectedStock(); }, 5000)}) 

            // var tostartInteral =   setInterval(() => {
            //     var time = new Date(); 
            //     if(time.getMinutes() % 15 === 0){
            //         setTimeout(() => {
            //             this.getCandleHistoryAndStore(); 
            //         }, 70000);
            //         setInterval(() => {
            //                 if(today <= friday && currentTime.isBetween(beginningTime, scanendTime)){
            //                 this.getCandleHistoryAndStore(); 
            //             }
            //          }, 60000 * 15 + 70000 );  
            //          clearInterval(tostartInteral); 
            //     } 
            // }, 1000);


            // var foundPatternsFromStored = localStorage.getItem("FoundPatternList") ? JSON.parse(localStorage.getItem("FoundPatternList")) : [];
            // setInterval(() => {
            //     this.refreshLtpOnFoundPattern();
            // }, foundPatternsFromStored.length * 100 + 300000);

           
           
        }     
        
        // var oequaltolowOrder = setInterval(() => {
        //     var time = new Date(); 
        //     console.log("Open = low/high sanning & orderplace in at 9:20", time.toLocaleTimeString())
        //     if(time.getHours() === 9 && time.getMinutes()  >= 15 &&  time.getMinutes()  <= 30){
        //         this.checkOpenEqualToLow(); 
        //       //  clearInterval(oequaltolowOrder); 
        //     }
        //     if(time.getMinutes() > 30){
        //         clearInterval(oequaltolowOrder); 
        //     } 
        // }, 30000);
      
 

        // var tostartInteral = setInterval(() => {
        //     var time = new Date(); 
        //     console.log("chartink scanning in", time.toLocaleTimeString())
        //     if(time.getMinutes() % 5 === 0 && time.getSeconds() === 5){
        //         this.getChartInkStock(); 
        //     } 
        // }, 1000);
        
        // this.getChartInkStock(); 
        // this.getCandleHistoryAndStore(); 
        // this.findNR4PatternLive();
        // this.findNR7PatternLive();
        // this.getPositionData();
        // this.getNSETopStock();
        // this.getMySelectedStock();

        var backTestResult = localStorage.getItem("FoundPatternList") ? JSON.parse(localStorage.getItem("FoundPatternList")) : [];

        this.setState({ foundPatternList: backTestResult }); 
    }

    checkOpenEqualToLow = async () => {

        // if(window.confirm("Are you sure? searching and ordering in NIFTY 100")){
       
        // }

        var watchList = this.state.staticData['NIFTY 100']; //NIFTY 100 Securities in F&O

        this.setState({
            openEqualHighList: [], openEqualLowList: [], openEqualLowList: [], advanceShareCount: 0,
            declineShareCount: 0, UnchangeShareCount: 0, volumeCrossedList: [], closeingEqualHighList: []
        });

        for (let index = 0; index < watchList.length; index++) { //watchList.length
            const element = watchList[index];


            var isFound = false;
            for (let j = 0; j < this.state.positionList.length; j++) {
                if (this.state.positionList[j].tradingsymbol === element.symbol) {
                    isFound = true;
                }
            }
            if (!isFound) {
                var data = {
                    "exchange": element.exch_seg,
                    "tradingsymbol": element.symbol,
                    "symboltoken": element.token,
                }
                AdminService.getLTP(data).then(res => {
                    let resdata = resolveResponse(res, 'noPop');
                    var LtpData = resdata && resdata.data;
                    if (LtpData) {

                        let change = ((LtpData.ltp - LtpData.close) * 100 / LtpData.close).toFixed(2);
                        LtpData.nc = change;
                        LtpData.symbol = element.symbol;

                        if (LtpData && LtpData.open === LtpData.low) { //buy
                            //console.log("Open=Low", element.symbol, LtpData);
                            //var stopLossPrice = LtpData.low - (LtpData.low * TradeConfig.perTradeStopLossPer / 100);

                            const format1 = "YYYY-MM-DD HH:mm";
                            let enddate = moment(new Date());
                            let startDate = moment(enddate, "DD-MM-YYYY").subtract(7, 'days');

                            var data = {
                                "exchange": "NSE",
                                "symboltoken": element.token,
                                "interval": "ONE_DAY", //ONE_DAY FIVE_MINUTE    FIFTEEN_MINUTE
                                "fromdate": moment(startDate).format(format1),
                                "todate": moment(enddate).format(format1) //moment(this.state.endDate).format(format1) /
                            }

                            AdminService.getHistoryData(data).then(res => {
                                let histdata = resolveResponse(res, 'noPop');
                                //console.log("candle history", histdata); 
                                if (histdata && histdata.data && histdata.data.length) {

                                    var candleData = histdata.data;
                                    candleData.reverse();
                                    //    console.log("candleData",element, candleData);
                                    console.log("lastday", element, candleData[1]);
                                    let lastdayinfo = candleData[1];

                                    // console.log("Open=High", element.symbol, LtpData);                     
                                    //var stopLossPrice = LtpData.low - (LtpData.low * TradeConfig.perTradeStopLossPer / 100);

                                    if (LtpData.ltp > lastdayinfo[2]) {
                                       // let stopLossPrice = LtpData.low - (LtpData.low / 10) / 100;

                                        let stopLossPrice = lastdayinfo[3] - (lastdayinfo[3] / 10) / 100;
                                        stopLossPrice = this.getMinPriceAllowTick(stopLossPrice); //stopLossPrice
                                        let perTradeExposureAmt = TradeConfig.totalCapital * TradeConfig.perTradeExposurePer / 100;
                                        let quantity = 1// Math.floor(perTradeExposureAmt / LtpData.ltp);
                                        console.log(element.symbol + 'ltp ' + LtpData.ltp, "quantity", quantity, "stopLossPrice", stopLossPrice, "perTradeExposureAmt", perTradeExposureAmt);
                                        var orderOption = {
                                            transactiontype: 'BUY',
                                            tradingsymbol: element.symbol,
                                            symboltoken: element.token,
                                            buyPrice: 0,
                                            quantity: quantity,
                                            stopLossPrice: stopLossPrice
                                        }
                                        let mySL = 3.5;
                                        if (LtpData.ltp >= 200 && LtpData.ltp <= 10000 && stopLossPrice && quantity) {
                                            this.placeOrderMethod(orderOption);
                                        }
                                    }

                                } else {
                                    //localStorage.setItem('NseStock_' + symbol, "");
                                    console.log(" candle data emply");
                                }
                            })
                        }


                        if (LtpData && LtpData.open === LtpData.high) { //sell

                            const format1 = "YYYY-MM-DD HH:mm";
                            let enddate = moment(new Date());
                            let startDate = moment(enddate, "DD-MM-YYYY").subtract(7, 'days');

                            var data = {
                                "exchange": "NSE",
                                "symboltoken": element.token,
                                "interval": "ONE_DAY", //ONE_DAY FIVE_MINUTE    FIFTEEN_MINUTE
                                "fromdate": moment(startDate).format(format1),
                                "todate": moment(enddate).format(format1) //moment(this.state.endDate).format(format1) /
                            }

                            AdminService.getHistoryData(data).then(res => {
                                let histdata = resolveResponse(res, 'noPop');
                                //console.log("candle history", histdata); 
                                if (histdata && histdata.data && histdata.data.length) {

                                    var candleData = histdata.data;
                                    candleData.reverse();
                                    //    console.log("candleData",element, candleData);
                                    console.log("lastday", element, candleData[1]);
                                    let lastdayinfo = candleData[1];

                                    // console.log("Open=High", element.symbol, LtpData);                     
                                    //var stopLossPrice = LtpData.low - (LtpData.low * TradeConfig.perTradeStopLossPer / 100);

                                    if (LtpData.ltp < lastdayinfo[3]) {
                                      //  let stopLossPrice = LtpData.high + (LtpData.high / 10) / 100; //same day high sl 
                                        let stopLossPrice = lastdayinfo[2] + (lastdayinfo[2] / 10) / 100; //pre day high

                                        stopLossPrice = this.getMinPriceAllowTick(stopLossPrice);
                                        let perTradeExposureAmt = TradeConfig.totalCapital * TradeConfig.perTradeExposurePer / 100;
                                        let quantity = 1// Math.floor(perTradeExposureAmt / LtpData.ltp);
                                        console.log(element.symbol + 'ltp ' + LtpData.ltp, "quantity", quantity, "stopLossPrice", stopLossPrice, "perTradeExposureAmt", perTradeExposureAmt);
                                        var orderOption = {
                                            transactiontype: 'SELL',
                                            tradingsymbol: element.symbol,
                                            symboltoken: element.token,
                                            buyPrice: 0,
                                            quantity: quantity,
                                            stopLossPrice: stopLossPrice
                                        }
                                        let mySL = 3.5;
                                        if (LtpData.ltp >= 200 && LtpData.ltp <= 10000 && stopLossPrice && quantity) {
                                             this.placeOrderMethod(orderOption);
                                        }
                                    }

                                } else {
                                    //localStorage.setItem('NseStock_' + symbol, "");
                                    console.log(" candle data emply");
                                }
                            })


                        }

                    }
                })
            }

            
            await new Promise(r => setTimeout(r, 210));
        }
      

    }


    componentWillUnmount() {
        //clearInterval(this.state.positionInterval);
        // clearInterval(this.state.scaninterval);
        //  clearInterval(this.state.bankNiftyInterval); 
    }


    getCandleHistoryAndStore = async () => {

        console.log("getCandleHistoryAndStore called", new Date().toLocaleTimeString());
        var stop = new Date().toLocaleTimeString() > "15:00:00" ? clearInterval(this.state.candleHistoryInterval) : "";
        var watchList = localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList'))
        const today = moment().isoWeekday();
        var timediff = '';



        if (new Date().toLocaleTimeString() > "10:05:00") {
            timediff = moment.duration("00:50:00");
        } else if (today === 1 && new Date().toLocaleTimeString() < "10:05:00") {
            timediff = moment.duration("66:00:00");
        } else {
            timediff = moment.duration("19:00:00");
        }
        timediff = moment.duration("21:00:00");

        const format1 = "YYYY-MM-DD HH:mm";
        var startdate = moment(new Date()).subtract(timediff);

        for (let index = 0; index < watchList.length; index++) {
            const element = watchList[index];
            var data = {
                "exchange": "NSE",
                "symboltoken": element.token,
                "interval": "FIFTEEN_MINUTE", //ONE_DAY FIVE_MINUTE    FIFTEEN_MINUTE
                "fromdate": moment(startdate).format(format1),
                "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
            }

            AdminService.getHistoryData(data).then(res => {
                let histdata = resolveResponse(res, 'noPop');
                //console.log("candle history", histdata); 
                if (histdata && histdata.data && histdata.data.length) {

                    var candleData = histdata.data;
                    candleData.reverse();

                    if (candleData && candleData.length >= 10) {
                        var last10Candle = candleData.slice(0, 10);
                        console.log('', index + 1, element.symbol, 'Time', new Date().toLocaleTimeString());
                        this.findTweezerTopPatternLive(last10Candle, element.symbol);
                        this.findTweezerBottomPatternLive(last10Candle, element.symbol);

                        //console.log(index+1, element.symbol, 'verifying TT pattern'); 
                    }

                    // var data = {
                    //     data : candleData, 
                    //     token: element.token,
                    //     symbol: element.symbol
                    // }
                    // AdminService.saveCandleHistory(data).then(storeRes=>{
                    //     console.log("storeRes", new Date().toLocaleTimeString(),storeRes); 
                    // }); 

                } else {
                    //localStorage.setItem('NseStock_' + symbol, "");
                    console.log(" candle data emply");
                }
            })
            await new Promise(r => setTimeout(r, 350));
        }


    }

    findTweezerTopPatternLive = (candleHist, symbol) => {

        //   console.log("TweezerTop finding", symbol); 
        if (candleHist && candleHist.length > 0) {
            //candleHist = candleHist.reverse(); 
            // console.log(symbol, " TweezerTop candleHist",candleHist, new Date().toString()); 


            var maxHigh = candleHist[2] && candleHist[2][2], maxLow = candleHist[2] && candleHist[2][3];
            for (let index = 3; index < candleHist.length; index++) {
                if (maxHigh < candleHist[index][2])
                    maxHigh = candleHist[index][2];
                if (candleHist[index][3] < maxLow)
                    maxLow = candleHist[index][3];
            }

            var lastTrendCandleLow = candleHist[9][3];
            var firstTrendCandleHigh = candleHist[2][2];

            var firstCandle = {
                time: candleHist[0] && candleHist[0][0],
                open: candleHist[0] && candleHist[0][1],
                high: candleHist[0] && candleHist[0][2],
                low: candleHist[0] && candleHist[0][3],
                close: candleHist[0] && candleHist[0][4]
            }
            var secondCandle = {
                time: candleHist[1] && candleHist[1][0],
                open: candleHist[1] && candleHist[1][1],
                high: candleHist[1] && candleHist[1][2],
                low: candleHist[1] && candleHist[1][3],
                close: candleHist[1] && candleHist[1][4]
            }

            var diffPer = (firstTrendCandleHigh - lastTrendCandleLow) * 100 / lastTrendCandleLow;
            var lowestOfBoth = secondCandle.low < firstCandle.low ? secondCandle.low : firstCandle.low;
            var highestOfBoth = secondCandle.high < firstCandle.high ? secondCandle.high : firstCandle.high;
            //uptrend movement 1.5% 
            //        console.log(symbol, "last 8 candle diff% ",  diffPer, "10th Low", lastTrendCandleLow,"3rd high", firstTrendCandleHigh, candleHist);

            //
            if (diffPer >= 1.5 && maxHigh < highestOfBoth && maxLow < lowestOfBoth) {
                //1st candle green & 2nd candle is red check
                if (secondCandle.open < secondCandle.close && firstCandle.open > firstCandle.close) {
                    // console.log(symbol, "candleHist",candleHist); 
                    //  console.log(symbol, "last 8th candle diff% ",  diffPer, "10th Low", lastTrendCandleLow,"3rd high", firstTrendCandleHigh);
                    //  console.log(symbol, 'making twisser 1st green & 2nd red' , firstCandle, secondCandle );

                    if (Math.round(secondCandle.close) == Math.round(firstCandle.open) || Math.round(secondCandle.open) == Math.round(firstCandle.close)) {

                        // console.log(symbol, "last 8th candle diff% ",  diffPer, "10th Low", lastTrendCandleLow,"3rd high", firstTrendCandleHigh);

                        console.log('%c' + symbol + ' perfect twisser top  upside movement' + diffPer + new Date(candleHist[0][0]).toLocaleTimeString(), 'background: red; color: #bada55');

                        var ttophistCandle = [];
                        candleHist.forEach(element => {
                            ttophistCandle.push([element[0], element[1], element[2], element[3], element[4]]);
                        });
                        var foundData = {
                            symbol: symbol,
                            pattenName: 'Twisser Top',
                            time: new Date(candleHist[0][0]).toLocaleString(),
                            candleChartData: ttophistCandle
                        }
                        var foundPatternList = localStorage.getItem("foundPatternList") ? JSON.parse(localStorage.getItem("foundPatternList")) : [];
                        foundPatternList.push(foundData);
                        localStorage.setItem('foundPatternList', JSON.stringify(foundPatternList));

                        this.setState({ foundPatternList: [...this.state.foundPatternList, foundData] })
                        //    console.log('%c' + new Date( candleHist[0][0]).toString(), 'color: green'); 
                        //    console.log(symbol, "maxHigh", maxHigh, "maxLow", maxLow);                 
                        console.log(symbol, "last10Candle", candleHist);
                        //      console.log(symbol, 'perfect twisser top done close=open || open=close', );

                        // var msg = new SpeechSynthesisUtterance();
                        // msg.text = 'twisser top in ' + symbol.toLowerCase();
                        // window.speechSynthesis.speak(msg);
                    }
                }
            }
        }
    }
    findTweezerBottomPatternLive = (candleHist, symbol) => {
        // console.log("TweezerBottom finding", symbol); 
        if (candleHist && candleHist.length > 0) {
            //candleHist = candleHist.reverse(); 
            // console.log(symbol, "candleHist",candleHist, new Date().toString()); 


            var maxHigh = candleHist[2] && candleHist[2][2], maxLow = candleHist[2] && candleHist[2][3];
            for (let index = 3; index < candleHist.length; index++) {
                if (maxHigh < candleHist[index][2])
                    maxHigh = candleHist[index][2];
                if (candleHist[index][3] < maxLow)
                    maxLow = candleHist[index][3];
            }

            var last8candleHigh = candleHist[9][2];
            var last8candleLow = candleHist[2][3];

            var firstCandle = {
                time: candleHist[0] && candleHist[0][0],
                open: candleHist[0] && candleHist[0][1],
                high: candleHist[0] && candleHist[0][2],
                low: candleHist[0] && candleHist[0][3],
                close: candleHist[0] && candleHist[0][4]
            }
            var secondCandle = {
                time: candleHist[1] && candleHist[1][0],
                open: candleHist[1] && candleHist[1][1],
                high: candleHist[1] && candleHist[1][2],
                low: candleHist[1] && candleHist[1][3],
                close: candleHist[1] && candleHist[1][4]
            }

            var diffPer = ((last8candleLow - last8candleHigh) * 100 / last8candleHigh).toFixed(2);
            var lowestOfBoth = secondCandle.low < firstCandle.low ? secondCandle.low : firstCandle.low;
            var highestOfBoth = secondCandle.high < firstCandle.high ? secondCandle.high : firstCandle.high;
            //uptrend movement 1.5%  

            //  
            if (diffPer <= -1.5 && highestOfBoth < maxHigh && lowestOfBoth < maxLow) {


                //1st candle green & 2nd candle is red check
                if (secondCandle.open > secondCandle.close && firstCandle.close > firstCandle.open) {
                    // console.log(symbol, "candleHist",candleHist); 
                    //  console.log(symbol, "last 8th candle diff% ",  diffPer, "10th Low", lastTrendCandleLow,"3rd high", last8candleLow);
                    //  console.log(symbol, 'making twisser 1st green & 2nd red' , firstCandle, secondCandle );

                    if (Math.round(secondCandle.close) == Math.round(firstCandle.open) || Math.round(secondCandle.open) == Math.round(firstCandle.close)) {


                        //console.log(symbol, "last 8 candle diff ",  diffPer+"% ", "10th high", last8candleHigh,"3rd low", last8candleLow, candleHist);

                        var tBophistCandle = [];
                        candleHist.forEach(element => {
                            tBophistCandle.push([element[0], element[1], element[2], element[3], element[4]]);
                        });

                        console.log('%c' + symbol + ' perfect twisser bottom downside movement diff ' + diffPer + "% " + new Date(candleHist[0][0]).toLocaleTimeString(), 'background: #222; color: #bada55');
                        var foundData = {
                            symbol: symbol,
                            pattenName: 'Twisser bottom',
                            time: new Date(candleHist[0][0]).toLocaleString(),
                            candleChartData: tBophistCandle
                        }

                        this.setState({ foundPatternList: [...this.state.foundPatternList, foundData] })

                        var foundPatternList = localStorage.getItem("foundPatternList") ? JSON.parse(localStorage.getItem("foundPatternList")) : [];
                        foundPatternList.push(foundData);
                        localStorage.setItem('foundPatternList', JSON.stringify(foundPatternList));

                        //   console.log(symbol, "maxHigh", maxHigh, "maxLow", maxLow);                 
                        console.log(symbol, "last10Candle", candleHist);
                        //   console.log(symbol, 'perfect twisser bottom done close=open || open=close', new Date( candleHist[0][0]).toString());

                        // var msg = new SpeechSynthesisUtterance();
                        // msg.text = 'twisser bottom in ' + symbol.toLowerCase();
                        // window.speechSynthesis.speak(msg);
                    }
                }
            }
        }
    }

    findNR4PatternLive = async () => {

        console.log('nr4 scaning starting');

        this.setState({ backTestResult: [], backTestFlag: false });

        var watchList = localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')) || [];
        var runningTest = 1, sumPercentage = 0;
        for (let index = 0; index < watchList.length; index++) {
            const element = watchList[index];

            var startdate = '';

            var timediff = moment.duration("240:00:00");
            startdate = moment(new Date()).subtract(timediff);

            var timediffend = moment.duration("24:00:00");
            var enddateLastday = moment(new Date()).subtract(timediffend);

            var data = {
                "exchange": "NSE",
                "symboltoken": element.token,
                "interval": "ONE_DAY", //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
                "fromdate": moment(startdate).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
                "todate": moment(new Date()).format("YYYY-MM-DD HH:mm") // moment("2020-06-30 14:00").format("YYYY-MM-DD HH:mm") 
            }

            AdminService.getHistoryData(data).then(res => {
                let histdata = resolveResponse(res, 'noPop');

                //console.log("candle history", histdata); 
                if (histdata && histdata.data && histdata.data.length) {

                    var candleData = histdata.data; var rgrangeCount = 0;
                    candleData.reverse();

                    // var startindex = index2 * 10; 
                    var last4Candle = candleData.slice(1, 5);
                    var last5Candle = candleData.slice(0, 5);
                    // var next10Candle = candleData.slice(index2+5 , index2+35 );    

                    // console.log(element.symbol, 'backside',  last10Candle, '\n forntside',  next10Candle);

                    if (last4Candle.length >= 4) {

                        // last4Candle.reverse();

                        var rangeArr = [], candleChartData = [];
                        last4Candle.forEach(element => {
                            rangeArr.push(element[2] - element[3]);
                        });

                        last5Candle.forEach(element => {
                            candleChartData.push([element[0], element[1], element[2], element[3], element[4]]);
                        });
                        var firstElement = rangeArr[0];
                        rangeArr.forEach(element => {
                            if (firstElement <= element) {
                                firstElement = element;
                                rgrangeCount += 1;
                            }
                        });

                        console.log(index + 1, element.symbol, rgrangeCount);
                        //  this.setState({stockTesting :index +" "+ element.symbol })



                        if (rgrangeCount == 4) {
                            console.log(index + 1, element.symbol, last4Candle, rangeArr, rgrangeCount);


                            var firstCandle = last4Candle[0];

                            //var buyentry = (firstCandle[2] + (firstCandle[2] - firstCandle[3])/4).toFixed(2);
                            var buyentry = (firstCandle[2] + (firstCandle[2] / 100 / 10)).toFixed(2);

                            //var sellenty = (firstCandle[3] - (firstCandle[2] - firstCandle[3])/4).toFixed(2); 
                            var sellenty = (firstCandle[3] - (firstCandle[3] / 100 / 10)).toFixed(2);


                            var data = {
                                "exchange": "NSE",
                                "tradingsymbol": element.symbol,
                                "symboltoken": element.token,
                            }

                            console.log('nr4 ltp', data);

                            AdminService.getLTP(data).then(res => {
                                let data = resolveResponse(res, 'noPop');
                                var LtpData = data && data.data;
                                console.log(LtpData, data);
                                if (LtpData && LtpData.ltp) {


                                    var orderActivated = <span> {LtpData.ltp} </span>;
                                    var quantity = 0, pnlAmount = 0, netPnLAmount = 0, perChange, brokerageCharges = 0.06;
                                    if (LtpData.ltp > buyentry) {
                                        orderActivated = <span style={{ color: 'green' }}> Long: {LtpData.ltp} ({((LtpData.ltp - buyentry) * 100 / buyentry).toFixed(2)}%) </span>;
                                        this.setState({ nr4TotalPer: this.state.nr4TotalPer + ((LtpData.ltp - buyentry) * 100 / buyentry) })
                                        this.setState({ totelActivatedCount: this.state.totelActivatedCount + 1 });

                                        let perTradeExposureAmt = TradeConfig.totalCapital * TradeConfig.perTradeExposurePer / 100;
                                        quantity = Math.floor(perTradeExposureAmt / buyentry);
                                        perChange = (LtpData.ltp - buyentry) * 100 / buyentry;
                                        pnlAmount = ((LtpData.ltp - buyentry) * quantity).toFixed(2);
                                        netPnLAmount = ((buyentry * (perChange - brokerageCharges) / 100) * quantity).toFixed(2);


                                    }
                                    if (LtpData.ltp < sellenty) {
                                        orderActivated = <span style={{ color: 'red' }}> Short: {LtpData.ltp} ({((LtpData.ltp - sellenty) * 100 / sellenty).toFixed(2)}%)</span>;
                                        this.setState({ nr4TotalPer: this.state.nr4TotalPer + ((sellenty - LtpData.ltp) * 100 / sellenty) })
                                        this.setState({ totelActivatedCount: this.state.totelActivatedCount + 1 });
                                        let perTradeExposureAmt = TradeConfig.totalCapital * TradeConfig.perTradeExposurePer / 100;
                                        quantity = Math.floor(perTradeExposureAmt / sellenty);
                                        pnlAmount = ((sellenty - LtpData.ltp) * quantity).toFixed(2);
                                        perChange = (sellenty - LtpData.ltp) * 100 / sellenty;
                                        netPnLAmount = ((sellenty * (perChange - brokerageCharges) / 100) * quantity).toFixed(2);

                                    }

                                    var foundData = {
                                        symbol: element.symbol,
                                        token: element.token,
                                        pattenName: 'NR4',
                                        time: new Date(firstCandle[0]).toLocaleString(),
                                        BuyAt: buyentry,
                                        SellAt: sellenty,
                                        orderActivated: orderActivated,
                                        candleChartData: candleChartData,
                                        quantity: quantity,
                                        brokerageCharges: brokerageCharges,
                                        pnlAmount: pnlAmount,
                                        netPnLAmount: netPnLAmount,
                                        perChange: perChange
                                    }

                                    console.log('nr4 scaned', foundData);
                                    this.setState({ foundPatternList: [...this.state.foundPatternList, foundData] })


                                    var foundPatternList = localStorage.getItem("foundPatternList") ? JSON.parse(localStorage.getItem("foundPatternList")) : [];
                                    foundPatternList.push(foundData);
                                    localStorage.setItem('foundPatternList', JSON.stringify(foundPatternList));

                                }

                            })





                        }

                    }

                } else {
                    //localStorage.setItem('NseStock_' + symbol, "");
                    console.log(element.symbol, " candle data emply");
                }
            })



            await new Promise(r => setTimeout(r, 300));

            // var showtestdata = (index + 1);

            //   console.log("beforawait", showtestdata, element.symbol);

            //     this.setState({ stockTesting: showtestdata});
        }
        this.setState({ backTestFlag: true });
        console.log("sumPercentage", sumPercentage)
    }

    findNR7PatternLive = async () => {

        console.log('nr7 scaning starting');

        this.setState({ backTestResult: [], backTestFlag: false });

        var watchList = localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')) || [];
        var runningTest = 1, sumPercentage = 0;
        for (let index = 0; index < watchList.length; index++) {
            const element = watchList[index];

            var startdate = '';

            var timediff = moment.duration("288:00:00");
            startdate = moment(new Date()).subtract(timediff);

            var timediffend = moment.duration("24:00:00");
            var enddateLastday = moment(new Date()).subtract(timediffend);

            var data = {
                "exchange": "NSE",
                "symboltoken": element.token,
                "interval": "ONE_DAY", //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
                "fromdate": moment(startdate).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
                "todate": moment(new Date()).format("YYYY-MM-DD HH:mm") // moment("2020-06-30 14:00").format("YYYY-MM-DD HH:mm") 
            }

            AdminService.getHistoryData(data).then(res => {
                let histdata = resolveResponse(res, 'noPop');

                //console.log("candle history", histdata); 
                if (histdata && histdata.data && histdata.data.length) {

                    var candleData = histdata.data;
                    candleData.reverse();

                    // var startindex = index2 * 10; 
                    var last7Candle = candleData.slice(1, 8);
                    var last9Candle = candleData.slice(0, 9);
                    // var next10Candle = candleData.slice(index2+5 , index2+35 );    

                    // console.log(element.symbol, 'backside',  last10Candle, '\n forntside',  next10Candle);

                    if (last7Candle.length >= 7) {

                        // last7Candle.reverse();

                        var rangeArr = [], candleChartData = [];
                        last7Candle.forEach(element => {
                            rangeArr.push(element[2] - element[3]);
                        });

                        last9Candle.forEach(element => {
                            candleChartData.push([element[0], element[1], element[2], element[3], element[4]]);
                        });
                        var firstElement = rangeArr[0], rgrangeCount = 0;
                        rangeArr.forEach(element => {
                            if (firstElement <= element) {
                                firstElement = element;
                                rgrangeCount += 1;
                            }
                        });


                        console.log(element.symbol, last7Candle, rangeArr, rgrangeCount);


                        if (rgrangeCount == 7) {


                            var firstCandle = last7Candle[0];

                            //var buyentry = (firstCandle[2] + (firstCandle[2] - firstCandle[3])/4).toFixed(2);
                            var buyentry = (firstCandle[2] + (firstCandle[2] / 100 / 10)).toFixed(2);

                            //var sellenty = (firstCandle[3] - (firstCandle[2] - firstCandle[3])/4).toFixed(2); 
                            var sellenty = (firstCandle[3] - (firstCandle[3] / 100 / 10)).toFixed(2);


                            var data = {
                                "exchange": "NSE",
                                "tradingsymbol": element.symbol,
                                "symboltoken": element.token,
                            }

                            console.log('nr4 ltp', data);

                            AdminService.getLTP(data).then(res => {
                                let data = resolveResponse(res, 'noPop');
                                var LtpData = data && data.data;
                                console.log(LtpData, data);
                                if (LtpData && LtpData.ltp) {


                                    var orderActivated = <span> {LtpData.ltp} </span>;
                                    var quantity = 0, pnlAmount = 0, netPnLAmount = 0, perChange, brokerageCharges = 0.06;
                                    if (LtpData.ltp > buyentry) {
                                        orderActivated = <span style={{ color: 'green' }}> Long: {LtpData.ltp} ({((LtpData.ltp - buyentry) * 100 / buyentry).toFixed(2)}%) </span>;
                                        this.setState({ nr4TotalPer: this.state.nr4TotalPer + ((LtpData.ltp - buyentry) * 100 / buyentry) })
                                        this.setState({ totelActivatedCount: this.state.totelActivatedCount + 1 });

                                        let perTradeExposureAmt = TradeConfig.totalCapital * TradeConfig.perTradeExposurePer / 100;
                                        quantity = Math.floor(perTradeExposureAmt / buyentry);
                                        perChange = (LtpData.ltp - buyentry) * 100 / buyentry;
                                        pnlAmount = ((LtpData.ltp - buyentry) * quantity).toFixed(2);
                                        netPnLAmount = ((buyentry * (perChange - brokerageCharges) / 100) * quantity).toFixed(2);


                                    }
                                    if (LtpData.ltp < sellenty) {
                                        orderActivated = <span style={{ color: 'red' }}> Short: {LtpData.ltp} ({((LtpData.ltp - sellenty) * 100 / sellenty).toFixed(2)}%)</span>;
                                        this.setState({ nr4TotalPer: this.state.nr4TotalPer + ((sellenty - LtpData.ltp) * 100 / sellenty) })
                                        this.setState({ totelActivatedCount: this.state.totelActivatedCount + 1 });
                                        let perTradeExposureAmt = TradeConfig.totalCapital * TradeConfig.perTradeExposurePer / 100;
                                        quantity = Math.floor(perTradeExposureAmt / sellenty);
                                        pnlAmount = ((sellenty - LtpData.ltp) * quantity).toFixed(2);
                                        perChange = (sellenty - LtpData.ltp) * 100 / sellenty;
                                        netPnLAmount = ((sellenty * (perChange - brokerageCharges) / 100) * quantity).toFixed(2);

                                    }

                                    var foundData = {
                                        symbol: element.symbol,
                                        token: element.token,
                                        pattenName: 'NR7',
                                        time: new Date(firstCandle[0]).toLocaleString(),
                                        BuyAt: buyentry,
                                        SellAt: sellenty,
                                        orderActivated: orderActivated,
                                        candleChartData: candleChartData,
                                        quantity: quantity,
                                        brokerageCharges: brokerageCharges,
                                        pnlAmount: pnlAmount,
                                        netPnLAmount: netPnLAmount,
                                        perChange: perChange
                                    }

                                    console.log('nr7 scaned', foundData);
                                    this.setState({ foundPatternList: [...this.state.foundPatternList, foundData] })


                                    var foundPatternList = localStorage.getItem("foundPatternList") ? JSON.parse(localStorage.getItem("foundPatternList")) : [];
                                    foundPatternList.push(foundData);
                                    localStorage.setItem('foundPatternList', JSON.stringify(foundPatternList));

                                }

                            })





                        }

                    }

                } else {
                    //localStorage.setItem('NseStock_' + symbol, "");
                    console.log(element.symbol, " candle data emply");
                }
            })
            var showtestdata = (index + 1) + ". " + element.symbol;
            this.setState({ stockTesting: showtestdata });
            await new Promise(r => setTimeout(r, 300));
        }
        this.setState({ backTestFlag: true });
        console.log("sumPercentage", sumPercentage)
    }

    refreshCandleChartManually = async (row) => {

        var beginningTime = moment('9:15am', 'h:mma');
        var time = moment.duration("12:00:00");
        var startdate = moment(new Date()).subtract(time);

        var data = {
            "exchange": "NSE",
            "symboltoken": row.symboltoken,
            "interval": "FIVE_MINUTE", //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
            "fromdate": moment(beginningTime).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
            "todate": moment(new Date()).format("YYYY-MM-DD HH:mm") // moment("2020-06-30 14:00").format("YYYY-MM-DD HH:mm") 
        }
        AdminService.getHistoryData(data).then(res => {
            let histdata = resolveResponse(res, 'noPop');
            //console.log("candle history", histdata); 
            if (histdata && histdata.data && histdata.data.length) {

                var candleChartData = [];
                histdata.data.forEach(element => {
                    candleChartData.push([element[0], element[1], element[2], element[3], element[4]]);
                });


                localStorage.setItem('candleChangeShow', ((row.ltp - row.close) * 100 / row.close).toFixed(2));


                localStorage.setItem('candleChartData', JSON.stringify(candleChartData))
                localStorage.setItem('cadleChartSymbol', row.symbolname);
                document.getElementById('showCandleChart').click();

            } else {
                //localStorage.setItem('NseStock_' + symbol, "");
                console.log(row.symboltoken, "  emply candle found");
            }
        }).catch(error => {
            this.setState({ failedCount: this.state.failedCount + 1 });
            Notify.showError(row.symboltoken + " candle failed!");
        })

    }

    showCandleChart = (candleData, symbol) => {

        candleData = candleData && candleData.reverse();
        localStorage.setItem('candleChartData', JSON.stringify(candleData))
        localStorage.setItem('cadleChartSymbol', symbol)
        document.getElementById('showCandleChart').click();
    }

    showMultipleCandleChart = (row) => {
        localStorage.setItem('multipleChartData', JSON.stringify(row))
        document.getElementById('showMultipleChart').click();
    }

    refreshLtpOnFoundPattern = async () => {

        this.setState({ nr4TotalPer: 0, totalBrokerChargesNR4: 0, totalNetProfit: 0, totelActivatedCount: 0, pnlAmountTotal: 0, perHighLowTotal: 0, netPnLAmountOnHighlowTotal: 0 });


        var foundPatternList = this.state.foundPatternList;

        this.setState({ foundPatternList: [] });

        var foundPatternsFromStored = localStorage.getItem("FoundPatternList") ? JSON.parse(localStorage.getItem("FoundPatternList")) : [];


        //       foundPatternList.forEach(element => {
        for (let index = 0; index < foundPatternsFromStored.length; index++) {
            const element = foundPatternList[index];

            if (element && element.pattenName == 'NR4') {

                var data = {
                    "exchange": "NSE",
                    "tradingsymbol": element.symbol,
                    "symboltoken": element.token,
                }

                AdminService.getLTP(data).then(res => {
                    let data = resolveResponse(res, 'noPop');
                    var LtpData = data && data.data;
                    //console.log(LtpData);
                    var quantity = 0, pnlAmount = 0, netPnLAmount = 0, brokerageCharges = 0.06, perChange = 0, perChangeOnHighLow = 0, netPnLAmountOnHighlow = 0;
                    if (LtpData && LtpData.ltp) {

                        var orderActivated = <span> {LtpData.ltp} </span>;

                        if (LtpData.ltp > element.BuyAt) {
                            perChange = ((LtpData.ltp - element.BuyAt) * 100 / element.BuyAt);
                            orderActivated = <span style={{ color: 'green' }}> Long: {perChange.toFixed(2)}% </span>;
                            quantity = Math.floor(10000 / element.BuyAt);
                            pnlAmount = ((LtpData.ltp - element.BuyAt) * quantity);
                            brokerageCharges = (((element.BuyAt * quantity) * brokerageCharges / 100) * 2);
                            netPnLAmount = (pnlAmount - brokerageCharges);
                            this.setState({ nr4TotalPer: this.state.nr4TotalPer + perChange });
                            this.setState({ totalBrokerChargesNR4: this.state.totalBrokerChargesNR4 + brokerageCharges, totalNetProfit: this.state.totalNetProfit + netPnLAmount });
                            this.setState({ totelActivatedCount: this.state.totelActivatedCount + 1, pnlAmountTotal: this.state.pnlAmountTotal + pnlAmount });

                            perChangeOnHighLow = ((LtpData.high - element.BuyAt) * 100 / element.BuyAt);
                            var pnlAmountOnhigh = ((LtpData.high - element.BuyAt) * quantity);
                            netPnLAmountOnHighlow = (pnlAmountOnhigh - brokerageCharges);
                            this.setState({ perHighLowTotal: this.state.perHighLowTotal + perChangeOnHighLow, netPnLAmountOnHighlowTotal: this.state.netPnLAmountOnHighlowTotal + netPnLAmountOnHighlow });


                        }
                        if (LtpData.ltp < element.SellAt) {
                            perChange = ((element.SellAt - LtpData.ltp) * 100 / element.SellAt);
                            orderActivated = <span style={{ color: 'red' }}> Short: {perChange.toFixed(2)}%</span>;
                            quantity = Math.floor(10000 / element.SellAt);
                            pnlAmount = ((element.SellAt - LtpData.ltp) * quantity);
                            brokerageCharges = (((element.SellAt * quantity) * brokerageCharges / 100) * 2);
                            netPnLAmount = (pnlAmount - brokerageCharges);
                            this.setState({ nr4TotalPer: this.state.nr4TotalPer + perChange });
                            this.setState({ totelActivatedCount: this.state.totelActivatedCount + 1, pnlAmountTotal: this.state.pnlAmountTotal + pnlAmount });
                            this.setState({ totalBrokerChargesNR4: this.state.totalBrokerChargesNR4 + brokerageCharges, totalNetProfit: this.state.totalNetProfit + netPnLAmount });

                            perChangeOnHighLow = ((element.SellAt - LtpData.low) * 100 / element.SellAt);
                            var pnlAmountOnLow = ((element.SellAt - LtpData.low) * quantity);
                            netPnLAmountOnHighlow = (pnlAmountOnLow - brokerageCharges);
                            this.setState({ perHighLowTotal: this.state.perHighLowTotal + perChangeOnHighLow, netPnLAmountOnHighlowTotal: this.state.netPnLAmountOnHighlowTotal + netPnLAmountOnHighlow });

                        }

                        var todayChange = (LtpData.ltp - LtpData.close) * 100 / LtpData.close;


                        var builtupCandle = [new Date(), LtpData.open, LtpData.high, LtpData.low, LtpData.ltp];
                        element.candleChartData.push(builtupCandle);

                        var foundData = {
                            symbol: element.symbol,
                            symbolUpdated: LtpData.ltp + "(" + (todayChange).toFixed(2) + "%)",
                            token: element.token,
                            pattenName: 'NR4',
                            OnHighLowActivated: quantity ? perChangeOnHighLow.toFixed(2) + "% | " + netPnLAmountOnHighlow.toFixed(2) : "",
                            time: new Date().toLocaleTimeString(),
                            BuyAt: element.BuyAt,
                            SellAt: element.SellAt,
                            foundAt: element.foundAt,
                            orderActivated: orderActivated,
                            candleChartData: element.candleChartData,
                            quantity: quantity ? quantity : "",
                            brokerageCharges: quantity ? brokerageCharges.toFixed(2) : "",
                            pnlAmount: pnlAmount ? pnlAmount.toFixed(2) : "",
                            netPnLAmount: netPnLAmount ? netPnLAmount.toFixed(2) : "",
                            perChange: perChange,
                            todayChange: todayChange,
                            pastPerferm: element.pastPerferm
                        }

                        console.log('nr4 updated', foundData);

                        this.setState({ foundPatternList: [...this.state.foundPatternList, foundData] });

                        var foundlist = this.state.foundPatternList;

                        foundlist.sort(function (a, b) {
                            return b.perChange - a.perChange;
                        });

                        this.setState({ foundPatternList: foundlist });

                        var foundPatternList = localStorage.getItem("foundPatternList") ? JSON.parse(localStorage.getItem("foundPatternList")) : [];
                        foundPatternList.push(foundData);
                        localStorage.setItem('foundPatternList', JSON.stringify(foundPatternList));

                    }

                }).catch(error => {
                    Notify.showError(element.symbol + " ltd data not found!");
                })

            }
            await new Promise(r => setTimeout(r, 101));
        }
    }


    getStoplossFromOrderbook = (row) => {
        var oderbookData = localStorage.getItem('oderbookData');
        oderbookData = JSON.parse(oderbookData);
        var stopLoss = 0;
        var data = {};
        for (let index = 0; index < oderbookData.length; index++) {
            const element = oderbookData[index];

            if (element.status === "trigger pending" && element.symboltoken === row.symboltoken) {
                if (row.netqty > 0) {
                    data.stopLoss = element.triggerprice + "(" + ((element.triggerprice - row.buyavgprice) * 100 / row.buyavgprice).toFixed(2) + "%)";
                    data.maxLossAmount = ((element.triggerprice - row.buyavgprice) * parseInt(row.netqty)).toFixed(2);
                } else if (row.netqty < 0) {
                    console.log(row.tradingsymbol, "sellage", row.sellavgprice, "trigger", element.triggerprice);
                    data.stopLoss = element.triggerprice + "(" + ((element.triggerprice - row.sellavgprice) * 100 / row.sellavgprice).toFixed(2) + "%)";
                    data.maxLossAmount = ((element.triggerprice - row.sellavgprice) * parseInt(row.netqty)).toFixed(2);
                }
                break;
            }
        }

        return data;
    }
    getStoplossForSELLFromOrderbook = (row) => {
        var oderbookData = localStorage.getItem('oderbookData');
        oderbookData = JSON.parse(oderbookData);
        var stopLoss = 0;
        var data = {};
        oderbookData.forEach(element => {
            if (element.status === "trigger pending" && element.symboltoken === row.symboltoken) {
                data.stopLoss = element.triggerprice + "(" + ((row.buyavgprice - element.triggerprice) * 100 / row.buyavgprice).toFixed(2) + "%)";
                data.maxLossAmount = ((element.triggerprice - row.buyavgprice) * parseInt(row.netqty)).toFixed(2);
            }
        });
        return data;
    }
    getHighLowPercentage = async () => {

        this.setState({showHighLowWisePer: true});

        if (!this.state.positionList.length) {
            Notify.showError("First Refresh Position")
        }

        for (let index = 0; index < this.state.positionList.length; index++) {
            const element = this.state.positionList[index];

            if (element.producttype == "DELIVERY") {
                return "";
            }

            var data = {
                "exchange": "NSE",
                "tradingsymbol": element.tradingsymbol,
                "symboltoken": element.symboltoken,
            }
            AdminService.getLTP(data).then(res => {
                let data = resolveResponse(res, 'noPop');
                var LtpData = data && data.data;
                //console.log(LtpData);
                if (LtpData && LtpData.ltp) {
                    this.state.positionList[index].high = LtpData.high;
                    this.state.positionList[index].low = LtpData.low;
                }
            })
            await new Promise(r => setTimeout(r, 125));
            this.setState({ positionList: this.state.positionList });

        }

    }
    tagPatternWhichTaken =(token)=> {
       var orderTagToPosition = localStorage.getItem('orderTagToPosition') && JSON.parse(localStorage.getItem('orderTagToPosition')) || []; 
       
       var pattern = ''; 
       for (let index = 0; index < orderTagToPosition.length; index++) {
           const element = orderTagToPosition[index];
           if(token == element.token){
            pattern = element.pattenName; 
            break;
           }
        }
        return pattern
    //    console.log("findpatter", token, orderTagToPosition);
    //    orderTagToPosition.forEach(element => {
    //         if(token == element.token){
    //             return element.pattenName; 
    //         }
    //    });

    }
    calculateTradeExpence =(element)=>{

        var totalbuyvalue =  parseFloat(element.totalbuyvalue) === 0 ? parseFloat(element.totalsellvalue) : parseFloat(element.totalbuyvalue);
        var buyCharge = parseFloat(totalbuyvalue) * 0.25/100; 
        if(buyCharge > 20 || (element.optiontype  == 'CE' || element.optiontype  == 'PE')){
            buyCharge = 20; 
        }
        var totalsellvalue =  parseFloat(element.totalsellvalue) === 0 ? parseFloat(element.totalbuyvalue) : parseFloat(element.totalsellvalue);
        var sellCharge = parseFloat(totalsellvalue) * 0.25/100; 
        if(sellCharge > 20 || (element.optiontype  == 'CE' || element.optiontype  == 'PE')){
            sellCharge = 20; 
        }
        let turnOver = totalbuyvalue + totalsellvalue; 
        let totalBroker = buyCharge+sellCharge;

        let sst = 0.025; //stock intraday
        if(element.optiontype  == 'CE' || element.optiontype  == 'PE'){
            sst = 0.05;  
        }

        let sstCharge = totalsellvalue *  sst/100; 
        let transCharge = turnOver *  0.00335/100; 
        let stampDuty  = totalbuyvalue *   0.003/100; 
        let sebiCharge = turnOver * 10/10000000; 
        let gstCharge = (totalBroker+transCharge+sebiCharge) * 18/100; 

        let total = totalBroker+sstCharge+transCharge+stampDuty+sebiCharge+gstCharge; 

        var chargeInfo ={
          tradeExpence:  total,
          expenceInfo : "Brokerage: "+totalBroker.toFixed(2)+ " \nSTT: "+ sstCharge.toFixed(2) + " \nTransaction: "+ transCharge.toFixed(2) + " \nStamp Duty: "+stampDuty.toFixed(2) + " \nSebi: "+sebiCharge.toFixed(2) + " \nGST: " + gstCharge.toFixed(2) + " \n\nTotal: "+ total.toFixed(2)
        }
        return chargeInfo; 
    }
    refreshBasedAmount =()=> {
        let totCheckAmount = 0, checkTotalNet = 0, totCheckExp = 0 ; 
        this.state.positionList.forEach((item)=> {

            let perchange =  this.state.checkAmountPer ? this.state.checkAmountPer : item.percentPnL; 
            item.checkAmount = (this.state.checkAmount * perchange/100).toFixed(2) 
            totCheckAmount = totCheckAmount + parseFloat(item.checkAmount);

            let quantity = Math.floor(this.state.checkAmount / item.buyavgprice);
            item.checkQty = quantity; 
            item.totalbuyvalue = quantity * item.buyavgprice; 
            item.totalsellvalue = quantity * item.sellavgprice; 
            item.checkExpence = this.calculateTradeExpence(item); 
            if(item.checkExpence){
                item.checkNet =  (item.checkAmount - item.checkExpence.tradeExpence)
                totCheckExp = totCheckExp + item.checkExpence.tradeExpence;
                checkTotalNet = checkTotalNet +  parseFloat(item.checkNet); 
            }
            console.log(item)
 
        })
        this.setState({totCheckAmount : totCheckAmount.toFixed(2), checkTotalNet : checkTotalNet.toFixed(2),totCheckExp : totCheckExp.toFixed(2),  positionList : this.state.positionList }); 
    }

    checkSLOrTarget =(row)=>{
        let trackSLPrice = localStorage.getItem('trackSLPrice') ? JSON.parse( localStorage.getItem('trackSLPrice')) : []; 
        if(trackSLPrice.length>0){
            for (let index = 0; index < trackSLPrice.length; index++) {
                const element = trackSLPrice[index];
                
                if(element.optiontype == 'EQ'){
                    if(element.tradingsymbol == row.tradingsymbol && (row.ltp < parseFloat(element.priceStopLoss) || row.ltp >= parseFloat(element.priceTarget))){ 
                        console.log("checkSLOrTarget",element, element.tradingsymbol == row.tradingsymbol,row.ltp, (row.ltp < parseFloat(element.priceStopLoss) || row.ltp >= parseFloat(element.priceTarget)) )
                        this.squareOff(row); 
                    }
                }
                
              
            }
        }
    }

    getPositionData = async () => {
        //   document.getElementById('orderRefresh') && document.getElementById('orderRefresh').click(); 
        var maxPnL = 0, totalMaxPnL = 0;
        var trackSLPriceList = localStorage.getItem('trackSLPrice') ? JSON.parse( localStorage.getItem('trackSLPrice')) : []; 

        AdminService.getPosition().then(res => {
            let data = resolveResponse(res, 'noPop');
            var positionList = data && data.data;
            if (positionList && positionList.length > 0) {


                var todayProfitPnL = 0, totalbuyvalue = 0, totalsellvalue = 0, totalQtyTraded = 0, allbuyavgprice = 0, allsellavgprice = 0, totalPercentage = 0, totalExpence=0; 
                
                let tradingPositionlist = []; 
                for (let index = 0; index < positionList.length; index++) {
                    const element = positionList[index];
                    // if (element.netqty < 0) {
                    //     continue;
                    // }
                    tradingPositionlist.push(element); 

                    todayProfitPnL += parseFloat(element.pnl);
                    totalbuyvalue += parseFloat(element.totalbuyvalue);
                    totalsellvalue += parseFloat(element.totalsellvalue) === 0 ? parseFloat(element.totalbuyvalue) : parseFloat(element.totalsellvalue);
                    totalQtyTraded += parseInt(element.buyqty);
                    allbuyavgprice += parseFloat(element.buyavgprice);
                    allsellavgprice += parseFloat(element.sellavgprice);
                    if(element.netqty == 0){
                        let percentPnL = ((parseFloat(element.sellavgprice) - parseFloat(element.buyavgprice)) * 100 / parseFloat(element.buyavgprice));
                        element.percentPnL = percentPnL.toFixed(2) ;
                        totalPercentage += parseFloat(percentPnL);

                        localStorage.removeItem('firstTimeModify' + element.tradingsymbol)
                        localStorage.removeItem('lastTriggerprice_' + element.tradingsymbol)
                    }
                   
                    element.pattenName = this.tagPatternWhichTaken(element.symboltoken); 

                    let chargeInfo = this.calculateTradeExpence(element);
                    element.tradeExpence = chargeInfo.tradeExpence.toFixed(2); 
                    element.expenceInfo = chargeInfo.expenceInfo; 
                    totalExpence += chargeInfo.tradeExpence; 

                    var slData = this.getStoplossFromOrderbook(element);
                    if (slData) {
                        element.stopLoss = slData.stopLoss;
                        element.stopLossAmount = slData.maxLossAmount;
                        totalMaxPnL += parseFloat(slData.maxLossAmount) ? parseFloat(slData.maxLossAmount) : 0;
                    }

                    this.checkSLOrTarget(element); 

                }
               
                this.setState({ todayProfitPnL: todayProfitPnL.toFixed(2), totalbuyvalue: totalbuyvalue.toFixed(2), totalsellvalue: totalsellvalue.toFixed(2), totalQtyTraded: totalQtyTraded });
                this.setState({ allbuyavgprice: (allbuyavgprice / positionList.length).toFixed(2), allsellavgprice: (allsellavgprice / positionList.length).toFixed(2), totalPercentage: totalPercentage });

                var brokerageOnlyCharges = ((totalbuyvalue + totalsellvalue) * 0.25 / 100);
                var allCharges = brokerageOnlyCharges + brokerageOnlyCharges * 25 / 100;
                this.setState({ totalExpence: totalExpence.toFixed(2) });

                this.setState({ totalTornOver: (totalbuyvalue + totalsellvalue).toFixed(2), totalMaxPnL: totalMaxPnL.toFixed(2) });

                tradingPositionlist.sort((a,b) => b.netqty - a.netqty);

                this.setState({ positionList: tradingPositionlist });

                


            }
        })

    }

    

     getNSETopStock = () => {

        var stop = new Date().toLocaleTimeString() > "15:00:00" ? clearInterval(this.state.scaninterval) : "";

        var totalDayLoss = TradeConfig.totalCapital * TradeConfig.dailyLossPer / 100;
        totalDayLoss = -Math.abs(totalDayLoss);
        if (this.state.todayProfitPnL < totalDayLoss) {
            console.log("daily loss crossed", totalDayLoss);
            clearInterval(this.state.scaninterval);
        } else {
            AdminService.getNSETopStock().then(res => {
                let data = resolveResponse(res, "noPop");
                if (data.status && data.message === 'SUCCESS') {
                    var scandata = data.result;
                    // console.log("scandata",scandata);  
                    if(scandata &&  scandata.length){
                        for (let index = 0; index < scandata.length; index++) {
                            var isFound = false;
                            for (let j = 0; j < this.state.positionList.length; j++) {
                                if (this.state.positionList[j].symbolname === scandata[index].symbolName) {
                                    isFound = true;
                                }
                            }
    
                           // console.log("index",index, "symbolName",scandata[index].symbolName);    
                            if (!isFound && !localStorage.getItem('NseStock_' + scandata[index].symbolName)) {
    
                                AdminService.autoCompleteSearch(scandata[index].symbolName).then(searchRes => {
    
                                    let searchResdata = searchRes.data;
                                    var found = searchResdata.filter(row => row.exch_seg === "NSE" && row.lotsize === "1" && row.name === scandata[index].symbolName);
    
                                    if (found.length) {
                                        console.log(found[0].symbol, "found", found);
                                        localStorage.setItem('NseStock_' + scandata[index].symbolName, "orderdone");
                                        this.historyWiseOrderPlace(found[0].token, found[0].symbol, scandata[index].symbolName);
                                    }
                                })
    
                            }
                        }
                    }
                  
                }
            })
        }

    }

    getChartInkStock = () => {

        var stop = new Date().toLocaleTimeString() > "15:00:00" ? clearInterval(this.state.scaninterval) : "";

        var totalDayLoss = TradeConfig.totalCapital * TradeConfig.dailyLossPer / 100;
        totalDayLoss = -Math.abs(totalDayLoss);
        if (this.state.todayProfitPnL < totalDayLoss) {
            console.log("daily loss crossed", totalDayLoss);
            clearInterval(this.state.scaninterval);
        } else {
            AdminService.getChartInkStock().then(res => {
               // let data = resolveResponse(res, "noPop");
               let response = res.data; 

                if (response.success) {

                    let triggered_at = response.results[0] && response.results[0].body.data.triggered_at; 
                    let scandata = response.results[0] && response.results[0].body.data.stocks; 

                    let time = triggered_at.split(' '); 
                    let mtime = time[0]+time[1]; 
                    var endTime = moment(mtime, 'h:mma');
                    console.log("last triggered_at ", triggered_at, "stock found", scandata , endTime.minutes(), new Date().getMinutes() ); 

                    if(endTime.minutes() == new Date().getMinutes()){

                        scandata = scandata.split(','); 
    
                        for (let index = 0; index < scandata.length; index++) {
                            var isFound = false;
                            for (let j = 0; j < this.state.positionList.length; j++) {
                                if (this.state.positionList[j].symbolname === scandata[index].symbolName) {
                                    isFound = true;
                                }
                            }
    
                            if (!isFound && !localStorage.getItem('NseStock_' + scandata[index])) {
    
                                AdminService.autoCompleteSearch(scandata[index]).then(searchRes => {
    
                                    let searchResdata = searchRes.data;
                                    var found = searchResdata.filter(row => row.exch_seg === "NSE" && row.lotsize === "1" && row.name === scandata[index]);
    
                                    if (found.length) {
                                        console.log(found[0].symbol, "found", found);
                                        localStorage.setItem('NseStock_' + scandata[index], "orderdone");
                                        this.historyWiseOrderPlace(found[0].token, found[0].symbol, scandata[index]);
                                    }
                                })
    
                            }
                        }
                    }
                    
                   
                }
            })
        }

    }

    longBuiltUpOrder = async(scandata) => {


        for (let index = 0; index < scandata.length; index++) {
            var isFound = false;

            // for (let j = 0; j < this.state.positionList.length; j++) {
            //     if (this.state.positionList[j].symbolname === scandata[index].symbolName) {
            //         isFound = true;
            //     }
            // }
            var found = this.state.positionList.filter(row => row.symbolname === scandata[index].symbolName);

              console.log("index",index, "symbolName",scandata[index].symbolName, found);    
            if (!found.length  && !localStorage.getItem('NseStock_' + scandata[index].symbolName)) {

                AdminService.autoCompleteSearch(scandata[index].symbolName).then(searchRes => {

                    let searchResdata = searchRes.data;
                    var found = searchResdata.filter(row => row.exch_seg === "NSE" && row.lotsize === "1" && row.name === scandata[index].symbolName);

                    if (found.length) {
                        console.log(found[0].symbol, "found", found);
                        localStorage.setItem('NseStock_' + scandata[index].symbolName, "orderdone");
                        this.historyWiseOrderPlace(found[0].token, found[0].symbol, scandata[index].symbolName);
                    }
                })

            }

            await new Promise(r => setTimeout(r, 300));

        }
    
    }


    getMySelectedStock() {

        var stop = new Date().toLocaleTimeString() > "15:00:00" ? clearInterval(this.state.selectedStockInteval) : "";

        var totalDayLoss = TradeConfig.totalCapital * TradeConfig.dailyLossPer / 100;
        totalDayLoss = -Math.abs(totalDayLoss);
        if (this.state.todayProfitPnL < totalDayLoss) {
            console.log("daily loss crossed", totalDayLoss);
            clearInterval(this.state.scaninterval);
        } else {
            AdminService.getSelectedStockFromDb().then(res => {
                let data = resolveResponse(res, "noPop");
                if (data.status && data.message === 'SUCCESS') {
                    var scandata = data.result;
                    // console.log("scandata",scandata); 

                    for (let index = 0; index < scandata.length; index++) {
                        var isFound = false;
                        for (let j = 0; j < this.state.positionList.length; j++) {
                            if (this.state.positionList[j].symbolname === scandata[index].symbol) {
                                isFound = true;
                            }
                        }

                        //   console.log("index",index, "symbolName",scandata[index].symbolName);    
                        if (!isFound && !localStorage.getItem('NseStock_' + scandata[index].symbolName)) {

                            AdminService.autoCompleteSearch(scandata[index].symbolName).then(searchRes => {

                                let searchResdata = searchRes.data;
                                var found = searchResdata.filter(row => row.exch_seg === "NSE" && row.lotsize === "1" && row.name === scandata[index].symbolName);

                                if (found.length) {

                                    var selectedStockwatchList = localStorage.getItem("selectedStockwatchList") ? JSON.parse(localStorage.getItem("selectedStockwatchList")) : [];
                                    selectedStockwatchList.push(found[0]);
                                    localStorage.setItem('selectedStockwatchList', JSON.stringify(selectedStockwatchList));

                                }
                            })

                        }
                    }
                }
            })
        }

    }


    checkAndPlaceSingleOrder = (stock) => {
        AdminService.autoCompleteSearch(stock).then(res => {
            let data = res.data;
            var found = data.filter(row => row.exch_seg === "NSE" && row.lotsize === "1");
            console.log("stockfound", found);
            if (found && found.length) {
                this.orderWithFlatstoploss(found[0].token, found[0].symbol);
            }
        })
    }


    getStockOnebyOne() {

        var totalDayLoss = TradeConfig.totalCapital * TradeConfig.dailyLossPer / 100;
        totalDayLoss = -Math.abs(totalDayLoss);
        if (this.state.todayProfitPnL < totalDayLoss) {
            console.log("daily loss crossed", totalDayLoss);
            clearInterval(this.state.scaninterval);
        } else {
            console.log("still ok");
            AdminService.getAutoScanStock().then(res => {
                let data = resolveResponse(res, "noPop");
                if (data.status && data.message === 'SUCCESS') {
                    var scandata = data.result;
                    if (scandata && scandata.length > 0) {
                        var lastSeachStock = scandata[scandata.length - 1].symbolName;
                        localStorage.setItem('scannedStocks', JSON.stringify(scandata));
                        var isFound = false;
                        for (let index = 0; index < this.state.positionList.length; index++) {
                            if (this.state.positionList[index].symbolname === lastSeachStock) {
                                isFound = true;
                            }
                        }
                        if (!isFound && !localStorage.getItem('scannedstock_' + lastSeachStock)) {
                            console.log("found new", lastSeachStock)
                            var msg = new SpeechSynthesisUtterance();
                            msg.text = 'hey Vijay, ' + lastSeachStock;
                            window.speechSynthesis.speak(msg);
                            localStorage.setItem('scannedstock_' + lastSeachStock, "orderdone");
                            this.checkAndPlaceSingleOrder(lastSeachStock);
                        }
                    }

                }
            })
        }
    }


    orderWithFlatstoploss = (token, symbol) => {
        var data = {
            "exchange": "NSE",
            "tradingsymbol": symbol,
            "symboltoken": token,
        }
        AdminService.getLTP(data).then(res => {
            let data = resolveResponse(res, 'noPop');

            var LtpData = data && data.data;
            var ltpPrice = LtpData.ltp
            if (ltpPrice) {

                //  var stopLossPrice = ltp - (ltp*0.7/100);
                var stopLossPrice = ltpPrice - (ltpPrice * TradeConfig.perTradeStopLossPer / 100);
                stopLossPrice = this.getMinPriceAllowTick(stopLossPrice);
                let perTradeExposureAmt = TradeConfig.totalCapital * TradeConfig.perTradeExposurePer / 100;
                let quantity = Math.floor(perTradeExposureAmt / ltpPrice);
                console.log(symbol + 'ltp ' + ltpPrice, "quantity", quantity, "stopLossPrice", stopLossPrice, "perTradeExposureAmt", perTradeExposureAmt);
                var orderOption = {
                    transactiontype: 'BUY',
                    tradingsymbol: symbol,
                    symboltoken: token,
                    buyPrice: 0,
                    quantity: quantity,
                    stopLossPrice: stopLossPrice
                }

                if (quantity && stopLossPrice) {
                    this.placeOrderMethod(orderOption);
                }

            }

        }).catch((error) => {
            console.log(symbol, "not found", 'error', error);
        })
    }

    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
        var data = e.target.value;
        AdminService.autoCompleteSearch(data).then(res => {
            let data = res.data;
            //    console.log(data);       
            localStorage.setItem('autoSearchTemp', JSON.stringify(data));
            this.setState({ autoSearchList: data });
        })
    }

    onTrailChange=(e)=>{
        this.setState({ [e.target.name]: e.target.value });
      //  console.log([e.target.name],  e.target.value)
    }

    onAddSLChange=(e)=>{
        let addSLInfo = this.state.addSLInfo; 
        addSLInfo[e.target.name] = e.target.value.toUpperCase(); 
        this.setState({ addSLInfo: addSLInfo });
    }

    deleteOptionPriceSL =(element, deleteindex)=> {
        for (let indexP = 0; indexP <  this.state.positionList.length; indexP++) {
            const position = this.state.positionList[indexP];
            console.log("squireoffff", position.tradingsymbol, element.tradingsymbol,  position.buyqty )

            if(position.tradingsymbol == element.tradingsymbol && position.buyqty > 0){

                var trackSLPriceList = localStorage.getItem('trackSLPrice') && JSON.parse( localStorage.getItem('trackSLPrice')); 
                if(trackSLPriceList && trackSLPriceList.length > 0){
                    trackSLPriceList.splice(deleteindex, 1); 
                    localStorage.setItem('trackSLPrice', JSON.stringify(trackSLPriceList)); 
                    this.setState({trackSLPrice : trackSLPriceList},  ()=> {
                        this.squareOff(position);
                    }); 
                    break; 
                }
              
            }
        }
    }

    getNiftyLTP = () => {
        var data = {
            "exchange": "NSE",
            "tradingsymbol": "NIFTY",
            "symboltoken": "26000",
        }
        AdminService.getLTP(data).then(res => {
            let data = resolveResponse(res, 'noPop');
            var LtpData = data && data.data;
            //console.log(LtpData);
            if (LtpData && LtpData.ltp) {
                let per = (LtpData.ltp - LtpData.close) * 100 / LtpData.close; 
                if(document.getElementById('niftySpid')){
                    this.state.niftyLtpSec.push({ltp: LtpData.ltp.toFixed(2), time: new Date().toLocaleTimeString()}); 
                    localStorage.setItem("niftyLtpSec", JSON.stringify(this.state.niftyLtpSec));
                    document.getElementById('niftySpid').innerHTML = "<span style='color:red'> Nifty " + LtpData.ltp.toFixed(2) + ' (' + (per).toFixed(2) + '%)</span>'; 
                }
              }
            
            let trackSLPrice = localStorage.getItem('trackSLPrice') ? JSON.parse( localStorage.getItem('trackSLPrice')) : []; 
            
            if(trackSLPrice.length>0){
                for (let index = 0; index < trackSLPrice.length; index++) {
                    const element = trackSLPrice[index];
                    console.log("this.state.trackSLPrice", element)

                    if(element.name == 'NIFTY' && element.optiontype == 'CE' && ((LtpData.ltp < element.priceStopLoss) || (LtpData.ltp >= element.priceTarget))){
                        //delete sloption &  trigeer squireoff  
                        console.log("deleteOptionPriceSL call sl ", element, index)

                        this.deleteOptionPriceSL(element, index); 
                    }
                    if(element.name == 'NIFTY' && element.optiontype == 'PE' &&  ((LtpData.ltp > element.priceStopLoss) || (LtpData.ltp <= element.priceTarget))){
                        //delete sloption &  trigeer sl  
                        console.log("deleteOptionPriceSL put sl ", element, index)

                        this.deleteOptionPriceSL(element);   
                    }
                }
            }
            

        })
    }


    getBankNiftyLTP = () => {
        var data = {
            "exchange": "NSE",
            "tradingsymbol": "BANKNIFTY",
            "symboltoken": "26009",
        }
        AdminService.getLTP(data).then(res => {
            let data = resolveResponse(res, 'noPop');
            var LtpData = data && data.data;
            //console.log(LtpData);
            if (LtpData && LtpData.ltp) {
                let per = (LtpData.ltp - LtpData.close) * 100 / LtpData.close; 
                if(document.getElementById('bankniftySpid')) {
                    if (per > 0)
                    document.getElementById('bankniftySpid').innerHTML = "<span style='color:green'> Banknifty " + LtpData.ltp.toFixed(2) + ' (' + (per).toFixed(2) + '%)</span>'; 
                    else
                    document.getElementById('bankniftySpid').innerHTML = "<span style='color:red'> Banknifty " + LtpData.ltp.toFixed(2) + ' (' + (per).toFixed(2) + '%)</span>';    
                    this.state.bnniftyLtpSec.push({ltp: LtpData.ltp.toFixed(2), time: new Date().toLocaleTimeString()}); 
                    localStorage.setItem("bnniftyLtpSec", JSON.stringify(this.state.bnniftyLtpSec));
                }
            }
            let trackSLPrice = localStorage.getItem('trackSLPrice') ? JSON.parse( localStorage.getItem('trackSLPrice')) : []; 
            if(trackSLPrice.length>0){
                for (let index = 0; index < trackSLPrice.length; index++) {
                    const element = trackSLPrice[index];
                    if(element.name == 'BANKNIFTY' && element.optiontype == 'CE' && ((LtpData.ltp < element.priceStopLoss) || (LtpData.ltp >= element.priceTarget))){
                        //delete sloption &  trigeer sl    
                        this.deleteOptionPriceSL(element, index); 
                    }
                    if(element.name == 'BANKNIFTY' && element.optiontype == 'PE' && ((LtpData.ltp > element.priceStopLoss) || (LtpData.ltp <= element.priceTarget))){
                        //delete sloption &  trigeer sl    
                        this.deleteOptionPriceSL(element, index); 
                    }
                }
            }
        })
    }


    getStopLossPrice = async (token, symbol) => {
        var data = {
            "exchange": "NSE",
            "tradingsymbol": symbol,
            "symboltoken": token,
        }

        await AdminService.getLTP(data).then(res => {
            let data = resolveResponse(res, 'noPop');
            var LtpData = data && data.data;
            if (LtpData && LtpData.ltp) {
                var ltp = parseFloat(LtpData.ltp);
                ltp = ltp - (ltp * 0.7 / 100);
                var slPrice = this.getMinPriceAllowTick(ltp);

                this.setState({ stoploss: slPrice });
                return slPrice;
            }

        })
    }

    placeOrderMethod = (orderOption) => {

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
                this.setState({ orderid: data.data && data.data.orderid });
                if (orderOption.stopLossPrice) {
                    this.placeSLMOrder(orderOption);
                }
            }
        })
    }

    historyWiseOrderPlace = (token, symbol, LockedSymbolName) => {

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

                var time = moment.duration("21:10:00");
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


                        var candleData = histdata.data, clossest = 0, lowerest = 0, highestHigh = 0, lowestLow = 0;
                        candleData.reverse();
                        lowestLow = candleData[0][3];
                        highestHigh = candleData[0][2];
                        if (candleData && candleData.length > 0) {
                            for (let index = 0; index < 20; index++) {
                                if (candleData[index]) {
                                    clossest += candleData[index][4]; //close  
                                    lowerest += candleData[index][3];  //low
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

                            var stoploss = bblowerValue - (highestHigh - lowestLow) * 3 / 100;
                            stoploss = this.getMinPriceAllowTick(stoploss);

                            var stoplossPer = (highestHigh - stoploss) * 100 / highestHigh;

                            console.log(symbol + "highestHigh:", highestHigh, "lowestLow", lowestLow, "stoploss after tick:", stoploss, "stoploss%", stoplossPer);

                            var orderOption = {
                                transactiontype: 'BUY',
                                tradingsymbol: symbol,
                                symboltoken: token,
                                buyPrice: 0,
                                quantity: quantity,
                                stopLossPrice: stoploss
                            }
                            let mySL = 3.5; 
                            if (stoplossPer) {
                                this.placeOrderMethod(orderOption);
                            } else {
                                localStorage.setItem('NseStock_' + LockedSymbolName, "");
                                console.log(symbol + " SL "+stoplossPer+"% is grater than my SL: "+mySL+"  not fullfilled");
                            }
                        }


                    } else {
                        //localStorage.setItem('NseStock_' + symbol, "");
                        console.log(symbol + " candle data emply");
                    }
                })

            }
        })
        // await new Promise(r => setTimeout(r, 2000)); 
    }



    cancelOrderOfSame = (row) => {

        var orderData = this.getOpenPeningOrderId(row.symboltoken);
        var data = {
            "variety": orderData.variety,
            "orderid": orderData.orderId,
        }
        AdminService.cancelOrder(data).then(res => {
            let data = resolveResponse(res);
            if (data.status && data.message === 'SUCCESS') {
                console.log("cancel order", data);
                this.deleteOptionPriceSL(row);   
                // this.setState({ orderid : data.data && data.data.orderid });
            }
        })

    }

    squareOff = (row) => {

        var data = {
            "variety": "NORMAL",
            "tradingsymbol": row.tradingsymbol,
            "symboltoken": row.symboltoken,
            "transactiontype": row.netqty > 0 ? 'SELL' : "BUY",
            "exchange": row.exchange,
            "ordertype": "MARKET",
            "producttype": row.producttype, //"DELIVERY",//"DELIVERY",
            "duration": "DAY",
            "price": 0,
            "squareoff": "0",
            "stoploss": "0",
            "quantity": Math.abs(row.netqty),
        }

        // if(window.confirm("Squire Off!!! Sure?")){

        // }
        AdminService.placeOrder(data).then(res => {
            let data = resolveResponse(res);
          //  console.log("squireoff", data);
            if (data.status && data.message === 'SUCCESS') {
                this.setState({ orderid: data.data && data.data.orderid });
                this.cancelOrderOfSame(row);
                document.getElementById('orderRefresh') && document.getElementById('orderRefresh').click();

            }
        })

    }
    updateOrderList = () => {
        AdminService.retrieveOrderBook()
            .then((res) => {
                let data = resolveResponse(res);
                if (data && data.data) {
                    var orderlist = data.data;
                    orderlist.sort(function (a, b) {
                        return new Date(b.updatetime) - new Date(a.updatetime);
                    });
                    localStorage.setItem('oderbookData', JSON.stringify(orderlist));
                }
            });
    }

    addSLOrderInfo =(row)=> {
        
        this.setState({ addSLInfo : row, enableSLMOrderUi : true }); 
    }
    placeSLMOrderManually =()=> {
       // this.placeSLMOrder(this.state.addSLInfo); 
       this.state.addSLInfo.netqty = Math.abs(this.state.addSLInfo.netqty); 
       console.log("addSLInfo", this.state.addSLInfo)
        
        CommonMethods.placeOptionSLMOrder(this.state.addSLInfo)
    }
    placeSLMOrder = (slmOption) => {

        var data = {
            "triggerprice": slmOption.stopLossPrice,
            "tradingsymbol": slmOption.tradingsymbol,
            "symboltoken": slmOption.symboltoken,
            "quantity": slmOption.quantity,
            "transactiontype": slmOption.transactiontype === "BUY" ? "SELL" : "BUY",
            "exchange": slmOption.exchange ? slmOption.exchange :  'NSE',
            "producttype": slmOption.producttype ? slmOption.producttype : "INTRADAY",//"DELIVERY",
            "duration": "DAY",
            "price": slmOption.price ? slmOption.price : 0 ,
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
                this.updateOrderList(); 
                var msg = new SpeechSynthesisUtterance();
                msg.text = (slmOption.tradingsymbol +" "+ slmOption.transactiontype).toLocaleLowerCase();
                window.speechSynthesis.speak(msg);

                document.getElementById('orderRefresh') && document.getElementById('orderRefresh').click();
            }
        })
    }

    getOpenPeningOrderId = (symboltoken) => {

        var oderbookData = localStorage.getItem('oderbookData') && JSON.parse(localStorage.getItem('oderbookData'));
        var data = {};
        for (let index = 0; index < oderbookData.length; index++) {
            if (oderbookData[index].symboltoken === symboltoken && oderbookData[index].variety === "STOPLOSS") {
                data.orderId = oderbookData[index].orderid
                data.variety = oderbookData[index].variety
                break;
            }
        }
        return data;
    }

    modifyOrderMethod = (row, minTriggerPrice, minSLPrice) => {
        var orderData = this.getOpenPeningOrderId(row.symboltoken);

        if(!orderData.orderId){
            row.stopLossPrice = minTriggerPrice; 
            row.price = minSLPrice; 
            row.quantity = Math.abs(row.netqty);
            if(row.optiontype == "CE" || row.optiontype == "PE"){
                row.transactiontype = "BUY"; 
            }else{
                row.transactiontype = row.netqty > 0 ? "BUY" : "SELL"; 
            }
            this.placeSLMOrder(row);
        }

        var data = {
            "variety": orderData.variety,
            "orderid": orderData.orderId,
            "ordertype": "STOPLOSS_MARKET",   // "STOPLOSS_LIMIT",
            "producttype": row.producttype, //"DELIVERY",
            "duration": "DAY",
            "price": minSLPrice ?  parseFloat(minSLPrice) : 0,
            "triggerprice": parseFloat(minTriggerPrice),
            "quantity": Math.abs(row.netqty),
            "tradingsymbol": row.tradingsymbol,
            "symboltoken": row.symboltoken,
            "exchange": row.exchange
        }
        AdminService.modifyOrder(data).then(res => {
            let data = resolveResponse(res, "noPop");

            var msg = new SpeechSynthesisUtterance();


            if (data.status && data.message === 'SUCCESS') {
                //  this.setState({ ['lastTriggerprice_' + row.tradingsymbol]:  parseFloat(minPrice)})
                msg.text = row.symbolname + ' trailed '.toLocaleLowerCase(); //+ data.message;
                window.speechSynthesis.speak(msg);
                localStorage.setItem('firstTimeModify' + row.tradingsymbol, 'No');
                localStorage.setItem('lastTriggerprice_' + row.tradingsymbol, parseFloat(minTriggerPrice));
                document.getElementById('orderRefresh') && document.getElementById('orderRefresh').click();

            }
        })
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

    get2DecimalNumber =(number)=>{
        number = parseFloat(number); 
        if(number){
            return number.toFixed(2); 
        }else{
            return number;  
        }
    }

    getSLAndTriggerPrice =(price)=> {
        let minTriggerPrice = this.getMinPriceAllowTick(price);

        var minSLPrice = minTriggerPrice - (minTriggerPrice * 1 / 100);
        minSLPrice = this.getMinPriceAllowTick(minSLPrice);

        let slPriceData = {
            minTriggerPrice : minTriggerPrice, 
            minSLPrice : minSLPrice
        }
        return slPriceData; 
    }
    getOptionPercentage =(row)=> {

        console.log("option per calling"); 
        var percentChange = 0, trailPerChange = 0; 

        row.buyavgprice = parseFloat(row.buyavgprice);
        percentChange = ((row.ltp - row.buyavgprice) * 100 / row.buyavgprice);
        if (!localStorage.getItem('firstTimeModify' + row.tradingsymbol) && percentChange >= this.state.firstTimeMoveOption) {

            var minTriggerPrice = row.buyavgprice + (row.buyavgprice * this.state.firstTimeSLMoveOption / 100);
            let slPriceData =  this.getSLAndTriggerPrice(minTriggerPrice); 

            if(localStorage.getItem('lastTriggerprice_' + row.tradingsymbol) != slPriceData.minTriggerPrice){
                this.modifyOrderMethod(row, slPriceData.minTriggerPrice ,slPriceData.minSLPrice );
            }

        } else {
            var lastTriggerprice = parseFloat(localStorage.getItem('lastTriggerprice_' + row.tradingsymbol));
            var perchngfromTriggerPrice = ((row.ltp - lastTriggerprice) * 100 / lastTriggerprice);
            trailPerChange = perchngfromTriggerPrice; 
            if (perchngfromTriggerPrice >= this.state.nextTimeMoveOption) {
                minTriggerPrice = lastTriggerprice + (lastTriggerprice * this.state.nextTimeSLMoveOption / 100);
                let slPriceData =  this.getSLAndTriggerPrice(minTriggerPrice); 

                if(localStorage.getItem('lastTriggerprice_' + row.tradingsymbol) != slPriceData.minTriggerPrice){
                    this.modifyOrderMethod(row, slPriceData.minTriggerPrice, slPriceData.minSLPrice);
                }
            }
        }

        if(!trailPerChange){
            return percentChange.toFixed(2) + "%"; 
        }else{
            return percentChange.toFixed(2) + "% | Trailing "+ trailPerChange.toFixed(2) + "%"; 
        }
 
    }

    getPercentage = (row) => {

        var percentChange = 0, trailPerChange = 0; 
        if (row.netqty > 0) {
            row.buyavgprice = parseFloat(row.buyavgprice);
            percentChange = ((row.ltp - row.buyavgprice) * 100 / row.buyavgprice);
            if (!localStorage.getItem('firstTimeModify' + row.tradingsymbol) && percentChange >= this.state.firstTimeMove) {
                var minPrice = row.buyavgprice + (row.buyavgprice * this.state.firstTimeSLMove / 100);
                minPrice = this.getMinPriceAllowTick(minPrice);
                if(localStorage.getItem('lastTriggerprice_' + row.tradingsymbol) != minPrice){
                    this.modifyOrderMethod(row, minPrice);
                }
            } else {
                var lastTriggerprice = parseFloat(localStorage.getItem('lastTriggerprice_' + row.tradingsymbol));
                var perchngfromTriggerPrice = ((row.ltp - lastTriggerprice) * 100 / lastTriggerprice);
                trailPerChange = perchngfromTriggerPrice; 
                if (perchngfromTriggerPrice >= this.state.nextTimeMove) {
                    minPrice = lastTriggerprice + (lastTriggerprice * this.state.nextTimeSLMove / 100);
                    minPrice = this.getMinPriceAllowTick(minPrice);
                    if(localStorage.getItem('lastTriggerprice_' + row.tradingsymbol) != minPrice){
                        this.modifyOrderMethod(row, minPrice);
                    }
                }
            }
        }

        if (row.netqty < 0) {

            row.sellavgprice = parseFloat(row.sellavgprice);
            percentChange = ((row.ltp - row.sellavgprice) * 100 / row.sellavgprice);
            if (!localStorage.getItem('firstTimeModify' + row.tradingsymbol) && percentChange <= -Math.abs(this.state.firstTimeMove)) {
                var minPrice = row.sellavgprice - (row.sellavgprice * this.state.firstTimeSLMove / 100);
                minPrice = this.getMinPriceAllowTick(minPrice);
                // if(localStorage.getItem('lastTriggerprice_' + row.tradingsymbol) != minPrice){
                //     this.modifyOrderMethod(row, minPrice);
                // }
                this.modifyOrderMethod(row, minPrice);
            } else {
                var lastTriggerprice = parseFloat(localStorage.getItem('lastTriggerprice_' + row.tradingsymbol));
                var perchngfromTriggerPrice = ((row.ltp - lastTriggerprice) * 100 / lastTriggerprice);
                trailPerChange = perchngfromTriggerPrice; 
                console.log("perchngfromTriggerPrice", row.tradingsymbol , perchngfromTriggerPrice);
                if (perchngfromTriggerPrice <= -Math.abs(this.state.nextTimeMove)  ) {
                    minPrice = lastTriggerprice - (lastTriggerprice * this.state.nextTimeSLMove / 100);
                    minPrice = this.getMinPriceAllowTick(minPrice);
                    // if(localStorage.getItem('lastTriggerprice_' + row.tradingsymbol) != minPrice){
                    //     this.modifyOrderMethod(row, minPrice);
                    // }
                    this.modifyOrderMethod(row, minPrice);
                }
            }
        }

        if(!trailPerChange){
            return percentChange.toFixed(2) + "%"; 
        }else{
            return percentChange.toFixed(2) + "% | Trailing "+ trailPerChange.toFixed(2) + "%"; 
        }
    }

  


    render() {
  

        //var foundPatternList = localStorage.getItem('foundPatternList') && JSON.parse(localStorage.getItem('foundPatternList')).reverse(); 

        return (
            <React.Fragment>
                <PostLoginNavBar />
                <br />
                <ChartDialog /> <ChartMultiple />
                <Grid style={{ padding: '5px' }} justify="space-between" direction="row" container>
                    <Grid item >

                       <Typography color="primary" gutterBottom>
                       Positions ({this.state.positionList && this.state.positionList.length})    <span id="niftySpid"  > Nifty </span>  &nbsp;&nbsp;  <span id="bankniftySpid" >Banknifty </span>
                        </Typography>

                     
                    </Grid>

                    
                    {/* <Grid item  >
                        <Typography component="h3">
                            <b>Net C:  {this.get2DecimalNumber(localStorage.getItem('netCapital'))}  </b>
                        </Typography>
                    </Grid> */}

                    {/* <Grid item>
                        <Typography component="h3" >
                            <b> Net C P/L: </b> <b style={{ color: ((this.state.todayProfitPnL - this.state.totalExpence) * 100/localStorage.getItem('netCapital')) > 0 ? "green" : "red" }}>{((this.state.todayProfitPnL - this.state.totalExpence) * 100/localStorage.getItem('netCapital')).toFixed(2)}% </b>
                        </Typography>
                    </Grid> */}

                   
{/* 
                    <Grid item  >
                        <Typography component="h3">
                            <b>Turnover: {this.state.totalTornOver} </b>
                        </Typography>
                    </Grid> */}


                    <Grid item >
                        <Typography component="h3"  >

                        <b style={{ color: "red" }}>Expn: {this.state.totalExpence} </b>

                        </Typography>
                    </Grid>

                    <Grid item  >
                        <Typography component="h3"   >
                            <b>  P/L: </b> <b style={{ color: this.state.todayProfitPnL > 0 ? "green" : "red" }}>{this.state.todayProfitPnL} </b>
                        </Typography>
                    </Grid>

                    <Grid item>
                        <Typography component="h3"  {...window.document.title = "PnL:" + (this.state.todayProfitPnL - this.state.totalExpence).toFixed(2)}>
                        <b> Net P/L: </b> <b style={{ color: (this.state.todayProfitPnL - this.state.totalExpence) > 0 ? "green" : "red" }}>{this.state.totalExpence ? (this.state.todayProfitPnL - this.state.totalExpence).toFixed(2) : ""} </b>
                        </Typography>
                    </Grid>
                    

                
                    <Grid item  >
                        <Button type="number" variant="contained" style={{ float: "right" }} onClick={() => this.getPositionData()}>Refresh</Button>
                    </Grid>
                    <Grid item  >
                        <Button type="number" variant="contained" style={{ float: "right" }} onClick={() => this.getHighLowPercentage()}><RefreshIcon /> H/L</Button>

                    </Grid>
                </Grid>

                <Grid style={{ padding: '5px' }} spacing={1} direction="row" alignItems="center" container>


                     <Grid item xs={12} sm={12}>
                        <Paper style={{ overflow: "auto", padding: '5px' }} >

                            <Table size="small" aria-label="sticky table" >
                                <TableHead style={{ whiteSpace: "nowrap", backgroundColor: "" }} variant="head">
                                    <TableRow key="1" variant="head" style={{ fontWeight: 'bold' }}>

                                        {/* <TableCell className="TableHeadFormat" align="left">Instrument</TableCell> */}
                                        <TableCell style={{ paddingLeft: "3px" }} className="TableHeadFormat" align="left">&nbsp;Symbol
                                        <Button type="number" onClick={() => this.checkOpenEqualToLow()}>O=H/L</Button>
                                        <input style={{width: "50px"}} type='number'step={10000} placeholder='25000' name="checkAmount" onChange={this.onTrailChange} onBlur={()=> this.refreshBasedAmount()}/>
                                        <input style={{width: "30px"}} type='number' step={0.1} placeholder='0.5' name="checkAmountPer" onChange={this.onTrailChange} onBlur={()=> this.refreshBasedAmount()}/>

                                        </TableCell>
                                        {/* <TableCell className="TableHeadFormat" align="left">Trading Token</TableCell> */}
                                        {/* <TableCell className="TableHeadFormat" align="left">Product type</TableCell> */}
                                        <TableCell className="TableHeadFormat" align="left">Type</TableCell>

                                        <TableCell className="TableHeadFormat" align="left">BuyAvg</TableCell>
                                        {/* <TableCell  className="TableHeadFormat" align="left">Total buy value</TableCell> */}

                                        <TableCell className="TableHeadFormat" align="left">SellAvg</TableCell>
                                        {/* <TableCell  className="TableHeadFormat" align="left">Total Sell value</TableCell> */}
                                        <TableCell className="TableHeadFormat" align="left">QT</TableCell>

                                        <TableCell className="TableHeadFormat" align="left">NetQty</TableCell>
                                        <TableCell className="TableHeadFormat" align="left">Exp</TableCell>

                                        <TableCell className="TableHeadFormat" align="left">SL</TableCell>
                                        <TableCell className="TableHeadFormat" align="left">MD</TableCell>


                                        <TableCell className="TableHeadFormat" align="left">P/L </TableCell>
                                        <TableCell className="TableHeadFormat" align="left">Chng % </TableCell>
                                        <TableCell className="TableHeadFormat" align="left">LTP</TableCell>

                                        <TableCell className="TableHeadFormat" align="left">Action</TableCell>
                                        {/* <TableCell className="TableHeadFormat" align="left">SP.SL</TableCell>
                                        <TableCell className="TableHeadFormat" align="left">SP.Target</TableCell> */}
                                       
                                        {this.state.checkAmount ? 
                                        <>
                                        <TableCell className="TableHeadFormat" align="left">Qty Cpl</TableCell>
                                         <TableCell  className="TableHeadFormat" align="left">CExp</TableCell>
                                         <TableCell  className="TableHeadFormat" align="left">CNet</TableCell>
                                          </> : ""}

                                        {this.state.showHighLowWisePer ? 
                                        <>
                                         <TableCell  className="TableHeadFormat" align="left">High</TableCell>
                                         <TableCell  className="TableHeadFormat" align="left">Low</TableCell>
                                          </> : ""}



                                     

                                    </TableRow>
                                </TableHead>
                                <TableBody style={{ width: "", whiteSpace: "nowrap" }}>

                                    {this.state.positionList ? this.state.positionList.map(row => (


                                        row.producttype !== 'DELIVERY1' ? <TableRow hover key={row.symboltoken} style={{ background: row.netqty !== '0' ? 'lightgray' : "" }} >

                                            <TableCell align="left" style={{width:'250px'}}>
                                                <Button style={{ color: (row.ltp - row.close) * 100 / row.close > 0 ? "green" : "red" }} size="small" variant="contained" title="Candle refresh" onClick={() => this.refreshCandleChartManually(row)} >
                                                    {row.tradingsymbol} {row.ltp} ({((row.ltp - row.close) * 100 / row.close).toFixed(2)}%) <ShowChartIcon />
                                                </Button>
                                            </TableCell>
                                            <TableCell align="left">{row.producttype}</TableCell>

                                            {/* <TableCell align="left">{row.symboltoken}</TableCell> */}
                                            {/* <TableCell align="left">{row.producttype}</TableCell> */}

                                            <TableCell align="left"><Button onClick={() => this.addSLOrderInfo(row)}> {row.totalbuyavgprice} </Button>  </TableCell>
                                            {/* <TableCell align="left">{row.totalbuyvalue}</TableCell> */}

                                            <TableCell align="left">{row.totalsellavgprice}</TableCell>
                                            <TableCell align="left">{row.buyqty || row.sellqty}</TableCell>
                                            <TableCell align="left">{row.netqty}</TableCell>
                                            <TableCell style={{cursor:'help'}} title={row.expenceInfo} align="left">{row.tradeExpence}</TableCell>

                                            {/* <TableCell align="left">{row.totalsellvalue}</TableCell> */}
                                            <TableCell align="left"> {row.stopLoss}</TableCell>
                                            <TableCell align="left"> {row.stopLossAmount}</TableCell>


                                            {/* {(localStorage.getItem('lastTriggerprice_'+row.tradingsymbol))} */}
                                            <TableCell align="left" style={{ color: parseFloat(row.pnl) > 0 ? 'green' : 'red' }}><b>{row.pnl}</b></TableCell>
                                            <TableCell align="left">
                                                {row.netqty !== '0' && row.optiontype  == '' ? this.getPercentage(row) : ""}
                                                {(row.optiontype  == 'CE' || row.optiontype  == 'PE') && row.netqty > 0 ? this.getOptionPercentage(row) : ""}  
                                                {row.percentPnL ? row.percentPnL + "%" : ""}
                                                {/* new Date().toLocaleTimeString() > "15:15:00" ? */}
                                            </TableCell>
                                            <TableCell align="left">{row.ltp}</TableCell>

                                           

                                             <TableCell align="left">
                                                {row.netqty !== "0" ? <Button size={'small'} type="number" variant="contained" color="Secondary" onClick={() => this.squareOff(row)}>Square Off</Button> : ""}
                                            </TableCell>
                                        
                                        {this.state.checkAmount ? <>
                                            <TableCell   align="left"><i title={ "Buy value:" + row.totalbuyvalue + " | Sell value:"+ row.totalsellvalue}>  {row.checkQty}</i> &nbsp; {row.checkAmount} </TableCell>
                                            {/* <TableCell   align="left"></TableCell> */}
                                            <TableCell   align="left" title={row.checkExpence && row.checkExpence.expenceInfo}>  {row.checkExpence && row.checkExpence.tradeExpence && row.checkExpence.tradeExpence.toFixed(2)}</TableCell>
                                            <TableCell   align="left">{row.checkNet && row.checkNet.toFixed(2)}</TableCell>
                                          </> : ""}


                                        {this.state.showHighLowWisePer ? <>
                                            <TableCell   align="left">{row.high}</TableCell>
                                            <TableCell  align="left">{row.low}</TableCell>
                                          </> : ""}


                                           

                                        </TableRow> : ""

                                    )) : ''}

                                    <TableRow variant="head" style={{ fontWeight: 'bold', backgroundColor: "" }}>

                                        {/* <TableCell className="TableHeadFormat" align="left">Instrument</TableCell> */}
                                        {/* <TableCell className="TableHeadFormat" align="left"></TableCell> */}
                                        {/* <TableCell className="TableHeadFormat" align="left"></TableCell> */}
                                        <TableCell  align="left">

                   
                                        Stock Trail%: &nbsp; F.Move<input name="firstTimeMove"  type={'number'}  step="0.1" onChange={this.onTrailChange} value={this.state.firstTimeMove}  style={{width:'30px',textAlign:'center'}} /> 
                                        &nbsp;SL Move<input name="firstTimeSLMove" step="0.1"  type={'number'}  onChange={this.onTrailChange}  value={this.state.firstTimeSLMove} style={{width:'30px',textAlign:'center'}} /> 

                                        &nbsp;Next <input name="nextTimeMove" step="0.1"  type={'number'}  onChange={this.onTrailChange} value={this.state.nextTimeMove}  style={{width:'30px',textAlign:'center'}} /> 
                                        &nbsp;SL Move<input name="nextTimeSLMove"  step="0.1" type={'number'}  onChange={this.onTrailChange}  value={this.state.nextTimeSLMove} style={{width:'30px',textAlign:'center'}} /> 


                                        </TableCell>
                                        <TableCell className="TableHeadFormat" align="left"></TableCell>

                                        <TableCell className="TableHeadFormat" align="left">{this.state.allbuyavgprice}</TableCell>
                                        {/* <TableCell  className="TableHeadFormat" align="left">{this.state.totalbuyvalue}</TableCell> */}


                                        <TableCell className="TableHeadFormat" align="left">{this.state.allsellavgprice}</TableCell>

                                        <TableCell className="TableHeadFormat" align="left">{this.state.totalQtyTraded}</TableCell>
                                        <TableCell className="TableHeadFormat" align="left"></TableCell>
                                        <TableCell className="TableHeadFormat" align="left"></TableCell>

                                        {/* <TableCell  className="TableHeadFormat" align="left">{this.state.totalsellvalue}</TableCell> */}

                                        <TableCell className="TableHeadFormat" align="left"></TableCell>
                                        <TableCell className="TableHeadFormat" align="left">{this.state.totalMaxPnL}</TableCell>

                                        <TableCell className="TableHeadFormat" align="left" style={{ color: parseFloat(this.state.todayProfitPnL) > 0 ? 'green' : 'red' }}>{this.state.todayProfitPnL} </TableCell>

                                        <TableCell className="TableHeadFormat" align="left">

                                        {/* new Date().toLocaleTimeString() > "15:15:00" ?  */}
                                            {this.state.totalPercentage && this.state.totalPercentage.toFixed(2) + "%"}

                                        </TableCell>
                                        <TableCell className="TableHeadFormat" align="left"></TableCell>

                                        <TableCell className="TableHeadFormat" align="left"></TableCell>


                                        {this.state.checkAmount ? <>
                                        <TableCell className="TableHeadFormat" align="left">{this.state.totCheckAmount}</TableCell>
                                        <TableCell className="TableHeadFormat" align="left">{this.state.totCheckExp}</TableCell>
                                        <TableCell className="TableHeadFormat" align="left">{this.state.checkTotalNet}</TableCell>
                                        </>
                                        : "" }

                                        <TableCell className="TableHeadFormat" align="left"></TableCell>


                                    </TableRow>

                                    <TableRow variant="head">
                                        <TableCell  colSpan={15} align="left">

                                        Option Trail%: F.Move<input name="firstTimeMoveOption"  type={'number'}  step="0.1" onChange={this.onTrailChange} value={this.state.firstTimeMoveOption}  style={{width:'30px',textAlign:'center'}} /> 
                                        &nbsp;SL Move<input name="firstTimeSLMoveOption" step="0.1"  type={'number'}  onChange={this.onTrailChange}  value={this.state.firstTimeSLMoveOption} style={{width:'30px',textAlign:'center'}} /> 

                                        &nbsp;Next <input name="nextTimeMoveOption" step="0.1"  type={'number'}  onChange={this.onTrailChange} value={this.state.nextTimeMoveOption}  style={{width:'30px',textAlign:'center'}} /> 
                                        &nbsp;SL Move<input name="nextTimeSLMoveOption"  step="0.1" type={'number'}  onChange={this.onTrailChange}  value={this.state.nextTimeSLMoveOption} style={{width:'30px',textAlign:'center'}} /> 
 
                                        </TableCell>
                                    
                                    </TableRow>

                                    {this.state.enableSLMOrderUi ? 
                                    <TableRow variant="head">
                                        <TableCell className="TableHeadFormat" colSpan={15} align="center">

                                        Stoploss
                                        &nbsp;<input placeholder='Symbol' name="tradingsymbol"  onChange={this.onAddSLChange} value={this.state.addSLInfo && this.state.addSLInfo.tradingsymbol}  style={{ width:'200px',  textAlign:'center'}} /> 
                                        &nbsp;<input placeholder='Price' name="stopLossPrice"  type={'number'}  step="0.1" onChange={this.onAddSLChange} value={this.state.addSLInfo && this.state.addSLInfo.stopLossPrice}  style={{width:'100px',textAlign:'center'}} /> 
                                        &nbsp;<input placeholder='Trigger Price' name="stopLossTriggerPrice" step="0.1"  type={'number'}  onChange={this.onAddSLChange}  value={this.state.addSLInfo && this.state.addSLInfo.price} style={{width:'100px',textAlign:'center'}} /> 
                                        &nbsp; <Button size={'small'} type="number" variant="contained"  onClick={() => this.placeSLMOrderManually()}>Place SL</Button> 
                                    
                                        </TableCell>
                                    
                                    </TableRow>

                                     : ""}
                                    


                                </TableBody>
                            </Table>

                        </Paper>


                    </Grid>



                    <Grid item xs={12} sm={12}>
                        <OrderBook />
                    </Grid>



                    <Grid item xs={12} sm={12} style={{ height: '100%', overflow: "auto" }}>
                         {localStorage.getItem('isOpenInNewPage') == "no" ?  <OrderWatchlist /> : ""}
                    </Grid>


                    {this.state.foundPatternList && this.state.foundPatternList.length ? 
                    <Grid item xs={12} sm={12} >
                        <Paper style={{ overflow: "auto", padding: '5px' }} >



                            <Grid justify="space-between"
                                container>
                                <Grid item  >
                                    <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                        Patterns Founds ({this.state.foundPatternList && this.state.foundPatternList.length})

                                        <span id="stockTesting" style={{ fontSize: "18px", color: 'gray' }}> {this.state.stockTesting} </span>
                                    </Typography>
                                </Grid>
                                <Grid item >
                                    <Button variant="contained" style={{ marginLeft: '20px' }} onClick={() => this.refreshLtpOnFoundPattern()}>Live Refresh</Button>
                                </Grid>

                            </Grid>


                            <Table size="small" aria-label="sticky table" >
                                <TableHead style={{ whiteSpace: "nowrap", }} variant="head">
                                    <TableRow key="1" variant="head" style={{ fontWeight: 'bold' }}>


                                        <TableCell className="TableHeadFormat" align="left">Symbol | Activated({this.state.totelActivatedCount})</TableCell>
                                        <TableCell className="TableHeadFormat" align="left">Performance 6M</TableCell>


                                        <TableCell className="TableHeadFormat" align="left">OnLtp ({this.state.nr4TotalPer.toFixed(2)})%  </TableCell>

                                        <TableCell className="TableHeadFormat" align="left">Qty</TableCell>
                                        <TableCell className="TableHeadFormat" align="left">PnL({this.state.pnlAmountTotal.toFixed(2)})</TableCell>
                                        <TableCell className="TableHeadFormat" align="left">Fee({this.state.totalBrokerChargesNR4.toFixed(2)})</TableCell>
                                        <TableCell className="TableHeadFormat" align="left">NetPnL({this.state.totalNetProfit.toFixed(2)})</TableCell>
                                        <TableCell className="TableHeadFormat" align="left">OnH/L({this.state.perHighLowTotal.toFixed(2)}% | {this.state.netPnLAmountOnHighlowTotal.toFixed(2)})  </TableCell>

                                        <TableCell className="TableHeadFormat" align="left">Patten</TableCell>
                                        <TableCell className="TableHeadFormat" align="left">FoundAt</TableCell>
                                        <TableCell className="TableHeadFormat" align="left">BuyAt</TableCell>
                                        <TableCell className="TableHeadFormat" align="left">SellAt</TableCell>

                                        <TableCell className="TableHeadFormat" align="left">UpdatedAt</TableCell>


                                    </TableRow>
                                </TableHead>
                                <TableBody style={{ width: "", whiteSpace: "nowrap" }}>

                                    {this.state.foundPatternList ? this.state.foundPatternList.map(row => (
                                        <TableRow hover key={row.symboltoken}>


                                            <TableCell align="left"> <Button variant="contained" style={{ color: !row.todayChange ? '' : row.todayChange > 0 ? 'green' : 'red' }} onClick={() => this.showCandleChart(row.candleChartData, row.symbol)}>{row.symbol} {row.symbolUpdated} <EqualizerIcon /> </Button></TableCell>
                                            <TableCell title={row.symbol + " : Open all chart"} align="left" style={{ fontSize: '9px', cursor: 'pointer' }} onClick={() => this.showMultipleCandleChart(row)}>
                                                {row.pastPerferm ? <>
                                                    <span style={{ background: row.pastPerferm.totalLongPer / row.pastPerferm.totalLongs >= 1 ? "#92f192" : "" }}>{row.pastPerferm.totalLongs}L({row.pastPerferm.totalLongPer}%) | Avg:{(row.pastPerferm.totalLongPer / row.pastPerferm.totalLongs).toFixed(2)}%</span> <br />
                                                    <span>{row.pastPerferm.totalLongs}LH({row.pastPerferm.totalLongHighPer}%) | Avg: {(row.pastPerferm.totalLongHighPer / row.pastPerferm.totalLongs).toFixed(2)}%</span> <br />
                                                    <span style={{ background: row.pastPerferm.totalShortPer / row.pastPerferm.totalShort >= 1 ? "#e87b7b" : "" }}>{row.pastPerferm.totalShort}S:{row.pastPerferm.totalShortPer}% | Avg:{(row.pastPerferm.totalShortPer / row.pastPerferm.totalShort).toFixed(2)}%</span> <br />
                                                    <span>{row.pastPerferm.totalShort}SL:{row.pastPerferm.totalShortLowPer}% | Avg:{(row.pastPerferm.totalShortLowPer / row.pastPerferm.totalShort).toFixed(2)}%</span> <br />
                                                </> : ""}

                                            </TableCell>

                                            <TableCell align="left"><b>{row.orderActivated} </b></TableCell>


                                            <TableCell align="left">{row.quantity}</TableCell>
                                            <TableCell align="left">{row.pnlAmount}</TableCell>
                                            <TableCell align="left">{row.brokerageCharges}</TableCell>
                                            <TableCell align="left"><b>{row.netPnLAmount} </b></TableCell>
                                            <TableCell align="left"><b>{row.OnHighLowActivated} </b></TableCell>

                                            <TableCell align="left">{row.pattenName}</TableCell>

                                            <TableCell align="left">{row.foundAt && row.foundAt.substr(0, 15)}</TableCell>

                                            <TableCell align="left">{row.BuyAt}</TableCell>
                                            <TableCell align="left">{row.SellAt}</TableCell>

                                            <TableCell align="left">{row.time}</TableCell>

                                        </TableRow>
                                    )) : ''}
                                </TableBody>
                            </Table>



                        </Paper>
                    </Grid> 
                    : ""}



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
