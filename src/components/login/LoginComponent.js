import React from 'react';
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import UserService from "../service/UserService";
import LoginNavBar from "../LoginNavbar";
import {Container} from "@material-ui/core";
import { resolveResponse } from '../../utils/ResponseHandler';
import Notify from "../../utils/Notify";
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import ActivationService from "../service/ActivationService";

import CryptoJS  from 'crypto-js'; 

import LoginNewUI from './LoginNewUI';


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

        return(
            <React.Fragment>
                <LoginNavBar/>
                
                {/* <Container maxWidth="sm">
                     <br/><br/><br/> 
                    <Typography variant="h4" style={styles.label}>Login</Typography>
                    <form style={styles.formStyle}>
                        <TextField type="text"  required={true} label="Olms Id" fullWidth margin="normal" name="userName" value={this.state.userName}  onChange={this.onChange}/>

                        <TextField type="password"  required={true} label="Password" fullWidth margin="normal" name="password" value={this.state.password} onChange={this.onChange}/>
                        <Grid item  xs={12} sm={8}>
                            <Button disabled={this.state.isDasable}  variant="contained" color="primary" onClick={this.login}>Login</Button>
                        </Grid>
                        <Grid item  xs={12} sm={10}>
                             {this.state.isDasable ? <InputLabel variant="subtitle1" style={styles.waitMessage}> Please wait...</InputLabel> :""} 
                             {this.state.isError ? <InputLabel variant="subtitle1" style={styles.errorMessage}> {this.state.isError} </InputLabel>: ""}  
                        </Grid>
                    </form>
                </Container> */}

                {/* New Login UI */}
                <LoginNewUI loginProps={ {onChange : this.onChange, login: this.login,   userName: this.state.userName, password:  this.state.password } }/>
                <Grid container justify="space-around">
                    <Grid justify={"center"} container  xs={12} sm={10}>
                            {this.state.isDasable ? <InputLabel variant="subtitle1" style={styles.waitMessage}> Please wait...</InputLabel> :""} 
                            {this.state.isError ? <InputLabel variant="subtitle1" style={styles.errorMessage}> {this.state.isError} </InputLabel>: ""}  
                    </Grid>
                </Grid>
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
        
        this.setState({ isError: "" });


        e.preventDefault();

        if(!this.state.userName && !this.state.password){
            this.setState({ isError: "Olms Id and Password are required." });
            return;
        }

        if(!this.state.userName){
            this.setState({ isError: "Olms Id is required." });
            return;
        }
        if(!this.state.password){
            this.setState({ isError: "Password is required." });
            return;
        }
         
        this.setState({ isDasable: true });

        var keynum = Math.floor(Math.random()*1E16);
        if(keynum.toString().length == 15){
            keynum = keynum.toString() + "9"; 
        }
        var atualkey = (keynum * 69-99).toString(); 
        atualkey =  atualkey.substring(0, 15);

       var encryptedPass = CryptoJS.AES.encrypt( this.state.password, atualkey).toString();
        // console.log( keynum , encryptedPass);

        const loginPayload = {
            userName:  this.state.userName,
            password: encryptedPass+keynum // this.state.password //

        };
        UserService.login(loginPayload)
            .then(res => {
              //  Notify.showError("Olms Id and password is required.");
            //  alert(JSON.stringify(res));

              if(res.data && res.data.message !== 'Success'){
                this.setState({ isError: res.data.message });
              }
                var data = resolveResponse(res);
                console.log("resolveResponse",data.result && data.result.roleCode); 
              
               // data = res.data; 
                this.setState({ isDasable: false });

                if(data.result){
                    window.localStorage.setItem("userDetails",JSON.stringify(data.result));
                    window.localStorage.setItem("token",data.result.token);
                    window.localStorage.setItem("recordToProccedFirstTime",'yes');
                    
                    ActivationService.getStaticData(data.result.roleCode).then(res => {
                        let cmsStaticData = resolveResponse(res);
                        window.localStorage.setItem("cmsStaticData",JSON.stringify(cmsStaticData.result));
                        if(data.result && data.result.roleCode == "BOA"){
                            this.props.history.push('/verify');
                            return;
                        }
                        if(data.result && data.result.roleCode == "DE")
                        this.props.history.push('/dataentry');
        
                        if(data.result && data.result.roleCode == "ADMIN")
                        this.props.history.push('/welcome');
        
                        if(data.result && data.result.roleCode == "QVA")
                        this.props.history.push('/qva');
        
                        if((data.result && data.result.roleCode== "DIST") || (data.result &&  data.result.roleCode== "FSE"))
                        this.props.history.push('/distributor');
                    }); 
                }
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