/**
 * Import the required libraries
 */
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import ejs from 'ejs'
import multer from 'multer'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
// Create a constant to store the current directory path
const currentFolder = path.dirname(fileURLToPath(import.meta.url))
// Create our app
const app = express()
// Setup multer which is used to handle file uploads
const upload = multer({
    dest: 'images',
    limits: {
    fileSize: 100000000,
    }
    })
/**
 * Define a schema for the question records
 * Each record contains all the data related to a question
 * imgPath: The file path to the image on the server
 * message: a message the user has added to the question
 * question.question: The question the user has asked about the photo
 * hint: the hint added to the question by the user
 * answerA, answerB and answerC: contain each of the answers provided by the user
 * isCorrect: indicates whethet an answer is correct or not
 * answered: is a count of the number of times the user has answered the question
 * answeredCorrectly: a count of the number of times the user has answered the question correctly
 */
const questionSchema = new mongoose.Schema({
        time: Date,
        destUserID: String,
        imgPath: String, 
        message: String,
        question: {
            question: String,
            hint: String,
            answerA:{
                text: String,
                isCorrect: Boolean
            },
            answerB:{
                text: String,
                isCorrect: Boolean
            },
            answerC:{
                text: String,
                isCorrect: Boolean
            },
            answered : Number,
            answeredCorrectly: Number
        },

    })

// Create the defined schema in the database
const Question = mongoose.model('Question', questionSchema)
mongoose.set('useFindAndModify', false);

// Connect to the database called images in the mongo server
await mongoose.connect('mongodb://localhost:27017/image', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
//Tell the app that we want to parse our view files useing EJS
app.set('view engine', 'ejs')

app.use(express.static(currentFolder + '/public'));
//Tell our app where the css and js files required to use bootstrap are located
app.use('/css', express.static(path.join(currentFolder, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(currentFolder, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(currentFolder, 'node_modules/jquery/dist')))
app.use(bodyParser.urlencoded({ extended: true }));
//Tell our app that we will accept http requests that dont have headers
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// When the user requests /upload tell the app to render the upload.ejs template file
app.get('/upload', (req, res) => { 
    res.render('upload.ejs')
})

/**
 * This section allows the application to recieve post requests to the /image url.
 * This is used to allow the web application to transfer image files to the server
 * Images are saved in the /images directory on the server
 */
app.post('/image', upload.single('upload'), async (req, res) => {
    // Create a new question object
    var question = new Question({
        time: (new Date()).toISOString(),
    })
    // Store the location of where the image is stored on the question object in the database
    question.imgPath = req.file.path
    // Set question to an empty string so that we can update it later
    question.question = ""
    // Set answer to an empty string so that we can update it later
    question.answer = ""
    // Set hint to an empty string so that we can update it later
    question.hint = ""
    // Save our new question object in the database
    await question.save()
    //Return the resulting JSON back to the client
    res.json(question)
})

// When the user requests /addQuestions tell the app to render the addQuestions.ejs template file
app.get('/addQuestions', async (req, res) => { 
    res.render('addQuestions.ejs', {imgId : req.query.id})
}) 

/**
 * This method allows the client to send the question data that the user has input in an HTML form to the server
 */
app.post('/submitQuestion', async (req, res) => {
    // Create an empty question object to update
    var query = {
        question: {
            question: String,
            hint: String,
            message: String,
            answerA:{
                text: String,
                isCorrect: Boolean
            },
            answerB:{
                text: String,
                isCorrect: Boolean
            },
            answerC:{
                text: String,
                isCorrect: Boolean
            },
        }
    }
    // Assign all of the data the user has entered in the form to the corresponding field in our question object
    query.question.question = req.body.question
    query.question.answerA.text = req.body.answerA
    query.question.answerA.isCorrect = req.body.answerAIsCorrect == 'on'
    query.question.answerB.text = req.body.answerB
    query.question.answerB.isCorrect = req.body.answerBIsCorrect == 'on'
    query.question.answerC.text = req.body.answerC
    query.question.answerC.isCorrect = req.body.answerCIsCorrect == 'on'
    query.question.hint = req.body.hint
    query.question.answered = 0
    query.question.answeredCorrectly = 0
    query.question.message = ''

    // The filter we need to use to find the object that matches the id of the object we need to update in the database
    const filter = { _id: req.body.questionId };

    // Use the filter to find the object we need to update and add the new values specified in the query object
    Question.findOneAndUpdate(filter, query, {upsert: false}, function(err, doc) {
        if (err) return res.send(500, {error: err});
    });
    // Create a variable to store the results of our database query
    var results = {};
    // Return an object containing all of the questions in the database
    await Question.find({}, function(err, questions) {
        //Populate the results object
        questions.forEach(function(question) {
          results[question._id] = question;
        });
        //Render the dashboard page parsing in all of the questions to populate the table in the HTML        
        res.render('dashboard.ejs', {data: results} );  
      });
})
// Tell our app to render the dashboard.ejs template when the user requests /dashboard
app.get('/dashboard', async (req, res) => { 
    // Create a variable to store the questions
    var results = {};
    //Get all of the question objects in the database
    await Question.find({}, function(err, questions) {
        //Populate the results object
        questions.forEach(function(question) {
          results[question._id] = question;
        });
        //Render the dashboard.ejs template with all of the questions from the database    
        res.render('dashboard.ejs', {data: results} );  
      });
})
// Tell the server to return a list of all the questions when the /questions url is requested
app.get('/questions', async (req, res) => { 
    var results = {};
    await Question.find({}, function(err, questions) {
    
        questions.forEach(function(question) {
          results[question._id] = question;
        });        
        res.send(results);  
      });
})
// This allows the client to request any image from the server using the specified syntax
app.get('/:id/image', async (req, res) => {

    try{
        const result = await Question.findById(req.params.id)
        if (!result || !result.imgPath) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.sendFile(currentFolder + '/' + result.imgPath)
    } 
    catch(e) {
        res.status(404).send()
    }
})
// This allows the client to tell the server that a question was answered correctly
app.get('/answeredQuestion/:id/:answeredCorrectly', async (req, res) => {
    try{
        var result = await Question.findById(req.params.id)
        if (!result) {
            throw new Error()
        }
        var correct = 0
        if(req.params.answeredCorrectly == 'true')
        {
            correct++
        }
        result.question.answered = result.question.answered + 1,        
        result.question.answeredCorrectly = result.question.answeredCorrectly + correct
        console.log(result)
        const filter = { _id: req.params.id };
        Question.findOneAndUpdate(filter, result, {upsert: true}, function(err, doc) {
            if (err) return res.send(500, {error: err});
            //return res.send('Succesfully saved.');
        });

    } 
    catch(e) {
        res.status(404).send()
    }
})
// This allows the client to add messages to questions
app.get('/modifyQuestion/:id/:message', async (req, res) => {
    try{
        var result = await Question.findById(req.params.id)
        if (!result) {
            throw new Error()
        }
  
        result.question.message = message        
        const filter = { _id: req.params.id };
        Question.findOneAndUpdate(filter, result, {upsert: true}, function(err, doc) {
            if (err) return res.send(500, {error: err});
            //return res.send('Succesfully saved.');
        });

    } 
    catch(e) {
        res.status(404).send()
    }
})
app.listen(3000, () => {
  console.log('Listening at http://localhost:3000')
})