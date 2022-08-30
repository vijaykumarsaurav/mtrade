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
import TextField from "@material-ui/core/TextField";
import CommonOrderMethod from "../../utils/CommonMethods";
import CommonMethods from '../../utils/CommonMethods';
import OrderStatusLive from './OrderStatusLive';
import NiftybankOptionBuyAtLevel from './NiftybankOptionBuyAtLevel';
import BNOptionBuyAtLevel from './BNOptionBuyAtLevel';
import TrailingSwitch from "../../utils/TrailingSwitch";

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            positionList: [],
            autoSearchList: [],
            InstrumentLTP: {},
            autoSearchTemp: [],
            foundPatternList: [], //localStorage.getItem('foundPatternList') && JSON.parse(localStorage.getItem('foundPatternList')) || [], 
            symboltoken: "",
            tradingsymbol: "",
            buyPrice: 0,
            quantity: 1,
            producttype: "DELIVERY",
            nr4TotalPer: 0,
            pnlAmountTotal: 0,
            totalNetProfit: 0,
            totelActivatedCount: 0,
            totalBrokerChargesNR4: 0,
            stockTesting: "",
            perHighLowTotal: 0,
            netPnLAmountOnHighlowTotal: 0,
            firstTimeMove: 0.6,
            firstTimeSLMove: 0.5,
            nextTimeMove: 0.6,
            nextTimeSLMove: 0.3,
            firstTimeMoveOption: 10,
            firstTimeSLMoveOption: 5,
            nextTimeMoveOption: 10,
            nextTimeSLMoveOption: 5,
            staticData: localStorage.getItem('staticData') && JSON.parse(localStorage.getItem('staticData')) || {},
            trackSLPrice: localStorage.getItem('trackSLPrice') && JSON.parse(localStorage.getItem('trackSLPrice')) || [],
            enableSLMOrderUi: false,
            addSLInfo: {},
            activeStockOptions: localStorage.getItem('activeStockOptions') && JSON.parse(localStorage.getItem('activeStockOptions')) || [], 
            liveBankniftyLtdData: ''
        };
    }
    componentDidMount() {

        this.updateOrderList();

        var beginningTime = moment('9:15am', 'h:mma');
        var endTime = moment('3:30pm', 'h:mma');
        const friday = 5; // for friday
        var currentTime = moment(new Date(), "h:mma");
        const today = moment().isoWeekday();
        //market hours
        if (today <= friday && currentTime.isBetween(beginningTime, endTime)) {
            this.setState({ positionInterval: setInterval(() => { this.getPositionData(); }, 1000) })
           // this.setState({ bankNiftyInterval: setInterval(() => {  this.getBankNiftyLTP(); }, 1000) })

            var intervaltime = 1000;
            if (this.state.activeStockOptions.length > 10) {
                intervaltime = this.state.activeStockOptions.length * 110;
            }
            //this.setState({ updateStockInterval: setInterval(() => { this.getOptionStockLiveLtp(); }, intervaltime) });

            var squireInterval = setInterval(() => {
                let sqrOffbeginningTime = moment('3:14pm', 'h:mma');
                let sqrOffendTime = moment('3:15pm', 'h:mma');
                let sqrOffcurrentTime = moment(new Date(), "h:mma");

                if (sqrOffcurrentTime.isBetween(sqrOffbeginningTime, sqrOffendTime)) {
                    this.state.positionList.forEach((element, i) => {
                        if (element.netqty > 0 || element.netqty < 0) {
                            this.squareOff(element);
                        }
                        if (this.state.positionList.length == i + 1) {
                            clearInterval(squireInterval);
                            console.log("squireInterval ended");
                        }
                    });
                }
            }, 5000);

        } else {
            clearInterval(this.state.positionInterval);
            // clearInterval(this.state.bankNiftyInterval);
        }
    }

    getOptionStockLiveLtp = async () => {

        for (let index = 0; index < this.state.activeStockOptions.length; index++) {
            const element = this.state.activeStockOptions[index];
            var data = { "exchange": element.exch_seg, "tradingsymbol": element.symbol, "symboltoken": element.token };


            AdminService.getLTP(data).then(res => {
                let data = resolveResponse(res, 'noPop');
                var LtpData = data && data.data;
                if (LtpData && LtpData.ltp) {
                    element.ltp = LtpData.ltp;
                    element.perChange = ((LtpData.ltp - LtpData.close) * 100 / LtpData.close).toFixed(2);

                     console.log('element', element)

                    let elementP = this.state.positionList.filter(name => name.symbolname == element.symbol);
                
                    // for (let indexP = 0; indexP < this.state.positionList.length; indexP++) {
                    //     elementP = this.state.positionList[indexP];
                    //     if (elementP.symbolname === element.symbol) {
                    //         elementP.optionStockLtp = LtpData.ltp;
                    //         elementP.optionStockName = element.symbol;
                    //         elementP.optionStockChange = element.perChange;

                    //         break;
                    //     }
                    // }
                    // this.setState({ positionList: this.state.positionList });

                    if(elementP[0]){
                        //ce quireoff 
                        if (elementP.optiontype === 'CE' && (LtpData.ltp < element.optionStockStoploss || LtpData.ltp >= element.optionStockTarget)) {
                            var isDelete = this.deleteActiveOptionStock(element);
                            if (isDelete) {
                                //   this.squareOff(elementP, false);
                            }
                        }
                        //pe squired off
                        if (elementP.optiontype === 'PE' && (LtpData.ltp > element.optionStockStoploss || LtpData.ltp <= element.optionStockTarget)) {
                            var isDelete = this.deleteActiveOptionStock(element);
                            if (isDelete) {
                                //    this.squareOff(elementP, false);
                            }
                        }

                    }
                 
                }
                this.setState({ activeStockOptions: this.state.activeStockOptions });

            })

            await new Promise(r => setTimeout(r, 100));
        }
    }

    deleteActiveOptionStock = (row) => {
        var isDeleted = false;
        for (let index = 0; index < this.state.activeStockOptions.length; index++) {
            const element = this.state.activeStockOptions[index];
            if (row.name == element.name) {
                var delitem = this.state.activeStockOptions.splice(index, 1);
                if (delitem[0].name == row.name) {
                    isDeleted = true;
                }
                this.setState({ activeStockOptions: this.state.activeStockOptions });
                break;
            }
        }
        return isDeleted;
    }


    componentWillUnmount() {
        //clearInterval(this.state.positionInterval);
        // clearInterval(this.state.scaninterval);
        //  clearInterval(this.state.bankNiftyInterval); 
    }


    refreshCandleChartManually = async (row) => {

        var beginningTime = moment('9:15am', 'h:mma');
        var time = moment.duration("12:00:00");
        var startdate = moment(new Date()).subtract(time);

        var data = {
            "exchange": "NSE",
            "symboltoken": row.symboltoken,
            "interval": "FIVE_MINUTE", //ONE_DAY FIVE_MINUTE FIFTEEN_MINUTE THIRTY_MINUTE
            "fromdate": moment(beginningTime).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
            "todate": moment(new Date()).format("YYYY-MM-DD HH:mm") // moment("2020-06-30 14:00").format("YYYY-MM-DD HH:mm") 
        }
        AdminService.getHistoryData(data).then(res => {
            let histdata = resolveResponse(res, 'noPop');
            //console.log("candle history", histdata); 
            if (histdata && histdata.data && histdata.data.length) {

                var candleChartData = [];
                histdata.data.forEach(element => {
                    candleChartData.push([element[0], element[1], element[2], element[3], element[4]]);
                });


                localStorage.setItem('candleChangeShow', ((row.ltp - row.close) * 100 / row.close).toFixed(2));


                localStorage.setItem('candleChartData', JSON.stringify(candleChartData))
                localStorage.setItem('cadleChartSymbol', row.symbolname);
                document.getElementById('showCandleChart').click();

            } else {
                //localStorage.setItem('NseStock_' + symbol, "");
                console.log(row.symboltoken, "  emply candle found");
            }
        }).catch(error => {
            this.setState({ failedCount: this.state.failedCount + 1 });
            Notify.showError(row.symboltoken + " candle failed!");
        })

    }

    showCandleChart = (candleData, symbol) => {
        candleData = candleData && candleData.reverse();
        localStorage.setItem('candleChartData', JSON.stringify(candleData))
        localStorage.setItem('cadleChartSymbol', symbol)
        document.getElementById('showCandleChart').click();
    }

    showMultipleCandleChart = (row) => {
        localStorage.setItem('multipleChartData', JSON.stringify(row))
        document.getElementById('showMultipleChart').click();
    }

    refreshLtpOnFoundPattern = async () => {

        this.setState({ nr4TotalPer: 0, totalBrokerChargesNR4: 0, totalNetProfit: 0, totelActivatedCount: 0, pnlAmountTotal: 0, perHighLowTotal: 0, netPnLAmountOnHighlowTotal: 0 });


        var foundPatternList = this.state.foundPatternList;

        this.setState({ foundPatternList: [] });

        var foundPatternsFromStored = localStorage.getItem("FoundPatternList") ? JSON.parse(localStorage.getItem("FoundPatternList")) : [];


        //       foundPatternList.forEach(element => {
        for (let index = 0; index < foundPatternsFromStored.length; index++) {
            const element = foundPatternList[index];

            if (element && element.pattenName == 'NR4') {

                var data = {
                    "exchange": "NSE",
                    "tradingsymbol": element.symbol,
                    "symboltoken": element.token,
                }

                AdminService.getLTP(data).then(res => {
                    let data = resolveResponse(res, 'noPop');
                    var LtpData = data && data.data;
                    //console.log(LtpData);
                    var quantity = 0, pnlAmount = 0, netPnLAmount = 0, brokerageCharges = 0.06, perChange = 0, perChangeOnHighLow = 0, netPnLAmountOnHighlow = 0;
                    if (LtpData && LtpData.ltp) {

                        var orderActivated = <span> {LtpData.ltp} </span>;

                        if (LtpData.ltp > element.BuyAt) {
                            perChange = ((LtpData.ltp - element.BuyAt) * 100 / element.BuyAt);
                            orderActivated = <span style={{ color: 'green' }}> Long: {perChange.toFixed(2)}% </span>;
                            quantity = Math.floor(10000 / element.BuyAt);
                            pnlAmount = ((LtpData.ltp - element.BuyAt) * quantity);
                            brokerageCharges = (((element.BuyAt * quantity) * brokerageCharges / 100) * 2);
                            netPnLAmount = (pnlAmount - brokerageCharges);
                            this.setState({ nr4TotalPer: this.state.nr4TotalPer + perChange });
                            this.setState({ totalBrokerChargesNR4: this.state.totalBrokerChargesNR4 + brokerageCharges, totalNetProfit: this.state.totalNetProfit + netPnLAmount });
                            this.setState({ totelActivatedCount: this.state.totelActivatedCount + 1, pnlAmountTotal: this.state.pnlAmountTotal + pnlAmount });

                            perChangeOnHighLow = ((LtpData.high - element.BuyAt) * 100 / element.BuyAt);
                            var pnlAmountOnhigh = ((LtpData.high - element.BuyAt) * quantity);
                            netPnLAmountOnHighlow = (pnlAmountOnhigh - brokerageCharges);
                            this.setState({ perHighLowTotal: this.state.perHighLowTotal + perChangeOnHighLow, netPnLAmountOnHighlowTotal: this.state.netPnLAmountOnHighlowTotal + netPnLAmountOnHighlow });


                        }
                        if (LtpData.ltp < element.SellAt) {
                            perChange = ((element.SellAt - LtpData.ltp) * 100 / element.SellAt);
                            orderActivated = <span style={{ color: 'red' }}> Short: {perChange.toFixed(2)}%</span>;
                            quantity = Math.floor(10000 / element.SellAt);
                            pnlAmount = ((element.SellAt - LtpData.ltp) * quantity);
                            brokerageCharges = (((element.SellAt * quantity) * brokerageCharges / 100) * 2);
                            netPnLAmount = (pnlAmount - brokerageCharges);
                            this.setState({ nr4TotalPer: this.state.nr4TotalPer + perChange });
                            this.setState({ totelActivatedCount: this.state.totelActivatedCount + 1, pnlAmountTotal: this.state.pnlAmountTotal + pnlAmount });
                            this.setState({ totalBrokerChargesNR4: this.state.totalBrokerChargesNR4 + brokerageCharges, totalNetProfit: this.state.totalNetProfit + netPnLAmount });

                            perChangeOnHighLow = ((element.SellAt - LtpData.low) * 100 / element.SellAt);
                            var pnlAmountOnLow = ((element.SellAt - LtpData.low) * quantity);
                            netPnLAmountOnHighlow = (pnlAmountOnLow - brokerageCharges);
                            this.setState({ perHighLowTotal: this.state.perHighLowTotal + perChangeOnHighLow, netPnLAmountOnHighlowTotal: this.state.netPnLAmountOnHighlowTotal + netPnLAmountOnHighlow });

                        }

                        var todayChange = (LtpData.ltp - LtpData.close) * 100 / LtpData.close;


                        var builtupCandle = [new Date(), LtpData.open, LtpData.high, LtpData.low, LtpData.ltp];
                        element.candleChartData.push(builtupCandle);

                        var foundData = {
                            symbol: element.symbol,
                            symbolUpdated: LtpData.ltp + "(" + (todayChange).toFixed(2) + "%)",
                            token: element.token,
                            pattenName: 'NR4',
                            OnHighLowActivated: quantity ? perChangeOnHighLow.toFixed(2) + "% | " + netPnLAmountOnHighlow.toFixed(2) : "",
                            time: new Date().toLocaleTimeString(),
                            BuyAt: element.BuyAt,
                            SellAt: element.SellAt,
                            foundAt: element.foundAt,
                            orderActivated: orderActivated,
                            candleChartData: element.candleChartData,
                            quantity: quantity ? quantity : "",
                            brokerageCharges: quantity ? brokerageCharges.toFixed(2) : "",
                            pnlAmount: pnlAmount ? pnlAmount.toFixed(2) : "",
                            netPnLAmount: netPnLAmount ? netPnLAmount.toFixed(2) : "",
                            perChange: perChange,
                            todayChange: todayChange,
                            pastPerferm: element.pastPerferm
                        }

                        console.log('nr4 updated', foundData);

                        this.setState({ foundPatternList: [...this.state.foundPatternList, foundData] });

                        var foundlist = this.state.foundPatternList;

                        foundlist.sort(function (a, b) {
                            return b.perChange - a.perChange;
                        });

                        this.setState({ foundPatternList: foundlist });

                        var foundPatternList = localStorage.getItem("foundPatternList") ? JSON.parse(localStorage.getItem("foundPatternList")) : [];
                        foundPatternList.push(foundData);
                        localStorage.setItem('foundPatternList', JSON.stringify(foundPatternList));

                    }

                }).catch(error => {
                    Notify.showError(element.symbol + " ltd data not found!");
                })

            }
            await new Promise(r => setTimeout(r, 101));
        }
    }


    getStoplossFromOrderbook = (row) => {
        var oderbookData = localStorage.getItem('oderbookData');
        oderbookData = JSON.parse(oderbookData);
        var stopLoss = 0;
        var data = {};
        for (let index = 0; index < oderbookData.length; index++) {
            const element = oderbookData[index];

            if (element.status === "trigger pending" && element.symboltoken === row.symboltoken) {
                if (row.netqty > 0) {
                    data.stopLoss = element.triggerprice + "(" + ((element.triggerprice - row.buyavgprice) * 100 / row.buyavgprice).toFixed(2) + "%)";
                    data.maxLossAmount = ((element.triggerprice - row.buyavgprice) * parseInt(row.netqty)).toFixed(2);
                } else if (row.netqty < 0) {
                    console.log(row.tradingsymbol, "sellage", row.sellavgprice, "trigger", element.triggerprice);
                    data.stopLoss = element.triggerprice + "(" + ((element.triggerprice - row.sellavgprice) * 100 / row.sellavgprice).toFixed(2) + "%)";
                    data.maxLossAmount = ((element.triggerprice - row.sellavgprice) * parseInt(row.netqty)).toFixed(2);
                }
                break;
            }
        }

        return data;
    }
    getStoplossForSELLFromOrderbook = (row) => {
        var oderbookData = localStorage.getItem('oderbookData');
        oderbookData = JSON.parse(oderbookData);
        var stopLoss = 0;
        var data = {};
        oderbookData.forEach(element => {
            if (element.status === "trigger pending" && element.symboltoken === row.symboltoken) {
                data.stopLoss = element.triggerprice + "(" + ((row.buyavgprice - element.triggerprice) * 100 / row.buyavgprice).toFixed(2) + "%)";
                data.maxLossAmount = ((element.triggerprice - row.buyavgprice) * parseInt(row.netqty)).toFixed(2);
            }
        });
        return data;
    }
    getHighLowPercentage = async () => {

        this.setState({ showHighLowWisePer: true });

        if (!this.state.positionList.length) {
            Notify.showError("First Refresh Position")
        }

        for (let index = 0; index < this.state.positionList.length; index++) {
            const element = this.state.positionList[index];

            if (element.producttype == "DELIVERY") {
                return "";
            }

            var data = {
                "exchange": "NSE",
                "tradingsymbol": element.tradingsymbol,
                "symboltoken": element.symboltoken,
            }
            AdminService.getLTP(data).then(res => {
                let data = resolveResponse(res, 'noPop');
                var LtpData = data && data.data;
                //console.log(LtpData);
                if (LtpData && LtpData.ltp) {
                    this.state.positionList[index].high = LtpData.high;
                    this.state.positionList[index].low = LtpData.low;
                }
            })
            await new Promise(r => setTimeout(r, 125));
            this.setState({ positionList: this.state.positionList });

        }

    }
    tagPatternWhichTaken = (token) => {
        var orderTagToPosition = localStorage.getItem('orderTagToPosition') && JSON.parse(localStorage.getItem('orderTagToPosition')) || [];

        var pattern = '';
        for (let index = 0; index < orderTagToPosition.length; index++) {
            const element = orderTagToPosition[index];
            if (token == element.token) {
                pattern = element.pattenName;
                break;
            }
        }
        return pattern
        //    console.log("findpatter", token, orderTagToPosition);
        //    orderTagToPosition.forEach(element => {
        //         if(token == element.token){
        //             return element.pattenName; 
        //         }
        //    });

    }
    calculateTradeExpence = (element) => {

        var totalbuyvalue = parseFloat(element.totalbuyvalue) === 0 ? parseFloat(element.totalsellvalue) : parseFloat(element.totalbuyvalue);
        var buyCharge = parseFloat(totalbuyvalue) * 0.25 / 100;
        if (buyCharge > 20 || (element.optiontype == 'CE' || element.optiontype == 'PE')) {
            buyCharge = 20;
        }
        var totalsellvalue = parseFloat(element.totalsellvalue) === 0 ? parseFloat(element.totalbuyvalue) : parseFloat(element.totalsellvalue);
        var sellCharge = parseFloat(totalsellvalue) * 0.25 / 100;
        if (sellCharge > 20 || (element.optiontype == 'CE' || element.optiontype == 'PE')) {
            sellCharge = 20;
        }
        let turnOver = totalbuyvalue + totalsellvalue;
        let totalBroker = buyCharge + sellCharge;

        let sst = 0.025; //stock intraday
        if (element.optiontype == 'CE' || element.optiontype == 'PE') {
            sst = 0.05;
        }

        let sstCharge = totalsellvalue * sst / 100;
        let transCharge = turnOver * 0.00335 / 100;
        let stampDuty = totalbuyvalue * 0.003 / 100;
        let sebiCharge = turnOver * 10 / 10000000;
        let gstCharge = (totalBroker + transCharge + sebiCharge) * 18 / 100;

        let total = totalBroker + sstCharge + transCharge + stampDuty + sebiCharge + gstCharge;

        var chargeInfo = {
            tradeExpence: total,
            expenceInfo: "Brokerage: " + totalBroker.toFixed(2) + " \nSTT: " + sstCharge.toFixed(2) + " \nTransaction: " + transCharge.toFixed(2) + " \nStamp Duty: " + stampDuty.toFixed(2) + " \nSebi: " + sebiCharge.toFixed(2) + " \nGST: " + gstCharge.toFixed(2) + " \n\nTotal: " + total.toFixed(2)
        }
        return chargeInfo;
    }
    refreshBasedAmount = () => {
        let totCheckAmount = 0, checkTotalNet = 0, totCheckExp = 0;
        this.state.positionList.forEach((item) => {

            let perchange = this.state.checkAmountPer ? this.state.checkAmountPer : item.percentPnL;
            item.checkAmount = (this.state.checkAmount * perchange / 100).toFixed(2)
            totCheckAmount = totCheckAmount + parseFloat(item.checkAmount);

            let quantity = Math.floor(this.state.checkAmount / item.buyavgprice);
            item.checkQty = quantity;
            item.totalbuyvalue = quantity * item.buyavgprice;
            item.totalsellvalue = quantity * item.sellavgprice;
            item.checkExpence = this.calculateTradeExpence(item);
            if (item.checkExpence) {
                item.checkNet = (item.checkAmount - item.checkExpence.tradeExpence)
                totCheckExp = totCheckExp + item.checkExpence.tradeExpence;
                checkTotalNet = checkTotalNet + parseFloat(item.checkNet);
            }
            console.log(item)

        })
        this.setState({ totCheckAmount: totCheckAmount.toFixed(2), checkTotalNet: checkTotalNet.toFixed(2), totCheckExp: totCheckExp.toFixed(2), positionList: this.state.positionList });
    }

    checkSLOrTarget = (row) => {
        let trackSLPrice = localStorage.getItem('trackSLPrice') ? JSON.parse(localStorage.getItem('trackSLPrice')) : [];
        if (trackSLPrice.length > 0) {
            for (let index = 0; index < trackSLPrice.length; index++) {
                const element = trackSLPrice[index];

                if (element.optiontype == 'EQ' || element.optiontype == '') {
                    if (element.tradingsymbol == row.tradingsymbol && (row.ltp < parseFloat(element.priceStopLoss) || row.ltp >= parseFloat(element.priceTarget))) {
                        this.squareOff(row);
                    }
                }
            }
        }
    }



    getPositionData = async () => {
        //   document.getElementById('orderRefresh') && document.getElementById('orderRefresh').click(); 
        var maxPnL = 0, totalMaxPnL = 0;
        var trackSLPriceList = localStorage.getItem('trackSLPrice') ? JSON.parse(localStorage.getItem('trackSLPrice')) : [];

        AdminService.getPosition().then(res => {
            let data = resolveResponse(res, 'noPop');
            var positionList = data && data.data;
            if (positionList && positionList.length > 0) {


                var todayProfitPnL = 0, totalbuyvalue = 0, totalsellvalue = 0, totalQtyTraded = 0, allbuyavgprice = 0, allsellavgprice = 0, totalPercentage = 0, totalExpence = 0;

                let tradingPositionlist = [];
                for (let index = 0; index < positionList.length; index++) {
                    const element = positionList[index];
                    // if (element.netqty < 0) {
                    //     continue;
                    // }
                    tradingPositionlist.push(element);

                    todayProfitPnL += parseFloat(element.pnl);
                    totalbuyvalue += parseFloat(element.totalbuyvalue);
                    totalsellvalue += parseFloat(element.totalsellvalue) === 0 ? parseFloat(element.totalbuyvalue) : parseFloat(element.totalsellvalue);
                    totalQtyTraded += parseInt(element.buyqty);
                    allbuyavgprice += parseFloat(element.buyavgprice);
                    allsellavgprice += parseFloat(element.sellavgprice);
                    if (element.netqty == 0) {
                        let percentPnL = ((parseFloat(element.sellavgprice) - parseFloat(element.buyavgprice)) * 100 / parseFloat(element.buyavgprice));
                        element.percentPnL = percentPnL.toFixed(2);
                        totalPercentage += parseFloat(percentPnL);

                        localStorage.removeItem('firstTimeModify' + element.tradingsymbol)
                        localStorage.removeItem('lastTriggerprice_' + element.tradingsymbol)
                    }

                    element.pattenName = this.tagPatternWhichTaken(element.symboltoken);

                    let chargeInfo = this.calculateTradeExpence(element);
                    element.tradeExpence = chargeInfo.tradeExpence.toFixed(2);
                    element.expenceInfo = chargeInfo.expenceInfo;
                    totalExpence += chargeInfo.tradeExpence;

                    var slData = this.getStoplossFromOrderbook(element);
                    if (slData) {
                        element.stopLoss = slData.stopLoss;
                        element.stopLossAmount = slData.maxLossAmount;
                        totalMaxPnL += parseFloat(slData.maxLossAmount) ? parseFloat(slData.maxLossAmount) : 0;
                    }

                    this.checkSLOrTarget(element);

                    if ((element.optiontype == 'CE' || element.optiontype == 'PE') && element.netqty > 0) {
                        let found = this.state.activeStockOptions.filter(name => name.name == element.symbolname);
                        element.optionStockName = element.symbolname;
                        element.optiontype = element.optiontype;

                        let spotDetails = CommonMethods.getStockTokenDetails(element.symbolname);
                        spotDetails.optiontype = element.optiontype;
                        spotDetails.netqty = element.netqty;
                        spotDetails.tradingsymbol = element.tradingsymbol;

                        if (found[0]) {
                            element.optionStockStoploss = found[0] && found[0].optionStockStoploss;
                            element.optionStockTarget = found[0] && found[0].optionStockTarget;
                        }else{
                            this.setState({ activeStockOptions: [...this.state.activeStockOptions, spotDetails] });
                            localStorage.setItem("activeStockOptions", JSON.stringify(this.state.activeStockOptions));
                            
                        }
                    }
                }

                this.setState({ todayProfitPnL: todayProfitPnL.toFixed(2), totalbuyvalue: totalbuyvalue.toFixed(2), totalsellvalue: totalsellvalue.toFixed(2), totalQtyTraded: totalQtyTraded });
                this.setState({ allbuyavgprice: (allbuyavgprice / positionList.length).toFixed(2), allsellavgprice: (allsellavgprice / positionList.length).toFixed(2), totalPercentage: totalPercentage });

                var brokerageOnlyCharges = ((totalbuyvalue + totalsellvalue) * 0.25 / 100);
                var allCharges = brokerageOnlyCharges + brokerageOnlyCharges * 25 / 100;
                this.setState({ totalExpence: totalExpence.toFixed(2) });

                this.setState({ totalTornOver: (totalbuyvalue + totalsellvalue).toFixed(2), totalMaxPnL: totalMaxPnL.toFixed(2) });

                tradingPositionlist.sort((a, b) => b.netqty - a.netqty);

                this.setState({ positionList: tradingPositionlist });

               // this.getOptionStockLiveLtp();
            }
        })

    }

    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
        var data = e.target.value;
        AdminService.autoCompleteSearch(data).then(res => {
            let data = res.data;
            //    console.log(data);       
            localStorage.setItem('autoSearchTemp', JSON.stringify(data));
            this.setState({ autoSearchList: data });
        })
    }

    optionStockStoplossChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
        for (let index = 0; index < this.state.activeStockOptions.length; index++) {
            const element = this.state.activeStockOptions[index];
            if (e.target.name === element.name) {
                element.optionStockStoploss = e.target.value;
                localStorage.setItem("activeStockOptions", JSON.stringify(this.state.activeStockOptions));
                break;
            }
        }
    }
    optionStockTargetChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
        for (let index = 0; index < this.state.activeStockOptions.length; index++) {
            const element = this.state.activeStockOptions[index];
            if (e.target.name === element.name) {
                element.optionStockTarget = e.target.value;
                localStorage.setItem("activeStockOptions", JSON.stringify(this.state.activeStockOptions));
                break;
            }
        }
    }

    onTrailChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
        //  console.log([e.target.name],  e.target.value)
    }

    onAddSLChange = (e) => {
        let addSLInfo = this.state.addSLInfo;
        addSLInfo[e.target.name] = e.target.value.toUpperCase();
        this.setState({ addSLInfo: addSLInfo });
    }

    deleteOptionPriceSL = (element, deleteindex) => {
        for (let indexP = 0; indexP < this.state.positionList.length; indexP++) {
            const position = this.state.positionList[indexP];
            console.log("squireoffff", position.tradingsymbol, element.tradingsymbol, position.buyqty)

            if (position.tradingsymbol == element.tradingsymbol && position.buyqty > 0) {

                var trackSLPriceList = localStorage.getItem('trackSLPrice') && JSON.parse(localStorage.getItem('trackSLPrice'));
                if (trackSLPriceList && trackSLPriceList.length > 0) {
                    trackSLPriceList.splice(deleteindex, 1);
                    localStorage.setItem('trackSLPrice', JSON.stringify(trackSLPriceList));
                    this.setState({ trackSLPrice: trackSLPriceList }, () => {
                        this.squareOff(position, true);
                    });
                    break;
                }

            }
        }
    }


    deleteIndexOption = (element, deleteindex) => {
        for (let indexP = 0; indexP < this.state.positionList.length; indexP++) {
            const position = this.state.positionList[indexP];

            if (position.tradingsymbol == element.tradingsymbol && position.netqty > 0) {
                
                if (this.state.activeStockOptions && this.state.activeStockOptions.length > 0) {
                    this.state.activeStockOptions.splice(deleteindex, 1);
                    this.setState({ activeStockOptions: this.state.activeStockOptions }, () => {
                        localStorage.setItem("activeStockOptions", JSON.stringify(this.state.activeStockOptions));
                        this.squareOff(position, true);
                    });
                    break;
                }

            }
        }
    }

    getNiftyLTP = () => {
        var data = {
            "exchange": "NSE",
            "tradingsymbol": "NIFTY",
            "symboltoken": "26000",
        }
        AdminService.getLTP(data).then(res => {
            let data = resolveResponse(res, 'noPop');
            var LtpData = data && data.data;
            //console.log(LtpData);
            if (LtpData && LtpData.ltp) {
                let per = (LtpData.ltp - LtpData.close) * 100 / LtpData.close;
                if (document.getElementById('niftySpid')) {
                   document.getElementById('niftySpid').innerHTML = "<span style='color:red'> Nifty " + LtpData.ltp.toFixed(2) + ' (' + (per).toFixed(2) + '%)</span>';
                }
            }

            let trackSLPrice = localStorage.getItem('trackSLPrice') ? JSON.parse(localStorage.getItem('trackSLPrice')) : [];

            if (trackSLPrice.length > 0) {
                for (let index = 0; index < trackSLPrice.length; index++) {
                    const element = trackSLPrice[index];
                    console.log("this.state.trackSLPrice", element)

                    if (element.name == 'NIFTY' && element.optiontype == 'CE' && ((LtpData.ltp < element.priceStopLoss) || (LtpData.ltp >= element.priceTarget))) {
                        //delete sloption &  trigeer squireoff  
                        console.log("deleteOptionPriceSL call sl ", element, index)

                        this.deleteOptionPriceSL(element, index);
                    }
                    if (element.name == 'NIFTY' && element.optiontype == 'PE' && ((LtpData.ltp > element.priceStopLoss) || (LtpData.ltp <= element.priceTarget))) {
                        //delete sloption &  trigeer sl  
                        console.log("deleteOptionPriceSL put sl ", element, index)

                        this.deleteOptionPriceSL(element);
                    }
                }
            }


        })
    }


    getBankNiftyLTP = () => {
        var data = {
            "exchange": "NSE",
            "tradingsymbol": "BANKNIFTY",
            "symboltoken": "26009",
        }
        AdminService.getLTP(data).then(res => {
            let data = resolveResponse(res, 'noPop');
            var LtpData = data && data.data;
            //console.log(LtpData);
            if (LtpData && LtpData.ltp) {
                let per = (LtpData.ltp - LtpData.close) * 100 / LtpData.close;
                if (document.getElementById('bankniftySpid')) {
                    if (per > 0)
                        document.getElementById('bankniftySpid').innerHTML = "<span style='color:green'> Banknifty " + LtpData.ltp.toFixed(2) + ' (' + (per).toFixed(2) + '%)</span>';
                    else
                        document.getElementById('bankniftySpid').innerHTML = "<span style='color:red'> Banknifty " + LtpData.ltp.toFixed(2) + ' (' + (per).toFixed(2) + '%)</span>';
                }
            }
            let trackSLPrice = localStorage.getItem('trackSLPrice') ? JSON.parse(localStorage.getItem('trackSLPrice')) : [];
            if (trackSLPrice.length > 0) {
                for (let index = 0; index < trackSLPrice.length; index++) {
                    const element = trackSLPrice[index];
                    if (element.name == 'BANKNIFTY' && element.optiontype == 'CE' && ((LtpData.ltp < element.priceStopLoss) || (LtpData.ltp >= element.priceTarget))) {
                        //delete sloption &  trigeer sl    
                        this.deleteOptionPriceSL(element, index);
                    }
                    if (element.name == 'BANKNIFTY' && element.optiontype == 'PE' && ((LtpData.ltp > element.priceStopLoss) || (LtpData.ltp <= element.priceTarget))) {
                        //delete sloption &  trigeer sl    
                        this.deleteOptionPriceSL(element, index);
                    }
                }
            }
        })
    }

    getBankNiftyLiveLtp = (LtpData) => {
    
        // symbolListArray[index].tvalue = foundLive[0].tvalue;
        // symbolListArray[index].cng = foundLive[0].cng;
        // symbolListArray[index].iv = foundLive[0].iv;
        // symbolListArray[index].tk = foundLive[0].tk;
        // symbolListArray[index].nc = foundLive[0].nc;   

        if (LtpData && LtpData.iv) {
            let per = LtpData.nc;

            this.setState({ liveBankniftyLtdData: LtpData });
            if (document.getElementById('bankniftySpid')) {
                if (per > 0)
                    document.getElementById('bankniftySpid').innerHTML = "<span style='color:green'> Banknifty " + LtpData.iv+ ' (' + (per) + '%)</span> '+ '<span>  '+ LtpData.cng+ '</span> ' + moment(LtpData.tvalue).format('h:mm:ss A');
                else
                    document.getElementById('bankniftySpid').innerHTML = "<span style='color:red'> Banknifty " + LtpData.iv+ ' (' + (per) + '%)</span> ' + '<span> '+ LtpData.cng+ ' </span> ' + moment(LtpData.tvalue).format('h:mm:ss A');
            }
        }

        if (this.state.activeStockOptions.length > 0) {
            for (let index = 0; index < this.state.activeStockOptions.length; index++) {
                const element = this.state.activeStockOptions[index];
                if (element.name == 'BANKNIFTY' && element.optiontype == 'CE' && element.netqty > 0 && ((LtpData.iv < element.optionStockStoploss) || (LtpData.iv >= element.optionStockTarget))) {
                    //delete sloption &  trigeer sl    
                    this.deleteIndexOption(element, index);
                }
                if (element.name == 'BANKNIFTY' && element.optiontype == 'PE' && element.netqty > 0 && ((LtpData.iv > element.optionStockStoploss) || (LtpData.iv <= element.optionStockTarget))) {
                    //delete sloption &  trigeer sl    
                    this.deleteIndexOption(element, index);
                }
            }
        }
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
                this.setState({ orderid: data.data && data.data.orderid });
                if (orderOption.stopLossPrice) {
                    this.placeSLMOrder(orderOption);
                }
            }
        })
    }


    cancelOrderOfSame = (row) => {

        var orderData = this.getOpenPeningOrderId(row.symboltoken);
        var data = {
            "variety": orderData.variety,
            "orderid": orderData.orderId,
        }
        AdminService.cancelOrder(data).then(res => {
            let data = resolveResponse(res);
            if (data.status && data.message === 'SUCCESS') {
                console.log("cancel order", data);
                //this.deleteOptionPriceSL(row);
                // this.setState({ orderid : data.data && data.data.orderid });
            }
        })

    }

    squareOff = (row, marketOrder) => {
      //  this.cancelOrderOfSame(row);

        let price = 0;
        var data = {
            "variety": "NORMAL",
            "tradingsymbol": row.tradingsymbol,
            "symboltoken": row.symboltoken,
            "transactiontype": row.netqty > 0 ? 'SELL' : "BUY",
            "exchange": row.exchange,
            "ordertype": marketOrder ? "MARKET" : "LIMIT",
            "producttype": row.producttype, //"DELIVERY",//"DELIVERY",
            "duration": "DAY",
            "price": price,
            "squareoff": "0",
            "stoploss": "0",
            "quantity": Math.abs(row.netqty),
        }

        if (marketOrder) {
            data.price = 0;
        }

        if (row.instrumenttype == "OPTSTK" && (row.optiontype == "PE" || row.optiontype == "CE")) {
            data.price = CommonOrderMethod.getMinPriceAllowTick(row.ltp - (row.ltp * 0.5 / 100));
            data.triggerprice = CommonOrderMethod.getMinPriceAllowTick(row.ltp - (row.ltp * 0.1 / 100));
        }

        AdminService.placeOrder(data).then(res => {
            let data = resolveResponse(res);
            //  console.log("squireoff", data);
            if (data.status && data.message === 'SUCCESS') {
                this.setState({ orderid: data.data && data.data.orderid });
                document.getElementById('orderRefresh') && document.getElementById('orderRefresh').click();
            }
        })

    }
    updateOrderList = () => {
        AdminService.retrieveOrderBook()
            .then((res) => {
                let data = resolveResponse(res);
                if (data && data.data) {
                    var orderlist = data.data;
                    orderlist.sort(function (a, b) {
                        return new Date(b.updatetime) - new Date(a.updatetime);
                    });
                    localStorage.setItem('oderbookData', JSON.stringify(orderlist));
                }
            });
    }

    addSLOrderInfo = (row) => {
        this.setState({ addSLInfo: row, enableSLMOrderUi: true });
    }
    placeSLMOrderManually = () => {
        // this.placeSLMOrder(this.state.addSLInfo); 
        this.state.addSLInfo.netqty = Math.abs(this.state.addSLInfo.netqty);
        console.log("addSLInfo", this.state.addSLInfo)
        CommonMethods.placeOptionSLMOrder(this.state.addSLInfo)
    }
    placeSLMOrder = (slmOption) => {

        var data = {
            "triggerprice": slmOption.stopLossPrice,
            "tradingsymbol": slmOption.tradingsymbol,
            "symboltoken": slmOption.symboltoken,
            "quantity": slmOption.quantity,
            "transactiontype": slmOption.transactiontype === "BUY" ? "SELL" : "BUY",
            "exchange": slmOption.exchange ? slmOption.exchange : 'NSE',
            "producttype": slmOption.producttype ? slmOption.producttype : "INTRADAY",//"DELIVERY",
            "duration": "DAY",
            "price": slmOption.price ? slmOption.price : 0,
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
                this.updateOrderList();
                var msg = new SpeechSynthesisUtterance();
                msg.text = (slmOption.tradingsymbol + " " + slmOption.transactiontype).toLocaleLowerCase();
                window.speechSynthesis.speak(msg);

                document.getElementById('orderRefresh') && document.getElementById('orderRefresh').click();
            }
        })
    }

    getOpenPeningOrderId = (symboltoken) => {

        var oderbookData = localStorage.getItem('oderbookData') && JSON.parse(localStorage.getItem('oderbookData'));
        var data = {};
        for (let index = 0; index < oderbookData.length; index++) {
            if (oderbookData[index].symboltoken === symboltoken && oderbookData[index].variety === "STOPLOSS") {
                data.orderId = oderbookData[index].orderid
                data.variety = oderbookData[index].variety
                break;
            }
        }
        return data;
    }

    modifyOrderMethod = (row, minTriggerPrice, minSLPrice) => {
        var orderData = this.getOpenPeningOrderId(row.symboltoken);

        if (!orderData.orderId) {
            row.stopLossPrice = minTriggerPrice;
            row.price = minSLPrice;
            row.quantity = Math.abs(row.netqty);
            if (row.optiontype == "CE" || row.optiontype == "PE") {
                row.transactiontype = "BUY";
            } else {
                row.transactiontype = row.netqty > 0 ? "BUY" : "SELL";
            }
            this.placeSLMOrder(row);
        }

        var data = {
            "variety": orderData.variety,
            "orderid": orderData.orderId,
            "ordertype": "STOPLOSS_MARKET",   // "STOPLOSS_LIMIT",
            "producttype": row.producttype, //"DELIVERY",
            "duration": "DAY",
            "price": minSLPrice ? parseFloat(minSLPrice) : 0,
            "triggerprice": parseFloat(minTriggerPrice),
            "quantity": Math.abs(row.netqty),
            "tradingsymbol": row.tradingsymbol,
            "symboltoken": row.symboltoken,
            "exchange": row.exchange
        }
        AdminService.modifyOrder(data).then(res => {
            let data = resolveResponse(res, "noPop");

            var msg = new SpeechSynthesisUtterance();


            if (data.status && data.message === 'SUCCESS') {
                //  this.setState({ ['lastTriggerprice_' + row.tradingsymbol]:  parseFloat(minPrice)})
                msg.text = row.symbolname + ' trailed '.toLocaleLowerCase(); //+ data.message;
                window.speechSynthesis.speak(msg);
                localStorage.setItem('firstTimeModify' + row.tradingsymbol, 'No');
                localStorage.setItem('lastTriggerprice_' + row.tradingsymbol, parseFloat(minTriggerPrice));
                document.getElementById('orderRefresh') && document.getElementById('orderRefresh').click();

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

    get2DecimalNumber = (number) => {
        number = parseFloat(number);
        if (number) {
            return number.toFixed(2);
        } else {
            return number;
        }
    }

    getSLAndTriggerPrice = (price) => {
        let minTriggerPrice = this.getMinPriceAllowTick(price);

        var minSLPrice = minTriggerPrice - (minTriggerPrice * 1 / 100);
        minSLPrice = this.getMinPriceAllowTick(minSLPrice);

        let slPriceData = {
            minTriggerPrice: minTriggerPrice,
            minSLPrice: minSLPrice
        }
        return slPriceData;
    }
    getOptionPercentage = (row) => {

        var percentChange = 0, trailPerChange = 0;

        row.buyavgprice = parseFloat(row.buyavgprice);
        percentChange = ((row.ltp - row.buyavgprice) * 100 / row.buyavgprice);
       
        if(localStorage.getItem('isTrailing') == 'true'){
            if (!localStorage.getItem('firstTimeModify' + row.tradingsymbol) && percentChange >= this.state.firstTimeMoveOption) {

                var minTriggerPrice = row.buyavgprice + (row.buyavgprice * this.state.firstTimeSLMoveOption / 100);
                let slPriceData = this.getSLAndTriggerPrice(minTriggerPrice);
    
                if (localStorage.getItem('lastTriggerprice_' + row.tradingsymbol) != slPriceData.minTriggerPrice) {
                    this.modifyOrderMethod(row, slPriceData.minTriggerPrice, slPriceData.minSLPrice);
                }
    
            } else {
                var lastTriggerprice = parseFloat(localStorage.getItem('lastTriggerprice_' + row.tradingsymbol));
                var perchngfromTriggerPrice = ((row.ltp - lastTriggerprice) * 100 / lastTriggerprice);
                trailPerChange = perchngfromTriggerPrice;
                if (perchngfromTriggerPrice >= this.state.nextTimeMoveOption) {
                    minTriggerPrice = lastTriggerprice + (lastTriggerprice * this.state.nextTimeSLMoveOption / 100);
                    let slPriceData = this.getSLAndTriggerPrice(minTriggerPrice);
    
                    if (localStorage.getItem('lastTriggerprice_' + row.tradingsymbol) != slPriceData.minTriggerPrice) {
                        this.modifyOrderMethod(row, slPriceData.minTriggerPrice, slPriceData.minSLPrice);
                    }
                }
            }

        }
       
        if (!trailPerChange) {
            return percentChange.toFixed(2) + "%";
        } else {
            return percentChange.toFixed(2) + "% | Trailing " + trailPerChange.toFixed(2) + "%";
        }

    }

    getPercentage = (row) => {

        var percentChange = 0, trailPerChange = 0;
        if (row.netqty > 0) {
            row.buyavgprice = parseFloat(row.buyavgprice);
            percentChange = ((row.ltp - row.buyavgprice) * 100 / row.buyavgprice);
            if (!localStorage.getItem('firstTimeModify' + row.tradingsymbol) && percentChange >= this.state.firstTimeMove) {
                var minPrice = row.buyavgprice + (row.buyavgprice * this.state.firstTimeSLMove / 100);
                minPrice = this.getMinPriceAllowTick(minPrice);
                if (localStorage.getItem('lastTriggerprice_' + row.tradingsymbol) != minPrice) {
                    this.modifyOrderMethod(row, minPrice);
                }
            } else {
                var lastTriggerprice = parseFloat(localStorage.getItem('lastTriggerprice_' + row.tradingsymbol));
                var perchngfromTriggerPrice = ((row.ltp - lastTriggerprice) * 100 / lastTriggerprice);
                trailPerChange = perchngfromTriggerPrice;
                if (perchngfromTriggerPrice >= this.state.nextTimeMove) {
                    minPrice = lastTriggerprice + (lastTriggerprice * this.state.nextTimeSLMove / 100);
                    minPrice = this.getMinPriceAllowTick(minPrice);
                    if (localStorage.getItem('lastTriggerprice_' + row.tradingsymbol) != minPrice) {
                        this.modifyOrderMethod(row, minPrice);
                    }
                }
            }
        }

        if (row.netqty < 0) {

            row.sellavgprice = parseFloat(row.sellavgprice);
            percentChange = ((row.ltp - row.sellavgprice) * 100 / row.sellavgprice);
            if (!localStorage.getItem('firstTimeModify' + row.tradingsymbol) && percentChange <= -Math.abs(this.state.firstTimeMove)) {
                var minPrice = row.sellavgprice - (row.sellavgprice * this.state.firstTimeSLMove / 100);
                minPrice = this.getMinPriceAllowTick(minPrice);
                // if(localStorage.getItem('lastTriggerprice_' + row.tradingsymbol) != minPrice){
                //     this.modifyOrderMethod(row, minPrice);
                // }
                this.modifyOrderMethod(row, minPrice);
            } else {
                var lastTriggerprice = parseFloat(localStorage.getItem('lastTriggerprice_' + row.tradingsymbol));
                var perchngfromTriggerPrice = ((row.ltp - lastTriggerprice) * 100 / lastTriggerprice);
                trailPerChange = perchngfromTriggerPrice;
                console.log("perchngfromTriggerPrice", row.tradingsymbol, perchngfromTriggerPrice);
                if (perchngfromTriggerPrice <= -Math.abs(this.state.nextTimeMove)) {
                    minPrice = lastTriggerprice - (lastTriggerprice * this.state.nextTimeSLMove / 100);
                    minPrice = this.getMinPriceAllowTick(minPrice);
                    // if(localStorage.getItem('lastTriggerprice_' + row.tradingsymbol) != minPrice){
                    //     this.modifyOrderMethod(row, minPrice);
                    // }
                    this.modifyOrderMethod(row, minPrice);
                }
            }
        }

        if (!trailPerChange) {
            return percentChange.toFixed(2) + "%";
        } else {
            return percentChange.toFixed(2) + "% | Trailing " + trailPerChange.toFixed(2) + "%";
        }
    }


    render() {

        //var foundPatternList = localStorage.getItem('foundPatternList') && JSON.parse(localStorage.getItem('foundPatternList')).reverse(); 

        return (
            <React.Fragment>
                <PostLoginNavBar />
                <br />
                <OrderStatusLive getBankNiftyLiveLtp={this.getBankNiftyLiveLtp} />
                <ChartDialog /> <ChartMultiple />
                <Grid style={{ padding: '5px' }} justify="space-between" direction="row" container>
                    <Grid item >

                        <Typography color="primary" gutterBottom>
                              <span id="bankniftySpid" >Banknifty </span>
                                {/* Positions ({this.state.positionList && this.state.positionList.length})   
                               <span id="niftySpid"  > Nifty </span>  &nbsp;&nbsp; */}
                        </Typography>


                    </Grid>

                    <Grid item >
                        <Typography component="h3"  >

                            <b style={{ color: "red" }}>Expn: {this.state.totalExpence} </b>

                        </Typography>
                    </Grid>

                    <Grid item  >
                        <Typography component="h3"   >
                            <b>  P/L: </b> <b style={{ color: this.state.todayProfitPnL > 0 ? "green" : "red" }}>{this.state.todayProfitPnL} </b>
                        </Typography>
                    </Grid>

                    <Grid item>
                        <Typography component="h3"  {...window.document.title = "PnL:" + (this.state.todayProfitPnL - this.state.totalExpence).toFixed(2)}>
                            <b> Net P/L: </b> <b style={{ color: (this.state.todayProfitPnL - this.state.totalExpence) > 0 ? "green" : "red" }}>{this.state.totalExpence ? (this.state.todayProfitPnL - this.state.totalExpence).toFixed(2) : ""} </b>
                        </Typography>
                    </Grid>



                    <Grid item  >
                        <Button type="number" variant="contained" style={{ float: "right" }} onClick={() => this.getPositionData()}>Refresh</Button>
                    </Grid>
                    <Grid item  >
                        <Button type="number" variant="contained" style={{ float: "right" }} onClick={() => this.getHighLowPercentage()}><RefreshIcon /> H/L</Button>

                    </Grid>
                </Grid>

                <Grid style={{ padding: '5px' }} spacing={1} direction="row" alignItems="center" container>


                    <Grid item xs={12} sm={12}>
                        <Paper style={{ overflow: "auto", padding: '5px' }} >

                            <Table size="small" aria-label="sticky table" >
                                <TableHead style={{ whiteSpace: "nowrap", backgroundColor: "" }} variant="head">
                                    <TableRow key="1" variant="head" style={{ fontWeight: 'bold' }}>

                                        <TableCell className="TableHeadFormat" align="left">Trading Symbol</TableCell>

                                        {/* <TableCell className="TableHeadFormat" align="left">Instrument</TableCell> */}
                                        <TableCell style={{ paddingLeft: "3px" }} className="TableHeadFormat" align="left">&nbsp;Spot Name
                                            {/* <Button type="number" onClick={() => this.checkOpenEqualToLow()}>O=H/L</Button>
                                            <input style={{ width: "50px" }} type='number' step={10000} placeholder='25000' name="checkAmount" onChange={this.onTrailChange} onBlur={() => this.refreshBasedAmount()} />
                                            <input style={{ width: "30px" }} type='number' step={0.1} placeholder='0.5' name="checkAmountPer" onChange={this.onTrailChange} onBlur={() => this.refreshBasedAmount()} /> */}

                                        </TableCell>

                                        <TableCell className="TableHeadFormat" align="left">Spot Stoploss</TableCell>
                                        <TableCell className="TableHeadFormat" align="left">Spot Target</TableCell>



                                        {/* <TableCell className="TableHeadFormat" align="left">Trading Token</TableCell> */}
                                        {/* <TableCell className="TableHeadFormat" align="left">Product type</TableCell> */}
                                        {/* <TableCell className="TableHeadFormat" align="left">Type</TableCell> */}

                                        <TableCell className="TableHeadFormat" align="left">BuyAvg</TableCell>
                                        {/* <TableCell  className="TableHeadFormat" align="left">Total buy value</TableCell> */}

                                        <TableCell className="TableHeadFormat" align="left">SellAvg</TableCell>
                                        {/* <TableCell  className="TableHeadFormat" align="left">Total Sell value</TableCell> */}
                                        <TableCell className="TableHeadFormat" align="left">QT</TableCell>

                                        <TableCell className="TableHeadFormat" align="left">NetQty</TableCell>
                                        <TableCell className="TableHeadFormat" align="left">Exp</TableCell>

                                        <TableCell className="TableHeadFormat" align="left">SL</TableCell>
                                        <TableCell className="TableHeadFormat" align="left">MD</TableCell>


                                        <TableCell className="TableHeadFormat" align="left">P/L </TableCell>
                                        <TableCell className="TableHeadFormat" align="left">Chng % </TableCell>
                                        <TableCell className="TableHeadFormat" align="left">LTP</TableCell>

                                        <TableCell className="TableHeadFormat" align="left">Action</TableCell>
                                        {/* <TableCell className="TableHeadFormat" align="left">SP.SL</TableCell>
                                        <TableCell className="TableHeadFormat" align="left">SP.Target</TableCell> */}

                                        {this.state.checkAmount ?
                                            <>
                                                <TableCell className="TableHeadFormat" align="left">Qty Cpl</TableCell>
                                                <TableCell className="TableHeadFormat" align="left">CExp</TableCell>
                                                <TableCell className="TableHeadFormat" align="left">CNet</TableCell>
                                            </> : ""}

                                        {this.state.showHighLowWisePer ?
                                            <>
                                                <TableCell className="TableHeadFormat" align="left">High</TableCell>
                                                <TableCell className="TableHeadFormat" align="left">Low</TableCell>
                                            </> : ""}

                                    </TableRow>
                                </TableHead>
                                <TableBody style={{ width: "", whiteSpace: "nowrap" }}>
                                    {this.state.positionList ? this.state.positionList.map(row => (
                                        row.producttype !== 'DELIVERY1' ? <TableRow hover key={row.symboltoken} style={{ background: row.netqty !== '0' ? 'lightgray' : "" }} >


                                            {/* <TableCell align="left">
                                                <p style={{ color: row.optionStockChange > 0 ? "green" : "red" }} size="small" variant="contained" title="Candle refresh" onClick={() => this.refreshCandleChartManually(row)} >
                                                &nbsp;  {row.optionStockName ? `${row.optionStockName} ${row.optionStockLtp} (${row.optionStockChange} '%')`: '-'}
                                                </p>
                                            </TableCell>

                                            <TableCell align="left">
                                                {row.optionStockName ? <input step="0.5" style={{ width: '40%', textAlign: 'center' }} type='number' value={row.optionStockStoploss} name={row.optionStockName} onChange={this.optionStockStoplossChange} /> : "-"}
                                            </TableCell>
                                            <TableCell align="left">
                                                {row.optionStockName ? <input step="0.5" style={{ width: '40%', textAlign: 'center' }} type='number' value={row.optionStockTarget} name={row.optionStockName} onChange={this.optionStockTargetChange} /> : "-"}
                                            </TableCell> */}

                                            <TableCell align="left">
                                                <Button style={{ color: (row.ltp - row.close) * 100 / row.close > 0 ? "green" : "red" }} size="small" variant="contained" title="Candle refresh" onClick={() => this.refreshCandleChartManually(row)} >
                                                    {row.tradingsymbol} {row.ltp} ({((row.ltp - row.close) * 100 / row.close).toFixed(2)}%) <ShowChartIcon />
                                                </Button>
                                            </TableCell>

                                            <TableCell align="left">
                                                <p style={{ color: row.optionStockChange > 0 ? "green" : "red" }} size="small" variant="contained" title="Candle refresh" onClick={() => this.refreshCandleChartManually(row)} >
                                                    &nbsp;  {row.netqty && row.optionStockName ? `${row.optionStockName}` : '-'} 
                                                    {/* ${row.optionStockLtp} (${row.optionStockChange}%) */}
                                                </p>
                                            </TableCell>

                                            <TableCell align="left">
                                                {row.netqty  && row.optionStockName?  <input step="0.5" style={{ width: '40%', textAlign: 'center' }} type='number' value={row.optionStockStoploss} name={row.optionStockName} onChange={this.optionStockStoplossChange} /> : "-"}
                                            </TableCell>
                                            <TableCell align="left">
                                                {row.netqty  && row.optionStockName ? <input step="0.5" style={{ width: '40%', textAlign: 'center' }} type='number' value={row.optionStockTarget} name={row.optionStockName} onChange={this.optionStockTargetChange} /> : "-"}
                                            </TableCell>


                                           




                                            {/* <TableCell align="left">{row.producttype}</TableCell> */}

                                            {/* <TableCell align="left">{row.symboltoken}</TableCell> */}
                                            {/* <TableCell align="left">{row.producttype}</TableCell> */}

                                            <TableCell align="left"><Button onClick={() => this.addSLOrderInfo(row)}> {row.totalbuyavgprice} </Button>  </TableCell>
                                            {/* <TableCell align="left">{row.totalbuyvalue}</TableCell> */}

                                            <TableCell align="left">{row.totalsellavgprice}</TableCell>
                                            <TableCell align="left">{row.buyqty || row.sellqty}</TableCell>
                                            <TableCell align="left">{row.netqty}</TableCell>
                                            <TableCell style={{ cursor: 'help' }} title={row.expenceInfo} align="left">{row.tradeExpence}</TableCell>

                                            {/* <TableCell align="left">{row.totalsellvalue}</TableCell> */}
                                            <TableCell align="left"> {row.stopLoss}</TableCell>
                                            <TableCell align="left"> {row.stopLossAmount}</TableCell>


                                            {/* {(localStorage.getItem('lastTriggerprice_'+row.tradingsymbol))} */}
                                            <TableCell align="left" style={{ color: parseFloat(row.pnl) > 0 ? 'green' : 'red' }}><b>{row.pnl}</b></TableCell>
                                            <TableCell align="left">
                                                {row.netqty !== '0' && row.optiontype == '' ? this.getPercentage(row) : ""}
                                                {(row.optiontype == 'CE' || row.optiontype == 'PE') && row.netqty > 0 ? this.getOptionPercentage(row) : ""}
                                                {row.percentPnL ? row.percentPnL + "%" : ""}
                                                {/* new Date().toLocaleTimeString() > "15:15:00" ? */}
                                            </TableCell>
                                            <TableCell align="left">{row.ltp}</TableCell>
                                            <TableCell align="left">
                                                {row.netqty !== "0" ? <Button size={'small'} type="number" variant="contained" color="Secondary" onClick={() => this.squareOff(row)}>Square Off</Button> : ""}
                                            </TableCell>

                                            {this.state.checkAmount ? <>
                                                <TableCell align="left"><i title={"Buy value:" + row.totalbuyvalue + " | Sell value:" + row.totalsellvalue}>  {row.checkQty}</i> &nbsp; {row.checkAmount} </TableCell>
                                                {/* <TableCell   align="left"></TableCell> */}
                                                <TableCell align="left" title={row.checkExpence && row.checkExpence.expenceInfo}>  {row.checkExpence && row.checkExpence.tradeExpence && row.checkExpence.tradeExpence.toFixed(2)}</TableCell>
                                                <TableCell align="left">{row.checkNet && row.checkNet.toFixed(2)}</TableCell>
                                            </> : ""}


                                            {this.state.showHighLowWisePer ? <>
                                                <TableCell align="left">{row.high}</TableCell>
                                                <TableCell align="left">{row.low}</TableCell>
                                            </> : ""}
                                        </TableRow> : ""

                                    )) : ''}

                                    <TableRow variant="head" style={{ fontWeight: 'bold', backgroundColor: "" }}>

                                        {/* <TableCell className="TableHeadFormat" align="left">Instrument</TableCell> */}
                                        {/* <TableCell className="TableHeadFormat" align="left"></TableCell> */}
                                        {/* <TableCell className="TableHeadFormat" align="left"></TableCell> */}

                                        <TableCell className="TableHeadFormat" colSpan={7} align="left"></TableCell>

                                        {/* <TableCell className="TableHeadFormat" align="left">{this.state.allbuyavgprice}</TableCell> */}
                                        {/* <TableCell  className="TableHeadFormat" align="left">{this.state.totalbuyvalue}</TableCell> */}
                                        {/* <TableCell className="TableHeadFormat" align="left">{this.state.allsellavgprice}</TableCell>

                                        <TableCell className="TableHeadFormat" align="left">{this.state.totalQtyTraded}</TableCell> */}
                                        <TableCell className="TableHeadFormat" align="left"></TableCell>
                                        <TableCell className="TableHeadFormat" align="left"></TableCell>

                                        {/* <TableCell  className="TableHeadFormat" align="left">{this.state.totalsellvalue}</TableCell> */}

                                        <TableCell className="TableHeadFormat" align="left"></TableCell>
                                        <TableCell className="TableHeadFormat" align="left">{this.state.totalMaxPnL}</TableCell>

                                        <TableCell className="TableHeadFormat" align="left" style={{ color: parseFloat(this.state.todayProfitPnL) > 0 ? 'green' : 'red' }}>{this.state.todayProfitPnL} </TableCell>

                                        <TableCell className="TableHeadFormat" align="left">

                                            {/* new Date().toLocaleTimeString() > "15:15:00" ?  */}
                                            {this.state.totalPercentage && this.state.totalPercentage.toFixed(2) + "%"}

                                        </TableCell>
                                        <TableCell className="TableHeadFormat" align="left"></TableCell>

                                        <TableCell className="TableHeadFormat" align="left"></TableCell>
                                        {this.state.checkAmount ? <>
                                            <TableCell className="TableHeadFormat" align="left">{this.state.totCheckAmount}</TableCell>
                                            <TableCell className="TableHeadFormat" align="left">{this.state.totCheckExp}</TableCell>
                                            <TableCell className="TableHeadFormat" align="left">{this.state.checkTotalNet}</TableCell>
                                        </>
                                            : ""}

                                        <TableCell className="TableHeadFormat" align="left"></TableCell>
                                    </TableRow>

                                    {this.state.enableSLMOrderUi ?
                                        <TableRow variant="head">
                                            <TableCell className="TableHeadFormat" colSpan={15} align="center">

                                                Stoploss
                                                &nbsp;<input placeholder='Symbol' name="tradingsymbol" onChange={this.onAddSLChange} value={this.state.addSLInfo && this.state.addSLInfo.tradingsymbol} style={{ width: '200px', textAlign: 'center' }} />
                                                &nbsp;<input placeholder='Price' name="stopLossPrice" type={'number'} step="0.1" onChange={this.onAddSLChange} value={this.state.addSLInfo && this.state.addSLInfo.stopLossPrice} style={{ width: '100px', textAlign: 'center' }} />
                                                &nbsp;<input placeholder='Trigger Price' name="stopLossTriggerPrice" step="0.1" type={'number'} onChange={this.onAddSLChange} value={this.state.addSLInfo && this.state.addSLInfo.price} style={{ width: '100px', textAlign: 'center' }} />
                                                &nbsp; <Button size={'small'} type="number" variant="contained" onClick={() => this.placeSLMOrderManually()}>Place SL</Button>

                                            </TableCell>

                                        </TableRow>

                                        : ""}
                                </TableBody>


                            </Table>

                            <hr />

                            <Grid style={{ padding: '5px', background: "lightgray" }} justify="space-between" direction="row" container>

                                <Grid>
                                    Stoploss Trail Setting:

                                    Stock &nbsp; F.Move<input name="firstTimeMove" type={'number'} step="0.1" onChange={this.onTrailChange} value={this.state.firstTimeMove} style={{ width: '30px', textAlign: 'center' }} />
                                    &nbsp;SL Move<input name="firstTimeSLMove" step="0.1" type={'number'} onChange={this.onTrailChange} value={this.state.firstTimeSLMove} style={{ width: '30px', textAlign: 'center' }} />

                                    &nbsp;Next <input name="nextTimeMove" step="0.1" type={'number'} onChange={this.onTrailChange} value={this.state.nextTimeMove} style={{ width: '30px', textAlign: 'center' }} />
                                    &nbsp;SL Move<input name="nextTimeSLMove" step="0.1" type={'number'} onChange={this.onTrailChange} value={this.state.nextTimeSLMove} style={{ width: '30px', textAlign: 'center' }} />
                                </Grid>

                                <Grid><TrailingSwitch /></Grid>

                                <Grid>
                                     
                                    Option Trail%: F.Move<input name="firstTimeMoveOption" type={'number'} step="0.1" onChange={this.onTrailChange} value={this.state.firstTimeMoveOption} style={{ width: '30px', textAlign: 'center' }} />
                                    &nbsp;SL Move<input name="firstTimeSLMoveOption" step="0.1" type={'number'} onChange={this.onTrailChange} value={this.state.firstTimeSLMoveOption} style={{ width: '30px', textAlign: 'center' }} />

                                    &nbsp;Next <input name="nextTimeMoveOption" step="0.1" type={'number'} onChange={this.onTrailChange} value={this.state.nextTimeMoveOption} style={{ width: '30px', textAlign: 'center' }} />
                                    &nbsp;SL Move<input name="nextTimeSLMoveOption" step="0.1" type={'number'} onChange={this.onTrailChange} value={this.state.nextTimeSLMoveOption} style={{ width: '30px', textAlign: 'center' }} />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={12} style={{ width: '90%', height: '100%', overflow: "auto" }}>
                       {/* <NiftybankOptionBuyAtLevel liveBankniftyLtdData={this.state.liveBankniftyLtdData} /> */}

                       <BNOptionBuyAtLevel LiveLtp={this.state.liveBankniftyLtdData} />
                    </Grid>
                    <Grid item xs={12} sm={12}>
                        <OrderBook />
                    </Grid>
                 

                </Grid>
            </React.Fragment>
        )
    }
}

export default Home;
