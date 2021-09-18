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
import TradeConfig from './TradeConfig.json';
import ChartDialog from './ChartDialog';
import ChartMultiple from './ChartMultiple';
import RefreshIcon from '@material-ui/icons/Refresh';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import Notify from "../../utils/Notify";
import ShowChartIcon from '@material-ui/icons/ShowChart';
import Parser from 'html-react-parser';
import Spinner from "react-spinner-material";

import ReactApexChart from "react-apexcharts";
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { SMA, RSI, VWAP, BollingerBands } from 'technicalindicators';
import vwap from 'vwap';
import CommonOrderMethod from "../../utils/CommonMethods";
import LightChart from "./LightChart";
import LightChartCom from "./LightChartCom";


class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            staticData: localStorage.getItem('staticData') && JSON.parse(localStorage.getItem('staticData')) || {},
            totalWatchlist: localStorage.getItem('totalWatchlist') && JSON.parse(localStorage.getItem('totalWatchlist')) || [],
            selectedWatchlist: "NIFTY 50",
            totalStockToWatch: 0,
            timeFrame: "FIFTEEN_MINUTE",
            chartStaticData: [],
            BBBlastType : "BBBlastOnly",

        };
        this.findlast5minMovement = this.findlast5minMovement.bind(this);
        this.startSearching = this.startSearching.bind(this);
    }


    componentDidMount() {

        window.document.title = "Fast Movement";

        var watchList = this.state.staticData[this.state.selectedWatchlist];
        this.setState({ totalStockToWatch: watchList.length });

        // this.findlast5minMovement(); //one time only
        //   this.startSearching();


        var beginningTime = moment('9:15am', 'h:mma');
        var endTime = moment('3:30pm', 'h:mma');
        const friday = 5; // for friday
        var currentTime = moment(new Date(), "h:mma");
        const today = moment().isoWeekday();

        var tostartInteral = setInterval(() => {
            var time = new Date();
            console.log("set interval 1sec min/10==0 ", time.toLocaleTimeString());
            if (time.getMinutes() % 5 === 0) {
                console.log("search method call in with setTimeout 70sec", time.toLocaleTimeString());

                setTimeout(() => {
                    this.find10MinBBBlast();
                }, 70000);
                this.setState({
                    stop10bbSearch:
                        setInterval(() => {
                            console.log("search method call in with setInterval in 10min", time.toLocaleTimeString());
                            if (today <= friday && currentTime.isBetween(beginningTime, endTime)) {
                                this.find10MinBBBlast();
                            }
                        }, 60000 * 5 + 70000)
                });

                clearInterval(tostartInteral);
            }
        }, 1000);



    }


    stopSearching = () => {
        console.log("stop the search")
        clearInterval(this.state.findlast5minMovementInterval);
        clearInterval(this.state.stop10bbSearch);

    }


    showCandleChart = (candleData, symbol, ltp, perChange) => {
        localStorage.setItem('candleChartData', JSON.stringify(candleData))
        localStorage.setItem('cadleChartSymbol', symbol)
        localStorage.setItem('candlePriceShow', ltp);
        localStorage.setItem('candleChangeShow', perChange.toFixed(2));
        document.getElementById('showCandleChart').click();
    }

    speckIt = (text) => {
        var msg = new SpeechSynthesisUtterance();
        msg.text = text.toString();
        window.speechSynthesis.speak(msg);
    }
    componentWillUnmount() {
        clearInterval(this.state.findlast5minMovementInterval);
        clearInterval(this.state.stop10bbSearch);
        // clearInterval(this.state.scaninterval);
        //  clearInterval(this.state.bankNiftyInterval); 
    }

    onChangeWatchlist = (e) => {
        clearInterval(this.state.findlast5minMovementInterval);
        this.setState({ [e.target.name]: e.target.value }, function () {
            // this.findlast5minMovement(); //one time only
            //this.startSearching();
            this.find10MinBBBlast();

        });
    }

    startSearching = () => {

        console.log("Starting the search");

        var beginningTime = moment('9:15am', 'h:mma');
        var endTime = moment('3:30pm', 'h:mma');
        const friday = 5; // for friday
        var currentTime = moment(new Date(), "h:mma");
        const today = moment().isoWeekday();
        //market hours

        if (today <= friday && currentTime.isBetween(beginningTime, endTime)) {
            var intervaltime = 60000;
            if (this.state.totalStockToWatch > 180) {
                intervaltime = this.state.totalStockToWatch * 333;
            }
            this.setState({ findlast5minMovementInterval: setInterval(() => { this.findlast5minMovement(); }, intervaltime) });
        }
    }

    getTimeFrameValue = (timeFrame) => {

        //18 HOURS FOR BACK 1 DATE BACK MARKET OFF

        switch (timeFrame) {
            case 'ONE_MINUTE':
                if (new Date().toLocaleTimeString() < "10:05:00")
                    return "18:21:00";
                else
                    return "00:21:00";
                break;
            case 'FIVE_MINUTE':
                if (new Date().toLocaleTimeString() < "11:00:00")
                    return "19:41:00";
                else
                    return "01:41:00";
                break;
            case 'TEN_MINUTE':
                if (new Date().toLocaleTimeString() < "12:35:00")
                    return "21:21:00";
                else
                    return "03:21:00";
                break;
            case 'FIFTEEN_MINUTE':
                if (new Date().toLocaleTimeString() < "14:15:00")
                    return "23:01:00";
                else
                    return "05:01:00";
                break;
            case 'THIRTY_MINUTE':
                return "84:01:00";
                break;
            case 'ONE_HOUR':
                return "168:01:00";
                break;
            case 'ONE_DAY':
                return "744:01:00";
                break;
            default:
                break;
        }
    }


    find10MinBBBlast = async () => {

        this.setState({ findlast5minMovementUpdate: '', findlast5minMovement: [] });
        var watchList = this.state.staticData[this.state.selectedWatchlist];
        if (this.state.selectedWatchlist == "selectall") {
            watchList = localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList'));
        }

        this.setState({ totalStockToWatch: watchList.length })


        var foundData = [];

        for (let index = 0; index < watchList.length; index++) {

            this.setState({ findlast5minMovementUpdate: index + 1 + ". " + watchList[index].symbol + " At " + new Date().toLocaleTimeString() });

            const format1 = "YYYY-MM-DD HH:mm";
            var beginningTime = moment('9:15am', 'h:mma').format(format1);

            let timeDuration = this.getTimeFrameValue(this.state.timeFrame);
            var time = moment.duration("50:00:00");  //22:00:00" for last day  2hours  timeDuration
            var startDate = moment(new Date()).subtract(time);

            var data = {
                "exchange": watchList[index].exch_seg,
                "symboltoken": watchList[index].token,
                "interval": this.state.timeFrame, //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
                "fromdate": moment(startDate).format(format1),
                "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
            }

            AdminService.getHistoryData(data).then(res => {
                let histdata = resolveResponse(res, 'noPop');
                // console.log("candle history", histdata);

                if (histdata && histdata.data && histdata.data.length) {

                    var candleData = histdata.data;
                    var candleChartData = [],lightcandleChartData=[], vwapdata = [], closeingData = [], highData = [], lowData = [], openData = [], valumeData = [], bbdata = [];
                    candleData.forEach((element, loopindex) => {
                        candleChartData.push([element[0], element[1], element[2], element[3], element[4]]);

                        var time = { year: new Date(element[0]).getFullYear() ,month: new Date(element[0]).getMonth() ,day: new Date(element[0]).getDate() }
                      
                    //    { time: '2018-10-24', open: 178.58, high: 182.37, low: 176.31, close: 176.97 },
                        lightcandleChartData.push({
                            x: new Date(element[0]).getTime(),
                            y:  (element[2] + element[3] + element[4]) / 3
                          });
                           
                        vwapdata.push([element[5], (element[2] + element[3] + element[4]) / 3]);
                        closeingData.push(element[4]);
                        highData.push(element[2]);
                        lowData.push(element[3]);
                        openData.push(element[3]);
                        valumeData.push(element[5]);
                        bbdata.push((element[2] + element[3] + element[4]) / 3);

                    });

                   // { time: '2018-10-19', value: 19103293.00, color: 'rgba(0, 150, 136, 0.8)' },

                    var sma = SMA.calculate({ period: 20, values: closeingData });
                    console.log(watchList[index].symbol, "SMA", sma);


                    var inputRSI = { values: closeingData, period: 14 };
                    var lastRsiValue = RSI.calculate(inputRSI);

                    console.log(watchList[index].symbol, "Rsi", inputRSI, lastRsiValue);
                    console.log(watchList[index].symbol, "vwap", vwapdata, vwap(vwapdata));


                    var inputVWAP = {
                        open: openData,
                        high: highData,
                        low: lowData,
                        close: closeingData,
                        volume: valumeData
                    };

                    var input = {
                        period: 20,
                        values: bbdata,
                        stdDev: 2

                    }

                    var bb = BollingerBands.calculate(input);
                    console.log(watchList[index].symbol, "Bolinger band", input, bb);


                    var bbvlastvalue = bb[bb.length - 1];
                    if (bbvlastvalue) {
                        bbvlastvalue.upper = bbvlastvalue.upper.toFixed(2);
                        bbvlastvalue.middle = bbvlastvalue.middle.toFixed(2);
                        bbvlastvalue.lower = bbvlastvalue.lower.toFixed(2);

                    }
                    var dataltp = {
                        "exchange": "NSE",
                        "tradingsymbol": watchList[index].symbol,
                        "symboltoken": watchList[index].token,
                    }

                    AdminService.getLTP(dataltp).then(res => {
                        let data = resolveResponse(res, 'noPop');
                        var LtpData = data && data.data;
                        //console.log(LtpData);
                        if (LtpData && LtpData.ltp) {


                            lastRsiValue = lastRsiValue.slice((lastRsiValue.length - 6), lastRsiValue.length);

                            var upsidecount = 0, downsidecount = 0, startingRsiupside = lastRsiValue[2], startingRsiDownside = lastRsiValue[2];
                            lastRsiValue.forEach((element, i) => {
                                if (i > 2 && element >= 55 && element <= 65) {
                                    if (startingRsiupside <= element) {
                                        startingRsiupside = element;
                                        upsidecount += 1;
                                    }
                                }

                                if (i > 2 && element >= 35 && element <= 45) {
                                    if (element <= startingRsiDownside) {
                                        startingRsiDownside = element;
                                        downsidecount += 1;
                                    }
                                }
                            });



                            console.log(watchList[index].symbol, "last continue rsi", upsidecount);
                            this.setState({ findlast5minMovementUpdate: index + 1 + ". " + watchList[index].symbol + " At " + new Date().toLocaleTimeString() + " RSI rising :" + upsidecount });
                            if (upsidecount >= 1 || downsidecount >= 1) {
                                if (this.state.BBBlastType == 'BBBlastOnly') {
                                    if (bbvlastvalue && LtpData.ltp >= bbvlastvalue.upper) {
                                        var perChange = (LtpData.ltp - LtpData.close) * 100 / LtpData.close;
                                        foundData.push({
                                            symbol: watchList[index].symbol,
                                            token: watchList[index].token,
                                            ltp: LtpData.ltp,
                                            perChange: perChange,
                                            RSIValue: lastRsiValue[lastRsiValue.length - 1],
                                            RSI: lastRsiValue,
                                            VWAP: vwap(vwapdata),
                                            BB: bbvlastvalue,
                                            candleChartData: candleChartData,
                                            lightcandleChartData: lightcandleChartData
                                        })
                                        this.setState({ findlast5minMovement: foundData });
                                        this.speckIt(watchList[index].symbol + ' BB  buy');
                                        window.document.title = "FM: Buy " + watchList[index].symbol;

                                    }
                                    if (bbvlastvalue && LtpData.ltp <= bbvlastvalue.lower) {
                                        var perChange = (LtpData.ltp - LtpData.close) * 100 / LtpData.close;
                                        foundData.push({
                                            symbol: watchList[index].symbol,
                                            token: watchList[index].token,
                                            ltp: LtpData.ltp,
                                            perChange: perChange,
                                            RSIValue: lastRsiValue[lastRsiValue.length - 1],
                                            RSI: lastRsiValue,
                                            VWAP: vwap(vwapdata),
                                            BB: bbvlastvalue,
                                            candleChartData: candleChartData,
                                            lightcandleChartData: lightcandleChartData
                                        })
                                        this.setState({ findlast5minMovement: foundData });
                                        this.speckIt(watchList[index].symbol + ' BB sell');
                                        window.document.title = "FM: Sell " + watchList[index].symbol;
                                    }
                                } else {

                                    let timeDuration = this.getTimeFrameValue('ONE_DAY');
                                    var time = moment.duration(timeDuration);  //22:00:00" for last day  2hours 
                                    var startDateforDaily = moment(new Date()).subtract(time);
                                    var dataDay = {
                                        "exchange": watchList[index].exch_seg,
                                        "symboltoken": watchList[index].token,
                                        "interval": 'ONE_DAY',
                                        "fromdate": moment(startDateforDaily).format(format1),
                                        "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
                                    }
                                    AdminService.getHistoryData(dataDay).then(resd => {
                                        let histdatad = resolveResponse(resd, 'noPop');
                                        var DSMA = '';
                                        if (histdatad && histdatad.data && histdatad.data.length) {
                                            var candleDatad = histdatad.data;
                                            var closeingDatadaily = [];
                                            candleDatad.forEach((element, loopindex) => {
                                                closeingDatadaily.push(element[4]);
                                            });

                                            DSMA = SMA.calculate({ period: 20, values: closeingDatadaily });

                                            var DSMALastValue = DSMA && DSMA[DSMA.length - 1];
                                            console.log(watchList[index].symbol, "DSMA", DSMALastValue);

                                            if (LtpData.ltp > DSMALastValue && bbvlastvalue && LtpData.ltp >= bbvlastvalue.upper) {
                                                var perChange = (LtpData.ltp - LtpData.close) * 100 / LtpData.close;
                                                foundData.push({
                                                    symbol: watchList[index].symbol,
                                                    token: watchList[index].token,
                                                    ltp: LtpData.ltp,
                                                    perChange: perChange,
                                                    RSIValue: lastRsiValue[lastRsiValue.length - 1],
                                                    RSI: lastRsiValue,
                                                    VWAP: vwap(vwapdata),
                                                    BB: bbvlastvalue,
                                                    DSMALastValue: DSMALastValue,
                                                    candleChartData: candleChartData,
                                                    lightcandleChartData: lightcandleChartData
                                                    
                                                })
                                                this.setState({ findlast5minMovement: foundData });
                                                this.speckIt(watchList[index].symbol + ' BB  buy');
                                                window.document.title = "FM: Buy " + watchList[index].symbol;

                                            }
                                            if (LtpData.ltp < DSMALastValue && bbvlastvalue && LtpData.ltp <= bbvlastvalue.lower) {
                                                var perChange = (LtpData.ltp - LtpData.close) * 100 / LtpData.close;
                                                foundData.push({
                                                    symbol: watchList[index].symbol,
                                                    token: watchList[index].token,
                                                    ltp: LtpData.ltp,
                                                    perChange: perChange,
                                                    RSIValue: lastRsiValue[lastRsiValue.length - 1],
                                                    RSI: lastRsiValue,
                                                    VWAP: vwap(vwapdata),
                                                    BB: bbvlastvalue,
                                                    DSMALastValue: DSMALastValue,
                                                    candleChartData: candleChartData,
                                                    lightcandleChartData: lightcandleChartData
                                                })
                                                this.setState({ findlast5minMovement: foundData });
                                                this.speckIt(watchList[index].symbol + ' BB sell');
                                                window.document.title = "FM: Sell " + watchList[index].symbol;
                                            }
                                        }


                                    });

                                }


                            }






                        }

                    })









                } else {
                    //localStorage.setItem('NseStock_' + symbol, "");
                    console.log(watchList[index].symbol, "  emply candle found");
                }
            })

            await new Promise(r => setTimeout(r, 600));
        }



    }


    findlast5minMovement = async () => {

        this.setState({ findlast5minMovementUpdate: '' });

        var timediff = moment.duration("00:05:00");
        const format1 = "YYYY-MM-DD HH:mm";
        var startdate = moment(new Date()).subtract(timediff);

        var watchList = this.state.staticData[this.state.selectedWatchlist];

        if (this.state.selectedWatchlist == "selectall") {
            watchList = localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList'));
        }
        console.log("watchList", this.state.selectedWatchlist, watchList);

        this.setState({ totalStockToWatch: watchList.length })


        var foundData = [];

        if (watchList && watchList.length) {
            for (let index = 0; index < watchList.length; index++) {
                const element = watchList[index];
                var data = {
                    "exchange": "NSE",
                    "symboltoken": element.token,
                    "interval": "ONE_MINUTE", //ONE_DAY FIVE_MINUTE    FIFTEEN_MINUTE
                    "fromdate": moment(startdate).format(format1),
                    "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
                }

                var updateMsg = index + 1 + ". " + element.symbol;
                this.setState({ findlast5minMovementUpdate: updateMsg });

                window.document.title = "FM: " + updateMsg;

                AdminService.getHistoryData(data).then(res => {
                    let histdata = resolveResponse(res, 'noPop');
                    //console.log("candle history", histdata); 
                    if (histdata && histdata.data && histdata.data.length) {

                        var percentChangeList = []; var foundCount = 0;
                        histdata.data.forEach(element => {
                            var changePer = (element[4] - element[1]) * 100 / element[1];

                            if (changePer >= 0.3) {
                                foundCount = foundCount + 1;
                                percentChangeList.push("<span style='color:green'>" + changePer.toFixed(2) + "% At " + new Date(element[0]).toLocaleTimeString().substr(0, 5) + "</span>")
                            }
                            if (changePer <= -0.3) {
                                foundCount = foundCount + 1;
                                percentChangeList.push("<span style='color:red'>" + changePer.toFixed(2) + "% At " + new Date(element[0]).toLocaleTimeString().substr(0, 5) + "</span>")
                            }

                        });


                        var ttophistCandle = [];
                        histdata.data.forEach(element => {
                            ttophistCandle.push([element[0], element[1], element[2], element[3], element[4]]);
                        });


                        if (percentChangeList.length) {

                            var data = {
                                "exchange": "NSE",
                                "tradingsymbol": watchList[index].symbol,
                                "symboltoken": watchList[index].token,
                            }
                            AdminService.getLTP(data).then(res => {
                                let data = resolveResponse(res, 'noPop');
                                var LtpData = data && data.data;
                                //console.log(LtpData);
                                if (LtpData && LtpData.ltp) {

                                    var perChange = (LtpData.ltp - LtpData.close) * 100 / LtpData.close;
                                    foundData.push({
                                        symbol: watchList[index].symbol,
                                        ltp: LtpData.ltp,
                                        perChange: perChange,
                                        percentChangeList: percentChangeList.join(" | "),
                                        candleChartData: ttophistCandle,
                                    })
                                    console.log("foundData", foundData);
                                    this.setState({ findlast5minMovement: foundData })

                                }

                            })


                        }


                    } else {
                        console.log(" candle data emply");
                    }
                })
                await new Promise(r => setTimeout(r, 333));
            }

        }
    }

    callbackAfterOrderDone = (order) => {
        // setValues({ ...values, ['buyFlag']: order.status });
        // setValues({ ...values, ['sellFlag']:  order.status  });
        //  this.setState({ [spineerId]: order.status}); 


        console.log("order executed", order);

    }



    handleClick = (row, type, spinnerIndex) => {


        console.log(row);
        if (row.token && row.symbol) {
            if (type == 'BUY') {
                this.setState({ [spinnerIndex]: true });
                var symbolInfo = {
                    token: row.token,
                    symbol: row.symbol
                }
                CommonOrderMethod.historyWiseOrderPlace(symbolInfo, 'BUY', "no", this.callbackAfterOrderDone);
                this.setState({ [spinnerIndex]: false });

            }

            if (type == 'SELL') {
                this.setState({ [spinnerIndex]: true });
                var symbolInfo = {
                    token: row.token,
                    symbol: row.symbol
                }
                CommonOrderMethod.historyWiseOrderPlace(symbolInfo, 'SELL', "no", this.callbackAfterOrderDone);
                this.setState({ [spinnerIndex]: false });
            }
        } else {
            Notify.showError(" Symbol Not found!!!");
        }
    }

    render() {

        console.log("findlast5minMovement",  this.state.findlast5minMovement); 

        //var foundPatternList = localStorage.getItem('foundPatternList') && JSON.parse(localStorage.getItem('foundPatternList')).reverse(); 

        return (
            <React.Fragment>
                <PostLoginNavBar />
                <br />
                <ChartDialog /> <ChartMultiple />

                <Grid justify="space-between"
                    container spacing={1}>

                    <Grid item xs={12} sm={4} >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            &nbsp;BB Blast ({this.state.findlast5minMovement && this.state.findlast5minMovement.length})
                            <span id="stockTesting" style={{ fontSize: "18px", color: 'gray' }}> {this.state.findlast5minMovementUpdate} </span>
                        </Typography>

                    </Grid>


                    <Grid item xs={12} sm={2} >
                        <FormControl style={styles.selectStyle} >
                            <InputLabel htmlFor="gender">Select Watchlist</InputLabel>
                            <Select value={this.state.selectedWatchlist} name="selectedWatchlist" onChange={this.onChangeWatchlist}>
                                <MenuItem value={"selectall"}>{"Select All"}</MenuItem>
                                {this.state.totalWatchlist && this.state.totalWatchlist.map(element => (
                                    <MenuItem value={element}>{element}</MenuItem>
                                ))
                                }
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={1} >
                        <FormControl style={styles.selectStyle} >
                            <InputLabel htmlFor="gender">Select Time</InputLabel>
                            <Select value={this.state.timeFrame} name="timeFrame" onChange={this.onChangeWatchlist}>
                                <MenuItem value={'ONE_MINUTE'}>{'1 Min'}</MenuItem>
                                <MenuItem value={'FIVE_MINUTE'}>{'5 Min'}</MenuItem>
                                <MenuItem value={'TEN_MINUTE'}>{'10 Min'}</MenuItem>
                                <MenuItem value={'FIFTEEN_MINUTE'}>{'15 Min'}</MenuItem>
                                <MenuItem value={'THIRTY_MINUTE'}>{'30 Min'}</MenuItem>
                                <MenuItem value={'ONE_HOUR'}>{'1 Hour'}</MenuItem>
                                <MenuItem value={'ONE_DAY'}>{'1 Day'}</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={1} >
                        <FormControl style={styles.selectStyle} >
                            <InputLabel htmlFor="gender">Select Time</InputLabel>
                            <Select value={this.state.BBBlastType} name="BBBlastType" onChange={this.onChangeWatchlist}>
                                <MenuItem value={'BBBlastOnly'}>{'BB Blast'}</MenuItem>
                                <MenuItem value={'BBBlastDaily'}>{'BB Blast Daily'}</MenuItem>

                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={4} >
                        <Button variant="contained" style={{ marginRight: '20px' }} onClick={() => this.find10MinBBBlast()}>Start</Button>
                        <Button variant="contained" style={{ marginRight: '20px' }} onClick={() => this.stopSearching()}>Stop</Button>
                    </Grid>

                </Grid>

                {/* <Table  size="small"   aria-label="sticky table" >
                    <TableHead  style={{whiteSpace: "nowrap", }} variant="head">
                        <TableRow key="1"  variant="head" style={{fontWeight: 'bold'}}>
                            <TableCell className="TableHeadFormat" align="left">Symbol</TableCell>        
                            <TableCell className="TableHeadFormat"  align="left">Time/PerChnage</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody style={{width:"",whiteSpace: "nowrap"}}>
                        {this.state.findlast5minMovement ? this.state.findlast5minMovement.map(row => (
                            <TableRow hover key={row.symbol}>
                                <TableCell align="left"> <Button  style={{ color: row.perChange > 0 ? "green" : "red" }} variant="contained"  onClick={() => this.showCandleChart(row.candleChartData, row.symbol, row.ltp, row.perChange )}>{row.symbol} {row.ltp} ({row.perChange.toFixed(2)}) <EqualizerIcon /> </Button></TableCell>
                                <TableCell align="left">{row.percentChangeList}
                            </TableCell>
                            </TableRow>
                        )):''}
                    </TableBody>
                </Table> */}
                <Grid container spacing={2} >


                    {this.state.findlast5minMovement ? this.state.findlast5minMovement.map((row, i) => (

                        <Grid item xs={12} sm={3}>
                            <Paper style={{ overflow: "auto", padding: '10px' }} >
                                <Typography style={{ color: row.perChange > 0 ? "green" : "red" }}> {row.symbol} {row.ltp} <b>({row.perChange.toFixed(2)}%) </b></Typography>

                                {/* <LightChart candleData={row.candleChartData.length} />  */}
                                

                                {/* {row.lightcandleChartData.length > 0 ?  <div id="showchart"> 
                                    <LightChartCom ChartData={{lightcandleChartData: row.lightcandleChartData.slice(Math.max(row.candleChartData.length - 10, 1)), volumeData : this.state.volumeData}}/>
                                </div>
                                : ""} */}

                                {row.candleChartData.length > 0 ?  <ReactApexChart
                                    options={{
                                        chart: {
                                            type: 'candlestick',
                                            height: 250
                                        },
                                        title: {
                                            text: "",
                                            align: 'left'
                                        },
                                        xaxis: {
                                            type: 'datetime',
                                        },
                                        yaxis: {
                                            tooltip: {
                                                enabled: true
                                            }
                                        }
                                    }}
                                    series={[{
                                        data: row.candleChartData.slice(Math.max(row.candleChartData.length - 10, 1))
                                    }, 
                                    // {
                                    //     name: 'line',
                                    //     type: 'line',
                                    //     data: [
                                    //         row.lightcandleChartData
                                    //     ]
                                    //   }
                                
                                    ]}
                                   
                                    type="candlestick"
                                    width={350}
                                    height={250}

                                    

                                /> : ""}

                                {/* <div> {Parser(row.percentChangeList)}</div> */}

                                <Grid direction="row" style={{ padding: '5px' }} container className="flexGrow" justify="space-between" >



                                    {row.DSMALastValue ? <Grid item xs={12} sm={12} style={{ color: row.ltp > row.DSMALastValue ? "green" : "red", fontWeight: "bold" }}>
                                        Daily SMA: {row.DSMALastValue} {row.ltp > row.DSMALastValue ? "BUY" : "SELL"}
                                    </Grid> : ""}
                                    <Grid item xs={12} sm={12} style={{ color: row.ltp > row.VWAP ? "green" : "red", fontWeight: "bold" }}>
                                        VWAP:  {row.VWAP}
                                    </Grid>
                                    <Grid item xs={12} sm={12}>

                                        RSI: {row.RSI.map((item, j) => (
                                            item >= 60 ? <span style={{ color: 'green', fontWeight: "bold" }}> {item} &nbsp;</span> : <span style={{ color: item <= 40 ? 'red' : "", fontWeight: "bold" }}> {item} &nbsp;</span>
                                        ))}


                                    </Grid>
                                    <Grid item xs={12} sm={12} >
                                        BB
                                        &nbsp; <span style={{ color: row.ltp >= row.BB.upper ? "green" : "", fontWeight: "bold" }}>Upper: {row.BB.upper}</span>
                                        &nbsp; Middle: {row.BB.middle}
                                        &nbsp; <span style={{ color: row.ltp <= row.BB.lower ? "red" : "", fontWeight: "bold" }}> Lower: {row.BB.lower}</span>
                                    </Grid>

                                </Grid>

                                <Grid direction="row" style={{ padding: '5px' }} container className="flexGrow" justify="space-between" >
                                    <Grid item>
                                        {!this.state['buyButtonClicked' + row.symbol + i] ? <Button size="small" variant="contained" color="primary" onClick={() => this.handleClick(row, 'BUY', 'buyButtonClicked' + row.symbol + i)}>BUY</Button> : <Spinner />}
                                    </Grid>

                                    <Grid item >
                                        {/* onClick={() => this.historyWiseOrderPlace(row, 'SELL', "", 'sellButtonClicked' + row.symbol + i)} */}
                                        {!this.state['sellButtonClicked' + row.symbol + i] ? <Button size="small" variant="contained" color="Secondary" onClick={() => this.handleClick(row, 'SELL', 'sellButtonClicked' + row.symbol + i)}>SELL</Button> : <Spinner />}
                                    </Grid>
                                </Grid>


                            </Paper>

                        </Grid>

                    )) : ''}
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