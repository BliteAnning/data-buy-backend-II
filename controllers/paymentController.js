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
          "Content-Type": "application/json",
          "x-api-key": process.env.BULKCLIX_API_KEY
        }
      }
    );

    await db.collection("withdraw").doc(uid).set(
      {
        responses: [
          {
            response: response.data,
            timestamp: new Date()
          }
        ],
        updatedAt: new Date()
      },
      { merge: true }
    );

    // If document exists, push to array; if not, create array
    const withdrawRef = db.collection("withdraw").doc(uid);
    const withdrawSnap = await withdrawRef.get();

    if (withdrawSnap.exists) {
      await withdrawRef.update({
        responses: db.FieldValue.arrayUnion({
          response: response.data,
          timestamp: new Date()
        }),
        updatedAt: new Date()
      });
    } else {
      await withdrawRef.set({
        responses: [
          {
            response: response.data,
            timestamp: new Date()
          }
        ],
        updatedAt: new Date()
      });
    }




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
  -H "x-api-key: " \
  -d '{
        "amount": "1",
        "account_number": "0551956879",
        "channel": "MTN",
        "account_name": "Bright",
        "client_reference": "8493849839448878849384"
      }'*/