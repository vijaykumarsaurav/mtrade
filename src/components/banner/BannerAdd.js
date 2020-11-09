import React from "react";
import axios from "axios";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import pack from "../service/AdminService";
import PostLoginNavBar from "../PostLoginNavbar";
import { Container, Paper } from "@material-ui/core";
import { resolveResponse } from "../../utils/ResponseHandler";
import ActivationService from "../service/ActivationService";
import Input from "@material-ui/core/Input";


import Notify from "../../utils/Notify";
//import MaterialUIPickers from "./MaterialUIPickers";
import MaterialUIPickers from "../../utils/MaterialUIPickers";


import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import  * as amsConstant from "../../utils/config";
import md5  from 'md5'; 


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



class BannerAdd extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        title: '',
        order: '',
        active: "",
        bannerType:'',
        section:'', 
        categoryType:'', 
        category:'',
        forAndroid:'',
        forIos:'', 
        forWindows:'', 
        validityDays:"",
        updateTime:'',
        publishDate:'',
        expireDate: "",
        updateBy:'', 
        imageURL:'', 
        file: null,
        link:'',
        listofzones:[],
        selectedZone:[],
        zone:'',
        showFileSize: "", 
        selectAllzone:'Select All'
    };
    this.savePack = this.savePack.bind(this);
    this.onChange = this.onChange.bind(this);
    this.myCallback = this.myCallback.bind(this);
    this.zoneChange = this.zoneChange.bind(this);
    this.validateUploadFile = this.validateUploadFile.bind(this);

  }
  myCallback = (date, fromDate) => {
    if (fromDate === "START_DATE") {
      this.setState({ publishDate: new Date(date).getTime() });
    } else if (fromDate === "END_DATE") {
      this.setState({ expireDate: new Date(date).getTime()  });
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
  
  componentDidMount() {
    localStorage.setItem("lastUrl","add-banner");

    if(JSON.parse(localStorage.getItem('cmsStaticData'))){
      this.setState({listofzones:  JSON.parse(localStorage.getItem('cmsStaticData')).zones});
    }

  }

  render() {
    const dateParam = {
      myCallback: this.myCallback,
      startDate: '',
      endDate:'', 
      firstLavel : "Publish Date", 
      secondLavel : "End Date"
    }
    console.log(this.state, "STATE_MATTERS");
    return (
      <React.Fragment>
        <PostLoginNavBar />
        

                <Container maxWidth="sm">
                  <br />
                    <Paper style={{padding:"10px"}}>
                    <Typography variant="h5" style={styles.textStyle}> Banner Details</Typography>
                    <form style={styles.formContainer}>
                    			
                        <TextField label="Banner Title" required={true} value={this.state.title} fullWidth name="title"  onChange={this.onChange}/>
 
                        <Grid item xs={12} sm={6}>
                            <FormControl style={styles.multiselect}>
                                <InputLabel htmlFor="Connection Type" required={true}>Type of Banner</InputLabel>
                                <Select name="bannerType" value={this.state.bannerType} onChange={this.onChange}>
                                    <MenuItem value="prepaid">Prepaid</MenuItem>
                                    <MenuItem value="postpaid">Postpaid</MenuItem>
                                </Select>
                            </FormControl>                    
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl style={styles.multiselect}>
                                <InputLabel  required={true}>Order</InputLabel>
                                <Select name="order" value={this.state.order} onChange={this.onChange}>
                                      <MenuItem value="1">1</MenuItem>
                                      <MenuItem value="2">2</MenuItem>
                                      <MenuItem value="3">3</MenuItem>
                                      <MenuItem value="4">4</MenuItem>

                                      <MenuItem value="5">5</MenuItem>
                                      <MenuItem value="6">6</MenuItem>
                                      <MenuItem value="7">7</MenuItem>
                                      <MenuItem value="8">8</MenuItem>
                                      <MenuItem value="9">9</MenuItem>
                                      <MenuItem value="10">10</MenuItem>
                                      <MenuItem value="11">11</MenuItem>
                                      <MenuItem value="12">12</MenuItem>
                                      <MenuItem value="13">13</MenuItem>
                                      <MenuItem value="14">14</MenuItem>
                                      <MenuItem value="15">15</MenuItem>
                                </Select>
                            </FormControl>                        
                        </Grid>
                      

                         {/* <Grid item xs={12} sm={6}>
                            <FormControl style={styles.multiselect}>
                                <InputLabel htmlFor="Active" required={true}>Section</InputLabel>
                                <Select name="section" value={this.state.section} onChange={this.onChange}>
                                    <MenuItem value="Section1">Section1</MenuItem>
                                    <MenuItem value="Section2">Section2</MenuItem>
                                    <MenuItem value="Section3">Section3</MenuItem>
                                    <MenuItem value="Section4">Section4</MenuItem>

                                </Select>
                            </FormControl>                        
                        </Grid> */}



                        <Grid item xs={12} sm={6}>
                          <FormControl style={styles.multiselect}>
                              <InputLabel htmlFor="Connection Type" required={true}>Category Type</InputLabel>
                              <Select name="categoryType" value={this.state.categoryType} onChange={this.onChange}>
                                  <MenuItem value="Recharge">Recharge</MenuItem>
                                  <MenuItem value="Other"> Other </MenuItem>
                              </Select>
                          </FormControl>                   
                        </Grid>


                        {/* <Grid item xs={12} sm={6}>
                          <FormControl style={styles.multiselect}>
                              <InputLabel htmlFor="" required={true}>Category</InputLabel>
                              <Select name="category" value={this.state.category} onChange={this.onChange}>
                                  <MenuItem value="bonus">Bonus</MenuItem>
                                  <MenuItem value="Bonus">Other</MenuItem>
                              </Select>
                          </FormControl>
                        </Grid> */}
                        
                        <Grid item xs={12} sm={6}>
                            <FormControl style={styles.multiselect}>
                                <InputLabel htmlFor="Active" required={true}>Status</InputLabel>
                                <Select name="active" value={this.state.active} onChange={this.onChange}>
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="in_active">In Active</MenuItem>
                                </Select>
                            </FormControl>                        
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField label="Banner Link" name="link" value={this.state.link} fullWidth  onChange={this.onChange}/>
                        </Grid>

                        <Grid item xs={10} sm={6}> 
                                <FormControl style={styles.selectStyle}>
                                        <InputLabel id="demo-mutiple-name-label">Select Zone</InputLabel>
                                        <Select
                                        labelId="demo-mutiple-name-label"
                                        id="demo-mutiple-name"
                                        multiple
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

                        {/* <Grid item xs={12} sm={12}>
                            <InputLabel htmlFor="" required={true}> Select the Devices</InputLabel> 
                            <FormControlLabel control=
                                {<Checkbox checked={this.state.forAndroid} name="forAndroid" onChange={this.handleChange('forAndroid')}
                                            value={this.state.forAndroid} /> } label="Android" color="primary"/>
                            <FormControlLabel control=
                                {<Checkbox checked={this.state.forIos} name="forIos" onChange={this.handleChange('forIos')}
                                            value={this.state.forIos}/> }  label="IOS" />
                            <FormControlLabel control=
                                {<Checkbox checked={this.state.forWindows} name="forWindows" onChange={this.handleChange('forWindows')}
                                            value={this.state.forWindows}/> }  label="Windows" />

                        </Grid> */}


                        {/* <TextField label="Publish Day" type="number" multiline rows={1} fullWidth margin="none" min="1" max="999" name="priority" value={this.state.priority} onChange={this.onChangePriority}/> */}

                        {/* <input accept="image/*" style={styles.input} id="contained-button-file" type="file" onChange={this.onProductIconFileChange} /> */}
                        {/* <label htmlFor="contained-button-file" style={{margin: '15px 20px 0 0', }}>
                            <Button variant="contained" size="large" component="span">
                                Upload Product Icon
                                <CloudUploadIcon />
                            </Button>
                        </label> */}

                        {/* <Grid item xs={12} sm={6}>
                                 <TextField label="Validity Days" required={true} type="number" min="1" max="999" fullWidth name="validityDays" value={this.state.validityDays} onChange={this.onChange}/>
                        </Grid> */}

                      

{/*                         
                        <Grid item xs={12} sm={6}>
                                 <TextField label="Expire Days" required={true} type="number" min="1" max="999" fullWidth name="servingTimeInMins" value={this.state.servingTimeInMins} onChange={this.onChangeServingTime}/>
                        </Grid> */}

                        
                      <MaterialUIPickers callbackFromParent={dateParam} />
                        <input type="hidden" id="startDateMili" /> 
                        <input type="hidden" id="endDateMili" /> 


                        <Grid  container spacing={1} container direction="row" justify="flex-end">

                            <Grid item xs={12} sm={3}>
                              <FormControl style={styles.multiselect}>
                                  <InputLabel htmlFor="display-type" required={true}>Upload Banner</InputLabel>
                              </FormControl>

                             
                            </Grid>

                            <Grid item xs={12} sm={9}>
                                <FormControl style={styles.multiselect}>
                                  <input
                                    style={{
                                      marginTop: "31px",
                                      marginLeft: "18px"
                                    }}
                                    type="file"
                                    name="file"
                                    id="bannerImage"
                                    // onChange={this.onChangeHandler}
                                    onChange={this.onChangeFileUpload}
                                  />
                                  
                                </FormControl>
                          
                               
                            </Grid>

                          
                    </Grid>
                    

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
                    

                    {/* <TextField label="Comment" fullWidth margin="normal" name="helpTextImage" value={this.state.helpTextImage} onChange={this.onChange}/> */}
                    <Grid  container spacing={24} container
                        direction="row"
                        justify="center">
                          
                      <Button variant="contained" color="primary"   onClick={this.savePack}>Save</Button>
                      <Button variant="contained" color="secondary" style={{marginLeft: '150px'}} onClick={this.cancel}>Cancel</Button>
                    </Grid>
                    
                  </form>
                    </Paper>
                </Container>



      </React.Fragment>
    );
  }

  savePack = e => {

    
    e.preventDefault();
   // if(!this.state.title ||!this.state.bannerType || !this.state.order || !this.state.section || !this.state.categoryType || !this.state.category || !this.state.publishDate || !this.state.expireDate || !this.state.active ){
    if(!this.state.title ||!this.state.bannerType || !this.state.order  || !this.state.active ){
      Notify.showError("Missing required fields");
        return;
    }

    var startDateMili =  document.getElementById("startDateMili").value; 
    var endDateMili = document.getElementById("endDateMili").value; 
    if(startDateMili > endDateMili  ){
      Notify.showError("Start date time can't be grater than end date.");
      return;
    }

   if(endDateMili  < startDateMili){
      Notify.showError("End Date time can't be less than start date.");
      return;
    }
    
   
    if(!this.state.file){
      Notify.showError("Missing required image upload");
      return;
    }

    
    var userDetails = localStorage.getItem("userDetails")
    userDetails = userDetails && JSON.parse(userDetails);


    const formData = new FormData();
    formData.append('file',this.state.file);
    formData.append('title', this.state.title);
    formData.append('order', parseInt(this.state.order));
    formData.append('active', this.state.active === 'active' ? true : false);
    formData.append('bannerType', this.state.bannerType);

    formData.append('link', this.state.link);
    
    if(this.state.selectedZone && this.state.selectedZone.length){
      formData.append('zones', this.state.selectedZone);
    }

    if(!this.state.publishDate){
      this.state.publishDate = new Date().getTime();
    }

    if(!this.state.expireDate){
      this.state.expireDate = new Date().getTime();
    }

    formData.append('publishDate', this.state.publishDate);
    formData.append('expireDate', this.state.expireDate);
    formData.append('categoryType', this.state.categoryType);
    
    pack.addBanner(formData).then(res => {
      var data = resolveResponse(res, "Baneer saved successfully.");
     // Notify.showSuccess("Baneer saved successfully.");
      console.log("Banner Response:", data); 
      this.props.history.push("/banners");

    });
  };

  cancel = e => {
    this.props.history.push("/banners");
  };



  handleChange = name => event => {
    this.setState({ ...this.state, [name]: event.target.checked });
  };


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



  onChangeHandler = event => {
    const formData = new FormData();
    formData.append('file',event.target.files[0]);
    const config = {
        headers: {
            'content-type': 'multipart/form-data'
        }
    };
    axios.post(amsConstant.UPLOAD_IMG_BANNER,formData,config)
        .then((response) => {
    this.setState({
        imageURL: response.data.result,
    });
        }).catch((error) => {
            console.log(error,"ERROR")
    });
   
  };

onChange = e => this.setState({ [e.target.name]: e.target.value });
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

export default BannerAdd;
