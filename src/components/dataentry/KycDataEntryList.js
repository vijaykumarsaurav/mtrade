import React from "react";
import ActivationService from "../service/ActivationService";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Paper from "@material-ui/core/Paper";
import TableBody from "@material-ui/core/TableBody";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Notify from "../../utils/Notify";
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from "@material-ui/core/Input";
import VisibilityIcon from '@material-ui/icons/Visibility';
import PostLoginNavBar from "../PostLoginNavbar";
import {resolveResponse} from "../../utils/ResponseHandler";
import "./DataEntry.css";
import getKycTotalToBeProcessed from "../../utils/CommonApi";


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

class KycDataEntryList extends React.Component{

    constructor(props) {
        super(props);
        this.state ={
            products: [],
            searchedproducts: '',
            searchby:'',
            listingTakingTime : null,
            listofzones:[],
            selectedZone:[],
            zone:''

        };
        this.listTxn = this.listTxn.bind(this);
        this.viewTxn = this.viewTxn.bind(this);
        this.convertBool = this.convertBool.bind(this);
        this.onlockTransectionOnSkip = this.onlockTransectionOnSkip.bind(this);

        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {   
        getKycTotalToBeProcessed("PROCESS_CUSTOMER_KYC", "Re-Registration records to be processed:");
        this.listTxn();
        localStorage.setItem("lastUrl","dataentry");
      

    }

    zoneChange = (e) =>{
        this.setState({[e.target.name]: e.target.value})
    }

    listTxn(mobileNumber) {   
        if(JSON.parse(localStorage.getItem('cmsStaticData'))){
            this.setState({listofzones:  JSON.parse(localStorage.getItem('cmsStaticData')).zones});
        }
        var  data =  {
            "mobileNumber": mobileNumber ? mobileNumber : null,
            "zones": this.state.selectedZone.length ? this.state.selectedZone : null,
            "processType": "PROCESS_CUSTOMER_KYC"
        }
        document.getElementById('showMessage').innerHTML = "Please Wait Loading...";
        ActivationService.KycListDocs(data)
            .then((res) => {
              
                    let data = resolveResponse(res);
                    var activationList = data.result && data.result.kycAvDataList; 
                    this.setState({products: activationList})
                    this.setState({searchedproducts:activationList})
                    var listingIds = activationList && activationList.map(function(val, index){
                        return val.txnId
                    })

                    if(listingIds){
                        localStorage.setItem("dataentryListingTxn",listingIds); 
                    }else{
                        localStorage.setItem("dataentryListingTxn",""); 
                    }
                  
                    
                    if(document.getElementById('showMessage')){
                        document.getElementById('showMessage').innerHTML = "";
                        if(activationList == null){
                            document.getElementById('showMessage').innerHTML = "No new documents for verification";
                        }  
                    }

            });

            setTimeout(() => {
                if(this.state.searchedproducts && this.state.searchedproducts.length ==0){
                    document.getElementById('showMessage').innerHTML = "Server taking time to response please reload again and check";
                }
            }, 7000);
    }

    onlockTransectionOnSkip = (txn) =>{
        var transactionsIds = {
            transactionsIds : txn
        }

        ActivationService.unlockTransectionsSkip( transactionsIds ).then(res => {
            let data = resolveResponse(res);
            if(data.message != 'ok'){
                Notify.showError("Server Error"+data.message);
            }  
       });
       
    }

    onChange = (e) => {
        const re = /^[0-9\b]+$/;
        if (e.target.value === '' || re.test(e.target.value) && e.target.value.length <= 10) {
            this.setState({searchby: e.target.value})
        }
    }

    viewTxn(productId) {
        console.log("productid",productId )
        window.localStorage.setItem("dataEntryId", productId);
        window.localStorage.setItem("fromSubmit", '');
        this.props.history.push('/kyc-dataentry-edit');
    }

    convertBool(flag) {
        return flag ? 'Yes' : 'No';
    }

    render(){

        return(
            <React.Fragment>
                <PostLoginNavBar/>
                <Paper style={{padding:"10px"}}>
                    <Grid container spacing={3} container
                        direction="row"
                      
                        alignItems="center">
                            <Grid item  xs={12} xs={6}>
                            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                             Re-Registration Data Entry
                            </Typography> 
                            </Grid>

                            <Grid item xs={10} sm={3}> 
                                <FormControl style={styles.selectStyle}>
                                        <InputLabel id="demo-mutiple-name-label">Select Zone</InputLabel>
                                        <Select
                                        labelId="demo-mutiple-name-label"
                                        id="demo-mutiple-name"
                                        multiple
                                        name="selectedZone"
                                        value={this.state.selectedZone}
                                        onChange={this.zoneChange}
                                        input={<Input />}
                                        MenuProps={MenuProps}
                                        >
                                        {this.state.listofzones ? this.state.listofzones.map(name => (
                                            <MenuItem key={name} value={name} >
                                                {name}
                                            </MenuItem>
                                        )): ""}
                                        </Select>
                                    </FormControl>
                            </Grid>
                            

                            <Grid item xs={10} sm={2} > 
                                <TextField value={this.state.searchby}  label="Search by Mobile No."  style={{width:"100%"}} name="Search by Mobile No." name="searchby" onChange={this.onChange} />
                            </Grid>
                            <Grid item xs={2} sm={1} > 
                               <Button type="submit"  onClick={() => this.listTxn( this.state.searchby )} variant="contained"  style={{marginLeft: '20px'}} >Search</Button>
                            </Grid>
                        </Grid>

                    <div style={{padding:"10px", overflow:"auto", height:"550px"}} >

                    <Table  size="small"   aria-label="sticky table">
                        <TableHead style={{width:"170px",whiteSpace: "nowrap"}}>
                            <TableRow >
                                <TableCell>View</TableCell>
                                <TableCell>Mobile Number</TableCell>
                                <TableCell>NIC</TableCell>
                                {/* <TableCell>SIM</TableCell>
                                <TableCell>PEF Count</TableCell> */}
                                <TableCell>NIC Count</TableCell>
                                <TableCell>Distributor</TableCell>
                                <TableCell>Zone</TableCell>
                                <TableCell>FTA Date</TableCell>
                                <TableCell>Submit Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody style={{width:"170px",whiteSpace: "nowrap"}}>
                            {this.state.searchedproducts ? this.state.searchedproducts.map(row => (
                                <TableRow key={row.txnId}>
                                    <TableCell  onClick={() => this.viewTxn(row.txnId)} key={row.txnId}><VisibilityIcon style={{cursor:"hand"}} /></TableCell>
                                    <TableCell component="th" scope="row" className="hidden">
                                        {row.mobileNumber}
                                    </TableCell>
                                    <TableCell>{row.nic}</TableCell>
                                    {/* <TableCell>{row.sim}</TableCell>
                                    <TableCell>{row.pefCount}</TableCell> */}
                                    <TableCell>{row.nicCount}</TableCell>
                                    <TableCell>{row.distributer}</TableCell>
                                    <TableCell>{row.zone}</TableCell>
                                    <TableCell>{row.ftaDate.substring(0, 10)}</TableCell>
                                    <TableCell>{row.submitDate ? row.submitDate.substring(0, 10) : "none"}</TableCell>
                                </TableRow>
                            )): ""}
                        </TableBody>
                    </Table>
                    <div style={{color:"gray", fontSize:"15px", textAlign:"center"}}> <br/> <span id="showMessage"> </span></div>

                    </div>
                </Paper>
            </React.Fragment>
        )
    }

}

const styles = {
    tableStyle : {
        display: 'flex',
        justifyContent: 'left'
    },
    selectStyle:{
         marginBottom: '0px',
          minWidth: 340,
          maxWidth: 340,
    }
}


export default KycDataEntryList;