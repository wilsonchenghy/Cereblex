import React, { useEffect, useState } from "react";
import PptxGenJS from "pptxgenjs";
import { Rnd } from "react-rnd";
import "./css/PptPage.css";

const PptPage = () => {

    const [currentSlide, setCurrentSlide] = useState(1);
    const [slides, setSlides] = useState([{ title: "Click to add title", subtitle: "Click to add subtitle" }]);

    const handleTitleChange = (e) => {
        const updatedSlides = [...slides];
        updatedSlides[currentSlide - 1].title = e.target.value;
        setSlides(updatedSlides);
    };
    
    const handleSubtitleChange = (e) => {
        const updatedSlides = [...slides];
        updatedSlides[currentSlide - 1].subtitle = e.target.value;
        setSlides(updatedSlides);
    };

    const addSlide = () => {
        setSlides([...slides, { title: "Click to add title", subtitle: "Click to add subtitle" }]);
    };

    const removeSlide = () => {
        if (slides.length > 1) {
            setSlides(slides.filter((_, index) => index !== currentSlide - 1));
            setCurrentSlide(Math.max(currentSlide - 1, 1));
        }
    };

    const prevSlide = () => {
        if (currentSlide > 1) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const nextSlide = () => {
        if (currentSlide < slides.length) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const exportPpt = () => {
        const pptx = new PptxGenJS();

        slides.forEach(slide => {
            let pptSlide = pptx.addSlide();
            pptSlide.addText(slide.title, { x: 3.5, y: 2.5, fontSize: 27, color: "000000" });
            pptSlide.addText(slide.subtitle, { x: 3.8, y: 3.5, fontSize: 18, color: "555555" });
        });

        pptx.writeFile({ fileName: "presentation.pptx" })
            .then(() => console.log("Exported successfully"))
            .catch(err => console.error("Error exporting:", err));

        console.log("Exported successfully");
    };

    const renderPreview = (slide) => (
        <div className="thumbnail-preview">
            <h4 className="thumbnail-title">{slide.title}</h4>
            <p className="thumbnail-subtitle">{slide.subtitle}</p>
        </div>

        
    );

    return (
    <div className="pptpage-container">
        <div className="control-panel">
            <button className="control-panel-button" onClick={addSlide}>Add Slide</button>
            <button className="control-panel-button" onClick={removeSlide}>Remove Slide</button>
            <button className="control-panel-button" onClick={prevSlide}>Previous</button>
            <button className="control-panel-button" onClick={nextSlide}>Next</button>

            <button className="control-panel-button export-button" onClick={exportPpt}>Export</button>
        </div>
        <div className="ppt-container">
            <div className="slide-thumbnails-column">
                {slides.map((slide, index) => (
                    <div className="slide-thumbnail" key={index}>
                        <div className="slide-thumbnail-number">
                            {index + 1}
                        </div>
                        <div
                            className={`slide-preview ${currentSlide === index + 1 ? "active" : ""}`}
                            onClick={() => setCurrentSlide(index + 1)}
                        >
                            {renderPreview(slide)}
                        </div>
                    </div>
                ))}
            </div>
            <div className="slide-editor">
                <div className="slide">
                    <Rnd
                        className="draggableBlock"
                        default={{
                            x: 530-680/2,
                            y: 298.5-100/2 - 50,
                            width: 680,
                            height: 100,
                        }}
                        minWidth={50}
                        minHeight={50}
                        bounds="parent"
                        enableUserSelectHack={false}
                    >
                        <input
                            className="title-box"
                            type="text"
                            value={slides[currentSlide - 1].title}
                            onChange={handleTitleChange}
                        />
                    </Rnd>

                    <Rnd
                        className="draggableBlock"
                        default={{
                            x: 530-680/2,
                            y: 298.5-60/2 + 33,
                            width: 680,
                            height: 60,
                        }}
                        minWidth={50}
                        minHeight={50}
                        bounds="parent"
                        enableUserSelectHack={false}
                    >
                        <input
                            className="subtitle-box"
                            type="text"
                            value={slides[currentSlide - 1].subtitle}
                            onChange={handleSubtitleChange}
                        />
                    </Rnd> 
                </div>
            </div>
        </div>
    </div>
    );
};

export default PptPage;