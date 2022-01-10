import React from 'react';
import Typography from "@material-ui/core/Typography";
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
import * as moment from 'moment';
import Notify from "../../utils/Notify";

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Spinner from "react-spinner-material";
import { createChart } from 'lightweight-charts';
import ChartDialog from './ChartDialog';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import vwap from 'vwap';
import { SMA, RSI, VWAP, BollingerBands } from 'technicalindicators';
import ShowChartIcon from '@material-ui/icons/ShowChart';
import CsvDownload from 'react-json-to-csv'


class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
       
            symbolList: localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')) || [],
            totalWatchlist: localStorage.getItem('totalWatchlist') && JSON.parse(localStorage.getItem('totalWatchlist')) || [],
            staticData: localStorage.getItem('staticData') && JSON.parse(localStorage.getItem('staticData')) || {},
            selectedWatchlist: 'NIFTY 50', //'Securities in F&O',
            stopScaningFlag: false,
            backTestResultDateRange: [],
            searchFailed: 0,
       
            backTestFlag: true,
            backupHistoryStatus : []
        };
        this.myCallback = this.myCallback.bind(this);

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

    myCallback = (date, fromDate) => {
        if (fromDate === "START_DATE") {
            this.setState({ startDate: date });
        } else if (fromDate === "END_DATE") {
            this.setState({ endDate: date });
        }
    };


    componentDidMount() {

        window.document.title = "Backtest";
        this.setState({ symbolList: this.state.staticData[this.state.selectedWatchlist] }, function(){            


            this.getCandleHistoryAndStore(); 

            const friday = 5; // for friday
            var currentTime = moment(new Date(), "h:mma");
            const today = moment().isoWeekday();
            var beginningTime = moment('9:15am', 'h:mma');
            var endTime = moment('3:30pm', 'h:mma');
    
            if (today <= friday && currentTime.isBetween(beginningTime, endTime)) {
                var tostartInteral =   setInterval(() => {
                    var time = new Date(); 
                    if(time.getSeconds() === 0){
                        setTimeout(() => {
                            this.getCandleHistoryAndStore(); 
                        }, 10000);
                        setInterval(() => {
                            this.getCandleHistoryAndStore(); 
                         }, 60000 * 1 + 10000 );  
                         clearInterval(tostartInteral); 
                    } 
                }, 1000);
            }
        });
      
    }

    
    getCandleHistoryAndStore = async () => {

        console.log("last candle called time", new Date().toLocaleTimeString());
        var stop = new Date().toLocaleTimeString() > "15:00:00" ? clearInterval(this.state.candleHistoryInterval) : "";
        var timediff = moment.duration("00:01:00");
        this.setState({ backupHistoryStatus: [] });

        const format1 = "YYYY-MM-DD HH:mm";
        var startdate = moment(new Date()).subtract(timediff);

        let symbolList  = this.state.symbolList; 

    //    console.log("watchlist to backup", symbolList)
        for (let index = 0; index < symbolList.length; index++) {
            const element = symbolList[index];
            var data = {
                "exchange": "NSE",
                "symboltoken": element.token,
                "interval": "ONE_MINUTE", //ONE_DAY FIVE_MINUTE    FIFTEEN_MINUTE
                "fromdate": moment(startdate).format(format1),
                "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
            }

            let status = {
                symbol: element.name,
                startDate: moment(startdate).format(format1),
                endDate:  moment(new Date()).format(format1) ,
                downloadStatus: false,
                noOfRows : 0, 
                backStatus : false,
                hugeVol: false
            }


            AdminService.getHistoryData(data).then(res => {
                let histdata = resolveResponse(res, 'noPop');
                //console.log("candle history", histdata); 
                if (histdata && histdata.data && histdata.data.length) {

                    let requestInfo = {
                        symbol: element.symbol,
                        token: element.token,
                        candleData: histdata.data,
                        analysis: true
                    }
                    status.downloadStatus = true; 
                    AdminService.backupHistoryData(requestInfo).then(res => {
                        status.backStatus = true ;
                      //  console.log("test", res.data);
                        status.noOfRows =  res.data && res.data.result; 
                        status.hugeVol =  res.data && res.data.hugeVol

                        if(res.data && res.data.hugeVol){
                            console.log( ' huge Volume in '+ element.symbol)
                                var msg = new SpeechSynthesisUtterance();
                                msg.text = ' huge Volume in '+ element.symbol;
                                window.speechSynthesis.speak(msg);
                        }

                    })

                } else {
                    //localStorage.setItem('NseStock_' + symbol, "");
                    console.log(" candle data emply");
                }
            })
            await new Promise(r => setTimeout(r, 310));
            this.setState({backupHistoryStatus: [...this.state.backupHistoryStatus, status]  }); 

        }


    }

    stopBacktesting = () => {
        this.setState({ stopScaningFlag: true });
    }

    storyHistoryData = async () => {

        let filename = this.state.patternType + " " + this.state.selectedWatchlist + " " + moment(this.state.startDate).format("YYYY-MM-DD") + " " + moment(this.state.endDate).format("YYYY-MM-DD") + ".csv";
        this.setState({ backupHistoryStatus: [], backTestFlag: false, filename: filename, stopScaningFlag: false });

      //  console.log('filename', filename);
        
        var watchList = this.state.symbolList; //localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')); 
        var runningTest = 1;

        var date1 = moment(this.state.startDate);
        var date2 = moment(this.state.endDate);
        let nod = date2.diff(date1, 'days'); 
        let looptime = Math.ceil(nod/30); 
        console.log("nod", looptime); 

        //  currentDate = moment(this.state.startDate).set('9:15am', 'h:mma'); 
        // var endDate =  moment(currentDate).add(29, 'days');
//        endDate = moment(endDate).set('3:30pm', 'h:mma') ; 

        let loopStartDate =  moment(this.state.startDate).set('9:15am', 'h:mma'); 

        for (let outterIndex = 0; outterIndex < looptime; outterIndex++) {

            let loopEndDate = moment(loopStartDate).add(29, 'days');
            console.log("nod", looptime); 

            
            for (let index = 0; index < watchList.length; index++) {
                const element = watchList[index];
    
                if (this.state.stopScaningFlag) {
                    break;
                }              
    
                var data = {
                    "exchange": "NSE",
                    "symboltoken": element.token,
                    "interval": "ONE_MINUTE", //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
                    "fromdate":moment(loopStartDate).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
                    "todate": loopEndDate.format("YYYY-MM-DD HH:mm") // moment("2020-06-30 14:00").format("YYYY-MM-DD HH:mm") 
                }
    
                let status = {
                    symbol: element.name,
                    startDate: moment(loopStartDate).format("DD-MM-YYYY"),
                    endDate:  moment(loopEndDate).format("DD-MM-YYYY"),
                    downloadStatus: false,
                    noOfRows : 0, 
                    backStatus : false
                }
    
    
                AdminService.getHistoryData(data).then(res => {
                    let histdata = resolveResponse(res, 'noPop');
                    //console.log("candle history", histdata); 
                    if (histdata && histdata.data && histdata.data.length) {
    
                        histdata.data.pop(); 
    
                        let requestInfo = {
                            symbol: element.symbol,
                            token: element.token,
                            candleData: histdata.data
                        }
                        status.downloadStatus = true; 
                      
                        AdminService.backupHistoryData(requestInfo).then(res => {
                            status.backStatus = true ;
    
                            console.log("test", res.data);
                            status.noOfRows =  res.data && res.data.result; 
    
                        })
    
                    } else {
                        //localStorage.setItem('NseStock_' + symbol, "");
                        console.log(" candle data emply");
                    }
                })
                await new Promise(r => setTimeout(r, 400));
                this.setState({ stockTesting: index + 1 + ". " + element.symbol, runningTest: runningTest }); 
           
                this.setState({backupHistoryStatus: [...this.state.backupHistoryStatus, status]  }); 
    
                this.setState({done: true  })
    
                console.log("status", status)

                          
                
            }

            loopStartDate = loopEndDate; 
            await new Promise(r => setTimeout(r, 400 * watchList.length));
        
            
        }

      

        this.setState({ backTestFlag: true });

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
        var tradetotal = 0, totalWin = 0, totalLoss = 0, totalMarketEnd = 0, totalSlHit = 0;
        return (
            <React.Fragment>
                <PostLoginNavBar />
                <ChartDialog />
                <Grid direction="row" container spacing={1} style={{ padding: "5px" }} >



                    <Grid item xs={12} sm={12}>


                        <Paper style={{ padding: "10px" }}>
                            <Typography style={{ textAlign: "center", background: "lightgray" }}>History Backup</Typography>



                            <Grid direction="row" container spacing={2}>


                                {/* <Grid item xs={12} sm={2}>
                                    <FormControl style={styles.selectStyle}>
                                        <InputLabel htmlFor="Nationality">Pattern Type</InputLabel>
                                        <Select value={this.state.patternType} name="patternType" onChange={this.onChangePattern}>
                                            <MenuItem value={"TweezerTop"}>Tweezer Top</MenuItem>
                                            <MenuItem value={"TweezerBottom"}>Tweezer Bottom</MenuItem>
                                            <MenuItem value={"NR4"}>NR4 @ 3:30pm </MenuItem>
                                            <MenuItem value={"NR4Trail"}>Narrow Range 4 - Trail</MenuItem>

                                            <MenuItem value={"NR4ForNextDay"}>NR4 For Next Day</MenuItem>

                                            <MenuItem value={"NR4_SameDay"}>NR4 ByDate</MenuItem>
                                            <MenuItem value={"NR4_Daywide_daterage"}>NR4 Daywise Range</MenuItem>
                                            <MenuItem value={"StrongCandle"}>5min Strong Candle</MenuItem>

                                        </Select>
                                    </FormControl>
                                </Grid> */}

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



                                <Grid item xs={12} sm={4}>
                                    <MaterialUIDateTimePicker callbackFromParent={dateParam} />
                                </Grid>



                                <Grid item xs={12} sm={4} style={{ marginTop: '5px' }}>
                                    {this.state.backTestFlag ? <Button variant="contained" onClick={() => this.storyHistoryData()}>Backup</Button> : <> <Button> <Spinner /> &nbsp; <Button variant="contained" onClick={() => this.stopBacktesting()}>Stop Scaning</Button> &nbsp;  {this.state.stockTesting} {this.state.runningTest}  </Button>   </>}
                                    &nbsp; Failed: {this.state.searchFailed}

                                </Grid>


                            </Grid>


                        </Paper>

                        <Paper style={{ padding: "10px" }}>

                        <Table size="small" aria-label="sticky table" >
                                        <TableHead style={{ width: "", whiteSpace: "nowrap" }} variant="head">
                                            <TableRow variant="head" style={{ fontWeight: 'bold' }} >
                                            <TableCell className="TableHeadFormat" >Sr. No.</TableCell>
                                                <TableCell className="TableHeadFormat" >Symbol</TableCell>
                                                <TableCell className="TableHeadFormat" >From date</TableCell>
                                                <TableCell className="TableHeadFormat" >To date  </TableCell>
                                                <TableCell className="TableHeadFormat" >Download Status</TableCell>
                                                <TableCell className="TableHeadFormat" >Backup Status</TableCell>
                                                <TableCell className="TableHeadFormat" >No of Rows</TableCell>
                                                <TableCell className="TableHeadFormat" >Huge Volume(last 100min)</TableCell>

                         

                                            </TableRow>
                                        </TableHead>
                                        <TableBody style={{ width: "", whiteSpace: "nowrap" }}>
                                            {/* this.getPercentageColor((row[4] - row[1])*100/row[1] >= 0.3)  */}
                                            {this.state.backupHistoryStatus && this.state.backupHistoryStatus ? this.state.backupHistoryStatus.map((row, i) => (
                                                <TableRow key={i}  >
                                                    <TableCell >{i+1}</TableCell>
                                                    <TableCell >{row.symbol}</TableCell>
                                                    <TableCell >{row.startDate}</TableCell>
                                                    <TableCell >{row.endDate}</TableCell>
                                                    <TableCell >{row.downloadStatus ? "Yes": "No"}</TableCell>
                                                    <TableCell >{row.backStatus ? "Yes": "No"}</TableCell>
                                                    <TableCell >{row.noOfRows}</TableCell>
                                                    <TableCell >{row.hugeVol ? "Yes" : "-"}</TableCell>

                                                 
                                                </TableRow>
                                            )) : ''}

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

export default Home;

