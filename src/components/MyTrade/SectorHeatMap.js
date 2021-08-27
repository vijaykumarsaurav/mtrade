import React from "react";
import AdminService from "../service/AdminService";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";

import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Grid from "@material-ui/core/Grid";
import { connect } from "react-redux";
import { setPackLoaded } from "../../action";
import Spinner from "react-spinner-material";
import * as moment from 'moment';

import "./ViewStyle.css";
import MyDialog from './MyDialog'
import Notify from "../../utils/Notify";
import PostLoginNavBar from "../PostLoginNavbar";
import pako from 'pako';
import { w3cwebsocket } from 'websocket';

const wsClint = new w3cwebsocket('wss://omnefeeds.angelbroking.com/NestHtml5Mobile/socket/stream');


class MyView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            // sectorList: [],
            stopnview: '',
            indexTimeStamp: '',
            sectorList: JSON.parse(localStorage.getItem('sorteIndexList')),
            watchList: localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')) || [],
            staticData : localStorage.getItem('staticData') && JSON.parse(localStorage.getItem('staticData')) || {},
        }

    }

    componentDidMount() {

        this.loadPackList();
        var tokens = JSON.parse(localStorage.getItem("userTokens"));
        var feedToken = tokens && tokens.feedToken;
        var userProfile = JSON.parse(localStorage.getItem("userProfile"));
        var clientcode = userProfile && userProfile.clientcode;
        this.setState({ feedToken: feedToken, clientcode: clientcode });

    
        var beginningTime = moment('9:15am', 'h:mma');
        var endTime = moment('3:30pm', 'h:mma');
        const friday = 5; // for friday
        var currentTime = moment(new Date(), "h:mma");
        const today = moment().isoWeekday();
        //market hours
        if(today <= friday && currentTime.isBetween(beginningTime, endTime)){
      

            wsClint.onopen  = (res) => {
                this.makeConnection();
                this.updateSocketWatch();
           }
   
           wsClint.onmessage = (message) => {
               var decoded = window.atob(message.data);
               var data = this.decodeWebsocketData(pako.inflate(decoded));
               var liveData = JSON.parse(data);
               var sectorList = this.state.sectorList; 
               
               this.state.sectorList && this.state.sectorList.forEach((element, index)  => {

                    element.stockList.forEach((element, stockIndex) => {
                        var foundLive = liveData.filter(row => row.tk == element.token);
                        if(foundLive.length > 0 && foundLive[0].ltp && foundLive[0].nc){
                            sectorList[index].stockList[stockIndex].ltp = foundLive[0].ltp; 
                            sectorList[index].stockList[stockIndex].nc = foundLive[0].nc; 
                            sectorList[index].stockList[stockIndex].cng = foundLive[0].cng; 

                            console.log("foundLive", foundLive);
                        } 
                    }); 
                    sectorList[index].stockList.sort(function (a, b) {
                        return  b.nc - a.nc;
                    });

               });
              
               this.setState({sectorList : sectorList}); 
           }
   
           wsClint.onerror = (e) => {
               console.log("socket error", e);
           }
   
           setInterval(() => {
               this.makeConnection();
               var _req = '{"task":"hb","channel":"","token":"' + feedToken + '","user": "' + clientcode + '","acctid":"' + clientcode + '"}';
               // console.log("Request :- " + _req);
               wsClint.send(_req);
           }, 59000);


        }



    }

    decodeWebsocketData = (array) => {
        var newarray = [];
        try {
            for (var i = 0; i < array.length; i++) {
                newarray.push(String.fromCharCode(array[i]));
            }
        } catch (e) { }

        return newarray.join('');
    }

    makeConnection = () => {

        var firstTime_req = '{"task":"cn","channel":"NONLM","token":"' + this.state.feedToken + '","user": "' + this.state.clientcode + '","acctid":"' + this.state.clientcode + '"}';
        //  console.log("1st Request :- " + firstTime_req);
        wsClint.send(firstTime_req);

        this.updateSocketWatch();

    }

    updateSocketWatch = () => {

        var channel = this.state.sectorList.map(element => {
            element.stockList.map(stock => {
                return 'nse_cm|' + stock.token;
            });
        });

        channel = channel.join('&');
        var updateWatch = {
            "task": "mw",
            "channel": channel,
            "token": this.state.feedToken,
            "user": this.state.clientcode,
            "acctid": this.state.clientcode
        }

        console.log("update watech", updateWatch); 
        wsClint.send(JSON.stringify(updateWatch));
    }


    loadPackList() {


        AdminService.getAllIndices()
            .then((res) => {
                if (res.data) {

                    var data = res.data;

                    this.setState({ indexTimeStamp: data.timestamp })

                    var foundSectors = data.data.filter(row => row.key === "SECTORAL INDICES");
                    var softedData = foundSectors.sort(function (a, b) { return b.percentChange - a.percentChange });
                
                    // this.speckIt("1st sector is " + softedData[0].indexSymbol + ' ' + softedData[0].percentChange + '%');
                    // this.speckIt("2nd sector is " + softedData[1].indexSymbol + ' ' + softedData[1].percentChange + '%');
                    // this.speckIt("3rd sector is " + softedData[2].indexSymbol + ' ' + softedData[2].percentChange + '%');            
                    
                    for (let i = 0; i < softedData.length; i++) {
                        softedData[i].stockList = this.state.staticData[softedData[i].index];
                    }

                    this.setState({ sectorList: softedData });
                    localStorage.setItem('sorteIndexList', JSON.stringify(softedData));

                    // this.getIndicesStocks(softedData[0].indexSymbol,0);
                    // this.getIndicesStocks(softedData[1].indexSymbol,1);
                    // this.getIndicesStocks(softedData[2].indexSymbol,2);


                }

            })
            .catch((reject) => {

                Notify.showError("All Indices API Failed" + <br /> + reject);
                this.speckIt("All Indices API Failed");

            })
    }


    getIndicesStocks = (indexSymbol, index) => {



        AdminService.getIndiceStock(indexSymbol)
            .then((res) => {
                console.log(res.data)

                var resdata = res.data;
                Notify.showSuccess("Success, Top is" + resdata.data[1].symbol);
                this.speckIt("1st top " + indexSymbol + " stock is " + resdata.data[1].symbol.toLocaleLowerCase() + ' high of ' + resdata.data[1].pChange + "%");
                this.speckIt("2nd top " + indexSymbol + " stock is " + resdata.data[2].symbol.toLocaleLowerCase() + ' high of ' + resdata.data[2].pChange + "%");
                this.speckIt("3rd top " + indexSymbol + " stock is " + resdata.data[3].symbol.toLocaleLowerCase() + ' high of ' + resdata.data[3].pChange + "%");


                if (resdata) {
                    localStorage.setItem(indexSymbol, JSON.stringify(resdata));



                    if (document.getElementById('topDate_' + index)) {
                        document.getElementById('topDate_' + index).innerHTML = resdata.timestamp.substring(12, 23);
                    }
                    var percent = 0;

                    if (document.getElementById('top1_' + index)) {
                        percent = resdata.data[1].pChange > 0 ? '<span style="color:green">' + resdata.data[1].pChange + '</span>' : '<span style="color:red">' + resdata.data[1].pChange + '</span>';
                        document.getElementById('top1_' + index).innerHTML = resdata.data[1].symbol + ' ' + resdata.data[1].lastPrice + '(' + percent + ')';
                    }
                    if (document.getElementById('top2_' + index)) {
                        percent = resdata.data[2].pChange > 0 ? '<span style="color:green">' + resdata.data[2].pChange + '</span>' : '<span style="color:red">' + resdata.data[2].pChange + '</span>';
                        document.getElementById('top2_' + index).innerHTML = resdata.data[2].symbol + ' ' + resdata.data[2].lastPrice + '(' + percent + ')';
                    }
                    if (document.getElementById('top3_' + index)) {
                        percent = resdata.data[3].pChange > 0 ? '<span style="color:green">' + resdata.data[3].pChange + '</span>' : '<span style="color:red">' + resdata.data[3].pChange + '</span>';
                        document.getElementById('top3_' + index).innerHTML = resdata.data[3].symbol + ' ' + resdata.data[3].lastPrice + '(' + percent + ')';
                    }
                    if (document.getElementById('top4_' + index)) {
                        percent = resdata.data[4].pChange > 0 ? '<span style="color:green">' + resdata.data[4].pChange + '</span>' : '<span style="color:red">' + resdata.data[4].pChange + '</span>';
                        document.getElementById('top4_' + index).innerHTML = resdata.data[4].symbol + ' ' + resdata.data[4].lastPrice + '(' + percent + ')';
                    }
                    if (document.getElementById('top5_' + index)) {
                        percent = resdata.data[5].pChange > 0 ? '<span style="color:green">' + resdata.data[5].pChange + '</span>' : '<span style="color:red">' + resdata.data[5].pChange + '</span>';
                        document.getElementById('top5_' + index).innerHTML = resdata.data[5].symbol + ' ' + resdata.data[5].lastPrice + '(' + percent + ')';
                    }
                }

            })
            .catch((reject) => {
                Notify.showError(indexSymbol + " Failed" + <br /> + reject);
                this.speckIt(indexSymbol + " API Failed ");
            })

    }

    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    speckIt = (text) => {
        var msg = new SpeechSynthesisUtterance();
        msg.text = text.toString();
        //  window.speechSynthesis.speak(msg);
    }

    
    getPercentageColor = (pct) => {
            var percentColors = [
                { pct: 0.0, color: { r: 0xff, g: 0x00, b: 0 } },
                { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
                { pct: 1.0, color: { r: 0x00, g: 0xff, b: 0 } } ];

        for (var i = 1; i < percentColors.length - 1; i++) {
            if (pct < percentColors[i].pct) {
                break;
            }
        }
        var lower = percentColors[i - 1];
        var upper = percentColors[i];
        var range = upper.pct - lower.pct;
        var rangePct = (pct - lower.pct) / range;
        var pctLower = 1 - rangePct;
        var pctUpper = rangePct;
        var color = {
            r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
            g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
            b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
        };
        return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
        // or output as hex if preferred
    };


    render() {
        console.log("sectorList", this.state.sectorList)


        console.log("staticData", this.state.staticData)

        return (
            <React.Fragment>
                <PostLoginNavBar />





                <Grid direction="row" container className="flexGrow" spacing={2} style={{ paddingLeft: "5px", paddingRight: "5px" }}>
                    <Grid item xs={12} sm={12} >
                        <Typography component="h3" variant="h6" color="primary" >
                            Sectors at {this.state.indexTimeStamp}
                        </Typography>
                    </Grid>



                    {this.state.sectorList ? this.state.sectorList.map((indexdata, index) => (

                      
                        <Grid item xs={12} sm={3}>

                            <Paper style={{ padding: '10px'}}> 

                           
                            <Typography style={{color: this.getPercentageColor(indexdata.percentChange)}}>
                                    {indexdata.index + " " + indexdata.last}({indexdata.percentChange})
                             </Typography>

                            
                            <Grid direction="row" container className="flexGrow" spacing={1} style={{  }}>

                            
                                {indexdata.stockList && indexdata.stockList.map((sectorItem, i) => (
                                        <Paper style={{ padding: '10px', background: this.getPercentageColor(sectorItem.cng)}} > 
                                            <Grid item xs={12} sm={3} >
                                                {sectorItem.name} {sectorItem.ltp}<br/>
                                                {sectorItem.cng}({sectorItem.nc}) 
                                            </Grid>
                                        </Paper>
                                  ))
                                }

                            </Grid>

                            </Paper>
                        </Grid>
                       


                    )) : <Spinner />}

            
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
//         marginBottom: '0px',
//         minWidth: 240,
//         maxWidth: 240

//     }

// }

const mapStateToProps = (state) => {
    return { packs: state.packs.packs.data };
}
export default connect(mapStateToProps, { setPackLoaded })(MyView);
