import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import axios from 'axios';
import { Library28Regular, Person28Filled, Stack24Regular, Edit20Regular, Attach24Filled, CheckmarkCircle24Regular, PeopleCommunity24Regular, Document20Regular, Link20Filled, ClipboardLink24Filled, DataLine24Regular } from '@fluentui/react-icons';

function App() {
  const [prompt, setPrompt] = useState('');
  const [IntelliNotes, setIntelliNotes] = useState('"Top Gun" is a 1986 American action drama film directed by Tony Scott and produced by Jerry Bruckheimer and Don Simpson. The movie stars Tom Cruise as Maverick, a young naval aviator who attends the Top Gun Naval Fighter Weapons School, where he competes to be the best fighter pilot.');
  const [isLoading, setIsLoading] = useState(false);
  const [isStartingPage, setIsStartingPage] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isImportURLMode, setIsImportURLMode] = useState(false);

  const [sidebarTitles, setSidebarTitles] = useState([]);
  const [currentlyOpenedNotesID, setCurrentlyOpenedNotesID] = useState(''); // store the mongoDB _id of the currently opened notes

  const [topic, setTopic] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [subtopics, setSubtopics] = useState([])

  const [subtopic, setSubtopic] = useState('Subtopic');
  const [subtopicDescription, setSubtopicDescription] = useState('Body text for whatever you’d like to suggest. Add main takeaway points, quotes, anecdotes, or even a very very short story.');

  const [subtopicDescriptions, setSubtopicDescriptions] = useState([])

  const [topicImage, setTopicImage] = useState('')
  const [topicImageDescription, setTopicImageDescription] = useState('')
  const [subtopicImages, setSubtopicImages] = useState([])
  const [subtopicImageDescription, setSubtopicImageDescription] = useState([])

  useEffect(() => {
    fetchSidebarTopic()
  }, [])

  const fetchSidebarTopic = async () => {
    try {
      const response = await axios.get('http://localhost:5001/getIntelliNotes');
      const intelliNotesJSON = response.data
      setSidebarTitles([])
      const newTitles = intelliNotesJSON.map(note => note.topic);
      setSidebarTitles(prevTitles => [...prevTitles, ...newTitles]);

      // default will open up the latest intelliNotes first
      const length = intelliNotesJSON.length;
      setCurrentlyOpenedNotesID(intelliNotesJSON[length-1]._id);
    } catch (error) {
      console.log('Error fetching IntelliNotes for the sidebar:', error)
    }
  }

  const addIntelliNotesToSidebar = (intelliNotesJSON) => {
    setSidebarTitles([])
    const newTitles = intelliNotesJSON.map(note => note.topic);
    setSidebarTitles(prevTitles => [...prevTitles, ...newTitles]);

    // default will open up the latest intelliNotes first
    const length = intelliNotesJSON.length;
    setCurrentlyOpenedNotesID(intelliNotesJSON[length-1]._id);
  }

  useEffect(() => {
    fetchIntelliNotesContent(currentlyOpenedNotesID)
  }, [currentlyOpenedNotesID])

  const fetchIntelliNotesContent = async (currentlyOpenedNotesID) => {
    try {
      const response = await axios.get('http://localhost:5001/getIntelliNotes');
      const notesContent = response.data

      const index = notesContent.findIndex(note => note._id === currentlyOpenedNotesID);
      if (index !== -1) {
        // console.log('Found index:', index);
        setTopic(notesContent[index].topic);
        setTopicDescription(notesContent[index].description);
        setSubtopics(notesContent[index].subtopics);
      } else {
        // console.log('Note not found');
      }

    } catch (error){
      console.log('Error fetching IntelliNotes Content:', error)
    }
  }

  const fetchtopicImage = async(imagePrompt) => {
    const API_KEY = import.meta.env.VITE_GOGGLE_API_KEY;
    const SEARCH_ENGINE_ID = import.meta.env.VITE_GOGGLE_SEARCH_ENGINE_ID;;

    try {
      const response = await axios.get(
        `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&searchType=image&q=${imagePrompt}&num=1`
      );
      setTopicImage(response.data.items[0]);
    } catch (error) {
      console.error("Error fetching the images:", error);
    }
  }

  const fetchsubtopicImage = async(imagePrompt) => {
    const API_KEY = import.meta.env.VITE_GOGGLE_API_KEY;
    const SEARCH_ENGINE_ID = import.meta.env.VITE_GOGGLE_SEARCH_ENGINE_ID;;

    try {
      const response = await axios.get(
        `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&searchType=image&q=${imagePrompt}&num=1`
      );
      setSubtopicImages((prevImages) => [...prevImages, response.data.items[0]]);
      console.log(response.data.items[0]);

      console.log(imagePrompt)
      console.log("here")
    } catch (error) {
      console.error("Error fetching the images:", error);
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = (e) => {
    setIsLoading(true);
    e.preventDefault();
    console.log("Submitted value:", prompt);
    if (isImportURLMode) {
      generateIntelliNotesFromYouTube(prompt)
    } else {
      generateIntelliNotes(prompt);
    }
  };

  const generateIntelliNotes = async () => {
    try {
      const response = await axios.post('http://localhost:5001/generateIntelliNotes', { prompt });

      setTopic(response.data.topic);
      setTopicDescription(response.data.description);
      setSubtopic(response.data.subtopics[0].title);
      setSubtopicDescription(response.data.subtopics[0].content);
      setSubtopics(response.data.subtopics);
      
      setTopicImageDescription(response.data.topic_image_search_prompt)
      fetchtopicImage(response.data.topic_image_search_prompt);
  
      setSubtopicImageDescription(response.data.subtopic_image_search_prompts)
      for (const prompt of response.data.subtopic_image_search_prompts) {
        console.log(prompt);
        await fetchsubtopicImage(prompt);
      }
  
      setIntelliNotes(response.data);
      fetchSidebarTopic();

      setPrompt('');
      setIsLoading(false);
      setIsStartingPage(false);
    } catch (error) {
      console.error("There was an error generating the notes!", error);
      setIsLoading(false);
    }
  }

  const generateIntelliNotesFromYouTube = async () => {
    try {
      const response = await axios.post('http://localhost:5001/generateIntelliNotesFromYouTube', { inputURL });

    } catch (error) {
      console.error("There was an error generating the notes!", error);
      setIsLoading(false)
    }
  }

  const editSection = () => {

  }

  const fileInputRef = useRef(null);

  const attachFile = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    // Process the file here, for example, you can read it using FileReader API
    console.log('Selected file:', file);
  };
  

  return (



    <div className="container">

      {isLoading ? (
        <div className="loading-screen">
          <p>Loading ... ✨💫</p>
        </div>
        
      ) : (

        isStartingPage ? (
          <div className="startingPageContainer">
            <p className="title">Start Generating ... ✨✨</p>
            <form className="form" onSubmit={handleSubmit}>
              <input
                type="text"
                className="input"
                placeholder="Topic"
                value={prompt}
                onChange={handleChange}
              />
              <button type="submit" className="submit-button">Submit</button>
            </form>
          </div>

        ) : (

          <div className='mainPageContainer'>

            <div className={`sidebarContainer ${isSidebarOpen ? 'sidebar-open' : ''}`}>

              <div className="sidebar">
                <div className="sidebarTopic">
                  {sidebarTitles.map((sidebarTitle, index) => (
                    <button className='sidebarButton' key={index}>{sidebarTitle}</button>
                  ))}
                </div>
              </div>

              <button
                onClick={toggleSidebar}
                className="sidebarToggleButton"
              >
                <Library28Regular/>
              </button>
            </div>


            <div className='mainPageContentContainer'>
              {IntelliNotes && (
                <div className='IntelliNotesContainer'>

                  <div className='SectionOne'>
                    <div className='HeadingContainer'>
                      <h1 className='heading'>{topic}</h1>
                      <p className='headingDescription'>
                        {topicDescription}
                      </p>
                      <button className='button'>Explain more</button>
                    </div>

                    <div className='firstImageContainer'>
                      {topicImage.link && typeof topicImage.link === 'string' && topicImage.link.trim() !== '' && (
                        <img
                          src={topicImage.link}
                          alt={topicImage.title}
                          className='image'
                        />
                      )}
                      {/* <img src='./TestImage.jpg' alt='firstImage' className='image' /> */}
                      <p className='imageDescription'>Description of image</p>
                    </div>

                    <div className='editSectionButtonContainer'>
                      <button
                        onClick={editSection}
                        className='editSectionButton'
                      >
                        <Edit20Regular/>
                      </button>
                    </div>
                  </div>

                  {/* COMMENT OUT */}
                  {/* <div className='SectionTwo'>          
                    <div className='secondImageContainer'>
                      <img
                        src="./TestImage2.jpg"
                        alt="secondImage"
                        className='secondImage'
                      />
                      <h2 className='imageTitle'>Image title</h2>
                      <p className='imageDescription'>Description of image</p>
                    </div>

                    <div className='subheadingContainer'>
                      <h2 className='subheading'>{subtopic}</h2>
                      <p className='subheadingDescription'>
                        {subtopicDescription}
                      </p>
                    </div>                    
                  </div>

                  <div className='SectionOne'>
                    <div className='HeadingContainer'>
                      <h2 className='subheading'>{subtopic}</h2>
                      <p className='subheadingDescription'>
                        {subtopicDescription}
                      </p>
                    </div>

                    <div className='firstImageContainer'>
                      <img
                        src="./TestImage3.jpg"
                        alt="Project"
                        className='image'
                      />
                      <h2 className='imageTitle'>Image title</h2>
                      <p className='imageDescription'>Description of image</p>
                    </div>
                  </div>

                  <div className='SectionTwo'>          
                    <div className='secondImageContainer'>
                      <img
                        src="./TestImage2.jpg"
                        alt="secondImage"
                        className='secondImage'
                      />
                      <h2 className='imageTitle'>Image title</h2>
                      <p className='imageDescription'>Description of image</p>
                    </div>

                    <div className='subheadingContainer'>
                      <h2 className='subheading'>{subtopic}</h2>
                      <p className='subheadingDescription'>
                        {subtopicDescription}
                      </p>
                    </div>                    
                  </div> */}
                  {/* COMMENT OUT */}

                  {subtopics.map((subtopic, index) => (
                    index % 2 === 0 ? (
                        <div key={index} className='SectionTwo'>          
                            <div className='secondImageContainer'>
                              {subtopicImages[index] && subtopicImages[index].link && typeof subtopicImages[index].link === 'string' && subtopicImages[index].link.trim() !== '' && (
                                <img
                                    src={subtopicImages[index].link}
                                    alt={subtopicImages[index].title}
                                    className='secondImage'
                                />
                              )}
                              <p className='imageDescription'>{subtopicImageDescription[index]}</p>
                            </div>

                            <div className='subheadingContainer'>
                                <h2 className='subheading'>{subtopic.title}</h2>
                                <p className='subheadingDescription'>
                                    {subtopic.content}
                                </p>
                            </div>                    
                        </div>
                    ) : (
                        <div key={index} className='SectionOne'>
                          <div className='HeadingContainer'>
                            <h2 className='subheading'>{subtopic.title}</h2>
                            <p className='subheadingDescription'>
                              {subtopic.content}
                            </p>
                          </div>

                          <div className='firstImageContainer'>
                            {subtopicImages[index] && subtopicImages[index].link && typeof subtopicImages[index].link === 'string' && subtopicImages[index].link.trim() !== '' && (
                              <img
                                src={subtopicImages[index].link}
                                alt={subtopicImages[index].title}
                                className='secondImage'
                              />                        
                            )}
                            <p className='imageDescription'>{subtopicImageDescription[index]}</p>
                          </div>
                        </div>
                    )
                  ))}

                </div>
              )}





              {isAttachMenuOpen && <div className='attachMenu'>
                <div className='attachFileButtonContainer'>
                  <input
                      type="file"
                      style={{ display: 'none' }}
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  <button type='submit' className='attachFileButton' style={{display: 'flex', alignItems: 'center'}} onClick={attachFile}>
                    <Document20Regular style={{paddingRight: '5px'}}/>
                    Attach File
                  </button>
                </div>

                <div className='attachLinkButtonContainer'>
                  <button 
                    type='submit' 
                    className='attachLinkButton' 
                    style={{display: 'flex', alignItems: 'center'}}
                    onClick={() => {
                      setIsImportURLMode(true)
                      setIsAttachMenuOpen(false)
                    }}
                  >
                    <Link20Filled style={{paddingRight: '5px'}}/>
                    Import URL
                  </button>
                </div>
              </div>}

              <div className='mainPageForm'>
                <div>                  
                  <button
                    onClick={() => {
                      if (isImportURLMode) {
                        setIsImportURLMode(false)
                      } else {
                        setIsAttachMenuOpen(!isAttachMenuOpen)
                      }
                    }}
                    className="attachButton"
                  >
                    {isImportURLMode ? <ClipboardLink24Filled/> : <Attach24Filled />}
                  </button>
                </div>
                <form className="mainPageSubFormContainer" onSubmit={handleSubmit}>
                  <input
                    type="text"
                    className="mainPageInput"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Topic"
                  />
                  <button type="submit" className="mainPageSubmit-button">Submit</button>
                </form>
              </div>
            </div>
            




            <div className={`UserTabContainer ${isSidebarOpen ? 'sidebar-open' : ''}`}>
              <button
                className="userTabButton"
              >
                <Person28Filled/>
              </button>

              <button
                className="userTabButton"
              >
                <Stack24Regular/>
              </button>

              <button
                className="userTabButton"
              >
                <CheckmarkCircle24Regular/>
              </button>

              <button
                className="userTabButton"
              >
                <DataLine24Regular/>
              </button>

              <button
                className="userTabButton"
              >
                <PeopleCommunity24Regular/>
              </button>
            </div>

          </div>
        )
      )}

    </div>
  );
}

export default App;