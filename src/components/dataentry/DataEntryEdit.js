import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import ActivationService from "../service/ActivationService";
import {resolveResponse} from "../../utils/ResponseHandler";

import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import PostLoginNavBar from "../PostLoginNavbar";
import {Container} from "@material-ui/core";
import Notify from "../../utils/Notify";
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from "@material-ui/core/Input";

import MaterialUIPickers from "./MaterialUIPickers";

//import SlideShowGalary from "./SlideShowGalary";

import SlideShowGalary from "../../utils/SlideShowGalary";
import "./DataEntry.css";

import CircularProgress from '@material-ui/core/CircularProgress';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import DoneSharpIcon from '@material-ui/icons/DoneSharp';

//import TEST from '../expriment/Test';







// const useStyles = makeStyles(theme => ({
//     root: {
//       padding: theme.spacing(3, 2),
//     },
//   }));
// const SampleFab = () => {
//     const classes = useStyles();
//     return <Paper className={classes.root}></Paper>;
//  }


 
  


class DataEntryEdit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
                txnId: '',
                mobileNumber: '', 
                poiNumber:'',
                poiType:'',
                title:'',
                gender:'',
                dob:'',
                rejectedReasons:'',
                approveLoader:false,
                approveDone:false,
                approveButton:true,
                loginId:'',
                firstName:"",
                middleName:"",
                lastName:"",
                altContactNumber:'', 
                propMobile:'',
                emailid:'',
                address1:'',
                address2:'',
                address3:'',
                customerImageUrl:"",
                presentAddress:"",
                pefImageUrl:'',
                comment:"",
                loading: true,
                isValidEmail:true
                
        }
        this.updateLocalActList = this.updateLocalActList.bind(this);
        this.onChange = this.onChange.bind(this);
        this.skipThisVerify = this.skipThisVerify.bind(this);
        this.loadOneTransection = this.loadOneTransection.bind(this);
        this.myCallback = this.myCallback.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangeAlternateNo = this.onChangeAlternateNo.bind(this);
        this.slideRef = React.createRef(); 

    }
    myCallback = (date, fromDate) => {
        if (fromDate === "START_DATE") {
            var formattedDate = date.toLocaleDateString('en-GB', {
            day: 'numeric', month: 'numeric', year: 'numeric'
            }).replace(/ /g, '/');
            console.log(
                "formattedDate",formattedDate
            )
           // var dateStr =  date.getDate() + "/" + date.getMonth() + '/' +  date.getFullYear();
            this.setState({ dob: formattedDate });
        } 
    };

    loadOneTransection(){
        const dataEntryId = localStorage.getItem("dataEntryId");
        // console.log( "selectedProductId",  selectedProductId);
         
         if(dataEntryId == null) {
            // alert("Please select a product to edit.");
            // this.props.history.push('/dataentry');
             this.cancel();
         }else {
 
             ActivationService.getOneDataEntry(dataEntryId).then(res => {
                 let data = resolveResponse(res);
                 const selectedProduct = data.result;
 
                 var genderSelect=''; 
                 if(selectedProduct && (selectedProduct.title == "Ms" || selectedProduct.title == 'Mrs')){
                     genderSelect = "F"; 
                 }
                 if(selectedProduct && selectedProduct.title == "Mr"){
                    genderSelect = "M"; 
                }

                 var rejectmsg = ''; 
                 if(selectedProduct && selectedProduct.rejectedReasons){
                    rejectmsg = selectedProduct.rejectedReasons
                 }
                 if(selectedProduct){
                    this.setState({
                        mobileNumber: selectedProduct.mobileNumber,
                        poiNumber: selectedProduct.poiNumber,
                        poiType: selectedProduct.poiType,
                         customerImageUrl: selectedProduct.customerImageUrl, 
                         customerSignatureUrl:selectedProduct.customerSignatureUrl, 
                         poiBackImageUrl :selectedProduct.poiBackImageUrl, 
                         poiFrontImageUrl:selectedProduct.poiFrontImageUrl, 
                         retailerSignatureUrl : selectedProduct.retailerSignatureUrl,
                         pefImageUrl:selectedProduct.pefImageUrl,
                         rejectedReasons : rejectmsg,
                         title : selectedProduct.title,
                         gender: genderSelect, 
                         firstName: selectedProduct.firstName,
                         altContactNumber:selectedProduct.altContactNumber,
                         emailid:selectedProduct.emailid,
                         presentAddress: selectedProduct.presentAddress,
                         //address1 : selectedProduct.address1,
                         //address2:  selectedProduct.address2,
                         //address3 : selectedProduct.address3,

                        // deDateTime : selectedProduct.deDateTime, 
                        // deUser: selectedProduct.deUser, 
                        // dob:selectedProduct.dob, 
                        // firstName:selectedProduct.firstName, 
                        });

                    //    console.log("getonedata",this.state); 
                 }

                this.setState({loading:false}) 
             })
 
             const userDetails = JSON.parse(localStorage.getItem("userDetails")); 
           //  console.log("this.state afer load", this.state);

             this.setState({  loginId : userDetails.loginId });

             ActivationService.getStaticData("DE").then(res => {
                 let data = resolveResponse(res);
 
                 this.setState({
                     propertiesName: data.result && data.result.screenFields && data.result.screenFields[0].fields
                     });
              //  console.log("propertiesName screenFields", this.state.propertiesName);

             })
         }
    }

    componentDidMount() {
        this.loadOneTransection(); 
        localStorage.setItem("lastUrl","data-edit");
        if(document.getElementById("addressone")){
            document.getElementById("addressone").style.fontSize = "12px";
        }
        if(document.getElementById("addresstwo")){
            document.getElementById("addresstwo").style.fontSize = "12px";
        }
        if(document.getElementById("addressthree")){
            document.getElementById("addressthree").style.fontSize = "12px";
        }
        if(document.getElementById("presentAddress")){
            document.getElementById("presentAddress").style.fontSize = "12px";
        }
        if(document.getElementById("rejectedReasons")){
            document.getElementById("rejectedReasons").style.fontSize = "12px";
        }
    }


    render() {

        var imageDetails = []; var baseUrl=""; //"https://retailer.airtel.lk";
        if(this.state.poiFrontImageUrl){
          imageDetails.push({
              img: baseUrl+ this.state.poiFrontImageUrl, 
              title: 'POI Front Image',
              author: 'Front Image',
              featured: true,
            }); 
        }
        if(this.state.customerImageUrl){
            imageDetails.push({
                img: baseUrl+ this.state.customerImageUrl,
                title: 'Customer Image',
                author: 'Customer Image',
                featured: true,
              }); 
          }
        if(this.state.poiBackImageUrl){
          imageDetails.push({
              img: baseUrl+ this.state.poiBackImageUrl,
              title: 'POI Back Image',
              author: 'Back Image',
              featured: true,
            }); 
        }
        if(this.state.customerSignatureUrl){
          imageDetails.push({
              img:  baseUrl+this.state.customerSignatureUrl,
              title: 'Customer Signature',
              author: 'Customer Signature',
              featured: true,
            }); 
        }

        if(this.state.retailerSignatureUrl){
          imageDetails.push({
              img: baseUrl+ this.state.retailerSignatureUrl,
              title: 'Retailer Signature',
              author: 'Retailer Signature',
              featured: true,
            }); 
        }
        if(this.state.pefImageUrl){
            imageDetails.push({
                img:  this.state.pefImageUrl,
                title: 'PEF Image',
                author: 'PEF Image',
                featured: true,
              }); 
          }

          const dateParam = {
            myCallback: this.myCallback,
            startDate: this.state.dob,
            endDate: ''

        }

        if(this.state.loading){
            return (  
                 <React.Fragment>
                    <PostLoginNavBar/><br />
                    <Typography variant="h6" >Loading...please wait.</Typography>
                </React.Fragment> 
                )   
        }


        return(
            <React.Fragment>
            <PostLoginNavBar/>
            {/* <h2  style={styles.textStyle}> View and Verify Document </h2> */}
            <Typography variant="h6" style={styles.textStyle} >Data Entry Details</Typography>

            <Grid container className="flexGrow" spacing={1}>
               <Grid item  xs={12} sm={8} style={{overflow:"scroll"}}>
                   
                    <Paper style={{paddingLeft:"5px", paddingRight:"5px", height:"80vh", width: "135vh" }}>
                    {/* <ReactPanZoom image="https://drscdn.500px.org/photo/105738331/q%3D80_m%3D2000/v2?webp=true&sig=538a4f76f4966c84acb01426bb4a4a5e4a85b72a2c3bd64973d3a369f9653007" alt="document image"/>

                    <ReactPanZoom image="https://qph.fs.quoracdn.net/main-qimg-212927c733fa6407344ee9b257445d17.webp" alt="document image"/> */}

                        {/* <br /> */}
                        {/* <Typography variant="body1" style={styles.textStyle}>Document Uploaded</Typography> */}

                         {/* <ImageGalary imageDetails={imageDetails} />  */}
                         <SlideShowGalary  imageDetails={{imageDetails: imageDetails, slideRef : this.slideRef}} />

                    </Paper>

                </Grid>

      
                <Grid item  xs={12} sm={4}>

                {/* <Container maxWidth="sm"> */}
                    <Paper style={{paddingLeft:"20px",paddingRight:"20px", paddingBottom:"5px", }}>
                    <Typography variant="body1" style={styles.textStyle}><b>Update User Details</b></Typography>
                    <form id="dataentryform" style={styles.formContainer}>
                        {/* <Typography variant="h6" component="h3">Mobile : {this.state.mobileNumber}   </Typography> */}

                        <Grid spacing={1} container direction="row">
                            <Grid item xs={12} sm={6}>
                                <TextField label="Mobile No" fullWidth disabled name="mobileNumber" value={this.state.mobileNumber} onChange={this.onChange}/>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField  label="Alternate Contact No" value={this.state.altContactNumber} fullWidth name="altContactNumber"  onChange={this.onChangeAlternateNo}/>
                            </Grid>
                        </Grid>

                        <Grid spacing={1} container direction="row">
                            <Grid item xs={12} sm={12}>
                            {/* placeholder="Email id"  */}
                                <TextField label="Email id" fullWidth  name="emailid" value={this.state.emailid} onChange={this.onChangeEmail}/>
                            </Grid>

                          
                        </Grid>

                        <Grid spacing={1} container direction="row">
                            <Grid item xs={12} sm={6}>
                                 <FormControl style={styles.selectStyle}>
                                    <InputLabel  htmlFor="gender">POI Type</InputLabel>
                                    <Select value={this.state.poiType}  name="poiType" onChange={this.onChange}>
                                        <MenuItem value={"NIC"}>NIC</MenuItem>
                                        <MenuItem value={"DL"}>DL</MenuItem>
                                        <MenuItem value={"PASSPORT"}>PASSPORT</MenuItem>
                                    </Select>
                                </FormControl>
                                {/* <TextField label="POI Type" required={true} fullWidth name="poiType"  onChange={this.onChange}/> */}
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField label="POI Number" fullWidth name="poiNumber" value={this.state.poiNumber} onChange={this.onChange}/>

                                {/* <TextField label="POI Number" value={this.state.poiNumber} required={true} fullWidth name="poiNumber" onChange={this.onChange}/> */}
                            </Grid>
                        </Grid>

                        {/* 
                        <Grid item xs={12} sm={1}>
                        <InputLabel htmlFor="age-simple">Title</InputLabel>
                            <Select value={this.state.title}>
                            <MenuItem value={10}>Mr.</MenuItem>
                            <MenuItem value={20}>Mrs.</MenuItem>
                            </Select>
                        </Grid> */}

                        {/* <Grid container direction="row" justify="flex-end"> */}


                        <Grid spacing={1} container direction="row">
                            <Grid item xs={12} sm={6}>

                             <FormControl style={styles.selectStyle}>
                                    <InputLabel htmlFor="title">Title</InputLabel>
                                    <Select  value={this.state.title}  name="title" onChange={this.onChange}>
                                        <MenuItem value={"Mr"}>Mr</MenuItem>
                                        <MenuItem value={"Ms"}>Ms</MenuItem>
                                        <MenuItem value={"Mrs"}>Mrs</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                            <TextField label="First Name" value={this.state.firstName} required={true} fullWidth name="firstName"  onChange={this.onChange}/>

                            </Grid>
                        </Grid>
                       
                         <Grid spacing={1} container direction="row">
                            {/* <Grid item xs={12} sm={4}>
                                <TextField label="First Name" required={true} fullWidth name="firstName"  onChange={this.onChange}/>
                            </Grid> */}
                            <Grid item xs={12} sm={6}>
                                <TextField label="Middle Name"  value={this.state.middleName} fullWidth name="middleName" onChange={this.onChange}/>
                            </Grid>
                            <Grid item xs={12} sm={6} >
                                <TextField label="Last Name" value={this.state.lastName}  fullWidth name="lastName"  onChange={this.onChange}/>
                            </Grid> 
                         </Grid>

                        {/* </Grid> */}

                        <Grid spacing={1} container direction="row">
                            <Grid item xs={12} sm={6}>
                                {/* <TextField data-date-format="dd-mm-yyyy" InputLabelProps={{ shrink: true}} value={this.state.dob} style={styles.selectStyle} type="date" label="Date of Birth"  name="dob"  onChange={this.onChangeDob}/> */}
                                <MaterialUIPickers callbackFromParent={dateParam} />


                            </Grid>
 
                            <Grid item xs={12} sm={6}>
                                <FormControl style={styles.selectStyle}>
                                    <InputLabel  htmlFor="gender">Gender</InputLabel>
                                    <Select value={this.state.gender}  name="gender" onChange={this.onChange}>
                                        <MenuItem value={"M"}>Male</MenuItem>
                                        <MenuItem value={"F"}>Female</MenuItem>
                                        {/* <MenuItem value={"O"}>Others</MenuItem> */}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Grid spacing={1} container direction="row">
                            <Grid item xs={12} sm={6}>
                            <InputLabel style={{fontSize:"12px"}}>Present Address</InputLabel>
                            <div id="presentAddress"   style={styles.MuiTextField} >{this.state.presentAddress} </div>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                            <TextField id="addressone"  label="Address 1"  value={this.state.address1}  fullWidth name="address1" onChange={this.onChange}/>

                            </Grid>

                        </Grid>


                        <Grid spacing={1} container direction="row">
                        
                            <Grid item xs={12} sm={6}>
                            <TextField id="addresstwo"  label="Address 2"  value={this.state.address2}  fullWidth name="address2" onChange={this.onChange}/>

                            </Grid>

                            <Grid item xs={12} sm={6}>
                            <TextField id="addressthree"  label="Address 3" value={this.state.address3}   fullWidth name="address3" onChange={this.onChange}/>

                            </Grid>


                        </Grid>
                           

                        <Grid spacing={1} container direction="row">
                            <Grid item xs={12} sm={6}>
                                 <InputLabel style={{fontSize:"12px"}}>Rejected Reasons</InputLabel>

                                 <div id="rejectedReasons"  style={styles.MuiTextField}>{this.state.rejectedReasons} </div>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                            <TextField multiline variyant rows={2} value={this.state.comment} label="Comments" fullWidth margin="none" name="comment" onChange={this.onChange}/>
                            </Grid>

                        </Grid>


                       
                        
                        <br />
                        {/* <InputLabel htmlFor="title">Rejected Reasons</InputLabel> */}
                        
                        {/* <Input fullWidth
                            placeholder="Rejected Reasons" 
                            disabled
                            value={this.state.rejectedReasons}
                            inputProps={{
                            'aria-label': 'description',
                            }}
                        /> */}
                        {/* <TextField  value={this.state.rejectedReasons} multiline rows={2} label="Rejected Reasons" fullWidth margin="none" name="helpText" onChange={this.onChange}/> */}
                        {/* <TextField
                            label="Comments"
                            id="outlined-start-adornment"
                           
                           
                            variant="outlined"
                            />
                        */}
                         
                        <div><Grid  container spacing={24} style={{paddingTop:"4px"}} container
                            direction="row"
                            justify="center"
                            alignItems="center">

                                    {this.state.approveLoader ? <CircularProgress />: ""} 
                                    {/* <CheckCircleIcon color="primary" fontSize="large"/> */}
                                    {this.state.approveDone ?  <Button  style={{marginLeft: "20px"}} variant="outlined" color="primary" > <DoneSharpIcon color="primary" /> Saved & Loading Next</Button> : ""} 
                                    {this.state.approveButton ? <Button variant="contained" color="primary" style={{marginLeft: '20px'}} onClick={this.submitDataEntry}>Submit</Button>: ""} 


                                <Button variant="contained" color="secondary" style={{marginLeft: '20px', backgroundColor:"#33691e"}} onClick={() => this.skipThisVerify('skip') }> SKIP </Button>
                                <Button variant="contained" color="default" style={{marginLeft: '20px'}} onClick={this.cancel}>Back to Listing</Button>
                            
                        </Grid></div>
                    
                    </form>
                    </Paper>


                    
                {/* </Container> */}
                </Grid>
            
                </Grid>

             


            <div>
 
  
        </div>

            </React.Fragment>
        )
    }

    
    updateLocalActList = (txn) =>{
        var activationList = localStorage.getItem("dataEntryActivationList") && JSON.parse(localStorage.getItem("dataEntryActivationList")); 

        var index = -1;
        for(var i=0; i < activationList.length; i++ ){
            if(activationList[i].txnId == txn){
                index =i;
                break; 
            }
        }        
        if (index > -1) {
            activationList.splice(index, 1);
        }
        localStorage.setItem("dataEntryActivationList",JSON.stringify(activationList));    
    }


    onlockTransectionOnSkip = (txn) =>{

        var transactionsIds = {
            transactionsIds : [txn]
        }
        ActivationService.unlockTransectionsSkip( transactionsIds ).then(res => {
            let data = resolveResponse(res);
            if(data.message != 'ok'){
                Notify.showError("Didn't unlocked");
            }
       })
    }


    skipThisVerify = (eventType) => {

         //reset 
         this.setState({
            txnId: '',
            mobileNumber: '', 
            poiNumber:'',
            poiType:'',
            title:'',
            gender:'',
            dob:'',
            rejectedReasons:'',
            approveLoader:false,
            approveDone:false,
            approveButton:true,
            loginId:'',
            firstName:"",
            middleName:"",
            lastName:"",
            altContactNumber:'', 
            propMobile:'',
            emailid:'',
            address1:'',
            address2:'',
            address3:'',
            customerImageUrl:"",
            presentAddress:"",
            pefImageUrl:'',
            comment:"" 
        });

        //  e.preventDefault();
          var dataEntryId = localStorage.getItem("dataEntryId"); 
          var dataentryListingTxn = localStorage.getItem("dataentryListingTxn"); 
          dataentryListingTxn =  dataentryListingTxn && dataentryListingTxn.split(','); 
          var nextid = ''; 
          for(var i=0; i < dataentryListingTxn.length; i++ ){
              if(dataEntryId == parseInt(dataentryListingTxn[i])){
                  nextid =  parseInt(dataentryListingTxn[i+1]);  
                  break; 
              }
          }
  
         // this.updateLocalActList(dataEntryId); 
         if(eventType === "skip"){
            this.onlockTransectionOnSkip(dataEntryId); 
         }
        //  console.log("nextid",nextid); 
          if(nextid){
//            Notify.showSuccess("Acquisition skipped successfully and Lodding next...");

              localStorage.setItem("dataEntryId", nextid); 
              this.loadOneTransection();
            
           // To call the method you can use the slide's ref attribute and then call the method. 
              this.slideRef.current.goTo(0);

              this.setState({ approveLoader: false});
              this.setState({ approveDone: false});
              this.setState({ approveButton: true});


          }else{
             // Notify.showError("No item available");
             // this.props.history.push('/dataentry');
              this.cancel();
          }
      };

    handleChange = name => event => {
        this.setState({ ...this.state, [name]: event.target.checked });
    };



    submitDataEntry = (e) => {
        e.preventDefault();
      

      //  Notify.showSuccess("Approved");
    //    console.log("data entry post data",this.state)

        //!this.state.gender || !this.state.title || !this.state.poiNumber || !this.state.dob || !this.state.firstName || !this.state.lastName || !this.state.address1 
        
        var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
        if(this.state.emailid){
            if(!pattern.test(this.state.emailid)){
                Notify.showError("Email id is not valid");
                return;
            }
        }

        if(!this.state.firstName){
            Notify.showError("Missing First Name");
            return;
        }

        if(this.state.dob.toLocaleLowerCase() == "invalid/date"){
            Notify.showError("Invalid Date of Birth Format");
            return;  
        }  
       

        if(this.state.comment && this.state.comment.length > 200){
            Notify.showError("Comments allow upto 200 characters only");
            return;
        }

        if(this.state.altContactNumber && this.state.altContactNumber.length < 9){
            Notify.showError("Alternate contact number not valid");
            return;
        }


            this.setState({ approveLoader: true});
            this.setState({ approveButton: false});
            
            const dataEntryId = localStorage.getItem("dataEntryId");

            const product = {
                "transactionId": dataEntryId,
                "poiNumber": this.state.poiNumber,
                "poiType": this.state.poiType,
                "title": this.state.title,
                "gender":this.state.gender ,
                "dob": this.state.dob,
                "firstName": this.state.firstName,
                "middleName": this.state.middleName,
                "lastName": this.state.lastName,
                "address1": this.state.address1,
                "address2": this.state.address2,
                "address3": this.state.address3,
                "altContactNumber": this.state.altContactNumber,
                "comments": this.state.comment,
                "deDateTime": new Date(),
                "deUser": this.state.loginId,
                "emailid":this.state.emailid
            }
        
            ActivationService.saveDataEntry(product)
            .then(res => {
                resolveResponse(res, "Details updated successfully and Lodding next acquisition to verify...");
               // this.props.history.push('/dataentry');
            //   this.updateLocalActList(dataEntryId); 

            this.setState({ approveLoader: false});
            this.setState({ approveDone: true});
         //   this.setState({ altContactNumber: '',dob:''});

           

            setTimeout(() => {
                this.skipThisVerify("loadnext"); 
            }, 2000);

            });
    };


    cancel = (e) => {
        if(localStorage.getItem('fromSubmit') == 'yes'){
            this.props.history.push('/resubmit-dataentry');
        }else{
            this.props.history.push('/dataentry');
        }
    };

    onChangeAlternateNo = (e) => {
        const re = /^[0-9\b]+$/;
        if (e.target.value === '' || re.test(e.target.value) && e.target.value.length <= 10) {
            this.setState({altContactNumber: e.target.value})
        }else{
            this.setState({altContactNumber: e.target.value.replace(/[^0-9]/g, '').substring(0, 10)})  
        }  
    }

    onChange = (e) => {
        var data =  e.target.value.trim();
        var test = !data.includes("$") && !data.includes("&") ; 
        if(test){
           
            if(e.target.name == "firstName" || e.target.name == "middleName" || e.target.name == "lastName" ){
                if(/^[a-zA-Z ]+$/.test(e.target.value)){
                    this.setState({[e.target.name]: e.target.value});
                }
            }else{
                this.setState({[e.target.name]: e.target.value});
            }
        //this.setState({[e.target.name]: e.target.value});
        }

        if(e.target.name == "title" &&  e.target.value == "Ms" || e.target.value == 'Mrs'){
            this.setState({gender: "F"});   
        }
        if(e.target.name == "title" &&  e.target.value == "Mr"){
            this.setState({gender: "M"});   
        }

        if(e.target.value.length == 0){
            this.setState({firstName: "", middleName: "", lastName: ""});
        }




    }

    onChangeEmail = (e) => {

        this.setState({[e.target.name]: e.target.value});
    }

    onChangeDob = (e) => {
        var  year = e.target.value && e.target.value.split('-')[0]; 
        if(year.length>4){
            return;
        }else {
            this.setState({[e.target.name]: e.target.value});

        }
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
    MuiTextField:{
        overflowY: 'scroll',
        fontSize:"12px", 
        maxHeight:"50px",
        
    },

    footerButton: {
        position: 'fixed',
        left: 0,
        bottom: '20px',
        width: '100%',
        textAlign: 'right'
    }

};





export default DataEntryEdit;