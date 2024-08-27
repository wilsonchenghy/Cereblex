import React from 'react';
import './css/UserTab.css';
import { Person28Filled, Stack24Regular, CheckmarkCircle24Regular, PeopleCommunity24Regular, DataLine24Regular } from '@fluentui/react-icons';

const UserTab = ({ isSidebarOpen }) => {
  return (
    <div className={`UserTabContainer ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <button className="userTabButton"> <Person28Filled/> </button>
        <button className="userTabButton"> <Stack24Regular/> </button>
        <button className="userTabButton"> <CheckmarkCircle24Regular/> </button>
        <button className="userTabButton"> <DataLine24Regular/> </button>
        <button className="userTabButton"> <PeopleCommunity24Regular/> </button>
    </div>
  );
}

export default UserTab;