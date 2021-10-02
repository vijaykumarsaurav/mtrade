import React from "react";
import AdminService from "../service/AdminService";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import PostLoginNavBar from "../PostLoginNavbar";
import { resolveResponse } from "../../utils/ResponseHandler";
import Spinner from "react-spinner-material";
import TextField from "@material-ui/core/TextField";
import DeleteIcon from '@material-ui/icons/Delete';

import * as moment from 'moment';
import ReactApexChart from "react-apexcharts";
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { SMA, RSI, VWAP, BollingerBands } from 'technicalindicators';
import vwap from 'vwap';
import CommonMethods from "../../utils/CommonMethods";
import LightChart from "./LightChart";
import LightChartCom from "./LightChartCom";
import Parser from 'html-react-parser';




class OrderBook extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            oderbookData: [],
            listofzones: [],
            selectedZone: [],
            zone: '',
            selectAllzone: 'Select All',
            triggerprice: 0,
            price: 0,
            lotsize: 0,
            firstTimeFlag: true,
            staticData: localStorage.getItem('staticData') && JSON.parse(localStorage.getItem('staticData')) || {},
            totalWatchlist: localStorage.getItem('totalWatchlist') && JSON.parse(localStorage.getItem('totalWatchlist')) || [],
            selectedWatchlist: "NIFTY BANK",
            totalStockToWatch: 0,
            timeFrame: "TEN_MINUTE",
            chartStaticData: [],
            qtyToTake: '',
            BBBlastType: "BBBlastOnly",
            fastMovementList: localStorage.getItem('fastMovementList') && JSON.parse(localStorage.getItem('fastMovementList')) || [],
            sortedType: "isActivated",
            slowMotionStockList: localStorage.getItem('slowMotionStockList') && JSON.parse(localStorage.getItem('slowMotionStockList')) || []

        }
    }



    componentDidMount() {
        var beginningTime = moment('9:15am', 'h:mma');
        var endTime = moment('3:30pm', 'h:mma');
        const friday = 5; // for friday
        var currentTime = moment(new Date(), "h:mma");
        const today = moment().isoWeekday();
        //market hours
        if (today <= friday && currentTime.isBetween(beginningTime, endTime)) {

            var tostartInteral = setInterval(() => {
                var time = new Date();
                if (time.getMinutes() % 5 === 0) {
                    setTimeout(() => {
                        this.checkSlowMotionCheckLive();
                    }, 70000);
                    setInterval(() => {
                        this.checkSlowMotionCheckLive();
                    }, 60000 * 5 + 70000);
                    clearInterval(tostartInteral);
                }
            }, 1000);

        }

    }



    onChangeWatchlist = (e) => {

        this.setState({ [e.target.name]: e.target.value }, function () {
            // this.findlast5minMovement(); //one time only
            //this.startSearching();
            this.checkSlowMotion();

        });
    }


    checkSlowMotion = async () => {
        var watchList = this.state.staticData[this.state.selectedWatchlist];

        if (this.state.selectedWatchlist == "selectall") {
            watchList = localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList'));
        }



        this.setState({ scanUpdate: "" });
        for (let index = 0; index < watchList.length; index++) {
            const row = watchList[index];

            var isfound = this.state.slowMotionStockList.filter(item => item.token == row.token);
            if (!isfound.length) {
                this.checkSlowMotionStock(row.token, row, index + 1);
                await new Promise(r => setTimeout(r, 310));
            }

        }

    }

    checkSlowMotionStock = (token, stock, stockindex) => {

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

                        }
                        if (per <= -0.4) {
                            bigCandleCount += 1;

                        }
                    }
                }
                console.log("Totalcount", stock.name, bigCandleCount);

                this.setState({ scanUpdate: "Scan: " + stockindex + ". " + stock.name + " maxCount: " + bigCandleCount })

                if (bigCandleCount <= 15) {

                    var isfound = this.state.slowMotionStockList.filter(item => item.token == token);
                    if (!isfound.length) {
                        stock.bigCandleCount = bigCandleCount;
                        stock.sectorName = this.state.selectedWatchlist;

                        this.setState({ slowMotionStockList: [...this.state.slowMotionStockList, stock] }, function () {
                            localStorage.setItem("slowMotionStockList", JSON.stringify(this.state.slowMotionStockList));
                        });
                    }
        

                   
                }
            }

        });
    }

    checkSlowMotionCheckLive = async () => {

        for (let index = 0; index < this.state.slowMotionStockList.length; index++) {
            const row = this.state.slowMotionStockList[index];

            if (!row.isActivated) {
                const format1 = "YYYY-MM-DD HH:mm";
                var time = moment.duration("30:00:00");  //22:00:00" for last day  2hours 
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

                        var bigCandleCount = 0, midBullishCount = 0, bullishCount = 0, activationTime = "", activationPrice = 0;

                        for (let index = candleDatad.length - 3; index < candleDatad.length; index++) {
                            const element = candleDatad[index];

                            if (element) {

                                var per = (element[4] - element[1]) * 100 / element[1];
                                if (per >= 1) {
                                    bigCandleCount += 1;
                                    activationPrice = element[2];
                                    activationTime = new Date(element[0]).toLocaleString();
                                }
                                if (per >= 0.5) {
                                    midBullishCount += 1;
                                    activationPrice = element[2];
                                    activationTime = new Date(element[0]).toLocaleString();
                                }
                                if (per >= 0) {
                                    bullishCount += 1;
                                }

                            }
                        }

                        let update = Parser("Update: " + (index + 1) + "." + row.name + " large(1%): <b>" + bigCandleCount +"</b> &nbsp;mid(0.5%): <b>"+ midBullishCount+"</b> &nbsp;small(>0%): <b>"+ bullishCount+"</b>" ); 
                
                        this.setState({ scanUpdate:  update})
                        console.log(row.symbol, bigCandleCount, midBullishCount, bullishCount);

                        let updatetopage = Parser("large(1%): <b>" + bigCandleCount +"</b> &nbsp;mid(0.5%): <b>"+ midBullishCount+"</b> &nbsp;small(>0%): <b>"+ bullishCount+"</b> at " + new Date(candleDatad[candleDatad.length-1][0]).toLocaleTimeString()); 

                        row.update = updatetopage; 

                        if (bigCandleCount >= 1 || (midBullishCount >= 1 && bullishCount >= 2)) {

                            row.isActivated = true;
                            row.activationTime = activationTime;
                            row.activationPrice = activationPrice;

                            window.document.title = "SM: " + row.symbol;
                            console.log('hey, slow motion stock' + row.symbol + " broken");

                            this.speckIt('hey, slow motion stock' + row.symbol + " broken");

                            this.setState({ slowMotionStockList: this.state.slowMotionStockList }, function () {
                                this.sortByColumn("isActivated");
                                localStorage.setItem("slowMotionStockList", JSON.stringify(this.state.slowMotionStockList));
                            })
                        }

                    }

                });
                await new Promise(r => setTimeout(r, 310));
            }


        }

    }

    deleteAllScan = () => {

        if(window.confirm("Are you sure to delete all scan stocks?")){
            this.setState({ slowMotionStockList: []})
            localStorage.setItem("slowMotionStockList",[]);
        }
     
    }
    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value.trim() });
    }


    convertToFloat = (str) => {
        if (!isNaN(str)) {
            return "(" + (str / 100000).toFixed(2) + "L)";
        }


    }

    speckIt = (text) => {
        var msg = new SpeechSynthesisUtterance();
        msg.text = text.toString();
        window.speechSynthesis.speak(msg);
    }

    getPercentageColor = (percent) => {
        percent = percent * 100;
        var r = percent < 50 ? 255 : Math.floor(255 - (percent * 2 - 100) * 255 / 100);
        var g = percent > 50 ? 255 : Math.floor((percent * 2) * 255 / 100);
        return 'rgb(' + r + ',' + g + ',0)';
    }
    sortByColumn = (type) => {

        this.state.slowMotionStockList.sort(function (a, b) {
            if (type == "isActivated" && a.isActivated) {
                return (a.isActivated === b.isActivated) ? 0 : a ? -1 : 1;
            } else {
                return b[type] - a[type];
            }
        });

        this.setState({ slowMotionStockList: this.state.slowMotionStockList, sortedType: type });

    }

    render() {

        return (
            <React.Fragment>


                {window.location.hash !== "#/position" ? <PostLoginNavBar /> : ""}



                <Grid direction="row" alignItems="center" container>
                    <Grid item xs={12} sm={12} >

                        <Paper style={{ padding: "10px" }} >

                            <Grid justify="space-between"
                                container spacing={1}>

                                <Grid item xs={12} sm={4} >
                                    <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                      Slow Motion ({this.state.slowMotionStockList.length})  <DeleteIcon  onClick={() => this.deleteAllScan()}/>  found at {new Date().toLocaleString()}
                                    </Typography>
                                    {this.state.sortedType ? <> <b> Sorted By: </b> {this.state.sortedType}  </> : ""}

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




                                <Grid item xs={12} sm={4} >
                                    <Button variant="contained" style={{ marginRight: '20px' }} onClick={() => this.checkSlowMotion()}>Scan</Button>
                            
                                    {this.state.scanUpdate ? <>{this.state.scanUpdate}  </> : ""}
                                    </Grid>

                                <Grid item xs={12} sm={2} >
                                    <Button variant="contained" style={{ marginRight: '20px' }} onClick={() => this.checkSlowMotionCheckLive()}>Refresh</Button>
                                </Grid>

                                

                            </Grid>


                            <Table size="small" style={{ width: "100%" }} aria-label="sticky table" >

                                <TableHead style={{ whiteSpace: "nowrap" }} variant="head">
                                    <TableRow variant="head">
                                        <TableCell align="left">Sr.</TableCell>

                                        <TableCell align="left"><Button onClick={() => this.sortByColumn("pchange")}>Symbol</Button> </TableCell>
                                        <TableCell align="center">Sector</TableCell>

                                        <TableCell align="center">Max Count</TableCell>



                                        <TableCell align="center"><Button onClick={() => this.sortByColumn("isActivated")}>Is Activated</Button></TableCell>
                                        <TableCell align="center">Activate Time</TableCell>
                                        <TableCell align="center">Activation Price</TableCell>
                                        <TableCell align="center">Last Update</TableCell>



                                    </TableRow>
                                </TableHead>
                                <TableBody>



                                    {this.state.slowMotionStockList ? this.state.slowMotionStockList.map((row, i) => (
                                        <TableRow hover key={i} style={{ background: row.isActivated ? "lightgray" : "" }}>
                                            <TableCell align="left">{i + 1}</TableCell>

                                            <TableCell align="left">{row.name}</TableCell>
                                            <TableCell align="center">{row.sectorName}</TableCell>
                                            <TableCell align="center">{row.bigCandleCount}</TableCell>

                                            <TableCell align="center">{row.isActivated ? "Yes" : "No"}</TableCell>
                                            <TableCell align="center">{row.activationTime}</TableCell>
                                            <TableCell align="center">{row.activationPrice}</TableCell>
                                            <TableCell align="center">{row.update}</TableCell>

                                            


                                        </TableRow>
                                    )) : <Spinner />}
                                </TableBody>
                            </Table>
                        </Paper>
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

// const mapStateToProps=(state)=>{
//     return {packs:state.packs.packs.data};
// }

//export default connect(mapStateToProps,{setPackLoaded})(OrderBook);
export default OrderBook;