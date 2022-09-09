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
            listCount:0,
            selectedWatchlist: "",    
            addtowatchlist : "",
            getbnlatesttokensflag : true,  
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

        AdminService.getStaticData().then(res => {
          var data = res.data;
          //data = JSON.parse(data);   
          localStorage.setItem('staticData', JSON.stringify(data));

          var totalWatchlist = Object.keys(data);
          this.setState({ totalWatchlist: totalWatchlist });
          localStorage.setItem('totalWatchlist', JSON.stringify(totalWatchlist));

          this.setState({ staticData: data });

          var watchlist = [];
          totalWatchlist.forEach(element => {

              var mylist = data[element];
              mylist.forEach(element2 => {
                  var foundInWatchlist = watchlist.filter(row => row.token === element2.token);
                  if (!foundInWatchlist.length) {
                      watchlist.push(element2);
                  }
              });
          });

          localStorage.setItem('watchList', JSON.stringify(watchlist));

      });



        var list = localStorage.getItem("watchList") ? JSON.parse(localStorage.getItem("watchList")) : []; 
        this.setState({watchlistCount : list.length})

    }

    readCsv = async() => {

      var list = this.state.addtowatchlist; 

      var parsedList =JSON.parse(list) 
      console.log(parsedList.length);
      
      var newJsonList = []; 

      // for (let index = 0; index < parsedList.length; index++) {
      //   const element = parsedList[index];
      //   console.log(element);

      //   AdminService.autoCompleteSearch(element.SYMBOL).then(searchRes => {

      //     let searchResdata =  searchRes.data; 
      //     var found = searchResdata.filter(row => row.exch_seg  === "NSE" &&  row.lotsize === "1" && row.name === element.SYMBOL);                                
        
      //    // && element.LTP >= 200
      //     if(found.length){
      //       newJsonList.push(found[0]); 
         
      //       var watchlist = localStorage.getItem("watchList") ? JSON.parse(localStorage.getItem("watchList")) : []; 
      //         var foundInWatchlist = watchlist.filter(row => row && row.token  === found[0] && found[0].token);                                
      //         if(!foundInWatchlist.length){
      //           this.setState({resMessage: [...this.state.resMessage,  index + ". ======================> New Symbol:  "+ element.SYMBOL]})

      //           this.setState({watchlistCount : watchlist.length, counter:this.state.counter+1})
      //           watchlist.push(found[0]); 
      //           localStorage.setItem('watchList', JSON.stringify(watchlist));
      //           console.log("fdaata");
               
      //         }else{
      //           this.setState({watchlistCount : watchlist.length,})
      //           this.setState({resMessage: [...this.state.resMessage,  index + ". Already in List:  "+ element.SYMBOL]})

      //         }
      //       //  console.log(found[0].symbol, "found",found);      
      //       //  localStorage.setItem('NseStock_' + found[0].symbol, "orderdone");
      //     }
      //     if(this.state.resMessage && this.state.resMessage.length){
      //       this.setState({resMessage: [...this.state.resMessage.reverse()]})
      //     }
        
      //  })

      //  await new Promise(r => setTimeout(r, 500));  
      // }

      //"NIFTY PSU BANK".split(' ').join('') // "NIFTYPSUBANK"
      
      var data = {
        listName : this.state.selectedWatchlist, 
        listItem : parsedList 
      }
      console.log("newjosnlist:", data);
      AdminService.addIntoStaticData(data).then(res => {
        let resdata = resolveResponse(res,'noPop' );
       // console.log(resdata);
        this.setState({listName: resdata.listName,listCount: resdata.count})
      });
      
    }
    resetCsv=()=>{
      this.setState({addtowatchlist:"",resMessage:"", listCount : 0})
    }

    
    onChangeWatchlist = (e) => {
      this.setState({ [e.target.name]: e.target.value }, function () {

        let list = this.state.staticData[e.target.value]; 


        this.setState({addtowatchlist: JSON.stringify(list), listCount: list.length})

      });
  }

    
    getbnlatesttokens = () => {

      this.setState({getbnlatesttokensflag : false})
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
              this.setState({ niftyLtp: { ltp: LtpData.ltp, per : per.toFixed(2)  }}); 

              let lowerLevel = LtpData.ltp - LtpData.ltp * 15/100; 
              let upperLevel = LtpData.ltp + LtpData.ltp * 15/100; 

              let roundLower = lowerLevel - lowerLevel % 100;
              let roundUpper = upperLevel + upperLevel % 100;
              let selectedStrike = [];
              for (let index = roundLower; index <= roundUpper; index+=100) {
                  selectedStrike.push(index)
              }

              AdminService.getBankniftyLatestOption(selectedStrike).then(res => {
                this.setState({getbnlatesttokensflag : true})

                this.setState({addtowatchlist: JSON.stringify(res.data), listCount: res.data.length, selectedWatchlist : "NIFTYBANK_LATEST_OPTIONS"})
              })
            }
        })
  }


 downloadObjectAsJson =(exportObj, exportName) => {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();


    // var zipName = 'download.zip';
    // var dataURL = 'data:application/zip;base64,' + content;
    // chrome.downloads.download({
    //     url:      dataURL,
    //     filename: zipName,
    //     saveAs:   true
    // });
    // count = 0;
  }


downloadMasterTokens =() => {
  let url = 'https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json';

  fetch(url)
  .then(res => res.json())
  .then((out) => {
      this.downloadObjectAsJson(out, 'OpenAPIScripMaster')
    console.log('Checkout this JSON! ', out);
  })
  .catch(err => { throw err });
    
}


    render(){

      return(
        <React.Fragment>
            
            <PostLoginNavBar />

          
          <Paper style={{ padding: "25px" }}>


            <Typography variant="h6">
              Current Watchlist
              {/* &nbsp; &nbsp;   &nbsp; &nbsp;   &nbsp; &nbsp;  
                   <Button  onClick={() => { localStorage.setItem('watchList', []); window.location.reload();}}>Delete All</Button>    
                   <br /> */}
            </Typography>

            <Grid justify="space-between">


              <Grid item>
                <FormControl style={styles.selectStyle} >
                  <InputLabel htmlFor="gender">Select Watchlist</InputLabel>
                  <Select value={this.state.selectedWatchlist} name="selectedWatchlist" onChange={this.onChangeWatchlist}>
                    <MenuItem value={"selectall"}>{"Select All"}</MenuItem>
                    {this.state.totalWatchlist && this.state.totalWatchlist.map(element => (
                      <MenuItem value={element}>{element}</MenuItem>
                    ))
                    }
                  </Select>
                </FormControl>
                &nbsp; &nbsp;

                {/* <Button variant="contained" onClick={() => this.downloadMasterTokens()}>Download master tokens</Button> */}

                <a href="https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json" target="_blank"> Download master tokens </a>
                
                &nbsp; &nbsp;

               
        
                {this.state.getbnlatesttokensflag ?  <Button variant="contained" color="primary" onClick={() => this.getbnlatesttokens()}> get banknifty latest tokens</Button> :<Spinner size="small"/>}

                </Grid>
        

              </Grid>



              <Grid item xs={12} sm={12}>

                    <br />

                <TextField variant="outlined" multiline rows={20} fullwidth style={{ width: '100%', autoflow :true }} label="Paste only JSON to add into watchlist" value={this.state.addtowatchlist} name="addtowatchlist" onChange={this.onChange} />



              </Grid>



              <Grid item xs={8} sm={8}>

                <Button variant="contained" color="primary" onClick={() => this.readCsv()}> Add to Watchlist</Button>    &nbsp; &nbsp;
                <Button variant="contained" color="secondary" onClick={() => this.resetCsv()}>Reset</Button>
                &nbsp; &nbsp;   <b>{this.state.selectedWatchlist} ({this.state.listCount})</b>




                {/* {this.state.notAddedSymbol? "Already in list: " + this.state.notAddedSymbol : "" }
                    {this.state.addedSymbol? "Added: " + this.state.addedSymbol : "" }
                     */}

              </Grid>

              <Grid item xs={8} sm={8}>
                {this.state.resMessage ? this.state.resMessage.map(data => (
                  <>  <span> {data} </span>  <br /> </>

                )) : ''}

              </Grid>


          </Paper>
{/* 
                <Paper style={{padding:"25px" }}>  

                  <TextField variant="outlined" multiline rows={10} fullwidth style={{width:'90%', height: '50%'}}  label="Paste only JSON to add into watchlist"  value={JSON.stringify(this.state.staticData && this.state.staticData.NIFTYBANK_LATEST_OPTIONS)}   name="addtowatchlist" onChange={this.onChange}/>


                </Paper>
                 */}
           
          

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
