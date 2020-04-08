import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

const columns = [
  { id: 'Mobile', label: 'Mobile No.', minWidth: 170 },
  { id: 'NIC', label: 'NIC', minWidth: 100 },
  { id: 'Sim',label: 'Sim',minWidth: 170, },
  { id: 'PEF_Count', label: 'PEF Count', minWidth: 170, align: 'right', },
  { id: 'NIC_Count', label: 'NIC Count', minWidth: 170, align: 'right', },
  { id: 'Distributor', label: 'Distributor', minWidth: 170, align: 'right', format: value => value.toFixed(2),},
  { id: 'Zone', label: 'Zone', minWidth: 170, align: 'right', },
  { id: 'FTA_Date', label: 'FTA Date', minWidth: 150, },
  { id: 'Status', label: 'Status', minWidth: 170, align: 'right', },
  { id: 'Resubmit',  label: 'Resubmit',minWidth: 170, align: 'right',  },
  { id: 'Verify_Date', label: 'Verify Date', minWidth: 170, align: 'right',},
  { id: 'Submit_Date', label: 'Submit Date', minWidth: 170, },
  { id: 'Resubmit_Date', label: 'Resubmit Date', minWidth: 170, }
];

function createData(Mobile, NIC, Sim, PEF_Count, NIC_Count,Distributor,Zone,FTA_Date,Status,Resubmit,Verify_Date,Submit_Date,Resubmit_Date) {
  const density = 100 / 2;
  return { Mobile, NIC, Sim, PEF_Count, NIC_Count,Distributor,Zone,FTA_Date,Status,Resubmit,Verify_Date,Submit_Date,Resubmit_Date };
}

const rows = [
  createData('7204563432', '#908004', '8982982389DSF092834' , 1, 2,"UGC_DIS001", "West", "14-10-2019", "Summited","No", "14-10-2019 10:30:50", "14-10-2019 10:30:50", "14-10-2019 10:30:50"),
  createData('7204563432', '#908004', '8982982389DSF092834' , 1, 2,"UGC_DIS001", "West", "14-10-2019", "Summited","No", "14-10-2019 10:30:50", "14-10-2019 10:30:50", "14-10-2019 10:30:50"),
  createData('7204563432', '#908004', '8982982389DSF092834' , 1, 2,"UGC_DIS001", "West", "14-10-2019", "Summited","No", "14-10-2019 10:30:50", "14-10-2019 10:30:50", "14-10-2019 10:30:50"),
  createData('7204563432', '#908004', '8982982389DSF092834' , 1, 2,"UGC_DIS001", "West", "14-10-2019", "Summited","No", "14-10-2019 10:30:50", "14-10-2019 10:30:50", "14-10-2019 10:30:50"),
  createData('7204563432', '#908004', '8982982389DSF092834' , 1, 2,"UGC_DIS001", "West", "14-10-2019", "Summited","No", "14-10-2019 10:30:50", "14-10-2019 10:30:50", "14-10-2019 10:30:50"),
  createData('7204563432', '#908004', '8982982389DSF092834' , 1, 2,"UGC_DIS001", "West", "14-10-2019", "Summited","No", "14-10-2019 10:30:50", "14-10-2019 10:30:50", "14-10-2019 10:30:50"),
  createData('7204563432', '#908004', '8982982389DSF092834' , 1, 2,"UGC_DIS001", "West", "14-10-2019", "Summited","No", "14-10-2019 10:30:50", "14-10-2019 10:30:50", "14-10-2019 10:30:50"),
  createData('7204563432', '#908004', '8982982389DSF092834' , 1, 2,"UGC_DIS001", "West", "14-10-2019", "Summited","No", "14-10-2019 10:30:50", "14-10-2019 10:30:50", "14-10-2019 10:30:50"),
  createData('7204563432', '#908004', '8982982389DSF092834' , 1, 2,"UGC_DIS001", "West", "14-10-2019", "Summited","No", "14-10-2019 10:30:50", "14-10-2019 10:30:50", "14-10-2019 10:30:50"),
  createData('7204563432', '#908004', '8982982389DSF092834' , 1, 2,"UGC_DIS001", "West", "14-10-2019", "Summited","No", "14-10-2019 10:30:50", "14-10-2019 10:30:50", "14-10-2019 10:30:50"),

];



const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  tableWrapper: {
    maxHeight: 440,
    overflow: 'auto',
  },
});

export default function StickyHeadTable() {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

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
                <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                  {columns.map(column => {
                    const value = row[column.id];
                    return (
                      
                      <TableCell key={column.id} align={column.align}>
                        {column.format && typeof value === 'number' ? column.format(value) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
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
