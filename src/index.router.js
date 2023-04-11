
import authRouter from './modules/auth/auth.router.js'
import branRouter from './modules/brand/brand.router.js'
import cartRouter from './modules/cart/cart.router.js'
import categoryRouter from './modules/category/category.router.js'
import couponRouter from './modules/coupon/coupon.router.js'
import orderRouter from './modules/order/order.router.js'
import productRouter from './modules/product/product.router.js'
import reviewsRouter from './modules/reviews/reviews.router.js'
import subcategoryRouter from './modules/subcategory/subcategory.router.js'
import userRouter from './modules/user/user.router.js'
import connectDB from '../DB/connection.js'
import { globalErrorHandling } from './utils/errorHandling.js'
import morgan from 'morgan'
import cors from 'cors'
import { webHook } from './modules/order/controller/order.js'
const initApp = (app, express) => {

    app.use((req, res, next) => {
        if (req.originalUrl === '/webhook') {
            next()
        } else {
            express.json({})(req, res, next);
        }
    })

    app.post('/webhook', express.raw({ type: 'application/json' }), webHook);

    app.use(cors())
    //convert Buffer Data
    if (process.env.MOOD == "DEVs") {
        app.use(morgan('dev'))
    } else {
        app.use(morgan('common'))
    }
    //Setup API Routing 
    app.get("/", (req, res, next) => {
        return res.status(200).json({ message: "Deploy work ", env: process.env.DB_LOCAL })
    })
    app.use(`/auth`, authRouter)
    app.use(`/user`, userRouter)
    app.use(`/product`, productRouter)
    app.use(`/category`, categoryRouter)
    app.use(`/subCategory`, subcategoryRouter)
    app.use(`/reviews`, reviewsRouter)
    app.use(`/coupon`, couponRouter)
    app.use(`/cart`, cartRouter)
    app.use(`/order`, orderRouter)
    app.use(`/brand`, branRouter)

    app.all('*', (req, res, next) => {
        res.send("In-valid Routing Plz check url  or  method")
    })
    app.use(globalErrorHandling)

    connectDB()

}



export default initApp