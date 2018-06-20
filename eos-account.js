import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import 'polymer-aes';
import 'polymer-bip39';
import 'polymer-backup';
import 'polymer-store';
import 'polymer-restore';
import 'eos-identity';

/*
 * `eos-account`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class EosAccount extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <polymer-bip39 id="bip39"></polymer-bip39>
      <polymer-aes id="aes"></polymer-aes>
      <polymer-store id="store"></polymer-store>
      <polymer-backup id="backup"></polymer-backup>
      <eos-identity id="identity"></eos-identity>

      <template is="dom-if" if="{{debug}}">
      Password: <input type="password" id="password" on-keyup="_changePassword" value="{{password}}"></br></br>
        <a href="#" on-click="_createAcount">Create Account</a></br></br>
        <a href="#" on-click="_createIdentity">Create Identity</a></br></br>
        <a href="#" on-click="_deleteAccount">Delete Account</a></br></br>
        <a href="#" on-click="_lockAccount">Lock Account</a></br></br>
        <a href="#" on-click="_unlockAccount">Unlock Account</a></br></br>
        <a href="#" on-click="_backupAcount">Backup Account</a></br></br>
        <polymer-restore id="restore" restore-data="{{restoreData}}"></polymer-restore></br></br>
        <small>{{error}}</small></br>
      </template>
    `;
  }
  static get properties() {
    return {
      password: {
        type: String,
      },
      debug: {
        type: Boolean,
        valiue: false,
      },
      error: {
        type: String,
        notify: true,
        reflectToAttribute: true,
      },
      restoreData: {
        type: String,
        observer: "_restoreAcount"
      },
      fileName: {
        type: String,
      },
      accountName: {
        type: String,
        value: 'name'
      },
    };
  }

  _createAcount(){
    this.createAcount(this.password, this.name)
    .catch((err) => {
      this.error = err;
    })
  }
  createAcount(password, name){
    return new Promise((resolve, reject) => {
      let eosAccount = {"meta":{"version":"5.0.4","extensionId":"","lastVersion":"1.0.0"},"keychain":{"keypairs":[],"identities":[],"permissions":[]},"settings":{"networks":[],"hasEncryptionKey":true,"inactivityInterval":0,"language":"ENGLISH"},"histories":[],"hash":""}
      this.state()
      .then((state) => {
        if(state !== 'none') throw 'account exists'
        return this.$.bip39.mnemonicfromPassword(password)
      })
      .then((mnemonic) => {
        eosAccount.hash = JSON.parse(mnemonic)[1];
        return this.$.store.set('EOSAccount', JSON.stringify(eosAccount));
      })
      .then(() => {
        this.createIdentity(password, name)
        resolve('created')
      })
      .catch((err) => {
        this.error = err;
        reject(this.error)
      })
    })
  }


  _createIdentity(){
    this.createIdentity(this.password, this.accountName)
    .catch((err) => {
      this.error = err;
    })
  }
  createIdentity(password, name){
    return new Promise((resolve, reject) => {
      this.state()
      .then((state) => {
        if(state !== 'unlocked') throw 'not unlocked'
        this.$.identity.createIdentity(this.password, 'name')
      })
    })
  }


  _lockAccount(){
    this.lockAccount(this.password)
    .catch((err) => {
      this.error = err;
    })
  }
  lockAccount(password){
    return new Promise((resolve, reject) => {
      this.state()
      .then((state) => {
        if(state !== 'unlocked')throw 'not unlocked'
        return this.checkPassword(password);
      })
      .then(() => {
        return Promise.all([this.$.bip39.mnemonicfromPassword(password), this.$.store.get('EOSAccount')])
      })
      .then((data) => {
        return this.$.aes.encrypt(JSON.parse(data[0])[1], JSON.parse(data[1]))
      })
      .then((data) => {
        this.$.store.set('EOSAccount', data)
        resolve('locked')
      })
      .catch((err) => {
        this.error = err;
        reject(this.error)
      })
    })
  }


  _unlockAccount(){
    this.unlockAccount(this.password)
    .catch((err) => {
      this.error = err;
    })
  }
  unlockAccount(password){
    return new Promise((resolve, reject) => {
      this.state()
      .then((state) => {
        if(state !== 'locked') throw 'unlocked'
        return Promise.all([this.$.bip39.mnemonicfromPassword(password), this.$.store.get('EOSAccount')])
      })
      .then((data) => {
        return this.$.aes.decrypt(JSON.parse(data[0])[1], data[1])
      })
      .then((eosAccount) => {
        this.$.store.set('EOSAccount', eosAccount)
        resolve('unlocked')
      })
      .catch((err) => {
        this.error = err;
        reject(this.error)
      })
    })
  }


  _deleteAccount(){
    this.deleteAccount(this.password)
    .catch((err) => {
      this.error = err;
    })
  }
  deleteAccount(password){
    return new Promise((resolve, reject) => {
      this.state()
      .then((state) => {
        if(state == 'locked') throw 'locked'
        return this.checkPassword(password);
      })
      .then(() => {
        return Promise.all([this.$.bip39.mnemonicfromPassword(password), this.$.store.get('EOSAccount')])
      })
      .then((data) => {
        this.$.store.delete('EOSAccount')
        resolve('deleted')
      })
      .catch((err) => {
        this.error = err;
        reject(this.error)
      })
    })
  }


  _restoreAcount(){
    this.restoreAcount(this.restoreData, this.password)
    .catch((err) => {
      this.error = err;
    })
  }
  restoreAcount(restoreData, password){
    return new Promise((resolve, reject) => {
      this.state()
      .then((state) => {
        if(state != 'none') throw 'account present'
        return this.$.store.set('EOSAccount', restoreData)
      })
      .then(() => {
        return this.unlockAccount(password)
      })
      .then((eosAccount) => {
        resolve('restored')
      })
      .catch((err) => {
        this.error = err;
        reject(this.error)
      })
    })
  }

  
  _backupAcount(){
    this.backupAcount(this.password)
    .catch((err) => {
      this.error = err;
    })
  }
  backupAcount(password){
    return new Promise((resolve, reject) => {
      this.state()
      .then((state) => {
        if(state == 'locked') throw 'locked'
        return this.checkPassword(password);
      })
      .then((data) => {
        return Promise.all([this.$.bip39.mnemonicfromPassword(password), this.$.store.get('EOSAccount')])
      })
      .then((data) => {
        return this.lockAccount(password)
      })
      .then(() => {
        return this.$.store.get('EOSAccount')
      })
      .then((data) => {
        this.$.backup._backup(this.fileName, data, "keychain")
        resolve('backed up')
      })
      .catch((err) => {
        this.error = err;
        reject(this.error)
      })
    })
  }


  _changePassword(e){
    const password = this.shadowRoot.querySelector('#password').value;
    this.password = password;
  }

  state(){
    return new Promise((resolve, reject) => {
      this.$.store.get('EOSAccount')
      .then((EOSAccount) => {
        EOSAccount = (JSON.parse(EOSAccount))
        if (EOSAccount && EOSAccount.meta) {
          this.accountState = 'unlocked'
          resolve('unlocked')
        } else if (EOSAccount && EOSAccount.iv) {
          this.accountState = 'locked'
          resolve('locked')
        } else {
          this.accountState = 'none'
          resolve('none')
        }
      })
      .catch((err) => {
        this.error = err;
        reject(this.error)
      })
    })
  }

  checkPassword(password){
    return new Promise((resolve, reject) => {
      this.state()
      .then((state) => {
        if(state !== 'unlocked')throw 'locked'
        return Promise.all([this.$.bip39.mnemonicfromPassword(password), this.$.store.get('EOSAccount')])
      })
      .then((data) => {
        const key = JSON.parse(data[0])[1];
        const account = JSON.parse(data[1]);
        const encryptedPrivateKey = account.keychain.identities[0].privateKey;
        return this.$.aes.decrypt(key, encryptedPrivateKey)
      })
      .then((data) => {
        resolve(true)
      })
      .catch((err) => {
        this.error = err;
        reject(this.error)
      })
    })
  }

} window.customElements.define('eos-account', EosAccount);
