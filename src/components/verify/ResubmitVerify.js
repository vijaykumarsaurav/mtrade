import React, { useState }  from "react";
import ActivationService from "../service/ActivationService";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Paper from "@material-ui/core/Paper";
import TextField from '@material-ui/core/TextField';
import Notify from "../../utils/Notify";

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from "@material-ui/core/Input";

import Grid from '@material-ui/core/Grid';

import VisibilityIcon from '@material-ui/icons/Visibility';
import PostLoginNavBar from "../PostLoginNavbar";
import {Container} from "@material-ui/core";
import {resolveResponse} from "../../utils/ResponseHandler";

 import "./Verify.css";

 const handleChangePage = (event, newPage) => {
   //  this.setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
   
   // this.setRowsPerPage(parseInt(event.target.value, 10));
  // this.setPage(0);
  };



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

class VerifyList extends React.Component{

    constructor(props) {
        super(props);
        this.state ={
            products: [],
            searchedproducts:'',
            searchby:'',
            listofzones:[],
            selectedZone:[],
            zone:''
        };
        this.loadProductList = this.loadProductList.bind(this);
        this.addProduct = this.addProduct.bind(this);
        this.editProduct = this.editProduct.bind(this);
        this.convertBool = this.convertBool.bind(this);
        this.onChange = this.onChange.bind(this);
        this.zoneChange = this.zoneChange.bind(this);
        this.onlockTransectionOnSkip = this.onlockTransectionOnSkip.bind(this);

    }

    componentDidMount() {
        this.loadProductList("");
        localStorage.setItem("lastUrl","verify");

        ActivationService.getTotalToBeProcessed().then(res => {
            let data = resolveResponse(res);
            console.log(data.result)
            localStorage.setItem("acquisitionCount",data.result && data.result.acquisitionCount ); 
            localStorage.setItem("resubmitCount",data.result && data.result.resubmitCount ); 
        })
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

    searchOnDB(mobileNumber) {

        var verifyListingTxn = localStorage.getItem("verifyListingTxn");
        verifyListingTxn =  verifyListingTxn && verifyListingTxn.split(',');

        if(verifyListingTxn.length >= 1){
            this.onlockTransectionOnSkip(verifyListingTxn); 
        }
       

        this.loadProductList(mobileNumber) ;
       
     
        // ActivationService.searchMobileNo(mobileNumber).then(res => {
        //     let data = resolveResponse(res);
        //     const selectedProduct = data.result;            

        //     if(selectedProduct && selectedProduct.transactionId){
        //         window.localStorage.setItem("selectedProductId", selectedProduct.transactionId);
        //         //window.localStorage.setItem("selectedSim", '');
        
        //         this.props.history.push('/verify-edit');
        //         // this.setState({
        //         //     });
        //     }
        //     // else{
        //     //     Notify.showError("Not Found or already processed");
        //     // }
           
        // })
    }
  
    
    loadProductList(mobileNumber) {
        var d = new Date();
        var endTime = d.getTime();

        var startTime = endTime - 172800000; 

        var  data =  {
            
            "mobileNumber": mobileNumber ? mobileNumber : null,
            "zones": this.state.selectedZone.length ? this.state.selectedZone : null
          }
        
        document.getElementById('showMessage').innerHTML = "Please Wait Loading...";

        ActivationService.listDocsResubmit(data)
            .then((res) => {
                let data = resolveResponse(res);
                var activationList = data.result && data.result.activationList; 
                this.setState({products: activationList})
                this.setState({searchedproducts: activationList})
                var listingIds =  activationList && activationList.map(function(val, index){
                return val.txnId
                });

                if(document.getElementById('showMessage')){
                    if(activationList == null){
                        document.getElementById('showMessage').innerHTML = "No new documents for verification";
                    }else{
                        document.getElementById('showMessage').innerHTML = "";
                    }    
                }

                if(listingIds){
                    localStorage.setItem("verifyListingTxn",listingIds); 
                }else{
                    localStorage.setItem("verifyListingTxn",""); 
                }
                
                 
            });

        setTimeout(() => {
            if(this.state.searchedproducts && this.state.searchedproducts.length ==0){
                document.getElementById('showMessage').innerHTML = "Server taking time to response please reload again and check";
            }
        }, 7000);


        ActivationService.getStaticData('BOA').then(res => {
            let data = resolveResponse(res);
            this.setState({listofzones: data && data.result && data.result.zones}) 
        })
        
    }

    onChange = (e) => {

        const re = /^[0-9\b]+$/;
        if (e.target.value === '' || re.test(e.target.value) && e.target.value.length <= 10) {
            this.setState({searchby: e.target.value})
        }
       
    }

    zoneChange = (e) =>{
        this.setState({[e.target.name]: e.target.value})
    }

    addProduct() {
        this.props.history.push('/add-product');
    }

    someAction() {
      alert("action happed in other commpornt"); 
    }

   


    editProduct(productId,sim) {
        console.log("productid, row.sim",productId, sim  )
        
        window.localStorage.setItem("selectedProductId", productId);
        window.localStorage.setItem("selectedSim", sim);
        window.localStorage.setItem("fromSubmit", 'yes');

        this.props.history.push('/verify-edit');

        // this.props.history.push({
        //     pathname: '/edit-doc',
        //     search: '?query=abc',
        //     state: { rowdata: productId }
        //   })
    }

    convertBool(flag) {
        return flag ? 'Yes' : 'No';
    }


      

    render(){
   
        return(

            <React.Fragment>
                <PostLoginNavBar/>

                <Paper style={{padding:"10px", overflow:"auto"}} >
               
                    <Grid syt  container spacing={3}  direction="row" alignItems="center" container>
                            <Grid item xs={12} sm={6} >
                                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                Resubmit – Document Verfication
                                </Typography> 
                                {/* <Typography>
                                Record to be Processed: {this.state.recordToBeProcessed}
                                </Typography>  */}
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

                            <Grid item xs={2} sm={2}  > 
                                 {/* InputLabelProps={{ shrink: true }} */}
                                <TextField  value={this.state.searchby}  label="Search by Mobile No."  style={{width:"100%"}} name="Search by Mobile No." name="searchby" onChange={this.onChange} />
                            </Grid>
                            <Grid item xs={2} sm={1} alignItems="left"> 
                                <Button type="submit"  onClick={() => this.searchOnDB( this.state.searchby )} variant="contained"  style={{marginLeft: '20px'}} >Search</Button>
                            </Grid>
                            
                </Grid>

                <div style={{padding:"10px", overflow:"auto", height:"550px"}} >

                    {/* style={{whiteSpace: "nowrap"}}   stickyHeader aria-label="sticky table"*/}
                    <Table size="small"   aria-label="sticky table">
                        <TableHead >
                            <TableRow style={{width:"170px",whiteSpace: "nowrap"}}>
                                <TableCell align="">View</TableCell>
                                <TableCell align="">Mobile Number</TableCell>
                                <TableCell align="">NIC</TableCell>
                                <TableCell align="">SIM</TableCell>
                                <TableCell align="">PEF Count</TableCell>
                                <TableCell align="">NIC Count</TableCell>
                                <TableCell align="">Distributor</TableCell>
                                <TableCell align="">Zone</TableCell>
                                <TableCell align="">FTA Date</TableCell>
                                {/* <TableCell align="">Status</TableCell> */}
                                {/* <TableCell align="">Resubmit</TableCell>
                                <TableCell align="">Verified Date</TableCell> */}
                                <TableCell align="">Submit Date</TableCell>
                                <TableCell align="">Resubmit Date</TableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody style={{ whiteSpace: "nowrap"}}>
                            {this.state.searchedproducts ? this.state.searchedproducts.map(row => (
                                <TableRow hover   key={row.txnId} >
                                    <TableCell  align="center" onClick={() => this.editProduct(row.txnId,row.sim)}><VisibilityIcon style={{cursor:"hand"}} /></TableCell>
                                    <TableCell component="th" scope="row" className="hidden">
                                        {row.mobileNumber}
                                    </TableCell>
                                    <TableCell align="center" >{row.nic}</TableCell>
                                    <TableCell align="center">{row.sim}</TableCell>
                                    <TableCell align="center">{row.pefCount}</TableCell>
                                    <TableCell align="center">{row.nicCount}</TableCell>
                                    <TableCell align="center">{row.distributer}</TableCell>
                                    <TableCell align="center">{row.zone}</TableCell>
                                    <TableCell align="center">{row.ftaDate.substring(0, 10)}</TableCell>
                                    {/* <TableCell align="center">{row.status ? 'YES' : 'NO'}</TableCell> */}
                                    {/* <TableCell align="center">{row.resubmit}</TableCell>
                                    <TableCell align="center">{row.verifiedDate ? row.verifiedDate.substring(0, 10) : "none"}</TableCell>
                                     */}
                                    <TableCell align="center">{row.submitDate ? row.submitDate.substring(0, 10) : "none"}</TableCell>
                                    <TableCell align="center">{row.resubmitDate ? row.resubmitDate.substring(0, 10) : "none"}</TableCell>


                                    {/* <TableCell align="center">{this.convertBool(row.showRecent)}</TableCell> */}
                                  

                                </TableRow>
                            )):  ""}
                        </TableBody>
                    </Table>

                    <div style={{color:"gray", fontSize:"15px", textAlign:"center"}}> <br/> <span id="showMessage"> </span></div>
     
                
                {/* </Container> */}

                </div>
                {/* <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={10}
                        rowsPerPage={10}
                        page={1}
                        backIconButtonProps={{
                        'aria-label': 'previous page',
                        }}
                        nextIconButtonProps={{
                        'aria-label': 'next page',
                        }}
                        onChangePage={handleChangePage}
                        onChangeRowsPerPage={handleChangeRowsPerPage}
                    /> */}
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
    tableRow: {
        hover: {
            "&:hover": {
                background: 'green !important',
            },
        },

    },
    
    selectStyle:{
        // minWidth: '100%',
         marginBottom: '0px',
          minWidth: 340,
          maxWidth: 340,
    }
}



export default VerifyList;