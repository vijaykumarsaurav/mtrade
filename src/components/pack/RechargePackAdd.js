import React from "react";
import axios from "axios";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import pack from "../service/AdminService";
import PostLoginNavBar from "../PostLoginNavbar";
import { Container, Paper } from "@material-ui/core";
import { resolveResponse } from "../../utils/ResponseHandler";
import Notify from "../../utils/Notify";
//import MaterialUIPickers from "./MaterialUIPickers";
import MaterialUIPickers from "../../utils/MaterialUIPickers";

import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import md5  from 'md5'; 
import ActivationService from "../service/ActivationService";
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


class RechargePackAdd extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        activationStatus: "",
        amount: "",
        comment: "",
        connectionType: "",
        dataDay: "",
        dataDayType: "",
        description: "",
        displayOrder: "",
        displayType: "",
        endDate: new Date(),
        imageURL: "imageURL",
        isFtr: "",
        isSpecialFtr: false,
        nightDay: "",
        nightDayType: "",
        packType: "",
        startDate: new Date(),
        userCategory: "",
        validityDays: "",
        validityType: "",
        file: null,
        packtypevalue: [], 
        packTypeitem:'',
        showDescription:false,
        listofzones:[],
        selectedZone:[],
        zone:'',
        showFileSize: "", 
        selectAllzone:'Select All',
        showFileBrowser:false,
        activationType:""
    };
    this.savePack = this.savePack.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onChangePack = this.onChangePack.bind(this);
    this.myCallback = this.myCallback.bind(this);
    this.zoneChange = this.zoneChange.bind(this);

  }
  myCallback = (date, fromDate) => {
    if (fromDate === "START_DATE") {
      this.setState({ startDate: new Date(date).getTime() });
    } else if (fromDate === "END_DATE") {
      this.setState({ endDate: new Date(date).getTime() });
    }
  };

  zoneChange = (e) =>{
    this.setState({[e.target.name]: e.target.value})
    
    if(e.target.value.includes("Select All")){
      this.setState({selectedZone: this.state.listofzones})
      this.setState({selectAllzone: "Remove All"})
    }

    if(e.target.value.includes("Remove All")){
      this.setState({selectedZone: []})
      this.setState({selectAllzone: "Select All"})
    }

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

    const filetoupload = this.validateUploadFile(e.target.files[0]); 
     if (filetoupload){
       this.setState({
           [e.target.name]: e.target.files[0], 
           showFileSize : e.target.files[0].size / 1000 + "KB",
           imageURL: URL.createObjectURL(e.target.files[0])
       })
     }else{
       this.setState({
           [e.target.name]: null, 
           showFileSize : "",
           imageURL: ""
       })
       e.target.value = null;
 
     }
   } 


  componentDidMount() {
    localStorage.setItem("lastUrl","packadd");
    if(JSON.parse(localStorage.getItem('cmsStaticData'))){
      this.setState({listofzones:  JSON.parse(localStorage.getItem('cmsStaticData')).zones});
    }

  }

  render() {

    const dateParam = {
      myCallback: this.myCallback,
      startDate: '',
      endDate:'', 
      firstLavel : "Start Date", 
      secondLavel : "End Date"

    }

    
    console.log(this.state, "STATE_MATTERS");
    return (
      <React.Fragment>
        <PostLoginNavBar />
        <Container maxWidth="sm">
          <Paper style={{ padding: "20px" }}>
            <Typography variant="h5" style={styles.textStyle}>
              Add Recharge Pack
            </Typography>
            <form style={styles.formContainer}>
             
            <Grid container spacing={2} direction="row" justify="flex-end" >
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Amount"
                  required={true}
                  type="number"
                  min="1"
                  max="99999"
                  fullWidth
                  name="amount"
                  value={this.state.amount}
                  onChange={this.onChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Pack Name"
                  type=""
                  rows={2}
                  fullWidth
                  margin="none"
                  min="1"
                  max="15"
                  name="comment"
                  value={this.state.comment}
                  onChange={this.onChange} />
                </Grid>

            </Grid>

              <Grid container spacing={2} direction="row" justify="flex-end" >

              <Grid item xs={12} sm={6}>

              <TextField
                label="Description"
                fullWidth
                multiline 
                variyant 
                rows={2} 
                margin="normal"
                name="description"
                value={this.state.description}
                onChange={this.onChange}
              />
            
             </Grid>


             <Grid item xs={12} sm={6} style={{marginTop: '34px'}}>

                <FormControl style={styles.selectStyle}>
                    <InputLabel id="demo-mutiple-name-label">Select Zone</InputLabel>
                    <Select
                    labelId="demo-mutiple-name-label"
                    id="demo-mutiple-name"
                    multiple
                    disabled={this.state.isSpecialFtr}
                    name="selectedZone"
                    value={this.state.selectedZone}
                    onChange={this.zoneChange}
                    input={<Input />}
                    MenuProps={MenuProps}
                    >
                      <MenuItem key={this.state.selectAllzone} value={this.state.selectAllzone} >
                        <b> {this.state.selectAllzone}   </b>                                         
                      </MenuItem>

                    {this.state.listofzones ? this.state.listofzones.map(name => (
                        <MenuItem key={name} value={name} >
                            {name}
                        </MenuItem>
                    )): ""}
                    </Select>
                </FormControl>

              </Grid>

              </Grid>

             <Grid container spacing={2} direction="row" justify="flex-end" >


             <Grid item xs={12} sm={6}>


            <FormControl style={styles.multiselect}>
              <InputLabel htmlFor="Connection Type" required={true}>
                Connection Type
              </InputLabel>
              <Select
                name="connectionType"
                value={this.state.connectionType}
                onChange={this.onChange}
              >
                <MenuItem value="prepaid">Prepaid</MenuItem>
                <MenuItem value="postpaid">Postpaid</MenuItem>
              </Select>
            </FormControl>
            </Grid>
              
              <Grid item xs={12} sm={6}>
              
                <TextField
                  label="Display Order"
                  required={true}
                  fullWidth
                  type="number"
                  margin="none"
                  name="displayOrder"
                  value={this.state.displayOrder}
                  onChange={this.onChange}
                />

               

                
              </Grid>

            
              
              </Grid>
              <MaterialUIPickers callbackFromParent={dateParam} />
              <input type="hidden" id="startDateMili" /> 
              <input type="hidden" id="endDateMili" /> 

              <Grid container spacing={2} direction="row" justify="flex-end" >

              <Grid item xs={12} sm={6}>
                <FormControl style={styles.multiselect}>
                  <InputLabel  required={true} htmlFor="Pack Type" >
                    Pack 
                  </InputLabel>
                  <Select 
                    name="packType"
                    value={this.state.packType}
                    onChange={this.onChangePack}
                  >
                    <MenuItem value="Data">Data</MenuItem>
                    <MenuItem value="Voice">Voice</MenuItem>
                    <MenuItem value="Combo">Combo</MenuItem>
                    <MenuItem value="IDD">IDD</MenuItem>
                    <MenuItem value="SMS">SMS</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
             
              <Grid item xs={12} sm={6}>
              <TextField
                //label={this.state.showDescription ?  "Description" : "Type"}
                  label="Description"
                  min="1"
                  max="99999"
                  fullWidth
                  name="packTypeitem"
                  value={this.state.packTypeitem}
                  onChange={this.onChange}
                />

              {/* {this.state.showDescription ? 
                <TextField
                //label={this.state.showDescription ?  "Description" : "Type"}
                  label="Description"
                  min="1"
                  max="99999"
                  fullWidth
                  name="packTypeitem"
                  value={this.state.packTypeitem}
                  onChange={this.onChange}
                />
                :
                <FormControl style={styles.multiselect}>
                  <InputLabel htmlFor="Pack Type" >
                    Description
                  </InputLabel>
                  <Select
                    name="packTypeitem"
                    value={this.state.packTypeitem}
                    onChange={this.onChange}
                  >
                  {this.state.packtypevalue ? this.state.packtypevalue.map(name => (
                      <MenuItem key={name} value={name} >
                          {name}
                      </MenuItem>
                  )): ""}
                  </Select>
                </FormControl>
              } */}
              </Grid> 

              </Grid>
             
              <Grid item xs={12} sm={6}>
                <TextField
                //label={this.state.showDescription ?  "Description" : "Type"}
                  label="Description"
                  min="1"
                  max="99999"
                  fullWidth
                  name="dataDay"
                  value={this.state.dataDay}
                  onChange={this.onChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
              <TextField
              //label={this.state.showDescription ?  "Description" : "Type"}
              label="Description"
              style={{
                marginLeft: "18px"
              }}
              // required={true}
              fullWidth
              margin="none"
              name="dataDayType"
              value={this.state.dataDayType}
              onChange={this.onChange}
            />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Description"
                 //label={this.state.showDescription ?  "Description" : "Type"}
                  min="1"
                  max="99999"
                  fullWidth
                  name="nightDay"
                  value={this.state.nightDay}
                  onChange={this.onChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                label="Description"
                style={{
                    marginLeft: "18px"
                  }}
                // required={true}
                fullWidth
                margin="none"
                name="nightDayType"
                value={this.state.nightDayType}
                onChange={this.onChange}
              />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Validity Days"
                  
                  type="number"
                  min="1"
                  max="99999"
                  fullWidth
                  name="validityDays"
                  value={this.state.validityDays}
                  onChange={this.onChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                {/* <TextField
                  label="Validity Type"
                  style={{
                    marginLeft: "18px"
                  }}
                  
                  fullWidth
                  margin="none"
                  name="validityType"
                  value={this.state.validityType}
                  onChange={this.onChange}
                /> */}
                <FormControl style={styles.selectStyle}>
                <InputLabel htmlFor="Validity Type" required={true}>
                     Validity Type
                  </InputLabel>
                  <Select
                    name="validityType"
                    value={this.state.validityType}
                    onChange={this.onChange}
                  >
                    <MenuItem value="Month">Month</MenuItem>
                    <MenuItem value="Days">Days</MenuItem>
                    <MenuItem value="Week">Week</MenuItem>
                    <MenuItem value="Hours">Hours</MenuItem>
                    <MenuItem value="Minutes">Minutes</MenuItem>

                  </Select> 
                  </FormControl>
              </Grid>
             

              <Grid item xs={12} sm={6}>
                <FormControl style={styles.multiselect}>
                  <InputLabel htmlFor="Activation status" required={true}>
                    Status
                  </InputLabel>
                  <Select
                    name="activationStatus"
                    value={this.state.activationStatus}
                    onChange={this.onChange}
                  >
                    <MenuItem value="true">Active</MenuItem>
                    <MenuItem value="false">In Active</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl style={styles.multiselect}>
                  <InputLabel htmlFor="Activation status" required={true}>
                   Activation Type
                  </InputLabel>
                  <Select
                    name="activationType"
                    value={this.state.activationType}
                    onChange={this.onChange}
                  >
                    <MenuItem value="FTR">FTR(First Time Recharge)</MenuItem>
                    <MenuItem value="Normal">Normal</MenuItem>
                    <MenuItem value="Special FTR">Special FTR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid
                container
                spacing={24}
                container
                direction="row"
                justify="flex-end"
              >
                <Grid item xs={12} sm={6}>
                  <FormControl style={styles.multiselect}>
                    <InputLabel htmlFor="display-type" required={true}>
                      Display Type
                    </InputLabel>
                    <Select
                      name="displayType"
                      value={this.state.displayType}
                      onChange={this.onChange}
                    >
                      <MenuItem value="details">Details</MenuItem>
                      <MenuItem value="detailsWithImage">
                        Details with Image
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

               
                <Grid item xs={12} sm={6}>
                {this.state.showFileBrowser ? 
                  <FormControl style={styles.multiselect}>
                    <input
                      style={{
                        marginTop: "31px",
                        marginLeft: "18px"
                      }}
                      type="file"
                      name="file"
                      onChange={this.onChangeFileUpload}
                    />
                  </FormControl>
                   : ""}
                </Grid>
                 
              </Grid>
            
              {this.state.showFileBrowser ? 
              <Grid  container spacing={24} container
                direction="row"
                justify="center">
                  
                  <Grid item xs={12} sm={6}>
                        Selected File Size: {this.state.showFileSize}
                        <br />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <img title="Preview Banner"  style={{width:"200px", height:"100px"}} src={this.state.imageURL} />
                  </Grid>
              </Grid>
            :""  }


                     
<Grid container spacing={2} container
                direction="row"
                justify="center"
                alignItems="center">
                   <br />  <br /> <br />
                   <Button
                variant="contained"
                color="primary"
                disabled={!this.state.imageURL}
                onClick={this.savePack}
              >
                Save
              </Button>

              <Button
                variant="contained"
                color="secondary"
                style={{ marginLeft: "150px" }}
                onClick={this.cancel}
              >
                Cancel
              </Button>
            </Grid>

           
            </form>
          </Paper>
        </Container>
      </React.Fragment>
    );
  }

  savePack = e => {
    
    e.preventDefault();
    if(!this.state.amount || !this.state.displayOrder || !this.state.startDate || !this.state.endDate || !this.state.packType || !this.state.displayType  ){
        Notify.showError("Missing required fields");
        return;
    }
    if(this.state.displayType == "detailsWithImage" && !this.state.file){
      Notify.showError("Details With Image required to upload images");
      return;
    }

    if(!this.state.startDate){
      this.state.startDate = new Date().getTime();
    }

    if(!this.state.endDate){
      this.state.endDate = new Date().getTime();
    }

    // const packs = {
    //   amount: this.state.amount,
    //   displayOrder: this.state.displayOrder,
    //   comment: this.state.comment,
    //   startDate: this.state.startDate,
    //   endDate:this.state.endDate,
    //   pack: this.state.packType,
    //   packType: this.state.packTypeitem,
    //   dataDay: this.state.dataDay,
    //   dataDayType: this.dataDayType,
    //   nightDay: this.state.nightDay,
    //   nightDayType: this.state.nightDayType,
    //   validityDays: this.state.validityDays,
    //   validityType: this.state.validityType,
    //   connectionType: this.state.connectionType,
    //   displayType: this.state.displayType,
    //   imageURL: this.state.imageURL,
    //   description: this.state.description,
    //   activationStatus: this.state.activationStatus,
    //   isFtr: this.state.isFtr,

    // };

    let startDatetime = new Date(this.state.startDate).getTime()
    let endDatetime = new Date(this.state.endDate).getTime()
    if(startDatetime == endDatetime){
      Notify.showError("Start and end date time should not be same");
      return;
    }

    if(this.state.displayType==="detailsWithImage" && !this.state.file){
      Notify.showError("Select the file.");
      return;
    }
    

    const formData = new FormData();

    if(this.state.displayType==="detailsWithImage" && this.state.file){
      formData.append('file',this.state.file);
    }

    new Date(this.state.startDate).getTime()

    formData.append('amount', this.state.amount);
    formData.append('displayOrder', this.state.displayOrder);
    formData.append('startDate',startDatetime);
    formData.append('endDate', endDatetime);
    formData.append('pack', this.state.packType);
    formData.append('packType', this.state.packTypeitem);
    formData.append('dataDay', this.state.dataDay);
    formData.append('dataDayType', this.state.dataDayType);
    formData.append('nightDay', this.state.nightDay);
    formData.append('nightDayType', this.state.nightDayType);
    formData.append('validityDays', this.state.validityDays);
    formData.append('validityType', this.state.validityType);
    formData.append('connectionType', this.state.connectionType);
    formData.append('displayType', this.state.displayType);
    formData.append('description', this.state.description);
    formData.append('activationStatus', this.state.activationStatus);
    formData.append('comment', this.state.comment);
    formData.append('isFtr', this.state.isFtr);
    formData.append('activationType', this.state.activationType);

    if(this.state.selectedZone.length){
      formData.append('zones',this.state.selectedZone.length ? this.state.selectedZone : null);
    }


   // console.log(packs, "PACKS");
    pack.addPack(formData).then(res => {
      resolveResponse(res, "Product saved successfully.");
      this.props.history.push("/packs");
    });
  };

  cancel = e => {
    this.props.history.push("/packs");
  };





  // onChangeFileUpload = e => this.setState({
  //   //  file:e.target.files[0]
  //     [e.target.name]: e.target.files[0]
  // })



  onChangeHandler = event => {
    const formData = new FormData();
    formData.append('file',event.target.files[0]);
    // const config = {
    //     headers: {
    //         'content-type': 'multipart/form-data'
    //     }
    // };

    // pack.uploadPackImage(formData).then(res => {
     
    //  var data =  resolveResponse(res, "Product saved successfully.");

    //   this.setState({
    //        imageURL: data.result,
    //    });

    // });


    //http://125.16.74.160:30611
    // axios.post("/SLRetailer/recharges/uploadRechargeImage",formData,config)
    //     .then((response) => {
    // this.setState({
    //     imageURL: response.data.result,
    // });
    //     }).catch((error) => {
    //         console.log(error,"ERROR")
    // });
   
  };

  onChange = e =>{

    this.setState({ [e.target.name]: e.target.value });

    if(e.target.name == 'displayType' && e.target.value =="detailsWithImage"){      
      this.setState({showFileBrowser: true});
    }

    if(e.target.name == 'displayType' && e.target.value =="details"){      
      this.setState({showFileBrowser: false,  imageURL: 'currentImage'});
    }

    
    if(e.target.value == "Special FTR"){      
      this.setState({isSpecialFtr:  true});
      this.setState({selectedZone: []})
      this.setState({selectAllzone: []});
    }else{
      this.setState({selectAllzone: "Select All"})
      this.setState({isSpecialFtr:  false});
    }

  } 


  onChangePack = e =>  {
    this.setState({ [e.target.name]: e.target.value });
    
    var datatype = ['Anytime MB','Anytime GB', 'Nighttime MB', 'Nighttime GB']; 

    var voicetype = ['Type Rs', 'Minutes', 'Seconds']; 
    var combotype = ['Combo']; 
    var iddsmstype = ['Type Rs', "SMS"]; 

    if( e.target.value == "Data"){
      this.setState({packtypevalue:  datatype, showDescription: false});
    }else{

      this.setState({showDescription: true, packTypeitem : ""});
    }

    // if( e.target.value == "Voice"){
    //   this.setState({packtypevalue:  voicetype});
    // }
   
    // if( e.target.value == "Combo"){
    //   this.setState({packtypevalue:  combotype});
    // }
    // if( e.target.value == "IDD" || e.target.value == "SMS" ){
    //   this.setState({packtypevalue:  iddsmstype});
    // }

  }
}

const styles = {
  formContainer: {
    display: "flex",
    flexFlow: "row wrap"
  },

  textStyle: {
    display: "flex",
    justifyContent: "center"
  },
  input: {
    display: "none"
  },

  textStyle: {
    display: "flex",
    justifyContent: "center"
  },
  multiselect: {
    minWidth: "100%",
    marginBottom: "10px"
  },
  chips: {
    display: "flex",
    flexWrap: "wrap"
  },
  chip: {
    margin: 3
  }, 
  selectStyle:{
    //  minWidth: '100%',
      marginBottom: '0px',
       minWidth: 255,
       maxWidth: 255,
 }
  
};

export default RechargePackAdd;
