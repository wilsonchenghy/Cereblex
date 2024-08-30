import React from 'react';
import { useNavigate } from 'react-router-dom';
import './css/UserTab.css';
import { Person28Filled, SlideMultiple24Regular, Stack24Regular, CheckmarkCircle24Regular, PeopleCommunity24Regular, DataLine24Regular } from '@fluentui/react-icons';

const UserTab = ({ isSidebarOpen }) => {

  const navigate = useNavigate();
  const navigateToPptPage = () => {
    navigate('/PptPage');
  };

  return (
    <div className={`UserTabContainer ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <button className="userTabButton"> <Person28Filled/> </button>
        <button className="userTabButton" onClick={navigateToPptPage}> <SlideMultiple24Regular/> </button>
        <button className="userTabButton"> <CheckmarkCircle24Regular/> </button>
        <button className="userTabButton"> <Stack24Regular/> </button>
        <button className="userTabButton"> <DataLine24Regular/> </button>
        <button className="userTabButton"> <PeopleCommunity24Regular/> </button>
    </div>
  );
}

export default UserTab;