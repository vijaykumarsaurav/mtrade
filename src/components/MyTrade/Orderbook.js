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
import CreateIcon from '@material-ui/icons/Create';
import PostLoginNavBar from "../PostLoginNavbar";
import {resolveResponse} from "../../utils/ResponseHandler";
import {connect} from "react-redux";
import {setPackLoaded} from "../../action";
import Spinner from "react-spinner-material";
import ActivationService from "../service/ActivationService";

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from "@material-ui/core/Input";
import  {IMAGE_VALIDATION_TOKEN,COOKIE_DOMAIN} from "../../utils/config";
import Dialogbox from "./Dialogbox";

import TextField from "@material-ui/core/TextField";


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

class OrderBook extends React.Component{

    constructor(props) {
        super(props);
        this.addProduct = this.addProduct.bind(this);
        this.editProduct = this.editProduct.bind(this);
        this.convertBool = this.convertBool.bind(this);

        this.state = {
            oderbookData:[{
                
                "variety":'NORMAL',
                "ordertype":'LIMIT',
                "producttype":'INTRADAY',
                "duration":'DAY',
                "price":"194.00",
                "triggerprice":"0",
                "quantity":"1",
                "disclosedquantity":"0",
                "squareoff":"0",
                "stoploss":"0",
                "trailingstoploss":"0",
                "tradingsymbol":"SBIN-EQ",
                "transactiontype":'BUY',
                "exchange":'NSE',
                "symboltoken":null,
                "instrumenttype":"",
                "strikeprice":"-1",
                "optiontype":"",
                "expirydate":"",
                "lotsize":"1",
                "cancelsize":"1",
                "averageprice":"1001",
                "filledshares":"0",
                "unfilledshares":"1",
                "orderid":201020000000080,
                "text":"",
                "status":"cancelled",
                "orderstatus":"cancelled",
                "updatetime":"20-Oct-2020 13:10:59",
                "exchtime":"20-Oct-2020 13:10:59",
                "exchorderupdatetime":"20-Oct-2020 13:10:59",
                "fillid":"",
                "filltime":"",
                "parentorderid":""
                 }],
            listofzones:[],
            selectedZone:[],
            zone:'',
            selectAllzone:'Select All',
            triggerprice :0,
            price:0,
            lotsize:0,
            firstTimeFlag: true

        }
    }

    

    componentDidMount() {
    
        AdminService.retrieveOrderBook()
            .then((res) => {
                let data = resolveResponse(res);
                if(data && data.data){
                    var orderlist = data.data; 
                      orderlist.sort(function(a,b){
                        return new Date(b.updatetime) - new Date(a.updatetime);
                      });

                    this.setState({oderbookData: orderlist});

                    var pendingOrder = orderlist.filter(function(row){
                        return row.status == "trigger pending";
                    }); 
                    this.setState({pendingOrder: pendingOrder});
                    
                  //  console.log(pendingOrder);
                    
                    localStorage.setItem('oderbookData', JSON.stringify( orderlist ));
                }
            });


        // while(1){

        //     if(this.state.pendingOrder && this.state.pendingOrder.length> 0){
        //         setTimeout(() => {
                
        //             var data  = {
        //                 "exchange":"NSE",
        //                 "tradingsymbol":  this.state.pendingOrder[0].tradingsymbol,
        //                 "symboltoken":this.state.pendingOrder[0].symboltoken,
        //             }
        //             AdminService.getLTP(data).then(res => {
        //                 let data = resolveResponse(res, 'noPop');
        //                  var LtpData = data && data.data; 
        //                  this.setState({ InstrumentLTP : LtpData});

        //                 const averageprice =  this.state.pendingOrder[0].averageprice; 
                         
        //                 let changePercentage = (LtpData.ltp - averageprice)*100/averageprice; 
        //                 if(this.state.firstTimeFlag && changePercentage > 0.7){           
        //                     let minprice =  (averageprice * 0.25)/100 + averageprice ; 
        //                     this.modifyOrder(this.state.pendingOrder, minprice);
        //                 }
        //            })
    
        //         }, 1000);
        //     }
        // }

    }

    zoneChange = (e) =>{
        this.setState({[e.target.name]: e.target.value});

        if(e.target.value.includes("Select All")){
            this.setState({selectedZone: this.state.listofzones})
            this.setState({selectAllzone: "Remove All"})
        }
    
        if(e.target.value.includes("Remove All")){
            this.setState({selectedZone: []})
            this.setState({selectAllzone: "Select All"})
        }

    }

   

   
    addProduct=(e)=> {
        console.log(this.props)
        this.props.history.push('/banner-add');
    }

    editProduct(productId) {
        window.localStorage.removeItem("selectedBannerId");
        window.localStorage.setItem("selectedBannerId", productId);
        this.props.history.push('/banner-edit');
    }

    convertBool(flag) {
        return flag ? 'Yes' : 'No';
    }

    dateFormat(date){
        var d = new Date(date);
        var fd = d.toLocaleDateString() + ' ' + d.toTimeString().substring(0, d.toTimeString().indexOf("GMT"));
        return fd;
    }
    modifyOrder = (row, trailingstoploss) => {

        console.log(this.state.triggerprice);

        var data = {
            "variety" :row.variety,  // "STOPLOSS",
            "orderid": row.orderid,
            "ordertype": this.state.price != 0 ? "STOPLOSS_LIMIT" : "STOPLOSS_MARKET",
            "producttype":  row.producttype, //"DELIVERY",
            "duration": row.duration,
            "price":  this.state.price,
            "triggerprice": trailingstoploss || this.state.triggerprice,
            "quantity":this.state.lotsize,
            "tradingsymbol": row.tradingsymbol,
            "symboltoken": row.symboltoken,
            "exchange": row.exchange
            }
        AdminService.modifyOrder(data).then(res => {
            let data = resolveResponse(res);
            console.log(data);   
            if(data.status  && data.message == 'SUCCESS'){
               // localStorage.setItem('ifNotBought' ,  'false')
            }
        })
    }

    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value.trim() });
    }

   
    

    render(){
        
      return(
        <React.Fragment>
            <PostLoginNavBar/>
             <Dialogbox dialogAction = {{onChange : this.onChange}}/>
            <Paper style={{padding:"10px", overflow:"auto"}} >


            <Grid container spacing={1}  direction="row" alignItems="center" container>
                            <Grid item xs={12} sm={6} >
                                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                    Oders Details ({this.state.oderbookData.length})
                                </Typography> 
                            </Grid>
                            
                </Grid>
            

            <Table  size="small"   aria-label="sticky table" >
                <TableHead style={{width:"",whiteSpace: "nowrap"}} variant="head">
                    <TableRow variant="head" >
                        <TableCell align="center"><b>Update time</b></TableCell>

                        <TableCell align="center"><b>OrderId</b></TableCell>
                        <TableCell align="center"><b>Instrument</b></TableCell>
                        <TableCell align="center"><b>Order Type</b></TableCell>
                        <TableCell align="center"><b>CNC/Intraday</b></TableCell>
                        <TableCell align="center"><b>Qty </b></TableCell>
                
                        <TableCell align="center"><b>Average Price</b></TableCell>
                        <TableCell align="center"><b>Status</b></TableCell>
                        
                        <TableCell align="center"><b>Price</b></TableCell>
                        <TableCell align="center"><b>Trigger Price</b></TableCell>

                        <TableCell align="center"><b>LTP</b></TableCell>
                        
                        <TableCell align="center">Update</TableCell>
                   

                    </TableRow>
                </TableHead>
                <TableBody style={{width:"",whiteSpace: "nowrap"}}>
                
                    {this.state.oderbookData && this.state.oderbookData ? this.state.oderbookData.map(row => (
                        <TableRow key={row.productId} >

                            <TableCell align="center">{row.updatetime ? new Date(row.updatetime).toString().substring(0, 25) : ""}</TableCell>

                            <TableCell align="center">{row.orderid  }</TableCell>
                            <TableCell align="center">{row.tradingsymbol}</TableCell>
                            <TableCell align="center">{row.transactiontype}</TableCell>
                           
                            
                            <TableCell align="center">{row.producttype}</TableCell>

                            <TableCell align="center">
                                {row.orderstatus == 'trigger pending' ? 
                                <TextField type="number" style={{textAlign:'center', width:'50px'}} id="lotsize"  value={this.state.lotsize == 0 ? row.lotsize : this.state.lotsize}  name="lotsize" onChange={this.onChange}/>
                                : row.lotsize}
                            </TableCell>

                        
                            <TableCell align="center">{row.averageprice}</TableCell>

                            <TableCell align="center">{row.orderstatus}</TableCell>


                            <TableCell align="center">
                                {row.orderstatus == 'trigger pending' ? 
                                <TextField style={{textAlign:'center', width:'50px'}} id="price"  value={this.state.price == 0 ? row.price : this.state.price}  name="price" onChange={this.onChange}/>
                                : row.price}
                            </TableCell>
                            <TableCell align="center">
                                {row.orderstatus == 'trigger pending' ? 
                                <TextField  type="number" style={{textAlign:'center', width:'50px'}} id="triggerprice"  value={this.state.triggerprice == 0 ? row.triggerprice : this.state.triggerprice}  name="triggerprice" onChange={this.onChange}/>
                                : row.triggerprice}
                            </TableCell>

                            <TableCell align="center">{row.triggerprice}</TableCell>



                            <TableCell align="center">
                                {row.orderstatus == 'trigger pending' ? 
                                <Button  type="number" variant="contained" color="primary" style={{marginLeft: '20px'}} onClick={() => this.modifyOrder(row)}>Update</Button>    
                                : row.triggerprice}
                            </TableCell>
                            
                            
                        </TableRow>
                    )):<Spinner/>}
                </TableBody>
            </Table>

            </Paper>
            </React.Fragment> 
        )
    }
  
}

const styles = {
    tableStyle : {
        display: 'flex',
        justifyContent: 'center'
    },
    selectStyle:{
        // minWidth: '100%',
         marginBottom: '0px',
          minWidth: 300,
          maxWidth: 300,
    }
}

const mapStateToProps=(state)=>{
    return {packs:state.packs.packs.data};
}

//export default connect(mapStateToProps,{setPackLoaded})(OrderBook);
export default OrderBook;