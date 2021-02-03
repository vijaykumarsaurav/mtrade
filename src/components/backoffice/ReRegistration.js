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
            successMsg:""
        };
        this.uploadOffer = this.uploadOffer.bind(this);
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

           // var data = resolveResponse(res, "Offer Uploaded Successfully.");
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
                    Customer  Re-Registration Upload
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
                            <Typography variant="subtitle1">Upload  Re-Registration Excel</Typography>
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

                {/* <Paper style={{ padding: "15px" }}>
                     <Typography component="h2" variant="h6" color="primary" gutterBottom>
                         Download FSC Details
                    </Typography> 

                    <Typography variant="subtitle1" gutterBottom>
                        Total FSC Details:{this.state.allOfferData.length}
                    </Typography>

                    {this.state.allOfferData ? 
                        
                        <CSVLink data={this.state.allOfferData}
                        filename={"offers-details.csv"}
                        className="btn btn-primary"
                        target="_blank"
                        >
                        <Typography variant="subtitle1"  gutterBottom>
                            Download FSC
                        </Typography>

                        </CSVLink> 
                        
                    :""}
                </Paper> */}

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