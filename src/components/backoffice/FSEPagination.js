import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';
import AdminService from "../service/AdminService";


import Button from "@material-ui/core/Button";
import Notify from "../../utils/Notify";
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import SearchIcon from '@material-ui/icons/Search';
import VisibilityIcon from '@material-ui/icons/Visibility';
import PostLoginNavBar from "../PostLoginNavbar";
import { Container } from "@material-ui/core";
import { resolveResponse } from "../../utils/ResponseHandler";
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Title from './Title';
import InputLabel from "@material-ui/core/InputLabel";
import { CRO_API_BASE_URL } from "../../utils/config";
import { CSVLink } from "react-csv";
import md5  from 'md5'; 
import  {DEV_PROTJECT_PATH} from "../../utils/config";
import MonthYearCalender from "./MonthYearCalender";


import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import $ from 'jquery'; 
import FSEPagination from "./FSEPagination";


import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from "@material-ui/core/Input";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}






function EnhancedTableHead(props) {
  const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  console.log('props', props);
 var headCells = []; 


  if(props.fse == 'false'){
   headCells = [
      { id: 'id', numeric: false, disablePadding: true, label: 'Select All' },
      { id: 'fseNumber', numeric: true, disablePadding: false, label: 'BDE/iFSE LAPU Number' },
      { id: 'retailerNumber', numeric: true, disablePadding: false, label: 'Location Name' },
      { id: 'retailerName', numeric: false, disablePadding: false, label: 'Location Address' },
      { id: 'latlong', numeric: true, disablePadding: false, label: 'Retailer Lat Long' },
      { id: 'campDate', numeric: false, disablePadding: false, label: 'Date of Camp (dd/mm/yyyy)' },
      { id: 'targetAcqCount', numeric: true, disablePadding: false, label: 'Target Acquisition' },
      { id: 'targetRechargeAmount', numeric: true, disablePadding: false, label: 'Target Recharge Count' },
      { id: 'targetRechargeCount', numeric: true, disablePadding: false, label: 'Target Recharge Amount' },
      { id: 'targetSimSwapCount', numeric: true, disablePadding: false, label: 'Target SIM Swap' },

    ];
  }else{
     headCells = [
      { id: 'id', numeric: false, disablePadding: true, label: 'Select All' },
      { id: 'fseNumber', numeric: true, disablePadding: false, label: 'Agent FSE LAPU Number' },
      { id: 'retailerNumber', numeric: true, disablePadding: false, label: 'Retailer Number' },
      { id: 'retailerName', numeric: false, disablePadding: false, label: 'Retailer Name' },
      { id: 'address', numeric: false, disablePadding: false, label: 'Retailer Address' },
      { id: 'latlong', numeric: true, disablePadding: false, label: 'Retailer Lat Long' },
      { id: 'campDate', numeric: false, disablePadding: false, label: 'Date of Camp (dd/mm/yyyy)' },
      { id: 'targetAcqCount', numeric: true, disablePadding: false, label: 'Target Acquisition' },
      { id: 'targetRechargeAmount', numeric: true, disablePadding: false, label: 'Target Recharge Count' },
      { id: 'targetRechargeCount', numeric: true, disablePadding: false, label: 'Target Recharge Amount' },
      { id: 'targetSimSwapCount', numeric: true, disablePadding: false, label: 'Target SIM Swap' },
    ];
  }

  console.log("test"); 
  //headCells=[];


  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: '1 1 100%',
  },
}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { numSelected } = props;

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          {numSelected} Camps Selected to delete
        </Typography>
      ) : (<>
        <Typography className={classes.title}  variant="body1" id="tableTitle" component="div">
            Select checkbox to delete camps
        </Typography>
        </>


      )}

      {numSelected > 0 ? (
        <Tooltip onClick={props.deleteMethod} title="Delete">
          <IconButton aria-label="delete">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton aria-label="filter list">
            {/* <FilterListIcon /> */}
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

const handleDelete = (event, newPage) => {
 
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

export default function EnhancedTable(props) {
  const classes = useStyles();
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };


  const [values, setValues] = React.useState({
    allSelected : ''
  });


  console.log('propsprops', props); 
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = props.fscData.fscDetails.map((n) => n.id);
      setSelected(newSelecteds);
      //allSelected = newSelecteds; 
      setValues({ ...values, ['allSelected']: newSelecteds  });

     // allSelected.push(newSelecteds); 

      props.fscData.selectDeletedItem(newSelecteds);

      return;
    }
    
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
   // allSelected.push(newSelected); 
    setValues({ ...values, ['allSelected']: newSelected  });

    props.fscData.selectDeletedItem(newSelected);
   

  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };


  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;
  
  const backtoNormal = (event) => {

  

    
    const data = {
      campIdList :values.allSelected
    }
  
    AdminService.deleteFse(data).then(res => {
        resolveResponse(res,'');
      
        Notify.showSuccess("Deleted successfully.");
        props.fscData.searchFse();
        setSelected([]);
    });

  
  };


  const emptyRows = rowsPerPage - Math.min(rowsPerPage, props.fscData.count - page * rowsPerPage);

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar numSelected={selected.length} deleteMethod={backtoNormal}/>
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
            align="left"
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={props.fscData && props.fscData && props.fscData.count}
              fse={props.fscData.fse}

            />
            <TableBody>
              {stableSort(props.fscData.fscDetails, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${row.id}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                      
                      <TableCell component="th" id={labelId} scope="row" padding="none">
                        {/* {row.id} */}
                      </TableCell>



                      {props.fscData.fse == 'true'? <TableCell align="center">{row.fseNumber}</TableCell> : "" }
                     
                      <TableCell align="center">{row.retailerNumber}{row.lapuNumber}</TableCell>
                      <TableCell align="center">{row.retailerName}{row.locationName}  </TableCell>

                      <TableCell align="center">{row.address}</TableCell>
                      <TableCell align="center">{row.latlong}</TableCell>
                      <TableCell align="center">{row.campDate}</TableCell>

                      <TableCell align="center">{row.targetAcqCount}</TableCell>
                      <TableCell align="center">{row.targetRechargeAmount}</TableCell>
                      <TableCell align="center">{row.targetRechargeCount}</TableCell>
                      <TableCell align="center">{row.targetSimSwapCount}</TableCell>
                     
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={props.fscData && props.fscData.count ? props.fscData.count : 0 }
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      />
    </div>
  );
}

const styles = {
  tableStyle : {
      display: 'flex',
      justifyContent: 'left'
  },
  tableRow: {
      hover: {
          "&:hover": {
              background: 'green !important',
          },
      },
  },
  selectStyle:{
      marginBottom: '0px',
      minWidth: 200,
      maxWidth: 340
  }
}
