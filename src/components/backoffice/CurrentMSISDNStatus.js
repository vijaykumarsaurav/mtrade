import React from "react";
import AdminService from "../service/AdminService";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Notify from "../../utils/Notify";
import VisibilityIcon from '@material-ui/icons/Visibility';
import SearchIcon from '@material-ui/icons/Search';
import PostLoginNavBar from "../PostLoginNavbar";
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import ActivationService from "../service/ActivationService";
import {resolveResponse} from "../../utils/ResponseHandler";

class CurrentMSISDNStatus extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            searchby:'',
            msisdnDetails: '',
        };
        this.searchRetailer = this.searchRetailer.bind(this);
        this.viewDocs = this.viewDocs.bind(this);

    }

    viewDocs = (refNumber) => {
        window.localStorage.setItem("selectedrefNumber", refNumber);
        this.props.history.push('/view-docs');
    }

    onChange = (e) => {
        const re = /^[0-9\b]+$/;
        if (e.target.value === '' || re.test(e.target.value) && e.target.value.length <= 10) {
            this.setState({searchby: e.target.value})
            window.localStorage.setItem("searchedMobileHistory", e.target.value);
        }
    }

    componentDidMount() {
        ActivationService.checkSession().then(res => {
            let data = resolveResponse(res);
        })
        var searchedMobileHistory = localStorage.getItem("searchedMobileHistory"); 
        console.log("searchedMobileHistory", searchedMobileHistory);
        if(searchedMobileHistory){
            this.searchRetailer(searchedMobileHistory); 
            this.setState({searchby: searchedMobileHistory})
        }
      
    }

    searchRetailer(searchedMobileHistory){
            var searchby = this.state.searchby ? this.state.searchby : searchedMobileHistory;
            if(!searchby){
                Notify.showError("Type MSISDN");
                return;
            }
            AdminService.searchMSISDN(searchby).then(res => {
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
                        window.localStorage.setItem("searchedMobileHistory", '');
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
                          Document View
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
                        
                <Table style={{marginTop: '100px'}}  aria-label="sticky table">
                        <TableHead >
                            <TableRow style={{width:"170px",whiteSpace: "nowrap"}}>
                                <TableCell>View</TableCell>
                                <TableCell>Image Count</TableCell>
                                <TableCell>Zone </TableCell>
                                <TableCell>MSISDN</TableCell>
                                <TableCell>NIC No.</TableCell>
                                <TableCell>Sim No.</TableCell>
                                <TableCell>FTA Date</TableCell>
                                <TableCell>ACT Submit Date</TableCell>
                                <TableCell>Resubmit Date</TableCell>
                                <TableCell>Verification Ready Date </TableCell>
                                <TableCell>Verification Date</TableCell>
                                <TableCell>Data Entered Date</TableCell>   
                                <TableCell>Omni Transfer Date</TableCell>
                                <TableCell>Verify By</TableCell>
                                <TableCell>Verifiy Comment</TableCell>
                                <TableCell>Verification Status</TableCell>
                                <TableCell>Data Entered By</TableCell>
                                <TableCell>Distributor Name</TableCell>
                                <TableCell>Distributor Number</TableCell>
                                <TableCell>Retailer Number</TableCell>
                                <TableCell>Omni Status</TableCell>
                                <TableCell>Ref Number </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody style={{width:"",whiteSpace: "nowrap"}}>
                            {this.state.msisdnDetails ? this.state.msisdnDetails.map(row => (
                                <TableRow hover   key={row.refNumber} >
                                    <TableCell   onClick={() => this.viewDocs(row.refNumber)}><VisibilityIcon style={{cursor:"hand"}} /></TableCell>
                                    <TableCell>{row.imageCount}</TableCell> 
                                    <TableCell>{row.zone}</TableCell> 
                                    <TableCell>{row.msisdnNumber}</TableCell>
                                    <TableCell>{row.nicNumber}</TableCell>
                                    <TableCell>{row.simNumber}</TableCell>
                                    <TableCell>{row.ftaDate}</TableCell>
                                    <TableCell>{row.submitDate}</TableCell>
                                    <TableCell>{row.resubmitDate}</TableCell>
                                    <TableCell>{row.verificationReadyDate}</TableCell>
                                    <TableCell>{row.verificationDate}</TableCell> 
                                    <TableCell>{row.dataEnteredDate}</TableCell>
                                    <TableCell>{row.omniTransferDate}</TableCell>
                                    <TableCell>{row.verifyBy}</TableCell>
                                    <TableCell>{row.verifiyComment}</TableCell>
                                    <TableCell>{row.verificationStatus}</TableCell>
                                    <TableCell>{row.dataEnteredBy}</TableCell>
                                    <TableCell>{row.distributorName}</TableCell>
                                    <TableCell>{row.distributorNumber}</TableCell>
                                    <TableCell>{row.retailerNumber}</TableCell>
                                    <TableCell>{row.omniStatus}</TableCell>
                                    <TableCell>{row.refNumber}</TableCell>

                                </TableRow>
                            )):  ""}
                        </TableBody>
                    </Table>       
                    </div>
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