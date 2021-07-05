import React from "react";
import { Tooltip } from "@material-ui/core";
import { Link } from "react-router-dom";
import useBaseUrl from '@docusaurus/useBaseUrl';
import {makeStyles} from "@material-ui/core/styles";

const popupStyle = {
  fontSize: "14px",
};
const textStyle = {
  fontWeight: "bold",
};

const useStyles = makeStyles((theme) => ({
    videoPopup: {
        maxWidth: '50vw',
    },
}));

export default function Term(props) {
    const classes = useStyles();

    let video = <span/>;

    if(props.video != '')
    {
        video =  <video style={{maxWidth: '50vw'}} src={useBaseUrl(props.video)} playsInline autoPlay muted loop />;
    }

    //<span style={popupStyle}>{props.popup}</span>
    const title = <><span style={popupStyle}>{props.popup}</span><div>{video}</div></>;

  return (
    <Tooltip interactive leaveDelay={500} title={title} arrow={true} classes={{ tooltip: classes.videoPopup }}>
      <Link to={{ pathname: props.reference }}>
        <span style={textStyle}>
            {props.children}
        </span>
      </Link>
    </Tooltip>
  );
}
