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
import MaterialUIDateTimePicker from "../../utils/MaterialUIDateTimePicker";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';


import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from "@material-ui/core/Input";


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
            bulkSuccessMsg: "",
            ftrType: "Inclusion"
        };
        this.uploadOffer = this.uploadOffer.bind(this);
        this.onChange = this.onChange.bind(this);
        this.myCallback = this.myCallback.bind(this);

        

    }

    onChange = (e) =>{
        console.log("e.target.value", e.target.value)
        this.setState({[e.target.name]: e.target.value})
    }

    myCallback = (date, fromDate) => {
        if (fromDate === "START_DATE") {
          this.setState({ startDate: new Date(date).getTime() });
        } else if (fromDate === "END_DATE") {
          this.setState({ endDate: new Date(date).getTime() });
        }
      };
    




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

    onChangeCSVFileUpload = e => {
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

    

    uploadOffer() {
    

        console.log(this.state.uploadfile);

            if(!this.state.uploadfile || document.getElementById('uploadfile').value ==""){
                Notify.showError("Missing required file to upload");
                return;
            }

            if(!this.state.startDate){
                this.state.startDate = new Date().getTime();
            }
          
            if(!this.state.endDate){
                this.state.endDate = new Date().getTime();
            }
            let startDatetime = new Date(this.state.startDate).getTime();
            let endDatetime = new Date(this.state.endDate).getTime();
            if(startDatetime == endDatetime){
              Notify.showError("Start and end date time should not be same");
              return;
            }

            // var userDetails = localStorage.getItem("userDetails")
            // userDetails = userDetails && JSON.parse(userDetails);
            this.setState({progressBar: true})
            const formData = new FormData();
            formData.append('ftrDetails',this.state.uploadfile);
            formData.append('exc',this.state.ftrType ==="Exclusion" ? true : false);

            formData.append('startDate', this.state.startDate);
            formData.append('endDate', this.state.endDate);

           // formData.append('email', '');
        
            
            AdminService.uploadFTRMapping(formData).then(data => {
            //  var dataddd = resolveResponse(data, "");
           // console.log("data", dataddd); 
            var data = data && data.data;
            this.setState({progressBar: false})
            if(data.status == 200){
                this.setState({successMsg: "FTR mapping data uploaded successfully"})

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

    handleChange = (event) => {
        console.log(event.target.name, event.target.value)
        this.setState({[event.target.name]: event.target.value})
      };
    

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

        const dateParam = {
            myCallback: this.myCallback,
            startDate: '',
            endDate:'', 
            firstLavel : "Start Date and Time", 
            secondLavel : "End Date and Time"
      
          }

        return (

            <React.Fragment >
                <PostLoginNavBar />

            <div style={{ padding: "40px" }} >
                <Paper style={{ padding: "15px" }}>
                    <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    Specific Retailer FTR Mapping
                    </Typography> 
                    <Grid container className="flexGrow" spacing={3} style={{ padding: "10px" }}>
                      
                        <Grid item xs={12} sm={3}>
                                     <FormControl style={styles.selectStyle}>
                                        <InputLabel id="demo-mutiple-name-label">Select type</InputLabel>
                                        <Select
                                        labelId="demo-mutiple-name-label"
                                     
                                        name="ftrType"
                                        value={this.state.ftrType}
                                        onChange={this.onChange}
                                        input={<Input />}
                                        MenuProps={MenuProps}
                                        >
                                            <MenuItem value="Inclusion">Inclusion</MenuItem>
                                            <MenuItem value="Exclusion">Exclusion</MenuItem>
                                          
                                        </Select>
                                    </FormControl>

                                    {/* <FormControl component="fieldset">
                                    <RadioGroup row aria-label="Select type" name="reasonName" value={'Exclusion'}>

                                    <Grid item >
                                            <FormControlLabel
                                                value={'Exclusion'}
                                                control={<Radio color="primary" />}
                                                label={'Inclusion'}
                                                //onChange={this.handleChange}
                                              
                                                />
                                            </Grid>

                                            <Grid item >
                                            <FormControlLabel
                                                value={'Inclusion'}
                                                control={<Radio color="primary" />}
                                                label={'Inclusion'}
                                               // onChange={this.handleChange}
                                               // style={{ borderRadius: "10px", background: "beige"}}
                                                />
                                            </Grid>
                                        
                                        </RadioGroup>
                                    </FormControl> */}

                                    {/* <br />  <br /><br />  <br /> */}

                        </Grid>

                        <Grid item xs={12} sm={6}>

                        <MaterialUIDateTimePicker callbackFromParent={dateParam} />
                            <input type="hidden" id="startDateMili" /> 
                            <input type="hidden" id="endDateMili" />                         
        
                        </Grid>

                       </Grid>

                       <Grid container className="flexGrow" spacing={3} style={{ padding: "10px" }}>



                        <Grid item xs={12} sm={3}> 
                         <InputLabel htmlFor="Connection Type" >
                            <Typography variant="subtitle1">
                                <Link color="primary" href={"/webdata/FTRMapping.csv"}>Download Sample</Link>
                            </Typography>
                        </InputLabel>
                         </Grid>

                        
                         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <Grid item xs={12} sm={3}>
                       
                        <InputLabel id="demo-mutiple-name-label">Select file(.csv format only)</InputLabel>

                            <Typography variant="subtitle1">

                            <input
                                    type="file"
                                    name="uploadfile"
                                    id="uploadfile"
                                    // onChange={this.onChangeHandler}
                                    onChange={this.onChangeCSVFileUpload}
                                  />
                            </Typography>
                            <br/> <br/> 
                           
                        </Grid>

                       
                      
                        

                        <Grid item xs={12} sm={4}>
                        { !this.state.progressBar ? <Button startIcon={<CloudUploadIcon />}  variant="contained" color="primary" style={{ marginLeft: '20px' }} onClick={this.uploadOffer}>Upload</Button> : ""} 
                            {this.state.progressBar ?  <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <CircularProgress /> </>: ""}
                         </Grid>

                        

                        

                        <Grid item xs={12} sm={8} style={{textAlign:"center"}}>
                           <Typography variant="subtitle1" style={{color: "green"}}>   <b> {this.state.successMsg}  </b></Typography>
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
    },
    selectStyle:{
        marginBottom: '0px',
        minWidth: '100%',
        maxWidth: '100%'
    }
}


export default ReRegistration;