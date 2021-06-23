import { HashRouter as Router, Route, Switch , Redirect} from 'react-router-dom'
import React from "react";
import LoginComponent from "./login/LoginComponent";

import Report from "./report/Report";

import TestReport from "./report/TestReport";

//Baneer 
import BannerAdd from "./banner/BannerAdd";
import BannerEdit from "./banner/BannerEdit";

//VA
import VerifyList from './verify/VerifyList';
import ResubmitVerify from './verify/ResubmitVerify';
import VerifyEdit from './verify/VerifyEdit';

//kyc 
import Kyc from './verify/Kyc';
import KycEdit from './verify/KycEdit';

//ownership
import Ownership from './verify/Ownership';
import OwnershipEdit from './verify/OwnershipEdit';

//disconnection
import Disconnection from './verify/Disconnection';
import DisconnectionEdit from './verify/DisconnectionEdit';

//QVA
import QvaList from './qva/QvaList';
import QvaEdit from './qva/QvaEdit';

//data entry
import DataEntryList from './dataentry/DataEntryList';
import ResubmitDataEntryList from './dataentry/ResubmitDataEntryList';

//kyc-dataentry
import KycDataEntryList from './dataentry/KycDataEntryList';
import KycDataEntryEdit from './dataentry/KycDataEntryEdit';

//ownership-dataentry
import OwnershipDataentryList from './dataentry/OwnershipDataentryList';
import OwnershipDataentryEdit from './dataentry/OwnershipDataentryEdit';

import DataEntryEdit from './dataentry/DataEntryEdit';
//Distributer
import DistributerList from './distributer/DistributerList';
import DistResubmit from './distributer/DistResubmit';


//Admin
import RechargePack from "./pack/RechargePack";
import RechargePackAdd from "./pack/RechargePackAdd";
import RechargePackEdit from "./pack/RechargePackEdit";
import BaneerList from './banner/BannerList';
import BackOffice from './backoffice/BackOffice';
import Dashboard from './backoffice/Dashboard';
import DashboardCamps from './backoffice/DashboardCamps';

import OfferUpload from './backoffice/OfferUpload';
import FSEUpload from './backoffice/FSEUpload';
import ReRegistration from './backoffice/ReRegistration';
import FTRMapping from './backoffice/FTRMapping';
import AdminWelcome from './login/AdminWelcome';
import ImageTest from './login/ImageTest';
import RoleManagement from './login/RoleManagement';

import CurrentMSISDNStatus from './backoffice/CurrentMSISDNStatus';
import MSISDNDocsView from './backoffice/MSISDNDocsView';



import MyView from "./pack/MyView";
import MyBNView from "./pack/MyBNView";

import MySectorTop from "./pack/MySectorTop";






import ReportPOC from "./report/ReportPOC";


const AppRouter = () => {

    return(
        <React.Fragment>
            <Router>
                <Switch>
                    <Route path="/" exact component={MyView}/>

                    <Route path="/login" component={LoginComponent}/>
                    <Route path="/bn-view" component={MyBNView}/>
                    <Route path="/sector" component={MySectorTop}/>

                    <Route path="*" component={LoginComponent} />


                    {/* <Route render={() => <Redirect to={{pathname: "/"}} />} /> */}
                    
                </Switch>
            </Router>
        </React.Fragment>
    )
}

export default AppRouter;