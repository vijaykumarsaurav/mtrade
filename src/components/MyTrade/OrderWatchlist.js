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

class OrderBook extends React.Component{

    constructor(props) {
        super(props);

        this.state = {
            orderPenidngList: localStorage.getItem('orderPenidngList') && JSON.parse(localStorage.getItem('orderPenidngList')) || [], 
            buyAtPending: "", 
            sellAtPending: "", 
            pattenNamePending: "",
            searchSymbolPending : "",
            autoSearchList: [], 
            lastTradedData : {}
        }
    }

    searchSymbolPendingOrder = (e) => {
        this.setState({[e.target.name] : e.target.value})

        AdminService.autoCompleteSearch(e.target.value).then(searchRes => {
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
            }

            this.setState({orderPenidngList : [...this.state.orderPenidngList, data]}, function(){
                this.setState({searchSymbolPending: '' ,searchTokenPending:'',buyAtPending: "", sellAtPending: "",pattenNamePending:""  })
                localStorage.setItem('orderPenidngList', JSON.stringify(this.state.orderPenidngList)); 
            })
            
        }
        

    }

    deleteInOrderPenidngList =(row)=> {

        console.log("callback", row); 

       var orderPenidngList =  localStorage.getItem('orderPenidngList') && JSON.parse( localStorage.getItem('orderPenidngList')); 

       for (let index = 0; index < this.state.orderPenidngList.length; index++) {
           const element = orderPenidngList[index];

           if(row.token == element.token){
            orderPenidngList.splice(index, 1);
            localStorage.setItem('orderPenidngList', JSON.stringify(orderPenidngList)); 
            this.setState({orderPenidngList : orderPenidngList}); 
            break; 
           }
       }
        
    }

    callBackUpdate =(row) => {
      this.deleteInOrderPenidngList(row); 
    }

    updateLTP = async()=> {

        for (let index = 0; index < this.state.orderPenidngList.length; index++) {
            const element = this.state.orderPenidngList[index];
            var data = { "exchange":element.exch_seg, "tradingsymbol":element.symbol , "symboltoken": element.token}; 
            AdminService.getLTP(data).then(res => {
                let data = resolveResponse(res, 'noPop');
                var LtpData = data && data.data;
                //console.log(LtpData);
                if(LtpData && LtpData.ltp) {
                    element.ltp = LtpData.ltp; 
                    element.perChange = ((LtpData.ltp - LtpData.close) * 100 / LtpData.close).toFixed(2); 
                    localStorage.setItem('orderPenidngList', JSON.stringify(this.state.orderPenidngList)); 
                    this.setState({orderPenidngList : this.state.orderPenidngList}); 
                    console.log("ltp update",element.symbol,element)

                    if(element.buyAt && LtpData.ltp >= parseFloat(element.buyAt)){
                        CommonOrderMethod.historyWiseOrderPlace(element, 'BUY', "isAutomatic", this.callBackUpdate);
                    }else if(element.sellAt && LtpData.ltp <= parseFloat(element.sellAt)){
                        CommonOrderMethod.historyWiseOrderPlace(element, 'SELL', "isAutomatic", this.callBackUpdate);
                    }

                }
            })

            await new Promise(r => setTimeout(r, 100)); 
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
            var intervaltime = 1000; 
            if(this.state.orderPenidngList.length > 10){
                intervaltime = this.state.orderPenidngList.length * 110; 
            }
            this.setState({ findlast5minMovementInterval: setInterval(() => { this.updateLTP(); }, intervaltime ) });
        }
        
    }

  
  
    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value.trim() });
    }

    onChange2 = (e) => {
        this.setState({ [e.target.name]: e.target.value });
        var data = e.target.value;

        this.setState({lastTradedData : {}, buyAtPending: "", sellAtPending: "", pattenNamePending: "",searchSymbolPending : ""}); 

        


        AdminService.autoCompleteSearch(data).then(res => {
            let data = res.data;
            console.log(data);
            localStorage.setItem('autoSearchTemp', JSON.stringify(data));
            this.setState({ autoSearchList: data });

          
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
            this.setState({searchSymbolPending : fdata.symbol,searchTokenPending :fdata.token, exch_seg: fdata.exch_seg }, function(){
                this.getTradePrice(); 
            }); 

        }

    }


    render(){
        
      return(
        <React.Fragment>


            {window.location.hash == "#/order-watchlist" ? <PostLoginNavBar/> : ""}

             <Paper style={{ overflow: "auto", padding: '5px' }} >

                <Grid justify="space-between"
                    container>
                    <Grid item  >
                     
                    <Typography component="h2" variant="h6" color="primary" gutterBottom>
                      Orders Watchlist ({this.state.orderPenidngList && this.state.orderPenidngList.length}) 
                    
                      {window.location.hash != "#/order-watchlist" ? <Button onClick={() => this.openNewPage()}> New Page <OpenInNewIcon/> </Button> : ""}

                      {window.location.hash != "#/position" ?<Button onClick={() => this.backToPositionPage()}> Back to Position </Button> : ""}


                    </Typography> 


                       

                    </Grid>
                    <Grid item  >

                        <Grid justify="space-between" container spacing={2}>


                            <Grid item  >
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
                              {this.state.lastTradedData.symbol}  Ltp: <b style={{ color:this.state.lastTradedData.perChange == 0 ? "none" : this.state.lastTradedData.perChange > 0 ? "green" : "red"}}> {this.state.lastTradedData.ltp} {this.state.lastTradedData.ltp ? "("+this.state.lastTradedData.perChange+")"  : ""}</b> 
                            </Grid>
                            <Grid item  >
                                <TextField label="BuyAt(limit)" type="number" name="buyAtPending" value={this.state.buyAtPending} onChange={this.updateInput} />
                              <br /> High: {this.state.lastTradedData.high}
                            </Grid>
                            <Grid item  >
                                <TextField label="SellAt(limit)" type="number" name="sellAtPending" value={this.state.sellAtPending} onChange={this.updateInput} />
                                <br /> Low: {this.state.lastTradedData.low}
                            </Grid>
                            <Grid item  >
                                <TextField label="Which Pattern" name="pattenNamePending" value={this.state.pattenNamePending} onChange={this.updateInput} />
                                <br /> Open: {this.state.lastTradedData.open}
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

                                <TableCell className="TableHeadFormat" align="left">CreatetAt</TableCell>
                                <TableCell className="TableHeadFormat" align="left">Symbol</TableCell>
                                <TableCell className="TableHeadFormat" align="left">Exch_seg</TableCell>
                                <TableCell className="TableHeadFormat" align="left">Token</TableCell>
                                <TableCell className="TableHeadFormat" align="left">Patten Name</TableCell>
                                <TableCell className="TableHeadFormat" align="left">BuyAt</TableCell>
                                <TableCell className="TableHeadFormat" align="left">SellAt</TableCell>
                                <TableCell className="TableHeadFormat" align="left">LTP</TableCell>
                                <TableCell className="TableHeadFormat" align="left">Delete</TableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody id="tableAdd" style={{ width: "", whiteSpace: "nowrap" }}>

                            {this.state.orderPenidngList ? this.state.orderPenidngList.map(row => (
                                 <TableRow hover >
                                    <TableCell align="left">{row.createdAt}</TableCell>
                                    <TableCell align="left">{row.symbol}</TableCell>

                                    <TableCell align="left">{row.exch_seg}</TableCell>
                                    <TableCell align="left">{row.token}</TableCell>

                                    <TableCell align="left">{row.pattenName}</TableCell>
                                    <TableCell align="left">{row.buyAt}</TableCell>
                                    <TableCell align="left">{row.sellAt}</TableCell>
                                    <TableCell align="left" style={{color: row.perChange == 0.00 ? "none" :  row.perChange > 0 ? "green" :"red"}}><b>{row.ltp} ({row.perChange}%) </b></TableCell>

                                    <TableCell align="left">
                                     <DeleteIcon style={{cursor:"pointer"}} onClick={() => this.deleteInOrderPenidngList(row)} />
                                    </TableCell>

                                </TableRow>
                            )) : ''}
                        </TableBody>
                    </Table>


                </Grid>


                </Paper>


         

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