import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import VisibilityIcon from '@material-ui/icons/Visibility';


const columns = [
  { id: 'mobileNumber', label: 'Mobile No.', minWidth: 170 },
  { id: 'nic', label: 'NIC', minWidth: 100 },
  { id: 'sim',label: 'Sim',minWidth: 170, },
  { id: 'pefCount', label: 'PEF Count', minWidth: 170, align: 'right', },
  { id: 'nicCount', label: 'NIC Count', minWidth: 170, align: 'right', },
  { id: 'distributer', label: 'Distributor', minWidth: 170, align: 'right', format: value => value.toFixed(2),},
  { id: 'zone', label: 'Zone', minWidth: 170, align: 'right', },
  { id: 'ftaDate', label: 'FTA Date', minWidth: 150, },
  { id: 'status', label: 'Status', minWidth: 170, align: 'right', },
  { id: 'resubmit',  label: 'Resubmit',minWidth: 170, align: 'right',  },
  { id: 'verifiedDate', label: 'Verify Date', minWidth: 170, align: 'right',},
  { id: 'submitDate', label: 'Submit Date', minWidth: 170, },
  { id: 'resubmitDate', label: 'Resubmit Date', minWidth: 170, }
];

// function createData(Mobile, NIC, Sim, PEF_Count, NIC_Count,Distributor,Zone,FTA_Date,Status,Resubmit,Verify_Date,Submit_Date,Resubmit_Date) {
//   const density = 100 / 2;
//   return { Mobile, NIC, Sim, PEF_Count, NIC_Count,Distributor,Zone,FTA_Date,Status,Resubmit,Verify_Date,Submit_Date,Resubmit_Date };
// }

// const rows = [
//   createData('7204563432', '#908004', '8982982389DSF092834' , 1, 2,"UGC_DIS001", "West", "14-10-2019", "Summited","No", "14-10-2019 10:30:50", "14-10-2019 10:30:50", "14-10-2019 10:30:50"),
//   createData('7204563432', '#908004', '8982982389DSF092834' , 1, 2,"UGC_DIS001", "West", "14-10-2019", "Summited","No", "14-10-2019 10:30:50", "14-10-2019 10:30:50", "14-10-2019 10:30:50"),
//   createData('7204563432', '#908004', '8982982389DSF092834' , 1, 2,"UGC_DIS001", "West", "14-10-2019", "Summited","No", "14-10-2019 10:30:50", "14-10-2019 10:30:50", "14-10-2019 10:30:50"),
//   createData('7204563432', '#908004', '8982982389DSF092834' , 1, 2,"UGC_DIS001", "West", "14-10-2019", "Summited","No", "14-10-2019 10:30:50", "14-10-2019 10:30:50", "14-10-2019 10:30:50"),
//   createData('7204563432', '#908004', '8982982389DSF092834' , 1, 2,"UGC_DIS001", "West", "14-10-2019", "Summited","No", "14-10-2019 10:30:50", "14-10-2019 10:30:50", "14-10-2019 10:30:50"),
//   createData('7204563432', '#908004', '8982982389DSF092834' , 1, 2,"UGC_DIS001", "West", "14-10-2019", "Summited","No", "14-10-2019 10:30:50", "14-10-2019 10:30:50", "14-10-2019 10:30:50"),
//   createData('7204563432', '#908004', '8982982389DSF092834' , 1, 2,"UGC_DIS001", "West", "14-10-2019", "Summited","No", "14-10-2019 10:30:50", "14-10-2019 10:30:50", "14-10-2019 10:30:50"),
//   createData('7204563432', '#908004', '8982982389DSF092834' , 1, 2,"UGC_DIS001", "West", "14-10-2019", "Summited","No", "14-10-2019 10:30:50", "14-10-2019 10:30:50", "14-10-2019 10:30:50"),
//   createData('7204563432', '#908004', '8982982389DSF092834' , 1, 2,"UGC_DIS001", "West", "14-10-2019", "Summited","No", "14-10-2019 10:30:50", "14-10-2019 10:30:50", "14-10-2019 10:30:50"),
//   createData('7204563432', '#908004', '8982982389DSF092834' , 1, 2,"UGC_DIS001", "West", "14-10-2019", "Summited","No", "14-10-2019 10:30:50", "14-10-2019 10:30:50", "14-10-2019 10:30:50"),

// ];
//console.log("Row", rows);

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  tableWrapper: {
    maxHeight: 440,
    overflow: 'auto',
  },
});

export default function StickyHeadTable(props) {


  if(props.products)
  console.log("Vijay products",props);


  const rows = props.products; 

  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };


  // const editProduct = (productId) => {
  //   window.localStorage.setItem("selectedProductId", productId);
  //  // props.history.push('/edit-doc');
  // };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper className={classes.root}>
      <div className={classes.tableWrapper}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>


            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => {
              return (
                <>
                <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                       
                  {columns.map(column => {
                    const value = row[column.id];
                    return (
                      
                      <TableCell  onClick={() => props.someAction()} key={column.id} align={column.align}>
                        
                        {/* <VisibilityIcon/> */}
                        
                        {column.format && typeof value === 'number' ? column.format(value) : value}


                      </TableCell>
                    );
                  })}
                </TableRow>

                </>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        backIconButtonProps={{
          'aria-label': 'previous page',
        }}
        nextIconButtonProps={{
          'aria-label': 'next page',
        }}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
