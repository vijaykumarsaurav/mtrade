import React from 'react';
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import AdminService from "../service/AdminService";
import LoginNavBar from "../LoginNavbar";
import {Container} from "@material-ui/core";
import { resolveResponse } from '../../utils/ResponseHandler';
import Notify from "../../utils/Notify";
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';

import CryptoJS  from 'crypto-js'; 

import LoginNewUI from './LoginNewUI';


class LoginComponent extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            userName: "V193588",
            password: "Email*1990A", 
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
      const userTokens =   window.localStorage.getItem("userTokens"); 
      if(userTokens){
      //  const lastUrl = localStorage.getItem("lastUrl"); 
        this.props.history.push('home');
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

 

        const loginPayload = {
            clientcode:  this.state.userName,
            password: this.state.password 

        };
        AdminService.login(loginPayload)
            .then(loginRes => {
              //  Notify.showError("Olms Id and password is required.");
            //  alert(JSON.stringify(res));
         //   console.log("res",loginRes); 

             // var data = resolveResponse(res);
             var loginRes  = loginRes && loginRes.data; 
            //  console.log("resdata",loginRes); 
              if(loginRes.status && loginRes.message !== 'SUCCESS'){
                this.setState({ isError: loginRes.message });
              }
              
               // data = res.data; 
                this.setState({ isDasable: false });

                if(loginRes.data){
                    window.localStorage.setItem("userTokens",JSON.stringify(loginRes.data));
                  

                    AdminService.getUserData().then(profileRes => {
                       // console.log('profiledata', profileRes); 
                          //let data = resolveResponse(res);
                          var profileRes =  profileRes && profileRes.data; 
                          if(profileRes.status & profileRes.message == 'SUCCESS'){
                            window.localStorage.setItem("userProfile",JSON.stringify(profileRes.data));
                            this.props.history.push('/home');
                          }
                      })

                  

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