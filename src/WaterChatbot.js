import React, { useRef, Component } from 'react';
import PropTypes from 'prop-types';
import ChatBot, { Loading } from 'react-simple-chatbot';
import logo from './CMSlogo.png'
import axios from 'axios';

const UserIdRegex = /^\d{10}$/;
const ValidateElectricityBill = (value) => {
    if (!UserIdRegex.test(value)) {
        return 'Please enter a valid account number';
    }
    return true;
};

const RCIdExtract = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/;
const ValidateRcExtract = (value) => {
    if (!RCIdExtract.test(value)) {
        return 'Please enter a valid vehicle number';
    }
    return true;
};

const PIDregex = /^\d{1}$/;
const ValidatePropertyTax = (value) => {
    if (!PIDregex.test(value)) {
        return 'Please enter a valid PID';
    }
    return true;
};

let welcomeMessage;
let optionMessage;
let electricityConsumerIDMessage;
let regNo;
let ElectricityBillDetails = [];
let rcExtractDetails = [];
let PropertyTaxDetails = [];
let orderID = [];
let billAmt = 0;
let billAmountDetail;
let KonePaymentId

// Electricity code begins
class ElectricityBill extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            result: '',
            trigger: false,
        };

        this.triggetNext = this.triggetNext.bind(this);
    }
    componentDidMount() {
        this.triggetNext()
    }
    UNSAFE_componentWillMount() {
        const self = this;
        const { steps } = this.props;
        // Logging of messages 
        welcomeMessage = steps.welcome.message;
        optionMessage = steps.options.value;
        electricityConsumerIDMessage = steps.electricityConsumerID.message;
        regNo = steps.getElectricityRegNo.value;

        console.log("Message line 41 : " + welcomeMessage);
        console.log("Message line 42 : " + optionMessage);
        console.log("Message line 43 : " + electricityConsumerIDMessage);
        console.log("Message line 44 : " + regNo);

        const queryUrl = `http://35.154.163.181:8000/fetchElectricityBillDetails`;
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', readyStateChange);

        function readyStateChange() {
            if (this.readyState === 4) {
                if (this.responseText.trim() !== "") {
                    const bindings = JSON.parse(this.responseText);
                    if (bindings.Result.ResponseVal === 1) {
                        ElectricityBillDetails = [
                            "Bill Number : " + bindings.Result.ResponseData.BillNumber,
                            "Bill Date : " + bindings.Result.ResponseData.BillDate,
                            "Bill Amount : " + bindings.Result.ResponseData.CurrentDemand,
                        ]
                        billAmountDetail = ElectricityBillDetails.find(detail => detail.includes('Bill Amount'));
                        const billAmount = billAmountDetail ? billAmountDetail.split(': ')[1] : null;
                        billAmt = billAmount ? parseFloat(billAmount) : null;

                        console.log("Message line 68 : " + billAmountDetail + typeof (billAmountDetail));
                        self.setState({ loading: false, result: ElectricityBillDetails });
                    } else {
                        ElectricityBillDetails = [
                            bindings.Result.Reason,
                        ]
                        self.setState({ loading: false, result: ElectricityBillDetails });
                    }
                }
            }
            else {
                self.setState({ loading: true, result: ElectricityBillDetails });
            }
        }
        const data = {
            RRNo: regNo,
            SubDivisionID: "",
            DuplicateCheckRequired: "N",
            CityCode: "BN",
            ServiceCityId: "97",
            CityId: 2
        };
        xhr.open('POST', queryUrl);
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify(data));
    }

    triggetNext() {
        this.setState({ trigger: true }, () => {
            this.props.triggerNextStep();
        });
    }

    render() {
        const { trigger, loading } = this.state;

        return (
            <div className="WaterBill">
                {loading ? <Loading /> : <div>
                    <p>Bill details:</p>
                    {ElectricityBillDetails.map((detail, index) => (
                        <p key={index}>{detail}</p>
                    ))}
                </div>}
                {
                    !loading &&
                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: 20,
                        }}
                    >
                        {
                            !trigger &&
                            <button>
                                Continue
                            </button>
                        }
                    </div>
                }
            </div>
        );

    }
}

ElectricityBill.propTypes = {
    steps: PropTypes.object,
    triggerNextStep: PropTypes.func,
};

ElectricityBill.defaultProps = {
    steps: undefined,
    triggerNextStep: undefined,
};

class ElectricityPaymentDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            result: '',
            trigger: false,
        };

        this.triggetNext = this.triggetNext.bind(this);
    }
    componentDidMount() {
        this.triggetNext()
    }

    UNSAFE_componentWillMount() {
        const self = this;
        // const { steps } = this.props;
        // const regNo = steps.getWaterRegNo.value;
        const queryUrl = `http://35.154.163.181:8000/fetchElectricityPayment`;
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', readyStateChange);

        function readyStateChange() {
            if (this.readyState === 4) {
                if (this.responseText.trim() !== "") {
                    const bindings = JSON.parse(this.responseText);

                    if (bindings.Result.ResponseData !== null && bindings.Result.ResponseVal === 1) {
                        // Check if ResponseData is not null before accessing its properties
                        billAmt = billAmt + bindings.Result.ResponseData.ServiceCharge + bindings.Result.ResponseData.UserCharge + bindings.Result.ResponseData.DeptUserCharge + bindings.Result.ResponseData.ChargeValue
                        orderID = [
                            "ServiceCharge: " + bindings.Result.ResponseData.ServiceCharge,
                            "UserCharge: " + bindings.Result.ResponseData.UserCharge,
                            "DeptUserCharge: " + bindings.Result.ResponseData.DeptUserCharge,
                            "ChargeValue: " + bindings.Result.ResponseData.ChargeValue,
                            "Total Amount: " + billAmt
                        ];
                        self.setState({ loading: false, result: orderID });
                    } else {
                        orderID = [
                            bindings.Result.Reason
                        ];
                        self.setState({ loading: false, result: orderID });
                    }
                } else {
                    self.setState({ loading: true, result: orderID });
                }
            }
        }

        const data = {
            "ServiceId": 77,
            "CityId": 2
        };
        xhr.open('POST', queryUrl);
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify(data));
    }

    triggetNext() {
        this.setState({ trigger: true }, () => {
            this.props.triggerNextStep();
        });
    }

    render() {
        const { trigger, loading } = this.state;

        return (
            <div className="WaterBill">
                {loading ? <Loading /> : <div>
                    <p>Charges details:</p>
                    {orderID.map((detail, index) => (
                        <p key={index}>{detail}</p>
                    ))}
                </div>}
                {
                    !loading &&
                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: 20,
                        }}
                    >
                        {
                            !trigger &&
                            <button>
                                Continue
                            </button>
                        }
                    </div>
                }
            </div>
        );

    }
}

ElectricityPaymentDetails.propTypes = {
    steps: PropTypes.object,
    triggerNextStep: PropTypes.func,
};

ElectricityPaymentDetails.defaultProps = {
    steps: undefined,
    triggerNextStep: undefined,
};

class OrderIDGeneratorElectricity extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            result: '',
            trigger: false,
        };

        this.triggetNext = this.triggetNext.bind(this);
    }
    componentDidMount() {
        this.triggetNext()
    }

    UNSAFE_componentWillMount() {
        const self = this;
        // const { steps } = this.props;

        const queryUrl = `http://35.154.163.181:8000/fetchElectricityOrderID`;
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', readyStateChange);

        function readyStateChange() {
            if (this.readyState === 4) {
                if (this.responseText.trim() !== "") {
                    const bindings = JSON.parse(this.responseText);
                    // console.log("konepayment " + bindings.Result.ResponseData.KonePaymentId);
                    KonePaymentId = bindings.Result.ResponseData.KonePaymentId
                    if (bindings.Result.ResponseData !== null && bindings.Result.ResponseVal === 1) {
                        orderID = [
                            bindings.Result.ResponseData
                        ];
                        self.setState({ loading: false, result: orderID });
                    } else {
                        orderID = [
                            bindings.Result.Reason
                        ];
                        self.setState({ loading: false, result: orderID });
                    }
                } else {
                    self.setState({ loading: true, result: orderID });
                }
            }
        }

        const data = {
            "ServiceId": 77,
            "CityId": 2
        };
        xhr.open('POST', queryUrl);
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify(data));

        // Get the current date in IST (Indian Standard Time)
        var istDate = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        // Extract date components
        var dateComponents = istDate.split(/\/|, |:| /);
        // Ensure date components are padded properly
        var localDate = `${dateComponents[2]}-${dateComponents[0].padStart(2, '0')}-${dateComponents[1].padStart(2, '0')} ${dateComponents[3].padStart(2, '0')}:${dateComponents[4].padStart(2, '0')}:${dateComponents[5].padStart(2, '0')}`;
        console.log(localDate);

        const dbXHR = new XMLHttpRequest();
        dbXHR.open('POST', 'http://35.154.163.181:5432/insertElectricityBill', true);
        dbXHR.setRequestHeader('Content-Type', 'application/json');
        dbXHR.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log('Line 332 Data sent successfully');
            }
        };
        console.log("line 105 " + billAmountDetail);
        dbXHR.send(JSON.stringify({
            welcomeMessage,
            optionMessage,
            regNo,
            billAmt,
            localDate
        }));
    }

    triggetNext() {
        this.setState({ trigger: true }, () => {
            this.props.triggerNextStep();
        });
    }

    render() {
        const { trigger, loading } = this.state;

        return (
            <div className="WaterBill">
                {loading ? <Loading /> : <div>
                    <p>Payment Initiated</p>
                </div>}
                {
                    !loading &&
                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: 20,
                        }}
                    >
                        {
                            !trigger &&
                            <button>
                                Continue
                            </button>
                        }
                    </div>
                }
            </div>
        );

    }
}

OrderIDGeneratorElectricity.propTypes = {
    steps: PropTypes.object,
    triggerNextStep: PropTypes.func,
};

OrderIDGeneratorElectricity.defaultProps = {
    steps: undefined,
    triggerNextStep: undefined,
};

class PaymentFormElectricity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currency: 'INR',
            paymentStatus: null,
            receiptUrl: null // Initialize receiptUrl state
        };
        this.handlePayment = this.handlePayment.bind(this);
    }

    componentDidMount() {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.head.appendChild(script);
    }

    componentWillUnmount() {
        const script = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (script) {
            document.head.removeChild(script);
        }
    }

    async handlePayment() {
        const { currency } = this.state;
        try {
            const response = await axios.post('http://35.154.163.181:8000/create_order', {
                amount: billAmt * 100,
                currency,
            });
            const orderData = response.data;

            const options = {
                key: 'rzp_test_GzwTMEbXRNMYpY',
                amount: billAmt * 100,
                currency: 'INR',
                name: "Amod's Chatbot",
                description: 'Payment for your electricity bill',
                order_id: orderData.id,
                handler: async (response) => {
                    if (response) {
                        try {
                            const transactionResponse = await axios.post('http://35.154.163.181:8000/commitTransaction', {
                                "Order_id": orderData.id,
                                "PaymentId": response.razorpay_payment_id,
                                "Signature": response.razorpay_signature
                            });
                            const receiptUrl = transactionResponse.data;
                            this.setState({
                                paymentStatus: 'Your payment is successful.',
                                receiptUrl: receiptUrl
                            });

                            // Triggering next step after 5 seconds
                            setTimeout(() => {
                                this.props.triggerNextStep();
                            }, 5000);
                        } catch (error) {
                            console.error('Error committing transaction:', error);
                            this.setState({ paymentStatus: 'Error committing transaction. Please try again.' });
                        }
                    } else {
                        this.setState({ paymentStatus: 'Payment unsuccessful.' });
                    }
                },
                prefill: {
                    name: 'Customer Name',
                    email: 'customer@example.com',
                    contact: '9999999999',
                },
                notes:
                {
                    "reference_no": KonePaymentId
                },
                theme: {
                    color: '#F37254',
                },
                modal: {
                    ondismiss: () => {
                        this.setState({ paymentStatus: 'Payment unsuccessful.' });
                    },
                },
            };
            const rzp1 = new window.Razorpay(options);
            rzp1.open();
        } catch (error) {
            console.error('Error creating order:', error);
            this.setState({ paymentStatus: 'Error creating order. Please try again.' });
        }
    }

    render() {
        const { paymentStatus, receiptUrl } = this.state;

        return (
            <div>
                <p>Amount: {billAmt}</p>
                <button onClick={this.handlePayment}>Make Payment</button>
                {paymentStatus && <p>Payment Status: {paymentStatus}</p>}
                {receiptUrl && (
                    <p>
                        <a target='_blank' rel='noreferrer' href={receiptUrl} download>Download Receipt</a>
                    </p>
                )}
            </div>
        );
    }
}

PaymentFormElectricity.propTypes = {
    steps: PropTypes.object,
    triggerNextStep: PropTypes.func,
};

PaymentFormElectricity.defaultProps = {
    steps: undefined,
    triggerNextStep: undefined,
};
// Electricity code ends

// RC Extract code begins
class RCExtract extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            result: '',
            trigger: false,
        };

        this.triggetNext = this.triggetNext.bind(this);
    }
    componentDidMount() {
        this.triggetNext()
    }
    UNSAFE_componentWillMount() {
        const self = this;
        const { steps } = this.props;
        const vehicleNum = steps.getRCNo.value;
        console.log(vehicleNum);

        const queryUrl = `http://35.154.163.181:8000/fetchRCDetails`;
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', readyStateChange);

        function readyStateChange() {
            if (this.readyState === 4) {
                if (this.responseText.trim() !== "") {
                    const bindings = JSON.parse(this.responseText);
                    if (bindings.Result.ResponseVal === 1) {
                        rcExtractDetails = [
                            "Owner Name : " + bindings.Result.ResponseData.OwnerName,
                            "RTO Code : " + bindings.Result.ResponseData.RTOCode,
                            "Registration Number : " + bindings.Result.ResponseData.RegistrationNo,
                            "Chasis Number : " + bindings.Result.ResponseData.ChasisNo,
                        ]
                        billAmountDetail = rcExtractDetails.find(detail => detail.includes('Bill Amount'));
                        const billAmount = billAmountDetail ? billAmountDetail.split(': ')[1] : null;
                        billAmt = billAmount ? parseFloat(billAmount) : null;
                        self.setState({ loading: false, result: rcExtractDetails });
                    } else {
                        rcExtractDetails = [
                            bindings.Result.Reason,
                        ]
                        self.setState({ loading: false, result: rcExtractDetails });
                    }
                }
            }
            else {
                self.setState({ loading: true, result: rcExtractDetails });
            }
        }
        const data =
        {
            "RegNo": vehicleNum,
            "DuplicateCheckRequired": "N",
            "CityCode": "BN",
            "ServiceCityId": "7",
            "CityId": 2
        }
        xhr.open('POST', queryUrl);
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify(data));
    }

    triggetNext() {
        this.setState({ trigger: true }, () => {
            this.props.triggerNextStep();
        });
    }

    render() {
        const { trigger, loading } = this.state;

        return (
            <div className="RC Details">
                {loading ? <Loading /> : <div>
                    <p>RC details:</p>
                    {rcExtractDetails.map((detail, index) => (
                        <p key={index}>{detail}</p>
                    ))}
                </div>}
                {
                    !loading &&
                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: 20,
                        }}
                    >
                        {
                            !trigger &&
                            <button>
                                Continue
                            </button>
                        }
                    </div>
                }
            </div>
        );

    }
}

RCExtract.propTypes = {
    steps: PropTypes.object,
    triggerNextStep: PropTypes.func,
};

RCExtract.defaultProps = {
    steps: undefined,
    triggerNextStep: undefined,
};

class RCDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            result: '',
            trigger: false,
        };

        this.triggetNext = this.triggetNext.bind(this);
    }
    componentDidMount() {
        this.triggetNext()
    }

    UNSAFE_componentWillMount() {
        const self = this;
        // const { steps } = this.props;
        const queryUrl = `http://35.154.163.181:8000/fetchRcPayment`;
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', readyStateChange);

        function readyStateChange() {
            if (this.readyState === 4) {
                if (this.responseText.trim() !== "") {
                    const bindings = JSON.parse(this.responseText);
                    if (bindings.Result.ResponseData !== null && bindings.Result.ResponseVal === 1) {
                        billAmt = billAmt + bindings.Result.ResponseData.ServiceCharge + bindings.Result.ResponseData.UserCharge + bindings.Result.ResponseData.DeptUserCharge + bindings.Result.ResponseData.ChargeValue
                        orderID = [
                            "Total Amount: " + billAmt
                        ];
                        self.setState({ loading: false, result: orderID });
                    } else {
                        orderID = [
                            bindings.Result.Reason
                        ];
                        self.setState({ loading: false, result: orderID });
                    }
                } else {
                    self.setState({ loading: true, result: orderID });
                }
            }
        }

        const data = {
            "ServiceId": 7, // 59 --> traffic fine
            "CityId": 2
        };
        xhr.open('POST', queryUrl);
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify(data));
    }

    triggetNext() {
        this.setState({ trigger: true }, () => {
            this.props.triggerNextStep();
        });
    }

    render() {
        const { trigger, loading } = this.state;

        return (
            <div className="WaterBill">
                {loading ? <Loading /> : <div>
                    <p>RC Charges details:</p>
                    {orderID.map((detail, index) => (
                        <p key={index}>{detail}</p>
                    ))}
                </div>}
                {
                    !loading &&
                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: 20,
                        }}
                    >
                        {
                            !trigger &&
                            <button>
                                Continue
                            </button>
                        }
                    </div>
                }
            </div>
        );

    }
}

RCDetails.propTypes = {
    steps: PropTypes.object,
    triggerNextStep: PropTypes.func,
};

RCDetails.defaultProps = {
    steps: undefined,
    triggerNextStep: undefined,
};

class OrderIDGeneratorRC extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            result: '',
            trigger: false,
        };

        this.triggetNext = this.triggetNext.bind(this);
    }
    componentDidMount() {
        this.triggetNext()
    }

    UNSAFE_componentWillMount() {
        const self = this;
        // const { steps } = this.props;

        const queryUrl = `http://35.154.163.181:8000/fetchRcOderId`;
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', readyStateChange);

        function readyStateChange() {
            if (this.readyState === 4) {
                if (this.responseText.trim() !== "") {
                    const bindings = JSON.parse(this.responseText);
                    KonePaymentId = bindings.Result.ResponseData.KonePaymentId
                    if (bindings.Result.ResponseData !== null && bindings.Result.ResponseVal === 1) {
                        orderID = [
                            bindings.Result.ResponseData
                        ];
                        self.setState({ loading: false, result: orderID });
                    } else {
                        orderID = [
                            bindings.Result.Reason
                        ];
                        self.setState({ loading: false, result: orderID });
                    }
                } else {
                    self.setState({ loading: true, result: orderID });
                }
            }
        }

        const data = {
            "ServiceId": 7,
            "CityId": 2
        }
        xhr.open('POST', queryUrl);
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify(data));
    }

    triggetNext() {
        this.setState({ trigger: true }, () => {
            this.props.triggerNextStep();
        });
    }

    render() {
        const { trigger, loading } = this.state;

        return (
            <div className="WaterBill">
                {loading ? <Loading /> : <div>
                    <p>Payment Initiated</p>
                </div>}
                {
                    !loading &&
                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: 20,
                        }}
                    >
                        {
                            !trigger &&
                            <button>
                                Continue
                            </button>
                        }
                    </div>
                }
            </div>
        );

    }
}

OrderIDGeneratorRC.propTypes = {
    steps: PropTypes.object,
    triggerNextStep: PropTypes.func,
};

OrderIDGeneratorRC.defaultProps = {
    steps: undefined,
    triggerNextStep: undefined,
};
// RC Extract code ends

// Property tax code begins
class PropertyTax extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            result: '',
            trigger: false,
        };

        this.triggetNext = this.triggetNext.bind(this);
    }
    componentDidMount() {
        this.triggetNext()
    }
    UNSAFE_componentWillMount() {
        const self = this;
        const { steps } = this.props;
        const PID = steps.getPID.value;

        const queryUrl = `http://35.154.163.181:8000/propertyTax`;
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', readyStateChange);

        function readyStateChange() {
            if (this.readyState === 4) {
                if (this.responseText.trim() !== "") {
                    const bindings = JSON.parse(this.responseText);
                    if (bindings.Result.ResponseVal === 1) {
                        PropertyTaxDetails = [
                            "Tax : " + bindings.Result.ResponseData.PropertyTaxMysuruPaymentList[0].Tax,
                            "Cemetery Cess : " + bindings.Result.ResponseData.PropertyTaxMysuruPaymentList[0].CemeteryCess,
                            "Cess : " + bindings.Result.ResponseData.PropertyTaxMysuruPaymentList[0].Cess,
                            "Garden Cess : " + bindings.Result.ResponseData.PropertyTaxMysuruPaymentList[0].GardenCess,
                            "SWM Cess : " + bindings.Result.ResponseData.PropertyTaxMysuruPaymentList[0].SWMCess,
                            "SWM Charges : " + bindings.Result.ResponseData.PropertyTaxMysuruPaymentList[0].SWMCharges,
                            "UnLawfulTax : " + bindings.Result.ResponseData.PropertyTaxMysuruPaymentList[0].UnLawfulTax,
                            "Vehicle Cess : " + bindings.Result.ResponseData.PropertyTaxMysuruPaymentList[0].VehicleCess,
                            "Penalty : " + bindings.Result.ResponseData.PropertyTaxMysuruPaymentList[0].Penalty,
                            "Payable Amount : " + bindings.Result.ResponseData.PropertyTaxMysuruPaymentList[0].PayableAmount,
                        ]
                        billAmountDetail = PropertyTaxDetails.find(detail => detail.includes('Payable Amount'));
                        const billAmount = billAmountDetail ? billAmountDetail.split(': ')[1] : null;
                        billAmt = billAmount ? parseFloat(billAmount) : null;
                        self.setState({ loading: false, result: PropertyTaxDetails });
                    } else {
                        PropertyTaxDetails = [
                            bindings.Result.Reason,
                        ]
                        self.setState({ loading: false, result: PropertyTaxDetails });
                    }
                }
            }
            else {
                self.setState({ loading: true, result: PropertyTaxDetails });
            }
        }
        const data =
        {
            "PID": PID
        }
        xhr.open('POST', queryUrl);
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify(data));
    }

    triggetNext() {
        this.setState({ trigger: true }, () => {
            this.props.triggerNextStep();
        });
    }

    render() {
        const { trigger, loading } = this.state;

        return (
            <div className="RC Details">
                {loading ? <Loading /> : <div>
                    <p>Tax details:</p>
                    {PropertyTaxDetails.map((detail, index) => (
                        <p key={index}>{detail}</p>
                    ))}
                </div>}
                {
                    !loading &&
                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: 20,
                        }}
                    >
                        {
                            !trigger &&
                            <button>
                                Continue
                            </button>
                        }
                    </div>
                }
            </div>
        );

    }
}

PropertyTax.propTypes = {
    steps: PropTypes.object,
    triggerNextStep: PropTypes.func,
};

PropertyTax.defaultProps = {
    steps: undefined,
    triggerNextStep: undefined,
};

class PropertyChargesDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            result: '',
            trigger: false,
        };

        this.triggetNext = this.triggetNext.bind(this);
    }
    componentDidMount() {
        this.triggetNext()
    }

    UNSAFE_componentWillMount() {
        const self = this;
        // const { steps } = this.props;
        const queryUrl = `http://35.154.163.181:8000/propertyTaxChages`;
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', readyStateChange);

        function readyStateChange() {
            if (this.readyState === 4) {
                if (this.responseText.trim() !== "") {
                    const bindings = JSON.parse(this.responseText);
                    if (bindings.Result.ResponseData !== null && bindings.Result.ResponseVal === 1) {
                        billAmt = billAmt + bindings.Result.ResponseData.ServiceCharge + bindings.Result.ResponseData.UserCharge + bindings.Result.ResponseData.DeptUserCharge
                        orderID = [
                            "Service Charge: " + bindings.Result.ResponseData.ServiceCharge,
                            "User Charge: " + bindings.Result.ResponseData.UserCharge,
                            "DeptUser Charge: " + bindings.Result.ResponseData.DeptUserCharge,
                            "Total Amount: " + billAmt
                        ];
                        self.setState({ loading: false, result: orderID });
                    } else {
                        orderID = [
                            bindings.Result.Reason
                        ];
                        self.setState({ loading: false, result: orderID });
                    }
                } else {
                    self.setState({ loading: true, result: orderID });
                }
            }
        }

        const data = {
            "ServiceId": 266,
            "CityId": 3
        };
        xhr.open('POST', queryUrl);
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify(data));
    }

    triggetNext() {
        this.setState({ trigger: true }, () => {
            this.props.triggerNextStep();
        });
    }

    render() {
        const { trigger, loading } = this.state;

        return (
            <div className="WaterBill">
                {loading ? <Loading /> : <div>
                    <p>Department Charges :</p>
                    {orderID.map((detail, index) => (
                        <p key={index}>{detail}</p>
                    ))}
                </div>}
                {
                    !loading &&
                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: 20,
                        }}
                    >
                        {
                            !trigger &&
                            <button>
                                Continue
                            </button>
                        }
                    </div>
                }
            </div>
        );

    }
}

PropertyChargesDetails.propTypes = {
    steps: PropTypes.object,
    triggerNextStep: PropTypes.func,
};

PropertyChargesDetails.defaultProps = {
    steps: undefined,
    triggerNextStep: undefined,
};

class OrderIDGeneratorPropertyTax extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            result: '',
            trigger: false,
        };

        this.triggetNext = this.triggetNext.bind(this);
    }
    componentDidMount() {
        this.triggetNext()
    }

    UNSAFE_componentWillMount() {
        const self = this;
        // const { steps } = this.props;

        const queryUrl = `http://35.154.163.181:8000/propertyTaxOrderId`;
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', readyStateChange);

        function readyStateChange() {
            if (this.readyState === 4) {
                if (this.responseText.trim() !== "") {
                    const bindings = JSON.parse(this.responseText);
                    KonePaymentId = bindings.Result.ResponseData.KonePaymentId
                    if (bindings.Result.ResponseData !== null && bindings.Result.ResponseVal === 1) {
                        orderID = [
                            bindings.Result.ResponseData
                        ];
                        self.setState({ loading: false, result: orderID });
                    } else {
                        orderID = [
                            bindings.Result.Reason
                        ];
                        self.setState({ loading: false, result: orderID });
                    }
                } else {
                    self.setState({ loading: true, result: orderID });
                }
            }
        }

        const data = {
            "ServiceId": 266,
            "CityId": 3
        }
        xhr.open('POST', queryUrl);
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify(data));
    }

    triggetNext() {
        this.setState({ trigger: true }, () => {
            this.props.triggerNextStep();
        });
    }

    render() {
        const { trigger, loading } = this.state;

        return (
            <div className="WaterBill">
                {loading ? <Loading /> : <div>
                    <p>Payment Initiated</p>
                </div>}
                {
                    !loading &&
                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: 20,
                        }}
                    >
                        {
                            !trigger &&
                            <button>
                                Continue
                            </button>
                        }
                    </div>
                }
            </div>
        );

    }
}

OrderIDGeneratorPropertyTax.propTypes = {
    steps: PropTypes.object,
    triggerNextStep: PropTypes.func,
};

OrderIDGeneratorPropertyTax.defaultProps = {
    steps: undefined,
    triggerNextStep: undefined,
};
// Property tax code ends

function WaterCB() {
    const myref = useRef(null);

    return (
        <ChatBot ref={myref}
            botAvatar={logo}
            floating={true}
            headerTitle="CMS PayBOT"
            steps={[
                // Electricity bill payment begins
                {
                    id: 'welcome',
                    message: 'Welcome to the M1/K1 bill payment bot. Which bill do you want to pay?',
                    trigger: 'options',
                    delay: 500,
                },
                {
                    id: 'options',
                    options: [
                        { value: "Electricity Bill", label: 'Electricity Bill', trigger: 'electricityConsumerID' },
                        { value: "RC Extract", label: 'RC Extract', trigger: 'rcExtractConsumerID' },
                        { value: "Property Tax", label: 'Property Tax', trigger: 'propertyTaxId' },
                    ],
                },
                {
                    id: "electricityConsumerID",
                    message: "Please enter your consumer ID",
                    trigger: "getElectricityRegNo"
                },
                {
                    id: 'getElectricityRegNo',
                    user: true,
                    validator: ValidateElectricityBill,
                    trigger: 'fetchElectricityData',
                },
                {
                    id: 'fetchElectricityData',
                    message: 'Fetching bill details .....',
                    trigger: 'displayElectricityData',
                },
                {
                    id: 'displayElectricityData',
                    asMessage: true,
                    component: <ElectricityBill />,
                    waitAction: true,
                    delay: 2000,
                    trigger: 'displayDetailsElectricity',
                },
                {
                    id: 'displayDetailsElectricity',
                    asMessage: true,
                    component: <ElectricityPaymentDetails />,
                    waitAction: true,
                    delay: 2000,
                    trigger: 'PayOrNotElectricity',
                },
                {
                    id: 'PayOrNotElectricity',
                    message: 'Do you want to pay the bill?',
                    delay: 3000,
                    trigger: 'yesNoElectricity',
                },
                {
                    id: 'yesNoElectricity',
                    options: [
                        { value: 'Yes', label: 'YES', trigger: 'orderIDElectricity' },
                        { value: 'No', label: 'NO', trigger: 'noMessage' },
                    ],
                },
                {
                    id: "orderIDElectricity",
                    component: <OrderIDGeneratorElectricity />,
                    asMessage: true,
                    trigger: "paymentElectricity"
                },
                {
                    id: 'paymentElectricity',
                    component: <PaymentFormElectricity />,
                    delay: 3000,
                    waitAction: true,
                    asMessage: true,
                },
                // Electricity bill payment ends

                // RC Extract begins
                {
                    id: "rcExtractConsumerID",
                    message: "Please enter your vehicle number",
                    trigger: "getRCNo"
                },
                {
                    id: 'getRCNo',
                    user: true,
                    validator: ValidateRcExtract,
                    trigger: 'fetchRCData',
                },
                {
                    id: 'fetchRCData',
                    message: 'Fetching fine details .....',
                    trigger: 'displayRCData',
                },
                {
                    id: 'displayRCData',
                    asMessage: true,
                    component: <RCExtract />,
                    waitAction: true,
                    delay: 2000,
                    trigger: 'displayDetailsRC'
                },
                {
                    id: 'displayDetailsRC',
                    asMessage: true,
                    component: <RCDetails />,
                    waitAction: true,
                    delay: 2000,
                    trigger: 'rcMessage',
                },
                {
                    id: "rcMessage",
                    message: "Do you want to pay for RC card",
                    trigger: 'yesNoRC'
                },
                {
                    id: 'yesNoRC',
                    options: [{ value: 'Yes', label: 'YES', trigger: 'orderIdRC' },
                    { value: 'No', label: 'NO', trigger: 'noMessage' },
                    ],
                },
                {
                    id: "orderIdRC",
                    component: <OrderIDGeneratorRC />,
                    asMessage: true,
                    trigger: "paymentRc"
                },
                {
                    id: 'paymentRc',
                    component: <PaymentFormElectricity />,
                    delay: 3000,
                    waitAction: true,
                    asMessage: true,
                },
                // RC Extract ends
                // Property Tax begins 
                {
                    id: "propertyTaxId",
                    message: "Please enter your PID",
                    trigger: "getPID"
                },
                {
                    id: 'getPID',
                    user: true,
                    validator: ValidatePropertyTax,
                    trigger: 'fetchPropertyData',
                },
                {
                    id: 'fetchPropertyData',
                    message: 'Fetching property tax details .....',
                    trigger: 'displayPropertyData',
                },
                {
                    id: "displayPropertyData",
                    component: <PropertyTax />,
                    asMessage: true,
                    delay: 3000,
                    waitAction: true,
                    trigger: 'displayPropertyTax'
                },
                {
                    id: 'displayPropertyTax',
                    asMessage: true,
                    component: <PropertyChargesDetails />,
                    waitAction: true,
                    delay: 2000,
                    trigger: 'propertyMessage',
                },
                {
                    id: "propertyMessage",
                    message: "Do you want to pay property tax",
                    trigger: 'yesNoPropertyTax'
                },
                {
                    id: 'yesNoPropertyTax',
                    options: [{ value: 'Yes', label: 'YES', trigger: 'orderIdProperty' },
                    { value: 'No', label: 'NO', trigger: 'noMessage' },
                    ],
                },
                {
                    id: "orderIdProperty",
                    component: <OrderIDGeneratorPropertyTax />,
                    asMessage: true,
                    trigger: "paymentProperty"
                },
                {
                    id: 'paymentProperty',
                    component: <PaymentFormElectricity />,
                    delay: 3000,
                    waitAction: true,
                    asMessage: true,
                },
                // Property Tax ends
                {
                    id: 'noMessage',
                    message: 'Thanks for using the chatbot, see you later!',
                },
            ]}
        />
    );
}

export default WaterCB;
