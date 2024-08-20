const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 4040;
const Transaction = require('./models/Transaction'); 

app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URL)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.get('/api/test', (req, res) => {
  res.json({ message: 'test ok' });
});

app.post('/api/transaction', async (req, res) => {
  try {
    const { price, name, description, datetime } = req.body;

    if (!price || !name || !description || !datetime) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const transaction = await Transaction.create({ price, name, description, datetime });

    res.status(201).json(transaction);
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
app.get('/api/transactions',async (req, res) =>{
await mongoose.connect(process.env.MONGO_URL)
const transactions= await Transaction.find();
res.json(transactions);
})

app.put('/api/transaction/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { price, name, description, datetime } = req.body;

    if (!price || !name || !description || !datetime) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { price, name, description, datetime },
      { new: true } 
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (err) {
    console.error('Error updating transaction:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.delete('/api/transaction/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByIdAndDelete(id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({ error: 'Server error' });
  }
});




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
