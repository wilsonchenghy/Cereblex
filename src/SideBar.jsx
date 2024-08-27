import React from 'react'
import './css/SideBar.css';
import { Library28Regular } from '@fluentui/react-icons';

const SideBar = ({ isSidebarOpen, sidebarTitles, openClickedIntelliNotes, toggleSidebar }) => {
  return (
    <div className={`sidebarContainer ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar">
            <div className="sidebarTopic">
                {sidebarTitles.map((sidebarTitle, index) => (
                <button className='sidebarButton' key={index} onClick={() => openClickedIntelliNotes(index)}>{sidebarTitle}</button>
                ))}
            </div>
        </div>

        <button onClick={toggleSidebar} className="sidebarToggleButton">
            <Library28Regular/>
        </button>
    </div>
  );
}

export default SideBar;