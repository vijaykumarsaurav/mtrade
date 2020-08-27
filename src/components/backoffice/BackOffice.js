import React, { useState } from "react";
import AdminService from "../service/AdminService";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Notify from "../../utils/Notify";

import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import PostLoginNavBar from "../PostLoginNavbar";
import { Container } from "@material-ui/core";
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Title from './Title';
import InputLabel from "@material-ui/core/InputLabel";

import ActivationService from "../service/ActivationService";
import {resolveResponse} from "../../utils/ResponseHandler";
import SimpleExpansionPanel from './SimpleExpansionPanel';
import md5  from 'md5'; 

import  {DEV_PROTJECT_PATH} from "../../utils/config";

class Retailer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            products: [],
            retailerOnboardExcelTemplatePath: "",
            retailerDeleteExcelTemplatePath: "",
            deletefile:'', 
            searchby:'',
            retailerDetails: '',
            uploadResponse: '', // [{laId: "b0208057", reason : "Given Laid already created"},{laId: "b0208058", reason : "Given Laid already created"}],
            deleteResponse:""


        };
        this.relailerOnboard = this.relailerOnboard.bind(this);
        this.relailerDelete = this.relailerDelete.bind(this);
        this.searchRetailer = this.searchRetailer.bind(this);
    }

    validateUploadFile = (file) => {
        const filename = file.name.toString(); 
    
        if (/[^a-zA-Z0-9\.\-\_ ]/.test(filename)) {
            Notify.showError("File name can contain only alphanumeric characters including space and dots")
            return false;
        }
    
        const fileext =  filename.split('.').pop(); 
        console.log("File Extension: ",fileext);

        if(fileext == 'xlsx'){
            var fileSize = file.size / 1000; //in kb
            if(fileSize >= 5 && fileSize <= 2048){
              Object.defineProperty(file, 'name', {
                writable: true,
                value:  md5(file.name) +"."+ fileext
              });
              return file;
            }else{
              Notify.showError("File size should be grater than 5KB and less than 2MB")
            }
        }else {
          Notify.showError("Only xlsx file allow to upload")
        }
        return false;
      }


    onChangeFileUpload = e => {
        const fileToUpload = this.validateUploadFile(e.target.files[0]);

        if(fileToUpload){
            console.log(e.target.name);
            this.setState({[e.target.name]: e.target.files[0]})
            return;
        }else{
            console.log("Not Valid file: ",e.target.name); 
            document.getElementById(e.target.name).value = "";
        }
    }




    onChange = (e) => {
        this.setState({searchby: e.target.value})
        // const re = /^[0-9\b]+$/;
        // if (e.target.value === '' || re.test(e.target.value) && e.target.value.length <= 10) {
        //     this.setState({searchby: e.target.value})
        // }

    }



    componentDidMount() {
       // this.getAdmminStaticData();
       ActivationService.getStaticData('ADMIN').then(res => {
        let data = resolveResponse(res);
        this.setState({listofzones: data.result && data.result.zones}) 
    })
    }

    relailerOnboard() {
    
        console.log(this.state.uploadfile);

            if(!this.state.uploadfile || document.getElementById('uploadfile').value ==""){
                Notify.showError("Missing required file to upload");
                return;
            }

            var userDetails = localStorage.getItem("userDetails")
            userDetails = userDetails && JSON.parse(userDetails);

            const formData = new FormData();
            formData.append('file',this.state.uploadfile);
           
        
            
            AdminService.uploadRetailer(formData).then(res => {
          //  resolveResponse(res, " On-Boarded successfully.");
            var data = resolveResponse(res);
            if(data.status == 200 && data.message == 'ok'){
                Notify.showSuccess("Agent On-Boarded successfully.");

            }

            document.getElementById('uploadfile').value = "";
            if(data.result && data.result.rejectedAgents){
                this.setState({ uploadResponse:  data.result.rejectedAgents })
            }
        
        
            });
    }


    relailerDelete() {
    
        if(!this.state.deletefile || document.getElementById('deletefile').value ==""){
        Notify.showError("Missing required file to upload");
        return;
        }

        var userDetails = localStorage.getItem("userDetails")
        userDetails = userDetails && JSON.parse(userDetails);

        const formData = new FormData();
        formData.append('file',this.state.deletefile);
    

        
        AdminService.deleteRetailer(formData).then(res => {
        var data = resolveResponse(res,'');

        if(data.status == 200 && data.message == 'ok'){
            Notify.showSuccess("Agent info deleted successfully.");

        }

        document.getElementById('deletefile').value = ""; 

        if(data.result && data.result.rejectedAgents){
            this.setState({ deleteResponse:  data.result.rejectedAgents})
        }
       

        });
    }

    searchRetailer(){
       
            if(!this.state.searchby){
                Notify.showError("Type by lapu number or Retailer AirtelId Id ");
                return;
            }
    
            var userDetails = localStorage.getItem("userDetails")
            userDetails = userDetails && JSON.parse(userDetails);
    
          
            AdminService.searchRetailer(this.state.searchby).then(res => {
                var data =resolveResponse(res, "Retailer On-Boarded successfully.");
                    if(data.result){
                        this.setState({ retailerDetails :  [data.result[0]] })
                    }

                    console.log("retailerDetails", this.state.retailerDetails); 
                });
        
              
 
    }

   






    render() {

        return (

            <React.Fragment >
                <PostLoginNavBar />


                



            <div style={{ padding: "40px" }} >


                  
                <Paper style={{padding:"10px", overflow:"auto"}} >
                
                <Grid syt  container spacing={24} container
                    direction="row"
                    justify="right"
                    alignItems="center">
                        <Grid item xs={12} sm={7} >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Back Office User Search 
                        </Typography> 
                        </Grid>

                        <Grid item xs={12} sm={3} item alignItems='flex-end'> 
                                <TextField type="text" value={this.state.searchby } label="Search User" style={{ width: "100%" }} name="searchby" onChange={this.onChange} />
                        </Grid>
                        <Grid item xs={12} sm={2} item alignItems='flex-end'  > 
                            <Button startIcon={<SearchIcon/>} variant="contained" color="" style={{ marginLeft: '20px' }} onClick={this.searchRetailer} >Search</Button>
                        </Grid>
                    </Grid>


                    <div style={{padding:"10px", overflow:"auto", height:"100px"}} >

                            <Table size="small"   aria-label="sticky table">
                                    <TableHead >
                                        <TableRow style={{width:"170px",whiteSpace: "nowrap"}}>
                                            <TableCell align="">User Id</TableCell>
                                            <TableCell align="">Name </TableCell>
                                            <TableCell align="">Msisdn</TableCell>
                                            <TableCell align="">Email</TableCell>
                                            <TableCell align="">TL ID</TableCell>
                                            <TableCell align="">TL No.</TableCell>
                                            <TableCell align="">Manager Id</TableCell>
                                            <TableCell align="">Manager No.</TableCell>
                                            <TableCell align="">Role</TableCell>
                                            <TableCell align="">Department</TableCell>
                                            <TableCell align="">Remarks</TableCell>
                                            <TableCell align="">Is Active</TableCell>


                                        </TableRow>
                                    </TableHead>

                                    <TableBody style={{width:"",whiteSpace: "nowrap"}}>
                                        {this.state.retailerDetails ? this.state.retailerDetails.map(row => (
                                            <TableRow hover   key={row.txnId} >
                                               
                                                <TableCell align="center" >{row.laid}</TableCell>
                                                <TableCell align="center">{row.name}</TableCell>
                                                <TableCell align="center">{row.msisdn}</TableCell>
                                                <TableCell align="center">{row.emailId}</TableCell>
                                                <TableCell align="center">{row.tlId}</TableCell>
                                                <TableCell align="center">{row.tlNum}</TableCell>
                                                <TableCell align="center">{row.managerId}</TableCell>
                                                <TableCell align="center">{row.managerNum}</TableCell>
                                                <TableCell align="center">{row.role}</TableCell>
                                                <TableCell align="center">{row.department}</TableCell>
                                                <TableCell align="center">{row.remarks}</TableCell>
                                                <TableCell align="center">{row.active ? "Yes": "No"}</TableCell>

                                                
                                            </TableRow>
                                        )):  ""}
                                    </TableBody>
                                </Table>

                    </div>
            </Paper>

            <br /><br /> 
                <Paper style={{ padding: "15px" }}>
                    <Title>Back Office On-Boarding </Title>
                    <Grid container className="flexGrow" spacing={3} style={{ padding: "10px" }}>
                        <Grid item xs={12} sm={3}>
                            <InputLabel htmlFor="Connection Type" >
                                <Typography variant="subtitle1">
                                    {/* <Link color="primary" href={this.state.retailerOnboardExcelTemplatePath}>Download Sample</Link> */}
                                    <Link color="primary" href={DEV_PROTJECT_PATH+"/webdata/AgentOnboardingTemplate.xlsx"}>Download Sample</Link>

                                </Typography>
                            </InputLabel>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle1"> Upload or Update User </Typography>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle1">

                            <input
                                    type="file"
                                    name="uploadfile"
                                    id="uploadfile"

                                    // onChange={this.onChangeHandler}
                                    onChange={this.onChangeFileUpload}
                                  />
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <Button startIcon={<CloudUploadIcon />}  variant="contained" color="primary" style={{ marginLeft: '20px' }} onClick={this.relailerOnboard}>Upload</Button>
                        </Grid>


                    </Grid>

                    <Grid container className="flexGrow" spacing={3} style={{ padding: "10px" }}>
                        <Grid item xs={12} sm={12}>
                            <Typography variant="subtitle1"> </Typography>
                             {this.state.uploadResponse ? <SimpleExpansionPanel message={ this.state.uploadResponse} />: "" }
                            
                        </Grid>

                    </Grid>
                </Paper>

            

                
            

                <br /><br />
                <Paper style={{ padding: "15px" }}>
                    <Title>Back Office Delete </Title>
                    <Grid container className="flexGrow" spacing={3} style={{ padding: "10px" }}>


                        <Grid item xs={12} sm={3}>

                            <InputLabel htmlFor="Connection Type" >
                                <Typography variant="subtitle1">
                                    {/* <Link color="primary" href={this.state.retailerDeleteExcelTemplatePath}>Download Delete Sample </Link> */}
                                    <Link color="primary" href={DEV_PROTJECT_PATH+"/webdata/AgentDeleteTemplate.xlsx"}>Download Delete Sample </Link> 
                                </Typography>
                            </InputLabel>

                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle1">Bulk Delete User</Typography>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle1">
                            <input
                                    type="file"
                                    name="deletefile"
                                    id="deletefile"
                                    // onChange={this.onChangeHandler}
                                    onChange={this.onChangeFileUpload}
                                  />
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <Button startIcon={<DeleteIcon/>} variant="contained" color="primary" style={{ marginLeft: '20px' }} onClick={this.relailerDelete} >Delete</Button>
                        </Grid>


                    </Grid>

                    <Grid container className="flexGrow" spacing={3} style={{ padding: "10px" }}>
                        <Grid item xs={12} sm={12}>
                            <Typography variant="subtitle1"> </Typography>
                             {this.state.deleteResponse ? <SimpleExpansionPanel message={this.state.deleteResponse} />: "" }
                            
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
    }
}


export default Retailer;