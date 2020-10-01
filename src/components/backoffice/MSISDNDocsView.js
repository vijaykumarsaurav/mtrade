import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import ActivationService from "../service/ActivationService";
import {resolveResponse} from "../../utils/ResponseHandler";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import PostLoginNavBar from "../PostLoginNavbar";
import Notify from "../../utils/Notify";
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import SlideShowGalary from "../../utils/SlideShowGalary";


import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import "./DocsView.css";
import ReactPanZoom from "react-image-pan-zoom-rotate";


import CircularProgress from '@material-ui/core/CircularProgress';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import DoneSharpIcon from '@material-ui/icons/DoneSharp';
import { red } from '@material-ui/core/colors';

class VerifyEdit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
                address1: "",
                address2: null,
                address3: null,
                altContactNumber: "",
                customerImageUrl: null,
                customerSignatureUrl: null,
                deDateTime: null,
                deUser: null,
                dob: "",
                firstName: "",
                gender: "",
                lastName: null,
                middleName: null,
                mobileNumber: "",
                pefImageUrl: null,
                poiBackImageUrl: null,
                poiFrontImageUrl: null,
                poiNumber: "",
                poiType: null,
                status: "",
                submittedBy:'',
                showPersonalDetails:'',
                title: "",
                rejectedReasons:'',
                transactionId: '',
                selectedReasons: {},
                sim : '',
                loader:false,
                approveLoader:false,
                approveDone:false,
                approveButton:true,
                rejectLoader:false,
                rejectDone: false,
                rejectButton:true,
                loginId:'',
                emailid:'',
                presentAddress:'',
                comments:"",
                bothReasons:'',
                loading: false

            }
        this.onChange = this.onChange.bind(this);
        this.approveEV = this.approveEV.bind(this);
        this.rejectEV = this.rejectEV.bind(this);
        this.loadOneTransection = this.loadOneTransection.bind(this);
        this.onlockTransectionOnSkip = this.onlockTransectionOnSkip.bind(this);
        this.slideRef = React.createRef(); 

    }

    loadOneTransection(){

        var data ={
            txnId : localStorage.getItem("selectedrefNumber")
        }
       // console.log( "selectedProductId",  selectedProductId);

       var resdata = {"status":200,"message":"ok","result":{"simNumber":"12356","mobileNumber":"759899865","poiNumber":"123456789V","poiType":"NIC","submittedBy":"RETAILER","transactionId":8805,"poiFrontImageUrl":"http://125.16.74.160:30601/store/retailerdev/prepaid-acquisition/759899865/759899865_1599222152447_poi_front_image.jpeg","poiBackImageUrl":"http://125.16.74.160:30601/store/retailerdev/prepaid-acquisition/759899865/759899865_1599222152691_poi_back_image.jpeg","customerSignatureUrl":"http://125.16.74.160:30601/store/retailerdev/prepaid-acquisition/759899865/759899865_1599222153584_user_signature.jpeg","customerImageUrl":null,"retailerSignatureUrl":"http://125.16.74.160:30601/store/retailerdev/prepaid-acquisition/759899865/759899865_1599222154348_retailer_signature.jpeg","pefImageUrl":null,"title":"Mr","gender":"M","emailid":null,"presentAddress":null,"alternateNumber":null,"submittedDate":"04-09-2020 17:52:29","resubmittedDate":null,"ftaDate":"04-09-2020 17:52:29","showPersonalDetails":true}}
       const selectedProduct = resdata.result;
       console.log("selectedProduct",selectedProduct);
       var objectReason = '';
       if(selectedProduct && selectedProduct.rejectedReasons){
           var listReasons = selectedProduct.rejectedReasons && selectedProduct.rejectedReasons.split("|");
           objectReason = listReasons.reduce(function(result, item, index, array) {
               result[item] = true;
               return result;
             }, {}) ;
       }


       if(selectedProduct){
           this.setState({
               address1: selectedProduct.address1,
               address2: selectedProduct.address2,
               address3: selectedProduct.address3,
               presentAddress:selectedProduct.presentAddress,
               altContactNumber: selectedProduct.altContactNumber,
               comments: selectedProduct.comments,
               customerImageUrl: selectedProduct.customerImageUrl,
               customerSignatureUrl: selectedProduct.customerSignatureUrl,
               deDateTime: selectedProduct.deDateTime,
               deUser: selectedProduct.deUser,
               emailid: selectedProduct.emailid,
               alternateNumber:selectedProduct.alternateNumber,
               firstName: selectedProduct.firstName,
               gender: selectedProduct.gender,
               lastName: selectedProduct.lastName,
               middleName: selectedProduct.middleName,
               mobileNumber: selectedProduct.mobileNumber,
               pefImageUrl: selectedProduct.pefImageUrl,
               poiBackImageUrl: selectedProduct.poiBackImageUrl,
               poiFrontImageUrl: selectedProduct.poiFrontImageUrl,
               retailerSignatureUrl : selectedProduct.retailerSignatureUrl,
               poiNumber: selectedProduct.poiNumber,
               poiType: selectedProduct.poiType,
               status: selectedProduct.status,
               submittedBy:  selectedProduct.submittedBy,
               showPersonalDetails: selectedProduct.showPersonalDetails,
               title: selectedProduct.title,
               transactionId: selectedProduct.transactionId,
               selectedReasons: objectReason,   //{"One":true, Two: true}
               sim : selectedProduct.simNumber,
               submittedDate: selectedProduct.submittedDate,
               resubmittedDate : selectedProduct.resubmittedDate,
               ftaDate : selectedProduct.ftaDate,
               prevRejectedImgs : selectedProduct.prevData
               });

           
               if(this.state.showPersonalDetails){
                   this.setState({ rejectedReasons: this.state.bothReasons.eactivatedRejectionReasons});
               }else {
                   this.setState({ rejectedReasons: this.state.bothReasons.preActivatedRejectionReasons});
               }

       }else{
           Notify.showError(JSON.stringify(data));
       }





    //    ActivationService.msisdnDocsView(data).then(res => {
    //     let data = resolveResponse(res);

    //     const selectedProduct = data.result;
    //     console.log("selectedProduct",selectedProduct);
    //     var objectReason = '';
    //     if(selectedProduct && selectedProduct.rejectedReasons){
    //         var listReasons = selectedProduct.rejectedReasons && selectedProduct.rejectedReasons.split("|");
    //         objectReason = listReasons.reduce(function(result, item, index, array) {
    //             result[item] = true;
    //             return result;
    //           }, {}) ;
    //     }

    //     if(selectedProduct){
    //         this.setState({
    //             address1: selectedProduct.address1,
    //             address2: selectedProduct.address2,
    //             address3: selectedProduct.address3,
    //             presentAddress:selectedProduct.presentAddress,
    //             altContactNumber: selectedProduct.altContactNumber,
    //             comments: selectedProduct.comments,
    //             customerImageUrl: selectedProduct.customerImageUrl,
    //             customerSignatureUrl: selectedProduct.customerSignatureUrl,
    //             deDateTime: selectedProduct.deDateTime,
    //             deUser: selectedProduct.deUser,
    //             emailid: selectedProduct.emailid,
    //             alternateNumber:selectedProduct.alternateNumber,
    //             firstName: selectedProduct.firstName,
    //             gender: selectedProduct.gender,
    //             lastName: selectedProduct.lastName,
    //             middleName: selectedProduct.middleName,
    //             mobileNumber: selectedProduct.mobileNumber,
    //             pefImageUrl: selectedProduct.pefImageUrl,
    //             poiBackImageUrl: selectedProduct.poiBackImageUrl,
    //             poiFrontImageUrl: selectedProduct.poiFrontImageUrl,
    //             retailerSignatureUrl : selectedProduct.retailerSignatureUrl,
    //             poiNumber: selectedProduct.poiNumber,
    //             poiType: selectedProduct.poiType,
    //             status: selectedProduct.status,
    //             submittedBy:  selectedProduct.submittedBy,
    //             showPersonalDetails: selectedProduct.showPersonalDetails,
    //             title: selectedProduct.title,
    //             transactionId: selectedProduct.transactionId,
    //             selectedReasons: objectReason,   //{"One":true, Two: true}
    //             sim : selectedProduct.simNumber,
    //             submittedDate: selectedProduct.submittedDate,
    //             resubmittedDate : selectedProduct.resubmittedDate,
    //             ftaDate : selectedProduct.ftaDate,
    //             prevRejectedImgs : selectedProduct.prevData
    //             });

            
    //             if(this.state.showPersonalDetails){
    //                 this.setState({ rejectedReasons: this.state.bothReasons.eactivatedRejectionReasons});
    //             }else {
    //                 this.setState({ rejectedReasons: this.state.bothReasons.preActivatedRejectionReasons});
    //             }

    //     }else{
    //         Notify.showError(JSON.stringify(data));
    //     }

    //     this.setState({loading:false})

    // })



     
    }

    componentDidMount() {
        this.loadOneTransection();
        localStorage.setItem("lastUrl","verify-edit");
  
        
    }
    render() {

        // reasonList.push(<div style={{color:"red"}}> <FormControlLabel  color="primary"  control={<Checkbox  onChange={this.handleChange(rejectedReasons[i].exemptReason)} checked={this.state.selectedReasons[rejectedReasons[i].exemptReason] ? true: false} /> } label={rejectedReasons[i].exemptReason} /> </div>)
        // reasonList.push(<div> <FormControlLabel  control={<Checkbox   onChange={this.handleChange(rejectedReasons[i].exemptReason)} checked={this.state.selectedReasons[rejectedReasons[i].exemptReason] ? true: false} color="primary"/> } label={rejectedReasons[i].exemptReason} /> </div>)
        console.log('this.state',this.state)


        var rejectedReasons =  this.state.rejectedReasons;
        var reasonList = [];
        if(rejectedReasons){
            for(var i=0; i < rejectedReasons.length; i++){
                if(rejectedReasons[i].isMandatory == 1)
                    reasonList.push(<div> <label style={{color:"red"}}><input type="checkbox"  onChange={this.handleChange(rejectedReasons[i].exemptReason)} checked={this.state.selectedReasons[rejectedReasons[i].exemptReason] ? true: false} /> {rejectedReasons[i].exemptReason} </label></div>)
                else
                     reasonList.push(<div> <label> <input type="checkbox"  onChange={this.handleChange(rejectedReasons[i].exemptReason)} checked={this.state.selectedReasons[rejectedReasons[i].exemptReason] ? true: false} /> {rejectedReasons[i].exemptReason} </label></div>)

            }
        }

          var imageDetails = []; var baseUrl= ''; //'https://retailer.airtel.lk';
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
                img:  baseUrl+  this.state.customerImageUrl,
                title: 'Customer Image',
                author: 'Customer Image',
                featured: true,
              });
          }
          if(this.state.poiBackImageUrl){
            imageDetails.push({
                img:  baseUrl+  this.state.poiBackImageUrl,
                title: 'POI Back Image',
                author: 'Back Image',
                featured: true,
              });
          }
          

          if(this.state.customerSignatureUrl){
            imageDetails.push({
                img:  baseUrl+  this.state.customerSignatureUrl,
                title: 'Customer Signature',
                author: 'Customer Signature',
                featured: true,
              });
          }

          if(this.state.retailerSignatureUrl){
            imageDetails.push({
                img:  baseUrl+  this.state.retailerSignatureUrl,
                title: 'Retailer Signature',
                author: 'Retailer Signature',
                featured: true,
              });
          }
         
         
          console.log("imageDetails",imageDetails);


          

          var prevImageDetails = [];
          if(this.state.prevRejectedImgs && this.state.prevRejectedImgs.poiFrontImageUrl){
            prevImageDetails.push({
                img: baseUrl+  this.state.prevRejectedImgs.poiFrontImageUrl,
                title: 'POI Front Image',
                author: 'Front Image',
                featured: true,
              });
          }
          if(this.state.prevRejectedImgs && this.state.prevRejectedImgs.customerImageUrl){
            prevImageDetails.push({
                img:  baseUrl+  this.state.prevRejectedImgs.customerImageUrl,
                title: 'Customer Image',
                author: 'Customer Image',
                featured: true,
              });
          }
          if(this.state.prevRejectedImgs && this.state.prevRejectedImgs.poiBackImageUrl){
            prevImageDetails.push({
                img: baseUrl+   this.state.prevRejectedImgs.poiBackImageUrl,
                title: 'POI Back Image',
                author: 'Back Image',
                featured: true,
              });
          }
          

          if(this.state.prevRejectedImgs && this.state.prevRejectedImgs.customerSignatureUrl){
            prevImageDetails.push({
                img: baseUrl+  this.state.prevRejectedImgs.customerSignatureUrl,
                title: 'Customer Signature',
                author: 'Customer Signature',
                featured: true,
              });
          }

          if(this.state.prevRejectedImgs && this.state.prevRejectedImgs.retailerSignatureUrl){
            prevImageDetails.push({
                img: baseUrl+ this.state.prevRejectedImgs.retailerSignatureUrl,
                title: 'Retailer Signature Image',
                author: 'Retailer Signature Image',
                featured: true,
              });
          }

          if(this.state.showPersonalDetails && this.state.prevRejectedImgs && this.state.prevRejectedImgs.pefImageUrl){
            prevImageDetails.push({
                img:  baseUrl+  this.state.prevRejectedImgs.pefImageUrl,
                title: 'CAF Image',
                author: 'CAF Image',
                featured: true,
              });
          }


          console.log("prevRejectedImgs",prevImageDetails)

        if(this.state.loading){
            return (  
                 <React.Fragment>
                    <PostLoginNavBar/><br />
                    <Typography variant="h6" >Loading...please wait.</Typography>
                </React.Fragment> 
                )   
        }
        
        console.log("test", this.state)
        return(

           


            <React.Fragment>
            <PostLoginNavBar/>
            {/* <h2  style={styles.textStyle}> View and Verify Document </h2> */}
           

            <Grid  direction="row" container className="flexGrow" spacing={1}  style={{paddingLeft:"10px",paddingRight:"10px"}}>

                <Grid item xs={12} sm={3}>
                    <Paper>
                      <div className="mainDivAdjustment">


                      <List component="nav" aria-label="main mailbox folders">
                           
                             <Typography variant="h6" style={styles.textStyle}> Acquisition Details</Typography>
                             <div style={{padding:"10px"}}> 
         
                            <Typography variant="subtitle1"> <b> Mobile No  </b>  : {this.state.mobileNumber}   </Typography>
                            <Typography variant="subtitle1"> <b> {this.state.poiType}  </b>  : {this.state.poiNumber}  </Typography>

                            <Typography variant="subtitle1"> <b> SIM  </b>  : {this.state.sim}   </Typography>

                            <Typography variant="subtitle1"> <b> Title  </b>  :  {this.state.title} {this.state.firstName} {this.state.middleName} {this.state.lastName}  </Typography>

                            <Typography variant="subtitle1"> <b> Gender  </b>  : {this.state.gender}   </Typography>

                            <Typography variant="subtitle1"> <b> Alternate  No.  </b>  : {this.state.alternateNumber}   </Typography>

                            <Typography variant="subtitle1"> <b> Gender  </b>  : {this.state.gender}   </Typography>

                            <Typography variant="subtitle1"> <b> Email  </b>  : {this.state.emailid}   </Typography>
                            <Typography variant="subtitle1"> <b> Present Address  </b>  : {this.state.presentAddress}   </Typography>

                            <Typography variant="subtitle1"> <b> Submitted By  </b>  : {this.state.submittedBy}   </Typography>

                            <Typography variant="subtitle1"> <b> Submit Date   </b>  : {this.state.submittedDate ? this.state.submittedDate.substring(0, 10) : "none"}  </Typography>

                            <Typography variant="subtitle1"> <b> Resubmit Date   </b>  : {this.state.resubmittedDate ? this.state.resubmittedDate.substring(0, 10) : "Not yet resubmitted"}   </Typography>

                            <Typography variant="subtitle1"> <b> FTA Date  </b>  :  {this.state.ftaDate ? this.state.ftaDate.substring(0, 10) : "none"} </Typography>
                            <Typography variant="subtitle1"> <b> Transaction Id  </b>  : {this.state.transactionId}   </Typography>
          
                             </div>
         
                          
         
                     </List>
                     </div>
                  
                    
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={9}>

                     <Paper style={{overflow:"scroll", height:"78vh"}}>
                     <Typography variant="h6" style={styles.textStyleHeading}> Document View </Typography>
                            <br />

                           {this.state.status=="image_uploading"? <Typography variant="h6" style={{color:"gray",textAlign:"center"}} ><br /><br /> <br /> <br /> <br /> <br /> <br />No documents are uploaded yet</Typography> : null}

                           {/* {this.state.status=="av_pending"? <ImageGalary imageDetails={imageDetails} /> : null} */}
                           {/* {imageDetails.length ? <Typography variant="h6">Customer Documents</Typography> : null } */}
                           {imageDetails.length? <SlideShowGalary imageDetails={{imageDetails: imageDetails, slideRef : this.slideRef}} /> : null}
                            <br />
                           {prevImageDetails.length ? <Typography variant="h6">Previous Rejected Documents</Typography> : null }
                           {/* {prevImageDetails.length ? <ImageGalary imageDetails={prevImageDetails} /> : null } */}
                           {prevImageDetails.length ? <SlideShowGalary imageDetails={{imageDetails: prevImageDetails, slideRef : this.slideRef}} /> : null }

                    </Paper>
                </Grid>

                {/* <Grid item xs={12} sm={datacontainer}>
                    <Paper style={{padding:"10px"}}>
                    <Typography variant="h6" style={styles.textStyle}>Verify or Reject</Typography>
                    <form style={styles.formContainer}>
                        <TextField label="Mobile No" required={true} fullWidth name="productName" value={this.state.mobileNumber} />
                        <TextField label={this.state.poiType} required={true} fullWidth name="displayName" value={this.state.poiNumber} />
                        <TextField label="SIM" required={true} fullWidth name="displayName" value={this.state.sim} />

                         <Grid item xs={12} sm={12}  >
                            <Typography variant="p">Select Reasons</Typography>
                         </Grid>
                        <div>
                            {reasonList}
                        </div>
                        <TextField multiline rows={2} label="Comments" fullWidth margin="none" name="comments" value={this.state.comments} onChange={this.onChange}/>
                    </form>
                    </Paper>
                </Grid> */}

            </Grid>

            <br />

            <div style={styles.footerButton}>
                <Grid container spacing={2} container
                direction="row"
                justify="center"
                alignItems="center">
                     
                     <Button variant="contained" color="default" style={{marginLeft: '20px'}} onClick={this.cancel}>Back to Listing</Button>

                           </Grid>
                           
            </div>




            <div>
        </div>

            </React.Fragment>
        )
    }

    handleChange = name => event => {

    
        this.setState({ ...this.state, selectedReasons: {...this.state.selectedReasons, [name]: event.target.checked } });
       // console.log("name name", onlycode); 

    };


    updateLocalActList = (txn) =>{
        var activationList = localStorage.getItem("activationList") && JSON.parse(localStorage.getItem("activationList"));
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
        localStorage.setItem("activationList",JSON.stringify(activationList));
    }

    onlockTransectionOnSkip = (txn) =>{
        var transactionsIds = {
            transactionsIds : [txn]
        }
        ActivationService.unlockTransectionsSkip( transactionsIds ).then(res => {
            let data = resolveResponse(res);
            if(data.message != 'ok'){
                Notify.showError("Server Error"+data.message);
            }
       });
    }


    skipThisVerify = (eventType) => {
        this.setState({ comments : ""});


        console.log("here")
      //  e.preventDefault();
        var selectedProductId = localStorage.getItem("selectedProductId");
        var verifyListingTxn = localStorage.getItem("verifyListingTxn");
        verifyListingTxn =  verifyListingTxn && verifyListingTxn.split(',');
        var nextid = '';
        for(var i=0; i < verifyListingTxn.length; i++ ){
            if(selectedProductId == parseInt(verifyListingTxn[i])){
                nextid =  parseInt(verifyListingTxn[i+1]);
                break;
            }
        }

       // this.updateLocalActList(selectedProductId);
       if(eventType === "skip"){
        this.onlockTransectionOnSkip(selectedProductId);
       }
        console.log("next id",nextid );
        
        if(nextid){
            localStorage.setItem("selectedProductId", nextid);
           // Notify.showSuccess("Acquisition skipped successfully and Lodding next...");

            this.loadOneTransection();
            this.setState({ approveLoader: false});
            this.setState({ approveDone: false});
            this.setState({ approveButton: true});

            this.setState({ rejectDone: false});
            this.setState({ rejectButton: true, comments : ""});
  
           // To call the method you can use the slide's ref attribute and then call the method. 
           this.slideRef && this.slideRef.current && this.slideRef.current.goTo(0);




        }else{
        //    Notify.showError("No item available");
           // this.props.history.push('/verify');
           this.cancel();
        }
    };

    approveEV = (e) => {
        e.preventDefault();

       

        console.log("approve data",this.state);
        var selectVal =  Object.values(this.state.selectedReasons)
        var isselelctedAny = selectVal.find(function(val){
                                return val == true;
                            });

        if(isselelctedAny){
            Notify.showError("Remove reason selections to approve");
            return;
        }

        this.setState({ approveLoader: true});
        this.setState({ approveButton: false});
        
        const product =  {
            "rejectedReasons":null,
            "comments": this.state.comments,
            "isPOIRejected": this.state.isPOIRejected,
            "isCumtomerPhotoRejected":0,
            "verificationDateTime": new Date(),
            "verificationUser": this.state.loginId,
            "isRejected": 0,
            "transactionId":this.state.transactionId
        }


        ActivationService.approveDocs(product)
        .then(res => {
          var data =  resolveResponse(res, "Acquisition Verified successfully and Lodding next acquisition to verify...");
        //this.props.history.push('/verify');
        this.setState({ approveLoader: false});
        this.setState({ approveDone: true});


        console.log(data);

        //    var second = 5 ;
        //    var showSeconds = setInterval(function(){
        //         Notify.showSuccess("Wait for "+second+" Second");
        //         second--;
        //         if(second == 0)
        //         clearInterval(showSeconds);
        //     }, 1000)

        //   Notify.showSuccess("Lodding next acquisition to verify...");

         //   this.updateLocalActList(this.state.transactionId);

          // this.skipThisVerify();
            setTimeout(() => {
                this.skipThisVerify("loadnext");
            }, 2000);
        });
    };

    rejectEV = (e) => {


       //alert("this.state.selectedReasons[i].includes");

        console.log("Reject Data",this.state);

        var selectVal =  Object.values(this.state.selectedReasons)
        var isselelctedAny = selectVal.find(  function(val){
                                return val == true;
                            });

        if(!isselelctedAny){
            Notify.showError("Select reason(s) to reject!");
            return;
        }

        this.setState({ rejectLoader: true});
        this.setState({ rejectButton: false});


        var keys = Object.keys(this.state.selectedReasons); 

        var onlyCode = []; 
        for(var i=0; i < keys.length; i++){
            var key = keys[i] && keys[i].split('-')[0].trim();
            onlyCode.push(key);
        }
        console.log("selectd onlyCode", onlyCode); 



        //const selectedReasons =  Object.keys(this.state.selectedReasons).join("|");

        var keyList = Object.keys(this.state.selectedReasons);

        var isPOIRejected = 0;
        for(var i=0; i < keyList.length; i++){
            if(keyList[i].includes("POI")){
                isPOIRejected =1;
                break;
            }

        }


        const rejectData =  {
            "rejectedReasons":onlyCode.join(","),
            "comments": this.state.comments,
            "isPOIRejected": isPOIRejected,
            "isCumtomerPhotoRejected":0,
            "verificationDateTime": new Date(),
            "verificationUser":this.state.loginId,
            "isRejected": 1,
            "transactionId":this.state.transactionId
        }

        ActivationService.approveDocs(rejectData)
        .then(res => {
           var resdata =  resolveResponse(res, "Acquisition Rejected successfully and Lodding next acquisition to verify...");
            //this.props.history.push('/verify');
          //  this.updateLocalActList(this.state.transactionId);
          this.setState({ rejectLoader: false});
          this.setState({ rejectDone: true});
         

            setTimeout(() => {
                this.skipThisVerify("loadnext");
            }, 2000);
        });

    };

    cancel = (e) => {

        this.props.history.push('/msisdn-status');
        
    };

    onChange = (e) => {
        var data =  e.target.value.trim();
        var test = !data.includes("@") && !data.includes("$") && !data.includes("&") ; 
        if(test){
            this.setState({[e.target.name]: e.target.value});
        }
      //  this.setState({[e.target.name]: e.target.value});

    }

}

const styles ={
    formContainer : {
        display: 'flex',
        flexFlow: 'row wrap'
    },

    textStyle :{
        display: 'flex',
        justifyContent: 'center', 
    },
    textStyleHeading:{
        display: 'flex',
        justifyContent: 'center', 
        // marginTop:"5px",

    },
    mainDivAdjustment:{
        padding:0,
        backgroundColor:"red", 
     
    },

    footerButton: {
        position: 'fixed',
        left: 0,
        bottom: '20px',
        width: '100%',
        textAlign: 'center'
    }

    

};









class SubmitedByDistributer extends React.Component {
    render() {
        
        //this.state.customerImageUrl
        var pefdetails = {
            img: this.props.pefImageUrl.pefImage,
            title: 'CAF Image',
            author: 'CAF Image',
            featured: true,
          };
        var prevPefdetails = {
            img: this.props.pefImageUrl.prevPefImage,
            title: 'Previous CAF Image',
            author: 'Previous CAF Image',
            featured: true,
          };

          var data = []; 

          if(this.props.pefImageUrl.pefImage){
            data.push({
                img:  this.props.pefImageUrl.pefImage,
                title: 'Customer Application Form',
                author: 'Customer Application Form',
                featured: true,
              });
          }
         
        return(
            <>
         
                <div className="image-container"  style={{height:'70vh'}}> 

                <div className="titleOverlay" style={{textAlign:"center"}}>&nbsp;&nbsp; CAF Image &nbsp;&nbsp;</div> 
                <ReactPanZoom  image={pefdetails.img} alt={pefdetails.title}/>
        
                {prevPefdetails.img ? <> 
                <div  style={{textAlign:"center", position: "relative"}}><br />
                <span className="titleOverlayPEF"> &nbsp;&nbsp; Previous CAF Image &nbsp;&nbsp; </span>   </div> 
             
              
                <ReactPanZoom  image={prevPefdetails.img} alt={prevPefdetails.title}/>  
               
                </> :''}
              
               
                </div>
        
            </>
        )
    }
}






export default VerifyEdit;
