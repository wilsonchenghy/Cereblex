import React from "react";
import "./css/StartingPage.css";

const StartingPage = ({ prompt, handleChange, handleSubmit }) => {
 return (
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
 );
}

export default StartingPage;