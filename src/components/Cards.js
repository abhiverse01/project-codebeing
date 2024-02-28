import React from 'react';
import './Cards.css';
import CardItem from './CardItem';

function Cards() {
  return (
    <div className='cards'>
      <h1>Check out these valuable and amazing Blogs!</h1>
      <div className='cards__container'>
        <div className='cards__wrapper'>
          <ul className='cards__items'>
            <CardItem
              src='images/colab.png'
              text='Explore the amazing features of Colab Notebook.'
              label='Info/Tutorial'
              path='/services'
            />
            <CardItem
              src='images/softwaredeveloper.png'
              text='What is the best way to learn to code for a developer?'
              label='Info/Tips'
              path='/services'
            />
          </ul>
          <ul className='cards__items'>
            <CardItem
              src='images/facebookmeta.png'
              text='The analysis of Facebook and Meta coding methods.'
              label='Analysis/Research'
              path='/services'
            />
            <CardItem
              src='images/llms.jpeg'
              text='The next big thing: LLMs'
              label='Research'
              path='/products'
            />
            <CardItem
              src='images/impostersyndrome.png'
              text='Suffering from Imposter Syndrome: Here is what a dev should know!'
              label='Tips/Advice'
              path='/sign-up'
            />
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Cards;
