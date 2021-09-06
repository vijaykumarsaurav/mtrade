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
import LineChart from "./LineChart";
import ReactApexChart from "react-apexcharts";
import TradeConfig from './TradeConfig.json';
import ShowChartIcon from '@material-ui/icons/ShowChart';
import vwap from 'vwap';
import { SMA, RSI, VWAP } from 'technicalindicators';




const wsClintSectorUpdate = new w3cwebsocket('wss://omnefeeds.angelbroking.com/NestHtml5Mobile/socket/stream');

class MyView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            // sectorList: [],
            stopnview: '',
            indexTimeStamp: '',
            refreshFlag: true,
            refreshFlagCandle: true,
            sectorStockList: localStorage.getItem('sectorStockList') && JSON.parse(localStorage.getItem('sectorStockList')) || [],
            sectorList: localStorage.getItem('sectorList') && JSON.parse(localStorage.getItem('sectorList')) || [],
            watchList: localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')) || [],
            staticData: localStorage.getItem('staticData') && JSON.parse(localStorage.getItem('staticData')) || {},
        }
        this.refreshSectorCandle = this.refreshSectorCandle.bind(this);
    }

    componentDidMount() {
        // window.location.reload(); 

        //  this.loadIndexesList();
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



            // var tostartInteral =  setInterval(() => {

            //     console.log("1st interval every second", new Date().toLocaleTimeString());
            //     var time = new Date(); 
            //     if(time.getMinutes() % 5 === 0){
            //         console.log("5th min completed at", new Date().toLocaleTimeString());
            //         console.log("next scan at", new Date(new Date().getTime()+70000).toLocaleTimeString());

            //         setTimeout(() => {
            //             console.log("set timout at 70sec ", new Date());
            //            this.refreshSectorCandle(); 
            //         }, 70000);

            //         setInterval(() => {
            //            this.refreshSectorCandle(); 
            //          }, 60000 * 5 + 70000 );  

            //          clearInterval(tostartInteral); 
            //     } 
            // }, 1000);



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


    placeSLMOrder = (slmOption) => {

        var data = {
            "triggerprice": slmOption.stopLossPrice,
            "tradingsymbol": slmOption.tradingsymbol,
            "symboltoken": slmOption.symboltoken,
            "quantity": slmOption.quantity,
            "transactiontype": slmOption.transactiontype === "BUY" ? "SELL" : "BUY",
            "exchange": 'NSE',
            "producttype": "INTRADAY",//"DELIVERY",
            "duration": "DAY",
            "price": 0,
            "squareoff": "0",
            "stoploss": "0",
            "ordertype": "STOPLOSS_MARKET", //STOPLOSS_MARKET STOPLOSS_LIMIT
            "variety": "STOPLOSS"
        }
        console.log("SLM option data", data);
        AdminService.placeOrder(data).then(res => {
            let data = resolveResponse(res);
            //  console.log(data);   
            if (data.status && data.message === 'SUCCESS') {
                this.setState({ orderid: data.data && data.data.orderid });
                // this.updateOrderList(); 
                this.speckIt('hey Vijay, ' + slmOption.tradingsymbol + " buy order placed");
                this.getTodayOrder();
                document.getElementById('orderRefresh') && document.getElementById('orderRefresh').click();
            }
        })
    }

    placeOrderMethod = (orderOption) => {

        var data = {
            "transactiontype": orderOption.transactiontype,//BUY OR SELL
            "tradingsymbol": orderOption.tradingsymbol,
            "symboltoken": orderOption.symboltoken,
            "quantity": orderOption.quantity,
            "ordertype": orderOption.buyPrice === 0 ? "MARKET" : "LIMIT",
            "price": orderOption.buyPrice,
            "producttype": "INTRADAY",//"DELIVERY",
            "duration": "DAY",
            "squareoff": "0",
            "stoploss": "0",
            "exchange": "NSE",
            "variety": "NORMAL"
        }
        console.log("place order option", data);
        AdminService.placeOrder(data).then(res => {
            let data = resolveResponse(res);
            //  console.log(data);   
            if (data.status && data.message === 'SUCCESS') {
                this.speckIt(orderOption.tradingsymbol + " Added");
                this.setState({ orderid: data.data && data.data.orderid });
                if (orderOption.stopLossPrice) {
                    this.placeSLMOrder(orderOption);
                }
            }
        })
    }

    getMinPriceAllowTick = (minPrice) => {
        minPrice = minPrice.toFixed(2);
        // console.log("minPrice",minPrice); 
        var wholenumber = parseInt(minPrice.split('.')[0]);
        //  console.log("wholenumber",wholenumber); 
        var decimal = parseFloat(minPrice.split('.')[1]);
        // console.log("decimal",decimal); 
        var tickedecimal = decimal - decimal % 5;
        minPrice = parseFloat(wholenumber + '.' + tickedecimal);
        //   console.log("minPricexxxx",minPrice); 
        return minPrice;
    }


    historyWiseOrderPlace = (sectorItem, orderType, isAutomatic, spinnerIndex) => {


        this.setState({ [spinnerIndex]: true })

        var token = sectorItem.token;
        var symbol = sectorItem.symbol;

        if (isAutomatic != "Automatic") {
            if (!window.confirm(orderType + " " + symbol + " Are you sure ? ")) {
                return;
            }
        }

        var ltpdata = { "exchange": "NSE", "tradingsymbol": symbol, "symboltoken": token, }
        AdminService.getLTP(ltpdata).then(res => {
            let ltpres = resolveResponse(res, 'noPop');
            var LtpData = ltpres && ltpres.data;
            console.log(symbol, " ltd data ", LtpData);
            let quantity = 0;
            if (LtpData && LtpData.ltp) {
                let perTradeExposureAmt = TradeConfig.totalCapital * TradeConfig.perTradeExposurePer / 100;
                quantity = Math.floor(perTradeExposureAmt / LtpData.ltp);
            }


            quantity = quantity > 0 ? 1 : 0;
            console.log(symbol, "  quantity can be order ", quantity);

            if (quantity) {
                const format1 = "YYYY-MM-DD HH:mm";
                var beginningTime = moment('9:15am', 'h:mma').format(format1);

                console.log("beginningTime", beginningTime);

                var time = moment.duration("54:10:00");  //21:10:00"
                var startdate = moment(new Date()).subtract(time);
                var data = {
                    "exchange": "NSE",
                    "symboltoken": token,
                    "interval": "FIVE_MINUTE", //ONE_DAY FIVE_MINUTE 
                    "fromdate": moment(startdate).format(format1),
                    "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
                }

                AdminService.getHistoryData(data).then(res => {
                    let histdata = resolveResponse(res, 'noPop');
                    // console.log("candle history", histdata); 
                    if (histdata && histdata.data && histdata.data.length) {

                        var candleData = histdata.data, clossest = 0, lowerest = 0, highestHigh = 0, lowestLow = 0, highestsum = 0;
                        candleData.reverse();
                        lowestLow = candleData[0][3];
                        highestHigh = candleData[0][2];
                        if (candleData && candleData.length > 0) {
                            for (let index = 0; index < 20; index++) {
                                if (candleData[index]) {
                                    clossest += candleData[index][4]; //close  
                                    lowerest += candleData[index][3];  //low
                                    highestsum += candleData[index][2];  //low
                                    if (candleData[index][2] > highestHigh) {
                                        console.log(index, highestHigh, candleData[index][2]);
                                        highestHigh = candleData[index][2];
                                    }
                                    if (candleData[index][3] <= lowestLow) {
                                        lowestLow = candleData[index][3];
                                    }
                                }
                            }

                            let devideLen = candleData.length > 20 ? 20 : candleData.length;

                            var bbmiddleValue = clossest / devideLen;
                            var bblowerValue = lowerest / devideLen;
                            var bbhigerValue = highestsum / devideLen;

                            var stoploss = 0, stoplossPer = 0;

                            if (orderType == "BUY") {
                                stoploss = bblowerValue - (highestHigh - lowestLow) * 3 / 100;
                                stoploss = this.getMinPriceAllowTick(stoploss);
                                stoplossPer = (LtpData.ltp - stoploss) * 100 / LtpData.ltp;

                                console.log(symbol, orderType, " LTP ", LtpData.ltp);
                                console.log(symbol + "highestHigh:", highestHigh, "lowestLow", lowestLow, "stoploss after tick:", stoploss, "stoploss%", stoplossPer);
                                console.log(symbol + "  close avg middle ", bbmiddleValue, "lowerest avg", bblowerValue, "bbhigerValue", bbhigerValue);

                            }


                            if (orderType == "SELL") {
                                stoploss = bbhigerValue + (highestHigh - lowestLow) * 3 / 100;
                                stoploss = this.getMinPriceAllowTick(stoploss);
                                stoplossPer = (stoploss - LtpData.ltp) * 100 / LtpData.ltp;

                                console.log(symbol, orderType, " LTP ", LtpData.ltp);
                                console.log(symbol + "highestHigh:", highestHigh, "lowestLow", lowestLow, "stoploss after tick:", stoploss, "stoploss%", stoplossPer);
                                console.log(symbol + "  close avg middle ", bbmiddleValue, "lowerest avg", bblowerValue, "bbhigerValue", bbhigerValue);

                            }



                            var orderOption = {
                                transactiontype: orderType,
                                tradingsymbol: symbol,
                                symboltoken: token,
                                buyPrice: 0,
                                quantity: quantity,
                                stopLossPrice: stoploss
                            }
                            if (quantity) {

                                this.placeOrderMethod(orderOption);
                                this.setState({ [spinnerIndex]: false })

                            } else {
                                Notify.showError(symbol + " stoploss is > 1.5% Rejected");
                                console.log(symbol + " its not fullfilled");

                            }
                        }


                    } else {
                        //localStorage.setItem('NseStock_' + symbol, "");
                        Notify.showError(symbol + " candle data emply");
                        console.log(symbol + " candle data emply");
                        this.setState({ [spinnerIndex]: true })
                    }
                })

            }else{
                Notify.showError(quantity + "  quantity |  " + symbol + " " + orderType + " Rejected");
                this.setState({ [spinnerIndex]: false })
            }
        }).catch(function(error){
            this.setState({ [spinnerIndex]: true })
        })
        // await new Promise(r => setTimeout(r, 2000)); 
    }




    loadIndexesList() {
        this.setState({ indexTimeStamp: '', refreshFlag: false, failedCount: 0 });

        AdminService.getAllIndices()
            .then((res) => {
                if (res.data) {
                    var data = res.data, sectorStockList = [];
                    this.setState({ indexTimeStamp: data.timestamp })
                    var foundSectors = data.data.filter(row => row.key === "SECTORAL INDICES");
                    var softedData = foundSectors.sort(function (a, b) { return b.percentChange - a.percentChange });
                    function sleep(ms) {
                        return new Promise(resolve => setTimeout(resolve, ms));
                    }
                    var updateLtpOnInterval = async (ref, softedData) => {
                            for (let i = 0; i < softedData.length; i++) {

                                var length = 1; 

                                
                                this.setState({stockUpdate : i+1 + ". " + softedData[i].index});
                                console.log(softedData[i].index,softedData[i].percentChange,  softedData[i]); 

                                if (softedData[i].percentChange >= 0.75 || softedData[i].percentChange <= -0.75) {
                                    var sectorStocks = this.state.staticData[softedData[i].index];
                                    softedData[i].stockList = sectorStocks;
                                    length = sectorStocks.length; 
                                    if (sectorStocks && sectorStocks.length) {
                                        ref.refreshSectorLtp(sectorStocks,softedData[i].index );
                                    }
                                }

                            
                                await sleep(length / 10 * 1500);
                            }
                        }
                        updateLtpOnInterval(this, softedData);
                }
            })
            .catch((reject) => {
                Notify.showError("All Indices API Failed" + <br /> + reject);
                this.speckIt("All Indices API Failed");

            })

        this.setState({ refreshFlag: true });

    }

    updateLTPMannually = (index) => {

        var sectorStocks = this.state.staticData[index];
        this.refreshSectorLtp(sectorStocks, index);
    }


    refreshSectorLtp = async (sectorStocks, index) => {

        this.setState({stockUpdate : index});

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
        this.refreshSectorCandleManually(index); 
    }




    refreshSectorCandleManually = async (index) => {

        var sectorStocks = this.state.staticData[index];
     //   this.refreshSectorLtp(sectorStocks, index);


        this.setState({ refreshFlagCandle: false });
        console.log("sectorStockList", index);


        for (let index = 0; index < sectorStocks.length; index++) {
            var beginningTime = moment('9:15am', 'h:mma');
            var time = moment.duration("12:00:00");
            var startdate = moment(new Date()).subtract(time);

            var data = {
                "exchange": "NSE",
                "symboltoken": sectorStocks[index].token,
                "interval": "FIFTEEN_MINUTE", //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
                "fromdate": moment(beginningTime).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
                "todate": moment(new Date()).format("YYYY-MM-DD HH:mm") // moment("2020-06-30 14:00").format("YYYY-MM-DD HH:mm") 
            }

            this.setState({ stockCandleUpdate: index + 1 + ". " + sectorStocks && sectorStocks[index].symbol });


            AdminService.getHistoryData(data).then(res => {
                let histdata = resolveResponse(res, 'noPop');
                //console.log("candle history", histdata); 
                if (histdata && histdata.data && histdata.data.length) {

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

    makeConnection = () => {

        var firstTime_req = '{"task":"cn","channel":"NONLM","token":"' + this.state.feedToken + '","user": "' + this.state.clientcode + '","acctid":"' + this.state.clientcode + '"}';
        console.log("Connection sectior top firstTime_req :- " + firstTime_req);

        if (!wsClintSectorUpdate) return;
        wsClintSectorUpdate.send(firstTime_req);

        this.updateSocketWatch();
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

    get2DecimalNumber =(number)=>{

        if(number){
            return number.toFixed(2); 
        }else{
            return number;  
        }
    }

    render() {

        this.state.sectorList && this.state.sectorList.forEach((outerEelement, index) => {
            outerEelement.stockList && outerEelement.stockList.sort(function (a, b) {
                return b.nc - a.nc;
            });
        });


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



                <Grid direction="row" container className="flexGrow" spacing={1} style={{ paddingLeft: "5px", paddingRight: "5px" }}>
                    <Grid item xs={12} sm={12} >
                        <Typography component="h3" variant="h6" color="primary" >
                            Sectors Stocks({this.state.sectorStockList.length}) at {this.state.indexTimeStamp}
                            {this.state.refreshFlag ? <Button variant="contained" onClick={() => this.loadIndexesList()}>Live Ltp</Button> : <> <Button> <Spinner /> &nbsp; {this.state.stockUpdate}  </Button> </>}
                            {this.state.failedCount ? this.state.failedCount + "Failed" : ""}

                            &nbsp;

                            {/* {this.state.refreshFlagCandle ? <Button variant="contained" onClick={() => this.refreshSectorCandle()}>Refresh Candle</Button> : <> <Button> <Spinner /> &nbsp; {this.state.stockCandleUpdate}  </Button> </>}
                            &nbsp; */}

                            <Button variant="contained" onClick={() => this.makeConnection()}> WS Refresh</Button>




                        </Typography>

                        {/* {localStorage.getItem('autoTradeTopList')} */}

                    </Grid>



                    {this.state.sectorList ? this.state.sectorList.map((indexdata, index) => (


                        <Grid item xs={12} sm={this.state.sectorList.length <= 2 ? 6 : this.state.sectorList.length == 3 ? 4 : 3}>

                            <Paper style={{ padding: '10px', background: "lightgray", textAlign: "center" }}>


                                <Button size="small" variant="contained" title="update ltp" onClick={() => this.updateLTPMannually(indexdata.index)}>
                                    <b> {index + 1}. {indexdata.index + " " + indexdata.last}({indexdata.percentChange}%) </b>

                                </Button>
                                &nbsp;

                                <Button size="small" variant="contained" title="Candle refresh" onClick={() => this.refreshSectorCandleManually(indexdata.index)}>
                                    <ShowChartIcon />
                                </Button>


                                <Grid direction="row" container className="flexGrow" spacing={1} >


                                    {indexdata.stockList && indexdata.stockList.map((sectorItem, i) => (

                                        <Grid item xs={12} sm={6} >
                                            <Paper style={{ textAlign: "center" }} >

                                                {/* {sectorItem.cng} */}
                                                <Typography style={{ background: this.getPercentageColor(sectorItem.cng), fontSize: '14px' }}>
                                                    {i + 1}. {sectorItem.name} {sectorItem.ltp} ({ this.get2DecimalNumber(sectorItem.nc)}%)
                                                </Typography>

                                          
                                            

                                                {sectorItem.candleChartData ?  <span style={{ cursor: 'pointer' }} onClick={() => this.showCandleChart(sectorItem.candleChartData, sectorItem.name, sectorItem.ltp, sectorItem.nc, sectorItem.vwapDataChart)} >
                                                   <LineChart candleChartData={sectorItem.candleChartData} percentChange={sectorItem.nc} vwapDataChart={sectorItem.vwapDataChart} /> 
                                                </span> : ""}

                                                {sectorItem.vwapValue ? 
                                                <Typography >
                                                    {sectorItem.vwapValue ? <span  style={{ background: sectorItem.ltp > sectorItem.vwapValue ? "#00ff00" : "red", fontSize: '14px' }}>VWAP:{sectorItem.vwapValue && sectorItem.vwapValue.toFixed(2)} </span> : ""}
                                                    &nbsp;
                                                    {sectorItem.lastRsiValue ? <span title="OB means 'Overbought'" style={{ background: sectorItem.lastRsiValue >= 60 ? "#00ff00" : sectorItem.lastRsiValue >= 40 && sectorItem.lastRsiValue < 60 ? "lightgray" : "red", fontSize: '14px' }}>RSI:{sectorItem.lastRsiValue} {sectorItem.lastRsiValue > 80 ? "OB" : sectorItem.lastRsiValue >= 60 && sectorItem.lastRsiValue <= 80 ? "Buy" : sectorItem.lastRsiValue >= 40 && sectorItem.lastRsiValue < 60 ? "NoTrade" : "Sell"} </span> : ""}
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


                                            <Grid direction="row" style={{padding:'5px'}} container className="flexGrow" justify="space-between" >

                                                <Grid item>
                                                    {!this.state['buyButtonClicked' + indexdata.index + i] ? <Button size="small" variant="contained" color="primary"  onClick={() => this.historyWiseOrderPlace(sectorItem, 'BUY', "", 'buyButtonClicked' + indexdata.index + i)}>Buy</Button> : <Spinner />}
                                                </Grid>

                                                <Grid item >
                                                {sectorItem.ltt && new Date(sectorItem.ltt).toLocaleTimeString()}
                                                </Grid>

                                                <Grid item >
                                                    {!this.state['sellButtonClicked' + indexdata.index + i] ? <Button size="small" variant="contained" color="secondary" onClick={() => this.historyWiseOrderPlace(sectorItem, 'SELL', "", 'sellButtonClicked' + indexdata.index + i)}>Sell</Button>: <Spinner />}
                                                </Grid>
                                            </Grid>



                                            </Paper>

                                            
                                        </Grid>

                                    ))
                                    }

                                </Grid>

                            </Paper>
                        </Grid>



                    )) : <Spinner />}


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
