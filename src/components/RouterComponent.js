import { HashRouter as Router, Route, Switch , Redirect} from 'react-router-dom'
import React from "react";
import LoginComponent from "./login/LoginComponent";
import Report from "./report/Report";
import VerifyDocs from "./expriment/VerifyDocs";
import RechargePack from "./rechargepack/RechargePack";
import RechargePackAdd from "./rechargepack/RechargePackAdd";
import AddBanner from "./banner/BannerAdd";
import BannerEdit from "./banner/BannerEdit";



import EditRechargePack from "./rechargepack/EditRechargePack";

import VerifyList from './verify/VerifyList';
import VerifyEdit from './verify/VerifyEdit';
//data entry
import DataEntryList from './dataentry/DataEntryList';
import DataEntryEdit from './dataentry/DataEntryEdit';
//data entry
import DistributerList from './distributer/DistributerList';
import BaneerList from './banner/BannerList';
import BaneerListAdd from './banner/BaneerListAdd';
import BackOffice from './backoffice/BackOffice';
import OfferUpload from './backoffice/OfferUpload';
import AdminWelcome from './login/AdminWelcome';
import RoleManagement from './login/RoleManagement';



import Test from './expriment/Test';


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
                    <Route path="/add-banner" component={AddBanner} />
                    <Route path="/banner-edit" component={BannerEdit} />

                    <Route path="/packs" component={RechargePack} />
                    <Route path="/packadd" component={RechargePackAdd} />
                    <Route path="/editpacks" component={EditRechargePack} />
                    
                    <Route path="/backoffice" component={BackOffice} />
                    <Route path="/offerupload" component={OfferUpload} />

                    <Route path="/report" component={Report} />
                    <Route path="/welcome" component={AdminWelcome} />

                    <Route path="/role" component={RoleManagement} />

                    
                    <Route path="/test" component={Test} />
                    <Route path="*" component={LoginComponent} />

                    {/* <Route render={() => <Redirect to={{pathname: "/"}} />} /> */}
                    
                </Switch>
            </Router>
        </React.Fragment>
    )
}

export default AppRouter;