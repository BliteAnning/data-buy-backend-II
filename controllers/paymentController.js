import axios from 'axios'
import { db } from '../Config/firebase.js';




export const sendMobileMoney = async (req, res) => {
    const { uid, amount } = req.body

    try {

        const subRef = db.collection("client_subaccounts").doc(uid);
        const subSnap = await subRef.get()

        if (!subSnap.exists) {
            return res.status(404).json({ error: "Subaccount not found" });
        }

        const subData = subSnap.data();



        const response = await axios.post(
            "https://api.bulkclix.com/api/v1/payment-api/send/mobilemoney",
            {
                amount: amount,
                account_number: subData.account_number,
                channel: subData.bank_code,
                account_name: subData.account_name,
                client_reference: subData.subaccount_code
            },
            
            {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${process.env.BULKCLIX_API_KEY}`
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