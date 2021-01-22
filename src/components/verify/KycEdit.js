import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import ActivationService from "../service/ActivationService";
import {resolveResponse} from "../../utils/ResponseHandler";
import PostLoginNavBar from "../PostLoginNavbar";
import Notify from "../../utils/Notify";
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import SlideShowGalary from "../../utils/SlideShowGalary";
import List from '@material-ui/core/List';
import "./Verify.css";
import ReactPanZoom from "react-image-pan-zoom-rotate";
import CircularProgress from '@material-ui/core/CircularProgress';
import DoneSharpIcon from '@material-ui/icons/DoneSharp';
import  {IMAGE_VALIDATION_TOKEN,COOKIE_DOMAIN} from "../../utils/config";
import getKycTotalToBeProcessed from "../../utils/CommonApi";


class KycEdit extends React.Component {

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
                loading: true

            }
        this.onChange = this.onChange.bind(this);
        this.approveEV = this.approveEV.bind(this);
        this.rejectEV = this.rejectEV.bind(this);
        this.loadOneTransection = this.loadOneTransection.bind(this);
        this.onlockTransectionOnSkip = this.onlockTransectionOnSkip.bind(this);
        this.slideRef = React.createRef(); 
        this.getNextTxnDetails = this.getNextTxnDetails.bind(this);   
    }

    loadOneTransection(){
        getKycTotalToBeProcessed("PROCESS_CUSTOMER_KYC");
    
        const selectedProductId = localStorage.getItem("selectedProductId");

        const data = {
            selectedProductId : selectedProductId, 
            processType:  "PROCESS_CUSTOMER_KYC"
        }
        if(selectedProductId == null) {
            this.cancel();
        }else {
            ActivationService.getOneKycVerify(data).then(res => {
                let data = resolveResponse(res);
                const selectedProduct = data.result;
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
                        selectedReasons: objectReason,
                        sim : selectedProduct.simNumber,
                        submittedDate: selectedProduct.submittedDate,
                        resubmittedDate : selectedProduct.resubmittedDate,
                        ftaDate : selectedProduct.ftaDate,
                        prevRejectedImgs : selectedProduct.prevData
                        });

                        this.setState({ rejectedReasons: this.state.bothReasons.eactivatedRejectionReasons});

                        this.getNextTxnDetails();
                    }else{
                    Notify.showError(JSON.stringify(data));
                }
                this.setState({loading:false})
            })
        }
    }

    componentDidMount() {
        localStorage.setItem("lastUrl","kyc-edit");
        const userDetails = JSON.parse(localStorage.getItem("userDetails"));
        if(userDetails){
            this.setState({ loader: true,  loginId : userDetails.loginId });
        }
        if(JSON.parse(localStorage.getItem('cmsStaticData')) ){
            this.setState({bothReasons:  JSON.parse(localStorage.getItem('cmsStaticData'))});
        }
        this.loadOneTransection();
    }
    render() {

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

          var imageDetails = []; var baseUrl= ''; //   '//'+COOKIE_DOMAIN; //'https://retailer.airtel.lk';
          if(this.state.poiFrontImageUrl){
            imageDetails.push({
                img: baseUrl+ this.state.poiFrontImageUrl,
              //  img:  localStorage.getItem('pocimgstring'),
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

        //   if(this.state.showPersonalDetails && this.state.prevRejectedImgs && this.state.prevRejectedImgs.pefImageUrl){
        //     prevImageDetails.push({
        //         img:  baseUrl+  this.state.prevRejectedImgs.pefImageUrl,
        //         title: 'PEF Image',
        //         author: 'PEF Image',
        //         featured: true,
        //       });
        //   }


          console.log("prevRejectedImgs",prevImageDetails)

        var pefcontainer = 2, doccontaiter = 7, datacontainer=3;
        // if(!this.state.showPersonalDetails) {
        //     pefcontainer = 5; 
        //     doccontaiter = 5;
        //     datacontainer = 2
        // }
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
                <Typography variant="h6" style={styles.textStyleHeading}>KYC Re-Registration Verification View </Typography>
                <Grid  direction="row" container className="flexGrow" spacing={1}  style={{paddingLeft:"10px",paddingRight:"10px"}}>
                    <Grid item xs={12} sm={pefcontainer}>
                        <Paper style={{overflow:"scroll", height:"78vh"}}>
                        {this.state.loader ?    <SubmitedByRetailer cafdetails={this.state} />  : ""}
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={doccontaiter}>
                        <Paper style={{overflow:"scroll", height:"78vh"}}>
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

                    <Grid item xs={12} sm={datacontainer}>
                        <Paper style={{padding:"10px"}}>
                        <Typography variant="h6" style={styles.textStyle}>Verify or Reject</Typography>
                        <form style={styles.formContainer}>
                            {/* <Typography variant="h6" component="h3">Mobile : {this.state.mobileNumber}   </Typography> */}
                            <TextField label="Mobile No" required={true} fullWidth name="productName" value={this.state.mobileNumber} />
                            <TextField label={this.state.poiType} required={true} fullWidth name="displayName" value={this.state.poiNumber} />
                            {/* <TextField label="SIM" required={true} fullWidth name="displayName" value={this.state.sim} /> */}

                            <Grid item xs={12} sm={12}  >
                                <Typography variant="p">Select Reasons</Typography>
                            </Grid>
                            <div>
                                {reasonList}
                            </div>
                            <TextField multiline rows={2} label="Comments" fullWidth margin="none" name="comments" value={this.state.comments} onChange={this.onChange}/>
                        </form>
                        </Paper>
                    </Grid>

                </Grid>

                <br />

                {this.state.loader ?
                <div style={styles.footerButton}><Grid container spacing={2} container
                    direction="row"
                    justify="center"
                    alignItems="center">
                            {this.state.approveLoader ? <CircularProgress />: ""}
                            {this.state.approveDone ? <Button variant="outlined" color="primary" style={{marginLeft: "20px"}}> <DoneSharpIcon color="primary"/> Approved and Loading Next</Button> : ""}
                            {this.state.approveButton ? (this.state.status=="image_uploading" ?  <Button disabled variant="contained" color="primary" style={{marginLeft: '20px'}} onClick={this.approveEV}>Approve</Button>: <Button variant="contained" color="primary" style={{marginLeft: '20px'}} onClick={this.approveEV}>Approve</Button>): ""}

                            {this.state.rejectLoader ? <>&nbsp;&nbsp;&nbsp;<CircularProgress /></>: ""}
                            {this.state.rejectDone ?  <Button variant="outlined" color="primary" style={{marginLeft: "20px"}}> <DoneSharpIcon color="primary"/> Rejected and Loading Next</Button> : ""}
                            {this.state.rejectButton ? <Button variant="contained" color="secondary" style={{marginLeft: '20px'}} onClick={this.rejectEV}>Reject</Button>: ""}

                            <Button variant="contained" color="secondary" style={{marginLeft: '20px', backgroundColor:"#33691e"}} onClick={() => this.skipThisVerify("skip")}> SKIP </Button>
                            <Button variant="contained" color="default" style={{marginLeft: '20px'}} onClick={this.cancel}>Back to Listing</Button>
                </Grid></div>: ""}

                <img style={{  width: "1px"}} src={this.state.poiFrontImageUrlNext} />
                <img style={{  width: "1px"}} src={this.state.customerImageUrlNext} />
                <img style={{  width: "1px"}} src={this.state.poiBackImageUrlNext} />
                <img style={{  width: "1px"}} src={this.state.customerSignatureUrlNext} />
                <img style={{  width: "1px"}} src={this.state.retailerSignatureUrlNext} />
                <img style={{  width: "1px"}} src={this.state.pefImageUrlNext} />

                <img style={{  width: "1px"}} src={this.state.poiFrontImageUrlNextP} />
                <img style={{  width: "1px"}} src={this.state.customerImageUrlNextP} />
                <img style={{  width: "1px"}} src={this.state.poiBackImageUrlNextP} />
                <img style={{  width: "1px"}} src={this.state.customerSignatureUrlNextP} />
                <img style={{  width: "1px"}} src={this.state.retailerSignatureUrlNextP} />
                <img style={{  width: "1px"}} src={this.state.pefImageUrlNextP} />
                
            </React.Fragment>
        )
    }

    handleChange = name => event => {

        this.setState({ ...this.state, selectedReasons: {...this.state.selectedReasons, [name]: event.target.checked } });
        console.log("name this.state.selectedReasons", this.state.selectedReasons); 

    };

    onlockTransectionOnSkip = (txn) =>{
        var transactionsIds = {
            transactionsIds : [txn],
            "processType": "PROCESS_CUSTOMER_KYC"
        }
        ActivationService.kycUnlockTransectionsSkip( transactionsIds ).then(res => {
            let data = resolveResponse(res);
            if(data.message != 'ok'){
                Notify.showError("Server Error"+data.message);
            }
       });
    }

    // toDataURL = (src, callback, outputFormat) => {
    //     var img = new Image();
    //     img.crossOrigin = 'Anonymous';
    //     img.onload = function() {
    //       var canvas = document.createElement('CANVAS');
    //       var ctx = canvas.getContext('2d');
    //       var dataURL;
    //       canvas.height = this.naturalHeight;
    //       canvas.width = this.naturalWidth;
    //       ctx.drawImage(this, 0, 0);
    //       dataURL = canvas.toDataURL(outputFormat);
    //       callback(dataURL);
    //     };
    //     img.src = src;
    //     if (img.complete || img.complete === undefined) {
    //       img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
    //       img.src = src;
    //     }
    //   }
    
    
    getNextTxnDetails = () =>{

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

        if(nextid){
            const data = {
                selectedProductId : nextid, 
                processType:  "PROCESS_CUSTOMER_KYC"
            }
            ActivationService.getOneKycVerify(data).then(res => {
                let data = resolveResponse(res);
                if(data.result){

                    localStorage.setItem("VerifyNextTxtDetails", JSON.stringify(data.result));
                   
                    this.setState({ poiFrontImageUrlNext : data.result.poiFrontImageUrl});
                    this.setState({ customerImageUrlNext : data.result.customerImageUrl});
                    this.setState({ poiBackImageUrlNext : data.result.poiBackImageUrl});
                    this.setState({ customerSignatureUrlNext : data.result.customerSignatureUrl});
                    this.setState({ retailerSignatureUrlNext : data.result.retailerSignatureUrl});
                    this.setState({ pefImageUrlNext : data.result.pefImageUrl});

                    if(data.result.prevData){
                        this.setState({ poiFrontImageUrlNextP : data.result.prevData.poiFrontImageUrl});
                        this.setState({ customerImageUrlNextP : data.result.prevData.customerImageUrl});
                        this.setState({ poiBackImageUrlNextP : data.result.prevData.poiBackImageUrl});
                        this.setState({ customerSignatureUrlNextP : data.result.prevData.customerSignatureUrl});
                        this.setState({ retailerSignatureUrlNextP : data.result.prevData.retailerSignatureUrl});
                        this.setState({ pefImageUrlNextP : data.result.prevData.pefImageUrl});    
                    }
                  
                    // this.toDataURL('http://125.17.6.6/retailer/static/media/airtellogo.09dde59b.png', function(dataUrl) {
                    //   window.localStorage.setItem('pocimgstring',dataUrl );
                    //   console.log('data.result.customerSignatureUrl:', dataUrl);
                    // })
                   
                }
            })
        }

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
            "processType": "PROCESS_CUSTOMER_KYC",
            "transactionId":this.state.transactionId
        }


        ActivationService.kycApproveDocs(product)
        .then(res => {
          var data =  resolveResponse(res, "Acquisition Verified successfully and Lodding next acquisition to verify...");
        //this.props.history.push('/verify');
        this.setState({ approveLoader: false});
        this.setState({ approveDone: true});


        console.log(data);

            setTimeout(() => {
                this.skipThisVerify("loadnext");
            }, 2000);
        });
    };

    rejectEV = (e) => {

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
            if(this.state.selectedReasons[keys[i]]) {
                onlyCode.push(key);
            }
          
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
            "processType": "PROCESS_CUSTOMER_KYC",
            "transactionId":this.state.transactionId
        }

        ActivationService.kycApproveDocs(rejectData)
        .then(res => {
           var resdata =  resolveResponse(res, "Acquisition Rejected successfully and Lodding next acquisition to verify...");
            //this.props.history.push('/verify');
          this.setState({ rejectLoader: false});
          this.setState({ rejectDone: true});
         

            setTimeout(() => {
                this.skipThisVerify("loadnext");
            }, 2000);
        });

    };

    cancel = (e) => {
        this.props.history.push('/kyc');
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







class SubmitedByRetailer extends React.Component {


    render() {
        return(
            <div className="mainDivAdjustment">


             <List component="nav" aria-label="main mailbox folders">
                  
                    <Typography variant="h6" style={styles.textStyle}> KYC Details</Typography>
                    <div style={{padding:"10px"}}> 
                        <b> Title : </b> {this.props.cafdetails.title} {this.props.cafdetails.firstName} {this.props.cafdetails.middleName} {this.props.cafdetails.lastName} 
                        <br /> 
                       <b> Gender : </b>  {this.props.cafdetails.gender} 
                        <br /> 
                       <b> Address : </b>   {this.props.cafdetails.presentAddress}   
                        <br /> 
                      <b> Alternate  No. :</b>   {this.props.cafdetails.alternateNumber}   
                        <br /> 
                      <b>  Email : </b> {this.props.cafdetails.emailid} 
                        <br /> 
                       <b> FTA Date :</b>  {this.props.cafdetails.ftaDate ? this.props.cafdetails.ftaDate.substring(0, 10) : "none"} 
                        <br /> 
                       <b>Submit Date :  </b> {this.props.cafdetails.submittedDate ? this.props.cafdetails.submittedDate.substring(0, 10) : "none"}
                        {/* <br /> 
                       <b>Resubmit Date :  </b> {this.props.cafdetails.resubmittedDate ? this.props.cafdetails.resubmittedDate.substring(0, 10) : "Not yet resubmitted"}  */}


                    </div>

            </List>
            </div>
        )
    }
}

class SubmitedByDistributer extends React.Component {
    render() {
        
        //this.state.customerImageUrl
        var pefdetails = {
            img: this.props.pefImageUrl.pefImage,
            title: 'PEF Image',
            author: 'PEF Image',
            featured: true,
          };
        var prevPefdetails = {
            img: this.props.pefImageUrl.prevPefImage,
            title: 'Previous PEF Image',
            author: 'Previous PEF Image',
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

                <div className="titleOverlay" style={{textAlign:"center"}}>&nbsp;&nbsp; PEF Image &nbsp;&nbsp;</div> 
                <ReactPanZoom  image={pefdetails.img} alt={pefdetails.title}/>
        
                {prevPefdetails.img ? <> 
                <div  style={{textAlign:"center", position: "relative"}}><br />
                <span className="titleOverlayPEF"> &nbsp;&nbsp; Previous PEF Image &nbsp;&nbsp; </span>   </div> 
             
              
                <ReactPanZoom  image={prevPefdetails.img} alt={prevPefdetails.title}/>  
               
                </> :''}
              
               
                </div>
        
            </>
        )
    }
}






export default KycEdit;
