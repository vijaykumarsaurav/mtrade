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

class OrderBook extends React.Component{

    constructor(props) {
        super(props);

        this.state = {
            oderbookData:[],
            listofzones:[],
            selectedZone:[],
            zone:'',
            selectAllzone:'Select All',
            triggerprice :0,
            price:0,
            lotsize:0,
            firstTimeFlag: true,
            trackSLPrice: localStorage.getItem('trackSLPrice') && JSON.parse(localStorage.getItem('trackSLPrice')) || [], 
        }
    }

    getTodayOrder = () => {

      //  console.log('this.state.trackSLPrice', this.state.trackSLPrice);

        let trackSLPrice = localStorage.getItem('trackSLPrice') && JSON.parse(localStorage.getItem('trackSLPrice')) || []; 


        AdminService.retrieveOrderBook()
        .then((res) => {
            let data = resolveResponse(res, "noPop");
            if(data && data.data){
                var orderlist = data.data; 
                  orderlist.sort(function(a,b){
                    return new Date(b.updatetime) - new Date(a.updatetime);
                  });

                  
                  orderlist.forEach(element => {
                        let trakingRecord = trackSLPrice.filter((item)=> item.tradingsymbol == element.tradingsymbol); 
                        
                        if(trakingRecord.length > 0 && element.tradingsymbol == trakingRecord[0].tradingsymbol){
                           this.setState({ ['priceTarget_' + element.tradingsymbol] :  trakingRecord[0].priceTarget })  
                           this.setState({ ['priceStopLoss_' + element.tradingsymbol] :  trakingRecord[0].priceStopLoss })  
                        }
                  });
                  

           //     orderlist.sort((a, b) => a.status - b.status); 
                this.setState({oderbookData: orderlist});
                localStorage.setItem('oderbookData', JSON.stringify( orderlist ));

          
            }
        });
    }

    componentDidMount() {
        
        // setInterval(() => {
        //     this.getTodayOrder();
        // }, 10000);
       
        this.getTodayOrder();
    }

   
    cancelOrderOfSame = (orderId,variety) =>  {
       
        var data = {
            "variety":variety,
            "orderid":orderId,
        }
        AdminService.cancelOrder(data).then(res => {
            let data = resolveResponse(res);
            if(data.status  && data.message === 'SUCCESS'){
              //  console.log("cancel order", data);   
                this.getTodayOrder();
               // this.setState({ orderid : data.data && data.data.orderid });
            }
        })
       
    }




    modifyOrder = (row, trailingstoploss) => {


        var data = {
            "variety" :row.variety,  // "STOPLOSS",
            "orderid": row.orderid,
            "ordertype": this.state.price !== 0 ? "STOPLOSS_LIMIT" : "STOPLOSS_MARKET",
            "producttype":  row.producttype, //"DELIVERY",
            "duration": row.duration,
            "price":  this.state.price,
            "triggerprice": trailingstoploss || this.state.triggerprice,
            "quantity":row.quantity,
            "tradingsymbol": row.tradingsymbol,
            "symboltoken": row.symboltoken,
            "exchange": row.exchange
            }
        AdminService.modifyOrder(data).then(res => {
            let data = resolveResponse(res);
           // console.log(data);   
            if(data.status  && data.message === 'SUCCESS'){
               // localStorage.setItem('ifNotBought' ,  'false')
               this.setState({triggerprice : 0}); 
               this.getTodayOrder();
            }
        })
    }

    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value.trim() });
    }

    onChangePriceStopLoss = (e) => {
        this.setState({ [e.target.name]: e.target.value.trim() });
        let tradingsymbol = e.target.name.split('_')[1]; 
        let trackSLPrice = localStorage.getItem('trackSLPrice') && JSON.parse(localStorage.getItem('trackSLPrice')) || []; 
        let isfound = false; 
        for (let index = 0; index < trackSLPrice.length; index++) {
            const element = trackSLPrice[index];
            if(element.tradingsymbol === tradingsymbol){
                element.priceStopLoss = e.target.value.trim(); 
                isfound = true; 
                break;
            }
        }
        if(!isfound){
              trackSLPrice.push({
                priceStopLoss :  e.target.value.trim(), 
                tradingsymbol : tradingsymbol, 
                optiontype : tradingsymbol.substr(tradingsymbol.length-2,tradingsymbol.length-1),
                name : tradingsymbol.includes('BANKNIFTY') ? 'BANKNIFTY' : "NIFTY"
              }); 
        }
        
    //    console.log("slprice tradingsymbol", trackSLPrice , tradingsymbol, isfound)
        localStorage.setItem('trackSLPrice', JSON.stringify(trackSLPrice));
    }

    onChangePriceTarget = (e) => {
        this.setState({ [e.target.name]: e.target.value.trim() });
        let tradingsymbol = e.target.name.split('_')[1]; 
        let trackSLPrice = localStorage.getItem('trackSLPrice') && JSON.parse(localStorage.getItem('trackSLPrice')) || []; 
        let isfound = false; 
        for (let index = 0; index < trackSLPrice.length; index++) {
            const element = trackSLPrice[index];
            if(element.tradingsymbol === tradingsymbol){
                element.priceTarget = e.target.value.trim(); 
                isfound = true; 
                break;
            }
        }
        if(!isfound){
            trackSLPrice.push({
              priceStopLoss :  e.target.value.trim(), 
              tradingsymbol : tradingsymbol, 
              optiontype : tradingsymbol.substr(tradingsymbol.length-2,tradingsymbol.length-1),
              name : tradingsymbol.includes('BANKNIFTY') ? 'BANKNIFTY' : "NIFTY"
 
            }); 
      }
     //   console.log("trarget price update", trackSLPrice)
        localStorage.setItem('trackSLPrice', JSON.stringify(trackSLPrice));
    }


    render(){
     //   console.log(this.state.oderbookData);

      return(
        <React.Fragment>


            {window.location.hash !== "#/position-new" ?    <PostLoginNavBar/> : ""}
            
         


                <Grid spacing={1}  direction="row" alignItems="center" container>
                                <Grid item xs={12} sm={6} >
                                    <Typography color="primary" gutterBottom>
                                         Oders Placed ({this.state.oderbookData.length}) 
                                    </Typography> 
                                </Grid>
                                <Grid item xs={12} sm={6} >
                                    <Button id="orderRefresh"  type="number" variant="contained"  style={{float:"right"}} onClick={() => this.getTodayOrder()}>Refresh</Button>    
                                </Grid>
                                
                </Grid>
                
            <Grid direction="row" alignItems="center" container>
            <Grid item xs={12} sm={12} >

                     <Paper style={{padding:"10px"}} >

                     <Table  size="small"  style={{width:"100%"}}  aria-label="sticky table" >
               
                        <TableHead style={{whiteSpace: "nowrap"}} variant="head">
                            <TableRow variant="head" >
                                <TableCell align="center"><b>Update time</b></TableCell>

                                {/* <TableCell align="center"><b>OrderId</b></TableCell> */}

                                <TableCell align="center"><b>Instrument</b></TableCell>
                                {/* <TableCell align="center"><b>Token</b></TableCell> */}

                                <TableCell align="center"><b>Order Type</b></TableCell>
                                <TableCell align="center"><b>Variety</b></TableCell>

                                

                                <TableCell align="center"><b>Ordertype</b>&nbsp;</TableCell>
                                <TableCell align="center"><b>Qty </b>&nbsp;</TableCell>
                        
                                <TableCell align="center"><b>AvgPrice</b>&nbsp;</TableCell>
                                
                                <TableCell align="center"><b>Price</b>&nbsp;</TableCell>
                                <TableCell align="center"><b>TriggerPrice</b>&nbsp;</TableCell>

                                <TableCell align="center">Action&nbsp;</TableCell>
                                <TableCell align="center"><b>Status</b>&nbsp;</TableCell>
                                {/* <TableCell align="center"><b>SLPrice</b>&nbsp;</TableCell>
                                <TableCell align="center"><b>TargetPrice</b></TableCell> */}

                                <TableCell align="center"><b>Details </b></TableCell>
                

                            </TableRow>
                        </TableHead>
                        <TableBody>
                        
                            {this.state.oderbookData && this.state.oderbookData ? this.state.oderbookData.map((row, i)  => (
                                <TableRow hover key={i} >

                                    <TableCell align="center">{row.updatetime ? new Date(row.updatetime).toString().substring(15, 25) : ""}</TableCell>

                                    {/* <TableCell align="center">{row.orderid  }</TableCell> */}
                                    <TableCell style={{ width: '10%'}}  align="center">{row.tradingsymbol}</TableCell>
                                    {/* <TableCell align="center">{row.symboltoken  }</TableCell> */}

                                    <TableCell align="center">{row.transactiontype}</TableCell>
                                    <TableCell align="center">{row.variety}</TableCell>

                                    <TableCell align="center">{row.producttype}</TableCell>

                                    

                                    <TableCell align="center">
                                        {/* {row.orderstatus === 'trigger pending' ? 
                                        <TextField type="number" style={{textAlign:'center', width:'50px'}} id="lotsize"  value={row.quantity}  name="lotsize" onChange={this.onChange}/>
                                        : row.quantity} */}
                                    {row.quantity}

                                    </TableCell>

                                
                                    <TableCell align="center">{row.averageprice}</TableCell>

                                    <TableCell align="center">
                                        {row.orderstatus === 'trigger pending' ? 
                                        <TextField style={{textAlign:'center', width:'50px'}} id="price"  value={this.state.price === 0 ? row.price : this.state.price}  name="price" onChange={this.onChange}/>
                                        : row.price}
                                    </TableCell>

                                    <TableCell align="center">
                                        {row.orderstatus === 'trigger pending' || row.orderstatus ==='open' ? 
                                        <TextField  type="number" style={{textAlign:'center', width:'50px'}} id="triggerprice"  value={this.state.triggerprice === 0 ? row.triggerprice : this.state.triggerprice}  name="triggerprice" onChange={this.onChange}/>
                                        : row.triggerprice}
                                    </TableCell>


                                    <TableCell align="left">
                                        {row.orderstatus === 'trigger pending' || row.orderstatus ==='open' ? <>
                                        <Button  size={'small'} type="number" variant="contained" color="primary" style={{marginLeft: '20px'}} onClick={() => this.modifyOrder(row)}>Update</Button>    
                                       </>
                                     : ''}
                                    </TableCell>
                                    
                                    <TableCell style={{fontSize: "11px", width: '10%'}} align="center">
                                        {row.orderstatus}
                                        <br />

                                    {row.orderstatus === 'trigger pending' || row.orderstatus ==='open' ? <>
                                    <Button  size={'small'} type="number" variant="contained" color="" style={{marginLeft: '20px'}} onClick={() => this.cancelOrderOfSame(row.orderid, row.variety)}>Cancel</Button>    
                                       </>
                                     : ''}
                                    </TableCell>


                                    {/* <TableCell align="center">
                                        {row.orderstatus === 'trigger pending' || row.orderstatus ==='open' || row.orderstatus ==='complete' ? 
                                         <TextField  type="number" style={{textAlign:'center', width:'50px'}}  value={this.state['priceStopLoss_'+row.tradingsymbol]}  name={'priceStopLoss_'+row.tradingsymbol} onBlur={this.onChangePriceStopLoss}/>
                                                : ''}
                                    </TableCell>

                                    <TableCell align="center">
                                        {row.orderstatus === 'trigger pending' || row.orderstatus ==='open' || row.orderstatus ==='complete'? 
                                        <TextField  type="number" style={{textAlign:'center', width:'50px'}} value={this.state['priceTarget_'+row.tradingsymbol]}  name={'priceTarget_'+row.tradingsymbol}  onBlur={this.onChangePriceTarget}/>
                                        : ''}
                                    </TableCell> */}

                                    <TableCell style={{fontSize: "11px", width:"15%"}} align="center">{row.text}</TableCell>
                                    
                                </TableRow>
                            )):<Spinner/>}
                        </TableBody>
                    </Table>
                    </Paper>    
                </Grid>
                 
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