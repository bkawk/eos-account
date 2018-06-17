import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import 'polymer-aes';
import 'polymer-bip39';
import 'polymer-scrypt';
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
      <template is="dom-if" if="{{debug}}">
        <small>{{mnemonic}}</small></br>
        <small>{{seed}}</small></br>
        <small>{{privateKey}}</small></br>
        <small>{{publicKey}}</small></br>
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
      ecc: {
        type: Object,
      },
      privateKey: {
        type: String,
      },
      publicKey: {
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
          "websiteId":"bloxador.com",
          "lastVersion":"1.0.0"
      },
      "keychain":{  
          "keypairs":[  
    
          ],
          "identities":[  
            // {  
            //     "hash":"94ac218cff0d6043c4668f8b09fd32cf7d1382799d7657dd2cc7123c8924002d",
            //     "privateKey":"{\"iv\":\"Ns72+LCJ994wFNCEno/kwA==\",\"salt\":\"snaCZLUxW2U=\",\"ct\":\"aG4MvODCp657CtX7+vRdFd+g3QppAm7MrWKflZg2Cv6MuZDiHGa/cTAo6NwdAMxvIy3umzp5zlmGfy4=\"}",
            //     "publicKey":"EOS5RGMcX3rvGBdqANS4pBZVRGftYTz66ednfLR8mUwJpjmSGP219",
            //     "name":"RandomRabbit2062053",
            //     "accounts":{  
    
            //     },
            //     "personal":{  
            //       "firstname":"",
            //       "lastname":"",
            //       "email":"",
            //       "birthdate":""
            //     },
            //     "locations":[  
            //       {  
            //           "name":"Unnamed Location",
            //           "isDefault":false,
            //           "phone":"",
            //           "address":"",
            //           "city":"",
            //           "state":"",
            //           "country":"",
            //           "zipcode":""
            //       }
            //     ],
            //     "kyc":false,
            //     "ridl":-1
            // }
          ],
          "permissions":[  
    
          ]
      },
      "settings":{  
          "networks":[  
    
          ],
          "hasEncryptionKey":true,
          "inactivityInterval":0,
          "language":"ENGLISH"
      },
      "histories":[  
    
      ],
      "hash":"94ac218cff0d6043c4668f8b09fd32cf7d1382799d7657dd2cc7123c8924002d"
    }

    // this.ecc = eosjs_ecc;
    this.$.bip39.mnemonicfromPassword(this.password)
    .then((data) => {
      let arr = JSON.parse(data)
      this.mnemonic = arr[0];
      this.seed = arr[1];
      // this.privateKey = this.ecc.PrivateKey.fromSeed(this.seed).toWif()
      // this.publicKey = this.ecc.PrivateKey.fromWif(this.privateKey).toPublic().toString()
      // console.log(this.privateKey);
      // console.log(this.publicKey);
      return this.$.aes.encrypt(this.seed, bloxAccount)
    })
    .then((data) => {
      this.encryptedKey = data;
      this._save('bloxador', data)
    })
    .catch((err) => {
      this.error = err;
    })
  }

  _save(name, data) {
    const filename = `${name}_${+new Date()}.keychain`;
    const popup = window.document.createElement('a');
    popup.target = '_blank';
    popup.href = window.URL.createObjectURL(new Blob([data], {type: 'text/csv'}));
    popup.download = filename;
    document.body.appendChild(popup);
    popup.click();
    document.body.removeChild(popup);
}

} window.customElements.define('eos-account', EosAccount);
