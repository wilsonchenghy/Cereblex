import React from 'react'
import './css/Sidebar.css';
import { Library28Regular, AddSquare24Regular, MoreVertical20Regular } from '@fluentui/react-icons';

const Sidebar = ({ isSidebarOpen, sidebarTitles, openClickedIntelliNotes, toggleSidebar, addNewNotes, openSidebarItemsOptions }) => {
  return (
    <div className={`sidebarContainer ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar">
          <button onClick={addNewNotes} className="sidebarAddNewNotesButton">
            <AddSquare24Regular/>
          </button>

          <div className="sidebarTopic">
            {sidebarTitles.map((sidebarTitle, index) => (
              <div className='sidebarItem' key={index}>
                <button className='sidebarButton' onClick={() => openClickedIntelliNotes(index)}>{sidebarTitle}</button>
                <button className="sidebarOptionButton" onClick={() => openSidebarItemsOptions(index)}>
                  <MoreVertical20Regular/>
                </button>
              </div>
            ))}
          </div>
        </div>

        <button onClick={toggleSidebar} className="sidebarToggleButton">
          <Library28Regular/>
        </button>
    </div>
  );
}

export default Sidebar;