import React, { Component } from "react";
import { connect } from "react-redux";
import axios from "axios";
import numeral from "numeral";
import { Link } from "react-router";

import { setMarketPrice, resetPrice } from "../modules/wallet";
import { initiateGetBalance, intervals } from "../components/NetworkSwitch";

import PortACAT from "./Assets/PortACAT.js";
import PortApex from "./Assets/PortApex.js";
import PortAPH from "./Assets/PortAPH.js";
import PortBTC from "./Assets/PortBTC.js";
import PortIAM from "./Assets/PortIAM.js";
import PortCGE from "./Assets/PortCGE.js";
import PortDBC from "./Assets/PortDBC.js";
import PortEFX from "./Assets/PortEFX.js";
import PortETH from "./Assets/PortETH.js";
import PortGALA from "./Assets/PortGALA.js";
import PortGAS from "./Assets/PortGAS.js";
import PortGDM from "./Assets/PortGDM.js";
import PortHP from "./Assets/PortHP.js";
import PortLTC from "./Assets/PortLTC.js";
import PortLRC from "./Assets/PortLRC.js";
import PortNRVE from "./Assets/PortNRVE.js";
import PortNEO from "./Assets/PortNEO.js";
import PortNEX from "./Assets/PortNEX.js";
import PortOBT from "./Assets/PortOBT.js";
import PortONT from "./Assets/PortONT.js";
import PortPKC from "./Assets/PortPKC.js";
import PortQLC from "./Assets/PortQLC.js";
import PortRPX from "./Assets/PortRPX.js";
import PortSWH from "./Assets/PortSWH.js";
import PortTHOR from "./Assets/PortTHOR.js";
import PortTKY from "./Assets/PortTKY.js";
import PortTNC from "./Assets/PortTNC.js";
import PortWWB from "./Assets/PortWWB.js";
import PortZPT from "./Assets/PortZPT.js";
import PortEOS from "./Assets/PortEOS.js";

class AssetPortolio extends Component {
	constructor(props) {
		super(props);
		this.state = {
			gasPrice: 0,
		};

	}

	render() {
		return (

			<div>
				<div className="row top-20 dash-portfolio center">
				<div id="assetList">
				<div className="clearboth" />
				<div className="row" />

				<PortACAT />
				<PortApex />
				<PortAPH />
				<PortBTC />
				<PortIAM />
				<PortCGE />
				<PortDBC />
				<PortEFX />
				<PortEOS/>
				<PortETH />
				<PortGALA />
				<PortGAS />
				<PortGDM />
				<PortHP />
				<PortLTC />
				<PortLRC />
				<PortNRVE />
				<PortNEO />
				<PortNEX />
				<PortOBT />
				<PortONT />
				<PortPKC />
				<PortQLC />
				<PortRPX />
				<PortSWH />
				<PortTHOR />
				<PortTKY />
				<PortTNC />
				<PortWWB />
				<PortZPT />

				</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	gas: state.wallet.Gas,
	neo: state.wallet.Neo,
});

AssetPortolio = connect(mapStateToProps)(AssetPortolio);
export default AssetPortolio;
