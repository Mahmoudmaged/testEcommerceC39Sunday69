import * as orderController from './controller/order.js'
import { auth } from '../../middleware/auth.js'
import { Router } from "express";
import { endpoint } from './order.endPoint.js';

const router = Router()




router.post('/',
    auth(endpoint.create),
    orderController.createOrder)




export default router