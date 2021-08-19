import React from 'react';
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import AdminService from "../service/AdminService";
import Grid from '@material-ui/core/Grid';
import PostLoginNavBar from "../PostLoginNavbar";
import { resolveResponse } from "../../utils/ResponseHandler";
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
import ChartDialog from './ChartDialog'; 
import EqualizerIcon from '@material-ui/icons/Equalizer';


import Position from './Position';

import Tab from './Tab'
import { NavigateBeforeSharp } from '@material-ui/icons';

const wsClint = new w3cwebsocket('wss://omnefeeds.angelbroking.com/NestHtml5Mobile/socket/stream');

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sumPercentage: 0,
            autoSearchList: [],
            isDasable: false,
            isError: false,
            InstrumentLTP: {},
            ifNotBought: true,
            autoSearchTemp: [],
            backTestResult: [],
            backTestFlag: true,
            patternType: "NR4_SameDay",  //NR4ForNextDay
            symboltoken: "",
            tradingsymbol: "",
            buyPrice: 0,
            quantity: 1,
            producttype: "INTRADAY",
            symbolList: localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')) || [],
            selectedWatchlist: 'NIFTY BANK',
            longExitPriceType: 4,
            shortExitPriceType: 4,
            candleChartData : [],
            stopScaningFlag : false,
            backTestResultDateRange : [],
            searchFailed:0,
            FoundPatternList : localStorage.getItem('FoundPatternList') && JSON.parse(localStorage.getItem('FoundPatternList')) || []
            

        };
        this.myCallback = this.myCallback.bind(this);
        this.updateSocketWatch = this.updateSocketWatch.bind(this);

    }
    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
        var data = e.target.value;
        AdminService.autoCompleteSearch(data).then(res => {
            let data = res.data;
            console.log(data);
            localStorage.setItem('autoSearchTemp', JSON.stringify(data));
            this.setState({ autoSearchList: data });
        })

    }
    onChangePattern = (e) => {
        this.setState({ [e.target.name]: e.target.value });

        if( e.target.value == 'NR4_Daywide_daterage'){

            var backTestResultDateRange = localStorage.getItem('backTestResultDateRange') && JSON.parse(localStorage.getItem('backTestResultDateRange')) ; 
            
            this.setState({dateAndTypeKeys: Object.keys(backTestResultDateRange || {}), backTestResultDateRange : backTestResultDateRange });

        }
    }
    onChangeWatchlist = (e) => {
        this.setState({ [e.target.name]: e.target.value });
        var staticData = this.state.staticData;
        this.setState({ symbolList: staticData[e.target.value] });
        if (e.target.value == "selectall") {
            this.setState({ symbolList: localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')) });


        }


    }

    myCallback = (date, fromDate) => {
        if (fromDate === "START_DATE") {
            this.setState({ startDate: date });
        } else if (fromDate === "END_DATE") {
            this.setState({ endDate: date });
        }
    };
    getLTP = () => {
        var data = {
            "exchange": "NSE",
            "tradingsymbol": this.state.tradingsymbol,
            "symboltoken": this.state.symboltoken,
        }
        AdminService.getLTP(data).then(res => {
            let data = resolveResponse(res, 'noPop');
            var LtpData = data && data.data;
            this.setState({ InstrumentLTP: LtpData });

            //  if(!localStorage.getItem('ifNotBought') && LtpData &&  LtpData.ltp > this.state.buyPrice){
            //    this.placeOrder(this.state.buyPrice); 
            //  }

            //  if(LtpData.ltp > this.getAveragePrice(this.state.orderid)){
            //    this.placeSLMOrder(LtpData.ltp); 
            //  }
        })
    }
    decodeWebsocketData = (array) => {
        var newarray = [];
        try {
            for (var i = 0; i < array.length; i++) {
                newarray.push(String.fromCharCode(array[i]));
            }
        } catch (e) { }

        return newarray.join('');
    }

    makeConnection = (feedToken, clientcode) => {

        var firstTime_req = '{"task":"cn","channel":"NONLM","token":"' + this.state.feedToken + '","user": "' + this.state.clientcode + '","acctid":"' + this.state.clientcode + '"}';
        //  console.log("1st Request :- " + firstTime_req);
        wsClint.send(firstTime_req);
    }

    updateSocketWatch = (feedToken, clientcode) => {

        var channel = this.state.symbolList.map(element => {
            return 'nse_cm|' + element.token;
        });

        channel = channel.join('&');
        var sbin = {
            "task": "mw",
            "channel": channel,
            "token": this.state.feedToken,
            "user": this.state.clientcode,
            "acctid": this.state.clientcode
        }
        wsClint.send(JSON.stringify(sbin));
    }


    componentDidMount() {

        AdminService.getStaticData().then(res => {
            var data = res.data;
            //data = JSON.parse(data);   
            var totalWatchlist = Object.keys(data);
            this.setState({ totalWatchlist: totalWatchlist });
            this.setState({ staticData: data });

            var watchlist = [];
            totalWatchlist.forEach(element => {

                var mylist = data[element];
                mylist.forEach(element2 => {
                    var foundInWatchlist = watchlist.filter(row => row.token === element2.token);
                    if (!foundInWatchlist.length) {
                        watchlist.push(element2);
                    }
                });

               
            });

            localStorage.setItem('watchList', JSON.stringify(watchlist));

            this.setState({ symbolList: data[this.state.selectedWatchlist] });
        });

        var tokens = JSON.parse(localStorage.getItem("userTokens"));
        var feedToken = tokens && tokens.feedToken;

        var userProfile = JSON.parse(localStorage.getItem("userProfile"));
        var clientcode = userProfile && userProfile.clientcode;
        this.setState({ feedToken: feedToken, clientcode: clientcode });


        wsClint.onopen  = (res) => {

            //  this.makeConnection();
            //  this.updateSocketWatch(feedToken ,clientcode);

            //  setTimeout(function(){
            //    this.updateSocketWatch(feedToken ,clientcode);
            //  }, 800);
        }

        wsClint.onmessage = (message) => {


            var decoded = window.atob(message.data);
            var data = this.decodeWebsocketData(pako.inflate(decoded));
            var liveData = JSON.parse(data);

            this.state.symbolList && this.state.symbolList.forEach(element => {

                var foundLive = liveData.filter(row => row.tk == element.token);


                if (foundLive.length > 0 && foundLive[0].ltp)
                    this.setState({ [element.symbol + 'ltp']: foundLive.length > 0 && foundLive[0].ltp })
                if (foundLive.length > 0 && foundLive[0].cng)
                    this.setState({ [element.symbol + 'nc']: foundLive.length > 0 && foundLive[0].nc })

                var foundTweezerTop = localStorage.getItem('foundTweezerTop_' + element.token) && JSON.parse(localStorage.getItem('foundTweezerTop' + element.token));

                if (foundTweezerTop && foundTweezerTop.symboltoken == element.token) {

                    if (foundTweezerTop.entryBelow < foundLive[0].ltp) {
                        console.log('TweezerTop ', foundTweezerTop.tradingsymbol, "entry found at ", foundLive[0].ltp);
                        this.setState({ tradingsymbol: foundTweezerTop.tradingsymbol, symboltoken: foundTweezerTop.symboltoken, buyPrice: 0, producttype: 'INTRADAY', quantity: foundTweezerTop.quantity })
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
        if (!list) {
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

    stopBacktesting = () => {
        this.setState({ stopScaningFlag: true });
    }

    backTestAnyPattern = async () => {

        this.setState({ backTestResult: [], backTestFlag: false });


        console.log('this.state.patternType', this.state.patternType)

        if (!this.state.patternType) {
            Notify.showError("Select pattern type");
            return;
        }

        if (this.state.patternType === 'NR4') {
            this.backTestNR4();
            return;
        }
        if (this.state.patternType === 'NR4ForNextDay') {
            this.NR4ForNextDay();
            return;
        }


        if (this.state.patternType === 'NR4_SameDay') {
            this.backTestNR4SameDay();
            return;
        }
     

        if (this.state.patternType === 'NR4_Daywide_daterage') {

            var startdate = moment(this.state.startDate);
            var enddate = moment(this.state.endDate);

            const currentMoment =startdate; 
            const endMoment = enddate; 
            
            
            while (currentMoment.isSameOrBefore(endMoment, 'day')) {

                console.log(`Loop at ${currentMoment.format('DD-MM-YYYY')}`);

                this.backTestNR4DatewiseRange(currentMoment);

                if(this.state.stopScaningFlag){
                    break;
                }

                await new Promise(r => setTimeout(r,  this.state.symbolList.length * 310));


                currentMoment.add(1, 'days');
            }
            this.setState({ backTestFlag: true, stopScaningFlag: false });


            return;
        }


        

        this.setState({ backTestResult: [], backTestFlag: false });


        console.log("pattername", this.state.patternType);

        var watchList = this.state.symbolList; //localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')); 
        var runningTest = 1;
        for (let index = 0; index < watchList.length; index++) {
            const element = watchList[index];


            var data = {
                "exchange": "NSE",
                "symboltoken": element.token,
                "interval": "FIFTEEN_MINUTE", //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
                "fromdate": moment(this.state.startDate).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
                "todate": moment(new Date()).format("YYYY-MM-DD HH:mm") // moment("2020-06-30 14:00").format("YYYY-MM-DD HH:mm") 
            }

            AdminService.getHistoryData(data).then(res => {
                let histdata = resolveResponse(res, 'noPop');
                //console.log("candle history", histdata); 
                if (histdata && histdata.data && histdata.data.length) {

                    var candleData = histdata.data;
                    for (let index2 = 0; index2 < candleData.length - 35; index2++) {
                        // var startindex = index2 * 10; 
                        var last10Candle = candleData.slice(index2, index2 + 10);
                        var next10Candle = candleData.slice(index2 + 10, index2 + 35);

                        // console.log(element.symbol, 'backside',  last10Candle, '\n forntside',  next10Candle);

                        console.log('\n'); //&& new Date(candleData[index2][0]).toLocaleTimeString() < "14:15:00"
                        if (last10Candle.length >= 10 && new Date(candleData[index2][0]).toLocaleTimeString() < "14:15:00") {
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
                        runningTest += candleData.length;
                    }
                } else {
                    //localStorage.setItem('NseStock_' + symbol, "");
                    console.log(" candle data emply");
                }
            })
            await new Promise(r => setTimeout(r, 300));
            this.setState({ stockTesting: index + 1 + ". " + element.symbol, runningTest: runningTest })
        }

    }

    
    NR4ForNextDay = async () => {

        this.setState({ FoundPatternList: [], backTestFlag: false });

        var watchList = this.state.symbolList //localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')); 
        var runningTest = 1, sumPercentage = 0;
        for (let index = 0; index < watchList.length; index++) {
            const element = watchList[index];

            
            if(this.state.stopScaningFlag){
                break;
            }

        this.setState({ stockTesting: index + 1 + ". " + element.symbol })


            
        var time = moment.duration("240:00:00");
        var startdate = moment(this.state.endDate).subtract(time);

            var data = {
                "exchange": "NSE",
                "symboltoken": element.token,
                "interval": "ONE_DAY", //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
                "fromdate": moment(startdate).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
                "todate": moment(this.state.endDate).format("YYYY-MM-DD HH:mm") // moment("2020-06-30 14:00").format("YYYY-MM-DD HH:mm") 
            }

            AdminService.getHistoryData(data).then(res => {
                let histdata = resolveResponse(res, 'noPop');
                //console.log("candle history", histdata); 
                if (histdata && histdata.data && histdata.data.length) {

                    var candleData = histdata.data;
                      candleData.reverse(); 
                    
                        // var startindex = index2 * 10; 
                        var last4Candle = candleData.slice(0, 4);
                        // var next10Candle = candleData.slice(index2+5 , index2+35 );    

                        // console.log(element.symbol, 'backside',  last10Candle, '\n forntside',  next10Candle);

                        //&& new Date(candleData[index2][0]).toLocaleTimeString() < "14:15:00"
                        if (last4Candle.length >= 4) {

                            //last4Candle.reverse();

                            var rangeArr = [], candleChartData = []; 
                            last4Candle.forEach(element => {
                                rangeArr.push(element[2] - element[3]);
                                candleChartData.push([element[0],element[1],element[2],element[3],element[4]]); 
                            });
                            var firstElement = rangeArr[0], rgrangeCount = 0;
                            rangeArr.forEach(element => {
                                if (firstElement <= element) {
                                    firstElement = element;
                                    rgrangeCount += 1;
                                }
                            });

                            if (rgrangeCount == 4) {
                                var firstCandle = last4Candle[0];
                                var next5thCandle = candleData[0];


                                console.log(element.symbol, last4Candle, rangeArr, rgrangeCount, next5thCandle); 

                                //var buyentry = (firstCandle[2] + (firstCandle[2] - firstCandle[3])/4).toFixed(2);
                                var buyentry = (firstCandle[2] + (firstCandle[2] / 100 / 10)).toFixed(2);

                                //var sellenty = (firstCandle[3] - (firstCandle[2] - firstCandle[3])/4).toFixed(2); 
                                var sellenty = (firstCandle[3] - (firstCandle[3] / 100 / 10)).toFixed(2);

                            
                                var foundStock = {
                                    foundAt: new Date(firstCandle[0]).toString().substr(0, 25),
                                    symbol: element.symbol,
                                    token : element.token, 
                                    pattenName : "NR4", 
                                    SellAt: sellenty,
                                    high: firstCandle[2],
                                    low: firstCandle[3],
                                    BuyAt: buyentry,
                                    candleChartData : candleChartData, 
                                    close : firstCandle[4]
                                }
                            
                                this.nr4CheckPastPerfommance(element.token, foundStock) ; 

                            }

                        }
                        
                } else {
                    //localStorage.setItem('NseStock_' + symbol, "");
                    console.log(element.symbol, " candle data emply");
                }
            }).catch(error => {
                Notify.showError(element.symbol + " Candle data not found!");
            })
            await new Promise(r => setTimeout(r, 350));
            
        }
        this.setState({ backTestFlag: true, stopScaningFlag: false });
    } 

    
    findShortTraadeOnNextDay =(element, firstCandle, candleChartData, histdataInside)=>{
        var buyentry = (firstCandle[3] + (firstCandle[3] / 100 / 10));
       // var buyentrySL = (firstCandle[2] + (firstCandle[2] / 100 / 10));
        var buyentrySL = (buyentry + (buyentry*1/100));   //1% SL


        var resultCandle = [], buyEntryFlag = true,  longTradeFound = {},   elementInside = '', buyHighest = histdataInside[0][3]; 

        console.log(element.symbol, "result candle", histdataInside);

        if (histdataInside && histdataInside.length) {
            
            for (let index = 0; index < histdataInside.length; index++) {
                const candle5min = histdataInside[index];
                resultCandle.push([new Date(candle5min[0]).getTime(),candle5min[1],candle5min[2],candle5min[3],candle5min[4]]); 
                if(candle5min[2] < buyHighest){
                    buyHighest = candle5min[3]; 
                }
               
            }

            for (let insideIndex = 0; insideIndex < histdataInside.length; insideIndex++) {
                elementInside = histdataInside[insideIndex];

                if(buyEntryFlag && elementInside[3] < buyentry){
                    longTradeFound = {
                        foundAt: "Short-" + new Date(firstCandle[0]).toLocaleString(),
                        symbol: element.symbol,
                        sellEntyPrice: buyentry,
                        stopLoss: buyentrySL,
                        brokerageCharges: 0.06,
                        quantity: Math.floor(10000 / buyentry),
                        candleChartData : candleChartData,
                    }
                    buyEntryFlag = false; 
                }
                                                          
               

                var perChange = (buyentry - elementInside[3]) * 100 / buyentry;
                
                //trailing sl  
                // if(elementInside[3] > buyentry && plPerChng >= 0.5){            
                // }

                //flat 1% profit booking
                if(!buyEntryFlag && perChange >= 1){
                    var sellEntyPrice = buyentry - buyentry * 1/100; 
                    longTradeFound.buyExitPrice = sellEntyPrice;
                    longTradeFound.perChange = perChange.toFixed(2);
                    longTradeFound.squareOffAt = new Date(elementInside[0]).toLocaleString();
                    longTradeFound.exitStatus  = "Flat_1%_Booked"; 
                    break;
                }

                if(!buyEntryFlag && elementInside[2] >= buyentrySL){
                    var perChng = (buyentry - buyentrySL) * 100 / buyentry;
                    longTradeFound.buyExitPrice = buyentrySL;
                    longTradeFound.perChange = perChng.toFixed(2);
                    longTradeFound.squareOffAt = new Date(elementInside[0]).toLocaleString();
                    longTradeFound.exitStatus  = "SL_Hit"; 
                    break;
                }
             
            }

            if(!buyEntryFlag && !longTradeFound.sellEntyPrice){
                var perChng = (elementInside[4] - buyentry) * 100 / buyentry;
                longTradeFound.buyExitPrice = elementInside[4];
                longTradeFound.perChange = perChng && perChng.toFixed(2);
                longTradeFound.squareOffAt = new Date(elementInside[0]).toLocaleString();
                longTradeFound.exitStatus  = "Market_End"; 
            }

            if(!buyEntryFlag && Math.floor(100000 / buyentry)){
                var perChngOnHigh = (buyentry - buyHighest) * 100 / buyentry;
                longTradeFound.highAndLow = buyHighest;
                longTradeFound.perChngOnHighLow = perChngOnHigh.toFixed(2);
                longTradeFound.candleChartDataInside = resultCandle;

                this.setState({ backTestResult: [...this.state.backTestResult, longTradeFound] });
            }

        }

    }



    findLongsTraadeOnNextDay =(element, firstCandle, candleChartData, histdataInside)=>{
        var buyentry = (firstCandle[2] + (firstCandle[2] / 100 / 10));
       // var buyentrySL = (firstCandle[3] - (firstCandle[3] / 100 / 10));
       var buyentrySL = (buyentry - (buyentry*1/100));   //1% SL

        var resultCandle = [], buyEntryFlag = true,  longTradeFound = {},   elementInside = '', buyHighest = histdataInside[0][2]; 

        console.log(element.symbol, "result candle", histdataInside);

        if (histdataInside && histdataInside.length) {
            
            for (let index = 0; index < histdataInside.length; index++) {
                const candle5min = histdataInside[index];
                resultCandle.push([new Date(candle5min[0]).getTime(),candle5min[1],candle5min[2],candle5min[3],candle5min[4]]); 
                if(buyHighest < histdataInside[index][2]){
                    buyHighest = histdataInside[index][2];
                }
            }

            for (let insideIndex = 0; insideIndex < histdataInside.length; insideIndex++) {
                elementInside = histdataInside[insideIndex];

                if(buyEntryFlag && elementInside[2] > buyentry){
                    longTradeFound = {
                        foundAt: "Long-" + new Date(elementInside[0]).toLocaleString(),
                        symbol: element.symbol,
                        buyExitPrice: buyentry,
                        stopLoss: buyentrySL,
                        brokerageCharges: 0.06,
                        quantity: Math.floor(10000 / buyentry),
                        candleChartData : candleChartData,
                    }
                    buyEntryFlag = false; 
                }
                                                          
               

                var perChange = (elementInside[2] - buyentry) * 100 / buyentry;
                
                //trailing sl  
                // if(elementInside[3] > buyentry && plPerChng >= 0.5){            
                // }

                //flat 1% profit booking
                if(!buyEntryFlag && perChange >= 1){
                    var sellEntyPrice = buyentry + buyentry * 1/100; 
                    longTradeFound.sellEntyPrice = sellEntyPrice;
                    longTradeFound.perChange = perChange.toFixed(2);
                    longTradeFound.squareOffAt = new Date(elementInside[0]).toLocaleString();
                    longTradeFound.exitStatus  = "Flat_1%_Booked"; 
                    break;
                }

                if(!buyEntryFlag && elementInside[3] <= buyentrySL){
                    var perChng = (buyentrySL - buyentry) * 100 / buyentry;
                    longTradeFound.sellEntyPrice = buyentrySL;
                    longTradeFound.perChange = perChng.toFixed(2);
                    longTradeFound.squareOffAt = new Date(elementInside[0]).toLocaleString();
                    longTradeFound.exitStatus  = "SL_Hit"; 
                    break;
                }
             
            } //candle loop end

            if(!buyEntryFlag && !longTradeFound.sellEntyPrice){
                var perChng = (elementInside[4] - buyentry) * 100 / buyentry;
                longTradeFound.buyExitPrice = elementInside[4];
                longTradeFound.perChange = perChng && perChng.toFixed(2);
                longTradeFound.squareOffAt = new Date(elementInside[0]).toLocaleString();
                longTradeFound.exitStatus  = "Market_End"; 
            }

            if(!buyEntryFlag && Math.floor(100000 / buyentry)){
                var perChngOnHigh = (buyHighest - buyentry) * 100 / buyentry;
                longTradeFound.highAndLow = buyHighest;
                longTradeFound.perChngOnHighLow = perChngOnHigh.toFixed(2);
                longTradeFound.candleChartDataInside = resultCandle;

                this.setState({ backTestResult: [...this.state.backTestResult, longTradeFound] });
            }

        }

    }


    backTestNR4SameDay = async () => {

        this.setState({ backTestResult: [], backTestFlag: false, searchFailed : 0});

        var watchList = this.state.symbolList //localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')); 
        var runningTest = 1, sumPercentage = 0;
        for (let index = 0; index < watchList.length; index++) {
            const element = watchList[index];

            
            if(this.state.stopScaningFlag){
                break;
            }


            
        var time = moment.duration("240:00:00");
        var startdate = moment(this.state.endDate).subtract(time);

            var data = {
                "exchange": "NSE",
                "symboltoken": element.token,
                "interval": "ONE_DAY", //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
                "fromdate": moment(startdate).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
                "todate": moment(this.state.endDate).format("YYYY-MM-DD HH:mm") // moment("2020-06-30 14:00").format("YYYY-MM-DD HH:mm") 
            }

            AdminService.getHistoryData(data).then(res => {
                let histdata = resolveResponse(res, 'noPop');
                //console.log("candle history", histdata); 
                if (histdata && histdata.data && histdata.data.length) {

                    var candleData = histdata.data;
                      candleData.reverse(); 
                    
                        // var startindex = index2 * 10; 
                        var last4Candle = candleData.slice(1, 5);
                        // var next10Candle = candleData.slice(index2+5 , index2+35 );    
                        // console.log(element.symbol, 'backside',  last10Candle, '\n forntside',  next10Candle);
                        //&& new Date(candleData[index2][0]).toLocaleTimeString() < "14:15:00"
                        if (last4Candle.length >= 4) {
                            //last4Candle.reverse();

                            var rangeArr = [], candleChartData = []; 
                            last4Candle.forEach(element => {
                                rangeArr.push(element[2] - element[3]);
                                candleChartData.push([element[0],element[1],element[2],element[3],element[4]]); 
                            });
                            var firstElement = rangeArr[0], rgrangeCount = 0;
                            rangeArr.forEach(element => {
                                if (firstElement <= element) {
                                    firstElement = element;
                                    rgrangeCount += 1;
                                }
                            });

                            if (rgrangeCount == 4) {
                                var firstCandle = last4Candle[0];
                                var next5thCandle = candleData[0];
                                candleChartData.unshift([next5thCandle[0],next5thCandle[1],next5thCandle[2],next5thCandle[3],next5thCandle[4]]); 

                                console.log(element.symbol, last4Candle, rangeArr, rgrangeCount, next5thCandle); 
                           
                                var start5thdate = moment(next5thCandle[0]).set({"hour": 9, "minute": 15});
                                var end5thdate = moment(next5thCandle[0]).set({"hour": 15, "minute": 30});
                            
                                var sellenty = (firstCandle[3] - (firstCandle[3] / 100 / 10)).toFixed(2);
                                var sellentySL = (firstCandle[2] - (firstCandle[2] / 100 / 10)).toFixed(2);


                                var data = {
                                    "exchange": "NSE",
                                    "symboltoken": element.token,
                                    "interval": "FIVE_MINUTE", //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
                                    "fromdate": moment(start5thdate).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
                                    "todate": moment(end5thdate).format("YYYY-MM-DD HH:mm") // moment("2020-06-30 14:00").format("YYYY-MM-DD HH:mm") 
                                }
                        
                                AdminService.getHistoryData(data).then(insideCandleRes => {
                                    let histdataInside = resolveResponse(insideCandleRes, 'noPop'); 
                                    histdataInside =  histdataInside && histdataInside.data; 

                                    this.findLongsTraadeOnNextDay(element, firstCandle, candleChartData, histdataInside); 
                                    this.findShortTraadeOnNextDay(element, firstCandle, candleChartData, histdataInside); 

                                    // var resultCandle = [], buyEntryFlag = true,  sellEntryFlag = true,  longTradeFound = {}, shortTradeFound={},  elementInside = '', buyHighest = 0, sellLowest = 0; 

                                    // console.log(element.symbol, "result candle", histdataInside);

                                    // if (histdataInside && histdataInside.length) {
                                        
                                    //     for (let insideIndex = 0; insideIndex < histdataInside.length; insideIndex++) {
                                    //         elementInside = histdataInside[insideIndex];
                                    //         resultCandle.push([elementInside[0],elementInside[1],elementInside[2],elementInside[3],elementInside[4]]); 

                                    //         if(buyHighest < elementInside[2]){
                                    //             buyHighest = elementInside[2]; 
                                    //         }

                                    //         if(buyEntryFlag && elementInside[2] > buyentry){
                                    //             longTradeFound = {
                                    //                 foundAt: "Long-" + new Date(firstCandle[0]).toLocaleString().substr(0,10),
                                    //                 symbol: element.symbol,
                                    //                 buyExitPrice: buyentry,
                                    //                 stopLoss: buyentrySL,
                                    //                 brokerageCharges: 0.06,
                                    //                 quantity: Math.floor(10000 / buyentry),
                                    //                 candleChartData : candleChartData,
                                    //             }
                                    //             buyEntryFlag = false; 
                                    //         }
                                                                                      
                                    //         if(longTradeFound && elementInside[3] <= buyentrySL){
                                    //             var perChng = (elementInside[3] - buyentry) * 100 / buyentry;
                                    //             longTradeFound.sellEntyPrice = elementInside[3];
                                    //             longTradeFound.perChange = perChng.toFixed(2);
                                    //             longTradeFound.squareOffAt = new Date(elementInside[0]).toLocaleString();
                                    //             longTradeFound.exitStatus  = "SL_Hit"; 
                                    //             break;
                                    //         }

                                    //         var longplPerChng = (elementInside[2] - buyentry) * 100 / buyentry;
                                            
                                    //         //trailing sl  
                                    //         // if(elementInside[3] > buyentry && plPerChng >= 0.5){            
                                    //         // }

                                    //         //flat 1% profit booking
                                    //         if(longTradeFound && longplPerChng >= 1){
                                    //             var sellEntyPrice = buyentry + buyentry * 1/100; 

                                    //             var perChng = (elementInside[3] - buyentry) * 100 / buyentry;
                                    //             longTradeFound.sellEntyPrice = sellEntyPrice;
                                    //             longTradeFound.perChange = plPerChng.toFixed(2);
                                    //             longTradeFound.squareOffAt = new Date(elementInside[0]).toLocaleString();
                                    //             longTradeFound.exitStatus  = "Flat_1%_Booked"; 
                                    //             break;
                                    //         }


                                    //         //short trade 
                                    //         if(elementInside[3] >= sellLowest){
                                    //             sellLowest = elementInside[3]; 
                                    //         }

                                    //         if(sellEntryFlag && elementInside[2] > buyentry){
                                    //             shortTradeFound = {
                                    //                 foundAt: "Short-" + new Date(firstCandle[0]).toLocaleString().substr(0,10),
                                    //                 symbol: element.symbol,
                                    //                 sellEntyPrice: sellenty, 
                                    //                 stopLoss: sellentySL,
                                    //                 brokerageCharges: 0.06,
                                    //                 quantity: Math.floor(10000 / sellenty),
                                    //                 candleChartData : candleChartData,
                                    //             }
                                    //             sellEntryFlag = false; 
                                    //         }
                                                                                      
                                    //         if(shortTradeFound && elementInside[2] >= sellentySL){
                                    //             var perChng = (sellenty - elementInside[2]) * 100 / sellenty;
                                    //             shortTradeFound.buyExitPrice = elementInside[2];
                                    //             shortTradeFound.perChange = perChng.toFixed(2);
                                    //             shortTradeFound.squareOffAt = new Date(elementInside[0]).toLocaleString();
                                    //             shortTradeFound.exitStatus  = "SL_Hit"; 
                                    //             break;
                                    //         }

                                    //         var plPerChng = (sellenty - elementInside[3]) * 100 / sellenty;
                                            
                                    //         //trailing sl  
                                    //         // if(elementInside[3] > buyentry && plPerChng >= 0.5){            
                                    //         // }

                                    //         //flat 1% profit booking
                                    //         if(shortTradeFound && plPerChng >= 1){
                                    //             var buyExitPrice = sellenty - sellenty * 1/100; 

                                    //             var perChng = (sellenty - elementInside[3]) * 100 / sellenty;
                                    //             shortTradeFound.buyExitPrice = buyExitPrice;
                                    //             shortTradeFound.perChange = plPerChng.toFixed(2);
                                    //             shortTradeFound.squareOffAt = new Date(elementInside[0]).toLocaleString();
                                    //             shortTradeFound.exitStatus  = "Flat_1%_Booked"; 
                                    //             break;
                                    //         }


                                    //     }

                                    //     if(longTradeFound && !longTradeFound.sellEntyPrice){
                                    //         var perChng = (elementInside[4] - buyentry) * 100 / buyentry;
                                    //         longTradeFound.buyExitPrice = elementInside[4];
                                    //         longTradeFound.perChange = perChng && perChng.toFixed(2);
                                    //         longTradeFound.squareOffAt = new Date(elementInside[0]).toLocaleString();
                                    //         longTradeFound.exitStatus  = "Market_End"; 
                                    //     }
                                    //     var perChngOnHigh = (buyHighest - buyentry) * 100 / buyentry;
                                    //     longTradeFound.highAndLow = buyHighest;
                                    //     longTradeFound.perChngOnHighLow = perChngOnHigh.toFixed(2);
                                    //     longTradeFound.candleChartDataInside = resultCandle;

                                    //     if(longTradeFound && Math.floor(100000 / buyentry)){
                                    //         this.setState({ backTestResult: [...this.state.backTestResult, longTradeFound] });
                                    //     }


                                    //     if(shortTradeFound && !shortTradeFound.buyExitPrice){
                                    //         var perChng = (sellenty - elementInside[4]) * 100 / sellenty;
                                    //         shortTradeFound.buyExitPrice = elementInside[4];
                                    //         shortTradeFound.perChange = perChng && perChng.toFixed(2);
                                    //         shortTradeFound.squareOffAt = new Date(elementInside[0]).toLocaleString();
                                    //         shortTradeFound.exitStatus  = "Market_End"; 
                                    //     }
                                    //     var perChngOnHigh = (sellenty - sellLowest) * 100 / buyentry;
                                    //     shortTradeFound.highAndLow = buyHighest;
                                    //     shortTradeFound.perChngOnHighLow = perChngOnHigh.toFixed(2);
                                    //     shortTradeFound.candleChartDataInside = resultCandle;

                                    //     if(shortTradeFound && Math.floor(100000 / sellenty)){
                                    //         this.setState({ backTestResult: [...this.state.backTestResult, shortTradeFound] });
                                    //     }


                                    //     console.log("shortTradeFound" , shortTradeFound); 
                


                                    // }


                        
                                }).catch(error => {
                                    Notify.showError(element.symbol + " FIVE_MINUTE Candle data not found!");
                                    this.setState({searchFailed : this.state.searchFailed +1})
                                });


                               
                                // var buyentry = (firstCandle[2] + (firstCandle[2] / 100 / 10)).toFixed(2);
                                // if (next5thCandle[2] > buyentry) {
                                //     var perChng = (next5thCandle[4] - buyentry) * 100 / buyentry;
                                //     var perChngOnHigh = (next5thCandle[2] - buyentry) * 100 / buyentry;

                                //     sumPercentage += perChng;
        
                                //     console.log(element.symbol, firstCandle[0], "upside", "same day high", firstCandle[2], "same day low", firstCandle[3], "nextdaylow", next5thCandle[3], "nextdayhigh", next5thCandle[2], 'next day closing', next5thCandle[4], perChng + '%');

                                //     var foundStock = {
                                //         foundAt: "Long - " + new Date(firstCandle[0]).toLocaleString(),
                                //         symbol: element.symbol,
                                //         sellEntyPrice: next5thCandle[4],
                                //         highAndLow: next5thCandle[2],
                                //         stopLoss: firstCandle[3],
                                //         buyExitPrice: buyentry,
                                //         brokerageCharges: 0.06,
                                //         perChange: perChng.toFixed(2),
                                //         perChngOnHighLow: perChngOnHigh.toFixed(2),
                                //         squareOffAt: new Date(next5thCandle[0]).toLocaleString(),
                                //         quantity: Math.floor(10000 / firstCandle[2]),
                                //         candleChartData : candleChartData,
                                //     }
                                //     if (Math.floor(10000 / firstCandle[2])){ 
                                //         this.setState({ backTestResult: [...this.state.backTestResult, foundStock] });
                                //     }
                                // }
                                // var sellenty = (firstCandle[3] - (firstCandle[3] / 100 / 10)).toFixed(2);
                                // if (next5thCandle[3] < sellenty) {
                                //     var perChng = (sellenty - next5thCandle[4]) * 100 / firstCandle[3];
                                //     var perChngOnLow = (sellenty - next5thCandle[3]) * 100 / firstCandle[3];

                                //     sumPercentage += perChng;
                                //     console.log(element.symbol, firstCandle[0], "dowside", "same day high", firstCandle[2], "same day low", firstCandle[3], "nextdaylow", next5thCandle[3], "nextdayhigh", next5thCandle[2], 'next day closing', next5thCandle[4], perChng + '%');

                                //     var foundStock = {
                                //         foundAt: "Short - " + new Date(firstCandle[0]).toLocaleString(),
                                //         symbol: element.symbol,
                                //         sellEntyPrice: sellenty,
                                //         stopLoss: firstCandle[2],
                                //         buyExitPrice: next5thCandle[4],
                                //         highAndLow: next5thCandle[3],
                                //         brokerageCharges: 0.06,
                                //         perChange: perChng.toFixed(2),
                                //         perChngOnHighLow: perChngOnLow.toFixed(2),
                                //         squareOffAt: new Date(next5thCandle[0]).toLocaleString(),
                                //         quantity: Math.floor(10000 / firstCandle[3]),
                                //         candleChartData : candleChartData
                                //     }
                                //     if(Math.floor(10000 / firstCandle[3])){
                                //         this.setState({ backTestResult: [...this.state.backTestResult, foundStock] });
                                //     }


                                // }

                            }

                        }
                        runningTest = runningTest + candleData.length - 35;
                        
                } else {
                    //localStorage.setItem('NseStock_' + symbol, "");
                    console.log(element.symbol, " candle data emply");
                    Notify.showError(element.symbol + " FIVE_MINUTE candle data emply!");
                    this.setState({searchFailed : this.state.searchFailed +1})

                }
            }).catch(error => {
                Notify.showError(element.symbol + " 1 day Candle data not found!");
                this.setState({searchFailed : this.state.searchFailed +1})

            });
            await new Promise(r => setTimeout(r, 305));
         //   this.setState({ backTestResult:  this.state.backTestResult.reverse()}); 
            this.setState({ stockTesting: index + 1 + ". " + element.symbol, runningTest: runningTest })
        }
        this.setState({ backTestFlag: true, stopScaningFlag: false });
        console.log("sumPercentage", sumPercentage)
    } 

    backTestNR4DatewiseRange = async (date) => {

        this.setState({ backTestFlag: false });

        var watchList = this.state.symbolList //localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')); 
        var runningTest = 1, sumPercentage = 0;
        for (let index = 0; index < watchList.length; index++) {
            const element = watchList[index];

            
            if(this.state.stopScaningFlag){
                break;
            }


            
        var time = moment.duration("240:00:00");
        var startdate = moment(date).subtract(time);

            var data = {
                "exchange": "NSE",
                "symboltoken": element.token,
                "interval": "ONE_DAY", //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
                "fromdate": moment(startdate).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
                "todate": moment(date).format("YYYY-MM-DD HH:mm") // moment("2020-06-30 14:00").format("YYYY-MM-DD HH:mm") 
            }

            AdminService.getHistoryData(data).then(res => {
                let histdata = resolveResponse(res, 'noPop');
                //console.log("candle history", histdata); 
                if (histdata && histdata.data && histdata.data.length) {

                    var candleData = histdata.data;
                      candleData.reverse(); 
                    
                        // var startindex = index2 * 10; 
                        var last4Candle = candleData.slice(1, 5);
                        // var next10Candle = candleData.slice(index2+5 , index2+35 );    

                        // console.log(element.symbol, 'backside',  last10Candle, '\n forntside',  next10Candle);

                        //&& new Date(candleData[index2][0]).toLocaleTimeString() < "14:15:00"
                        if (last4Candle.length >= 4) {

                            //last4Candle.reverse();

                            var rangeArr = [], candleChartData = []; 
                            last4Candle.forEach(element => {
                                rangeArr.push(element[2] - element[3]);
                                candleChartData.push([element[0],element[1],element[2],element[3],element[4]]); 
                            });
                            var firstElement = rangeArr[0], rgrangeCount = 0;
                            rangeArr.forEach(element => {
                                if (firstElement <= element) {
                                    firstElement = element;
                                    rgrangeCount += 1;
                                }
                            });

                            if (rgrangeCount == 4) {
                                var firstCandle = last4Candle[0];
                                var next5thCandle = candleData[0];
                                candleChartData.unshift([next5thCandle[0],next5thCandle[1],next5thCandle[2],next5thCandle[3],next5thCandle[4]]); 

                                var currentDate = date.format('DD-MM-YYYY'); 

                                var dateWithWlType =  currentDate+' '+ this.state.selectedWatchlist; 

                                var backTestResultDateRange = localStorage.getItem("backTestResultDateRange") ? JSON.parse(localStorage.getItem("backTestResultDateRange")) : {};
                                var datewisetrades = backTestResultDateRange[dateWithWlType] ? backTestResultDateRange[dateWithWlType] : []; 
                              
                                console.log(element.symbol, last4Candle, rangeArr, rgrangeCount, next5thCandle); 

                                //var buyentry = (firstCandle[2] + (firstCandle[2] - firstCandle[3])/4).toFixed(2);
                                var buyentry = (firstCandle[2] + (firstCandle[2] / 100 / 10)).toFixed(2);

                                if (next5thCandle[2] > buyentry) {
                                    var perChng = (next5thCandle[4] - buyentry) * 100 / buyentry;
                                    var perChngOnHigh = (next5thCandle[2] - buyentry) * 100 / buyentry;

                                    sumPercentage += perChng;
        
                                    console.log(element.symbol, firstCandle[0], "upside", "same day high", firstCandle[2], "same day low", firstCandle[3], "nextdaylow", next5thCandle[3], "nextdayhigh", next5thCandle[2], 'next day closing', next5thCandle[4], perChng + '%');

                                    var foundStock = {
                                        foundAt: "Long - " + new Date(firstCandle[0]).toLocaleString(),
                                        symbol: element.symbol,
                                        sellEntyPrice: next5thCandle[4],
                                        highAndLow: next5thCandle[2],
                                        stopLoss: firstCandle[3],
                                        buyExitPrice: buyentry,
                                        brokerageCharges: 0.06,
                                        perChange: perChng.toFixed(2),
                                        perChngOnHighLow: perChngOnHigh.toFixed(2),
                                        squareOffAt: new Date(next5thCandle[0]).toLocaleString(),
                                        quantity: Math.floor(10000 / firstCandle[2]),
                                        candleChartData : candleChartData
                                    }
                                    if (Math.floor(10000 / firstCandle[2])){ 
                                        this.setState({ backTestResult: [...this.state.backTestResult, foundStock] });

                                        datewisetrades.push(foundStock);
                                        backTestResultDateRange[dateWithWlType] = datewisetrades; 
                                        localStorage.setItem('backTestResultDateRange', JSON.stringify(backTestResultDateRange));
                                          
                                        
                                    }

                                }
                                //var sellenty = (firstCandle[3] - (firstCandle[2] - firstCandle[3])/4).toFixed(2); 
                                var sellenty = (firstCandle[3] - (firstCandle[3] / 100 / 10)).toFixed(2);

                                if (next5thCandle[3] < sellenty) {
                                    var perChng = (sellenty - next5thCandle[4]) * 100 / firstCandle[3];
                                    var perChngOnLow = (sellenty - next5thCandle[3]) * 100 / firstCandle[3];

                                    sumPercentage += perChng;
                                    console.log(element.symbol, firstCandle[0], "dowside", "same day high", firstCandle[2], "same day low", firstCandle[3], "nextdaylow", next5thCandle[3], "nextdayhigh", next5thCandle[2], 'next day closing', next5thCandle[4], perChng + '%');

                                    var foundStock = {
                                        foundAt: "Short - " + new Date(firstCandle[0]).toLocaleString(),
                                        symbol: element.symbol,
                                        sellEntyPrice: sellenty,
                                        stopLoss: firstCandle[2],
                                        buyExitPrice: next5thCandle[4],
                                        highAndLow: next5thCandle[3],
                                        brokerageCharges: 0.06,
                                        perChange: perChng.toFixed(2),
                                        perChngOnHighLow: perChngOnLow.toFixed(2),
                                        squareOffAt: new Date(next5thCandle[0]).toLocaleString(),
                                        quantity: Math.floor(10000 / firstCandle[3]),
                                        candleChartData : candleChartData
                                    }
                                    if(Math.floor(10000 / firstCandle[3])){
                                        this.setState({ backTestResult: [...this.state.backTestResult, foundStock] });

                                        datewisetrades.push(foundStock);
                                        backTestResultDateRange[dateWithWlType] = datewisetrades; 

                                        console.log('backTestResultDateRange', backTestResultDateRange);
                                        localStorage.setItem('backTestResultDateRange', JSON.stringify(backTestResultDateRange));
                                     
                                      //  var backTestResultDateRange = localStorage.getItem('backTestResultDateRange') && JSON.parse(localStorage.getItem('backTestResultDateRange')) ; 
            
                                        this.setState({dateAndTypeKeys: Object.keys(backTestResultDateRange), backTestResultDateRange : backTestResultDateRange });
                            
                                    }


                                }

                            }

                        }
                        runningTest = runningTest + candleData.length - 35;
                        
                } else {
                    //localStorage.setItem('NseStock_' + symbol, "");
                    console.log(element.symbol, " candle data emply");
                }
            })
            await new Promise(r => setTimeout(r, 300));
            this.setState({ stockTesting: date.format('YYYY-MM-DD') +' '+ index + 1 + ". " + element.symbol, runningTest: runningTest })
        }
    } 

    backTestNR4 = async () => {

        this.setState({ backTestResult: [], backTestFlag: false });

        var watchList = this.state.symbolList //localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')); 
        var runningTest = 1, sumPercentage = 0;
        for (let index = 0; index < watchList.length; index++) {
            const element = watchList[index];

            var data = {
                "exchange": "NSE",
                "symboltoken": element.token,
                "interval": "ONE_DAY", //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
                "fromdate": moment(this.state.startDate).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
                "todate": moment(this.state.endDate).format("YYYY-MM-DD HH:mm") // moment("2020-06-30 14:00").format("YYYY-MM-DD HH:mm") 
            }

            AdminService.getHistoryData(data).then(res => {
                let histdata = resolveResponse(res, 'noPop');
                //console.log("candle history", histdata); 
                if (histdata && histdata.data && histdata.data.length) {

                    var candleData = histdata.data;
                    //  candleData.reverse(); 
                    for (let index2 = 0; index2 < candleData.length - 4; index2++) {
                        // var startindex = index2 * 10; 
                        var last4Candle = candleData.slice(index2, index2 + 4);
                        // var next10Candle = candleData.slice(index2+5 , index2+35 );    

                        // console.log(element.symbol, 'backside',  last10Candle, '\n forntside',  next10Candle);

                        //&& new Date(candleData[index2][0]).toLocaleTimeString() < "14:15:00"
                        if (last4Candle.length >= 4 && new Date(candleData[index2][0]).toLocaleTimeString() < "14:15:00") {

                            last4Candle.reverse();

                            var rangeArr = [], candleChartData = []; 
                            last4Candle.forEach(element => {
                                rangeArr.push(element[2] - element[3]);
                                candleChartData.push([element[0],element[1],element[2],element[3],element[4]]); 
                            });
                            var firstElement = rangeArr[0], rgrangeCount = 0;
                            rangeArr.forEach(element => {
                                if (firstElement <= element) {
                                    firstElement = element;
                                    rgrangeCount += 1;
                                }
                            });

                            //  console.log(element.symbol, last4Candle, rangeArr, rgrangeCount); 
                            if (rgrangeCount == 4) {
                                var firstCandle = last4Candle[0];
                                var next5thCandle = candleData[index2 + 4];
                                candleChartData.unshift([next5thCandle[0],next5thCandle[1],next5thCandle[2],next5thCandle[3],next5thCandle[4]]); 

                                //var buyentry = (firstCandle[2] + (firstCandle[2] - firstCandle[3])/4).toFixed(2);
                                var buyentry = (firstCandle[2] + (firstCandle[2] / 100 / 10)).toFixed(2);

                                if (next5thCandle[2] > buyentry) {
                                    var perChng = (next5thCandle[this.state.longExitPriceType] - buyentry) * 100 / buyentry;
                                    var perChngOnHigh = (next5thCandle[2] - buyentry) * 100 / buyentry;

                                    sumPercentage += perChng;
                                    console.log(element.symbol, firstCandle[0], "upside", "same day high", firstCandle[2], "same day low", firstCandle[3], "nextdaylow", next5thCandle[3], "nextdayhigh", next5thCandle[2], 'next day closing', next5thCandle[4], perChng + '%');

                                    var foundStock = {
                                        foundAt: "Long - " + new Date(firstCandle[0]).toLocaleString(),
                                        symbol: element.symbol,
                                        sellEntyPrice: next5thCandle[this.state.longExitPriceType],
                                        stopLoss: firstCandle[3],
                                        highAndLow: next5thCandle[2],
                                        perChngOnHighLow : perChngOnHigh.toFixed(2),
                                        buyExitPrice: buyentry,
                                        brokerageCharges: 0.06,
                                        perChange: perChng.toFixed(2),
                                        squareOffAt: new Date(next5thCandle[0]).toLocaleString(),
                                        quantity: Math.floor(10000 / firstCandle[2]),
                                        candleChartData : candleChartData
                                    }
                                    if (Math.floor(10000 / firstCandle[2])){ 
                                        this.setState({ backTestResult: [...this.state.backTestResult, foundStock] });
                                        this.setState({ backTestResult:  this.state.backTestResult.reverse()});
                                    }

                                }
                                //var sellenty = (firstCandle[3] - (firstCandle[2] - firstCandle[3])/4).toFixed(2); 
                                var sellenty = (firstCandle[3] - (firstCandle[3] / 100 / 10)).toFixed(2);

                                if (next5thCandle[3] < sellenty) {
                                    var perChng = (sellenty - next5thCandle[this.state.shortExitPriceType]) * 100 / firstCandle[3];
                                    var perChngOnLow = (sellenty - next5thCandle[3]) * 100 / firstCandle[3];

                                    sumPercentage += perChng;
                                    console.log(element.symbol, firstCandle[0], "dowside", "same day high", firstCandle[2], "same day low", firstCandle[3], "nextdaylow", next5thCandle[3], "nextdayhigh", next5thCandle[2], 'next day closing', next5thCandle[4], perChng + '%');

                                    var foundStock = {
                                        foundAt: "Short - " + new Date(firstCandle[0]).toLocaleString(),
                                        symbol: element.symbol,
                                        sellEntyPrice: sellenty,
                                        perChngOnHighLow : perChngOnLow.toFixed(2),
                                        stopLoss: firstCandle[2],
                                        highAndLow: next5thCandle[3],
                                        buyExitPrice: next5thCandle[this.state.shortExitPriceType],
                                        brokerageCharges: 0.06,
                                        perChange: perChng.toFixed(2),
                                        squareOffAt: new Date(next5thCandle[0]).toLocaleString(),
                                        quantity: Math.floor(10000 / firstCandle[3]),
                                        candleChartData : candleChartData
                                    }
                                    if(Math.floor(10000 / firstCandle[3])){
                                        this.setState({ backTestResult: [...this.state.backTestResult, foundStock] });
                                    }


                                }

                            }

                        }
                        runningTest = runningTest + candleData.length - 35;
                    }
                } else {
                    //localStorage.setItem('NseStock_' + symbol, "");
                    console.log(element.symbol, " candle data emply");
                }
            })
            await new Promise(r => setTimeout(r, 300));
            this.setState({ stockTesting: index + 1 + ". " + element.symbol, runningTest: runningTest })
        }
        this.setState({ backTestFlag: true });
        console.log("sumPercentage", sumPercentage)
    }

    nr4CheckPastPerfommance = (token, foundStock) => {
        var time = moment.duration("4320:00:00");
        var startdate = moment(this.state.endDate).subtract(time);
        var totalLongs=0, totalShort=0, totalLongPer=0, totalShortPer=0, totalLongHighPer=0, totalShortLowPer=0; 
        var longCandles=[], shortCandles=[]; 

        console.log('starting function foundStock', foundStock)
        var data = {
            "exchange": "NSE",
            "symboltoken": token,
            "interval": "ONE_DAY", //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
            "fromdate": moment(startdate).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
            "todate": moment(this.state.endDate).format("YYYY-MM-DD HH:mm") // moment("2020-06-30 14:00").format("YYYY-MM-DD HH:mm") 
        }

        AdminService.getHistoryData(data).then(res => {
            let histdata = resolveResponse(res, 'noPop');
            console.log("candle history", histdata); 
            if (histdata && histdata.data && histdata.data.length) {

                var candleData = histdata.data;
                //  candleData.reverse(); 
                for (let index2 = 0; index2 < candleData.length - 4; index2++) {
                    // var startindex = index2 * 10; 
                    var last4Candle = candleData.slice(index2, index2 + 4);
                    // var next10Candle = candleData.slice(index2+5 , index2+35 );    

                    // console.log(element.symbol, 'backside',  last10Candle, '\n forntside',  next10Candle);

                    //&& new Date(candleData[index2][0]).toLocaleTimeString() < "14:15:00"
                    if (last4Candle.length >= 4 && new Date(candleData[index2][0]).toLocaleTimeString() < "14:15:00") {

                        last4Candle.reverse();

                        var rangeArr = [], candleChartData = []; 
                        last4Candle.forEach(element => {
                            rangeArr.push(element[2] - element[3]);
                            candleChartData.push([element[0],element[1],element[2],element[3],element[4]]); 
                        });
                        var firstElement = rangeArr[0], rgrangeCount = 0;
                        rangeArr.forEach(element => {
                            if (firstElement <= element) {
                                firstElement = element;
                                rgrangeCount += 1;
                            }
                        });

                        if (rgrangeCount == 4) {

                            var firstCandle = last4Candle[0];
                            var next5thCandle = candleData[index2 + 4];
                            candleChartData.unshift([next5thCandle[0],next5thCandle[1],next5thCandle[2],next5thCandle[3],next5thCandle[4]]); 

                            console.log(token, last4Candle, rangeArr, rgrangeCount,firstCandle[0].toString().substr(0, 25)) ; 

                            var buyentry = (firstCandle[2] + (firstCandle[2] / 100 / 10)).toFixed(2);

                            if (next5thCandle[2] > buyentry) {

                                var perChng = (next5thCandle[4] - buyentry) * 100 / buyentry;
                                var perChngOnHigh = (next5thCandle[2] - buyentry) * 100 / buyentry;

                                var longData = {
                                    foundAt: "Long - " + new Date(firstCandle[0]).toLocaleString(),
                                    sellEntyPrice: next5thCandle[4],
                                    stopLoss: firstCandle[3],
                                    highAndLow: next5thCandle[2],
                                    perChngOnHighLow : perChngOnHigh.toFixed(2),
                                    buyExitPrice: buyentry,
                                    brokerageCharges: 0.06,
                                    perChange: perChng.toFixed(2),
                                    squareOffAt: new Date(next5thCandle[0]).toLocaleString(),
                                    quantity: Math.floor(10000 / firstCandle[2]),
                                    candleChartData : candleChartData
                                }
                                longCandles.push(longData); 
                                
                                totalLongs+=1; 
                                totalLongPer+=perChng; 
                                totalLongHighPer+=perChngOnHigh;

                            }
                            var sellenty = (firstCandle[3] - (firstCandle[3] / 100 / 10)).toFixed(2);

                            if (next5thCandle[3] < sellenty) {
                                var perChng = (sellenty - next5thCandle[4]) * 100 / firstCandle[3];
                                var perChngOnLow = (sellenty - next5thCandle[3]) * 100 / firstCandle[3];

                                var shortData = {
                                    foundAt: "Short - " + new Date(firstCandle[0]).toLocaleString(),
                                    sellEntyPrice: sellenty,
                                    perChngOnHighLow : perChngOnLow.toFixed(2),
                                    stopLoss: firstCandle[2],
                                    highAndLow: next5thCandle[3],
                                    buyExitPrice: next5thCandle[4],
                                    brokerageCharges: 0.06,
                                    perChange: perChng.toFixed(2),
                                    squareOffAt: new Date(next5thCandle[0]).toLocaleString(),
                                    quantity: Math.floor(10000 / firstCandle[3]),
                                    candleChartData : candleChartData
                                }
                                shortCandles.push(shortData); 

                                totalShort+=1; 
                                totalShortPer+=perChng;
                                totalShortLowPer+=perChngOnLow; 

                            }

                           
                        }

                    }
                }


                var pastPerferm = {
                    totalLongs:totalLongs, 
                    totalShort:totalShort, 
                    totalLongPer:totalLongPer.toFixed(2),
                    totalShortPer:totalShortPer.toFixed(2),
                    totalLongHighPer:totalLongHighPer.toFixed(2),
                    totalShortLowPer:totalShortLowPer.toFixed(2),
                }
                if(foundStock) 
                foundStock.pastPerferm = pastPerferm;
                foundStock.longCandles = longCandles; 
                foundStock.shortCandles = shortCandles; 
 

                 console.log("foundStock",foundStock); 
                if (Math.floor(10000 / firstCandle[4])){ 
                    this.setState({ FoundPatternList: [...this.state.FoundPatternList, foundStock] });

                    localStorage.setItem('FoundPatternList', JSON.stringify(this.state.FoundPatternList));
                }

            } else {
                //localStorage.setItem('NseStock_' + symbol, "");
                console.log(token, " candle data emply");
            }
        });

      
     
        
    }

    backtestTweezerTop = (candleHist, symbol, next10Candle) => {

        if (candleHist && candleHist.length > 0) {

            candleHist = candleHist.reverse();
            // console.log(symbol, "candleHist",candleHist, new Date().toString()); 


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
            //    console.log(symbol, "last 8th candle diff% ",  diffPer, "10th Low", lastTrendCandleLow,"3rd high", firstTrendCandleHigh);


            if (diffPer >= 1.5 && maxHigh < highestOfBoth && maxLow < lowestOfBoth) {
                //1st candle green & 2nd candle is red check
                if (secondCandle.open < secondCandle.close && firstCandle.open > firstCandle.close) {
                    // console.log(symbol, "candleHist",candleHist); 
                    //  console.log(symbol, "last 8th candle diff% ",  diffPer, "10th Low", lastTrendCandleLow,"3rd high", firstTrendCandleHigh);
                    //  console.log(symbol, 'making twisser 1st green & 2nd red' , firstCandle, secondCandle );

                    if (Math.round(secondCandle.close) == Math.round(firstCandle.open) && Math.round(secondCandle.open) == Math.round(firstCandle.close)) {

                        console.log('%c' + new Date(candleHist[0][0]).toString(), 'color: green');
                        console.log(symbol, "last 8th candle diff% ", diffPer, "10th Low", lastTrendCandleLow, "3rd high", firstTrendCandleHigh);

                        console.log(symbol, "maxHigh", maxHigh, "maxLow", maxLow);
                        console.log("last10Candle", candleHist);
                        console.log(symbol, 'perfect twisser top done close=open || open=close',);
                        console.log("next10Candle", next10Candle);

                        if (next10Candle && next10Candle.length) {
                            // next10Candle = next10Candle.reverse(); 

                            var higherStopLoss = (highestOfBoth + (highestOfBoth / 100 / 10)).toFixed(2);
                            var sellEntyPrice = (lowestOfBoth - (lowestOfBoth / 100 / 10)).toFixed(2);

                            //flat 3:15 or SL hit squired off 
                            var squiredOffAt315 = 0, squareOffAt315Time = '';
                            for (let indexTarget = 0; indexTarget < next10Candle.length; indexTarget++) {

                                if (next10Candle[indexTarget][2] > higherStopLoss) {
                                    squiredOffAt315 = higherStopLoss;
                                    squareOffAt315Time = next10Candle[indexTarget][0];
                                    break;
                                }
                                if (new Date(next10Candle[indexTarget][0]).toLocaleTimeString() == "15:15:00") {
                                    squiredOffAt315 = next10Candle[indexTarget][4];
                                    squareOffAt315Time = next10Candle[indexTarget][0];
                                    break;
                                }
                            }
                            //lowest of 3:15 profit booking
                            var lowestOf315 = next10Candle[0][4], lowestSquareOffAt = '';
                            for (let indexTarget2 = 1; indexTarget2 < next10Candle.length; indexTarget2++) {
                                if (next10Candle[indexTarget2][4] < lowestOf315) {
                                    lowestOf315 = next10Candle[indexTarget2][4];
                                    lowestSquareOffAt = next10Candle[indexTarget2][0];
                                }
                                if (new Date(next10Candle[indexTarget2][0]).toLocaleTimeString() == "15:15:00") {
                                    break;
                                }
                            }

                            //trailing profit till of 3:15 
                            var trailingSL = higherStopLoss, trailingSLAT = '';
                            for (let indexTarget3 = 0; indexTarget3 < next10Candle.length; indexTarget3++) {
                                if (trailingSL > next10Candle[indexTarget3][2]) {
                                    trailingSL = (next10Candle[indexTarget3][2] + (next10Candle[indexTarget3][2] / 100 / 4)).toFixed(2);
                                    trailingSLAT = next10Candle[indexTarget3][0];
                                }
                                else {
                                    trailingSL = (next10Candle[indexTarget3][4]).toFixed(2);
                                    trailingSLAT = next10Candle[indexTarget3][0];
                                    break;
                                }
                                if (new Date(next10Candle[indexTarget3][0]).toLocaleTimeString() == "15:15:00") {
                                    break;
                                }
                            }
                            //flat 0.75% or SL hit profit booking
                            var flatSellingPrice = 0, flatSellingPriceAt = '';
                            for (let indexTarget4 = 0; indexTarget4 < next10Candle.length; indexTarget4++) {

                                var priceDiff = (next10Candle[indexTarget4][3] - sellEntyPrice) * 100 / sellEntyPrice;

                                if (priceDiff < -0.70) {
                                    flatSellingPrice = next10Candle[indexTarget4][3];
                                    flatSellingPriceAt = next10Candle[indexTarget4][0];
                                    break;
                                }
                                if (next10Candle[indexTarget4][2] > higherStopLoss) {
                                    flatSellingPrice = higherStopLoss;
                                    flatSellingPriceAt = next10Candle[indexTarget4][0];
                                    break;
                                }
                                if (new Date(next10Candle[indexTarget4][0]).toLocaleTimeString() == "15:15:00") {
                                    flatSellingPrice = next10Candle[indexTarget4][3];
                                    flatSellingPriceAt = next10Candle[indexTarget4][0];
                                    break;
                                }
                            }

                            //range based target range*1.5% or SL hit profit booking
                            var rangeSellingPrice = 0, rangeSellingPriceAt = '';
                            for (let indexTarget5 = 0; indexTarget5 < next10Candle.length; indexTarget5++) {

                                var rangePriceDiff = (next10Candle[indexTarget5][3] - sellEntyPrice) * 100 / sellEntyPrice;

                                if (rangePriceDiff <= -1.5) {
                                    rangeSellingPrice = next10Candle[indexTarget5][3];
                                    rangeSellingPriceAt = next10Candle[indexTarget5][0];
                                    break;
                                }
                                if (next10Candle[indexTarget5][2] > higherStopLoss) {
                                    rangeSellingPrice = higherStopLoss;
                                    rangeSellingPriceAt = next10Candle[indexTarget5][0];
                                    break;
                                }
                                if (new Date(next10Candle[indexTarget5][0]).toLocaleTimeString() == "15:15:00") {
                                    rangeSellingPrice = next10Candle[indexTarget5][3];
                                    rangeSellingPriceAt = next10Candle[indexTarget5][0];
                                    break;
                                }
                            }

                            var backTestResult = localStorage.getItem("backTestResult") ? JSON.parse(localStorage.getItem("backTestResult")) : [];


                            if (next10Candle[0][3] < lowestOfBoth || next10Candle[1][3] < lowestOfBoth || next10Candle[2][3] < lowestOfBoth) {
                                var foundStock = {
                                    foundAt: new Date(candleHist[0][0]).toLocaleString(),
                                    symbol: symbol,
                                    sellEntyPrice: sellEntyPrice,
                                    stopLoss: higherStopLoss,
                                    orderActivated: false,
                                    buyExitPrice: 0,
                                    brokerageCharges: 0.06,
                                    quantity: Math.floor(10000 / sellEntyPrice),
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
                                foundStock.squareOffAt = new Date(flatSellingPriceAt).toLocaleString();
                                foundStock.buyExitPrice = flatSellingPrice;


                                //range based target range*1.5%
                                //    foundStock.squareOffAt = new Date( rangeSellingPriceAt ).toLocaleString();
                                //    foundStock.buyExitPrice = rangeSellingPrice;

                                foundStock.perChange = ((foundStock.sellEntyPrice - foundStock.buyExitPrice) * 100 / foundStock.sellEntyPrice).toFixed(2);
                                backTestResult.push(foundStock);

                                this.setState({ backTestResult: [...this.state.backTestResult, foundStock] });

                                //  localStorage.setItem('backTestResult', JSON.stringify(backTestResult));
                            }




                        }

                    }
                }
            }

        }

        this.setState({ backTestFlag: true });
    }

    backtestTweezerBottom = (candleHist, symbol, next10Candle) => {
        if (candleHist && candleHist.length > 0) {

            candleHist = candleHist.reverse();
            // console.log(symbol, "candleHist",candleHist, new Date().toString()); 


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
            //    console.log(symbol, "last 8th candle diff% ",  diffPer, "10th Low", lastTrendCandleLow,"3rd high", firstTrendCandleHigh);


            if (diffPer <= -1.5 && highestOfBoth < maxHigh && lowestOfBoth < maxLow) {
                //1st candle green & 2nd candle is red check
                if (secondCandle.open > secondCandle.close && firstCandle.close > firstCandle.open) {
                    // console.log(symbol, "candleHist",candleHist); 
                    //  console.log(symbol, "last 8th candle diff% ",  diffPer, "10th Low", lastTrendCandleLow,"3rd high", firstTrendCandleHigh);
                    //  console.log(symbol, 'making twisser 1st green & 2nd red' , firstCandle, secondCandle );

                    if (Math.round(secondCandle.close) == Math.round(firstCandle.open) || Math.round(secondCandle.open) == Math.round(firstCandle.close)) {

                        console.log('%c' + new Date(candleHist[0][0]).toString(), 'color: green');
                        console.log(symbol, "last 8th candle diff% ", diffPer, "10th Low", lastTrendCandleLow, "3rd high", firstTrendCandleHigh);

                        console.log(symbol, "maxHigh", maxHigh, "maxLow", maxLow);
                        console.log("last10Candle", candleHist);
                        console.log(symbol, 'perfect twisser top done close=open || open=close',);
                        console.log("next10Candle", next10Candle);

                        if (next10Candle && next10Candle.length) {
                            // next10Candle = next10Candle.reverse(); 

                            var buyEntyPrice = (highestOfBoth + (highestOfBoth / 100 / 10)).toFixed(2);
                            var LowerStopLoss = (lowestOfBoth - (lowestOfBoth / 100 / 10)).toFixed(2);

                            //flat 3:15 or SL hit squired off 
                            var squiredOffAt315 = 0, squareOffAt315Time = '';
                            for (let indexTarget = 0; indexTarget < next10Candle.length; indexTarget++) {

                                if (next10Candle[indexTarget][2] < LowerStopLoss) {
                                    squiredOffAt315 = LowerStopLoss;
                                    squareOffAt315Time = next10Candle[indexTarget][0];
                                    break;
                                }
                                if (new Date(next10Candle[indexTarget][0]).toLocaleTimeString() == "15:15:00") {
                                    squiredOffAt315 = next10Candle[indexTarget][4];
                                    squareOffAt315Time = next10Candle[indexTarget][0];
                                    break;
                                }
                            }
                            //highest of 3:15 profit booking
                            var highestOf315 = next10Candle[0][4], highestSquareOffAt = '';
                            for (let indexTarget2 = 1; indexTarget2 < next10Candle.length; indexTarget2++) {
                                if (highestOf315 < next10Candle[indexTarget2][4]) {
                                    highestOf315 = next10Candle[indexTarget2][4];
                                    highestSquareOffAt = next10Candle[indexTarget2][0];
                                }
                                if (new Date(next10Candle[indexTarget2][0]).toLocaleTimeString() == "15:15:00") {
                                    break;
                                }
                            }

                            //trailing profit till of 3:15 
                            var trailingSL = LowerStopLoss, trailingSLAT = '';
                            for (let indexTarget3 = 0; indexTarget3 < next10Candle.length; indexTarget3++) {
                                if (trailingSL > next10Candle[indexTarget3][2]) {
                                    trailingSL = (next10Candle[indexTarget3][2] + (next10Candle[indexTarget3][2] / 100 / 4)).toFixed(2);
                                    trailingSLAT = next10Candle[indexTarget3][0];
                                }
                                else {
                                    trailingSL = (next10Candle[indexTarget3][4]).toFixed(2);
                                    trailingSLAT = next10Candle[indexTarget3][0];
                                    break;
                                }
                                if (new Date(next10Candle[indexTarget3][0]).toLocaleTimeString() == "15:15:00") {
                                    break;
                                }
                            }
                            //flat 0.75% or SL hit profit booking
                            var flatSellingPrice = 0, flatSellingPriceAt = '';
                            for (let indexTarget4 = 0; indexTarget4 < next10Candle.length; indexTarget4++) {

                                var priceDiff = (next10Candle[indexTarget4][3] - buyEntyPrice) * 100 / buyEntyPrice;

                                if (priceDiff > 0.70) {
                                    flatSellingPrice = next10Candle[indexTarget4][3];
                                    flatSellingPriceAt = next10Candle[indexTarget4][0];
                                    break;
                                }
                                if (next10Candle[indexTarget4][2] > LowerStopLoss) {
                                    flatSellingPrice = LowerStopLoss;
                                    flatSellingPriceAt = next10Candle[indexTarget4][0];
                                    break;
                                }
                                if (new Date(next10Candle[indexTarget4][0]).toLocaleTimeString() == "15:15:00") {
                                    flatSellingPrice = next10Candle[indexTarget4][3];
                                    flatSellingPriceAt = next10Candle[indexTarget4][0];
                                    break;
                                }
                            }

                            //range based target range*1.5% or SL hit profit booking
                            var rangeSellingPrice = 0, rangeSellingPriceAt = '';
                            for (let indexTarget5 = 0; indexTarget5 < next10Candle.length; indexTarget5++) {

                                var rangePriceDiff = (next10Candle[indexTarget5][3] - buyEntyPrice) * 100 / buyEntyPrice;

                                if (rangePriceDiff >= -1.5) {
                                    rangeSellingPrice = next10Candle[indexTarget5][3];
                                    rangeSellingPriceAt = next10Candle[indexTarget5][0];
                                    break;
                                }
                                if (next10Candle[indexTarget5][2] > LowerStopLoss) {
                                    rangeSellingPrice = LowerStopLoss;
                                    rangeSellingPriceAt = next10Candle[indexTarget5][0];
                                    break;
                                }
                                if (new Date(next10Candle[indexTarget5][0]).toLocaleTimeString() == "15:15:00") {
                                    rangeSellingPrice = next10Candle[indexTarget5][3];
                                    rangeSellingPriceAt = next10Candle[indexTarget5][0];
                                    break;
                                }
                            }

                            var backTestResult = localStorage.getItem("backTestResult") ? JSON.parse(localStorage.getItem("backTestResult")) : [];


                            if (next10Candle[0][3] < lowestOfBoth || next10Candle[1][3] < lowestOfBoth || next10Candle[2][3] < lowestOfBoth) {
                                var foundStock = {
                                    foundAt: new Date(candleHist[0][0]).toLocaleString(),
                                    symbol: symbol,
                                    sellEntyPrice: 0,
                                    stopLoss: LowerStopLoss,
                                    orderActivated: false,
                                    buyExitPrice: buyEntyPrice,
                                    brokerageCharges: 0.06,
                                    quantity: Math.floor(10000 / buyEntyPrice),
                                }
                                foundStock.orderActivated = true;
                                //sqr off at 3:15
                                foundStock.squareOffAt = new Date(squareOffAt315Time).toLocaleString();
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

                                foundStock.perChange = ((foundStock.sellEntyPrice - foundStock.buyExitPrice) * 100 / foundStock.sellEntyPrice).toFixed(2);
                                backTestResult.push(foundStock);

                                this.setState({ backTestResult: [...this.state.backTestResult, foundStock] });

                                //  localStorage.setItem('backTestResult', JSON.stringify(backTestResult));
                            }




                        }

                    }
                }
            }

        }
        this.setState({ backTestFlag: true });

    }

    placeOrder = (transactiontype, slmOrderType) => {

        var data = {
            "variety": "NORMAL",
            "tradingsymbol": this.state.tradingsymbol,
            "symboltoken": this.state.symboltoken,
            "transactiontype": transactiontype, //BUY OR SELL
            "exchange": "NSE",
            "ordertype": this.state.buyPrice === 0 ? "MARKET" : "LIMIT",
            "producttype": this.state.producttype, //"INTRADAY",//"DELIVERY",
            "duration": "DAY",
            "price": this.state.buyPrice,
            "squareoff": "0",
            "stoploss": "0",
            "quantity": this.state.quantity,
        }

        AdminService.placeOrder(data).then(res => {
            let data = resolveResponse(res);
            //   console.log(data);   
            if (data.status && data.message === 'SUCCESS') {
                localStorage.setItem('ifNotBought', 'false')
                this.setState({ orderid: data.data && data.data.orderid });

                if (this.state.stoploss) {
                    this.placeSLMOrder(this.state.stoploss, slmOrderType);
                }
            }
        })
    }

    LoadSymbolDetails = (name) => {

        var token = '';
        for (let index = 0; index < this.state.symbolList.length; index++) {
            if (this.state.symbolList[index].symbol === name) {
                token = this.state.symbolList[index].token;
                this.setState({ tradingsymbol: name, symboltoken: this.state.symbolList[index].token });
                break;
            }
        }
        this.getHistory(token);
    }

    placeSLMOrder = (slmOrderType) => {

        var data = {
            "tradingsymbol": this.state.tradingsymbol,
            "symboltoken": this.state.symboltoken,
            "transactiontype": slmOrderType ? slmOrderType : "SELL",
            "exchange": "NSE",
            "ordertype": "STOPLOSS_MARKET", //STOPLOSS_MARKET STOPLOSS_LIMIT
            "producttype": this.state.producttype, //"INTRADAY",//"DELIVERY",
            "duration": "DAY",
            "price": 0,
            "squareoff": "0",
            "stoploss": "0",
            "quantity": this.state.quantity,
            "triggerprice": this.state.stoploss,
            "variety": "STOPLOSS"
        }

        AdminService.placeOrder(data).then(res => {
            let data = resolveResponse(res);
            //     console.log(data);   
            if (data.status && data.message === 'SUCCESS') {
                localStorage.setItem('ifNotBought', 'false')
                this.setState({ orderid: data.data && data.data.orderid });
            }
        })


    }

    getHistory = (token) => {

        const format1 = "YYYY-MM-DD HH:mm";

        var time = moment.duration("00:50:00");
        var startdate = moment(new Date()).subtract(time);
        // var startdate = moment(this.state.startDate).subtract(time);

        var data = {
            "exchange": "NSE",
            "symboltoken": token,
            "interval": "ONE_MINUTE", //ONE_DAY FIVE_MINUTE 
            "fromdate": moment(startdate).format(format1),
            "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
        }

        AdminService.getHistoryData(data).then(res => {
            let data = resolveResponse(res, 'noPop');
            //    console.log(data); 
            if (data && data.data) {

                var histCandles = data.data;
                histCandles && histCandles.sort(function (a, b) {
                    return new Date(b[0]) - new Date(a[0]);
                });
                if (histCandles.length > 0) {
                    localStorage.setItem('InstrumentHistroy', JSON.stringify(histCandles));
                    this.setState({ InstrumentHistroy: histCandles, buyPrice: histCandles[0][2] });
                }
                this.getLTP();
            }
        })
    }

    onSelectItem = (event, values) => {


        var autoSearchTemp = JSON.parse(localStorage.getItem('autoSearchTemp'));
        //  console.log("values", values); 
        //   console.log("autoSearchTemp", autoSearchTemp); 
        if (autoSearchTemp.length > 0) {
            var fdata = '';
            for (let index = 0; index < autoSearchTemp.length; index++) {
                console.log("fdata", autoSearchTemp[index].symbol);
                if (autoSearchTemp[index].symbol === values) {
                    fdata = autoSearchTemp[index];
                    break;
                }
            }


            var watchlist = localStorage.getItem("watchList") ? JSON.parse(localStorage.getItem("watchList")) : [];
            var foundInWatchlist = watchlist.filter(row => row.token === values);
            if (!foundInWatchlist.length) {
                watchlist.push(fdata);
                localStorage.setItem('watchList', JSON.stringify(watchlist));

                AdminService.saveWatchListJSON({ stock: fdata }).then(res => {
                    let resdata = resolveResponse(res, 'noPop');
                    console.log(resdata);
                });
            }

            this.setState({ symbolList: JSON.parse(localStorage.getItem('watchList')), search: "" });
            setTimeout(() => {
                this.updateSocketWatch();
            }, 100);

        }

    }

    deleteItemWatchlist = (symbol) => {
        var list = this.state.symbolList; // JSON.parse( localStorage.getItem('watchList'));
        var index = list.findIndex(data => data.symbol === symbol)
        list.splice(index, 1);
        //  localStorage.setItem('watchList',  JSON.stringify(list)); 
        this.setState({ symbolList: list });
    }

    getAveragePrice = (orderId) => {

        var oderbookData = localStorage.getItem('oderbookData');
        var averageprice = 0;
        for (let index = 0; index < oderbookData.length; index++) {
            if (oderbookData[index].orderid === 'orderId') {
                averageprice = oderbookData[index].averageprice
                this.setState({ averageprice: averageprice });
                break;
            }
        }
        return averageprice;
    }
    showCandleChart = (candleData, symbol, insiderow) => {


        candleData  = candleData && candleData.reverse();

        localStorage.setItem('candleChartData', JSON.stringify(candleData))
        localStorage.setItem('cadleChartSymbol', symbol)

        if(insiderow)
        localStorage.setItem('chartInfoDetails', JSON.stringify(insiderow));

        
        document.getElementById('showCandleChart').click();
    }

    showCandleBothChart = (row) => {
        var candleChartData = row.candleChartData && row.candleChartData.reverse();
        localStorage.setItem('candleChartData', JSON.stringify(candleChartData))
        localStorage.setItem('cadleChartSymbol', row.symbol)

        var candleChartDataInside = row.candleChartDataInside;

        if(candleChartDataInside)
        localStorage.setItem('candleChartDataInside', JSON.stringify(candleChartDataInside));

        
        document.getElementById('showCandleChart').click();
    }


    render() {
        const dateParam = {
            myCallback: this.myCallback,
            startDate: '',
            endDate: '',
            firstLavel: "Start Date and Time",
            secondLavel: "End Date and Time"
        }

       
        var sumPerChange = 0, sumBrokeragePer = 0, netSumPerChange = 0,sumPerChangeHighLow =0,  sumPnlValue = 0,sumPnlValueOnHighLow = 0,  totalInvestedValue = 0, totalLongTrade=0, totalShortTrade=0;
        var tradetotal = 0, totalWin = 0,  totalLoss  = 0; 
        return (
            <React.Fragment>
                <PostLoginNavBar />
                <ChartDialog />
                <Grid direction="row" container>

                    <Grid item xs={12} sm={2}  >

                        <Autocomplete
                            freeSolo
                            id="free-solo-2-demo"
                            disableClearable
                            style={{ paddingLeft: "10px", paddingRight: "10px" }}
                            onChange={this.onSelectItem}
                            //+ ' '+  option.exch_seg
                            options={this.state.autoSearchList.length > 0 ? this.state.autoSearchList.map((option) =>
                                option.symbol
                            ) : []}
                            renderInput={(params) => (
                                <TextField
                                    onChange={this.onChange}
                                    {...params}
                                    label={"Search Symbol (" + this.state.symbolList.length + ")"}
                                    margin="normal"
                                    variant="standard"

                                    name="search"
                                    value={this.state.search}
                                    InputProps={{ ...params.InputProps, type: 'search' }}
                                />
                            )}
                        />

                        <div style={{ marginLeft: '10px' }}>
                            <FormControl style={{ paddingLeft: '12px' }} style={styles.selectStyle} >
                                <InputLabel htmlFor="gender">Select Watchlist</InputLabel>
                                <Select value={this.state.selectedWatchlist} name="selectedWatchlist" onChange={this.onChangeWatchlist}>
                                    <MenuItem value={"selectall"}>{"Select All"}</MenuItem>

                                    {this.state.totalWatchlist && this.state.totalWatchlist.map(element => (
                                        <MenuItem value={element}>{element}</MenuItem>
                                    ))
                                    }

                                </Select>
                            </FormControl>

                        </div>



                        <div style={{ overflowY: 'scroll', height: "75vh" }}>

                            {this.state.symbolList && this.state.symbolList.length ? this.state.symbolList.map(row => (
                                <>
                                    <ListItem button style={{ fontSize: '12px' }} >
                                        <ListItemText style={{ color: this.state[row.symbol + 'nc'] > 0 ? '' : "" }} onClick={() => this.LoadSymbolDetails(row.symbol)} primary={row.name} /> {this.state[row.symbol + 'ltp']} ({this.state[row.symbol + 'nc']}%) <DeleteIcon onClick={() => this.deleteItemWatchlist(row.symbol)} />
                                    </ListItem>

                                </>
                            )) : ''}
                        </div>

                        {/* <Tab style={{position: 'fixed'}}  data={{symbolList : this.state.symbolList, LoadSymbolDetails: this.LoadSymbolDetails, deleteItemWatchlist: this.deleteItemWatchlist }}/> */}

                    </Grid>




                    <Grid item xs={12} sm={10}>


                        <Grid direction="row" alignItems="center" container>

                           <Grid style={{display:"none"}} direction="row" alignItems="center" container>
    
                            <Grid item xs={10} sm={5}>
                                <Typography variant="h5"  >
                                    {this.state.tradingsymbol} : {this.state.InstrumentLTP ? this.state.InstrumentLTP.ltp : ""}   {this.state.sbinLtp}
                                </Typography>
                                Open : {this.state.InstrumentLTP ? this.state.InstrumentLTP.open : ""} &nbsp;
                                High : {this.state.InstrumentLTP ? this.state.InstrumentLTP.high : ""} &nbsp;
                                Low :  {this.state.InstrumentLTP ? this.state.InstrumentLTP.low : ""}&nbsp;
                                Previous Close :  {this.state.InstrumentLTP ? this.state.InstrumentLTP.close : ""} &nbsp;

                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <FormControl style={styles.selectStyle}>
                                    <InputLabel htmlFor="gender">Order Type</InputLabel>
                                    <Select value={this.state.producttype} name="producttype" onChange={this.onChange}>
                                        <MenuItem value={"INTRADAY"}>INTRADAY</MenuItem>
                                        <MenuItem value={"DELIVERY"}>DELIVERY</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={10} sm={1}>
                                <TextField id="buyPrice" label="Buy Price" value={this.state.buyPrice} name="buyPrice" onChange={this.onChange} />
                            </Grid>
                            <Grid item xs={10} sm={1}>
                                <TextField id="quantity" label="Qty" value={this.state.quantity} name="quantity" onChange={this.onChange} />
                            </Grid>
                            <Grid item xs={10} sm={1}>
                                <TextField id="stoploss" label="SL" value={this.state.stoploss} name="stoploss" onChange={this.onChange} />
                            </Grid>


                            <Grid item xs={1} sm={2}  >

                                <Button variant="contained" color="" style={{ marginLeft: '20px' }} onClick={() => this.placeOrder('BUY')}>Buy</Button>
                                <Button variant="contained" color="" style={{ marginLeft: '20px' }} onClick={() => this.placeOrder('SELL')}>Sell</Button>
                            </Grid>

                    `            <Table size="small" aria-label="sticky table" >
                                <TableHead style={{ width: "", whiteSpace: "nowrap" }} variant="head">
                                    <TableRow variant="head" style={{ fontWeight: 'bold' }}>

                                        {/* <TableCell className="TableHeadFormat" align="center">Instrument</TableCell> */}
                                        <TableCell className="TableHeadFormat" align="center">Timestamp</TableCell>
                                        <TableCell className="TableHeadFormat" align="center">Open</TableCell>
                                        <TableCell className="TableHeadFormat" align="center">High</TableCell>
                                        <TableCell className="TableHeadFormat" align="center">Low</TableCell>
                                        <TableCell className="TableHeadFormat" align="center">Close </TableCell>
                                        <TableCell className="TableHeadFormat" align="center">Volume</TableCell>

                                    </TableRow>
                                </TableHead>
                                <TableBody style={{ width: "", whiteSpace: "nowrap" }}>


                                    {this.state.InstrumentHistroy && this.state.InstrumentHistroy ? this.state.InstrumentHistroy.map((row, i) => (
                                        <TableRow key={i} >

                                            <TableCell align="center">{new Date(row[0]).toLocaleString()}</TableCell>
                                            <TableCell align="center">{row[1]}</TableCell>
                                            <TableCell align="center">{row[2]}</TableCell>
                                            <TableCell align="center">{row[3]}</TableCell>
                                            <TableCell align="center">{row[4]}</TableCell>
                                            <TableCell align="center">{row[5]}</TableCell>

                                        </TableRow>
                                    )) : ''}
                                </TableBody>
                            </Table>

                            </Grid>



                            <Grid direction="row" alignItems="center" container>

                                    <Grid direction="row" container spacing={2}>

                                        <Grid item xs={12} sm={2} style={{ marginTop: '15px' }}>
                                            <FormControl style={styles.selectStyle}>
                                                <InputLabel htmlFor="Nationality">Pattern Type</InputLabel>
                                                <Select value={this.state.patternType} name="patternType" onChange={this.onChangePattern}>
                                                    <MenuItem value={"TweezerTop"}>Tweezer Top</MenuItem>
                                                    <MenuItem value={"TweezerBottom"}>Tweezer Bottom</MenuItem>
                                                    <MenuItem value={"NR4"}>Narrow Range 4</MenuItem>
                                                    <MenuItem value={"NR4ForNextDay"}>NR4 For Next Day</MenuItem>

                                            
                                                    <MenuItem value={"NR4_SameDay"}>NR4 ByDate</MenuItem>
                                                    <MenuItem value={"NR4_Daywide_daterage"}>NR4 Daywise Range</MenuItem>
                                                    
                                                </Select>
                                            </FormControl>
                                        </Grid>


                                        <Grid item xs={12} sm={4}>
                                            <MaterialUIDateTimePicker callbackFromParent={dateParam} />
                                        </Grid>



                                        <Grid item xs={12} sm={6} style={{ marginTop:'28px'}}>
                                            {this.state.backTestFlag ? <Button variant="contained" onClick={() => this.backTestAnyPattern()}>Search</Button> : <> <Button> <Spinner /> &nbsp; &nbsp; Scaning: {this.state.stockTesting}  {this.state.runningTest}  </Button>  <Button variant="contained" onClick={() => this.stopBacktesting()}>Stop</Button> </> }
                                            SearchFailed:{this.state.searchFailed}

                                        </Grid>

                                        <Grid item xs={12} sm={12}>

                                 
                                        {this.state.patternType == 'NR4' || this.state.patternType == 'TweezerTop' || this.state.patternType == 'TweezerBottom' || this.state.patternType == 'NR4_SameDay' ?   <Table size="small" aria-label="sticky table" >

                                        <TableHead style={{ width: "", whiteSpace: "nowrap" }} variant="head">
                                            <TableRow style={{  background: "lightgray" }}>

                                                <TableCell style={{ color: localStorage.getItem('sumPerChange') > 0 ? "green" : "red" }} align="center"><b>{localStorage.getItem('sumPerChange')}%</b></TableCell>
                                            
                                                {/* <TableCell style={{ color: "red" }} align="center"><b>{localStorage.getItem('sumBrokeragePer')}%</b></TableCell>
                                                <TableCell style={{ color: localStorage.getItem('netSumPerChange') > 0 ? "green" : "red" }} align="center"><b>{localStorage.getItem('netSumPerChange')}%</b></TableCell> */}


                                                <TableCell style={{ color: localStorage.getItem('sumPnlValue') > 0 ? "green" : "red" }} align="center"><b>{localStorage.getItem('sumPnlValue')}</b></TableCell>
                                            
                                                <TableCell style={{ color: localStorage.getItem('sumPerChangeHighLow') > 0 ? "green" : "red" }} align="center"><b>{localStorage.getItem('sumPerChangeHighLow')}%</b></TableCell>
                                                <TableCell style={{ color: localStorage.getItem('sumPnlValueOnHighLow') > 0 ? "green" : "red" }} align="center"><b>{localStorage.getItem('sumPnlValueOnHighLow')}</b></TableCell>

                                                

                                            
                                                <TableCell align="left" >Total Trades: {this.state.backTestResult && this.state.backTestResult.length} Win: {localStorage.getItem('totalWin')} Loss: {localStorage.getItem('totalLoss')}</TableCell>


                                                <TableCell align="center">Long: {localStorage.getItem('totalLongTrade')} Short:  {this.state.backTestResult && this.state.backTestResult.length - localStorage.getItem('totalLongTrade')}</TableCell>
                                                <TableCell align="left" colSpan={2}> Total Invested  {localStorage.getItem('totalInvestedValue')}</TableCell>

                                                <TableCell align="center" colSpan={4}> Average gross/trade PnL:  <b style={{ color: (localStorage.getItem('sumPerChange') / this.state.backTestResult.length) > 0 ? "green" : "red" }} >{(localStorage.getItem('sumPerChange') / this.state.backTestResult.length).toFixed(2)}%</b></TableCell>
                                        

                                            </TableRow>
                                            <TableRow variant="head" style={{ fontWeight: 'bold' }}>


                                                <TableCell className="TableHeadFormat" align="center">CPnl% </TableCell>

                                                {/* <TableCell className="TableHeadFormat" align="center">Charges</TableCell>
                                                <TableCell className="TableHeadFormat" align="center">Net PnL %</TableCell> */}

                                                <TableCell className="TableHeadFormat"  align="center">CNetPnL </TableCell>

                                                <TableCell className="TableHeadFormat" title="High on long side | Low in short side" align="center">HLPnL% </TableCell>
                                                <TableCell className="TableHeadFormat"  title="High on long side | Low in short side" align="center">HLNet PnL</TableCell>

                                                <TableCell className="TableHeadFormat" align="left">Symbol</TableCell>
                                                <TableCell className="TableHeadFormat" align="left">EntryTaken</TableCell>
                                                <TableCell className="TableHeadFormat" align="center">SquiredOffAt</TableCell>

                                                <TableCell className="TableHeadFormat" align="center">ExitStatus</TableCell>
                                                
                                                <TableCell className="TableHeadFormat" align="center">Buy</TableCell>
                                                <TableCell className="TableHeadFormat" align="center">Sell(Qty)</TableCell>
                                                <TableCell className="TableHeadFormat" title="High on long side | Low in short side" align="center">High/Low</TableCell>


                                                <TableCell className="TableHeadFormat" align="center">StopLoss</TableCell>
                                                {/* <TableCell className="TableHeadFormat" align="center">Sr. </TableCell> */}

                                            
                                            </TableRow>
                                        </TableHead>
                                        <TableBody style={{ width: "", whiteSpace: "nowrap" }}>
                                        

                                    {this.state.backTestResult ? this.state.backTestResult.map((row, i) => (



                                        //    style={{display: row.orderActivated ? 'visible' : 'none'}} "darkmagenta" : "#00cbcb"
                                        <TableRow hover key={i}  >

                                            <TableCell style={{ color: row.perChange > 0 ? "green" : "red" }} align="center" {...sumPerChange = sumPerChange + parseFloat(row.perChange || 0)}>{row.perChange}%</TableCell>
                                            {/* <TableCell style={{ color: "gray" }} align="center" {...sumBrokeragePer = sumBrokeragePer + parseFloat(row.brokerageCharges)}>{row.brokerageCharges}%</TableCell>
                                            <TableCell style={{ color: (row.perChange - row.brokerageCharges) > 0 ? "green" : "red" }} align="center" {...netSumPerChange = netSumPerChange + parseFloat(row.perChange - row.brokerageCharges)}> <b>{(row.perChange - row.brokerageCharges).toFixed(2)}%</b></TableCell>
                                            */}
                                            <TableCell {...tradetotal = ((row.sellEntyPrice * (row.perChange - row.brokerageCharges) / 100) * row.quantity)} {...sumPnlValue = sumPnlValue + tradetotal} {...totalWin +=  (((row.sellEntyPrice * (row.perChange - row.brokerageCharges) / 100) * row.quantity) > 0 ? 1 : 0)} {...totalLoss += ((row.sellEntyPrice * (row.perChange - row.brokerageCharges) / 100) * row.quantity) < 0 ? 1 : 0}  style={{ color: tradetotal > 0 ? "green" : "red" }}  align="center" > {tradetotal.toFixed(2)}</TableCell>

                                            <TableCell style={{ color: row.perChngOnHighLow > 0 ? "green" : "red" }} align="center" {...sumPerChangeHighLow = sumPerChangeHighLow + parseFloat(row.perChngOnHighLow || 0)}> <b>{row.perChngOnHighLow}%</b></TableCell>
                                            <TableCell {...sumPnlValueOnHighLow = sumPnlValueOnHighLow + ((row.sellEntyPrice * (row.perChngOnHighLow - row.brokerageCharges) / 100) * row.quantity)} style={{ color: ((row.sellEntyPrice * (row.perChngOnHighLow - row.brokerageCharges) / 100) * row.quantity) > 0 ? "green" : "red" }} align="center" >{((row.sellEntyPrice * (row.perChngOnHighLow - row.brokerageCharges) / 100) * row.quantity).toFixed(2)}</TableCell>



                                            <TableCell align="left"> <Button  variant="contained" style={{ marginLeft: '20px' }} onClick={() => this.showCandleBothChart(row)}>{row.symbol} <EqualizerIcon /> </Button></TableCell>

                                            <TableCell align="left" style={{ color: row.foundAt && row.foundAt.indexOf('Long') == 0  ? "green" : "red" }} {... totalLongTrade = totalLongTrade + ( row.foundAt && row.foundAt.indexOf('Long') == 0 ? 1 : 0) }>{row.foundAt}</TableCell>
                                            <TableCell align="center">{row.squareOffAt}</TableCell>

                                            <TableCell align="center">{row.exitStatus}</TableCell>

                                            <TableCell align="center">{row.buyExitPrice}</TableCell>

                                            <TableCell align="center" {...totalInvestedValue = totalInvestedValue + (row.foundAt && row.foundAt.indexOf('Long') == 0  ? parseFloat(row.buyExitPrice * row.quantity) : parseFloat(row.sellEntyPrice * row.quantity)) }>{row.sellEntyPrice}({row.quantity})</TableCell>
                                            <TableCell  title="High on long side | Low in short side" align="center">{row.highAndLow}</TableCell>

                                            
                                            <TableCell align="center">{row.stopLoss}</TableCell>
                                            {/* <TableCell align="center">{i + 1}</TableCell> */}

                                        </TableRow>



                                    )) : ''}


                                    <TableRow style={{  background: "lightgray" }} >

                                        <TableCell style={{ color: sumPerChange > 0 ? "green" : "red" }} align="center"><b>{localStorage.setItem('sumPerChange', sumPerChange.toFixed(2))}{sumPerChange.toFixed(2)}%</b></TableCell>
                                        
                                        {/* <TableCell style={{ color: "red" }} align="center"><b>-{(sumBrokeragePer).toFixed(2)}%</b>{localStorage.setItem('sumBrokeragePer', sumBrokeragePer.toFixed(2))}</TableCell>
                                        <TableCell style={{ color: netSumPerChange > 0 ? "green" : "red" }} align="center"><b>{(netSumPerChange).toFixed(2)}%</b>{localStorage.setItem('netSumPerChange', netSumPerChange.toFixed(2))}</TableCell> */}

                                        <TableCell style={{ color: sumPnlValue > 0 ? "green" : "red" }} align="center"><b>{(sumPnlValue).toFixed(2)}</b>{localStorage.setItem('sumPnlValue', sumPnlValue.toFixed(2))}</TableCell>

                                        <TableCell style={{ color: sumPerChangeHighLow > 0 ? "green" : "red" }} align="center"><b>{localStorage.setItem('sumPerChangeHighLow', sumPerChangeHighLow.toFixed(2))}{sumPerChangeHighLow.toFixed(2)}%</b></TableCell>
                                        <TableCell style={{ color: sumPnlValueOnHighLow > 0 ? "green" : "red" }} align="center"><b>{(sumPnlValueOnHighLow).toFixed(2)}</b>{localStorage.setItem('sumPnlValueOnHighLow', sumPnlValueOnHighLow.toFixed(2))}</TableCell>


                                        <TableCell align="left" > {localStorage.setItem('totalLongTrade', totalLongTrade)} {localStorage.setItem('totalInvestedValue', totalInvestedValue.toFixed(2))} </TableCell>

                                        <TableCell align="left">{localStorage.setItem('sumPerChangeHighLow', sumPerChangeHighLow.toFixed(2))} {localStorage.setItem('sumPnlValueOnHighLow', sumPnlValueOnHighLow.toFixed(2))}</TableCell>

                                        <TableCell align="left">{localStorage.setItem('totalWin', totalWin)}{localStorage.setItem('totalLoss', totalLoss)}</TableCell>


                                        <TableCell align="left" > </TableCell>
                                        <TableCell align="left"> </TableCell>

                                        <TableCell align="left"> </TableCell>
                                        <TableCell align="left"> </TableCell>
                                        <TableCell align="left"> </TableCell>


                                        

                                    </TableRow>
                                        </TableBody>
                                        </Table>

                                        : ""}



                                        {this.state.patternType == 'NR4_Daywide_daterage' ?  <>

                                        {this.state.dateAndTypeKeys ? this.state.dateAndTypeKeys.map(key => (

                                                <Table size="small" aria-label="sticky table"  style={{ padding:"5px"}}>
                                                    <TableHead style={{ width: "", whiteSpace: "nowrap" }} variant="head">
                                                    
                                                            <TableRow style={{  background: "lightgray" }}  key={key}>
                                                                <TableCell  colSpan={11} className="TableHeadFormat" align="center"> {key}  {sumPerChange = 0, sumBrokeragePer = 0, netSumPerChange = 0,sumPerChangeHighLow =0,  sumPnlValue = 0,sumPnlValueOnHighLow = 0,  totalInvestedValue = 0, totalLongTrade=0, totalShortTrade=0}</TableCell>
                                                            </TableRow>

                                                            <TableRow key={key+1}  variant="head" style={{ fontWeight: 'bold' , background: "lightgray" }}>


                                                                <TableCell className="TableHeadFormat" align="center"> CPnL% </TableCell>

                                                                {/* <TableCell className="TableHeadFormat" align="center">Charges</TableCell>
                                                                <TableCell className="TableHeadFormat" align="center">Net PnL %</TableCell> */}

                                                                <TableCell className="TableHeadFormat"  align="center">CNetPnL </TableCell>

                                                                <TableCell className="TableHeadFormat" title="High on long side | Low in short side" align="center">HLPnL% </TableCell>
                                                                <TableCell className="TableHeadFormat"  title="High on long side | Low in short side" align="center">HLNet PnL</TableCell>

                                                                <TableCell className="TableHeadFormat" align="left">Symbol</TableCell>
                                                                <TableCell className="TableHeadFormat" align="left">FoundAt</TableCell>
                                                                <TableCell className="TableHeadFormat" align="center">Buy</TableCell>
                                                                <TableCell className="TableHeadFormat" align="center">Sell(Qty)</TableCell>
                                                                <TableCell className="TableHeadFormat" title="High on long side | Low in short side" align="center">High/Low</TableCell>


                                                                <TableCell className="TableHeadFormat" align="center">SquiredOffAt</TableCell>
                                                                <TableCell className="TableHeadFormat" align="center">StopLoss</TableCell>
                                                                {/* <TableCell className="TableHeadFormat" align="center">Sr. </TableCell> */}


                                                            </TableRow>

                                                            </TableHead>
                                                            <TableBody style={{ width: "", whiteSpace: "nowrap" }}>

                                                        

                                                            {this.state.backTestResultDateRange[key].map((row, i) => (


                                                            //    style={{display: row.orderActivated ? 'visible' : 'none'}} "darkmagenta" : "#00cbcb"
                                                            
                                                                    <TableRow hover key={i}  >

                                                                    <TableCell style={{ color: row.perChange > 0 ? "green" : "red" }} align="center" {...sumPerChange = sumPerChange + parseFloat(row.perChange || 0)}>{row.perChange}%</TableCell>
                                                                    {/* <TableCell style={{ color: "gray" }} align="center" {...sumBrokeragePer = sumBrokeragePer + parseFloat(row.brokerageCharges)}>{row.brokerageCharges}%</TableCell>
                                                                    <TableCell style={{ color: (row.perChange - row.brokerageCharges) > 0 ? "green" : "red" }} align="center" {...netSumPerChange = netSumPerChange + parseFloat(row.perChange - row.brokerageCharges)}> <b>{(row.perChange - row.brokerageCharges).toFixed(2)}%</b></TableCell>
                                                                */}
                                                                    <TableCell {...sumPnlValue = sumPnlValue + ((row.sellEntyPrice * (row.perChange - row.brokerageCharges) / 100) * row.quantity)} style={{ color: ((row.sellEntyPrice * (row.perChange - row.brokerageCharges) / 100) * row.quantity) > 0 ? "green" : "red" }} align="center" > {((row.sellEntyPrice * (row.perChange - row.brokerageCharges) / 100) * row.quantity).toFixed(2)}</TableCell>

                                                                    <TableCell style={{ color: row.perChngOnHighLow > 0 ? "green" : "red" }} align="center" {...sumPerChangeHighLow = sumPerChangeHighLow + parseFloat(row.perChngOnHighLow || 0)}> <b>{row.perChngOnHighLow}%</b></TableCell>
                                                                    <TableCell {...sumPnlValueOnHighLow = sumPnlValueOnHighLow + ((row.sellEntyPrice * (row.perChngOnHighLow - row.brokerageCharges) / 100) * row.quantity)} style={{ color: ((row.sellEntyPrice * (row.perChngOnHighLow - row.brokerageCharges) / 100) * row.quantity) > 0 ? "green" : "red" }} align="center" >{((row.sellEntyPrice * (row.perChngOnHighLow - row.brokerageCharges) / 100) * row.quantity).toFixed(2)}</TableCell>



                                                                    <TableCell align="left"> <Button  variant="contained" style={{ marginLeft: '20px' }} onClick={() => this.showCandleChart(row.candleChartData, row.symbol)}>{row.symbol} <EqualizerIcon /> </Button></TableCell>

                                                                    <TableCell align="left" style={{ color: row.foundAt.indexOf('Long') == 0  ? "green" : "red" }} {... totalLongTrade = totalLongTrade + (row.foundAt.indexOf('Long') == 0 ? 1 : 0) }>{row.foundAt}</TableCell>
                                                                    <TableCell align="center">{row.buyExitPrice}</TableCell>

                                                                    <TableCell align="center" {...totalInvestedValue = totalInvestedValue + (row.foundAt.indexOf('Long') == 0  ? parseFloat(row.buyExitPrice * row.quantity) : parseFloat(row.sellEntyPrice * row.quantity)) }>{row.sellEntyPrice}({row.quantity})</TableCell>
                                                                    <TableCell  title="High on long side | Low in short side" align="center">{row.highAndLow}</TableCell>

                                                                    <TableCell align="center">{row.squareOffAt}</TableCell>
                                                                
                                                                    <TableCell align="center">{row.stopLoss}</TableCell>
                                                                    {/* <TableCell align="center">{i + 1}</TableCell> */}

                                                                </TableRow>


                                                            ))}



                                                    <TableRow style={{  background: "lightgray" }} >

                                                    <TableCell style={{ color: sumPerChange > 0 ? "green" : "red" }} align="center"><b>{localStorage.setItem('sumPerChange', sumPerChange.toFixed(2))}{sumPerChange.toFixed(2)}%</b></TableCell>

                                                    {/* <TableCell style={{ color: "red" }} align="center"><b>-{(sumBrokeragePer).toFixed(2)}%</b>{localStorage.setItem('sumBrokeragePer', sumBrokeragePer.toFixed(2))}</TableCell>
                                                    <TableCell style={{ color: netSumPerChange > 0 ? "green" : "red" }} align="center"><b>{(netSumPerChange).toFixed(2)}%</b>{localStorage.setItem('netSumPerChange', netSumPerChange.toFixed(2))}</TableCell> */}

                                                    <TableCell style={{ color: sumPnlValue > 0 ? "green" : "red" }} align="center"><b>{(sumPnlValue).toFixed(2)}</b>{localStorage.setItem('sumPnlValue', sumPnlValue.toFixed(2))}</TableCell>

                                                    <TableCell style={{ color: sumPerChangeHighLow > 0 ? "green" : "red" }} align="center"><b>{localStorage.setItem('sumPerChangeHighLow', sumPerChangeHighLow.toFixed(2))}{sumPerChangeHighLow.toFixed(2)}%</b></TableCell>
                                                    <TableCell style={{ color: sumPnlValueOnHighLow > 0 ? "green" : "red" }} align="center"><b>{(sumPnlValueOnHighLow).toFixed(2)}</b>{localStorage.setItem('sumPnlValueOnHighLow', sumPnlValueOnHighLow.toFixed(2))}</TableCell>


                                                    <TableCell align="left" > {localStorage.setItem('totalLongTrade', totalLongTrade)} {localStorage.setItem('totalInvestedValue', totalInvestedValue.toFixed(2))} </TableCell>

                                                    <TableCell align="left">{localStorage.setItem('sumPerChangeHighLow', sumPerChangeHighLow.toFixed(2))} {localStorage.setItem('sumPnlValueOnHighLow', sumPnlValueOnHighLow.toFixed(2))}</TableCell>

                                                    <TableCell align="left"></TableCell>


                                                    <TableCell align="left" > </TableCell>
                                                    <TableCell align="left"> </TableCell>

                                                    <TableCell align="left"> </TableCell>
                                                    <TableCell align="left"> </TableCell>




                                                    </TableRow>

                                                    </TableBody>
                                                </Table>
                                                

                                            
                                            )) : ''}

                                            </>

                                        : ""}


                                        {this.state.patternType == 'NR4ForNextDay' ?   

                                        <Typography component="h3" variant="h6" color="primary" gutterBottom>
                                           NR4 For Next Day  ({this.state.FoundPatternList.length})  at {this.state.endDate && this.state.endDate ? this.state.endDate.toString().substr(0, 16)   : new Date().toString().substr(0, 16)}
                                        </Typography> 
                                        : ""}
                                            
                                        {this.state.patternType == 'NR4ForNextDay' ?   
                                         <Table size="small" aria-label="sticky table" >

                                            <TableHead style={{ width: "", whiteSpace: "nowrap" }} variant="head">
                                               
                                                <TableRow variant="head" style={{ fontWeight: 'bold' }}>

                                                   <TableCell className="TableHeadFormat" align="center">Sr </TableCell>


                                                    <TableCell className="TableHeadFormat"  align="left">Symbol </TableCell>
                                                    <TableCell className="TableHeadFormat" align="left">FoundAt </TableCell>
                                                    <TableCell className="TableHeadFormat" align="left">Past Performance </TableCell>

                                                    <TableCell className="TableHeadFormat" align="left">BuyAt</TableCell>
                                                    <TableCell className="TableHeadFormat" align="left">SellAt</TableCell>
                                                    <TableCell className="TableHeadFormat" align="left">High</TableCell>
                                                    <TableCell className="TableHeadFormat" align="left">Low</TableCell>
                                                    <TableCell className="TableHeadFormat" align="left">Close</TableCell>

                                                 
                                                </TableRow>
                                            </TableHead>
                                            <TableBody style={{ width: "", whiteSpace: "nowrap" }}>
                                        

                                           
                                        {this.state.FoundPatternList ? this.state.FoundPatternList.map((row, i) => (



                                            //    style={{display: row.orderActivated ? 'visible' : 'none'}} "darkmagenta" : "#00cbcb"
                                            <TableRow hover key={i}  >
                                                <TableCell align="center">{i + 1}</TableCell>
                                                <TableCell align="left"> <Button  variant="contained" style={{ marginLeft: '20px' }} onClick={() => this.showCandleChart(row.candleChartData, row.symbol)}>{row.symbol} <EqualizerIcon /> </Button></TableCell>

                                                <TableCell align="left">{row.foundAt.substr(0, 16)}</TableCell>
                                                <TableCell align="left" title="based on last one 6 month">  
                                                
                                                <span style={{background: row.pastPerferm.totalLongPer/row.pastPerferm.totalLongs >= 1 ? "#92f192" : ""}}><b>{row.pastPerferm.totalLongs}</b>  Longs:  {row.pastPerferm.totalLongPer}% ({(row.pastPerferm.totalLongPer/row.pastPerferm.totalLongs).toFixed(2)}% per trade)  </span> <br/>
                                                 Longs on High%: {row.pastPerferm.totalLongHighPer}%  ({(row.pastPerferm.totalLongHighPer/row.pastPerferm.totalLongs).toFixed(2)}% per trade)<br/>
                                                 {row.longCandles && row.longCandles.map((insiderow, i) => (
                                                       <>
                                                         {/* <Button size="small"  variant="contained" style={{ marginLeft: '20px' }} onClick={() => this.showCandleChart(insiderow.candleChartData, row.symbol, insiderow)}> <EqualizerIcon /></Button> */}
                                                     
                                                        <a style={{textDecoration: 'underline', background: 'lightgray',cursor: 'pointer'}} onClick={() => this.showCandleChart(insiderow.candleChartData, row.symbol, insiderow)}> {insiderow.foundAt.substr(7, 10)} </a>  &nbsp;
                                                        </>
                                                ))}

                                                <br/>

                                                <span style={{background: row.pastPerferm.totalShortPer/row.pastPerferm.totalShort >= 1 ? "#e87b7b" : ""}}><b>{row.pastPerferm.totalShort}</b> Short: {row.pastPerferm.totalShortPer}% ({(row.pastPerferm.totalShortPer/row.pastPerferm.totalShort).toFixed(2)}% per trade) </span> <br/>
                                                Short on Low%: {row.pastPerferm.totalShortLowPer}% ({(row.pastPerferm.totalShortLowPer/row.pastPerferm.totalShort).toFixed(2)}% per trade)<br/>
                                                {row.shortCandles && row.shortCandles.map((insiderow, i) => (
                                                <>
                                                <a style={{textDecoration: 'underline', background: 'lightgray', cursor: 'pointer'}} onClick={() => this.showCandleChart(insiderow.candleChartData, row.symbol, insiderow)}> {insiderow.foundAt.substr(7, 10)}  </a> &nbsp;
                                              
 
                                                </>
                                                ))}
                                                
                                                </TableCell>

                                                
                                                <TableCell align="left">{row.BuyAt}</TableCell>
                                                <TableCell align="left">{row.SellAt}</TableCell>
                                                <TableCell align="left">{row.high}</TableCell>
                                                <TableCell align="left">{row.low}</TableCell>
                                                <TableCell align="left">{row.close}</TableCell>


                                            </TableRow>



                                        )) : ''}

                                        </TableBody>

                                        </Table>
                                        
                                        : ""}
                                        </Grid>             


                                    </Grid>


              
                            </Grid>




                        </Grid>
                    </Grid>







                </Grid>

            </React.Fragment>
        )


    }


}


const styles = {
    formContainer: {
        display: 'flex',
        flexFlow: 'row wrap'
    },

    textStyle: {
        display: 'flex',
        justifyContent: 'center'

    },
    imgStyle: {
        display: 'flex'
    },

    selectStyle: {
        minWidth: '100%',
        marginBottom: '10px'
    },
    MuiTextField: {
        overflowY: 'scroll',
        fontSize: "12px",
        maxHeight: "50px",

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