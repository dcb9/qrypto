import { observable, action, computed } from 'mobx';
import { Insight } from 'qtumjs-wallet';
import { isUndefined } from 'lodash';

import { MESSAGE_TYPE } from '../../constants';

const INIT_VALUES = {
  networkIndex: 1,
  loggedInAccountName: undefined,
  info: undefined,
  qtumUSD: undefined,
};

export default class SessionStore {
  @observable public networkIndex: number = INIT_VALUES.networkIndex;
  @observable public loggedInAccountName?: string = INIT_VALUES.loggedInAccountName;
  @observable public info?: Insight.IGetInfo = INIT_VALUES.info;
  @computed public get qtumBalanceUSD() {
    return isUndefined(this.qtumUSD) ? 'Loading...' : `$${this.qtumUSD} USD`;
  }

  private qtumUSD?: number = INIT_VALUES.qtumUSD;

  constructor() {
    chrome.runtime.onMessage.addListener(this.handleMessage);
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_NETWORK_INDEX }, (response: any) => {
      if (response !== undefined) {
        this.networkIndex = response;
      }
    });
  }

  @action
  public init = () => {
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_LOGGED_IN_ACCOUNT_NAME }, (response: any) => {
      this.loggedInAccountName = response;
    });
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_WALLET_INFO }, (response: any) => this.info = response);
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_QTUM_USD }, (response: any) => this.qtumUSD = response);
  }

  @action
  private handleMessage = (request: any) => {
    switch (request.type) {
      case MESSAGE_TYPE.CHANGE_NETWORK_SUCCESS:
        this.networkIndex = request.networkIndex;
        break;
      case MESSAGE_TYPE.ACCOUNT_LOGIN_SUCCESS:
        this.init();
        break;
      case MESSAGE_TYPE.GET_WALLET_INFO_RETURN:
        this.info = request.info;
        break;
      case MESSAGE_TYPE.GET_QTUM_USD_RETURN:
        this.qtumUSD = request.qtumUSD;
        break;
      default:
        break;
    }
  }
}
