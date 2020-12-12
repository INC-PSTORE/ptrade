/*
* App
*/

import AppBar from '@material-ui/core/AppBar';
import Divider from '@material-ui/core/Divider';
import Typography from "@material-ui/core/Typography";
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import IconButton from '@material-ui/core/IconButton';
import PersonIcon from '@material-ui/icons/Person';
import KeyIcon from '@material-ui/icons/VpnKey';
// import AdminPanelSettingIcon from '@material-ui/icons/AdminPanelSetting';
import { withStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import withWidth from '@material-ui/core/withWidth';
import NotFoundPage from 'containers/NotFoundPage/Loadable';
import TradePage from 'containers/Trades/Loadable';
import React from 'react';
import { connect } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import GlobalStyle from '../../global-styles';
import styles from './styles';
import { NavLink } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';

import {loadAccountsThunk, enableMetaMask, loadDeployedTokensThunk, enableWalletConnect} from './middlewares';

import { InfoDialog } from '../../components/info-dialog';
import { Loader } from '../../components/loader';

import {
  makeSelectETHAccount,
  makeSelectTempIncAccount,
  makeSelectPrivateIncAccount,
  makeSelectIsLoadWalletDone,
  makeSelectIsOpenedInfoDialog,
  makeSelectRequestings,
  makeSelectIsAccountInfoOpened,
  makeSelectDeployedTokens,
  makeSelectGeneratedETHAccFromIncAcc,
  makeSelectMetaMask,
  makeSelectRefreshingBalances,
  makeSelectOpenWalletList, makeSelectWalletConnect,
} from './selectors';

import {
  toggleInfoDialog,
  toggleAccountInfo,
  closeAccountInfo,
  openWalletList,
} from './actions';

import { ETH_PRIVATE_KEY_FIELD_NAME, INC_WALLET_FIELD_NAME, PSTORE_DOMAIN } from './constants';
import {KOVAN_CHAIN_ID, MAINNET_CHAIN_ID} from "../../common/constants";

/* eslint-disable react/prefer-stateless-function */
export class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.buildAppBar = this.buildAppBar.bind(this);
    this.closeInfoDialog = this.closeInfoDialog.bind(this);
    this.closeAccountInfo = this.closeAccountInfo.bind(this);
    this.toggleAccountInfo = this.toggleAccountInfo.bind(this);
    this.reloadBalances = this.reloadBalances.bind(this);
    this.handleListWalletClose = this.handleListWalletClose.bind(this);
    this.handleListWalletOpen = this.handleListWalletOpen.bind(this);

    let loadedWalletData = {};
    window.onmessage = function (e) {
      if (e.origin !== PSTORE_DOMAIN) {
        return;
      }
      try {
        const msg = JSON.parse(e.data);
        switch (msg.method) {
          case 'onReady':
            const receiver = document.getElementById('receiver').contentWindow;
            // const ethGetKeyPayload = JSON.stringify({ method: 'get', key: ETH_PRIVATE_KEY_FIELD_NAME });
            const incGetKeyPayload = JSON.stringify({ method: 'get', key: INC_WALLET_FIELD_NAME });
            if (receiver) {
              // receiver.postMessage(ethGetKeyPayload, '*');
              receiver.postMessage(incGetKeyPayload, '*');
            }
            break;

          case 'onReturnData':
            loadedWalletData[msg.key] = msg.value;
            if (Object.keys(loadedWalletData).length === 1) {
              props.onLoadAccounts(loadedWalletData);
            }
            break;

          default:
            break;
        }
      } catch (err) {
        console.log(`WARN: ${err}`);
      }
    };
  }

  reloadBalances() {
    const {onReloadBalances, generatedETHAccFromIncAcc} = this.props;
    onReloadBalances(generatedETHAccFromIncAcc.address);
  }

  closeAccountInfo() {
    this.props.onCloseAccountInfo();
  }

  toggleAccountInfo() {
    this.props.onToggleAccountInfo();
  }

  closeInfoDialog() {
    this.props.onToggleInfoDialog();
    window.location = PSTORE_DOMAIN;
  }

  handleListWalletOpen() {
    const {onOpenWalletList} = this.props;
    onOpenWalletList(true);
  }

  handleListWalletClose() {
    const {onOpenWalletList} = this.props;
    onOpenWalletList(false);
  }

  buildAppBar() {
    const {
      classes,
      isAccountInfoOpened,
      deployedTokens,
      generatedETHAccFromIncAcc,
      metaMask,
      isRefreshingBalances,
      isOpenWalletList,
      onConnectMetaMask,
      onConnectWalletConnect,
      walletConnect,
    } = this.props;
    const networkRequired = (metaMask.requiredMess || walletConnect.requiredMess) ? metaMask.requiredMess ? metaMask.requiredMess : walletConnect.requiredMess : "";
    return (
      <div>
        { networkRequired &&
        <div className={classes.metaMaskMess}>
          <Typography style={{color: 'white', marginLeft: '10px'}}>{networkRequired}</Typography>
        </div>
        }
        <AppBar position="static" className={classes.appBar}>
          <Toolbar>
            <IconButton className={classes.homeLogo} aria-label="logo">
              <NavLink className={classes.homeLink} exact to="/">
                <img alt={"unicorn_logo"} style={{width: "50px", height:"50px", marginTop:"-18%"}} src={"https://app.uniswap.org/static/media/logo_white.bc1aa183.svg"} />
              </NavLink>
            </IconButton>
          </Toolbar>
          <IconButton
            className={classes.accountLogo}
            aria-label="logo"
            buttonRef={node => {
              this.anchorEl = node;
            }}
            aria-owns={isAccountInfoOpened ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            onClick={this.toggleAccountInfo}
          >
            <PersonIcon />
          </IconButton>
          <Popper open={isAccountInfoOpened} anchorEl={this.anchorEl} transition disablePortal className={classes.accountInfo}>
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                id="menu-list-grow"
                style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={this.closeAccountInfo}>
                    <MenuList>
                      <div className={classes.accountAddressSection}>
                        <Icon color="primary" className={classes.accountAddrIcon}>admin_panel_settings</Icon>
                        <Typography className={classes.accountAddress}>
                          {generatedETHAccFromIncAcc.address}
                        </Typography>
                      </div>
                      <Button onClick={this.reloadBalances} style={{marginLeft:"23%"}} variant="contained" color="primary">
                        Refresh Balances
                      </Button>
                      {deployedTokens.map(token => (
                        <MenuItem onClick={this.closeAccountInfo} key={token.tokenName} >
                          <div className={classes.coinInfo} >
                            <img src={token.icon} className={classes.icon} />
                            <div className={classes.coinName}>
                              {token.tokenName}:  {isRefreshingBalances ? <CircularProgress size={20} /> : token.deployedBalance}
                            </div>
                          </div>
                        </MenuItem>
                      ))}
                      <Divider />
                      <div className={classes.pstoreButtonWrapper}>
                        <Button color="primary" className={classes.pstoreButton} href={PSTORE_DOMAIN} >
                          GO pStore.App
                        </Button>
                      </div>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </AppBar>
        <div>
          <Dialog
            fullWidth={true}
            maxWidth={"sm"}
            open={isOpenWalletList}
            onClose={this.handleListWalletClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{"Choose a wallet"}</DialogTitle>
            <DialogContent>
              <List>
                <div className={classes.metaMaskSelect}>
                  <ListItem onClick={onConnectMetaMask} button>
                    <img alt={"metamask"} style={{width: '24px', height: '24px', marginRight: '10px'}}
                         src={require("../../images/metamask.png")}/><ListItemText primary="MetaMask"/>
                    { !window.ethereum &&
                    <Button href={"https://metamask.io"} color={"secondary"} target={"_blank"}>Install</Button>
                    }
                  </ListItem>
                  <Divider/>
                </div>
                <ListItem onClick={onConnectWalletConnect} button>
                  <img style={{marginRight: '10px'}} alt={"walletConnect"} src={require("../../images/walletConnectIcon.svg")}/><ListItemText
                  primary="WalletConnect"/>
                </ListItem>
              </List>
              <DialogActions>
                <Button onClick={this.handleListWalletClose} style={{marginLeft: 'auto'}}> Close </Button>
              </DialogActions>

            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  render() {
    const {
      isLoadWalletDone,
      isOpenedInfoDialog,
      requestings,
    } = this.props;

    if (!isLoadWalletDone) {
      return (
        <div>
          <Loader isActive={true} />
          <iframe id="receiver" src={`${PSTORE_DOMAIN}/shared-ls`} width="0" height="0">
            <p>Your browser does not support iframes.</p>
          </iframe>
        </div>
      );
    }

    if (isOpenedInfoDialog) {
      return (
        <div>
          <InfoDialog
            isOpenedDialog={isOpenedInfoDialog}
            message={"It looks like you have not had the required accounts yet, please navigate to pStore.App to create or import first."}
            onOk={this.closeInfoDialog}
          />
        </div>
      );
    }

    return (
      <BrowserRouter>
        <div style={styles.root}>
          {this.buildAppBar()}
          <Switch>
            <Route exact path="/" component={TradePage} />
            <Route component={NotFoundPage} />
          </Switch>
          {requestings > 0 &&
            <Loader isActive={true} />
          }
          <GlobalStyle />
        </div>
      </BrowserRouter>
    );
  }
}

export function mapDispatchToProps(dispatch) {
  return {
    onLoadAccounts: (loadedWalletData) => dispatch(loadAccountsThunk(loadedWalletData)),
    onToggleInfoDialog: () => dispatch(toggleInfoDialog()),
    onToggleAccountInfo: () => dispatch(toggleAccountInfo()),
    onCloseAccountInfo: () => dispatch(closeAccountInfo()),
    onConnectWalletConnect: () => dispatch(enableWalletConnect()),
    onConnectMetaMask: () => dispatch(enableMetaMask()),
    onReloadBalances: (generatedAddress) => dispatch(loadDeployedTokensThunk(generatedAddress)),
    onOpenWalletList: (isOpen) => dispatch(openWalletList(isOpen)),
  };
}

const mapStateToProps = createStructuredSelector({
  isAccountInfoOpened: makeSelectIsAccountInfoOpened(),
  isLoadWalletDone: makeSelectIsLoadWalletDone(),
  ethAccount: makeSelectETHAccount(),
  tempIncAccount: makeSelectTempIncAccount(),
  privateIncAccount: makeSelectPrivateIncAccount(),
  isOpenedInfoDialog: makeSelectIsOpenedInfoDialog(),
  requestings: makeSelectRequestings(),
  deployedTokens: makeSelectDeployedTokens(),
  generatedETHAccFromIncAcc: makeSelectGeneratedETHAccFromIncAcc(),
  metaMask: makeSelectMetaMask(),
  isRefreshingBalances: makeSelectRefreshingBalances(),
  isOpenWalletList: makeSelectOpenWalletList(),
  walletConnect: makeSelectWalletConnect(),
});

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

// const withReducer = injectReducer({ key: 'app', reducer });

const withStylesApp = withStyles(styles);
const withWidthApp = withWidth();

export default compose(
  // withReducer,
  withConnect,
  withStylesApp,
  withWidthApp,
)(App);
