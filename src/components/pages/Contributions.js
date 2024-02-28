import React from 'react';
import '../../App.css';
import './Contributions.css'; // 
import Footer from '../Footer';

export default function Contributions() {
  const contributors = [
    { name: "Abhishek Shah", designation: "Lead Developer", image: "/images/abhishek_photo.jpg", description: "Abhishek has spearheaded the development process, ensuring high-quality code standards." },
    { name: "Aachal Kumari", designation: "UI/UX Designer", image: "/images/aachal_photo.jpg", description: "Aachal has been instrumental in designing intuitive and user-friendly interfaces for our project." },
    { name: "Chandan Sah", designation: "Front End Dev", image: "/images/chandan_photo.jpg", description: "Chandan has focused on implementing responsive front-end designs with a keen eye for detail." },
    { name: "Aman Poddar", designation: "Back End Dev", image: "/images/aman_photo.jpg", description: "Aman has developed robust back-end systems to support scalable applications." },
  ];

  return (
    <div className='contributions'>
      <h1>CONTRIBUTIONS</h1>
      <div className="contributors-container">
        {contributors.map((contributor, index) => (
          <div className="contributor-card" key={index}>
            <div className="photo-container">
              <img src={contributor.image} alt={contributor.name} />
            </div>
            <h2>{contributor.name}</h2>
            <p className="designation">{contributor.designation}</p>
            <p>{contributor.description}</p>
          </div>
        ))}
      </div>
      {/* Wrap the Project Collaboration section in a "card" like container */}
      <div className="collaboration-card"> 
        <h2>Project Collaboration</h2>
        <p>This project is a joint collaboration of four passionate engineers in order to build an integrated code system to simplify code generation.</p>
      </div>
      <Footer />
    </div>
  );
}