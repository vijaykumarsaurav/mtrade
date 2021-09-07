import React from 'react';
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AdminService from "../service/AdminService";
import Grid from '@material-ui/core/Grid';
import PostLoginNavBar from "../PostLoginNavbar";
import {resolveResponse} from "../../utils/ResponseHandler";
import Paper from '@material-ui/core/Paper';
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import * as moment from 'moment';
import OrderBook from './Orderbook';
import TradeConfig from './TradeConfig.json';
import ChartDialog from './ChartDialog'; 
import ChartMultiple from './ChartMultiple'; 
import RefreshIcon from '@material-ui/icons/Refresh';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import Notify from "../../utils/Notify";
import ShowChartIcon from '@material-ui/icons/ShowChart';


class Home extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            positionList : [],
    
        };
    }


    componentDidMount() {
        var beginningTime = moment('9:15am', 'h:mma');
        var endTime = moment('3:30pm', 'h:mma');
        const friday = 5; // for friday
        var currentTime = moment(new Date(), "h:mma");
        const today = moment().isoWeekday();
        //market hours
        // if(today <= friday && currentTime.isBetween(beginningTime, endTime)){
        //     this.setState({findlast5minMovementInterval :  setInterval(() => {this.findlast5minMovement(); }, 1001)}) 
        // }
    }

    startSearching =()=>{
        this.setState({findlast5minMovementInterval :  setInterval(() => {this.findlast5minMovement(); }, 5000)}) 
    }

    stopSearching =() => {
        clearInterval(this.state.findlast5minMovementInterval); 
    }

    componentWillUnmount() {
        //clearInterval(this.state.positionInterval);
       // clearInterval(this.state.scaninterval);
      //  clearInterval(this.state.bankNiftyInterval); 
    }

  
    findlast5minMovement = async()=> {

        var timediff = moment.duration("00:05:00");
        const format1 = "YYYY-MM-DD HH:mm";       
        var startdate = moment(new Date()).subtract(timediff);
  //      var watchList = this.state.staticData['NIFTY 100'];
        var watchList =  localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList'))
        console.log("watchList NIFTY 100", watchList); 
        var foundData = []; 
        for (let index = 0; index < watchList.length; index++) {
            const element = watchList[index];
            var data  = {
                "exchange": "NSE",
                "symboltoken": element.token,
                "interval": "ONE_MINUTE", //ONE_DAY FIVE_MINUTE    FIFTEEN_MINUTE
                "fromdate": moment(startdate).format(format1) , 
                "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
            }

            AdminService.getHistoryData(data).then(res => {
                let histdata = resolveResponse(res,'noPop' );
                //console.log("candle history", histdata); 
                if(histdata && histdata.data && histdata.data.length){
                   
                    var percentChangeList = []; var foundCount =0; 
                    histdata.data.forEach(element => {
                       var changePer =  (element[4] - element[1])*100/element[1]; 

                       if(changePer >= 0.3 ){
                        foundCount = foundCount +1; 
                         percentChangeList.push(  changePer.toFixed(2) + "% at: " + new Date( element[0]).toLocaleTimeString() )
                       }
                        if(changePer <= -0.3 ){
                            foundCount = foundCount +1; 
                            percentChangeList.push(  changePer.toFixed(2) + "% at: " + new Date( element[0]).toLocaleTimeString() )
                        }
                       
                   });

                   if(percentChangeList.length){
                    foundData.push({symbol:watchList[index].symbol, percentChangeList: percentChangeList.join(" | ")})
                    console.log("foundData", foundData);
                    this.setState({findlast5minMovement : foundData})
                   }
                 

                
                }else{
                    console.log(" candle data emply"); 
                }
            })
            await new Promise(r => setTimeout(r, 350));  
        }


    }




    render() {
      
        //var foundPatternList = localStorage.getItem('foundPatternList') && JSON.parse(localStorage.getItem('foundPatternList')).reverse(); 

        return(
            <React.Fragment>
                 <PostLoginNavBar/>
                     <br />
                     <ChartDialog /> <ChartMultiple />
                
                
                    <Paper style={{overflow:"auto", padding:'5px'}} >

                        <Grid justify="space-between"
                        container>
                                    <Grid item  >
                                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                            Found last 5min Movement ({this.state.findlast5minMovement && this.state.findlast5minMovement.length})  

                                        <span id="stockTesting" style={{fontSize: "18px", color: 'gray'}}> {this.state.findlast5minMovementUpdate} </span>
                                        </Typography> 
                                    </Grid>
                                    <Grid item >
                                            <Button variant="contained"  style={{ marginLeft: '20px' }} onClick={() => this.startSearching()}>Start Searching</Button>
                                    </Grid>
                                    <Grid item >
                                            <Button variant="contained"  style={{ marginLeft: '20px' }} onClick={() => this.stopSearching()}>Stop Searching</Button>
                                    </Grid>
                        </Grid>
                    
                            
                        <Table  size="small"   aria-label="sticky table" >
                            <TableHead  style={{whiteSpace: "nowrap", }} variant="head">
                                <TableRow key="1"  variant="head" style={{fontWeight: 'bold'}}>
    
                                    
                                    <TableCell className="TableHeadFormat" align="left">Symbol</TableCell>                             

                                    <TableCell className="TableHeadFormat"  align="left">Time/PerChnage</TableCell>
    
                                
                                </TableRow>
                            </TableHead>
                            <TableBody style={{width:"",whiteSpace: "nowrap"}}>
    
                                {this.state.findlast5minMovement ? this.state.findlast5minMovement.map(row => (
                                    <TableRow hover key={row.symbol}>
                                        <TableCell align="left">{row.symbol}</TableCell>
                                    <TableCell align="left">{row.percentChangeList}


                                        
                                    </TableCell>
                                    
                                    </TableRow>
                                )):''}
                            </TableBody>
                        </Table>

                        
        
                        </Paper>

            </React.Fragment>
        )


    }


}


// const styles ={
//     footerButton: {
//         position: 'fixed',
//     }
// };

export default Home;