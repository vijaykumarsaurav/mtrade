import React, { useState } from "react";
import AdminService from "../service/AdminService";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Notify from "../../utils/Notify";
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import VisibilityIcon from '@material-ui/icons/Visibility';
import PostLoginNavBar from "../PostLoginNavbar";
import { Container } from "@material-ui/core";
import { resolveResponse } from "../../utils/ResponseHandler";
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import TablePagination from '@material-ui/core/TablePagination';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Title from './Title';
import RefreshIcon from '@material-ui/icons/Autorenew';
import InputLabel from "@material-ui/core/InputLabel";
import { CRO_API_BASE_URL } from "../../utils/config";
import { CSVLink } from "react-csv";
import md5  from 'md5'; 
import  {DEV_PROTJECT_PATH} from "../../utils/config";
import MonthYearCalender from "./MonthYearCalender";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";

import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import $ from 'jquery'; 
import CircularProgress from '@material-ui/core/CircularProgress';


class FSEUpload extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            
                dashboardCount: ''
           
                };
        
        this.dashboardCount = this.dashboardCount.bind(this);
        this.handleChange = this.handleChange.bind(this);

        

    }


   


    onChange = (e) => {

        const re = /^[0-9\b]+$/;
        if (e.target.value === '' || re.test(e.target.value) && e.target.value.length <= 10) {
            this.setState({ [e.target.name] : e.target.value})
        }

    }


    componentDidMount() {
    
        this.dashboardCount();
    
    }


   dashboardCount() {
    this.setState({ dashboardCount :  '' })
    AdminService.getDashboardCount().then(res => {
        var data = resolveResponse(res,'');
            
            if(data.result){
                this.setState({ dashboardCount :  data.result })
              //  Notify.showSuccess("Uploaded Successfully");
            }
    });   
   }

     

    addProduct() {
        this.props.history.push('/add-product');
    }

  

   

    handleChange = name => event => {
        console.log( name );
         if(event.target.checked){
            this.state.selectedIds.push(name); 
         }else{
            this.state.selectedIds.pop(name); 
         }

         console.log( this.state.selectedIds);
    }


    render() {

        return (

            <React.Fragment >
                <PostLoginNavBar />

            <div style={{ padding: "40px" }} >
                <Paper style={{padding:"15px",  position:"sticky", width:"98%"}}>
                <Grid
                        justify="space-between"
                        container
                    >
                        <Grid item >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>

                            Dashboard Count 
                        </Typography> 
                        </Grid>


                        <Grid item >
                            <Button variant="outlined" color="primary" onClick={this.dashboardCount}>  <RefreshIcon />Refresh</Button>
                        </Grid>
                    </Grid>
                   
                </Paper>
                <br /> 
                <Paper style={{padding:"15px",  position:"sticky", width:"98%"}}>

                      
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    QVA Count
                </Typography> 

                <Grid
                container spacing={2}
                direction="row"
                justify="right"
                alignContent="center"
                alignItems="center" spacing="3" style={{ padding: "0px", fontSize: "18px"  }}>




                <Grid item xs={12} sm={3} >
                    <div style={styles.dataentryCount}>
                    <b>{this.state.dashboardCount && this.state.dashboardCount.qvaActivationCount}</b> <br />
                        Activation Count
                    </div>
                </Grid>
                <Grid item xs={12} sm={3} >
                    <div style={styles.dataentryCount}>
                    <b>{this.state.dashboardCount && this.state.dashboardCount.qvaResubmitCount}</b> <br />
                        Resubmit Count
                    </div>
                </Grid>




                </Grid>


                </Paper>

                

                <br /> 
                <Paper style={{padding:"15px",  position:"sticky", width:"98%"}}>
                {/* <Typography component="h2" variant="h6" color="primary" gutterBottom>
                        Dashboard Count
                    </Typography>  */}

                    <Grid
                        justify="space-between"
                        container
                    >
                        <Grid item >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Verification Count 
                        </Typography> 
                        </Grid>


                        {/* <Grid item >
                            <Button variant="outlined" color="primary" onClick={this.dashboardCount}>  <RefreshIcon />Refresh</Button>
                        </Grid> */}
                    </Grid>

                    

                    <Grid
                        container spacing={2}
                        direction="row"
                        justify="right"
                        alignContent="center"
                        alignItems="center" spacing="3" style={{ padding: "0px", fontSize: "18px"  }}>

                        <Grid item xs={12} sm={3} >
                            <div style={styles.verificationCount}>
                                <b>{this.state.dashboardCount && this.state.dashboardCount.avActivationCount}</b> <br />
                                 Activation Count
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={3} >
                            <div style={styles.verificationCount}>
                            <b>{this.state.dashboardCount && this.state.dashboardCount.avResubmitCount}</b> <br />
                                 Resubmit Count
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={3} >
                            <div style={styles.verificationCount}>
                            <b>{this.state.dashboardCount && this.state.dashboardCount.avReregistrationCount}</b> <br />
                                 Re-Registration Count
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={3} >
                            <div style={styles.verificationCount}>
                            <b>{this.state.dashboardCount && this.state.dashboardCount.avDisconnectionCount}</b> <br />
                                 Disconnection Count
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={3} >
                            <div style={styles.verificationCount}>
                            <b>{this.state.dashboardCount && this.state.dashboardCount.avOstCount}</b> <br />
                                 Ownership Count
                            </div>
                        </Grid>
                        
                        </Grid>


                    </Paper>
                    <br />
                    <Paper style={{padding:"15px",  position:"sticky", width:"98%"}}>

                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Data Entry Count
                        </Typography> 
                       
                        <Grid
                        container spacing={2}
                        direction="row"
                        justify="right"
                        alignContent="center"
                        alignItems="center" spacing="3" style={{ padding: "0px", fontSize: "18px"  }}>

                       
                       
                        
                        <Grid item xs={12} sm={3} >
                            <div style={styles.dataentryCount}>
                            <b>{this.state.dashboardCount && this.state.dashboardCount.deActivationCount}</b> <br />
                                Activation Count
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={3} >
                            <div style={styles.dataentryCount}>
                            <b>{this.state.dashboardCount && this.state.dashboardCount.deResubmitCount}</b> <br />
                                Resubmit Count
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={3} >
                            <div style={styles.dataentryCount}>
                            <b>{this.state.dashboardCount && this.state.dashboardCount.deReregistrationCount}</b> <br />
                                Re-Registration Count
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={3} >
                            <div style={styles.dataentryCount}>
                                <b>{this.state.dashboardCount && this.state.dashboardCount.deOstCount}</b> <br />
                                Ownership Count
                            </div>
                        </Grid>
                        

                       
                    </Grid>
                    
                    
                </Paper>

                
               


                  

        </div>

            </React.Fragment>
        )
    }

}

const styles = {
    tableStyle: {
        display: 'flex',
        justifyContent: 'left'
    },
   verificationCount: {  
       background: "#b8fbfd", 
       textAlign: "center", 
       padding:'10px'
    },
    dataentryCount: {  
        background: "#d6fad0", 
        textAlign: "center", 
        padding:'10px'}
}


export default FSEUpload;