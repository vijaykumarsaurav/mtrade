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

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            staticData: localStorage.getItem('staticData') && JSON.parse(localStorage.getItem('staticData')) || {},
            totalWatchlist: localStorage.getItem('totalWatchlist') && JSON.parse(localStorage.getItem('totalWatchlist')) || [],
            selectedWatchlist: "NIFTY IT",
            totalStockToWatch: 0

        };
        this.findlast5minMovement = this.findlast5minMovement.bind(this);
        this.startSearching = this.startSearching.bind(this);
    }


    componentDidMount() {

        window.document.title = "Fast Movement";

        var watchList = this.state.staticData[this.state.selectedWatchlist];
        this.setState({ totalStockToWatch: watchList.length });

        // this.findlast5minMovement(); //one time only

        this.startSearching();

        this.find10MinBBBlast();

    }


    stopSearching = () => {
        console.log("stop the search")
        clearInterval(this.state.findlast5minMovementInterval);
    }


    showCandleChart = (candleData, symbol, ltp, perChange) => {
        localStorage.setItem('candleChartData', JSON.stringify(candleData))
        localStorage.setItem('cadleChartSymbol', symbol)
        localStorage.setItem('candlePriceShow', ltp);
        localStorage.setItem('candleChangeShow', perChange.toFixed(2));
        document.getElementById('showCandleChart').click();
    }


    componentWillUnmount() {
        clearInterval(this.state.findlast5minMovementInterval);
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

    find10MinBBBlast = async () => {

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

        for (let index = 0; index < watchList.length; index++) {
            const format1 = "YYYY-MM-DD HH:mm";
            var beginningTime = moment('9:15am', 'h:mma').format(format1);
            console.log("beginningTime", beginningTime);

            var time = moment.duration("02:00:00");  //21:10:00"
            var startdate = moment(new Date()).subtract(time);
            var data = {
                "exchange": "NSE",
                "symboltoken": watchList[index].token,
                "interval": "TEN_MINUTE", //ONE_DAY FIVE_MINUTE 
                "fromdate": moment(beginningTime).format(format1),
                "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
            }

            AdminService.getHistoryData(data).then(res => {
                let histdata = resolveResponse(res, 'noPop');
                // console.log("candle history", histdata);

                if (histdata && histdata.data && histdata.data.length) {

                    var candleData = histdata.data;
                    var candleChartData = [], vwapdata = [], closeingData = [], highData = [], lowData = [], openData = [], valumeData = [], bbdata = [];
                        candleData.forEach((element, index) => {
                        candleChartData.push([element[0], element[1], element[2], element[3], element[4]]);
                        vwapdata.push([element[5], (element[2] + element[3] + element[4]) / 3]);
                        closeingData.push(element[4]);
                        highData.push(element[2]);
                        lowData.push(element[3]);
                        openData.push(element[3]);
                        valumeData.push(element[5]);
                        bbdata.push((element[2] + element[3] + element[4]) / 3);

                    });

                    var sma = SMA.calculate({ period: 10, values: closeingData });
                    console.log(watchList[index].symbol, "SMA", sma);


                    var inputRSI = { values: closeingData, period: 14 };
                    var lastRsiValue = RSI.calculate(inputRSI)
                    console.log(watchList[index].symbol, "lastRsiValue", lastRsiValue[lastRsiValue.length - 1]);


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

                    if (candleData.length > 0) {
                        watchList[index].candleChartData = candleChartData;
                        watchList[index].vwapValue = vwap(vwapdata);
                        watchList[index].vwapDataChart = VWAP.calculate(inputVWAP);
                        watchList[index].lastRsiValue = lastRsiValue[lastRsiValue.length - 1];
                    }

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

                            if (LtpData.ltp >= bbvlastvalue.upper) {
                                var perChange = (LtpData.ltp - LtpData.close) * 100 / LtpData.close;
                                foundData.push({
                                    symbol: watchList[index].symbol,
                                    ltp: LtpData.ltp,
                                    perChange: perChange,
                                    percentChangeList: '',
                                    candleChartData: candleChartData,
                                })
                                console.log("foundData", foundData);
                                this.setState({ findlast5minMovement: foundData })
                            }

                        }

                    })


                } else {
                    //localStorage.setItem('NseStock_' + symbol, "");
                    console.log(watchList[index].symbol, "  emply candle found");
                }
            })

            await new Promise(r => setTimeout(r, 333));
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




    render() {

        //var foundPatternList = localStorage.getItem('foundPatternList') && JSON.parse(localStorage.getItem('foundPatternList')).reverse(); 

        return (
            <React.Fragment>
                <PostLoginNavBar />
                <br />
                <ChartDialog /> <ChartMultiple />

                <Grid justify="space-between"
                    container>

                    <Grid item xs={12} sm={3} >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Search  5min Movement ({this.state.findlast5minMovement && this.state.findlast5minMovement.length})
                            <span id="stockTesting" style={{ fontSize: "18px", color: 'gray' }}> {this.state.findlast5minMovementUpdate} </span>
                        </Typography>

                    </Grid>


                    <Grid item xs={12} sm={3} >
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

                    <Grid item xs={12} sm={3} >
                        <Button variant="contained" style={{ marginLeft: '20px' }} onClick={() => this.findlast5minMovement()}>Start Searching</Button>
                        <Button variant="contained" style={{ marginLeft: '20px' }} onClick={() => this.stopSearching()}>Stop Searching</Button>
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

                        <Grid item  >
                            <Paper style={{ overflow: "auto", padding: '10px' }} >
                                <Typography style={{ color: row.perChange > 0 ? "green" : "red" }}> {row.symbol} {row.ltp} <b>({row.perChange.toFixed(2)}) </b></Typography>

                                {row.candleChartData.length > 0 ? <ReactApexChart
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
                                        data: row.candleChartData

                                    }]}
                                    type="candlestick"
                                    width={350}
                                    height={250}
                                /> : ""}

                                <div style={{ width: "350px", overflow: "auto" }}> {Parser(row.percentChangeList)}</div>

                                <Grid direction="row" style={{ padding: '5px' }} container className="flexGrow" justify="space-between" >

                                    <Grid item>
                                        {/* onClick={() => this.historyWiseOrderPlace(row, 'BUY', "", 'buyButtonClicked' + row.symbol + i)} */}
                                        {!this.state['buyButtonClicked' + row.symbol + i] ? <Button size="small" variant="contained" color="primary"  >Buy</Button> : <Spinner />}
                                    </Grid>

                                    <Grid item >
                                        {/* onClick={() => this.historyWiseOrderPlace(row, 'SELL', "", 'sellButtonClicked' + row.symbol + i)} */}
                                        {!this.state['sellButtonClicked' + row.symbol + i] ? <Button size="small" variant="contained" color="secondary" >Sell</Button> : <Spinner />}
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