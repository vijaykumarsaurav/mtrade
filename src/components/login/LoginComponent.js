import React from 'react';
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import storeService from "../service/StoreService";
import LoginNavBar from "../LoginNavbar";
import {Container} from "@material-ui/core";
import { resolveResponse } from '../../utils/ResponseHandler';
import Notify from "../../utils/Notify";
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';

import base64 from 'react-native-base64'; 
import CryptoJS  from 'crypto-js'; 
var aes256 = require('aes256');


class LoginComponent extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            userName: "",
            password: "", 
            isDasable:false,
            isError:false,
            
        };
        this.login = this.login.bind(this);
    }


    render() {
        var password = "U*0elFh:"; 

        return(
            <React.Fragment>
                <LoginNavBar/><br/><br/><br/>
                <Container maxWidth="sm">
                    <Typography variant="h4" style={styles.label}>Login</Typography>
                    <form style={styles.formStyle}>
                    {/* value={this.state.olmsId} */}
                        <TextField type="text"  required={true} label="Olms Id" fullWidth margin="normal" name="userName" value={this.state.userName}  onChange={this.onChange}/>

                        <TextField type="password"  required={true} label="Password" fullWidth margin="normal" name="password" value={this.state.password} onChange={this.onChange}/>
                        

                        <Grid item  xs={12} sm={2}>
                            <Button disabled={this.state.isDasable}  variant="contained" color="primary" onClick={this.login}>Login</Button>
                        </Grid>


                        <Grid item  xs={12} sm={10}>
                             {this.state.isDasable ? <InputLabel variant="subtitle1" style={styles.waitMessage}> Please wait...</InputLabel> :""} 
                             {this.state.isError ? <InputLabel variant="subtitle1" style={styles.errorMessage}> {this.state.isError} </InputLabel>: ""}  
                        </Grid>

                    </form>

                    
                </Container>
            </React.Fragment>
        )

    }

    componentDidMount() {
      const token =   window.localStorage.getItem("token"); 

      if(token){
        const lastUrl = localStorage.getItem("lastUrl"); 
        this.props.history.push('/'+lastUrl);
      }
        
    }

    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value.trim() });
    }

    login = (e) => {
        e.preventDefault();
        if(!this.state.userName || !this.state.password){
            this.setState({ isError: "Olms Id and password is required." });

            // setTimeout(() => {
            //     this.setState({ isError: "" });
            // }, 3000);

          //  Notify.showError("Olms Id and password is required.");
            return;
        }
         
        this.setState({ isDasable: true });

        var keynum = Math.floor(Math.random()*1E16);
        var atualkey = (keynum * 69-99).toString(); 
        atualkey =  atualkey.substring(0, 15);

       var encryptedPass = CryptoJS.AES.encrypt( this.state.password, atualkey).toString();
        // console.log( keynum , encryptedPass);

        const loginPayload = {
            userName:  this.state.userName,
            password: encryptedPass+keynum // this.state.password //

        };
        storeService.login(loginPayload)
            .then(res => {
              //  Notify.showError("Olms Id and password is required.");
            //  alert(JSON.stringify(res));

              
              this.setState({ isError: res.data.message });

              //  let data = resolveResponse(res);
                console.log("resolveResponse",data); 
                // if(!data.result)
                //     Notify.showError("Something Went worng...");

                var data = res.data; 
                this.setState({ isDasable: false });

                // else
                //     resolveResponse(res, "Login success.");

                if(data.result){
                    window.localStorage.setItem("userDetails",JSON.stringify(data.result));
                    window.localStorage.setItem("token",data.result.token)
                }
               
                // BO agent : BOA
                // Data Entry : DE
                // Admin : ADMIN
                // Distributor : DIST

                if(data.result && data.result.roleCode == "BOA")
                this.props.history.push('/verify');

                if(data.result && data.result.roleCode == "DE")
                this.props.history.push('/dataentry');

                if(data.result && data.result.roleCode == "ADMIN")
                this.props.history.push('/welcome');

                if((data.result && data.result.roleCode== "DIST") || (data.result &&  data.result.roleCode== "FSE"))
                this.props.history.push('/distributor');
                
            });
          
            // setTimeout(() => {
            //     this.setState({ isError: "" });
            // }, 3000);


           
    }

}

const styles ={
    formStyle :{
        display: 'flex',
        flexFlow: 'row wrap'
    },
    label: {
        display: 'flex',
        justifyContent: 'center'
    },
    errorMessage:{
        color:"red",
        marginTop: '11px'
    },
    waitMessage:{
        color:"gray",
        marginTop: '11px'

    }

}

export default LoginComponent;