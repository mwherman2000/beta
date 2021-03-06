import React, { Component } from "react";
import { connect } from "react-redux";
import axios from "axios";
import numeral from "numeral";
import { Link } from "react-router";

import { setMarketPrice, resetPrice } from "../../modules/wallet";
import { initiateGetBalance, intervals } from "../../components/NetworkSwitch";

import rpxLogo from "../../img/rpx.png";

class PortRPX extends Component {
	constructor(props) {
		super(props);
		this.state = {
			rpxPrice: 0
		};

	}

	render() {
		return (

			<div>

							<div className="col-3">

							<div className="port-logo-col">
							<img
								src={rpxLogo}
								alt=""
								width="84"
								className="port-logos"
							/>
							<hr className="dash-hr" />
							<h3><span className=" glyphicon glyphicon-qrcode marg-right-5"/>   <span className=" glyphicon glyphicon-send "/></h3>
							</div>

							<div className="port-price-col">
								<span className="market-price">Red Pulse {numeral(this.props.marketRPXPrice).format("$0,0.00")}</span>
								<h3>{numeral(
									Math.floor(this.props.rpx * 100000) / 100000
								).format("0,0.0000")} <span className="rpx-price"> RPX</span></h3>
								<hr className="dash-hr" />
								<span className="market-price">{numeral(this.props.rpx * this.props.marketRPXPrice).format("$0,0.00")} USD</span>
							</div>
							</div>


			</div>
		);
	}
}

const mapStateToProps = state => ({
	rpx: state.wallet.Rpx,
	marketRPXPrice: state.wallet.marketRPXPrice
});

PortRPX = connect(mapStateToProps)(PortRPX);
export default PortRPX;
