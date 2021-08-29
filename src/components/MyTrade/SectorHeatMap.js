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

const wsClint = new w3cwebsocket('wss://omnefeeds.angelbroking.com/NestHtml5Mobile/socket/stream');

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

    }

    componentDidMount() {



        //  this.loadPackList();
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


            wsClint.onopen = (res) => {
                this.makeConnection();
                this.updateSocketWatch();
            }

            wsClint.onmessage = (message) => {
                var decoded = window.atob(message.data);
                var data = this.decodeWebsocketData(pako.inflate(decoded));
                var liveData = JSON.parse(data);
                var sectorList = this.state.sectorList;

                this.state.sectorList && this.state.sectorList.forEach((outerEelement, index) => {

                    outerEelement.stockList.forEach((element, stockIndex) => {
                        var foundLive = liveData.filter(row => row.tk == element.token);
                        if (foundLive.length > 0 && foundLive[0].ltp && foundLive[0].nc) {
                            sectorList[index].stockList[stockIndex].ltp = foundLive[0].ltp;
                            sectorList[index].stockList[stockIndex].nc = foundLive[0].nc;
                            sectorList[index].stockList[stockIndex].cng = foundLive[0].cng;

                            console.log("foundLive", foundLive);
                        }
                    });
                    sectorList[index].stockList.sort(function (a, b) {
                        return b.nc - a.nc;
                    });

                });

                this.setState({ sectorList: sectorList });
                localStorage.setItem('sectorList', JSON.stringify(sectorList));

            }

            wsClint.onerror = (e) => {
                console.log("socket error", e);
            }

            setInterval(() => {
                this.makeConnection();
                var _req = '{"task":"hb","channel":"","token":"' + feedToken + '","user": "' + clientcode + '","acctid":"' + clientcode + '"}';
                // console.log("Request :- " + _req);
                wsClint.send(_req);
            }, 59000);

            setInterval(() => {
                this.loadPackList();
            }, 120000);


             
            var tostartInteral =  setInterval(() => {

                console.log("1st interval every second", new Date().toLocaleTimeString());
                var time = new Date(); 
                if(time.getMinutes() % 5 === 0){
                    console.log("5th min completed at", new Date().toLocaleTimeString());
                    console.log("next scan at", new Date(new Date().getTime()+70000).toLocaleTimeString());
                    
                    setTimeout(() => {
                        console.log("set timout at 70sec ", new Date());
                        this.this.refreshSectorCandle()(); 
                    }, 70000);

                    setInterval(() => {
                        this.refreshSectorCandle()(); 
                     }, 60000 * 5 + 70000 );  

                     clearInterval(tostartInteral); 
                } 
            }, 1000);



        }



    }

    placeSLMOrder = (slmOption) => {
        
        var data = {
            "triggerprice":slmOption.stopLossPrice,
            "tradingsymbol": slmOption.tradingsymbol,
            "symboltoken": slmOption.symboltoken,
            "quantity": slmOption.quantity,
            "transactiontype": slmOption.transactiontype === "BUY" ? "SELL" : "BUY", 
            "exchange": 'NSE', 
            "producttype": "INTRADAY",//"DELIVERY",
            "duration":"DAY",
            "price": 0,
            "squareoff":"0",
            "stoploss":"0",
            "ordertype":"STOPLOSS_MARKET", //STOPLOSS_MARKET STOPLOSS_LIMIT
            "variety" : "STOPLOSS"
        }
        console.log("SLM option data", data); 
        AdminService.placeOrder(data).then(res => {
            let data = resolveResponse(res);
          //  console.log(data);   
            if(data.status  && data.message === 'SUCCESS'){
                this.setState({ orderid : data.data && data.data.orderid });
               // this.updateOrderList(); 
               var msg = new SpeechSynthesisUtterance();
               msg.text = 'hey Vijay, '+ slmOption.tradingsymbol; 
               window.speechSynthesis.speak(msg);

               document.getElementById('orderRefresh') && document.getElementById('orderRefresh').click(); 
            }
        })
    }

    placeOrderMethod = (orderOption) => { 
       
        var data = {
            "transactiontype":orderOption.transactiontype,//BUY OR SELL
            "tradingsymbol": orderOption.tradingsymbol,
            "symboltoken":orderOption.symboltoken,
            "quantity":orderOption.quantity,
            "ordertype": orderOption.buyPrice  === 0 ? "MARKET" : "LIMIT", 
            "price": orderOption.buyPrice,
            "producttype": "INTRADAY",//"DELIVERY",
            "duration":"DAY",
            "squareoff":"0",
            "stoploss":"0",
            "exchange":"NSE",
            "variety":"NORMAL"
        }
        console.log("place order option", data);
        AdminService.placeOrder(data).then(res => {
            let data = resolveResponse(res);
          //  console.log(data);   
            if(data.status  && data.message === 'SUCCESS'){
                this.setState({ orderid : data.data && data.data.orderid });
                if(orderOption.stopLossPrice){
                    this.placeSLMOrder(orderOption);
                }
            }
        })
    }

    getMinPriceAllowTick = (minPrice) => {
        minPrice =  minPrice.toFixed(2); 
       // console.log("minPrice",minPrice); 
        var wholenumber = parseInt( minPrice.split('.')[0]);
      //  console.log("wholenumber",wholenumber); 
        var decimal =  parseFloat( minPrice.split('.')[1]);
       // console.log("decimal",decimal); 
        var tickedecimal =  decimal-decimal%5; 
        minPrice = parseFloat( wholenumber + '.'+tickedecimal); 
     //   console.log("minPricexxxx",minPrice); 
        return minPrice; 
    }


    historyWiseOrderPlace = (sectorItem, orderType) => {


        var token = sectorItem.token; 
        var symbol = sectorItem.symbol; 

        if(!window.confirm(orderType + " "+ symbol+ " Are you sure ? ")){
            return; 
        }


        var ltpdata  = {"exchange":"NSE","tradingsymbol": symbol,"symboltoken":token,}
        AdminService.getLTP(ltpdata).then(res => {
            let ltpres = resolveResponse(res, 'noPop');
                var LtpData = ltpres && ltpres.data; 
                console.log(symbol, " ltd data ", LtpData);
                let quantity =0; 
                if(LtpData && LtpData.ltp){
                    let perTradeExposureAmt =  TradeConfig.totalCapital * TradeConfig.perTradeExposurePer/100; 
                     quantity = Math.floor(perTradeExposureAmt/LtpData.ltp); 
                }

                
                //quantity = quantity>0 ? 1 : 0; 
                console.log(symbol, "  quantity can be order ", quantity);
                if(quantity){
                    const format1 = "YYYY-MM-DD HH:mm";
                    var beginningTime = moment('9:15am', 'h:mma').format(format1);

                    console.log("beginningTime", beginningTime); 
                    
                    var time = moment.duration("54:10:00");  //21:10:00"
                    var startdate = moment(new Date()).subtract(time);
                    var data  = {
                        "exchange": "NSE",
                        "symboltoken": token ,
                        "interval": "FIVE_MINUTE", //ONE_DAY FIVE_MINUTE 
                        "fromdate": moment(startdate).format(format1) , 
                        "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
                    }
                
                    AdminService.getHistoryData(data).then(res => {
                        let histdata = resolveResponse(res,'noPop' );
                       // console.log("candle history", histdata); 
                        if(histdata && histdata.data && histdata.data.length){
                           
                            var candleData = histdata.data, clossest =0, lowerest=0, highestHigh = 0, lowestLow=0, highestsum=0; 
                            candleData.reverse(); 
                            lowestLow = candleData[0][3]; 
                            highestHigh = candleData[0][2]; 
                            if(candleData && candleData.length>0){
                                for (let index = 0; index < 20; index++) {
                                    if(candleData[index]){
                                        clossest += candleData[index][4]; //close  
                                        lowerest += candleData[index][3];  //low
                                        highestsum += candleData[index][2];  //low
                                        if(candleData[index][2] > highestHigh){
                                            console.log( index, highestHigh,  candleData[index][2]); 
                                            highestHigh = candleData[index][2];  
                                        }
                                        if(candleData[index][3] <= lowestLow){
                                            lowestLow = candleData[index][3];  
                                        }
                                    }
                                }

                                let devideLen = candleData.length > 20 ? 20 : candleData.length; 
    
                                var bbmiddleValue = clossest/devideLen; 
                                var bblowerValue = lowerest/devideLen; 
                                var bbhigerValue = highestsum/devideLen; 
                                
                                var stoploss = 0, stoplossPer = 0; 

                                if(orderType == "BUY"){
                                    stoploss = bblowerValue - (highestHigh - lowestLow)*3/100;  
                                    stoploss = this.getMinPriceAllowTick(stoploss); 
                                    stoplossPer = (LtpData.ltp - stoploss)*100/LtpData.ltp; 

                                    console.log(symbol,orderType,  " LTP ",LtpData.ltp ); 
                                    console.log(symbol + "highestHigh:",highestHigh,  "lowestLow", lowestLow, "stoploss after tick:", stoploss , "stoploss%", stoplossPer);
                                    console.log(symbol + "  close avg middle ", bbmiddleValue,  "lowerest avg", bblowerValue, "bbhigerValue", bbhigerValue );
                                
                                }


                                if(orderType == "SELL"){
                                    stoploss = bbhigerValue + (highestHigh - lowestLow)*3/100;  
                                    stoploss = this.getMinPriceAllowTick(stoploss); 
                                    stoplossPer = (stoploss - LtpData.ltp)*100/LtpData.ltp; 

                                    console.log(symbol,orderType,  " LTP ",LtpData.ltp ); 
                                    console.log(symbol + "highestHigh:",highestHigh,  "lowestLow", lowestLow, "stoploss after tick:", stoploss , "stoploss%", stoplossPer);
                                    console.log(symbol + "  close avg middle ", bbmiddleValue,  "lowerest avg", bblowerValue, "bbhigerValue", bbhigerValue );
                                
                                }

                               
                              
                                var orderOption = {
                                    transactiontype: orderType,
                                    tradingsymbol: symbol,
                                    symboltoken:token,
                                    buyPrice : 0,
                                    quantity: quantity, 
                                    stopLossPrice: stoploss
                                }
                                if(stoplossPer <= 1.5){ 
                                   this.placeOrderMethod(orderOption);
                                }else{
                                    console.log(symbol + " its not fullfilled"); 
                                }
                            }

                           
                        }else{
                            //localStorage.setItem('NseStock_' + symbol, "");
                            console.log(symbol + " candle data emply"); 
                        }
                    })

                }
        })
       // await new Promise(r => setTimeout(r, 2000)); 
    }




    loadPackList() {

        this.setState({ indexTimeStamp: '' })
        this.setState({ refreshFlag: false });


        AdminService.getAllIndices()
            .then((res) => {
                if (res.data) {

                    var data = res.data, sectorStockList = [];

                    this.setState({ indexTimeStamp: data.timestamp })

                    var foundSectors = data.data.filter(row => row.key === "SECTORAL INDICES");
                    var softedData = foundSectors.sort(function (a, b) { return b.percentChange - a.percentChange });

                    // this.speckIt("1st sector is " + softedData[0].indexSymbol + ' ' + softedData[0].percentChange + '%');
                    // this.speckIt("2nd sector is " + softedData[1].indexSymbol + ' ' + softedData[1].percentChange + '%');
                    // this.speckIt("3rd sector is " + softedData[2].indexSymbol + ' ' + softedData[2].percentChange + '%');            
                    for (let i = 0; i < softedData.length; i++) {
                        var sectorStocks = this.state.staticData[softedData[i].index];
                        softedData[i].stockList = sectorStocks;
                        for (let index = 0; index < sectorStocks.length; index++) {
                            var foundInWatchlist = this.state.sectorStockList.filter(row => row.token == sectorStocks[index].token);
                            if (!foundInWatchlist.length) {
                                this.setState({ sectorStockList: [...this.state.sectorStockList, sectorStocks[index]] });
                                sectorStockList.push(sectorStocks[index]);
                            }
                        }
                    }



                    this.setState({ sectorList: softedData });
                    localStorage.setItem('sectorList', JSON.stringify(softedData));
                    localStorage.setItem('sectorStockList', JSON.stringify(sectorStockList));


                    console.log("softedData", softedData);
                    this.refreshSectorLtp();
                }

            })
            .catch((reject) => {
                Notify.showError("All Indices API Failed" + <br /> + reject);
                this.speckIt("All Indices API Failed");
                this.setState({ refreshFlag: true });

            })


    }


    refreshSectorLtp = async () => {

        this.setState({ refreshFlag: false, failedCount: 0 });

        var sectorStockList = this.state.sectorStockList;

        console.log("sectorStockList", this.state.sectorStockList.length);


        for (let index = 0; index < this.state.sectorStockList.length; index++) {

            var data = {
                "exchange": "NSE",
                "tradingsymbol": this.state.sectorStockList[index].symbol,
                "symboltoken": this.state.sectorStockList[index].token,
            }

            this.setState({ stockUpdate: index + 1 + ". " + this.state.sectorStockList[index].symbol });

            AdminService.getLTP(data).then(res => {
                let data = resolveResponse(res, 'noPop');
                var LtpData = data && data.data;

                //   console.log(this.state.sectorStockList[index].symbol, this.state.sectorStockList[index].token, LtpData);

                if (LtpData.ltp) {
                    var todayChange = (LtpData.ltp - LtpData.open) * 100 / LtpData.open;   //close
                    sectorStockList[index].ltp = LtpData.ltp;
                    sectorStockList[index].nc = todayChange.toFixed(2);
                    sectorStockList[index].cng = (LtpData.ltp - LtpData.open).toFixed(2);
                }

                var sectorList = this.state.sectorList;
                this.state.sectorList && this.state.sectorList.forEach((outerEelement, index) => {
                    outerEelement.stockList.forEach((element, stockIndex) => {
                        var foundLive = sectorStockList.filter(row => row.token == element.token);
                        console.log(this.state.sectorStockList[index].symbol, this.state.sectorStockList[index].token, foundLive);

                        if (foundLive.length > 0 && foundLive[0].ltp && foundLive[0].nc) {
                            sectorList[index].stockList[stockIndex].ltp = foundLive[0].ltp;
                            sectorList[index].stockList[stockIndex].nc = foundLive[0].nc;
                            sectorList[index].stockList[stockIndex].cng = foundLive[0].cng;
                        }
                    });
                    sectorList[index].stockList.sort(function (a, b) {
                        return b.nc - a.nc;
                    });
                });
                this.setState({ sectorList: sectorList });
                localStorage.setItem('sectorList', JSON.stringify(sectorList));


            }).catch(error => {
                this.setState({ failedCount: this.state.failedCount + 1 });

                Notify.showError(this.state.sectorStockList[index].symbol + " ltd data not found!");
            })

            await new Promise(r => setTimeout(r, 101));
        }

        this.setState({ refreshFlag: true });
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
                "fromdate": moment(startdate).format("YYYY-MM-DD HH:mm"), //moment("2021-07-20 09:15").format("YYYY-MM-DD HH:mm") , 
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
                            outerEelement.stockList.forEach((element, stockIndex) => {
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
        //  console.log("1st Request :- " + firstTime_req);
        wsClint.send(firstTime_req);

        this.updateSocketWatch();

    }

    showCandleChart = (candleData, symbol, price, change) => {


        //  candleData  = candleData && candleData.reverse();

        localStorage.setItem('candleChartData', JSON.stringify(candleData));
        localStorage.setItem('cadleChartSymbol', symbol);
        localStorage.setItem('candlePriceShow', price);
        localStorage.setItem('candleChangeShow', change);

        if (candleData && candleData.length > 0) {
            document.getElementById('showCandleChart').click();
        }
    }

    updateSocketWatch = () => {

        var channel = this.state.sectorList.map(element => {
            element.stockList.map(stock => {
                return 'nse_cm|' + stock.token;
            });
        });

        channel = channel.join('&');
        var updateWatch = {
            "task": "mw",
            "channel": channel,
            "token": this.state.feedToken,
            "user": this.state.clientcode,
            "acctid": this.state.clientcode
        }

        console.log("update watech", updateWatch);
        wsClint.send(JSON.stringify(updateWatch));
    }



    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    speckIt = (text) => {
        var msg = new SpeechSynthesisUtterance();
        msg.text = text.toString();
        //  window.speechSynthesis.speak(msg);
    }

    getPercentageColor = (percent) => {
        percent = percent * 100;
        var r = percent < 50 ? 255 : Math.floor(255 - (percent * 2 - 100) * 255 / 100);
        var g = percent > 50 ? 255 : Math.floor((percent * 2) * 255 / 100);
        return 'rgb(' + r + ',' + g + ',0)';
    }

    render() {
        // console.log("sectorList", this.state.sectorList)
        //   console.log("sectorStockList", this.state.sectorStockList)

        return (
            <React.Fragment>
                <PostLoginNavBar />

                <ChartDialog />



                <Grid direction="row" container className="flexGrow" spacing={1} style={{ paddingLeft: "5px", paddingRight: "5px" }}>
                    <Grid item xs={12} sm={12} >
                        <Typography component="h3" variant="h6" color="primary" >
                            Sectors Stocks({this.state.sectorStockList.length}) at {this.state.indexTimeStamp}
                            {this.state.refreshFlag ? <Button variant="contained" onClick={() => this.loadPackList()}>Live Ltp</Button> : <> <Button> <Spinner /> &nbsp; {this.state.stockUpdate}  </Button> </>}
                            {this.state.failedCount ? this.state.failedCount + "Failed" : ""}

                            &nbsp;

                            {this.state.refreshFlagCandle ? <Button variant="contained" onClick={() => this.refreshSectorCandle()}>Refresh Candle</Button> : <> <Button> <Spinner /> &nbsp; {this.state.stockCandleUpdate}  </Button> </>}

                        </Typography>

                    </Grid>



                    {this.state.sectorList ? this.state.sectorList.map((indexdata, index) => (


                        <Grid item xs={12} sm={3}>

                            <Paper style={{ padding: '10px', background: "lightgray" }}>


                                <Typography style={{ textAlign: "center" }}>
                                    <b> {index + 1}. {indexdata.index + " " + indexdata.last}({indexdata.percentChange}%) </b>
                                </Typography>


                                <Grid direction="row" container className="flexGrow" spacing={1} >


                                    {indexdata.stockList && indexdata.stockList.map((sectorItem, i) => (

                                        <Grid item xs={12} sm={6} >
                                            <Paper style={{  textAlign: "center" }} >

                                                {/* {sectorItem.cng} */}
                                                <Typography style={{ background: this.getPercentageColor(sectorItem.cng), fontSize: '14px' }}>
                                                    {i + 1}. {sectorItem.name} {sectorItem.ltp} ({sectorItem.nc}%)
                                                </Typography>



                                                <span style={{ cursor: 'pointer'}} onClick={() => this.showCandleChart(sectorItem.candleChartData, sectorItem.name, sectorItem.ltp, sectorItem.nc)} > 
                                                {sectorItem.candleChartData ? <LineChart  candleChartData={sectorItem.candleChartData} percentChange={sectorItem.nc}/> : ""} 
                                                    </span>   
                                                      

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

                                                <Typography style={{ background: 'gray'}}>
                                                    <Button size="small" variant="contained" color="primary" style={{ marginLeft: '20px' }} onClick={() => this.historyWiseOrderPlace(sectorItem , 'BUY')}>Buy</Button>
                                                    <Button size="small" variant="contained" color="secondary" style={{ marginLeft: '20px' }} onClick={() => this.historyWiseOrderPlace(sectorItem, 'SELL')}>Sell</Button>

                                                </Typography>

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
