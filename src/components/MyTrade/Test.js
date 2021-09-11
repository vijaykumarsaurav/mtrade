import React from "react";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import {connect} from "react-redux";
import {setPackLoaded} from "../../action";
import Spinner from "react-spinner-material";
import * as moment from 'moment';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from "@material-ui/core/Input";
import "./ViewStyle.css";
import PostLoginNavBar from "../PostLoginNavbar";
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AdminService from "../service/AdminService";
import {resolveResponse} from "../../utils/ResponseHandler";

import Chart from "./Chart";

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

class MyView extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            products: [],
            stopnview:'', 
            curnewdata:'', 
            underlyingValue : '', 
            timestamp:'',
            totalCOI : 0,
            expiry: '', 
            strike:'',
            FilteredBY: '',
            AllspTotalOI:[],
            PEoi:0,
            CEoi:0,
            scrollcount : 0,
            
            //JSON.parse(localStorage.getItem('optionChainDataBN')).records.data



        }
//          this.findSupportResistence = this.findSupportResistence.bind(this);
            
    }

    onChange = (e) =>{
      this.setState({[e.target.name]: e.target.value}); 
      this.filterOptionChain(e.target.name,  e.target.value); 

    }
   
  
  
    componentDidMount() {

  //     const xhr = new XMLHttpRequest();
  //     xhr.open('HEAD', 'https://chartink.com/');
  //     xhr.setRequestHeader('Access-Control-Allow-Headers', 'x-csrf-token');
   
  //  //   xhr.setRequestHeader('x-csrf-token', 'dWsWEZqGaGd6RfARb33LKjPDdyuGUUrgi8Z4qvsB');
  // //    xhr.setRequestHeader('Content-Type', 'application/xml');
  //     xhr.onreadystatechange = function(err , res){
  //       console.log(err)
  //     };
  //     xhr.send('<person><name>Arun</name></person>');

  //      var data = {
  //       scan_clause: "( {33489} ( latest ema( close,20 ) > 20 and latest sma( volume,20 ) >= 100000 and latest ichimoku conversion line( 3,7,14 ) >= latest ichimoku base line( 3,7,14 ) and latest ichimoku span a( 3,7,14 ) >= latest ichimoku span b( 3,7,14 ) and latest close >= latest ichimoku cloud bottom( 3,7,14 ) and( {33489} ( latest close >= latest parabolic sar( 0.02,0.02,0.2 ) and latest rsi( 10 ) >= 20 and latest stochrsi( 10 ) >= 20 and latest cci( 10 ) >= 0 and latest mfi( 10 ) >= 20 and latest williams %r( 10 ) >= -80 and latest close >= latest ema( close,14 ) and latest adx di positive( 10 ) >= latest adx di negative( 10 ) and latest aroon up( 10 ) >= latest aroon down( 10 ) and latest slow stochastic %k( 5,3 ) >= latest slow stochastic %d( 5,3 ) and latest fast stochastic %k( 5,3 ) >= latest fast stochastic %d( 5,3 ) and latest close >= latest sma( close,10 ) ) ) and( {33489} ( latest macd line( 14,5,3 ) >= latest macd signal( 14,5,3 ) and latest macd histogram( 14,5,3 ) >= 0 ) ) and( {33489} ( latest rsi( 14 ) > 50 and latest stochrsi( 14 ) > 50 and latest rsi( 10 ) < 80 and latest close >= latest upper bollinger band( 20,2 ) and latest close >= latest ichimoku cloud bottom( 9,26,52 ) and latest close > latest open and latest volume > 100000 and latest ema( close,5 ) > latest ema( close,20 ) and latest ema( close,20 ) > latest ema( close,50 ) and latest close > latest ema( close,50 ) ) ) ) )" 
  //      }
  //       AdminService.scanStocks().then(fundsRes => {
  //           // console.log('profiledata', profileRes); 
  //              let fundsResData = resolveResponse(fundsRes);
  //            //  var fundsResData =  fundsRes && fundsRes.data; 
  //              if(fundsResData.status & fundsResData.message == 'SUCCESS'){
               
  //               this.setState({  fundData :fundsResData.data })
  //              }
  //          })

    }
   
  


    render(){

      return(
        <React.Fragment>
            
            <PostLoginNavBar />
       
            <br/><br/><br/>
            
            <Grid   direction="row" container className="flexGrow" spacing={2}  style={{paddingLeft:"5px",paddingRight:"5px", justifyContent:'center'}}>
              
              
              

                <Grid id="tabledatachart"  item xs={8} sm={8}>


                 {/* <iframe id="tradingview_bb48c" src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_bb48c&amp;symbol=BTCUSD&amp;interval=5&amp;hidesidetoolbar=0&amp;symboledit=1&amp;saveimage=1&amp;toolbarbg=f1f3f6&amp;details=1&amp;hotlist=1&amp;studies=%5B%5D&amp;hideideas=1&amp;theme=White&amp;style=1&amp;timezone=Etc%2FUTC&amp;withdateranges=1&amp;studies_overrides=%7B%7D&amp;overrides=%7B%7D&amp;enabled_features=%5B%5D&amp;disabled_features=%5B%5D&amp;locale=en&amp;referral_id=12553&amp;utm_source=www.daytrading.com&amp;utm_medium=widget&amp;utm_campaign=chart&amp;utm_term=BTCUSD" style={{width: '100%', height: '500px', margin: '0 !important', padding: '0 !important'}} frameborder="0" allowtransparency="true" scrolling="no" allowfullscreen=""></iframe> */}

                 <iframe id="tradingview_bb48c" src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_bb48c&amp;symbol=SBIN&amp;interval=D&amp;hidesidetoolbar=0&amp;saveimage=1&amp;toolbarbg=f1f3f6&amp;details=1&amp;hotlist=1&amp;studies=%5B%5D&amp;hideideas=1&amp;theme=White&amp;style=1&amp;timezone=Etc%2FUTC&amp;withdateranges=1&amp;studies_overrides=%7B%7D&amp;overrides=%7B%7D&amp;enabled_features=%5B%5D&amp;disabled_features=%5B%5D&amp;locale=en&amp;referral_id=12553&amp;utm_source=www.daytrading.com&amp;utm_medium=widget&amp;utm_campaign=chart&amp;utm_term=SBIN" style={{width: '50%', height: '200px', margin: '0 !important', padding: '0 !important'}} frameborder="0" allowtransparency="true" scrolling="no" allowfullscreen=""></iframe>


               
              
                </Grid>
            </Grid>
                   

                
           
          

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
        marginBottom: '0px',
        minWidth: 240,
        maxWidth: 240

    }
  
}

const mapStateToProps=(state)=>{
    return {packs:state.packs.packs.data};
}
export default connect(mapStateToProps,{setPackLoaded})(MyView);
