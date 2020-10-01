import React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from '@material-ui/core';

export default Term = (props) => {
  return (
    <Tooltip title={props.popup} arrow={true}>
      <Link to={props.reference}>
        <span className='term'>{props.children}</span>
      </Link>
    </Tooltip>
  );
}
