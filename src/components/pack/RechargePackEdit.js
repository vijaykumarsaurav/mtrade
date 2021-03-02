import React from 'react';
import axios from "axios";
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import PostLoginNavBar from "../PostLoginNavbar";
import {Container,Paper} from "@material-ui/core";
//import MaterialUIPickers from "./MaterialUIPickers";
import MaterialUIPickers from "../../utils/MaterialUIPickers";
import pack from "../service/AdminService";
import { resolveResponse } from "../../utils/ResponseHandler";

import  {IMAGE_VALIDATION_TOKEN,COOKIE_DOMAIN} from "../../utils/config";

import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import {editPackInfo,getPackById} from "../../action"
import {connect} from "react-redux";
import Notify from "../../utils/Notify";
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
            activationStatus:"",
            amount: "",
            comment: "",
            connectionType: "",
            dataDay: "",
            dataDayType: "",
            description: "",
            displayOrder: "",
            displayType: "",
            endDate: "",
            imageURL: "",
            ftr: "",
            nightDay: "",
            nightDayType: "",
            pack: "",
            packType:'',
            startDate: "",
            validityDays: "",
            validityType: "",
            packvalue: [],
            showDescription:false,
            listofzones:[],
            selectedZone:[],
            zone:'',
            showFileSize: "", 
            selectAllzone:'Select All',
            showFileBrowser:false,
            isSpecialFtr: false,
            activationType:""
            
            
        }
        this.savePack = this.savePack.bind(this);
        this.onChange = this.onChange.bind(this);
        this.myCallback = this.myCallback.bind(this);
        this.onChangePack = this.onChangePack.bind(this);
        this.addPackTpe = this.addPackTpe.bind(this);
        this.zoneChange = this.zoneChange.bind(this);

        

    }
    
    

  // onChangeFileUpload = e => this.setState({
  //   //  file:e.target.files[0]
  //     [e.target.name]: e.target.files[0]
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
    
    getInitialData = async ()=>{
        const id = localStorage.getItem('selectedProductId');
        this.setState({loading:true})
        const packRes = await  this.props.getPackById(id);
       
        if(packRes.payload && packRes.payload.data && packRes.payload.data.result){
            this.setState(packRes.payload.data.result);
        }
        this.setState({selectedZone: this.state.zones});
        this.setState({loading:false})
        this.setState({activationStatus:this.state.active})

        if(this.state.displayType =='detailsWithImage' ){
          this.setState({showFileBrowser:true ,imageURL :  this.state.imageURL})
         
        }
       
        if(this.state.displayType == "details"){
          this.setState({imageURL:'imageURL'})
        }

        this.addPackTpe(this.state.pack); 
    }

    componentDidMount() {
       this.getInitialData();
       localStorage.setItem("lastUrl","editpacks");

      if(JSON.parse(localStorage.getItem('cmsStaticData'))){
        this.setState({listofzones:  JSON.parse(localStorage.getItem('cmsStaticData')).zones});
      }

    }
     
    
    myCallback = (date,fromDate) => {
        if(fromDate ==="START_DATE"){
            this.setState({startDate:new Date(date).getTime()})
        }else if(fromDate==="END_DATE"){
            this.setState({endDate:new Date(date).getTime()})
        }
       
    }
  render() {

    var CookieExpireDate = new Date();
    CookieExpireDate.setDate(CookieExpireDate.getDate() + 1);
    document.cookie = "token=" + IMAGE_VALIDATION_TOKEN + ";expires=" + CookieExpireDate + ";domain="+COOKIE_DOMAIN+";path=/";
    console.log("COOKIE", document.cookie ); 

   
    console.log("STAte", this.state);


      const dateParam = {
        myCallback: this.myCallback,
        startDate: this.state.startDate,
        endDate: this.state.endDate,
        firstLavel : "Start Date", 
        secondLavel : "End Date"
      }
      console.log("dateparam",dateParam);
      if(this.state.loading){
          return <div>Loading</div>
      }
       return(
        
        <React.Fragment>
        <PostLoginNavBar />
        <Container maxWidth="sm">
          <Paper style={{ padding: "20px" }}>
            <Typography variant="h5" style={styles.textStyle}>
              Edit Recharge Pack
            </Typography>
            <form style={styles.formContainer}>
              {/* <TextField
                label="Product Id"
                required={true}
                fullWidth
                margin="none"
                name="productId"
                value={this.state.productId}
                ref={this.input}
                onChange={this.onChange}
              /> */}

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
                onChange={this.onChange}
              />


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
                  disabled={this.state.activationType === 'Special FTR' ? true : false}
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
                  margin="none"
                  name="displayOrder"
                  value={this.state.displayOrder}
                  onChange={this.onChange}
                />

                  
            </Grid>


            </Grid>
              
              
              <MaterialUIPickers callbackFromParent={dateParam} />
              <input type="hidden" id="startDateMili" value={dateParam.startDate}/> 
              <input type="hidden" id="endDateMili" value={dateParam.endDate} /> 
              <Grid item xs={12} sm={6}>
                <FormControl style={styles.multiselect}>
                  <InputLabel  required={true} htmlFor="Pack Type" >
                    Pack 
                  </InputLabel>
                  <Select
                    name="pack"
                    value={this.state.pack}
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
                  label="Description"
                  min="1"
                  max="99999"
                  fullWidth
                  name="packType"
                  value={this.state.packType}
                  onChange={this.onChange}
                />
                {/* <FormControl style={styles.multiselect}>
                  <InputLabel htmlFor="Pack Type" >
                    Pack Type
                  </InputLabel>
                  <Select
                    name="packType"
                    value={this.state.packType}
                    onChange={this.onChange}
                  >

                  {this.state.packvalue ? this.state.packvalue.map(name => (
                      <MenuItem key={name} value={name} >
                          {name}
                      </MenuItem>
                  )): ""}
                    
                  </Select>
                </FormControl> */}
                {/* {this.state.showDescription ? 
                <TextField
                  label="Description"
                  min="1"
                  max="99999"
                  fullWidth
                  name="packType"
                  value={this.state.packType}
                  onChange={this.onChange}
                />
                :
                <FormControl style={styles.multiselect}>
                  <InputLabel htmlFor="Pack Type" >
                  Description
                  </InputLabel>
                  <Select
                    name="packType"
                    value={this.state.packType}
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
              <Grid item xs={12} sm={6}>
                <TextField
                  //label={this.state.showDescription ?  "Description" : "Data Day"}
                  // required={true}
                  // type="number"
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
             // label={this.state.showDescription ?  "Description" : "Type"}
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
                //  label={this.state.showDescription ?  "Description" : "Data Night"}
                label="Description" 
                // required={true}
                  // type="number"
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
              //  label={this.state.showDescription ?  "Description" : "Type"}
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
                
                
                <FormControl style={styles.multiselect}>
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

              {/* <Grid item xs={12} sm={6}>
                <FormControl style={styles.multiselect}>
                  <InputLabel htmlFor="Activation status" required={true}>
                    FTR or Normal
                  </InputLabel>
                  <Select
                    name="ftr"
                    value={this.state.ftr}
                    onChange={this.onChange}
                  >
                    <MenuItem value="true">FTR(First Time Recharge)</MenuItem>
                    <MenuItem value="false">Normal</MenuItem>
                  </Select>
                </FormControl>
              </Grid> */}

              <Grid item xs={12} sm={6}>
                <FormControl style={styles.multiselect}>
                  <InputLabel htmlFor="Activation status" required={true}>
                   Activation Type
                  </InputLabel>
                  <Select
                    name="activationType"
                    value={this.state.activationType}
                    onChange={this.onChange}
                    disabled={this.state.activationType === 'Special FTR' ? true : false}
                  >

                    <MenuItem value="FTR">FTR(First Time Recharge)</MenuItem>
                    <MenuItem value="Normal">Normal</MenuItem>
                    {/* <MenuItem value="Special FTR">Special FTR</MenuItem> */}
                    {this.state.activationType === 'Special FTR' ? <MenuItem value="Special FTR">Special FTR</MenuItem> : []}

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
                    <InputLabel htmlFor="display-type" required={true} >
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
                  :""}
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
              :""}

              {/* <TextField
                label="comment"
                type=""
                multiline
                rows={2}
                fullWidth
                margin="none"
                min="1"
                max="15"
                name="comment"
                value={this.state.comment}
                onChange={this.onChange}
              /> */}
             

                     
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
     )
    }

    savePack = (e) => {
        e.preventDefault();
        
      
      //   if(this.state.displayType==="detailsWithImage"){
      //       if(!this.state.imageURL){
      //       Notify.showError("Missing required fields");
      //       return;
      //       }

      //   }
       
      //  this.props.editPackInfo(this.state);
      //  this.props.history.push('/packs');


      if(!this.state.amount || !this.state.displayOrder || !this.state.startDate || !this.state.endDate || !this.state.pack || !this.state.displayType || !this.state.connectionType ){
        Notify.showError("Missing required fields");
        return;
      }
      // if(this.state.displayType == "detailsWithImage" && !this.state.file){
      //   Notify.showError("Details With Image required to upload images");
      //   return;
      // }

   
      if(!this.state.startDate){
        this.state.startDate = new Date().getTime();
      }

      if(!this.state.endDate){
        this.state.endDate = new Date().getTime();
      }

      let startDatetime = new Date(this.state.startDate).getTime()
      let endDatetime = new Date(this.state.endDate).getTime()
      if(startDatetime == endDatetime){
        Notify.showError("Start and end date time should not be same");
        return;
      }

      // if(this.state.displayType==="detailsWithImage"){
      //   Notify.showError("Select the file.");
      //   return;
      // }

      const formData = new FormData();

      if(this.state.displayType==="detailsWithImage" && this.state.file){
        formData.append('file',this.state.file);
      }

      const id = localStorage.getItem('selectedProductId');

      formData.append('ProductId', id);

      
      formData.append('amount', this.state.amount);
      formData.append('displayOrder', this.state.displayOrder);
      formData.append('startDate',startDatetime);
      formData.append('endDate', endDatetime);
      formData.append('pack', this.state.pack);
      formData.append('packType', this.state.packType);
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
      formData.append('isFtr', this.state.ftr);
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

   cancel = (e) => {
        this.props.history.push('/packs');
    };

   
    onChangeHandler = event => {
        const formData = new FormData();
        formData.append('file',event.target.files[0]);
        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        };
        //http://125.16.74.160:30611/
        axios.post("/SLRetailer/recharges/uploadRechargeImage",formData,config)
            .then((response) => {
        this.setState({
            imageURL: response.data.result,
        });
            }).catch((error) => {
                console.log(error,"ERROR")
        });
       
      };
      
      addPackTpe = value => {
        
       // var datatype = ['Anytime (Type MB, GB)', 'Nighttime (Type MB, GB)']; 
        var voicetype = ['Type Rs', 'Minutes', 'Seconds']; 
        var combotype = ['Combo']; 
        var iddsmstype = ['Type Rs', "SMS"]; 

        var datatype = ['Anytime MB','Anytime GB', 'Nighttime MB', 'Nighttime GB']; 
        
        if(value == "Data"){
          this.setState({packtypevalue:  datatype, showDescription: false});
        }else{
          this.setState({showDescription: true});
        }

      }
    
      onChangePack = e =>  {
        this.setState({ [e.target.name]: e.target.value });
        this.addPackTpe(e.target.value); 
    
      }


      onChange = e =>{

        console.log(e.target.name, e.target.value); 

        this.setState({ [e.target.name]: e.target.value });
    
        if(e.target.name == 'displayType' && e.target.value =="detailsWithImage"){      
          this.setState({showFileBrowser: true});
        }
    
        if(e.target.name == 'displayType' && e.target.value =="details"){      
          this.setState({showFileBrowser: false,  imageURL: 'currentImage'});

        }

        if(e.target.name === 'activationType' ){
          if(e.target.value == "Special FTR"){      
            this.setState({isSpecialFtr:  true});
            this.setState({selectedZone: []})
            this.setState({selectAllzone: []});
          }else{
            this.setState({selectAllzone: "Select All"})
            this.setState({isSpecialFtr:  false});
          }
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
    input: {
        display: 'none'
    },

    textStyle :{
        display: 'flex',
        justifyContent: 'center'
    },
    multiselect: {
        minWidth: '100%',
        marginBottom: '10px'
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    chip: {
        margin: 3,
    }
    , 
    selectStyle:{
      //  minWidth: '100%',
        marginBottom: '0px',
        minWidth: 255,
        maxWidth: 255,
  }
};

const mapStateToProps=(state)=>{
   return {pack:state.packs.pack.data};
}
export default connect(mapStateToProps,{editPackInfo,getPackById})(RechargePackAdd);