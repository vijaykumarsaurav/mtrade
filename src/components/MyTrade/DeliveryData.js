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
            liveBidsList: [],  //localStorage.getItem('liveBidsList') && JSON.parse(localStorage.getItem('liveBidsList')) || [],
            sortedType: "pChange",
            backupDeleverydata: [],

        }
    }

    getTodayOrder = () => {
        AdminService.retrieveOrderBook()
            .then((res) => {
                let data = resolveResponse(res, "noPop");
                if (data && data.data) {
                    var orderlist = data.data;
                    orderlist.sort(function (a, b) {
                        return new Date(b.updatetime) - new Date(a.updatetime);
                    });

                    this.setState({ oderbookData: orderlist });
                    localStorage.setItem('oderbookData', JSON.stringify(orderlist));

                    // var pendingOrder = orderlist.filter(function(row){
                    //     return row.status == "trigger pending";
                    // }); 
                    // this.setState({pendingOrder: pendingOrder});

                }
            });
    }

    componentDidMount() {

        // var beginningTime = moment('9:15am', 'h:mma');
        // var endTime = moment('3:30pm', 'h:mma');
        // const friday = 5; // for friday
        // var currentTime = moment(new Date(), "h:mma");
        // const today = moment().isoWeekday();
        // //market hours
        // if (today <= friday && currentTime.isBetween(beginningTime, endTime)) {
        //     setInterval(() => {
        //         this.checkLiveBids();
        //     }, 10 * 60000);

        // }


        setInterval(() => {
            this.checkLiveBids();
        }, 10 * 60000);


        this.checkLiveBids();

    }



    onChangeWatchlist = (e) => {
        clearInterval(this.state.findlast5minMovementInterval);
        this.setState({ [e.target.name]: e.target.value }, function () {
            // this.findlast5minMovement(); //one time only
            //this.startSearching();
            this.checkLiveBids();

        });
    }

    backupData = () => {
        console.log(this.state.backupDeleverydata);
        AdminService.saveDeliveryData({ backupDeleverydata: this.state.backupDeleverydata }).then(storeRes => {
            console.log("storeRes", new Date().toLocaleTimeString(), storeRes);
        });
    }


    checkLiveBids = async () => {

        var watchList = this.state.staticData[this.state.selectedWatchlist];
        this.setState({ liveBidsList: [], backupDeleverydata: [] });

        var delData = [];
        for (let index = 0; index < watchList.length; index++) {
            const row = watchList[index];

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
                        quantityTraded: parseFloat(bidlivedata.quantityTraded.split(",").join('')),
                        deliveryQuantity: parseFloat(bidlivedata.deliveryQuantity.split(",").join('')),
                        deliveryToTradedQuantity: parseFloat(bidlivedata.deliveryToTradedQuantity.split(",").join('')),
                        symbol: bidlivedata.symbol,
                        todayChange: bidlivedata.pChange,
                        ltp: parseFloat(bidlivedata.lastPrice.split(",").join('')),
                        datetime: moment(bidlivedata.secDate).format("YYYY-MM-DD HH:mm:ss"),
                        averagePrice: parseFloat(bidlivedata.averagePrice.split(",").join('')),
                    }
                    // delData.push(biddata);



                    this.setState({ backupDeleverydata: [...this.state.backupDeleverydata, biddata] });

                    bidlivedata.quantityTraded = bidlivedata.quantityTraded != '-' ? parseFloat(bidlivedata.quantityTraded.split(",").join('')) : "0";
                    bidlivedata.deliveryQuantity = bidlivedata.deliveryQuantity != '-' ? parseFloat(bidlivedata.deliveryQuantity.split(",").join('')) : "0";


                    bidlivedata.totalBuyQuantity = bidlivedata.totalBuyQuantity != '-' ? parseFloat(bidlivedata.totalBuyQuantity.split(",").join('')) : "0";

                    bidlivedata.totalSellQuantity = bidlivedata.totalSellQuantity != '-' ? parseFloat(bidlivedata.totalSellQuantity.split(",").join('')) : "0";
                    bidlivedata.totalTradedVolume = bidlivedata.totalTradedVolume != '-' ? parseFloat(bidlivedata.totalTradedVolume.split(",").join('')) : "0";
                    bidlivedata.totalTradedValue = bidlivedata.totalTradedValue != '-' ? parseFloat(bidlivedata.totalTradedValue.split(",").join('')) : "0";

                 
                    bidlivedata.buytosellTime = bidlivedata.totalBuyQuantity / bidlivedata.totalSellQuantity;
                    bidlivedata.selltobuyTime = bidlivedata.totalSellQuantity / bidlivedata.totalBuyQuantity;

                    this.state.liveBidsList.sort(function (a, b) {
                        return b.pChange - a.pChange;
                    });



                    if (bidlivedata.totalBuyQuantity / bidlivedata.totalSellQuantity > 1.25) {
                       // CommonMethods.speckIt(bidlivedata.symbol + " " + (bidlivedata.totalBuyQuantity / bidlivedata.totalSellQuantity).toFixed(2) + " time buying");
                        bidlivedata.highlightbuy = true;
                    }

                    if (bidlivedata.totalSellQuantity / bidlivedata.totalBuyQuantity > 1.25) {
                      //  CommonMethods.speckIt(bidlivedata.symbol + "  " + (bidlivedata.totalSellQuantity / bidlivedata.totalBuyQuantity).toFixed(2) + " time selling");
                        bidlivedata.highlightsell = true;
                    }

                    this.setState({ liveBidsList: [...this.state.liveBidsList, bidlivedata], lastUpdateTime: resd.data.lastUpdateTime }, function () {

                        localStorage.setItem("liveBidsList", JSON.stringify(this.state.liveBidsList));
                        window.document.title = "Del: " + this.state.liveBidsList[0].symbol;


                    });


                }

            });
            await new Promise(r => setTimeout(r, 200));
        }

        // if(watchList.length == delData.length)
        // console.log("delData",  delData);

    }

    getDeliveryHistory = ()=> {


        for (let index = 0; index < this.state.liveBidsList.length; index++) {
            const element = this.state.liveBidsList[index];        
            AdminService.getDeliveryDataFromDb(element.symbol)
            .then((res) => {
                let data = resolveResponse(res, "noPop");
                console.log("hist data",data.result);
                if (data && data.result) {
                    var result = data.result;
                    element.delHistory =  result;                    
                    console.log(element.symbol, result); 

                    this.setState({ liveBidsList: this.state.liveBidsList });
                }
            });
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

    getPercentageColor = (percent) => {
        percent = percent * 100;
        var r = percent < 50 ? 255 : Math.floor(255 - (percent * 2 - 100) * 255 / 100);
        var g = percent > 50 ? 255 : Math.floor((percent * 2) * 255 / 100);
        return 'rgb(' + r + ',' + g + ',0)';
    }
    sortByColumn = (type) => {

        this.state.liveBidsList.sort(function (a, b) {
            return b[type] - a[type];
        });

        this.setState({ liveBidsList: this.state.liveBidsList, sortedType: type });

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
                                        {this.state.selectedWatchlist} ({this.state.liveBidsList.length}) updated at {this.state.lastUpdateTime}
                                    </Typography>

                                    <span>Sorted By:  {this.state.sortedType} </span>

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




                                <Grid item xs={12} sm={3} >
                                    <Button variant="contained" style={{ marginRight: '20px' }} onClick={() => this.checkLiveBids()}>Refresh</Button>
                                </Grid>

                                <Grid item xs={12} sm={1} >
                                    <Button variant="contained" style={{ marginRight: '20px' }} onClick={() => this.backupData()}>BackUp</Button>
                                </Grid>


                            </Grid>


                            <Table size="small" style={{ width: "100%" }} aria-label="sticky table" >

                                <TableHead style={{ whiteSpace: "nowrap" }} variant="head">
                                    <TableRow variant="head" >

                                        <TableCell align="left"><Button onClick={() => this.sortByColumn("pChange")}> Symbol</Button> </TableCell>
                                        <TableCell align="center" ><Button onClick={() => this.sortByColumn("buytosellTime")}>buyTosell</Button>  </TableCell>
                                        <TableCell align="center" ><Button onClick={() => this.sortByColumn("selltobuyTime")}>sellTobuy</Button>  </TableCell>

                                        

                                        <TableCell align="center" ><Button onClick={() => this.sortByColumn("totalBuyQuantity")}> Total Buy Quantity</Button>  </TableCell>
                                        <TableCell align="center" ><Button onClick={() => this.sortByColumn("totalSellQuantity")}> Total Sell Quantity</Button>  </TableCell>

                                     

                                        <TableCell align="center">Average Price</TableCell>
                                        <TableCell align="center"><Button onClick={() => this.sortByColumn("quantityTraded")}> Quantity Traded</Button>  </TableCell>
                                        <TableCell align="center" ><Button onClick={() => this.sortByColumn("deliveryQuantity")}> Delivery Quantity</Button>  </TableCell>
                                        <TableCell align="center" ><Button title={"Delivery To Traded Quantity"} onClick={() => this.sortByColumn("deliveryToTradedQuantity")}> Del To Traded Qty%</Button>  </TableCell>



                                        {/* <TableCell align="center" ><Button onClick={() => this.sortByColumn("totalTradedVolume")}> Total Traded Volume</Button>  </TableCell>
                                        <TableCell align="center" ><Button onClick={() => this.sortByColumn("totalTradedValue")}> Total Traded Value(L)</Button>  </TableCell> */}

                                        {/* <TableCell  align="center">Day Open</TableCell>
                                    <TableCell  align="center">Day High</TableCell>
                                    <TableCell  align="center">Day Low</TableCell>
                                    <TableCell  align="center">Previous Close</TableCell> */}


                                    <TableCell align="center" ><Button variant="contained"  onClick={() => this.getDeliveryHistory()}>Delivery History</Button>  </TableCell>



                                    </TableRow>
                                </TableHead>
                                <TableBody>


                                    {this.state.liveBidsList ? this.state.liveBidsList.map((row, i) => (
                                        <TableRow hover key={i} style={{ background: this.getPercentageColor(row.pChange) }}>

                                            <TableCell align="left">{row.symbol} {row.lastPrice} ({row.pChange}%)</TableCell>
                                            <TableCell style={{ background: row.highlightbuy ? "lightgray" : "" }} align="center">{row.buytosellTime.toFixed(2)} time buy</TableCell>

                                            <TableCell style={{ background: row.highlightsell ? "lightgray" : "" }} align="center">{row.selltobuyTime.toFixed(2)} time sell</TableCell>
                                            
                                            <TableCell align="center">{row.totalBuyQuantity} {this.convertToFloat(row.totalBuyQuantity)}</TableCell>
                                            <TableCell align="center">{row.totalSellQuantity} {this.convertToFloat(row.totalSellQuantity)}</TableCell>
                                   
                                            <TableCell align="left">{row.averagePrice}</TableCell>


                                            <TableCell align="center">{row.quantityTraded} {this.convertToFloat(row.quantityTraded)}</TableCell>
                                            <TableCell align="center">{row.deliveryQuantity} {this.convertToFloat(row.deliveryQuantity)}</TableCell>
                                            <TableCell align="center">{row.deliveryToTradedQuantity}%</TableCell>

                                            {/* <TableCell align="center">{row.totalTradedVolume} {this.convertToFloat(row.totalTradedVolume)}</TableCell>
                                            <TableCell align="center">{row.totalTradedValue}L</TableCell> */}

                                            {/* <TableCell  align="center">{row.open}</TableCell>
                                    <TableCell  align="center">{row.dayHigh}</TableCell>
                                    <TableCell  align="center">{row.dayLow}</TableCell>
                                    <TableCell  align="center">{row.previousClose}</TableCell> */}

                                            <TableCell style={{ background:  "#eceff1" }} align="center"> 

                                                {row.delHistory && row.delHistory.map(item => (                                                   
                                                     <span> {new Date(item.datetime).toLocaleDateString()}  &nbsp;
                                                        <span title={"quantityTraded " + item.quantityTraded}> {(item.quantityTraded/100000).toFixed(2)}L  </span>  &nbsp;
                                                        <span title={"deliveryToTradedQuantity"}> {item.deliveryToTradedQuantity}%  </span>  &nbsp;
                                                        <span title={"deliveryQuantity " + item.deliveryQuantity}> {(item.deliveryQuantity/100000).toFixed(2)}L  </span>  &nbsp;
                                                        <span  style={{color: item.todayChange > 0 ? "green" : "red" }}> ({item.todayChange}%)   </span>
                                                        &nbsp;  <br /></span>
                                                    ))}
                                            
                                            </TableCell>


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