import React from 'react';
import '../../App.css';
import './signup.css'; // Importing the CSS file for styling

export default function SignUp() {
  return (
    <div className="sign-up-form">
      <h1 className='sign-up'>Sign Up</h1>
      <form>
        <input type="text" placeholder="Name" className="form-input" />
        <input type="email" placeholder="Email" className="form-input" />
        <input type="password" placeholder="Password" className="form-input" />
        <button type="submit" className="submit-btn">Sign Up</button>
      </form>
    </div>
  );
}
