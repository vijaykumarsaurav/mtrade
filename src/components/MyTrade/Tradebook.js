import React from "react";
import AdminService from "../service/AdminService";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import CreateIcon from '@material-ui/icons/Create';
import PostLoginNavBar from "../PostLoginNavbar";
import {resolveResponse} from "../../utils/ResponseHandler";
import {connect} from "react-redux";
import {setPackLoaded} from "../../action";
import Spinner from "react-spinner-material";
import ActivationService from "../service/ActivationService";

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from "@material-ui/core/Input";

import  {IMAGE_VALIDATION_TOKEN,COOKIE_DOMAIN} from "../../utils/config";
import "./ViewStyle.css";


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

class TradeBook extends React.Component{

    constructor(props) {
        super(props);
        this.addProduct = this.addProduct.bind(this);
        this.editProduct = this.editProduct.bind(this);
        this.convertBool = this.convertBool.bind(this);
        

        this.state = {
            oderbookData:[],
            listofzones:[],
            selectedZone:[],
            zone:'',
            selectAllzone:'Select All'

        }
    }

    componentDidMount() {
    
        AdminService.retrieveTradeBook()
            .then((res) => {
                let data = resolveResponse(res);
                console.log('datamy', data);

                if(data && data.data){
                    this.setState({oderbookData: data.data});
                }
            });
       
    }

    zoneChange = (e) =>{
        this.setState({[e.target.name]: e.target.value});

        if(e.target.value.includes("Select All")){
            this.setState({selectedZone: this.state.listofzones})
            this.setState({selectAllzone: "Remove All"})
        }
    
        if(e.target.value.includes("Remove All")){
            this.setState({selectedZone: []})
            this.setState({selectAllzone: "Select All"})
        }

    }

   

   
    addProduct=(e)=> {
        console.log(this.props)
        this.props.history.push('/banner-add');
    }

    editProduct(productId) {
        window.localStorage.removeItem("selectedBannerId");
        window.localStorage.setItem("selectedBannerId", productId);
        this.props.history.push('/banner-edit');
    }

    convertBool(flag) {
        return flag ? 'Yes' : 'No';
    }

    dateFormat(date){
        var d = new Date(date);
        var fd = d.toLocaleDateString() + ' ' + d.toTimeString().substring(0, d.toTimeString().indexOf("GMT"));
        return fd;
    }
   
    

    render(){
        var CookieExpireDate = new Date();
        CookieExpireDate.setDate(CookieExpireDate.getDate() + 1);
        document.cookie = "token=" + IMAGE_VALIDATION_TOKEN + ";expires=" + CookieExpireDate + ";domain="+COOKIE_DOMAIN+";path=/";
        console.log("COOKIE", document.cookie ); 

        console.log(this.props,"PROPS")
      return(
        <React.Fragment>
            <PostLoginNavBar/>



            <Paper style={{padding:"10px", overflow:"auto"}} >


            <Grid syt  container spacing={1}  direction="row" alignItems="center" container>
                            <Grid item xs={12} sm={6} >
                                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                  Today Trades 
                                </Typography> 
                            </Grid>
                            {/* <Grid item xs={10} sm={3}> 
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
                                        <MenuItem key={this.state.selectAllzone} value={this.state.selectAllzone} >
                                            <b> {this.state.selectAllzone}   </b>                                         
                                          </MenuItem>
                                        {this.state.listofzones ? this.state.listofzones.map(name => (
                                            <MenuItem key={name} value={name} >
                                                {name}
                                            </MenuItem>
                                        )): ""}
                                        </Select>
                                    </FormControl>
                            </Grid>

                            <Grid item xs={2} sm={1}  > 
                                 <Button type="submit"  onClick={() => this.loadBannerList()} variant="contained"  style={{marginLeft: '20px'}} >Search</Button>
                            </Grid>
                            <Grid item xs={2} sm={2} alignItems="left"> 
                            <Button variant="contained" color="primary" onClick={() => this.addProduct()}>
                                Add Banner
                            </Button>      
                            </Grid> */}

                            
                </Grid>
            

            <Table  size="small"   aria-label="sticky table" >
                <TableHead  style={{width:"",whiteSpace: "nowrap"}} variant="head">
                    <TableRow   variant="head" style={{fontWeight: 'bold'}}>
                          {/* <TableCell align="center">Edit</TableCell> */}


                        {/* <TableCell align="center">checkbox</TableCell> */}
                        <TableCell className="TableHeadFormat" align="center">Orderid</TableCell>
                        <TableCell className="TableHeadFormat" align="center">Product Type</TableCell>
                        <TableCell  className="TableHeadFormat" align="center">Type</TableCell>
                        <TableCell  className="TableHeadFormat" align="center">Instrument</TableCell>

                        <TableCell className="TableHeadFormat" align="center">Qty </TableCell>
                        

                        {/* <TableCell align="center">Lob</TableCell> */}
                        {/* <TableCell align="center">Section</TableCell> */}
                        <TableCell  className="TableHeadFormat" align="center">Price</TableCell>
                        {/* <TableCell align="center">Category</TableCell> */}
                        <TableCell  className="TableHeadFormat"   align="center">Status</TableCell>

                        <TableCell className="TableHeadFormat" align="center">Update time</TableCell>

                      

                    </TableRow>
                </TableHead>
                <TableBody style={{width:"",whiteSpace: "nowrap"}}>
            

                    {this.state.oderbookData && this.state.oderbookData ? this.state.oderbookData.map(row => (
                        <TableRow key={row.productId} >

                            {/* <TableCell align="center"> <img style={{width:"100px", height:"50px"}} src={row.imageURL} /> </TableCell> */}
                            <TableCell align="center">{row.orderid}</TableCell>
                            <TableCell align="center">{row.tradingsymbol}</TableCell>
                            <TableCell align="center">{row.transactiontype}</TableCell>
                            
                            <TableCell align="center">{row.producttype}</TableCell>
                            <TableCell align="center">{row.fillsize}</TableCell>
                            {/* <TableCell align="center">{row.lob}</TableCell> */}
                            {/* <TableCell align="center">{row.section}</TableCell> */}
                            <TableCell align="center">{row.price}</TableCell>
                            <TableCell align="center">{row.orderstatus}</TableCell>
                            {/* <TableCell align="center">{row.category}</TableCell> */}
                             <TableCell align="center">{row.filltime ? new Date(row.filltime).toString().substring(0, 25) : ""}</TableCell>

                            
                        </TableRow>
                    )):<Spinner/>}
                </TableBody>
            </Table>

            </Paper>
            </React.Fragment> 
        )
    }
  
}

const styles = {
    tableStyle : {
        display: 'flex',
        justifyContent: 'center'
    },
    selectStyle:{
        // minWidth: '100%',
         marginBottom: '0px',
          minWidth: 300,
          maxWidth: 300,
    }
}

const mapStateToProps=(state)=>{
    return {packs:state.packs.packs.data};
}

//export default connect(mapStateToProps,{setPackLoaded})(BaneerList);
export default TradeBook;