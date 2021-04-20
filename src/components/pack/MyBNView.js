// import React from "react";
// import AdminService from "../service/AdminService";
// import Typography from "@material-ui/core/Typography";
// import Button from "@material-ui/core/Button";
// import Table from "@material-ui/core/Table";
// import TableHead from "@material-ui/core/TableHead";
// import TableRow from "@material-ui/core/TableRow";
// import TableCell from "@material-ui/core/TableCell";
// import TableBody from "@material-ui/core/TableBody";
// import Grid from "@material-ui/core/Grid";
// import Paper from "@material-ui/core/Paper";
// import PostLoginNavBar from "../PostLoginNavbar";
// import {resolveResponse} from "../../utils/ResponseHandler";
// import {connect} from "react-redux";
// import {setPackLoaded} from "../../action";
// import Spinner from "react-spinner-material";
// import * as moment from 'moment';

// class RechargePack extends React.Component{

//     constructor(props) {
//         super(props);
      
//         this.state = {
//             products: [],

//         }

//     }


//     componentDidMount() {

//      //   this.loadPackList();

//         if(!JSON.parse(localStorage.getItem('cpBNdata')))
//         localStorage.setItem('cpBNdata', JSON.stringify( {data : []}) )
//         else
//         this.setState({products:  JSON.parse(localStorage.getItem('cpBNdata')).data})

//         var todayTime =  new Date(); 
//         if(todayTime.getHours()>=9 && todayTime.getMinutes()>=10 && todayTime.getHours()<15 && todayTime.getMinutes()<35 ){
//                 setInterval(() => {
//                     this.loadPackList();
//                 }, 60001 * 2 );
//         }

//     }

//     loadPackList() {


//         var data = { allPacks:true, portal: true};
//         AdminService.getBNcpBNdata(data)
//             .then((res) => {
//         //     let data = resolveResponse(res);

//              var data =  res.data && res.data;
 
//            // console.log("livedata", data.filtered);

//             if(data.filtered){

//                 var diff =  data.filtered.PE.totOI - data.filtered.CE.totOI; 
                
//                 var rowdata = {
//                     dateTime : this.dateFormat(new Date()), 
//                     totCEOI : data.filtered.CE.totOI ,
//                     totCEVol: data.filtered.CE.totVol, 
//                     totPEOI: data.filtered.PE.totOI , 
//                     totPEVol: data.filtered.PE.totVol, 
//                     diff: diff
//                 } 

//                 var resname = ''; 
//                 if(diff > 0 )
//                  resname = "BUY";
//                  else
//                 resname = "SELL"
                

//                 document.getElementById('title').innerHTML=  (diff/100000).toFixed(2) + "L" +  " BANKNIFTY "; 
//                // createData.push(rowdata); 
//                if(JSON.parse(localStorage.getItem('cpBNdata'))){
//                 var oldproducts = JSON.parse(localStorage.getItem('cpBNdata')); 
//                 oldproducts.data.unshift(rowdata);
//                 localStorage.setItem("cpBNdata",  JSON.stringify( oldproducts) );

//                 this.setState({products: oldproducts.data })
//                }
               
                 
//             }
                
//             });
//     }

  

//     dateFormat(date){ 

//         return moment(date).format('DD-MM-YYYY h:mm:ss A');
//     }
  

//     render(){
     
//       return(
//         <React.Fragment>



//             <Paper style={{padding:"10px", overflow:"auto"}} >
//                 <Grid  container
//                 justify="space-between"
//                 >
//                 <Typography variant="h5" >BANKNIFTY My View({this.state.products && this.state.products.length})</Typography>



//                 <Button variant="contained" color="primary" onClick={() => this.loadPackList()}>
//                     Refesh
//                 </Button>      
//                 </Grid>

//             <Table  size="small"   aria-label="sticky table" >
//                 <TableHead style={{width:"",whiteSpace: "nowrap"}} variant="head">
//                     <TableRow variant="head">
                         
                       
//                         <TableCell align="center"><b>Total Call O</b>I</TableCell>
//                         <TableCell align="center"><b>Total PUT OI</b></TableCell>

//                         <TableCell align="center"><b>Total Call Volume</b> </TableCell>

                      
//                         <TableCell align="center"><b>Total PUT Volume</b></TableCell>

//                         <TableCell align="center"><b>PUT OI-CALL OI(Difference)</b></TableCell>

                       
//                         <TableCell align="center"><b>Time</b></TableCell>
//                         <TableCell align="center"><b>VIEW</b></TableCell>
                        
                      
                      

//                     </TableRow>
//                 </TableHead>
//                 <TableBody style={{width:"",whiteSpace: "nowrap"}}>
                
//                     { this.state.products ? this.state.products.map(row => (
//                         <TableRow key={row.dateTime} >
                          
//                             <TableCell align="center">{row.totCEOI} ({(row.totCEOI/100000).toFixed(2)}L)</TableCell>
//                             <TableCell align="center">{row.totPEOI} ({(row.totPEOI/100000).toFixed(2)}L)</TableCell>
//                             <TableCell align="center">{row.totCEVol} ({(row.totCEVol/100000).toFixed(2)}L)</TableCell>     
//                             <TableCell align="center">{row.totPEVol} ({(row.totPEVol/100000).toFixed(2)}L)</TableCell>
//                             <TableCell align="center">{row.diff} ({(row.diff/100000).toFixed(2)}L) </TableCell>
//                             <TableCell align="center">{row.dateTime}</TableCell>

//                             <TableCell align="center">{row.diff > 0 ? <Typography variant="h6" style={{ color:'green' }} >BUY</Typography>  : <Typography variant="h6" style={{ color:'red' }} >SELL</Typography> }</TableCell>
             
//                         </TableRow>
//                     )):<Spinner/>}
//                 </TableBody>
//             </Table>

//             </Paper>
//             </React.Fragment> 
//         )
//     }

// }

// const styles = {
//     tableStyle : {
//         display: 'flex',
//         justifyContent: 'center'
//     }
// }

// const mapStateToProps=(state)=>{
//     return {packs:state.packs.packs.data};
// }
// export default connect(mapStateToProps,{setPackLoaded})(RechargePack);


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
            optionChainDataBN: JSON.parse( localStorage.getItem('optionChainDataBN')),
            filtered: JSON.parse(localStorage.getItem('optionChainDataBN'))  && JSON.parse(localStorage.getItem('optionChainDataBN')).filtered && JSON.parse(localStorage.getItem('optionChainDataBN')).filtered.data  
            
            //JSON.parse(localStorage.getItem('optionChainDataBN')).records.data



        }
        this.sumOI = this.sumOI.bind(this);
            
    }

    onChange = (e) =>{
      this.setState({[e.target.name]: e.target.value}); 
       this.filterOptionChain(e.target.name,  e.target.value); 

    }
    filterOptionChain = (name, actualValue) =>{
        //console.log('filtername', name, actualValue); 
        var filereddata = []; 
    
       var alldata =  this.state.optionChainDataBN && this.state.optionChainDataBN.records &&  this.state.optionChainDataBN.records.data; 

       if(name == 'expiry' && actualValue == 'All' ) {
            
        filereddata =  alldata; 
       }
     
        if(name == 'expiry') {
            
            for (let index = 0; index < alldata.length; index++) {
                const element = alldata[index];
                if(element.expiryDate == actualValue){
                    filereddata.push(element); 
                } 
            }   
        }

        if(name == 'strike') {
            
            for (let index = 0; index < alldata.length; index++) {
                const element = alldata[index];
                if(element.strikePrice == actualValue){
                    filereddata.push(element); 
                } 
            } 
        }

        

        this.setState({filtered : filereddata, FilteredBY: name +" "+ actualValue});
       //  console.log(filereddata); 
    }

    componentDidMount() {


       this.loadPackList();
   //   console.log('this.state.optionChainDataBN.records.expiryDates', this.state.optionChainDataBN.records.expiryDates)


        if(!JSON.parse(localStorage.getItem('cpBNdata')))
        localStorage.setItem('cpBNdata', JSON.stringify( {data : []}) )
        else
        this.setState({products:  JSON.parse(localStorage.getItem('cpBNdata')).data})
       // this.setState({ stopnview:  setInterval( this.loadPackList ,  60001 * 2)});
       //  clearInterval(this.state.stopnview)

       

       var todayTime =  new Date(); 
       if(todayTime.getHours()>=9 && todayTime.getHours()< 16 ){
            setInterval(() => {
                this.loadPackList();
            }, 60001 * 2);
        }
    }

    sumOI = val => {
        //console.log(val);
        this.setState({totalCOI: this.state.totalCOI + val})
    }


    loadPackList() {

        var data = { allPacks:true, portal: true};
        AdminService.getBNcpdata(data)
            .then((res) => {
        //     let data = resolveResponse(res);

        var data =  res.data && res.data;
            if(data){
                localStorage.setItem("optionChainDataBN",  JSON.stringify( data) );     
                this.setState({filtered : data.filtered && data.filtered.data , optionChainDataBN: data});
            }
           

             
          
            if(data.filtered){

                var diff =  data.filtered.PE.totOI - data.filtered.CE.totOI; 

                var newdata = {
                    dateTime : this.dateFormat(new Date()), 
                    totCEOI : data.filtered.CE.totOI ,
                    totCEVol: data.filtered.CE.totVol, 
                    totPEOI: data.filtered.PE.totOI , 
                    totPEVol: data.filtered.PE.totVol, 
                    diff: diff, 
                } 
                this.setState({curnewdata : newdata });

                var resname = ''; 
                if(diff > 0 )
                 resname = "BUY";
                 else
                resname = "SELL"
                
                document.getElementById('title').innerHTML=  (diff/100000).toFixed(2) + '|' + ((localStorage.getItem('BNtotPEOIChange') - localStorage.getItem('BNtotCEOIChange'))/100000).toFixed(2) + "L" +  " Bank NIFTY "; 

               // document.getElementById('title').innerHTML=  (diff/100000).toFixed(2) + "L" +  " Bank Nifty "; 
               // createData.push(newdata); 
               if(JSON.parse(localStorage.getItem('cpBNdata'))){
                var oldproducts = JSON.parse(localStorage.getItem('cpBNdata')); 
               // console.log("oldproductsindex0", ); 
                var lastrow = oldproducts.data[0]; 
                

                // oldproducts.data.forEach((data) => {
                //     if(data.totCEOI == newdata.totCEOI && data.totCEVol == newdata.totCEVol && data.totPEOI == newdata.totPEOI  && data.totPEVol == newdata.totPEVol ){
                //         newdata.isDuplicate = true; 
                //     }else{
                //         newdata.isDuplicate = false;
                //     }
                // });
                if(lastrow){
                    newdata.isDuplicate = newdata.diff == lastrow.diff ? true : false
                    newdata.totCEOIChange = (((newdata.totCEOI-lastrow.totCEOI) * 100)/lastrow.totCEOI).toFixed(3);;
                    newdata.totPEOIChange =   (((newdata.totPEOI-lastrow.totPEOI) * 100)/lastrow.totPEOI).toFixed(3);;
                    newdata.totDiffChange =  (((newdata.diff-lastrow.diff) * 100)/lastrow.diff).toFixed(3);;
                  
                }
                

                oldproducts.data.unshift(newdata);

                if(data.records){
                    oldproducts.timestamp = data.records.timestamp; 
                    oldproducts.underlyingValue = data.records.underlyingValue; 
                }
              

                localStorage.setItem("cpBNdata",  JSON.stringify( oldproducts) );

                this.setState({products: oldproducts.data, underlyingValue : data.records.underlyingValue,timestamp: data.records.timestamp  })
               }
               
             //  console.log("dddd", this.state.curnewdata); 
   
                 
            }
                
            });
    }

 

    

    dateFormat(date){ 

        return moment(date).format('DD-MM-YYYY h:mm:ss A');
    }
  


    render(){
     
        var totCEOI = 0, totCEVol = 0,totCEOIChange=0, totCEBUY=0, totCESell=0; 
        var totPEOI = 0, totPEVol = 0,totPEOIChange=0, totPEBUY=0, totPESell=0; 

      return(
        <React.Fragment>
            

            

                <Grid item xs={12} sm={12}>
                <Paper style={{padding:"10px", overflow:"auto"}}>
                    <Grid container spacing={3}  direction="row" alignItems="center" container>
                        <Grid item xs={6} sm={6} >
                            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            My View({this.state.products && this.state.products.length}) <b>Bank Nifty: {this.state.underlyingValue}</b> at Time: {this.state.timestamp} 
                            </Typography> 

                           <b> FilteredBY : {this.state.FilteredBY} </b> <br />
                           <span>Total CALL OI Change: <b>{localStorage.getItem('BNtotCEOIChange')} ({(localStorage.getItem('BNtotCEOIChange')/100000).toFixed(3)}L)</b></span><br />
                           <span>Total PUT OI Change : <b>{localStorage.getItem('BNtotPEOIChange')} ({(localStorage.getItem('BNtotPEOIChange')/100000).toFixed(3)}L)</b> </span>
                   
                        </Grid>

                        <Grid item xs={3} sm={3} > 
                            <FormControl style={styles.selectStyle}>
                                    <InputLabel id="expiry">Select Expiry Date</InputLabel>
                                    <Select
                                    id="expiry"
                                    name="expiry"
                                    value={this.state.expiry}
                                    onChange={this.onChange}
                                    input={<Input />}
                                    MenuProps={MenuProps}
                                    >
                                      <MenuItem key={'All'} value={'All'} >
                                            {'All'}
                                        </MenuItem>
                                    {this.state.optionChainDataBN && this.state.optionChainDataBN.records && this.state.optionChainDataBN.records.expiryDates ? this.state.optionChainDataBN.records.expiryDates.map((name, index) => (
                                        <MenuItem key={name+'key'+index} value={name} >
                                            {name}
                                        </MenuItem>
                                    )): ""}
                                    </Select>
                                </FormControl>
                        </Grid>

                        <Grid item xs={2} sm={2} > 
                            <FormControl style={styles.selectStyle}>
                                    <InputLabel id="strike">Select Strick Price</InputLabel>
                                    <Select
                                    labelId="strike"
                                    id="strike"
                                    max-height={'100%'}
                                    name="strike"
                                    value={this.state.strike}
                                    onChange={this.onChange}
                                    input={<Input />}
                                    MenuProps={MenuProps}
                                    >
                                    {this.state.optionChainDataBN && this.state.optionChainDataBN.records && this.state.optionChainDataBN.records.strikePrices ? this.state.optionChainDataBN.records.strikePrices.map(name => (
                                        <MenuItem key={name} value={name} >
                                            {name}
                                        </MenuItem>
                                    )): ""}
                                    </Select>
                                </FormControl>
                        </Grid>
                        <Grid item xs={1} sm={1}>
                        <Button variant="contained" color="primary" onClick={() => this.loadPackList()}>
                            Refesh
                        </Button>      
                        </Grid>
            </Grid>
            </Paper>
            </Grid>


            
            <Grid  direction="row" container className="flexGrow" spacing={1}  style={{paddingLeft:"5px",paddingRight:"5px"}}>
              
              
                <Grid item xs={12} sm={12} style={{padding:"2px", overflow:"auto", height:"250px"}}>
                <Table  id="tabledata" stickyHeader aria-label="sticky table"  id="tabledata" size="small">
                    <TableHead style={{}} variant="head">
                        <TableRow variant="head">
                            <TableCell align="center"><b>Time</b></TableCell>
                            <TableCell align="center"><b>VIEW</b></TableCell>
                            <TableCell align="center"><b>Put-Call(diff)</b></TableCell>
                            <TableCell align="center"><b>Total PUT OI</b></TableCell>
                            <TableCell align="center"><b>Total Call OI</b></TableCell>
                            <TableCell align="center"><b>Total PUT Volume</b></TableCell>
                            <TableCell align="center"><b>Total Call Volume</b> </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody style={{width:"",whiteSpace: "nowrap"}}>
                    
                        { this.state.products ? this.state.products.map(row => (
                            <TableRow key={row.dateTime} style={{background: row.isDuplicate ? "lightgray":""}}>
                                <TableCell align="center">{row.dateTime.substring(22,11)}</TableCell>

                                <TableCell align="center">{row.diff > 0 ? <Typography variant='body2' style={{ color:'green' }} >BUY</Typography>  : <Typography variant="body2" style={{ color:'red' }} >SELL</Typography> }</TableCell>
                                <TableCell align="center">{row.diff} ({(row.diff/100000).toFixed(2)}L)({row.totDiffChange > 0 ?  <span style={{ color:'green', fontWeight:'bold' }} >{row.totDiffChange}%</span>: row.totDiffChange == '0.000' ? <span>{row.totDiffChange}%</span> : <span style={{ color:'red',fontWeight:'bold'}} >{row.totDiffChange}%</span> }) </TableCell>
                                <TableCell align="center">{row.totPEOI} ({(row.totPEOI/100000).toFixed(2)}L)({row.totPEOIChange > 0 ?  <span style={{ color:'green', fontWeight:'bold' }} >{row.totPEOIChange}%</span>: row.totPEOIChange == '0.000' ? <span>{row.totPEOIChange}%</span> : <span style={{ color:'red',fontWeight:'bold'}} >{row.totPEOIChange}%</span> })</TableCell>
                                <TableCell align="center">{row.totCEOI} ({(row.totCEOI/100000).toFixed(2)}L)({row.totCEOIChange > 0 ?  <span style={{ color:'green', fontWeight:'bold' }} >{row.totCEOIChange}%</span>: row.totCEOIChange == '0.000' ? <span>{row.totCEOIChange}%</span> : <span style={{ color:'red',fontWeight:'bold' }} >{row.totCEOIChange}%</span> })</TableCell>
                                <TableCell align="center">{row.totPEVol} ({(row.totPEVol/100000).toFixed(2)}L)</TableCell>
                                <TableCell align="center">{row.totCEVol} ({(row.totCEVol/100000).toFixed(2)}L)</TableCell>     
                
                            </TableRow>
                        )):<Spinner/>}
                    </TableBody>
                </Table>
                </Grid>

        
                <Grid item xs={12} sm={12} style={{padding:"2px", overflow:"auto", height:"900px"}}>

                <Table stickyHeader aria-label="sticky table"  id="tabledata" size="small">

                <TableHead variant="head">

                    <TableRow variant="head"  >
                        
                        <TableCell colSpan={8} align="center"><b>CALL</b></TableCell>
                        <TableCell align="center"><b></b></TableCell>
                        <TableCell align="center"><b></b></TableCell>
                        <TableCell colSpan={8} align="center"><b>PUT</b></TableCell>
                    </TableRow>
                    <TableRow variant="head" >
                    
                        {/* <TableCell align="center" ><b>Sr No.</b></TableCell>  */}
                     

                        <TableCell align="center"><b>OI</b></TableCell>
                        <TableCell align="center"><b>Chng in OI</b></TableCell>
                        <TableCell align="center"><b>Volume</b> </TableCell>
                        {/* <TableCell align="center"><b>IV</b></TableCell> */}
                        <TableCell align="center"><b>LTP</b></TableCell>
                        <TableCell align="center"><b>PChange%</b></TableCell>
                        <TableCell align="center"><b>CHNG</b></TableCell>
                        {/* <TableCell align="center"><b>Bid qty</b></TableCell>
                        <TableCell align="center"><b>Bid Price</b></TableCell>
                        <TableCell align="center"><b>Ask Price</b></TableCell>
                        <TableCell align="center"><b>ASK qty</b></TableCell> */}

                        <TableCell align="center"><b>Total Buy Qty</b></TableCell>
                        <TableCell align="center"><b>Total Sell Qty</b></TableCell>

                        <TableCell align="center"><span style={{color:'#3e85c5', fontWeight:'bold'}}> STRIKE PRICE</span> </TableCell>
                        <TableCell align="center"><span style={{color:'#3e85c5', fontWeight:'bold'}}> Expiry</span> </TableCell>

                        <TableCell align="center"><b>Total Sell Qty</b></TableCell> 
                        <TableCell align="center"><b>Total Buy Qty</b></TableCell>


                        {/* <TableCell align="center"><b>Bid Qty</b></TableCell>
                        <TableCell align="center"><b>Bid Price</b></TableCell>
                        <TableCell align="center"><b>Ask Price</b></TableCell>
                        <TableCell align="center"><b>Ask Qty</b></TableCell>
                        */}
                        <TableCell align="center"><b>CHNG</b></TableCell>
                        <TableCell align="center"><b>PChange%</b></TableCell>
                        <TableCell align="center"><b>LTP</b></TableCell>

                        <TableCell align="center"><b>Volume </b></TableCell>
                        <TableCell align="center"><b>Chng in OI</b></TableCell>
                        <TableCell align="center"><b>OI</b></TableCell>

                        {/* <TableCell align="center"><b>IV</b></TableCell> */}

                    </TableRow>
                </TableHead>                   
                    
                    <TableBody>
                    
                        { this.state.filtered ? this.state.filtered.map((opdata, index) => (
                            <TableRow hover key={index} style={{background: opdata.isDuplicate ? "lightgray":""}}>
                              
                                {/* <TableCell style={{whiteSpace: "nowrap"}} align="center">{index+1} </TableCell>*/}
                                { opdata && opdata.CE && opdata.PE ? <>
                                            <TableCell {...totCEOI = totCEOI +  opdata.CE.openInterest}  style={{backgroundColor: opdata.strikePrice < opdata.CE.underlyingValue ? '#ded6a269' : ''}} align="center">{opdata.CE.openInterest}</TableCell>
                                            <TableCell {...totCEOIChange = totCEOIChange + opdata.CE.changeinOpenInterest}  style={{backgroundColor: opdata.strikePrice < opdata.CE.underlyingValue ? '#ded6a269' : ''}} align="center">{opdata.CE.changeinOpenInterest} ({opdata.CE.pchangeinOpenInterest > 0 ?  <span style={{ color:'green', fontWeight:'bold' }} >{opdata.CE.pchangeinOpenInterest.toFixed(2)}%</span>: opdata.CE.pchangeinOpenInterest == 0 ? <span>{opdata.CE.pchangeinOpenInterest.toFixed(2)}%</span> : <span style={{ color:'red',fontWeight:'bold'}} >{opdata.CE.pchangeinOpenInterest.toFixed(2)}%</span> }) </TableCell>
                                            <TableCell {...totCEVol = totCEVol + opdata.CE.totalTradedVolume} style={{backgroundColor: opdata.strikePrice < opdata.CE.underlyingValue ? '#ded6a269' : ''}} align="center">{opdata.CE.totalTradedVolume} </TableCell>
                                            {/* <TableCell align="center">{opdata.CE.impliedVolatility} </TableCell> */}
                                            <TableCell style={{backgroundColor: opdata.strikePrice < opdata.CE.underlyingValue ? '#ded6a269' : ''}} align="center"><span style={{color:'#3e85c5', fontWeight:'bold'}}> {opdata.CE.lastPrice}</span> </TableCell>
                                            <TableCell style={{backgroundColor: opdata.strikePrice < opdata.CE.underlyingValue ? '#ded6a269' : ''}} align="center">{opdata.CE.pChange > 0 ?  <span style={{ color:'green', fontWeight:'bold' }} >{opdata.CE.pChange.toFixed(2)}%</span>: opdata.CE.pChange == 0 ? <span>{opdata.CE.pChange.toFixed(2)}%</span> : <span style={{ color:'red',fontWeight:'bold'}} >{opdata.CE.pChange.toFixed(2)}%</span> } </TableCell>
                                            <TableCell style={{backgroundColor: opdata.strikePrice < opdata.CE.underlyingValue ? '#ded6a269' : ''}} align="center">{opdata.CE.change.toFixed(2)} </TableCell>
                                        
                                            {/* <TableCell align="center">{opdata.CE.bidQty} </TableCell>
                                            <TableCell align="center">{opdata.CE.bidprice} </TableCell>
                                            <TableCell align="center">{opdata.CE.askPrice} </TableCell>
                                            <TableCell align="center">{opdata.CE.askQty} </TableCell> */}

                                            <TableCell {...totCEBUY = totCEBUY + opdata.CE.totalBuyQuantity}  style={{backgroundColor: opdata.strikePrice < opdata.CE.underlyingValue ? '#ded6a269' : ''}} title={'Total CALL Buy Qty'} align="center">{opdata.CE.totalBuyQuantity}({(opdata.CE.totalBuyQuantity/100000).toFixed(3)}L) </TableCell>
                                            <TableCell {...totCESell = totCESell + opdata.CE.totalSellQuantity} style={{backgroundColor: opdata.strikePrice < opdata.CE.underlyingValue ? '#ded6a269' : ''}} title={'Total CALL Sell Qty'} align="center">{opdata.CE.totalSellQuantity}({(opdata.CE.totalSellQuantity/100000).toFixed(3)}L) </TableCell>
                                        
                                            <TableCell style={{borderLeft: 'dashed',borderRight: 'dashed', fontWeight:'500' }} align="center"><span> <a href="#" style={{textDecoration: 'none'}} onClick={() => this.filterOptionChain('strike', opdata.strikePrice)}> {opdata.strikePrice}</a> </span> </TableCell>
                                            <TableCell style={{borderRight: 'dashed', whiteSpace: "nowrap"}} align="center" ><span style={{paddingLeft:'5px',paddingRight:'5px'  }}> <a href="#" style={{textDecoration: 'none'}} onClick={() => this.filterOptionChain('expiry', opdata.expiryDate)}> {opdata.expiryDate}</a></span> </TableCell>

                                            <TableCell {...totPESell = totPESell + opdata.PE.totalSellQuantity} style={{backgroundColor: opdata.strikePrice > opdata.CE.underlyingValue ? '#ded6a269' : ''}} title={'Total PUT Sell Qty'} align="center">{opdata.PE.totalSellQuantity}({(opdata.PE.totalSellQuantity/100000).toFixed(3)}L) </TableCell>
                                            <TableCell {...totPEBUY = totPEBUY + opdata.PE.totalBuyQuantity} style={{backgroundColor: opdata.strikePrice > opdata.CE.underlyingValue ? '#ded6a269' : ''}} title={'Total PUT Buy Qty'} align="center">{opdata.PE.totalBuyQuantity}({(opdata.PE.totalBuyQuantity/100000).toFixed(3)}L)</TableCell>
                                        
                                            {/* <TableCell align="center">{opdata.PE.bidQty} </TableCell>
                                            <TableCell align="center">{opdata.PE.bidprice} </TableCell>
                                            <TableCell align="center">{opdata.PE.askPrice} </TableCell>
                                            <TableCell align="center">{opdata.PE.askQty} </TableCell>
                                            */}
                                            <TableCell style={{backgroundColor: opdata.strikePrice > opdata.CE.underlyingValue ? '#ded6a269' : ''}} align="center">{opdata.PE.change.toFixed(2)} </TableCell>
                                            <TableCell style={{backgroundColor: opdata.strikePrice > opdata.CE.underlyingValue ? '#ded6a269' : ''}} align="center">{opdata.PE.pChange > 0 ?  <span style={{ color:'green', fontWeight:'bold' }} >{opdata.PE.pChange.toFixed(2)}%</span>: opdata.PE.pChange == 0 ? <span>{opdata.PE.pChange.toFixed(2)}%</span> : <span style={{ color:'red',fontWeight:'bold'}} >{opdata.PE.pChange.toFixed(2)}%</span>} </TableCell>
                                            <TableCell style={{backgroundColor: opdata.strikePrice > opdata.CE.underlyingValue ? '#ded6a269' : ''}} align="center"><span style={{color:'#3e85c5', fontWeight:'bold'}}> {opdata.PE.lastPrice}</span></TableCell>

                                            {/* <TableCell align="center">{opdata.PE.impliedVolatility} </TableCell> */}
                                            <TableCell {...totPEVol = totPEVol + opdata.PE.totalTradedVolume}  style={{backgroundColor: opdata.strikePrice > opdata.CE.underlyingValue ? '#ded6a269' : ''}} align="center">{opdata.PE.totalTradedVolume} </TableCell>
                                            <TableCell {...totPEOIChange = totPEOIChange + opdata.PE.changeinOpenInterest}  style={{backgroundColor: opdata.strikePrice > opdata.CE.underlyingValue ? '#ded6a269' : ''}} align="center">{opdata.PE.changeinOpenInterest} ({opdata.PE.pchangeinOpenInterest > 0 ?  <span style={{ color:'green', fontWeight:'bold' }} >{opdata.PE.pchangeinOpenInterest.toFixed(2)}%</span>: opdata.PE.pchangeinOpenInterest == 0 ? <span>{opdata.PE.pchangeinOpenInterest.toFixed(2)}%</span> : <span style={{ color:'red',fontWeight:'bold'}} >{opdata.PE.pchangeinOpenInterest.toFixed(2)}%</span> }) </TableCell>
                                            <TableCell {...totPEOI = totPEOI + opdata.PE.openInterest} style={{backgroundColor: opdata.strikePrice > opdata.CE.underlyingValue ? '#ded6a269' : ''}}align="center">{opdata.PE.openInterest} </TableCell>
                                     </> : ""
                                }
                               

                            </TableRow>

                        )):<Spinner/>}


                            <TableRow  variant="head"> 
                                <TableCell align="center"><b>{totCEOI}<br />({(totCEOI/100000).toFixed(3)}L)</b></TableCell>
                                <TableCell align="center" {...localStorage.setItem('BNtotCEOIChange',totCEOIChange)} align="center"><b>{totCEOIChange}<br />({(totCEOIChange/100000).toFixed(3)}L)</b> </TableCell>
                                <TableCell align="center"><b>{totCEVol}<br />({(totCEVol/100000).toFixed(3)}L)</b></TableCell>
                                <TableCell colSpan={3} align="center"></TableCell>
                                <TableCell align="center"><b>{totCEBUY}<br />({(totCEBUY/100000).toFixed(3)}L)</b></TableCell>
                                <TableCell align="center"><b>{totCESell}<br />({(totCESell/100000).toFixed(3)}L)</b> </TableCell>

                                <TableCell align="center"></TableCell>
                                <TableCell align="center"></TableCell>
                                <TableCell align="center"><b>{totPESell}<br />({(totPESell/100000).toFixed(3)}L)</b></TableCell>
                                <TableCell align="center"><b>{totPEBUY}<br />({(totPEBUY/100000).toFixed(3)}L)</b></TableCell>
                                <TableCell colSpan={3} align="center"></TableCell>
                                <TableCell align="center"><b>{totPEVol}<br />({(totPEVol/100000).toFixed(3)}L)</b></TableCell>

                                <TableCell align="center"  {...localStorage.setItem('BNtotPEOIChange',totPEOIChange)}><b>{totPEOIChange}<br />({(totPEOIChange/100000).toFixed(3)}L)</b> </TableCell>
                                <TableCell align="center"><b>{totPEOI}<br />({(totPEOI/100000).toFixed(3)}L)</b> </TableCell>

                            </TableRow>


                    </TableBody>


                </Table>
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
        minWidth: 340,
        maxWidth: 340

    }
  
}

const mapStateToProps=(state)=>{
    return {packs:state.packs.packs.data};
}
export default connect(mapStateToProps,{setPackLoaded})(MyView);
