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
import {resolveResponse} from "../../utils/ResponseHandler";
import Spinner from "react-spinner-material";
import TextField from "@material-ui/core/TextField";
import Autocomplete from '@material-ui/lab/Autocomplete';
import DeleteIcon from '@material-ui/icons/Delete';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import CommonOrderMethod from "../../utils/CommonMethods";
import * as moment from 'moment';
import Notify from "../../utils/Notify";
import ShowChartIcon from '@material-ui/icons/ShowChart';

import BankNiftyView from './BankNiftyView'

class OrderBook extends React.Component{

    constructor(props) {
        super(props);

        this.state = {
            orderPenidngOptionList: localStorage.getItem('orderPenidngOptionList') && JSON.parse(localStorage.getItem('orderPenidngOptionList')) || [], 
            buyAtPending: "", 
            sellAtPending: "", 
            pattenNamePending: "",
            searchSymbolPending : "",
            autoSearchList:[{"token":"26009","symbol":"BANKNIFTY","name":"BANKNIFTY","expiry":"","strike":"-1.000000","lotsize":"-1","instrumenttype":"","exch_seg":"NSE","tick_size":"-1.000000"},{"token":"26000","symbol":"NIFTY","name":"NIFTY","expiry":"","strike":"-1.000000","lotsize":"-1","instrumenttype":"","exch_seg":"NSE","tick_size":"-1.000000"}], 
            lastTradedData : {},
            buyOptionFlag : false ,
            staticData: localStorage.getItem('staticData') && JSON.parse(localStorage.getItem('staticData')) || {},
            selectedWatchlist: "Securities in F&O",

        }
    }

    searchSymbolPendingOrder = (e) => {
        this.setState({[e.target.name] : e.target.value})

        AdminService.stockOptionSearch(e.target.value).then(searchRes => {
            let searchResdata = searchRes.data;
            if (e.target.value) {
                var uppercaseName = e.target.value.toUpperCase() + "-EQ";
                var found = searchResdata.filter(row => row.exch_seg === "NSE" && row.lotsize === "1" && row.symbol === uppercaseName);
                //  console.log("found", found[0] && found[0].symbol); 
                if (found.length) {
                    this.setState({searchSymbolPending : found[0].symbol,searchTokenPending :found[0].token, exch_seg: found[0].exch_seg})
                }
            }
        })
    }

    updateInput = (e) => {
        this.setState({ [e.target.name]: e.target.value });      
    }

    addInOrderPenidngList =  async() => {

        console.log(this.state.searchSymbolPending, this.state.searchTokenPending, this.state.buyAtPending, this.state.sellAtPending);
      
        if(parseFloat(this.state.sellAtPending ) > this.state.lastTradedData.low){
            if(!window.confirm("Be carefull Selling at high price "+ this.state.sellAtPending +", today " +this.state.searchSymbolPending+ " low is " +  this.state.lastTradedData.low)){
                return; 
            }
        }
        if(parseFloat(this.state.buyAtPending)  < this.state.lastTradedData.high){
           if(!window.confirm("Be carefull Buying at low price "+ this.state.buyAtPending +", today " +this.state.searchSymbolPending+ " high is " +  this.state.lastTradedData.high)){
            return; 
           }
        }
            
        if(this.state.searchSymbolPending && this.state.buyAtPending || this.state.sellAtPending){
        
            var data = {
                createdAt : new Date().toLocaleTimeString(), 
                token: this.state.searchTokenPending, 
                symbol: this.state.searchSymbolPending, 
                buyAt: this.state.buyAtPending,
                sellAt: this.state.sellAtPending,  
                pattenName: this.state.pattenNamePending,
                exch_seg:  this.state.exch_seg,
                priceStopLoss: this.state.priceStopLoss,
                priceTarget : this.state.priceTarget
            }

            this.setState({orderPenidngOptionList : [...this.state.orderPenidngOptionList, data]}, function(){
                this.setState({searchSymbolPending: '' ,searchTokenPending:'',buyAtPending: "", sellAtPending: "",pattenNamePending:""  })
                localStorage.setItem('orderPenidngOptionList', JSON.stringify(this.state.orderPenidngOptionList));
                localStorage.setItem('orderTagToPosition', JSON.stringify(this.state.orderPenidngOptionList));
            })
            
        }
        

    }

    deleteInOrderPenidngList =(row)=> {

        console.log("callback", row); 
        var isDeleted = false, delitem =''; 
       var orderPenidngOptionList =  localStorage.getItem('orderPenidngOptionList') && JSON.parse( localStorage.getItem('orderPenidngOptionList')); 
       for (let index = 0; index < this.state.orderPenidngOptionList.length; index++) {
           const element = orderPenidngOptionList[index];
           if(row.symbol == element.symbol){
            delitem = orderPenidngOptionList.splice(index, 1); 
            localStorage.setItem('orderPenidngOptionList', JSON.stringify(orderPenidngOptionList)); 
            this.setState({orderPenidngOptionList : orderPenidngOptionList}); 
            break; 
           }
       }

       console.log("del", delitem)
       if(delitem && delitem[0].symbol == row.symbol){
        return true;
       }else {
        return false;
       }
        
    }

    callBackUpdate =(row) => {
       console.log("call back called");
     // this.deleteInOrderPenidngList(row); 
    }

    placeOptionSPLevelOver=(indexData, spotPrice)=>{

        let today = moment().isoWeekday();
        let strikePrice = 0; 
        let allList = localStorage.getItem('optionChainDataBN') && JSON.parse(localStorage.getItem('optionChainDataBN')); 
        let nextExp = allList["records"]["expiryDates"][0]; 

        if(indexData.buyAt){
            if(today == 5 || today == 1){
                strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100)  + 400
                if(indexData.symbol == 'NIFTY'){
                    strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100)  + 200
                }
            }
            else  if(today == 2){
                strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100)  + 300
                if(indexData.symbol == 'NIFTY'){
                    strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100)  + 150
                }
            }
            else  if(today == 3){
                strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100)  + 200
                if(indexData.symbol == 'NIFTY'){
                    strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100)  + 100
                }
            }else {
                strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100) 
            }

            strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100) 

            this.props.buyOption("CE", indexData.symbol, strikePrice, nextExp, 1 , indexData);  
        }else if(indexData.sellAt){
            if(today == 5 || today == 1){
                strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100)  - 400
                if(indexData.symbol == 'NIFTY'){
                    strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100)  - 200
                }
            }
            else  if(today == 2){
                strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100)  - 300
                if(indexData.symbol == 'NIFTY'){
                    strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100)  - 150
                }
            }
            else  if(today == 3){
                strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100)  - 200
                if(indexData.symbol == 'NIFTY'){
                    strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100)  - 100
                }
            }else {
                strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100) 
            }

            strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100) 

            console.log(strikePrice, today);

            this.props.buyOption("PE", indexData.symbol, strikePrice, nextExp, 1, indexData);  
        }

    }

    updateLTP = async()=> {

        for (let index = 0; index < this.state.orderPenidngOptionList.length; index++) {
            const element = this.state.orderPenidngOptionList[index];
            var data = { "exchange":element.exch_seg, "tradingsymbol":element.symbol , "symboltoken": element.token}; 
            AdminService.getLTP(data).then(res => {
                let data = resolveResponse(res, 'noPop');
                var LtpData = data && data.data;
                //console.log(LtpData);
                if(LtpData && LtpData.ltp) {
                    element.ltp = LtpData.ltp; 
                    element.perChange = ((LtpData.ltp - LtpData.close) * 100 / LtpData.close).toFixed(2); 
                    localStorage.setItem('orderPenidngOptionList', JSON.stringify(this.state.orderPenidngOptionList)); 
                    this.setState({orderPenidngOptionList : this.state.orderPenidngOptionList}); 
                    console.log("ltp update",element.symbol,element)

                    if(element.buyAt && LtpData.ltp >= parseFloat(element.buyAt)){
                        var isDelete = this.deleteInOrderPenidngList(element); 
                        if(isDelete){ // && !this.state.buyOptionFlag
                            console.log("buyopiton",element.symbol,element)

                            this.setState({buyOptionFlag: true}, function(){
                                this.placeOptionSPLevelOver(element, LtpData.ltp); 
                            })
                        }
                    }else if(element.sellAt && LtpData.ltp <= parseFloat(element.sellAt)){
                        var isDelete = this.deleteInOrderPenidngList(element); 
                        if(isDelete){ // && !this.state.buyOptionFlag
                            this.setState({buyOptionFlag: true}, function(){
                                this.placeOptionSPLevelOver(element, LtpData.ltp); 
                            })
                        }
                    }

                }
            })

            await new Promise(r => setTimeout(r, 500)); 
        }
    }

    getTradePrice =()=> {

        var data = { "exchange":this.state.exch_seg, "tradingsymbol":this.state.searchSymbolPending , "symboltoken": this.state.searchTokenPending}; 
        AdminService.getLTP(data).then(res => {
            let data = resolveResponse(res, 'noPop');
            var LtpData = data && data.data;
            //console.log(LtpData);
            if(LtpData && LtpData.ltp) {
        

                var lastTradedData = {
                    symbol: LtpData.tradingsymbol,
                    ltp : LtpData.ltp,
                    perChange : ((LtpData.ltp - LtpData.close) * 100 / LtpData.close).toFixed(2), 
                    open : LtpData.open, 
                    high : LtpData.high, 
                    close : LtpData.close, 
                    low : LtpData.low, 
                }
                this.setState({lastTradedData : lastTradedData}); 
            
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
            var intervaltime = 2001; 
            if(this.state.orderPenidngOptionList.length > 10){
                intervaltime = this.state.orderPenidngOptionList.length * 110; 
            }
            this.setState({ findlast5minMovementInterval: setInterval(() => { this.updateLTP(); }, intervaltime ) });
        }

        localStorage.setItem('autoSearchTemp',JSON.stringify(this.state.autoSearchList))
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

    onChange2 = (e) => {
        this.setState({ [e.target.name]: e.target.value });
        var data = e.target.value;

        this.setState({lastTradedData : {}, buyAtPending: "", sellAtPending: "", pattenNamePending: "",searchSymbolPending : ""}); 
        var watchList = this.state.staticData[this.state.selectedWatchlist];

        var isfound = watchList.filter(element => (element.name == e.target.value.toUpperCase()));
        console.log( "stock", isfound);
        

        if(isfound.length > 0){
            var  ltpparam = { "exchange":isfound[0].exch_seg, "tradingsymbol": isfound[0].symbol , "symboltoken": isfound[0].token}; 
            AdminService.getLTP(ltpparam).then(res => {
                let data = resolveResponse(res, 'noPop');
                var LtpData = data && data.data;
                if(LtpData && LtpData.ltp) {
                    console.log( "LtpData",LtpData);

                    AdminService.stockOptionSearch({name : isfound[0].name, ltp : LtpData.ltp}).then(res => {
                        let data = res.data;
                        console.log(data);
                        localStorage.setItem('autoSearchTemp', JSON.stringify(data));
                        this.setState({ autoSearchList: data });
                    })

                }
            });
        }       

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
          console.log("values", values); 
           console.log("autoSearchTemp", autoSearchTemp); 
        if (autoSearchTemp.length > 0) {
            var fdata = '';
            for (let index = 0; index < autoSearchTemp.length; index++) {
                if (autoSearchTemp[index].symbol === values) {
                    fdata = autoSearchTemp[index];
                    break;
                }
            }
            this.setState({searchSymbolPending : fdata.symbol,searchTokenPending :fdata.token, exch_seg: fdata.exch_seg }, function(){
                this.getTradePrice(); 
            }); 

        }

    }

    // buyOption =(optiontype ,symbol, strikePrice, expiryDate, noOfLot)=>{
    //   console.log(optiontype ,symbol, strikePrice, expiryDate); 
    //   let exp = expiryDate.toUpperCase().split('-'); 
    //    exp = exp[0]+exp[1]+exp[2]%1000; 

    //   let optionName = symbol + exp + strikePrice + optiontype; 
    //   console.log(optionName); 

    //   AdminService.autoCompleteSearch(optionName).then(res => {
    //     let data = res.data; 
    //     let optionData = data && data[0]; 
    //     console.log("optionData", optionData);


    //     if(optionData && optionData.symbol && optionData.symbol ==  optionName){
    //         var  ltpparam = { "exchange":optionData.exch_seg, "tradingsymbol": optionData.symbol , "symboltoken": optionData.token}; 

    //         AdminService.getLTP(ltpparam).then(res => {
    //             let data = resolveResponse(res, 'noPop');
    //             var LtpData = data && data.data;
    //             if(LtpData && LtpData.ltp) {
                    
    //                 console.log("option ltp", LtpData);

    //                let quantity = optionData.lotsize * noOfLot;   

    
    //                let perStopTrigerLoss = LtpData.ltp - (LtpData.ltp * 10/100); 
    //                perStopTrigerLoss =  CommonOrderMethod.getMinPriceAllowTick(perStopTrigerLoss); 

    //                let stopLossPrice = perStopTrigerLoss - (perStopTrigerLoss * 1/100); 

    //                stopLossPrice =  CommonOrderMethod.getMinPriceAllowTick(stopLossPrice); 

    
    //                 let element = {
    //                     tradingsymbol : optionData.symbol, 
    //                     symboltoken : optionData.token, 
    //                     transactiontype: "BUY", 
    //                     ordertype: "LIMIT", 
    //                     buyPrice : LtpData.ltp,  
    //                     producttype : "CARRYFORWARD", 
    //                     exchange : optionData.exch_seg,
    //                     stopLossTriggerPrice: perStopTrigerLoss,
    //                     stopLossPrice: stopLossPrice,
    //                     quantity : quantity
    //                 }        
    //                 console.log( "option buy element", element);
    //                CommonOrderMethod.placeOptionOrder(element);
    //             }
    //         })
    //     }else{
    //         Notify.showError(optionName + " not found");
    //     }
       

    //     //localStorage.setItem('autoSearchTemp', JSON.stringify(data));
    // //    this.setState({ autoSearchList: data });
    // })
    // }


    render(){
        
      return(
        <React.Fragment>

             <Paper style={{ overflow: "auto", padding: '5px',  background:"#f500570a"}} >

                <Grid justify="space-between"
                    container>
                    <Grid item> 
                        <Typography  color="primary" gutterBottom>
                        Option Buy With Level ({this.state.orderPenidngOptionList && this.state.orderPenidngOptionList.length}) 
                        {window.location.hash != "#/order-watchlist" ? <Button onClick={() => this.openNewPage()}> New Page <OpenInNewIcon/> </Button> : ""}
                        {window.location.hash != "#/position" ?<Button onClick={() => this.backToPositionPage()}> Back to Position </Button> : ""}
                        </Typography> 


                    </Grid>

                   

                    <Grid item >

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
                                                style={{  width:"200px",marginTop: 'inherit' }}
                                                name="searchSymbolPending"
                                                variant="standard"
                                                InputProps={{ ...params.InputProps, type: 'search' }}
                                            /> 
                                        )}
                                    />
                              {this.state.lastTradedData.symbol}  Ltp: <b style={{ color:this.state.lastTradedData.perChange == 0 ? "none" : this.state.lastTradedData.perChange > 0 ? "green" : "red"}}> {this.state.lastTradedData.ltp} {this.state.lastTradedData.ltp ? "("+this.state.lastTradedData.perChange+"%)"  : ""}</b> 
                    </Grid>

                            
                            <Grid item  >
                                <TextField label="BuyAt(Above))" type="number" name="buyAtPending" value={this.state.buyAtPending} onChange={this.updateInput} />
                              <br /> High: {this.state.lastTradedData.high}
                            </Grid>
                            <Grid item  >
                                <TextField label="SellAt(Below)" type="number" name="sellAtPending" value={this.state.sellAtPending} onChange={this.updateInput} />
                                <br /> Low: {this.state.lastTradedData.low}
                            </Grid>
                            <Grid item  >
                                <TextField label="Which Pattern" name="pattenNamePending" value={this.state.pattenNamePending} onChange={this.updateInput} />
                                <br /> Open: {this.state.lastTradedData.open}
                            </Grid>
                            <Grid item  >
                                <TextField label="Price Stop Loss" name="priceStopLoss" value={this.state.priceStopLoss} onChange={this.updateInput} />
                                <br /> 
                            </Grid>
                            <Grid item  >
                                <TextField label="Price Target" name="priceTarget" value={this.state.priceTarget} onChange={this.updateInput} />
                                <br /> 
                            </Grid>
                            <Grid item  >
                                <Button variant="contained" style={{ marginLeft: '20px', marginTop: '10px' }} onClick={() => this.addInOrderPenidngList()}> Add </Button>
                                <br /> P.Close: {this.state.lastTradedData.close}
                            </Grid>
                        </Grid>

                    </Grid>


                    <Table size="small" aria-label="sticky table" >
                        <TableHead style={{ whiteSpace: "nowrap", }} variant="head">
                            <TableRow key="1" variant="head" style={{ fontWeight: 'bold' }}>

                                <TableCell className="TableHeadFormat" align="left">Symbol</TableCell>
                                <TableCell className="TableHeadFormat" align="left">CreatetAt</TableCell>

                                {/* <TableCell className="TableHeadFormat" align="left">Segm</TableCell> */}
                                {/* <TableCell className="TableHeadFormat" align="left">Token</TableCell> */}
                                <TableCell className="TableHeadFormat" align="left">Patten</TableCell>
                                <TableCell className="TableHeadFormat" align="left">BuyAt</TableCell>
                                <TableCell className="TableHeadFormat" align="left">SellAt</TableCell>
                                <TableCell className="TableHeadFormat" align="left">LTP</TableCell>
                                <TableCell className="TableHeadFormat" align="left">PriceSL</TableCell>
                                <TableCell className="TableHeadFormat" align="left">PriceTarget</TableCell>

                                
                                <TableCell className="TableHeadFormat" align="left">Delete</TableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody id="tableAdd" style={{ width: "", whiteSpace: "nowrap" }}>

                            {this.state.orderPenidngOptionList ? this.state.orderPenidngOptionList.map(row => (
                                 <TableRow hover >

                                   


                                    <TableCell align="left">
                                        <Button style={{ color: row.perChange > 0 ? "green" : "red" }} size="small" variant="contained" title="Candle refresh" onClick={() => this.refreshCandleChartManually(row)} >
                                            {row.symbol} {row.ltp} ({row.perChange}) <ShowChartIcon />
                                        </Button>
                                    </TableCell>

                                    <TableCell align="left">{row.createdAt}</TableCell>


                                    {/* <TableCell align="left">{row.exch_seg}</TableCell> */}
                                    {/* <TableCell align="left">{row.token}</TableCell> */}

                                    <TableCell align="left">{row.pattenName}</TableCell>
                                    <TableCell align="left">{row.buyAt}</TableCell>
                                    <TableCell align="left">{row.sellAt}</TableCell>
                                    <TableCell align="left" style={{color: row.perChange == 0.00 ? "none" :  row.perChange > 0 ? "green" :"red"}}><b>{row.ltp} ({row.perChange}%) </b></TableCell>
                                    <TableCell align="left">{row.priceStopLoss}</TableCell>
                                    <TableCell align="left">{row.priceTarget}</TableCell>

                                    <TableCell align="left">
                                     <DeleteIcon style={{cursor:"pointer"}} onClick={() => this.deleteInOrderPenidngList(row)} />
                                    </TableCell>

                                </TableRow>
                            )) : ''}
                        </TableBody>
                    </Table>


                </Grid>


                </Paper>

                <br />
         

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
//         // minWidth: '100%',
//          marginBottom: '0px',
//           minWidth: 300,
//           maxWidth: 300,
//     }
// }

// const mapStateToProps=(state)=>{
//     return {packs:state.packs.packs.data};
// }

//export default connect(mapStateToProps,{setPackLoaded})(OrderBook);
export default OrderBook;