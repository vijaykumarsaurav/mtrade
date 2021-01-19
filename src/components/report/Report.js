import React, { useState } from "react";
import AdminService from "../service/AdminService";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import Notify from "../../utils/Notify";
import Input from "@material-ui/core/Input";
import ActivationService from "../service/ActivationService";

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
            month: "",
            year: '', 
            days: '',
            day:'',
            numofDays : [],
            listofYear: [], 
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
            resetCalander:false,
            filenameToGo:"",
            retrieveTypeDataEntry:false,
            d1DateRangeFlag:false
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

        ActivationService.checkSession().then(res => {
            let data = resolveResponse(res);
        })
        
        var userDetails = localStorage.getItem("userDetails")
        userDetails = userDetails && JSON.parse(userDetails);
        if(userDetails){
            this.setState({roleCode: userDetails.roleCode}) ; 
        }
    
        if(JSON.parse(localStorage.getItem('cmsStaticData'))){
            this.setState({listofzones:  JSON.parse(localStorage.getItem('cmsStaticData')).zones});
        }
        
        for(var i = 2018; i <= new Date().getFullYear(); i++){
           this.state.listofYear.push(i); 
        }
        for(var i = 1; i <= 60; i++){
            this.state.numofDays.push(i); 
        }
       

    }

    onChange = e => {

        this.setState({ [e.target.name]: e.target.value, retrieveTypeAll: false,  retrieveType:"BY_SUBMIT_DATE", startDate : localStorage.getItem('startDate') ?  new Date( parseInt(localStorage.getItem('startDate'))).getTime() : null,  endDate: localStorage.getItem('endDate') ?  new Date( parseInt(localStorage.getItem('endDate'))).getTime() :null  });
        if(e.target.value == 'zoneWiseDetailedReport'){
            this.setState({ showZoneSelection: true });
        }else{
            this.setState({ showZoneSelection: false });
        }

        if(e.target.value == 'disconnectionReport' || e.target.value == 'reconnectionReport'||  e.target.value == 'dailyActiveRetailers'){
            this.setState({ showSingleDate: true , retrieveType: '', });
        }else{
            this.setState({ showSingleDate: false });
        }

        if(e.target.value == 'simSwapCount' || e.target.value == 'mpinResetCount'||  e.target.value == 'reloadAndBillPayCount' ||  e.target.value == 'idleRetailers' ||  e.target.value == 'acquisitionCountReport'){
            this.setState({ d1DateRangeFlag: true, retrieveType: '' });  
        }else{
            this.setState({ d1DateRangeFlag: false });  
        }

        if(e.target.value == 'agentStatusReport'){
            this.setState({ retrieveTypeAll: true });
        }

        if(e.target.value == 'agentWisePerformanceLog' || e.target.value == "agentAuditReport"  || e.target.value == "ipacsReadyReport"){
            this.setState({ retrieveTypeDataEntry: true });
        }else{
            this.setState({ retrieveTypeDataEntry: false }); 
        }

        this.setState({responseFlag : false, dataEntryData :false, generateReportLoader : false,  responseFlagMsg : "", resetCalander:true });

        console.log("Report change",'\n', 'report: ',  e.target.value, "\n START DATE " +  new Date( parseInt(localStorage.getItem('startDate'))), '\n'," END DATE "+ new Date( parseInt(localStorage.getItem('endDate'))));



    } 

    onChangeRetriveBy = e => {
        this.setState({ [e.target.name]: e.target.value });
        this.setState({responseFlag : false, dataEntryData :false, generateReportLoader : false,  responseFlagMsg : "" });
    } 

    getReportDetails() {
        this.setState({verficationname:"", filenameToGo : this.state.reporttype});

        if(!this.state.reporttype){
            Notify.showError("First select report type");
            return;
        }
        if(this.state.reporttype == 'retailerOnboardedReport'  && !this.state.day){
            Notify.showError("Select no. of days");
            return;
        }
        if(this.state.reporttype == 'monthlyActiveRetailers'){
            if(!this.state.year){
                Notify.showError("Select a Year");
                return;
            }
            if(!this.state.month){
                Notify.showError("Select a Month");
                return;
            }
            var firstDate = new Date("1 " + this.state.month + ' ' + this.state.year);
            firstDate.setHours(0,0,0,0);
            var startDate =  new  Date(firstDate.getDate()+ ' '+ this.state.month+ ' '+ this.state.year);
            var endd = new Date(firstDate.getFullYear(), firstDate.getMonth() + 1, 0);
            endd.setHours(23,59,59,59);  
            this.state.startDate = startDate.getTime();

            this.setState({ startDate : startDate.getTime() }, () => {
              //  console.log("startDate : setting", this.state.startDate);
            }); 
            
            window.localStorage.setItem('startDate',startDate.getTime() );
            this.state.endDate = endd.getTime();
            this.setState({ endDate : endd.getTime() }, () => {
               // console.log("endDate : setting", this.state.endDate);
            }); 
            window.localStorage.setItem('endDate',endd.getTime());
        }

        var data = {
               retrieveType: this.state.retrieveType,
               startDate: localStorage.getItem('startDate') ?  new Date( parseInt(localStorage.getItem('startDate'))).getTime() : null,
               endDate: localStorage.getItem('endDate') ?  new Date( parseInt(localStorage.getItem('endDate'))).getTime() :null,
               zones: this.state.selectedZone.length ? this.state.selectedZone : null
           } 

        if(this.state.reporttype == 'reloadAndBillPayCount' || this.state.reporttype == 'simSwapCount' || this.state.reporttype == 'mpinResetCount' || this.state.reporttype == 'monthlyActiveRetailers' || this.state.reporttype =='idleRetailers' || this.state.reporttype =='acquisitionCountReport'){
            data = {
                startDate: localStorage.getItem('startDate') ?  new Date( parseInt(localStorage.getItem('startDate'))).getTime() : null,
                endDate: localStorage.getItem('endDate') ?  new Date( parseInt(localStorage.getItem('endDate'))).getTime() :null,
            }
        }
       
        if(this.state.reporttype == 'disconnectionReport' || this.state.reporttype == 'reconnectionReport' || this.state.reporttype == 'dailyActiveRetailers'){
            data = {
                date: localStorage.getItem('startDate') ?  new Date( parseInt(localStorage.getItem('startDate'))).getTime() : null,
            }
        }

        if(this.state.reporttype == 'retailerOnboardedReport' ){
            data = {
                range: this.state.day || 0
            }
        }
        console.log("reporttype",this.state.reporttype  , "Param data", data, '\n', " START DATE " +  new Date( parseInt(localStorage.getItem('startDate'))) , '\n'," END DATE "+ new Date( parseInt(localStorage.getItem('endDate'))));

        if(this.state.reporttype == 'barReport' || this.state.reporttype == 'unBarReport'){
            data = {
                startDate: localStorage.getItem('startDate') ?  new Date( parseInt(localStorage.getItem('startDate'))).getTime() : null,
                endDate: localStorage.getItem('endDate') ?  new Date( parseInt(localStorage.getItem('endDate'))).getTime() :null,
                retrieveType : this.state.reporttype == 'barReport' ? "BY_BARRING_DATE" : "BY_UNBARRING_DATE"
            }
        } 

        if(this.state.reporttype == 'disconnectionAgentAuditReport' || this.state.reporttype == 'disconnectionReceptionReport' || this.state.reporttype == 'disconnectionIpacReadyReport'){
            data = {
                startDate: localStorage.getItem('startDate') ?  new Date( parseInt(localStorage.getItem('startDate'))).getTime() : null,
                endDate: localStorage.getItem('endDate') ?  new Date( parseInt(localStorage.getItem('endDate'))).getTime() :null,
                retrieveType : this.state.retrieveType
            }
        }      
        
        this.setState({  startDate : localStorage.getItem('startDate') ?  new Date( parseInt(localStorage.getItem('startDate'))).getTime() : null,  endDate: localStorage.getItem('endDate') ?  new Date( parseInt(localStorage.getItem('endDate'))).getTime() :null  });
      this.setState({ responseFlag : false, responseFlagMsg : '', dataEntryData :false, reportName:"Download Report", generateReportLoader : true,generateReportMsg : "Generating report please wait..." });

        AdminService.sentReportToEmail(data,this.state.reporttype)
            .then((res) => {

                let data = resolveResponse(res);
            
                if(this.state.reporttype == "agentStatusReport" && data.result){

                    if(data.result && data.result.verifications)
                    this.setState({ products: data.result.verifications, responseFlag : true, reportName:"Verification Report" });
                    if(data.result && data.result.dataEntry)
                    this.setState({ dataEntryData: data.result.dataEntry});
                    this.setState({ generateReportMsg:  "Ready to Download", verficationname:"VerificationReport_of_"});

                    this.setState({  generateReportLoader: false});

                }else if(this.state.reporttype == 'disconnectionAgentAuditReport' || this.state.reporttype == 'disconnectionReceptionReport' || this.state.reporttype == 'disconnectionIpacReadyReport'){

                    this.setState({ generateReportMsg:  "Ready to Download"});
                    this.setState({ products: data.result, responseFlag : true});

                    if(this.state.reporttype == "detailedPendingReport"){
                        this.setState({ filenameToGo: "distributorDetailReport"});
                    }
                    this.setState({  generateReportLoader: false});

                }else if(data.result && data.result.data && data.result.data.length ){
                    this.setState({ generateReportMsg:  "Ready to Download"});
                    this.setState({ products: data.result.data, responseFlag : true});

                    if(this.state.reporttype == "detailedPendingReport"){
                        this.setState({ filenameToGo: "distributorDetailReport"});
                    }
                    this.setState({  generateReportLoader: false});

                }else{
                    this.setState({ generateReportMsg:  "",  generateReportLoader: false});
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
            this.setState({ startDate: new Date(date).getTime(),  generateReportLoader: false, responseFlag:false, responseFlagMsg : "", dataEntryData:"" });
       
            var dateObj = new Date(date);
            dateObj.setMonth(dateObj.getMonth() + 6);
            dateObj.setHours(23,59,59,59);
            dateObj.setDate(dateObj.getDate() - 1);
           
            var endD = this.state.endDate; 
            //console.log("endDate",  new Date(this.state.endDate) ); 
            if(!this.state.endDate){
                 endD = new Date(); 
                 endD.setHours(23,59,59,59);
            }

          
            if(endD > dateObj.getTime()){
                this.setState({ disabledGenButton: true  });
            }else{
                this.setState({ disabledGenButton: false  });
            }
            
        } else if (fromDate === "END_DATE") {
            this.setState({ endDate: new Date(date).getTime(), generateReportLoader: false, responseFlag:false, responseFlagMsg : "",dataEntryData:"" });
            this.setState({ disabledGenButton: false  });
        }

        console.log("calender change",'\n', 'report: '+ this.state.reporttype, "\n START DATE " +  new Date( parseInt(localStorage.getItem('startDate'))), '\n'," END DATE "+ new Date( parseInt(localStorage.getItem('endDate'))));


    };

    


    render() {

        const dateParam = {
            myCallback: this.myCallback,
            startDate: null,
            endDate: null, 
            showSingleDate: this.state.showSingleDate,
            resetCalander : this.state.resetCalander,
            generateReportLoader: this.state.generateReportLoader,
            d1DateRangeFlag: this.state.d1DateRangeFlag
           

        }


        var distReports = []; 
        distReports.push(<MenuItem value="detailedPendingReport">Distributor Detail Report</MenuItem>); 
        distReports.push(<MenuItem value="rejectReport"> Distributor Reject Data Report</MenuItem>); 
        distReports.push(<MenuItem value="summaryReportForDistributor">Distributor Summary Report</MenuItem>); 
        distReports.push(<MenuItem value="distributorLastUploadedData">Distributor Uploaded Data Status</MenuItem>); 
        distReports.push(<MenuItem value="ftaDeviationReport">FTA Deviation Report</MenuItem>); 
        

        var adminReports = [];
        adminReports.push(<MenuItem value="agentAuditReport">Agent Audit Report</MenuItem>); 
        adminReports.push(<MenuItem value="agentStatusReport">Agent Status Report</MenuItem>); 
        adminReports.push(<MenuItem value="agentWisePerformanceLog">Agent Wise Performance Report</MenuItem>); 
        adminReports.push(<MenuItem value="backOfficeReceptionReport">Back Office Reception Report</MenuItem>);    
        adminReports.push(<MenuItem value="backOfficeReceptionReportWithDetails">Back Office Reception Report with Details</MenuItem>); 
        adminReports.push(<MenuItem value="dailyActiveRetailers">D-1 Daily Active Retailers Report</MenuItem>);
        adminReports.push(<MenuItem value="disconnectionReport">D-1 Disconnect Report</MenuItem>);
        adminReports.push(<MenuItem value="idleRetailers">D-1 Idle Retailers Report</MenuItem>);
        adminReports.push(<MenuItem value="monthlyActiveRetailers">D-1 Monthly Active Retailers Report</MenuItem>);
        adminReports.push(<MenuItem value="mpinResetCount">D-1 Mpin Reset Count Report</MenuItem>);
        adminReports.push(<MenuItem value="reconnectionReport">D-1 Re-connection Report</MenuItem>);
        adminReports.push(<MenuItem value="reloadAndBillPayCount">D-1 Reload & Bill Pay Count Report</MenuItem>);
        adminReports.push(<MenuItem value="retailerOnboardedReport">D-1 Retailer Onboarded Report</MenuItem>);
        adminReports.push(<MenuItem value="acquisitionCountReport">D-1 SUK vs CYN Count Report</MenuItem>);
        adminReports.push(<MenuItem value="simSwapCount">D-1 Sim Swap Count Report</MenuItem>);
        adminReports.push(<MenuItem value="detailedPendingReport">Distributor Detail Report</MenuItem>); 
        adminReports.push(<MenuItem value="rejectReport"> Distributor Reject Data Report</MenuItem>); 
        adminReports.push(<MenuItem value="summaryReportForDistributor">Distributor Summary Report</MenuItem>); 
        adminReports.push(<MenuItem value="distributorLastUploadedData">Distributor Uploaded Data Status</MenuItem>); 
        adminReports.push(<MenuItem value="ftaDeviationReport">FTA Deviation Report</MenuItem>); 
        adminReports.push(<MenuItem value="ipacsReadyReport">IPACS Ready Report</MenuItem>); 
        adminReports.push(<MenuItem value="noneComplainceReport">None Compliance Report</MenuItem>); 
        adminReports.push(<MenuItem value="omniTransferReport">OMNI Transfer Report</MenuItem>);
        adminReports.push(<MenuItem value="simSwapReport">SIM Swap Report</MenuItem>);
        adminReports.push(<MenuItem value="zoneWiseDetailedReport">Zone Wise Detailed Report </MenuItem>);
        adminReports.push(<MenuItem value="barReport">Bar Report</MenuItem>);
        adminReports.push(<MenuItem value="unBarReport">Unbar Report</MenuItem>);

        adminReports.push(<MenuItem value="disconnectionReceptionReport">Disconnection Reception Report</MenuItem>);
        adminReports.push(<MenuItem value="disconnectionAgentAuditReport">Disconnection Agent Audit Report</MenuItem>);
        adminReports.push(<MenuItem value="disconnectionIpacReadyReport">Disconnection Ipac Ready Report</MenuItem>);

        //sprint 8 changes

        // BY_VERIFICATION_DATE,
        // BY_DATA_ENTRY_DATE
        var agentStatusRetrieveBy = []; 
        agentStatusRetrieveBy.push(<MenuItem key={'BY_VERIFICATION_DATE'} value={'BY_VERIFICATION_DATE'} >By Verification Date</MenuItem>); 
        agentStatusRetrieveBy.push(<MenuItem key={'BY_DATA_ENTRY_DATE'} value={'BY_DATA_ENTRY_DATE'} >By Data Entry Date</MenuItem>); 
       
        var retrieveTypeFileName = this.state.retrieveType ? this.state.retrieveType.toLowerCase()+"_" : ""; 
        var downloadfilename = this.state.verficationname + this.state.filenameToGo+"_"+ retrieveTypeFileName + this.dateFormat(this.state.startDate)+ "_to_"+this.dateFormat(this.state.endDate)+".csv"; 

   //   console.log("this.state.reporttype",this.state.reporttype)

        if(this.state.reporttype == 'disconnectionReport' || this.state.reporttype == 'reconnectionReport'){
            downloadfilename =  this.state.reporttype+"_by_verification_date_"+this.dateFormat(this.state.startDate)+".csv"; 
        }
        if(this.state.reporttype == 'dailyActiveRetailers'){
            downloadfilename =  this.state.reporttype+"_report_of_"+this.dateFormat(this.state.startDate)+".csv"; 
        }
        if(this.state.reporttype == 'retailerOnboardedReport'){
            downloadfilename =  this.state.reporttype+"_report_for_"+this.state.day+"_days.csv"; 
        }
        
        if(this.state.reporttype == 'barReport'){
            downloadfilename = "barReport_from_"+ this.dateFormat(this.state.startDate)+ "_to_"+this.dateFormat(this.state.endDate)+".csv"; 
        }  
        if(this.state.reporttype == 'unBarReport'){
            downloadfilename = "unBarReport_from_"+ this.dateFormat(this.state.startDate)+ "_to_"+this.dateFormat(this.state.endDate)+".csv"; 
        }  

        return (

            <React.Fragment>
                <PostLoginNavBar />
                <div style={{ padding: "20px" }}>
                    <br />
                    <Paper style={{ padding: "40px" }}>

                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                        Report Download
                        </Typography>
             
                      

                        <Grid syt container spacing={2} container
                            direction="row"
                            justify="right"
                            alignItems="center">
                            <Grid item xs={12} sm={3} >
                                <FormControl style={styles.multiselect}>
                                {/* ftaDeviationReport */}
                                    <InputLabel htmlFor="Active" required={true}>Select type of report</InputLabel>
                                    <Select name="reporttype" disabled={this.state.generateReportLoader} value={this.state.reporttype} onChange={this.onChange}>
                                
                                    {this.state.roleCode==="DIST" ? distReports : ""}

                                    {this.state.roleCode==="ADMIN" ? adminReports : ""}
                                    </Select>
                                </FormControl>

                            </Grid>

                            {this.state.roleCode=="ADMIN" && this.state.showZoneSelection ? 
                            <Grid item xs={12} sm={3}>
                                <FormControl style={styles.selectStyle}>
                                    <InputLabel id="demo-mutiple-name-label">Select Zone</InputLabel>
                                    <Select 
                                    disabled={this.state.generateReportLoader}
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

                          {this.state.reporttype != 'disconnectionReport' && this.state.reporttype != 'reconnectionReport' && this.state.reporttype != 'simSwapCount' && this.state.reporttype != 'mpinResetCount' && this.state.reporttype != 'reloadAndBillPayCount' && this.state.reporttype != 'idleRetailers' &&  this.state.reporttype != 'monthlyActiveRetailers' && this.state.reporttype != 'dailyActiveRetailers' && this.state.reporttype !=  'acquisitionCountReport' &&  this.state.reporttype != 'retailerOnboardedReport' &&  this.state.reporttype != 'barReport' &&  this.state.reporttype != 'unBarReport'? 
                            <Grid item xs={12} sm={3}>
                                <FormControl style={styles.selectStyle}>
                                    <InputLabel id="demo-mutiple-name-label">Retrieve Type</InputLabel>
                                    <Select
                                    disabled={this.state.generateReportLoader}
                                    name="retrieveType"
                                    value={this.state.retrieveType}
                                    onChange={this.onChangeRetriveBy}
                                    >
                                    {this.state.reporttype != 'simSwapReport' && this.state.reporttype != 'disconnectionReceptionReport' && this.state.reporttype != 'disconnectionAgentAuditReport' && this.state.reporttype != 'disconnectionIpacReadyReport'  ?  
                                        <MenuItem key={'BY_FTA_DATE'} value={'BY_FTA_DATE'} >
                                        By FTA Date
                                    </MenuItem>
                                    : ""} 
                                   
                                    <MenuItem key={'BY_SUBMIT_DATE'} value={'BY_SUBMIT_DATE'} >
                                        By Submit Date
                                    </MenuItem>

                                    {this.state.reporttype === 'disconnectionAgentAuditReport' || this.state.reporttype === 'disconnectionIpacReadyReport' ?  
                                        <MenuItem key={'BY_VERIFICATION_DATE'} value={'BY_VERIFICATION_DATE'} >
                                            By Verification Date
                                        </MenuItem>
                                    : ""} 
                                   
                                    
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

                                {this.state.reporttype =='retailerOnboardedReport' ? 
                                    <Grid item xs={12} sm={3}>
                                    <FormControl style={styles.selectStyle}>
                                        <InputLabel id="demo-mutiple-name-label">Select no. of days</InputLabel>
                                        <Select 
                                        disabled={this.state.generateReportLoader}
                                        labelId="demo-mutiple-name-label"
                                        id="demo-mutiple-name"
                                        
                                        name="day"
                                        value={this.state.day}
                                        onChange={this.onChange}
                                        input={<Input />}
                                        MenuProps={MenuProps}
                                        >
                                        {this.state.numofDays ? this.state.numofDays.map(name => (
                                            <MenuItem key={name} value={name} >
                                                {name}
                                            </MenuItem>
                                        )): ""}
                                    
                                        </Select>
                                    </FormControl>
                                </Grid>
                            : ""}

                          
                            {this.state.reporttype != 'monthlyActiveRetailers' && this.state.reporttype != 'retailerOnboardedReport' ? 
                            <Grid item xs={12} sm={3} >
                                <MaterialUIPickers  callbackFromParent={dateParam} /> 
                                                
                                </Grid>
                            : ""}

                            {this.state.reporttype =='monthlyActiveRetailers' ? 
                                    <Grid item xs={12} sm={3}>
                                    <FormControl style={styles.selectStyle}>
                                        <InputLabel id="demo-mutiple-name-label">Select Year</InputLabel>
                                        <Select 
                                        disabled={this.state.generateReportLoader}
                                        labelId="demo-mutiple-name-label"
                                        id="demo-mutiple-name"
                                        
                                        name="year"
                                        value={this.state.year}
                                        onChange={this.onChange}
                                        input={<Input />}
                                        MenuProps={MenuProps}
                                        >
                                        {this.state.listofYear ? this.state.listofYear.map(name => (
                                            <MenuItem key={name} value={name} >
                                                {name}
                                            </MenuItem>
                                        )): ""}
                                    
                                        </Select>
                                    </FormControl>
                                </Grid>
                            : ""}

                            {this.state.reporttype =='monthlyActiveRetailers' ? 
                                <Grid item xs={12} sm={3}>
                                    <FormControl style={styles.selectStyle}>
                                        <InputLabel id="demo-mutiple-name-label">Select Month</InputLabel>
                                        <Select 
                                        disabled={this.state.generateReportLoader}
                                        labelId="demo-mutiple-name-label"
                                        id="demo-mutiple-name"
                                        
                                        name="month"
                                        value={this.state.month}
                                        onChange={this.onChange}
                                        input={<Input />}
                                        MenuProps={MenuProps}
                                        >
                                        <MenuItem key='1' value='jan'>January</MenuItem>
                                        <MenuItem key='2' value='feb'>February</MenuItem>
                                        <MenuItem key='3' value='mar'>March</MenuItem>
                                        <MenuItem key='4' value='apr'>April</MenuItem>
                                        <MenuItem key='5' value='may'>May</MenuItem>
                                        <MenuItem key='6' value='jun'>June </MenuItem>
                                        <MenuItem key='7' value='jul'>July</MenuItem>
                                        <MenuItem key='8' value='aug'>August</MenuItem>
                                        <MenuItem key='9' value='sept'>September</MenuItem>
                                        <MenuItem key='10' value='oct'>October</MenuItem>
                                        <MenuItem key='11' value='nov'>November</MenuItem>
                                        <MenuItem key='12' value='dec'>December</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                :""}

                            
                          

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


                            <Grid item xs={12} sm={3} item alignItems='flex-end'>
                                
                                {!this.state.generateReportLoader ? 
                                <Button disabled={this.state.disabledGenButton} variant="contained" color="Primary" style={{ marginLeft: '20px' }} onClick={this.getReportDetails} >Generate Report</Button>
                                :""}
                                
                                {this.state.generateReportLoader ? 
                                <Typography  component="h5" color="primary" gutterBottom>
                                    {this.state.generateReportMsg}
                                </Typography>
                                :""}
                            </Grid>
                            <Grid item xs={12} sm={9} item alignItems='flex-end'  >
                                {this.state.responseFlag ? 
                                <CSVLink data={this.state.products}
                                  //  filename={this.state.verficationname + this.state.reporttype+"_"+ this.state.retrieveType.toLowerCase()+"_"+this.dateFormat(this.state.startDate)+ "_to_"+this.dateFormat(this.state.endDate)+".csv"}
                                    filename={downloadfilename}
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
                                    filename={"DataEntryReport_of_"+this.state.reporttype+"_"+this.state.retrieveType.toLowerCase()+"_"+this.dateFormat(this.state.startDate)+ "_to_"+this.dateFormat(this.state.endDate)+".csv"} 
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