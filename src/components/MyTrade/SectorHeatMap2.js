import React from "react";
import AdminService from "../service/AdminService";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Grid from "@material-ui/core/Grid";
import { connect } from "react-redux";
import { setPackLoaded } from "../../action";
import Spinner from "react-spinner-material";
import * as moment from 'moment';
import { resolveResponse } from "../../utils/ResponseHandler";
import "./ViewStyle.css";
import MyDialog from './MyDialog'
import Notify from "../../utils/Notify";
import PostLoginNavBar from "../PostLoginNavbar";
import pako from 'pako';
import { w3cwebsocket } from 'websocket';
import ChartDialog from './ChartDialog';
import LightChartDialog from './LightChartDialog';
import LineChart from "./LineChart";
import ReactApexChart from "react-apexcharts";
import TradeConfig from './TradeConfig.json';
import ShowChartIcon from '@material-ui/icons/ShowChart';
import vwap from 'vwap';
import { SMA, RSI, VWAP, BollingerBands } from 'technicalindicators';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';



const wsClintSectorUpdate = new w3cwebsocket('wss://omnefeeds.angelbroking.com/NestHtml5Mobile/socket/stream');

class MyView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            // sectorList: [],
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
                // 'NIFTY NEXT 50': 'juniorNifty',
                // 'NIFTY MIDCAP 50': 'niftyMidcap50',
            },
            stopnview: '',
            indexTimeStamp: '',
            refreshFlag: true,
            topGLCount: 0,
            refreshFlagCandle: true,
            switchToListViewFlag: true,
            slowMotionStockList: localStorage.getItem('slowMotionStockList') && JSON.parse(localStorage.getItem('slowMotionStockList')) || [],
            sectorStockList: localStorage.getItem('sectorStockList') && JSON.parse(localStorage.getItem('sectorStockList')) || [],
            sectorList: localStorage.getItem('sectorList') && JSON.parse(localStorage.getItem('sectorList')) || [],
            watchList: localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')) || [],
            staticData: localStorage.getItem('staticData') && JSON.parse(localStorage.getItem('staticData')) || {},
            gainerList: localStorage.getItem('gainerList') && JSON.parse(localStorage.getItem('gainerList')) || [],
            looserList: localStorage.getItem('looserList') && JSON.parse(localStorage.getItem('looserList')) || [],
            timeFrame: "FIFTEEN_MINUTE"

        }
        this.refreshSectorCandle = this.refreshSectorCandle.bind(this);
    }

    componentDidMount() {
        // window.location.reload(); 

        window.document.title = "Hit Map2";


        this.loadIndexesList();


        var tokens = JSON.parse(localStorage.getItem("userTokens"));
        var feedToken = tokens && tokens.feedToken;
        var userProfile = JSON.parse(localStorage.getItem("userProfile"));
        var clientcode = userProfile && userProfile.clientcode;
        this.setState({ feedToken: feedToken, clientcode: clientcode });


        var beginningTime = moment('9:15am', 'h:mma');
        var endTime = moment('3:30pm', 'h:mma');
        const friday = 5; // for friday
        var currentTime = moment(new Date(), "h:mma");
        const today = moment().isoWeekday();
        //market hours
        if (today <= friday && currentTime.isBetween(beginningTime, endTime)) {

            wsClintSectorUpdate.onopen = (res) => {
                // this.makeConnection();
                // this.updateSocketWatch();
            }


            wsClintSectorUpdate.onmessage = (message) => {
                var decoded = window.atob(message.data);
                var data = this.decodeWebsocketData(pako.inflate(decoded));
                var liveData = JSON.parse(data);

                //  console.log("sector live data", liveData);
                window.document.title = "Sector Live WS: " + liveData.length;

                this.state.sectorList && this.state.sectorList.forEach((outerEelement, index) => {

                    outerEelement.stockList && outerEelement.stockList.forEach((element, stockIndex) => {
                        var foundLive = liveData.filter(row => row.tk == element.token);
                        if (foundLive.length > 0 && foundLive[0].ltp && foundLive[0].nc) {
                            this.state.sectorList[index].stockList[stockIndex].ltp = foundLive[0].ltp;
                            this.state.sectorList[index].stockList[stockIndex].nc = foundLive[0].nc;
                            this.state.sectorList[index].stockList[stockIndex].cng = foundLive[0].cng;
                            this.state.sectorList[index].stockList[stockIndex].ltt = foundLive[0].ltt;

                            this.state.sectorList[index].isStocksLtpUpdted = true;
                        }
                    });
                });

                this.setState({ sectorList: this.state.sectorList });
                // this.setState({ sectorList: sectorList });
                // localStorage.setItem('sectorList', JSON.stringify(sectorList));

                // if(index){
                //     this.state.sectorList.forEach((element, i) => {
                //         if(element.index == index){
                //             this.state.sectorList[i].stockList = sectorUpdate; 
                //             this.state.sectorList[i].isStocksLtpUpdted = true; 
                //             this.setState({ sectorList: this.state.sectorList  });
                //             return; 
                //         }
                //     });
                // }
            }

            wsClintSectorUpdate.onerror = (e) => {
                console.log("socket error", e);
                window.location.reload();
            }

            // setInterval(() => {
            //     this.makeConnection();
            //     var _req = '{"task":"hb","channel":"","token":"' + feedToken + '","user": "' + clientcode + '","acctid":"' + clientcode + '"}';
            //     // console.log("Connection sectior top hb Request :- " + _req);
            //     wsClintSectorUpdate.send(_req);
            // }, 59000);

            setInterval(() => {
                this.loadIndexesList();
            }, 120000);



        } else {
            // wsClintSectorUpdate.close();
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
                    localStorage.setItem('oderbookData', JSON.stringify(orderlist));
                }
            });
    }


    updateTokenSymbol = (gainerList) => {

        var gainerList = localStorage.getItem('gainerList') && JSON.parse(localStorage.getItem('gainerList')) || [];

        for (let index = 0; index < gainerList.length; index++) {
            const element = gainerList[index];



            if(!element.token && !element.symbol){
                AdminService.autoCompleteSearch(element.name).then(searchRes => {
                    let searchResdata = searchRes.data;
                    if (searchResdata.length) {
                        var uppercaseNameEQ = element.name.toUpperCase() + "-EQ";
                        var uppercaseNameBE = element.name.toUpperCase() + "-BE";
                        var found = searchResdata.filter(row => row.name === element.name && (row.symbol === uppercaseNameEQ || row.symbol === uppercaseNameBE));
                        if (found.length) {
                            element.symbol = found[0].symbol;
                            element.token = found[0].token;
                            element.exch_seg = found[0].exch_seg; 
                            localStorage.setItem('gainerList', JSON.stringify(gainerList));
                        }
                    }
                });
            }

            
        }

        var looserList = localStorage.getItem('looserList') && JSON.parse(localStorage.getItem('looserList')) || [];

        for (let index = 0; index < looserList.length; index++) {
            const element = looserList[index];
            if(!element.token && !element.symbol){
                AdminService.autoCompleteSearch(element.name).then(searchRes => {
                    let searchResdata = searchRes.data;
                    if (searchResdata.length) {
                        var uppercaseNameEQ = element.name.toUpperCase() + "-EQ";
                        var uppercaseNameBE = element.name.toUpperCase() + "-BE";
                        var found = searchResdata.filter(row => row.name === element.name && (row.symbol === uppercaseNameEQ || row.symbol === uppercaseNameBE));
                        if (found.length) {
                            element.symbol = found[0].symbol;
                            element.token = found[0].token;
                            element.exch_seg = found[0].exch_seg; 
                            localStorage.setItem('looserList', JSON.stringify(looserList));
                        }
                    }
                });
            }
          
        }

    }



    loadIndexesList() {
        this.setState({ indexTimeStamp: '', refreshFlag: false, failedCount: 0, topGLCount: 0 });

        AdminService.allIndicesDirectJSON()
            .then((res) => {


                if (res.data) {

                    var softedData = res.data && res.data.data;
                    softedData.sort(function (a, b) {
                        return b.percChange - a.percChange;
                    });


                    this.setState({ indexTimeStamp: softedData[0].timeVal });

                    var gainerList = [], looserList = [];

                    for (let index = 0; index < softedData.length; index++) {
                        const element = softedData[index];
                        var slugName = this.state.sluglist[element.indexName];
                        console.log("element", slugName, element.percChange);

                        if (slugName) {
                            console.log("secName", element.indexName, slugName);
                            AdminService.checkSectorApiOther(slugName).then(res => {
                                console.log(element.indexName, res.data.data);
                                softedData[index].stockList = res.data && res.data.data;
                                softedData[index].time = res.data && res.data.time;
                                this.setState({ sectorList: softedData });

                                if (element.percChange >= 0.75 || (softedData[index].indexName == "NIFTY 50" && element.percChange >= 0.25)) {

                                    for (let indexStock = 0; indexStock < res.data.data.length - 5; indexStock++) {
                                        const stockElement = res.data.data[indexStock];
                                        var stockInfo = {
                                            name: stockElement.symbol,
                                            ltp: stockElement.ltP,
                                            nc: stockElement.iislPercChange,
                                            sector: softedData[index].indexName,
                                            foundAt: new Date().toLocaleString()
                                        }

                                        let glist = localStorage.getItem('gainerList') && JSON.parse(localStorage.getItem('gainerList')) || [];
                                        var isfound = glist.filter(row => row.name == stockElement.symbol);

                                        console.log(stockElement.symbol, isfound);
                                        if (!isfound.length) {
                                            gainerList.push(stockInfo);
                                            localStorage.setItem('gainerList', JSON.stringify(gainerList));
                                        }

                                    }
                                }
                                if (element.percChange <= -0.75 || (softedData[index].indexName == "NIFTY 50" && element.percChange <= -0.25)) {

                                    var sectorStock = res.data.data;
                                    sectorStock.reverse();

                                    for (let indexStock = 0; indexStock < res.data.data.length - 5; indexStock++) {
                                        const stockElement = res.data.data[indexStock];
                                        var stockInfo = {
                                            name: stockElement.symbol,
                                            ltp: stockElement.ltP,
                                            nc: stockElement.iislPercChange,
                                            sector: softedData[index].indexName,
                                            foundAt: new Date().toLocaleString()
                                        }

                                        let llist = localStorage.getItem('looserList') && JSON.parse(localStorage.getItem('looserList')) || [];

                                        var isfound = llist.filter(row => row.name == stockElement.symbol);

                                        console.log("looseer", stockElement.symbol, isfound);
                                        if (!isfound.length) {
                                            looserList.push(stockInfo);
                                            localStorage.setItem('looserList', JSON.stringify(looserList));
                                        }
                                    }
                                }

                            }).catch(error => {
                                // Notify.showError(element.indexName + "fail to get stockdata"); 
                                console.log("list fetch error", error)
                            })
                        }


                    }


                }
            })
            .catch((reject) => {
                //      Notify.showError("All Indices API Failed" + <br /> + reject);
                //      this.speckIt("All Indices API Failed");

            }).finally((ok) => {


                setTimeout(() => {
                    this.updateTokenSymbol("ok");
                }, 5000);



            })

        this.setState({ refreshFlag: true });

    }


    updateLTPMannually = (index) => {

        var sectorStocks = this.state.staticData[index];
        this.refreshSectorLtp(sectorStocks, index);
    }


    refreshSectorLtp = async (sectorStocks, index) => {

        this.setState({ stockUpdate: index });

        // console.log(index, "sectorStocks",sectorStocks,  new Date())
        this.setState({ refreshFlag: false, failedCount: 0 });
        var sectorUpdate = [];
        var sectorStockList = this.state.sectorStockList;

        for (let index = 0; index < sectorStocks.length; index++) {

            var data = {
                "exchange": "NSE",
                "tradingsymbol": sectorStocks[index].symbol,
                "symboltoken": sectorStocks[index].token,
            }

            //   this.setState({ stockUpdate: index + 1 + ". " + sectorStocks[index].symbol });

            AdminService.getLTP(data).then(res => {
                let data = resolveResponse(res, 'noPop');
                var LtpData = data && data.data;


                if (LtpData.symboltoken == sectorStocks[index].token) {

                    //  console.log(index + 1 , sectorStocks[index].symbol , LtpData);

                    var todayChange = (LtpData.ltp - LtpData.close) * 100 / LtpData.close;   //close
                    var indexData = sectorStocks[index];
                    indexData.ltp = LtpData.ltp;
                    indexData.nc = todayChange;
                    indexData.cng = (LtpData.ltp - LtpData.close);
                    indexData.ltt = new Date().toLocaleString();


                    sectorUpdate.push(indexData);
                }

            }).catch(error => {
                this.setState({ failedCount: this.state.failedCount + 1 });

                console.log(sectorStocks[index].symbol, error);

                //  Notify.showError(sectorStocks[index].symbol + " ltd data not found!");
            })



            await new Promise(r => setTimeout(r, 101));


        }


        if (index) {
            this.state.sectorList.forEach((element, i) => {
                if (element.index == index) {
                    this.state.sectorList[i].stockList = sectorUpdate;
                    this.state.sectorList[i].isStocksLtpUpdted = true;
                    this.setState({ sectorList: this.state.sectorList });
                    return;
                }
            });
        }

        this.setState({ refreshFlag: true });
        // this.refreshSectorCandleManually(index); 
        //  this.checkLast5MinMovement(index); 


    }




    checkLast5MinMovement = async (index) => {

        var sectorStocks = this.state.staticData[index];
        //   this.refreshSectorLtp(sectorStocks, index);


        this.setState({ refreshFlagCandle: false });
        console.log("sectorStockList", index);


        for (let index = 0; index < sectorStocks.length; index++) {


            var beginningTime = moment('9:15am', 'h:mma');

            var time = moment.duration("00:06:00");
            var startdate = moment(new Date()).subtract(time);

            var data = {
                "exchange": "NSE",
                "symboltoken": sectorStocks[index].token,
                "interval": "ONE_MINUTE", //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
                "fromdate": moment(startdate).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
                "todate": moment(new Date()).format("YYYY-MM-DD HH:mm") // moment("2020-06-30 14:00").format("YYYY-MM-DD HH:mm") 
            }

            this.setState({ stockCandleUpdate: index + 1 + ". " + sectorStocks && sectorStocks[index].symbol });


            AdminService.getHistoryData(data).then(res => {
                let histdata = resolveResponse(res, 'noPop');
                if (histdata && histdata.data && histdata.data.length) {
                    console.log(sectorStocks[index].symbol, "candle history", histdata.data);


                    var candleData = histdata.data;
                    var candleChartData = [], vwapdata = [], closeingData = [], highData = [], lowData = [], openData = [], valumeData = [];
                    candleData.forEach((element, index) => {
                        candleChartData.push([element[0], element[1], element[2], element[3], element[4]]);
                        vwapdata.push([element[5], (element[2] + element[3] + element[4]) / 3]);
                        closeingData.push(element[4]);
                        highData.push(element[2]);
                        lowData.push(element[3]);
                        openData.push(element[3]);
                        valumeData.push(element[5]);

                    });

                    // var sma = SMA.calculate({period : 10, values : closeingData});
                    // console.log(sectorStocks[index].symbol,"SMA", sma);


                    // var inputRSI = { values: closeingData, period: 14 };
                    // var lastRsiValue = RSI.calculate(inputRSI)
                    // console.log(sectorStocks[index].symbol, "lastRsiValue", lastRsiValue[lastRsiValue.length - 1]);


                    // var inputVWAP = {
                    //     open: openData,
                    //     high: highData,
                    //     low: lowData,
                    //     close: closeingData,
                    //     volume: valumeData
                    // };


                    // if (candleData.length > 0) {
                    //     sectorStocks[index].candleChartData = candleChartData;
                    //     sectorStocks[index].vwapValue = vwap(vwapdata);
                    //     sectorStocks[index].vwapDataChart = VWAP.calculate(inputVWAP);
                    //     sectorStocks[index].lastRsiValue = lastRsiValue[lastRsiValue.length - 1];
                    // }

                    console.log(sectorStocks[index].symbol, sectorStocks[index]);


                } else {
                    //localStorage.setItem('NseStock_' + symbol, "");
                    console.log(sectorStocks[index].symbol, "  emply candle found");
                }
            }).catch(error => {
                this.setState({ failedCount: this.state.failedCount + 1 });
                Notify.showError(sectorStocks[index].symbol + " candle failed!");
            })

            await new Promise(r => setTimeout(r, 350));
        }


        if (index) {
            this.state.sectorList.forEach((element, i) => {
                if (element.index == index) {
                    this.state.sectorList[i].stockList = sectorStocks;
                    this.setState({ sectorList: this.state.sectorList });
                    return;
                }
            });
        }


        this.setState({ refreshFlagCandle: true });




        console.log("sectorStockswithcandle", sectorStocks);
    }
    refreshSectorCandleManually = async (index) => {

        var sectorStocks = this.state.staticData[index];
        //   this.refreshSectorLtp(sectorStocks, index);


        this.setState({ refreshFlagCandle: false });
        console.log("sectorStockList", index);


        for (let index = 0; index < sectorStocks.length; index++) {


            var beginningTime = moment('9:15am', 'h:mma');

            var time = moment.duration("22:00:00");
            var startdate = moment(new Date()).subtract(time);

            var data = {
                "exchange": "NSE",
                "symboltoken": sectorStocks[index].token,
                "interval": "FIFTEEN_MINUTE", //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
                "fromdate": moment(startdate).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
                "todate": moment(new Date()).format("YYYY-MM-DD HH:mm") // moment("2020-06-30 14:00").format("YYYY-MM-DD HH:mm") 
            }

            this.setState({ stockCandleUpdate: index + 1 + ". " + sectorStocks && sectorStocks[index].symbol });


            AdminService.getHistoryData(data).then(res => {
                let histdata = resolveResponse(res, 'noPop');
                //console.log("candle history", histdata); 
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

                    // var sma = SMA.calculate({period : 10, values : closeingData});
                    // console.log(sectorStocks[index].symbol,"SMA", sma);


                    var inputRSI = { values: closeingData, period: 14 };
                    var lastRsiValue = RSI.calculate(inputRSI)
                    console.log(sectorStocks[index].symbol, "lastRsiValue", lastRsiValue[lastRsiValue.length - 1]);


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
                    console.log(sectorStocks[index].symbol, "BB", input, bb);


                    if (candleData.length > 0) {
                        sectorStocks[index].candleChartData = candleChartData;
                        sectorStocks[index].vwapValue = vwap(vwapdata);
                        sectorStocks[index].vwapDataChart = VWAP.calculate(inputVWAP);
                        sectorStocks[index].lastRsiValue = lastRsiValue[lastRsiValue.length - 1];
                    }

                    console.log(sectorStocks[index].symbol, sectorStocks[index]);


                } else {
                    //localStorage.setItem('NseStock_' + symbol, "");
                    console.log(sectorStocks[index].symbol, "  emply candle found");
                }
            }).catch(error => {
                this.setState({ failedCount: this.state.failedCount + 1 });
                Notify.showError(sectorStocks[index].symbol + " candle failed!");
            })

            await new Promise(r => setTimeout(r, 350));
        }


        if (index) {
            this.state.sectorList.forEach((element, i) => {
                if (element.index == index) {
                    this.state.sectorList[i].stockList = sectorStocks;
                    this.setState({ sectorList: this.state.sectorList });
                    return;
                }
            });
        }


        this.setState({ refreshFlagCandle: true });




        console.log("sectorStockswithcandle", sectorStocks);
    }


    refreshSectorCandle = async () => {

        this.setState({ refreshFlagCandle: false });

        var sectorStockList = this.state.sectorStockList;

        console.log("sectorStockList", this.state.sectorStockList.length);


        for (let index = 0; index < this.state.sectorStockList.length; index++) {
            var beginningTime = moment('9:15am', 'h:mma');
            var time = moment.duration("61:00:00");
            var startdate = moment(new Date()).subtract(time);

            var data = {
                "exchange": "NSE",
                "symboltoken": this.state.sectorStockList[index].token,
                "interval": "FIVE_MINUTE", //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
                "fromdate": moment(beginningTime).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
                "todate": moment(new Date()).format("YYYY-MM-DD HH:mm") // moment("2020-06-30 14:00").format("YYYY-MM-DD HH:mm") 
            }

            this.setState({ stockCandleUpdate: index + 1 + ". " + this.state.sectorStockList && this.state.sectorStockList[index].symbol });


            AdminService.getHistoryData(data).then(res => {
                let histdata = resolveResponse(res, 'noPop');
                //console.log("candle history", histdata); 
                if (histdata && histdata.data && histdata.data.length) {

                    var candleData = histdata.data;
                    var candleChartData = [];
                    candleData.forEach(element => {
                        candleChartData.push([element[0], element[1], element[2], element[3], element[4]]);
                    });


                    if (candleData.length > 0) {

                        sectorStockList[index].candleChartData = candleChartData;
                        var sectorList = this.state.sectorList;
                        this.state.sectorList && this.state.sectorList.forEach((outerEelement, index) => {
                            outerEelement.stockList && outerEelement.stockList.forEach((element, stockIndex) => {
                                var foundLive = sectorStockList.filter(row => row.token == element.token);

                                if (foundLive.length) {
                                    sectorList[index].stockList[stockIndex].candleChartData = foundLive[0].candleChartData;
                                }
                            });
                        });
                        this.setState({ sectorList: sectorList });
                        localStorage.setItem('sectorList', JSON.stringify(sectorList));
                    }

                } else {
                    //localStorage.setItem('NseStock_' + symbol, "");
                    console.log(this.state.sectorStockList[index].symbol, "  emply candle found");
                }
            }).catch(error => {
                this.setState({ failedCount: this.state.failedCount + 1 });

                Notify.showError(this.state.sectorStockList[index].symbol + " candle failed!");
            })

            await new Promise(r => setTimeout(r, 350));
        }

        this.setState({ refreshFlagCandle: true });
    }

    decodeWebsocketData = (array) => {
        var newarray = [];
        try {
            for (var i = 0; i < array.length; i++) {
                newarray.push(String.fromCharCode(array[i]));
            }
        } catch (e) { }

        return newarray.join('');
    }

    showCandleChart = (candleData, symbol, price, change, vwapDataChart) => {

        //  candleData  = candleData && candleData.reverse();

        localStorage.setItem('candleChartData', JSON.stringify(candleData));
        localStorage.setItem('cadleChartSymbol', symbol);
        localStorage.setItem('candlePriceShow', price);
        localStorage.setItem('candleChangeShow', change);
        localStorage.setItem('vwapDataChart', vwapDataChart);



        if (candleData && candleData.length > 0) {
            document.getElementById('showCandleChart').click();
        }
    }

    getTimeFrameValue = (timeFrame) => {
        //18 HOURS FOR BACK 1 DATE BACK MARKET OFF

        switch (timeFrame) {
            case 'ONE_MINUTE':
                if (new Date().toLocaleTimeString() < "10:05:00")
                    return "19:00:00";
                else
                    return "01:00:00";
                break;
            case 'FIVE_MINUTE':
                if (new Date().toLocaleTimeString() < "11:00:00")
                    return "23:00:00";
                else
                    return "03:00:00";
                break;
            case 'TEN_MINUTE':
                if (new Date().toLocaleTimeString() < "12:35:00")
                    return "24:21:00";
                else
                    return "07:00:00";
                break;
            case 'FIFTEEN_MINUTE':
                if (new Date().toLocaleTimeString() < "14:15:00")
                    return "28:01:00";
                else
                    return "10:01:00";
                break;
            case 'THIRTY_MINUTE':
                return "100:01:00";
                break;
            case 'ONE_HOUR':
                return "200:01:00";
                break;
            case 'ONE_DAY':
                return "1000:01:00";
                break;
            default:
                break;
        }
    }

    dailyBasisInfoCheck = (token, element) => {
        //this.setState({DailyBulishStatus: ''}); 

        const format1 = "YYYY-MM-DD HH:mm";

        let timeDuration = this.getTimeFrameValue('ONE_DAY');
        var time = moment.duration(timeDuration);  //22:00:00" for last day  2hours 
        var startDateforDaily = moment(new Date()).subtract(time);
        var dataDay = {
            "exchange": 'NSE',
            "symboltoken": token,
            "interval": 'ONE_DAY',
            "fromdate": moment(startDateforDaily).format(format1),
            "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
        }
        AdminService.getHistoryData(dataDay).then(resd => {
            let histdatad = resolveResponse(resd, 'noPop');
            var DSMA = '';
            if (histdatad && histdatad.data && histdatad.data.length) {
                var candleDatad = histdatad.data;
                var closeingDatadaily = [], valumeSum = 0;


                for (let index = candleDatad.length - 20; index < candleDatad.length; index++) {
                    const element = candleDatad[index];
                    if (element) {
                        closeingDatadaily.push(element[4]);
                        valumeSum += element[5];
                    }

                }


                DSMA = SMA.calculate({ period: 20, values: closeingDatadaily });
                this.setState({ dailyAvgValume: valumeSum / 20 });

                var DSMALastValue = DSMA && DSMA[DSMA.length - 1];
                console.log(token, "DSMA", DSMALastValue);

                if (DSMALastValue) {
                    this.setState({ DailyBulishStatus: DSMALastValue, todayCurrentVolume: candleDatad[candleDatad.length - 1][5] });
                }

                if (candleDatad[candleDatad.length - 1][5] > valumeSum / 20) {
                    console.log("crosssed voliue", element);
                    //   this.setState({ volumeCrossedList: [...this.state.volumeCrossedList, element] })
                }

            }


        });
    }



    showCandleChartPopUp = (symbol) => {


        // //  candleData  = candleData && candleData.reverse();

        // // localStorage.setItem('candleChartData', JSON.stringify(candleData));
        // localStorage.setItem('cadleChartSymbol', symbol);
        // // localStorage.setItem('candlePriceShow', price);
        // // localStorage.setItem('candleChangeShow', change);
        // // localStorage.setItem('vwapDataChart', vwapDataChart);

        // document.getElementById('showCandleChart').click();



        var watchList = localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')) || [];
        var isThere = watchList.filter(row => row.name === symbol);
        if (isThere && isThere.length) {

            let stock = isThere[0];



            this.dailyBasisInfoCheck(stock.token);

            const format1 = "YYYY-MM-DD HH:mm";


            var beginningTime = moment('9:15am', 'h:mma');
            var time = moment.duration("22:00:00");  //22:00:00" for last day  2hours 
            // var beginningTime = moment(new Date()).subtract(time);

            var data = {
                "exchange": "NSE",
                "symboltoken": stock.token,
                "interval": this.state.timeFrame,  //'FIVE_MINUTE',
                "fromdate": moment(beginningTime).format(format1),
                "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
            }


            AdminService.getHistoryData(data).then(res => {
                let historyData = resolveResponse(res, 'noPop');
                console.log("candledata", historyData);
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
                    console.log(stock.symbol, "Bolinger band", input, bb);

                    var bb = BollingerBands.calculate(input);
                    console.log(stock.symbol, "Bolinger band", input, bb);

                    var inputRSI = { values: closeingData, period: 14 };
                    var rsiValues = RSI.calculate(inputRSI);

                    console.log(stock.symbol, "Rsi", inputRSI, rsiValues);
                    console.log(stock.symbol, "vwap", vwapdata, vwap(vwapdata));


                    var data = {
                        "exchange": stock.exch_seg,
                        "tradingsymbol": stock.symbol,
                        "symboltoken": stock.token,
                    }
                    AdminService.getLTP(data).then(res => {
                        let data = resolveResponse(res, 'noPop');
                        var LtpData = data && data.data;

                        LtpData.change = (LtpData.ltp - LtpData.close) * 100 / LtpData.close;



                        this.showCandleChart(candleChartData, stock.symbol, LtpData.ltp, LtpData.change);


                        // this.setState({InstrumentLTP: LtpData , selectedSymbol : stock.symbol,  chartStaticData: candleChartData, bblastValue: bb[bb.length - 1], vwapvalue: vwap(vwapdata), rsiValues: rsiValues.slice(Math.max(valumeData.length - 19, 1)), valumeData: valumeData.slice(Math.max(valumeData.length - 5, 1)) }, function () {

                        //     document.getElementById('showLightCandleChart').click();
                        // });


                    })

                }
            })
        }




    }

    updateSocketWatch = () => {



        var channel = [];
        this.state.sectorList.forEach(element => {
            if (element.percentChange >= 0.75) {
                element.stockList && element.stockList.forEach(stock => {
                    channel.push('nse_cm|' + stock.token);
                });
            }
        });


        if (channel && channel.length) {
            var updateWatch = {
                "task": "mw",
                "channel": channel.join('&'),
                "token": this.state.feedToken,
                "user": this.state.clientcode,
                "acctid": this.state.clientcode
            }

            console.log("update watch channel", updateWatch);
            wsClintSectorUpdate.send(JSON.stringify(updateWatch));
        }
    }



    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
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

    get2DecimalNumber = (number) => {

        if (number) {
            return number.toFixed(2);
        } else {
            return number;
        }
    }
    switchToListView = () => {
        this.setState({ switchToListViewFlag: !this.state.switchToListViewFlag });
    }

    get5DaysMoveCount = (symbol) => {
        var isThere = this.state.slowMotionStockList.filter(row => row.name === symbol);
        if (isThere.length) {
            return "SM: " + isThere[0].bigCandleCount;
        } else {
            return '';
        }
    }

    getDeliveryInfo = (symbol) => {

        AdminService.getDeliveryData(symbol).then(resd => {
            if (resd && resd.data && resd.data.length)
                return "D2T%: " + resd.data[0].deliveryToTradedQuantity;
        });

    }

    render() {

        // this.state.sectorList && this.state.sectorList.forEach((outerEelement, index) => {
        //     outerEelement.stockList && outerEelement.stockList.sort(function (a, b) {
        //         return b.nc - a.nc;
        //     });
        // });


        let sqrOffbeginningTime = moment('9:15am', 'h:mma');
        let sqrOffendTime = moment('03:30pm', 'h:mma');
        let sqrOffcurrentTime = moment(new Date(), "h:mma");
        if (sqrOffcurrentTime.isBetween(sqrOffbeginningTime, sqrOffendTime)) {
            this.state.sectorList && this.state.sectorList.forEach((outerEelement, index) => {
                if (outerEelement.percentChange > 0.75 && outerEelement.isStocksLtpUpdted) {
                    outerEelement.stockList && outerEelement.stockList.forEach((element, index2) => {
                        if (index2 < 2) {
                            var autoTradeTopList = localStorage.getItem('autoTradeTopList') && JSON.parse(localStorage.getItem('autoTradeTopList')) || [];
                            var isThere = autoTradeTopList.filter(row => row.token === element.token);
                            if (!isThere.length) {
                                element.foundAt = new Date().toLocaleString();
                                autoTradeTopList.push(element);
                                localStorage.setItem('autoTradeTopList', JSON.stringify(autoTradeTopList));
                                console.log(element.name + " is on top  " + (index2 + 1) + new Date().toLocaleString());
                                this.speckIt(element.name + " is on top  " + (index2 + 1));
                                //  this.historyWiseOrderPlace(element , 'BUY', "Automatic"); 
                            }
                        }

                    });
                }
            });
        }

        return (
            <React.Fragment>
                <PostLoginNavBar />

                <ChartDialog />

                <LightChartDialog LightChartData={{ InstrumentLTP: this.state.InstrumentLTP, DailyBulishStatus: this.state.DailyBulishStatus, todayCurrentVolume: this.state.todayCurrentVolume, selectedSymbol: this.state.selectedSymbol, chartStaticData: this.state.chartStaticData, bblastValue: this.state.bblastValue, vwapvalue: this.state.vwapvalue, rsiValues: this.state.rsiValues, valumeData: this.state.valumeData }} />

                <Grid direction="row" container className="flexGrow" spacing={1} style={{ paddingLeft: "5px", paddingRight: "5px" }}>
                    <Grid item xs={12} sm={6} >
                        <Typography component="h3" variant="h6" color="primary" >
                            Sectors HitMap ({Object.keys(this.state.sluglist).length}) at {this.state.indexTimeStamp}
                            &nbsp;
                            <Button variant="contained" onClick={() => this.loadIndexesList()}>Refresh</Button>

                            &nbsp;

                            {/* {this.state.refreshFlagCandle ? <Button variant="contained" onClick={() => this.refreshSectorCandle()}>Refresh Candle</Button> : <> <Button> <Spinner /> &nbsp; {this.state.stockCandleUpdate}  </Button> </>}
                            &nbsp; */}

                            {/* <Button variant="contained" onClick={() => this.makeConnection()}> WS Refresh</Button> */}



                            <Button onClick={() => this.switchToListView()}>switch to list view</Button>
                        </Typography>

                        {/* {localStorage.getItem('autoTradeTopList')} */}

                    </Grid>
                    <Grid item xs={12} sm={2} >
                        <FormControl style={{ minWidth: '100%' }} >
                            <InputLabel htmlFor="gender">Select Time</InputLabel>
                            <Select value={this.state.timeFrame} name="timeFrame" onChange={this.onChange} >
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



                    {!this.state.switchToListViewFlag && this.state.sectorList ? this.state.sectorList.map((indexdata, index) => (

                        //this.state.topGLCount <= 2 ? 6 : this.state.topGLCount == 3 ? 4 : 3
                        indexdata.stockList ? <Grid item xs={12} sm={3}>
                            <Paper style={{ padding: '10px', background: "lightgray", textAlign: "center" }}>


                                {/* <Button size="small" variant="contained" title="update ltp" onClick={() => this.updateLTPMannually(indexdata.index)}>
                                <b> {index + 1}. {indexdata.index || indexdata.indexName + " " + indexdata.last}({indexdata.percentChange || indexdata.percChange}%)</b> &nbsp; {indexdata.time.substr(13,8)}
                            </Button>
                            &nbsp;

                            <Button size="small" variant="contained" title="Candle refresh" onClick={() => this.refreshSectorCandleManually(indexdata.index)}>
                                <ShowChartIcon />
                            </Button> */}

                                <Typography variant="body1" >
                                    <b> {index + 1}. {indexdata.index || indexdata.indexName + " " + indexdata.last}({indexdata.percentChange || indexdata.percChange}%)</b> &nbsp; {indexdata.time.substr(13, 8)}
                                </Typography>

                                <Grid direction="row" container className="flexGrow" spacing={1} >

                                    {indexdata.stockList && indexdata.stockList.map((sectorItem, i) => (
                                        <Grid item xs={12} sm={6} >
                                            <Paper style={{ textAlign: "center" }} >
                                                {/* {sectorItem.cng} */}
                                                <Typography style={{ background: this.getPercentageColor(sectorItem.iislPercChange), fontSize: '14px' }}>
                                                    {i + 1}. {sectorItem.symbol} {sectorItem.ltP} ({sectorItem.iislPercChange}%)
                                                </Typography>


                                                {sectorItem.candleChartData ? <span style={{ cursor: 'pointer' }} onClick={() => this.showCandleChart(sectorItem.candleChartData, sectorItem.name, sectorItem.ltp, sectorItem.nc, sectorItem.vwapDataChart)} >
                                                    <LineChart candleChartData={sectorItem.candleChartData} percentChange={sectorItem.nc} vwapDataChart={sectorItem.vwapDataChart} />
                                                </span> : ""}

                                                {sectorItem.vwapValue ?
                                                    <Typography >
                                                        {sectorItem.vwapValue ? <span style={{ background: sectorItem.ltp > sectorItem.vwapValue ? "#00ff00" : "red", fontSize: '14px' }}>VWAP:<b>{sectorItem.vwapValue && sectorItem.vwapValue.toFixed(2)}</b> </span> : ""}
                                                        &nbsp;
                                                        {sectorItem.lastRsiValue ? <span title="OB means 'Overbought'" style={{ background: sectorItem.lastRsiValue >= 60 ? "#00ff00" : sectorItem.lastRsiValue >= 40 && sectorItem.lastRsiValue < 60 ? "lightgray" : "red", fontSize: '14px' }}>RSI:<b>{sectorItem.lastRsiValue}</b> {sectorItem.lastRsiValue > 80 ? "OB" : sectorItem.lastRsiValue >= 60 && sectorItem.lastRsiValue <= 80 ? "Buy" : sectorItem.lastRsiValue >= 40 && sectorItem.lastRsiValue < 60 ? "NoTrade" : "Sell"} </span> : ""}
                                                    </Typography>
                                                    : ""}

                                                {/* {sectorItem.candleChartData ? <ReactApexChart
                                                options={{
                                                    chart: {
                                                        type: 'candlestick',
                                                        //  height: 40

                                                    },
                                                    title: {
                                                        text: '',
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
                                                    data: sectorItem.candleChartData

                                                }]}
                                                type="candlestick"
                                    
                                            /> : ""} */}


                                                {/* <Grid direction="row" style={{ padding: '5px' }} container className="flexGrow" justify="space-between" >

                                                <Grid item>
                                                    {!this.state['buyButtonClicked' + indexdata.index + i] ? <Button size="small" variant="contained" color="primary" onClick={() => this.historyWiseOrderPlace(sectorItem, 'BUY', "", 'buyButtonClicked' + indexdata.index + i)}>Buy</Button> : <Spinner />}
                                                </Grid>

                                                <Grid item >
                                                    {sectorItem.ltt && new Date(sectorItem.ltt).toLocaleTimeString()}
                                                </Grid>

                                                <Grid item >
                                                    {!this.state['sellButtonClicked' + indexdata.index + i] ? <Button size="small" variant="contained" color="secondary" onClick={() => this.historyWiseOrderPlace(sectorItem, 'SELL', "", 'sellButtonClicked' + indexdata.index + i)}>Sell</Button> : <Spinner />}
                                                </Grid>
                                            </Grid>
                                            */}


                                            </Paper>


                                        </Grid>
                                    ))
                                    }
                                </Grid>

                            </Paper>
                        </Grid> : ""

                    )) : ""}


                    <Table id="tabledata" aria-label="a dense table" stickyHeader size="small" >
                        <TableBody hover style={{ whiteSpace: "nowrap" }} >


                            {this.state.switchToListViewFlag && this.state.sectorList ? this.state.sectorList.map((indexdata, index) => (

                                indexdata.stockList ? <TableRow hover={true} key={index}>
                                    <TableCell>
                                        <Typography variant="body1" >
                                            {indexdata.index || indexdata.indexName + " " + indexdata.last}({indexdata.percentChange || indexdata.percChange}%)
                                            {/* &nbsp; {indexdata.time} */}
                                        </Typography>
                                    </TableCell>

                                    {indexdata.stockList && indexdata.stockList.map((sectorItem, i) => (
                                        <TableCell style={{ textAlign: "left", }} >
                                            <div style={{ padding: "5px" }}>
                                                <Button size="small" onClick={() => this.showCandleChartPopUp(sectorItem.symbol)}>
                                                    <span style={{ background: this.getPercentageColor(sectorItem.iislPercChange) }}>  <b>{i + 1}.</b> {sectorItem.symbol} {sectorItem.ltP} ({sectorItem.iislPercChange}%) </span>
                                                    <span title="last 5 days 5min big movement  maximum count">&nbsp;{this.get5DaysMoveCount(sectorItem.symbol)}  </span>

                                                    {/* <span title="Delivery Info">&nbsp;{this.getDeliveryInfo(sectorItem.symbol)}  </span>  */}


                                                </Button>

                                            </div>


                                        </TableCell>
                                    ))
                                    }

                                </TableRow>
                                    : ""

                            )) : ''}


                        </TableBody>
                    </Table>


                </Grid>

            </React.Fragment>
        )
    }

}

// const styles = {
//     tableStyle : {
//         display: 'flex',
//         justifyContent: 'center'
//     }, 
//     selectStyle:{
//         marginBottom: '0px',
//         minWidth: 240,
//         maxWidth: 240

//     }

// }

const mapStateToProps = (state) => {
    return { packs: state.packs.packs.data };
}
export default connect(mapStateToProps, { setPackLoaded })(MyView);
