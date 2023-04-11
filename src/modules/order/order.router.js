import * as orderController from './controller/order.js'
import { auth } from '../../middleware/auth.js'
import { Router } from "express";
import { endpoint } from './order.endPoint.js';
import express from 'express'
const router = Router()




router.post('/',
    auth(endpoint.create),
    orderController.createOrder)



// ==========

router.post('/webhook', express.raw({ type: 'application/json' }), orderController.webHook);

export default router