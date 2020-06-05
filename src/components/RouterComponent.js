import { HashRouter as Router, Route, Switch , Redirect} from 'react-router-dom'
import React from "react";
import LoginComponent from "./login/LoginComponent";

import Report from "./report/Report";
//Baneer 
import BannerAdd from "./banner/BannerAdd";
import BannerEdit from "./banner/BannerEdit";

import VerifyList from './verify/VerifyList';
import VerifyEdit from './verify/VerifyEdit';
//data entry
import DataEntryList from './dataentry/DataEntryList';
import DataEntryEdit from './dataentry/DataEntryEdit';
//Distributer
import DistributerList from './distributer/DistributerList';

//Admin
import RechargePack from "./pack/RechargePack";
import RechargePackAdd from "./pack/RechargePackAdd";
import RechargePackEdit from "./pack/RechargePackEdit";
import BaneerList from './banner/BannerList';
import BackOffice from './backoffice/BackOffice';
import OfferUpload from './backoffice/OfferUpload';
import AdminWelcome from './login/AdminWelcome';
import RoleManagement from './login/RoleManagement';

import CurrentMSISDNStatus from './backoffice/CurrentMSISDNStatus';



const AppRouter = () => {

    return(
        <React.Fragment>
            <Router>
                <Switch>
                    <Route path="/" exact component={LoginComponent}/>
                    <Route path="/login" component={LoginComponent} />

                    <Route path="/verify" component={VerifyList} />
                    <Route path="/verify-edit" component={VerifyEdit} />

                    <Route path="/dataentry" component={DataEntryList} />
                    <Route path="/data-edit" replace component={DataEntryEdit} />

                    <Route path="/distributor" component={DistributerList} />

                    {/* admin dashboard */}
                    <Route path="/banners" component={BaneerList} />
                    <Route path="/banner-add" component={BannerAdd} />
                    <Route path="/banner-edit" component={BannerEdit} />

                    <Route path="/packs" component={RechargePack} />
                    <Route path="/pack-add" component={RechargePackAdd} />
                    <Route path="/pack-edit" component={RechargePackEdit} />
                    
                    <Route path="/backoffice" component={BackOffice} />
                    <Route path="/offerupload" component={OfferUpload} />

                    <Route path="/report" component={Report} />
                    <Route path="/welcome" component={AdminWelcome} />

                    <Route path="/role" component={RoleManagement} />

                    <Route path="/msisdn-status" component={CurrentMSISDNStatus} />

                    <Route path="*" component={LoginComponent} />

                    {/* <Route render={() => <Redirect to={{pathname: "/"}} />} /> */}
                    
                </Switch>
            </Router>
        </React.Fragment>
    )
}

export default AppRouter;