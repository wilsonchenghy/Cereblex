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

app = Flask(__name__)
CORS(app)

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
openai.api_key = OPENAI_API_KEY

mongoDBConnectionString = os.getenv('MONGODB_CONNECTION_STRING')
client = MongoClient(mongoDBConnectionString)
db = client['intelliLearn']

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
    collection.insert_one(newJSONEntry)
    return jsonify(message='Data stored successfully')

@app.route('/generateIntelliNotes', methods=['POST'])
def generateIntelliNotes():
    data = request.json
    prompt = data.get('prompt', '')

    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    try:
        client = openai.OpenAI()

        response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        response_format={ "type": "json_object" },
        messages=[
            {
                "role": "system",
                "content": "You specialize in writing wiki-like learning materials. You are designed to output JSON. When you are given a topic, generate the wiki-like learning materials. First, generate the topic of the learning materials and the associated description of the topic. Second, generate the subtopics and each of the content within the subtopics. For now, only generate two subtopics first. In addition, I want to have some accompanying images, thus, generate the Google search prompt for the desired images for both the topic and the subtopics, remember to be specific in the prompts and target getting high quality, clear (best to be 4k) and accurate image that can reflecte what is on the learning material. Return the JSON in this format: {\"topic\": \"xxx\", \"description\": \"xxx\", \"topic_image_search_prompt\": \"xxx\", \"subtopics\": [{\"title\": \"xxx\", \"content\": \"xxx\"}, {\"title\": \"xxx\", \"content\": \"xxx\"}], \"subtopic_image_search_prompts\": [\"xxx\"]} Each element in the subtopic_image_search_prompts array respectively corresponds to the subtopic in the subtopics array. But rmb, if you are given an academic question, you must include the solutions in the learning material too"
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
            "subtopic_image_search_prompts": generated_text["subtopic_image_search_prompts"]
        }

        # Store JSON output from gpt to mongodb database
        addNewEntryToDB(newEntry)

        return generated_text
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