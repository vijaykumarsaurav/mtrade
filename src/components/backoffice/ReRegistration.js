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
import CircularProgress from '@material-ui/core/CircularProgress';
import  {DEV_PROTJECT_PATH} from "../../utils/config";
import ActivationService from "../service/ActivationService";

class ReRegistration extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            products: [],
            deletefile:'', 
            searchby:'',
            retailerDetails: '',
            allOfferData:"", 
            progressBar: false,
            bulkProgressBar: false,
            successMsg:"",
            bulkSuccessMsg: ""
        };
        this.uploadOffer = this.uploadOffer.bind(this);
        this.bulkUploadOffer = this.bulkUploadOffer.bind(this);

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
            if(fileSize >= 0 && fileSize <= 2048){
              Object.defineProperty(file, 'name', {
                writable: true,
                value:  md5(file.name) +"."+ fileext
              });
              
              return file;
            }else{
              Notify.showError("File size should be grater than 5KB and less than 2MB")
            }
        }else {
          Notify.showError("Only csv file allow to upload")
        }
        return false;
      }

      validateBulkUploadFile = (file) => {
        const filename = file.name.toString(); 
    
        if (/[^a-zA-Z0-9\.\-\_ ]/.test(filename)) {
            Notify.showError("File name can contain only alphanumeric characters including space and dots")
            return false;
        }
    
        const fileext =  filename.split('.').pop(); 
        console.log("File Extension: ",fileext);

        if(fileext == 'csv'){
            var fileSize = file.size / 1000; //in kb
            if(fileSize >= 0 && fileSize <= 2048){
              Object.defineProperty(file, 'name', {
                writable: true,
                value:  md5(file.name) +"."+ fileext
              });
              
              return file;
            }else{
              Notify.showError("File size should be grater than 5KB and less than 2MB")
            }
        }else {
          Notify.showError("Only  csv file allow to upload")
        }
        return false;
      }


    onChangeFileUpload = e => {
        console.log(e.target.name);
        var fileToUpload = this.validateUploadFile(e.target.files[0]);

        if(fileToUpload){
           
            this.setState({[e.target.name]: e.target.files[0]})
            return;
        }else{
            console.log("Not Valid file: ",e.target.name); 
            document.getElementById(e.target.name).value = "";
        }
    }


    onChangeBulkFileUpload = e => {
        console.log(e.target.name);
        var fileToUpload = this.validateBulkUploadFile(e.target.files[0]);
        
        if(fileToUpload){
           
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
        // AdminService.downlaodFSCData()
        // .then((res) => {
        //     let data = resolveResponse(res);
        //     if (data.result)
        //         this.setState({ allOfferData: data.result })
        //     });

        ActivationService.checkSession().then(res => {
            resolveResponse(res);
        })

    }

    
    bulkUploadOffer() {
    
         console.log(this.state.customer_kyc_data);

            if(!this.state.customer_kyc_data || document.getElementById('customer_kyc_data').value ==""){
                Notify.showError("Missing required file to upload");
                return;
            }

            // var userDetails = localStorage.getItem("userDetails")
            // userDetails = userDetails && JSON.parse(userDetails);
            this.setState({bulkProgressBar: true})
            const formData = new FormData();
            formData.append('customer_kyc_data',this.state.customer_kyc_data);
          //  formData.append('submittedBy',userDetails && userDetails.loginId);
           // formData.append('email', '');
        
            
            AdminService.uploadBulkReRegistration(formData).then(res => {
            //  var dataddd = resolveResponse(data, "");
            var data = res.data;
            console.log("data", data); 
           
            this.setState({bulkProgressBar: false})
           // this.setState({bulkSuccessMsg: "Bulk Re-Registration Data Uploaded Successfully"})

            if(data.status == 200){

                this.setState({bulkSuccessMsg: "Bulk Re-Registration Data Uploaded Successfully"})

                setTimeout(() => {
                    this.setState({bulkSuccessMsg: ""})
                }, 10000);
             //   Notify.showSuccess(" Data Uploaded Successfully.");
            }else{
                Notify.showError(data.message);
            }
          
            document.getElementById('customer_kyc_data').value = "";
        
            });
    }




    uploadOffer() {
    

        console.log(this.state.uploadfile);

            if(!this.state.uploadfile || document.getElementById('uploadfile').value ==""){
                Notify.showError("Missing required file to upload");
                return;
            }

            // var userDetails = localStorage.getItem("userDetails")
            // userDetails = userDetails && JSON.parse(userDetails);
            this.setState({progressBar: true})
            const formData = new FormData();
            formData.append('file',this.state.uploadfile);
          //  formData.append('submittedBy',userDetails && userDetails.loginId);
           // formData.append('email', '');
        
            
            AdminService.uploadReRegistration(formData).then(data => {
            //  var dataddd = resolveResponse(data, "");
           // console.log("data", dataddd); 
            var data = data && data.data;
            this.setState({progressBar: false})
            if(data.status == 200){
                this.setState({successMsg: "Re-Registration Data Uploaded Successfully"})

                setTimeout(() => {
                    this.setState({successMsg: ""})
                }, 10000);
             //   Notify.showSuccess(" Data Uploaded Successfully.");
            }else{
                Notify.showError(data.message);
            }
          
            document.getElementById('uploadfile').value = "";
        
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
                    Customer Re-Registration Upload
                    </Typography> 
                    <Grid container className="flexGrow" spacing={3} style={{ padding: "10px" }}>
                        <Grid item xs={12} sm={3}>
                            <InputLabel htmlFor="Connection Type" >
                                <Typography variant="subtitle1">
                                    <Link color="primary" href={"/webdata/ReRegistrationExcel.xlsx"}>Download Sample</Link>
                                </Typography>
                            </InputLabel>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle1">Upload Re-Registration excel file</Typography>
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
                            { !this.state.progressBar ? <Button startIcon={<CloudUploadIcon />}  variant="contained" color="primary" style={{ marginLeft: '20px' }} onClick={this.uploadOffer}>Upload</Button> : ""} 
                            {this.state.progressBar ?  <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <CircularProgress /> </>: ""}
                        </Grid>

                        <Grid item xs={12} sm={12} style={{textAlign:"center"}}>
                           <Typography variant="subtitle1" style={{color: "green"}}>   <b> {this.state.successMsg}  </b></Typography>
                        </Grid>
                    </Grid>
                </Paper>

                <br />

                <Paper style={{ padding: "15px" }}>
                    <Typography component="h2" variant="h6" color="primary" gutterBottom>
                   Bulk Customer Re-Registration Upload
                    </Typography> 
                    <Grid container className="flexGrow" spacing={3} style={{ padding: "10px" }}>
                        <Grid item xs={12} sm={3}>
                            <InputLabel htmlFor="Connection Type" >
                                <Typography variant="subtitle1">
                                    <Link color="primary" href={"/webdata/kyc.csv"}>Download Sample</Link>
                                </Typography>
                            </InputLabel>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle1">Upload Re-Registration csv file</Typography>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle1">
                            <input
                                    type="file"
                                    name="customer_kyc_data"
                                    id="customer_kyc_data"
                                    // onChange={this.onChangeHandler}
                                    onChange={this.onChangeBulkFileUpload}
                                  />
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            { !this.state.bulkProgressBar ? <Button startIcon={<CloudUploadIcon />}  variant="contained" color="primary" style={{ marginLeft: '20px' }} onClick={this.bulkUploadOffer}>Upload</Button> : ""} 
                            {this.state.bulkProgressBar ?  <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <CircularProgress /> </>: ""}
                        </Grid>

                        <Grid item xs={12} sm={12} style={{textAlign:"center"}}>
                           <Typography variant="subtitle1" style={{color: "green"}}>   <b> {this.state.bulkSuccessMsg}  </b></Typography>
                        </Grid>
                    </Grid>
                </Paper>

                <br />
              

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


export default ReRegistration;