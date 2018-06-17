import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import 'polymer-aes';
import 'polymer-bip39';
import 'polymer-scrypt';
import 'polymer-backup';
/**
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
        observer: "_createAcount"
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
    const bloxAccount = {  
      "meta":{  
          "version":"5.0.3",
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

    this.$.bip39.mnemonicfromPassword(this.password)
    .then((data) => {
      let arr = JSON.parse(data)
      this.mnemonic = arr[0];
      this.seed = arr[1];
      return this.$.aes.encrypt(this.seed, bloxAccount)
    })
    .then((data) => {
      this.encryptedKey = data;
      return this.$.backup._backup('bloxador', this.encryptedKey, "keychain")
    })
    .catch((err) => {
      this.error = err;
    })
  }

} window.customElements.define('eos-account', EosAccount);
