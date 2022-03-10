import React from 'react';
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Grid from '@material-ui/core/Grid';
import PostLoginNavBar from "../PostLoginNavbar";
import Paper from '@material-ui/core/Paper';
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Spinner from "react-spinner-material";
import { w3cwebsocket } from 'websocket';
//import ChartDialog from './ChartDialog';
import pako from 'pako';
import AdminService from "../service/AdminService";
import Notify from "../../utils/Notify";
import { createChart } from 'lightweight-charts';
import * as moment from 'moment';
import { resolveResponse } from "../../utils/ResponseHandler";
import { SMA, RSI, VWAP, BollingerBands } from 'technicalindicators';
import vwap from 'vwap';
import ShowChartIcon from '@material-ui/icons/ShowChart';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import "./ViewStyle.css";
import Hidden from '@material-ui/core/Hidden';
import CommonOrderMethod from "../../utils/CommonMethods";


// import vwap from 'vwap';
// import { SMA, RSI, VWAP, BollingerBands } from 'technicalindicators';
// import SimpleExpansionPanel from "./SimpleExpansionPanel";
// import SimpleExpansionFastMovement from "./SimpleExpansionFastMovement";
// import LiveBidsExpantion from "./LiveBidsExpantion";
// import WatchListTab from "./WatchListTab"; 
// import OrderWatchlist from './OrderWatchlist';


class LiveBid extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            totalWatchlist: localStorage.getItem('totalWatchlist') && JSON.parse(localStorage.getItem('totalWatchlist')) || [],
            staticData: localStorage.getItem('staticData') && JSON.parse(localStorage.getItem('staticData')) || {},
            selectedWatchlist: 'NIFTY 100', //'Securities in F&O', 'NIFTY BANK'
            symbolList: [],
            actionList: localStorage.getItem('actionList') && JSON.parse(localStorage.getItem('actionList')) || [],
            timeFrame: "FIFTEEN_MINUTE",
            softedIndexList: [],
            listofHighLow: localStorage.getItem('listofHighLow') && JSON.parse(localStorage.getItem('listofHighLow')) || [], 
            gainerList: localStorage.getItem('gainerList') && JSON.parse(localStorage.getItem('gainerList')) || [],
            looserList: localStorage.getItem('looserList') && JSON.parse(localStorage.getItem('looserList')) || [],
            liveCandleHistory: localStorage.getItem('liveCandleHistory') && JSON.parse(localStorage.getItem('liveCandleHistory')) || [],

            cursor: '',
            candleHistoryFlag: false,
            lightChartSymbol: "Select Symbol for Chart",
            isSpeek: localStorage.getItem('isSpeek') === 'true' ? true : false,
            sortedType: "pChange",
            sluglist: {
                'NIFTY 50': 'nifty',
                'NIFTY AUTO': 'cnxAuto',
                'NIFTY BANK': 'bankNifty',
                'NIFTY ENERGY': 'cnxEnergy',
                'NIFTY FIN SERVICE': 'cnxFinance',
                'NIFTY FMCG': 'cnxFMCG',
                'NIFTY IT': 'cnxit',
                'NIFTY MEDIA': 'cnxMedia',
                'NIFTY METAL': 'cnxMetal',
                'NIFTY PHARMA': 'cnxPharma',
                'NIFTY PSU BANK': 'cnxPSU',
                'NIFTY REALTY': 'cnxRealty',
                'NIFTY PVT BANK': 'niftyPvtBank',
                'NIFTY CONSUMPTION': 'cnxConsumption',
                'NIFTY CPSE': 'cpse',
                'NIFTY INFRA': 'cnxInfra',
                'NIFTY MNC': 'cnxMNC',
                'NIFTY PSE': 'cnxPSE',

                //  "NIFTY HEALTHCARE": "niftyHealthcare"
                //'NIFTY CONSR DURBL':  "niftyConsrDurbl"
                // 'NIFTY GROWSECT 15': 'ni15',H
                // 'NIFTY COMMODITIES': 'cnxCommodities',
                // 'NIFTY SERV SECTOR': 'cnxService',
                // 'NIFTY100 LIQ 15': 'nseliquid',
                // 'NIFTY MID LIQ 15': 'niftyMidcapLiq15',
                // 'NIFTY DIV OPPS 50': 'cnxDividendOppt',
                // 'NIFTY50 VALUE 20': 'nv20',
                // 'NIFTY QUALITY 30': 'niftyQuality30',
                // 'NIFTY50 EQL WGT': 'nifty50EqualWeight',
                // 'NIFTY100 EQL WGT': 'nifty100EqualWeight',
                // 'NIFTY ALPHA 50': 'niftyAlpha50',
                'NIFTY NEXT 50': 'juniorNifty',
                'NIFTY MIDCAP 50': 'niftyMidcap50',
                'NIFTY HEALTHCARE': "notfound",
                'NIFTY OIL AND GAS': "notfound",
                'NIFTY 100': "notfound",
                'NIFTY CONSR DURBL': 'notfond'
            },
        };
        this.updateSocketWatch = this.updateSocketWatch.bind(this);

    }
    componentDidMount() {

        window.document.title = "WS Bid Live";
        this.setState({ symbolList: this.state.staticData[this.state.selectedWatchlist] }, ()=> {

           const FIVE_MIN = (1000 * 60 * 15);
        //   this.waitAndDoSomething(FIVE_MIN); 

            var msToNextRounded5Min = FIVE_MIN - (Date.now() % FIVE_MIN);
             msToNextRounded5Min = msToNextRounded5Min - 1000 ;

            var date = new Date();
            let nextExec = (59 - date.getSeconds()) * 1000; 
            console.log("next59Exec", nextExec, 'msToNextRounded5Min', msToNextRounded5Min,  new Date().toLocaleTimeString()); 
            setTimeout(() => {
                setInterval(this.calculateCandleVolume, 60000 * 15);
                console.log("nextExeced",new Date().toLocaleTimeString() ); 

                this.calculateCandleVolume(); 

            }, msToNextRounded5Min);

        });

        var tokens = JSON.parse(localStorage.getItem("userTokens"));
        var feedToken = tokens && tokens.feedToken;
        var userProfile = JSON.parse(localStorage.getItem("userProfile"));
        var clientcode = userProfile && userProfile.clientcode;
        this.setState({ feedToken: feedToken, clientcode: clientcode }, function () {
            this.wsClint = new w3cwebsocket('wss://omnefeeds.angelbroking.com/NestHtml5Mobile/socket/stream');
            this.updateSocketDetails(this.wsClint);
        });

        const domElement = document.getElementById('tvchart');
        document.getElementById('tvchart').innerHTML = '';

        let width = window.screen.width / 3.1, height = window.screen.height / 2;
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            width = window.screen.width ;
        }


        const chart = createChart(domElement, { width: width, height: height, timeVisible: true, secondsVisible: true, });
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

        this.getUpdateIndexData()

        var beginningTime = moment('9:15am', 'h:mma');
        var endTime = moment('3:30pm', 'h:mma');
        const friday = 5; // for friday
        var currentTime = moment(new Date(), "h:mma");
        const today = moment().isoWeekday();
        //market hours
        if (today <= friday && currentTime.isBetween(beginningTime, endTime)) {
            setInterval(() => {
                if (this.state.token) {
                    this.showStaticChart();
                }
            }, 5000);
        }


        // setTimeout(() => {
    
        //     this.storeChartData();

        // },1000);

       // this.updateDayChartHighLow(); 
       
    }
    makeConnection = (wsClint) => {
        var firstTime_req = '{"task":"cn","channel":"NONLM","token":"' + this.state.feedToken + '","user": "' + this.state.clientcode + '","acctid":"' + this.state.clientcode + '"}';
        wsClint.send(firstTime_req);
        this.updateSocketWatch(wsClint);
    }
    decodeWebsocketData = (array) => {
        var newarray = [];
        try {
            for (var i = 0; i < array.length; i++) {
                newarray.push(String.fromCharCode(array[i]));
            }
        } catch (e) { }
        //  console.log(newarray.join(''))
        return newarray.join('');
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
      //  console.log("wsClint", wsClint)

        wsClint.send(JSON.stringify(updateSocket));
    }

    takeAction = (symbol, action) => {
        let isfound = this.state.actionList.length && this.state.actionList.filter(item => item.symbol === symbol);
        if (!isfound.length) {
            let data = { symbol: symbol, action: action, updateTime: new Date().toLocaleTimeString() };
            this.setState({ actionList: [...this.state.actionList, data] }, function () {
                localStorage.setItem('actionList', JSON.stringify(this.state.actionList));
                this.speckIt(symbol + " " + action);

                console.log(data.symbol + " " + data.action + " " + data.updateTime);
                this.setState({ lastUpdateAction: data.symbol + " " + data.action + " " + data.updateTime });

                window.document.title = data.symbol + " " + data.action + " " + data.updateTime;
            });
        }
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
                    symbolListArray[index].pChange = foundLive[0].nc;
                    symbolListArray[index].totalBuyQuantity = foundLive[0].tbq;
                    symbolListArray[index].totalSellQuantity = foundLive[0].tsq;
                    symbolListArray[index].totalTradedVolume = foundLive[0].v;
                    symbolListArray[index].averagePrice = foundLive[0].ap;
                    symbolListArray[index].lowPrice = foundLive[0].lo;
                    symbolListArray[index].highPrice = foundLive[0].h;
                    symbolListArray[index].openPrice = foundLive[0].op;
                    symbolListArray[index].volume = foundLive[0].v;

                    symbolListArray[index].bestbuyquantity = foundLive[0].bq;
                    symbolListArray[index].bestbuyprice = foundLive[0].bp;
                    symbolListArray[index].bestsellquantity = foundLive[0].bs;
                    symbolListArray[index].bestsellprice = foundLive[0].sp;
                    symbolListArray[index].ltt = moment(foundLive[0].ltt,'YYYY-MM-DD HH:mm:ss').toString();

                    // symbolListArray[index].upperCircuitLimit = foundLive[0].ucl;
                    // symbolListArray[index].lowerCircuitLimit = foundLive[0].lcl;

                    symbolListArray[index].buytosellTime = (foundLive[0].tbq / foundLive[0].tsq).toFixed(2);
                    symbolListArray[index].selltobuyTime = (foundLive[0].tsq / foundLive[0].tbq).toFixed(2);

                    if (foundLive[0].tbq / foundLive[0].tsq > 2) {
                        symbolListArray[index].highlightbuy = true;
                        this.takeAction(element.symbol, ' buying')
                    } else {
                        symbolListArray[index].highlightbuy = false;
                    }

                    if (foundLive[0].tsq / foundLive[0].tbq > 2) {
                        symbolListArray[index].highlightsell = true;
                        this.takeAction(element.symbol, ' selling')

                    } else {
                        symbolListArray[index].highlightsell = false;
                    }

                    if (this.state.token == element.token) {
                        this.setState({ livePrice: foundLive[0].ltp, livePChange: foundLive[0].nc })
                    }


                    let found = []; //this.state.listofHighLow.filter(item => item.symbol == element.symbol); 
                    if(found.length > 0 && foundLive[0].ltp >= 200 && foundLive[0].ltp <= 10000 && new Date().getHours() < 9 && new Date().getMinutes() <= 30){
                        if(!localStorage.getItem(symbolListArray[index].symbol)){
                            if(symbolListArray[index].symbol == found[0].symbol && foundLive[0].ltp > found[0].high){
                                localStorage.setItem(symbolListArray[index].symbol, "ok")
                                this.speckIt((symbolListArray[index].symbol +' previous day high broken ').toLocaleLowerCase())
                                console.log(symbolListArray[index].name, foundLive[0].ltp, "previous day high broken BUY")
                                var symbolInfo = {
                                    token: symbolListArray[index].token,
                                    symbol: symbolListArray[index].symbol,
                                    qtyToTake: 1,
                                    producttype: 'INTRADAY'
                                }
                                CommonOrderMethod.historyWiseOrderPlace(symbolInfo, 'BUY', "no", this.callbackAfterOrderDone);
                            }
                            if(symbolListArray[index].symbol == found[0].symbol && foundLive[0].ltp < found[0].low){
                                localStorage.setItem(symbolListArray[index].symbol, "ok")
                                this.speckIt((symbolListArray[index].symbol +' previous day low broken ').toLocaleLowerCase())
                                console.log(symbolListArray[index].name, foundLive[0].ltp, "previous day high broken SELL")
                                var symbolInfo = {
                                    token: symbolListArray[index].token,
                                    symbol: symbolListArray[index].symbol,
                                    qtyToTake: 1,
                                    producttype: 'INTRADAY'
                                }
                                CommonOrderMethod.historyWiseOrderPlace(symbolInfo, 'SELL', "no", this.callbackAfterOrderDone);
                            }
                        }
                    } 
               //     console.log("ws onmessage: ", foundLive[0]);

                  


                }
            });


            let shortBy = this.state.sortedType;
            symbolListArray && symbolListArray.sort(function (a, b) {
                return b[shortBy] - a[shortBy];
            });
            this.setState({ symbolList: symbolListArray }, ()=> {
              //  console.log('updated',  this.state.symbolList )
            });
        }

        wsClint.onerror = (e) => {
            console.log("socket error", e);
            this.makeConnection(this.wsClint);
        }

        setInterval(() => {
            console.log("this.wsClint", this.wsClint)

            if(this.wsClint.readyState != 1){
                this.makeConnection(this.wsClint);
            }

            var _req = '{"task":"hb","channel":"","token":"' + this.state.feedToken + '","user": "' + this.state.clientcode + '","acctid":"' + this.state.clientcode + '"}';
            console.log("Request :- " + _req);
            wsClint.send(_req);
        }, 59000);
    }



    comparePreviousVolume = (symbol, volume, ltp) => {   
        let candle =  this.state.liveCandleHistory.filter((item) => item.s == symbol); 
        console.log("previous candle", symbol, candle)
        if(candle.length>0){
            let currentCandleVol = volume - candle[candle.length-1].v;  let brokenCount=0, priceVolBreakout = 0, dayPriceVolBreakout = 0;
            if(currentCandleVol > candle[candle.length-1].cv){
                for (let index = candle.length-1; index > 0; index--) {
                    if(currentCandleVol > candle[index].cv){
                        brokenCount++;
                    }else{
                        break; 
                    }
                }
                let lastCandleChange = (ltp - candle[candle.length-1].p) * 100/candle[candle.length-1].p; 
                let log = symbol + ' '+ brokenCount +" candles volume broken with " + lastCandleChange.toFixed(2) +'%'; 
                console.log(log, candle[candle.length-1],  currentCandleVol, new Date().toLocaleTimeString() );
              //  this.speckIt(log);
                if(brokenCount >= 8 && (lastCandleChange >= 0.5 || lastCandleChange <= -0.5)){
                    let log = "price and volume breakout in " + symbol + ' with '+ brokenCount +" candles with " + lastCandleChange.toFixed(2) +'%'; 
                    console.log(log, candle[candle.length-1],  currentCandleVol, new Date().toLocaleTimeString() );
                    this.speckIt(log);
                    priceVolBreakout = 1; 
                }
                if( brokenCount == candle.length-1 && (lastCandleChange >= 0.5 || lastCandleChange <= -0.5)){
                    dayPriceVolBreakout = 1; 
                    let log = "Day price and volume breakout in " + symbol + ' with '+ brokenCount +" candles with " + lastCandleChange.toFixed(2) +'%'; 
                    console.log(log, candle[candle.length-1],  currentCandleVol, new Date().toLocaleTimeString() );
                    this.speckIt(log);
                }
            }
            return {cv : currentCandleVol,  brokenCount:  brokenCount,  priceVolBreakout: priceVolBreakout, dayPriceVolBreakout: dayPriceVolBreakout}; 
        }else{
            return {cv : volume,  brokenCount:  0, priceVolBreakout: 0,  dayPriceVolBreakout: 0}; 
        }
    }

    calculateCandleVolume = () => {
        console.log("calculateCandleVolume called", new Date().toLocaleTimeString())

        this.state.symbolList.forEach(element => {

            let voldata = this.comparePreviousVolume(element.symbol, element.volume,element.ltp); 
            var data = {
                s: element.symbol, 
                t: new Date().toLocaleTimeString("en-GB", { hour: "2-digit",minute: "2-digit"}), 
                v: element.volume, 
                cv: voldata.cv, 
                p: element.ltp, 
                ch:element.pChange 
            }
            element.volBreakoutCount = voldata.brokenCount; 
            element.priceVolBreakout = voldata.priceVolBreakout; 

          //  console.log("candle live data",data); 
            this.setState({symbolList : this.state.symbolList })

            this.setState({ liveCandleHistory: [...this.state.liveCandleHistory, data] }, () => {
                localStorage.setItem('liveCandleHistory', JSON.stringify(this.state.liveCandleHistory) )
            });
        });
    }

    callbackAfterOrderDone = (order) => {
        console.log("order executed", order);
    }

    // waitAndDoSomething =(FIVE_MIN) => {
    // const msToNextRounded5Min = FIVE_MIN - (Date.now() % FIVE_MIN);
    // console.log(`Waiting ${msToNextRounded5Min/60000} min. to next rounded ${FIVE_MIN}.`,new Date().toLocaleTimeString());
    
    //     setTimeout(() => {
    //         console.log('It is now rounded 5 min', new Date().toLocaleTimeString());
    //         this.calculateCandleVolume(); 
    //         this.waitAndDoSomething(FIVE_MIN);
    //     }, msToNextRounded5Min);
    // }

    storeChartData =()=>{

        let data = {
            dtime : moment( new Date(),'YYYY-MM-DD HH:mm:ss').toString(),
            symbolList : [this.state.symbolList[0]] ,
            analysis: true
        }

        AdminService.saveCandleHistory(data)
        .then((res) => {
            if (res.data) {
                console.log(res.data)
            }
        })
        .catch((reject) => {
        }).finally((ok) => {
        })
    }

    getUpdateIndexData = () => {
        this.setState({ softedIndexList: [] })
        AdminService.allIndicesDirectJSON()
            .then((res) => {

                if (res.data) {

                    var softedData = res.data && res.data.data;
                    softedData.sort(function (a, b) {
                        return b.percChange - a.percChange;
                    });

                    for (let index = 0; index < softedData.length; index++) {
                        const element = softedData[index];
                        var slugName = this.state.sluglist[element.indexName];
                        if (slugName) {
                            this.setState({ softedIndexList: [...this.state.softedIndexList, element] });
                        }
                    }

                    this.makeConnection(this.wsClint)
                    //  this.updateSocketWatch(this.wsClint);
                }
            })
            .catch((reject) => {
                // Notify.showError("All Indices API Failed");
            }).finally((ok) => {
            })
    }

    speckIt = (text) => {
        if (this.state.isSpeek) {
            var msg = new SpeechSynthesisUtterance();
            msg.text = text.toString();
            window.speechSynthesis.speak(msg);
        }
    }

    getPercentageColor = (percent) => {
        percent = percent * 100;
        var r = percent < 50 ? 255 : Math.floor(255 - (percent * 2 - 100) * 255 / 100);
        var g = percent > 50 ? 255 : Math.floor((percent * 2) * 255 / 100);
        return 'rgb(' + r + ',' + g + ',0)';
    }

    onChangeWatchlist = (e) => {
        this.setState({ [e.target.name]: e.target.value }, function () {
            var watchList = this.state.staticData[this.state.selectedWatchlist];

            if (this.state.selectedWatchlist == "gainerList") {
                watchList = localStorage.getItem('gainerList') && JSON.parse(localStorage.getItem('gainerList'));
            }
            if (this.state.selectedWatchlist == "looserList") {
                watchList = localStorage.getItem('looserList') && JSON.parse(localStorage.getItem('looserList'));
            }

            this.setState({ symbolList: watchList }, () => this.updateSocketWatch(this.wsClint));

          //  this.updateDayChartHighLow(); 

          this.updatePreviousVolume(); 
        });
    }
    updateDayChartHighLow= async()=> {

    //    var watchList = this.state.staticData['NIFTY 100']; //NIFTY 100 Securities in F&O
        var watchList = this.state.staticData[this.state.selectedWatchlist];

        for (let index = 0; index < watchList.length; index++) { //watchList.length
            const element = watchList[index];

            const format1 = "YYYY-MM-DD HH:mm";
            let enddate = moment(new Date());
            let startDate = moment(enddate, "DD-MM-YYYY").subtract(7, 'days');

            let found =  this.state.listofHighLow.filter(item => item.symbol == element.symbol); 

            if(found.length == 0){

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
                        
                      
                        let high = candleData[0][2]; 
                        let low = candleData[0][3]; 

                        if(candleData[1][2] > high){
                            high = candleData[1][2];  
                        }
                        if(candleData[1][3] < low){
                            low = candleData[1][3];  
                        }

                        var beginningTime = moment('9:15am', 'h:mma');
                        var endTime = moment('3:30pm', 'h:mma');
                        const friday = 5; // for friday
                        var currentTime = moment(new Date(), "h:mma");
                        const today = moment().isoWeekday();
                        //market hours
                        if (today <= friday && currentTime.isBetween(beginningTime, endTime)) {
                             high = candleData[1][2]; 
                             low = candleData[1][3]; 

                            if(candleData[2][2] > high){
                                high = candleData[2][2];  
                            }
                            if(candleData[2][3] < low){
                                low = candleData[2][3];  
                            }
                            // if(candleData[1]){
                            //     high = candleData[1][2];  
                            //     low = candleData[1][3]; 
                            // }
                          
                        }
                      
    
                        let data = {
                            symbol : element.symbol, 
                            high: high, 
                            low: low, 
                        }
                        
                        this.setState({ listofHighLow: [...this.state.listofHighLow, data] }, function(){
                            console.log("highlow", this.state.listofHighLow)
                            localStorage.setItem("listofHighLow", JSON.stringify(this.state.listofHighLow))
                        });
    
                        // console.log("Open=High", element.symbol, LtpData);                     
                        //var stopLossPrice = LtpData.low - (LtpData.low * TradeConfig.perTradeStopLossPer / 100);
        
                        // if (LtpData.ltp > lastdayinfo[2]) {
                        //    // let stopLossPrice = LtpData.low - (LtpData.low / 10) / 100;
        
                        //     let stopLossPrice = lastdayinfo[3] - (lastdayinfo[3] / 10) / 100;
                        //     stopLossPrice = this.getMinPriceAllowTick(stopLossPrice); //stopLossPrice
                        //     let perTradeExposureAmt = TradeConfig.totalCapital * TradeConfig.perTradeExposurePer / 100;
                        //     let quantity = 1// Math.floor(perTradeExposureAmt / LtpData.ltp);
                        //     console.log(element.symbol + 'ltp ' + LtpData.ltp, "quantity", quantity, "stopLossPrice", stopLossPrice, "perTradeExposureAmt", perTradeExposureAmt);
                        //     var orderOption = {
                        //         transactiontype: 'BUY',
                        //         tradingsymbol: element.symbol,
                        //         symboltoken: element.token,
                        //         buyPrice: 0,
                        //         quantity: quantity,
                        //         stopLossPrice: stopLossPrice
                        //     }
                        //     let mySL = 3.5;
                        //     if (LtpData.ltp >= 200 && LtpData.ltp <= 10000 && stopLossPrice && quantity) {
                        //         this.placeOrderMethod(orderOption);
                        //     }
                        // }
        
                    } else {
                        //localStorage.setItem('NseStock_' + symbol, "");
                        console.log(" candle data emply");
                    }
                })
            }
    
          

            await new Promise(r => setTimeout(r, 310));
        }

       
    }

    updatePreviousVolume= async()=> {

        //    var watchList = this.state.staticData['NIFTY 100']; //NIFTY 100 Securities in F&O
            var watchList = this.state.staticData[this.state.selectedWatchlist];
    
            for (let index = 0; index < watchList.length; index++) { //watchList.length
                const element = watchList[index];
    
                const format1 = "YYYY-MM-DD HH:mm";
                let enddate = moment(new Date());
                let startDate = moment(enddate, "DD-MM-YYYY").subtract(1, 'days');
    
                let found =  this.state.listofHighLow.filter(item => item.symbol == element.symbol); 
    
                if(found.length == 0){
    
                    var data = {
                        "exchange": "NSE",
                        "symboltoken": element.token,
                        "interval": "FIFTEEN_MINUTE", //ONE_DAY FIVE_MINUTE    FIFTEEN_MINUTE
                        "fromdate": moment(startDate).format(format1),
                        "todate": moment(enddate).format(format1) //moment(this.state.endDate).format(format1) /
                    }

            
                    AdminService.getHistoryData(data).then(res => {
                        let histdata = resolveResponse(res, 'noPop');
                        //console.log("candle history", histdata); 
                        if (histdata && histdata.data && histdata.data.length) {
            
                            var candleData = histdata.data;
                            //    console.log("candleData",element, candleData);
                            console.log("history",element.symbol, candleData);

                            let intradayVol = 0; 
                            for (let index = 0; index < candleData.length-1; index++) {
                                const histElement = candleData[index];
                               
                                if(new Date(histElement[0]).getDate() == new Date().getDate()){
                                    intradayVol += histElement[5]; 
                                }
                                
                                var data = {
                                    s: element.symbol, 
                                    t: new Date(histElement[0]).toLocaleTimeString("en-GB", { hour: "2-digit",minute: "2-digit"}), 
                                    v: intradayVol, 
                                    cv: histElement[5], 
                                    p: histElement[4], 
                                    ch:0
                                }
                                                    
                                this.setState({ liveCandleHistory: [...this.state.liveCandleHistory, data] }, () => {
                                    localStorage.setItem('liveCandleHistory', JSON.stringify(this.state.liveCandleHistory) )
                                });
                                
                            }

                          

                        } else {
                            //localStorage.setItem('NseStock_' + symbol, "");
                            console.log(" candle data emply");
                        }
                    })
                }
        
              
    
                await new Promise(r => setTimeout(r, 310));
            }
    
           
        }
    sortByColumn = (type) => {
        this.state.symbolList.sort(function (a, b) {
            return b[type] - a[type];
        });
        this.setState({ symbolList: this.state.symbolList, sortedType: type });
    }

    // checkLiveBids = async () => {
    //     var watchList = this.state.staticData[this.state.selectedWatchlist];
    //     this.setState({ symbolList: watchList});
    // }
    // getLTP = (symbol, token) => {
    //     var data = {
    //         "exchange": "NSE",
    //         "tradingsymbol": symbol,
    //         "symboltoken": token,
    //     }
    //     AdminService.getLTP(data).then(res => {
    //         let data = resolveResponse(res, 'noPop');
    //         var LtpData = data && data.data;

    //         if (LtpData && LtpData.ltp)
    //             this.setState({ InstrumentPerChange: ((LtpData.ltp - LtpData.close) * 100 / LtpData.close) });
    //     })
    // } 

    convertToDecimal = (num) => {
        if (!isNaN(num)) {

            return num.toFixed(2);
        } else {
            return num;
        }
    }


    convertToFloat = (str) => {
        if (!isNaN(str)) {
            return "(" + ((str / 100000).toFixed(2)) + "L)";
        }
    }
    onInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value }, function () {
            //    console.log("time", this.state.timeFrame);
            this.showStaticChart();
        });
    }
    handleKeyDown = (e, token) => {

        console.log("key", e, token);
        //38 for down and 40 for up key
        if (e.keyCode === 38 && this.state.cursor > 0) {
            this.setState(prevState => ({ cursor: prevState.cursor - 1 }));
        } else if (e.keyCode === 40 && this.state.cursor < this.state.symbolList.length - 1) {
            this.setState(prevState => ({ cursor: prevState.cursor + 1 }))
        }

        setTimeout(() => {
            this.showStaticChart();
        }, 100);

    }
    handleChange = (event) => {

        localStorage.setItem('isSpeek', event.target.checked);
        this.setState({ isSpeek: event.target.checked }, () => {
            console.log("isSpeek", this.state.isSpeek, event.target.checked);
        })

    };
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
    showStaticChart = (token, symbol) => {

        //console.log('token, symbol', token, symbol)

        if (token)
            this.setState({ chartStaticData: '', lightChartSymbol: symbol, token: token }, function () {
                console.log('reset done', token);
            });

        const format1 = "YYYY-MM-DD HH:mm";
        let beginningTime = moment('9:15am', 'h:mma');

        if (this.state.timeFrame == 'ONE_MINUTE') {
            var time = moment.duration("00:60:00");
            beginningTime = moment(new Date()).subtract(time);
        }

        if (this.state.candleHistoryFlag) {
            var time = moment.duration("1000:00:00");
            if (this.state.timeFrame == 'ONE_MINUTE')
                time = moment.duration("100:00:00");
            beginningTime = moment(new Date()).subtract(time);
        }

        var data = {
            "exchange": "NSE",
            "symboltoken": token || this.state.token,
            "interval": this.state.timeFrame, //ONE_DAY FIVE_MINUTE 
            "fromdate": moment(beginningTime).format(format1),
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
                //   console.log(token, "Bolinger band", input, bb);

                var bb = BollingerBands.calculate(input);
                //  console.log(token, "Bolinger band", input, bb);

                var inputRSI = { values: closeingData, period: 14 };
                var rsiValues = RSI.calculate(inputRSI);

              //  console.log(token, "Rsi", inputRSI, rsiValues);
                // console.log(token, "vwap", vwapdata, vwap(vwapdata));


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
                                string += " O: <b>" + elem[1].open + "</b>";
                                string += " H: <b>" + elem[1].high + "</b>";
                                string += " L: <b>" + elem[1].low + "</b>";
                                string += " C: <b>" + elem[1].close + "</b>";
                                change = (elem[1].close - elem[1].open) * 100 / elem[1].open;
                                string += " Chng: <b>" + change.toFixed(2) + '%</b>';
                            } else {
                                string += " &nbsp; " + elem[1].toFixed(2) + " ";
                            }
                        }

                        if (param.time)
                            string += " T: <b>" + new Date(param.time).toLocaleString() + "</b>";
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
                    this.setState({ downMoveCount: downMoveCount, upsideMoveCount: upsideMoveCount });
                }
            }
        })


    }

    render() {

        // if(this.state.softedIndexList.length == 0)  {
        //     this.setState({softedIndexList  : this.state.totalWatchlist})
        // }
        //console.log("symbolList",this.state.symbolList)

        return (
            <React.Fragment>
                <PostLoginNavBar LoadSymbolDetails={this.LoadSymbolDetails} />
                {/* <ChartDialog /> */}
                <Grid direction="row" container>

                

                    <Grid item xs={12} sm={6} >

                        <Paper style={{ padding: "10px" }} >

                            <Grid justify="space-between"
                                container spacing={1}>




                                <Grid item xs={8} sm={6} >
                                    <FormControl style={styles.selectStyle} >
                                        <InputLabel htmlFor="gender">Select Watchlist</InputLabel>
                                        <Select value={this.state.selectedWatchlist} name="selectedWatchlist" onChange={this.onChangeWatchlist}>
                                            {/* <MenuItem value={"selectall"}>{"Select All"}</MenuItem> */}
                                            <MenuItem value={"gainerList"}>{"Gainer List (" + this.state.gainerList.length + ")"}</MenuItem>
                                             <MenuItem value={"looserList"}>{"Looser List (" + this.state.looserList.length + ")"}</MenuItem>
                                            {this.state.softedIndexList && this.state.softedIndexList.map(element => (
                                                <MenuItem style={{ color: element.percChange > 0 ? "green" : "red" }} value={element.indexName}>{element.indexName} ({element.percChange}%)</MenuItem>
                                            ))
                                            }
                                            {/* {this.state.totalWatchlist && this.state.totalWatchlist.map(element => (
                                                <MenuItem value={element}>{element}</MenuItem>
                                            ))
                                            } */}
                                            <MenuItem value={"Securities in F&O"}>{"Securities in F&O"}</MenuItem>


                                        </Select>
                                    </FormControl>

                                </Grid>
                                <Grid item xs={4} sm={3} >
                                    <Button variant="" style={{ marginRight: '20px' }} onClick={() => this.getUpdateIndexData()}>Refresh</Button>

                                </Grid>


                                <Grid item xs={4} sm={3} >
                                    <FormControl style={styles.selectStyle} >
                                        <InputLabel htmlFor="candleHistoryFlag">Candle History</InputLabel>
                                        <Select value={this.state.candleHistoryFlag} name="candleHistoryFlag" onChange={this.onChangeWatchlist}>

                                            <MenuItem value={true}>{"Yes"}</MenuItem>
                                            <MenuItem value={false}>{"No"}</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>



                                {/* <Grid item xs={12} sm={3} >
                                    <Button variant="contained" style={{ marginRight: '20px' }} onClick={() => this.getUpdateIndexData()}>Refresh</Button>
                                    
                                       <FormGroup>
                                        <FormControlLabel
                                        control={<Switch checked={this.state.isSpeek} onChange={this.handleChange} aria-label="Speek ON/OFF" />}
                                        label={this.state.isSpeek ? 'Speak Yes'  : 'Speak No'}
                                        />
                                    </FormGroup>
                                </Grid> */}

                                {/* <Grid item xs={12} sm={1} >
                                    <Button variant="contained" style={{ marginRight: '20px' }} onClick={() => this.backupData()}>BackUp</Button>
                                </Grid>


                                <Grid item xs={12} sm={1} >
                                    <FormControl style={styles.selectStyle} >
                                        <InputLabel htmlFor="gender">Select Back Date</InputLabel>
                                        <Select value={this.state.backDate} name="backDate" onChange={this.onChangeBackDate}>
                                            <MenuItem value={""}>{"Select Date"}</MenuItem>
                                            {this.state.backupDateList && this.state.backupDateList.map(element => (
                                                <MenuItem value={element}>{element}</MenuItem>
                                            ))
                                            }
                                        </Select>
                                    </FormControl>
                                </Grid> */}



                            </Grid>


                            <Table size="small" style={{ width: "100%" }} aria-label="sticky table" >

                                <TableHead style={{ whiteSpace: "nowrap" }} variant="head">
                                    <TableRow variant="head" >

                                        {/* <TableCell >US Limit</TableCell>
                                        <TableCell >LS Limit</TableCell> */}

                                        {/* <TableCell  ><Button onClick={() => this.sortByColumn("buytosellTime")}>buyTosell(x)</Button>  </TableCell>
                                        <TableCell  ><Button onClick={() => this.sortByColumn("selltobuyTime")}>sellTobuy(x)</Button>  </TableCell> */}

                                        <TableCell  ><Button onClick={() => this.sortByColumn("buytosellTime")}> T B Q</Button>  </TableCell>
                                        <TableCell align="left"><Button onClick={() => this.sortByColumn("pChange")}> Symbol</Button> </TableCell>
                                        {/* <TableCell >VWAP Price</TableCell> */}

                                        <TableCell ><Button onClick={() => this.sortByColumn("selltobuyTime")}> T S Q</Button>  </TableCell>
                                        {/* <TableCell ><Button onClick={() => this.sortByColumn("volume")}> Volume</Button>  </TableCell> */}
                              
                                        <TableCell ><Button onClick={() => this.sortByColumn("volBreakoutCount")}> Volume BC</Button>  </TableCell>
                                        <TableCell ><Button onClick={() => this.sortByColumn("priceVolBreakout")}> Pice+Volue</Button>  </TableCell>


                                    
                                        
                                        {/* <TableCell >Other Details </TableCell>
                                        <TableCell >High Price</TableCell>
                                        <TableCell >Low Price</TableCell> */}

                                        {/* <TableCell ><Button onClick={() => this.sortByColumn("quantityTraded")}> Quantity Traded</Button>  </TableCell> */}
                                        {/* <TableCell  ><Button onClick={() => this.sortByColumn("deliveryQuantity")}> Delivery Quantity</Button>  </TableCell>
                                        <TableCell  ><Button title={"Delivery To Traded Quantity"} onClick={() => this.sortByColumn("deliveryToTradedQuantity")}> Del To Traded Qty%</Button>  </TableCell> */}

                                        {/* <TableCell  ><Button onClick={() => this.sortByColumn("totalTradedVolume")}> Total Traded Volume</Button>  </TableCell> */}
                                        {/* <TableCell  ><Button onClick={() => this.sortByColumn("totalTradedValue")}> Total Traded Value(L)</Button>  </TableCell> */}

                                        {/* <TableCell  >Day Open</TableCell>
                                        <TableCell  >Day High</TableCell>
                                        <TableCell  >Day Low</TableCell>
                                        <TableCell  >Previous Close</TableCell> */}


                                        {/* <TableCell  ><Button onClick={() => this.getDeliveryHistory()}>Delivery History</Button>  </TableCell> */}

                                        {/* 
                                        <TableCell >Best Buy Qty</TableCell>
                                        <TableCell >Best Buy Price</TableCell>
                                        <TableCell >Best Sell Qty</TableCell>
                                        <TableCell >Best Sell Price</TableCell> */}


                                    </TableRow>
                                </TableHead>

                            </Table>
                            <div style={{ overflow: "auto", maxHeight: "350px" }}>
                                <Table size="small" style={{ width: "100%" }} aria-label="sticky table" >
                                    <TableBody>

                                        {this.state.symbolList ? this.state.symbolList.map((row, i) => (
                                            <TableRow selected={this.state.cursor === i ? 'active' : null}
                                                // onKeyDown={(e) => this.handleKeyDown(e)}
                                                style={{ cursor: "pointer" }} hover key={i} onClick={() => this.showStaticChart(row.token, row.name)}>

                                                {/* <TableCell >{row.upperCircuitLimit}</TableCell>
                                            <TableCell >{row.lowerCircuitLimit}</TableCell> */}

                                                {/* <TableCell style={{ background: row.highlightbuy ? "lightgray" : "" }} >
                                                {row.buytosellTime ? row.buytosellTime +" time buy" : ""}
                                            </TableCell>
                                            <TableCell style={{ background: row.highlightsell ? "lightgray" : "" }} >
                                                {row.selltobuyTime ? row.selltobuyTime+" time sell" : ""} 
                                            </TableCell> */}

                                                <TableCell title="total buying bids qty" style={{ background: row.highlightbuy ? "#FFFF00" : "" }}  >
                                                    {/* {row.buybidHistory &&  row.buybidHistory.map(item => (
                                                        <span style={{color: item>0 ? "green" : "red"}}> {item}% </span>
                                                    ))} */}
                                                    {row.buytosellTime ? `${row.buytosellTime}` : ""}x

                                                    {/* &nbsp; {row.totalBuyQuantity}  */}
                                                    <br />
                                                    {this.convertToFloat(row.totalBuyQuantity)}

                                                </TableCell>
                                                <TableCell align="left" style={{ background: this.getPercentageColor(row.pChange) }} >   {i+1}.  {row.name} <br /> {row.ltp} {row.pChange ? `(${row.pChange}%)` : ""} </TableCell>
                                                <TableCell title="Average Price" style={{ height: '25px', background: row.ltp ? row.ltp >= row.averagePrice ? "green" : "red" : "white" }}>AP<br />{row.averagePrice}</TableCell>


                                                <TableCell title="total selling bid qty" style={{ background: row.highlightsell ? "#FFFF00" : "" }}>
                                                    {/* {row.sellbidHistory &&  row.sellbidHistory.map(item => (
                                                        <span style={{color: item>0 ? "green" : "red"}}> {item}% </span>
                                                    ))} */}
                                                    {row.selltobuyTime ? `${row.selltobuyTime}` : ""}x

                                                    {/* &nbsp; {row.totalSellQuantity}  */}
                                                    <br />
                                                    {this.convertToFloat(row.totalSellQuantity)}

                                                </TableCell>
                                                {/* <TableCell title="Open Price">O:{row.openPrice}</TableCell>
                                                <TableCell title="High Price">H:{row.highPrice}</TableCell>
                                                <TableCell title="Low Price" >L:{row.lowPrice}</TableCell>
                                                <TableCell title="volume" >{row.volume}</TableCell> */}

                                                <TableCell title="vbc" > {row.volBreakoutCount ? 'V: '+row.volBreakoutCount : '-'}</TableCell>
                                                <TableCell title="v+P breakout" style={{ background: row.priceVolBreakout ? "#FFFF00" : "" }} > {row.priceVolBreakout ? "VP: Yes": "-"}
                                                {row.dayPriceVolBreakout ? "Day VP" : ''}
                                                </TableCell>


                                                {/* <TableCell >{row.quantityTraded} {this.convertToFloat(row.quantityTraded)}</TableCell> */}
                                                {/* <TableCell >{row.deliveryQuantity} {this.convertToFloat(row.deliveryQuantity)}</TableCell>
                                            <TableCell >{row.deliveryToTradedQuantity}%</TableCell> */}

                                                {/* <TableCell >{row.totalTradedVolume} {this.convertToFloat(row.totalTradedVolume)}</TableCell> */}
                                                {/* <TableCell >{row.totalTradedValue}L</TableCell> */}

                                                {/* <TableCell  >{row.open}</TableCell>
                                                <TableCell  >{row.dayHigh}</TableCell>
                                                <TableCell  >{row.dayLow}</TableCell>
                                                <TableCell  >{row.previousClose}</TableCell> */}

                                                {/* <TableCell style={{ background: "#eceff1" }} >

                                                {row.delHistory && row.delHistory.map(item => (
                                                    <span> {new Date(item.datetime).toLocaleDateString()}  &nbsp;
                                                        <span title={"quantityTraded " + item.quantityTraded}> {(item.quantityTraded / 100000)}L  </span>  &nbsp;
                                                        <span title={"deliveryToTradedQuantity"}> {item.deliveryToTradedQuantity}%  </span>  &nbsp;
                                                        <span title={"deliveryQuantity " + item.deliveryQuantity}> {(item.deliveryQuantity / 100000)}L  </span>  &nbsp;
                                                        <span style={{ color: item.todayChange > 0 ? "green" : "red" }}> ({item.todayChange}%)   </span>
                                                        &nbsp;  <br /></span>
                                                ))}

                                            </TableCell> */}

                                                {/* <TableCell >{row.bestbuyquantity}</TableCell>
                                            <TableCell >{row.bestbuyprice}</TableCell>
                                            <TableCell >{row.bestsellquantity}</TableCell>
                                            <TableCell >{row.bestsellprice}</TableCell> */}



                                            </TableRow>
                                        )) : <Spinner />}

                                    </TableBody>


                                </Table>
                            </div>

                            <hr />
                            <Grid item xs={12} sm={12} >
                                {/* <Typography color="primary" gutterBottom>
                                      {this.state.selectedWatchlist} ({this.state.symbolList.length})  
                                      
                                      
                                    </Typography> */}

                                <span>Sorted By:  {this.state.sortedType} </span> <br />
                                <span>Update: {this.state.lastUpdateAction} </span>



                                {/* <input onKeyDown={this.handleKeyDown} /> */}
                            </Grid>

                            <Grid item xs={6} sm={6} >

                                <FormGroup>
                                    <FormControlLabel
                                        control={<Switch checked={this.state.isSpeek} onChange={this.handleChange} aria-label="Speek ON/OFF" />}
                                        label={this.state.isSpeek ? 'Speak Yes' : 'Speak No'}
                                    />
                                </FormGroup>
                            </Grid>



                        </Paper>



                    </Grid>
                    <Grid item xs={12} sm={6}>

                        <Paper style={{ padding: "10px" }}>

                            <Grid style={{ display: "visible" }} spacing={1} direction="row" alignItems="center" container>


                                <Grid item xs={12} sm={12}  >

                                    <Grid spacing={1} direction="row" alignItems="center" container>
                                        <Grid item xs={10} sm={10} >
                                            <Typography> {this.state.lightChartSymbol} {this.state.livePrice} {this.state.livePChange ? `(${this.state.livePChange})` : ""}  </Typography>

                                        </Grid>


                                        <Grid item xs={2} sm={2} >
                                            <FormControl style={styles.selectStyle} style={{ marginTop: '10px' }} >
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
                                    </Grid>




                                    <div id="showChartTitle"></div>
                                    <div id="tvchart"></div>
                                </Grid>

                                <Hidden xsDown>
                                    <Paper style={{ padding: "10px" }} >

                                        <b> Indicator Details </b> <br />

                                        <b> RSI: </b>{this.state.rsiValues && this.state.rsiValues.map((item, j) => (
                                            item >= 60 ? <span style={{ color: 'green', fontWeight: "bold" }}> {item} &nbsp;</span> : <span style={{ color: item <= 40 ? 'red' : "", fontWeight: "bold" }}> {item} &nbsp;</span>
                                        ))}


                                        <br />
                                        <b>Vol:</b> {this.state.valumeData && this.state.valumeData.map((item, j) => (
                                            <span style={{ color: item > this.state.dailyAvgValume ? "green" : "", fontWeight: item > this.state.dailyAvgValume ? "bold" : "" }}> {(item / 100000).toFixed(2)}L &nbsp;</span>
                                        ))}

                                        <br />
                                        {this.state.bblastValue ? <span item xs={12} sm={12} >

                                            <span title="Green color mean price running above upper bb band" style={{ color: this.state.livePrice >= this.state.bblastValue.upper ? "green" : "", fontWeight: "bold" }}>BB Upper: {this.state.bblastValue.upper.toFixed(2)}</span><br />
                                            BB Middle(20 SMA): {this.state.bblastValue.middle.toFixed(2)}<br />
                                            <span title="Green red mean price running below lower bb band" style={{ color: this.state.livePrice <= this.state.bblastValue.lower ? "red" : "", fontWeight: "bold" }}>BB Lower: {this.state.bblastValue.lower.toFixed(2)}</span><br />
                                        </span> : ""}

                                        <span item xs={12} sm={12} style={{ color: this.state.livePrice > this.state.vwapvalue ? "green" : "red", fontWeight: "bold" }}>
                                            VWAP:  {this.state.vwapvalue && this.state.vwapvalue.toFixed(2)}
                                        </span>


                                        <br />  <br />


                                    </Paper>
                                </Hidden>

                                {/* <Grid item xs={12} sm={12} style={{ overflowY: 'scroll', height: "40vh" }} >
                                <Typography> <b> {this.state.lightChartSymbol} </b> </Typography>


                                    <Table size="small" aria-label="sticky table" >
                                        <TableHead style={{ width: "", whiteSpace: "nowrap" }} variant="head">
                                            <TableRow variant="head" style={{ fontWeight: 'bold' }} >

                                                <TableCell className="TableHeadFormat" align="center">Symbol<b style={{ color: '#20d020' }}> UP({this.state.upsideMoveCount})</b> | <b style={{ color: 'red' }}> Down({this.state.downMoveCount})</b> </TableCell>
                                                <TableCell className="TableHeadFormat" align="center">Timestamp</TableCell>
                                                <TableCell className="TableHeadFormat" align="center">Chng% </TableCell>
                                                <TableCell className="TableHeadFormat" align="center">Open</TableCell>
                                                <TableCell className="TableHeadFormat" align="center">High</TableCell>
                                                <TableCell className="TableHeadFormat" align="center">Low</TableCell>
                                                <TableCell className="TableHeadFormat" align="center">Close </TableCell>
                                                <TableCell className="TableHeadFormat" align="center">Volume</TableCell>

                                            </TableRow>
                                        </TableHead>
                                        <TableBody style={{ width: "", whiteSpace: "nowrap" }}>
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
                                </Grid> */}


                            </Grid>
                        </Paper>
                        </Grid>




                </Grid>
            </React.Fragment>
        )


    }


}


const styles = {
    selectStyle: {
        minWidth: '100%',
        marginBottom: '10px'
    }
};

export default LiveBid;

