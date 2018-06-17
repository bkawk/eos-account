import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import 'polymer-aes';
import 'polymer-bip39';
import 'polymer-scrypt';
// import 'polymer-backup';
import 'polymer-store';

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
      <polymer-backup id="backup"></polymer-backup>
      <polymer-store id="store"></polymer-store>

      <template is="dom-if" if="{{debug}}">
        <small>{{mnemonic}}</small></br>
        <small>{{seed}}</small></br>
        <small>{{encryptedKey}}</small></br>
        <small>{{error}}</small></br>
      </template>
    `;
  }
  static get properties() {
    return {
      password: {
        type: String,
        observer: "_unlockAccount"
      },
      debug: {
        type: Boolean,
        valiue: false,
      },
      mnemonic: {
        type: String,
        value: 'test'
      },
      seed: {
        type: String,
      },
      encryptedKey: {
        type: Object,
      },
      error: {
        type: String,
        notify: true,
        reflectToAttribute: true,
      },
    };
  }

  _createAcount(){
    const eosAccount = {  
      "meta":{  
          "version":"5.0.4",
          "extensionId":"",
          "lastVersion":"1.0.0"
      },
      "keychain":{  
          "keypairs":[],
          "identities":[],
          "permissions":[]
      },
      "settings":{  
          "networks":[],
          "hasEncryptionKey":true,
          "inactivityInterval":0,
          "language":"ENGLISH"
      },
      "histories":[],
      "hash":""
    }
    this.$.store.get('EOSAccount')
    .then((res) => {
      if(res === null){
        this.$.store.set('EOSAccount', JSON.stringify(eosAccount))
      } else if (res !== null){
        console.log('You have an acocunt already!')
      }
    })
  }

  _lockAccount(){
    console.log('called!!!')
    this.$.store.get('EOSAccount')
    .then((eosAccount) => {
      if(eosAccount!== null){
        this.$.bip39.mnemonicfromPassword(this.password)
        .then((data) => {
          let arr = JSON.parse(data)
          this.mnemonic = arr[0];
          this.seed = arr[1];
          return this.$.aes.encrypt(this.seed, eosAccount)
        })
        .then((data) => {
          this.encryptedKey = data;
          this.$.store.set('EOSAccount', data)
        })
        .catch((err) => {
          console.log('error!!!')
          this.error = err;
        })
      } else if (eosAccount !== null){
        console.log('not null!')
      }
    })
  }


  _unlockAccount(){
    this.$.store.get('EOSAccount')
    .then((eosAccount) => {
      if(eosAccount!== null){
        this.$.bip39.mnemonicfromPassword(this.password)
        .then((data) => {
          let arr = JSON.parse(data)
          this.mnemonic = arr[0];
          this.seed = arr[1];
          return this.$.aes.decrypt(this.seed, eosAccount)
        })        
        .then((eosAccount) => {
          this.$.store.set('EOSAccount', eosAccount)
        })
        .catch((err) => {
          this.error = err;
        })
      } else if (eosAccount !== null){
        console.log('not null!')
      }
    })
  }

  _backupAcount(){

    const eosAccount = {  
      "meta":{  
          "version":"5.0.4",
          "extensionId":"",
          "lastVersion":"1.0.0"
      },
      "keychain":{  
          "keypairs":[],
          "identities":[],
          "permissions":[]
      },
      "settings":{  
          "networks":[],
          "hasEncryptionKey":true,
          "inactivityInterval":0,
          "language":"ENGLISH"
      },
      "histories":[],
      "hash":""
    }

    this.$.store.get('EOSAccount')
    .then((res) => {
      if(res === null){
        this.$.bip39.mnemonicfromPassword(this.password)
        .then((data) => {
          let arr = JSON.parse(data)
          this.mnemonic = arr[0];
          this.seed = arr[1];
          return this.$.aes.encrypt(this.seed, eosAccount)
        })
        .then((data) => {
          this.encryptedKey = data;
          this.$.store.set('EOSAccount', this.encryptedKey)
          //return this.$.backup._backup('bloxador', this.encryptedKey, "keychain")
        })
        .catch((err) => {
          this.error = err;
        })
      } else if (res !== null){
        console.log('not null!')
      }
    })
  }

} window.customElements.define('eos-account', EosAccount);
