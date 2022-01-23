import React from "react";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import AdminService from "../service/AdminService";
import {resolveResponse} from "../../utils/ResponseHandler";
import * as moment from 'moment';

import worker_script from './worker';



export default class Example extends React.Component {
  constructor(props) {
    super(props)
  //  this.handleKeyDown = this.handleKeyDown.bind(this)
    this.state = {
      cursor: 0,
      
    }
  }


  componentDidMount(){





    // var dataltp = {
    //   "exchange": "NSE",
    //   "tradingsymbol": 'NIFTY27JAN22FUT',
    //   "symboltoken": 52264,
    // }

    // AdminService.getLTP(dataltp).then(res => {
    //   console.log(res)
    // })

    // const format1 = "YYYY-MM-DD HH:mm";
    // var beginningTime = moment('9:15am', 'h:mma').format(format1);
    // var time = moment.duration("100:00:00");  //22:00:00" for last day  2hours  timeDuration
    // var startDate = moment(new Date()).subtract(time);

    // var data = {
    //       "exchange": 'NSE',
    //       "symboltoken": 67795,
    //       "interval": 'FIFTEEN_MINUTE',  // THIRTY_MINUTE
    //       "fromdate": moment(startDate).format(format1),
    //       "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
    //   }

    //   AdminService.getHistoryData(data).then(res => {

    //   }); 


    var myWorker = new Worker(worker_script);
    myWorker.onmessage = (m) => {
        console.log("msg from worker: ", m.data);
    };

    myWorker.postMessage({arr:  [{name : "vijay"}], no : 10 });

  }

  render() {
    const { cursor } = this.state

    return (
      <Container>
                 

      </Container>
    )
  }
}



