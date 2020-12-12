/*
* Trades Page
*/

import CloseIcon from '@material-ui/icons/Close';
import {withStyles} from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import React from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {createStructuredSelector} from 'reselect';
import reducer from './reducer';
import injectReducer from 'utils/injectReducer';
import styles from './styles';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import SwapVertIcon from '@material-ui/icons/SwapVert';
import SearchIcon from '@material-ui/icons/Search';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Snackbar from "@material-ui/core/Snackbar";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import Button from "@material-ui/core/Button";
import Modal from "@material-ui/core/Modal";
import {Typography} from "@material-ui/core";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import Slider from '@material-ui/core/Slider';


import {
  makeSelectETHAccount, makeSelectMetaMask, makeSelectWalletConnect,
} from '../App/selectors';
import {
  onChangeModal,
  onChangeTradeForm,
  onChangeSelectedDex,
  updateValidateForm,
} from './actions';
import {
  makeSelectTradeForm,
  makeSelectDexList,
  makeSelectedDex,
  makeSelectTokenList, makeSelectValidateForm, makeSelectFilter,
} from './selectors'

import {
  loadTokens,
  getExchangeRate, trade,
  getReservedPool,
} from './middlewares'
import {openWalletList} from "../App/actions";

let getPoolSizeInterval = null;
function valuetext(value) {
  return `${value}°C`;
}

/* eslint-disable react/prefer-stateless-function */
export class TradePage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.openModal1 = this.openModal1.bind(this);
    this.openModal2 = this.openModal2.bind(this);
    this.handleOpenModel = this.handleOpenModel.bind(this);
    this.swapTokenPosition = this.swapTokenPosition.bind(this);
    this.filterToken = this.filterToken.bind(this);
    this.slippageSelected = this.slippageSelected.bind(this);
    this.tradeHandler = this.tradeHandler.bind(this);
  }

  handleSnackbarClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }
    const {formValidate, onUpdateValidateForm} = this.props;
    if (formValidate.snackBar) {
      onUpdateValidateForm(null);
    }
  }

  handleClose = () => {
    const {tradeForm, updateModal} = this.props;
    if (tradeForm.selectToken1) {
      updateModal(1, false);
    }
    if (tradeForm.selectToken2) {
      updateModal(2, false);
    }
  };

  openModal1 = (event) => {
    this.handleOpenModel(1);
  }

  openModal2 = (event) => {
    this.handleOpenModel(2);
  }

  handleOpenModel = (modal) => {
    const {updateModal} = this.props;
    updateModal(modal, true);
  }

  handleInputAmount = (e) => {
    const {tradeForm, updateExchangeRate} = this.props;
    if (!isNaN(e.target.value) || e.target.value === '') {
      tradeForm.inputAmount = e.target.value;
      updateExchangeRate(tradeForm);
    }
  }

  swapTokenPosition = (e) => {
    const {tradeForm, updateTradeForm} = this.props;
    let tokenTemp = tradeForm.token1;
    tradeForm.token1 = tradeForm.token2;
    tradeForm.token2 = tokenTemp;
    tokenTemp = tradeForm.reserve1;
    tradeForm.reserve1 = tradeForm.reserve2;
    tradeForm.reserve2 = tokenTemp;
    tradeForm.inputAmount = 0;
    tradeForm.outputAmount = 0;
    updateTradeForm(tradeForm);
  }

  setSelectedToken = (token) => {
    const {tradeForm, updateTradeForm, updatePoolSize} = this.props;
    if (tradeForm.selectToken1) {
      tradeForm.token1 = token;
    } else if (tradeForm.selectToken2) {
      tradeForm.token2 = token;
    }
    this.handleClose();
    updateTradeForm(tradeForm);
    if (tradeForm.token1 && tradeForm.token2) {
      updatePoolSize();
    }
  }

  componentWillUnmount() {
    if (getPoolSizeInterval) {
      clearInterval(getPoolSizeInterval);
    }
    getPoolSizeInterval = null;
  }

  componentDidMount() {
    const {updateTokens, updatePoolSize} = this.props;
    updateTokens();
    getPoolSizeInterval = setInterval(updatePoolSize, 30000);
  }

  filterToken(token) {
    const {tradeForm, filter} = this.props;
    return !(tradeForm.token1 && tradeForm.token1.extTokenId === token.extTokenId) &&
      !(tradeForm.token2 && tradeForm.token2.extTokenId === token.extTokenId) &&
      (filter === '' || token.tokenName.toLowerCase().indexOf(filter.toLowerCase()) > -1)
  }

  slippageSelected(e) {
    const {tradeForm, updateTradeForm} = this.props;
    tradeForm.slippage = Number(e.target.ariaValueNow);
    updateTradeForm(tradeForm);
  }

  tradeHandler(e) {
    const {tradeForm, submitTrade} = this.props;
    submitTrade(tradeForm);
  }

  render() {
    const {
      classes,
      formValidate,
      tradeForm,
      tokenList,
      metaMask,
      walletConnect,
    } = this.props;

    let snackBarDisplay = classes.snackBarContent;
    if (formValidate && formValidate.snackBar && formValidate.snackBar.isSuccess) {
      snackBarDisplay = classes.snackBarContentSuccess;
    }

    const marks = [
      {
        value: 0,
        label: '0%',
      },
      {
        value: 1,
        label: '1%',
      },
      {
        value: 2,
        label: '2%',
      },
      {
        value: 3,
        label: '3%',
      }
    ];

    const handleListItemClick = (event, token) => {
      this.setSelectedToken(token);
    };

    return (
      <div className={classes.root}>
        {formValidate && formValidate.snackBar && (formValidate.snackBar.isError || formValidate.snackBar.isSuccess) &&
        <Snackbar
          className={classes.snackBar}
          ContentProps={{
            className: snackBarDisplay,
          }}
          open={(formValidate.snackBar.isError || formValidate.snackBar.isSuccess)}
          autoHideDuration={5000}
          message={formValidate.snackBar.message}
          onClose={this.handleSnackbarClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          action={
            <>
              <IconButton size="small" aria-label="close" color="inherit" onClick={this.handleSnackbarClose}>
                <CloseIcon fontSize="small"/>
              </IconButton>
            </>
          }
        />
        }

        <div className={classes.incognitoTreasure}>
          <div className={classes.incognitoTreasureText}>
            <h3>The treasure hunting has begun.</h3>
            <Button target={"blank"} href={"https://incognito.org/quest"} variant="contained"
                    style={{backgroundColor: 'black', color: 'white'}} >
              Check it out
            </Button>
          </div>
          <img className={classes.incognitoTreasureImg}
               src={"https://incognito-discourse.s3-us-west-2.amazonaws.com/original/2X/0/01aec2756c85762ecc22cbb62d67f83076d4547b.gif"}/>
        </div>

        {/* Display Trade table */}
        <Paper className={classes.paper}>
          <Typography>
            PTRADE
          </Typography>
          <FormControl variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">Input Amount</InputLabel>
            <OutlinedInput
              className={classes.tokenLabel}
              value={tradeForm.inputAmount}
              onChange={this.handleInputAmount}
              endAdornment={
                <InputAdornment position="end">
                  <Button variant="contained" onClick={this.openModal1}>
                    {tradeForm && tradeForm.token1 ? <>{tradeForm.token1.tokenName} <img className={classes.icon}
                                                                                         alt={"token logo"}
                                                                                         src={tradeForm.token1.icon}/></> : "Token"}
                    <KeyboardArrowDownIcon/>
                  </Button>
                </InputAdornment>
              }
              labelWidth={110}
            />
          </FormControl>

          <SwapVertIcon onClick={this.swapTokenPosition}/>

          <FormControl variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">Output Amount</InputLabel>
            <OutlinedInput
              className={classes.tokenLabel}
              value={tradeForm.outputAmount}
              readOnly={true}
              endAdornment={
                <InputAdornment position="end">
                  <Button variant="contained" onClick={this.openModal2}>
                    {tradeForm && tradeForm.token2 ? <>{tradeForm.token2.tokenName} <img className={classes.icon}
                                                                                         alt={"token logo"}
                                                                                         src={tradeForm.token2.icon}/></> : "Token"}
                    <KeyboardArrowDownIcon/>
                  </Button>
                </InputAdornment>
              }
              labelWidth={110}
            />
          </FormControl>

          <div className={classes.slippage}>
            <Typography style={{marginLeft: "auto"}} id="discrete-slider-always" gutterBottom>
              Slippage
            </Typography>
            <Slider
              defaultValue={1}
              max={3}
              getAriaValueText={valuetext}
              aria-labelledby="discrete-slider-always"
              step={0.1}
              marks={marks}
              valueLabelDisplay="on"
              onChange={this.slippageSelected}
            />
          </div>

          <Button onClick={this.tradeHandler} className={classes.tradeButton} variant="contained" color="secondary">
            {(metaMask.isMetaMaskEnabled || (walletConnect.connector && walletConnect.connector.connected)) ? 'TRADE' : 'Connect to wallet'}
          </Button>
        </Paper>

        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          className={classes.modal}
          open={!!(tradeForm.selectToken1 || tradeForm.selectToken2)}
          onClose={this.handleClose}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >

          <Dialog scroll={"paper"}
                  open={tradeForm.selectToken1 || tradeForm.selectToken2}
                  aria-labelledby="form-dialog-title"
          >
            <IconButton className={classes.closeIcon} size="small" aria-label="close" color="inherit"
                        onClick={this.handleClose}>
              <CloseIcon fontSize="small"/>
            </IconButton>
            <DialogTitle id="scroll-dialog-title" className={classes.dialogTitle}>
              <FormControl variant="outlined">
                <InputLabel htmlFor="outlined-adornment-password">Token Name</InputLabel>
                <OutlinedInput
                  id="search-token-by-name"
                  value={tradeForm.filter}
                  endAdornment={
                    <InputAdornment position="end">
                      <SearchIcon/>
                    </InputAdornment>
                  }
                  labelWidth={100}
                />
              </FormControl>
            </DialogTitle>
            <Divider/>
            <DialogContent className={classes.dialogContent}>
              <List component="nav" aria-label="secondary mailbox folder">
                {tokenList && tokenList.filter(this.filterToken).map((token) => (
                  <>
                    <ListItem
                      button
                      onClick={(event) => handleListItemClick(event, token)}
                    >
                      <ListItem> {token.tokenName} <img className={classes.icon} alt={"token logo"} src={token.icon}/>
                      </ListItem>
                    </ListItem>
                    <Divider/>
                  </>
                ))
                }
              </List>
            </DialogContent>
          </Dialog>
        </Modal>

      </div>
    );
  }
}

export function mapDispatchToProps(dispatch) {
  return {
    updateTradeForm: (tradeForm) => dispatch(onChangeTradeForm(tradeForm)),
    updateModal: (modal, value) => dispatch(onChangeModal(modal, value)),
    updateSelectedDex: (dex) => dispatch(onChangeSelectedDex(dex)),
    updateTokens: () => dispatch(loadTokens()),
    updateExchangeRate: (tradeForm) => dispatch(getExchangeRate(tradeForm)),
    updatePoolSize: (tradeForm) => dispatch(getReservedPool(tradeForm)),
    submitTrade: (tradeForm) => dispatch(trade(tradeForm)),
    onUpdateValidateForm: (validateForm) => dispatch(updateValidateForm(validateForm)),
    onOpenWalletList: (isOpen) => dispatch(openWalletList(isOpen)),
  }
}

const mapStateToProps = createStructuredSelector({
  tradeForm: makeSelectTradeForm(),
  dexList: makeSelectDexList(),
  dexSelected: makeSelectedDex(),
  tokenList: makeSelectTokenList(),
  formValidate: makeSelectValidateForm(),
  filter: makeSelectFilter(),
  metaMask: makeSelectMetaMask(),
  walletConnect: makeSelectWalletConnect(),
});

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({key: 'trade', reducer});

const withStylesTradePage = withStyles(styles);
const withWidthTradePage = withWidth();

export default compose(
  withReducer,
  withConnect,
  withStylesTradePage,
  withWidthTradePage,
)(TradePage);
