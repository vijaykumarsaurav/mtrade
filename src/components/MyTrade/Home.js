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
import { createChart } from 'lightweight-charts';

import { w3cwebsocket } from 'websocket';
import ChartDialog from './ChartDialog';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import pako from 'pako';
import vwap from 'vwap';
import { SMA, RSI, VWAP, BollingerBands } from 'technicalindicators';
import SimpleExpansionPanel from "./SimpleExpansionPanel";
import SimpleExpansionFastMovement from "./SimpleExpansionFastMovement";
import LiveBidsExpantion from "./LiveBidsExpantion";
import WatchListTab from "./WatchListTab"; 
import OrderWatchlist from './OrderWatchlist';


class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sumPercentage: 0,
            InstrumentPerChange: "",
            autoSearchList: [],
            isDasable: false,
            isError: false,
            InstrumentLTP: {},
            ifNotBought: true,
            autoSearchTemp: [],
            backTestResult: [],
            backTestFlag: true,
            patternType: "",  //NR4ForNextDay  NR4_SameDay
            symboltoken: "",
            tradingsymbol: "",
            buyPrice: 0,
            quantity: 1,
            producttype: "INTRADAY",
            symbolList: localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')) || [],
            totalWatchlist: localStorage.getItem('totalWatchlist') && JSON.parse(localStorage.getItem('totalWatchlist')) || [],
            staticData: localStorage.getItem('staticData') && JSON.parse(localStorage.getItem('staticData')) || {},
            selectedWatchlist: 'NIFTY BANK', //'Securities in F&O',
            longExitPriceType: 4,
            shortExitPriceType: 4,
            candleChartData: [],
            stopScaningFlag: false,
            backTestResultDateRange: [],
            searchFailed: 0,
            openEqualHighList: [],
            openEqualLowList: [],
            closeingEqualHighList:[], 
            chartStaticData: [],
            volumeCrossedList: [],
            slowMotionStockList: [],
            volumeBreakoutlast5CandleList: [], 
            oneHourBullBearCheckList: [],
            timeFrame: "FIFTEEN_MINUTE",
            cursor: '',
            advanceShareCount: 0,
            declineShareCount: 0,
            UnchangeShareCount: 0,
            FoundPatternList: localStorage.getItem('FoundPatternList') && JSON.parse(localStorage.getItem('FoundPatternList')) || [],
            fastMovementList:  localStorage.getItem('fastMovementList') && JSON.parse(localStorage.getItem('fastMovementList')) || [],
            liveBidsList :  [], //localStorage.getItem('liveBidsList') && JSON.parse(localStorage.getItem('liveBidsList')) || [],
            gainerList : localStorage.getItem('gainerList') && JSON.parse(localStorage.getItem('gainerList')) || [],
            looserList : localStorage.getItem('looserList') && JSON.parse(localStorage.getItem('looserList')) || [],    
        };
        this.myCallback = this.myCallback.bind(this);
        this.updateSocketWatch = this.updateSocketWatch.bind(this);

    }
    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
        var data = e.target.value;
        AdminService.autoCompleteSearch(data).then(res => {
            let data = res.data;
          //  console.log(data);
            localStorage.setItem('autoSearchTemp', JSON.stringify(data));
            this.setState({ autoSearchList: data });
        })

    }

    onInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value }, function () {
        //    console.log("time", this.state.timeFrame);
            if (this.state.tradingsymbol) {
                this.showStaticChart(this.state.symboltoken);
            }
        });
    }

    onChangePattern = (e) => {
        this.setState({ [e.target.name]: e.target.value });

        if (e.target.value == 'NR4_Daywide_daterage') {

            var backTestResultDateRange = localStorage.getItem('backTestResultDateRange') && JSON.parse(localStorage.getItem('backTestResultDateRange'));

            this.setState({ dateAndTypeKeys: Object.keys(backTestResultDateRange || {}), backTestResultDateRange: backTestResultDateRange });

        }
    }
    onChangeWatchlist = (e) => {
        this.setState({ [e.target.name]: e.target.value });
        var staticData = this.state.staticData;
        this.setState({ symbolList: staticData[e.target.value] }, function () {
            //    this.updateSocketWatch();
            this.checkOpenEqualToLow();
            this.setState({ cursor: '' });
        });

        if (e.target.value == "selectall") {
            this.setState({ symbolList: localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')) }, function () {
                //      this.updateSocketWatch();
             //  this.checkOpenEqualToLow();
                this.setState({ cursor: '' });
            });
        }
    }
    checkOpenEqualToLow = async () => {

        this.setState({
            openEqualHighList: [], openEqualLowList: [], openEqualLowList: [], advanceShareCount: 0,
            declineShareCount: 0, UnchangeShareCount: 0, volumeCrossedList: [],closeingEqualHighList:[]
        });


        for (let index = 0; index < this.state.symbolList.length; index++) {
            const element = this.state.symbolList[index];

            var data = {
                "exchange": element.exch_seg,
                "tradingsymbol": element.symbol,
                "symboltoken": element.token,
            }
            AdminService.getLTP(data).then(res => {
                let data = resolveResponse(res, 'noPop');
                var LtpData = data && data.data;
                if (LtpData) {

                    let change = ((LtpData.ltp - LtpData.close) * 100 / LtpData.close).toFixed(2); 
                    LtpData.nc = change;
                    LtpData.symbol = element.symbol; 
                    
                    this.state.symbolList[index].ltp = LtpData.ltp;
                    this.state.symbolList[index].nc =change; 

                    if (LtpData && LtpData.open == LtpData.low) {
                        console.log("o=l", LtpData);
                        var isfound = this.state.openEqualLowList.filter(row => row.symboltoken == element.token);
                        if(!isfound.length)
                        this.setState({ openEqualLowList: [...this.state.openEqualLowList, LtpData] });
                    }
                    console.log(element.symbol ,"ltp=newhigh", LtpData.ltp, (LtpData.high - LtpData.high*0.5/100));

                    if (LtpData &&  LtpData.ltp >= (LtpData.high - LtpData.high*0.5/100)) {
                        var isfound = this.state.closeingEqualHighList.filter(row => row.symboltoken == element.token);
                        if(!isfound.length)
                        this.setState({ closeingEqualHighList: [...this.state.closeingEqualHighList, LtpData] });
                    }

                    if (LtpData && LtpData.open == LtpData.high) {
                        console.log("o=h", LtpData);
                        var isfound = this.state.openEqualHighList.filter(row => row.symboltoken == element.token);
                        if(!isfound.length)
                        this.setState({ openEqualHighList: [...this.state.openEqualHighList, LtpData] });

                    }

                    if (LtpData.perChange > 0)
                        this.setState({ advanceShareCount: this.state.advanceShareCount + 1 });
                    else if (LtpData.perChange < 0)
                        this.setState({ declineShareCount: this.state.declineShareCount + 1 });
                    else
                        this.setState({ UnchangeShareCount: this.state.UnchangeShareCount + 1 });


                    this.state.symbolList && this.state.symbolList.sort(function (a, b) {
                        return b.nc - a.nc;
                    });
                    this.setState({ symbolList: this.state.symbolList, tradingsymbol: element.symbol, symboltoken: element.token });

                 //   this.dailyBasisInfoCheck(element.token, element);

                   // this.checkSlowMotionStock(element.token, element);

                }
            })
            await new Promise(r => setTimeout(r, 310));
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

            if (LtpData && LtpData.ltp)
                this.setState({ InstrumentPerChange: ((LtpData.ltp - LtpData.close) * 100 / LtpData.close).toFixed(2) });
              //  this.dailyBasisInfoCheck(this.state.symboltoken);

          
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



    makeConnection = (wsClint) => {
        var firstTime_req = '{"task":"cn","channel":"NONLM","token":"' + this.state.feedToken + '","user": "' + this.state.clientcode + '","acctid":"' + this.state.clientcode + '"}';
        wsClint.send(firstTime_req);
        this.updateSocketWatch(wsClint);
    }

    updateSocketWatch = (wsClint) => {
        var channel = this.state.symbolList.map(element => {
            return 'nse_cm|' + element.token;
        });
        channel = channel.join('&');
        var updateSocket = {
            "task": "mw",
            "channel": channel,
            "token": this.state.feedToken,
            "user": this.state.clientcode,
            "acctid": this.state.clientcode
        }
        console.log("updated ws watchlisht", this.state.selectedWatchlist, updateSocket);
        wsClint.send(JSON.stringify(updateSocket));
    }

    updateSocketDetails = (wsClint) => {
        wsClint.onopen = (res) => {
            this.makeConnection(wsClint);
            this.updateSocketWatch(wsClint);
        }

        wsClint.onmessage = (message) => {
            var decoded = window.atob(message.data);
            var data = this.decodeWebsocketData(pako.inflate(decoded));
            var liveData = JSON.parse(data);
            var symbolListArray = this.state.symbolList;
            this.state.symbolList && this.state.symbolList.forEach((element, index) => {
                var foundLive = liveData.filter(row => row.tk == element.token);
                if (foundLive.length > 0 && foundLive[0].ltp && foundLive[0].nc) {
                    symbolListArray[index].ltp = foundLive[0].ltp;
                    symbolListArray[index].nc = foundLive[0].nc;
                    //  console.log("ws onmessage: ", foundLive);

                }
            });
            symbolListArray && symbolListArray.sort(function (a, b) {
                return b.nc - a.nc;
            });
            this.setState({ symbolList: symbolListArray });
        }

        wsClint.onerror = (e) => {
            console.log("socket error", e);
        }

        setInterval(() => {
            //  this.makeConnection();
            var _req = '{"task":"hb","channel":"","token":"' + this.state.feedToken + '","user": "' + this.state.clientcode + '","acctid":"' + this.state.clientcode + '"}';
            // console.log("Request :- " + _req);
            wsClint.send(_req);
        }, 59000);
    }


    componentDidMount() {

        window.document.title = "Home";
        this.setState({ symbolList: this.state.staticData[this.state.selectedWatchlist] });

        var tokens = JSON.parse(localStorage.getItem("userTokens"));
        var feedToken = tokens && tokens.feedToken;
        var userProfile = JSON.parse(localStorage.getItem("userProfile"));
        var clientcode = userProfile && userProfile.clientcode;
        this.setState({ feedToken: feedToken, clientcode: clientcode });

        const domElement = document.getElementById('tvchart');
        document.getElementById('tvchart').innerHTML = '';
        const chart = createChart(domElement, { width: 900, height: 400, timeVisible: true, secondsVisible: true, });
        const candleSeries = chart.addCandlestickSeries();
        var smaLineSeries = chart.addLineSeries({
            color: 'rgba(4, 111, 232, 1)',
            lineWidth: 2,
        });
        var volumeSeries = chart.addHistogramSeries({
            color: '#26a69a',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '',
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        });

        this.setState({ chart: chart, candleSeries: candleSeries, smaLineSeries: smaLineSeries, volumeSeries: volumeSeries });

       // this.checkOpenEqualToLow();

        var beginningTime = moment('9:15am', 'h:mma');
        var endTime = moment('3:30pm', 'h:mma');
        const friday = 5; // for friday
        var currentTime = moment(new Date(), "h:mma");
        const today = moment().isoWeekday();
        //market hours
        if (today <= friday && currentTime.isBetween(beginningTime, endTime)) {
            // const wsClint = new w3cwebsocket('wss://omnefeeds.angelbroking.com/NestHtml5Mobile/socket/stream');
            // this.updateSocketDetails(wsClint);
            setInterval(() => {
                if (this.state.tradingsymbol) {
                    this.getLTP();
                    //this.showStaticChart(this.state.symboltoken);
                }
                var fastMovementList  = localStorage.getItem('fastMovementList') && JSON.parse(localStorage.getItem('fastMovementList')); 
                fastMovementList && fastMovementList.length && fastMovementList.reverse(); 
                this.setState({fastMovementList :fastMovementList })
            }, 1000);
           
            setInterval(() => {
                this.checkSlowMotionCheckLive(); 
             }, 5*75000);

           
             setInterval(() => {
                this.searchValumeBreakoutStock(); 
            }, 15*75000);
          

             var tostartInteral =   setInterval(() => {
                var time = new Date();
                console.log("setinterval ", new Date().toLocaleString()); 
                if(time.getMinutes() % 60 === 0){
                    setTimeout(() => {
                        this.oneHourBullBearCheck(); 
                    }, 90000);
                    setInterval(() => {
                        this.oneHourBullBearCheck(); 
                     }, 60000 * 60 + 70000 );  
                     clearInterval(tostartInteral); 
                } 
            }, 1000);
            
        }   
        
        
        setInterval(() => {

            
            this.setState({gainerList: localStorage.getItem('gainerList') && JSON.parse(localStorage.getItem('gainerList')) })
            this.setState({looserList: localStorage.getItem('looserList') && JSON.parse(localStorage.getItem('looserList')) })


        }, 1000);
        
      //  this.oneHourBullBearCheck(); 

       // this.checkLiveBids();

    }

    // shouldComponentUpdate(nextProps, nextState){
    //     return  false //!equals(nextProps, this.props); // equals() is your implementation
    // }

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

            const currentMoment = startdate;
            const endMoment = enddate;


            while (currentMoment.isSameOrBefore(endMoment, 'day')) {

                console.log(`Loop at ${currentMoment.format('DD-MM-YYYY')}`);

                this.backTestNR4DatewiseRange(currentMoment);

                if (this.state.stopScaningFlag) {
                    break;
                }

                await new Promise(r => setTimeout(r, this.state.symbolList.length * 310));


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


            if (this.state.stopScaningFlag) {
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
                            candleChartData.push([element[0], element[1], element[2], element[3], element[4]]);
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
                                token: element.token,
                                pattenName: "NR4",
                                SellAt: sellenty,
                                high: firstCandle[2],
                                low: firstCandle[3],
                                BuyAt: buyentry,
                                candleChartData: candleChartData,
                                close: firstCandle[4]
                            }

                            this.nr4CheckPastPerfommance(element.token, foundStock);

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


    findShortTraadeOnNextDay = (element, firstCandle, candleChartData, histdataInside) => {
        var buyentry = (firstCandle[3] - (firstCandle[3] / 100 / 10));
        // var buyentrySL = (firstCandle[2] + (firstCandle[2] / 100 / 10));
        var buyentrySL = (buyentry + (buyentry * 1 / 100));   //1% SL


        var resultCandle = [], buyEntryFlag = true, longTradeFound = {}, elementInside = '', buyHighest = histdataInside[0][3];

        console.log(element.symbol, "result candle", histdataInside);

        if (histdataInside && histdataInside.length) {

            for (let index = 0; index < histdataInside.length; index++) {
                const candle5min = histdataInside[index];
                resultCandle.push([new Date(candle5min[0]).getTime(), candle5min[1], candle5min[2], candle5min[3], candle5min[4]]);
                if (candle5min[2] < buyHighest) {
                    buyHighest = candle5min[3];
                }

            }

            for (let insideIndex = 0; insideIndex < histdataInside.length; insideIndex++) {
                elementInside = histdataInside[insideIndex];

                if (buyEntryFlag && elementInside[3] < buyentry) {
                    console.log(element.symbol, "taken short enty", elementInside[3]);
                    longTradeFound = {
                        foundAt: "Short-" + new Date(elementInside[0]).toLocaleString(),
                        symbol: element.symbol,
                        sellEntyPrice: buyentry,
                        stopLoss: buyentrySL,
                        brokerageCharges: 0.06,
                        quantity: Math.floor(100000 / buyentry),
                        candleChartData: candleChartData,
                    }
                    buyEntryFlag = false;
                }



                var perChange = (buyentry - elementInside[3]) * 100 / buyentry;
                console.log(element.symbol, "perChange", perChange);

                //trailing sl  
                // if(elementInside[3] > buyentry && plPerChng >= 0.5){            
                // }

                //flat 1% profit booking
                if (!buyEntryFlag && perChange >= 1) {

                    var sellEntyPrice = buyentry - buyentry * 1 / 100;
                    longTradeFound.buyExitPrice = sellEntyPrice;
                    longTradeFound.perChange = perChange;
                    longTradeFound.squareOffAt = new Date(elementInside[0]).toLocaleString();
                    longTradeFound.exitStatus = "Flat_1%_Booked";
                    break;
                }
                console.log(element.symbol, "high", elementInside[2]);

                if (!buyEntryFlag && elementInside[2] >= buyentrySL) {
                    var perChng = (buyentry - buyentrySL) * 100 / buyentry;
                    longTradeFound.buyExitPrice = buyentrySL;
                    longTradeFound.perChange = perChng;
                    longTradeFound.squareOffAt = new Date(elementInside[0]).toLocaleString();
                    longTradeFound.exitStatus = "SL_Hit";
                    break;
                }

            }

            if (!buyEntryFlag && !longTradeFound.sellEntyPrice) {
                var perChng = (elementInside[4] - buyentry) * 100 / buyentry;
                longTradeFound.buyExitPrice = elementInside[4];
                longTradeFound.perChange = perChng;
                longTradeFound.squareOffAt = new Date(elementInside[0]).toLocaleString();
                longTradeFound.exitStatus = "Market_End";
            }

            if (!buyEntryFlag && Math.floor(100000 / buyentry) && longTradeFound.buyExitPrice) {
                var perChngOnHigh = (buyentry - buyHighest) * 100 / buyentry;
                longTradeFound.highAndLow = buyHighest;
                longTradeFound.perChngOnHighLow = perChngOnHigh;
                longTradeFound.candleChartDataInside = resultCandle;

                this.setState({ backTestResult: [...this.state.backTestResult, longTradeFound] });
            }

        }

    }



    findLongsTraadeOnNextDay = (element, firstCandle, candleChartData, histdataInside) => {
        var buyentry = (firstCandle[2] + (firstCandle[2] / 100 / 10));
        //        var buyentrySL = (firstCandle[3] - (firstCandle[3] / 100 / 10));
        //    var buyentrySL = (buyentry - (buyentry*1/100));   //1% SL
        var buyentrySL = (buyentry - (buyentry * 0.3 / 100));   //0.3% SL


        var resultCandle = [], buyEntryFlag = true, firstTimeTrail = true, trailCount = 0, longTradeFound = {}, elementInside = '', buyHighest = histdataInside[0][2];


        if (histdataInside && histdataInside.length) {

            for (let index = 0; index < histdataInside.length; index++) {
                const candle5min = histdataInside[index];
                resultCandle.push([new Date(candle5min[0]).getTime(), candle5min[1], candle5min[2], candle5min[3], candle5min[4]]);
                if (buyHighest < histdataInside[index][2]) {
                    buyHighest = histdataInside[index][2];
                }
            }

            for (let insideIndex = 0; insideIndex < histdataInside.length; insideIndex++) {
                elementInside = histdataInside[insideIndex];

                if (buyEntryFlag && elementInside[2] > buyentry) {
                    longTradeFound = {
                        foundAt: "Long-" + new Date(elementInside[0]).toLocaleString(),
                        symbol: element.symbol,
                        buyExitPrice: buyentry,
                        stopLoss: buyentrySL,
                        brokerageCharges: 0.06,
                        quantity: Math.floor(100000 / buyentry),
                        candleChartData: candleChartData,
                    }
                    buyEntryFlag = false;
                }



                var perChange = (elementInside[2] - buyentry) * 100 / buyentry;


                //flat 1% profit booking
                // if(!buyEntryFlag && perChange >= 1){
                //     var sellEntyPrice = buyentry + buyentry * 1/100; 
                //     longTradeFound.sellEntyPrice = sellEntyPrice;
                //     longTradeFound.perChange = perChange;
                //     longTradeFound.squareOffAt = new Date(elementInside[0]).toLocaleString();
                //     longTradeFound.exitStatus  = "Flat_1%_Booked"; 
                //     break;
                // }

                if (!buyEntryFlag) {

                    if (firstTimeTrail && perChange >= 0.7) {
                        trailCount += 1;
                        var minPrice = buyentry + (buyentry * 0.1 / 100);
                        longTradeFound.sellEntyPrice = minPrice;
                        longTradeFound.perChange = (minPrice - buyentry) * 100 / buyentry;
                        longTradeFound.squareOffAt = new Date(elementInside[0]).toLocaleString();
                        longTradeFound.exitStatus = "Trail by 0.1% " + trailCount + "time";
                        firstTimeTrail = false;
                    } else {
                        var lastTriggerprice = longTradeFound.sellEntyPrice;
                        var perchngfromTriggerPrice = ((elementInside[2] - lastTriggerprice) * 100 / lastTriggerprice).toFixed(2);

                        var buyExitPricePer = longTradeFound.buyExitPrice;
                        var buyExitPriceMinRange = ((elementInside[2] - buyExitPricePer) * 100 / buyExitPricePer).toFixed(2);

                        if (perchngfromTriggerPrice > 0.7) {
                            trailCount += 1;
                            minPrice = lastTriggerprice + (lastTriggerprice * 0.25 / 100);
                            longTradeFound.sellEntyPrice = minPrice;
                            longTradeFound.perChange = (minPrice - buyentry) * 100 / buyentry;
                            longTradeFound.squareOffAt = new Date(elementInside[0]).toLocaleString();
                            longTradeFound.exitStatus = "Trail by 0.25% " + trailCount + "time";

                        } else if (buyExitPriceMinRange >= 0.3 && buyExitPriceMinRange <= 0.4) {
                            trailCount += 1;
                            minPrice = lastTriggerprice + (lastTriggerprice * 0.25 / 100);
                            longTradeFound.sellEntyPrice = minPrice;
                            longTradeFound.perChange = (minPrice - buyentry) * 100 / buyentry;
                            longTradeFound.squareOffAt = new Date(elementInside[0]).toLocaleString();
                            longTradeFound.exitStatus = "Min range 0.3 -0.4% " + trailCount + "time";
                            break;
                        }

                    }






                    if (elementInside[3] <= longTradeFound.sellEntyPrice) {
                        console.log(element.symbol, "trail hit elementInside[3] <= sellEntyPrice", elementInside[3], longTradeFound.sellEntyPrice, new Date(elementInside[0]).toLocaleString());
                        break;
                    }

                }


                if (!buyEntryFlag && elementInside[3] <= buyentrySL) {
                    console.log(element.symbol, "SL hit elementInside[3] <= buyentrySL", elementInside[3], buyentrySL, new Date(elementInside[0]).toLocaleString());

                    var perChng = (buyentrySL - buyentry) * 100 / buyentry;
                    longTradeFound.sellEntyPrice = buyentrySL;
                    longTradeFound.perChange = perChng;
                    longTradeFound.squareOffAt = new Date(elementInside[0]).toLocaleString();
                    longTradeFound.exitStatus = "SL_Hit";
                    break;
                }

            } //candle loop end

            if (!buyEntryFlag && !longTradeFound.sellEntyPrice) {
                var perChng = (elementInside[4] - buyentry) * 100 / buyentry;
                longTradeFound.buyExitPrice = elementInside[4];
                longTradeFound.perChange = perChng;
                longTradeFound.squareOffAt = new Date(elementInside[0]).toLocaleString();
                longTradeFound.exitStatus = "Market_End";
            }

            if (!buyEntryFlag && Math.floor(100000 / buyentry) && longTradeFound.buyExitPrice) {
                var perChngOnHigh = (buyHighest - buyentry) * 100 / buyentry;
                longTradeFound.highAndLow = buyHighest;
                longTradeFound.perChngOnHighLow = perChngOnHigh;
                longTradeFound.candleChartDataInside = resultCandle;
                console.log(element.symbol, "longTradeFound", longTradeFound);

                this.setState({ backTestResult: [...this.state.backTestResult, longTradeFound] });
            }

        }

    }


    backTestNR4SameDay = async () => {

        this.setState({ backTestResult: [], backTestFlag: false, searchFailed: 0 });

        var watchList = this.state.symbolList //localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')); 
        var runningTest = 1, sumPercentage = 0;
        for (let index = 0; index < watchList.length; index++) {
            const element = watchList[index];


            if (this.state.stopScaningFlag) {
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
                            candleChartData.push([element[0], element[1], element[2], element[3], element[4]]);
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
                            candleChartData.unshift([next5thCandle[0], next5thCandle[1], next5thCandle[2], next5thCandle[3], next5thCandle[4]]);

                            console.log(element.symbol, last4Candle, rangeArr, rgrangeCount, next5thCandle);

                            var start5thdate = moment(next5thCandle[0]).set({ "hour": 9, "minute": 15 });
                            var end5thdate = moment(next5thCandle[0]).set({ "hour": 15, "minute": 30 });

                            var data = {
                                "exchange": "NSE",
                                "symboltoken": element.token,
                                "interval": "ONE_MINUTE", //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
                                "fromdate": moment(start5thdate).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
                                "todate": moment(end5thdate).format("YYYY-MM-DD HH:mm") // moment("2020-06-30 14:00").format("YYYY-MM-DD HH:mm") 
                            }

                            AdminService.getHistoryData(data).then(insideCandleRes => {
                                let histdataInside = resolveResponse(insideCandleRes, 'noPop');
                                histdataInside = histdataInside && histdataInside.data;

                                this.findLongsTraadeOnNextDay(element, firstCandle, candleChartData, histdataInside);
                                // this.findShortTraadeOnNextDay(element, firstCandle, candleChartData, histdataInside); 


                            }).catch(error => {
                                Notify.showError(element.symbol + " FIVE_MINUTE Candle data not found!");
                                this.setState({ searchFailed: this.state.searchFailed + 1 })
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
                    this.setState({ searchFailed: this.state.searchFailed + 1 })

                }
            }).catch(error => {
                Notify.showError(element.symbol + " 1 day Candle data not found!");
                this.setState({ searchFailed: this.state.searchFailed + 1 })

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


            if (this.state.stopScaningFlag) {
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
                            candleChartData.push([element[0], element[1], element[2], element[3], element[4]]);
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
                            candleChartData.unshift([next5thCandle[0], next5thCandle[1], next5thCandle[2], next5thCandle[3], next5thCandle[4]]);

                            var currentDate = date.format('DD-MM-YYYY');

                            var dateWithWlType = currentDate + ' ' + this.state.selectedWatchlist;

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
                                    candleChartData: candleChartData
                                }
                                if (Math.floor(10000 / firstCandle[2])) {
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
                                    candleChartData: candleChartData
                                }
                                if (Math.floor(10000 / firstCandle[3])) {
                                    this.setState({ backTestResult: [...this.state.backTestResult, foundStock] });

                                    datewisetrades.push(foundStock);
                                    backTestResultDateRange[dateWithWlType] = datewisetrades;

                                    console.log('backTestResultDateRange', backTestResultDateRange);
                                    localStorage.setItem('backTestResultDateRange', JSON.stringify(backTestResultDateRange));

                                    //  var backTestResultDateRange = localStorage.getItem('backTestResultDateRange') && JSON.parse(localStorage.getItem('backTestResultDateRange')) ; 

                                    this.setState({ dateAndTypeKeys: Object.keys(backTestResultDateRange), backTestResultDateRange: backTestResultDateRange });

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
            this.setState({ stockTesting: date.format('YYYY-MM-DD') + ' ' + index + 1 + ". " + element.symbol, runningTest: runningTest })
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
                                candleChartData.push([element[0], element[1], element[2], element[3], element[4]]);
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
                                candleChartData.unshift([next5thCandle[0], next5thCandle[1], next5thCandle[2], next5thCandle[3], next5thCandle[4]]);

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
                                        perChngOnHighLow: perChngOnHigh.toFixed(2),
                                        buyExitPrice: buyentry,
                                        brokerageCharges: 0.06,
                                        perChange: perChng.toFixed(2),
                                        squareOffAt: new Date(next5thCandle[0]).toLocaleString(),
                                        quantity: Math.floor(10000 / firstCandle[2]),
                                        candleChartData: candleChartData
                                    }
                                    if (Math.floor(10000 / firstCandle[2])) {
                                        this.setState({ backTestResult: [...this.state.backTestResult, foundStock] });
                                        this.setState({ backTestResult: this.state.backTestResult.reverse() });
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
                                        perChngOnHighLow: perChngOnLow.toFixed(2),
                                        stopLoss: firstCandle[2],
                                        highAndLow: next5thCandle[3],
                                        buyExitPrice: next5thCandle[this.state.shortExitPriceType],
                                        brokerageCharges: 0.06,
                                        perChange: perChng.toFixed(2),
                                        squareOffAt: new Date(next5thCandle[0]).toLocaleString(),
                                        quantity: Math.floor(10000 / firstCandle[3]),
                                        candleChartData: candleChartData
                                    }
                                    if (Math.floor(10000 / firstCandle[3])) {
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
        var totalLongs = 0, totalShort = 0, totalLongPer = 0, totalShortPer = 0, totalLongHighPer = 0, totalShortLowPer = 0;
        var longCandles = [], shortCandles = [];

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
                            candleChartData.push([element[0], element[1], element[2], element[3], element[4]]);
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
                            candleChartData.unshift([next5thCandle[0], next5thCandle[1], next5thCandle[2], next5thCandle[3], next5thCandle[4]]);

                            console.log(token, last4Candle, rangeArr, rgrangeCount, firstCandle[0].toString().substr(0, 25));

                            var buyentry = (firstCandle[2] + (firstCandle[2] / 100 / 10)).toFixed(2);

                            if (next5thCandle[2] > buyentry) {

                                var perChng = (next5thCandle[4] - buyentry) * 100 / buyentry;
                                var perChngOnHigh = (next5thCandle[2] - buyentry) * 100 / buyentry;

                                var longData = {
                                    foundAt: "Long - " + new Date(firstCandle[0]).toLocaleString(),
                                    sellEntyPrice: next5thCandle[4],
                                    stopLoss: firstCandle[3],
                                    highAndLow: next5thCandle[2],
                                    perChngOnHighLow: perChngOnHigh.toFixed(2),
                                    buyExitPrice: buyentry,
                                    brokerageCharges: 0.06,
                                    perChange: perChng.toFixed(2),
                                    squareOffAt: new Date(next5thCandle[0]).toLocaleString(),
                                    quantity: Math.floor(10000 / firstCandle[2]),
                                    candleChartData: candleChartData
                                }
                                longCandles.push(longData);

                                totalLongs += 1;
                                totalLongPer += perChng;
                                totalLongHighPer += perChngOnHigh;

                            }
                            var sellenty = (firstCandle[3] - (firstCandle[3] / 100 / 10)).toFixed(2);

                            if (next5thCandle[3] < sellenty) {
                                var perChng = (sellenty - next5thCandle[4]) * 100 / firstCandle[3];
                                var perChngOnLow = (sellenty - next5thCandle[3]) * 100 / firstCandle[3];

                                var shortData = {
                                    foundAt: "Short - " + new Date(firstCandle[0]).toLocaleString(),
                                    sellEntyPrice: sellenty,
                                    perChngOnHighLow: perChngOnLow.toFixed(2),
                                    stopLoss: firstCandle[2],
                                    highAndLow: next5thCandle[3],
                                    buyExitPrice: next5thCandle[4],
                                    brokerageCharges: 0.06,
                                    perChange: perChng.toFixed(2),
                                    squareOffAt: new Date(next5thCandle[0]).toLocaleString(),
                                    quantity: Math.floor(10000 / firstCandle[3]),
                                    candleChartData: candleChartData
                                }
                                shortCandles.push(shortData);

                                totalShort += 1;
                                totalShortPer += perChng;
                                totalShortLowPer += perChngOnLow;

                            }


                        }

                    }
                }


                var pastPerferm = {
                    totalLongs: totalLongs,
                    totalShort: totalShort,
                    totalLongPer: totalLongPer.toFixed(2),
                    totalShortPer: totalShortPer.toFixed(2),
                    totalLongHighPer: totalLongHighPer.toFixed(2),
                    totalShortLowPer: totalShortLowPer.toFixed(2),
                }
                if (foundStock)
                    foundStock.pastPerferm = pastPerferm;
                foundStock.longCandles = longCandles;
                foundStock.shortCandles = shortCandles;


                console.log("foundStock", foundStock);
                if (Math.floor(10000 / firstCandle[4])) {
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
                //1st candle #20d020 & 2nd candle is red check
                if (secondCandle.open < secondCandle.close && firstCandle.open > firstCandle.close) {
                    // console.log(symbol, "candleHist",candleHist); 
                    //  console.log(symbol, "last 8th candle diff% ",  diffPer, "10th Low", lastTrendCandleLow,"3rd high", firstTrendCandleHigh);
                    //  console.log(symbol, 'making twisser 1st #20d020 & 2nd red' , firstCandle, secondCandle );

                    if (Math.round(secondCandle.close) == Math.round(firstCandle.open) && Math.round(secondCandle.open) == Math.round(firstCandle.close)) {

                        console.log('%c' + new Date(candleHist[0][0]).toString(), 'color: #20d020');
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
                //1st candle #20d020 & 2nd candle is red check
                if (secondCandle.open > secondCandle.close && firstCandle.close > firstCandle.open) {
                    // console.log(symbol, "candleHist",candleHist); 
                    //  console.log(symbol, "last 8th candle diff% ",  diffPer, "10th Low", lastTrendCandleLow,"3rd high", firstTrendCandleHigh);
                    //  console.log(symbol, 'making twisser 1st #20d020 & 2nd red' , firstCandle, secondCandle );

                    if (Math.round(secondCandle.close) == Math.round(firstCandle.open) || Math.round(secondCandle.open) == Math.round(firstCandle.close)) {

                        console.log('%c' + new Date(candleHist[0][0]).toString(), 'color: #20d020');
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

    placeOrder = (transactiontype) => {

        var data = {
            "variety": "NORMAL",
            "tradingsymbol": this.state.tradingsymbol,
            "symboltoken": this.state.symboltoken,
            "transactiontype": transactiontype, //BUY OR SELL
            "exchange": "NSE",
            "ordertype": this.state.buyPrice === 0 ? "MARKET" : "LIMIT",
            "producttype": this.state.producttype, //"INTRADAY",//"DELIVERY",
            "duration": "DAY",
            "price": 0,
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

                    if (transactiontype == "BUY") {
                        this.placeSLMOrder("SELL");
                    }

                    if (transactiontype == "SELL") {
                        this.placeSLMOrder("BUY");
                    }

                }
            }
        })
    }

    LoadSymbolDetails = (name, i) => {
        console.log("name", name);
        var token = '';
        var watchList = localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')) || []; 
        for (let index = 0; index < watchList.length; index++) {
            if (watchList[index].symbol === name || watchList[index].name === name) {
                token = watchList[index].token;
                console.log("name % token", name,token );
                this.setState({ tradingsymbol: watchList[index].symbol, symboltoken:watchList[index].token },function(){
                    this.setState({ cursor: i }, function () {
                        this.showStaticChart(token);
                        // this.getLTP();
                        // this.dailyBasisInfoCheck(this.state.symboltoken);
                    });
                });
                break;
            }else{
               // Notify.showError(name + " not found!");
                console.log(name + " not found!");
            }
        }
    }
    getTimeFrameValue = (timeFrame) => {
        //18 HOURS FOR BACK 1 DATE BACK MARKET OFF

        

        switch (timeFrame) {
            // case 'ONE_MINUTE':
            //     if (new Date().toLocaleTimeString() < "10:05:00")
            //         return "19:00:00";
            //     else
            //         return "01:00:00";
            //     break;
            // case 'FIVE_MINUTE':
            //     if (new Date().toLocaleTimeString() < "11:00:00")
            //         return "23:00:00";
            //     else
            //         return "03:00:00";
            //     break;
            // case 'TEN_MINUTE':
            //     if (new Date().toLocaleTimeString() < "12:35:00")
            //         return "24:21:00";
            //     else
            //         return "07:00:00";
            //     break;
            // case 'FIFTEEN_MINUTE':
            //     if (new Date().toLocaleTimeString() < "14:15:00")
            //         return "28:01:00";
            //     else
            //         return "10:01:00";
            //     break;
            // case 'THIRTY_MINUTE':
            //     return "100:01:00";
            //     break;
            // case 'ONE_HOUR':
            //     return "200:01:00";
            //     break;
            // case 'ONE_DAY':
            //     return "1000:01:00";
            //     break;
            // default:
            //     break;

            case 'ONE_MINUTE':
            return "720:00:00";
            break;
            case 'FIVE_MINUTE':
                    return "1000:00:00";
                break;
            case 'TEN_MINUTE':
                    return "1000:00:00";
                break;
            case 'FIFTEEN_MINUTE':
                return "1000:00:00";
                break;
            case 'THIRTY_MINUTE':
                return "1000:00:00";
                break;
            case 'ONE_HOUR':
                return "1000:00:00";
                break;
            case 'ONE_DAY':
                return "1000:00:00";
                break;
            default:
                break;
        }
    }

    calculateSMA = (data, count) => {

      //  console.log("smarowdata", data, count);

        var avg = function (data) {
            var sum = 0;
            for (var i = 0; i < data.length; i++) {
                sum += data[i].close;
            }
            return sum / data.length;
        };
        var result = [];
        for (var i = count - 1, len = data.length; i < len; i++) {
            var val = avg(data.slice(i - count + 1, i));
            result.push({ time: data[i].time, value: val });
        }
        return result;
    }

    //   calculateBBValue = (data, type ) => {

    //     console.log("smarowdata", data , count); 

    //     var result = [];
    //     for (var i=count - 1, len=data.length; i < len; i++){
    //       var val = avg(data.slice(i - count + 1, i));
    //       result.push({ time: data[i].time, value: val});
    //     }
    //     return result;
    //   }



    showStaticChart = (token) => {

        this.setState({ chartStaticData: '' }, function () {
            console.log('reset done', token);
        });

       


        console.log("time in function ", this.state.timeFrame);

        const format1 = "YYYY-MM-DD HH:mm";
        // var time = moment.duration("10:50:00");
        // var startDate = moment(new Date()).subtract(time);
        // var startdate = moment(this.state.startDate).subtract(time);
        var beginningTime = moment('9:15am', 'h:mma');

        let timeDuration = this.getTimeFrameValue(this.state.timeFrame);
        var time = moment.duration(timeDuration);  //22:00:00" for last day  2hours 
        var startDate = moment(new Date()).subtract(time);


        var data = {
            "exchange": "NSE",
            "symboltoken": token,
            "interval": this.state.timeFrame, //ONE_DAY FIVE_MINUTE 
            "fromdate": moment(startDate).format(format1),
            "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
        }


        AdminService.getHistoryData(data).then(res => {
            let historyData = resolveResponse(res, 'noPop');
            //    console.log(data); 
            if (historyData && historyData.data) {

                var data = historyData.data;

                const cdata = data.map(d => {
                    return { time: new Date(d[0]).getTime(), open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]) }
                });

                var candleChartData = [], vwapdata = [], closeingData = [], highData = [], lowData = [], openData = [], valumeData = [], bbdata = [], volumeSeriesData = [];
                data.forEach((element, loopindex) => {
                    candleChartData.push([element[0], element[1], element[2], element[3], element[4]]);
                    vwapdata.push([element[5], (element[2] + element[3] + element[4]) / 3]);
                    closeingData.push(element[4]);
                    highData.push(element[2]);
                    lowData.push(element[3]);
                    openData.push(element[3]);
                    valumeData.push(element[5]);
                    bbdata.push((element[2] + element[3] + element[4]) / 3);
                    volumeSeriesData.push({ time: new Date(element[0]).getTime(), value: element[5], color: 'rgba(211, 211, 211, 1)' })

                });

                var input = {
                    period: 20,
                    values: bbdata,
                    stdDev: 2
                }

                var bb = BollingerBands.calculate(input);
                console.log(token, "Bolinger band", input, bb);

                var bb = BollingerBands.calculate(input);
                console.log(token, "Bolinger band", input, bb);

                var inputRSI = { values: closeingData, period: 14 };
                var rsiValues = RSI.calculate(inputRSI);

                console.log(token, "Rsi", inputRSI, rsiValues);
                console.log(token, "vwap", vwapdata, vwap(vwapdata));


                this.setState({ chartStaticData: cdata, bblastValue: bb[bb.length - 1], vwapvalue: vwap(vwapdata), rsiValues: rsiValues.slice(Math.max(valumeData.length - 19, 1)), valumeData: valumeData.slice(Math.max(valumeData.length - 5, 1)) }, function () {
                    // candleSeries.setData(this.state.chartStaticData); 
                    this.state.candleSeries.setData(this.state.chartStaticData);

                    this.state.volumeSeries.setData(volumeSeriesData);

                    var smaData = this.calculateSMA(this.state.chartStaticData, 20);

                    this.state.smaLineSeries.setData(smaData);


                    this.state.chart.subscribeCrosshairMove((param) => {

                        var getit = param.seriesPrices[Symbol.iterator]();

                        var string = "";
                        var change = "";

                        for (var elem of getit) {

                            if (typeof elem[1] == 'object') {
                                string += " Open: <b>" + elem[1].open + "</b>";
                                string += " High: <b>" + elem[1].high + "</b>";
                                string += " Low: <b>" + elem[1].low + "</b>";
                                string += " Close: <b>" + elem[1].close + "</b>";
                                change = (elem[1].close - elem[1].open) * 100 / elem[1].open;
                                string += " Chng: <b>" + change.toFixed(2) + '%</b>';
                            } else {
                                string += " &nbsp; " + elem[1].toFixed(2) + " ";
                            }
                        }

                        if (param.time)
                            string += " Time: <b>" + new Date(param.time).toLocaleString() + "</b>";
                        else
                            string += " <b>Time: </b>";


                        const domElement = document.getElementById('showChartTitle');


                        var str = "<span style=color:green>" + string + "</span> ";
                        if (change < 0)
                            str = "<span style=color:red>" + string + "</span> ";

                        domElement.innerHTML = str;
                    });

                   
                });


                data && data.sort(function (a, b) {
                    return new Date(b[0]) - new Date(a[0]);
                });
                if (data.length > 0) {
                    localStorage.setItem('InstrumentHistroy', JSON.stringify(data));
                    this.setState({ InstrumentHistroy: data });


                    var upsideMoveCount = 0, downMoveCount = 0, totalSum = 0;
                    data.forEach(element => {

                        var per = (element[4] - element[1]) * 100 / element[1];
                        if (per >= 0.3) {
                            upsideMoveCount += 1;
                        }
                        if (per <= -0.3) {
                            downMoveCount += 1;
                        }

                        totalSum += per;

                    });


                    this.setState({ downMoveCount: downMoveCount, upsideMoveCount: upsideMoveCount, totalPerchentageChange: totalSum, startingFrom: moment(startDate).format(format1) });

                   
                }
            }
        })


    }

    checkSlowMotionStock = (token, stock) => {
    
        const format1 = "YYYY-MM-DD HH:mm";
        var time = moment.duration("240:00:00");  //22:00:00" for last day  2hours 
        var startDate = moment(new Date()).subtract(time);
        var dataDay = {
            "exchange": 'NSE',
            "symboltoken": token,
            "interval": 'FIVE_MINUTE',
            "fromdate": moment(startDate).format(format1),
            "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
        }
        AdminService.getHistoryData(dataDay).then(resd => {
            let histdatad = resolveResponse(resd, 'noPop');
            var DSMA = '';
            if (histdatad && histdatad.data && histdatad.data.length) {
                var candleDatad = histdatad.data;
                var closeingDatadaily = [], valumeSum = 0;

                var bigCandleCount = 0; 

                for (let index = candleDatad.length - 375; index < candleDatad.length; index++) {
                    const element = candleDatad[index];
                    
                    if(element){
                        var per = (element[4] - element[1]) * 100 / element[1];

                        if (per >= 0.4) {
                            bigCandleCount += 1;
                            console.log(stock.symbol,  per , element[0]);

                        }
                        if (per <= -0.4) {
                            bigCandleCount += 1;
                            console.log(stock.symbol,  per , element[0]);

                        }
                    }
                }
                console.log("Totalcount", stock.symbol,  bigCandleCount);
                if(bigCandleCount <= 15){

                    stock.bigCandleCount = bigCandleCount; 
                    
                    this.setState({ slowMotionStockList: [...this.state.slowMotionStockList, stock] }, function(){
                        localStorage.setItem("slowMotionStockList", JSON.stringify(this.state.slowMotionStockList)); 
                    }); 
                }
            }

        });
    }

    checkSlowMotionCheckLive = async() => {
    
        for (let index = 0; index < this.state.slowMotionStockList.length; index++) {
            const row = this.state.slowMotionStockList[index];
            const format1 = "YYYY-MM-DD HH:mm";
            var time = moment.duration("22:00:00");  //22:00:00" for last day  2hours 
            var startDate = moment(new Date()).subtract(time);
            var dataDay = {
                "exchange": 'NSE',
                "symboltoken": row.token,
                "interval": 'FIVE_MINUTE',
                "fromdate": moment(startDate).format(format1),
                "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
            }
            AdminService.getHistoryData(dataDay).then(resd => {
                let histdatad = resolveResponse(resd, 'noPop');
                var DSMA = '';
                if (histdatad && histdatad.data && histdatad.data.length) {
                    var candleDatad = histdatad.data;
                    var closeingDatadaily = [], valumeSum = 0;
    
                    var bigCandleCount = 0, bullishCount = 0; 
    
                    for (let index = candleDatad.length-3; index < candleDatad.length; index++) {
                        const element = candleDatad[index];
                        
                        if(element){
    
                            var per = (element[4] - element[1]) * 100 / element[1];
                            if (per >= 0.7) {
                                bigCandleCount += 1;
                            } 
                            if (per >= 0) {
                                bullishCount += 1;
                            }
    
                        }
                    }
                    if(bigCandleCount >= 1){
                        row.highlisht =  true; 
                        window.document.title = "SM: " + row.symbol; 
                        console.log('hey listen, slow motion stock' + row.symbol + " broken");

                        this.speckIt('hey listen, slow motion stock' + row.symbol + " broken");

                        this.setState({ slowMotionStockList: this.state.slowMotionStockList })
                    }
                }
    
            });
            await new Promise(r => setTimeout(r, 310));  
        }
   
    }

    checkLiveBids = async() => {

        for (let index = 0; index < this.state.symbolList.length; index++) {
            const row = this.state.symbolList[index];
          
            AdminService.checkLiveBids(row.name).then(resd => {
                // let histdatad = resolveResponse(resd, 'noPop');
                
                console.log("bid",resd.data.data ); 

                // adhocMargin: "0.48"
                // applicableMargin: "19.00"
                // averagePrice: "705.27"
                // basePrice: "717.15"
                // bcEndDate: "-"
                // bcStartDate: "-"
                // buyPrice1: "710.60"
                // buyPrice2: "710.55"
                // buyPrice3: "710.50"
                // buyPrice4: "710.45"
                // buyPrice5: "710.40"
                // buyQuantity1: "6"
                // buyQuantity2: "50"
                // buyQuantity3: "33"
                // buyQuantity4: "153"
                // buyQuantity5: "100"
                // change: "-6.55"
                // closePrice: "0.00"
                // cm_adj_high_dt: "28-SEP-21"
                // cm_adj_low_dt: "28-SEP-20"
                // cm_ffm: "4,96,600.56"
                // companyName: "ICICI Bank Limited"
                // css_status_desc: "Listed"
                // dayHigh: "710.95"
                // dayLow: "701.30"
                // deliveryQuantity: "55,54,344"
                // deliveryToTradedQuantity: "63.08"
                // exDate: "29-JUL-21"
                // extremeLossMargin: "3.50"
                // faceValue: "2.00"
                // high52: "735.40"
                // indexVar: "-"
                // isExDateFlag: false
                // isinCode: "INE090A01021"
                // lastPrice: "710.60"
                // low52: "349.10"
                // marketType: "N"
                // ndEndDate: "-"
                // ndStartDate: "-"
                // open: "707.35"
                // pChange: "-0.91"
                // previousClose: "717.15"
                // priceBand: "No Band"
                // pricebandlower: "645.45"
                // pricebandupper: "788.85"
                // purpose: "DIVIDEND - RS 2 PER SHARE"
                // quantityTraded: "88,05,883"
                // recordDate: "30-JUL-21"
                // secDate: "29-Sep-2021 14:00:00"
                // securityVar: "15.02"
                // sellPrice1: "710.65"
                // sellPrice2: "710.70"
                // sellPrice3: "710.75"
                // sellPrice4: "710.80"
                // sellPrice5: "710.85"
                // sellQuantity1: "1,382"
                // sellQuantity2: "719"
                // sellQuantity3: "1,217"
                // sellQuantity4: "4,159"
                // sellQuantity5: "793"
                // series: "EQ"
                // surv_indicator: "-"
                // symbol: "ICICIBANK"
                // totalBuyQuantity: "10,31,358"
                // totalSellQuantity: "8,75,359"
                // totalTradedValue: "66,963.99"
                // totalTradedVolume: "94,94,802"

                if(resd.data && resd.data.data.length){

                    let bidlivedata = resd.data.data[0]; 
                    let biddata = {
                        totalBuyQuantity: bidlivedata.totalBuyQuantity,
                        totalSellQuantity: bidlivedata.totalSellQuantity,
                        deliveryToTradedQuantity: bidlivedata.deliveryToTradedQuantity,
                        symbol : bidlivedata.symbol, 
                        orderType: bidlivedata.totalBuyQuantity + "|" + bidlivedata.totalSellQuantity, 
                        nc : bidlivedata.pChange, 
                        ltp : bidlivedata.lastPrice, 
                    }
    
                    this.setState({ liveBidsList: [...this.state.liveBidsList, biddata] }, function(){

                        localStorage.setItem("liveBidsList", JSON.stringify(this.state.liveBidsList)); 
                    });
    
        
                }
                
            });
            await new Promise(r => setTimeout(r, 100));  
        }
   
    }


    oneHourBullBearCheck = async() => {
    
        for (let index = 0; index < this.state.symbolList.length; index++) {
            const row = this.state.symbolList[index];
            const format1 = "YYYY-MM-DD HH:mm";
            var time = moment.duration("04:00:00");  //22:00:00" for last day  2hours 
            var startDate = moment(new Date()).subtract(time);
            var dataDay = {
                "exchange": 'NSE',
                "symboltoken": row.token,
                "interval": 'ONE_HOUR',
                "fromdate": moment(startDate).format(format1),
                "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
            }
            AdminService.getHistoryData(dataDay).then(resd => {
                let histdatad = resolveResponse(resd, 'noPop');
                var DSMA = '';
                if (histdatad && histdatad.data && histdatad.data.length) {
                    var candleDatad = histdatad.data;
                    let lastCandle = ''; 
                    if(candleDatad.length>1){
                         lastCandle = candleDatad[candleDatad.length-2];
                    }else{
                         lastCandle = candleDatad[candleDatad.length-1];
                    }
                   

                    
                    if((lastCandle[1] == lastCandle[3]) && (lastCandle[2] == lastCandle[4])){
                        window.document.title = "Hourly Buy: " + row.symbol;
                        console.log(row.name, "Hourly Buy",  candleDatad[candleDatad.length-1]); 
                        row.orderType =  " Hourly Buy"; 
                        row.foundAt = new Date( candleDatad[candleDatad.length-1][0]).toLocaleString()
                        this.speckIt(row.name + " Hourly Bullish ");
                        this.setState({ oneHourBullBearCheckList: [...this.state.oneHourBullBearCheckList, row] });
                    }
                    if((lastCandle[1] == lastCandle[2]) && (lastCandle[3] == lastCandle[4])){
                        window.document.title = "Hourly Sell: " + row.symbol;
                        console.log(row.name, "Hourly Sell",  candleDatad[candleDatad.length-1]); 
                        row.orderType =  " Hourly Sell"; 
                        row.foundAt = new Date( candleDatad[candleDatad.length-1][0]).toLocaleString()
                        this.speckIt(row.name + " Hourly Sell ");
                        this.setState({ oneHourBullBearCheckList: [...this.state.oneHourBullBearCheckList, row] });
                    }
               
                }
    
            });
            await new Promise(r => setTimeout(r, 310));  
        }
   
    }


    searchValumeBreakoutStock = async() => {
    
        for (let index = 0; index < this.state.symbolList.length; index++) {
            const row = this.state.symbolList[index];
            const format1 = "YYYY-MM-DD HH:mm";
            var time = moment.duration("60:00:00");  //22:00:00" for last day  2hours 
            var startDate = moment(new Date()).subtract(time);
            var dataDay = {
                "exchange": 'NSE',
                "symboltoken": row.token,
                "interval": 'FIFTEEN_MINUTE',
                "fromdate": moment(startDate).format(format1),
                "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
            }
            AdminService.getHistoryData(dataDay).then(resd => {
                let histdatad = resolveResponse(resd, 'noPop');
                var DSMA = '';
                if (histdatad && histdatad.data && histdatad.data.length) {
                    var candleDatad = histdatad.data;
    
                    var  volumeSum = 0, findmaxVol = candleDatad[0][5]; 
                    let currentCandleVol =  candleDatad[candleDatad.length-1][5]; 
                    let firstCandleCloseingPrice = candleDatad[0][4], priceGoingHighCount=0;  
                    let firstCandleCloseingPriceDownSide = candleDatad[0][4], priceGoingLowCount=0;  

                    for (let index = candleDatad.length-6; index < candleDatad.length-1; index++) {
                        const element = candleDatad[index];
                        if(element){
                            volumeSum += element[5];  
                            //  console.log(row.symbol, ' last candle index ',index,   element[0] );
                              if(findmaxVol < element[5]){
                                  findmaxVol = element[5]; 
                              }
      
                              if(firstCandleCloseingPrice < element[4]){
                                 console.log(row.symbol, firstCandleCloseingPrice , 'upside last candle index ',index,   element[4] );
                                  firstCandleCloseingPrice = element[4]; 
                                  priceGoingHighCount += 1; 
                              }
      
                              if(element[4] < firstCandleCloseingPriceDownSide){
                                  console.log(row.symbol, firstCandleCloseingPrice , ' downside last candle index ',index,   element[4] );
                                  firstCandleCloseingPriceDownSide = element[4]; 
                                  priceGoingLowCount += 1; 
                               }
                        }
                       

                    }
                    let avgVol = volumeSum/5;

                    if(currentCandleVol/findmaxVol > 1.75 && priceGoingHighCount >= 4){
                        window.document.title = "VB: " + row.symbol;
                        row.orderType =  " Vol " + (currentCandleVol/findmaxVol).toFixed(2) + " Time & price incresing"; 
                        row.foundAt = new Date( candleDatad[candleDatad.length-1][0]).toLocaleString()
                        console.log(row.name + " volume crossed "+ (currentCandleVol/findmaxVol).toFixed(2) +" time of average ", avgVol, currentCandleVol,  candleDatad[candleDatad.length-1][0],  findmaxVol);
                        this.speckIt(row.name + " volume crossed "+ (currentCandleVol/findmaxVol).toFixed(2) +" Time and price incresing");
                        this.setState({ volumeBreakoutlast5CandleList: [...this.state.volumeBreakoutlast5CandleList, row] });
                    }
                    if(currentCandleVol/findmaxVol > 1.75 && priceGoingLowCount >= 4){
                        window.document.title = "VB: " + row.symbol;
                        row.orderType =  " Vol " + (currentCandleVol/findmaxVol).toFixed(2) + " Time & price decresing"; 
                        row.foundAt = new Date( candleDatad[candleDatad.length-1][0]).toLocaleString()
                        console.log(row.name + " volume crossed "+ (currentCandleVol/findmaxVol).toFixed(2) +" time of average ", avgVol, currentCandleVol,  candleDatad[candleDatad.length-1][0],  findmaxVol);
                        this.speckIt(row.name + " volume crossed "+ (currentCandleVol/findmaxVol).toFixed(2) +" Time and price decresing ");
                        this.setState({ volumeBreakoutlast5CandleList: [...this.state.volumeBreakoutlast5CandleList, row] });
                    }
                    // else if(currentCandleVol > avgVol){
                    //     row.highlisht =  true; 
                    //     window.document.title = "VB: " + row.symbol;
                    //     console.log(row.symbol, ' avg ', avgVol, currentCandleVol,  candleDatad[candleDatad.length-1][0]);
                    //     this.speckIt('Volume  in ' + row.name + " crossed average ");
                    //     this.setState({ volumeBreakoutlast5CandleList: this.state.slowMotionStockList })
                    // }
                }
    
            });
            await new Promise(r => setTimeout(r, 310));  
        }
   
    }

    speckIt = (text) => {
        var msg = new SpeechSynthesisUtterance();
        msg.text = text.toString();
        window.speechSynthesis.speak(msg);
    }




    dailyBasisInfoCheck = (token, element) => {
        //this.setState({DailyBulishStatus: ''}); 

        const format1 = "YYYY-MM-DD HH:mm";

        let timeDuration = this.getTimeFrameValue('ONE_DAY');
        var time = moment.duration(timeDuration);  //22:00:00" for last day  2hours 
        var startDateforDaily = moment(new Date()).subtract(time);
        var dataDay = {
            "exchange": 'NSE',
            "symboltoken": token,
            "interval": 'ONE_DAY',
            "fromdate": moment(startDateforDaily).format(format1),
            "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
        }
        AdminService.getHistoryData(dataDay).then(resd => {
            let histdatad = resolveResponse(resd, 'noPop');
            var DSMA = '';
            if (histdatad && histdatad.data && histdatad.data.length) {
                var candleDatad = histdatad.data;
                var closeingDatadaily = [], valumeSum = 0;


                for (let index = candleDatad.length - 20; index < candleDatad.length; index++) {
                    const element = candleDatad[index];
                    if(element){
                        closeingDatadaily.push(element[4]);
                        valumeSum += element[5];
                    }
                  
                }


                DSMA = SMA.calculate({ period: 20, values: closeingDatadaily });
                this.setState({ dailyAvgValume: valumeSum / 20 });

                var DSMALastValue = DSMA && DSMA[DSMA.length - 1];
                console.log(token, "DSMA", DSMALastValue);

                if (DSMALastValue) {
                    this.setState({ DailyBulishStatus: DSMALastValue, todayCurrentVolume: candleDatad[candleDatad.length - 1][5] });
                }

                if (candleDatad[candleDatad.length - 1][5] > valumeSum / 20) {
                    console.log("crosssed voliue", element);
                    this.setState({ volumeCrossedList: [...this.state.volumeCrossedList, element] })
                }

            }


        });
    }

    placeSLMOrder = (slmOrderType) => {

        var data = {
            "tradingsymbol": this.state.tradingsymbol,
            "symboltoken": this.state.symboltoken,
            "transactiontype": slmOrderType,
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

    // getHistory = (token) => {


    //     this.setState({ downMoveCount: 0, upsideMoveCount: 0 });
    //     this.setState({ InstrumentHistroy: [] });
    //     this.getLTP();


    //     const format1 = "YYYY-MM-DD HH:mm";

    //     var time = moment.duration("00:50:00");
    //     var startdate = moment(new Date()).subtract(time);
    //     // var startdate = moment(this.state.startDate).subtract(time);
    //     var beginningTime = moment('9:15am', 'h:mma');

    //     var data = {
    //         "exchange": "NSE",
    //         "symboltoken": token,
    //         "interval": "ONE_MINUTE", //ONE_DAY FIVE_MINUTE 
    //         "fromdate": moment(startdate).format(format1),
    //         "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
    //     }

    //     AdminService.getHistoryData(data).then(res => {
    //         let data = resolveResponse(res, 'noPop');
    //         //    console.log(data); 
    //         if (data && data.data) {

    //             var histCandles = data.data;
    //             histCandles && histCandles.sort(function (a, b) {
    //                 return new Date(b[0]) - new Date(a[0]);
    //             });
    //             if (histCandles.length > 0) {
    //                 localStorage.setItem('InstrumentHistroy', JSON.stringify(histCandles));
    //                 this.setState({ InstrumentHistroy: histCandles });

    //             }

    //         }
    //     })
    // }

    onSelectItem = (event, values) => {


        var autoSearchTemp = JSON.parse(localStorage.getItem('autoSearchTemp'));
        //  console.log("values", values); 
        //   console.log("autoSearchTemp", autoSearchTemp); 
        if (autoSearchTemp.length > 0) {
            var fdata = '';
            for (let index = 0; index < autoSearchTemp.length; index++) {

                if (autoSearchTemp[index].symbol === values) {
                    fdata = autoSearchTemp[index];
                    break;
                }
            }


            var watchlist = []; //localStorage.getItem("watchList") ? JSON.parse(localStorage.getItem("watchList")) : []; 

            var foundInWatchlist = watchlist.filter(row => row.token === values);

            if (!foundInWatchlist.length) {

                watchlist.push(fdata);
                this.setState({ tradingsymbol: fdata.symbol, symboltoken: fdata.token }, function () {
                    this.LoadSymbolDetails(fdata.symbol);
                });

                this.setState({ symbolList: watchlist }, function () {
                    //  this.updateSocketWatch();
                });

            }
        }

    }
    onSelectItemChart = (event, values) => {
        var autoSearchTemp = JSON.parse(localStorage.getItem('autoSearchTemp'));
        //  console.log("values", values); 
        //   console.log("autoSearchTemp", autoSearchTemp); 
        if (autoSearchTemp.length > 0) {
            var fdata = '';
            for (let index = 0; index < autoSearchTemp.length; index++) {

                if (autoSearchTemp[index].symbol === values) {
                    fdata = autoSearchTemp[index];
                    break;
                }
            }
            this.setState({ tradingsymbol: fdata.symbol, symboltoken: fdata.token, seachSumbol: "" }, function () {
                this.getLTP();
                this.showStaticChart(fdata.token);
                this.LoadSymbolDetails(fdata.symbol);
            });

        }

    }
    getPercentageColor = (percent) => {
        percent = percent * 100;
        var r = percent < 50 ? 255 : Math.floor(255 - (percent * 2 - 100) * 255 / 100);
        var g = percent > 50 ? 255 : Math.floor((percent * 2) * 255 / 100);
        return 'rgb(' + r + ',' + g + ',0)';
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


        candleData = candleData && candleData.reverse();

        localStorage.setItem('candleChartData', JSON.stringify(candleData))
        localStorage.setItem('cadleChartSymbol', symbol)

        if (insiderow)
            localStorage.setItem('chartInfoDetails', JSON.stringify(insiderow));


        document.getElementById('showCandleChart').click();
    }

    showCandleBothChart = (row) => {
        var candleChartData = row.candleChartData && row.candleChartData.reverse();
        localStorage.setItem('candleChartData', JSON.stringify(candleChartData))
        localStorage.setItem('cadleChartSymbol', row.symbol)

        var candleChartDataInside = row.candleChartDataInside;

        if (candleChartDataInside)
            localStorage.setItem('candleChartDataInside', JSON.stringify(candleChartDataInside));


        document.getElementById('showCandleChart').click();
    }

    handleKeyDown = (e) => {

        console.log("key", e.keyCode);
        //38 for down and 40 for up key
        if (e.keyCode === 38 && this.state.cursor > 0) {
            this.setState(prevState => ({ cursor: prevState.cursor - 1 }));
        } else if (e.keyCode === 40 && this.state.cursor < this.state.symbolList.length - 1) {
            this.setState(prevState => ({ cursor: prevState.cursor + 1 }))
        }

        setTimeout(() => {
            this.updateCandleOnkey();
        }, 100);

    }


    updateCandleOnkey = () => {
        var selectedKeyRow = localStorage.getItem('selectedKeyRow') && JSON.parse(localStorage.getItem('selectedKeyRow'));
        if (selectedKeyRow.token && selectedKeyRow.symbol) {
            this.setState({ tradingsymbol: selectedKeyRow.symbol, symboltoken: selectedKeyRow.token }, function () {
                this.getLTP();
                this.showStaticChart(selectedKeyRow.token);
            });

        }
    }


    render() {
        const dateParam = {
            myCallback: this.myCallback,
            startDate: '',
            endDate: '',
            firstLavel: "Start Date and Time",
            secondLavel: "End Date and Time"
        }


        var sumPerChange = 0, sumBrokeragePer = 0, netSumPerChange = 0, sumPerChangeHighLow = 0, sumPnlValue = 0, sumPnlValueOnHighLow = 0, totalInvestedValue = 0, totalLongTrade = 0, totalShortTrade = 0;
        var tradetotal = 0, totalWin = 0, totalLoss = 0;
        return (
            <React.Fragment>
                <PostLoginNavBar   LoadSymbolDetails ={this.LoadSymbolDetails} />
                <ChartDialog />
                <Grid direction="row" container spacing={1} style={{ padding: "5px" }} >

                    <Grid item xs={12} sm={2}>
                      
                    <WatchListTab style={{position: 'fixed'}}  data={{gainerList: this.state.gainerList, looserList: this.state.looserList, LoadSymbolDetails: this.LoadSymbolDetails, cursor : this.state.cursor, symbolList: this.state.symbolList, totalWatchlist:this.state.totalWatchlist, onChangeWatchlist: this.onChangeWatchlist, selectedWatchlist: this.state.selectedWatchlist, search:this.state.search, handleKeyDown: this.handleKeyDown, onChange: this.onChange, autoSearchList :this.state.autoSearchList,  onSelectItem : this.onSelectItem , symbolList : this.state.symbolList, LoadSymbolDetails: this.LoadSymbolDetails, deleteItemWatchlist: this.deleteItemWatchlist }}/>


                        {/* <Paper>
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
                                        label={"Search Symbol"}
                                        margin="normal"
                                        variant="standard"
                                        name="search"
                                        onKeyDown={this.handleKeyDown}
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


                            <div style={{ overflowY: 'scroll', height: "75vh" }} >

                                {this.state.symbolList && this.state.symbolList.length ? this.state.symbolList.map((row, i) => (
                                    <>
                                        <ListItem onKeyDown={this.handleKeyDown} button selected={this.state.cursor === i ? 'active' : null}

                                            style={{ fontSize: '12px', padding: '0px', paddingLeft: '5px', paddingRight: '5px' }} >

                                            {this.state.cursor === i ? localStorage.setItem("selectedKeyRow", JSON.stringify(row)) : ""}

                                            <ListItemText style={{ color: !row.nc || row.nc == 0 ? "" : row.nc > 0 ? '#20d020' : "#e66e6e" }} onClick={() => this.LoadSymbolDetails(row.symbol, i)} primary={row.name} /> {row.ltp} ({row.nc}%)


                                        </ListItem>

                                    </>
                                )) : ''}
                            </div>

                        </Paper> */}


                        {/* <Typography style={{ fontWeight: 'bold' }}><span style={{ color: "green" }}> Advance {this.state.advanceShareCount} </span> <span style={{ color: "red" }}> Decline {this.state.declineShareCount} </span> <span> Unchange {this.state.UnchangeShareCount} </span> </Typography> */}

                    </Grid>

                    <Grid item xs={12} sm={8}>
                        <Paper style={{ padding: "10px" }}>


                            <Typography style={{ textAlign: "center", background: "lightgray" }}>Place Order</Typography>

                            <Grid style={{ display: "visible" }} spacing={1} direction="row" alignItems="center" container>

                                <Grid item xs={10} sm={3}>

                                    {this.state.tradingsymbol ?
                                        <Typography variant="body1" style={{ color: this.state.InstrumentPerChange > 0 ? "#20d020" : "#e66e6e" }} >

                                            {this.state.tradingsymbol} : {this.state.InstrumentLTP ? this.state.InstrumentLTP.ltp : ""} ({this.state.InstrumentPerChange + "%"})

                                        </Typography> : <Typography variant="h5" >Select Symbol </Typography>}

                                    O: {this.state.InstrumentLTP ? this.state.InstrumentLTP.open : ""} &nbsp;
                                    H: {this.state.InstrumentLTP ? this.state.InstrumentLTP.high : ""} &nbsp;
                                    L: {this.state.InstrumentLTP ? this.state.InstrumentLTP.low : ""}&nbsp;
                                    C: {this.state.InstrumentLTP ? this.state.InstrumentLTP.close : ""} &nbsp;

                                </Grid>

                                <Grid item xs={10} sm={2}>

                                    <Autocomplete
                                        freeSolo
                                        id="free-solo-2-demo"
                                        disableClearable
                                        style={{ paddingLeft: "10px", paddingRight: "10px" }}
                                        onChange={this.onSelectItemChart}
                                        value={this.state.seachSumbol}
                                        //+ ' '+  option.exch_seg
                                        options={this.state.autoSearchList.length > 0 ? this.state.autoSearchList.map((option) =>
                                            option.symbol
                                        ) : []}
                                        renderInput={(params) => (
                                            <TextField
                                                onChange={this.onChange}
                                                {...params}
                                                label={"Search"}
                                                margin="normal"
                                                variant="standard"
                                                name="seachSumbol"
                                                InputProps={{ ...params.InputProps, type: 'search' }}
                                            />
                                        )}
                                    />
                                </Grid>


                                <Grid item xs={10} sm={1}>
                                    <FormControl style={styles.selectStyle} style={{ marginTop: '10px' }} >
                                        <InputLabel htmlFor="gender">Time</InputLabel>
                                        <Select value={this.state.timeFrame} name="timeFrame" onChange={this.onInputChange}>
                                            <MenuItem value={'ONE_MINUTE'}>{'1M'}</MenuItem>
                                            <MenuItem value={'FIVE_MINUTE'}>{'5M'}</MenuItem>
                                            <MenuItem value={'TEN_MINUTE'}>{'10M'}</MenuItem>
                                            <MenuItem value={'FIFTEEN_MINUTE'}>{'15M'}</MenuItem>
                                            <MenuItem value={'THIRTY_MINUTE'}>{'30M'}</MenuItem>
                                            <MenuItem value={'ONE_HOUR'}>{'1H'}</MenuItem>
                                            <MenuItem value={'ONE_DAY'}>{'1D'}</MenuItem>
                                        </Select>
                                    </FormControl>


                                </Grid>



                                <Grid item xs={12} sm={1}>
                                    <FormControl style={styles.selectStyle} style={{ marginTop: '3px' }} >
                                        <InputLabel htmlFor="gender">Order Type</InputLabel>
                                        <Select value={this.state.producttype} name="producttype" onChange={this.onChange}>
                                            <MenuItem value={"INTRADAY"}>Interaday</MenuItem>
                                            <MenuItem value={"DELIVERY"}>Del</MenuItem>
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



                                <Grid style={{ display: "visible" }} spacing={1} direction="row" alignItems="center" container>

                                         <br />

                                    {this.state.InstrumentLTP ? 
                                    <Grid item xs={12} sm={3} style={{ background: "#00000014" }} >
                                          
                                        <div style={{ background: '#bdbdbd' }}>
                                            <b>  Daily: {this.state.tradingsymbol}</b> <br />

                                            <span title="20SMA" item xs={12} sm={12} style={{ color: this.state.InstrumentLTP.ltp > this.state.DailyBulishStatus ? "green" : "red", fontWeight: "bold" }}>
                                                Daily Avg Price: {this.state.DailyBulishStatus && this.state.DailyBulishStatus.toFixed(0)} {this.state.DailyBulishStatus ? this.state.InstrumentLTP.ltp > this.state.DailyBulishStatus ? "BUY" : "SELL" : ""}
                                            </span><br />


                                            <span title="averge of showed candle volume" item xs={12} sm={12}>
                                                <b>Daily Avg Volume:</b>  {(this.state.dailyAvgValume / 100000).toFixed(2)}L
                                            </span><br />
                                            <span title="averge of showed candle volume" item xs={12} sm={12}>
                                                {this.state.todayCurrentVolume > this.state.dailyAvgValume ? <b title="if cossed avg volume then its green" style={{ color: "green" }}>Today Volume: {(this.state.todayCurrentVolume / 100000).toFixed(2)}L </b> : "Today Volume:" + (this.state.todayCurrentVolume / 100000).toFixed(2) + "L"}
                                            </span>
                                        </div>
                                        <br />



                                        <b>  Intraday: {this.state.timeFrame} : {this.state.tradingsymbol}</b> <br />
                                        {this.state.bblastValue ? <span item xs={12} sm={12} >

                                            <span title="Green color mean price running above upper bb band" style={{ color: this.state.InstrumentLTP.ltp >= this.state.bblastValue.upper ? "green" : "", fontWeight: "bold" }}>BB Upper: {this.state.bblastValue.upper.toFixed(2)}</span><br />
                                            BB Middle(20 SMA): {this.state.bblastValue.middle.toFixed(2)}<br />
                                            <span title="Green red mean price running below lower bb band" style={{ color: this.state.InstrumentLTP.ltp <= this.state.bblastValue.lower ? "red" : "", fontWeight: "bold" }}>BB Lower: {this.state.bblastValue.lower.toFixed(2)}</span><br />
                                        </span> : ""}

                                        <span item xs={12} sm={12} style={{ color: this.state.InstrumentLTP.ltp > this.state.vwapvalue ? "green" : "red", fontWeight: "bold" }}>
                                            VWAP:  {this.state.vwapvalue && this.state.vwapvalue.toFixed(2)}
                                        </span>
                                        <br />
                                        <b> RSI: </b>{this.state.rsiValues && this.state.rsiValues.map((item, j) => (
                                            item >= 60 ? <span style={{ color: 'green', fontWeight: "bold" }}> {item} &nbsp;</span> : <span style={{ color: item <= 40 ? 'red' : "", fontWeight: "bold" }}> {item} &nbsp;</span>
                                        ))}


                                        <br />
                                        <b>Vol:</b> {this.state.valumeData && this.state.valumeData.map((item, j) => (
                                            <span style={{ color: item > this.state.dailyAvgValume ? "green" : "", fontWeight: item > this.state.dailyAvgValume ? "bold" : "" }}> {(item / 100000).toFixed(2)}L &nbsp;</span>
                                        ))}

                                        <br />  <br />

                                    </Grid>
                                    : ""}
                                    <Grid item xs={12} sm={!this.state.InstrumentLTP ? 12 : 9}  >
                                        <div id="showChartTitle">



                                        </div>
                                        <div id="tvchart"></div>

                                    </Grid>


                                </Grid>

                                <Grid item xs={12} sm={12} style={{ height: '100%', overflow: "auto" }}>
                                   <OrderWatchlist />
                                </Grid>



                                <Grid item xs={12} sm={12} style={{ overflowY: 'scroll', height: "50vh" }} >


                                    <Table size="small" aria-label="sticky table" >
                                        <TableHead style={{ width: "", whiteSpace: "nowrap" }} variant="head">
                                            <TableRow variant="head" style={{ fontWeight: 'bold' }} >

                                                <TableCell className="TableHeadFormat" align="center">Symbol</TableCell>
                                                <TableCell className="TableHeadFormat" align="center">Timestamp</TableCell>
                                                <TableCell className="TableHeadFormat" align="center">Chng% <b style={{ color: '#20d020' }}> UP({this.state.upsideMoveCount})</b> | <b style={{ color: 'red' }}> Down({this.state.downMoveCount})</b> | Total:  <b style={{ color: this.state.totalPerchentageChange > 0 ? "green" : 'red' }}>  {this.state.totalPerchentageChange && this.state.totalPerchentageChange.toFixed(2)}% </b> from {this.state.startingFrom} </TableCell>
                                                <TableCell className="TableHeadFormat" align="center">Open</TableCell>
                                                <TableCell className="TableHeadFormat" align="center">High</TableCell>
                                                <TableCell className="TableHeadFormat" align="center">Low</TableCell>
                                                <TableCell className="TableHeadFormat" align="center">Close </TableCell>
                                                <TableCell className="TableHeadFormat" align="center">Volume</TableCell>

                                            </TableRow>
                                        </TableHead>
                                        <TableBody style={{ width: "", whiteSpace: "nowrap" }}>
                                            {/* this.getPercentageColor((row[4] - row[1])*100/row[1] >= 0.3)  */}
                                            {this.state.InstrumentHistroy && this.state.InstrumentHistroy ? this.state.InstrumentHistroy.map((row, i) => (
                                                <TableRow key={i} style={{ background: (row[4] - row[1]) * 100 / row[1] >= 0.3 ? "#20d020" : (row[4] - row[1]) * 100 / row[1] <= -0.3 ? "#e66e6e" : "none" }} >

                                                    <TableCell align="center">{this.state.tradingsymbol}</TableCell>
                                                    <TableCell align="center">{new Date(row[0]).toLocaleString()}</TableCell>
                                                    <TableCell align="center"> <b>{(row[4] - row[1]) * 100 / row[1] && ((row[4] - row[1]) * 100 / row[1]).toFixed(2)}%</b></TableCell>
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


                            </Grid>
                        </Paper>
                        <br />



                        <Paper style={{ padding: "10px" }}>
                            <Typography style={{ textAlign: "center", background: "lightgray" }}>Backtest</Typography>

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



                                <Grid item xs={12} sm={6} style={{ marginTop: '28px' }}>
                                    {this.state.backTestFlag ? <Button variant="contained" onClick={() => this.backTestAnyPattern()}>Search</Button> : <> <Button> <Spinner /> &nbsp; &nbsp; Scaning: {this.state.stockTesting}  {this.state.runningTest}  </Button>  <Button variant="contained" onClick={() => this.stopBacktesting()}>Stop</Button> </>}
                                    SearchFailed:{this.state.searchFailed}

                                </Grid>

                                <Grid item xs={12} sm={12}>


                                    {this.state.patternType == 'NR4' || this.state.patternType == 'TweezerTop' || this.state.patternType == 'TweezerBottom' || this.state.patternType == 'NR4_SameDay' ? <Table size="small" aria-label="sticky table" >

                                        <TableHead style={{ width: "", whiteSpace: "nowrap" }} variant="head">
                                            <TableRow style={{ background: "lightgray" }}>

                                                <TableCell style={{ color: localStorage.getItem('sumPerChange') > 0 ? "#20d020" : "#e66e6e" }} align="center"><b>{localStorage.getItem('sumPerChange')}%</b></TableCell>

                                                {/* <TableCell style={{ color: "#e66e6e" }} align="center"><b>{localStorage.getItem('sumBrokeragePer')}%</b></TableCell>
        <TableCell style={{ color: localStorage.getItem('netSumPerChange') > 0 ? "#20d020" : "#e66e6e" }} align="center"><b>{localStorage.getItem('netSumPerChange')}%</b></TableCell> */}


                                                <TableCell style={{ color: localStorage.getItem('sumPnlValue') > 0 ? "#20d020" : "#e66e6e" }} align="center"><b>{localStorage.getItem('sumPnlValue')}</b></TableCell>

                                                <TableCell style={{ color: localStorage.getItem('sumPerChangeHighLow') > 0 ? "#20d020" : "#e66e6e" }} align="center"><b>{localStorage.getItem('sumPerChangeHighLow')}%</b></TableCell>
                                                <TableCell style={{ color: localStorage.getItem('sumPnlValueOnHighLow') > 0 ? "#20d020" : "#e66e6e" }} align="center"><b>{localStorage.getItem('sumPnlValueOnHighLow')}</b></TableCell>




                                                <TableCell align="left" >Total Trades: {this.state.backTestResult && this.state.backTestResult.length} Win: {localStorage.getItem('totalWin')} Loss: {localStorage.getItem('totalLoss')}</TableCell>


                                                <TableCell align="center">Long: {localStorage.getItem('totalLongTrade')} Short:  {this.state.backTestResult && this.state.backTestResult.length - localStorage.getItem('totalLongTrade')}</TableCell>
                                                <TableCell align="left" colSpan={2}> Total Invested  {localStorage.getItem('totalInvestedValue')}</TableCell>

                                                <TableCell align="center" colSpan={4}> Average gross/trade PnL:  <b style={{ color: (localStorage.getItem('sumPerChange') / this.state.backTestResult.length) > 0 ? "#20d020" : "#e66e6e" }} >{(localStorage.getItem('sumPerChange') / this.state.backTestResult.length).toFixed(2)}%</b></TableCell>


                                            </TableRow>
                                            <TableRow variant="head" style={{ fontWeight: 'bold' }}>


                                                <TableCell className="TableHeadFormat" align="center">CPnl% </TableCell>

                                                {/* <TableCell className="TableHeadFormat" align="center">Charges</TableCell>
        <TableCell className="TableHeadFormat" align="center">Net PnL %</TableCell> */}

                                                <TableCell className="TableHeadFormat" align="center">CNetPnL </TableCell>

                                                <TableCell className="TableHeadFormat" title="High on long side | Low in short side" align="center">HLPnL% </TableCell>
                                                <TableCell className="TableHeadFormat" title="High on long side | Low in short side" align="center">HLNet PnL</TableCell>

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

                                                    <TableCell style={{ color: row.perChange > 0 ? "#20d020" : "#e66e6e" }} align="center" {...sumPerChange = sumPerChange + parseFloat(row.perChange || 0)}>{row.perChange}%</TableCell>
                                                    {/* <TableCell style={{ color: "gray" }} align="center" {...sumBrokeragePer = sumBrokeragePer + parseFloat(row.brokerageCharges)}>{row.brokerageCharges}%</TableCell>
        <TableCell style={{ color: (row.perChange - row.brokerageCharges) > 0 ? "#20d020" : "#e66e6e" }} align="center" {...netSumPerChange = netSumPerChange + parseFloat(row.perChange - row.brokerageCharges)}> <b>{(row.perChange - row.brokerageCharges).toFixed(2)}%</b></TableCell>
        */}
                                                    <TableCell {...tradetotal = ((row.sellEntyPrice * (row.perChange - row.brokerageCharges) / 100) * row.quantity)} {...sumPnlValue = sumPnlValue + tradetotal} {...totalWin += (((row.sellEntyPrice * (row.perChange - row.brokerageCharges) / 100) * row.quantity) > 0 ? 1 : 0)} {...totalLoss += ((row.sellEntyPrice * (row.perChange - row.brokerageCharges) / 100) * row.quantity) < 0 ? 1 : 0} style={{ color: tradetotal > 0 ? "#20d020" : "#e66e6e" }} align="center" > {tradetotal.toFixed(2)}</TableCell>

                                                    <TableCell style={{ color: row.perChngOnHighLow > 0 ? "#20d020" : "#e66e6e" }} align="center" {...sumPerChangeHighLow = sumPerChangeHighLow + parseFloat(row.perChngOnHighLow || 0)}> <b>{row.perChngOnHighLow}%</b></TableCell>
                                                    <TableCell {...sumPnlValueOnHighLow = sumPnlValueOnHighLow + ((row.sellEntyPrice * (row.perChngOnHighLow - row.brokerageCharges) / 100) * row.quantity)} style={{ color: ((row.sellEntyPrice * (row.perChngOnHighLow - row.brokerageCharges) / 100) * row.quantity) > 0 ? "#20d020" : "#e66e6e" }} align="center" >{((row.sellEntyPrice * (row.perChngOnHighLow - row.brokerageCharges) / 100) * row.quantity).toFixed(2)}</TableCell>



                                                    <TableCell align="left"> <Button variant="contained" style={{ marginLeft: '20px' }} onClick={() => this.showCandleBothChart(row)}>{row.symbol} <EqualizerIcon /> </Button></TableCell>

                                                    <TableCell align="left" style={{ color: row.foundAt && row.foundAt.indexOf('Long') == 0 ? "#20d020" : "#e66e6e" }} {...totalLongTrade = totalLongTrade + (row.foundAt && row.foundAt.indexOf('Long') == 0 ? 1 : 0)}>{row.foundAt}</TableCell>
                                                    <TableCell align="center">{row.squareOffAt}</TableCell>

                                                    <TableCell align="center">{row.exitStatus}</TableCell>

                                                    <TableCell align="center">{row.buyExitPrice}</TableCell>

                                                    <TableCell align="center" {...totalInvestedValue = totalInvestedValue + (row.foundAt && row.foundAt.indexOf('Long') == 0 ? parseFloat(row.buyExitPrice * row.quantity) : parseFloat(row.sellEntyPrice * row.quantity))}>{row.sellEntyPrice}({row.quantity})</TableCell>
                                                    <TableCell title="High on long side | Low in short side" align="center">{row.highAndLow}</TableCell>


                                                    <TableCell align="center">{row.stopLoss}</TableCell>
                                                    {/* <TableCell align="center">{i + 1}</TableCell> */}

                                                </TableRow>



                                            )) : ''}


                                            <TableRow style={{ background: "lightgray" }} >

                                                <TableCell style={{ color: sumPerChange > 0 ? "#20d020" : "#e66e6e" }} align="center"><b>{localStorage.setItem('sumPerChange', sumPerChange.toFixed(2))}{sumPerChange.toFixed(2)}%</b></TableCell>

                                                {/* <TableCell style={{ color: "#e66e6e" }} align="center"><b>-{(sumBrokeragePer).toFixed(2)}%</b>{localStorage.setItem('sumBrokeragePer', sumBrokeragePer.toFixed(2))}</TableCell>
<TableCell style={{ color: netSumPerChange > 0 ? "#20d020" : "#e66e6e" }} align="center"><b>{(netSumPerChange).toFixed(2)}%</b>{localStorage.setItem('netSumPerChange', netSumPerChange.toFixed(2))}</TableCell> */}

                                                <TableCell style={{ color: sumPnlValue > 0 ? "#20d020" : "#e66e6e" }} align="center"><b>{(sumPnlValue).toFixed(2)}</b>{localStorage.setItem('sumPnlValue', sumPnlValue.toFixed(2))}</TableCell>

                                                <TableCell style={{ color: sumPerChangeHighLow > 0 ? "#20d020" : "#e66e6e" }} align="center"><b>{localStorage.setItem('sumPerChangeHighLow', sumPerChangeHighLow.toFixed(2))}{sumPerChangeHighLow.toFixed(2)}%</b></TableCell>
                                                <TableCell style={{ color: sumPnlValueOnHighLow > 0 ? "#20d020" : "#e66e6e" }} align="center"><b>{(sumPnlValueOnHighLow).toFixed(2)}</b>{localStorage.setItem('sumPnlValueOnHighLow', sumPnlValueOnHighLow.toFixed(2))}</TableCell>


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



                                    {this.state.patternType == 'NR4_Daywide_daterage' ? <>

                                        {this.state.dateAndTypeKeys ? this.state.dateAndTypeKeys.map(key => (

                                            <Table size="small" aria-label="sticky table" style={{ padding: "5px" }}>
                                                <TableHead style={{ width: "", whiteSpace: "nowrap" }} variant="head">

                                                    <TableRow style={{ background: "lightgray" }} key={key}>
                                                        <TableCell colSpan={11} className="TableHeadFormat" align="center"> {key}  {sumPerChange = 0, sumBrokeragePer = 0, netSumPerChange = 0, sumPerChangeHighLow = 0, sumPnlValue = 0, sumPnlValueOnHighLow = 0, totalInvestedValue = 0, totalLongTrade = 0, totalShortTrade = 0}</TableCell>
                                                    </TableRow>

                                                    <TableRow key={key + 1} variant="head" style={{ fontWeight: 'bold', background: "lightgray" }}>


                                                        <TableCell className="TableHeadFormat" align="center"> CPnL% </TableCell>

                                                        {/* <TableCell className="TableHeadFormat" align="center">Charges</TableCell>
                        <TableCell className="TableHeadFormat" align="center">Net PnL %</TableCell> */}

                                                        <TableCell className="TableHeadFormat" align="center">CNetPnL </TableCell>

                                                        <TableCell className="TableHeadFormat" title="High on long side | Low in short side" align="center">HLPnL% </TableCell>
                                                        <TableCell className="TableHeadFormat" title="High on long side | Low in short side" align="center">HLNet PnL</TableCell>

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

                                                            <TableCell style={{ color: row.perChange > 0 ? "#20d020" : "#e66e6e" }} align="center" {...sumPerChange = sumPerChange + parseFloat(row.perChange || 0)}>{row.perChange}%</TableCell>
                                                            {/* <TableCell style={{ color: "gray" }} align="center" {...sumBrokeragePer = sumBrokeragePer + parseFloat(row.brokerageCharges)}>{row.brokerageCharges}%</TableCell>
                            <TableCell style={{ color: (row.perChange - row.brokerageCharges) > 0 ? "#20d020" : "#e66e6e" }} align="center" {...netSumPerChange = netSumPerChange + parseFloat(row.perChange - row.brokerageCharges)}> <b>{(row.perChange - row.brokerageCharges).toFixed(2)}%</b></TableCell>
                        */}
                                                            <TableCell {...sumPnlValue = sumPnlValue + ((row.sellEntyPrice * (row.perChange - row.brokerageCharges) / 100) * row.quantity)} style={{ color: ((row.sellEntyPrice * (row.perChange - row.brokerageCharges) / 100) * row.quantity) > 0 ? "#20d020" : "#e66e6e" }} align="center" > {((row.sellEntyPrice * (row.perChange - row.brokerageCharges) / 100) * row.quantity).toFixed(2)}</TableCell>

                                                            <TableCell style={{ color: row.perChngOnHighLow > 0 ? "#20d020" : "#e66e6e" }} align="center" {...sumPerChangeHighLow = sumPerChangeHighLow + parseFloat(row.perChngOnHighLow || 0)}> <b>{row.perChngOnHighLow}%</b></TableCell>
                                                            <TableCell {...sumPnlValueOnHighLow = sumPnlValueOnHighLow + ((row.sellEntyPrice * (row.perChngOnHighLow - row.brokerageCharges) / 100) * row.quantity)} style={{ color: ((row.sellEntyPrice * (row.perChngOnHighLow - row.brokerageCharges) / 100) * row.quantity) > 0 ? "#20d020" : "#e66e6e" }} align="center" >{((row.sellEntyPrice * (row.perChngOnHighLow - row.brokerageCharges) / 100) * row.quantity).toFixed(2)}</TableCell>



                                                            <TableCell align="left"> <Button variant="contained" style={{ marginLeft: '20px' }} onClick={() => this.showCandleChart(row.candleChartData, row.symbol)}>{row.symbol} <EqualizerIcon /> </Button></TableCell>

                                                            <TableCell align="left" style={{ color: row.foundAt.indexOf('Long') == 0 ? "#20d020" : "#e66e6e" }} {...totalLongTrade = totalLongTrade + (row.foundAt.indexOf('Long') == 0 ? 1 : 0)}>{row.foundAt}</TableCell>
                                                            <TableCell align="center">{row.buyExitPrice}</TableCell>

                                                            <TableCell align="center" {...totalInvestedValue = totalInvestedValue + (row.foundAt.indexOf('Long') == 0 ? parseFloat(row.buyExitPrice * row.quantity) : parseFloat(row.sellEntyPrice * row.quantity))}>{row.sellEntyPrice}({row.quantity})</TableCell>
                                                            <TableCell title="High on long side | Low in short side" align="center">{row.highAndLow}</TableCell>

                                                            <TableCell align="center">{row.squareOffAt}</TableCell>

                                                            <TableCell align="center">{row.stopLoss}</TableCell>
                                                            {/* <TableCell align="center">{i + 1}</TableCell> */}

                                                        </TableRow>


                                                    ))}



                                                    <TableRow style={{ background: "lightgray" }} >

                                                        <TableCell style={{ color: sumPerChange > 0 ? "#20d020" : "#e66e6e" }} align="center"><b>{localStorage.setItem('sumPerChange', sumPerChange.toFixed(2))}{sumPerChange.toFixed(2)}%</b></TableCell>

                                                        {/* <TableCell style={{ color: "#e66e6e" }} align="center"><b>-{(sumBrokeragePer).toFixed(2)}%</b>{localStorage.setItem('sumBrokeragePer', sumBrokeragePer.toFixed(2))}</TableCell>
            <TableCell style={{ color: netSumPerChange > 0 ? "#20d020" : "#e66e6e" }} align="center"><b>{(netSumPerChange).toFixed(2)}%</b>{localStorage.setItem('netSumPerChange', netSumPerChange.toFixed(2))}</TableCell> */}

                                                        <TableCell style={{ color: sumPnlValue > 0 ? "#20d020" : "#e66e6e" }} align="center"><b>{(sumPnlValue).toFixed(2)}</b>{localStorage.setItem('sumPnlValue', sumPnlValue.toFixed(2))}</TableCell>

                                                        <TableCell style={{ color: sumPerChangeHighLow > 0 ? "#20d020" : "#e66e6e" }} align="center"><b>{localStorage.setItem('sumPerChangeHighLow', sumPerChangeHighLow.toFixed(2))}{sumPerChangeHighLow.toFixed(2)}%</b></TableCell>
                                                        <TableCell style={{ color: sumPnlValueOnHighLow > 0 ? "#20d020" : "#e66e6e" }} align="center"><b>{(sumPnlValueOnHighLow).toFixed(2)}</b>{localStorage.setItem('sumPnlValueOnHighLow', sumPnlValueOnHighLow.toFixed(2))}</TableCell>


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
                                            NR4 For Next Day  ({this.state.FoundPatternList.length})  at {this.state.endDate && this.state.endDate ? this.state.endDate.toString().substr(0, 16) : new Date().toString().substr(0, 16)}
                                        </Typography>
                                        : ""}

                                    {this.state.patternType == 'NR4ForNextDay' ?
                                        <Table size="small" aria-label="sticky table" >

                                            <TableHead style={{ width: "", whiteSpace: "nowrap" }} variant="head">

                                                <TableRow variant="head" style={{ fontWeight: 'bold' }}>

                                                    <TableCell className="TableHeadFormat" align="center">Sr </TableCell>

                                                    <TableCell className="TableHeadFormat" align="left">Symbol </TableCell>
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
                                                        <TableCell align="left"> <Button variant="contained" style={{ marginLeft: '20px' }} onClick={() => this.showCandleChart(row.candleChartData, row.symbol)}>{row.symbol} <EqualizerIcon /> </Button></TableCell>

                                                        <TableCell align="left">{row.foundAt.substr(0, 16)}</TableCell>
                                                        <TableCell align="left" title="based on last one 6 month">

                                                            <span style={{ background: row.pastPerferm.totalLongPer / row.pastPerferm.totalLongs >= 1 ? "#92f192" : "" }}><b>{row.pastPerferm.totalLongs}</b>  Longs:  {row.pastPerferm.totalLongPer}% ({(row.pastPerferm.totalLongPer / row.pastPerferm.totalLongs).toFixed(2)}% per trade)  </span> <br />
                                                            Longs on High%: {row.pastPerferm.totalLongHighPer}%  ({(row.pastPerferm.totalLongHighPer / row.pastPerferm.totalLongs).toFixed(2)}% per trade)<br />
                                                            {row.longCandles && row.longCandles.map((insiderow, i) => (
                                                                <>
                                                                    {/* <Button size="small"  variant="contained" style={{ marginLeft: '20px' }} onClick={() => this.showCandleChart(insiderow.candleChartData, row.symbol, insiderow)}> <EqualizerIcon /></Button> */}

                                                                    <a style={{ textDecoration: 'underline', background: 'lightgray', cursor: 'pointer' }} onClick={() => this.showCandleChart(insiderow.candleChartData, row.symbol, insiderow)}> {insiderow.foundAt.substr(7, 10)} </a>  &nbsp;
                                                                </>
                                                            ))}

                                                            <br />

                                                            <span style={{ background: row.pastPerferm.totalShortPer / row.pastPerferm.totalShort >= 1 ? "#e87b7b" : "" }}><b>{row.pastPerferm.totalShort}</b> Short: {row.pastPerferm.totalShortPer}% ({(row.pastPerferm.totalShortPer / row.pastPerferm.totalShort).toFixed(2)}% per trade) </span> <br />
                                                            Short on Low%: {row.pastPerferm.totalShortLowPer}% ({(row.pastPerferm.totalShortLowPer / row.pastPerferm.totalShort).toFixed(2)}% per trade)<br />
                                                            {row.shortCandles && row.shortCandles.map((insiderow, i) => (
                                                                <>
                                                                    <a style={{ textDecoration: 'underline', background: 'lightgray', cursor: 'pointer' }} onClick={() => this.showCandleChart(insiderow.candleChartData, row.symbol, insiderow)}> {insiderow.foundAt.substr(7, 10)}  </a> &nbsp;


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
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={2}>


                        <Grid style={{ display: "visible" }} spacing={1} direction="row" alignItems="center" container>
                       
                             <Grid item xs={12} sm={12}>
                                <SimpleExpansionPanel data={{ list: this.state.closeingEqualHighList, title: "Strong Closing", LoadSymbolDetails: this.LoadSymbolDetails }} />
                            </Grid> 

                            {/* <Grid item xs={12} sm={12}>
                                <LiveBidsExpantion data={{ list: this.state.liveBidsList, title: "Live Bids", LoadSymbolDetails: this.LoadSymbolDetails }} />
                            </Grid>  */}
                        
                            <Grid item xs={12} sm={12}>
                                <SimpleExpansionFastMovement data={{ list: this.state.oneHourBullBearCheckList, title: "Hourly Bullish/Bearish", LoadSymbolDetails: this.LoadSymbolDetails }} />
                            </Grid> 

                        

                            <Grid item xs={12} sm={12}>
                                <SimpleExpansionFastMovement data={{ list: this.state.volumeBreakoutlast5CandleList, title: "Last 5 bar Volume breakout", LoadSymbolDetails: this.LoadSymbolDetails }} />
                            </Grid> 

                            <Grid item xs={12} sm={12}>
                                <SimpleExpansionFastMovement data={{ list: this.state.fastMovementList, title: "Fast Movement", LoadSymbolDetails: this.LoadSymbolDetails }} />
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <SimpleExpansionPanel data={{ list: this.state.volumeCrossedList, title: "Average Volume Crossed", LoadSymbolDetails: this.LoadSymbolDetails }} />
                            </Grid>

                            <Grid item xs={12} sm={12}>
                                <SimpleExpansionPanel data={{ list: this.state.openEqualLowList, title: "Open = Low : Buy", LoadSymbolDetails: this.LoadSymbolDetails }} />
                            </Grid>


                            <Grid item xs={12} sm={12}>
                                <SimpleExpansionPanel data={{ list: this.state.openEqualHighList, title: "Open = High : Sell", LoadSymbolDetails: this.LoadSymbolDetails }} />
                            </Grid>

                            <Grid item xs={12} sm={12}>
                                <SimpleExpansionPanel data={{ list: this.state.slowMotionStockList, title: "Last 5 days no Movement", LoadSymbolDetails: this.LoadSymbolDetails }} />
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

