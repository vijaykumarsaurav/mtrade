import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import ListSubheader from '@material-ui/core/ListSubheader';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';

import ReactPanZoom from "react-image-pan-zoom-rotate";

//import tileData from './tileData';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    width: 500,
    height: 450,
  },
  icon: {
    color: 'rgba(255, 255, 255, 0.54)',
  },
}));


/**
The example data is structured as follows:
 *
import image from 'path/to/image.jpg';
[etc...]
 *
const tileData = [
  {
    img: image,
    title: 'Image',
    author: 'author',
  },
  {
    [etc...]
  },
];
 */

 const tileData = [
   {
     img: 'https://www.immigrant-education.ca/wp-content/uploads/2017/09/DL-Sam-Sample-AB-DL-Face-V8b-Sam-Sample.jpg',
     title: 'Image1',
     author: 'author1',
   },
   {
    img: 'https://www.immigrant-education.ca/wp-content/uploads/2017/09/DL-Sam-Sample-AB-DL-Face-V8b-Sam-Sample.jpg',
    title: 'Image2',
    author: 'author2',
  },
  {
    img: 'https://www.immigrant-education.ca/wp-content/uploads/2017/09/DL-Sam-Sample-AB-DL-Face-V8b-Sam-Sample.jpg',
    title: 'Image2',
    author: 'author2',
  },
  {
    img: 'https://www.immigrant-education.ca/wp-content/uploads/2017/09/DL-Sam-Sample-AB-DL-Face-V8b-Sam-Sample.jpg',
    title: 'Image2',
    author: 'author2',
  }
 ];

export default function TitlebarGridList() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <GridList cellHeight={180} className={classes.gridList}>
        <GridListTile key="Subheader" cols={2} style={{ height: 'auto' }}>
          <ListSubheader component="div">Documents</ListSubheader>
        </GridListTile>
        {tileData.map(tile => (
          <GridListTile key={tile.img}>
            {/* <img src={tile.img} alt={tile.title} /> */}
            <ReactPanZoom image={tile.img} alt={tile.title}/>

            <GridListTileBar
              title={tile.title}
              subtitle={<span>by: {tile.author}</span>}
              actionIcon={
                <IconButton aria-label={`info about ${tile.title}`} className={classes.icon}>
                  <InfoIcon />
                </IconButton>
              }
            />
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
}
