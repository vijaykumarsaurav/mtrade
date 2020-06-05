import React, { useState } from "react";
import AdminService from "../service/AdminService";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Notify from "../../utils/Notify";

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import PostLoginNavBar from "../PostLoginNavbar";
import { Container } from "@material-ui/core";
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Title from './Title';
import InputLabel from "@material-ui/core/InputLabel";

import ActivationService from "../service/ActivationService";
import {resolveResponse} from "../../utils/ResponseHandler";
import SimpleExpansionPanel from './SimpleExpansionPanel';

class CurrentMSISDNStatus extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            products: [],
            retailerOnboardExcelTemplatePath: "",
            retailerDeleteExcelTemplatePath: "",
            deletefile:'', 
            searchby:'',
            msisdnDetails: '',
            uploadResponse: '', // [{laId: "b0208057", reason : "Given Laid already created"},{laId: "b0208058", reason : "Given Laid already created"}],
            deleteResponse:""


        };
       
        this.searchRetailer = this.searchRetailer.bind(this);
    }

  



    onChange = (e) => {
       // this.setState({searchby: e.target.value})
        const re = /^[0-9\b]+$/;
        if (e.target.value === '' || re.test(e.target.value) && e.target.value.length <= 10) {
            this.setState({searchby: e.target.value})
        }

    }



    componentDidMount() {
       // this.getAdmminStaticData();
    //    ActivationService.getStaticData('ADMIN').then(res => {
    //     let data = resolveResponse(res);
    //     this.setState({listofzones: data.result && data.result.zones}) 
    // })
    }

   
    searchRetailer(){
       
            if(!this.state.searchby){
                Notify.showError("Type MSISDN");
                return;
            }
    
            var userDetails = localStorage.getItem("userDetails")
            userDetails = userDetails && JSON.parse(userDetails);
    
            AdminService.searchMSISDN(this.state.searchby).then(res => {
                var data =resolveResponse(res, "");

                    if(data.status===401){
                        localStorage.clear();
                        this.props.history.push("/login");
                        return;
                    }

                    if(data.result && data.result.data){
                        this.setState({ msisdnDetails :  data.result.data })
                    }else{
                       // Notify.showError("No Such MSISDN found"); 
                        this.setState({ msisdnDetails :  [] })
                    }

                });
        
              
 
    }

   






    render() {

        return (

            <React.Fragment >
                <PostLoginNavBar />


                



            <div style={{ padding: "20px" }} >


                  
                <Paper style={{padding:"15px", position:"fixed", width:"97%"}} >
                
                    <Grid syt  container spacing={24} container
                    direction="row"
                    justify="right"
                    alignItems="center">
                        <Grid item xs={12} sm={8} >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                          {/* Current Status of MSISDN Search   */}
                          MSISDN Record History  - Search
                        </Typography> 
                        </Grid>

                        <Grid item xs={12} sm={2} item > 
                                <TextField type="text" value={this.state.searchby } label=" Search MSISDN " style={{ width: "100%" }} name="searchby" onChange={this.onChange} />
                        </Grid>
                        <Grid item xs={12} sm={2} item style={{textAlign:"left"}} > 
                            <Button startIcon={<SearchIcon/>} variant="contained" color="" style={{ marginLeft: '20px' }} onClick={this.searchRetailer} >Search</Button>
                        </Grid>
                    </Grid>

                 </Paper>
                        

                {/* <Paper style={{padding:"20px", marginTop: '100px'}} > */}
                <Table style={{marginTop: '100px'}}  aria-label="sticky table">
                        <TableHead >
                            <TableRow style={{width:"170px",whiteSpace: "nowrap"}}>
                                <TableCell align="">Zone </TableCell>
                                <TableCell align="">MSISDN</TableCell>
                                <TableCell align="">NIC No.</TableCell>
                                <TableCell align="">Sim No.</TableCell>
                                <TableCell align="">FTA Date</TableCell>
                                <TableCell align="">Submit Date</TableCell>
                                <TableCell align="">Resubmit Date</TableCell>
                               
                                <TableCell align="">Verification Date</TableCell>
                                <TableCell align="">Data Entered Date</TableCell>
                                <TableCell align="">Omni Transfer Date</TableCell>
                                <TableCell align="">Verify By</TableCell>
                                <TableCell align="">Verifiy Comment</TableCell>
                                <TableCell align="">Verification Status</TableCell>
                                <TableCell align="">Data Entered By</TableCell>
                                <TableCell align="">Distributor Name</TableCell>
                                <TableCell align="">Distributor Number</TableCell>
                                <TableCell align="">Retailer Number</TableCell>
                                <TableCell align="">Omni Status</TableCell>
                                <TableCell align="">Image Count </TableCell>
                                <TableCell align="">Ref Number </TableCell>
                                
                            </TableRow>
                        </TableHead>

                        <TableBody style={{width:"",whiteSpace: "nowrap"}}>
                            {this.state.msisdnDetails ? this.state.msisdnDetails.map(row => (
                                <TableRow hover   key={row.txnId} >
                                    <TableCell align="center">{row.zone}</TableCell> 
                                    <TableCell align="center" >{row.msisdnNumber}</TableCell>
                                    <TableCell align="center">{row.nicNumber}</TableCell>
                                    <TableCell align="center">{row.simNumber}</TableCell>
                                    <TableCell align="center">{row.ftaDate}</TableCell>
                                    <TableCell align="center">{row.submitDate}</TableCell>
                                    <TableCell align="center">{row.resubmitDate}</TableCell>
                                    <TableCell align="center">{row.verificationDate}</TableCell>
                                    <TableCell align="center">{row.dataEnteredDate}</TableCell>

                                    <TableCell align="center">{row.omniTransferDate}</TableCell>
                                    <TableCell align="center">{row.verifyBy}</TableCell>
                                    <TableCell align="center">{row.verifiyComment}</TableCell>
                                    <TableCell align="center">{row.verificationStatus}</TableCell>
                                    <TableCell align="center">{row.dataEnteredBy}</TableCell>
                                    <TableCell align="center">{row.distributorName}</TableCell>
                                    <TableCell align="center">{row.distributorNumber}</TableCell>
                                    <TableCell align="center">{row.retailerNumber}</TableCell>
                                    <TableCell align="center">{row.omniStatus}</TableCell>
                                    <TableCell align="center">{row.imageCount}</TableCell>
                                    <TableCell align="center">{row.refNumber}</TableCell>

                                </TableRow>
                            )):  ""}
                        </TableBody>
                    </Table>

                          {/* </Paper>  */}
                          
                          
                           {/* {this.state.msisdnDetails ? this.state.msisdnDetails.map(row => (
                               <>  <br />
                              <Paper style={{padding:"20px"}} >
                                <Grid syt  container spacing={2} container
                                    direction="row"
                                    justify="right"
                                    alignItems="center">
                                        <Grid item xs={12} sm={3} >
                                            <Typography variant="body2"  color ="primary">                                       
                                                <ListItemText primary={"Zone"} />
                                            </Typography> 
                                            <ListItemText primary={row.zone} />  
                                        </Grid>
                         
                                        <Grid item xs={12} sm={3} >
                                            <Typography variant="body2"  color ="primary">                                       
                                                <ListItemText primary={"MSISDN"} />
                                            </Typography> 
                                            <ListItemText primary={row.msisdnNumber} />  
                                        </Grid>


                                        <Grid item xs={12} sm={3} >
                                            <Typography variant="body2"  color ="primary">                                       
                                                <ListItemText primary={"NIC Number"} />
                                            </Typography> 
                                            <ListItemText primary={row.nicNumber} />  
                                        </Grid>
                                    
                                        <Grid item xs={12} sm={3} >
                                            <Typography variant="body2"  color ="primary">                                       
                                                <ListItemText primary={"Sim Number"} />
                                            </Typography> 
                                            <ListItemText primary={row.simNumber} />  
                                        </Grid>
                                        

                                        <Grid item xs={12} sm={3} >
                                            <Typography variant="body2"  color ="primary">                                       
                                                <ListItemText primary={"FTA Date"} />
                                            </Typography> 
                                            <ListItemText primary={row.ftaDate} />  
                                        </Grid>

                                        <Grid item xs={12} sm={3} >
                                            <Typography variant="body2"  color ="primary">                                       
                                                <ListItemText primary={"Submit Date"} />
                                            </Typography> 
                                            <ListItemText primary={row.submitDate} />  
                                        </Grid>


                                       

                                        <Grid item xs={12} sm={3} >
                                            <Typography variant="body2"  color ="primary">                                       
                                                <ListItemText primary={"Verification Date"} />
                                            </Typography> 
                                            <ListItemText primary={row.verificationDate} />  
                                        </Grid>


                                        <Grid item xs={12} sm={3} >
                                            <Typography variant="body2"  color ="primary">                                       
                                                <ListItemText primary={"Data Entered Date"} />
                                            </Typography> 
                                            <ListItemText primary={row.dataEnteredDate} />  
                                        </Grid>

                                        <Grid item xs={12} sm={3} >
                                            <Typography variant="body2"  color ="primary">                                       
                                                <ListItemText primary={"Resubmit Date"} />
                                            </Typography> 
                                            <ListItemText primary={row.resubmitDate} />  
                                        </Grid>

                                      

                                        <Grid item xs={12} sm={3} >
                                            <Typography variant="body2"  color ="primary">                                       
                                                <ListItemText primary={"Omni Transfer Date"} />
                                            </Typography> 
                                            <ListItemText primary={row.omniTransferDate} />  
                                        </Grid>

                                        <Grid item xs={12} sm={3} >
                                            <Typography variant="body2"  color ="primary">                                       
                                                <ListItemText primary={"Verify By"} />
                                            </Typography> 
                                            <ListItemText primary={row.verifyBy} />  
                                        </Grid>

                                        <Grid item xs={12} sm={3} >
                                            <Typography variant="body2"  color ="primary">                                       
                                                <ListItemText primary={"Verifiy Comment"} />
                                            </Typography> 
                                            <ListItemText primary={row.verifiyComment} />  
                                        </Grid>

                                        <Grid item xs={12} sm={3} >
                                            <Typography variant="body2"  color ="primary">                                       
                                                <ListItemText primary={"Verification Status"} />
                                            </Typography> 
                                            <ListItemText primary={row.verificationStatus } />  
                                        </Grid>

                                        <Grid item xs={12} sm={3} >
                                            <Typography variant="body2"  color ="primary">                                       
                                                <ListItemText primary={"Data Entered By"} />
                                            </Typography> 
                                            <ListItemText primary={row.dataEnteredBy } />  
                                        </Grid>
                                        

                                        <Grid item xs={12} sm={3} >
                                            <Typography variant="body2"  color ="primary">                                       
                                                <ListItemText primary={"Distributor Name"} />
                                            </Typography> 
                                            <ListItemText primary={row.distributorName } />  
                                        </Grid>


                                        <Grid item xs={12} sm={3} >
                                            <Typography variant="body2"  color ="primary">                                       
                                                <ListItemText primary={"Distributor Number"} />
                                            </Typography> 
                                            <ListItemText primary={row.distributorNumber } />  
                                        </Grid>


                                        <Grid item xs={12} sm={3} >
                                            <Typography variant="body2"  color ="primary">                                       
                                                <ListItemText primary={"Retailer Number"} />
                                            </Typography> 
                                            <ListItemText primary={row.retailerNumber } />  
                                        </Grid>

                                        <Grid item xs={12} sm={3} >
                                            <Typography variant="body2"  color ="primary">                                       
                                                <ListItemText primary={"Omni Status"} />
                                            </Typography> 
                                            <ListItemText primary={row.omniStatus } />  
                                        </Grid>
                                        <Grid item xs={12} sm={3} >
                                            <Typography variant="body2"  color ="primary">                                       
                                                <ListItemText primary={"Image Count"} />
                                            </Typography> 
                                            <ListItemText primary={row.imageCount } />  
                                        </Grid>
                                        <Grid item xs={12} sm={3} >
                                            <Typography variant="body2"  color ="primary">                                       
                                                <ListItemText primary={"Ref Number"} />
                                            </Typography> 
                                            <ListItemText primary={row.refNumber } />  
                                        </Grid>
                                    </Grid>

                                </Paper>
                                </>
                                
                            )):  ""} */}

                                
                    </div>
            {/* </Paper> */}

        

            </React.Fragment>
        )
    }

}

const styles = {
    tableStyle: {
        display: 'flex',
        justifyContent: 'left'
    }
}


export default CurrentMSISDNStatus;