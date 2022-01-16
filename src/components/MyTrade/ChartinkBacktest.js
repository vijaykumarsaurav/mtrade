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
import TextField from '@material-ui/core/TextField';


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
            backTestResultCSV: [], 
            backTestFlag: true,
            patternType: "NR4",  //NR4ForNextDay  NR4_SameDay
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
            FoundPatternList: localStorage.getItem('FoundPatternList') && JSON.parse(localStorage.getItem('FoundPatternList')) || [],
            fastMovementList: localStorage.getItem('fastMovementList') && JSON.parse(localStorage.getItem('fastMovementList')) || [],
            newJsonList: [],
            timeFrame :"FIVE_MINUTE", 
            overAllResult: []
        };

    }
    onChange = (e) => {
        this.setState({[e.target.name] : e.target.value })
    }

    onInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value }, function () {
            //    console.log("time", this.state.timeFrame);
            if (this.state.tradingsymbol) {
                this.showStaticChart(this.state.symboltoken);
            }
        });
    }

    componentDidMount() {

        window.document.title = "Backtest";
        this.setState({ symbolList: this.state.staticData[this.state.selectedWatchlist] });

        const domElement = document.getElementById('tvchart');
        document.getElementById('tvchart').innerHTML = '';
        const chart = createChart(domElement, { width: 550, height: 250, timeVisible: true, secondsVisible: true, });
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
    }

    stopBacktesting = () => {
        this.setState({ stopScaningFlag: true });
    }

    readCsv = async(callback) => {
        this.setState({newJsonList :[]})
        let csvFormatInput = this.state.csvFormatInput.trim().split('\n');
        for (let index = 0; index < csvFormatInput.length; index++) {
          const element = csvFormatInput[index];
          let symbol = element.split('\t')[1]; 
          let startTime = element.split('\t')[0]; 
          this.setState({ stockTesting: index + 1 + ". " + symbol + " getting details" })

          console.log(element, symbol, startTime);

          // "13-01-2022 11:20\tSHREEPUSHK\tSmallcap\tIndustrials"
  
          AdminService.autoCompleteSearch(symbol).then(searchRes => {
  
            let searchResdata =  searchRes.data; 
            var found = searchResdata.filter(row => row.exch_seg  === "NSE" &&  row.lotsize === "1" && row.name === symbol);                                
            console.log("found",  found)

            if(found.length){ 
                found[0].startTime = startTime;
               this.setState({ newJsonList: [...this.state.newJsonList, found[0]] }, ()=> {
                   if(csvFormatInput.length-1 == index){
                    callback()
                    }
               });
            }
          
         })
  
         await new Promise(r => setTimeout(r, 50));  
        
         
        }
        
      }

    backTestAnyPattern =  () => {

        this.setState({ backTestResult: [],overAllResult : [],  backTestFlag: false, filename: '', searchFailed:0 });



        this.readCsv( async()=> {
        let newJsonList = this.state.newJsonList; 
        for (let index = 0; index < newJsonList.length; index++) {

            if (this.state.stopScaningFlag) {
                this.setState({stopScaningFlag : false})
                break;
            }

            const element = newJsonList[index];
            let dateinfo = element.startTime.split(' ');
            let date = dateinfo[0].split('-');
            let input = date[2] + '/' + date[1] + '/' + date[0] ;
            let time = moment(dateinfo[1], 'HH:mm:ss').format('HH:mm'); 
            var startDate = moment(input + ' ' + time);
            var marketendtime = "15:30";
            var endtime = moment(input + ' ' + marketendtime);
             if(this.state.timeFrame == 'ONE_DAY' ){
                endtime = moment(startDate, "DD-MM-YYYY").add(5, 'days');
                let nextdate = moment(endtime).format("YYYY-MM-DD"); 
               endtime = moment(nextdate + ' ' + marketendtime); 
            }

            var data = {
                "exchange": "NSE",
                "symboltoken": element.token,
                "interval": this.state.timeFrame, //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
                "fromdate": moment(startDate).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
                "todate": moment( endtime ).format("YYYY-MM-DD HH:mm") // moment("2020-06-30 14:00").format("YYYY-MM-DD HH:mm") 
            }

            AdminService.getHistoryData(data).then(res => {
                let histdata = resolveResponse(res, 'noPop');
                if (histdata && histdata.data && histdata.data.length) {

                    var candleData = histdata.data;
                    let stock = {
                        symbol: element.symbol, 
                        token:element.token, 
                        entryPrice : candleData[0][4], 
                        foundAt: moment(candleData[0][0]).format('YYYY-MM-DD HH:mm')   
                    }

                    let priceChangeList = []; 
                    for (let index2 = 1; index2 < candleData.length; index2++) {
                        let perChange =  (candleData[index2][4] - stock.entryPrice) * 100 / stock.entryPrice; 
                        let datetime = moment(candleData[index2][0]).format('h:mma')
                        if(this.state.timeFrame == 'ONE_DAY' ){
                            datetime = moment(candleData[index2][0]).format('DD/MM/YYYY h:mma')
                        }
                        priceChangeList.push({perChange : perChange.toFixed(2),close: candleData[index2][4],  datetime :  datetime}); 
                    }
                    stock.candleData = priceChangeList; 
                    this.setState({ backTestResult: [...this.state.backTestResult, stock] }, ()=>{
                        this.updateOverall(); 
                    });
                } else {
                    console.log(" candle data emply");
                    this.setState({ searchFailed: this.state.searchFailed + 1 })

                }
            }).catch((error)=>{
                console.log(element.symbol, error)
                this.setState({ searchFailed: this.state.searchFailed + 1 })

            })
            await new Promise(r => setTimeout(r, 350));
            this.setState({ stockTesting: index + 1 + ". " + element.symbol })
        }
        this.setState({ backTestFlag: true });

    
    });//callback end 



    }

    updateOverall =()=>{
       // this.setState({ overAllResult : [] });


        let timelist = []; 
        this.state.backTestResult.forEach(element => {
            element.candleData.forEach((item)=>{ 
               let found = timelist.filter((time)=> time === item.datetime); 
               if(!found[0]){   
                    timelist.push(item.datetime);  
               }
            }); 
        });

        let overallData = []; 

        timelist.forEach(timeelement => {
            let sumofall = 0;
            this.state.backTestResult.forEach(element => {
                for (let index = 0; index <  element.candleData.length; index++) {
                    const item = element.candleData[index];
                    if(timeelement === item.datetime ){
                        sumofall += parseFloat(item.perChange)
                        break; 
                    }
                }
            });

            let expence =  this.state.backTestResult.length * 0.06; 
            overallData.push({
                datetime: timeelement,
                sumofall: sumofall.toFixed(2), 
                expence : expence.toFixed(2), 
                netOverAll : (sumofall-expence).toFixed(2),
                noOfTrade: this.state.backTestResult.length
            })
        });
    

        this.setState({ overAllResult: overallData.reverse() }, ()=>{
           console.log('overAllResult', this.state.overAllResult)
        });
        
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
    
    showStaticChart = (token, symbol, entryAt, exitAt) => {

        

        console.log('token, symbol, entryAt, exitAt', token, symbol, entryAt, exitAt)

        this.setState({ chartStaticData: '' , lightChartSymbol :symbol }, function () {
            console.log('reset done', token);
        });

    //     console.log("time in function ", this.state.timeFrame);

        const format1 = "YYYY-MM-DD HH:mm";
    //     // var time = moment.duration("10:50:00");
    //     // var startDate = moment(new Date()).subtract(time);
    //     // var startdate = moment(this.state.startDate).subtract(time);
    //     var beginningTime = moment('9:15am', 'h:mma');

    //     let timeDuration = this.getTimeFrameValue(this.state.timeFrame);
    //     var time = moment.duration(timeDuration);  //22:00:00" for last day  2hours 
    //    // var startDate = moment(new Date(foundAt)).set()
     
       var startDate = moment(entryAt).set("hour", '09').set("minute", '15');
        var enddate = moment(exitAt).set("hour", '15').set("minute", '30');


        var data = {
            "exchange": "NSE",
            "symboltoken": token,
            "interval": this.state.timeFrame, //ONE_DAY FIVE_MINUTE 
            "fromdate": moment(startDate).format(format1),
            "todate": moment(enddate).format(format1) //moment(this.state.endDate).format(format1) /
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
                            string += " Time: <b>" + moment(param.time).format('DD/MM/YYYY h:mma') + "</b>";
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




    onFileChange =(e)=> {
        this.setState({ [e.target.name]: e.target.files[0] });       
    }

    render() {
        const dateParam = {
            myCallback: this.myCallback,
            startDate: '',
            endDate: '',
            firstLavel: "Start Date and Time",
            secondLavel: "End Date and Time"
        }
    
        console.log("backTestResult", this.state.backTestResult)

        var sumPerChange = 0, sumBrokeragePer = 0, netSumPerChange = 0, sumPerChangeHighLow = 0, sumPnlValue = 0, sumPnlValueOnHighLow = 0, totalInvestedValue = 0, totalLongTrade = 0, totalShortTrade = 0;
        var tradetotal = 0, totalWin = 0, totalLoss = 0, totalMarketEnd = 0, totalSlHit =0;
        return (
            <React.Fragment>
                <PostLoginNavBar  />
                <ChartDialog />
                <Grid direction="row" container spacing={1} style={{ padding: "5px" }} >



                    <Grid item xs={12} sm={8}>


                        <Paper style={{ padding: "10px" }}>
                            {/* <Typography style={{ textAlign: "center", background: "lightgray" }}>Chartink Backtest</Typography> */}

                            <Grid direction="row" container spacing={2}>

                                <Grid item xs={12} sm={6}>
                                    <TextField variant="outlined" multiline rows={10} fullwidth style={{width:'90%', height: '50%'}}  label="1. Datetime 2. Symbol format : Paste"  value={this.state.csvFormatInput }   name="csvFormatInput" onChange={this.onChange}/>
                                    
                                </Grid>

                                <Grid item xs={12} sm={2} > 
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


                                <Grid item xs={12} sm={4} style={{ marginTop: '5px' }}>
                                    {this.state.backTestFlag ? <Button variant="contained" onClick={() => this.backTestAnyPattern()}>Search</Button> : <>  <Spinner />  &nbsp;&nbsp;   <Button variant="contained" onClick={() => this.stopBacktesting()}>Stop Scaning &nbsp; </Button>   </>}
                                    &nbsp;&nbsp; {this.state.stockTesting} 
                                    &nbsp;&nbsp; Failed:{this.state.searchFailed}
                                    
                                   
                                </Grid>

                            </Grid>

                            <Grid direction="row" container spacing={2}>

                                <Grid item xs={12} sm={12}>

                                <div style={{overflow:"auto", maxHeight:"550px"}}> 

                                    <Table size="small" aria-label="sticky table" >

                                    <TableHead style={{ width: "", whiteSpace: "nowrap" }} variant="head">
                                
                                        <TableRow variant="head" style={{ fontWeight: 'bold' }}>
                                            <TableCell className="TableHeadFormat" >FoundAt</TableCell>
                                            <TableCell className="TableHeadFormat" >Symbol({this.state.backTestResult.length})</TableCell>
                                            <TableCell className="TableHeadFormat" >Entry</TableCell>
                                            <TableCell className="TableHeadFormat" >NextCandles</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody style={{ width: "", whiteSpace: "nowrap" }}>


                                        {this.state.backTestResult ? this.state.backTestResult.map((row, i) => (

                                            //    style={{display: row.orderActivated ? 'visible' : 'none'}} "darkmagenta" : "#00cbcb"
                                            <TableRow hover key={i}  >                            


                                                <TableCell >{row.foundAt}</TableCell>
                                                <TableCell><Button size='small' variant='contained' onClick={()=>this.showStaticChart(row.token, row.symbol, row.foundAt, row.foundAt)}>{row.symbol} </Button> </TableCell>
                                                <TableCell >{row.entryPrice}</TableCell>

                                                <TableCell >
                                                    {row.candleData.map((item, j) => (<>
                                                        <span>{item.datetime}: </span>{item.close}({item.perChange > 0 ? <span style={{ color: 'green'}}> {item.perChange}</span> : <span style={{ color: 'red' }}> {item.perChange}</span>}) &nbsp;
                                                    </>
                                                    ))}

                                                </TableCell>

                                              

                                            </TableRow>



                                        )) : ''}
                                    

                                    
                                    </TableBody>


                                    </Table>
                                    </div>


                                </Grid>


                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={4}>

                        <Paper style={{ padding: "10px" }}>

                            <Grid style={{ display: "visible" }} spacing={1} direction="row" alignItems="center" container>

                                
                                <Grid item xs={12} sm={12}  >
                                    <Grid  spacing={1} direction="row" alignItems="center" container>
                                        <Grid item xs={12} sm={2} > 
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
                                         <Grid item xs={12} sm={10} > 
                                         <Typography>Same Day Chart:  {this.state.lightChartSymbol}</Typography>

                                         </Grid>
                                        
                                    </Grid>
                                    

                                        

                                    <div id="showChartTitle"></div>
                                    <div id="tvchart"></div>
                                </Grid>

                                <Grid item xs={12} sm={12} style={{ overflowY: 'scroll', height: "40vh" }} >
                                <Typography> Overall P/L% Time Wise <Button onClick={this.updateOverall}> Overall Again </Button> </Typography>

                                    

                                    <Table size="small" aria-label="sticky table" >
                                        <TableHead style={{ width: "", whiteSpace: "nowrap" }} variant="head">
                                            <TableRow variant="head" style={{ fontWeight: 'bold' }} >

                                                <TableCell className="TableHeadFormat" >Timestamp</TableCell>
                                                <TableCell className="TableHeadFormat" >No Of Trade</TableCell>

                                                
                                                <TableCell className="TableHeadFormat" >Gross Overall P/L%</TableCell>
                                                <TableCell className="TableHeadFormat" >Expence%</TableCell>
                                                <TableCell className="TableHeadFormat" >Net P/L%</TableCell>
                                                
                                            </TableRow>
                                        </TableHead>
                                        <TableBody style={{ width: "", whiteSpace: "nowrap" }}>
                                            { this.state.overAllResult ? this.state.overAllResult.map((item, i) => (
                                                <TableRow key={i}>
                             
                             
                                                    <TableCell>{item.datetime}</TableCell>
                                                    <TableCell>{item.noOfTrade}</TableCell>

                                                    <TableCell>{item.sumofall > 0 ? <span style={{ color: 'green'}}> {item.sumofall}</span> : <span style={{ color: 'red' }}> {item.sumofall}</span>}% </TableCell>
                                                    <TableCell>{item.expence}%</TableCell>
                                                    <TableCell>{item.netOverAll > 0 ? <span style={{ color: 'green'}}> {item.netOverAll}</span> : <span style={{ color: 'red' }}> {item.netOverAll}</span>}% </TableCell>

                                                </TableRow>
                                            )) : ''}

                                        </TableBody>
                                    </Table>
                                </Grid>


                            </Grid>
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

