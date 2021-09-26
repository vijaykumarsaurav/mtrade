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
import { connect } from "react-redux";
import { setPackLoaded } from "../../action";
import Spinner from "react-spinner-material";
import * as moment from 'moment';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from "@material-ui/core/Input";
import "./ViewStyle.css";
import PostLoginNavBar from "../PostLoginNavbar";

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

class MyView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            products: [],
            stopnview: '',
            curnewdata: '',
            showOptionUpside: 800, 
            showOptionDownside: 800, 
            timestamp: '',
            totalCOI: 0,
            expiry: '',
            strike: '',
            FilteredBY: '',
            AllspTotalOI: [],
            PEoi: 0,
            CEoi: 0,
            waitForChainFlag:true, 
            scrollcount: 0,
            pcrTableBN: JSON.parse(localStorage.getItem('pcrTableBN')) && JSON.parse(localStorage.getItem('pcrTableBN')).data,
            optionChainDataBN: JSON.parse(localStorage.getItem('optionChainDataBN')),
            filtered: JSON.parse(localStorage.getItem('optionChainDataBN')) && JSON.parse(localStorage.getItem('optionChainDataBN')).filtered && JSON.parse(localStorage.getItem('optionChainDataBN')).filtered.data,
            staticData: localStorage.getItem('staticData') && JSON.parse(localStorage.getItem('staticData')) || {},
            selectedWatchlist: 'Securities in F&O',
            selectOptionStock: "NIFTY",
            underlyingValue: JSON.parse(localStorage.getItem('optionChainDataBN')) && JSON.parse(localStorage.getItem('optionChainDataBN')).records && JSON.parse(localStorage.getItem('optionChainDataBN')).records.underlyingValue,




            //JSON.parse(localStorage.getItem('optionChainDataBN')).records.data



        }
        this.findSupportResistence = this.findSupportResistence.bind(this);

    }

    onChangeSelectSymbol = (e) => {
        this.setState({ [e.target.name]: e.target.value }, function() {
            this.loadPackList();
        });
    }
    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value }, function() {
            this.filterOptionChain(e.target.name, e.target.value);
        });
    }
    
    filterOptionChain = (name, actualValue) => {
        //console.log('filtername', name, actualValue); 
        var filereddata = [];

        var alldata = this.state.optionChainDataBN && this.state.optionChainDataBN.records && this.state.optionChainDataBN.records.data;

        if (name === 'expiry' && actualValue === 'All') {

            filereddata = alldata;
        }

        if (name === 'expiry') {

            for (let index = 0; index < alldata.length; index++) {
                const element = alldata[index];
                if (element.expiryDate === actualValue) {
                    filereddata.push(element);
                }
            }
        }

        if (name === 'strike') {

            for (let index = 0; index < alldata.length; index++) {
                const element = alldata[index];
                if (element.strikePrice === actualValue) {
                    filereddata.push(element);
                }
            }
        }



        this.setState({ filtered: filereddata, FilteredBY: name + " " + actualValue });
        //  console.log(filereddata); 
    }

    // componentWillUnmount() {
    //     var tabledata = document.getElementById('tabledata'); 
    //     tabledata.removeEventListener('scroll', this.handleScroll);

    // }

    handleScroll = (data) => {

        var scrollcount = this.state.scrollcount;

        this.setState({ scrollcount: scrollcount += 1 });

    }

    componentDidMount() {

        this.setState({ SecuritiesInFO: this.state.staticData[this.state.selectedWatchlist] }, function() {
            // this.state.SecuritiesInFO && this.state.SecuritiesInFO.sort(function (a, b) {
            //     if(a.name < b.name) { return -1; }
            //     if(a.name > b.name) { return 1; }
            //     return 0;
            // });
        } );

       
        // var tabledatachart = document.getElementById('tabledatachart'); 
        // tabledatachart.addEventListener('scroll', this.handleScroll);

        //   this.loadPackList();
        //   console.log('this.state.optionChainDataBN.records.expiryDates', this.state.optionChainDataBN.records.expiryDates)


        if (!JSON.parse(localStorage.getItem('cpdataBN')))
            localStorage.setItem('cpdataBN', JSON.stringify({ data: [] }))
        else
            this.setState({ products: JSON.parse(localStorage.getItem('cpdataBN')).data })
        // this.setState({ stopnview:  setInterval( this.loadPackList ,  60001 * 2)});
        //  clearInterval(this.state.stopnview)

        if (!JSON.parse(localStorage.getItem('pcrTableBN')))
            localStorage.setItem('pcrTableBN', JSON.stringify({ data: [] }))
        else
            this.setState({ pcrTableBN: JSON.parse(localStorage.getItem('pcrTableBN')).data })



        var todayTime = new Date();
        if (todayTime.getHours() >= 9 && todayTime.getHours() < 16) {
            setInterval(() => {
                this.loadPackList();
            }, 60000 * 6);
        }
        setInterval(() => {
            this.updatepcr()
        }, 60000 * 6);

        this.findSupportResistence(this.state.optionChainDataBN ? this.state.optionChainDataBN : "");


    }
    // componentDidUpdate(){
    //   //  this.updatepcr(); 
    //    // console.log("updaate called") 
    // }

    getDataforStrike = strikePrice => {

        var alldata = JSON.parse(localStorage.getItem('optionChainDataBN')).records.data;// this.state.optionChainDataBN && this.state.optionChainDataBN.records.data; 
        var sumOfCEoi = 0, sumOfPEoi = 0;
        for (let index = 0; index < alldata.length; index++) {
            const element = alldata[index];

            if (strikePrice === element.strikePrice) {

                if (element.CE && element.CE.openInterest) {
                    sumOfCEoi = sumOfCEoi + element.CE.openInterest;
                }
                if (element.PE && element.PE.openInterest) {
                    sumOfPEoi = sumOfPEoi + element.PE.openInterest;
                }

            }
        }
        // fliterExData.push({strikePrice : strikePrice,  sumOfCEoi : sumOfCEoi});    
        return { strikePrice: strikePrice, sumOfCEoi: sumOfCEoi, sumOfPEoi: sumOfPEoi };

        //  console.log("alldata", alldata);
    }

    findSupportResistence = (optiondata) => {
        // console.log(optiondata);
        var alldata = optiondata && optiondata.records && optiondata.records.data;
        // var underlyingValue = optiondata.records && optiondata.records.underlyingValue; 
        var PEoi = 0, CEoi = 0, PEoiChange = 0, CEoiChange = 0;
        if (alldata) {
            for (let index = 0; index < alldata.length; index++) {
                const element = alldata[index];
                if (element && element.PE) {
                    PEoi = PEoi + element.PE.openInterest;
                    PEoiChange = PEoiChange + element.PE.changeinOpenInterest;
                }
                if (element && element.CE) {
                    CEoi = CEoi + element.CE.openInterest;
                    CEoiChange = CEoiChange + element.CE.changeinOpenInterest;

                }
            }
        }


        //   var allexpiryDates =   optiondata.records.expiryDates; 
        //   var strikePrices =  optiondata.records.strikePrices; 
        //   var fliterExData = [];  

        // for (let index = 0; index < allexpiryDates.length; index++) {
        //     const element = allexpiryDates[index];
        //     for (let indexJ = 0; indexJ < alldata.length; indexJ++) {
        //         if(alldata[indexJ].expiryDate == '22-Apr-2021'){
        //             fliterExData.push(alldata[indexJ]); 
        //         } 
        //     }                  
        // }   

        var myStrike = [];

        let startDiff = this.state.underlyingValue - this.state.showOptionDownside
        let rem = Math.round(startDiff) % 100; 
        let startFrom = Math.round(startDiff) + 100 - rem; 

        let endDiff = this.state.underlyingValue + this.state.showOptionUpside; 
        let rem2 = Math.round(endDiff) % 100; 
        let endTo = Math.round(endDiff) + 100 - rem2; 


        console.log( this.state.underlyingValue , 'start from', startFrom, 'endto', endTo);


        for (let index = startFrom; index <= endTo; index += 100) {
            myStrike.push(index)
        }

        myStrike = myStrike.sort(function (a, b) { return b - a });



        var data = [], totalspeoi = 0, totalsceoi = 0;
        myStrike.forEach(element => {
            var resdata =  this.getDataforStrike(element); 
            totalspeoi = totalspeoi+resdata.sumOfPEoi; 
            totalsceoi = totalsceoi+resdata.sumOfCEoi; 

            data.push(resdata); 

            console.log(element, resdata);


        });
        this.setState({ AllspTotalOI: data, selectedSPpcr: (totalspeoi / totalsceoi).toFixed(3), totalspeoi: totalspeoi, totalsceoi: totalsceoi });

        // for (let index = 0; index < alldata.length; index++) {
        //     const element = alldata[index];

        //     // if(alldata[index].strikePrice ==  14800){
        //     //     fliterExData.push(element); 
        //     // } 
        //     for (let indexJ = 0; indexJ < strikePrices.length; indexJ++) {
        //         if(  alldata[index].strikePrice == strikePrices[indexJ].strikePrice){
        //             fliterExData.push(element); 
        //         }   
        //     }

        // }   

        //            console.log("allfliterExData",fliterExData);


        this.setState({ CEoi: CEoi, PEoi: PEoi, allStrikediff: PEoi - CEoi, CEoiChange: CEoiChange, PEoiChange: PEoiChange, allStrikeChngeDiff: PEoiChange - CEoiChange });
    }





    loadPackList() {

        
        this.setState({waitForChainFlag: false });

        AdminService.getBNcpdata(this.state.selectOptionStock)
            .then((res) => {
                //     let data = resolveResponse(res);

                var data = res.data && res.data;


                localStorage.setItem("optionChainDataBN", JSON.stringify(data));

                this.findSupportResistence(data);

                // console.log("livedata", data.filtered);

                this.setState({ filtered: data.filtered && data.filtered.data, optionChainDataBN: data });

                if (data.filtered) {

                    var diff = data.filtered.PE.totOI - data.filtered.CE.totOI;

                    var newdata = {
                        dateTime: this.dateFormat(new Date()),
                        totCEOI: data.filtered.CE.totOI,
                        totCEVol: data.filtered.CE.totVol,
                        totPEOI: data.filtered.PE.totOI,
                        totPEVol: data.filtered.PE.totVol,
                        diff: diff,
                        totChangeINOICall: parseInt(localStorage.getItem('totCEOIChange')),
                        totChangeINOIPut: parseInt(localStorage.getItem('totPEOIChange')),
                        totChangeINOIDiff: parseInt(localStorage.getItem('totPEOIChange')) - parseInt(localStorage.getItem('totCEOIChange'))

                    }
                    this.setState({ curnewdata: newdata });


                    document.getElementById('title').innerHTML = (diff / 100000).toFixed(2) + '|' + ((localStorage.getItem('totPEOIChange') - localStorage.getItem('totCEOIChange')) / 100000).toFixed(2) + "L " + this.state.selectOptionStock;
                    // createData.push(newdata); 
                    if (JSON.parse(localStorage.getItem('cpdataBN'))) {
                        var oldproducts = JSON.parse(localStorage.getItem('cpdataBN'));
                        // console.log("oldproductsindex0", ); 
                        var lastrow = oldproducts && oldproducts.data[0];


                        // oldproducts.data.forEach((data) => {
                        //     if(data.totCEOI == newdata.totCEOI && data.totCEVol == newdata.totCEVol && data.totPEOI == newdata.totPEOI  && data.totPEVol == newdata.totPEVol ){
                        //         newdata.isDuplicate = true; 
                        //     }else{
                        //         newdata.isDuplicate = false;
                        //     }
                        // });
                        if (lastrow) {
                            newdata.isDuplicate = newdata.diff === lastrow.diff ? true : false
                            newdata.totCEOIChange = (((newdata.totCEOI - lastrow.totCEOI) * 100) / lastrow.totCEOI).toFixed(3);;
                            newdata.totPEOIChange = (((newdata.totPEOI - lastrow.totPEOI) * 100) / lastrow.totPEOI).toFixed(3);;
                            newdata.totDiffChange = (((newdata.diff - lastrow.diff) * 100) / lastrow.diff).toFixed(3);
                        } else {
                            newdata.isDuplicate = false
                            newdata.totCEOIChange = 0;
                            newdata.totPEOIChange = 0;
                            newdata.totDiffChange = 0;
                        }


                        oldproducts.data.unshift(newdata);

                        if (data.records) {
                            oldproducts.timestamp = data.records.timestamp;
                            oldproducts.underlyingValue = data.records.underlyingValue;
                        }

                        oldproducts.data.reverse(); 

                        localStorage.setItem("cpdataBN", JSON.stringify(oldproducts));

                       

                        this.setState({ products: oldproducts.data, underlyingValue: data.records.underlyingValue, timestamp: data.records.timestamp })
                        this.setState({waitForChainFlag: true });

                    }

                    //  console.log("dddd", this.state.curnewdata); 


                }


                this.updatepcr()
                this.setState({ pcrTableBN: JSON.parse(localStorage.getItem('pcrTableBN')) && JSON.parse(localStorage.getItem('pcrTableBN')).data })

            });

    }


    updatepcr() {


        var pcrdata = {
            allPCR: (this.state.PEoi / this.state.CEoi).toFixed(3),
            expiryPCR: localStorage.getItem('thisWeekPCR'),
            selectedSPpcr: this.state.selectedSPpcr,
        }

        if (JSON.parse(localStorage.getItem('pcrTableBN'))) {
            var pcrTableBN = JSON.parse(localStorage.getItem('pcrTableBN'));
            pcrTableBN.data.unshift(pcrdata);
            localStorage.setItem("pcrTableBN", JSON.stringify(pcrTableBN));
        }

        console.log(pcrdata);
        this.setState({ pcrTableBN: pcrTableBN })
    }




    dateFormat(date) {

        return moment(date).format('DD-MM-YYYY h:mm:ss A');
    }



    render() {

        var totCEOI = 0, totCEVol = 0, totCEOIChange = 0, totCEBUY = 0, totCESell = 0;
        var totPEOI = 0, totPEVol = 0, totPEOIChange = 0, totPEBUY = 0, totPESell = 0;

        return (
            <React.Fragment >

                {/* <PostLoginNavBar /> */}
                <Grid direction="row" container className="flexGrow" spacing={1} style={{ paddingLeft: "5px", paddingRight: "5px" }}>


                    <Grid item xs={2} sm={2} >
                        <FormControl style={styles.selectStyle}>
                            <InputLabel id="selectOptionStock">Select Symbol</InputLabel>
                            <Select
                                id="selectOptionStock"
                                name="selectOptionStock"
                                value={this.state.selectOptionStock}
                                onChange={this.onChangeSelectSymbol}
                                input={<Input />}
                                MenuProps={MenuProps}
                            >
                                <MenuItem key={'NIFTY'} value={'NIFTY'} > {'NIFTY'}</MenuItem>
                                <MenuItem key={'BANKNIFTY'} value={'BANKNIFTY'} > {'BANKNIFTY'}</MenuItem>

                                {this.state.SecuritiesInFO && this.state.SecuritiesInFO.length ? this.state.SecuritiesInFO.map((row, index) => (
                                    <MenuItem key={row.name} value={row.name} >
                                        {row.name}
                                    </MenuItem>
                                )) : ""}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={2} sm={2} >
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
                                    <MenuItem key={name + 'key' + index} value={name} >
                                        {name}
                                    </MenuItem>
                                )) : ""}
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
                                )) : ""}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={2} sm={2}>
                       { this.state.waitForChainFlag ? <Button variant="contained" onClick={() => this.loadPackList()}>
                            Refesh
                        </Button> : <Spinner />}
                    </Grid>

                    <Grid item xs={6} sm={4}>

                        <Typography component="h3" variant="h6" color="primary" >
                            {this.state.selectOptionStock} {this.state.underlyingValue} {this.state.timestamp}
                            {/* <b> FilteredBY : {this.state.FilteredBY} </b>  */}
                        </Typography>
                    </Grid>


                </Grid>


                <Grid item xs={12} sm={12}>
                    <Paper style={{ padding: "10px", overflow: "auto" }}>

                        <Grid container spacing={3} direction="row" alignItems="center" container>
                            <Grid item xs={3} sm={3} >
                                <span> <b>Total </b></span> 
                                <span> PE OI: <b> {(this.state.PEoi / 100000).toFixed(3)}L</b></span> 
                                <span> CE OI: <b>{(this.state.CEoi / 100000).toFixed(3)}L</b></span>
                                <span> PE-CE: {
                                    this.state.allStrikediff > 0 ? <b style={{ color: 'green' }}>{((this.state.allStrikediff) / 100000).toFixed(3)}L</b>
                                        : <b style={{ color: 'red' }}>{((this.state.allStrikediff) / 100000).toFixed(3)}L</b>}
                                </span>
                            </Grid>

                            <Grid item xs={3} sm={5} >
                                <span> <b>Total Chng </b></span> 
                                <span> PE OI: <b>{(this.state.PEoiChange / 100000).toFixed(3)}L</b></span>
                                <span> CE OI: <b>{(this.state.CEoiChange / 100000).toFixed(3)}L</b></span>
                                <span> PE-CE: {
                                    this.state.allStrikeChngeDiff > 0 ? <b style={{ color: 'green' }}>{((this.state.allStrikeChngeDiff) / 100000).toFixed(3)}L</b>
                                        : <b style={{ color: 'red' }}> {((this.state.allStrikeChngeDiff) / 100000).toFixed(3)}L</b>}
                                </span>


                            </Grid>

                            <Grid item xs={2} sm={2} >
                            <span>ALL PCR: <b>{(this.state.PEoi / this.state.CEoi).toFixed(3)} </b></span>
                            </Grid>

                            <Grid item xs={2} sm={2} >
                            <span>Expire Week PCR: <b>{localStorage.getItem('thisWeekPCR')} </b></span>

                            </Grid>



                            {/* <Grid item xs={2} sm={2} >
                            <Typography  component="h3" variant="body1" color="primary" style={{justifyContent:'left'}}>
                                <span>14000 to 15250 PCR: <b>{this.state.selectedSPpcr} </b></span>
                            </Typography> 
                        </Grid> */}



                        </Grid>
                    </Paper>
                </Grid>





                <Grid direction="row" container className="flexGrow" spacing={0} style={{ paddingLeft: "5px", paddingRight: "5px" }}>


                    <Grid id="tabledatachart" item xs={3} sm={3} style={{ padding: "2px", overflow: "auto", height: "250px" }}>
                        <Table id="tabledata" stickyHeader aria-label="sticky table" size="small">
                            <TableHead key={2222} variant="head" style={{ width: "", whiteSpace: "nowrap" }}>
                                <TableRow variant="head">
                                    <TableCell align="center"><b>Time</b></TableCell>
                                    <TableCell align="center"><b>VIEW</b></TableCell>
                                    <TableCell align="center"><b>Put-Call(diff)</b></TableCell>
                                    <TableCell align="center"><b>Chng in OI(diff)</b></TableCell>

                                    <TableCell align="center"><b>PUT OI</b></TableCell>
                                    <TableCell align="center"><b>Chng Put OI</b></TableCell>

                                    <TableCell align="center"><b>Call OI</b></TableCell>
                                    <TableCell align="center"><b>Chng Call OI</b></TableCell>

                                    {/* <TableCell align="center"><b>Total PUT Volume</b></TableCell>
                            <TableCell align="center"><b>Total Call Volume</b> </TableCell> */}
                                </TableRow>
                            </TableHead>
                            <TableBody hover style={{ width: "", whiteSpace: "nowrap" }} >



                                {this.state.products ? this.state.products.map(row => (
                                    <TableRow key={row.dateTime} style={{ background: row.isDuplicate ? "lightgray" : "" }}>
                                        <TableCell align="center">{row.dateTime.substring(19, 11)}</TableCell>
                                        <TableCell align="center">{row.diff > 0 ? <Typography variant='body2' style={{ color: 'green' }} >BUY</Typography> : <Typography variant="body2" style={{ color: 'red' }} >SELL</Typography>}</TableCell>
                                        <TableCell align="center">{row.diff} ({(row.diff / 100000).toFixed(2)}L)({row.totDiffChange > 0 ? <span style={{ color: 'green', fontWeight: 'bold' }} >{row.totDiffChange}%</span> : row.totDiffChange == '0.000' ? <span>{row.totDiffChange}%</span> : <span style={{ color: 'red', fontWeight: 'bold' }} >{row.totDiffChange}%</span>}) </TableCell>
                                        <TableCell align="center">{row.totChangeINOIDiff} ({(row.totChangeINOIDiff / 100000).toFixed(2)}L)</TableCell>

                                        <TableCell align="center">{row.totPEOI} ({row.totPEOIChange > 0 ? <span style={{ color: 'green', fontWeight: 'bold' }} >{row.totPEOIChange}%</span> : row.totPEOIChange == '0.000' ? <span>{row.totPEOIChange}%</span> : <span style={{ color: 'red', fontWeight: 'bold' }} >{row.totPEOIChange}%</span>})</TableCell>
                                        <TableCell align="center">{row.totChangeINOIPut} </TableCell>

                                        <TableCell align="center">{row.totCEOI} ({row.totCEOIChange > 0 ? <span style={{ color: 'green', fontWeight: 'bold' }} >{row.totCEOIChange}%</span> : row.totCEOIChange == '0.000' ? <span>{row.totCEOIChange}%</span> : <span style={{ color: 'red', fontWeight: 'bold' }} >{row.totCEOIChange}%</span>})</TableCell>

                                        <TableCell align="center">{row.totChangeINOICall}</TableCell>

                                        {/* <TableCell align="center">{row.totPEVol} ({(row.totPEVol/100000).toFixed(2)}L)</TableCell>
                                <TableCell align="center">{row.totCEVol} ({(row.totCEVol/100000).toFixed(2)}L)</TableCell>      */}

                                    </TableRow>
                                )) : <Spinner />}


                            </TableBody>
                        </Table>

                    </Grid>
                    <Grid item xs={4} sm={4} style={{ padding: "2px", overflow: "auto", height: "300px" }}>

                        <Chart diffData={{ data: this.state.products, scrollcount: this.state.scrollcount }} />
                    </Grid>

                    <Grid item xs={3} sm={3} style={{ padding: "2px", overflow: "auto", height: "250px" }}>
                        <Table style={{ borderLeft: 'dashed', borderRight: 'dashed', fontWeight: '500' }} id="tabledata" stickyHeader aria-label="sticky table" id="tabledata" size="small">

                            <TableHead style={{}} variant="head">
                                <TableRow variant="head">

                                    <TableCell align="center"><b>Total CE OI <br />{(this.state.totalsceoi / 100000).toFixed(3)}L</b></TableCell>
                                    <TableCell align="center"><b>Strike Price<br />{this.state.totalspeoi - this.state.totalsceoi}({((this.state.totalspeoi - this.state.totalsceoi) / 100000).toFixed(3)}L) </b> </TableCell>
                                    <TableCell align="center"><b>Total PE OI<br />{(this.state.totalspeoi / 100000).toFixed(3)}L</b></TableCell>

                                </TableRow>
                            </TableHead>
                            <TableBody>

                                {this.state.AllspTotalOI ? this.state.AllspTotalOI.map(row => (
                                    <TableRow hover key={row.dateTime} >
                                        <TableCell align="center" style={{ backgroundColor: row.strikePrice < this.state.underlyingValue ? '#ded6a269' : '' }}>{row.sumOfCEoi} ({(row.sumOfCEoi / 100000).toFixed(2)}L)</TableCell>
                                        <TableCell align="center">{row.strikePrice}</TableCell>
                                        <TableCell align="center" style={{ backgroundColor: row.strikePrice > this.state.underlyingValue ? '#ded6a269' : '' }}>{row.sumOfPEoi} ({(row.sumOfPEoi / 100000).toFixed(2)}L)</TableCell>

                                    </TableRow>
                                )) : <Spinner />}



                            </TableBody>
                        </Table>

                    </Grid>

                    <Grid item xs={2} sm={2} style={{ padding: "2px", overflow: "auto", height: "250px" }}>
                        <Table id="tabledata" stickyHeader aria-label="sticky table" id="tabledata" size="small">

                            <TableHead variant="head">
                                <TableRow variant="head">

                                    <TableCell align="center">ALL Pcr</TableCell>
                                    <TableCell align="center">Expiry Pcr </TableCell>
                                    <TableCell align="center">Selected Pcr</TableCell>

                                </TableRow>
                            </TableHead>
                            <TableBody style={{ whiteSpace: "nowrap" }}>

                                {this.state.pcrTableBN && this.state.pcrTableBN.length > 0 && this.state.pcrTableBN ? this.state.pcrTableBN.map(row => (
                                    <TableRow hover key={row.expiryPCR} >
                                        <TableCell align="center">{row.allPCR} </TableCell>
                                        <TableCell align="center">{row.expiryPCR}</TableCell>
                                        <TableCell align="center">{row.selectedSPpcr} </TableCell>
                                    </TableRow>
                                )) : ''}

                            </TableBody>
                        </Table>

                    </Grid>


                    <Grid item xs={12} sm={12} style={{ padding: "2px", overflow: "auto", height: "900px" }}>

                        <Table stickyHeader aria-label="sticky table" id="tabledata" size="small">

                            <TableHead variant="head">

                                <TableRow variant="head"  >

                                    <TableCell colSpan={6} align="center"><b>CALL</b></TableCell>
                                    <TableCell align="center"><b></b></TableCell>
                                    <TableCell align="center"><b></b></TableCell>
                                    <TableCell colSpan={6} align="center"><b>PUT</b></TableCell>
                                </TableRow>
                                <TableRow variant="head" style={{ width: "", whiteSpace: "nowrap" }} >

                                    {/* <TableCell align="center" ><b>Sr No.</b></TableCell>  */}


                                    <TableCell align="center"><b>OI Total OI <br />{localStorage.getItem('totCEOI')}({(localStorage.getItem('totCEOI') / 100000).toFixed(3)}L) </b></TableCell>
                                    <TableCell align="center"><b>Chng in OI <br />{localStorage.getItem('totCEOIChange')}({(localStorage.getItem('totCEOIChange') / 100000).toFixed(3)}L)</b></TableCell>
                                    {/* <TableCell align="center"><b>Volume <br />{localStorage.getItem('totCEVol')}({(localStorage.getItem('totCEVol')/100000).toFixed(3)}L)</b> </TableCell> */}
                                    <TableCell align="center"><b>IV</b></TableCell>
                                    <TableCell align="center"><b>Delta</b></TableCell>

                                    <TableCell align="center"><b>LTP</b></TableCell>
                                    {/* <TableCell align="center"><b>PChange%</b></TableCell> */}
                                    <TableCell align="center"><b>CHNG</b></TableCell>
                                    <TableCell align="center"><b>Buy</b></TableCell>

                                    {/* <TableCell align="center"><b>Bid qty</b></TableCell>
                        <TableCell align="center"><b>Bid Price</b></TableCell>
                        <TableCell align="center"><b>Ask Price</b></TableCell>
                        <TableCell align="center"><b>ASK qty</b></TableCell> */}

                                    {/* <TableCell align="center"><b>Total Buy Qty</b></TableCell>
                        <TableCell align="center"><b>Total Sell Qty</b></TableCell> */}

                                    <TableCell align="center"><span style={{ color: '#3e85c5', fontWeight: 'bold' }}> STRIKE PRICE</span> </TableCell>
                                    <TableCell align="center"><span style={{ color: '#3e85c5', fontWeight: 'bold' }}> Expiry</span> </TableCell>

                                    {/* <TableCell align="center"><b>Total Sell Qty</b></TableCell> 
                        <TableCell align="center"><b>Total Buy Qty</b></TableCell> */}


                                    {/* <TableCell align="center"><b>Bid Qty</b></TableCell>
                        <TableCell align="center"><b>Bid Price</b></TableCell>
                        <TableCell align="center"><b>Ask Price</b></TableCell>
                        <TableCell align="center"><b>Ask Qty</b></TableCell>
                        */}
                                    <TableCell align="center"><b>Buy</b></TableCell>

                                    <TableCell align="center"><b>CHNG</b></TableCell>
                                    {/* <TableCell align="center"><b>PChange%</b></TableCell> */}
                                    <TableCell align="center"><b>LTP</b></TableCell>
                                    <TableCell align="center"><b>IV</b></TableCell>

                                    <TableCell align="center"><b>Delta</b></TableCell>


                                    {/* <TableCell align="center"><b>Volume <br />{localStorage.getItem('totPEVol')}({(localStorage.getItem('totPEVol')/100000).toFixed(3)}L)</b></TableCell> */}
                                    <TableCell align="center"><b>Chng in OI <br />{localStorage.getItem('totPEOIChange')}({(localStorage.getItem('totPEOIChange') / 100000).toFixed(3)}L)</b></TableCell>
                                    <TableCell align="center"><b>OI <br />{localStorage.getItem('totPEOI')}({(localStorage.getItem('totPEOI') / 100000).toFixed(3)}L)</b></TableCell>


                                </TableRow>
                            </TableHead>

                            <TableBody>

                                {this.state.filtered ? this.state.filtered.map((opdata, index) => (
                                    <TableRow hover key={index} style={{ background: opdata.isDuplicate ? "lightgray" : "" }}>

                                        {/* <TableCell style={{whiteSpace: "nowrap"}} align="center">{index+1} </TableCell>*/}
                                        {opdata && opdata.CE && opdata.PE && (opdata.strikePrice >= opdata.CE.underlyingValue - this.state.showOptionUpside && opdata.strikePrice <= opdata.CE.underlyingValue + this.state.showOptionDownside) ? <>
                                           
                                            <TableCell {...totCEOI = totCEOI + opdata.CE.openInterest} style={{ backgroundColor: opdata.strikePrice < opdata.CE.underlyingValue ? '#ded6a269' : '' }} align="center">{opdata.CE.openInterest}</TableCell>
                                            <TableCell {...totCEOIChange = totCEOIChange + opdata.CE.changeinOpenInterest} style={{ backgroundColor: opdata.strikePrice < opdata.CE.underlyingValue ? '#ded6a269' : '' }} align="center">{opdata.CE.changeinOpenInterest}</TableCell>
                                            {/* <TableCell {...totCEVol = totCEVol + opdata.CE.totalTradedVolume} style={{backgroundColor: opdata.strikePrice < opdata.CE.underlyingValue ? '#ded6a269' : ''}} align="center">{opdata.CE.totalTradedVolume} </TableCell> */}
                                            <TableCell align="center">{opdata.CE.impliedVolatility} </TableCell>
                                            <TableCell align="center">{(opdata.CE.change / (opdata.strikePrice - opdata.CE.underlyingValue)).toFixed(2)} </TableCell>



                                            <TableCell style={{ backgroundColor: opdata.strikePrice < opdata.CE.underlyingValue ? '#ded6a269' : '' }} align="center"><span style={{ color: '#3e85c5', fontWeight: 'bold' }}> {opdata.CE.lastPrice}</span>({opdata.CE.pChange > 0 ? <span style={{ color: 'green', fontWeight: 'bold' }} >{opdata.CE.pChange.toFixed(2)}%</span> : opdata.CE.pChange == 0 ? <span>{opdata.CE.pChange.toFixed(2)}%</span> : <span style={{ color: 'red', fontWeight: 'bold' }} >{opdata.CE.pChange.toFixed(2)}%</span>}) </TableCell>
                                            {/* <TableCell style={{backgroundColor: opdata.strikePrice < opdata.CE.underlyingValue ? '#ded6a269' : ''}} align="center">{opdata.CE.pChange > 0 ?  <span style={{ color:'green', fontWeight:'bold' }} >{opdata.CE.pChange.toFixed(2)}%</span>: opdata.CE.pChange == 0 ? <span>{opdata.CE.pChange.toFixed(2)}%</span> : <span style={{ color:'red',fontWeight:'bold'}} >{opdata.CE.pChange.toFixed(2)}%</span> } </TableCell> */}
                                            <TableCell style={{ backgroundColor: opdata.strikePrice < opdata.CE.underlyingValue ? '#ded6a269' : '' }} align="center">{opdata.CE.change.toFixed(2)} </TableCell>
                                            <TableCell align="center">  <Button  size={"small"}  variant="contained" onClick={() => this.props.buyOption("CE",this.state.selectOptionStock, opdata.strikePrice, opdata.expiryDate)}> Call Buy </Button> </TableCell>

                                            {/* <TableCell align="center">{opdata.CE.bidQty} </TableCell>
                                            <TableCell align="center">{opdata.CE.bidprice} </TableCell>
                                            <TableCell align="center">{opdata.CE.askPrice} </TableCell>
                                            <TableCell align="center">{opdata.CE.askQty} </TableCell> */}

                                            {/* <TableCell {...totCEBUY = totCEBUY + opdata.CE.totalBuyQuantity}  style={{backgroundColor: opdata.strikePrice < opdata.CE.underlyingValue ? '#ded6a269' : ''}} title={'Total CALL Buy Qty'} align="center">{opdata.CE.totalBuyQuantity}({(opdata.CE.totalBuyQuantity/100000).toFixed(3)}L) </TableCell>
                                            <TableCell {...totCESell = totCESell + opdata.CE.totalSellQuantity} style={{backgroundColor: opdata.strikePrice < opdata.CE.underlyingValue ? '#ded6a269' : ''}} title={'Total CALL Sell Qty'} align="center">{opdata.CE.totalSellQuantity}({(opdata.CE.totalSellQuantity/100000).toFixed(3)}L) </TableCell>
                                         */}
                                            <TableCell style={{ borderLeft: 'dashed', borderRight: 'dashed', fontWeight: '500' }} align="center"><span> <a href="#" style={{ textDecoration: 'none' }} onClick={() => this.filterOptionChain('strike', opdata.strikePrice)}> {opdata.strikePrice}</a> </span> </TableCell>
                                            <TableCell style={{ borderRight: 'dashed', whiteSpace: "nowrap" }} align="center" ><span style={{ paddingLeft: '5px', paddingRight: '5px' }}> <a href="#" style={{ textDecoration: 'none' }} onClick={() => this.filterOptionChain('expiry', opdata.expiryDate)}> {opdata.expiryDate}</a></span> </TableCell>

                                            <TableCell align="center">  <Button size={"small"} variant="contained" onClick={() =>  this.props.buyOption("PE",this.state.selectOptionStock, opdata.strikePrice,opdata.expiryDate)}>Put Buy </Button> </TableCell>

                                            {/* <TableCell {...totPESell = totPESell + opdata.PE.totalSellQuantity} style={{backgroundColor: opdata.strikePrice > opdata.CE.underlyingValue ? '#ded6a269' : ''}} title={'Total PUT Sell Qty'} align="center">{opdata.PE.totalSellQuantity}({(opdata.PE.totalSellQuantity/100000).toFixed(3)}L) </TableCell>
                                            <TableCell {...totPEBUY = totPEBUY + opdata.PE.totalBuyQuantity} style={{backgroundColor: opdata.strikePrice > opdata.CE.underlyingValue ? '#ded6a269' : ''}} title={'Total PUT Buy Qty'} align="center">{opdata.PE.totalBuyQuantity}({(opdata.PE.totalBuyQuantity/100000).toFixed(3)}L)</TableCell>
                                         */}
                                            {/* <TableCell align="center">{opdata.PE.bidQty} </TableCell>
                                            <TableCell align="center">{opdata.PE.bidprice} </TableCell>
                                            <TableCell align="center">{opdata.PE.askPrice} </TableCell>
                                            <TableCell align="center">{opdata.PE.askQty} </TableCell>
                                            */}
                                            <TableCell style={{ backgroundColor: opdata.strikePrice > opdata.CE.underlyingValue ? '#ded6a269' : '' }} align="center">{opdata.PE.change.toFixed(2)} </TableCell>
                                            {/* <TableCell style={{backgroundColor: opdata.strikePrice > opdata.CE.underlyingValue ? '#ded6a269' : ''}} align="center">{opdata.PE.pChange > 0 ?  <span style={{ color:'green', fontWeight:'bold' }} >{opdata.PE.pChange.toFixed(2)}%</span>: opdata.PE.pChange == 0 ? <span>{opdata.PE.pChange.toFixed(2)}%</span> : <span style={{ color:'red',fontWeight:'bold'}} >{opdata.PE.pChange.toFixed(2)}%</span>} </TableCell> */}
                                            <TableCell style={{ backgroundColor: opdata.strikePrice > opdata.CE.underlyingValue ? '#ded6a269' : '' }} align="center"><span style={{ color: '#3e85c5', fontWeight: 'bold' }}> {opdata.PE.lastPrice}</span>({opdata.PE.pChange > 0 ? <span style={{ color: 'green', fontWeight: 'bold' }} >{opdata.PE.pChange.toFixed(2)}%</span> : opdata.PE.pChange == 0 ? <span>{opdata.PE.pChange.toFixed(2)}%</span> : <span style={{ color: 'red', fontWeight: 'bold' }} >{opdata.PE.pChange.toFixed(2)}%</span>})</TableCell>

                                            <TableCell align="center">{opdata.PE.impliedVolatility} </TableCell>
                                            <TableCell align="center">{(opdata.PE.change / (opdata.strikePrice - opdata.PE.underlyingValue)).toFixed(2)} </TableCell>

                                            {/* <TableCell {...totPEVol = totPEVol + opdata.PE.totalTradedVolume}  style={{backgroundColor: opdata.strikePrice > opdata.CE.underlyingValue ? '#ded6a269' : ''}} align="center">{opdata.PE.totalTradedVolume} </TableCell> */}
                                            <TableCell {...totPEOIChange = totPEOIChange + opdata.PE.changeinOpenInterest} style={{ backgroundColor: opdata.strikePrice > opdata.CE.underlyingValue ? '#ded6a269' : '' }} align="center">{opdata.PE.changeinOpenInterest}</TableCell>
                                            <TableCell {...totPEOI = totPEOI + opdata.PE.openInterest} style={{ backgroundColor: opdata.strikePrice > opdata.CE.underlyingValue ? '#ded6a269' : '' }} align="center">{opdata.PE.openInterest} </TableCell>
                                        </> : ""
                                        }


                                    </TableRow>

                                )) : <Spinner />}


                                <TableRow variant="head">
                                    <TableCell align="center" {...localStorage.setItem('totCEOI', totCEOI)}><b>{totCEOI}<br />({(totCEOI / 100000).toFixed(3)}L)</b></TableCell>
                                    <TableCell align="center" {...localStorage.setItem('totCEOIChange', totCEOIChange)}><b>{totCEOIChange}<br />({(totCEOIChange / 100000).toFixed(3)}L)</b> </TableCell>
                                    <TableCell align="center" {...localStorage.setItem('totCEVol', totCEVol)}><b>{totCEVol}<br />({(totCEVol / 100000).toFixed(3)}L)</b></TableCell>
                                    <TableCell colSpan={3} align="center"></TableCell>
                                    {/* <TableCell align="center"><b>{totCEBUY}<br />({(totCEBUY/100000).toFixed(3)}L)</b></TableCell>
                                <TableCell align="center"><b>{totCESell}<br />({(totCESell/100000).toFixed(3)}L)</b> </TableCell> */}

                                    <TableCell {...localStorage.setItem('thisWeekPCR', (totPEOI / totCEOI).toFixed(3))} align="center" colSpan={2}><b> PCR : {(totPEOI / totCEOI).toFixed(3)}</b></TableCell>


                                    <TableCell colSpan={5} align="center"></TableCell>


                                    {/* <TableCell align="center"><b>{totPESell}<br />({(totPESell/100000).toFixed(3)}L)</b></TableCell>
                                <TableCell align="center"><b>{totPEBUY}<br />({(totPEBUY/100000).toFixed(3)}L)</b></TableCell>
                                */}
                                    {/* <TableCell colSpan={3} align="center"></TableCell> */}
                                    <TableCell align="center" {...localStorage.setItem('totPEVol', totPEVol)}><b>{totPEVol}<br />({(totPEVol / 100000).toFixed(3)}L)</b></TableCell>
                                    <TableCell align="center" {...localStorage.setItem('totPEOIChange', totPEOIChange)}><b>{totPEOIChange}<br />({(totPEOIChange / 100000).toFixed(3)}L)</b> </TableCell>
                                    <TableCell align="center" {...localStorage.setItem('totPEOI', totPEOI)}><b>{totPEOI}<br />({(totPEOI / 100000).toFixed(3)}L)</b> </TableCell>

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
    tableStyle: {
        display: 'flex',
        justifyContent: 'center'
    },
    selectStyle: {
        marginBottom: '0px',
        minWidth: 240,
        maxWidth: 240

    }

}

const mapStateToProps = (state) => {
    return { packs: state.packs.packs.data };
}
export default connect(mapStateToProps, { setPackLoaded })(MyView);
