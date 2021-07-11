import { HashRouter as Router, Route, Switch} from 'react-router-dom'
import React from "react";
import LoginComponent from "./login/LoginComponent";

import Home from './MyTrade/Home';

// import NiftyView from "./MyTrade/NiftyView";
//import BankNiftyView from "./MyTrade/BankNiftyView";

import MySectorTop from "./MyTrade/MySectorTop";

import Chart from "./MyTrade/Chart";

import Funds from "./MyTrade/Funds";
import Orderbook from "./MyTrade/Orderbook";
import Tradebook from "./MyTrade/Tradebook";
// import LiveFeed from "./MyTrade/LiveFeed";
import OrderStatusLive from "./MyTrade/OrderStatusLive";
import Position from "./MyTrade/Position";

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
                    <Route path="/home" component={Home}/>
                    <Route path="/funds" component={Funds}/>
                    <Route path="/order" component={Orderbook}/>
                    <Route path="/trade" component={Tradebook}/>
                    {/* <Route path="/livefeed" component={LiveFeed}/> */}
                    <Route path="/order-status-live" component={OrderStatusLive}/>
                    <Route path="/position" component={Position}/>
           
                    <Route path="*" component={LoginComponent} />
                    
                </Switch>
            </Router>
        </React.Fragment>
    )
}

export default AppRouter;