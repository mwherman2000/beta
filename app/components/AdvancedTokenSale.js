import React, { Component } from "react";
import { connect } from "react-redux";
import QRCode from "qrcode.react";
import { clipboard } from "electron";
import { shell } from "electron";
import { api, wallet, sc, rpc, u } from "@cityofzion/neon-js";
//import {api,wallet} from "neon-js";
import gdmLogo from "../img/gdm.png";
import ReactTooltip from "react-tooltip";
import gitsmLogo from "../img/gitsm.png";
import twitsmLogo from "../img/twitsm.png";
import neoLogo from "../img/neo.png";
import { ASSETS,TOKEN_SCRIPT,TOKEN_SCRIPT_TEST } from "../core/constants";
import asyncWrap from "../core/asyncHelper";
import { flatten } from 'lodash'
import {
    sendEvent,
    clearTransactionEvent,
    toggleAsset
} from "../modules/transactions";
import {oldMintTokens} from "../core/oldMintTokens";
import { Link } from "react-router";

let payment_method, token_script, amount;

const getLink = (net, address) => {
	let base;
	if (net === "MainNet") {
		base = "https://neotracker.io/address/";
	} else {
		base = "https://testnet.neotracker.io/address/";
	}
	return base + address;
};

const openExplorer = srcLink => {
	shell.openExternal(srcLink);
};

// Implement ICO for NEP5
//Checking validate Mint Tokens Inputs
const validateMintTokensInputs = (
	neoToMint,//Number
	gasToMint,//Number
	scriptHash,//string
	NEO,//Number
	GAS //Number
) => {
	let message;

	if (neoToMint < 0 || gasToMint < 0 || (neoToMint ===0 && gasToMint === 0)) {
        message = 'You must send positive amounts of NEO or GAS.';
		return [false,message];
	}

	if (neoToMint && parseFloat(neoToMint) !== parseInt(neoToMint)) {
        message = 'You cannot send fractional NEO to a token sale.';
        return [false, message];
	}

	if ((neoToMint && isNaN(neoToMint)) || (gasToMint && isNaN(gasToMint))) {
        message = 'Please enter valid numbers only';
        return [false, message];
	}

	if (neoToMint > NEO) {
        message = 'You do not have enough NEO to send.';
        return [false, message];
	}

	if (gasToMint > GAS) {
        message = 'You do not have enough GAS to send.';
        return [false, message];
	}

    if (
        scriptHash.slice(0, 1) !== '0x' &&
        scriptHash.length !== 42 &&
        scriptHash.length !== 40
    ) {
        message = 'Not a valid script hash.';
        return [false, message];
    }

    return [true, ''];
}

const participateInSaleEvent = (dispatch, wif, neo, gas, net, address) => {
	let neoToSend, gasToSend, scriptHash;
	if (payment_method.value === "NEO") {
		neoToSend = amount.value;
		gasToSend = '0';
	} else if (payment_method.value === "GAS") {
		neoToSend = '0';
		gasToSend = amount.value;
	} else {
		neoToSend = '0';
		gasToSend = '0';
	}

	console.log("neoToSend = " + neoToSend);
	console.log("gasTosend = " + gasToSend);
	if (token_script.value !== undefined || token_script.value !== '') {
		scriptHash = token_script.value;
	} else {
		dispatch(sendEvent(false,"Please select token!"));
	}

	console.log("scriptHash = " + scriptHash);
	participateInSale(
    	neoToSend,
		gasToSend,
		scriptHash,
		'0',
		dispatch,
		wif,
		null,
		neo,
		gas,
		net,
		address
	).then(success => {
		if (success) {
			dispatch(sendEvent(true,"Congratualtions. Token purchase was successful!"));
			return true;
		} else {
            dispatch(sendEvent(false,"Sorry. Your transaction failed. Please try again shortly."));
            return false;
		}
	})
}


const validateOldMintTokensInputs = (
    neoToMint,
    scriptHash,
    NEO,
    GAS
) => {
    let message

    if (neoToMint <= 0) {
        message = 'You must send a positive integer of NEO above 0.'
        return [false, message]
    }

    if (neoToMint && parseFloat(neoToMint) !== parseInt(neoToMint)) {
        message = 'You cannot send fractional NEO to a token sale.'
        return [false, message]
    }

    if (neoToMint && isNaN(neoToMint)) {
        message = 'Please enter valid numbers only'
        return [false, message]
    }

    if (neoToMint > NEO) {
        message = 'You do not have enough NEO to send.'
        return [false, message]
    }

    if (
        scriptHash.slice(0, 1) !== '0x' &&
        scriptHash.length !== 42 &&
        scriptHash.length !== 40
    ) {
        message = 'Not a valid script hash.'
        return [false, message]
    }

    return [true, '']
}

const oldParticipateInSaleEvent = (dispatch, wif, neo, gas, net, address) => {
    let neoToSend, gasToSend, scriptHash;
    if (payment_method.value === "NEO") {
        neoToSend = amount.value;
        gasToSend = '0';
    } else if (payment_method.value === "GAS") {
        neoToSend = '0';
        gasToSend = amount.value;
    } else {
        neoToSend = '0';
        gasToSend = '0';
    }

    console.log("token_script = "+ token_script)
    if (token_script.value !== undefined || token_script.value !== '') {
        scriptHash = token_script.value;
    } else {
        dispatch(sendEvent(false,"Please select token!"));
    }

    oldParticipateInSale(
    	neoToSend,
		scriptHash,
		'0',
		dispatch,
		wif,
		null,
		neo,
		gas,
		net,
		address
	).then(success => {
		if (success) {
            dispatch(sendEvent(true,"Congratulations. ICO tokens purchased successfully! Your balance will be updated shortly."));
            setTimeout(() => dispatch(clearTransactionEvent()), 5000);
        		return true;
		} else {
            dispatch(sendEvent(false,"Sorry, transaction failed. Please try again soon."));
            setTimeout(() => dispatch(clearTransactionEvent()), 3000);
        		return false;
		}
	})

}

const oldParticipateInSale = async(
	neoToSend,
	scriptHash,
	gasCost,
	dispatch,
	wif,
	publicKey,
	neo,
	gas,
	net,
	address
) => {
	const neoToMint = Number(neoToSend);
    const [isValid, message] = validateOldMintTokensInputs(
        neoToMint,
        scriptHash,
        neo,
        gas
    );

    if (!isValid) {
        dispatch(sendEvent(false,message));
        return false;
    }

    const _scriptHash =
        scriptHash.length === 40
            ? scriptHash
            : scriptHash.slice(2, scriptHash.length)

    const wifOrPublicKey = wif;
	const [error ,response] = await asyncWrap(
        oldMintTokens(
        	net,
			_scriptHash,
			wifOrPublicKey,
			neoToMint,
			0
		)
	)


    if (error || !response || !response.result) {
        return false
    }

    return true;

}

const participateInSale = async(
	neoToSend,//string
    gasToSend,//string
    scriptHash,//string
    gasCost,//string
    dispatch,
    wif,//string
    publicKey,//string
	neo,
    gas,
    net,
    address
) => {
	const account = new wallet.Account(wif);
	const neoToMint = Number(neoToSend);
	const gasToMint = Number(gasToSend);

	const [isValid, message] = validateMintTokensInputs(
		neoToMint,
		gasToMint,
		scriptHash,
		neo,
		gas
	);

	if(!isValid) {
		dispatch(sendEvent(false, message));
		return false;
	}

    const _scriptHash =
        scriptHash.length === 40
            ? scriptHash
            : scriptHash.slice(2, scriptHash.length);

    // let notificationId
    //
    // if (isHardwareLogin) {
    //     notificationId = dispatch(
    //         showInfoNotification({
    //             message: 'Please sign the transaction on your hardware device',
    //             autoDismiss: 0
    //         })
    //     )
    // } else {
    //     notificationId = dispatch(
    //         showInfoNotification({ message: 'Sending transaction', autoDismiss: 0 })
    //     )
    // }

    const scriptHashAddress = wallet.getAddressFromScriptHash(_scriptHash);
    console.log("scriptHashAddress = " + scriptHashAddress);
    const intents = [[ASSETS.NEO, neoToMint], [ASSETS.GAS, gasToMint]]
        .filter(([symbol, amount]) => amount > 0)
        .map(([symbol, amount]) =>
            api.makeIntent({ [symbol]: amount }, scriptHashAddress)
        );

    const script = {
        scriptHash: _scriptHash,
        operation: 'mintTokens',
        args: []
    };

    const config = {
        net,
        address,
        privateKey: account.privateKey,
        intents: flatten(intents),
        script,
        gas: 0,
        publicKey: null,
        signingFunction:  null
    };

    const [error, response] = await asyncWrap(api.doInvoke(config));
    console.log("error = " + JSON.stringify(error));
    console.log("token sale response = " + JSON.stringify(response));
    if (error !== null || error!== undefined || response === null || response === undefined
	|| response.response === null || response.response === undefined || response.response.result === false) {
        //dispatch(sendEvent(false,'Sale participation failed, please check your script hash again.'));
        return false
    }
	return true;
}

class TokenSale extends Component {
	render() {
		console.log(this.props.net);
		return (
			<div >

			<div className="dash-panel">
      <img
        src={neoLogo}
        alt=""
        width="38"
        className="neo-logo fadeInDown marg-right-10"
      />
      <h2>Advanced NEP5 Token Sale Options</h2>

			<div className="row ">
				<hr className="dash-hr-wide top-20" />
			</div>

			<div className="row top-20">
				<div className="col-xs-12">
				<p>Enter Tokes Sale Hashscript</p>
        		<input
				className="form-control-exchange"
				ref={node => (token_script = node)}
			   />
				</div>

				<div className="col-xs-4">
				<p>Select payment method</p>
				<select
				 name="select-profession"
				 id="select-profession"
				 placeholder="Enter Amount to send"
				 className=""
				 ref={node => (payment_method = node)}
				>
						<option selected disabled={true}>

						</option>
								<option value="NEO">
								NEO
								</option>
				</select>
				</div>

				<div className="col-xs-4">
				<p>Enter amount to send</p>
				<input
				className="form-control-exchange"
				ref={node => (amount = node)} />
				</div>

				<div className="col-xs-4">
				<button
				className="btn-send top-30"
				onClick={() => oldParticipateInSaleEvent(
					this.props.dispatch,
					this.props.wif,
					this.props.neo,
					this.props.gas,
					this.props.net,
					this.props.address
				)}
				>
					<span className="glyphicon glyphicon-send marg-right-5"/> Send Now
				</button>
				</div>
				</div>

				<div className="row">
				<div className="col-xs-12">
					<h3 className="center red-text top-30">User Warning & Disclaimer</h3>
				</div>



        <div className="clearboth" />
				<div className="col-xs-12">
					<h4 className="center">
          USE WITH CAUTION. ENTER A VALID HASHSCRIPT. SENDING NEO TO A TOKEN SALE THAT ENDED OR THAT HAS NOT STARTED CAN RESULT IN YOUR NEO BEING LOST.<br />
          <br />
          Only click send once. Please follow the rules of the token sale you are participating in. If your NEO address is not pre-qualified for the token sale your funds may be lost. Please follow all local laws as well as all KYC and AML requirements when participating in a token sale. Morpheus S.S. Ltd is not liable for the loss of any tokens. Sending more than the maximum amount may result in the excess tokens being lost. Do not send tokens to a sale that has ended.  Please research every token sale carefully before participating.
					</h4>
				</div>

				</div>
			</div>



			</div>
		);
	}
}

const mapStateToProps = state => ({
	blockHeight: state.metadata.blockHeight,
	net: state.metadata.network,
	address: state.account.address,
	wif: state.account.wif,
	neo: state.wallet.Neo,
	price: state.wallet.price,
	gas: state.wallet.Gas
});

TokenSale = connect(mapStateToProps)(TokenSale);
export default TokenSale;