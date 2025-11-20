import axios from 'axios'
import { db } from '../Config/firebase.js';


console.log(process.env.BULKCLIX_API_KEY);

console.log("test")
export const sendMobileMoney = async (req, res) => {
    const { account_number, account_name, channel, client_reference, amount } = req.body

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
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-api-key": process.env.BULKCLIX_API_KEY
        }
      }
    );

    console.log("BulkClix Response:", response.data);
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.json({
            error: true,
            message: error.response?.data || error.message,
            success: false
        });
    }
}







/*curl -X POST "https://api.bulkclix.com/api/v1/payment-api/send/mobilemoney" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "x-api-key: ACdJEyLckKSJ7GtIef4n0cBj3sRawbeRQg5ccaDg" \
  -d '{
        "amount": "1",
        "account_number": "0551956879",
        "channel": "MTN",
        "account_name": "Bright",
        "client_reference": "8493849839448878849384"
      }'*/