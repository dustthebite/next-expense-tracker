import React, { useState, useEffect} from 'react'
import {collection, addDoc, doc, getDoc, deleteDoc, QuerySnapshot, query, onSnapshot } from "firebase/firestore"
import { db } from './firebase'

type Item = {
  name: string,
  price: number
}

export default function Home() {

  /*const [items, setItems] = useState([
    { name: 'coffee', price: 4.95 },
    { name: 'booster', price: 20.0 },
    { name: 'chips', price: 7.50 }
  ])*/

  const [items, setItems] = useState<{ name: string; price: number; id:string }[]>([]);

  const [newItem, setNewItem] = useState({name : '',price : 0, id: ''})

  useEffect(() => {
    const q = query(collection(db, 'items'))
    const unsubsribe = onSnapshot(q, (querySnapshot) => {
      let itemsArr:  { name: string; price: number; id: string }[]  = []

      querySnapshot.forEach((doc) =>{
        itemsArr.push({ ...doc.data() as { name: string; price: number }, id: doc.id })      
      })
      setItems(itemsArr)
      return () => unsubsribe()
    })
  }, [])

  function getTotal()
  {
    let total : number = 0
    items.forEach(item  => {
      total += item.price
    })

    return total

  }

  const addItem = async (e : React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if(newItem.name !== '' && newItem.price >= 0)
    {
        setItems([...items, newItem])
        await addDoc(collection(db, 'items'), {
          name: newItem.name.trim(),
          price: newItem.price
        }
      )
      setNewItem({name : '' ,price : 0, id: ''})
    }
  }

  const removeItem = async (id: string) => {
    await deleteDoc(doc(db, 'items', id))

  }

  return (
    <main className="flex flex-col items-center justify-between sm:p-24 p-4">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm ">
        <h1 className="text-4xl p-4 text-center">
          Expense Tracker
        </h1>

        <div className="bg-slate-700 p-4 rounded-lg">
          <form className="grid grid-cols-6 items-center text-black">
            <input 
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name : e.target.value})}
              className="col-span-3 p-3 border"
              type="text"
              placeholder="Enter item"/>
            <input
              value={newItem.price} 
              onChange={(e) => setNewItem({...newItem, price : parseFloat(e.target.value)})}
              className="col-span-2 p-3 border mx-3" 
              type='number'
              inputMode="decimal"
              step="0.01"
              placeholder="Enter $"/>

            <button 
              onClick={addItem}
              className="p-3 text-white border bg-slate-950 hover:bg-slate-800 text-xl" 
              type="submit">
              +
            </button>


          </form>
          <ul>
            {items.map((item, id) => (
              <li key={id} className='my-4 w-full flex justify-between bg-slate-950'>
                <div className='p-4 w-full flex justify-between'>
                  <span className='capitalize'>{item.name}</span>
                  <span>${item.price}</span>
                </div>
                <button
                onClick={() => removeItem(item.id)}
                 className='ml-8 p-4 border-l-2 w-16 border-slate-900 hover:bg-slate-800 text-xl'
                 >
                  X
                </button>
              </li>
            ))}
          </ul>
          {items.length < 1 ? ('') : (
            <div className='flex justify-between p-3'>
              <span>Total</span>
              <span>${getTotal()}</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
