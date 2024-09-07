import React, { useEffect, useState } from "react";
import PptxGenJS from "pptxgenjs";
import { Rnd } from "react-rnd";
import "./css/PptPage.css";

const PptPage = () => {

    const [currentSlide, setCurrentSlide] = useState(1);
    const [slides, setSlides] = useState([{ title: "Click to add title", subtitle: "Click to add subtitle", titlePosition: {x: 537-680/2, y: 302-100/2 - 50}, subtitlePosition: {x: 537-680/2, y: 302-60/2 + 33}, titleSize: {width: 680, height: 100}, subtitleSize: {width: 680, height: 60} }]); // mid-point of slide in the editor canvas is approximately 537, 302

    const updateSlideProperty = (property, value) => {
        const updatedSlides = [...slides];
        updatedSlides[currentSlide - 1][property] = value;
        setSlides(updatedSlides);
    };
    const handleTitleChange = (e) => updateSlideProperty('title', e.target.value);
    const handleSubtitleChange = (e) => updateSlideProperty('subtitle', e.target.value);
    const handleTitlePositionChange = (newPosition) => updateSlideProperty('titlePosition', newPosition);
    const handleSubtitlePositionChange = (newPosition) => updateSlideProperty('subtitlePosition', newPosition);
    const handleTitleSizeChange = (newSize) => updateSlideProperty('titleSize', newSize);
    const handleSubtitleSizeChange = (newSize) => updateSlideProperty('subtitleSize', newSize);
    
    const addSlide = () => {
        setSlides([...slides, { title: "Click to add title", subtitle: "Click to add subtitle", titlePosition: {x: 537-680/2, y: 302-100/2 - 50}, subtitlePosition: {x: 537-680/2, y: 302-60/2 + 33}, titleSize: {width: 680, height: 100}, subtitleSize: {width: 680, height: 60} }]);
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

            // editor canvas size is approximately 1074x604
            let exportTitlePosition = { x: (slide.titlePosition.x/1074)*100+'%', y: (slide.titlePosition.y/604)*100+'%' };
            let exportSubtitlePosition = { x: (slide.subtitlePosition.x/1074)*100+'%', y: (slide.subtitlePosition.y/604)*100+'%' };

            // !!!!!!!!!!!! Made a mistake here, the calculated coordinate will actually be that of the input box's upper left corner, instead of that of the text inside
        
            pptSlide.addText(slide.title, { x: exportTitlePosition.x, y: exportTitlePosition.y, fontSize: 27, color: "000000" });
            pptSlide.addText(slide.subtitle, { x: exportSubtitlePosition.x, y: exportSubtitlePosition.y, fontSize: 18, color: "555555" });
        });
        

        pptx.writeFile({ fileName: "presentation.pptx" })
            .then(() => console.log("Exported successfully"))
            .catch(err => console.error("Error exporting:", err));

        console.log("Exported successfully");
    };

    const renderPreview = (slide) => (

        <div className="slide-preview">
            <Rnd
                className="draggableBlock"
                position={{x: slide.titlePosition.x / 5, y: slide.titlePosition.y / 5}}
                size={{width: slide.titleSize.width / 4,  height: slide.titleSize.height / 4}}
                bounds="parent"
                disableDragging={true}
                enableResizing={false}
            >
                <input
                    className="thumbnail-title-box"
                    type="text"
                    value={slide.title}
                    readOnly
                />
            </Rnd>

            <Rnd
                className="draggableBlock"
                position={{x: slide.subtitlePosition.x / 5, y: slide.subtitlePosition.y / 5}}
                size={{width: slide.subtitleSize.width / 4, height: slide.subtitleSize.height / 4}}
                bounds="parent"
                disableDragging={true}
                enableResizing={false}
            >
                <input
                    className="thumbnail-subtitle-box"
                    type="text"
                    value={slide.subtitle}
                    readOnly
                />
            </Rnd> 
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
                            className={`slide-preview-container ${currentSlide === index + 1 ? "active" : ""}`}
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
                        position={{x: slides[currentSlide - 1].titlePosition.x, y: slides[currentSlide - 1].titlePosition.y}}
                        size={{width: slides[currentSlide - 1].titleSize.width, height: slides[currentSlide - 1].titleSize.height}}
                        minWidth={50}
                        minHeight={50}
                        bounds="parent"
                        enableUserSelectHack={false}
                        onDragStop={(e, d) => {handleTitlePositionChange({x: d.x, y:d.y})}}
                        onResizeStop={(e, direction, ref, delta, position) => {
                            handleTitleSizeChange({width: parseFloat(ref.style.width), height: parseFloat(ref.style.height)});
                        }}
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
                        position={{x: slides[currentSlide - 1].subtitlePosition.x, y: slides[currentSlide - 1].subtitlePosition.y}}
                        size={{width: slides[currentSlide - 1].subtitleSize.width, height: slides[currentSlide - 1].subtitleSize.height}}
                        minWidth={50}
                        minHeight={50}
                        bounds="parent"
                        enableUserSelectHack={false}
                        onDragStop={(e, d) => {handleSubtitlePositionChange({x: d.x, y:d.y})}}
                        onResizeStop={(e, direction, ref, delta, position) => {
                            handleSubtitleSizeChange({width: parseFloat(ref.style.width), height: parseFloat(ref.style.height)});
                        }}
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