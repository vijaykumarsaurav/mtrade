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
                                <TableCell align="">View</TableCell>
                                <TableCell align="">Image Count</TableCell>
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
                                <TableCell align="">Verification Ready Date </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody style={{width:"",whiteSpace: "nowrap"}}>
                            {this.state.msisdnDetails ? this.state.msisdnDetails.map(row => (
                                <TableRow hover   key={row.refNumber} >
                                    <TableCell  align="center" onClick={() => this.viewDocs(row.refNumber)}><VisibilityIcon style={{cursor:"hand"}} /></TableCell>
                                    <TableCell align="center">{row.imageCount}</TableCell> 
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
                                    <TableCell align="center">{row.verificationReadyDate}</TableCell>

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