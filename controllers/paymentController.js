import axios from 'axios'
import { db } from '../Config/firebase.js';




export const sendMobileMoney = async (req, res) => {
    const {account_number, account_name, channel, client_reference, amount } = req.body

    try {

        /*const subRef = db.collection("client_subaccounts").doc(uid);
        const subSnap = await subRef.get()

        if (!subSnap.exists) {
            return res.status(404).json({ error: "Subaccount not found" });
        }

        const subData = subSnap.data();*/



        const response = await axios.post(
            "https://api.bulkclix.com/api/v1/payment-api/send/mobilemoney",
            {
                amount: amount,
                account_number: account_number,
                channel: channel,
                account_name: account_name,
                client_reference: client_reference
            },
            /*{
                authorization:{
                    key: x-api-key,
                    value: process.env.BULKCLIX_API_KEY
                }
            },*/
            
            {
                headers: {
                    Accept: "application/json",
                    "x-api-key": process.env.BULKCLIX_API_KEY
                   
                }
            }
        );

        console.log("Response:", response.data);
        res.json({ 
            success: true, 
            data: response.data,
            message: "withdrawal initiated" 
        });

    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.json({ 
            error: true, 
            message: error.response?.data || error.message, 
            success:false
        });
    }
}