import { HashRouter as Router, Route, Switch} from 'react-router-dom'
import React from "react";
import LoginComponent from "./login/LoginComponent";

import Home from './MyTrade/Home';

import NiftyView from "./MyTrade/NiftyView";
import BankNiftyView from "./MyTrade/BankNiftyView";

import MySectorTop from "./MyTrade/MySectorTop";

import Chart from "./MyTrade/Chart";
import CandleChart from "./MyTrade/CandleChart";


import Funds from "./MyTrade/Funds";
import Orderbook from "./MyTrade/Orderbook";
import Tradebook from "./MyTrade/Tradebook";
// import LiveFeed from "./MyTrade/LiveFeed";
import OrderStatusLive from "./MyTrade/OrderStatusLive";
import Position from "./MyTrade/Position";
import PositionNew from "./MyTrade/PositionNew";

import Test from "./MyTrade/Test";


import AddToWatchlist from "./MyTrade/AddToWatchlist";
import SectorHeatMap from "./MyTrade/SectorHeatMap";
import SectorHeatMap2 from "./MyTrade/SectorHeatMap2";

import FindFastMovement from "./MyTrade/FindFastMovement";
import FindFastMovement2 from "./MyTrade/FindFastMovement2";
import FindFastMovement3 from "./MyTrade/FindFastMovement3";

import OrderWatchlist from "./MyTrade/OrderWatchlist";
import DeliveryData from "./MyTrade/DeliveryData";
import SlowMotion from "./MyTrade/SlowMotion";
import IndexCharts from "./MyTrade/IndexCharts";
import MarketDepth from "./MyTrade/MarketDepth";
import MarketDepthMobile from "./MyTrade/MarketDepthMobile";
import Backtest from "./MyTrade/Backtest";
import ChartinkBacktest from "./MyTrade/ChartinkBacktest";
import CustomBacktest from "./MyTrade/CustomBacktest";
import Track145Strategy from "./MyTrade/Track145Strategy";

import StrongCharts from "./MyTrade/StrongCharts";

import BackupHistory from "./MyTrade/BackupHistory";



const AppRouter = () => {

    return(
        <React.Fragment>
            <Router>
                <Switch>
                    <Route path="/" exact component={LoginComponent}/>
                    <Route path="/login" component={LoginComponent}/>
                    <Route path="/nifty-view" component={NiftyView}/>
                    <Route path="/bn-view" component={BankNiftyView}/>
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
                    <Route path="/position-new" component={PositionNew}/>

                    <Route path="/addtowatchlist" component={AddToWatchlist}/>
                    <Route path="/sector-heat-map" component={SectorHeatMap}/>
                    <Route path="/sector-heat-map2" component={SectorHeatMap2}/>


                    
                    <Route path="/find-fast-movement" component={FindFastMovement}/>
                    <Route path="/find-fast-movement2" component={FindFastMovement2}/>
                    <Route path="/find-fast-movement3" component={FindFastMovement3}/>

                    <Route path="/order-watchlist" component={OrderWatchlist}/>
                    <Route path="/delivery" component={DeliveryData}/>
                    <Route path="/slow-motion" component={SlowMotion}/>

                    <Route path="/index-charts" component={IndexCharts}/>
                    <Route path="/strong-charts" component={StrongCharts}/>

                    <Route path="/market-depth" component={MarketDepth}/>
                    <Route path="/market-depth-mobile" component={MarketDepthMobile}/>

                    <Route path="/backtest" component={Backtest}/>
                    <Route path="/chartink-backtest" component={ChartinkBacktest}/>

                    <Route path="/backup-history" component={BackupHistory}/>

                    <Route path="/custom-backtest" component={CustomBacktest}/>
                    <Route path="/track145" component={Track145Strategy}/>

                    <Route path="/test" component={Test}/>
                    
           
                    <Route path="*" component={LoginComponent} />
                    
                </Switch>
            </Router>
        </React.Fragment>
    )
}

export default AppRouter;