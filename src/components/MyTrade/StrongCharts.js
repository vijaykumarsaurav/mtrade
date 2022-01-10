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
import LightChartMultiple from "./LightChartMultiple";
import TextField from "@material-ui/core/TextField";
import { createChart } from 'lightweight-charts';


class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            staticData: localStorage.getItem('staticData') && JSON.parse(localStorage.getItem('staticData')) || {},
            totalWatchlist: localStorage.getItem('totalWatchlist') && JSON.parse(localStorage.getItem('totalWatchlist')) || [],
            selectedWatchlist:  localStorage.getItem('clickedIndexName') ? localStorage.getItem('clickedIndexName') :  'NIFTY BANK',  //decodeURIComponent(window.location.href.split('?')[1].split('=')[1]),
            totalStockToWatch: 0,
            chartSize: 300, 
            timeFrame: "FIFTEEN_MINUTE",
            chartStaticData: [],
            BBBlastType: "BBStrongBreakout",
            qtyToTake: '',
            fastMovementList: localStorage.getItem('fastMovementList') && JSON.parse(localStorage.getItem('fastMovementList')) || [],
            strongChartList: [],
            gainerList: localStorage.getItem('gainerList') && JSON.parse(localStorage.getItem('gainerList')) || [],
            looserList: localStorage.getItem('looserList') && JSON.parse(localStorage.getItem('looserList')) || [],
            sortBy : "perChange"

        };
    }


    componentDidMount = async () => {

        window.document.title = "Index Charts";

        var watchList = this.state.staticData[this.state.selectedWatchlist];
        this.setState({ totalStockToWatch: watchList && watchList.length });
        // this.strongChartList(); //one time only


        var beginningTime = moment('9:15am', 'h:mma');
        var endTime = moment('3:30pm', 'h:mma');
        const friday = 5; // for friday
        var currentTime = moment(new Date(), "h:mma");
        const today = moment().isoWeekday();

        var tostartInteral = setInterval(() => {
            var time = new Date();
            //console.log("set interval 1sec min/10==0 ", time.toLocaleTimeString());
            if (time.getMinutes() % 10 === 0) {
              //  console.log("search method call in with setTimeout 70sec", time.toLocaleTimeString());

                setTimeout(() => {
                    this.findStrongCharts();
                }, 70000);
                this.setState({
                    stop10bbSearch:
                        setInterval(() => {
                            console.log("search method call in with setInterval in 10min", time.toLocaleTimeString());
                            if (today <= friday && currentTime.isBetween(beginningTime, endTime)) {
                                this.findStrongCharts();
                            }
                        }, 60000 * 10 + 70000)
                });

                clearInterval(tostartInteral);
            }
        }, 1000);


        this.findStrongCharts();

    }


    stopSearching = () => {
        //console.log("stop the search")
        clearInterval(this.state.strongChartListInterval);
        clearInterval(this.state.stop10bbSearch);

    }


    showCandleChart = (candleData, symbol, ltp, perChange) => {
        localStorage.setItem('candleChartData', JSON.stringify(candleData))
        localStorage.setItem('cadleChartSymbol', symbol)
        localStorage.setItem('candlePriceShow', ltp);
        localStorage.setItem('candleChangeShow', perChange.toFixed(2));
        document.getElementById('showCandleChart').click();
    }

    componentWillUnmount() {
        //  clearInterval(this.state.strongChartListInterval);
        //        clearInterval(this.state.stop10bbSearch);
        // clearInterval(this.state.scaninterval);
        //  clearInterval(this.state.bankNiftyInterval); 
    }

    onChangeWatchlist = (e) => {
        clearInterval(this.state.strongChartListInterval);
        this.setState({ [e.target.name]: e.target.value }, function () {
            // this.strongChartList(); //one time only
            this.findStrongCharts();

        });
    }
    shouldComponentUpdate(flag, nextProps, nextState) {
        return flag //!equals(nextProps, this.props); // equals() is your implementation
    }
    onChangeQty = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    // startSearching = () => {

    //     console.log("Starting the search");

    //     var beginningTime = moment('9:15am', 'h:mma');
    //     var endTime = moment('3:30pm', 'h:mma');
    //     const friday = 5; // for friday
    //     var currentTime = moment(new Date(), "h:mma");
    //     const today = moment().isoWeekday();
    //     //market hours

    //     if (today <= friday && currentTime.isBetween(beginningTime, endTime)) {
    //         var intervaltime = 60000;
    //         if (this.state.totalStockToWatch > 180) {
    //             intervaltime = this.state.totalStockToWatch * 333;
    //         }
    //       //  this.setState({ strongChartListInterval: setInterval(() => { this.strongChartList(); }, intervaltime) });
    //     }
    // }

    getTimeFrameValue = (timeFrame) => {

        //18 HOURS FOR BACK 1 DATE BACK MARKET OFF

        switch (timeFrame) {
            case 'ONE_MINUTE':
                return "200:00:00";
                break;
            case 'FIVE_MINUTE':
                    return "1000:00:00";
                break;
            case 'TEN_MINUTE':
                    return "1500:00:00";
                break;
            case 'FIFTEEN_MINUTE':
                return "2160:00:00";
                break;
            case 'THIRTY_MINUTE':
                return "4320:00:00";
                break;
            case 'ONE_HOUR':
                return "8320:00:00";
                break;
            case 'ONE_DAY':
                return "15000:00:00";
                break;
            default:
                break;
        }
    }

    calculateSMA =(data, count) => {
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

    getRSIBBString=(row)=>{
        var str = ''; 

        if(row.BB){
            if(row.ltp >= row.BB.upper){
                str +=  '<span style="color:green">BBupr:' + row.BB.upper+'</span>';
            }else{
                str += '<span style="color:red">BBupr:' + row.BB.upper+'</span>';
            }
    
            if(row.ltp <= row.BB.lower){
                str +=  ' <span style="color:green">BBlwr:' + row.BB.lower+'</span>';
            }else{
                str += ' <span style="color:red">BBlwr:' + row.BB.lower+'</span>';
            }
        }
       

        str += "<br/>RSI:"; 
        row.RSI.forEach(element => {
            if(element >= 60){
                str +=  ' <span style="color:green">' + element+'</span>';
            }else if(element >= 40 && element <= 59){
                str +=  ' <span style="color:black">' + element+'</span>';
            }else{
                str += ' <span style="color:red">' + element+'</span>';
            }
        });

        return str; 
    }

    createMultpleChart = (row) => {

        var div = document.createElement("div");
        div.style.display = 'block';
        div.style.padding = 10 + 'px';
        div.style.marginLeft = 10 + 'px';
        div.style.marginTop = 10 + 'px';
        div.style.border =  "2px solid "+CommonOrderMethod.getPercentageColor(row.perChange);      

        var legend = document.createElement('div');
        //legend.className = 'sma-legend';
        div.appendChild(legend);
        legend.style.display = 'block';
        legend.style.left = 3 + 'px';
        legend.style.top = 3 + 'px';

        if(row.perChange > 0){
            legend.style.color = 'green';
        }else{
            legend.style.color = 'red';
        }

    
        let str = row.name + " " + row.ltp + " ("+ row.perChange +'%)  &nbsp;&nbsp; <b title="previous volume broken count" >VBC:  '+row.candleVolBrokenCount+' </b><br />';

        str += '<span style="color:black">Emotions: </span> ';
        if(row.strongPer){
            if(row.strongPer >= 75){
                str +=  '<span style="color:green"><b>Buying :' + row.strongPer.toFixed(2)+'%</b></span>';
            }else{
                str += '<span  style="color:black">Buying:' + row.strongPer.toFixed(2) +'% </span>';
            }
        } 
        
        if(row.strongPer){
            if(row.strongPer <= 25){
                str +=  '<span style="color:red"><b> Selling :' + (100 - row.strongPer).toFixed(2)+'%</b></span>';
            }else{
                str += '<span  style="color:black"> Selling:' + (100 - row.strongPer).toFixed(2) +'%</span>';
            }
        } 

        str += '<br />';
        legend.innerHTML = str; 

        var legendTitle = document.createElement('div');
        //legend.className = 'sma-legend';
        div.appendChild(legendTitle);
//        legendTitle.style.display = 'block';
        legendTitle.style.fontSize = '10px';


        //  const domElement = document.getElementById('tvchart');
        //   document.getElementById('tvchart').innerHTML = '';


        const chart = createChart(div, { width: this.state.chartSize, height: this.state.chartSize, timeVisible: true, secondsVisible: true });

        var candleSeries = chart.addCandlestickSeries({
            upColor: 'green',
            downColor: 'red',
            borderDownColor: 'red',
            borderUpColor: 'green',
            wickDownColor: 'red',
            wickUpColor: 'green',
        });

        candleSeries.setData(row.lightChartData);

        var smaData = this.calculateSMA(row.lightChartData, 20);
		var smaLine = chart.addLineSeries({
			color: 'rgba(4, 111, 232, 1)',
			lineWidth: 2,
		});
		smaLine.setData(smaData);
        
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
        volumeSeries.setData(row.volumeSeriesData);
        var legend = document.createElement('div');
        //legend.className = 'sma-legend';
        div.append(legend);
        legend.style.display = 'block';

        legend.innerHTML =  this.getRSIBBString(row); 
        document.getElementById("allchart") && document.getElementById("allchart").append(div);


        chart.subscribeCrosshairMove((param) => {

			var getit = param.seriesPrices[Symbol.iterator]();

			var string = "";
			var change = "";

			for (var elem of getit) {

				//console.log(elem);
				if (typeof elem[1] == 'object') {
					string += " O: <b>" + elem[1].open + "</b>";
					string += " H: <b>" + elem[1].high + "</b>";
					string += " L: <b>" + elem[1].low + "</b>";
					string += " C: <b>" + elem[1].close + "</b>";
					change = (elem[1].close - elem[1].open) * 100 / elem[1].open;
					string += " CH: <b>" + change.toFixed(2) + '%</b><br />';
				} else {
					string += " " + elem[1].toFixed(2) + " ";
				}
			}

			if (param.time)
				string += " Time:<b> " +   moment(param.time).format("DD-MM-YYYY hh:mm A") + "</b>" ;

			var str = "<span style=color:green>" + string + "</span> ";
			if (change < 0)
				str = "<span style=color:red>" + string + "</span> ";

             legendTitle.innerHTML = str;
		});
    
      //  this.sortTheChart(); 
    }

    

    sortTheChart =()=> {
       
        let allchart = document.getElementById("allchart");
        let createNewArray = []; 
        function getItem(name){
                document.querySelector('#allchart').childNodes.forEach(function(e){
                    if(e.innerText && e.innerText.split(' ')[0] == name){ 
                     //   console.log("item",name, e.innerText.split(' ')[0], e)
                        allchart.appendChild(e); 
                        createNewArray.push(e);   
                     //   return e; 
                    }
                }) 
        }

        for (let index = 0; index < this.state.strongChartList.length; index++) {
            const element = this.state.strongChartList[index];
            let item = getItem(element.name); 
        }

    }

    shortByVolume =(type)=> {
        
       this.state.strongChartList.sort(function (a, b) {
            return b[type] - a[type];
       });
       
      // volumeWithPrice 


       this.setState({  strongChartList  : this.state.strongChartList, sortBy : type },function(){
                      
                if(document.getElementById("allchart")){
                    document.getElementById("allchart").innerHTML = ''
                } 
                for (let index = 0; index < this.state.strongChartList.length; index++) {
                    const element = this.state.strongChartList[index];
                    this.createMultpleChart(element);
                }
       })
    }


    updateToLocalStorage = (row) => {

        let foundAt = new Date(row.foundAt).toLocaleString();
        var isfound = this.state.fastMovementList.filter(element => (element.token == row.token && element.foundAt == foundAt));
      //  console.log("isfound", isfound);
        if (!isfound.length) {
            var updateData = {
                token: row.token,
                foundAt: foundAt,
                ltp: row.ltp,
                symbol: row.symbol,
                nc: row.perChange.toFixed(2),
                orderType: row.orderType
            }
            this.state.fastMovementList.push(updateData);
            //this.setState({ fastMovementList: [..., updateData] });
            localStorage.setItem("fastMovementList", JSON.stringify(this.state.fastMovementList));
            return true;

        } else {
            return false;
        }

    }

    findStrongCharts = async () => {
       
        if(document.getElementById("allchart")){
            document.getElementById("allchart").innerHTML = ''
        } 

        this.setState({ strongChartListUpdate: '', strongChartList: [] });
        var watchList = this.state.staticData[this.state.selectedWatchlist];
        if (this.state.selectedWatchlist == "gainerList") {
            watchList = localStorage.getItem('gainerList') && JSON.parse(localStorage.getItem('gainerList'));
        }
        if (this.state.selectedWatchlist == "looserList") {
            watchList = localStorage.getItem('looserList') && JSON.parse(localStorage.getItem('looserList'));
        }
        if (this.state.selectedWatchlist == "selectall") {
            watchList = localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList'));
        }
        this.setState({ totalStockToWatch: watchList && watchList.length });


        if (watchList && watchList.length) {
            for (let index = 0; index < watchList.length; index++) {

                this.setState({ strongChartListUpdate: index + 1 + ". " + watchList[index].symbol + " At " + new Date().toLocaleTimeString() });

                const format1 = "YYYY-MM-DD HH:mm";
                var beginningTime = moment('9:15am', 'h:mma').format(format1);

                let timeDuration = this.getTimeFrameValue(this.state.timeFrame);
                var time = moment.duration("1000:00:00");  //22:00:00" for last day  2hours  timeDuration
                var startDate = moment(new Date()).subtract(timeDuration);

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
                        var candleChartData = [], vwapdata = [], closeingData = [], highData = [], lowData = [], openData = [], valumeData = [], bbdata = [], volumeSeriesData = [];
                        
                      
                        let lastCandle = candleData[candleData.length-1]; 
                        let changePer = (lastCandle[4] - lastCandle[1]) * 100 / lastCandle[1];
                        let candleDistance = lastCandle[2] - lastCandle[3]; //high - low
                        let strongPer =  ((lastCandle[4] - lastCandle[3]) * 100)/candleDistance; // close-low*100/distance 
                        console.log( watchList[index].symbol, candleData[candleData.length-1], strongPer ); 
                       
                        if (true) {   //changePer >= 0.3 ||  changePer <= -0.3
                            candleData.forEach((element, loopindex) => {
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
    
                            var sma = SMA.calculate({ period: 20, values: closeingData });
    
                            var inputRSI = { values: closeingData, period: 14 };
                            var lastRsiValue = RSI.calculate(inputRSI);
    
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
                            var vwapdata = VWAP.calculate(inputVWAP);
                            var bbvlastvalue = bb[bb.length - 1];
                            if (bbvlastvalue) {
                                bbvlastvalue.upper = bbvlastvalue.upper.toFixed(2);
                                bbvlastvalue.middle = bbvlastvalue.middle.toFixed(2);
                                bbvlastvalue.lower = bbvlastvalue.lower.toFixed(2);
    
                            }
    
                            const lightChartData = candleData.map(d => {
                                return { time: new Date(d[0]).getTime(), open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]) }
                            });

                            let candleVolBrokenCount = 0 , lastVol = valumeData[valumeData.length-1]; 
                            if(valumeData && valumeData.length){
                                valumeData.reverse();
                                for (let indexVol = 1; indexVol < valumeData.length; indexVol++){
                                    const volelement = valumeData[indexVol];
                                    if(volelement <  lastVol){
                                        candleVolBrokenCount++;  
                                    }else {
                                        break; 
                                    }                    
                                }
                            }
                
                            console.log(watchList[index].symbol,  candleVolBrokenCount)
    
    
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
                                    let data = {
                                        symbol:  watchList[index].symbol,
                                        token: watchList[index].token,
                                        RSIValue: lastRsiValue[lastRsiValue.length - 1],
                                        RSI: lastRsiValue.slice(Math.max(lastRsiValue.length - 8, 1)),
                                        valumeData: valumeData.slice(Math.max(valumeData.length - 8, 1)),
                                        VWAP: vwapdata[vwapdata.length - 1], //vwap(vwapdata),
                                        BB: bbvlastvalue,
                                        candleChartData: candleChartData,
                                        foundAt: candleData && new Date(candleData[candleData.length - 1][0]).toLocaleString(),
                                        name: watchList[index].name, //index+1 +'. '+ 
                                        lightChartData: lightChartData,
                                        volumeSeriesData: volumeSeriesData, 
                                        strongPer: strongPer,
                                        candleVolBrokenCount :candleVolBrokenCount
                                    }

                                   
    
                                    data.perChange = ((LtpData.ltp - LtpData.close) * 100 / LtpData.close).toFixed(2);
                                    data.ltp = LtpData.ltp;
                                    let sortBy = this.state.sortBy; 

                                    this.setState({ strongChartList: [...this.state.strongChartList, data] }, function(){
                                      
                                        
                                        this.state.strongChartList && this.state.strongChartList.sort(function (a, b) {
                                            return b[sortBy] - a[sortBy];
                                        });

                                        this.createMultpleChart(data);
                                        
                                    });
                                                                    
                                  
                                }
                            });
                        }
                       

                    } else {
                        //localStorage.setItem('NseStock_' + symbol, "");
                        console.log(watchList[index].symbol, "  emply candle found");
                    }
                })

                await new Promise(r => setTimeout(r, 600));
            }
        } else {
            Notify.showError("No Stock Found")
        }


    }


    callbackAfterOrderDone = (order) => {
        // setValues({ ...values, ['buyFlag']: order.status });
        // setValues({ ...values, ['sellFlag']:  order.status  });
        //  this.setState({ [spineerId]: order.status}); 
        console.log("order executed", order);
    }



    handleClick = (row, type, spinnerIndex) => {

     //   console.log(row);
        if (row.token && row.symbol) {
            if (type == 'BUY') {
                this.setState({ [spinnerIndex]: true });
                var symbolInfo = {
                    token: row.token,
                    symbol: row.symbol,
                    qtyToTake: this.state.qtyToTake
                }
             //   console.log(symbolInfo);
                CommonOrderMethod.historyWiseOrderPlace(symbolInfo, 'BUY', "no", this.callbackAfterOrderDone);
                this.setState({ [spinnerIndex]: false });

            }

            if (type == 'SELL') {
                this.setState({ [spinnerIndex]: true });
                var symbolInfo = {
                    token: row.token,
                    symbol: row.symbol,
                    qtyToTake: this.state.qtyToTake
                }
             //   console.log(symbolInfo);
                CommonOrderMethod.historyWiseOrderPlace(symbolInfo, 'SELL', "no", this.callbackAfterOrderDone);
                this.setState({ [spinnerIndex]: false });
            }
        } else {
            Notify.showError(" Symbol Not found!!!");
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
                    container spacing={1}>

                    <Grid item xs={12} sm={4} >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            &nbsp; {this.state.selectedWatchlist} Stocks ({this.state.strongChartList && this.state.strongChartList.length})
                            <span id="stockTesting" style={{ fontSize: "18px", color: 'gray' }}> {this.state.strongChartListUpdate} </span>
                        </Typography>

                    </Grid>
                    <Grid item xs={12} sm={1} >
                        <FormControl style={styles.selectStyle} >
                            <InputLabel htmlFor="gender">Chart Size</InputLabel>
                            <Select value={this.state.chartSize} name="chartSize" onChange={this.onChangeWatchlist}>
                                <MenuItem value={250}>{'250px'}</MenuItem>
                                <MenuItem value={300}>{'300px'}</MenuItem>
                                <MenuItem value={350}>{'350px'}</MenuItem>
                                <MenuItem value={450}>{'450px'}</MenuItem>
                                <MenuItem value={550}>{'550px'}</MenuItem>
                                <MenuItem value={650}>{'650px'}</MenuItem>

                            </Select>
                        </FormControl>
                    </Grid>


                    <Grid item xs={12} sm={2} >
                        <FormControl style={styles.selectStyle} >
                            <InputLabel htmlFor="gender">Select Watchlist</InputLabel>
                            <Select value={this.state.selectedWatchlist} name="selectedWatchlist" onChange={this.onChangeWatchlist}>
                                <MenuItem value={"gainerList"}>{"Gainer List (" +  this.state.gainerList.length +")"}</MenuItem>
                                <MenuItem value={"looserList"}>{"Looser List (" +  this.state.looserList.length +")"}</MenuItem>

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
                    
                    {/* 
                    <Grid item xs={12} sm={1} >
                        <FormControl style={styles.selectStyle} >
                            <InputLabel htmlFor="gender">Select Time</InputLabel>
                            <Select value={this.state.BBBlastType} name="BBBlastType" onChange={this.onChangeWatchlist}>
       
                                <MenuItem value={'BBStrongBreakout'}>{'BB Strong Breakout'}</MenuItem>



                            </Select>
                        </FormControl>
                    </Grid> */}

                    <Grid item xs={12} sm={4} >
                        <Button variant="contained" style={{ marginRight: '20px' }} onClick={() => this.findStrongCharts()}>Start</Button>
                        <Button variant="contained" style={{ marginRight: '20px' }} onClick={() => this.stopSearching()}>Stop</Button>
                    </Grid>


                    <Grid item xs={12} sm={12} >
                        Sorted By: <b>{this.state.sortBy}</b>
                        <Button title='previous volume broken count' style={{ marginRight: '20px' }} onClick={() => this.shortByVolume('candleVolBrokenCount')}>VolumeBC</Button>
                        <Button style={{ marginRight: '20px' }} onClick={() => this.shortByVolume('perChange')}>perChange</Button>
                       
                        <Button title='' style={{ marginRight: '20px' }} onClick={() => this.shortByVolume('volumeWithPrice')}>Volume with price BO</Button>

                    </Grid>
                </Grid>




                <Grid container spacing={2} style={{padding:'10px'}} id="allchart" >


                    {/* {this.state.strongChartList ? this.state.strongChartList.map((row, i) => (

                        <Grid item xs={12} sm={3}>
                            <Paper style={{ overflow: "auto", padding: '10px' }} >

                                <Typography style={{ color: row.perChange > 0 ? "green" : "red" }}> {row.name} {row.ltp} {row.perChange ? "(" + row.perChange + "%" + ")" : ""} <span> &nbsp;&nbsp;  {row.foundAt}</span></Typography>

                            
                                {row.candleChartData.length > 0 ? <ReactApexChart
                                    options={{
                                        chart: {
                                            type: 'candlestick',
                                            height: 350
                                          },
                                          title: {
                                            text: 'CandleStick Chart',
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
                                        data: row.candleChartData.slice(Math.max(row.candleChartData.length - 100, 1))
                                    },
                                    ]}

                                    type="candlestick"
                                    width={350}
                                    height={250}

                                /> : ""}


                                <Grid direction="row" style={{ padding: '5px' }} container className="flexGrow" justify="space-between" >



                                    {row.DSMALastValue ? <Grid item xs={12} sm={12} style={{ color: row.ltp > row.DSMALastValue ? "green" : "red", fontWeight: "bold" }}>
                                        Daily SMA: {row.DSMALastValue} {row.ltp > row.DSMALastValue ? "BUY" : "SELL"}
                                    </Grid> : ""}
                                    <Grid item xs={12} sm={12} style={{ color: row.ltp > row.VWAP ? "green" : "red", fontWeight: "bold" }}>
                                        VWAP:  {row.VWAP}
                                    </Grid>

                                    <Grid item xs={12} sm={12} >
                                        BB {row.BB ? <>
                                            &nbsp; <span style={{ color: row.ltp >= row.BB && row.BB.upper ? "green" : "", fontWeight: "bold" }}>Upper: {row.BB && row.BB.upper}</span>
                                            &nbsp; <span style={{ color: row.ltp >= row.BB.middle ? "green" : "red", fontWeight: "bold" }}>Middle: {row.BB && row.BB.middle}</span>
                                            &nbsp; <span style={{ color: row.ltp <= row.BB && row.BB.lower ? "red" : "", fontWeight: "bold" }}> Lower: {row.BB && row.BB.lower}</span>

                                        </> : ""}
                                    </Grid>

                                    <Grid item xs={12} sm={12}>
                                        RSI: {row.RSI.map((item, j) => (
                                            item >= 60 ? <span style={{ color: 'green', fontWeight: "bold" }}> {item} </span> : <span style={{ color: item <= 40 ? 'red' : "", fontWeight: "bold" }}> {item} </span>
                                        ))}
                                    </Grid>
                                    <Grid item xs={12} sm={12}>
                                        Volume: {row.valumeData.map((item, j) => (
                                            <span> {(item / 100000).toFixed(2)}L </span>
                                        ))}
                                    </Grid>




                                </Grid>

                                <Grid direction="row" style={{ padding: '5px' }} container className="flexGrow" justify="space-between" >
                                    <Grid item>
                                        {!this.state['buyButtonClicked' + row.symbol + i] ? <Button size="small" variant="contained" color="primary" onClick={() => this.handleClick(row, 'BUY', 'buyButtonClicked' + row.symbol + i)}>BUY</Button> : <Spinner />}
                                    </Grid>

                                    <Grid item>
                                        <TextField style={{ marginTop: '-15px' }} label="Qty" type="number" name="qtyToTake" value={this.state.qtyToTake} onChange={this.onChangeQty} />
                                    </Grid>

                                    <Grid item >
                                        {!this.state['sellButtonClicked' + row.symbol + i] ? <Button size="small" variant="contained" color="Secondary" onClick={() => this.handleClick(row, 'SELL', 'sellButtonClicked' + row.symbol + i)}>SELL</Button> : <Spinner />}
                                    </Grid>
                                </Grid>


                            </Paper>

                        </Grid>

                    )) : ''} */}
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