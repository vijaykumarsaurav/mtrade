import React from 'react';
import axios from "axios";
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import PostLoginNavBar from "../PostLoginNavbar";
import {Container,Paper} from "@material-ui/core";
import MaterialUIPickers from "./MaterialUIPickers";
import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import {editPackInfo,getPackById} from "../../action"
import {connect} from "react-redux";
import Notify from "../../utils/Notify";

class BannerEdit extends React.Component {
   
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
            isFtr: "",
            nightDay: "",
            nightDayType: "",
            packType: "",
            productId: "",
            startDate: "",
            validityDays: "",
            validityType: ""
        }
        this.savePack = this.savePack.bind(this);
        this.onChange = this.onChange.bind(this);
        this.myCallback = this.myCallback.bind(this);
    }
     
getInitialData = async ()=>{
    const id = localStorage.getItem('selectedProductId');
    this.setState({loading:true})
   const packRes = await  this.props.getPackById(id);
    console.log(packRes)
    if(packRes.type){
        this.setState(packRes.payload.data.result);
    }
    this.setState({loading:false})
    this.setState({activationStatus:this.state.active})

}
    componentDidMount() {
       this.getInitialData();
    }
     
    
    myCallback = (date,fromDate) => {
        if(fromDate ==="START_DATE"){
            this.setState({startDate:date})
        }else if(fromDate==="END_DATE"){
            this.setState({endDate:date})
        }
       
    }
  render() {
      const dateParam = {
        myCallback: this.myCallback,
        startDate: this.state.startDate,
        endDate:this.state.endDate

      }
      console.log(this.state,"FINAL_STATE")
      if(this.state.loading){
          return <div>Laoding</div>
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
              <TextField
                label="Product Id"
                required={true}
                fullWidth
                margin="none"
                name="productId"
                value={this.state.productId}
                ref={this.input}
                onChange={this.onChange}
              />
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
                  label="Display Order"
                  required={true}
                  fullWidth
                  margin="none"
                  name="displayOrder"
                  value={this.state.displayOrder}
                  onChange={this.onChange}
                />
              </Grid>
              <TextField
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
              />
              <MaterialUIPickers callbackFromParent={dateParam} />
              <FormControl style={styles.multiselect}>
                <InputLabel htmlFor="Pack Type" required={true}>
                  Pack Type
                </InputLabel>
                <Select
                  name="packType"
                  value={this.state.packType}
                  onChange={this.onChange}
                >
                  <MenuItem value="data">Data</MenuItem>
                  <MenuItem value="voice">Voice</MenuItem>
                  <MenuItem value="both">Voice and Data</MenuItem>
                </Select>
              </FormControl>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Data Day"
                  required={true}
                  type="number"
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
              label="Type"
              style={{
                marginLeft: "18px"
              }}
              required={true}
              fullWidth
              margin="none"
              name="dataDayType"
              value={this.state.dataDayType}
              onChange={this.onChange}
            />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Data Night"
                  required={true}
                  type="number"
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
                label="Type"
                style={{
                  marginLeft: "18px"
                }}
                required={true}
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
                  required={true}
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
                <TextField
                  label="Validity Type"
                  style={{
                    marginLeft: "18px"
                  }}
                  required={true}
                  fullWidth
                  margin="none"
                  name="validityType"
                  value={this.state.validityType}
                  onChange={this.onChange}
                />
              </Grid>
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
                  <FormControl style={styles.multiselect}>
                    <input
                      style={{
                        marginTop: "31px",
                        marginLeft: "18px"
                      }}
                      type="file"
                      name="file"
                      onChange={this.onChangeHandler}
                    />
                  </FormControl>
                  
                </Grid>
                <Grid item xs={12} sm={5}>
                <img style={{width:"100px", height:"50px"}} src={this.state.imageURL} />
               </Grid>
              </Grid>
              <TextField
                label="Description"
                fullWidth
                margin="normal"
                name="description"
                value={this.state.description}
                onChange={this.onChange}
              />

                     
<Grid container spacing={2} container
                direction="row"
                justify="center"
                alignItems="center">
                   <br />  <br /> <br />
                       <Button
                        variant="contained"
                        color="primary"
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
        
        if(!this.state.productId ||!this.state.amount || !this.state.displayOrder || !this.state.comment || !this.state.startDate || !this.state.endDate || !this.state.packType || !this.state.dataDay || !this.state.dataDayType ){
          
            Notify.showError("Missing required fields");
            return;
        }
        if(this.state.displayType==="detailsWithImage"){
            if(!this.state.imageURL){
            Notify.showError("Missing required fields");
            return;
            }

        }
       
       this.props.editPackInfo(this.state);
       this.props.history.push('/packs');
     
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
        axios.post("http://125.16.74.160:30611/SLRetailer/recharges/uploadRechargeImage",formData,config)
            .then((response) => {
        this.setState({
            imageURL: response.data.result,
        });
            }).catch((error) => {
                console.log(error,"ERROR")
        });
       
      };
    

 

    onChange = (e) =>
        this.setState({ [e.target.name]: e.target.value });

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
};

const mapStateToProps=(state)=>{
   return {pack:state.packs.pack.data};
}
export default connect(mapStateToProps,{editPackInfo,getPackById})(BannerEdit);