import productModel from "../../../../DB/model/Product.model.js";
import couponModel from "../../../../DB/model/Coupon.model.js";
import cartModel from "../../../../DB/model/Cart.model.js";
import orderModel from "../../../../DB/model/Order.model.js";
import payment from "../../../service/payment.js";
import Stripe from "stripe";




export const createOrder = async (req, res, next) => {

    const { products, address, phone, couponName, } = req.body
    //check coupon availability
    if (couponName) {
        const coupon = await couponModel.findOne({
            name: couponName.toLowerCase(),
            usedBy: { $nin: req.user._id },
            isDeleted: false
        })
        if (!coupon ||
            (parseInt(Date.now() / 1000) > parseInt((coupon?.expire?.getTime() / 1000)))
        ) {
            return next(new Error("In-valid or expire coupon", { cause: 400 }))
        }
        req.body.coupon = coupon
    }

    //check product availability
    let sumTotal = 0;
    let finalProductList = []
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const checkedProduct = await productModel.findOne({
            _id: product.productId,
            stock: { $gte: product.quantity },
            isDeleted: false
        })
        if (!checkedProduct) {
            return next(new Error(`Fail to this product name:${product.name}`, { cause: 400 }))
        }
        product.name = checkedProduct.name;
        product.unitPrice = checkedProduct.finalPrice;
        product.finalPrice = product.unitPrice * product.quantity
        finalProductList.push(product)

        sumTotal += product.finalPrice
    }
    //create order
    const order = await orderModel.create({
        userId: req.user._id,
        products: finalProductList,
        couponId: req.body.coupon?._id,
        finalPrice: sumTotal - (sumTotal * ((req.body.coupon?.amount || 0) / 100)),
        address,
        phone,
        paymentType: req.body.paymentType || 'cash',
        status: req.body.paymentType == "card" ? 'waitPayment' : 'placed'
    })
    if (!order) { return next(new Error('Fail to place this order', { cause: 400 })) }

    // Decrease products stock
    for (const product of products) {
        await productModel.updateOne(
            { _id: product.productId },
            { $inc: { stock: - product.quantity } }
        )
    }
    //add user to coupon
    if (couponName) {
        await couponModel.updateOne(
            { name: couponName.toLowerCase() },
            { $addToSet: { usedBy: req.user._id } }
        )
    }
    //reset cart
    await cartModel.updateOne({ userId: req.user._id }, { products: [] })

    console.log(order._id.toString());

    if (order.paymentType == 'card') {

        const stripe = new Stripe(process.env.STRIPE_KEY);
        if (req.body.coupon) {
            const coupon = await stripe.coupons.create({ percent_off: req.body.coupon.amount, duration: 'once' });
            req.body.couponId = coupon.id
        }
        const session = await payment({
            stripe,
            customer_email: req.user.email,
            metadata: {
                orderId: order._id.toString()
            },
            line_items: order.products.map(product => {
                return {

                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: product.name
                        },
                        unit_amount: product.unitPrice * 100,
                    },
                    quantity: product.quantity,

                }


            }),
            discounts: req.body.couponId ? [{ coupon: req.body.couponId }] : []
        })
        return res.status(201).json({ message: "Done", type: "card", metadata: session.metadata, url: session.url, session })
    }



    return res.status(201).json({ message: "Done", type: "cash" })
}


export const webHook = async (req, res) => {
    const stripe = new Stripe(process.env.STRIPE_KEY);
    const sig = req.headers['stripe-signature'];

    let event;
    console.log(sig);
    console.log(req.body);
    try {
        const endpointSecret = "whsec_bHK4wulRRW4S0QEkobO3AWhQegjpHEQW";
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        console.log(event);
        if (event.type != 'checkout.session.completed') {
            const checkoutSessionCompleted = event.data.object;
            const { orderId } = checkoutSessionCompleted.metadata;
            const order = await orderModel.findOneAndDelete({ _id: orderId }, { status: 'rejected' })
            for (const product of order.products) {
                await productModel.updateOne({ _id: product.productId }, { $inc: { stock: parseInt(product.quantity) } })
            }
            return res.status(200).json({ message: "payment fail" })
        }
        const checkoutSessionCompleted = event.data.object;
        const { orderId } = checkoutSessionCompleted.metadata;
        console.log({ orderId });
        await orderModel.updateOne({ _id: orderId }, { status: 'placed' })
        return res.status(200).json({ message: "Done" })
    } catch (err) {
        console.log({ err: err.message });
        return res.status(400).send({ message: `Webhook Error: ${err.message}`, event, sig, hh: req.headers['stripe-signature'] });
    }

}