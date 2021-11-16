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
            selectedWatchlist: 'NIFTY BANK', //'Securities in F&O',
            symbolList :  [],
            softedIndexList:[],
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
                 'NIFTY OIL AND GAS':"notfound",
                 'NIFTY 100':"notfound", 
                 'NIFTY CONSR DURBL':'notfond'
            },
        };
        this.updateSocketWatch = this.updateSocketWatch.bind(this);

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
               //     console.log(foundLive[0]); 

                    symbolListArray[index].ltp = foundLive[0].ltp;
                    symbolListArray[index].pChange = foundLive[0].nc;
                    symbolListArray[index].totalBuyQuantity = foundLive[0].tbq;
                    symbolListArray[index].totalSellQuantity = foundLive[0].tsq;
                    symbolListArray[index].totalTradedVolume = foundLive[0].v;
                    symbolListArray[index].averagePrice = foundLive[0].ap;

                    symbolListArray[index].bestbuyquantity = foundLive[0].bq;
                    symbolListArray[index].bestbuyprice = foundLive[0].bp;
                    symbolListArray[index].bestsellquantity = foundLive[0].bs;
                    symbolListArray[index].bestsellprice = foundLive[0].sp;
                   
                    // symbolListArray[index].upperCircuitLimit = foundLive[0].ucl;
                    // symbolListArray[index].lowerCircuitLimit = foundLive[0].lcl;

                    symbolListArray[index].buytosellTime = (foundLive[0].tbq / foundLive[0].tsq).toFixed(2);
                    symbolListArray[index].selltobuyTime =  (foundLive[0].tsq / foundLive[0].tbq).toFixed(2); 
                    
                    if (foundLive[0].tbq / foundLive[0].tsq > 2) {
                        symbolListArray[index].highlightbuy = true;
                    }else{
                        symbolListArray[index].highlightbuy = false;
                    }

                    if (foundLive[0].tsq / foundLive[0].tbq > 2) {
                        symbolListArray[index].highlightsell = true;
                    }else{
                        symbolListArray[index].highlightsell = false;
                    }

                    //console.log("ws onmessage: ", foundLive);
                }
            });

            console.log("sortby",this.state.sortedType)
            let shortBy = this.state.sortedType; 
            symbolListArray && symbolListArray.sort(function (a, b) {
                return b[shortBy] - a[shortBy] ;
            });
            this.setState({ symbolList: symbolListArray });
        }

        wsClint.onerror = (e) => {
            console.log("socket error", e);
        }

        setInterval(() => {
            //  this.makeConnection();
            var _req = '{"task":"hb","channel":"","token":"' + this.state.feedToken + '","user": "' + this.state.clientcode + '","acctid":"' + this.state.clientcode + '"}';
             console.log("Request :- " + _req);
            wsClint.send(_req);
        }, 59000);
    }


    componentDidMount() {

        window.document.title = "WS Bid Live";
        this.setState({ symbolList: this.state.staticData[this.state.selectedWatchlist] });

        var tokens = JSON.parse(localStorage.getItem("userTokens"));
        var feedToken = tokens && tokens.feedToken;
        var userProfile = JSON.parse(localStorage.getItem("userProfile"));
        var clientcode = userProfile && userProfile.clientcode;
        this.setState({ feedToken: feedToken, clientcode: clientcode }, function(){
            this.wsClint = new w3cwebsocket('wss://omnefeeds.angelbroking.com/NestHtml5Mobile/socket/stream');
            this.updateSocketDetails(this.wsClint);  
        });
        this.getUpdateIndexData()
    }

    getUpdateIndexData=()=>{
        this.setState({softedIndexList : []})
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
                        this.setState({ softedIndexList: [...this.state.softedIndexList ,element] });
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

    onChangeWatchlist = (e) => {
        this.setState({ [e.target.name]: e.target.value }, function () {
            var watchList = this.state.staticData[this.state.selectedWatchlist];
            this.setState({ symbolList: watchList},()=> this.updateSocketWatch(this.wsClint));
        });
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
    
    convertToDecimal=(num)=>{
        if (!isNaN(num)) {
            
            return num.toFixed(2);
        }else{
            return num; 
        }
    }


    convertToFloat = (str) => {
        if (!isNaN(str)) {
            return "(" + ((str / 100000).toFixed(2)) + "L)";
        }
    }

    render() {

        // if(this.state.softedIndexList.length == 0)  {
        //     this.setState({softedIndexList  : this.state.totalWatchlist})
        // }

        return (
            <React.Fragment>
                <PostLoginNavBar LoadSymbolDetails ={this.LoadSymbolDetails} />
                {/* <ChartDialog /> */}
                
                <Grid direction="row" alignItems="center" container>
                     <Grid item xs={12} sm={12} >

                        <Paper style={{ padding: "10px" }} >

                            <Grid justify="space-between"
                                container spacing={1}>

                                <Grid item xs={12} sm={4} >
                                    <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                      WS Bid Live  {this.state.selectedWatchlist} ({this.state.symbolList.length}) updated at {this.state.lastUpdateTime}
                                    </Typography>

                                    <span>Sorted By:  {this.state.sortedType} </span>
                                </Grid>


                                <Grid item xs={12} sm={2} >
                                    <FormControl style={styles.selectStyle} >
                                        <InputLabel htmlFor="gender">Select Watchlist</InputLabel>
                                        <Select value={this.state.selectedWatchlist} name="selectedWatchlist" onChange={this.onChangeWatchlist}>
                                            {/* <MenuItem value={"selectall"}>{"Select All"}</MenuItem> */}

                                            {this.state.softedIndexList && this.state.softedIndexList.map(element => (
                                                <MenuItem style={{color: element.percChange>0 ? "green": "red"}} value={element.indexName}>{element.indexName} ({element.percChange}%)</MenuItem>
                                            ))
                                            }
                                            <MenuItem value={"Securities in F&O"}>{"Securities in F&O"}</MenuItem>
                                     

                                        </Select>
                                    </FormControl>
                                </Grid>


                                <Grid item xs={12} sm={3} >
                                    <Button variant="contained" style={{ marginRight: '20px' }} onClick={() => this.getUpdateIndexData()}>Refresh</Button>
                                </Grid>

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

                                        <TableCell  ><Button onClick={() => this.sortByColumn("buytosellTime")}> Total Buy Quantity</Button>  </TableCell>
                                        <TableCell align="left"><Button onClick={() => this.sortByColumn("pChange")}> Symbol </Button> </TableCell>
                                        <TableCell >VWAP Price</TableCell>

                                        <TableCell ><Button onClick={() => this.sortByColumn("selltobuyTime")}> Total Sell Quantity</Button>  </TableCell>

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


                                        <TableCell >Best Buy Qty</TableCell>
                                        <TableCell >Best Buy Price</TableCell>
                                        <TableCell >Best Sell Qty</TableCell>
                                        <TableCell >Best Sell Price</TableCell>

                                    </TableRow>
                                </TableHead>
                                <TableBody>


                                    {this.state.symbolList ? this.state.symbolList.map((row, i) => (
                                        <TableRow hover key={i} >

                                            {/* <TableCell >{row.upperCircuitLimit}</TableCell>
                                            <TableCell >{row.lowerCircuitLimit}</TableCell> */}

                                            {/* <TableCell style={{ background: row.highlightbuy ? "lightgray" : "" }} >
                                                {row.buytosellTime ? row.buytosellTime +" time buy" : ""}
                                            </TableCell>
                                            <TableCell style={{ background: row.highlightsell ? "lightgray" : "" }} >
                                                {row.selltobuyTime ? row.selltobuyTime+" time sell" : ""} 
                                            </TableCell> */}

                                            <TableCell  style={{ background: row.highlightbuy ? "#FFFF00" : "" }}  >
                                                    {/* {row.buybidHistory &&  row.buybidHistory.map(item => (
                                                        <span style={{color: item>0 ? "green" : "red"}}> {item}% </span>
                                                    ))} */}
                                                {row.buytosellTime ? `Buy ${row.buytosellTime} times` : ""}

                                                &nbsp; {row.totalBuyQuantity} {this.convertToFloat(row.totalBuyQuantity)}
                                              
                                            </TableCell>
                                            <TableCell align="left"  style={{ background: this.getPercentageColor(row.pChange) }} > {row.name} {row.ltp} {row.pChange ? `(${row.pChange}%)` : ""} </TableCell>
                                            <TableCell style={{height:'25px', background: row.ltp ? row.ltp >= row.averagePrice ? "green" : "red" : "white"}}>{row.averagePrice}</TableCell>


                                            <TableCell style={{ background: row.highlightsell ? "#FFFF00" : "" }}>
                                                    {/* {row.sellbidHistory &&  row.sellbidHistory.map(item => (
                                                        <span style={{color: item>0 ? "green" : "red"}}> {item}% </span>
                                                    ))} */}
                                            {row.selltobuyTime ? `Sell ${row.selltobuyTime} times` : ""} 

                                            &nbsp; {row.totalSellQuantity} {this.convertToFloat(row.totalSellQuantity)}
                                  
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

                                            <TableCell >{row.bestbuyquantity}</TableCell>
                                            <TableCell >{row.bestbuyprice}</TableCell>
                                            <TableCell >{row.bestsellquantity}</TableCell>
                                            <TableCell >{row.bestsellprice}</TableCell>

                                               

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
    selectStyle: {
        minWidth: '100%',
        marginBottom: '10px'
    }
};

export default LiveBid;

