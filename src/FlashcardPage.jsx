import React from "react";
import { FlashcardArray } from "react-quizlet-flashcard";
import { useNavigate } from 'react-router-dom';
import { ArrowExport20Filled } from '@fluentui/react-icons';

const FlashcardPage = () => {
    const navigate = useNavigate();

    const cards = [
        {
          id: 1,
          frontHTML: <div>What is the capital of <u>Alaska</u>?</div>,
          backHTML: <>Juneau</>,
        },
        {
          id: 2,
          frontHTML: <>What is the capital of California?</>,
          backHTML: <>Sacramento</>,
        },
        {
          id: 3,
          frontHTML: <>What is the capital of New York?</>,
          backHTML: <>Albany</>,
        },
        {
          id: 4,
          frontHTML: <>What is the capital of Florida?</>,
          backHTML: <>Tallahassee</>,
        },
        {
          id: 5,
          frontHTML: <>What is the capital of Texas?</>,
          backHTML: <>Austin</>,
        },
        {
          id: 6,
          frontHTML: <>What is the capital of New Mexico?</>,
          backHTML: <>Santa Fe</>,
        },
        {
          id: 7,
          frontHTML: <>What is the capital of Arizona?</>,
          backHTML: <>Phoenix</>,
        },
      ];
      return (
        <div>
            <button onClick={() => navigate('/')} className="control-panel-return-button">
                <ArrowExport20Filled/>
            </button>
          <FlashcardArray cards={cards} frontContentStyle={{ display: "flex", justifyContent: "center", alignItems: "center", fontSize: "24px", fontFamily: "Arial, sans-serif" }} backContentStyle={{ display: "flex", justifyContent: "center", alignItems: "center", fontSize: "24px", fontFamily: "Arial, sans-serif" }}/>
        </div>
      );
};

export default FlashcardPage;