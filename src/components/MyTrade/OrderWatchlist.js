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
import Autocomplete from '@material-ui/lab/Autocomplete';
import DeleteIcon from '@material-ui/icons/Delete';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import CommonOrderMethod from "../../utils/CommonMethods";
import * as moment from 'moment';
import Notify from "../../utils/Notify";
import ShowChartIcon from '@material-ui/icons/ShowChart';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import BankNiftyView from './BankNiftyView'
import OptionBuyWithSPLevel from './OptionBuyWithSPLevel'
import ChartDialog from './ChartDialog'


class OrderBook extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            orderPenidngList: localStorage.getItem('orderPenidngList') && JSON.parse(localStorage.getItem('orderPenidngList')) || [],
            buyAtPending: "",
            sellAtPending: "",
            pattenNamePending: "",
            searchSymbolPending: "",
            autoSearchList: [],
            lastTradedData: {},
            CEoptionsLtpList: [], 
            PEoptionsLtpList: [], 
            selectedOptionLotsize: '',
            trackSLPrice: localStorage.getItem('trackSLPrice') && JSON.parse(localStorage.getItem('trackSLPrice')) || [],

        }
    }

    searchSymbolPendingOrder = (e) => {
        this.setState({ [e.target.name]: e.target.value })

        AdminService.autoCompleteSearch(e.target.value).then(searchRes => {
            let searchResdata = searchRes.data;
            if (e.target.value) {
                var uppercaseName = e.target.value.toUpperCase() + "-EQ";
                var found = searchResdata.filter(row => row.exch_seg === "NSE" && row.lotsize === "1" && row.symbol === uppercaseName);
                //  console.log("found", found[0] && found[0].symbol); 
                if (found.length) {
                    this.setState({ searchSymbolPending: found[0].symbol, searchTokenPending: found[0].token, exch_seg: found[0].exch_seg })
                }
            }
        })
    }

    updateInput = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    addInOrderPenidngList = async () => {

        console.log(this.state.searchSymbolPending, this.state.searchTokenPending, this.state.buyAtPending, this.state.sellAtPending, "CEStrikePrice", this.state.CEStrikePrice);

        if (parseFloat(this.state.sellAtPending) > this.state.lastTradedData.low) {
            if (!window.confirm("Be carefull Selling at high price " + this.state.sellAtPending + ", today " + this.state.searchSymbolPending + " low is " + this.state.lastTradedData.low)) {
                return;
            }
        }
        if (parseFloat(this.state.buyAtPending) < this.state.lastTradedData.high) {
            if (!window.confirm("Be carefull Buying at low price " + this.state.buyAtPending + ", today " + this.state.searchSymbolPending + " high is " + this.state.lastTradedData.high)) {
                return;
            }
        }

        if (this.state.searchSymbolPending && this.state.buyAtPending || this.state.sellAtPending) {

            var data = {
                createdAt: new Date().toLocaleTimeString(),
                token: this.state.searchTokenPending,
                symbol: this.state.searchSymbolPending,
                buyAt: this.state.buyAtPending,
                sellAt: this.state.sellAtPending,
                pattenName: this.state.pattenNamePending,
                exch_seg: this.state.exch_seg,
                buyCallOption: this.state.CEStrikePrice, 
                buyPutOption: this.state.PEStrikePrice
            }

            this.setState({ orderPenidngList: [...this.state.orderPenidngList, data],  CEStrikePrice : '', PEStrikePrice:'' }, function () {
                this.setState({ searchSymbolPending: '', searchTokenPending: '', buyAtPending: "", sellAtPending: "", pattenNamePending: "" })
                localStorage.setItem('orderPenidngList', JSON.stringify(this.state.orderPenidngList));
                localStorage.setItem('orderTagToPosition', JSON.stringify(this.state.orderPenidngList));
            })

        }


    }

    deleteInOrderPenidngList = (row) => {

        console.log("callback", row);
        var isDeleted = false, delitem = '';
        var orderPenidngList = localStorage.getItem('orderPenidngList') && JSON.parse(localStorage.getItem('orderPenidngList'));
        for (let index = 0; index < this.state.orderPenidngList.length; index++) {
            const element = orderPenidngList[index];
            if (row.token == element.token) {
                var delitem = orderPenidngList.splice(index, 1);
                localStorage.setItem('orderPenidngList', JSON.stringify(orderPenidngList));
                this.setState({ orderPenidngList: orderPenidngList });
                break;
            }
        }

        if (delitem[0].token == row.token) {
            return true;
        } else {
            return false;
        }

    }

    callBackUpdate = (row) => {
        console.log("call back called");
        // this.deleteInOrderPenidngList(row); 
    }
    

    updateLTP = async () => {

        for (let index = 0; index < this.state.orderPenidngList.length; index++) {
            const element = this.state.orderPenidngList[index];
            var data = { "exchange": element.exch_seg, "tradingsymbol": element.symbol, "symboltoken": element.token };
            AdminService.getLTP(data).then(res => {
                let data = resolveResponse(res, 'noPop');
                var LtpData = data && data.data;
                //console.log(LtpData);
                if (LtpData && LtpData.ltp) {
                    element.ltp = LtpData.ltp;
                    element.perChange = ((LtpData.ltp - LtpData.close) * 100 / LtpData.close).toFixed(2);
                    localStorage.setItem('orderPenidngList', JSON.stringify(this.state.orderPenidngList));
                    this.setState({ orderPenidngList: this.state.orderPenidngList });
                 //   console.log("ltp update", element.symbol, element)

                    if (element.buyAt && LtpData.ltp >= parseFloat(element.buyAt)) {
                        var isDelete = this.deleteInOrderPenidngList(element);
                        if (isDelete) { 
                            if(element.buyCallOption){
                                //place order here
                                this.buyStockOption(element.buyCallOption);  
                            }else{
                                CommonOrderMethod.historyWiseOrderPlace(element, 'BUY', "isAutomatic", this.callBackUpdate);
                            }
                        }
                    } else if (element.sellAt && LtpData.ltp <= parseFloat(element.sellAt)) {
                        var isDelete = this.deleteInOrderPenidngList(element);
                        if (isDelete) {
                            if(element.buyPutOption){
                                //place order here
                                this.buyStockOption(element.buyPutOption);  
                            }else{
                                CommonOrderMethod.historyWiseOrderPlace(element, 'SELL', "isAutomatic", this.callBackUpdate);
                            }

                        }
                    }

                }
            })

            await new Promise(r => setTimeout(r, 100));
        }
    }

    getTradePrice = () => {

        var data = { "exchange": this.state.exch_seg, "tradingsymbol": this.state.searchSymbolPending, "symboltoken": this.state.searchTokenPending };
        AdminService.getLTP(data).then(res => {
            let data = resolveResponse(res, 'noPop');
            var LtpData = data && data.data;
            //console.log(LtpData);
            if (LtpData && LtpData.ltp) {


                var lastTradedData = {
                    symbol: LtpData.tradingsymbol,
                    ltp: LtpData.ltp,
                    perChange: ((LtpData.ltp - LtpData.close) * 100 / LtpData.close).toFixed(2),
                    open: LtpData.open,
                    high: LtpData.high,
                    close: LtpData.close,
                    low: LtpData.low,
                }
                this.setState({ lastTradedData: lastTradedData });
                this.showStrikesLtp("CE");
                this.showStrikesLtp("PE");
            }
        })
    }


    componentDidMount() {

        this.updateLTP();

        var beginningTime = moment('9:15am', 'h:mma');
        var endTime = moment('3:30pm', 'h:mma');
        const friday = 5; // for friday
        var currentTime = moment(new Date(), "h:mma");
        const today = moment().isoWeekday();
        //market hours
        if (today <= friday && currentTime.isBetween(beginningTime, endTime)) {
            var intervaltime = 1000;
            if (this.state.orderPenidngList.length > 10) {
                intervaltime = this.state.orderPenidngList.length * 110;
            }
            this.setState({ findlast5minMovementInterval: setInterval(() => { this.updateLTP(); }, intervaltime) });
        }

        AdminService.getFunds().then(fundsRes => {
            // console.log('profiledata', profileRes); 
               let fundsResData = resolveResponse(fundsRes);
             //  var fundsResData =  fundsRes && fundsRes.data; 
               if(fundsResData.status & fundsResData.message === 'SUCCESS'){
                this.setState({  fundData :fundsResData.data }); 
               }
        })

    }


    refreshCandleChartManually = async (row) => {

        var beginningTime = moment('9:15am', 'h:mma');
        var time = moment.duration("12:00:00");
        var startdate = moment(new Date()).subtract(time);

        var data = {
            "exchange": "NSE",
            "symboltoken": row.token,
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

                localStorage.setItem('candleChangeShow', row.perChange);
                localStorage.setItem('candleChartData', JSON.stringify(candleChartData))
                localStorage.setItem('cadleChartSymbol', row.symbol);
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


    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value.trim() });
    }

    onChangeOption = (e) => {

        this.setState({ [e.target.name]: e.target.value });
    }

    onChange2 = (e) => {
        this.setState({ lastTradedData: {}, buyAtPending: "", sellAtPending: "", pattenNamePending: "", searchSymbolPending: "",  CEStrikePrice: '', PEStrikePrice: ''});


        this.setState({ [e.target.name]: e.target.value });
        var data = e.target.value;

        AdminService.autoCompleteSearch(data).then(res => {
            let data = res.data;
            console.log(data);
            localStorage.setItem('autoSearchTemp', JSON.stringify(data));
            this.setState({ autoSearchList: data },() => {
             
            });
        })

    }

    openNewPage = (e) => {
        window.open("/mtrade/#/order-watchlist");
        //   window.location.replace('/mtrade/#/order-watchlist'); 
        localStorage.setItem('isOpenInNewPage', 'yes');
    }

    backToPositionPage = (e) => {
        window.location.replace('/mtrade/#/position');
        localStorage.setItem('isOpenInNewPage', 'no');
    }


    onSelectItem = (event, values) => {
        var autoSearchTemp = JSON.parse(localStorage.getItem('autoSearchTemp'));
        //  console.log("values", values); 
        //   console.log("autoSearchTemp", autoSearchTemp); 
        if (autoSearchTemp.length > 0) {
            var fdata = '';
            for (let index = 0; index < autoSearchTemp.length; index++) {
                if (autoSearchTemp[index].symbol === values) {
                    fdata = autoSearchTemp[index];
                    break;
                }
            }
            this.setState({ searchSymbolPending: fdata.symbol, searchTokenPending: fdata.token, exch_seg: fdata.exch_seg }, function () {
                this.getTradePrice();
            });

        }

    }

    getChunkPrice = (price) => {
        return Math.round(price / 100) / 10;
    }

    suggestBuyPrice = (price) => {
        if (price) {

            this.setState({ buyAtPending: (price + this.getChunkPrice(price)).toFixed(2) });

        }
    }

    suggestSellPrice = (price) => {
        if (price) {
            this.setState({ sellAtPending: (price - this.getChunkPrice(price)).toFixed(2) });
        }
    }

    showStrikesLtp =(optionType)=> {
       console.log(this.state.searchSymbolPending,  this.state.lastTradedData.ltp); 
       this.setState({CEoptionsLtpList : [], PEoptionsLtpList : [], selectedOptionLotsize : ''})

           let data = {
                name : this.state.searchSymbolPending, 
                ltp : this.state.lastTradedData.ltp, 
                optionType: optionType
            }; 
       AdminService.getStockOptions(data).then(res => {
            let data = res.data;
          //  console.log(data);
            this.getOptionsLtp(data,  optionType); 
            //  localStorage.setItem('autoSearchTemp', JSON.stringify(data));
          //  this.setState({ autoSearchList: data });
        })
    }
    getOptionsLtp = async(nearOptions, optionType)=> {

        console.log("nearOptions", nearOptions, nearOptions.length)

        for (let index = 0; index < nearOptions.length; index++) {
            const element = nearOptions[index];
            console.log("element", element )


            var data = { "exchange": element.exch_seg, "tradingsymbol": element.symbol, "symboltoken": element.token };
            AdminService.getLTP(data).then(res => {
                let data = resolveResponse(res, 'noPop');
                var LtpData = data && data.data;
                console.log(element.symbol, LtpData, res);
                if (LtpData && LtpData.ltp) {

                    let optionLtp = {
                        symbol: LtpData.tradingsymbol,
                        ltp: LtpData.ltp,
                        perChange: ((LtpData.ltp - LtpData.close) * 100 / LtpData.close).toFixed(2),
                        open: LtpData.open,
                        high: LtpData.high,
                        close: LtpData.close,
                        low: LtpData.low,
                        buyPrice: (parseFloat(element.lotsize) * LtpData.ltp).toFixed(2), 
                        expiryMonth: element.expiryMonth,
                        strikePrice : parseFloat(element.strike/100), 
                        optionType: element.optionType, 
                        token:element.token, 
                        exch_seg: element.exch_seg, 
                        lotsize: element.lotsize
                    }

                    if(optionType === 'CE'){
                        this.setState({ CEoptionsLtpList: [...this.state.CEoptionsLtpList, optionLtp],  selectedOptionLotsize :  element.lotsize}, ()=> {
                            console.log(this.state.CEoptionsLtpList)
                        });
                    }
                    if(optionType === 'PE'){
                        this.setState({ PEoptionsLtpList: [...this.state.PEoptionsLtpList, optionLtp],  selectedOptionLotsize :  element.lotsize}, ()=> {
                            console.log(this.state.PEoptionsLtpList)
                        });
                    }
                    
                }
            })

            await new Promise(r => setTimeout(r, 250));
        }


    }

    buyOption = (optiontype, symbol, strikePrice, expiryDate, noOfLot, priceInfo) => {
        console.log(optiontype, symbol, strikePrice, expiryDate);
        let exp = expiryDate.toUpperCase().split('-');
        exp = exp[0] + exp[1] + exp[2] % 1000;

        let optionName = symbol + exp + strikePrice + optiontype;
        console.log(optionName);

        AdminService.autoCompleteSearch(optionName).then(res => {
            let data = res.data;
            let optionData = data && data[0];
            console.log("optionData", optionData);


            if (optionData && optionData.symbol && optionData.symbol == optionName) {
                var ltpparam = { "exchange": optionData.exch_seg, "tradingsymbol": optionData.symbol, "symboltoken": optionData.token };

                AdminService.getLTP(ltpparam).then(res => {
                    let data = resolveResponse(res, 'noPop');
                    var LtpData = data && data.data;
                    if (LtpData && LtpData.ltp) {

                        console.log("option ltp", LtpData);

                        let quantity = optionData.lotsize * noOfLot;

                        let today = moment().isoWeekday();
                        let slpercentage = 10;
                        if (today == 2)
                            slpercentage = 15
                        else if (today == 3)
                            slpercentage = 20
                        else if (today == 4)
                            slpercentage = 30

                        let perStopTrigerLoss = LtpData.ltp - (LtpData.ltp * slpercentage / 100);
                        perStopTrigerLoss = CommonOrderMethod.getMinPriceAllowTick(perStopTrigerLoss);
                        let stopLossPrice = perStopTrigerLoss - (perStopTrigerLoss * 1 / 100);
                        stopLossPrice = CommonOrderMethod.getMinPriceAllowTick(stopLossPrice);

                        if (priceInfo && priceInfo.priceStopLoss) {

                            slpercentage = 50
                            perStopTrigerLoss = LtpData.ltp - (LtpData.ltp * slpercentage / 100);
                            perStopTrigerLoss = CommonOrderMethod.getMinPriceAllowTick(perStopTrigerLoss);
                            stopLossPrice = perStopTrigerLoss - (perStopTrigerLoss * 1 / 100);
                            stopLossPrice = CommonOrderMethod.getMinPriceAllowTick(stopLossPrice);

                            let trackSLPrice = {
                                name: symbol,
                                priceStopLoss: priceInfo.priceStopLoss,
                                priceTarget: priceInfo.priceTarget,
                                tradingsymbol: optionData.symbol,
                                symboltoken: optionData.token,
                                optiontype: optiontype
                            }
                            this.setState({ trackSLPrice: [...this.state.trackSLPrice, trackSLPrice] }, function () {
                                localStorage.setItem('trackSLPrice', JSON.stringify(this.state.trackSLPrice));
                            })
                        }


                        let element = {
                            tradingsymbol: optionData.symbol,
                            symboltoken: optionData.token,
                            transactiontype: "BUY",
                            ordertype: "LIMIT",
                            buyPrice: LtpData.ltp,
                            producttype: "CARRYFORWARD",
                            exchange: optionData.exch_seg,
                            stopLossTriggerPrice: perStopTrigerLoss,
                            stopLossPrice: stopLossPrice,
                            quantity: quantity
                        }
                        CommonOrderMethod.placeOptionOrder(element);
                    }
                })
            } else {
                Notify.showError(optionName + " not found");
            }

            //localStorage.setItem('autoSearchTemp', JSON.stringify(data));
            //    this.setState({ autoSearchList: data });
        })

    }

    buyStockOption = (optionData) => {

        var ltpparam = { "exchange": optionData.exch_seg, "tradingsymbol": optionData.symbol, "symboltoken": optionData.token };

        AdminService.getLTP(ltpparam).then(res => {
            let data = resolveResponse(res, 'noPop');
            var LtpData = data && data.data;
            if (LtpData && LtpData.ltp) {

                console.log("option ltp", LtpData);

                let quantity = optionData.lotsize;

                // let today = moment().isoWeekday();
                 let slpercentage = 10;
                // if (today == 2)
                //     slpercentage = 15
                // else if (today == 3)
                //     slpercentage = 20
                // else if (today == 4)
                //     slpercentage = 30

                let perStopTrigerLoss = LtpData.ltp - (LtpData.ltp * slpercentage / 100);
                perStopTrigerLoss = CommonOrderMethod.getMinPriceAllowTick(perStopTrigerLoss);
                let stopLossPrice = perStopTrigerLoss - (perStopTrigerLoss * 1 / 100);
                stopLossPrice = CommonOrderMethod.getMinPriceAllowTick(stopLossPrice);

                let element = {
                    tradingsymbol: optionData.symbol,
                    symboltoken: optionData.token,
                    transactiontype: "BUY",
                    ordertype: "LIMIT",
                    buyPrice: LtpData.ltp,
                    producttype: "CARRYFORWARD",
                    exchange: optionData.exch_seg,
                    stopLossTriggerPrice: perStopTrigerLoss,
                    stopLossPrice: stopLossPrice,
                    quantity: quantity,
                    netqty:quantity
                }
                CommonOrderMethod.placeOptionOrder(element);
            }
        })

    }

    toFixedAmount =(value) => {

        if(value){
          return  parseFloat(value).toFixed(2);
        }
       }
    render() {

        return (
            <React.Fragment>


                {window.location.hash == "#/order-watchlist" ? <PostLoginNavBar /> : ""}
                <ChartDialog />

                

                <Grid justify="space-between" container>

                    <Typography style={{color:'green'}}>
                    Net Balance:   {this.state.fundData &&  this.toFixedAmount(this.state.fundData.net)}
                    </Typography>
                    <Typography  style={{color:'green'}}>
                    Available Cash :   {this.state.fundData &&  this.toFixedAmount(this.state.fundData.availablecash)}
                    </Typography>
                
                    <Grid item xs={12} sm={12}>
                        {window.location.hash == "#/position-new" || window.location.hash == "#/order-watchlist"  ? <OptionBuyWithSPLevel liveBankniftyLtdData={this.props.liveBankniftyLtdData} buyOption={this.buyOption} /> : ""}
                    </Grid>

                    {window.location.hash == "#/order-watchlist" ?

                    <Grid item xs={12} sm={12}>
                        <Paper style={{ overflow: "auto", padding: '5px', background: "#d4ffe0" }} >
                            <Typography color="primary" gutterBottom>
                                Stock  Order Watchlist ({this.state.orderPenidngList && this.state.orderPenidngList.length})
                                {window.location.hash != "#/order-watchlist" ? <Button onClick={() => this.openNewPage()}> New Page <OpenInNewIcon /> </Button> : ""}
                                {window.location.hash != "#/position-new" ? <Button onClick={() => this.backToPositionPage()}> Back to Position </Button> : ""}
                            </Typography>

                            <Grid justify="space-between"
                                container>




                                <Grid item  >

                                    <Grid container spacing={2}>
                                        <Grid item >
                                            {/* <TextField label="Type full Symbol" name="searchSymbolPending" value={this.state.searchSymbolPending} onChange={this.searchSymbolPendingOrder} /> */}
                                            <Autocomplete
                                                freeSolo
                                                id="free-solo-2-demo"

                                                disableClearable
                                                onChange={this.onSelectItem}
                                                value={this.state.searchSymbolPending}
                                                //+ ' '+  option.exch_seg
                                                options={this.state.autoSearchList.length > 0 ? this.state.autoSearchList.map((option) =>
                                                    option.symbol
                                                ) : []}
                                                renderInput={(params) => (
                                                    <TextField
                                                        onChange={this.onChange2}
                                                        {...params}
                                                        label={"Search Symbol"}
                                                        margin="normal"
                                                        style={{ width: "200px", marginTop: 'inherit' }}
                                                        name="searchSymbolPending"
                                                        variant="standard"
                                                        InputProps={{ ...params.InputProps, type: 'search' }}
                                                    />
                                                )}
                                            />
                                            {this.state.lastTradedData.symbol}  Ltp: <b style={{ color: this.state.lastTradedData.perChange == 0 ? "none" : this.state.lastTradedData.perChange > 0 ? "green" : "red" }}> {this.state.lastTradedData.ltp} {this.state.lastTradedData.ltp ? "(" + this.state.lastTradedData.perChange + "%)" : ""}</b>
                                        </Grid>


                                        <Grid item>
                                            <TextField label="BuyAt(Above)" type="number" name="buyAtPending" value={this.state.buyAtPending} onChange={this.updateInput} />
                                            <br /> High: {this.state.lastTradedData.high}
                                            <Button size="small" style={{ color: "blue" }} onClick={() => this.suggestBuyPrice(this.state.lastTradedData.high)}> Suggest Price </Button>

                                        </Grid>
                                        <Grid item>
                                            <FormControl style={styles.selectStyle}>
                                                <InputLabel htmlFor="strike">Strike</InputLabel>
                                                <Select value={this.state.CEStrikePrice} name="CEStrikePrice" style={{width: "200px"}} onChange={this.onChangeOption}>
                                                    <MenuItem value={''}>Month Strike Type Ltp Margin</MenuItem>
                                                    {this.state.CEoptionsLtpList && this.state.CEoptionsLtpList.map(element => (
                                                        <MenuItem style={{ fontWeight:  moment().format('MMM').toUpperCase() == element.expiryMonth ? "bold" : "" }} value={element}>{element.expiryMonth+" " +element.strikePrice +" "+ element.optionType +" ltp: " + element.ltp + "/- " + element.buyPrice}</MenuItem>
                                                    ))
                                                    }
                                                </Select>
                                                Lotsize: {this.state.selectedOptionLotsize}
                                            </FormControl>
                                        </Grid>

                                        <Grid item>
                                            <TextField label="SellAt(Below)" type="number" name="sellAtPending" value={this.state.sellAtPending} onChange={this.updateInput} />
                                            <br /> Low: {this.state.lastTradedData.low}
                                            <Button size="small" style={{ color: "blue" }} onClick={() => this.suggestSellPrice(this.state.lastTradedData.low)}> Suggest Price </Button>
                                        </Grid>
                                        <Grid item>
                                            <FormControl style={styles.selectStyle}>
                                                <InputLabel htmlFor="strike">Strike</InputLabel>
                                                <Select value={this.state.PEStrikePrice} name="PEStrikePrice" style={{width: "200px"}} onChange={this.onChangeOption}>
                                                    <MenuItem value={''}>Month Strike Type Ltp Margin</MenuItem>
                                                    {this.state.PEoptionsLtpList && this.state.PEoptionsLtpList.map(element => (
                                                        <MenuItem style={{ fontWeight:  moment().format('MMM').toUpperCase() == element.expiryMonth ? "bold" : "" }} value={element}>{element.expiryMonth+" " +element.strikePrice +" "+ element.optionType +" ltp: " + element.ltp + "/- " + element.buyPrice}</MenuItem>
                                                    ))
                                                    }
                                                </Select>
                                                Lotsize: {this.state.selectedOptionLotsize}
                                            </FormControl>
                                        </Grid>
                                        <Grid item>
                                            <TextField label="Which Pattern" name="pattenNamePending" value={this.state.pattenNamePending} onChange={this.updateInput} />
                                            <br /> Open: {this.state.lastTradedData.open}
                                        </Grid>
                                        <Grid item>
                                            <Button variant="contained" style={{ marginLeft: '20px', marginTop: '10px' }} onClick={() => this.addInOrderPenidngList()}> Add </Button>
                                            <br /> P.Close: {this.state.lastTradedData.close}
                                        </Grid>
                                    </Grid>

                                </Grid>


                                <Table size="small" aria-label="sticky table" >
                                    <TableHead style={{ whiteSpace: "nowrap", }} variant="head">
                                        <TableRow key="1" variant="head" style={{ fontWeight: 'bold' }}>

                                            <TableCell className="TableHeadFormat" align="left">Symbol</TableCell>
                                            <TableCell className="TableHeadFormat" align="left">Patten Name</TableCell>

                                            <TableCell className="TableHeadFormat" align="left">CreatetAt</TableCell>

                                            <TableCell className="TableHeadFormat" align="left">Exch_seg</TableCell>
                                            <TableCell className="TableHeadFormat" align="left">Token</TableCell>
                                            <TableCell className="TableHeadFormat" align="left">BuyAt</TableCell>
                                            <TableCell className="TableHeadFormat" align="left">CE Buy</TableCell>

                                            <TableCell className="TableHeadFormat" align="left">SellAt</TableCell>
                                            <TableCell className="TableHeadFormat" align="left">PE Buy</TableCell>

                                            <TableCell className="TableHeadFormat" align="left">LTP</TableCell>
                                            <TableCell className="TableHeadFormat" align="left">Delete</TableCell>

                                        </TableRow>
                                    </TableHead>
                                    <TableBody id="tableAdd" style={{ width: "", whiteSpace: "nowrap" }}>

                                        {this.state.orderPenidngList ? this.state.orderPenidngList.map(row => (
                                            <TableRow hover >




                                                <TableCell align="left">
                                                    <Button style={{ color: row.perChange > 0 ? "green" : "red" }} size="small" variant="contained" title="Candle refresh" onClick={() => this.refreshCandleChartManually(row)} >
                                                        {row.symbol} {row.ltp} ({row.perChange}) <ShowChartIcon />
                                                    </Button>
                                                </TableCell>
                                                <TableCell align="left">{row.pattenName}</TableCell>


                                                <TableCell align="left">{row.createdAt}</TableCell>


                                                <TableCell align="left">{row.exch_seg}</TableCell>
                                                <TableCell align="left">{row.token}</TableCell>

                                                <TableCell align="left">{row.buyAt}</TableCell>
                                                <TableCell align="left">{row.buyCallOption && row.buyCallOption.symbol}</TableCell>

                                                <TableCell align="left">{row.sellAt}</TableCell>
                                                <TableCell align="left">{row.buyPutOption && row.buyPutOption.symbol}</TableCell>

                                                <TableCell align="left" style={{ color: row.perChange == 0.00 ? "none" : row.perChange > 0 ? "green" : "red" }}><b>{row.ltp} ({row.perChange}%) </b></TableCell>

                                                <TableCell align="left">
                                                    <DeleteIcon style={{ cursor: "pointer" }} onClick={() => this.deleteInOrderPenidngList(row)} />
                                                </TableCell>

                                            </TableRow>
                                        )) : ''}
                                    </TableBody>
                                </Table>


                            </Grid>


                        </Paper>

                    </Grid> : ""}


                </Grid>




                {window.location.hash == "#/order-watchlist" ?
                    <Paper style={{ overflow: "auto", padding: '5px' }} >
                        <Typography color="primary" gutterBottom>
                            Option Chain (Equity Derivatives)
                        </Typography>
                        <BankNiftyView buyOption={this.buyOption} />
                    </Paper> : ""}


            </React.Fragment>
        )
    }

}


const styles = {
    tableStyle : {
        display: 'flex',
        justifyContent: 'center'
    },
    selectStyle: {
        minWidth: '100%',
        marginBottom: '10px'
    },
}

// const mapStateToProps=(state)=>{
//     return {packs:state.packs.packs.data};
// }

//export default connect(mapStateToProps,{setPackLoaded})(OrderBook);
export default OrderBook;