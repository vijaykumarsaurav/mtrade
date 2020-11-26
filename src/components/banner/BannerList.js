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

class BaneerList extends React.Component{

    constructor(props) {
        super(props);
        this.addProduct = this.addProduct.bind(this);
        this.editProduct = this.editProduct.bind(this);
        this.convertBool = this.convertBool.bind(this);
        this.zoneChange = this.zoneChange.bind(this);

        this.state = {
            products:[],
            listofzones:[],
            selectedZone:[],
            zone:'',
            selectAllzone:'Select All'

        }
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

    componentDidMount() {
        this.loadBannerList();
        localStorage.setItem("lastUrl","banners");
        if(JSON.parse(localStorage.getItem('cmsStaticData'))){
            this.setState({listofzones:  JSON.parse(localStorage.getItem('cmsStaticData')).zones});
          }
    }

    loadBannerList() {

        var data =  {
            "zones": this.state.selectedZone.length ? this.state.selectedZone : null
          }

        AdminService.getAllBanner(data)
            .then((res) => {
                let data = resolveResponse(res);
                console.log(data);

                if(data.result){
                    this.setState({products: data.result});
                }
            });
        //    var sampledata =  {"status":200,"message":"ok","result":[{"title":"title2","active":true,"order":1,"bannerType":"type1","lob":"prepaid","section":"one","categoryType":"Recharhe","category":"bonus","forAndroid":"true","forIos":"true","forWindows":"true","publishDay":12345678,"expireDay":1234566,"updateTime":"1234567","updateBy":"mansi","imageURL":"http://10.5.200.246:31424/visman//banner/title2_xyz.png","createdOn":null,"lastModifiedOn":null},{"title":"title3","active":true,"order":1,"bannerType":"type1","lob":"prepaid","section":"one","categoryType":"Recharhe","category":"bonus","forAndroid":"true","forIos":"true","forWindows":"true","publishDay":12345678,"expireDay":1234566,"updateTime":"1234567","updateBy":"mansi","imageURL":"http://10.5.200.246:31424/visman/banner/title3_xyz.png","createdOn":null,"lastModifiedOn":null},{"title":"title1","active":true,"order":1,"bannerType":"type1","lob":"prepaid","section":"one","categoryType":"Recharhe","category":"bonus","forAndroid":"true","forIos":"true","forWindows":"true","publishDay":12345678,"expireDay":1234566,"updateTime":"1234567","updateBy":"mansi","imageURL":"http://xyz.com","createdOn":null,"lastModifiedOn":null}]};
        //    this.setState({products: sampledata.result});
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
        console.log(this.props,"PROPS")

       
      return(
        <React.Fragment>
            <PostLoginNavBar/>



            <Paper style={{padding:"10px", overflow:"auto"}} >


            <Grid syt  container spacing={1}  direction="row" alignItems="center" container>
                            <Grid item xs={12} sm={6} >
                                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                    Banner Details
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
                                 {/* InputLabelProps={{ shrink: true }} */}
                                 <Button type="submit"  onClick={() => this.loadBannerList()} variant="contained"  style={{marginLeft: '20px'}} >Search</Button>
                            </Grid>
                            <Grid item xs={2} sm={2} alignItems="left"> 
                            <Button variant="contained" color="primary" onClick={() => this.addProduct()}>
                                Add Banner
                            </Button>      
                            </Grid>

                            
                </Grid>
            

            <Table  size="small"   aria-label="sticky table" >
                <TableHead style={{width:"",whiteSpace: "nowrap"}} variant="head">
                    <TableRow variant="head">
                          {/* <TableCell align="center">Edit</TableCell> */}


                        <TableCell align="center">Icon</TableCell>
                        <TableCell align="center">Title</TableCell>
                        <TableCell align="center">Banner Type</TableCell>
                        <TableCell align="center">Active</TableCell>
                        {/* <TableCell align="center">Lob</TableCell> */}
                        {/* <TableCell align="center">Section</TableCell> */}
                        <TableCell align="center">Category Type</TableCell>
                        {/* <TableCell align="center">Category</TableCell> */}
                        <TableCell align="center">Publish Date</TableCell>

                        <TableCell align="center">Expire Days</TableCell>

                      

                    </TableRow>
                </TableHead>
                <TableBody style={{width:"",whiteSpace: "nowrap"}}>
                
                    {this.state.products && this.state.products ? this.state.products.map(row => (
                        <TableRow key={row.productId} onClick={() => this.editProduct( row.id)}>

                            <TableCell align="center"> <img style={{width:"100px", height:"50px"}} src={row.imageURL} /> </TableCell>
                            <TableCell align="center">{row.title}</TableCell>
                            <TableCell align="center">{row.bannerType}</TableCell>
                            <TableCell align="center">{row.active ? 'Active' : "Inactive"}</TableCell>
                            {/* <TableCell align="center">{row.lob}</TableCell> */}
                            {/* <TableCell align="center">{row.section}</TableCell> */}
                            <TableCell align="center">{row.categoryType}</TableCell>
                            {/* <TableCell align="center">{row.category}</TableCell> */}
                             <TableCell align="center">{row.publishDate ? new Date(row.publishDate).toString().substring(0, 25) : ""}</TableCell>
                            <TableCell align="center">{row.expireDate ? new Date(row.expireDate).toString().substring(0, 25): ""}</TableCell>

                            
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
export default BaneerList;