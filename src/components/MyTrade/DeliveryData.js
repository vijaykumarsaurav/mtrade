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
            selectedWatchlist: localStorage.getItem('clickedIndexName') ? localStorage.getItem('clickedIndexName') :  'NIFTY BANK', //decodeURIComponent(window.location.href.split('?')[1].split('=')[1]),
            totalStockToWatch: 0,
            timeFrame: "TEN_MINUTE",
            chartStaticData: [],
            qtyToTake: '',
            BBBlastType: "BBBlastOnly",
            liveBidsList: [],  //localStorage.getItem('liveBidsList') && JSON.parse(localStorage.getItem('liveBidsList')) || [],
            sortedType: "pChange",
            backupDeleverydata: [],
            backupBidata: [],
            backupDateList: [],
            backDate : ''

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

    // getDerivedStateFromProps(){
    //     //console.log(' this.props.indexName', this.props.indexName)
    //    // this.setState({selectedWatchlist : this.props.indexName }); 
    // }

    componentDidMount() {

        var beginningTime = moment('9:15am', 'h:mma');
        var endTime = moment('3:30pm', 'h:mma');
        const friday = 5; // for friday
        var currentTime = moment(new Date(), "h:mma");
        const today = moment().isoWeekday();
        //market hours
        if (today <= friday && currentTime.isBetween(beginningTime, endTime)) {
            console.log("setInterval");
            setInterval(() => {
                this.checkLiveBids();
            }, 5 * 60000);
        }

        // setInterval(() => {
        //     this.checkLiveBids();
        // }, 5 * 60000);


      this.checkLiveBids();


        this.getBackUpDate();

        console.log("ddd", this.state.selectedWatchlist);
    }



    onChangeWatchlist = (e) => {
        clearInterval(this.state.findlast5minMovementInterval);
        this.setState({ [e.target.name]: e.target.value }, function () {
            // this.findlast5minMovement(); //one time only
            //this.startSearching();
            this.checkLiveBids();

        });
    }

    onChangeBackDate = (e) => {
        this.setState({ [e.target.name]: e.target.value }, function () {
            this.getByDateBidHistory();

        });
    }

    backupData = () => {
        console.log(this.state.backupDeleverydata);
        AdminService.saveDeliveryData({ backupDeleverydata: this.state.backupDeleverydata }).then(storeRes => {
            console.log("storeRes", new Date().toLocaleTimeString(), storeRes);
        });
    }

    updatebidHistory =(storeResData)=> {

        console.log("storeResData", storeResData);


        this.state.liveBidsList.forEach(element => {
                
            let symbolHist = storeResData.length &&  storeResData.filter(item => item.symbol == element.symbol); 

            
            let buyHist = [], sellHist=[], lastbuybid=0, lastsellbid=0;  
            symbolHist.forEach((element , index)=> {
              
               if(lastbuybid){
                   buyHist.push(((element.totalBuyBid - lastbuybid)*100/lastbuybid).toFixed(2)); 
               }

               if(lastsellbid){
                   sellHist.push(((element.totalSellBid - lastsellbid)*100/lastsellbid).toFixed(2)); 
               }
               lastbuybid = element.totalBuyBid; 
               lastsellbid = element.totalSellBid; 
              
            });

            element.buybidHistory = buyHist; 
            element.sellbidHistory = sellHist; 
             
           });

           this.setState({liveBidsList : this.state.liveBidsList}); 
    }

    storeBidData = () => {
        console.log(this.state.backupBidata);

        let data = { backupBiddata: this.state.backupBidata, dbUpdateTime: moment(new Date()).format("YYYY-MM-DD HH:mm:ss") }; 
        AdminService.saveBidData(data).then(storeRes => {
            let storeResData = resolveResponse(storeRes, "noPop");
            this.updatebidHistory(storeResData.result); 
        });
    }


    checkLiveBids = async () => {

        var watchList = this.state.staticData[this.state.selectedWatchlist];
        this.setState({ liveBidsList: [], backupDeleverydata: [], backupBidata: [] });

        console.log("watchList", this.state.staticData)

        var delData = [];
        for (let index = 0; index < watchList.length; index++) {
            const row = watchList[index];

            AdminService.checkLiveBids(row.name).then(resd => {
                // let histdatad = resolveResponse(resd, 'noPop');

               // console.log("bid", resd.data.data)

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

                    let bidLivedata = {
                        symbol: bidlivedata.symbol,
                        priceChangePer: bidlivedata.pChange,
                        ltp: parseFloat(bidlivedata.lastPrice.split(",").join('')),
                        updatedTime: moment(bidlivedata.secDate).format("YYYY-MM-DD HH:mm:ss"),
                        totalBuyBid: parseFloat(bidlivedata.totalBuyQuantity.split(",").join('')) ? parseFloat(bidlivedata.totalBuyQuantity.split(",").join(''))  : 0,
                        totalSellBid: parseFloat(bidlivedata.totalSellQuantity.split(",").join('')) ? parseFloat(bidlivedata.totalSellQuantity.split(",").join('')) : 0, 
                   
                        quantityTraded : bidlivedata.quantityTraded != '-' ? parseFloat(bidlivedata.quantityTraded.split(",").join('')) : 0, 
                        deliveryToTradedQuantity: parseFloat(bidlivedata.deliveryToTradedQuantity.split(",").join('')),  
                        deliveryQuantity: parseFloat(bidlivedata.deliveryQuantity.split(",").join('')), 
                 
                        averagePrice: parseFloat(bidlivedata.averagePrice.split(",").join('')),
                        buyPrice1: parseFloat(bidlivedata.buyPrice1.split(",").join('')),
                        buyPrice2:  parseFloat(bidlivedata.buyPrice2.split(",").join('')),
                        buyPrice3:  parseFloat(bidlivedata.buyPrice3.split(",").join('')),
                        buyPrice4:  parseFloat(bidlivedata.buyPrice4.split(",").join('')),
                        buyPrice5:  parseFloat(bidlivedata.buyPrice5.split(",").join('')),
                        buyQuantity1:  parseFloat(bidlivedata.buyQuantity1.split(",").join('')),
                        buyQuantity2:  parseFloat(bidlivedata.buyQuantity2.split(",").join('')),
                        buyQuantity3:  parseFloat(bidlivedata.buyQuantity3.split(",").join('')),
                        buyQuantity4:  parseFloat(bidlivedata.buyQuantity4.split(",").join('')),
                        buyQuantity5:  parseFloat(bidlivedata.buyQuantity5.split(",").join('')),

                        sellPrice1:  parseFloat(bidlivedata.sellPrice1.split(",").join('')),
                        sellPrice2:  parseFloat(bidlivedata.sellPrice2.split(",").join('')),
                        sellPrice3:  parseFloat(bidlivedata.sellPrice3.split(",").join('')),
                        sellPrice4:  parseFloat(bidlivedata.sellPrice4.split(",").join('')),
                        sellPrice5:  parseFloat(bidlivedata.sellPrice5.split(",").join('')),
                        sellQuantity1:  parseFloat(bidlivedata.sellQuantity1.split(",").join('')),
                        sellQuantity2:  parseFloat(bidlivedata.sellQuantity2.split(",").join('')),
                        sellQuantity3:  parseFloat(bidlivedata.sellQuantity3.split(",").join('')),
                        sellQuantity4:  parseFloat(bidlivedata.sellQuantity4.split(",").join('')),
                        sellQuantity5:  parseFloat(bidlivedata.sellQuantity5.split(",").join('')),
                        
                       

                    }


                    this.setState({ backupBidata: [...this.state.backupBidata, bidLivedata] });

                    if (index === watchList.length - 1) {
                        setTimeout(() => {
                            console.log("last loaggged")
                            this.storeBidData();
                        }, 1000);
                    }

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

    getDeliveryHistory = () => {


        for (let index = 0; index < this.state.liveBidsList.length; index++) {
            const element = this.state.liveBidsList[index];
            AdminService.getDeliveryDataFromDb(element.symbol)
                .then((res) => {
                    let data = resolveResponse(res, "noPop");
                    console.log("hist data", data.result);
                    if (data && data.result) {
                        var result = data.result;
                        element.delHistory = result;
                        console.log(element.symbol, result);

                        this.setState({ liveBidsList: this.state.liveBidsList });
                    }
                });
        }
    }

    getByDateBidHistory = () => {
        this.setState({ liveBidsList: []});

        var watchList = this.state.staticData[this.state.selectedWatchlist];
        let allSymbol = []; 
        watchList.forEach(element => {
            allSymbol.push( "'" + element.name+"'"); 
        });

        AdminService.getBidDataFromDb(this.state.backDate,  allSymbol.join(','), allSymbol.length )
            .then((res) => {
                let data = resolveResponse(res, "noPop");
                console.log("hist bidHistoty",data.result);
                
                if (data && data.result) {
                    var result = data.result;
                
                    for (let index = 0; index < result.length; index++) {
                        const bidlivedata = result[index];
                        
                        let data = {
                            quantityTraded : bidlivedata.quantityTraded,
                            deliveryQuantity : bidlivedata.deliveryQuantity, 
                            totalBuyQuantity :  bidlivedata.totalBuyBid , 
                            totalSellQuantity : bidlivedata.totalSellBid, 
                            lastPrice : bidlivedata.ltp, 
                            pChange: bidlivedata.priceChangePer,
                            symbol : bidlivedata.symbol,
                            updatedTime :bidlivedata.updatedTime 

                        }

    
                        data.buytosellTime = bidlivedata.totalBuyBid / bidlivedata.totalSellBid;
                        data.selltobuyTime = bidlivedata.totalSellBid / bidlivedata.totalBuyBid;
    
                        if (bidlivedata.totalBuyBid / bidlivedata.totalSellBid > 1.25) {
                            data.highlightbuy = true;
                        }
    
                        if (bidlivedata.totalSellBid / bidlivedata.totalBuyBid > 1.25) {
                            data.highlightsell = true;
                        }
    
                    
                        this.setState({ liveBidsList: [...this.state.liveBidsList, data], lastUpdateTime: this.state.backDate }, function () {
                           
                            this.state.liveBidsList.sort(function (a, b) {
                                return b.pChange - a.pChange;
                            });

                        });
                    }
                    this.updatebidHistory(data.bidHistoty); 
                }
            });
    }

    getBackUpDate = () => {
        AdminService.getBackUpdateList()
            .then((res) => {
                let data = resolveResponse(res, "noPop");
                console.log(data);
                if (data && data.result) {

                    let result = [];
                    data.result.forEach(element => {
                        if (element.dbUpdateTime) {
                            result.push(moment(element.dbUpdateTime).format("YYYY-MM-DD HH:mm:ss"));
                        }
                    });

                    this.setState({ backupDateList: result }, function () {
                       // console.log("dates", this.state.backupDateList)
                    });
                }
            });
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

                {window.location.hash === "#/delivery" ? <PostLoginNavBar /> : ""}


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


                                        <TableCell align="center" ><Button onClick={() => this.getDeliveryHistory()}>Delivery History</Button>  </TableCell>



                                    </TableRow>
                                </TableHead>
                                <TableBody>


                                    {this.state.liveBidsList ? this.state.liveBidsList.map((row, i) => (
                                        <TableRow hover key={i} style={{ background: this.getPercentageColor(row.pChange) }}>

                                            <TableCell align="left">{row.symbol} {row.lastPrice} ({row.pChange}%)</TableCell>
                                            <TableCell style={{ background: row.highlightbuy ? "lightgray" : "" }} align="center">
                                              
                                                {row.buytosellTime.toFixed(2)} time buy</TableCell>

                                            <TableCell style={{ background: row.highlightsell ? "lightgray" : "" }} align="center">
                                             
                                                {row.selltobuyTime.toFixed(2)} time sell</TableCell>

                                     

                                            <TableCell align="center" style={{background: "#eceff1" }}>
                                                    {row.buybidHistory &&  row.buybidHistory.map(item => (
                                                        <span style={{color: item>0 ? "green" : "red"}}> {item}% </span>
                                                    ))}
                                                <br />
                                                {row.totalBuyQuantity} {this.convertToFloat(row.totalBuyQuantity)}</TableCell>
                                            <TableCell align="center" style={{background: "#eceff1" }}>
                                                    {row.sellbidHistory &&  row.sellbidHistory.map(item => (
                                                        <span style={{color: item>0 ? "green" : "red"}}> {item}% </span>
                                                    ))}
                                                <br />
                                                {row.totalSellQuantity} {this.convertToFloat(row.totalSellQuantity)}</TableCell>

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

                                            <TableCell style={{ background: "#eceff1" }} align="center">

                                                {row.delHistory && row.delHistory.map(item => (
                                                    <span> {new Date(item.datetime).toLocaleDateString()}  &nbsp;
                                                        <span title={"quantityTraded " + item.quantityTraded}> {(item.quantityTraded / 100000).toFixed(2)}L  </span>  &nbsp;
                                                        <span title={"deliveryToTradedQuantity"}> {item.deliveryToTradedQuantity}%  </span>  &nbsp;
                                                        <span title={"deliveryQuantity " + item.deliveryQuantity}> {(item.deliveryQuantity / 100000).toFixed(2)}L  </span>  &nbsp;
                                                        <span style={{ color: item.todayChange > 0 ? "green" : "red" }}> ({item.todayChange}%)   </span>
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