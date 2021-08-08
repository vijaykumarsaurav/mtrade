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
import TextField from "@material-ui/core/TextField";

import Chart from "./Chart";
import { ContactlessOutlined, Sync } from "@material-ui/icons";

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
            resMessage: [],
            counter:0,
            listCount:0
            
            //JSON.parse(localStorage.getItem('optionChainDataBN')).records.data



        }
//          this.findSupportResistence = this.findSupportResistence.bind(this);
            
    }

    onChange = (e) =>{
      this.setState({[e.target.name]: e.target.value}); 

    }
   
  
  
    componentDidMount() {

        // AdminService.scanStocks().then(fundsRes => {
        //     // console.log('profiledata', profileRes); 
        //      //  let fundsResData = resolveResponse(fundsRes);
        //      //  var fundsResData =  fundsRes && fundsRes.data; 
        //        if(fundsResData.status & fundsResData.message == 'SUCCESS'){
               
        //         this.setState({  fundData :fundsResData.data })
        //        }
        //    })

        var list = localStorage.getItem("watchList") ? JSON.parse(localStorage.getItem("watchList")) : []; 
        this.setState({watchlistCount : list.length})

    }

    readCsv = async() => {

      var list = this.state.addtowatchlist; 

      var parsedList =JSON.parse(list) 
      console.log(parsedList.length);
      
      var newJsonList = []; 

      for (let index = 0; index < parsedList.length; index++) {
        const element = parsedList[index];
        console.log(element);

        AdminService.autoCompleteSearch(element.SYMBOL).then(searchRes => {

          let searchResdata =  searchRes.data; 
          var found = searchResdata.filter(row => row.exch_seg  === "NSE" &&  row.lotsize === "1" && row.name === element.SYMBOL);                                
        
         // && element.LTP >= 200
          if(found.length){ 
            newJsonList.push(found[0]); 
         
            var watchlist = localStorage.getItem("watchList") ? JSON.parse(localStorage.getItem("watchList")) : []; 
              var foundInWatchlist = watchlist.filter(row => row && row.token  === found[0] && found[0].token);                                
              if(!foundInWatchlist.length){
                this.setState({resMessage: [...this.state.resMessage,  index + ". ======================> New Symbol:  "+ element.SYMBOL]})

                this.setState({watchlistCount : watchlist.length, counter:this.state.counter+1})
                watchlist.push(found[0]); 
                localStorage.setItem('watchList', JSON.stringify(watchlist));
                console.log("fdaata");
               
              }else{
                this.setState({watchlistCount : watchlist.length,})
                this.setState({resMessage: [...this.state.resMessage,  index + ". Already in List:  "+ element.SYMBOL]})

              }
            //  console.log(found[0].symbol, "found",found);      
            //  localStorage.setItem('NseStock_' + found[0].symbol, "orderdone");
          }
          if(this.state.resMessage && this.state.resMessage.length){
            this.setState({resMessage: [...this.state.resMessage.reverse()]})

          }
        
       })

       await new Promise(r => setTimeout(r, 500));  
      }

      //"NIFTY PSU BANK".split(' ').join('') // "NIFTYPSUBANK"
      
      var data = {
        listName : parsedList[0].SYMBOL, 
        listItem : newJsonList 
      }
      console.log("newjosnlist:", data);
      AdminService.addIntoStaticData(data).then(res => {
        let resdata = resolveResponse(res,'noPop' );
       // console.log(resdata);
        this.setState({listName: resdata.listName,listCount: resdata.count})
      });
      
    }
    resetCsv=()=>{
      this.setState({addtowatchlist:"",resMessage:""})

    }
   
  


    render(){

      return(
        <React.Fragment>
            
            <PostLoginNavBar />

          
            <Paper style={{padding:"25px" }}>   

            
            <Grid   direction="row" container className="flexGrow" spacing={2}  style={{paddingLeft:"5px",paddingRight:"5px", justifyContent:'center'}}>
              
              
           
              


              

                <Grid item xs={12} sm={8}> 
                <Typography variant="h6">
                   Current Watchlist Count   {this.state.watchlistCount} 

                   &nbsp; &nbsp;   &nbsp; &nbsp;   &nbsp; &nbsp;  
                   <Button  onClick={() => { localStorage.setItem('watchList', []); window.location.reload();}}>Delete All</Button>    

                   <br />
                  </Typography>
                         

                    <TextField variant="outlined" multiline rows={10} fullwidth style={{width:'90%', height: '50%'}}  label="Paste only JSON to add into watchlist"  value={this.state.addtowatchlist}   name="addtowatchlist" onChange={this.onChange}/>
              

                </Grid>

            
                  
                <Grid  item xs={8} sm={8}>

                    <Button variant="contained" color="primary" onClick={() => this.readCsv()}> Add to Watchlist</Button>    &nbsp; &nbsp;
                    <Button variant="contained" color="secondary" onClick={() => this.resetCsv()}>Reset</Button>    
                &nbsp; &nbsp;   <b>Total Added to Watchlist : {this.state.counter}</b>
                &nbsp; &nbsp;   <b> Static Data Update: {this.state.listName}({this.state.listCount})</b>



                   
                    {/* {this.state.notAddedSymbol? "Already in list: " + this.state.notAddedSymbol : "" }
                    {this.state.addedSymbol? "Added: " + this.state.addedSymbol : "" }
                     */}
                       
                </Grid>

                <Grid  item xs={8} sm={8}>
                        {this.state.resMessage ? this.state.resMessage.map(data => (
                         <>  <span> {data} </span>  <br /> </>
                           
                        )) : ''}
   
                </Grid>

               
              
                </Grid>
                   
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
        marginBottom: '0px',
        minWidth: 240,
        maxWidth: 240

    }
  
}

const mapStateToProps=(state)=>{
    return {packs:state.packs.packs.data};
}
export default connect(mapStateToProps,{setPackLoaded})(MyView);
