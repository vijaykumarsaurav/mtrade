/* eslint-disable no-script-url */

import React from 'react';

export default function Hooks() {


const [page, setPage] = React.useState(0);
const [rowsPerPage, setRowsPerPage] = React.useState(5);


  const allhooks = {
    page : page, 
    setPage:setPage,
    rowsPerPage:rowsPerPage,
    setRowsPerPage:setRowsPerPage
  }

  return allhooks; 

}
