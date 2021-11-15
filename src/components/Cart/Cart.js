import React, { useContext, useState } from 'react';
import styles from './Cart.module.css';
import Modal from '../UI/Modals/Modal';
import CartItem from './CartItem';
import CartContext from '../../store/cart-context';
import Checkout from './Checkout';
import Receipt from './Receipt';

const Cart = (props) => {
  const [checkoutReady, setCheckoutReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [didSubmit, setDidSubmit] = useState(false);
  const [userDetails, setUserDetails] = useState([])
  const [itemDetails, setItemDetails] = useState([])
  const ctx = useContext(CartContext);
  const totalAmount = `$${ctx.totalAmount.toFixed(2)}`;
  const hasItems = ctx.items.length > 0;


  // Remove item from cart
  const cartItemRemoveHandler = (id) => {
    ctx.removeItem(id);
  };

  // Add item to cart
  const cartItemAddHandler = (item) => {
    ctx.addItem({ ...item, amount: 1 });
  };

  // Flag to open the checkout component
  const checkoutHandler = () => {
    setCheckoutReady(true);
  };

  // Submit checkout data
  const sendDataHandler = async (userData) => {
    setUserDetails(userData)
    setIsSubmitting(true);
    await fetch('https://react-http-cee32-default-rtdb.firebaseio.com/orders.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: userData,
        orderedItems: ctx.items,
      }),
    });
    setIsSubmitting(false);
    setDidSubmit(true)
    setItemDetails(ctx.items)
  };

  const finishedCheckout = () => {
    props.onCloseCart()
    ctx.clearCart()
  }


  // Mapped out cart items
  const cartItems = (
    <ul className={styles['cart-items']}>
      {ctx.items.map((item) => (
        <CartItem
          key={item.id}
          name={item.name}
          amount={item.amount}
          price={item.price}
          onRemove={cartItemRemoveHandler.bind(null, item.id)}
          onAdd={cartItemAddHandler.bind(null, item)}
        />
      ))}
    </ul>
  );

  // When you open your cart this modal content appears
  const cartModalContent =  <React.Fragment>
  {cartItems}
  <div className={styles['cart-items']}>
    <div className={styles.total}>
      <span>Total Amount</span>
      <span>{totalAmount}</span>
    </div>
    {!hasItems && <p>The cart is currently empty.</p>}
    <div className={styles.actions}>
      <button className={styles['button--alt']} onClick={props.onCloseCart}>
        Close
      </button>
      {hasItems && (
        <button onClick={checkoutHandler} className={styles.button}>
          Order
        </button>
      )}
      {checkoutReady && (
        <Checkout onSubmit={sendDataHandler} onCancel={props.onCloseCart} />
      )}
    </div>
  </div>
  </React.Fragment>

  const isSubmittingContent = <p>Sending order data...</p>
  const didSubmitContent = <section className={styles['confirm-section']}>
    <Receipt total={totalAmount} items={itemDetails} info={userDetails} />
    <button onClick={finishedCheckout} className={styles['confirm-button']}>Close</button>
    </section>

  const closeCart = () => {
    // If the user clicks out of the cart when they didnt checkout, keep items and close cart
    if(!didSubmit) {
      props.onCloseCart()
    }
    // If user is done and clicks out of cart, close cart and clear items
    if(!isSubmitting && didSubmit) {
      props.onCloseCart()
      ctx.clearCart()
    }
  }

  return (
    <Modal onCloseCart={closeCart}>
      {!isSubmitting && !didSubmit && cartModalContent}
      {isSubmitting && isSubmittingContent}
      {!isSubmitting && didSubmit && didSubmitContent}
    </Modal>
  );
};
export default Cart;
