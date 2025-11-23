import axios from 'axios'
import { db } from '../Config/firebase.js';
import admin from 'firebase-admin';



export const sendMobileMoney = async (req, res) => {
  const { uid, amount, client_reference,momo_number, network } = req.body

  const newAmount = amount - (0.01*amount)

  try {

    const subSnap = await db
      .collection("client-subaccount")
      .where("uid", "==", uid)
      .get();

    if (subSnap.empty) {
      return res.status(404).json({ error: "uid not found" });
    }
 

    const subDoc = subSnap.docs[0];
    const subData = subDoc.data();

    const currentBalance = subData.totalMoneyReceived - subData.totalMoneyWithdrawn

    if(amount > currentBalance){
      return res.status(404).json({error:"enter amount less than or equal to your current balance"})
    }


    const response = await axios.post(
      "https://api.bulkclix.com/api/v1/payment-api/send/mobilemoney",
      {
        amount: newAmount,
        account_number: momo_number,
        channel: network,
        account_name: subData.account_name,
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



    // store in database
    try {
      await db.collection('withdraw').add({
        uid: uid,
        amount: amount,
        account_number: response.data.data.account_number,
        transaction_id: response.data.data.transaction_id,
        client_reference: response.data.data.client_reference,
        message: response.data.message,
        createdAt:new Date(),
        status:"sent"
      });
    } catch (err) {
      console.error("Error saving payment to Firestore:", err);
    }


    //update totalWithdrawals in client-subaccount

    const amountNum = Number(amount);

   
    const prevWithdrawn = Number(subData.totalMoneyWithdrawn || 0);
   // const prevReceived = Number(subData.totalMoneyReceived || 0);

    
    const updatedWithdrawn = prevWithdrawn + amountNum;
    //const updatedReceived = prevReceived - amountNum;

   
    await subDoc.ref.update({
      totalMoneyWithdrawn: updatedWithdrawn,
     // totalMoneyReceived: updatedReceived,
      updatedAt: new Date()
    });




    console.log("BulkClix Response:", response.data);
    res.json({
      success: true,
      message: "Mobile money sent successfully",
      data: response.data
    })
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