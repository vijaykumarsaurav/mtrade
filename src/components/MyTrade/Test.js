import React from "react";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import AdminService from "../service/AdminService";
import {resolveResponse} from "../../utils/ResponseHandler";
import * as moment from 'moment';
export default class Example extends React.Component {
  constructor(props) {
    super(props)
  //  this.handleKeyDown = this.handleKeyDown.bind(this)
    this.state = {
      cursor: 0,
      
    }
  }


  componentDidMount(){



  //   {
  //     "token": "67795",
  //     "symbol": "SBIN27JAN22FUT",
  //     "name": "SBIN",
  //     "expiry": "27JAN2022",
  //     "strike": "-1.000000",
  //     "lotsize": "1500",
  //     "instrumenttype": "FUTSTK",
  //     "exch_seg": "NFO",
  //     "tick_size": "5.000000"
  // }


  // "token": "52264",
  // "symbol": "NIFTY27JAN22FUT",
  // "name": "NIFTY",
  // "expiry": "27JAN2022",
  // "strike": "-1.000000",
  // "lotsize": "50",
  // "instrumenttype": "FUTIDX",
  // "exch_seg": "NFO",
  // "tick_size": "5.000000"


    var dataltp = {
      "exchange": "NSE",
      "tradingsymbol": 'NIFTY27JAN22FUT',
      "symboltoken": 52264,
    }

    AdminService.getLTP(dataltp).then(res => {
      console.log(res)
    })

    const format1 = "YYYY-MM-DD HH:mm";
    var beginningTime = moment('9:15am', 'h:mma').format(format1);
    var time = moment.duration("100:00:00");  //22:00:00" for last day  2hours  timeDuration
    var startDate = moment(new Date()).subtract(time);

    var data = {
          "exchange": 'NSE',
          "symboltoken": 67795,
          "interval": 'FIFTEEN_MINUTE',  // THIRTY_MINUTE
          "fromdate": moment(startDate).format(format1),
          "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
      }

      AdminService.getHistoryData(data).then(res => {

      }); 

  }

  render() {
    const { cursor } = this.state

    return (
      <Container>
                 

      </Container>
    )
  }
}



