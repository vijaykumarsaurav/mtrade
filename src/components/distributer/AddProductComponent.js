import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import ProductService from '../service/ProductService';
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import PostLoginNavBar from "../PostLoginNavbar";
import {Container} from "@material-ui/core";
import {resolveResponse} from "../../utils/ResponseHandler";
import Notify from "../../utils/Notify";

class AddProductComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            onlineBooking: true,
            showRecent: true,
            productName: '',
            displayName: '',
            servingTimeInMins: 10,
            priority: 10,
            iconUrl: '',
            tagUrl: '',
            helpTextImage: '',
            helpText: '',
            selectedIconFile: null,
            selectedHelpTextImage: null
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
                    <Typography variant="h4" style={styles.textStyle}>Add Product</Typography>
                    <form style={styles.formContainer}>
                        <TextField label="Product Name" required={true} fullWidth name="productName" value={this.state.productName} onChange={this.onChange}/>

                        <TextField label="Display Name" required={true} fullWidth name="displayName" value={this.state.displayName} onChange={this.onChange}/>

                        <TextField label="Serving Time In Mins" required={true} type="number" min="1" max="15" fullWidth name="servingTimeInMins" value={this.state.servingTimeInMins} onChange={this.onChangeServingTime}/>

                        <TextField label="Priority" type="number" fullWidth margin="none" min="1" max="15" name="priority" value={this.state.priority} onChange={this.onChangePriority}/>

                        <input accept="image/*" style={styles.input} id="contained-button-file" type="file" onChange={this.onProductIconFileChange} />
                        {/*<label htmlFor="contained-button-file" style={{margin: '15px 20px 0 0', }}>
                            <Button variant="contained" size="large" component="span">
                                Upload Product Icon
                                <CloudUploadIcon />
                            </Button>
                        </label>*/}
                        <TextField label="Icon Image Name" required={true} fullWidth margin="none" name="iconUrl" value={this.state.iconUrl} onChange={this.onChange}/>
                        <FormControlLabel control=
                                              {<Checkbox checked={this.state.onlineBooking} name="onlineBooking" onChange={this.handleChange('onlineBooking')}
                                                         value={this.state.onlineBooking} color="primary"/> } label="Online Booking"/>

                        <FormControlLabel control=
                                              {<Checkbox checked={this.state.showRecent} name="showRecent" onChange={this.handleChange('showRecent')}
                                                         value={this.state.showRecent}/> } label="Show Recent"/>

                        <TextField label="Tag Image Name" fullWidth margin="none" name="tagUrl" value={this.state.tagUrl} onChange={this.onChange}/>

                        <TextField label="Help Text" fullWidth margin="none" name="helpText" value={this.state.helpText} onChange={this.onChange}/>

                       {/* <input accept="image/*" style={styles.input} id="helptext-button-file" type="file" onChange={this.onHelpTextImageChange} />
                        <label htmlFor="helptext-button-file" style={{margin: '15px 20px 0 0', }}>
                            <Button variant="contained" size="large" component="span">
                                Upload Help Text Image
                                <CloudUploadIcon />
                            </Button>
                        </label>*/}
                        <TextField label="Help Text Image Name" fullWidth margin="normal" name="helpTextImage" value={this.state.helpTextImage} onChange={this.onChange}/>

                        <Button variant="contained" color="primary" onClick={this.saveProduct}>Save</Button>

                        <Button variant="contained" color="secondary" style={{marginLeft: '20px'}} onClick={this.cancel}>Cancel</Button>
                    </form>
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
        ProductService.addProduct(product)
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
        this.props.history.push('/products');
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

        ProductService.upload(data).then(res => {
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

        ProductService.upload(data).then(res => {
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
    }

};

export default AddProductComponent;