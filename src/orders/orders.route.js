const express = require("express");
const Order = require("./orders.model");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// create checkout session
router.post("/create-checkout-session", async (req, res) => {
  const { products,address } = req.body;

  try {

    const lineItems = products.map((product) => ({
      price_data: {
        currency: "LKR",
        product_data: {
          name: product.name,
          images: [product.image],
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: product.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url:"http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/cancel",
      metadata: {
        address: JSON.stringify(address),
      },
    });

    res.json({ id: session.id });

  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

//  confirm payment
router.post("/confirm-payment", async (req, res) => {
  console.log("confrim payment");
  const { session_id } = req.body;
  // console.log(session_id);

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items", "payment_intent"],
    });

    console.log(session);
    
    const paymentIntentId = session.payment_intent.id;
console.log("line items: ",session.line_items.data);

    let order = await Order.findOne({ orderId: paymentIntentId });

    if (!order) {
      const lineItems = session.line_items.data.map((item) => ({
        productId: item.price.product,
        quantity: item.quantity,
      }));

      const amount = session.amount_total / 100;
      const address = JSON.parse(session.metadata.address);

      order = new Order({
        orderId: paymentIntentId,
        products: lineItems,
        amount: amount,
        address,
        status: session.payment_intent.status === "succeeded" ? "pending" : "failed",
      });
    } else {
      order.status =
        session.payment_intent.status === "succeeded" ? "pending" : "failed";
    }

    await order.save();
    //   console.log(order);

    res.json({ order });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ error: "Failed to confirm payment" });
  }
});



module.exports = router;
