import React from 'react';
import { Tooltip } from '@material-ui/core';

export default function Term(props) {
  return (
    <Tooltip title={props.popup} arrow={true}>
      <a href={props.reference}>
        <span className='term'>{props.children}</span>
      </a>
    </Tooltip>
  );
}
