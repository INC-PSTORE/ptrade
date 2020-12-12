const styles =  theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100%',
    padding: 30,
    width: '100%',
  },
  paper: {
    width: "40%",
    display: 'flex',
    flexWrap: 'wrap',
    padding: '7%',
    flexDirection: 'column',
    alignItems: 'center',
    // minWidth: "100%",
    // minHeight: '80%',
    // color: theme.palette.text.secondary,
    // marginLeft: theme.spacing.unit * 1.5,
  },
  snackBar: {
    marginTop: "3%",
  },
  snackBarContent: {
    backgroundColor: "#f44336",
    color: "white",
  },
  snackBarContentSuccess: {
    backgroundColor: "#4caf50",
    color: "white",
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  '@media (max-width: 1320px)': {
    paper: {
      width: "60% !important",
    },
    incognitoTreasure: {
      width: "60% !important",
    }
  },
  '@media (max-width: 850px)': {
    root: {
      width: '100%',
      padding: 10,
    },
    paper: {
      width: "95%",
    },
    incognitoTreasure: {
      width: "75% !important",
    },
    incognitoTreasureImg: {
      height:"180px !important",
    },
    tokenLabel: {
      width: "350px !important",
    },
    slippage: {
      width: "350px !important",
    }
  },
  '@media (max-width: 698px)': {
    paper: {
      width: "100% !important",
    },
    tokenLabel: {
      width: "270px !important",
    },
    slippage: {
      width: "270px !important",
    },
    dialogContent: {
      height: "400px !important",
      width: "250px !important",
    },
    dialogTitle: {
      width: "250px !important",
    },
    incognitoTreasure: {
      width: "100% !important",
    },
    incognitoTreasureText: {
      width: '35%',
    },
    incognitoTreasureImg: {
      width: '65%',
      height:"130px !important",
    }
  },
  icon: {
    width: "24px",
    height: "24px",
    margin: "5%",
  },
  tokenLabel: {
    margin: "1%",
    width: "400px",
    height: "70px",
  },
  dialogTitle: {
    width: "400px",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  dialogContent: {
    width: "400px",
    height: "600px",
  },
  closeIcon: {
    marginLeft: 'auto',
  },
  slippage: {
    padding: "10px",
    width: '400px',
  },
  tradeButton: {
    width: '200px',
  },
  incognitoTreasure: {
    display: 'flex',
    flexDirection: 'row',
    width: '40%',
    height: '170px',
    alignItems: 'center',
    marginBottom: '5px',
  },
  incognitoTreasureText: {
    marginLeft: '20px',
    width: '55%',
  },
  incognitoTreasureImg: {
    width: '45%',
    height:"220px"
  }
});

export default styles;
