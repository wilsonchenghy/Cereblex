import React, { useState, useEffect, useRef } from 'react';
import './css/App.css';
import axios from 'axios';
import { Edit20Regular, Attach24Filled, Document20Regular, Link20Filled, ClipboardLink24Filled } from '@fluentui/react-icons';
import StartingPage from './StartingPage';
import LoadingScreen from './LoadingScreen';
import UserTab from './UserTab';
import  Sidebar from './Sidebar';

function MainPage() {
  const [prompt, setPrompt] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isStartingPage, setIsStartingPage] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isImportURLMode, setIsImportURLMode] = useState(false);

  const [sidebarTitles, setSidebarTitles] = useState([]);
  const [SidebarTitlesCorrespondingID, setSidebarTitlesCorrespondingID] = useState([]);
  const [currentlyOpenedNotesID, setCurrentlyOpenedNotesID] = useState(''); // store the mongoDB _id of the currently opened notes

  const [topic, setTopic] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [subtopics, setSubtopics] = useState([])

  const [topicImage, setTopicImage] = useState('');
  const [topicImageDescription, setTopicImageDescription] = useState('');
  const [subtopicImages, setSubtopicImages] = useState([]);
  const [subtopicImageDescription, setSubtopicImageDescription] = useState([]);

  const [multipleChoiceQuestion, setMultipleChoiceQuestion] = useState("");
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState([]);
  const [multipleChoiceCorrectAnswer, setMultipleChoiceCorrectAnswer] = useState(0);

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

      setSidebarTitlesCorrespondingID([])
      const newID = intelliNotesJSON.map(note => note._id);
      setSidebarTitlesCorrespondingID(prevID => [...prevID, ...newID]);

      // default will open up the latest intelliNotes first
      const length = intelliNotesJSON.length;
      setCurrentlyOpenedNotesID(intelliNotesJSON[length-1]._id);
    } catch (error) {
      console.log('Error fetching IntelliNotes for the sidebar:', error)
    }
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

        setMultipleChoiceQuestion(notesContent[index].multiple_choice_question);
        setMultipleChoiceOptions(notesContent[index].multiple_choice_options);
        setMultipleChoiceCorrectAnswer(notesContent[index].multiple_choice_correct_answer);

        setTopicImage(notesContent[index].topic_image)
        setTopicImageDescription(notesContent[index].topic_image_search_prompt)

        setSubtopicImages(notesContent[index].subtopic_images)
        setSubtopicImageDescription(notesContent[index].subtopic_image_search_prompts)
      } else {
        // console.log('Note not found');
      }

    } catch (error){
      console.log('Error fetching IntelliNotes Content:', error)
    }
  }

  const fetchtopicImage = async(imagePrompt, associatedID) => {
    const API_KEY = import.meta.env.VITE_GOGGLE_API_KEY;
    const SEARCH_ENGINE_ID = import.meta.env.VITE_GOGGLE_SEARCH_ENGINE_ID;;

    try {
      const response = await axios.get(
        `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&searchType=image&q=${imagePrompt}&num=1`
      );

      const topicImageData = response.data.items[0];

      await axios.post('http://localhost:5001/storeTopicImage', {
        topicImageData,
        associatedID
      });
      console.log('topicImage successfully saved to database');

      setTopicImage(topicImageData);
    } catch (error) {
      console.error("Error fetching the images:", error);
    }
  }

  const fetchsubtopicImage = async(imagePrompt, associatedID) => {
    const API_KEY = import.meta.env.VITE_GOGGLE_API_KEY;
    const SEARCH_ENGINE_ID = import.meta.env.VITE_GOGGLE_SEARCH_ENGINE_ID;;

    try {
      const response = await axios.get(
        `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&searchType=image&q=${imagePrompt}&num=1`
      );

      const subtopicImagesData = response.data.items[0];

      await axios.post('http://localhost:5001/storeSubtopicImages', {
        subtopicImagesData,
        associatedID
      });
      console.log('topicImage successfully saved to database');

      setSubtopicImages((prevImages) => [...prevImages, subtopicImagesData]);
    } catch (error) {
      console.error("Error fetching the images:", error);
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const addNewNotes = () => {
    setIsStartingPage(true);
  };

  const handleChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = (e) => {
    setIsLoading(true);
    e.preventDefault();
    if (isImportURLMode) {
      generateIntelliNotesFromYouTube(prompt)
    } else {
      generateIntelliNotes(prompt);
    }
  };

  const generateIntelliNotes = async () => {
    try {
      const response = await axios.post('http://localhost:5001/generateIntelliNotes', { prompt });


      const generatedText = response.data.generated_text;
      const newEntryId = response.data.new_entry_id;

      setTopic(generatedText.topic);
      setTopicDescription(generatedText.description);
      setSubtopics(generatedText.subtopics);

      setMultipleChoiceQuestion(generatedText.multiple_choice_question);
      setMultipleChoiceOptions(generatedText.multiple_choice_options);
      setMultipleChoiceCorrectAnswer(generatedText.multiple_choice_correct_answer);

      setTopicImageDescription(generatedText.topic_image_search_prompt);
      await fetchtopicImage(generatedText.topic_image_search_prompt, newEntryId);

      setSubtopicImageDescription(generatedText.subtopic_image_search_prompts);
      for (const prompt of generatedText.subtopic_image_search_prompts) {
        await fetchsubtopicImage(prompt, newEntryId);
      }
  
      fetchSidebarTopic();

      setPrompt('');
      setIsLoading(false);
      setIsStartingPage(false);
    } catch (error) {
      console.error("There was an error generating the notes!", error);
      setIsLoading(false);
    }
  }

  const generateIntelliNotesFromYouTube = async (inputURL) => {
    try {
      const response = await axios.post('http://localhost:5001/generateIntelliNotesFromYouTube', { inputURL });
      console.log(response)

      const generatedText = response.data.generated_text;
      const newEntryId = response.data.new_entry_id;

      setTopic(generatedText.topic);
      setTopicDescription(generatedText.description);
      setSubtopics(generatedText.subtopics);

      setMultipleChoiceQuestion(generatedText.multiple_choice_question);
      setMultipleChoiceOptions(generatedText.multiple_choice_options);
      setMultipleChoiceCorrectAnswer(generatedText.multiple_choice_correct_answer);

      setTopicImageDescription(generatedText.topic_image_search_prompt);
      await fetchtopicImage(generatedText.topic_image_search_prompt, newEntryId);

      setSubtopicImageDescription(generatedText.subtopic_image_search_prompts);
      for (const prompt of generatedText.subtopic_image_search_prompts) {
        await fetchsubtopicImage(prompt, newEntryId);
      }
  
      fetchSidebarTopic();

      setPrompt('');
      setIsLoading(false);
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

  // The oldest notes has an index of 0
  const openClickedIntelliNotes = (index) => {
    const id = SidebarTitlesCorrespondingID[index]
    fetchIntelliNotesContent(id)
    setCurrentlyOpenedNotesID(id)
    setIsLoading(false)
    setIsStartingPage(false)
  }

  const multipleChoiceOptionRefs = useRef([React.createRef(), React.createRef(), React.createRef(), React.createRef()]);

  const showMultipleChoiceAnswer = (index) => {
    if (index == multipleChoiceCorrectAnswer) {
      if (multipleChoiceOptionRefs.current[index].current.style.backgroundColor === 'rgba(0, 0, 0, 0.043)') { // Due to here, specifically need me put in "style={{backgroundColor: "rgba(0, 0, 0, 0.043)"}}"" in order for this line to work
        multipleChoiceOptionRefs.current[index].current.style.backgroundColor = '#33ed33';
      } else {
        multipleChoiceOptionRefs.current[index].current.style.backgroundColor = '#0000000b'
      }
      // console.log("You are correct")
    } else {
      if (multipleChoiceOptionRefs.current[index].current.style.backgroundColor === 'rgba(0, 0, 0, 0.043)') { // Due to here, specifically need me put in "style={{backgroundColor: "rgba(0, 0, 0, 0.043)"}}"" in order for this line to work
        multipleChoiceOptionRefs.current[index].current.style.backgroundColor = '#f24a4a';
      } else {
        multipleChoiceOptionRefs.current[index].current.style.backgroundColor = '#0000000b'
      }
      // console.log("You are incorrect")
    }
  }
  

  return (
    <div className="container">

      <div className='mainPageContainer'>

        <Sidebar isSidebarOpen={isSidebarOpen} sidebarTitles={sidebarTitles} openClickedIntelliNotes={openClickedIntelliNotes} toggleSidebar={toggleSidebar} addNewNotes={addNewNotes}/>

        {isLoading ? (
          <LoadingScreen />
        ) : (
          isStartingPage ? (
            <StartingPage prompt={prompt} handleChange={handleChange} handleSubmit={handleSubmit}/>
          ) : (
            <div className='mainPageContentContainer'>
                <div className='IntelliNotesContainer'>
                  <div className='TopicSection'>
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
                      <p className='imageDescription'>{topicImageDescription}</p>
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

                  <div className='multipleChoiceSection'>
                    <div className='multipleChoiceQuestionContainer'>
                      <h2 className='question'>{multipleChoiceQuestion}</h2>
                      <p className='questionDescription'>
                        description
                      </p>
                    </div>
                    <div className='multipleChoiceAnswersContainer'>
                      <button ref={multipleChoiceOptionRefs.current[0]} className='answerOptions' style={{backgroundColor: "rgba(0, 0, 0, 0.043)"}} onClick={() => showMultipleChoiceAnswer(0)}>{multipleChoiceOptions[0]}</button>
                      <button ref={multipleChoiceOptionRefs.current[1]} className='answerOptions' style={{backgroundColor: "rgba(0, 0, 0, 0.043)"}} onClick={() => showMultipleChoiceAnswer(1)}>{multipleChoiceOptions[1]}</button>
                      <button ref={multipleChoiceOptionRefs.current[2]} className='answerOptions' style={{backgroundColor: "rgba(0, 0, 0, 0.043)"}} onClick={() => showMultipleChoiceAnswer(2)}>{multipleChoiceOptions[2]}</button>
                      <button ref={multipleChoiceOptionRefs.current[3]} className='answerOptions' style={{backgroundColor: "rgba(0, 0, 0, 0.043)"}} onClick={() => showMultipleChoiceAnswer(3)}>{multipleChoiceOptions[3]}</button>
                    </div>
                  </div>

                  {/* <div className='longQuestionSection'>
                    <div className='longQuestionContainer'>
                      <h2 className='question'>Long Question</h2>
                      <p className='questionDescription'>
                        description
                      </p>
                    </div>

                    <div className='longQuestionAnswersContainer'>
                      <input className='longQuestionInput'></input>
                      <button className='submitLongAnswerButton'>Submit</button>
                    </div>
                  </div> */}

                </div>




              {isAttachMenuOpen && 
                <div className='attachMenu'>
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
                </div>
              }

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
          )
        )}

        <UserTab isSidebarOpen={isSidebarOpen}/>
      </div>
    </div>
  );
}

export default MainPage;