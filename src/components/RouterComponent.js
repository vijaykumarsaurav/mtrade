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
import OfferUpload from './backoffice/OfferUpload';
import FSEUpload from './backoffice/FSEUpload';
import ReRegistration from './backoffice/ReRegistration';
import AdminWelcome from './login/AdminWelcome';
import ImageTest from './login/ImageTest';
import RoleManagement from './login/RoleManagement';

import CurrentMSISDNStatus from './backoffice/CurrentMSISDNStatus';
import MSISDNDocsView from './backoffice/MSISDNDocsView';

import ReportPOC from "./report/ReportPOC";


const AppRouter = () => {

    return(
        <React.Fragment>
            <Router>
                <Switch>
                    <Route path="/" exact component={LoginComponent}/>
                    <Route path="/login" component={LoginComponent}/>

                    <Route path="/verify" component={VerifyList}/>
                    <Route path="/resubmit-verify" component={ResubmitVerify}/>
                    <Route path="/verify-edit" component={VerifyEdit} />

                   
                    <Route path="/kyc" component={Kyc}/>
                    <Route path="/kyc-edit" component={KycEdit} />

                    <Route path="/ownership" component={Ownership}/>
                    <Route path="/ownership-edit" component={OwnershipEdit} />

                    <Route path="/ownership-dataentry" component={OwnershipDataentryList}/>
                    <Route path="/ownership-dataentry-edit" component={OwnershipDataentryEdit} />

                    <Route path="/disconnection" component={Disconnection}/>
                    <Route path="/disconnection-edit" component={DisconnectionEdit} />

                    <Route path="/kyc-dataentry" component={KycDataEntryList}/>
                    <Route path="/kyc-dataentry-edit" component={KycDataEntryEdit}/>

                    <Route path="/qva" component={QvaList}/>
                    <Route path="/qva-edit" component={QvaEdit}/>

                    <Route path="/dataentry" component={DataEntryList} />
                    <Route path="/resubmit-dataentry" component={ResubmitDataEntryList} />
                    <Route path="/data-edit" replace component={DataEntryEdit} />

                    <Route path="/distributor" component={DistributerList} />
                    <Route path="/dist-resubmit" component={DistResubmit} />

                    {/* admin dashboard */}
                    <Route path="/banners" component={BaneerList} />
                    <Route path="/banner-add" component={BannerAdd} />
                    <Route path="/banner-edit" component={BannerEdit} />

                    <Route path="/packs" component={RechargePack} />
                    <Route path="/pack-add" component={RechargePackAdd} />
                    <Route path="/pack-edit" component={RechargePackEdit} />
                    
                    <Route path="/backoffice" component={BackOffice} />
                    <Route path="/offerupload" component={OfferUpload} />
                    {/* <Route path="/fse" component={FSEUpload} /> */}
                    <Route path="/re-registration" component={ReRegistration} />


                    <Route path="/report" component={Report} />
                    <Route path="/welcome" component={AdminWelcome} />

                    <Route path="/role" component={RoleManagement} />

                    <Route path="/msisdn-status" component={CurrentMSISDNStatus} />
                    <Route path="/view-docs" component={MSISDNDocsView} />

                    
                    <Route path="/reportpoc" component={ReportPOC} />

                    {/* <Route path="/testreport" component={TestReport} /> */}

                    <Route path="/imageTest" component={ImageTest} />

                    <Route path="*" component={LoginComponent} />




                    {/* <Route render={() => <Redirect to={{pathname: "/"}} />} /> */}
                    
                </Switch>
            </Router>
        </React.Fragment>
    )
}

export default AppRouter;