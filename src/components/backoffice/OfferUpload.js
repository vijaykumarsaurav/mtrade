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


class OfferUpload extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            products: [],
            retailerOnboardExcelTemplatePath: "",
            retailerDeleteExcelTemplatePath: "",
            deletefile:'', 
            searchby:'',
            retailerDetails: ''


        };
        this.getAdmminStaticData = this.getAdmminStaticData.bind(this);
        this.relailerOnboard = this.relailerOnboard.bind(this);
        this.relailerDelete = this.relailerDelete.bind(this);
        this.searchRetailer = this.searchRetailer.bind(this);
    }

    onChangeFileUpload = e => {
        var extention =  e.target.files[0] && e.target.files[0].name.split('.').pop();
        console.log("extention",extention);
        if(extention != 'xlsx' ){
            Notify.showError("Only xlsx file allow to upload");
            document.getElementById(e.target.name).value = "";
            return;
        }else{
            console.log(e.target.name); 
                this.setState({[e.target.name]: e.target.files[0]})
        }
    }



    onChange = (e) => {

        const re = /^[0-9\b]+$/;
        if (e.target.value === '' || re.test(e.target.value) && e.target.value.length <= 10) {
            this.setState({searchby: e.target.value})
        }

    }



    componentDidMount() {
        this.getAdmminStaticData();
    }

    getAdmminStaticData() {

        AdminService.getStaticData("ADMIN")
            .then((res) => {

                let data = resolveResponse(res);

                if (data.result && data.result)
                    this.setState({ retailerOnboardExcelTemplatePath: data.result.retailerOnboardExcelTemplatePath, retailerDeleteExcelTemplatePath: data.result.retailerDeleteExcelTemplatePath })
                
                });


           
            

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
            formData.append('submittedBy',userDetails && userDetails.loginId);
            formData.append('email', '');
        
            
            AdminService.uploadRetailer(formData).then(res => {
            resolveResponse(res, "Retailer On-Boarded successfully.");
            Notify.showSuccess("Retailer On-Boarded successfully.");
            document.getElementById('uploadfile').value = "";

        
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

    convertBool(flag) {
        return flag ? 'Yes' : 'No';
    }





    render() {

        return (

            <React.Fragment >
                <PostLoginNavBar />

            <div style={{ padding: "40px" }} >
                <Paper style={{ padding: "15px" }}>
                    <Typography component="h2" variant="h6" color="primary" gutterBottom>
                         Customer Offer Upload
                        </Typography> 
                    <Grid container className="flexGrow" spacing={3} style={{ padding: "10px" }}>
                        <Grid item xs={12} sm={3}>
                            <InputLabel htmlFor="Connection Type" >
                                <Typography variant="subtitle1">
                                    <Link color="primary" href={this.state.retailerOnboardExcelTemplatePath}>Download Sample</Link>
                                </Typography>
                            </InputLabel>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle1">Upload Offer</Typography>
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


export default OfferUpload;