import { HashRouter as Router, Route, Switch} from 'react-router-dom'
import React from "react";
import LoginComponent from "./login/LoginComponent";

import Home from './MyTrade/Home';

// import NiftyView from "./MyTrade/NiftyView";
//import BankNiftyView from "./MyTrade/BankNiftyView";

import MySectorTop from "./MyTrade/MySectorTop";

import Chart from "./MyTrade/Chart";
import CandleChart from "./MyTrade/CandleChart";


import Funds from "./MyTrade/Funds";
import Orderbook from "./MyTrade/Orderbook";
import Tradebook from "./MyTrade/Tradebook";
// import LiveFeed from "./MyTrade/LiveFeed";
import OrderStatusLive from "./MyTrade/OrderStatusLive";
import Position from "./MyTrade/Position";

import AddToWatchlist from "./MyTrade/AddToWatchlist";
import SectorHeatMap from "./MyTrade/SectorHeatMap";
import FindFastMovement from "./MyTrade/FindFastMovement";


const AppRouter = () => {

    return(
        <React.Fragment>
            <Router>
                <Switch>
                    <Route path="/" exact component={LoginComponent}/>
                    <Route path="/login" component={LoginComponent}/>
                    {/* <Route path="/nifty-view" component={NiftyView}/> */}
                    {/* <Route path="/bn-view" component={BankNiftyView}/> */}
                    <Route path="/sector" component={MySectorTop}/>
                    <Route path="/chart" component={Chart}/>
                    <Route path="/candle-chart" component={CandleChart}/>

                    <Route path="/home" component={Home}/>
                    <Route path="/funds" component={Funds}/>
                    <Route path="/order" component={Orderbook}/>
                    <Route path="/trade" component={Tradebook}/>
                    {/* <Route path="/livefeed" component={LiveFeed}/> */}
                    <Route path="/order-status-live" component={OrderStatusLive}/>
                    <Route path="/position" component={Position}/>
                    <Route path="/addtowatchlist" component={AddToWatchlist}/>
                    <Route path="/sector-heat-map" component={SectorHeatMap}/>
                    <Route path="/find-fast-movement" component={FindFastMovement}/>

           
                    <Route path="*" component={LoginComponent} />
                    
                </Switch>
            </Router>
        </React.Fragment>
    )
}

export default AppRouter;