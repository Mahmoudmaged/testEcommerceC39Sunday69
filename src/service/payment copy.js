import Stripe from "stripe";


async function payment({
    stripe = new Stripe(process.env.STRIPE_KEY),
    payment_method_types = ['card'],
    mode="payment",
    customer_email,
    line_items,
    discounts=[],
    metadata,
    success_url = process.env.SUCCESS_URL,
    cancel_url = process.env.CANCEL_URL,
} = {}) {


    const session = await stripe.checkout.sessions.create({
        payment_method_types,
        mode,
        customer_email,
        line_items,
        discounts,
        metadata,
        success_url, //on success
        cancel_url, //on flier
    })
    return session;
}

export default payment