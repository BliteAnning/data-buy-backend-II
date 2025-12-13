import axios from 'axios'
import supabase from '../Config/supabase.js';



export const sendMobileMoney = async (req, res) => {
  const { uid, amount, client_reference,momo_number, network, business_name } = req.body

  const newAmount = amount - (0.01*amount)

  try {


    // Fetch subaccount by uid from Supabase
    const { data: subaccount, error: subError } = await supabase
      .from('client-subaccount')
      .select('*')
      .eq('id', uid)
      .single();

    if (subError || !subaccount) {
      return res.status(404).json({ error: "uid not found" });
    }

    const subData = subaccount;

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



    // store in Supabase
    const { error: withdrawError } = await supabase
      .from('withdrawals')
      .insert([
        {
          uid: uid,
          amount: amount,
          account_number: response.data.data.account_number,
          transaction_id: response.data.data.transaction_id,
          client_reference: response.data.data.client_reference,
          message: response.data.message,
          business_name,
          created_at: new Date().toISOString(),
          status: "sent"
        }
      ]);
    if (withdrawError) {
      console.error("Error saving payment to Supabase:", withdrawError);
    }


    // update totalWithdrawals in client_subaccount (Supabase)
    const amountNum = Number(amount);
    const prevWithdrawn = Number(subData.totalMoneyWithdrawn || 0);
    const updatedWithdrawn = prevWithdrawn + amountNum;
    const { error: updateError } = await supabase
      .from('client-subaccount')
      .update({
        totalMoneyWithdrawn: updatedWithdrawn,
        updated_at: new Date().toISOString()
      })
      .eq('id', subData.id);
    if (updateError) {
      console.error("Error updating client_subaccount in Supabase:", updateError);
    }




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