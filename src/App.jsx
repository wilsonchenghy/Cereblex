import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './MainPage';
import PptPage from './PptPage';
import FlashcardPage from './FlashcardPage';
import 'katex/dist/katex.min.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path='/PptPage' element={<PptPage />} />
        <Route path='/FlashcardPage' element={<FlashcardPage />} />
      </Routes>
    </Router>
  );
}

export default App;