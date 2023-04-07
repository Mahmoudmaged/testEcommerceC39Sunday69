import Stripe from "stripe";


async function payment({
    stripe= new Stripe(process.env.STRIPE_KEY),
    payment_method_types = ['card'],
    mode = 'payment',
    customer_email = 'mahmoudelwan460@gmail.com',
    line_items = [],
    metadata = {},
    success_url = process.env.SUCCESS_URL,
    cancel_url = process.env.CANCEL_URL,
    discounts=[],


} = {}) {

    // const stripe = new Stripe(process.env.STRIPE_KEY);
    
    const session = await stripe.checkout.sessions.create({
        payment_method_types, //define types of payment card or bank transfer or else
        mode, // if you want one time payment then check payment or  if you want to subscribe check subscribe
        success_url, //on success
        cancel_url, //on flier
        customer_email,
        metadata,
        line_items,
        discounts
    })

    return session
}

export default payment