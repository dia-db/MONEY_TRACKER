import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [name, setName] = useState('');
  const [datetime, setDatetime] = useState('');
  const [description, setDescription] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null); 

  useEffect(() => {
    getTransactions()
      .then(transactions => {
        setTransactions(transactions);
      })
      .catch(error => {
        console.error('Error fetching transactions:', error);
      });
  }, []);

  async function getTransactions() {
    const url = process.env.REACT_APP_API_URL + '/transactions';
    const response = await fetch(url);
    return await response.json();
  }

  function addNewTransaction(ev) {
    ev.preventDefault();
    const url = process.env.REACT_APP_API_URL + '/transaction';

    const parts = name.split(' ');
    const price = parseFloat(parts[0]); 
    const transactionName = parts.slice(1).join(' ');

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price,
        name: transactionName,
        description,
        datetime,
      }),
    })
      .then(response => response.json())
      .then(newTransaction => {
        setName('');
        setDatetime('');
        setDescription('');
        setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  function handleEditClick(transaction) {
    setEditingTransaction(transaction); 
    setName(`${transaction.price} ${transaction.name}`);
    setDatetime(transaction.datetime);
    setDescription(transaction.description);
  }

  function handleCancelEdit() {
    setEditingTransaction(null); 
    setName('');
    setDatetime('');
    setDescription('');
  }

  function handleSaveEdit(ev) {
    ev.preventDefault();
    const url = `${process.env.REACT_APP_API_URL}/transaction/${editingTransaction._id}`;

    const parts = name.split(' ');
    const price = parseFloat(parts[0]); 
    const transactionName = parts.slice(1).join(' ');

    fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price,
        name: transactionName,
        description,
        datetime,
      }),
    })
      .then(response => response.json())
      .then(updatedTransaction => {
        setTransactions(transactions.map(t =>
          t._id === updatedTransaction._id ? updatedTransaction : t
        ));
        handleCancelEdit();
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  function handleDelete(transactionId) {
    const url = `${process.env.REACT_APP_API_URL}/transaction/${transactionId}`;

    fetch(url, {
      method: 'DELETE',
    })
      .then(() => {
        setTransactions(transactions.filter(t => t._id !== transactionId));
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  let balance = 0;
  for (const transaction of transactions) {
    balance += parseFloat(transaction.price); 
  }

  balance = balance.toFixed(2); 
  const fraction = balance.split('.')[1];
  balance = balance.split('.')[0];

  return (
    <main>
      <h1>Rs. {balance}<span>.{fraction}</span></h1>
      <form onSubmit={editingTransaction ? handleSaveEdit : addNewTransaction}>
        <div className='basic'>
          <input
            type='text'
            value={name}
            onChange={ev => setName(ev.target.value)}
            placeholder='+Rs.X Expenditure'
          />
          <input
            value={datetime}
            onChange={ev => setDatetime(ev.target.value)}
            type='datetime-local'
          />
        </div>
        <div className='description'>
          <input
            type='text'
            value={description}
            onChange={ev => setDescription(ev.target.value)}
            placeholder='Description'
          />
        </div>
        <button type='submit'>{editingTransaction ? 'Save Changes' : 'Add new transaction'}</button>
        {editingTransaction && <button type='button' onClick={handleCancelEdit}>Cancel</button>}
      </form>
      <div className='transactions'>
        {transactions.length > 0 && transactions.map(transaction => (
          <div className='transaction' key={transaction._id}>
            <div className='left'>
              <div className='name'>{transaction.name}</div>
              <div className='description'>{transaction.description}</div>
            </div>
            <div className='right'>
              <div className={`price ${transaction.price < 0 ? 'red' : 'green'}`}>
                {transaction.price < 0 ? `-Rs. ${Math.abs(transaction.price)}` : `+Rs. ${transaction.price}`}
              </div>
              <div className='datetime'>{new Date(transaction.datetime).toLocaleString()}</div>
              <div className='actions'>
                <button className='edit' onClick={() => handleEditClick(transaction)}>Edit</button>
                <button className='delete' onClick={() => handleDelete(transaction._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default App;
