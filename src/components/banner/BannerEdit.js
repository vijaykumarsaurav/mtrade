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
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import  * as amsConstant from "../../utils/config";
import Input from "@material-ui/core/Input";
import md5  from 'md5'; 

import ActivationService from "../service/ActivationService";


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


class BannerEdit extends React.Component {
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
        updateBy:'', 
        imageURL:'', 
        file: null,
        link:'',
        listofzones:[],
        selectedZone:[],
        zone:'',
        showFileSize: "", 


    };
    this.savePack = this.savePack.bind(this);
    this.onChange = this.onChange.bind(this);
    this.myCallback = this.myCallback.bind(this);
    this.zoneChange = this.zoneChange.bind(this);
    this.validateUploadFile = this.validateUploadFile.bind(this);

  }
  zoneChange = (e) =>{

    if(e.target.value){
      this.setState({[e.target.name]: e.target.value})
    }
  }

  myCallback = (date, fromDate) => {
    if (fromDate === "START_DATE") {
      this.setState({ publishDay: new Date(date).getTime() });
    } else if (fromDate === "END_DATE") {
      this.setState({ expireDay: new Date(date).getTime() });
    }
  };

  

        
  getInitialData = async ()=>{
    const id = localStorage.getItem('selectedBannerId');
    this.setState({loading:true})
    // const packRes = await  this.props.getPackById(id);
    // console.log(packRes)
    // if(packRes.type){
    //     this.setState(packRes.payload.data.result);
    // }
    // this.setState({loading:false})
    // this.setState({activationStatus:this.state.active})

    pack.getOneBanner(id).then(res => {
      resolveResponse(res, "Baneer saved successfully.");
     // this.props.history.push("/banners");

     let data = resolveResponse(res);
     if(data.status == 200 && data.message == "ok"){

         var selectedData = data.result; 
         this.setState({   
         title: selectedData.title,
         order: selectedData.order,
         active: selectedData.active,
         bannerType:selectedData.bannerType,
         section:selectedData.section, 
         categoryType:selectedData.categoryType, 
         category:selectedData.category,
         forAndroid:selectedData.forAndroid,
         forIos:selectedData.forIos, 
         forWindows:selectedData.forWindows, 
         publishDay:selectedData.publishDay,
         expireDay: selectedData.expireDay,
         updateTime:selectedData.updateTime,
         imageURL:selectedData.imageURL, 
         bannerId : selectedData.bannerId, 
         link:selectedData.link, 
         selectedZone :selectedData.zones.split(",")
         });

     }


    });


    ActivationService.getStaticData('ADMIN').then(res => {
      let data = resolveResponse(res);
      this.setState({listofzones: data.result && data.result.zones}) 
  })

  }
    componentDidMount() {
      this.getInitialData();
      localStorage.setItem("lastUrl","banner-edit");

    }
      

  render() {

    const dateParam = {
      myCallback: this.myCallback,
      startDate: this.state.publishDay,
      endDate:this.state.expireDay,
      firstLavel : "Publish Date", 
      secondLavel : "End Date"
    }
    console.log(this.state, "STATE_MATTERS");
    return (
      <React.Fragment>
        <PostLoginNavBar />
        
                <Container maxWidth="sm" style={{padding:"10px"}}>
                  
                    <Paper style={{padding:"10px"}}>
                    <Typography variant="h5" style={styles.textStyle}> Update Banner Details</Typography>
                    <form style={styles.formContainer}>
                    			
                        <TextField label="Banner Title" required={true} value={this.state.title} fullWidth name="title"  onChange={this.onChange}/>
 
                        <Grid item xs={12} sm={6}>
                            <FormControl style={styles.multiselect}>
                                <InputLabel htmlFor="Connection Type" required={true}>Type of Baneer</InputLabel>
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
                                    <MenuItem value="true">Active</MenuItem>
                                    <MenuItem value="false">In Active</MenuItem>
                                </Select>
                            </FormControl>                        
                        </Grid>
                        
                        <Grid item  xs={12} sm={6}>
                            <TextField label="Banner Link" name="link"  value={this.state.link} fullWidth  onChange={this.onChange}/>
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

                        <MaterialUIPickers callbackFromParent={dateParam} />
                        {/* <input type="" id="startDateMili" /> 
                        <input type="" id="endDateMili" />  */}
                        <TextField id="startDateMili" label="" type="hidden" value={dateParam.startDate} />
                        <TextField id="endDateMili" label="" type="hidden" value={dateParam.endDate} />

                       

                        {/*                         
                        <Grid item xs={12} sm={6}>
                                 <TextField label="Expire Days" required={true} type="number" min="1" max="999" fullWidth name="servingTimeInMins" value={this.state.servingTimeInMins} onChange={this.onChangeServingTime}/>
                        </Grid> */}

              <Grid
                container
                spacing={24}
                container
                direction="row"
                justify="flex-end"
              >
                <Grid item xs={12} sm={6}>
                <FormControl style={styles.multiselect}>
                        <InputLabel htmlFor="display-type" required={true}>Upload Banner</InputLabel>
                </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl style={styles.multiselect}>
                      <input
                        style={{
                          marginTop: "31px",
                          marginLeft: "18px"
                        }}
                        type="file"
                        name="file"
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
                              <img title="Preview Banner" style={{width:"200px", height:"100px"}} src={this.state.imageURL} />
                          </Grid>
                      </Grid>

              

             
                    {/* <TextField label="Comment" fullWidth margin="normal" name="helpTextImage" value={this.state.helpTextImage} onChange={this.onChange}/> */}
                    <Grid  container spacing={24} container
                        direction="row"
                        justify="center">
                          
                      <Button variant="contained" color="primary"   onClick={this.savePack}>Update</Button>
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
    // if(!this.state.title ||!this.state.bannerType || !this.state.order || !this.state.section || !this.state.categoryType || !this.state.category || !this.state.validityDays || !this.state.active ){
    //     Notify.showError("Missing required fields");
    //     return;
    // }
   
    // if(!this.state.file){
    //   Notify.showError("Missing required image upload");
    //   return;
    // }

    var userDetails = localStorage.getItem("userDetails")
    userDetails = userDetails && JSON.parse(userDetails);
    

    const formData = new FormData();
    formData.append('file',this.state.file);
    formData.append('title', this.state.title);
    formData.append('order', this.state.order);

    formData.append('active', this.state.active);
    formData.append('bannerType', this.state.bannerType);
    // formData.append('section', this.state.section);
    // formData.append('forAndroid', this.state.forAndroid);
    // formData.append('forIos', this.state.forIos);
   // formData.append('forWindows', this.state.forWindows);
    formData.append('publishDay', this.state.publishDay);
    formData.append('expireDay', this.state.expireDay); 

    formData.append('link', this.state.link);

    if(this.state.selectedZone.length){
      formData.append('zones',this.state.selectedZone);
    }


    //formData.append('validityDays', this.state.validityDays);
    formData.append('updateBy', userDetails && userDetails.loginName);
  
    formData.append('categoryType', this.state.categoryType);
    formData.append('category', this.state.category);

    formData.append('bannerId', this.state.bannerId);
    
    pack.updateBanner(formData).then(res => {
     var data = resolveResponse(res, "Banner saved successfully.");
     if(data.status == 200 && data.message == "Success"){
        Notify.showSuccess("Banner saved successfully.")
     }else{
      Notify.showError(data);

     }
      this.props.history.push("/banners");
    });

  };

  cancel = e => {
    this.props.history.push("/banners");
  };



  handleChange = name => event => {
    this.setState({ ...this.state, [name]: event.target.checked });
  };




  // onChangeFileUpload = e => this.setState({
  //   //  file:e.target.files[0]
  //     [e.target.name]: e.target.files[0],
  //     showFileSize : e.target.files[0].size / 1000 + "KB", 
  //     imageURL: URL.createObjectURL(e.target.files[0])
  // })


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
      minWidth: 270,
      maxWidth: 270,
}
  
};

export default BannerEdit;
