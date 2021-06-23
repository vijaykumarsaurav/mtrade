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

import "./ViewStyle.css";
import MyDialog from './MyDialog'
import Notify from "../../utils/Notify";


class MyView extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
           // products: [],
            stopnview:'', 
            indexTimeStamp:'', 
            products : JSON.parse(localStorage.getItem('sorteIndexList')),
        }
            
    }

    componentDidMount() {
        
         this.loadPackList();
  
         var todayTime =  new Date(); 
         if(todayTime.getHours()>=9 && todayTime.getHours() < 16 ){
              setInterval(() => {
                  this.loadPackList();
              }, 60001 * 2);
          }
      }


      loadPackList() {
        
    
        AdminService.getAllIndices()
            .then((res) => {
                if(res.data){


                    this.setState({indexTimeStamp : res.data.timestamp})
                    var softedData = res.data.data.sort(function(a, b){return b.percentChange - a.percentChange}); 
                    localStorage.setItem('sorteIndexList',  JSON.stringify(softedData));
                    this.setState({products :   softedData});
                    this.speckIt("1st sector is " + softedData[0].indexSymbol +' '+ softedData[0].percentChange +'%' ); 
                    this.speckIt("2nd sector is " +softedData[1].indexSymbol +' '+  softedData[1].percentChange +'%'); 
                    this.speckIt("3rd sector is " +softedData[2].indexSymbol +' '+  softedData[2].percentChange +'%'); 


                    // for (let i = 0; i < softedData.length; i++) {
                    //     // var cancel = setInterval(() => {
                    //     //     this.getIndicesStocks(softedData[i].indexSymbol,i);
                    //     // }, 1000);
                    //     // if(i == softedData.length-1 ){
                    //     //     clearInterval(cancel)
                    //     // }
                    //     this.getIndicesStocks(softedData[i].indexSymbol,i);

                    // }
                    this.getIndicesStocks(softedData[0].indexSymbol,0);
                    this.getIndicesStocks(softedData[1].indexSymbol,1);
                    this.getIndicesStocks(softedData[2].indexSymbol,2);
                  
                   
                }

            })
            .catch((reject) => {

                Notify.showError("All Indices API Failed"+ <br/> + reject);  
                this.speckIt("All Indices API Failed");     
               

            })
    }


    getIndicesStocks = (indexSymbol, index) =>{



        AdminService.getIndiceStock(indexSymbol)
        .then((res) => {
            console.log(res.data)

            var resdata = res.data; 
            Notify.showSuccess("Success, Top is" + resdata.data[1].symbol );  
            this.speckIt("1st top "+indexSymbol+" stock is " + resdata.data[1].symbol.toLocaleLowerCase() + ' high of '+ resdata.data[1].pChange + "%"); 
            this.speckIt("2nd top "+indexSymbol+" stock is " + resdata.data[2].symbol.toLocaleLowerCase()+ ' high of '+ resdata.data[2].pChange + "%"); 
            this.speckIt("3rd top "+indexSymbol+" stock is " + resdata.data[3].symbol.toLocaleLowerCase()+ ' high of '+ resdata.data[3].pChange + "%"); 


            if(resdata){
                localStorage.setItem(indexSymbol, JSON.stringify(resdata)); 
                
                

                if(document.getElementById('topDate_'+index)){
                    document.getElementById('topDate_'+index).innerHTML=resdata.timestamp.substring(12, 23);  
                }

                if(document.getElementById('top1_'+index)){
                    var percent = resdata.data[1].pChange > 0 ? '<span style="color:green">'+ resdata.data[1].pChange + '</span>' : '<span style="color:red">'+ resdata.data[1].pChange + '</span>';
                    document.getElementById('top1_'+index).innerHTML=resdata.data[1].symbol + ' '+resdata.data[1].lastPrice + '(' + percent + ')';  
                }
                if(document.getElementById('top2_'+index)){
                    var percent = resdata.data[2].pChange > 0 ? '<span style="color:green">'+ resdata.data[2].pChange + '</span>' : '<span style="color:red">'+ resdata.data[2].pChange + '</span>';
                    document.getElementById('top2_'+index).innerHTML=resdata.data[2].symbol+ ' '+resdata.data[2].lastPrice  +'(' + percent + ')'; 
                }
                if(document.getElementById('top3_'+index)){
                    var percent = resdata.data[3].pChange > 0 ? '<span style="color:green">'+ resdata.data[3].pChange + '</span>' : '<span style="color:red">'+ resdata.data[3].pChange + '</span>';
                    document.getElementById('top3_'+index).innerHTML=resdata.data[3].symbol+ ' '+resdata.data[3].lastPrice  + '(' + percent + ')'; 
                }
                if(document.getElementById('top4_'+index)){
                    var percent = resdata.data[4].pChange > 0 ? '<span style="color:green">'+ resdata.data[4].pChange + '</span>' : '<span style="color:red">'+ resdata.data[4].pChange + '</span>';
                    document.getElementById('top4_'+index).innerHTML=resdata.data[4].symbol+ ' '+resdata.data[4].lastPrice  +'(' + percent + ')'; 
                }
                if(document.getElementById('top5_'+index)){
                    var percent = resdata.data[5].pChange > 0 ? '<span style="color:green">'+ resdata.data[5].pChange + '</span>' : '<span style="color:red">'+ resdata.data[5].pChange + '</span>';
                    document.getElementById('top5_'+index).innerHTML=resdata.data[5].symbol + ' '+resdata.data[5].lastPrice + '(' + percent + ')'; 
                }   
            }

        })
        .catch((reject) => {
            Notify.showError(indexSymbol + " Failed"+ <br/> + reject);  
            this.speckIt(indexSymbol + " API Failed "  ); 
        })

    }

    onChange = (e) =>{
      this.setState({[e.target.name]: e.target.value}); 
    }
   
    speckIt = (text) => {
        var msg = new SpeechSynthesisUtterance();
        msg.text = text.toString(); 
      //  window.speechSynthesis.speak(msg);
    }

    dateFormat(date){ 
        return moment(date).format('DD-MM-YYYY h:mm:ss A');
    }
    timeFormat(date){ 
        return moment().calendar();   
        //return moment(date).format('hh:mm:ss');

        
    }
  
    render(){
     

      return(
        <React.Fragment>
            
            <Grid  direction="row" container className="flexGrow" spacing={1}  style={{paddingLeft:"5px",paddingRight:"5px"}}>

                 <Grid item xs={7} sm={7}>
                   
                </Grid>

        
                <Grid item xs={12} sm={12} style={{padding:"20px", overflow:"auto", height:"900px"}}>

                <Typography  component="h3" variant="h6" color="primary" >
                        Market - Indices at { this.state.indexTimeStamp }
                    </Typography> 
                <Table stickyHeader aria-label="sticky table"  id="tabledata" size="small">

                <TableRow variant="head" >
                    
                    <TableCell align="left" ><b>Sr.</b></TableCell> 
                    <TableCell align="left" ><b>Index Name</b></TableCell> 
                    <TableCell align="left" ><b>CHNG%</b></TableCell> 
                    <TableCell align="left" title="Advances/Declines/Unchanged"><b>A/D/Un</b></TableCell> 
                    <TableCell align="left" ><b>Refresh</b></TableCell> 
                    <TableCell align="left"><b>TIME</b></TableCell> 
                    <TableCell align="left"><b>Top1</b></TableCell> 
                    <TableCell align="left"><b>Top2</b></TableCell> 
                    <TableCell align="left"><b>Top3</b></TableCell> 
                    <TableCell align="left"><b>Top4</b></TableCell> 
                    <TableCell align="left"><b>Top5</b></TableCell> 
                    


                </TableRow>
                    
                    <TableBody>
                    
                        { this.state.products ? this.state.products.map((idata, index) => (
                            <TableRow hover key={index}>
                              
                              {/* 'SECTORAL INDICES' */}
                                { idata.key != 'vijay' ? <>

                                   <TableCell align="left">{index+1} </TableCell>

                                     <TableCell align="left">   
                                        <MyDialog data={{indexSymbol: idata.indexSymbol + ' @ '+idata.last, indexSymbolData : JSON.parse(localStorage.getItem(idata.indexSymbol)) && JSON.parse(localStorage.getItem(idata.indexSymbol)).data, timestamp : JSON.parse(localStorage.getItem(idata.indexSymbol)) && JSON.parse(localStorage.getItem(idata.indexSymbol)).timestamp}}/>
                                    </TableCell>

                                   
                                    <TableCell align="left"><a href={'https://www.nseindia.com/api/equity-stockIndices?index='+encodeURIComponent(idata.indexSymbol)} target="_blank">  {idata.percentChange > 0 ?  <span style={{ color:'green', fontWeight:'bold' }} >{idata.percentChange}%</span>: idata.percentChange == 0 ? <span>{idata.percentChange}%</span> : <span style={{ color:'red',fontWeight:'bold'}} >{idata.percentChange}%</span>} </a></TableCell>
                                    
                                    <TableCell align="left">  <span style={{ color:'green' }} >{idata.advances}</span> / <span style={{ color:'red' }} >{idata.declines}</span> / {idata.unchanged}</TableCell>
                                
                                    <TableCell align="left"  >
                                        <Button variant="outlined" color="primary" onClick={() => this.getIndicesStocks(idata.indexSymbol, index)}>
                                            Refresh
                                        </Button>

                                    </TableCell> 


                                    

                                     
                                     
                                     <TableCell align="left" id={'topDate_'+index}></TableCell> 
                                    <TableCell align="left" id={'top1_'+index}></TableCell> 
                                    <TableCell align="left" id={'top2_'+index}></TableCell> 
                                    <TableCell align="left" id={'top3_'+index}></TableCell> 
                                    <TableCell align="left" id={'top4_'+index}></TableCell> 
                                    <TableCell align="left" id={'top5_'+index}></TableCell> 
                                    
                                     </> : ""
                                }
                               

                            </TableRow>

                        )):<Spinner/>}





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
        minWidth: 240,
        maxWidth: 240

    }
  
}

const mapStateToProps=(state)=>{
    return {packs:state.packs.packs.data};
}
export default connect(mapStateToProps,{setPackLoaded})(MyView);
