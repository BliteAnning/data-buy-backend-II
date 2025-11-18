
import express from "express";
import {sendMobileMoney} from "../controllers/paymentController.js"

const paymentRoute = express.Router();

paymentRoute.post("/withdraw", sendMobileMoney);


export default paymentRoute;
