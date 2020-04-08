import React, { useState } from "react";
import AdminService from "../service/AdminService";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import Notify from "../../utils/Notify";
import Input from "@material-ui/core/Input";
import ActivationService from "../service/ActivationService";


import Title from './Title';
import TextField from '@material-ui/core/TextField';

import PostLoginNavBar from "../PostLoginNavbar";
import { resolveResponse } from "../../utils/ResponseHandler";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import MenuItem from "@material-ui/core/MenuItem";
import MaterialUIPickers from "./MaterialUIPickers";

import DoneSharpIcon from '@material-ui/icons/DoneSharp';
 import * as alasql from 'alasql';
 import json2csv from "json2csv";
 import { CSVLink } from "react-csv";


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


 
class Report extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
          //  products: {"status":200,"message":"ok","result":{"data":[{"msisdn":"753651094","simNumber":"00017","customerPoiId":"801912575V","activationDate":"15-01-2020 13:44:34","zone":"West 1","imageCount":3,"status":"av_pending","submittedUserId":"9560210319","submittedDate":1582535180056,"submittedDateStr":null,"rejectionReason":null,"comment":null},{"msisdn":"753651095","simNumber":"00017","customerPoiId":"801912575V","activationDate":"15-01-2020 13:44:34","zone":"West 1","imageCount":3,"status":"av_pending","submittedUserId":"9560210319","submittedDate":1582535180056,"submittedDateStr":null,"rejectionReason":null,"comment":null}]}},
          products:'',
          reporttype: '',
            startDate: "",
            endDate: "",
            emails: "",
            responseFlag: false,
            responseFlagMsg:'',
            listofzones:[],
            selectedZone:[],
            zone:'',
            selectAllzone:'Select All',
            reportName : "Download Report"
        };
        this.loadProductList = this.loadProductList.bind(this);
        this.sendReportToEmail = this.sendReportToEmail.bind(this);
        this.convertBool = this.convertBool.bind(this);
        this.onChange = this.onChange.bind(this);
        this.myCallback = this.myCallback.bind(this);

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

    componentDidMount() {
        //this.loadProductList();
        ActivationService.getStaticData('BOA').then(res => {
            let data = resolveResponse(res);
            this.setState({listofzones: data.result && data.result.zones}) 
        })
    }

    loadProductList() {
        

    }
    onChange = e => {

        if(e.target.value == 'zoneWiseDetailedReport'){
            this.setState({ showZoneSelection: true });
        }else{
            this.setState({ showZoneSelection: false });

        }
        this.setState({ [e.target.name]: e.target.value });

    } 


    sendReportToEmail() {

        //if(this.state.reporttype)

        if(!this.state.startDate){
            this.state.startDate = new Date().getTime();
        }
      
        if(!this.state.endDate){
            this.state.endDate = new Date().getTime();
        }

    
          
        if(!this.state.reporttype){
        Notify.showError("First select report type");
        return;
        }

      
        var data = {
            retrieveType: 'BY_FTA_DATE',
            startDate: this.state.startDate,
            endDate: this.state.endDate,
            "zones": this.state.selectedZone.length ? this.state.selectedZone : null

        }
       var api = this.state.reporttype; 
      // var api = "distributorLastUploadedData";
    //   var data = {retrieveType: "BY_FTA_DATE", startDate: 1578998520000, endDate: 1582540933936}; 

    //    console.log(data); 

      this.setState({ responseFlag : false, responseFlagMsg : '', dataEntryData :false, reportName:"Download Report" });


        AdminService.sentReportToEmail(data,api)
            .then((res) => {

                let data = resolveResponse(res);
               // console.log("report data",data.result.data);


                if(api == "agentStatusReport" && data.result){

                    if(data.result && data.result.verifications)
                    this.setState({ products: data.result.verifications, responseFlag : true, reportName:"Verification Report" });
                    if(data.result && data.result.dataEntry)
                    this.setState({ dataEntryData: data.result.dataEntry});

                }else if(data.result && data.result.data && data.result.data.length ){
                    this.setState({ products: data.result.data, responseFlag : true});
                }else{
                    this.setState({ responseFlagMsg : "No Records Found" });
                }

                
            });
    }



    convertBool(flag) {
        return flag ? 'Yes' : 'No';
    }

    myCallback = (date, fromDate) => {
        if (fromDate === "START_DATE") {
            console.log("date",date)
            this.setState({ startDate: new Date(date).getTime() });
        } else if (fromDate === "END_DATE") {
            this.setState({ endDate: new Date(date).getTime() });
        }
    };



    render() {

        const dateParam = {
            myCallback: this.myCallback,
            startDate: '',
            endDate: ''

        }
        return (

            <React.Fragment>
                <PostLoginNavBar />
                <div style={{ padding: "20px" }}>
                    <br />
                    <Paper style={{ padding: "40px" }}>

                        <Title>Report Download</Title>
             
                        <Grid syt container spacing={2} container
                            direction="row"
                            justify="right"
                            alignItems="center">
                            <Grid item xs={12} sm={4} >
                                <FormControl style={styles.multiselect}>
                                    <InputLabel htmlFor="Active" required={true}>Select type of report</InputLabel>
                                    <Select name="reporttype" value={this.state.reporttype} onChange={this.onChange}>
                                        <MenuItem value="distributorLastUploadedData">Distributor Last Uploaded Data</MenuItem>
                                        <MenuItem value="detailedPendingReport">Detailed Pending Report</MenuItem>
                                        <MenuItem value="rejectReport">Rejected Data</MenuItem>

                                        <MenuItem value="agentStatusReport">Agent Status Report</MenuItem>
                                        <MenuItem value="backOfficeReceptionReport">Back Office Reception Report</MenuItem>
                                        <MenuItem value="agentWisePerformanceLog">Agent Wise Performance Report</MenuItem>

                                        <MenuItem value="agentAuditReport">Agent Audit Report</MenuItem>
                                        <MenuItem value="ipacsReadyReport">IPACS Ready Report</MenuItem>
                                        <MenuItem value="noneComplainceReport">None Complaince Report</MenuItem>

                                        <MenuItem value="omniTransferReport">OMNI Transfer Report</MenuItem>
                                        <MenuItem value="summaryReportForDistributor">Summary Report For Distributor</MenuItem>

                                        <MenuItem value="zoneWiseDetailedReport">Zone Wise Detailed Report </MenuItem>


                                    </Select>
                                </FormControl>

                            </Grid>

                            {this.state.showZoneSelection ? 

                            <Grid item xs={12} sm={3} item alignItems='flex-end'>
                                <FormControl style={styles.selectStyle}>
                                    <InputLabel id="demo-mutiple-name-label">Select Zone</InputLabel>
                                    <Select
                                    labelId="demo-mutiple-name-label"
                                    id="demo-mutiple-name"
                                    multiple
                                    name="selectedZone"
                                    value={this.state.selectedZone}
                                    onChange={this.zoneChange}
                                    input={<Input />}
                                    MenuProps={MenuProps}
                                    >
                                    <MenuItem key={this.state.selectAllzone} value={this.state.selectAllzone} >
                                        <b> {this.state.selectAllzone}   </b>                                         
                                    </MenuItem>
                                    {this.state.listofzones ? this.state.listofzones.map(name => (
                                        <MenuItem key={name} value={name} >
                                            {name}
                                        </MenuItem>
                                    )): ""}
                                    </Select>
                                </FormControl>
                            </Grid>
                            :""}

                            <Grid item xs={12} sm={5} item alignItems='flex-end'>
                                <MaterialUIPickers callbackFromParent={dateParam} />
                            </Grid>



                            </Grid>


                            
                            <Grid syt container spacing={2} container
                            direction="row"
                            justify="right"
                            alignItems="center">


                            <Grid item xs={12} sm={2} item alignItems='flex-end'>
                            <Button variant="contained" color="Primary" style={{ marginLeft: '20px' }} onClick={this.sendReportToEmail} >Generate Report</Button>

                                {/* <Typography component="h2" variant="h4" color="primary" gutterBottom>
                                    <TextField type="text" value={this.state.emails} label="You can type multiple emails by comma(,) seperated" style={{ width: "100%" }} name="emails" onChange={this.onChange} />
                                </Typography> */}
                            </Grid>
                            <Grid item xs={12} sm={10} item alignItems='flex-end'  >
                                {this.state.responseFlag ? 
                                <CSVLink data={this.state.products}
                                    filename={this.state.reporttype+".csv"}
                                    className="btn btn-primary"
                                    target="_blank"
                                    >
                                    <Typography component="h2" variant="h6" style={{ color: 'green' }} gutterBottom>
                                        {this.state.reportName}
                                    </Typography>
                                    </CSVLink> 
                                    
                                :""}

                                {this.state.dataEntryData ? 
                                <CSVLink data={this.state.dataEntryData}
                                    filename={"dataEntry.csv"}
                                    className="btn btn-primary"
                                    target="_blank"
                                    >
                                    <Typography component="h2" variant="h6" style={{ color: 'green' }} gutterBottom>
                                        Data Entry Report
                                    </Typography>
                                    </CSVLink> 
                                    
                                :""}


                                {/* {this.state.responseFlagMsg ?  <Typography component="h2" variant="h6" color="error" gutterBottom>
                                  No Records Found
                                </Typography> : "" } */}

                                <Typography component="h2" variant="h6" color="error" gutterBottom>
                                  {this.state.responseFlagMsg}
                                </Typography> 
                            </Grid>
                        </Grid>


                        <Grid syt container spacing={2} container
                            direction="row"
                            justify="right"
                            alignItems="center">
                            <Grid item xs={12} sm={4} item >

                            </Grid>

                            <Grid item xs={12} sm={4} item >
                                <br />
                                {/* {this.state.responseFlag ?
                                    <Typography component="h2" variant="h6" style={{ color: 'green' }} gutterBottom>
                                        <DoneSharpIcon />  Report have been sent to your email id(s).
                                        </Typography>
                                    : ""} */}
                            </Grid>
                            <Grid item xs={12} sm={4} item >

                           

                            {this.state.responseFlag ? 
                                <Table data={this.state.products}/>

                            :""}

                            


                            </Grid>

                        </Grid>



                    </Paper>
                </div>

            </React.Fragment>
        )
    }

}


const styles = {
    tableStyle: {
        display: 'flex',
        justifyContent: 'left'
    },
    multiselect: {
        minWidth: "100%",
        marginBottom: "12px"
    },
    selectStyle:{
        // minWidth: '100%',
         marginBottom: '0px',
          minWidth: 300,
          maxWidth: 300,
    }
}


export default Report;