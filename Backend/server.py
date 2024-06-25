from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_community.document_loaders import YoutubeLoader
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain.chains import create_retrieval_chain
import openai
import os
from pymongo import MongoClient
import json
from bson.objectid import ObjectId

app = Flask(__name__)
CORS(app)

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
openai.api_key = OPENAI_API_KEY

mongoDBConnectionString = os.getenv('MONGODB_CONNECTION_STRING')
client = MongoClient(mongoDBConnectionString)
db = client['intelliLearn']



@app.route('/storeTopicImage', methods=['POST'])
def storeTopicImage():
    data = request.get_json()
    if not data or 'topicImageData' not in data or 'associatedID' not in data:
        return jsonify({"error": "Missing topic image data or associated ID"}), 400

    topic_image_data = data['topicImageData']
    associated_id = data['associatedID']

    try:
        collection = db['intelliNotes']
        result = collection.update_one(
            {'_id': ObjectId(associated_id)},
            {'$set': {'topic_image': topic_image_data}}
        )

        if result.matched_count > 0:
            return jsonify({"message": "Topic image data stored successfully"}), 201
        else:
            return jsonify({"error": "No document found with the given ID"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/storeSubtopicImages', methods=['POST'])
def storeSubtopicImages():
    data = request.get_json()
    if not data or 'subtopicImagesData' not in data or 'associatedID' not in data:
        return jsonify({"error": "Missing subtopic images data or associated ID"}), 400

    subtopic_images_data = data['subtopicImagesData']
    associated_id = data['associatedID']

    try:
        collection = db['intelliNotes']

        document = collection.find_one({'_id': ObjectId(associated_id)})
        if not document:
            return jsonify({"error": "No document found with the given ID"}), 404
        
        current_subtopic_images = document.get('subtopic_images', [])

        updated_subtopic_images = current_subtopic_images + [subtopic_images_data]

        result = collection.update_one(
            {'_id': ObjectId(associated_id)},
            {'$set': {'subtopic_images': updated_subtopic_images}}
        )

        if result.matched_count > 0:
            return jsonify({"message": "Subtopic images data stored successfully"}), 201
        else:
            return jsonify({"error": "No document found with the given ID"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/getIntelliNotes', methods=['GET'])
def getIntelliNotes():
    collection = db['intelliNotes']
    entries = collection.find({})
    entries = list(collection.find({}))
    # The _id have to be converted to string in order to be able to jsonify
    for entry in entries:
        entry['_id'] = str(entry['_id'])
    return jsonify(entries)

def addNewEntryToDB(newJSONEntry):
    collection = db['intelliNotes']
    newly_stored_entry = collection.insert_one(newJSONEntry)
    return newly_stored_entry.inserted_id

@app.route('/generateIntelliNotes', methods=['POST'])
def generateIntelliNotes():
    data = request.json
    prompt = data.get('prompt', '')

    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400
    
    prompt_to_ai = """\
    You specialize in writing wiki-like learning materials. You are designed to output JSON.
    When you are given a topic, generate the wiki-like learning materials.
    First, generate the topic of the learning materials and the associated description of the topic.
    Second, generate the subtopics and each of the content within the subtopics.
    For now, only generate two subtopics first.
    In addition, I want to have some accompanying images, thus, generate the Google search prompt for the desired images for both the topic and the subtopics,
    remember to be specific in the prompts and target getting high quality, clear (best to be 4k) and accurate image that can reflect what is on the learning material.
    Lastly, strictly based on the content of the learning materials that you generated, also generate a multiple choice question with 4 options and the correct answer.
    Return the JSON in this format:
    {
    "topic": "xxx",
    "description": "xxx",
    "topic_image_search_prompt": "xxx",
    "subtopics": [
        {
        "title": "xxx",
        "content": "xxx"
        },
        {
        "title": "xxx",
        "content": "xxx"
        }
    ],
    "subtopic_image_search_prompts": ["xxx", "xxx"],
    "multiple_choice_question": "xxx",
    "multiple_choice_options": ["xxx", "xxx"],
    "multiple_choice_correct_answer": "index from the multiple_choice_options array"
    }
    Each element in the subtopic_image_search_prompts array respectively corresponds to the subtopic in the subtopics array.
    But remember, if you are given an academic question, you must include the solutions in the learning material too."""

    try:
        client = openai.OpenAI()

        response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        response_format={ "type": "json_object" },
        messages=[
            {
                "role": "system",
                "content": prompt_to_ai
            },
            {"role": "user", "content": prompt}
        ]
        )

        generated_text = response.choices[0].message.content
        print(generated_text)
        generated_text = json.loads(generated_text)

        newEntry = {
            "topic": generated_text["topic"],
            "description": generated_text["description"],
            "topic_image_search_prompt": generated_text["topic_image_search_prompt"],
            "subtopics": generated_text["subtopics"],
            "subtopic_image_search_prompts": generated_text["subtopic_image_search_prompts"],
            "multiple_choice_question": generated_text["multiple_choice_question"],
            "multiple_choice_options": generated_text["multiple_choice_options"],
            "multiple_choice_correct_answer": generated_text["multiple_choice_correct_answer"]
        }

        # Store JSON output from gpt to mongodb database
        new_entry_id = addNewEntryToDB(newEntry)
        new_entry_id = str(new_entry_id)

        result = {
            "generated_text": generated_text,
            "new_entry_id": new_entry_id
        }

        return jsonify(result), 200
    
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500
    
@app.route('/generateIntelliNotesFromYouTube', methods=['POST'])
def generateIntelliNotesFromYouTube():
    data = request.json
    inputURL = data.get('inputURL', '')

    loader = YoutubeLoader.from_youtube_url(inputURL, add_video_info=False)
    docs = loader.load()
    
    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    text_splitter = RecursiveCharacterTextSplitter()
    documents = text_splitter.split_documents(docs)
    vector = FAISS.from_documents(documents, embeddings)

    llm = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model_name='gpt-3.5-turbo')

    prompt = ChatPromptTemplate.from_template("""Answer the following question based only on the provided context:
    <context>
    {context}
    </context>
    Question: {input}""")

    document_chain = create_stuff_documents_chain(llm, prompt)
    retriever = vector.as_retriever()
    retrieval_chain = create_retrieval_chain(retriever, document_chain)

    response = retrieval_chain.invoke({"input": "What is the video about, tell me about it in high details"})
    print(response["answer"])

    return jsonify({'summary': response["answer"]})

if __name__ == '__main__':
    app.run(port=5001, debug=True)