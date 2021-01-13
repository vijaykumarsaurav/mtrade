import React from 'react';
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import UserService from "../service/UserService";
import LoginNavBar from "../LoginNavbar";
import {Container} from "@material-ui/core";
import Notify from "../../utils/Notify";
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
//import AdminWelcome from '../adminwelcome.png';
import PostLoginNavBar from "../PostLoginNavbar";
import ActivationService from "../service/ActivationService";
import {resolveResponse} from "../../utils/ResponseHandler";

import  {DEV_PROTJECT_PATH, IMAGE_VALIDATION_TOKEN,COOKIE_DOMAIN} from "../../utils/config";

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
        var CookieExpireDate = new Date();
        CookieExpireDate.setDate(CookieExpireDate.getDate() + 1);
        document.cookie = "token=" + IMAGE_VALIDATION_TOKEN + ";expires=" + CookieExpireDate + ";domain="+COOKIE_DOMAIN+";path=/";
        console.log("COOKIE", document.cookie ); 

        return(
            <React.Fragment>
                 <PostLoginNavBar/>
                 <img style={styles.imagestyle} src={DEV_PROTJECT_PATH+"/webdata/adminwelcome.png"} />
            </React.Fragment>
        )

    }

    componentDidMount() {
      const token =   window.localStorage.getItem("token"); 
    //   if(token){
    //     const lastUrl = localStorage.getItem("lastUrl"); 
    //     this.props.history.push('/'+lastUrl);
    //   }
    ActivationService.checkSession().then(res => {
        let data = resolveResponse(res);
    })

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
        
        const loginPayload = {
            userName:  this.state.userName,
            password: this.state.password
        };
        UserService.login(loginPayload)
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
                this.props.history.push('/packs');

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
    },
    imagestyle:{
        width:"100%",
        height: '100vh'
    }

}

export default LoginComponent;