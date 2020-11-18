import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import ActivationService from "../service/ActivationService";
import {resolveResponse} from "../../utils/ResponseHandler";
import PostLoginNavBar from "../PostLoginNavbar";
import Notify from "../../utils/Notify";
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import SlideShowGalary from "../../utils/SlideShowGalary";
import List from '@material-ui/core/List';
import ReactPanZoom from "react-image-pan-zoom-rotate";
import "./DocsView.css";

class VerifyEdit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
                customerImageUrl: null,
                customerSignatureUrl: null,
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
                sim : '',
                loader:false,
                loginId:'',
                emailid:'',
                presentAddress:'',
                bothReasons:'',
                loading: false
            }
    
        this.loadOneTransection = this.loadOneTransection.bind(this);
        this.slideRef = React.createRef(); 

    }

    loadOneTransection(){

        var data ={
            txnId : localStorage.getItem("selectedrefNumber")
        }

       ActivationService.msisdnDocsView(data).then(res => {
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
                presentAddress:selectedProduct.presentAddress,
                customerImageUrl: selectedProduct.customerImageUrl,
                customerSignatureUrl: selectedProduct.customerSignatureUrl,
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
                sim : selectedProduct.simNumber,
                submittedDate: selectedProduct.submittedDate,
                resubmittedDate : selectedProduct.resubmittedDate,
                ftaDate : selectedProduct.ftaDate,
                });

            
                if(this.state.showPersonalDetails){
                    this.setState({ rejectedReasons: this.state.bothReasons.eactivatedRejectionReasons});
                }else {
                    this.setState({ rejectedReasons: this.state.bothReasons.preActivatedRejectionReasons});
                }

        }else{
            Notify.showError(JSON.stringify(data));
        }

        this.setState({loading:false})
    })

    }

    componentDidMount() {
        this.loadOneTransection();
        localStorage.setItem("lastUrl","verify-edit");
    }

    render() {

          var imageDetails = []; var baseUrl= ''; //'https://retailer.airtel.lk';
          if(this.state.pefImageUrl){
            imageDetails.push({
                img: baseUrl+ this.state.pefImageUrl,
                title: 'PEF Image',
                author: 'PEF Image',
                featured: true,
              });
          }
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

        //   if(this.state.customerSignatureUrl){
        //     imageDetails.push({
        //         img:  baseUrl+  this.state.customerSignatureUrl,
        //         title: 'Customer Signature',
        //         author: 'Customer Signature',
        //         featured: true,
        //       });
        //   }

        //   if(this.state.retailerSignatureUrl){
        //     imageDetails.push({
        //         img:  baseUrl+  this.state.retailerSignatureUrl,
        //         title: 'Retailer Signature',
        //         author: 'Retailer Signature',
        //         featured: true,
        //       });
        //   }
        //  console.log("imageDetails",imageDetails);
     

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
                            <Typography variant="subtitle1"> <b> Email  </b>  : {this.state.emailid}   </Typography>
                            <Typography variant="subtitle1"> <b> Present Address  </b>  : {this.state.presentAddress}   </Typography>
                            <Typography variant="subtitle1"> <b> Submitted By  </b>  : {this.state.submittedBy}   </Typography>
                            <Typography variant="subtitle1"> <b> FTA Date  </b>  :  {this.state.ftaDate ? this.state.ftaDate.substring(0, 10) : "none"} </Typography>
                            <Typography variant="subtitle1"> <b> Submit Date   </b>  : {this.state.submittedDate ? this.state.submittedDate.substring(0, 10) : "none"}  </Typography>
                            <Typography variant="subtitle1"> <b> Resubmit Date   </b>  : {this.state.resubmittedDate ? this.state.resubmittedDate.substring(0, 10) : "Not yet resubmitted"}   </Typography>
                            <Typography variant="subtitle1"> <b> Transaction Id  </b>  : {this.state.transactionId}   </Typography>
                             </div>
                     </List>
                     </div>
                    </Paper>
                    <br /> 
                    <Grid container
                            direction="row"
                            justify="center"
                            alignItems="center">
                            <Button variant="contained" color="default" style={{marginLeft: '20px'}} onClick={this.cancel}>Back to Listing</Button>

                     </Grid>
                </Grid>
                <Grid item xs={12} sm={9}>
                     <Paper style={{overflow:"scroll", height:"90vh"}}>
                     <Typography variant="h6" style={styles.textStyleHeading}> Document View </Typography>
                            <br />
                           {this.state.status=="image_uploading"? <Typography variant="h6" style={{color:"gray",textAlign:"center"}} ><br /><br /> <br /> <br /> <br /> <br /> <br />No documents are uploaded yet</Typography> : null}
                           {imageDetails.length? <SlideShowGalary imageDetails={{imageDetails: imageDetails, slideRef : this.slideRef}} /> : null}
                           
                    </Paper>
                </Grid>
            </Grid>
            <br />
            <div>
        </div>
            </React.Fragment>
        )
    }

    cancel = (e) => {
        this.props.history.push('/msisdn-status');
    };

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

export default VerifyEdit;
