import React from 'react'
import './css/SideBar.css';
import { Library28Regular, AddSquare24Regular } from '@fluentui/react-icons';

const SideBar = ({ isSidebarOpen, sidebarTitles, openClickedIntelliNotes, toggleSidebar, addNewNotes }) => {
  return (
    <div className={`sidebarContainer ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar">
          <button onClick={addNewNotes} className="sidebarAddNewNotesButton">
            <AddSquare24Regular/>
          </button>

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