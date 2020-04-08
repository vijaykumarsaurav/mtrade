import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import RetailerAdminService from '../service/RetailerAdminService';
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import PostLoginNavBar from "../PostLoginNavbar";
import {Container,Paper} from "@material-ui/core";
import {resolveResponse} from "../../utils/ResponseHandler";
import Notify from "../../utils/Notify";
import MaterialUIPickers from "./MaterialUIPickers";


import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";

import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Input from "@material-ui/core/Input";


class BaneerListAdd extends React.Component {
   
    constructor(props) {
        super(props);
        this.state = {
            "title": "title3",
            "active": '',
            "order": 1,
            "bannerType": "type1",
            "lob": "prepaid",
            "section": "one",
            "categoryType": "Recharhe",
            "category": "bonus",
            "forAndroid": "true",
            "forIos": "true",
            "forWindows": "true",
            "publishDay": 12345678,
            "expireDay": 1234566,
            "updateTime": "1234567",
            "updateBy": "mansi",
            "imageURL": "https://www.earticleblog.com/wp-content/uploads/2014/07/freePromoBanner.jpg",
            "createdOn": null,
            "lastModifiedOn": null
        }
        this.saveProduct = this.saveProduct.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onProductIconFileChange = this.onProductIconFileChange.bind(this);
    }

    render() {
        return(
            <React.Fragment>
                <PostLoginNavBar/>
                <Container maxWidth="sm">
                    <Paper style={{padding:"20px"}}>
                    <Typography variant="h5" style={styles.textStyle}> Banner Details</Typography>
                    <form style={styles.formContainer}>
                    			
                        <TextField label="Title" required={true} fullWidth name="productName" value={this.state.productName} onChange={this.onChange}/>
 
                        <Grid item xs={12} sm={6}>
                            <FormControl style={styles.multiselect}>
                                <InputLabel htmlFor="Active" required={true}>Order</InputLabel>
                                <Select name="storeType" value={this.state.order} onChange={this.onChange}>
                                    <MenuItem value="1">1</MenuItem>
                                    <MenuItem value="2">2</MenuItem>
                                    <MenuItem value="1">3</MenuItem>
                                    <MenuItem value="2">4</MenuItem>
                                    <MenuItem value="2">5</MenuItem>
                                </Select>
                            </FormControl>                        
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl style={styles.multiselect}>
                                <InputLabel htmlFor="Active" required={true}>Status</InputLabel>
                                <Select name="storeType" value={this.state.active} onChange={this.onChange}>
                                    <MenuItem value="true">Active</MenuItem>
                                    <MenuItem value="false">In Active</MenuItem>
                                </Select>
                            </FormControl>                        
                        </Grid>


                        <Grid item xs={12} sm={6}>
                            <FormControl style={styles.multiselect}>
                                <InputLabel htmlFor="Connection Type" required={true}>Type of Baneer</InputLabel>
                                <Select name="storeType" value={this.state.lob} onChange={this.handleChange}>
                                    <MenuItem value="prepaid">Prepaid</MenuItem>
                                    <MenuItem value="postpaid">Postpaid</MenuItem>
                                </Select>
                            </FormControl>                    
                        </Grid>
                      

                         <Grid item xs={12} sm={6}>
                            <FormControl style={styles.multiselect}>
                                <InputLabel htmlFor="Active" required={true}>Section</InputLabel>
                                <Select name="storeType" value={this.state.section} onChange={this.onChange}>
                                    <MenuItem value="one">One</MenuItem>
                                    <MenuItem value="two">Two</MenuItem>
                                </Select>
                            </FormControl>                        
                        </Grid>



                        <FormControl style={styles.multiselect}>
                            <InputLabel htmlFor="Connection Type" required={true}>Category Type</InputLabel>
                            <Select name="storeType" value={this.state.categoryType} onChange={this.onChange}>
                                <MenuItem value="Recharhe">Recharge</MenuItem>
                                <MenuItem value="Other"> Other </MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl style={styles.multiselect}>
                            <InputLabel htmlFor="Connection Type" required={true}>Category</InputLabel>
                            <Select name="storeType" value={this.state.categoryType} onChange={this.onChange}>
                                <MenuItem value="bonus">Bonus</MenuItem>
                                <MenuItem value="Bonus">Other</MenuItem>
                            </Select>
                        </FormControl>

                        


                        {/* <TextField label="Pack Type" required={true} fullWidth name="displayName" value={this.state.displayName} onChange={this.onChange}/> */}


                         <Grid item xs={12} sm={6}>
                            <TextField label="Amount" required={true} type="number" min="1" max="99999" fullWidth name="servingTimeInMins" value={this.state.servingTimeInMins} onChange={this.onChangeServingTime}/>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl style={styles.multiselect}>
                                <InputLabel htmlFor="Connection Type" required={true}>Status</InputLabel>
                                <Select name="storeType" value={this.state.active} onChange={this.onChange}>
                                    <MenuItem value="true">Active</MenuItem>
                                    <MenuItem value="false">In Active</MenuItem>
                                </Select>
                            </FormControl>                        
                        </Grid>

                        {/* <InputLabel htmlFor="Connection Type" required={true}> For Which Devices</InputLabel> */}

                        <FormControlLabel control=
                            {<Checkbox checked={this.state.onlineBooking} name="onlineBooking" onChange={this.handleChange('onlineBooking')}
                                        value={this.state.onlineBooking} /> } label="Android" color="primary"/>

                        <FormControlLabel control=
                            {<Checkbox checked={this.state.showRecent} name="showRecent" onChange={this.handleChange('showRecent')}
                                        value={this.state.showRecent}/> }  label="IOS" />

                        <FormControlLabel control=
                            {<Checkbox checked={this.state.showRecent} name="showRecent" onChange={this.handleChange('showRecent')}
                                        value={this.state.showRecent}/> }  label="Windows1" />



                        <TextField label="Publish Day" type="" multiline rows={2} fullWidth margin="none" min="1" max="999" name="priority" value={this.state.priority} onChange={this.onChangePriority}/>

                        {/* <input accept="image/*" style={styles.input} id="contained-button-file" type="file" onChange={this.onProductIconFileChange} /> */}
                        {/*<label htmlFor="contained-button-file" style={{margin: '15px 20px 0 0', }}>
                            <Button variant="contained" size="large" component="span">
                                Upload Product Icon
                                <CloudUploadIcon />
                            </Button>
                        </label>*/}

                        <Grid item xs={12} sm={6}>
                                 <TextField label="Validity Days" required={true} type="number" min="1" max="999" fullWidth name="servingTimeInMins" value={this.state.servingTimeInMins} onChange={this.onChangeServingTime}/>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                                 <TextField label="Expire Days" required={true} type="number" min="1" max="999" fullWidth name="servingTimeInMins" value={this.state.servingTimeInMins} onChange={this.onChangeServingTime}/>
                        </Grid>

                        


                        <Grid  container spacing={24} container
                        direction="row"
                        justify="flex-end"
                        >

                            <Grid item xs={12} sm={3}>
                            <FormControl style={styles.multiselect}>
                                <InputLabel htmlFor="display-type" required={true}>Upload Banner</InputLabel>
                                
                            </FormControl>

                            </Grid>

                            <Grid item xs={12} sm={9}>
                            <FormControl style={styles.multiselect}>
                                {/* <InputLabel htmlFor="display-type" required={true}>Select Icon</InputLabel> */}
                                <input style={{
                                    marginTop: "24px", 
                                    marginLeft: "18px"}} 
                                    type="file"/>
                            </FormControl>
                            </Grid>
                    </Grid>
                    {/* <TextField label="Comment" fullWidth margin="normal" name="helpTextImage" value={this.state.helpTextImage} onChange={this.onChange}/> */}
                    <Grid  container spacing={24} container
                        direction="row"
                        justify="center"
                        >
                    <Button variant="contained" color="primary" onClick={this.saveProduct}>Save</Button>
                    <Button variant="contained" color="secondary" style={{marginLeft: '150px'}} onClick={this.cancel}>Cancel</Button>
                    </Grid>
                    
                  </form>
                    </Paper>
                </Container>
            </React.Fragment>
        )
    }

    saveProduct = (e) => {
        e.preventDefault();
        if(!this.state.productName || !this.state.displayName || !this.state.servingTimeInMins || !this.state.priority
                || !this.state.iconUrl ){
            Notify.showError("Missing required fields");
            return;
        }
        const product = {onlineBooking: this.state.onlineBooking, showRecent: this.state.showRecent, productName: this.state.productName, displayName: this.state.displayName,
            servingTimeInMins: this.state.servingTimeInMins, priority: this.state.priority,iconUrl: this.state.iconUrl, tagUrl: this.state.tagUrl, helpTextImage: this.state.helpTextImage, helpText: this.state.helpText};
        RetailerAdminService.addProduct(product)
            .then(res => {
                resolveResponse(res,"Product saved successfully.");
                this.props.history.push('/products');
            });
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

    cancel = (e) => {
        this.props.history.push('/banners');
    };

    handleChange = name => event => {
        this.setState({ ...this.state, [name]: event.target.checked });
    };

    onProductIconFileChange = event=>{

        this.setState({
            selectedIconFile: event.target.files[0],
            loaded: 0,
        });
        if(!this.state.selectedIconFile){
            alert("Please select the file again.");
            return;
        }
        const data = new FormData();
        data.append('file', this.state.selectedIconFile);
        data.append('fileType', 'product');

        RetailerAdminService.upload(data).then(res => {
            let data = resolveResponse(res);
            this.setState({iconUrl: data.result.value});

        });
    };

    onHelpTextImageChange = event=>{

        this.setState({
            selectedHelpTextImage: event.target.files[0]
        });
        if(!this.state.selectedHelpTextImage){
            alert("Please select the file again.");
            return;
        }
        const data = new FormData();
        data.append('file', this.state.selectedHelpTextImage);
        data.append('fileType', 'product');

        RetailerAdminService.upload(data).then(res => {
            let data = resolveResponse(res);
            this.setState({helpTextImage: data.result.value});
        });
    }

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

export default BaneerListAdd;