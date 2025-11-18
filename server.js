import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import paymentRoute from './routers/paymentRoute.js';






const app = express();
app.use(cors({
    origin: "*"
}));
app.use(express.json());


//routes
app.use("/api", paymentRoute)



const PORT = process.env.PORT || 5000;


    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`); 
});

