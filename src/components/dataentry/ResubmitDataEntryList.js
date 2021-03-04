import React, { useState }  from "react";
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
import {Container} from "@material-ui/core";
import {resolveResponse} from "../../utils/ResponseHandler";
import "./DataEntry.css";






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

class DataEntryList extends React.Component{

    constructor(props) {
        super(props);
        this.state ={
            products: [],
            searchedproducts: null,
            searchby:'',
            listingTakingTime : null,
            listofzones:[],
            selectedZone:[],
            zone:''

        };
        this.loadProductList = this.loadProductList.bind(this);
        this.addProduct = this.addProduct.bind(this);
        this.editProduct = this.editProduct.bind(this);
        this.convertBool = this.convertBool.bind(this);
        this.onlockTransectionOnSkip = this.onlockTransectionOnSkip.bind(this);


        this.onChange = this.onChange.bind(this);

    
     
    }

    // myhooks(){
    //     [this.page, this.setPage] = React.useState(0);
    //     [this.rowsPerPage, this.setRowsPerPage] = React.useState(5);
    // }

    componentDidMount() {
        this.loadProductList();
        localStorage.setItem("lastUrl","dataentry");
        ActivationService.getTotalToBeProcessed().then(res => {
            let data = resolveResponse(res);         
            if(document.getElementById('acqRecordId')){
                document.getElementById('acqRecordId').innerHTML = "Acquisition records to be processed: " + data.result.acquisitionCount; 
            }
            if(document.getElementById('resubmitRecordId')){
                document.getElementById('resubmitRecordId').innerHTML = "Resubmit records to be processed: " + data.result.resubmitCount; 
            }
        });
    }

    zoneChange = (e) =>{
        this.setState({[e.target.name]: e.target.value})
    }

    

     
    loadProductList(mobileNumber) {
        var d = new Date();
        var endTime = d.getTime();

        var startTime = endTime - 259200000; 
       
        var  data =  {
            "endDate": endTime,
            "mobileNumber": mobileNumber ? mobileNumber : null,
            "noOfRecords": 20,
            "role": "DE",
            "startDate": 0,
            "txnId": 0,
            "type": "next",
            "zones": this.state.selectedZone.length ? this.state.selectedZone : null
        }

        document.getElementById('showMessage').innerHTML = "Please Wait Loading...";

        ActivationService.listDocsResubmit(data)
            .then((res) => {
              
               
                let data = resolveResponse(res);
                    var activationList = data.result && data.result.activationList; 
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
                  
                    document.getElementById('showMessage').innerHTML = "";
                    if(document.getElementById('showMessage')){
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

            if(JSON.parse(localStorage.getItem('cmsStaticData'))){
                this.setState({listofzones:  JSON.parse(localStorage.getItem('cmsStaticData')).zones});
            }

    }

    addProduct() {
        this.props.history.push('/add-product');
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
        

        // var dataentryListingTxn = localStorage.getItem("dataentryListingTxn");
        // dataentryListingTxn =  dataentryListingTxn && dataentryListingTxn.split(',');
       
        // if(dataentryListingTxn.length >= 1){
        //     this.onlockTransectionOnSkip(dataentryListingTxn); 
        // }

        this.loadProductList(mobileNumber) ;


        // console.log(mobileNumber);

        // ActivationService.searchMobileNo(mobileNumber).then(res => {
        //     let data = resolveResponse(res);
        //     const selectedProduct = data.result;            
        //     if(selectedProduct && selectedProduct.transactionId){
        //         window.localStorage.setItem("dataEntryId", selectedProduct.transactionId);
        //         this.props.history.push('/data-edit');
        //         // this.setState({
        //         //     });
        //     }
           
        // })
    }

    onChange = (e) => {
        // this.setState({[e.target.name]: e.target.value});
        // if(this.state.searchby){
        //     this.setState({searchedproducts: this.state.products.filter(l => {
        //         return l.mobileNumber.toLowerCase().match( e.target.value );
        //     })});
        // }else{
        //     this.setState({searchedproducts: this.state.products})
        // }
        // if(e.target.value.length > 10){
        //     this.setState({searchby: e.target.value.substring(0, 10)});
            
        // }
        const re = /^[0-9\b]+$/;
        if (e.target.value === '' || re.test(e.target.value) && e.target.value.length <= 10) {
            this.setState({searchby: e.target.value})
        }
    }


    editProduct(productId) {
        console.log("productid",productId )
        
        window.localStorage.setItem("dataEntryId", productId);
        window.localStorage.setItem("fromSubmit", 'yes');

        this.props.history.push('/data-edit');

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
      
      //  console.log("this.state.products",this.state.products); 
        return(
            <React.Fragment>
                <PostLoginNavBar/>
                <Paper style={{padding:"10px"}}>
                {/* <Container  > */}
                    {/* <EnhancedTable products={this.state.products}/> */}

                    {/* <StickyHeadTable products={this.state.products} />
                     */}

                    <Grid syt  container spacing={3} container
                        direction="row"
                        justify="right"
                        alignItems="center">
                            <Grid item  xs={12} xs={6}>
                            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Resubmit – Data Entry
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
                            

                            <Grid item xs={10} sm={2} alignItems="flex-end" alignContent="flex-end"  justify="flex-end" > 
                                <TextField value={this.state.searchby}  label="Search by Mobile No."  style={{width:"100%"}} name="Search by Mobile No." name="searchby" onChange={this.onChange} />
                            </Grid>
                            <Grid item xs={2} sm={1} alignItems="flex-end" alignContent="flex-end"  justify="flex-end" > 
                               <Button type="submit"  onClick={() => this.searchOnDB( this.state.searchby )} variant="contained"  style={{marginLeft: '20px'}} >Search</Button>
                            </Grid>
                            
                          
                        </Grid>

                
                

                    <div style={{padding:"10px", overflow:"auto", height:"550px"}} >


                    {/* style={{whiteSpace: "nowrap"}}   style={{background:"#eeee"}} */}
                    <Table  size="small"   aria-label="sticky table">
                        <TableHead style={{width:"170px",whiteSpace: "nowrap"}}>
                            <TableRow >
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
                                <TableCell align="">ACT Submit Date</TableCell>
                                <TableCell align="">Resubmit Date</TableCell>
                                <TableCell>Verification Ready Date </TableCell>


                            </TableRow>
                        </TableHead>
                        <TableBody style={{width:"170px",whiteSpace: "nowrap"}}>
                            {this.state.searchedproducts ? this.state.searchedproducts.map(row => (
                                <TableRow  >
                                    <TableCell align="center" onClick={() => this.editProduct(row.txnId)}  hover key={row.txnId}><VisibilityIcon style={{cursor:"hand"}} /></TableCell>
                                    <TableCell component="th" scope="row" className="hidden">
                                        {row.mobileNumber}
                                    </TableCell>
                                    <TableCell align="center">{row.nic}</TableCell>
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
                                    <TableCell>{row.verificationReadyDate}</TableCell>

                                </TableRow>
                            )): ""}
                        </TableBody>
                    </Table>
                    <div style={{color:"gray", fontSize:"15px", textAlign:"center"}}> <br/> <span id="showMessage"> </span></div>

                    </div>
                    {/* <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 100]}
                        component="div"
                        count={this.state.searchedproducts.length}
                        rowsPerPage={5}
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
                
                {/* </Container> */}

                </Paper>
            </React.Fragment>
        )
    }

}
//this.myhooks();

const handleChangePage = (event, newPage) => {
    this.setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
   
    this.setRowsPerPage(parseInt(event.target.value, 10));
   this.setPage(0);
  };

const styles = {
    tableStyle : {
        display: 'flex',
        justifyContent: 'left'
    }
    ,
    selectStyle:{
        // minWidth: '100%',
         marginBottom: '0px',
          minWidth: 340,
          maxWidth: 340,
    }
}


export default DataEntryList;