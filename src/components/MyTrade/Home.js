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
            searchFailed: 0,
            openEqualHighList: [],
            openEqualLowList: [],
            closeingEqualHighList: [],
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
            fastMovementList: localStorage.getItem('fastMovementList') && JSON.parse(localStorage.getItem('fastMovementList')) || [],
            liveBidsList: [], //localStorage.getItem('liveBidsList') && JSON.parse(localStorage.getItem('liveBidsList')) || [],
            gainerList: localStorage.getItem('gainerList') && JSON.parse(localStorage.getItem('gainerList')) || [],
            looserList: localStorage.getItem('looserList') && JSON.parse(localStorage.getItem('looserList')) || [],
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
            declineShareCount: 0, UnchangeShareCount: 0, volumeCrossedList: [], closeingEqualHighList: []
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
                    this.state.symbolList[index].nc = change;

                    if (LtpData && LtpData.open == LtpData.low) {
                        console.log("o=l", LtpData);
                        var isfound = this.state.openEqualLowList.filter(row => row.symboltoken == element.token);
                        if (!isfound.length)
                            this.setState({ openEqualLowList: [...this.state.openEqualLowList, LtpData] });
                    }
                    console.log(element.symbol, "ltp=newhigh", LtpData.ltp, (LtpData.high - LtpData.high * 0.5 / 100));

                    if (LtpData && LtpData.ltp >= (LtpData.high - LtpData.high * 0.5 / 100)) {
                        var isfound = this.state.closeingEqualHighList.filter(row => row.symboltoken == element.token);
                        if (!isfound.length)
                            this.setState({ closeingEqualHighList: [...this.state.closeingEqualHighList, LtpData] });
                    }

                    if (LtpData && LtpData.open == LtpData.high) {
                        console.log("o=h", LtpData);
                        var isfound = this.state.openEqualHighList.filter(row => row.symboltoken == element.token);
                        if (!isfound.length)
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
        const chart = createChart(domElement, { width: 600, height: 400, timeVisible: true, secondsVisible: true, });
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
                var fastMovementList = localStorage.getItem('fastMovementList') && JSON.parse(localStorage.getItem('fastMovementList'));
                fastMovementList && fastMovementList.length && fastMovementList.reverse();
                this.setState({ fastMovementList: fastMovementList })
            }, 1000);

            setInterval(() => {
                this.checkSlowMotionCheckLive();
            }, 5 * 75000);


            setInterval(() => {
                this.searchValumeBreakoutStock();
            }, 15 * 75000);


            var tostartInteral = setInterval(() => {
                var time = new Date();
                console.log("setinterval ", new Date().toLocaleString());
                if (time.getMinutes() % 60 === 0) {
                    setTimeout(() => {
                        this.oneHourBullBearCheck();
                    }, 90000);
                    setInterval(() => {
                        this.oneHourBullBearCheck();
                    }, 60000 * 60 + 70000);
                    clearInterval(tostartInteral);
                }
            }, 1000);

        }


        setInterval(() => {


            this.setState({ gainerList: localStorage.getItem('gainerList') && JSON.parse(localStorage.getItem('gainerList')) })
            this.setState({ looserList: localStorage.getItem('looserList') && JSON.parse(localStorage.getItem('looserList')) })


        }, 1000);

        //  this.oneHourBullBearCheck(); 

        // this.checkLiveBids();

    }

    // shouldComponentUpdate(nextProps, nextState){
    //     return  false //!equals(nextProps, this.props); // equals() is your implementation
    // }


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
                console.log("name % token", name, token);
                this.setState({ tradingsymbol: watchList[index].symbol, symboltoken: watchList[index].token }, function () {
                    this.setState({ cursor: i }, function () {
                        this.showStaticChart(token);
                        // this.getLTP();
                        // this.dailyBasisInfoCheck(this.state.symboltoken);
                    });
                });
                break;
            } else {
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

                    if (element) {
                        var per = (element[4] - element[1]) * 100 / element[1];

                        if (per >= 0.4) {
                            bigCandleCount += 1;
                            console.log(stock.symbol, per, element[0]);

                        }
                        if (per <= -0.4) {
                            bigCandleCount += 1;
                            console.log(stock.symbol, per, element[0]);

                        }
                    }
                }
                console.log("Totalcount", stock.symbol, bigCandleCount);
                if (bigCandleCount <= 15) {

                    stock.bigCandleCount = bigCandleCount;

                    this.setState({ slowMotionStockList: [...this.state.slowMotionStockList, stock] }, function () {
                        localStorage.setItem("slowMotionStockList", JSON.stringify(this.state.slowMotionStockList));
                    });
                }
            }

        });
    }

    checkSlowMotionCheckLive = async () => {

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

                    for (let index = candleDatad.length - 3; index < candleDatad.length; index++) {
                        const element = candleDatad[index];

                        if (element) {

                            var per = (element[4] - element[1]) * 100 / element[1];
                            if (per >= 0.7) {
                                bigCandleCount += 1;
                            }
                            if (per >= 0) {
                                bullishCount += 1;
                            }

                        }
                    }
                    if (bigCandleCount >= 1) {
                        row.highlisht = true;
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

    checkLiveBids = async () => {

        for (let index = 0; index < this.state.symbolList.length; index++) {
            const row = this.state.symbolList[index];

            AdminService.checkLiveBids(row.name).then(resd => {
                // let histdatad = resolveResponse(resd, 'noPop');

                console.log("bid", resd.data.data);

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

                if (resd.data && resd.data.data.length) {

                    let bidlivedata = resd.data.data[0];
                    let biddata = {
                        totalBuyQuantity: bidlivedata.totalBuyQuantity,
                        totalSellQuantity: bidlivedata.totalSellQuantity,
                        deliveryToTradedQuantity: bidlivedata.deliveryToTradedQuantity,
                        symbol: bidlivedata.symbol,
                        orderType: bidlivedata.totalBuyQuantity + "|" + bidlivedata.totalSellQuantity,
                        nc: bidlivedata.pChange,
                        ltp: bidlivedata.lastPrice,
                    }

                    this.setState({ liveBidsList: [...this.state.liveBidsList, biddata] }, function () {

                        localStorage.setItem("liveBidsList", JSON.stringify(this.state.liveBidsList));
                    });


                }

            });
            await new Promise(r => setTimeout(r, 100));
        }

    }


    oneHourBullBearCheck = async () => {

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
                    if (candleDatad.length > 1) {
                        lastCandle = candleDatad[candleDatad.length - 2];
                    } else {
                        lastCandle = candleDatad[candleDatad.length - 1];
                    }



                    if ((lastCandle[1] == lastCandle[3]) && (lastCandle[2] == lastCandle[4])) {
                        window.document.title = "Hourly Buy: " + row.symbol;
                        console.log(row.name, "Hourly Buy", candleDatad[candleDatad.length - 1]);
                        row.orderType = " Hourly Buy";
                        row.foundAt = new Date(candleDatad[candleDatad.length - 1][0]).toLocaleString()
                        this.speckIt(row.name + " Hourly Bullish ");
                        this.setState({ oneHourBullBearCheckList: [...this.state.oneHourBullBearCheckList, row] });
                    }
                    if ((lastCandle[1] == lastCandle[2]) && (lastCandle[3] == lastCandle[4])) {
                        window.document.title = "Hourly Sell: " + row.symbol;
                        console.log(row.name, "Hourly Sell", candleDatad[candleDatad.length - 1]);
                        row.orderType = " Hourly Sell";
                        row.foundAt = new Date(candleDatad[candleDatad.length - 1][0]).toLocaleString()
                        this.speckIt(row.name + " Hourly Sell ");
                        this.setState({ oneHourBullBearCheckList: [...this.state.oneHourBullBearCheckList, row] });
                    }

                }

            });
            await new Promise(r => setTimeout(r, 310));
        }

    }


    searchValumeBreakoutStock = async () => {

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

                    var volumeSum = 0, findmaxVol = candleDatad[0][5];
                    let currentCandleVol = candleDatad[candleDatad.length - 1][5];
                    let firstCandleCloseingPrice = candleDatad[0][4], priceGoingHighCount = 0;
                    let firstCandleCloseingPriceDownSide = candleDatad[0][4], priceGoingLowCount = 0;

                    for (let index = candleDatad.length - 6; index < candleDatad.length - 1; index++) {
                        const element = candleDatad[index];
                        if (element) {
                            volumeSum += element[5];
                            //  console.log(row.symbol, ' last candle index ',index,   element[0] );
                            if (findmaxVol < element[5]) {
                                findmaxVol = element[5];
                            }

                            if (firstCandleCloseingPrice < element[4]) {
                                console.log(row.symbol, firstCandleCloseingPrice, 'upside last candle index ', index, element[4]);
                                firstCandleCloseingPrice = element[4];
                                priceGoingHighCount += 1;
                            }

                            if (element[4] < firstCandleCloseingPriceDownSide) {
                                console.log(row.symbol, firstCandleCloseingPrice, ' downside last candle index ', index, element[4]);
                                firstCandleCloseingPriceDownSide = element[4];
                                priceGoingLowCount += 1;
                            }
                        }


                    }
                    let avgVol = volumeSum / 5;

                    if (currentCandleVol / findmaxVol > 1.75 && priceGoingHighCount >= 4) {
                        window.document.title = "VB: " + row.symbol;
                        row.orderType = " Vol " + (currentCandleVol / findmaxVol).toFixed(2) + " Time & price incresing";
                        row.foundAt = new Date(candleDatad[candleDatad.length - 1][0]).toLocaleString()
                        console.log(row.name + " volume crossed " + (currentCandleVol / findmaxVol).toFixed(2) + " time of average ", avgVol, currentCandleVol, candleDatad[candleDatad.length - 1][0], findmaxVol);
                        this.speckIt(row.name + " volume crossed " + (currentCandleVol / findmaxVol).toFixed(2) + " Time and price incresing");
                        this.setState({ volumeBreakoutlast5CandleList: [...this.state.volumeBreakoutlast5CandleList, row] });
                    }
                    if (currentCandleVol / findmaxVol > 1.75 && priceGoingLowCount >= 4) {
                        window.document.title = "VB: " + row.symbol;
                        row.orderType = " Vol " + (currentCandleVol / findmaxVol).toFixed(2) + " Time & price decresing";
                        row.foundAt = new Date(candleDatad[candleDatad.length - 1][0]).toLocaleString()
                        console.log(row.name + " volume crossed " + (currentCandleVol / findmaxVol).toFixed(2) + " time of average ", avgVol, currentCandleVol, candleDatad[candleDatad.length - 1][0], findmaxVol);
                        this.speckIt(row.name + " volume crossed " + (currentCandleVol / findmaxVol).toFixed(2) + " Time and price decresing ");
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
                    if (element) {
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
                <PostLoginNavBar LoadSymbolDetails={this.LoadSymbolDetails} />
                <ChartDialog />
                <Grid direction="row" container spacing={1} style={{ padding: "5px" }} >

                    <Grid item xs={12} sm={2}>

                        <WatchListTab style={{ position: 'fixed' }} data={{ gainerList: this.state.gainerList, looserList: this.state.looserList, LoadSymbolDetails: this.LoadSymbolDetails, cursor: this.state.cursor, symbolList: this.state.symbolList, totalWatchlist: this.state.totalWatchlist, onChangeWatchlist: this.onChangeWatchlist, selectedWatchlist: this.state.selectedWatchlist, search: this.state.search, handleKeyDown: this.handleKeyDown, onChange: this.onChange, autoSearchList: this.state.autoSearchList, onSelectItem: this.onSelectItem, symbolList: this.state.symbolList, LoadSymbolDetails: this.LoadSymbolDetails, deleteItemWatchlist: this.deleteItemWatchlist }} />


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


                                    <Grid item xs={12} sm={12} style={{ overflowY: 'scroll', maxHeight: "50vh" }} >


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

                                <Grid item xs={12} sm={12} style={{ height: '100%', overflow: "auto" }}>
                                    <OrderWatchlist />
                                </Grid>




                            </Grid>
                        </Paper>
                        <br />

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

