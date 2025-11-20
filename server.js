import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import paymentRoute from './routes/paymentRoute.js';






const app = express();
app.use(cors({
    origin: "*"
}));
app.use(express.json());


//routes
app.use("/api", paymentRoute)



const PORT = process.env.PORT || 8000;


    app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`); 
});

