import { observable, action } from 'mobx';

import { MESSAGE_TYPE } from '../../../constants';
import QryNetwork from '../../../models/QryNetwork';
import AppStore from '../AppStore';

const INIT_VALUES = {
  settingsMenuAnchor: undefined,
};

export default class NavBarStore {
  @observable public networks: QryNetwork[] = [];
  @observable public settingsMenuAnchor?: string = INIT_VALUES.settingsMenuAnchor;

  private app: AppStore;

  constructor(app: AppStore) {
    this.app = app;
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_NETWORKS }, (response: any) => this.networks = response);
  }

  @action
  public reset = () => {
    Object.assign(this, INIT_VALUES);
  }

  @action
  public changeNetwork = (index: number) => {
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.CHANGE_NETWORK, networkIndex: index });
  }

  @action
  public routeToSettings = () => {
    this.reset();
    this.app.routerStore.push('/settings');
  }

  @action
  public logout = () => {
    this.reset();
    this.app.routerStore.push('/loading');
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.LOGOUT });
  }
}
