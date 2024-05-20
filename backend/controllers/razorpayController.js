const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const createOrder = async (req, resp) => {
  try {
    const options = req.body;
    const order = await razorpay.orders.create(options);
    if (!order) {
      return resp.status(500).json({
        message: "Some error occurred",
      });
    }
    console.log(order);
    resp.json(order);
  } catch {
    resp.status(500).json({
      message: "Some error occurred",
    });
  }
};

const validatePayment = async (req, resp) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");

    if (digest !== razorpay_signature) {
      return resp.status(400).json({
        message: "Invalid signature",
      });
    }
    resp.json({
      message: "Payment successful",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch {
    resp.status(500).json({
      message: "Some error occurred",
    });
  }
};

module.exports = { createOrder, validatePayment };
