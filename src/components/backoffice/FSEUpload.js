import React, { useState } from "react";
import AdminService from "../service/AdminService";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Notify from "../../utils/Notify";
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import VisibilityIcon from '@material-ui/icons/Visibility';
import PostLoginNavBar from "../PostLoginNavbar";
import { Container } from "@material-ui/core";
import { resolveResponse } from "../../utils/ResponseHandler";
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import TablePagination from '@material-ui/core/TablePagination';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Title from './Title';
import InputLabel from "@material-ui/core/InputLabel";
import { CRO_API_BASE_URL } from "../../utils/config";
import { CSVLink } from "react-csv";
import md5  from 'md5'; 
import  {DEV_PROTJECT_PATH} from "../../utils/config";
import MonthYearCalender from "./MonthYearCalender";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";

import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import $ from 'jquery'; 

class FSEUpload extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            products: [],
            deletefile:'', 
            searchby:'',
            startDate:"", 
            endDate: '',
            retailerDetails: '',
            allOfferData:"",
            selectedIds:[],
            fscDetails: [{"id" : 1, "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", },{"id" : 2, "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", },{"id" : 3, "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", },{"id" : 4, "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", }]
        };
        this.uploadOffer = this.uploadOffer.bind(this);
        this.relailerDelete = this.relailerDelete.bind(this);
        this.searchRetailer = this.searchRetailer.bind(this);
        this.myCallback = this.myCallback.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.selectAll = this.selectAll.bind(this);

        

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


    myCallback = (date) => {

        var startDate = '', endDate='';
        startDate = new Date(date);
        startDate = new Date("1 " + startDate.toLocaleString('default', { month: 'short' }) + ' ' +date.getFullYear());
        startDate.setHours(0,0,0,0);
        this.setState({startDate: startDate.getTime()})    

        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        endDate.setHours(23,59,59,59);  
        this.setState({endDate: endDate.getTime()})    

       // console.log("startDate", this.state.startDate , "endDate", this.state.endDate);
    };

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

        const re = /^[0-9\b]+$/;
        if (e.target.value === '' || re.test(e.target.value) && e.target.value.length <= 10) {
            this.setState({searchby: e.target.value})
        }

    }



    componentDidMount() {
        this.myCallback(new Date());
        
        // AdminService.downlaodFSCData()
        // .then((res) => {
        //     let data = resolveResponse(res);
        //     if (data.result)
        //         this.setState({ allOfferData: data.result })
        //     });

    }


    uploadOffer() {
    
        console.log(this.state.uploadfile);

            if(!this.state.uploadfile || document.getElementById('uploadfile').value ==""){
                Notify.showError("Missing required file to upload");
                return;
            }

        

            // var userDetails = localStorage.getItem("userDetails")
            // userDetails = userDetails && JSON.parse(userDetails);

            const formData = new FormData();
            formData.append('campDetails',this.state.uploadfile);
            formData.append('startDate', this.state.startDate);
            formData.append('endDate',this.state.endDate);

            
            AdminService.uploadFSCCampin(formData).then(data => {

           // var data = resolveResponse(data, "FSE Uploaded Successfully.");
            var data = data && data.data;
            if(data.status == 200){
                Notify.showSuccess("FSC Camping Uploaded Successfully.");
            }else{
                Notify.showError(data.message);
                if(data.status === 1010 ){
                    localStorage.clear();
                    //return window.location.replace("/#/login");
                    return Promise.reject(window.location.replace("#/login"));
                }
            }

          
            document.getElementById('uploadfile').value = "";
        
            });
    }


    relailerDelete() {
    
        if(this.state.selectedIds.length <1){
            Notify.showError("Select row(s) to delete");
            return;
        }

        var userDetails = localStorage.getItem("userDetails")
        userDetails = userDetails && JSON.parse(userDetails);

        const formData = new FormData();
        formData.append('file',this.state.deletefile);
        formData.append('submittedBy', userDetails && userDetails.loginId);
        formData.append('email', '');
    
        
        AdminService.deleteRetailer(formData).then(res => {
        resolveResponse(res,'');
        Notify.showSuccess("Attached retailer info deleted successfully.");
        document.getElementById('deletefile').value = ""; 

        });
    }

    searchRetailer(){
       
            if(!this.state.searchby){
                Notify.showError("Type by lapu number or Retailer AirtelId Id ");
                return;
            }
    
            var userDetails = localStorage.getItem("userDetails")
            userDetails = userDetails && JSON.parse(userDetails);
    
            const param = {
                lapuNumber : this.state.searchby, 
                retailerAirtelId: this.state.searchby, 
            }
        
            AdminService.searchRetailer(param).then(res => {
            var data = resolveResponse(res,'');
           
                var staticdata = {
                    "message": "string",
                    "result": {
                    "distributerId": "string",
                    "distributerMsisdn": "string",
                    "distributerName": "string",
                    "district": "string",
                    "fseId": "string",
                    "fseMsisdn": "string",
                    "fseName": "string",
                    "retailerAirtelId": "string",
                    "retailerName": "string",
                    "retailerVLNumber": "string",
                    "territory": "string",
                    "tmId": "string",
                    "tmMsisdn": "string",
                    "tmName": "string",
                    "zbmId": "string",
                    "zbmMsisdn": "string",
                    "zbmName": "string",
                    "zone": "string"
                    },
                    "status": 0
                }
                
                if(data.result){
                    this.setState({ retailerDetails :  [data.result] })
                }else{
                   // this.setState({ retailerDetails :  [staticdata.result] })
                }
        });
    }

    addProduct() {
        this.props.history.push('/add-product');
    }

    someAction() {
        alert("action happed in other commpornt");
    }


    editProduct(productId) {
        console.log("productid", productId)

        window.localStorage.setItem("selectedProductId", productId);
        this.props.history.push('/edit-doc');
    }

    selectAll = name => event =>{
       
      //  console.log("fscDetails",  this.state.fscDetails) 
        $('.fseItems').prop('checked', event.target.checked);  

        if(event.target.checked){
            var ids = this.state.fscDetails && this.state.fscDetails.map(row => row.id); 
            this.setState({ selectedIds :  ids })
        }else{
            this.setState({ selectedIds :  [] })
        }


        console.log( this.state.selectedIds);
        


    }

    handleChange = name => event => {
         if(event.target.checked){
            this.state.selectedIds.push(name); 
         }else{
            this.state.selectedIds.pop(name); 
         }

         console.log( this.state.selectedIds);
    }


    render() {



        // $('#selectAll').click(function () {    
        //     $('.fseItems').prop('checked', this.checked);     
           
        //   //  console.log(  this.state.selectedIds) 
        //   //  this.state.fscDetails.map(function(row){ console.log( row.id ) } );
            
        // });

        return (

            <React.Fragment >
                <PostLoginNavBar />

            <div style={{ padding: "40px" }} >
                <Paper style={{padding:"15px",  position:"sticky", width:"98%"}}>
                    <Typography component="h2" variant="h6" color="primary" gutterBottom>
                        FSE Camping  Upload
                    </Typography> 
                    <Grid container className="flexGrow" spacing={3} style={{ padding: "10px" }}>
                        
                    <Grid item xs={12} sm={3}>
                            <InputLabel htmlFor="Connection Type" >
                                <Typography variant="subtitle1">
                                    <Link color="primary" href={DEV_PROTJECT_PATH+"/webdata/FSEUploadTemplate.xlsx"}>Download Sample</Link>
                                </Typography>
                            </InputLabel>
                        </Grid>
                        

                        <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle1">Upload FSE Camping</Typography>
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
                            <MonthYearCalender calParams={{myCallback: this.myCallback}}/>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <Button startIcon={<CloudUploadIcon />}  variant="contained" color="primary" style={{ marginLeft: '20px' }} onClick={this.uploadOffer}>Upload</Button>
                        </Grid>
                    </Grid>
                </Paper>

                <br />
                <Paper style={{padding:"15px",  position:"sticky", width:"98%"}}>
                <Grid syt  container spacing={1} container
                    direction="row"
                    justify="right"
                    alignItems="center">
                        <Grid item xs={12} sm={4} >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            FSE Camping Search and Delete
                        </Typography> 
                        </Grid>
                        <Grid item xs={12} sm={2} item > 
                            <TextField type="text" value={this.state.searchby } label=" By Retailer Number  " style={{ width: "100%" }} name="RetailerNumber" onChange={this.onChange} />
                        </Grid>
                        <Grid item xs={12} sm={2} item > 
                            <TextField type="text" value={this.state.searchby } label=" By FSE Number  " style={{ width: "100%" }} name="FSENumber" onChange={this.onChange} />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <MonthYearCalender calParams={{myCallback: this.myCallback}}/>
                        </Grid>
                        <Grid item xs={12} sm={2} item style={{textAlign:"left"}} > 
                            <Button startIcon={<SearchIcon/>} variant="contained" color="" style={{ marginLeft: '20px' }} onClick={this.searchRetailer}>Search</Button>
                        </Grid>
                </Grid>
                </Paper>


                <Paper style={{padding:"15px", position:"sticky", width:"98%", overflowX:"auto"}} >
                <FormControl component="fieldset">
                        
                        <FormGroup aria-label="position" row>
                    <Table aria-label="sticky table">
                        <TableHead >
                            <TableRow style={{width:"170px",whiteSpace: "nowrap"}}>
                                <TableCell align=""> 
                            
                                
                                <FormControlLabel
                                value="All"
                                control={<Checkbox onChange={this.selectAll()} color="primary"  />}
                                label="Select All"
                                labelPlacement="right"
                                />
                           

                                </TableCell>
                                <TableCell align="">Date Of Camp</TableCell>
                                <TableCell align="">FSE ID(Lapu no)</TableCell>
                                <TableCell align="">Retailer Number</TableCell>
                                <TableCell align="">Retailer Name</TableCell>
                                <TableCell align="">Retailer Address</TableCell>
                                <TableCell align="">Retailer Lat Long</TableCell>
                                <TableCell align="">Target Acquisition</TableCell>
                                <TableCell align="">Target Recharge Count</TableCell>
                                <TableCell align="">Target Recharge Amount</TableCell>
                                <TableCell align="">Target SIM Swap </TableCell>
                            </TableRow>
                        </TableHead>

                        
                        <TableBody style={{width:"",whiteSpace: "nowrap"}}>
                            {this.state.fscDetails ? this.state.fscDetails.map(row => (
                                <TableRow hover   key={row.refNumber} > 
                            
                                <TableCell><div> <label> <input type="checkbox" className="fseItems" onChange={this.handleChange(row.id)} /></label></div></TableCell>
                                {/* <TableCell>  <Checkbox color="primary" className="fseItems"  onChange={this.handleChange(row.id)}   /></TableCell> */}
                                <TableCell align="">{row.one}</TableCell>
                                <TableCell align="">{row.one}</TableCell>
                                <TableCell align="">{row.one}</TableCell>
                                <TableCell align="">{row.one}</TableCell>
                                <TableCell align="">{row.one}</TableCell>
                                <TableCell align="">{row.one}</TableCell>
                                <TableCell align="">{row.one}</TableCell>
                                <TableCell align="">{row.one}</TableCell>
                                <TableCell align="">{row.one}</TableCell>
                                <TableCell align="">{row.one}</TableCell>
                                    
                                </TableRow>
                            )):  ""}
                        </TableBody>

                       
                    </Table>  


                    {this.state.fscDetails.length > 0 ? 
                    <Grid syt  container spacing={1} container
                    direction="row"
                    alignItems="left">
                        <Grid item xs={12} sm={2} item style={{textAlign:"left"}} > 
                             <br />
                            <Button startIcon={<DeleteIcon/>} variant="contained" color="" style={{ marginLeft: '20px' }} onClick={this.relailerDelete}>Delete Selected</Button>
                        </Grid>
                    </Grid>
                    :"" }

                    </FormGroup>
                            </FormControl>

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


export default FSEUpload;