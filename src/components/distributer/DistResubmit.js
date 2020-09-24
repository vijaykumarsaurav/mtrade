import React, { useState }  from "react";
import ActivationService from "../service/ActivationService";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TextField from '@material-ui/core/TextField';
import axios from "axios";
import CircularProgress from '@material-ui/core/CircularProgress';
import Notify from "../../utils/Notify";


import Paper from "@material-ui/core/Paper";
import TableBody from "@material-ui/core/TableBody";
import Grid from "@material-ui/core/Grid";

import VisibilityIcon from '@material-ui/icons/Visibility';
import PostLoginNavBar from "../PostLoginNavbar";
import {Container} from "@material-ui/core";
import {resolveResponse} from "../../utils/ResponseHandler";
import FormControlLabel from '@material-ui/core/FormControlLabel';

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from "@material-ui/core/Input";
import md5  from 'md5'; 

class DataEntryList extends React.Component{
 
    constructor(props) {
        super(props);
        this.state ={
                             
            products: [],
            mobile:'',
            sim:'',
            txnId:'',
            poiType:'',
            poiNumber:'',

            user_image:false,
            user_image_upload:false,
            user_signature_loader:false,
            user_signature_upload:false,

            retailer_signature_loader:false,
            uploadFlag:false,

            poi_front_image_loader:false,
            poi_front_image_upload:false,

            poi_back_image_loader:false,
            poi_back_image_upload:false,

            pef_image_loader:false,
            pef_image_upload:false,
            pef_image_response:false,
            poi_front_image_response:false,
            poi_back_image_response:false,

            numberFound:false,
            uploadResponse: "", 
            uploadLoader:false
            
        };

        this.loadProductList = this.loadProductList.bind(this);
        this.onChange = this.onChange.bind(this);
        this.searchOnDB = this.searchOnDB.bind(this); 
        this.onUploadFiles = this.onUploadFiles.bind(this);   
     
    }


    componentDidMount() {
        // this.loadProductList();
    }
 

    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value});

       // console.log(e.target.value , e.target.value.length,  e.target.value.substring(0, 10));
        if(e.target.name =="mobile" && e.target.value.length > 10){
            this.setState({mobile: e.target.value.substring(0, 10)});   
        }

        if(e.target.name =="sim" && e.target.value.length > 20){
            this.setState({sim: e.target.value.substring(0, 20)});   
        }
       
    }
     
    loadProductList() {
        var d = new Date();
        var endTime = d.getTime();

        var startTime = endTime - 259200000; 
        const data = {
            "zone" : "West 1",
            "startDate" : startTime,
            "endDate" : endTime,
            "type" : "NEXT",
            "noOfRecords" : 20
        }; 
           ActivationService.listDocs(data)
            .then((res) => {
              
                let data = resolveResponse(res);
                if(data.result && data.result.activationList)
                this.setState({products: data.result.activationList})
            });   
        
    }

    searchOnDB() {       
           window.localStorage.setItem("deviceId",new Date().getTime().toString())

           document.getElementById("uploadform").reset();
           this.setState({uploadResponse: "",pef_image : null, poi_front_image:null , poi_back_image : null })

            // document.getElementById('pef_image_file').innerHTML = ''; 
            // document.getElementById('poi_front_image_file').innerHTML = ''; 
            // document.getElementById('poi_back_image_file').innerHTML = ''; 

            const data = {
                "mobileNumber" : this.state.mobile
            }; 

           ActivationService.searchDistributerResubmit(data)
            .then((res) => {
              
                let data = resolveResponse(res);
                if(data.message == "ok" && data.status == 200){
                    this.setState({nic:data.result.nic, numberFound : true, ftaDate : data.result.ftaDate, uploadFlag: true})
                    this.setState({txnId:data.result.transactionId })
                    this.setState({sim: data.result.simNumber})
                    this.setState({poiType: data.result.poiType, poiNumber: data.result.poiNumber })

                    
                    // this.setState({ user_image_upload: true, user_signature_upload :true});
                    // this.setState({ poi_front_image_upload:data.result.poiFrontPending, poi_back_image_upload : data.result.poiBackPending,pef_image_upload : data.result.pefFPending});

                    // if(!data.result.pefFPending){
                    //     this.setState({pef_image_response: true })
                    // }

                    // if(!data.result.poiFrontPending){
                    //     this.setState({poi_front_image_response: true})
                    // }
                    // if(!data.result.poiBackPending){
                    //     this.setState({poi_back_image_response: true})
                    // }


                }else {
                    
                  //  this.setState({pef_image_response: false, poi_front_image_response: false,poi_back_image_response: false })
                   
                    this.setState({numberFound:false})

                 //   this.props.history.push('/');
                }
            });

            document.getElementById("uploadform").reset();

            // document.getElementById('user_image_response').innerHTML = ''; 
            // document.getElementById('user_signature_response').innerHTML = ''; 
            // document.getElementById('retailer_signature_response').innerHTML = ''; 

            // document.getElementById('poi_front_image_response').innerHTML = ''; 
            // document.getElementById('poi_back_image_response').innerHTML = ''; 
            // document.getElementById('pef_image_response').innerHTML = ''; 

            
            this.setState({ user_image_upload: false, user_signature_upload :false,  uploadFlag: false});
            this.setState({ poi_front_image_upload:false, poi_back_image_upload : false,pef_image_upload:false});

    }

    


    validateUploadFile = (file) => {
        const filename = file.name.toString(); 
    
        if (/[^a-zA-Z0-9\.\-\_ ]/.test(filename)) {
            Notify.showError("File name can contain only alphanumeric characters including space and dots")
            return false;
        }
    
        if(file.type == "image/png" || file.type == "image/jpeg"){
            var fileSize = file.size / 1000; //in kb
            if(fileSize >= 100 && fileSize <= 2048){
              const fileext =  filename.split('.').pop(); 
              Object.defineProperty(file, 'name', {
                writable: true,
                value:  md5(file.name) +"."+ fileext
              });
              return file;
            }else{
              Notify.showError("File size should be grater than 100KB and less than 2MB")
            }
        }else {
          Notify.showError("Only png and jpeg file allowd.")
        }
        return false;
      }

    onChangeFileUpload = e => {
        console.log(e.target.files[0]);
        const filetoupload = this.validateUploadFile(e.target.files[0]); 
        if (filetoupload) {
            this.setState({ [e.target.name]: e.target.files[0]});
        }
        else{
            e.target.value = null;
        }
        // if(e.target.name == "poi_front_image" && e.target.files[0].name != "poi_front_image.png" ){
        //     document.getElementById(e.target.name+'_file').value = "";
        //     Notify.showError("Image name to be 'poi_front_image.png'");
        //     return;
        // }
        // if(e.target.name == "poi_back_image" && e.target.files[0].name != "poi_back_image.png" ){
        //     document.getElementById(e.target.name+'_file').value = "";
        //     Notify.showError("Image name to be 'poi_back_image.png'");
        //     return;
        // }
    }; 


    handleSubmit(e){
        e.preventDefault();
        e.target.reset();
    }
    

    onUploadFiles = () => {

 //  console.log("imageType",  this.state[imageType]); 

    if(!this.state.pef_image){
        Notify.showError("Please select a PEF image");
        return;
    }

    if(!this.state.poi_front_image){
        Notify.showError("Please select a poi front image");
        return;
    }

    // if(!this.state.pef_image && !this.state.poi_front_image){
    //     return ;
    // }


    this.setState({uploadFlag: false, uploadLoader:true}); 

    const formData = new FormData();
    formData.append('pefImage',this.state.pef_image );
    formData.append('poiFrontImage', this.state.poi_front_image);
    if(this.state.poi_back_image){
        formData.append('poiBackImage', this.state.poi_back_image);
    }
    // else{
    //     formData.append('poiBackImage', null);
    // }
  //  formData.append('mobileNumber', this.state.mobile);
    formData.append('txnId', this.state.txnId);
    formData.append('deviceId', localStorage.getItem("deviceId".toString()) );   
    

    ActivationService.uploadDistrubuterResubmit(formData)
        .then((res) => {
            
            let data = resolveResponse(res);
            this.setState({uploadResponse: data.message, uploadLoader:false }); 

            // if(data.status == 200){
            //     this.setState({uploadResponse: data.message, uploadLoader:false }); 

            // }else {
            //     Notify.showError(data.message);
            //     return;
            // }
        });
   
  };


    render(){
     
      //  console.log("this.state.products",this.state.products); 
        return(
            <React.Fragment>
                <PostLoginNavBar/>
                <Paper style={{padding:"40px"}}>
                <Container  >
                    {/* <EnhancedTable products={this.state.products}/> */}

                    {/* <StickyHeadTable products={this.state.products} someAction={this.someAction}/>
                     */}

                      
                    {/* <Typography component="h2" variant="h6" color="primary" gutterBottom>
                      Search Mobile No.
                      

                    </Typography>  */}

                        <form onSubmit={() => this.searchOnDB( this.state.searchby )} >

                        <Grid spacing={1}  container  container
                            direction="row"
                            justify="right"
                            alignItems="center">

                            <Grid item xs={12} sm={7} >
                            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Distributor Resubmit	
                            </Typography> 
                            </Grid>
                            {/* InputLabelProps={{ shrink: true }} */}
                            <Grid item xs={12} sm={3    } alignItems="flex-end" alignContent="flex-end"  justify="flex-end" > 
                                <TextField type="number" value={this.state.mobile}  label="Mobile No."  style={{width:"100%"}} name="Search by Mobile No." name="mobile" onChange={this.onChange} />
                            </Grid>     
                            {/* <Grid item xs={12} sm={2} alignItems="flex-end" alignContent="flex-end"  justify="flex-end" > 
                                <TextField type="text" value={this.state.sim}  label="Sim No."  style={{width:"100%"}} name="Search by Mobile No." name="sim" onChange={this.onChange} />
                            </Grid> */}
                            <Grid item xs={12} sm={1} alignItems="flex-end" alignContent="flex-end"  justify="flex-end" > 
                               <Button type="button"  onClick={() => this.searchOnDB(  )} variant="contained"  style={{marginLeft: '20px'}} >Search</Button>
                            </Grid>
                        </Grid>
                        </form>

                    <br /> 

                    {this.state.numberFound ? 
                       
                       <Paper style={{padding:"20px"}}>
                        <Grid spacing={5} alignItems="center" style={styles.textStyle} container direction="row">
                            
                            <Grid item xs={12} sm={3}>
                             Mobile No.: <b> {this.state.mobile} </b> 
                            </Grid>
                            <Grid item xs={12} sm={3}>
                             Sim No.:  <b>{this.state.sim}  </b> 
                            </Grid>
                        
                            <Grid item xs={12} sm={3}> 
                             {this.state.poiType} : <b> {this.state.poiNumber}</b> 
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                 FTA Date: <b> {this.state.ftaDate}</b> 
                            </Grid>

                            
                        </Grid>
                        </Paper>

                    :""}
                        <br /> 
                        <form id="uploadform"  onSubmit={this.handleSubmit.bind(this)} >
                        {/* <Paper style={{padding:"20px"}}> 
                            <Grid spacing={5} alignItems="center" style={styles.textStyle} container direction="row">
                                <Grid item xs={12} sm={4}>
                                    <InputLabel htmlFor="gender">User Images</InputLabel>
                                    <input id="user_image_file" type="file" name="user_image" onChange={this.onChangeFileUpload} />
                                </Grid>

                                <Grid item xs={12} sm={2}>
                                    {this.state.user_image_loader ? <CircularProgress />: ""} 
                                    {this.state.user_image_upload?<Button type="submit"  onClick={() => this.onUploadFiles('user_image')} variant="contained"  color="primary" style={{marginLeft: '20px'}} >Upload</Button>:<Button type="submit"  disabled variant="contained"  color="primary" style={{marginLeft: '20px'}} >Upload</Button> } 
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                        <span style={{fontSize:"16px",color:"green"}}><b id="user_image_response"> </b> </span>
                                </Grid>
                            </Grid>
                        </Paper>
                        <br /> 
                        <Paper style={{padding:"20px"}}> 
                            <Grid spacing={5} alignItems="center" style={styles.textStyle} container direction="row">
                                <Grid item xs={12} sm={4}>
                                    <InputLabel htmlFor="gender">User Signature</InputLabel>
                                    <input id="user_signature_file" type="file" name="user_signature" onChange={this.onChangeFileUpload} />
                                </Grid>

                                <Grid item xs={12} sm={2}>
                                    {this.state.user_signature_loader ? <CircularProgress />: ""} 
                                    {this.state.user_signature_upload?<Button type="submit"  onClick={() => this.onUploadFiles('user_signature')} variant="contained"  color="primary" style={{marginLeft: '20px'}} >Upload</Button>:<Button type="submit"  disabled variant="contained"  color="primary" style={{marginLeft: '20px'}} >Upload</Button> } 
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                        <span style={{fontSize:"16px",color:"green"}}><b id="user_signature_response"> </b> </span>
                                </Grid>
                            </Grid>
                        </Paper>

                        <br /> 
                        <Paper style={{padding:"20px"}}> 
                            <Grid spacing={5} alignItems="center" style={styles.textStyle} container direction="row">
                                <Grid item xs={12} sm={4}>
                                    <InputLabel htmlFor="gender">Retailer Signature</InputLabel>
                                    <input id="retailer_signature_file" type="file" name="retailer_signature" onChange={this.onChangeFileUpload} />
                                </Grid>

                                <Grid item xs={12} sm={2}>
                                    {this.state.retailer_signature_loader ? <CircularProgress />: ""} 
                                    {this.state.uploadFlag?<Button type="submit"  onClick={() => this.onUploadFiles('retailer_signature')} variant="contained"  color="primary" style={{marginLeft: '20px'}} >Upload</Button>:<Button type="submit"  disabled variant="contained"  color="primary" style={{marginLeft: '20px'}} >Upload</Button> } 
                                </Grid>
                                <Grid item xs={12} sm={6}> 
                                        <span style={{fontSize:"16px",color:"green"}}><b id="retailer_signature_response"> </b> </span>
                                </Grid>
                            </Grid>
                        </Paper> */}
                         <Paper style={{padding:"20px"}}> 
                            <Grid spacing={1}  style={styles.textStyle} justify="flex-end"  container direction="row">
                                 <Grid item xs={12} sm={3}>
                                    <InputLabel htmlFor="gender" required={true}>PEF Image</InputLabel>
                                    <input id="pef_image_file" disabled={!this.state.uploadFlag} type="file" name="pef_image" onChange={this.onChangeFileUpload} />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <InputLabel htmlFor="gender" required={true}>POI Front Image</InputLabel>
                                    <input id="poi_front_image_file" disabled={!this.state.uploadFlag} type="file" name="poi_front_image" onChange={this.onChangeFileUpload} />

                                </Grid>

                                <Grid item xs={12} sm={3}>
                                    <InputLabel htmlFor="gender">POI Back Image</InputLabel>
                                    <input id="poi_back_image_file" disabled={!this.state.uploadFlag} type="file" name="poi_back_image" onChange={this.onChangeFileUpload} />
                                </Grid>


                                <Grid item xs={12} item sm={1}>
                                    {this.state.uploadFlag?<Button  onClick={() => this.onUploadFiles()} variant="contained"  color="primary" style={{marginLeft: '20px'}} >Submit</Button>:<Button disabled variant="contained"  color="primary" style={{marginLeft: '20px'}} >Submit</Button> } 

                                </Grid>
                              
                                <Grid item xs={12} sm={2} style={{textAlign:"center"}} >
                                 {this.state.uploadLoader ? <CircularProgress />: ""} 
                                </Grid>
                            </Grid>
                            
                            <br />
                            <Grid  alignItems="center" style={styles.textStyle} container direction="row">

                            <Grid style={{textAlign:"center"}}  item xs={12} sm={12}>
                               <span style={{fontSize:"18px"}}> <b> {this.state.uploadResponse} </b> </span>
                            </Grid>
                          
                        
                        </Grid>
                            

                        </Paper>

                      

                        {/*



                        <br /> 
                        <Paper style={{padding:"20px"}}> 
                            <Grid spacing={5} alignItems="center" style={styles.textStyle} container direction="row">
                                <Grid item xs={12} sm={4}>
                                    <InputLabel htmlFor="gender" required={true}>POI Front Image</InputLabel>
                                    <input id="poi_front_image_file" type="file" name="poi_front_image" onChange={this.onChangeFileUpload} />

                                </Grid>

                                <Grid item xs={12} sm={2}>
                                    {this.state.poi_front_image_loader ? <CircularProgress />: ""} 
                                    {this.state.poi_front_image_upload?<Button type="submit"  onClick={() => this.onUploadFiles('poi_front_image')} variant="contained"  color="primary" style={{marginLeft: '20px'}} >Upload</Button>:<Button type="submit"  disabled variant="contained"  color="primary" style={{marginLeft: '20px'}} >Upload</Button> } 
                                </Grid>
                                <Grid item xs={12} sm={6}> 
                                        <span style={{fontSize:"16px",color:"green"}}><b id="poi_front_image_response"> {this.state.poi_front_image_response} </b> </span>
                                        {this.state.poi_front_image_response?<span><b> POI front image already uploaded </b> </span> :""}

                                </Grid>
                            </Grid>
                        </Paper>

                        <br /> 
                        <Paper style={{padding:"20px"}}> 
                            <Grid spacing={5} alignItems="center" style={styles.textStyle} container direction="row">
                                <Grid item xs={12} sm={4}>
                                    <InputLabel htmlFor="gender">POI Back Image</InputLabel>
                                    <input id="poi_back_image_file" type="file" name="poi_back_image" onChange={this.onChangeFileUpload} />

                                </Grid>
                                <Grid item xs={12} sm={2}>
                                    {this.state.poi_back_image_loader ? <CircularProgress />: ""} 
                                    {this.state.poi_back_image_upload?<Button type="submit"  onClick={() => this.onUploadFiles('poi_back_image')} variant="contained"  color="primary" style={{marginLeft: '20px'}} >Upload</Button>:<Button type="submit"  disabled variant="contained"  color="primary" style={{marginLeft: '20px'}} >Upload</Button> } 
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                        <span style={{fontSize:"16px",color:"green"}}><b id="poi_back_image_response"> {this.state.poi_back_image_response} </b> </span>
                                        {this.state.poi_back_image_response?<span><b> POI back image already uploaded </b> </span> :""}

                                </Grid>
                            </Grid>
                        </Paper>

                        <br /> 
                        <Paper style={{padding:"20px"}}> 
                            <Grid spacing={5} alignItems="center" style={styles.textStyle} container direction="row">
                                <Grid item xs={12} sm={4}>
                                    <InputLabel htmlFor="gender" required={true}>PEF Image</InputLabel>
                                    <input id="pef_image_file" type="file" name="pef_image" onChange={this.onChangeFileUpload} />
                                    <InputLabel style={{fontSize:"14px"}}>Note: It's sigle image</InputLabel>

                                </Grid>
                                <Grid item xs={12} sm={2}>
                                    {this.state.pef_image_loader ? <CircularProgress />: ""} 
                                    {this.state.pef_image_upload?<Button type="submit"  onClick={() => this.onUploadFiles('pef_image')} variant="contained"  color="primary" style={{marginLeft: '20px'}} >Upload</Button>:<Button type="submit"  disabled variant="contained"  color="primary" style={{marginLeft: '20px'}} >Upload</Button> } 
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                        <span style={{fontSize:"16px",color:"green"}}><b id="pef_image_response">  </b> </span>
                                        {this.state.pef_image_response?<span><b> PFE image already uploaded </b> </span> :""}
                                </Grid>
                            </Grid>
                        </Paper> */}
                        </form>

                        
                        
                 </Container> 
                 <br />  <br />  <br /> 
                </Paper>
            </React.Fragment>
        )
    }



}

const styles ={
    formContainer : {
        display: 'flex',
        flexFlow: 'row wrap'
    },

    textStyle :{
        display: 'flex',
        justifyContent: 'center'

    },
    imgStyle:{
        display:'flex'
    }, 

    selectStyle:{
        minWidth: '100%',
        marginBottom: '10px'
    },

    show:{
        display:"block"
    },
    hide:{
        display:"node"
    }
};



export default DataEntryList;

