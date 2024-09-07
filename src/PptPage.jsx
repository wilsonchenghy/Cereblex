import React, { useEffect, useState } from "react";
import PptxGenJS from "pptxgenjs";
import { Rnd } from "react-rnd";
import "./css/PptPage.css";

const PptPage = () => {

    const [currentSlide, setCurrentSlide] = useState(1);
    const [slides, setSlides] = useState([{ title: "Click to add title", subtitle: "Click to add subtitle"}]);

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

            // editor canvas size is approximately 1074x604
            let exportTitlePosition = { x: (titlePosition.x/1074)*100+'%', y: (titlePosition.y/604)*100+'%' };
            let exportSubtitlePosition = { x: (subtitlePosition.x/1074)*100+'%', y: (subtitlePosition.y/604)*100+'%' };

            // !!!!!!!!!!!! Made a mistake here, the calculated coordinate will actually be that of the input box's upper left corner, instead of that of the text inside
        
            pptSlide.addText(slide.title, { x: exportTitlePosition.x, y: exportTitlePosition.y, fontSize: 27, color: "000000" });
            pptSlide.addText(slide.subtitle, { x: exportSubtitlePosition.x, y: exportSubtitlePosition.y, fontSize: 18, color: "555555" });
        });
        

        pptx.writeFile({ fileName: "presentation.pptx" })
            .then(() => console.log("Exported successfully"))
            .catch(err => console.error("Error exporting:", err));

        console.log("Exported successfully");
    };

    const [titlePosition, setTitlePosition] = useState({x: 537-680/2, y: 302-100/2 - 50}); // mid-point of slide in the editor canvas is approximately 537, 302
    const [titleSize, setTitleSize] = useState({width: 680, height: 100});
    const [subtitlePosition, setSubtitlePosition] = useState({x: 537-680/2, y: 302-60/2 + 33})
    const [subtitleSize, setSubtitleSize] = useState({width: 680, height: 60});

    const renderPreview = (slide) => (

        <div className="slide-preview">
            <Rnd
                className="draggableBlock"
                position={{x: titlePosition.x / 5, y: titlePosition.y / 5}}
                size={{width: titleSize.width / 4,  height: titleSize.height / 4}}
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
                position={{x: subtitlePosition.x / 5, y: subtitlePosition.y / 5}}
                size={{width: subtitleSize.width / 4, height: subtitleSize.height / 4}}
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
                        default={{
                            x: titlePosition.x,
                            y: titlePosition.y,
                            width: 680,
                            height: 100,
                        }}
                        minWidth={50}
                        minHeight={50}
                        bounds="parent"
                        enableUserSelectHack={false}
                        onDragStop={(e, d) => {setTitlePosition({x: d.x, y:d.y})}}
                        onResizeStop={(e, direction, ref, delta, position) => {
                            setTitleSize({width: parseFloat(ref.style.width), height: parseFloat(ref.style.height)});
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
                        default={{
                            x: subtitlePosition.x,
                            y: subtitlePosition.y,
                            width: 680,
                            height: 60,
                        }}
                        minWidth={50}
                        minHeight={50}
                        bounds="parent"
                        enableUserSelectHack={false}
                        onDragStop={(e, d) => {setSubtitlePosition({x: d.x, y:d.y})}}
                        onResizeStop={(e, direction, ref, delta, position) => {
                            setSubtitleSize({width: parseFloat(ref.style.width), height: parseFloat(ref.style.height)});
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