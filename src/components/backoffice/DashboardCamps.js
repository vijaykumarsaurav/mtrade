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
import FSEPagination from "./FSEPagination";


import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from "@material-ui/core/Input";

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

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
class FSEUpload extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            products: [],
            deletefile:'', 
            RetailerNumber:'',
            FSENumber:"",
            startDate:"", 
            endDate: '',
            retailerDetails: '',
            allOfferData:"",
            fse:true,
            parPage:10,
            selectedIds:[],
            selectedIdsDelete:'',
            afterDeleteRefresh:false, 
            fscDetails:[]// [{"fseNumber" : 1, "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", },{"fseNumber" : 2, "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", },{"fseNumber" : 3, "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", },{"fseNumber" : 4, "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", "one" : "one", }]
        };
        this.uploadOffer = this.uploadOffer.bind(this);
       // this.fseDelete = this.fseDelete.bind(this);
        this.searchFse = this.searchFse.bind(this);
        this.myCallback = this.myCallback.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.selectAll = this.selectAll.bind(this);
    }


    validateUploadFile = (file) => {
        const filename = file.name.toString(); 
    
        if (/[^a-zA-Z0-9\.\-\_ ]/.test(filename)) {
            Notify.showError("File name can contain only alphanumeric characters including space and dots")
            return false;
        }
    
        const fileext =  filename.split('.').pop(); 
        console.log("File Extension: ",fileext);

        if(fileext == 'csv'){
            var fileSize = file.size / 1000; //in kb
            if(fileSize >= 0 && fileSize <= 2048){
              Object.defineProperty(file, 'name', {
                writable: true,
                value:  md5(file.name) +"."+ fileext
              });
              
              return file;
            }else{
              Notify.showError("File size should be grater than 5KB and less than 2MB")
            }
        }else {
          Notify.showError("Only csv file allow to upload")
        }
        return false;
      }


    myCallback = (date) => {

        var startDate = '', endDate='';
        startDate = new Date(date);
        startDate = new Date("1 " + startDate.toLocaleString('default', { month: 'short' }) + ' ' +date.getFullYear());
        startDate.setHours(0,0,0,0);
        this.setState({startDate: startDate.getTime(), monthOfCamp:   ('0' + (startDate.getMonth()+1)).slice(-2)  + '/' + startDate.getFullYear()})    

        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        endDate.setHours(23,59,59,59);  
        this.setState({endDate: endDate.getTime()});    

       // console.log("startDate", this.state.startDate , "endDate", this.state.endDate);
    };

    onChangeFileUpload = e => {
       
        const fileToUpload = this.validateUploadFile(e.target.files[0]);

        if(fileToUpload){
            console.log(e.target.name);
            this.setState({[e.target.name]: e.target.files[0]})
            return;
        }else{
            console.log("Not Valid file: ",e.target.name); 
            document.getElementById(e.target.name).value = "";
        }

        
    }



    onChange = (e) => {

        const re = /^[0-9\b]+$/;
        if (e.target.value === '' || re.test(e.target.value) && e.target.value.length <= 10) {
            this.setState({ [e.target.name] : e.target.value})
        }

    }


    componentDidMount() {
        this.myCallback(new Date());
        
    //    this.searchFse();

    }


    selectCampsType = (e) =>{
        this.setState({[e.target.name]: e.target.value})
    }
    selectDeletedItem = (allid) =>{

        this.setState({selectedIdsDelete: allid})

       // alert(this.state.selectedIdsDelete); 
    }

    uploadOffer(type) {
    
           console.log(type, "type");

           

            // var userDetails = localStorage.getItem("userDetails")
            // userDetails = userDetails && JSON.parse(userDetails);

            const formData = new FormData();
            if(type === 'fse'){
                formData.append('fse',true);
                formData.append('campDetails',this.state.uploadfile);
                if(!this.state.uploadfile || document.getElementById('uploadfile').value ==""){
                    Notify.showError("Missing fse file to upload");
                    return;
                }
            }else{
                formData.append('campDetails',this.state.bdeuploadfile);
                formData.append('fse',false);
                if(!this.state.bdeuploadfile || document.getElementById('bdeuploadfile').value ==""){
                    Notify.showError("Missing bde file to upload");
                    return;
                }
            }
            // formData.append('startDate', this.state.startDate);
            // formData.append('endDate',this.state.endDate);
        
            AdminService.uploadFSCCampin(formData).then(data => {

           // var data = resolveResponse(data, "FSE Uploaded Successfully.");
            var data = data && data.data;
            if(data.status == 200){
                Notify.showSuccess("Camping Uploaded Successfully.");
            }else{
                Notify.showError(data.message);
                if(data.status === 1010 ){
                    localStorage.clear();
                    //return window.location.replace("/#/login");
                    return Promise.reject(window.location.replace("#/login"));
                }
            }

          
            document.getElementById('uploadfile').value = "";
        
            });
    }


    //  fseDelete() {
    
    //     if(this.state.selectedIdsDelete.length <1){
    //         Notify.showError("Select row(s) to delete");
    //         return;
    //     }

    //     console.log(this.state.selectedIdsDelete);

    //    const data = {
    //         campIdList : this.state.selectedIdsDelete
    //    }
        
    //     AdminService.deleteFse(data).then(res => {
    //         resolveResponse(res,'');
           
    //         Notify.showSuccess("Deleted successfully.");
    //         this.searchFse();
    //         this.setState({afterDeleteRefresh : true})
    //         return;

    //     });
    // }

    searchFse(){
       
            // if(!this.state.RetailerNumber && !this.state.FSENumber){
            //     Notify.showError("Type Retailer number and FSE number");
            //     return;
            // }
    
            var userDetails = localStorage.getItem("userDetails")
            userDetails = userDetails && JSON.parse(userDetails);
           
            const param = {
                    fseNumber : this.state.FSENumber.toString(), 
                    retailerNumber: this.state.RetailerNumber.toString(), 
                    monthOfCamp: this.state.monthOfCamp && this.state.monthOfCamp.toString(),
                    lapuNumber: this.state.FSENumber.toString(), 
                    fse: this.state.fse
            }
        
            AdminService.searchFse(param).then(res => {
            var data = resolveResponse(res,'');
            
                if(data.result){
                    this.setState({ fscDetails :  data.result.data, count: data.result.count})
                }else{
                   // this.setState({ retailerDetails :  [staticdata.result] })
                }
        });
    }

    addProduct() {
        this.props.history.push('/add-product');
    }

    someAction() {
      //  alert("action happed in other commpornt");
        console.log("page clicked")
    }


    editProduct(productId) {
        console.log("productid", productId)

        window.localStorage.setItem("selectedProductId", productId);
        this.props.history.push('/edit-doc');
    }

    selectAll = name => event =>{
       
      //  console.log("fscDetails",  this.state.fscDetails) 
        $('.fseItems').prop('checked', event.target.checked);  
        if(event.target.checked){
            var ids = this.state.fscDetails && this.state.fscDetails.map(row => row.fseNumber); 
            this.setState({ selectedIds :  ids })
        }else{
            this.setState({ selectedIds :  [] })
        }
        console.log( this.state.selectedIds);
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
                {/* <Paper style={{padding:"15px",  position:"sticky"}}>
                    <Typography component="h2" variant="h6" color="primary" gutterBottom>
                        FSE Camping Upload
                    </Typography> 
                    <Grid container className="flexGrow" spacing={3} style={{ padding: "10px" }}>
                        
                    <Grid item xs={12} sm={3}>
                            <InputLabel htmlFor="Connection Type" >
                                <Typography variant="subtitle1">
                                    <Link color="primary" href={DEV_PROTJECT_PATH+"/webdata/FseBdeSample.csv"}>Download Sample</Link>
                                </Typography>
                            </InputLabel>
                        </Grid>
                        

                        <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle1">Upload FSE Camping</Typography>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle1">

                            <input 
                           
                                    type="file"
                                    name="uploadfile"
                                    id="uploadfile"
                                    // onChange={this.onChangeHandler}
                                    onChange={this.onChangeFileUpload}
                                  />
                            </Typography>
                        </Grid>


                        <Grid item xs={12} sm={3}>
                            <Button startIcon={<CloudUploadIcon />}  variant="contained" color="primary" style={{ marginLeft: '20px' }} onClick={() => this.uploadOffer('fse')}>Upload</Button>
                        </Grid>
                    </Grid>
                    <Typography color="secondary" variant="body1">Note: Please review camping details under DASHBOARD CAMP before uploading</Typography>

                </Paper>

                <br />

                <Paper style={{padding:"15px",  position:"sticky"}}>
                    <Typography component="h2" variant="h6" color="primary" gutterBottom>
                      BDE Camping Upload
                    </Typography> 
                    <Grid container className="flexGrow" spacing={3} style={{ padding: "10px" }}>
                        
                    <Grid item xs={12} sm={3}>
                            <InputLabel htmlFor="Connection Type" >
                                <Typography variant="subtitle1">
                                    <Link color="primary" href={DEV_PROTJECT_PATH+"/webdata/FseBdeSample.csv"}>Download Sample</Link>
                                </Typography>
                            </InputLabel>
                        </Grid>
                        

                        <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle1">Upload BDE Camping</Typography>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle1">

                            <input 
                           
                                    type="file"
                                    name="bdeuploadfile"
                                    id="bdeuploadfile"
                                    // onChange={this.onChangeHandler}
                                    onChange={this.onChangeFileUpload}
                                  />
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <Button startIcon={<CloudUploadIcon />}  variant="contained" color="primary" style={{ marginLeft: '20px' }} onClick={() => this.uploadOffer('bde')}>Upload</Button>
                        </Grid>
                        
                    </Grid>
                    <Typography color="secondary" variant="body1">Note: Please review camping details under DASHBOARD CAMP before uploading</Typography>

                    
                </Paper> */}

                <br />
                <Paper style={{padding:"15px",  position:"sticky"}}>
                <Grid syt  container spacing={1} container
                    justify="space-between"
                    container>
                        <Grid item xs={12} sm={3} >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                        Camping Search and Delete
                        </Typography> 
                        </Grid>
                        <Grid item xs={10} sm={2}> 
                               <FormControl style={styles.selectStyle}>
                                    <InputLabel id="demo-mutiple-name-label">Select Camps Type </InputLabel>
                                    <Select
                                    labelId="demo-mutiple-name-label"
                                    id="demo-mutiple-name"
                                    name="fse"
                                    value={this.state.fse}
                                    onChange={this.selectCampsType}
                                    input={<Input />}
                                    MenuProps={MenuProps}
                                    >
                                     <MenuItem key={'fse'} value={true}>Agent FSE</MenuItem>
                                     <MenuItem key={'fse'} value={false}>BDE/Independent FSE</MenuItem>

                                    </Select>
                                </FormControl>

                                {/* <FormControl component="fieldset">                                   
                                    <RadioGroup row aria-label="position" name="position" defaultValue="top">
                                       <FormControlLabel value="Agent_FSE" control={<Radio />} label="Agent FSE" />
                                       <FormControlLabel value="BDE_Independent_FSE " control={<Radio color="primary" />} label="BDE/Independent FSE" />
                                    </RadioGroup>
                                </FormControl> */}

                       
                                    
                            </Grid>
                        <Grid item xs={12} sm={2} item > 
                            <TextField type="text" value={this.state.RetailerNumber } label=" By Retailer Number  " style={{ width: "100%" }} name="RetailerNumber" onChange={this.onChange} />
                        </Grid>
                        <Grid item xs={12} sm={2} item > 
                            <TextField type="text" value={this.state.FSENumber } label=" By FSE Number  " style={{ width: "100%" }} name="FSENumber" onChange={this.onChange} />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <MonthYearCalender calParams={{myCallback: this.myCallback}}/>
                        </Grid>
                        <Grid item xs={12} sm={1} item > 
                            <Button startIcon={<SearchIcon/>} variant="contained"  onClick={this.searchFse}>Search</Button>
                        </Grid>
                </Grid>
                </Paper>



                {/* <Paper style={{padding:"15px", position:"sticky", width:"100%", overflowX:"auto"}} >
                <FormControl component="fieldset">
                        
                        <FormGroup aria-label="position" row>
                    <Table aria-label="sticky table">
                        <TableHead >
                            <TableRow style={{width:"170px",whiteSpace: "nowrap"}}>
                                <TableCell align=""> 
                            
                                
                                <FormControlLabel
                                value="All"
                                control={<Checkbox onChange={this.selectAll()} color="primary"  />}
                                label="Select All"
                                labelPlacement="right"
                                />

                                </TableCell>
                                <TableCell align="">FSE Number</TableCell>
                                <TableCell align="">Retailer Number</TableCell>
                                <TableCell align="">Retailer Name</TableCell>

                                <TableCell align="">Retailer Address</TableCell>
                                <TableCell align="">Retailer Lat Long</TableCell>
                                <TableCell align="">Date of Camp (dd/mm/yyyy)</TableCell>
                                
                                <TableCell align="">Target Acquisition</TableCell>
                                <TableCell align="">Target Recharge Count</TableCell>
                                <TableCell align="">Target Recharge Amount</TableCell>
                                <TableCell align="">Target SIM Swap </TableCell>


                            </TableRow>
                        </TableHead>

                        <TableBody style={{width:"",whiteSpace: "nowrap"}}>
                            {this.state.fscDetails ? this.state.fscDetails.map(row => (
                                <TableRow hover   key={row.id} > 
         
                                <TableCell><div> <label> <input type="checkbox" className="fseItems" onChange={this.handleChange(row.id)} /></label></div></TableCell>
                                <TableCell align="">{row.fseNumber}</TableCell>
                                <TableCell align="">{row.retailerNumber}</TableCell>
                                <TableCell align="">{row.retailerName}</TableCell>
                                <TableCell align="">{row.address}</TableCell>
                                <TableCell align="">{row.latlong}</TableCell>
                                <TableCell align="">{row.campDate}</TableCell>
                                <TableCell align="">{row.targetAcqCount}</TableCell>
                                <TableCell align="">{row.targetRechargeCount}</TableCell>
                                <TableCell align="">{row.targetRechargeAmount}</TableCell>
                                <TableCell align="">{row.targetSimSwapCount}</TableCell>
                                    
                                </TableRow>
                            )):  ""}
                        </TableBody>
                    </Table>  


                    {this.state.fscDetails.length > 0 ? 
                    <Grid syt  container spacing={1} container
                    direction="row"
                    alignItems="left">
                        <Grid item xs={12} sm={2} item style={{textAlign:"left"}} > 
                             <br />
                            <Button startIcon={<DeleteIcon/>} variant="contained" color="" style={{ marginLeft: '20px' }} onClick={this.fseDelete}>Delete</Button>
                        </Grid>
                    </Grid>
                    :"" }

                    </FormGroup>
                 </FormControl>
                        

                 </Paper>  */}

                 <FSEPagination fscData={{fscDetails: this.state.fscDetails ? this.state.fscDetails : [], count: this.state.count, selectDeletedItem:this.selectDeletedItem, searchFse:this.searchFse} }/>


                 {/* <Paper style={{padding:"15px",  position:"sticky"}}>
                <Grid  container spacing={1} container
                    justify="space-between"
                    container>
                      
                        <Grid item xs={2} sm={2}> 
                            <FormControl style={styles.selectStyle}>
                                    <InputLabel id="demo-mutiple-name-label">Per Page Size </InputLabel>
                                    <Select
                                    labelId="demo-mutiple-name-label"
                                    id="demo-mutiple-name"
                                    name="parPage"
                                    value={this.state.parPage}
                                    onChange={this.selectCampsType}
                                    input={<Input />}
                                    MenuProps={MenuProps}
                                    >
                                     <MenuItem key={'10'} value={10}>10</MenuItem>
                                     <MenuItem key={'20'} value={25}>25</MenuItem>
                                     <MenuItem key={'50'} value={50}>50</MenuItem>


                                    </Select>
                                </FormControl>
                            </Grid>
                      
                        <Grid item xs={12} sm={10} item > 
                            <FSEPagination pageAction={{searchFse : this.searchFse}}/>
                        </Grid>
                </Grid>
                </Paper>

                        */}
                   
   

        </div>

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
        marginBottom: '0px',
        minWidth: 200,
        maxWidth: 340
    }
}


export default FSEUpload;



// import React from 'react';
// import { makeStyles } from '@material-ui/core/styles';
// import Pagination from '@material-ui/lab/Pagination';

// const useStyles = makeStyles((theme) => ({
//   root: {
//     '& > *': {
//       marginTop: theme.spacing(2),
//     },
//   },
// }));



// export default function PaginationOutlined(props) {
//   const classes = useStyles();

//   const changePage = page => {
//     alert(page);
//   // searchFse
// }	
// // function changePage(event: object, page: number) => {
// //   alert(number);
// // }; 

//   return (
//     <div className={classes.root}>
//       <Pagination page={9} onChange={ alert() }  count={100} variant="outlined" color="primary" />
//     </div>
//   );
// }



// import React from "react";
// import { makeStyles } from "@material-ui/core/styles";
// import Table from "@material-ui/core/Table";
// import TableBody from "@material-ui/core/TableBody";
// import TableCell from "@material-ui/core/TableCell";
// import TableContainer from "@material-ui/core/TableContainer";
// import TableHead from "@material-ui/core/TableHead";
// import TableRow from "@material-ui/core/TableRow";
// import TablePagination from "@material-ui/core/TablePagination";
// import Paper from "@material-ui/core/Paper";


// import Checkbox from '@material-ui/core/Checkbox';
// import FormGroup from '@material-ui/core/FormGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormControl from '@material-ui/core/FormControl';
// import FormLabel from '@material-ui/core/FormLabel';
// import $ from 'jquery'; 

// const useStyles = makeStyles({
// //   table: {
// //    minWidth: '100%'
// //   }
// });



// const rows = [

//  {"onecolumn": "647446446" , id: 1}, 
//  {"onecolumn": "647446446", id: 2},
//  {"onecolumn": "647446446", id: 3},
//  {"onecolumn": "647446446", id: 4},
//  {"onecolumn": "647446446", id: 5},
//  {"onecolumn": "647446446", id: 6},
//  {"onecolumn": "647446446", id: 7},
//  {"onecolumn": "647446446", id: 8},
//  {"onecolumn": "647446446", id: 9},
//  {"onecolumn": "647446446", id: 10},
//  {"onecolumn": "647446446", id: 11},
//  {"onecolumn": "647446446", id: 12},
//  {"onecolumn": "647446446", id: 13},
//  {"onecolumn": "647446446", id: 14},
//  {"onecolumn": "647446446", id: 15},
 
 
 
 
 
// ];

// export default function SimpleTable() {
//   const classes = useStyles();
//   const [page, setPage] = React.useState(0);
//   const [rowsPerPage, setRowsPerPage] = React.useState(5);
//   const handleChangePage = (event, newPage) => {
//     alert( "newPage: "+ newPage);     
//     setPage(newPage);
//   };

//   const [values, setValues] = React.useState({
//     selectedIds : [], 
  
//   });


  
//   const handleChangeRowsPerPage = event => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//     alert( "perpage: "+ event.target.value);     
//   };

//   const selectAll = name => event =>{
    
//     //  console.log("fscDetails",  this.state.fscDetails) 
//       $('.fseItems').prop('checked', event.target.checked);  
//       if(event.target.checked){
//        //   var ids = this.state.fscDetails && this.state.fscDetails.map(row => row.fseNumber); 
//         //  this.setState({ selectedIds :  ids })
//            var ids = rows.map(row => row.onecolumn); 
//           setValues({ ...values, ['selectedIds']: ids });
//       }else{
//         setValues({ ...values, ['selectedIds']: [] });
//       }
//       alert(name);  
//   }

//     const handleChange = name => event => {
   

//         if(event.target.checked){
//            // setValues({ ...values, ['selectedIds']: name });
//             values.selectedIds.push(name); 
//         }else{
//             values.selectedIds.pop(name); 
//         }

       
//     }

//   const emptyRows =
//     rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

//   return (
//     <TableContainer component={Paper}  style={{padding:"15px",  position:"sticky"}}>
//       <Table className={classes.table} aria-label="simple table">
//         <TableHead>
//           <TableRow>
//           <TableCell align="">   
//                 <FormControlLabel
//                 value="All"
//                 control={<Checkbox name="selectAll" onChange={selectAll()} color="primary"  />}
//                 label="Select All"
//                 labelPlacement="right"
//                 />
//                </TableCell>
//             <TableCell align="">FSE LAPU Number</TableCell>
//             <TableCell align="">Retailer Number</TableCell>
//             <TableCell align="">Retailer Name</TableCell>
//             <TableCell align="">Retailer Address</TableCell>
//             <TableCell align="">Retailer Lat Long</TableCell>
//             <TableCell align="">Date of Camp (dd/mm/yyyy)</TableCell>
//             <TableCell align="">Target Acquisition</TableCell>
//             <TableCell align="">Target Recharge Count</TableCell>
//             <TableCell align="">Target Recharge Amount</TableCell>
//             <TableCell align="">Target SIM Swap </TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {rows
//             .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//             .map((row, index) => (
//               <TableRow key={row.onecolumn}>

//                 {/* <TableCell><div> <label> <input type="checkbox" className="fseItems" onChange={this.handleChange(row.fseNumber)} /></label></div></TableCell> */}
//                 <TableCell>  <Checkbox color="primary" className="fseItems"  onChange={handleChange(row.id)}   /></TableCell>
                              
//                 <TableCell align="">{row.onecolumn}</TableCell>
//                 <TableCell align="">{row.onecolumn}</TableCell>
//                 <TableCell align="">{row.onecolumn}</TableCell>
//                 <TableCell align="">{row.onecolumn}</TableCell>
//                 <TableCell align="">{row.onecolumn}</TableCell>
//                 <TableCell align="">{row.onecolumn}</TableCell>
//                 <TableCell align="">{row.onecolumn}</TableCell>
//                 <TableCell align="">{row.onecolumn}</TableCell>
//                 <TableCell align="">{row.onecolumn}</TableCell>
//                 <TableCell align="">{row.onecolumn}</TableCell>
               
//               </TableRow>
//             ))}
//           {emptyRows > 0 && (
//             <TableRow style={{ height: 53 * emptyRows }}>
//               <TableCell colSpan={6} />
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>
//       <TablePagination
//         rowsPerPageOptions={[5, 10, 25]}
//         component="div"
//         count={rows.length}
//         rowsPerPage={rowsPerPage}
//         page={page}
//         onChangePage={handleChangePage}
//         onChangeRowsPerPage={handleChangeRowsPerPage}
//       />
//     </TableContainer>
//   );
// }
