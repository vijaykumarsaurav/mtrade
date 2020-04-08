import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import productService from '../service/ProductService';
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import PostLoginNavBar from "../PostLoginNavbar";
import {Container} from "@material-ui/core";
import {resolveResponse} from "../../utils/ResponseHandler";
import Notify from "../../utils/Notify";

class EditProductComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
                id: '',
                active: true,
                onlineBooking: false,
                showRecent: false,
                productName: '',
                displayName: '',
                servingTimeInMins: '',
                priority: '',
                iconUrl: '',
                tagUrl: '',
                helpTextImage: '',
                helpText: ''
        }
        this.updateProduct = this.updateProduct.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {
        const selectedProductId = localStorage.getItem("selectedProductId");
        if(selectedProductId == null) {
            alert("Please select a product to edit.");
            this.props.history.push('/products');
        }else {
            productService.getOne(selectedProductId).then(res => {
                let data = resolveResponse(res);
                const selectedProduct = data.result;
                this.setState({id: selectedProduct.id, active: selectedProduct.active,productName: selectedProduct.productName,
                    displayName: selectedProduct.displayName, servingTimeInMins: selectedProduct.servingTimeInMins, priority: selectedProduct.priority,
                    iconUrl: selectedProduct.iconUrl, tagUrl: selectedProduct.tagUrl, helpTextImage: selectedProduct.helpTextImage,
                    helpText: selectedProduct.helpText, onlineBooking: selectedProduct.onlineBooking, showRecent: selectedProduct.showRecent});
            })
        }
    }

    render() {
        return(
            <React.Fragment>
                <PostLoginNavBar/>
                <Container maxWidth="sm">
                    <Typography variant="h4" style={styles.textStyle}>Edit Product</Typography>
                    <form style={styles.formContainer}>
                        <TextField label="Product Name" required={true} fullWidth name="productName" value={this.state.productName} onChange={this.onChange}/>

                        <TextField label="Display Name" required={true} fullWidth name="displayName" value={this.state.displayName} onChange={this.onChange}/>

                        <FormControlLabel control=
                                              {<Checkbox checked={this.state.active} name="active" onChange={this.handleChange('active')}
                                                         value={this.state.active} color="primary"/> } label="Active"/>

                        <TextField label="SERVING TIME in MINS" required={true} min="1" max="15" type="number" fullWidth margin="none" name="servingTimeInMins" value={this.state.servingTimeInMins} onChange={this.onChangeServingTime}/>

                        <TextField label="PRIORITY" type="number" required={true} min="1" max="15" fullWidth margin="none" name="priority" value={this.state.priority} onChange={this.onChangePriority}/>

                        <TextField label="Icon Image Name" required={true} fullWidth margin="none" name="iconUrl" value={this.state.iconUrl} onChange={this.onChange}/>

                        <FormControlLabel control=
                                              {<Checkbox checked={this.state.onlineBooking} name="onlineBooking" onChange={this.handleChange('onlineBooking')}
                                                         value={this.state.onlineBooking} color="primary"/> } label="Online Booking"/>

                        <FormControlLabel control=
                                              {<Checkbox checked={this.state.showRecent} name="showRecent" onChange={this.handleChange('showRecent')}
                                                         value={this.state.showRecent}/> } label="Show Recent"/>

                        <TextField label="TAG Image Name" fullWidth margin="none" name="tagUrl" value={this.state.tagUrl} onChange={this.onChange}/>

                        <TextField label="HELP TEXT" fullWidth margin="none" name="helpText" value={this.state.helpText} onChange={this.onChange}/>

                        <TextField label="Help text Image Name" fullWidth margin="normal" name="helpTextImage" value={this.state.helpTextImage} onChange={this.onChange}/>

                        <Button variant="contained" color="primary" onClick={this.updateProduct}>Save</Button>

                        <Button variant="contained" color="secondary" style={{marginLeft: '20px'}} onClick={this.cancel}>Cancel</Button>
                    </form>
                </Container>
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
        productService.updateProduct(product)
            .then(res => {
                resolveResponse(res, "Product updated successfully.");
                this.props.history.push('/products');
            });
    };

    cancel = (e) => {
        this.props.history.push('/products');
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

    }

};

export default EditProductComponent;