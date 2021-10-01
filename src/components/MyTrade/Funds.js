import React from "react";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import {connect} from "react-redux";
import {setPackLoaded} from "../../action";
import "./ViewStyle.css";
import PostLoginNavBar from "../PostLoginNavbar";
import AdminService from "../service/AdminService";
import {resolveResponse} from "../../utils/ResponseHandler";
import TradeConfig from './TradeConfig.json';

class MyView extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            products: [],
            stopnview:'', 
            curnewdata:'', 
            underlyingValue : '', 
            timestamp:'',
            totalCOI : 0,
            expiry: '', 
            strike:'',
            FilteredBY: '',
            AllspTotalOI:[],
            PEoi:0,
            CEoi:0,
            scrollcount : 0,
            
            //JSON.parse(localStorage.getItem('optionChainDataBN')).records.data



        }
//          this.findSupportResistence = this.findSupportResistence.bind(this);
            
    }

    onChange = (e) =>{
      this.setState({[e.target.name]: e.target.value}); 
      this.filterOptionChain(e.target.name,  e.target.value); 

    }
   
  
  
    componentDidMount() {

        AdminService.getFunds().then(fundsRes => {
            // console.log('profiledata', profileRes); 
               let fundsResData = resolveResponse(fundsRes);
             //  var fundsResData =  fundsRes && fundsRes.data; 
               if(fundsResData.status & fundsResData.message === 'SUCCESS'){
                this.setState({  fundData :fundsResData.data }); 
                localStorage.setItem("netCapital", fundsResData.data && fundsResData.data.net); 

               }
        })

    }
   
  
   toFixedAmount =(value) => {

    if(value){
      return  parseFloat(value).toFixed(2);
    }
   }

    render(){

      return(
        <React.Fragment>
            
            <PostLoginNavBar />
       
            <br/><br/><br/>
            
            <Grid   direction="row" container className="flexGrow" spacing={2}  style={{paddingLeft:"5px",paddingRight:"5px", justifyContent:'center'}}>
              
            
                <Grid id="tabledatachart"  item xs={8} sm={4}>
                <Paper style={{padding:"25px" }}>   

                <Typography variant="h6">
                 Net:   {this.state.fundData &&  this.toFixedAmount(this.state.fundData.net)}
                </Typography>
                <Typography variant="h6">
                   Available Cash :   {this.state.fundData &&  this.toFixedAmount(this.state.fundData.availablecash)}
                </Typography>
                <Typography variant="h6">
                Aailable Intraday payin :   {this.state.fundData && this.toFixedAmount(this.state.fundData.availableintradaypayin)}
                </Typography>
                <Typography variant="h6">
                Available limit margin :   {this.state.fundData &&  this.toFixedAmount(this.state.fundData.availablelimitmargin)}
                </Typography>
                <Typography variant="h6">
                Collateral :   {this.state.fundData && this.toFixedAmount(this.state.fundData.collateral)}
                </Typography>
              

                <Typography variant="h6">
                Utilised debits :   {this.state.fundData && this.toFixedAmount(this.state.fundData.utiliseddebits) }
                </Typography>
                <Typography variant="h6">
                Utilised exposure :   {this.state.fundData && this.toFixedAmount(this.state.fundData.utilisedexposure) }
                </Typography>
                <Typography variant="h6">
                Utilised holding sales :   {this.state.fundData && this.toFixedAmount(this.state.fundData.utilisedholdingsales)}
                </Typography>
             
                <Typography variant="h6">
                Utilised option premium :   {this.state.fundData && this.toFixedAmount(this.state.fundData.utilisedoptionpremium) }
                </Typography>
                <Typography variant="h6">
                Utilised payout :   {this.state.fundData && this.toFixedAmount(this.state.fundData.utilisedpayout) }
                </Typography>
                <Typography variant="h6">
                Utilised span :   {this.state.fundData && this.toFixedAmount(this.state.fundData.utilisedspan) }
                </Typography>


                <Typography variant="h6">
                Utilised turnover :   {this.state.fundData && this.toFixedAmount(this.state.fundData.utilisedturnover) }
                </Typography>
                </Paper>
                </Grid>
               


                <Grid id="tabledatachart"  item xs={4} sm={4}>
                <Paper style={{padding:"25px" }}>   
               
                <Typography variant="h6">
                    M2M Unrealized  :   {this.state.fundData && this.toFixedAmount(this.state.fundData.m2munrealized) }
                    </Typography>
                    
                    
                    <Typography variant="h6">
                    M2M Realized  :   {this.state.fundData && this.toFixedAmount(this.state.fundData.m2mrealized) }
                    </Typography>

                  
                    </Paper>

                </Grid>


                <Grid id="tabledatachart"  item xs={4} sm={4}>
                <Paper style={{padding:"25px" }}>   
               
                <Typography variant="h6">
                    Total Capital  :   {TradeConfig.totalCapital }
                    </Typography>
                    
                    
                    <Typography variant="h6">
                    Per Trade Exposure  :   {TradeConfig.perTradeExposurePer}% 
                    </Typography>

                    <Typography variant="h6">
                    Per Trade Exposure  :   {(TradeConfig.totalCapital * TradeConfig.perTradeExposurePer/100).toFixed(2)}
                    </Typography>

                    </Paper>

                </Grid>
               
              
                </Grid>
                   

                
           
          

            </React.Fragment> 
        )
    }

}

// const styles = {
//     tableStyle : {
//         display: 'flex',
//         justifyContent: 'center'
//     }, 
//     selectStyle:{
//         marginBottom: '0px',
//         minWidth: 240,
//         maxWidth: 240

//     }
  
// }

const mapStateToProps=(state)=>{
    return {packs:state.packs.packs.data};
}
export default connect(mapStateToProps,{setPackLoaded})(MyView);
