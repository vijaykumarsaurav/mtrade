import React, { useState } from "react";
import AdminService from "../service/AdminService";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import Notify from "../../utils/Notify";
import Input from "@material-ui/core/Input";
import ActivationService from "../service/ActivationService";

import TextField from '@material-ui/core/TextField';

import $ from "jquery";

import AuthService from "../service/AuthService";


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
import { CSVLink } from "react-csv";
import * as moment from 'moment';


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
            reportName : "Download Report",
            generateReportLoader:false,
            generateReportMsg: "", 
            roleCode:"",
            retrieveType:"BY_SUBMIT_DATE", 
            showSingleDate: false, 
            retrieveTypeAll:false,
            generateReportbutton:true, 
            resetCalander:false,
            showagentlink: false,
            retrieveTypeDataEntry:false
        };
        this.getReportDetails = this.getReportDetails.bind(this);
        this.convertBool = this.convertBool.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onChangeRetriveBy = this.onChangeRetriveBy.bind(this);
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
    dateFormat(date){ 
      return  moment.unix(date / 1000).format("DD/MM/YYYY")

       // return moment.utc(date).format('DD-MM-YYYY');
    }

    componentDidMount() {

        var userDetails = localStorage.getItem("userDetails")
        userDetails = userDetails && JSON.parse(userDetails);
        var roleCode = userDetails && userDetails.roleCode; 

        this.setState({roleCode: roleCode}) 
    
        if(roleCode == "ADMIN"){
            ActivationService.getStaticData(roleCode).then(res => {
                let data = resolveResponse(res);
                this.setState({listofzones: data.result && data.result.zones}) 
            })  
        }
    }

    onChange = e => {

        this.setState({ [e.target.name]: e.target.value, retrieveTypeAll: false, generateReportbutton:true,showagentlink:false,   retrieveType:"BY_SUBMIT_DATE" });
        if(e.target.value == 'zoneWiseDetailedReport'){
            this.setState({ showZoneSelection: true });
        }else{
            this.setState({ showZoneSelection: false });
        }

        if(e.target.value == 'disconnectionReport' || e.target.value == 'reconnectionReport'){
            this.setState({ showSingleDate: true });
        }else{
            this.setState({ showSingleDate: false });
        }

        if(e.target.value == 'agentStatusReport'){
            this.setState({ retrieveTypeAll: true, generateReportbutton:false, showagentlink:true });

            this.setState({ dataEntryReportAPI:   'http://125.16.74.160:30611/SLRetailer/reports/agentStatusDataEntryReport/?retrieveType=' }); 
            this.setState({ verificatioinReportAPI:   'http://125.16.74.160:30611/SLRetailer/reports/agentStatusDataEntryReport/'+"?retrieveType="+this.state.retrieveType+"&startDate="+this.state.startDate+"&endDate="+this.state.endDate + '&id='+ localStorage.getItem("token") }); 

        }

        if(e.target.value == 'agentWisePerformanceLog' || e.target.value == "agentAuditReport"  || e.target.value == "ipacsReadyReport"){
            this.setState({ retrieveTypeDataEntry: true });
        }else{
            this.setState({ retrieveTypeDataEntry: false }); 
        }
        
        
        this.setState({responseFlag : false, dataEntryData :false, generateReportLoader : false,  responseFlagMsg : "", resetCalander:true });
    } 

    onChangeRetriveBy = e => {

        this.setState({ [e.target.name]: e.target.value });
        this.setState({responseFlag : false, dataEntryData :false, generateReportLoader : false,  responseFlagMsg : "" });
    } 


    getReportDetails() {
        this.setState({verficationname:""});
        
        // $.ajax({
        //     type: "GET",
        //     url: "http://125.16.74.160:30611/SLRetailer/reports/ftaDeviationReportCsv?retrieveType=BY_FTA_DATE&startDate=1577817000000&endDate=1592850599059",
        //     headers: AuthService.getHeader(),
        //     xhrFields: {
        //       responseType: 'csv'
        //     },
        //     success: function (blob) {
        //       var windowUrl = window.URL || window.webkitURL;
        //       var url = windowUrl.createObjectURL(blob);
        //       var anchor = document.createElement('a');
        //       anchor.href = url;
        //       anchor.download = 'filename.csv';
        //       anchor.click();
        //       anchor.parentNode.removeChild(anchor);
        //       windowUrl.revokeObjectURL(url);
        //     },
        //     error: function (error) {
        //       console.log(error);
        //     }
        //   });


        // $.ajax({
        //     url: 'http://125.16.74.160:30611/SLRetailer/reports/ftaDeviationReportCsv?retrieveType=BY_FTA_DATE&startDate=1577817000000&endDate=1592850599059',
        //     type: 'GET',
        //     dataType: 'binary',
        //     headers: AuthService.getHeader(),
        //     processData: false,
        //     success: function(blob) {
        //         alert("success"); 
        //         var windowUrl = window.URL || window.webkitURL;
        //         var url = windowUrl.createObjectURL(blob);
        //         anchor.prop('href', url);
        //         anchor.prop('download', fileName);
        //         anchor.get(0).click();
        //         windowUrl.revokeObjectURL(url);
        //     }
        // });


        // $.ajax({
        //     // `url` 
        //     url: 'http://125.16.74.160:30611/SLRetailer/reports/ftaDeviationReportCsv?retrieveType=BY_FTA_DATE&startDate=1577817000000&endDate=1592850599059',
        //     type: "GET",
        //     dataType: 'csv',
        //     // `file`, data-uri, base64
            
        //     // `custom header`
        //     headers: AuthService.getHeader(),
        //     beforeSend: function (jqxhr) {
        //         console.log(this.headers);
        //         alert("custom headers" + JSON.stringify(this.headers));
        //     },
        //     success: function (data) {
        //         // `file download`
        //         $("a")
        //             .attr({
        //             "href": data.file,
        //                 "download": "file.csv"
        //         })
        //             .html($("a").attr("download"))
        //             .get(0).click();
        //         console.log(JSON.parse(JSON.stringify(data)));
        //     },
        //     error: function (jqxhr, textStatus, errorThrown) {
        //       console.log(textStatus, errorThrown)
        //     }
        // });


        if(!this.state.startDate){
            var startd = new Date(); 
            startd.setHours(0,0,0,0);
            this.state.startDate = startd.getTime();
        }else{
            var startd = new Date(this.state.startDate); 
            startd.setHours(0,0,0,0);
            this.state.startDate = startd.getTime();
        }
      
        if(!this.state.endDate){
            var endd = new Date(); 
            endd.setHours(23,59,59,59);    
            this.state.endDate = endd.getTime();
        }else{
            var endd = new Date(this.state.endDate); 
            endd.setHours(23,59,59,59);
            this.state.endDate = endd.getTime();
        }

          
        if(!this.state.reporttype){
        Notify.showError("First select report type");
        return;
        }

        if(this.state.reporttype ==  "zoneWiseDetailedReport" && !this.state.selectedZone.length){
                Notify.showError("Select filter zones");
                return;
        }

        // BY_FTA_DATE,
        // BY_SUBMIT_DATE,
        // BY_VERIFICATION_DATE,
        // BY_DATA_ENTRY_DATE
        var data = {
               retrieveType: this.state.retrieveType,
               startDate: this.state.startDate,
               endDate: this.state.endDate,
               zones: this.state.selectedZone.length ? this.state.selectedZone : null
           } 
       
        // if(this.state.reporttype == 'disconnectionReport' || this.state.reporttype == 'reconnectionReport'){
        //     data = {
        //         date: this.state.startDate,
        //     }


        // }
        
        this.setState({ responseFlag : false, responseFlagMsg : '', dataEntryData :false, reportName:"Download Report", generateReportLoader : true,generateReportMsg : "Generating report please wait..." });
        

        if(this.state.reporttype == "agentStatusReport"){

            AdminService.sentReportToEmail(data,this.state.reporttype)
            .then((res) => {

                let data = resolveResponse(res);
              //  console.log("report data",res.data)
            
              
            //  this.setState({ products: res.data, responseFlag : true});

                if(this.state.reporttype == "agentStatusReport" && data.result){

                    if(data.result)
                    this.setState({ products: data.result.verifications, responseFlag : true, reportName:"Verification Report" });
                    if(data.result && data.result.dataEntry)
                    this.setState({ dataEntryData: data.result.dataEntry});
                    this.setState({ generateReportMsg:  "Ready to Download", verficationname:"VerficationReport_of_"});

                }else{
                    this.setState({ generateReportMsg:  "",  generateReportLoader: false});
                    this.setState({ responseFlagMsg : "No Records Found" });
                }

                
            });
        
        }else{
            if(this.state.reporttype == 'disconnectionReport' || this.state.reporttype == 'reconnectionReport'){

                window.open('http://125.16.74.160:30611/SLRetailer/reports/'+this.state.reporttype+ "?date="+data.startDate+'&id='+ localStorage.getItem("token"));

            }else{

                window.open('http://125.16.74.160:30611/SLRetailer/reports/'+this.state.reporttype+'?retrieveType='+this.state.retrieveType+"&startDate="+this.state.startDate+"&endDate="+this.state.endDate+"&zones="+this.state.selectedZone+'&id='+localStorage.getItem("token"), '');

            }

           this.setState({ generateReportLoader : false });

        }



      
    //    AdminService.reportDirectDownload(data,this.state.reporttype)

    //         .then((res) => {

            
    //             let data = resolveResponse(res);
          
    //             if(res.data){
    //                 //this.setState({ generateReportMsg:  "Ready to Download"});
    //                // http://125.16.74.160:30611/SLRetailer/reports/ftaDeviationReport?retrieveType=BY_FTA_DATE&startDate=1577817000000&endDate=1593023399059&id=ZXlKaGJHY2lPaUpJVXpJMU5pSjkuZXlKemRXSWlPaUpNUVRGUVRVaExNU0lzSW5SdmEyVnVTV1FpT2lJeE5Ua3pNREF4TmpjM01EZzVJaXdpVWs5TVJVTlBSRVVpT2lKQlJFMUpUaUlzSWtsVFgxQlBVbFJCVENJNmRISjFaU3dpUVVsU1ZFVk1YMGxFSWpvaVRFRXhVRTFJU3pFaUxDSnBjM01pT2lKb2RIUndjem92TDJGcGNuUmxiQzVqYjIwaUxDSnBZWFFpT2pFMU9UTXdNREUyTnpjc0ltVjRjQ0k2TVRVNU16QTRPREEzTjMwLi1iQVpfdUlqaldUMlN1U3ZBaGxGWjhPQU9BTUlROTdlMUpEZjdTb1hyTE0=
    //                 window.open('http://125.16.74.160:30611/SLRetailer/reports/'+this.state.reporttype+'?retrieveType='+this.state.retrieveType+"&startDate="+this.state.startDate+"&endDate="+this.state.endDate+'&id='+localStorage.getItem("token"), '');
    //                 this.setState({ generateReportLoader : false });
    //               //  this.setState({ products: data.result.data, responseFlag : true});

    //                 // if(this.state.reporttype == "detailedPendingReport"){
    //                 //     this.setState({ reporttype: "distributorDetailReport"});
    //                 // }

    //             }
                
              
                
    //         });
    }



    convertBool(flag) {
        return flag ? 'Yes' : 'No';
    }

    myCallback = (date, fromDate) => {
        if (fromDate === "START_DATE") {
            console.log("date",date)
            this.setState({ startDate: new Date(date).getTime(),  generateReportLoader: false, responseFlag:false, responseFlagMsg : "", dataEntryData:"" });
        } else if (fromDate === "END_DATE") {
            this.setState({ endDate: new Date(date).getTime(), generateReportLoader: false, responseFlag:false, responseFlagMsg : "",dataEntryData:"" });
        }
    };


    render() {

        const dateParam = {
            myCallback: this.myCallback,
            startDate: '',
            endDate: '', 
            showSingleDate: this.state.showSingleDate,
            resetCalander : this.state.resetCalander
        }

        var adminReports = []; 

        //POST /reports/ftaDeviationReportCsv
        adminReports.push(<MenuItem value="agentStatusReport">Agent Status Report</MenuItem>); 
        adminReports.push(<MenuItem value="backOfficeReceptionReport">Back Office Reception Report</MenuItem>); 
        adminReports.push(<MenuItem value="backOfficeReceptionReportWithDetails">Back Office Reception Report with Details</MenuItem>); 
        adminReports.push(<MenuItem value="agentWisePerformanceLog">Agent Wise Performance Report</MenuItem>); 
        adminReports.push(<MenuItem value="agentAuditReport">Agent Audit Report</MenuItem>); 
        adminReports.push(<MenuItem value="ipacsReadyReport">IPACS Ready Report</MenuItem>); 
        adminReports.push(<MenuItem value="noneComplainceReport">None Compliance Report</MenuItem>); 
        adminReports.push(<MenuItem value="omniTransferReport">OMNI Transfer Report</MenuItem>);
        adminReports.push(<MenuItem value="zoneWiseDetailedReport">Zone Wise Detailed Report </MenuItem>);
        adminReports.push(<MenuItem value="simSwapReport">SIM Swap Report</MenuItem>);
        adminReports.push(<MenuItem value="disconnectionReport">D-1 Disconnect Report</MenuItem>);
        adminReports.push(<MenuItem value="reconnectionReport">D-1 Re-connection Report</MenuItem>);

           // BY_VERIFICATION_DATE,
        // BY_DATA_ENTRY_DATE
        var agentStatusRetrieveBy = []; 
        agentStatusRetrieveBy.push(<MenuItem key={'BY_VERIFICATION_DATE'} value={'BY_VERIFICATION_DATE'} >By Verification Date</MenuItem>); 
        agentStatusRetrieveBy.push(<MenuItem key={'BY_DATA_ENTRY_DATE'} value={'BY_DATA_ENTRY_DATE'} >By Data Entry Date</MenuItem>); 
        
        return (

            <React.Fragment>
                <PostLoginNavBar />
                <div style={{ padding: "20px" }}>
                    <br />
                   
                    <Paper style={{ padding: "40px" }}>

                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                        Report Download
                        </Typography>
             
                        <Grid syt container spacing={1} container
                            direction="row"
                            justify="right"
                            alignItems="center">
                            <Grid item xs={12} sm={3} >
                                <FormControl style={styles.multiselect}>
                                {/* ftaDeviationReport */}
                                    <InputLabel htmlFor="Active" required={true}>Select type of report</InputLabel>
                                    <Select name="reporttype" value={this.state.reporttype} onChange={this.onChange}>
                                    <MenuItem value="distributorLastUploadedData">Distributor Uploaded Data Status</MenuItem>
                                    <MenuItem value="detailedPendingReport">Distributor Detail Report</MenuItem>
                                    <MenuItem value="rejectReport"> Distributor Reject Data Report</MenuItem>
                                    <MenuItem value="summaryReportForDistributor">Distributor Summary Report</MenuItem>
                                    <MenuItem value="ftaDeviationReport">FTA Deviation Report</MenuItem>
                                    
                                    {this.state.roleCode==="ADMIN" ? adminReports : ""}
                                    </Select>
                                </FormControl>

                            </Grid>

                            {this.state.roleCode=="ADMIN" && this.state.showZoneSelection ? 
                            <Grid item xs={12} sm={3}>
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

                          {this.state.reporttype != 'disconnectionReport' && this.state.reporttype != 'reconnectionReport' ? 
                            <Grid item xs={12} sm={3}>
                                <FormControl style={styles.selectStyle}>
                                    <InputLabel id="demo-mutiple-name-label">Retrieve Type</InputLabel>
                                    <Select
                                    name="retrieveType"
                                    value={this.state.retrieveType}
                                    onChange={this.onChangeRetriveBy}
                                    >
                                   
                                    {this.state.reporttype != 'simSwapReport' ?  
                                        <MenuItem key={'BY_FTA_DATE'} value={'BY_FTA_DATE'} >
                                        By FTA Date
                                    </MenuItem>
                                    : ""} 
                                    <MenuItem key={'BY_SUBMIT_DATE'} value={'BY_SUBMIT_DATE'} >
                                        By Submit Date
                                    </MenuItem>

                                    
                                    {this.state.retrieveTypeDataEntry ?  
                                        <MenuItem key={'BY_DATA_ENTRY_DATE'} value={'BY_DATA_ENTRY_DATE'} >
                                            By Data Entry Date
                                        </MenuItem>
                                    : ""}

                                    {this.state.retrieveTypeAll ? agentStatusRetrieveBy : ""}
                                    </Select>
                                </FormControl>
                            </Grid>
                            :""}

                            <Grid item xs={12} sm={3} >
                                <MaterialUIPickers callbackFromParent={dateParam} />
                            </Grid>

                            </Grid>


                        


                            {/*                                 
                            <Grid syt container spacing={4} container
                            direction="row"
                            justify="right"
                            alignItems="center">
                                <Grid item xs={12} sm={8} item alignItems='flex-end'>
                                    <MaterialUIPickers callbackFromParent={dateParam} />
                                </Grid>
                            </Grid> */}

                        

                            
                            <br />
                            <Grid syt container spacing={2} container
                            direction="row"
                            justify="right"
                            alignItems="">

                            {this.state.generateReportbutton ?     
                            <Grid item xs={12} sm={3} item alignItems='flex-end'>
                                
                                {!this.state.generateReportLoader ? 
                                <Button variant="contained" color="Primary" style={{ marginLeft: '20px' }} onClick={this.getReportDetails} >Generate Report</Button>
                                :""}
                                
                                {this.state.generateReportLoader ? 
                                <Typography  component="h5" color="primary" gutterBottom>
                                    {this.state.generateReportMsg}
                                </Typography>
                                :""}
                            </Grid>

                            :""}

                            {this.state.showagentlink ?     <>  
                            <Grid item xs={12} sm={3} item alignItems='flex-end'>
                                <a   target="_blank" href={this.state.dataEntryReportAPI + this.state.retrieveType+"&startDate="+this.state.startDate+"&endDate="+this.state.endDate + '&id='+ localStorage.getItem("token")} >Download Data Entry</a>
                             
                                
        

                            </Grid>

                            <Grid item xs={12} sm={3} item alignItems='flex-end'>
                                <a target="_blank"  href={this.state.verificatioinReportAPI + this.state.retrieveType+"&startDate="+this.state.startDate+"&endDate="+this.state.endDate + '&id='+ localStorage.getItem("token")}>  Download Verification </a>
                            </Grid> 
                            </>
                            :""}

                            <Grid item xs={12} sm={9} item alignItems='flex-end'  >
                                {this.state.responseFlag ? 
                                <CSVLink data={this.state.products}
                                    filename={this.state.verficationname + this.state.reporttype+"_"+ this.state.retrieveType.toLowerCase()+"_"+this.dateFormat(this.state.startDate)+ "_to_"+this.dateFormat(this.state.endDate)+".csv"}
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
                                    //filename={"dataEntry.csv"}
                                    filename={"DateEntryReport_of_"+this.state.reporttype+"_"+this.state.retrieveType.toLowerCase()+"_"+this.dateFormat(this.state.startDate)+ "_to_"+this.dateFormat(this.state.endDate)+".csv"} 
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

                                <Typography component="h5" color="error" gutterBottom>
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
        marginBottom: '0px',
    },
    dateSelect: {
        minWidth: "100%",
        marginBottom: '0px',
    },
    selectStyle:{
        // minWidth: '100%',
          marginBottom: '0px',
          minWidth: '100%',
          maxWidth: '100%',
    }
}


export default Report;