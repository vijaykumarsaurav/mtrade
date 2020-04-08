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




// const useStyles = makeStyles(theme => ({
//     root: {
//       padding: theme.spacing(3, 2),
//     },
//   }));
// const SampleFab = () => {
//     const classes = useStyles();
//     return <Paper className={classes.root}></Paper>;
//  }


 
  


class DataEntryAdd extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
                txnId: '',
                mobileNumber: ''
        }
        this.updateProduct = this.updateProduct.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {
        
        const dataEntryId = localStorage.getItem("dataEntryId");
       // console.log( "selectedProductId",  selectedProductId);
        
        if(dataEntryId == null) {
            alert("Please select a product to edit.");
            this.props.history.push('/products');
        }else {

            ActivationService.getOneDataEntry(dataEntryId).then(res => {
                let data = resolveResponse(res);
                const selectedProduct = data.result;

           
                // pefImageUrl: null
                // poiBackImageUrl: null
                // poiFrontImageUrl: null
                // rejectedReasons: null
                // status: "ev_pending"
                // title: "Mr"
                // transactionId: 323

                this.setState({


                    mobileNumber: selectedProduct.mobileNumber,
                    // poiNumber: selectedProduct.poiNumber,
                    // poiType: selectedProduct.poiType,
                    // address1: selectedProduct.address1, 
                    // address2:  selectedProduct.address2,
                    // address3:  selectedProduct.address3,
                    // altContactNumber:selectedProduct.altContactNumber, 
                    // comments : selectedProduct.comments, 
                    // customerImageUrl :selectedProduct.customerImageUrl, 
                    // customerSignatureUrl:selectedProduct.customerSignatureUrl, 
                    // deDateTime : selectedProduct.deDateTime, 
                    // deUser: selectedProduct.deUser, 
                    // dob:selectedProduct.dob, 
                    // firstName:selectedProduct.firstName, 
                    // gender: selectedProduct.gender, 
                    // lastName : selectedProduct.lastName, 
                    // middleName:selectedProduct.middleName, 

                    // pefCount: '',
                    // nicCount: '',
                    // distributer: '',
                    // zone: '',
                    // ftaDate: '',
                    // status: '',
                    // resubmit: '',
                    // verifiedDate: '',
                    // submitDate: '',
                    // resubmitDate: '',
                    // title:"Mr."

                    });
            })

            const userDetails = JSON.parse(localStorage.getItem("userDetails")); 
            console.log("Role", userDetails.roleCode);

            ActivationService.getStaticData(userDetails.roleCode).then(res => {
                let data = resolveResponse(res);
                console.log("Static Data", data.result.rejectionReasons);

                this.setState({
                    rejectionReasons: data.result.rejectionReasons
                    });
            })



        }
    }

    render() {

        var tileData = [
            {
              img: 'https://www.motoroids.com/wp-content/uploads/2019/03/Current-Driver-license-front-side-1200x675.jpg',
              title: 'Front Image',
              author: 'Front Image',
              featured: true,
            },
            {
             img: 'https://cdn.hpm.io/wp-content/uploads/2015/01/04114540/texas-roadside-assistance2-1000x750.jpg',
             title: 'Back Image',
             author: 'Back Image',
             featured: true,
           },
           {
             img: 'https://www.graphic.com.gh/images/2017/july/july18/signature.png',
             title: 'Customer Signature',
             author: 'Customer Signature',
             featured: true,
           },{
            img: 'https://pbs.twimg.com/media/Bpbm1DXCAAA5vk4?format=jpg&name=900x900',
            title: 'Customer Signature',
            author: 'Customer Application Form',
            featured: true,
          }];

        //   var tileData = [
        //     {
        //       img: this.state.poiFrontImageUrl,
        //       title: 'Front Image',
        //       author: 'Front Image',
        //       featured: true,
        //     },
        //     {
        //      img:  this.state.poiBackImageUrl,
        //      title: 'Back Image',
        //      author: 'Back Image',
        //      featured: true,
        //    },
        //    {
        //      img:  this.state.customerSignatureUrl,
        //      title: 'Customer Signature',
        //      author: 'Customer Signature',
        //      featured: true,
        //    },{
        //     img:  this.state.customerImageUrl,
        //     title: 'Customer Signature',
        //     author: 'Customer Application Form',
        //     featured: true,
        //   }];

        return(
            <React.Fragment>
            <PostLoginNavBar/>
            {/* <h2  style={styles.textStyle}> View and Verify Document </h2> */}
            {/* <Typography variant="h5" style={styles.textStyle} >Data Entry </Typography> */}

            <Grid container className="flexGrow" spacing={3}  style={{padding:"10px"}}>
               <Grid item  xs={12} sm={6} style={{overflow:"scroll", height:"600px"}}>
                     {/* 
                    
                    "poiFrontImageUrl": null,
                    "poiBackImageUrl": null,
                    "customerSignatureUrl": null,
                    "customerImageUrl": null,
                    "pefImageUrl": null,
                    "transactionId": 261,
                    "status": "ev_pending" */}
                
                 <Paper style={{padding:"10px",background:"#efefef"}} >
                
                    {/* <Lightbox />
                    <Typography  variant="h6" style={styles.textStyle} >POI Front Image</Typography> 
                    <div className="imagebox" >
                        <ReactPanZoom image="https://www.motoroids.com/wp-content/uploads/2019/03/Current-Driver-license-front-side-1200x675.jpg" alt="document image"/>
                    </div>
                  */}
                    </Paper>

                </Grid>

      
                  <Grid item  xs={12} sm={6}>

                {/* <Container maxWidth="sm"> */}
                    <Paper style={{paddingLeft:"20px",paddingRight:"20px", paddingBottom:"5px", }}>
                    <Typography variant="h6" style={styles.textStyle}>Data Entry</Typography>
                    <form style={styles.formContainer}>
                        {/* <Typography variant="h6" component="h3">Mobile : {this.state.mobileNumber}   </Typography> */}

                        <Grid spacing={5} container direction="row">
                            <Grid item xs={12} sm={6}>
                                <TextField   label="Mobile No" required={true} fullWidth name="displayName" value={this.state.mobileNumber} onChange={this.onChange}/>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField type="number" label="Alternet Contact No" required={true} fullWidth name="altContactNumber"  onChange={this.onChange}/>
                            </Grid>
                        </Grid>

                        <Grid spacing={5} container direction="row">
                            <Grid item xs={12} sm={6}>
                                 <FormControl style={styles.selectStyle}>
                                    <InputLabel htmlFor="gender">POI Type</InputLabel>
                                    <Select value={this.state.poiType}  name="poiType" onChange={this.onChange}>
                                        <MenuItem value={"NIC"}>NIC</MenuItem>
                                        <MenuItem value={"DL"}>DL</MenuItem>
                                    </Select>
                                </FormControl>
                                {/* <TextField label="POI Type" required={true} fullWidth name="poiType"  onChange={this.onChange}/> */}
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField label="POI Number" required={true} fullWidth name="poiNumber" onChange={this.onChange}/>
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


                        <Grid spacing={5} container direction="row">
                            <Grid item xs={12} sm={6}>

                             <FormControl style={styles.selectStyle}>
                                    <InputLabel htmlFor="title">Title</InputLabel>
                                    <Select value={this.state.gender}  name="gender" onChange={this.onChange}>
                                        <MenuItem value={"mr"}>Mr</MenuItem>
                                        <MenuItem value={"Mrs"}>Mrs</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                            <TextField label="First Name" required={true} fullWidth name="firstName"  onChange={this.onChange}/>

                            </Grid>
                        </Grid>


                         

                       
                         <Grid spacing={5} container direction="row">
                            {/* <Grid item xs={12} sm={4}>
                                <TextField label="First Name" required={true} fullWidth name="firstName"  onChange={this.onChange}/>
                            </Grid> */}
                            <Grid item xs={12} sm={6}>
                                <TextField label="Middle Name" required={true} fullWidth name="middleName" onChange={this.onChange}/>
                            </Grid>
                            <Grid item xs={12} sm={6} >
                                <TextField label="Last Name" required={true} fullWidth name="lastName"  onChange={this.onChange}/>
                            </Grid> 
                         </Grid>

                        {/* </Grid> */}

                        <Grid spacing={5} container direction="row">
                            <Grid item xs={12} sm={6}>
                                <TextField  style={styles.selectStyle} type="date" label="DOB"  name="dob"  onChange={this.onChange}/>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl style={styles.selectStyle}>
                                    <InputLabel htmlFor="gender">Gender</InputLabel>
                                    <Select value={this.state.gender}  name="gender" onChange={this.onChange}>
                                        <MenuItem value={"Male"}>Male</MenuItem>
                                        <MenuItem value={"Female"}>Female</MenuItem>
                                        <MenuItem value={"Others"}>Others</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Grid item xs={12} sm={12}>
                            <TextField label="Address 1" required={true} fullWidth name="Address1" onChange={this.onChange}/>
                        </Grid>

                        <Grid item xs={12} sm={12}>
                            <TextField label="Address 2" required={true} fullWidth name="Address2" onChange={this.onChange}/>
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <TextField label="Address 3" required={true} fullWidth name="Address3" onChange={this.onChange}/>
                        </Grid>

                        {/* <TextField multiline rows={2} label="Rejected Reasons" fullWidth margin="none" name="helpText" onChange={this.onChange}/> */}
                        <TextField multiline rows={2} label="Comments" fullWidth margin="none" name="comment" onChange={this.onChange}/>
                    </form>
                    </Paper>


                    
                {/* </Container> */}
                </Grid>
            
            </Grid>

             <Grid  container spacing={24} container
                direction="row"
                justify="center"
                alignItems="center">
                    {/* <Grid item xs={4}>
                          
                    </Grid> */}
                    {/* <Grid item xs={4}> */}
                       <Button variant="contained" color="primary" style={{marginLeft: '20px'}} onClick={this.approve}>Sabmit</Button>
                       {/* <Button variant="contained" color="secondary" style={{marginLeft: '20px'}} onClick={this.reject}>Reject</Button> */}
                       <Button variant="contained" color="default" style={{marginLeft: '20px'}} onClick={this.cancel}>Back to Listing</Button>
                    {/* </Grid> */}
                    {/* <Grid item xs={4}>
                    
                    </Grid> */}
                </Grid>


            <div>
 
  
        </div>

            </React.Fragment>
        )
    }

    handleChange = name => event => {
        this.setState({ ...this.state, [name]: event.target.checked });
    };

    onChangeServingTime = (e) => {
        if(e.target.value > 15 || e.target.value < 1) {
            Notify.showError("Serving time should be in the range of 1 and 15.");
            return;
        }
        this.setState({[e.target.name]: e.target.value}
        );
    }

    onChangePriority = (e) => {
        if(e.target.value > 15 || e.target.value < 1) {
            Notify.showError("Priority should be in the range of 1 and 15.");
            return;
        }
        this.setState({[e.target.name]: e.target.value}
        );
    }

    

    updateProduct = (e) => {
        e.preventDefault();
        if(!this.state.productName || !this.state.displayName || !this.state.servingTimeInMins || !this.state.priority
            || !this.state.iconUrl ){
            Notify.showError("Missing required fields");
            return;
        }
        const product = {id:this.state.id, active: this.state.active, onlineBooking: this.state.onlineBooking, showRecent: this.state.showRecent, productName: this.state.productName,
            displayName: this.state.displayName,servingTimeInMins: this.state.servingTimeInMins, priority: this.state.priority,iconUrl: this.state.iconUrl, tagUrl: this.state.tagUrl, helpTextImage: this.state.helpTextImage, helpText: this.state.helpText};
        ActivationService.updateProduct(product)
            .then(res => {
                resolveResponse(res, "Product updated successfully.");
               // this.props.history.push('/products');
            });
    };

    approve = (e) => {
        e.preventDefault();
      
        Notify.showSuccess("Approved");
        console.log("data entry post data",this.state)

        // if(!this.state.productName || !this.state.displayName || !this.state.servingTimeInMins || !this.state.priority
        //     || !this.state.iconUrl ){
        //     Notify.showError("Missing required fields");
        //     return;
        // }
        //const product = {id:this.state.id, active: this.state.active, onlineBooking: this.state.onlineBooking, showRecent: this.state.showRecent, productName: this.state.productName,
           // displayName: this.state.displayName,servingTimeInMins: this.state.servingTimeInMins, priority: this.state.priority,iconUrl: this.state.iconUrl, tagUrl: this.state.tagUrl, helpTextImage: this.state.helpTextImage, helpText: this.state.helpText};
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
                "address1": this.state.Address1,
                "address2": this.state.Address2,
                "address3": this.state.Address3,
                "altContactNumber": this.state.altContactNumber,
                "comments": this.state.comment,
                "deDateTime": new Date(),
                "deUser": null
            }
        
            ActivationService.saveDataEntry(product)
            .then(res => {
                resolveResponse(res, "Product updated successfully.");
              //  this.props.history.push('/products');
            });
    };

    reject = (e) => {
        e.preventDefault();
       // alert("Reject"); 
       Notify.showSuccess("Rejected");

        if(!this.state.productName || !this.state.displayName || !this.state.servingTimeInMins || !this.state.priority
            || !this.state.iconUrl ){
            Notify.showError("Missing required fields");
            return;
        }
        const product = {id:this.state.id, active: this.state.active, onlineBooking: this.state.onlineBooking, showRecent: this.state.showRecent, productName: this.state.productName,
            displayName: this.state.displayName,servingTimeInMins: this.state.servingTimeInMins, priority: this.state.priority,iconUrl: this.state.iconUrl, tagUrl: this.state.tagUrl, helpTextImage: this.state.helpTextImage, helpText: this.state.helpText};
        ActivationService.updateProduct(product)
            .then(res => {
                resolveResponse(res, "Product updated successfully.");
                this.props.history.push('/products');
            });
    };

    cancel = (e) => {
        this.props.history.push('/distributer');
    };

    onChange = (e) => {
        console.log(e.target.value);
        this.setState({[e.target.name]: e.target.value});
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
    }
};





export default DataEntryAdd;