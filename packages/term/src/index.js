import React from 'react';
import { Tooltip } from '@material-ui/core';
import { Link } from 'react-router-dom';

export default function Term(props) {
  return (
    <Tooltip title={ props.popup } arrow={true}>
      <Link to={{ pathname: props.reference }}>
        <span className='term'>{ props.children }</span>
      </Link>
    </Tooltip>
  );
}
