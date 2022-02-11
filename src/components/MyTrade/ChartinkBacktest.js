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
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
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
import worker_script from './worker';
import Switch from '@material-ui/core/Switch';


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
            timeFrame: "FIVE_MINUTE",
            overAllResult: [],
            pertradePandL: 0,
            pertradePandLNet: 0,
            allQniqueStockList: [],
            isSameDayDuplcate: true,
            stockWiseListOverall: [],
            filename: "",
            overallMonthWise: [],
            entryCandlePoint:5,
            totalWinTrade:0, 
            maxDrowDown:0, 
            maxProfit:0
            

        };

    }
    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }

    onInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value }, function () {
            //    console.log("time", this.state.timeFrame);
            if (this.state.tradingsymbol) {
                this.showStaticChart(this.state.symboltoken);
            }
        });
    }
    handleChange = (event) => {

        this.setState({ isSameDayDuplcate: event.target.checked }, () => {
            console.log("isSameDayDuplcate", this.state.isSameDayDuplcate, event.target.checked);
        })

    };
    componentDidMount() {

        window.document.title = "Backtest";
        this.setState({ symbolList: this.state.staticData[this.state.selectedWatchlist] });
        var myWorker = new Worker(worker_script);
        this.setState({ myWorker :  myWorker}); 

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

    readCsv = async (callback) => {
        this.setState({ newJsonList: [] })
        let csvFormatInput = this.state.csvFormatInput.trim().split('\n');
        for (let index = 0; index < csvFormatInput.length; index++) {
            const element = csvFormatInput[index];
            let symbol = element.split('\t')[1];
            let startTime = element.split('\t')[0];
            this.setState({ stockTesting: index + 1 + ". " + symbol + " getting details" })

            //   console.log(element, symbol, startTime);

            // "13-01-2022 11:20\tSHREEPUSHK\tSmallcap\tIndustrials"

            AdminService.autoCompleteSearch(symbol).then(searchRes => {

                let searchResdata = searchRes.data;
                var found = searchResdata.filter(row => row.exch_seg === "NSE" && row.lotsize === "1" && row.name === symbol);
                //     console.log("found",  found)

                if (found.length) {
                    found[0].startTime = startTime;
                    this.setState({ newJsonList: [...this.state.newJsonList, found[0]] }, () => {
                        if (csvFormatInput.length - 1 == index) {
                            callback()
                        }
                    });
                }

            })

            await new Promise(r => setTimeout(r, 150));
        }
    }

    getAlltokenOfList = (callback) => {
        let listofstockfound = [];
        let allStockWithTime = [];
        let updateList = [];
        let csvFormatInput = this.state.csvFormatInput.trim().split('\n');
        for (let index = 0; index < csvFormatInput.length; index++) {
            const element = csvFormatInput[index];

            let name = element.split('\t')[1];
            let startTime = element.split('\t')[0];

            this.setState({ stockTesting: index + 1 + ". " + name + " getting details" });
            allStockWithTime.push({ name: name, startTime: startTime });
            let found = listofstockfound.filter((item) => item.name === name);
            if (!found[0]) {
                listofstockfound.push({ name: name });
            }
        }
        this.setState({ totaluniqueStocks: listofstockfound.length, allQniqueStockList: listofstockfound })

        AdminService.getAllListTokens(listofstockfound).then(searchRes => {
            let searchResdata = searchRes.data;
            if (searchResdata.length > 0) {
                for (let index = 0; index < allStockWithTime.length; index++) {
                    const element = allStockWithTime[index];

                    let filerdata = searchResdata.filter((item => item.name == element.name));
                    if (filerdata.length > 0) {
                        let data = {
                            symbol: filerdata[0].symbol,
                            name: filerdata[0].name,
                            startTime: element.startTime,
                            token: filerdata[0].token,
                        }
                        updateList.push(data);
                    }

                }
            }



            //   var found = searchResdata.filter(row => row.exch_seg  === "NSE" &&  row.lotsize === "1" && row.name === symbol);                                
            //  console.log("uniquestockfound",  listofstockfound)
            //  console.log("searchResdata",  searchResdata)
            //  console.log("updateList",  updateList)

            callback(updateList, listofstockfound, searchResdata);


            // if(searchResdata.length > 0){ 
            //     found[0].startTime = startTime;
            //    this.setState({ newJsonList: [...this.state.newJsonList, found[0]] }, ()=> {
            //        if(csvFormatInput.length-1 == index){
            //         callback()
            //         }
            //    });
            // }
        })

    }

    getDateFormate = (givendate, time) => {
        let dateinfo = givendate.split(' ');
        let sdate = dateinfo[0].split('-');
        return moment(sdate[2] + '/' + sdate[1] + '/' + sdate[0] + ' ' + time);
    }

    convertDateFormat = (datetime) => {
        let dateinfo = datetime.split(' ');
        let date = dateinfo[0].split('-');
        let input = date[2] + '/' + date[1] + '/' + date[0];
        let time = '';
        if (dateinfo && dateinfo[1]) {
            time = moment(dateinfo[1], 'HH:mm').format('HH:mm');
        }
        // console.log(time)
        return moment(input + ' ' + time);
    }

    getPerChangeOfStock = (histdata, stockInfo) => {

        if (histdata.length > 0) {

            var candleData = histdata;
            let entryCandlePoint = this.state.entryCandlePoint; 
            let entryPrice = candleData[0][entryCandlePoint]
            if(entryCandlePoint == 5){
                entryPrice =  (candleData[0][2] + candleData[0][3]) / 2; 
            }
            
            let stock = {
                name: stockInfo.name,
                symbol: stockInfo.symbol,
                token: stockInfo.token,
                entryPrice: entryPrice.toFixed(2),
                foundAt: moment(candleData[0][0]).format('YYYY-MM-DD HH:mm')
            }

            let priceChangeList = [];
            for (let index2 = 1; index2 < candleData.length; index2++) {
                let perChange = (candleData[index2][4] - stock.entryPrice) * 100 / stock.entryPrice;
                let datetime = moment(candleData[index2][0]).format('h:mma')
                if (this.state.timeFrame == 'ONE_DAY') {
                    datetime = moment(candleData[index2][0]).format('DD/MM/YYYY h:mma')
                }
                if(perChange < this.state.maxDrowDown){
                    this.setState({maxDrowDown : perChange.toFixed(2)}); 
                }
                if(perChange > this.state.maxProfit){
                    this.setState({maxProfit : perChange.toFixed(2)}); 
                }
                
                priceChangeList.push({ perChange: perChange.toFixed(2), close: candleData[index2][4], datetime: datetime });
            }
            stock.candleData = priceChangeList;
            let isWinOnClosing = priceChangeList[priceChangeList.length-1].perChange > 0 ? true : false;
            stock.isWinOnClosing = isWinOnClosing; 
            if(isWinOnClosing){
                this.setState({ totalWinTrade: this.state.totalWinTrade+1 })
            }
            
            this.setState({ backTestResult: [...this.state.backTestResult, stock] }, () => {
            });
        } else {
            console.log(" candle data emply");
            this.setState({ searchFailed: this.state.searchFailed + 1 })

        }
    }


    backTestAnyPatternStockWise = () => {
       
        if(this.state.csvFormatInput){

            this.setState({ backTestResult: [], overAllResult: [],stockWiseListOverall:[], backTestFlag: false, filename: '', searchFailed: 0, pertradePandL: 0, pertradePandLNet: 0 });
            this.setState({ totalgross: 0, totalAvg: 0, totTrade: 0, totalNet: 0, totalExp: 0,totalWinTrade:0,   maxDrowDown:0, maxProfit:0 });
    
            this.getAlltokenOfList(async (newJsonList, listofstockfound, searchResdata) => {

                //    newJsonList.sort((a, b) => a.startTime.localeCompare(b.startTime));
                // console.log("newJsonList",newJsonList[0].startTime, newJsonList[newJsonList.length-1 ].startTime);
    
                for (let index = 0; index < listofstockfound.length; index++) {
    
                    if (this.state.stopScaningFlag) {
                        this.setState({ stopScaningFlag: false })
                        break;
                    }
    
                    const element = listofstockfound[index];
                     console.log("unique loop", element, new Date().toLocaleTimeString())
    
                    let filerdata = searchResdata.filter((item => item.name == element.name));
                    let stocktoken = filerdata.length > 0 ? filerdata[0].token : "";
                    if (stocktoken) {
    
                        
                        let sameAllStock = newJsonList.filter((item => item.name == element.name));
                      //  console.log("sameAllStock",sameAllStock); 
    
                        if(this.state.isSameDayDuplcate){
                            let singleDatewiseSamestock = [];
                            sameAllStock.forEach(elementstock => {
                                let uniquestock = singleDatewiseSamestock.filter((item => moment(item.startTime).format('YYYY-MM-DD') == moment(elementstock.startTime).format('YYYY-MM-DD')));
                                if(!uniquestock.length)
                                singleDatewiseSamestock.push(elementstock); 
                            });
                            sameAllStock = singleDatewiseSamestock;
                        }
                 
                        let datelist = [];
                        sameAllStock.forEach(elementsame => {
                            datelist.push(this.convertDateFormat(elementsame.startTime))
                        });
    
                        let momentsDates = datelist.map(d => moment(d));
                        let startDate = moment.min(momentsDates);
                        let endDate = moment.max(momentsDates);
    
                        if(this.state.entryTimeAt){
                            startDate =  startDate.format("YYYY-MM-DD")+ ' ' + this.state.entryTimeAt; 
                        }
    
    
                        var data = {
                            "exchange": "NSE",
                            "symboltoken": stocktoken,
                            "interval": this.state.timeFrame, //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
                            "fromdate": moment(startDate).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
                            "todate": moment(endDate.format("YYYY-MM-DD")+ ' ' + '15:30').format("YYYY-MM-DD HH:mm") // moment("2020-06-30 14:00").format("YYYY-MM-DD HH:mm") 
                        }
    
                        AdminService.getHistoryData(data).then(res => {
                            let histdata = resolveResponse(res, 'noPop');
                            if (histdata && histdata.data && histdata.data.length) {
    
                                console.log("history", element, new Date().toLocaleTimeString())
    
    
                                for (let index = 0; index < sameAllStock.length; index++) {
                                    const samestock = sameAllStock[index];
    
                                    let foundat = this.convertDateFormat(samestock.startTime);
                                    let endtime = moment(foundat.format('YYYY-MM-DD') + ' ' + '15:30');
                                    // console.log("startime",foundat, endtime)
    
                                    let chunkCandleData = histdata.data.filter((candleInfo => moment(candleInfo[0]).isSameOrAfter(foundat) && moment(candleInfo[0]).isSameOrBefore(endtime)))  //isBetween(foundat, endtime);
    
                                  //    console.log("chunkdata", stock,chunkCandleData )
                             //     console.log("inside for loop start", samestock, new Date().toLocaleTimeString())
    
                                    this.getPerChangeOfStock(chunkCandleData, samestock);
                                //    console.log("inside", samestock, new Date().toLocaleTimeString())
                                }
                                // sameAllStock.forEach((stock, i) => {
    
                                //     console.log("inside foreach loop", stock, new Date().toLocaleTimeString())
    
                                //     let foundat = this.convertDateFormat(stock.startTime);
                                //     let endtime = moment(foundat.format('YYYY-MM-DD') + ' ' + '15:30');
                                //     // console.log("startime",foundat, endtime)
    
                                //     let chunkCandleData = histdata.data.filter((candleInfo => moment(candleInfo[0]).isSameOrAfter(foundat) && moment(candleInfo[0]).isSameOrBefore(endtime)))  //isBetween(foundat, endtime);
    
                                //   //    console.log("chunkdata", stock,chunkCandleData )
                                //     this.getPerChangeOfStock(chunkCandleData, stock);
    
                                // //    this.state.myWorker.postMessage({chunkCandleData: chunkCandleData, stock: stock});
    
                                // });
    
                                // this.state.myWorker.onmessage = (m) => {
                                //     console.log("msg from worker: ", m.data);
                                // };
    
    
                               //  this.updateOverall();
                                 
                               this.updateStockWiseOverall();
                            //   this.updateMonthWise();
                            } else {
                                console.log(" candle data emply");
                                this.setState({ searchFailed: this.state.searchFailed + 1 })
                            }
                        }).catch((error) => {
                            console.log(element.symbol, error)
                            this.setState({ searchFailed: this.state.searchFailed + 1 })
                        })
    
                    } else {
                        continue;
                    }
    
    
    
    
    
                    await new Promise(r => setTimeout(r, 350));
                    this.setState({ stockTesting: index + 1 + ". " + element.name })
                }
    
                this.setState({ backTestFlag: true });
    
            });
        }else{
            Notify.showError("Paste stocklist datetime  symbol format, tab format")
        }
      
    }

    backTestAnyPattern = () => {
        this.setState({ backTestResult: [], overAllResult: [],overallMonthWise:[], backTestFlag: false, filename: '', searchFailed: 0, pertradePandL: 0, pertradePandLNet: 0 });

        this.getAlltokenOfList(async (newJsonList) => {
            //  let newJsonList = this.state.newJsonList; 
            for (let index = 0; index < newJsonList.length; index++) {

                if (this.state.stopScaningFlag) {
                    this.setState({ stopScaningFlag: false })
                    break;
                }

                const element = newJsonList[index];
                //    console.log(element)

                let dateinfo = element.startTime.split(' ');
                let date = dateinfo[0].split('-');
                let input = date[2] + '/' + date[1] + '/' + date[0];
                let time = '9:15';
                if (dateinfo && dateinfo[1]) {
                    moment(dateinfo[1], 'HH:mm').format('HH:mm');
                }
                //   console.log(time)
                var startDate = moment(input + ' ' + time);
                var marketendtime = "15:30";
                var endtime = moment(input + ' ' + marketendtime);
                if (this.state.timeFrame == 'ONE_DAY') {

                    endtime = moment(startDate, "DD-MM-YYYY").add(5, 'days');
                    let nextdate = moment(endtime).format("YYYY-MM-DD");
                    endtime = moment(nextdate + ' ' + marketendtime);
                }

                var data = {
                    "exchange": "NSE",
                    "symboltoken": element.token,
                    "interval": this.state.timeFrame, //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
                    "fromdate": moment(startDate).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
                    "todate": moment(endtime).format("YYYY-MM-DD HH:mm") // moment("2020-06-30 14:00").format("YYYY-MM-DD HH:mm") 
                }

                AdminService.getHistoryData(data).then(res => {
                    let histdata = resolveResponse(res, 'noPop');
                    if (histdata && histdata.data && histdata.data.length) {

                        var candleData = histdata.data;
                        let stock = {
                            symbol: element.symbol,
                            token: element.token,
                            entryPrice: candleData[0][4],
                            foundAt: moment(candleData[0][0]).format('YYYY-MM-DD HH:mm')
                        }

                        let priceChangeList = [];
                        for (let index2 = 1; index2 < candleData.length; index2++) {
                            let perChange = (candleData[index2][4] - stock.entryPrice) * 100 / stock.entryPrice;
                            let datetime = moment(candleData[index2][0]).format('h:mma')
                            if (this.state.timeFrame == 'ONE_DAY') {
                                datetime = moment(candleData[index2][0]).format('DD/MM/YYYY h:mma')
                            }
                            priceChangeList.push({ perChange: perChange.toFixed(2), close: candleData[index2][4], datetime: datetime });
                        }
                        stock.candleData = priceChangeList;
                        this.setState({ backTestResult: [...this.state.backTestResult, stock] }, () => {
                            this.updateOverall();
                        });
                    } else {
                        console.log(" candle data emply");
                        this.setState({ searchFailed: this.state.searchFailed + 1 })

                    }
                }).catch((error) => {
                    console.log(element.symbol, error)
                    this.setState({ searchFailed: this.state.searchFailed + 1 })

                })
                await new Promise(r => setTimeout(r, 350));
                this.setState({ stockTesting: index + 1 + ". " + element.symbol })
            }
            this.setState({ backTestFlag: true });
        });

        //    this.readCsv( );//callback end 

    }

    updateOverall = () => {
        // this.setState({ overAllResult : [] });

        let timelist = [];
        this.state.backTestResult.forEach(element => {
            element.candleData.forEach((item) => {
                let found = timelist.filter((time) => time === item.datetime);
                if (!found[0]) {
                    timelist.push(item.datetime);
                }
            });
        });

        let overallData = [];

        timelist.forEach(timeelement => {
            let sumofall = 0;
            this.state.backTestResult.forEach(element => {
                for (let index = 0; index < element.candleData.length; index++) {
                    const item = element.candleData[index];
                    if (timeelement === item.datetime) {
                        sumofall += parseFloat(item.perChange)
                        break;
                    }
                }
            });

            let expence = this.state.backTestResult.length * 0.06;
            overallData.push({
                datetime: timeelement,
                sumofall: sumofall.toFixed(2),
                expence: expence.toFixed(2),
                netOverAll: (sumofall - expence).toFixed(2),
                noOfTrade: this.state.backTestResult.length
            })
        });

        // overallData.reverse()
        overallData.sort((a, b) => moment(b.datetime, 'h:mma') - moment(a.datetime, 'h:mma'));

        this.setState({ overAllResult: overallData }, () => {
            //  console.log('overAllResult', this.state.overAllResult)
            if(this.state.overAllResult.length > 0){
                let pertradePandLgross = (this.state.overAllResult[0].sumofall / this.state.overAllResult[0].noOfTrade);
                let pertradePandLNet = pertradePandLgross - 0.06;
                this.setState({ "pertradePandL": pertradePandLgross.toFixed(2), pertradePandLNet: pertradePandLNet.toFixed(2) });    
            }
         
        });

    }


    updateStockWiseOverall = () => {
        // this.setState({ overAllResult : [] });
        this.setState({ stockWiseListOverall: [] })

        let overall = []; 
      //  console.log("this.state.allQniqueStockList", this.state.allQniqueStockList, this.state.backTestResult)

        this.state.allQniqueStockList.forEach(stockelement => {

         //   console.log('stockelement', stockelement); 
            let sumofall = 0, totalSameTrade = 0;
            this.state.backTestResult.forEach(element => {
                if (stockelement.name == element.name) {
                 //   console.log('result element', element); 

                    if (element.candleData.length > 0) {
                        sumofall += parseFloat(element.candleData[element.candleData.length - 1].perChange)
                        totalSameTrade += 1;
                    }
                }
            });
            let expence = totalSameTrade * 0.06;
            let data = {
                name: stockelement.name,
                totalSameTrade: totalSameTrade,
                sumofall: sumofall,
                expence: expence,
                netPnL: (sumofall - expence)
            }

            overall.push(data); 
            
        });


        this.setState({ stockWiseListOverall: overall}, () => {

            let totalgross = 0, totalAvg = 0, totTrade = 0, totalNet = 0, totalExp = 0, winCount=0,lossCount=0;
            this.state.stockWiseListOverall.forEach(item => {
                totalgross += item.sumofall;
                totTrade += item.totalSameTrade;
                totalNet += item.netPnL;
                totalExp += item.expence;
                winCount += item.netPnL>0 ? 1 : 0;
                lossCount += item.netPnL<0 ? 1 : 0;
            })

            totalAvg = (totalgross/totTrade).toFixed(2);

            let data = {
                name: "Total (Gross Avg%): "+totalAvg,
                totalSameTrade: totTrade,
                sumofall: totalgross ,
                expence: totalExp,
                netPnL: totalNet,
                winCount:winCount,
                lossCount:lossCount
            }

            this.state.stockWiseListOverall.push(data); 


            this.setState({stockWiseListOverall: this.state.stockWiseListOverall, lossCount:lossCount,winCount:winCount,  totalgross: totalgross.toFixed(2), totalAvg: totalAvg, totTrade: totTrade, totalNet: totalNet.toFixed(2), totalExp: totalExp.toFixed(2) });


        })
    }


    
    updateMonthWise = () => {
        this.setState({ overallMonthWise: [] })
        let months = [
            {name: 'Jan'}, 
            {name: 'Feb'}, 
            {name: 'Mar'}, 
            {name: 'Apr'}, 
            {name: 'May'}, 
            {name: 'Jun'}, 
            {name: 'Jul'}, 
            {name: 'Aug'}, 
            {name: 'Sep'}, 
            {name: 'Nov'}, 
            {name: 'Dec'}, 
            
        ]; 
        let overall = []; 

        let sumofall = 0, totalSameTrade = 0;
       
        months.forEach(month => {

            //   console.log('stockelement', stockelement); 
               let sumofall = 0, totalSameTrade = 0;
               this.state.backTestResult.forEach(element => {
                   let tradeMonth = moment(element.foundAt).format('MMM'); 
                   if (month.name == tradeMonth) {
                       if (element.candleData.length > 0) {
                           sumofall += parseFloat(element.candleData[element.candleData.length - 1].perChange)
                           totalSameTrade += 1;
                       }
                   }
               });
               let expence = totalSameTrade * 0.06;
               let data = {
                   name: month.name,
                   totalSameTrade: totalSameTrade,
                   sumofall: sumofall.toFixed(2),
                   expence: expence.toFixed(2),
                   netPnL: (sumofall - expence).toFixed(2)
               }

               overall.push(data); 
               
           });

        this.setState({ overallMonthWise: overall}, () => {            

        })
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

        this.setState({ chartStaticData: '', lightChartSymbol: symbol }, function () {
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




    onFileChange = (e) => {
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

        //    console.log("backTestResult", this.state.backTestResult)
        //    console.log("stockWiseListOverall", this.state.stockWiseListOverall)


        return (
            <React.Fragment>
                <PostLoginNavBar />
                <ChartDialog />
                <Grid direction="row" container spacing={1} style={{ padding: "5px" }} >



                    <Grid item xs={12} sm={8}>


                        <Paper style={{ padding: "10px" }}>
                            {/* <Typography style={{ textAlign: "center", background: "lightgray" }}>Chartink Backtest</Typography> */}

                            <Grid direction="row" container spacing={2}>

                                <Grid item xs={12} sm={6}>
                                    <TextField variant="outlined" id="textarea" multiline rows={10} fullwidth style={{ width: '90%', height: '50%' }} label="1. Datetime 2. Symbol format : Paste" value={this.state.csvFormatInput} name="csvFormatInput" onChange={this.onChange} />

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

                                        <Select title='Entry candle point , mid means high+low/2' value={this.state.entryCandlePoint} name="entryCandlePoint" onChange={this.onInputChange}>
                                            <MenuItem value={1}>{'Open'}</MenuItem>
                                            <MenuItem value={2}>{'High'}</MenuItem>
                                            <MenuItem value={3}>{'Low'}</MenuItem>
                                            <MenuItem value={4}>{'Close'}</MenuItem>
                                            <MenuItem value={5}>{'Mid'}</MenuItem>
                                        </Select>
                                        <input placeholder='9:20' fullwidth style={{ width: '90%', height: '50%' }} label="entryTimeAt" value={this.state.entryTimeAt} name="entryTimeAt" onChange={this.onChange} />


                                        <FormGroup>
                                            <FormControlLabel
                                                control={<Switch checked={this.state.isSameDayDuplcate} onChange={this.handleChange} aria-label="Speek ON/OFF" />}
                                                label={this.state.isSameDayDuplcate ? 'Same Day Duplcate: Yes' : 'Same Day Duplcate: No'}
                                            />
                                        </FormGroup>

                                      
                                   

                                         <input placeholder='filename' id="textarea" fullwidth style={{ width: '90%', height: '50%' }} label="Filename" value={this.state.filename} name="filename" onChange={this.onChange} />

                                         Failed:{this.state.searchFailed} 
                                     <br /> 
                                    {this.state.totaluniqueStocks ? this.state.totaluniqueStocks + " unique stocks found" : ""}
                                    <br />
                                    {this.state.stockTesting}
                                    </FormControl>

                                </Grid>


                                <Grid item xs={12} sm={4} style={{ marginTop: '5px' }}>
                                    {/* {this.state.backTestFlag ? <Button variant="contained" onClick={() => this.backTestAnyPattern()}>Search</Button> : <>  <Spinner />  &nbsp;&nbsp;   <Button variant="contained" onClick={() => this.stopBacktesting()}>Stop Scaning &nbsp; </Button>   </>} */}
                                    {this.state.backTestFlag ? <Button variant="contained" onClick={() => this.backTestAnyPatternStockWise()}>Test Stock Wise</Button> : <>  <Spinner />  &nbsp; <Button variant="contained" onClick={() => this.stopBacktesting()}>Stop</Button>  </>}
                                   

                                        <Table size="small" aria-label="sticky table" >
                                            <TableHead style={{ width: "", whiteSpace: "nowrap" }} variant="head">
                                                <TableRow variant="head" style={{ fontWeight: 'bold' }} >

                                                    <TableCell className="TableHeadFormat" >
                                                    <Button size='small' variant='outlined' onClick={this.updateMonthWise}>Month</Button>                                                </TableCell>
                                                    <TableCell className="TableHeadFormat" >Trades
                                                    </TableCell>
                                                    <TableCell className="TableHeadFormat" >Gross P/L
                                                    </TableCell>
                                                    <TableCell className="TableHeadFormat" >Expence</TableCell>
                                                    <TableCell className="TableHeadFormat" > Net P/L
                                                    </TableCell>

                                                </TableRow>
                                            </TableHead>
                                            <TableBody style={{ width: "", whiteSpace: "nowrap" }}>
                                                {this.state.overallMonthWise ? this.state.overallMonthWise.map((item, i) => (
                                                    item.totalSameTrade > 0 ?  <TableRow key={i}>
                                                    <TableCell>{item.name}</TableCell>
                                                    <TableCell>{item.totalSameTrade}</TableCell>
                                                    <TableCell>{item.sumofall > 0 ? <span style={{ color: 'green' }}> {item.sumofall}</span> : <span style={{ color: 'red' }}> {item.sumofall}</span>}% </TableCell>
                                                    <TableCell>{item.expence}%</TableCell>
                                                    <TableCell>{item.netPnL > 0 ? <span style={{ color: 'green' }}> {item.netPnL}</span> : <span style={{ color: 'red' }}> {item.netPnL}</span>}% </TableCell>

                                                </TableRow>:""
                                                )) : ''}

                                            </TableBody>
                                        </Table>
                                   
                                </Grid>

                                <Grid item xs={12} sm={12} >

                                    <div style={{ overflow: "auto", maxHeight: "200px" }}>

                                        <Table size="small" aria-label="sticky table" >
                                            <TableHead style={{ width: "", whiteSpace: "nowrap" }} variant="head">
                                                <TableRow variant="head" style={{ fontWeight: 'bold' }} >
                                                <TableCell>Sr.&nbsp;</TableCell>

                                                    <TableCell className="TableHeadFormat" >Stock ({this.state.stockWiseListOverall.length}) <CsvDownload filename={'Overall_'+this.state.filename+'.csv'} data={this.state.stockWiseListOverall} />                                                    </TableCell>
                                                    <TableCell className="TableHeadFormat" >T.T ({this.state.totTrade})  Avg:
                                                    ({this.state.totalAvg > 0 ? <span style={{ color: 'green' }}> {this.state.totalAvg}</span> : <span style={{ color: 'red' }}> {this.state.totalAvg}</span>})%
                                                    </TableCell>
                                                    <TableCell className="TableHeadFormat" >Gross P/L
                                                        ({this.state.totalgross > 0 ? <span style={{ color: 'green' }}> {this.state.totalgross}</span> : <span style={{ color: 'red' }}> {this.state.totalgross}</span>})%
                                                    </TableCell>
                                                    <TableCell className="TableHeadFormat" >Expence ({this.state.totalExp})%</TableCell>
                                                    <TableCell className="TableHeadFormat" > Net P/L
                                                        ({this.state.totalNet > 0 ? <span style={{ color: 'green' }}> {this.state.totalNet}</span> : <span style={{ color: 'red' }}> {this.state.totalNet}</span>})%

                                                        &nbsp;  W:{this.state.winCount}  &nbsp; L:{this.state.lossCount}
                                                    </TableCell>

                                                </TableRow>
                                            </TableHead>
                                            <TableBody style={{ width: "", whiteSpace: "nowrap" }}>
                                                {this.state.stockWiseListOverall ? this.state.stockWiseListOverall.map((item, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell>{i+1}</TableCell>

                                                        <TableCell>{item.name}</TableCell>
                                                        <TableCell>{item.totalSameTrade}</TableCell>
                                                        <TableCell>{item.sumofall > 0 ? <span style={{ color: 'green' }}> {item.sumofall}</span> : <span style={{ color: 'red' }}> {item.sumofall}</span>}% </TableCell>
                                                        <TableCell>{item.expence}%</TableCell>
                                                        <TableCell>{item.netPnL > 0 ? <span style={{ color: 'green' }}> {item.netPnL}</span> : <span style={{ color: 'red' }}> {item.netPnL}</span>}% </TableCell>

                                                    </TableRow>
                                                )) : ''}

                                            </TableBody>
                                        </Table>
                                    </div>
                                </Grid>


                            </Grid>

                            <Grid direction="row" container spacing={2}>

                                <Grid item xs={12} sm={12}>

                                    <div style={{ overflow: "auto", maxHeight: "550px" }}>

                                        <Table size="small" aria-label="sticky table" >

                                            <TableHead style={{ width: "", whiteSpace: "nowrap" }} variant="head">

                                                <TableRow variant="head" style={{ fontWeight: 'bold' }}>
                                                    <TableCell className="TableHeadFormat" >Sr.</TableCell>

                                                    <TableCell className="TableHeadFormat" >Datetime <CsvDownload filename={'Trade_'+this.state.filename+'.csv'} data={this.state.backTestResult} /></TableCell>
                                                    <TableCell className="TableHeadFormat" >Symbol &nbsp;</TableCell>
                                                    <TableCell className="TableHeadFormat" >EntryPrice &nbsp;</TableCell>
                                                    <TableCell className="TableHeadFormat" >ExitPrice &nbsp;</TableCell>
                                                    <TableCell className="TableHeadFormat" >T.T:({this.state.backTestResult.length}) &nbsp;W:{this.state.totalWinTrade} &nbsp;L:{this.state.backTestResult.length - this.state.totalWinTrade}  &nbsp;MaxLoss:{this.state.maxDrowDown}%  &nbsp;MaxProfit:{this.state.maxProfit}%
                                                     </TableCell>
                                                </TableRow>
                                            </TableHead>

                                            <TableBody style={{ width: "", whiteSpace: "nowrap" }}>
                                                {this.state.backTestResult ? this.state.backTestResult.map((row, i) => (
                                                    //    style={{display: row.orderActivated ? 'visible' : 'none'}} "darkmagenta" : "#00cbcb"
                                                    <TableRow hover key={i}  style={{ background: !row.isWinOnClosing ? 'bisque' : ""}}>

                                                        <TableCell>{i + 1}&nbsp;</TableCell>

                                                        <TableCell >{row.foundAt} &nbsp;</TableCell>
                                                        <TableCell><Button size='small' variant='contained' onClick={() => this.showStaticChart(row.token, row.symbol, row.foundAt, row.foundAt)}>{row.symbol} </Button> </TableCell>
                                                        <TableCell><span style={{ fontStyle: 'italic' }}> {row.entryPrice}</span> &nbsp;</TableCell>
                                                        <TableCell><span style={{ fontStyle: 'italic', color: row.candleData[row.candleData.length-1].close > row.entryPrice ? 'green' : "red"}}> {row.candleData[row.candleData.length-1].close} ({row.candleData[row.candleData.length-1].perChange}%) </span> &nbsp;</TableCell>

                                                        <TableCell >
                                                            {row.candleData.map((item, j) => (<>
                                                                <span>{item.datetime}: </span>{item.close}({item.perChange > 0 ? <span style={{ color: 'green' }}> {item.perChange}%</span> : <span style={{ color: 'red' }}> {item.perChange}%</span>}) &nbsp;
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

                        <Paper style={{ padding: "10px", position:"fixed" }}>

                            <Grid style={{ display: "visible" }} spacing={1} direction="row" alignItems="center" container>
                                <Grid item xs={12} sm={12}  >
                                    <Grid spacing={1} direction="row" alignItems="center" container>
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
                                    <Typography> <Button size='small' variant='outlined' onClick={this.updateOverall}> Overall </Button>
                                        {this.state.pertradePandL > 0 ? <span style={{ color: 'green' }}> {this.state.pertradePandL}</span> : <span style={{ color: 'red' }}> {this.state.pertradePandL}</span>}% Gross/Trade   |
                                        {this.state.pertradePandLNet > 0 ? <span style={{ color: 'green' }}> {this.state.pertradePandLNet}</span> : <span style={{ color: 'red' }}> {this.state.pertradePandLNet}</span>}% Net/Trade  </Typography>

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
                                            {this.state.overAllResult ? this.state.overAllResult.map((item, i) => (
                                                <TableRow key={i}>


                                                    <TableCell>{item.datetime}</TableCell>
                                                    <TableCell>{item.noOfTrade}</TableCell>

                                                    <TableCell>{item.sumofall > 0 ? <span style={{ color: 'green' }}> {item.sumofall}</span> : <span style={{ color: 'red' }}> {item.sumofall}</span>}% </TableCell>
                                                    <TableCell>{item.expence}%</TableCell>
                                                    <TableCell>{item.netOverAll > 0 ? <span style={{ color: 'green' }}> {item.netOverAll}</span> : <span style={{ color: 'red' }}> {item.netOverAll}</span>}% </TableCell>

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

