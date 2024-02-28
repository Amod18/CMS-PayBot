///////////////////////

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
        const queryUrl = `http://localhost:5000/fetchElectricityPayment`;
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

///////////////////////

class OrderIDGenerator extends Component {
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
        // const regNo = steps.getWaterRegNo.value;
        const PayOrNotWaterMessage = steps.PayOrNotWater.message;
        const yesNOMessage = steps.yesNO.message;
        console.log("Message line 279 : " + PayOrNotWaterMessage);
        console.log("Message line 280 : " + yesNOMessage);

        const queryUrl = `http://localhost:5000/fetchElectricityOrderID`;
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
        dbXHR.open('POST', 'http://localhost:5000/insertTrafficFinDetails', true);
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

OrderIDGenerator.propTypes = {
    steps: PropTypes.object,
    triggerNextStep: PropTypes.func,
};

OrderIDGenerator.defaultProps = {
    steps: undefined,
    triggerNextStep: undefined,
};

///////////////////////////

class PaymentForm extends Component {
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
            const response = await axios.post('http://localhost:5000/create_order', {
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
                            const transactionResponse = await axios.post('http://localhost:5000/commitTransaction', {
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

PaymentForm.propTypes = {
    steps: PropTypes.object,
    triggerNextStep: PropTypes.func,
};

PaymentForm.defaultProps = {
    steps: undefined,
    triggerNextStep: undefined,
};
